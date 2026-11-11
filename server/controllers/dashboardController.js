
import mongoose from "mongoose";
import Student from "../models/Student.js";
import Course from "../models/Course.js";
import Instructor from "../models/Instructor.js";

export const getDashboardStats = async (req, res, next) => {
  try {
    // Date filter for recent activity: 7, 30, 90 days or all time
    const period = req.query.period || "7";

    const allowedPeriods = ["7", "30", "90", "all"];

    if (!allowedPeriods.includes(period)) {
      return res.status(400).json({
        success: false,
        message: "Period must be 7, 30, 90, or all.",
      });
    }

    const dateFilter = {};

    if (period !== "all") {
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - Number(period));

      dateFilter.createdAt = { $gte: startDate };
    }

    const [
      totalStudents,
      totalActiveCourses,
      totalInstructors,
      recentStudents,
      recentActivity,
      courseDistribution,
      studentsByCourse,
    ] = await Promise.all([
      // Total registered students
      Student.countDocuments(),

      // Active courses only
      Course.countDocuments({ status: "Active" }),

      // Total instructors
      Instructor.countDocuments(),

      // Recently registered students
      Student.find(dateFilter)
        .select("fullName email course courseId createdAt")
        .populate("courseId", "courseName courseCode")
        .sort({ createdAt: -1 })
        .limit(10)
        .lean(),

      // Recent enrollment activity
      Student.find(dateFilter)
        .select("fullName email course createdAt")
        .sort({ createdAt: -1 })
        .limit(10)
        .lean(),

      // Course-wise student distribution
      Course.aggregate([
        {
          $lookup: {
            from: Student.collection.name,
            localField: "_id",
            foreignField: "courseId",
            as: "enrolledStudents",
          },
        },
        {
          $project: {
            _id: 1,
            courseName: 1,
            courseCode: 1,
            status: 1,
            studentCount: { $size: "$enrolledStudents" },
          },
        },
        { $sort: { studentCount: -1, courseName: 1 } },
      ]),

      // Students grouped by legacy course name
      Student.aggregate([
        {
          $group: {
            _id: "$course",
            studentCount: { $sum: 1 },
          },
        },
        { $sort: { studentCount: -1 } },
      ]),
    ]);

    return res.status(200).json({
      success: true,
      message: "Dashboard statistics retrieved successfully.",
      filters: {
        period,
      },
      data: {
        summary: {
          totalStudents,
          totalActiveCourses,
          totalInstructors,
        },
        recentStudents,
        recentActivity,
        courseDistribution,
        studentsByCourse,
      },
    });
  } catch (error) {
    next(error);
  }
};
