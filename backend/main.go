package main

import (
	"backend/internal/public_key"
	"backend/internal/router"
	"errors"
	"fmt"
	"log"
	"net/http"
	"os"
	"regexp"
)

func main() {
	addr := os.Getenv("BACKEND_URL")
	if addr == "" {
		log.Fatalf("ERROR: %v\n", errors.New("BACKEND_URL env is required"))
	}

	if ok := regexp.MustCompile(":\\d+$").MatchString(addr); !ok {
		log.Fatalf("ERROR: %v\n", errors.New("BACKEND_URL env is incorrect"))
	}

	envKeycloakURL := os.Getenv("KEYCLOAK_URL")
	envKeycloakRealm := os.Getenv("KEYCLOAK_REALM")

	if envKeycloakURL == "" || envKeycloakRealm == "" {
		log.Fatalf("ERROR: %v\n", errors.New("KEYCLOAK_URL and KEYCLOAK_REALM envs are required"))
	}

	keycloakURL := fmt.Sprintf("%s/realms/%s", envKeycloakURL, envKeycloakRealm)

	publicKey, err := public_key.Read(keycloakURL)
	if err != nil {
		log.Fatalf("ERROR: %v\n", err)
	}

	err = http.ListenAndServe(addr, router.New(publicKey))

	if err != nil && !errors.Is(err, http.ErrServerClosed) {
		log.Fatalf("ERROR: %v\n", err)
	}
}
