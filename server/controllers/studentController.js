
import mongoose from "mongoose";
import Student from "../models/Student.js";
import Course from "../models/Course.js";
import { sendEnrollmentConfirmation } from "../services/enrollmentEmailService.js";

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

// Validate and retrieve an active course
async function getActiveCourse(courseId) {
  if (!isValidId(courseId)) {
    return null;
  }

  const course = await Course.findById(courseId);

  if (!course || course.status !== "Active") {
    return null;
  }

  return course;
}

// GET /api/students
// Search, filter, sort, paginate and populate course details
export const getStudents = async (req, res, next) => {
  try {
    const {
      search = "",
      course = "",
      courseId = "",
      gender = "",
      sortBy = "createdAt",
      order = "desc",
      page = "1",
      limit = "10",
    } = req.query;

    if (typeof search !== "string" || search.length > 100) {
      return sendError(res, 400, "Search must be a string of at most 100 characters.");
    }

    const pageNumber = Number(page);
    const pageSize = Number(limit);

    if (
      typeof page !== "string" ||
      !/^[1-9]\d*$/.test(page) ||
      !Number.isSafeInteger(pageNumber)
    ) {
      return sendError(res, 400, "Page must be a positive integer.");
    }

    if (
      typeof limit !== "string" ||
      !["10", "25", "50"].includes(limit)
    ) {
      return sendError(res, 400, "Limit must be 10, 25, or 50.");
    }

    if (
      typeof sortBy !== "string" ||
      !["name", "createdAt"].includes(sortBy)
    ) {
      return sendError(res, 400, "sortBy must be name or createdAt.");
    }

    if (
      typeof order !== "string" ||
      !["asc", "desc"].includes(order)
    ) {
      return sendError(res, 400, "Order must be asc or desc.");
    }

    if (
      typeof course !== "string" ||
      typeof courseId !== "string" ||
      typeof gender !== "string"
    ) {
      return sendError(res, 400, "Invalid course or gender filter.");
    }

    if (courseId && !isValidId(courseId)) {
      return sendError(res, 400, "Invalid course ID.");
    }

    const allowedCourses = Student.schema.path("course").enumValues;
    const allowedGenders = Student.schema.path("gender").enumValues;

    if (course && !allowedCourses.includes(course)) {
      return sendError(res, 400, "Invalid course filter.");
    }

    if (gender && !allowedGenders.includes(gender)) {
      return sendError(res, 400, "Invalid gender filter.");
    }

    const filter = {};

    if (search.trim()) {
      const escapedSearch = search.trim().replace(
        /[.*+?^${}()|[\]\\]/g,
        "\\$&"
      );

      filter.$or = [
        { fullName: { $regex: escapedSearch, $options: "i" } },
        { email: { $regex: escapedSearch, $options: "i" } },
      ];
    }

    if (course) filter.course = course;
    if (courseId) filter.courseId = courseId;
    if (gender) filter.gender = gender;

    const sortField = sortBy === "name" ? "fullName" : "createdAt";
    const sortDirection = order === "asc" ? 1 : -1;
    const skip = (pageNumber - 1) * pageSize;

    if (!Number.isSafeInteger(skip)) {
      return sendError(res, 400, "Page number is too large.");
    }

    const [students, total] = await Promise.all([
      Student.find(filter)
        .populate("courseId", "courseName courseCode duration fee status")
        .sort({ [sortField]: sortDirection, _id: 1 })
        .skip(skip)
        .limit(pageSize)
        .lean(),

      Student.countDocuments(filter),
    ]);

    return res.status(200).json({
      success: true,
      count: total,
      total,
      totalPages: Math.ceil(total / pageSize),
      currentPage: pageNumber,
      pageSize,
      data: students,
    });

  } catch (error) {
    next(error);
  }
};

// GET /api/students/:id
// Get student details with populated course
export const getStudentById = async (req, res, next) => {
  try {
    if (!isValidId(req.params.id)) {
      return sendError(res, 400, "Invalid student ID.");
    }

    const student = await Student.findById(req.params.id)
      .populate("courseId", "courseName courseCode description duration fee status");

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
};

// POST /api/students
// Create student with course reference validation

export const createStudent = async (req, res, next) => {
  try {
    const {
      fullName,
      email,
      mobile,
      gender,
      course,
      courseId,
      address,
    } = req.body;

    let studentCourse = course || "";
    let selectedCourseId = null;

    if (courseId) {
      const selectedCourse = await getActiveCourse(courseId);

      if (!selectedCourse) {
        return sendError(
          res,
          400,
          "Invalid or inactive course reference."
        );
      }

      selectedCourseId = selectedCourse._id;
      studentCourse = selectedCourse.courseName;
    }

    // Save student in MongoDB first
    const student = await Student.create({
      fullName,
      email,
      mobile,
      gender,
      course: studentCourse,
      courseId: selectedCourseId,
      address,
    });

    // Retrieve student with course details
    const populatedStudent = await Student.findById(student._id)
      .populate(
        "courseId",
        "courseName courseCode duration fee status"
      );

    // Send confirmation email after successful enrollment
    // Email failure must not cancel the enrollment
    let emailSent = false;

    try {
      await sendEnrollmentConfirmation(populatedStudent);
      emailSent = true;

      console.log("Enrollment confirmation email sent.");
    } catch (emailError) {
      console.error(
        "Enrollment email delivery failed:",
        emailError.message
      );
    }

    return res.status(201).json({
      success: true,
      message: "Student created successfully.",
      emailSent,
      data: populatedStudent,
    });

  } catch (error) {
    if (error.code === 11000) {
      return sendError(
        res,
        409,
        "A student with this email already exists."
      );
    }

    if (
      error.name === "ValidationError" ||
      error.name === "CastError"
    ) {
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
};


// PATCH /api/students/:id
// Update student and validate course reference
export const updateStudent = async (req, res, next) => {
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
      "courseId",
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

    // Validate selected course
    if (Object.hasOwn(updates, "courseId")) {
      if (updates.courseId === null || updates.courseId === "") {
        updates.courseId = null;
      } else {
        const selectedCourse = await getActiveCourse(updates.courseId);

        if (!selectedCourse) {
          return sendError(res, 400, "Invalid or inactive course reference.");
        }

        updates.courseId = selectedCourse._id;
        updates.course = selectedCourse.courseName;
      }
    } else if (Object.hasOwn(updates, "course")) {
      // Legacy course-name update: remove old reference
      updates.courseId = null;
    }

    const student = await Student.findByIdAndUpdate(
      req.params.id,
      { $set: updates },
      {
        new: true,
        runValidators: true,
        context: "query",
      }
    ).populate("courseId", "courseName courseCode duration fee status");

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
};

// DELETE /api/students/:id
export const deleteStudent = async (req, res, next) => {
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
};
