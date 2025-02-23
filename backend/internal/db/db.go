package db

import (
	"context"
	"fmt"

	"github.com/jackc/pgx/v5"
)

// Database represents a PostgreSQL database entry
type Database struct {
	Name     string `json:"name"`
	Owner    string `json:"owner"`
	Encoding string `json:"encoding"`
}

// Schema represents a PostgreSQL schema entry
type Schema struct {
	Name string `json:"name"`
}

// DB interface for mocking in tests
type DB interface {
	ListDatabases(ctx context.Context) ([]Database, error)
	ListSchemas(ctx context.Context) ([]Schema, error)
	ExecuteQuery(ctx context.Context, query string) ([]string, [][]interface{}, string)
}

// PgxDB implements DB using pgx
type PgxDB struct {
	conn *pgx.Conn
}

// NewPgxDB creates a new PgxDB instance
func NewPgxDB(connStr string) (*PgxDB, error) {
	conn, err := pgx.Connect(context.Background(), connStr)
	if err != nil {
		return nil, fmt.Errorf("failed to connect to database: %v", err)
	}
	return &PgxDB{conn: conn}, nil
}

// Close closes the database connection
func (db *PgxDB) Close(ctx context.Context) error {
	return db.conn.Close(ctx)
}

// ListDatabases queries the PostgreSQL server for all databases
func (db *PgxDB) ListDatabases(ctx context.Context) ([]Database, error) {
	query := `
        SELECT 
            d.datname, 
            r.rolname, 
            pg_encoding_to_char(d.encoding)
        FROM pg_database d
        JOIN pg_roles r ON d.datdba = r.oid
				WHERE d.datname NOT IN ('template0','template1')
    `
	rows, err := db.conn.Query(ctx, query)
	if err != nil {
		return nil, fmt.Errorf("failed to query databases: %v", err)
	}
	defer rows.Close()

	var databases []Database
	for rows.Next() {
		var db Database
		if err := rows.Scan(&db.Name, &db.Owner, &db.Encoding); err != nil {
			return nil, fmt.Errorf("failed to scan row: %v", err)
		}
		databases = append(databases, db)
	}

	if err := rows.Err(); err != nil {
		return nil, fmt.Errorf("row iteration error: %v", err)
	}

	return databases, nil
}

// ListDatabases queries the PostgreSQL server for all schemas
func (db *PgxDB) ListSchemas(ctx context.Context) ([]Schema, error) {
	query := `
        SELECT nspname 
				FROM pg_catalog.pg_namespace 
				WHERE nspname 
				NOT IN ('pg_catalog', 'information_schema', 'pg_toast')
    `
	rows, err := db.conn.Query(ctx, query)
	if err != nil {
		return nil, fmt.Errorf("failed to query schemas: %v", err)
	}
	defer rows.Close()

	var schemas []Schema
	for rows.Next() {
		var db Schema
		if err := rows.Scan(&db.Name); err != nil {
			return nil, fmt.Errorf("failed to scan row: %v", err)
		}
		schemas = append(schemas, db)
	}

	if err := rows.Err(); err != nil {
		return nil, fmt.Errorf("row iteration error: %v", err)
	}

	return schemas, nil
}

func (db *PgxDB) ExecuteQuery(ctx context.Context, query string) ([]string, [][]interface{}, string) {
	rows, err := db.conn.Query(ctx, query)
	if err != nil {
		return nil, nil, err.Error()
	}
	defer rows.Close()

	columns := rows.FieldDescriptions()
	columnNames := make([]string, len(columns))
	for i, col := range columns {
		columnNames[i] = string(col.Name)
	}

	var resultRows [][]interface{}
	for rows.Next() {
		values, err := rows.Values()
		if err != nil {
			return nil, nil, err.Error()
		}
		resultRows = append(resultRows, values)
	}

	return columnNames, resultRows, ""
}
