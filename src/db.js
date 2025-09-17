import sqlite3 from "sqlite3"
import { DB_FILE } from "./config.js"

const { Database } = sqlite3.verbose()

// Create a promise-based database initialization
export const initializeDatabase = () => {
	return new Promise((resolve, reject) => {
		const db = new Database(DB_FILE, (err) => {
			if (err) {
				console.error("Error opening database:", err.message)
				reject(err)
				return
			}
			console.log(`Connected to SQLite database at: ${DB_FILE}`)

			// Create users table and populate with sample data
			db.serialize(() => {
				db.run(
					`
          CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            email TEXT UNIQUE NOT NULL,
            age INTEGER,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
          )
        `,
					(err) => {
						if (err) {
							console.error("Error creating table:", err.message)
							reject(err)
							return
						}
					}
				)

				// Check if table is empty and insert sample data
				db.get("SELECT COUNT(*) as count FROM users", (err, row) => {
					if (err) {
						console.error("Error checking user count:", err.message)
						reject(err)
						return
					}

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

						let insertCount = 0
						sampleUsers.forEach((user) => {
							stmt.run(user, (err) => {
								if (err) {
									console.error("Error inserting user:", err.message)
								} else {
									insertCount++
									if (insertCount === sampleUsers.length) {
										stmt.finalize()
										console.log(`✅ ${insertCount} sample users inserted`)
										resolve(db)
									}
								}
							})
						})
					} else {
						console.log(`✅ Database already has ${row.count} users`)
						resolve(db)
					}
				})
			})
		})
	})
}

// Export the database instance (will be set after initialization)
export let db = null

// Initialize the database and set the db export
initializeDatabase()
	.then((database) => {
		db = database
	})
	.catch((err) => {
		console.error("Failed to initialize database:", err)
		process.exit(1)
	})
