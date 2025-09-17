# User API with SQLite

A simple Node.js REST API for user management using Express.js and SQLite database.

## Features

- Full CRUD operations for users
- SQLite database with automatic table creation
- Sample data insertion
- JSON responses
- Error handling
- CORS enabled

## Setup

1. Initialize the project:

```bash
npm init -y
```

2. Install dependencies:

```bash
npm install express sqlite3 cors
npm install -D nodemon
```

3. Start the server:

```bash
# Development mode with auto-reload
npm run dev

# Production mode
npm start
```

The server will start on `http://localhost:3000`

## API Endpoints

### GET /api/users

Get all users

```bash
curl http://localhost:3000/api/users
```

### GET /api/users/:id

Get a specific user by ID

```bash
curl http://localhost:3000/api/users/1
```

### POST /api/users

Create a new user

```bash
curl -X POST http://localhost:3000/api/users \
  -H "Content-Type: application/json" \
  -d '{"name": "Alice Brown", "email": "alice@example.com", "age": 28}'
```

### PUT /api/users/:id

Update an existing user

```bash
curl -X PUT http://localhost:3000/api/users/1 \
  -H "Content-Type: application/json" \
  -d '{"name": "John Updated", "email": "john.updated@example.com", "age": 31}'
```

### DELETE /api/users/:id

Delete a user

```bash
curl -X DELETE http://localhost:3000/api/users/1
```

### GET /api/health

Health check endpoint

```bash
curl http://localhost:3000/api/health
```

## Database Schema

The users table has the following structure:

- `id`: INTEGER PRIMARY KEY (auto-increment)
- `name`: TEXT NOT NULL
- `email`: TEXT UNIQUE NOT NULL
- `age`: INTEGER
- `created_at`: DATETIME (default: current timestamp)

## Sample Response

```json
{
	"message": "Users retrieved successfully",
	"data": [
		{
			"id": 1,
			"name": "John Doe",
			"email": "john@example.com",
			"age": 30,
			"created_at": "2025-01-15 10:30:00"
		}
	]
}
```

## Files Structure

```
project/
├── server.js          # Main server file
├── package.json       # Dependencies and scripts
├── users.db          # SQLite database (created automatically)
└── README.md         # Documentation
```

## Error Handling

The API includes proper error handling for:

- Invalid requests (400)
- Resource not found (404)
- Duplicate email addresses (409)
- Server errors (500)
