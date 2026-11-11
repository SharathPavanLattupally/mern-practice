
import mongoose from "mongoose";
import Instructor from "../models/Instructor.js";
import Course from "../models/Course.js";

const isValidId = (id) => mongoose.isValidObjectId(id);

const sendError = (res, status, message) =>
  res.status(status).json({
    success: false,
    message,
  });

const handleError = (res, error) => {
  if (error.code === 11000) {
    return sendError(res, 409, "An instructor with this email already exists.");
  }

  if (error.name === "ValidationError" || error.name === "CastError") {
    return sendError(res, 400, "Invalid instructor data. Check the submitted fields.");
  }

  console.error("Instructor controller error:", error.message);
  return sendError(res, 500, "Internal server error.");
};

const validEmail = (email) =>
  typeof email === "string" &&
  /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());

// GET all instructors with assigned courses
export const getInstructors = async (req, res) => {
  try {
    const instructors = await Instructor.find().lean();

    const data = await Promise.all(
      instructors.map(async (instructor) => ({
        ...instructor,
        courses: await Course.find({
          instructor: instructor._id,
        }).select("courseName courseCode"),
      }))
    );

    return res.status(200).json({
      success: true,
      count: data.length,
      data,
    });
  } catch (error) {
    return handleError(res, error);
  }
};

// CREATE instructor
export const createInstructor = async (req, res) => {
  try {
    const { fullName, email, specialization } = req.body;

    if (
      typeof fullName !== "string" ||
      !fullName.trim() ||
      typeof email !== "string" ||
      !validEmail(email) ||
      typeof specialization !== "string" ||
      !specialization.trim()
    ) {
      return sendError(
        res,
        400,
        "Valid full name, email and specialization are required."
      );
    }

    const instructor = await Instructor.create({
      fullName: fullName.trim(),
      email: email.trim().toLowerCase(),
      specialization: specialization.trim(),
    });

    return res.status(201).json({
      success: true,
      message: "Instructor created successfully.",
      data: instructor,
    });
  } catch (error) {
    return handleError(res, error);
  }
};

// UPDATE instructor
export const updateInstructor = async (req, res) => {
  try {
    if (!isValidId(req.params.id)) {
      return sendError(res, 400, "Invalid instructor ID.");
    }

    const allowedFields = ["fullName", "email", "specialization"];
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
        "Provide at least one valid instructor field to update."
      );
    }

    if (
      Object.hasOwn(updates, "fullName") &&
      (typeof updates.fullName !== "string" || !updates.fullName.trim())
    ) {
      return sendError(res, 400, "Full name cannot be empty.");
    }

    if (Object.hasOwn(updates, "email")) {
      if (!validEmail(updates.email)) {
        return sendError(res, 400, "Provide a valid email address.");
      }

      updates.email = updates.email.trim().toLowerCase();
    }

    if (
      Object.hasOwn(updates, "specialization") &&
      (
        typeof updates.specialization !== "string" ||
        !updates.specialization.trim()
      )
    ) {
      return sendError(res, 400, "Specialization cannot be empty.");
    }

    if (Object.hasOwn(updates, "fullName")) {
      updates.fullName = updates.fullName.trim();
    }

    if (Object.hasOwn(updates, "specialization")) {
      updates.specialization = updates.specialization.trim();
    }

    const instructor = await Instructor.findByIdAndUpdate(
      req.params.id,
      { $set: updates },
      { new: true, runValidators: true }
    );

    if (!instructor) {
      return sendError(res, 404, "Instructor not found.");
    }

    return res.status(200).json({
      success: true,
      message: "Instructor updated successfully.",
      data: instructor,
    });
  } catch (error) {
    return handleError(res, error);
  }
};

// DELETE instructor - prevent deletion while courses are assigned
export const deleteInstructor = async (req, res) => {
  try {
    if (!isValidId(req.params.id)) {
      return sendError(res, 400, "Invalid instructor ID.");
    }

    const instructor = await Instructor.findById(req.params.id);

    if (!instructor) {
      return sendError(res, 404, "Instructor not found.");
    }

    const assignedCourses = await Course.countDocuments({
      instructor: instructor._id,
    });

    if (assignedCourses > 0) {
      return sendError(
        res,
        409,
        "Cannot delete instructor while courses are assigned."
      );
    }

    await instructor.deleteOne();

    return res.status(200).json({
      success: true,
      message: "Instructor deleted successfully.",
    });
  } catch (error) {
    return handleError(res, error);
  }
};
