import path from "path"
import sqlite3 from "sqlite3"
import { fileURLToPath } from "url"
import { DB_FILE } from "./config.js"


const { Database } = sqlite3.verbose()

// ES modules __dirname equivalent
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
// SQLite database setup
const dbPath = path.join(__dirname, DB_FILE)


export const db = new Database(dbPath, (err) => {
	if (err) {
		console.error("Error opening database:", err.message)
	} else {
		console.log("Connected to SQLite database")
	}
})

// Create users table if it doesn't exist
db.serialize(() => {
	db.run(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL,
      age INTEGER,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `)

	// Insert sample data if table is empty
	db.get("SELECT COUNT(*) as count FROM users", (err, row) => {
		if (row.count === 0) {
			const sampleUsers = [
				["John Doe", "john@example.com", 30],
				["Jane Smith", "jane@example.com", 25],
				["Bob Johnson", "bob@example.com", 35],
				["Alice Williams", "alice@example.com", 28],
				["Charlie Brown", "charlie@example.com", 32],
				["Eve Green", "eve@example.com", 27],
				["Frank White", "frank@example.com", 31],
				["Grace Black", "grace@example.com", 29],
				["Harry Red", "harry@example.com", 33],
				["Ivy Blue", "ivy@example.com", 26],
			]

			const stmt = db.prepare(
				"INSERT INTO users (name, email, age) VALUES (?, ?, ?)"
			)
			sampleUsers.forEach((user) => {
				stmt.run(user)
			})
			stmt.finalize()
			console.log("Sample users inserted")
		}
	})
})


