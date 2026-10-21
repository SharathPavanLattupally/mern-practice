# Student Management System

A full-stack Student Management System built using the MERN stack.

## Technology Stack

- **Frontend:** React.js, Vite, JavaScript, HTML, CSS and Bootstrap (if used)
- **Backend:** Node.js and Express.js
- **Database:** MongoDB with Mongoose (planned for a later task)
- **Development tools:** Git, GitHub and Postman

## Project Structure


mern-practice/
├── client/             # React frontend
├── server/             # Express backend
│   ├── server.js        # Backend entry point
│   └── package.json
├── .gitignore
└── README.md


## Prerequisites

Install Node.js (a supported LTS release) and Git.

Verify installation:


node --version
npm --version
git --version


## Installation

Clone or download the project, then open a terminal in the project root.

### 1. Install frontend dependencies


cd client
npm install


### 2. Install backend dependencies

Open a second terminal, navigate to the project root, and run:


cd server
npm install


## Running the Application

### Start the backend

From the `server` directory:


npm run dev


The backend runs at:

http://localhost:5000

The root endpoint returns a JSON health-check response.

### Start the frontend

From the `client` directory, in a separate terminal:


npm run dev


Vite displays the frontend URL, normally:

http://localhost:5173

Keep both terminals running while testing the application.

## Available Backend Scripts

- `npm start` — start the backend normally.
- `npm run dev` — start the backend with Node.js watch mode.

## API Health Check

**Method:** GET

**Endpoint:** `http://localhost:5000/`

Expected response:

json
{
  "success": true,
  "message": "Student Management System API is running"
}


## Environment Variables

Do not commit passwords, database credentials, API keys or other secrets. Store them in a local `.env` file and keep that file excluded from Git.

## Current Status

- React frontend initialized with Vite.
- Express backend initialized.
- Backend health-check endpoint created.
- Development scripts configured.
- Student CRUD operations and MongoDB integration are planned for subsequent tasks.
