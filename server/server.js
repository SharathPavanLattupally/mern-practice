
require("dotenv").config();

const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const connectDB = require("./config/db");
const Student = require("./models/Student");

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json({ limit: "20kb" }));

// Health-check endpoint
app.get("/", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Student Management System API is running",
  });
});

// Create a student
app.post("/api/students", async (req, res) => {
  try {
    const student = await Student.create(req.body);

    return res.status(201).json({
      success: true,
      message: "Student registered successfully.",
      data: student,
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        message: "A student with this email already exists.",
      });
    }

    if (error.name === "ValidationError" || error.name === "CastError") {
      return res.status(400).json({
        success: false,
        message: "Student data is invalid.",
        errors:
          error.name === "ValidationError"
            ? Object.values(error.errors).map((item) => ({
                field: item.path,
                message: item.message,
              }))
            : [{ message: error.message }],
      });
    }

    console.error("Create student error:", error.message);
    return res.status(500).json({
      success: false,
      message: "Unable to register student.",
    });
  }
});

// Retrieve students
app.get("/api/students", async (req, res) => {
  try {
    const students = await Student.find().sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: students.length,
      data: students,
    });
  } catch (error) {
    console.error("Get students error:", error.message);
    return res.status(500).json({
      success: false,
      message: "Unable to retrieve students.",
    });
  }
});

// Start server only after the database connection succeeds.
async function startServer() {
  try {
    await connectDB();

    app.listen(PORT, () => {
      console.log(`Server running at http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error("MongoDB connection failed:", error.message);
    process.exit(1);
  }
}

startServer();
