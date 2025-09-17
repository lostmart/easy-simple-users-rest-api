import express from "express"
import { db, generateAvatarUrl, generateRandomAvatarUrl } from "./db.js"

const router = express.Router()

// Get all users
router.get("/users", (req, res) => {
	db.all("SELECT * FROM users ORDER BY created_at DESC", (err, rows) => {
		if (err) {
			res.status(500).json({ error: err.message })
			return
		}
		res.json({
			data: rows,
			count: rows.length,
		})
	})
})

// Get user by ID
router.get("/users/:id", (req, res) => {
	const { id } = req.params
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

// Create new user
router.post("/users", (req, res) => {
	const { name, email, age, gender } = req.body

	// Validation
	if (!name || !email) {
		res.status(400).json({ error: "Name and email are required" })
		return
	}

	// Generate avatar URL
	const avatarUrl = generateRandomAvatarUrl(gender)

	const sql =
		"INSERT INTO users (name, email, age, gender, avatar_url) VALUES (?, ?, ?, ?, ?)"
	db.run(sql, [name, email, age, gender, avatarUrl], function (err) {
		if (err) {
			if (err.message.includes("UNIQUE constraint failed")) {
				res.status(409).json({ error: "Email already exists" })
			} else {
				res.status(500).json({ error: err.message })
			}
			return
		}

		// Get the created user
		db.get("SELECT * FROM users WHERE id = ?", [this.lastID], (err, row) => {
			if (err) {
				res.status(500).json({ error: err.message })
				return
			}
			res.status(201).json({
				message: "User created successfully",
				data: row,
			})
		})
	})
})

// Update user
router.put("/users/:id", (req, res) => {
	const { id } = req.params
	const { name, email, age, gender } = req.body

	// Check if user exists
	db.get("SELECT * FROM users WHERE id = ?", [id], (err, row) => {
		if (err) {
			res.status(500).json({ error: err.message })
			return
		}
		if (!row) {
			res.status(404).json({ error: "User not found" })
			return
		}

		// Generate new avatar if gender changed or if no avatar exists
		let avatarUrl = row.avatar_url
		if (gender && gender !== row.gender) {
			avatarUrl = generateRandomAvatarUrl(gender)
		} else if (!avatarUrl) {
			avatarUrl = generateRandomAvatarUrl(gender || row.gender)
		}

		const sql =
			"UPDATE users SET name = ?, email = ?, age = ?, gender = ?, avatar_url = ? WHERE id = ?"
		const params = [
			name || row.name,
			email || row.email,
			age !== undefined ? age : row.age,
			gender || row.gender,
			avatarUrl,
			id,
		]

		db.run(sql, params, function (err) {
			if (err) {
				if (err.message.includes("UNIQUE constraint failed")) {
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

			// Get the updated user
			db.get("SELECT * FROM users WHERE id = ?", [id], (err, updatedRow) => {
				if (err) {
					res.status(500).json({ error: err.message })
					return
				}
				res.json({
					message: "User updated successfully",
					data: updatedRow,
				})
			})
		})
	})
})

// Generate new avatar for user
router.patch("/users/:id/avatar", (req, res) => {
	const { id } = req.params

	// Check if user exists
	db.get("SELECT * FROM users WHERE id = ?", [id], (err, row) => {
		if (err) {
			res.status(500).json({ error: err.message })
			return
		}
		if (!row) {
			res.status(404).json({ error: "User not found" })
			return
		}

		// Generate new avatar
		const newAvatarUrl = generateRandomAvatarUrl(row.gender)

		db.run(
			"UPDATE users SET avatar_url = ? WHERE id = ?",
			[newAvatarUrl, id],
			function (err) {
				if (err) {
					res.status(500).json({ error: err.message })
					return
				}

				// Get the updated user
				db.get("SELECT * FROM users WHERE id = ?", [id], (err, updatedRow) => {
					if (err) {
						res.status(500).json({ error: err.message })
						return
					}
					res.json({
						message: "Avatar updated successfully",
						data: updatedRow,
					})
				})
			}
		)
	})
})

// Delete user
router.delete("/users/:id", (req, res) => {
	const { id } = req.params
	db.run("DELETE FROM users WHERE id = ?", [id], function (err) {
		if (err) {
			res.status(500).json({ error: err.message })
			return
		}
		if (this.changes === 0) {
			res.status(404).json({ error: "User not found" })
			return
		}
		res.json({
			message: "User deleted successfully",
			deletedId: parseInt(id),
		})
	})
})

export default router
