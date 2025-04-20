package router

import (
	"backend/internal/handlers"
	"crypto/rsa"
	"github.com/go-chi/chi/v5"
	"net/http"

	"github.com/go-chi/chi/v5/middleware"
)

func New(publicKey *rsa.PublicKey) chi.Router {
	r := chi.NewRouter()

	r.Options("/reports", handlers.OptionsReports())
	r.With(middleware.AllowContentType("application/json")).Get("/reports", handlers.GetReports(publicKey))

	r.Get("/", http.NotFound)

	return r
}
