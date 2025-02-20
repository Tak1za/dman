package main

import (
	"fmt"
	"log"
	"net/http"

	"dman/backend/internal/api"
)

func main() {
	handler := api.NewHandler()
	http.Handle("/databases", handler.ListDatabasesHandler())

	fmt.Println("Server running on :8080")
	if err := http.ListenAndServe(":8080", nil); err != nil {
		log.Fatalf("Server failed: %v", err)
	}
}
