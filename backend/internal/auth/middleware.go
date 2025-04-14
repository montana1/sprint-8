package auth

import (
	"context"
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	"os"
	"slices"
	"strings"
	"time"

	"github.com/golang-jwt/jwt/v5"
	"github.com/lestrrat-go/jwx/v2/jwk"
)

type Claims struct {
	jwt.RegisteredClaims
	RealmAccess struct {
		Roles []string `json:"roles"`
	} `json:"realm_access"`
}

// Глобальные переменные для работы с JWK
var (
	keycloakURL = getEnv("KEYCLOAK_URL", "http://keycloak:8080")
	realm       = getEnv("KEYCLOAK_REALM", "reports-realm")
	jwksURL     = fmt.Sprintf("%s/realms/%s/protocol/openid-connect/certs", keycloakURL, realm)
	jwkCache    *jwk.Cache
)

// Получение переменной окружения с дефолтным значением
func getEnv(key, defaultValue string) string {
	value := os.Getenv(key)
	if value == "" {
		return defaultValue
	}
	return value
}

func init() {
	jwkCache = jwk.NewCache(context.Background())
	err := jwkCache.Register(jwksURL, jwk.WithMinRefreshInterval(15*time.Minute))
	if err != nil {
		log.Fatalf("Failed to register JWKS URL: %s", err)
	}

	set, err := jwkCache.Refresh(context.Background(), jwksURL)
	if err != nil {
		log.Fatalf("Warning: failed to perform initial JWKS refresh: %s", err)
	}

	log.Println("JWK Cache initialized for:", jwksURL)
	log.Println("JWK Cache keys:", set.Keys(context.Background()))
}

func AuthMiddleware(next http.HandlerFunc) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		authHeader := r.Header.Get("Authorization")
		if authHeader == "" {
			sendError(w, "Authorization header required", http.StatusUnauthorized)
			return
		}

		parts := strings.Split(authHeader, " ")
		if len(parts) != 2 || parts[0] != "Bearer" {
			sendError(w, "Invalid authorization format", http.StatusUnauthorized)
			return
		}

		tokenString := parts[1]

		token, _ := jwt.Parse(tokenString, func(token *jwt.Token) (interface{}, error) {
			return nil, nil
		})

		kid, ok := token.Header["kid"].(string)
		if !ok {
			sendError(w, "Missing key ID in token", http.StatusUnauthorized)
			return
		}

		keyset, err := jwkCache.Get(context.Background(), jwksURL)
		if err != nil {
			log.Printf("Failed to get JWK set: %v", err)
			sendError(w, "Failed to get key set", http.StatusInternalServerError)
			return
		}
		key, found := keyset.LookupKeyID(kid)
		if !found {
			log.Printf("Key with ID %s not found", kid)
			sendError(w, "Key not found", http.StatusUnauthorized)
			return
		}

		var rawKey interface{}
		if err := key.Raw(&rawKey); err != nil {
			log.Printf("Failed to get raw key: %v", err)
			sendError(w, "Failed to get raw key", http.StatusInternalServerError)
			return
		}

		parsedToken, err := jwt.ParseWithClaims(tokenString, &Claims{}, func(token *jwt.Token) (interface{}, error) {
			if _, ok := token.Method.(*jwt.SigningMethodRSA); !ok {
				return nil, fmt.Errorf("unexpected signing method: %v", token.Header["alg"])
			}
			return rawKey, nil
		})

		if err != nil {
			log.Printf("Token validation error: %v", err)
			sendError(w, "Invalid token", http.StatusUnauthorized)
			return
		}

		if !parsedToken.Valid {
			sendError(w, "Invalid token", http.StatusUnauthorized)
			return
		}

		claims, ok := parsedToken.Claims.(*Claims)
		if !ok {
			sendError(w, "Invalid token claims", http.StatusUnauthorized)
			return
		}

		if !slices.Contains(claims.RealmAccess.Roles, "prothetic_user") {
			sendError(w, "Insufficient permissions", http.StatusForbidden)
			return
		}

		next(w, r)
	}
}

func sendError(w http.ResponseWriter, message string, statusCode int) {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(statusCode)
	json.NewEncoder(w).Encode(map[string]string{"error": message})
}
