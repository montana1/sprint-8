package handlers

import (
	"backend/internal/token"
	"crypto/rsa"
	"net/http"
)

func GetReports(publicKey *rsa.PublicKey) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		defaultHeaders(w)

		tkn, err := token.ExtractToken(r, publicKey)
		if err != nil {
			w.WriteHeader(http.StatusUnauthorized)
			return
		}

		var roles []string
		roles, err = token.ExtractRoles(tkn)
		if err != nil {
			w.WriteHeader(http.StatusForbidden)
			return
		}

		if !token.HasProtheticUserRole(roles) {
			w.WriteHeader(http.StatusForbidden)
			return
		}

		w.WriteHeader(http.StatusOK)
		w.Header().Set("Content-Type", "text/html; charset=utf-8")
		_, _ = w.Write([]byte("Report Data"))
	}
}

func OptionsReports() http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		defaultHeaders(w)
		w.WriteHeader(http.StatusNoContent)
	}
}

func defaultHeaders(w http.ResponseWriter) {
	w.Header().Set("Access-Control-Allow-Origin", "http://localhost:3000")
	w.Header().Set("Access-Control-Allow-Headers", "authorization")
	w.Header().Set("Access-Control-Allow-Methods", "GET, OPTIONS")
}
