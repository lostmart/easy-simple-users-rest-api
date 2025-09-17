import express from "express"
import cors from "cors"
import { initializeDatabase, db } from "./db.js"
import routes from "./routes.js"
import { PORT } from "./config.js"

const app = express()

// Middleware
app.use(cors())
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

// Routes
// Health check endpoint
app.get("/api/health", (_req, res) => {
	res.json({ status: "OK", message: "Server is running", time: new Date() })
})

app.use("/api", routes)

// Close database connection on app termination
process.on("SIGINT", () => {
	if (db) {
		db.close((err) => {
			if (err) {
				console.error(err.message)
			}
			console.log("Database connection closed")
			process.exit(0)
		})
	} else {
		process.exit(0)
	}
})

// Initialize database first, then start server
const startServer = async () => {
	try {
		// Wait for database to be fully initialized
		await initializeDatabase()

		// Start server only after database is ready
		app.listen(PORT, () => {
			console.log(`✅ Server running at http://localhost:${PORT}/api/health`)
			console.log("📊 Database is ready with sample data")
			console.log("📌 API endpoints:")
			console.log("  GET    /api/users      - Get all users")
			console.log("  GET    /api/users/:id  - Get user by ID")
			console.log("  POST   /api/users      - Create new user")
			console.log("  PUT    /api/users/:id  - Update user")
			console.log("  DELETE /api/users/:id  - Delete user")
			console.log("  GET    /api/health     - Health check")
		})
	} catch (error) {
		console.error("Failed to start server:", error)
		process.exit(1)
	}
}

// Start the server
startServer()

export default app
