
import mongoose from "mongoose";
import Course from "../models/Course.js";
import Instructor from "../models/Instructor.js";
import Student from "../models/Student.js";

const isValidId = (id) => mongoose.isValidObjectId(id);

const sendError = (res, status, message) =>
  res.status(status).json({
    success: false,
    message,
  });

const handleError = (res, error) => {
  if (error.code === 11000) {
    return sendError(res, 409, "Course code already exists.");
  }

  if (error.name === "ValidationError" || error.name === "CastError") {
    return sendError(res, 400, "Invalid course data. Check the submitted fields.");
  }

  console.error("Course controller error:", error.message);
  return sendError(res, 500, "Internal server error.");
};

// GET all courses with instructor and student count
export const getCourses = async (req, res) => {
  try {
    const courses = await Course.find()
      .populate("instructor", "fullName email specialization")
      .lean();

    const coursesWithCounts = await Promise.all(
      courses.map(async (course) => ({
        ...course,
        studentCount: await Student.countDocuments({
          courseId: course._id,
        }),
      }))
    );

    return res.status(200).json({
      success: true,
      count: courses.length,
      data: coursesWithCounts,
    });
  } catch (error) {
    return handleError(res, error);
  }
};

// CREATE course
export const createCourse = async (req, res) => {
  try {
    const {
      courseName,
      courseCode,
      description,
      duration,
      fee,
      status,
      instructor,
    } = req.body;

    if (
      !courseName?.trim() ||
      !courseCode?.trim() ||
      !duration?.trim() ||
      fee === undefined ||
      fee === null ||
      !instructor
    ) {
      return sendError(
        res,
        400,
        "Course name, code, duration, fee and instructor are required."
      );
    }

    if (!isValidId(instructor)) {
      return sendError(res, 400, "Invalid instructor ID.");
    }

    if (typeof fee !== "number" || !Number.isFinite(fee) || fee < 0) {
      return sendError(res, 400, "Fee must be a valid non-negative number.");
    }

    if (
      status !== undefined &&
      !["Active", "Inactive"].includes(status)
    ) {
      return sendError(res, 400, "Status must be Active or Inactive.");
    }

    const instructorExists = await Instructor.findById(instructor);

    if (!instructorExists) {
      return sendError(res, 400, "Instructor does not exist.");
    }

    const course = await Course.create({
      courseName,
      courseCode,
      description,
      duration,
      fee,
      status,
      instructor,
    });

    return res.status(201).json({
      success: true,
      message: "Course created successfully.",
      data: course,
    });
  } catch (error) {
    return handleError(res, error);
  }
};

// GET course details and enrolled students
export const getCourseById = async (req, res) => {
  try {
    if (!isValidId(req.params.id)) {
      return sendError(res, 400, "Invalid course ID.");
    }

    const course = await Course.findById(req.params.id)
      .populate("instructor", "fullName email specialization");

    if (!course) {
      return sendError(res, 404, "Course not found.");
    }

    const students = await Student.find({ courseId: course._id })
      .select("-__v");

    return res.status(200).json({
      success: true,
      data: { course, students },
    });
  } catch (error) {
    return handleError(res, error);
  }
};

// UPDATE course
export const updateCourse = async (req, res) => {
  try {
    if (!isValidId(req.params.id)) {
      return sendError(res, 400, "Invalid course ID.");
    }

    const allowedFields = [
      "courseName",
      "courseCode",
      "description",
      "duration",
      "fee",
      "status",
      "instructor",
    ];

    const updates = {};

    for (const field of allowedFields) {
      if (Object.hasOwn(req.body, field)) {
        updates[field] = req.body[field];
      }
    }

    if (Object.keys(updates).length === 0) {
      return sendError(res, 400, "Provide at least one valid course field to update.");
    }

    if (
      Object.hasOwn(updates, "courseName") &&
      (typeof updates.courseName !== "string" || !updates.courseName.trim())
    ) {
      return sendError(res, 400, "Course name cannot be empty.");
    }

    if (
      Object.hasOwn(updates, "courseCode") &&
      (typeof updates.courseCode !== "string" || !updates.courseCode.trim())
    ) {
      return sendError(res, 400, "Course code cannot be empty.");
    }

    if (
      Object.hasOwn(updates, "duration") &&
      (typeof updates.duration !== "string" || !updates.duration.trim())
    ) {
      return sendError(res, 400, "Duration cannot be empty.");
    }

    if (Object.hasOwn(updates, "fee")) {
      if (
        typeof updates.fee !== "number" ||
        !Number.isFinite(updates.fee) ||
        updates.fee < 0
      ) {
        return sendError(res, 400, "Fee must be a valid non-negative number.");
      }
    }

    if (
      Object.hasOwn(updates, "status") &&
      !["Active", "Inactive"].includes(updates.status)
    ) {
      return sendError(res, 400, "Status must be Active or Inactive.");
    }

    if (Object.hasOwn(updates, "instructor")) {
      if (!isValidId(updates.instructor)) {
        return sendError(res, 400, "Invalid instructor ID.");
      }

      const instructorExists = await Instructor.findById(updates.instructor);

      if (!instructorExists) {
        return sendError(res, 400, "Instructor does not exist.");
      }
    }

    const course = await Course.findByIdAndUpdate(
      req.params.id,
      { $set: updates },
      { new: true, runValidators: true }
    ).populate("instructor", "fullName email specialization");

    if (!course) {
      return sendError(res, 404, "Course not found.");
    }

    return res.status(200).json({
      success: true,
      message: "Course updated successfully.",
      data: course,
    });
  } catch (error) {
    return handleError(res, error);
  }
};

// DELETE course - prevent deletion while students are enrolled
export const deleteCourse = async (req, res) => {
  try {
    if (!isValidId(req.params.id)) {
      return sendError(res, 400, "Invalid course ID.");
    }

    const course = await Course.findById(req.params.id);

    if (!course) {
      return sendError(res, 404, "Course not found.");
    }

    const enrolledStudents = await Student.countDocuments({
      courseId: course._id,
    });

    if (enrolledStudents > 0) {
      return sendError(
        res,
        409,
        "Cannot delete a course while students are enrolled."
      );
    }

    await course.deleteOne();

    return res.status(200).json({
      success: true,
      message: "Course deleted successfully.",
    });
  } catch (error) {
    return handleError(res, error);
  }
};
