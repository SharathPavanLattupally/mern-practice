
const mongoose = require("mongoose");
const Student = require("../models/Student");

function isValidId(id) {
  return mongoose.isValidObjectId(id);
}

function sendError(res, status, message, errors) {
  return res.status(status).json({
    success: false,
    message,
    ...(errors ? { errors } : {}),
  });
}

// GET /api/students
async function getStudents(req, res, next) {
  try {
    const students = await Student.find().sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: students.length,
      data: students,
    });
  } catch (error) {
    next(error);
  }
}

// GET /api/students/:id
async function getStudentById(req, res, next) {
  try {
    if (!isValidId(req.params.id)) {
      return sendError(res, 400, "Invalid student ID.");
    }

    const student = await Student.findById(req.params.id);

    if (!student) {
      return sendError(res, 404, "Student not found.");
    }

    return res.status(200).json({
      success: true,
      data: student,
    });
  } catch (error) {
    next(error);
  }
}

// POST /api/students
async function createStudent(req, res, next) {
  try {
    const student = await Student.create(req.body);

    return res.status(201).json({
      success: true,
      message: "Student created successfully.",
      data: student,
    });
  } catch (error) {
    if (error.code === 11000) {
      return sendError(res, 409, "A student with this email already exists.");
    }

    if (error.name === "ValidationError" || error.name === "CastError") {
      return sendError(
        res,
        400,
        "Student data is invalid.",
        error.name === "ValidationError"
          ? Object.values(error.errors).map((item) => ({
              field: item.path,
              message: item.message,
            }))
          : [{ message: error.message }]
      );
    }

    next(error);
  }
}

// PATCH /api/students/:id
async function updateStudent(req, res, next) {
  try {
    if (!isValidId(req.params.id)) {
      return sendError(res, 400, "Invalid student ID.");
    }

    const allowedFields = [
      "fullName",
      "email",
      "mobile",
      "gender",
      "course",
      "address",
    ];

    const updates = {};
    for (const field of allowedFields) {
      if (Object.hasOwn(req.body, field)) {
        updates[field] = req.body[field];
      }
    }

    if (Object.keys(updates).length === 0) {
      return sendError(
        res,
        400,
        "Provide at least one valid field to update."
      );
    }

    const student = await Student.findByIdAndUpdate(
      req.params.id,
      updates,
      {
        new: true,
        runValidators: true,
        context: "query",
      }
    );

    if (!student) {
      return sendError(res, 404, "Student not found.");
    }

    return res.status(200).json({
      success: true,
      message: "Student updated successfully.",
      data: student,
    });
  } catch (error) {
    if (error.code === 11000) {
      return sendError(res, 409, "A student with this email already exists.");
    }

    if (error.name === "ValidationError" || error.name === "CastError") {
      return sendError(
        res,
        400,
        "Student data is invalid.",
        error.name === "ValidationError"
          ? Object.values(error.errors).map((item) => ({
              field: item.path,
              message: item.message,
            }))
          : [{ message: error.message }]
      );
    }

    next(error);
  }
}

// DELETE /api/students/:id
async function deleteStudent(req, res, next) {
  try {
    if (!isValidId(req.params.id)) {
      return sendError(res, 400, "Invalid student ID.");
    }

    const student = await Student.findByIdAndDelete(req.params.id);

    if (!student) {
      return sendError(res, 404, "Student not found.");
    }

    return res.status(200).json({
      success: true,
      message: "Student deleted successfully.",
      data: student,
    });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  getStudents,
  getStudentById,
  createStudent,
  updateStudent,
  deleteStudent,
};
