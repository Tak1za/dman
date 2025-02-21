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
	(*w).Header().Set("Access-Control-Allow-Methods", "*")
	(*w).Header().Set("Access-Control-Allow-Headers", "*")
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
		if r.Method == "OPTIONS" {
			w.WriteHeader(http.StatusOK)
			return
		}

		if r.Method != http.MethodPost {
			http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
			return
		}

		var req struct {
			ConnectionString string `json:"connectionString"`
		}
		if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
			http.Error(w, "Invalid request body", http.StatusBadRequest)
			return
		}

		dbConn, err := db.NewPgxDB(req.ConnectionString)
		if err != nil {
			http.Error(w, "Failed to connect to database: "+err.Error(), http.StatusInternalServerError)
			return
		}
		defer dbConn.Close(context.Background())

		databases, err := dbConn.ListDatabases(context.Background())
		if err != nil {
			http.Error(w, err.Error(), http.StatusInternalServerError)
			return
		}

		w.Header().Set("Content-Type", "application/json")
		json.NewEncoder(w).Encode(databases)
	}
}
