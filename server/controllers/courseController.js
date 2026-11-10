
import Course from "../models/Course.js";
import Instructor from "../models/Instructor.js";
import Student from "../models/Student.js";

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

    res.status(200).json({
      success: true,
      count: courses.length,
      data: coursesWithCounts,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
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

    const instructorExists = await Instructor.findById(instructor);

    if (!instructorExists) {
      return res.status(400).json({
        success: false,
        message: "Invalid instructor reference.",
      });
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

    res.status(201).json({
      success: true,
      message: "Course created successfully.",
      data: course,
    });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// GET course details and enrolled students
export const getCourseById = async (req, res) => {
  try {
    const course = await Course.findById(req.params.id)
      .populate("instructor", "fullName email specialization");

    if (!course) {
      return res.status(404).json({
        success: false,
        message: "Course not found.",
      });
    }

    const students = await Student.find({ courseId: course._id })
      .select("-__v");

    res.status(200).json({
      success: true,
      data: { course, students },
    });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// UPDATE course
export const updateCourse = async (req, res) => {
  try {
    if (req.body.instructor) {
      const instructorExists = await Instructor.findById(req.body.instructor);

      if (!instructorExists) {
        return res.status(400).json({
          success: false,
          message: "Invalid instructor reference.",
        });
      }
    }

    const course = await Course.findByIdAndUpdate(
      req.params.id,
      { $set: req.body },
      { new: true, runValidators: true }
    ).populate("instructor", "fullName email specialization");

    if (!course) {
      return res.status(404).json({
        success: false,
        message: "Course not found.",
      });
    }

    res.status(200).json({
      success: true,
      message: "Course updated successfully.",
      data: course,
    });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// DELETE course - prevent deletion while students are enrolled
export const deleteCourse = async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);

    if (!course) {
      return res.status(404).json({
        success: false,
        message: "Course not found.",
      });
    }

    const enrolledStudents = await Student.countDocuments({
      courseId: course._id,
    });

    if (enrolledStudents > 0) {
      return res.status(409).json({
        success: false,
        message: "Cannot delete a course while students are enrolled.",
      });
    }

    await course.deleteOne();

    res.status(200).json({
      success: true,
      message: "Course deleted successfully.",
    });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};
