import sqlite3 from "sqlite3"
import fs from "fs"
import path from "path"
import { DB_FILE } from "./config.js"

const { Database } = sqlite3.verbose()

// Avatar generation helper functions
const generateAvatarUrl = (name, gender = null) => {
	const baseUrl = "https://avatar-placeholder.iran.liara.run"

	// Generate avatar based on name initials
	const initials = name
		.split(" ")
		.map((word) => word[0])
		.join("")
		.toUpperCase()
	return `${baseUrl}/${initials}`
}

// const generateRandomAvatarUrl = (gender = null) => {
// 	const baseUrl = "https://avatar-placeholder.iran.liara.run"
// 	const randomId = Math.floor(Math.random() * 100) + 1

// 	if (gender === "male") {
// 		return `${baseUrl}/male?random=${randomId}`
// 	} else if (gender === "female") {
// 		return `${baseUrl}/female?random=${randomId}`
// 	} else {
// 		// Random gender
// 		const randomGender = Math.random() > 0.5 ? "male" : "female"
// 		return `${baseUrl}/${randomGender}?random=${randomId}`
// 	}
// }

// Create a promise-based database initialization
export const initializeDatabase = () => {
	return new Promise((resolve, reject) => {
		// Ensure the directory exists before creating the database
		try {
			const dbDir = path.dirname(DB_FILE)
			fs.mkdirSync(dbDir, { recursive: true })
			console.log(`✅ Database directory ready: ${dbDir}`)
		} catch (error) {
			console.error("Error creating database directory:", error.message)
			reject(error)
			return
		}

		const db = new Database(DB_FILE, (err) => {
			if (err) {
				console.error("Error opening database:", err.message)
				reject(err)
				return
			}
			console.log(`Connected to SQLite database at: ${DB_FILE}`)

			// Create users table with avatar field
			db.serialize(() => {
				db.run(
					`
          CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            email TEXT NOT NULL,
            age INTEGER NOT NULL,
            gender TEXT CHECK(gender IN ('male', 'female')),
            avatar_url TEXT NOT NULL,
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
							[
								"John Doe",
								"john@example.com",
								30,
								"male",
								"https://avatar.iran.liara.run/public/boy",
							],
							[
								"Jane Smith",
								"jane@example.com",
								25,
								"female",
								"https://plus.unsplash.com/premium_photo-1687832783343-9b79ccb831b8?q=80&w=870&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
							],
							[
								"Bob Johnson",
								"bob@example.com",
								35,
								"male",
								"https://avatar.iran.liara.run/public/boy",
							],
							[
								"Alice Williams",
								"alice@example.com",
								28,
								"female",
								"https://avatar.iran.liara.run/public/girl",
							],
							[
								"Charlie Brown",
								"charlie@example.com",
								32,
								"male",
								"https://avatar.iran.liara.run/public/boy",
							],
							[
								"Eve Green",
								"eve@example.com",
								27,
								"female",
								"https://avatar.iran.liara.run/public/girl",
							],
							[
								"Frank White",
								"frank@example.com",
								31,
								"male",
								"https://avatar.iran.liara.run/public/boy",
							],
							[
								"Grace Black",
								"grace@example.com",
								29,
								"female",
								"https://avatar.iran.liara.run/public/girl",
							],
							[
								"Harry Red",
								"harry@example.com",
								33,
								"male",
								"https://avatar.iran.liara.run/public/boy",
							],
							[
								"Ivy Blue",
								"ivy@example.com",
								26,
								"female",
								"https://avatar.iran.liara.run/public/girl",
							],
						]

						const stmt = db.prepare(
							"INSERT INTO users (name, email, age, gender, avatar_url) VALUES (?, ?, ?, ?, ?)"
						)

						let insertCount = 0
						sampleUsers.forEach((user) => {
							const [name, email, age, gender, avatar_url] = user

							stmt.run([name, email, age, gender, avatar_url], (err) => {
								if (err) {
									console.error("Error inserting user:", err.message)
								} else {
									insertCount++
									if (insertCount === sampleUsers.length) {
										stmt.finalize()
										console.log(
											`✅ ${insertCount} sample users inserted with avatars`
										)
										resolve(db)
									}
								}
							})
						})
					} else {
						// Check if existing users need avatar URLs added
						db.get(
							"SELECT COUNT(*) as count FROM users WHERE avatar_url IS NULL",
							(err, row) => {
								if (err) {
									console.error(
										"Error checking users without avatars:",
										err.message
									)
									resolve(db)
									return
								}

								if (row.count > 0) {
									console.log(
										`Updating ${row.count} users with missing avatars...`
									)

									db.all(
										"SELECT id, name, gender FROM users WHERE avatar_url IS NULL",
										(err, rows) => {
											if (err) {
												console.error(
													"Error fetching users without avatars:",
													err.message
												)
												resolve(db)
												return
											}

											const updateStmt = db.prepare(
												"UPDATE users SET avatar_url = ? WHERE id = ?"
											)
											let updateCount = 0

											rows.forEach((user) => {
												const avatarUrl = updateStmt.run(
													[avatarUrl, user.id],
													(err) => {
														if (err) {
															console.error(
																"Error updating avatar for user:",
																err.message
															)
														} else {
															updateCount++
															if (updateCount === rows.length) {
																updateStmt.finalize()
																console.log(
																	`✅ Updated ${updateCount} users with avatar URLs`
																)
															}
														}
													}
												)
											})
										}
									)
								}

								console.log(`✅ Database already has ${row.count} users`)
								resolve(db)
							}
						)
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

// Export avatar helper functions for use in routes
export { generateAvatarUrl }
