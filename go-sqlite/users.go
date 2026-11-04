package main

import (
    "database/sql"
)

func CreateUsersTable(db *sql.DB) (sql.Result, error) {
	query := `CREATE TABLE IF NOT EXISTS users (
		id INTEGER PRIMARY KEY AUTOINCREMENT,
		name TEXT NOT NULL,
		email TEXT NOT NULL UNIQUE,
		password TEXT NOT NULL
	);`

	return db.Exec(query)
}
