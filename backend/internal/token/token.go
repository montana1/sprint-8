package token

import (
	"crypto/rsa"
	"errors"
	"github.com/golang-jwt/jwt/v5"
	"net/http"
	"strings"
)

const Bearer = "Bearer "
const ProtheticUser = "prothetic_user"

var ErrTokenError = errors.New("token error")

func ExtractToken(request *http.Request, publicKey *rsa.PublicKey) (*jwt.Token, error) {
	header := request.Header.Get("Authorization")
	if !strings.HasPrefix(header, Bearer) {
		return nil, ErrTokenError
	}
	tokenRaw := strings.TrimPrefix(header, Bearer)
	token, err := jwt.Parse(tokenRaw, func(token *jwt.Token) (interface{}, error) {
		return publicKey, nil
	})
	if err != nil {
		return nil, err
	}
	if !token.Valid {
		return nil, ErrTokenError
	}
	return token, nil
}

func ExtractRoles(token *jwt.Token) ([]string, error) {
	mc := token.Claims.(jwt.MapClaims)

	var realmAccess map[string]interface{}
	if ra, ok := mc["realm_access"]; !ok {
		return nil, ErrTokenError
	} else {
		realmAccess, ok = ra.(map[string]interface{})
		if !ok {
			return nil, ErrTokenError
		}
	}

	var rolesRaw []interface{}
	if rs, ok := realmAccess["roles"]; !ok {
		return nil, ErrTokenError
	} else {
		rolesRaw, ok = rs.([]interface{})
		if !ok {
			return nil, ErrTokenError
		}
	}

	roles := make([]string, 0)
	for _, roleRaw := range rolesRaw {
		if role, ok := roleRaw.(string); ok {
			roles = append(roles, role)
		}
	}

	return roles, nil
}

func HasProtheticUserRole(roles []string) bool {
	for _, role := range roles {
		if role == ProtheticUser {
			return true
		}
	}
	return false
}
