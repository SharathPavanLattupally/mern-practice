
# Student Management System — Backend

## Technologies
- Node.js
- Express.js
- MongoDB Atlas
- Mongoose

## Configuration
Create a `.env` file inside the `server` directory.

Required variables:
- `PORT`: Express server port (default: 5000)
- `MONGODB_URI`: MongoDB connection string

Never commit `.env` or real database credentials to Git.

## Run the server
```bash
npm install
npm run dev
```

The server connects to MongoDB before starting to accept requests.

## API endpoints

| Method | Endpoint | Purpose |
|---|---|---|
| GET | `/` | API health check |
| POST | `/api/students` | Create a student |
| GET | `/api/students` | Retrieve all students |

## Student fields
- fullName
- email (unique)
- mobile
- gender
- course
- address
- createdAt (automatic)
- updatedAt (automatic)

## Error handling
- 400: Invalid student data
- 409: Duplicate email
- 500: Unexpected server error


# Student Management System — REST API

## Overview
A REST API built using Node.js, Express.js, MongoDB, and Mongoose to manage student records.

## Base URL
`http://localhost:5000`

## Endpoints

| Method | Endpoint | Description | Success Status |
|---|---|---|---|
| GET | `/api/students` | Retrieve all students | 200 |
| GET | `/api/students/:id` | Retrieve a student by ID | 200 |
| POST | `/api/students` | Create a student | 201 |
| PATCH | `/api/students/:id` | Update student fields | 200 |
| DELETE | `/api/students/:id` | Delete a student | 200 |

## Create Student — POST

Request body:

```json
{
  "fullName": "Test Student",
  "email": "test.student@example.com",
  "mobile": "9876543210",
  "gender": "Male",
  "course": "MERN Stack Development",
  "address": "Hyderabad, Telangana"
}
```

Required fields: `fullName`, `email`, `mobile`, `gender`, `course`, and `address`.

The email must be unique. Mobile numbers must be valid 10-digit Indian mobile numbers.

## Update Student — PATCH

Send only the fields you want to change. For example:

```json
{
  "address": "Secunderabad, Telangana"
}
```

## Error Responses

| Status | Meaning |
|---|---|
| 400 | Invalid ID or request data |
| 404 | Student or route not found |
| 409 | Duplicate email address |
| 413 | Request body too large |
| 500 | Internal server error |

## Technology Stack
- Node.js and Express.js
- MongoDB Atlas
- Mongoose
- Postman for API testing
- Git and GitHub for version control