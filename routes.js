import express from "express"
const router = express.Router()

// Routes

router.get("/api/health", (req, res) => {
	res.status(200).json({
		message: "OK",
		service: "backend",
		time: new Date().toISOString(),
	})
})

// GET /api/users - Get all users
router.get("/api/users", (req, res) => {
	db.all("SELECT * FROM users ORDER BY created_at DESC", (err, rows) => {
		if (err) {
			res.status(500).json({ error: err.message })
			return
		}
		res.json({
			message: "Users retrieved successfully",
			data: rows,
		})
	})
})

// GET /api/users/:id - Get user by ID
router.get("/api/users/:id", (req, res) => {
	const id = req.params.id
	db.get("SELECT * FROM users WHERE id = ?", [id], (err, row) => {
		if (err) {
			res.status(500).json({ error: err.message })
			return
		}
		if (!row) {
			res.status(404).json({ error: "User not found" })
			return
		}
		res.json({
			message: "User retrieved successfully",
			data: row,
		})
	})
})

// POST /api/users - Create new user
router.post("/api/users", (req, res) => {
	const { name, email, age } = req.body

	if (!name || !email) {
		res.status(400).json({ error: "Name and email are required" })
		return
	}

	db.run(
		"INSERT INTO users (name, email, age) VALUES (?, ?, ?)",
		[name, email, age],
		function (err) {
			if (err) {
				if (err.code === "SQLITE_CONSTRAINT_UNIQUE") {
					res.status(409).json({ error: "Email already exists" })
				} else {
					res.status(500).json({ error: err.message })
				}
				return
			}
			res.status(201).json({
				message: "User created successfully",
				data: { id: this.lastID, name, email, age },
			})
		}
	)
})

// PUT /api/users/:id - Update user
router.put("/api/users/:id", (req, res) => {
	const id = req.params.id
	const { name, email, age } = req.body

	if (!name || !email) {
		res.status(400).json({ error: "Name and email are required" })
		return
	}

	db.run(
		"UPDATE users SET name = ?, email = ?, age = ? WHERE id = ?",
		[name, email, age, id],
		function (err) {
			if (err) {
				if (err.code === "SQLITE_CONSTRAINT_UNIQUE") {
					res.status(409).json({ error: "Email already exists" })
				} else {
					res.status(500).json({ error: err.message })
				}
				return
			}
			if (this.changes === 0) {
				res.status(404).json({ error: "User not found" })
				return
			}
			res.json({
				message: "User updated successfully",
				data: { id, name, email, age },
			})
		}
	)
})

// DELETE /api/users/:id - Delete user
router.delete("/api/users/:id", (req, res) => {
	const id = req.params.id

	db.run("DELETE FROM users WHERE id = ?", [id], function (err) {
		if (err) {
			res.status(500).json({ error: err.message })
			return
		}
		if (this.changes === 0) {
			res.status(404).json({ error: "User not found" })
			return
		}
		res.json({ message: "User deleted successfully" })
	})
})

export default router
