package api

import (
	"context"
	"encoding/json"
	"net/http"

	"dman/backend/internal/db"
)

// Handler manages API endpoints
type Handler struct {
	db db.DB
}

// Handler for CORS
func enableCors(w *http.ResponseWriter) {
	(*w).Header().Set("Access-Control-Allow-Origin", "*")
}

// NewHandler creates a new Handler with a database connection
func NewHandler() *Handler {
	// Hardcoded for now; replace with config later
	connStr := "postgres://postgres:password@localhost:5432/postgres"
	dbConn, err := db.NewPgxDB(connStr)
	if err != nil {
		panic(err) // In production, handle gracefully
	}
	return &Handler{db: dbConn}
}

// ListDatabasesHandler handles GET /databases
func (h *Handler) ListDatabasesHandler() http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		enableCors(&w)
		databases, err := h.db.ListDatabases(context.Background())
		if err != nil {
			http.Error(w, err.Error(), http.StatusInternalServerError)
			return
		}

		w.Header().Set("Content-Type", "application/json")
		json.NewEncoder(w).Encode(databases)
	}
}
