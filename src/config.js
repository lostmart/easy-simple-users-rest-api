import dotenv from "dotenv"
import path from "path"
import { fileURLToPath } from "url"

// Load environment variables
dotenv.config()

// Resolve __dirname in ES modules
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// Validate required environment variables
if (!process.env.DB_FILE) {
	console.error("Error: DB_FILE environment variable is not set in .env file")
	process.exit(1)
}

// Database path (relative to project root)
export const DB_FILE = path.resolve(__dirname, "..", process.env.DB_FILE)
export const PORT = process.env.PORT || 3000
