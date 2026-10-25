
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
