const Instructor = require("../models/Instructor");
const Course = require("../models/Course");

exports.getInstructors = async (req, res) => {
    try {
        const instructors = await Instructor.find().lean();

        const data = await Promise.all(
            instructors.map(async (instructor) => ({
                ...instructor,
                courses: await Course.find({
                    instructor: instructor._id
                }).select("courseName courseCode")
            }))
        );

        res.status(200).json({
            success: true,
            count: data.length,
            data
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.createInstructor = async (req, res) => {
    try {
        const { fullName, email, specialization } = req.body;

        const instructor = await Instructor.create({
            fullName,
            email,
            specialization
        });

        res.status(201).json({
            success: true,
            message: "Instructor created successfully.",
            data: instructor
        });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};

exports.updateInstructor = async (req, res) => {
    try {
        const instructor = await Instructor.findByIdAndUpdate(
            req.params.id,
            {
                $set: {
                    fullName: req.body.fullName,
                    email: req.body.email,
                    specialization: req.body.specialization
                }
            },
            { new: true, runValidators: true }
        );

        if (!instructor) {
            return res.status(404).json({
                success: false,
                message: "Instructor not found."
            });
        }

        res.status(200).json({
            success: true,
            message: "Instructor updated successfully.",
            data: instructor
        });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};

exports.deleteInstructor = async (req, res) => {
    try {
        const assignedCourses = await Course.countDocuments({
            instructor: req.params.id
        });

        if (assignedCourses > 0) {
            return res.status(409).json({
                success: false,
                message: "Cannot delete instructor while courses are assigned."
            });
        }

        const instructor = await Instructor.findByIdAndDelete(req.params.id);

        if (!instructor) {
            return res.status(404).json({
                success: false,
                message: "Instructor not found."
            });
        }

        res.status(200).json({
            success: true,
            message: "Instructor deleted successfully."
        });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};