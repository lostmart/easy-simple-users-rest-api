import express from "express"
import cors from "cors"
import { db } from "./db.js"
import routes from "./routes.js"

const app = express()
const PORT = process.env.PORT || 3000

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
	db.close((err) => {
		if (err) {
			console.error(err.message)
		}
		console.log("Database connection closed")
		process.exit(0)
	})
})

// Start server
app.listen(PORT, () => {
	console.log(`Server is running on http://localhost:${PORT}/api/health`)
	console.log("API endpoints:")
	console.log("  GET    /api/users      - Get all users")
	console.log("  GET    /api/users/:id  - Get user by ID")
	console.log("  POST   /api/users      - Create new user")
	console.log("  PUT    /api/users/:id  - Update user")
	console.log("  DELETE /api/users/:id  - Delete user")
	console.log("  GET    /api/health     - Health check")
})

export default app
