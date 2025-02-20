package db_test

import (
	"context"
	"testing"

	"dman/backend/internal/db"

	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/mock"
)

// MockDB mocks the DB interface
type MockDB struct {
	mock.Mock
}

func (m *MockDB) ListDatabases(ctx context.Context) ([]db.Database, error) {
	args := m.Called(ctx)
	return args.Get(0).([]db.Database), args.Error(1)
}

func TestListDatabases(t *testing.T) {
	// Setup mock
	mockDB := new(MockDB)
	expected := []db.Database{
		{Name: "postgres", Owner: "postgres", Encoding: "UTF8"},
	}
	mockDB.On("ListDatabases", mock.Anything).Return(expected, nil)

	// Test
	databases, err := mockDB.ListDatabases(context.Background())
	assert.NoError(t, err)
	assert.Equal(t, expected, databases)
	mockDB.AssertExpectations(t)
}
