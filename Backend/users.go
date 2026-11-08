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

func CreateInstaTable(db *sql.DB) (sql.Result, error) {
	query := `CREATE TABLE IF NOT EXISTS instagram_connections (
		user_id INTEGER NOT NULL REFERENCES users(id),
		instagram_id TEXT PRIMARY KEY NOT NULL,
		username TEXT NOT NULL UNIQUE,
		business_id TEXT NOT NULL,
		encrypted_token BLOB NOT NULL
	);`

	return db.Exec(query)
}
