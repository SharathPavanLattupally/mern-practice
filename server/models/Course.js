const mongoose = require("mongoose");

const courseSchema = new mongoose.Schema({
    courseName: {
        type: String,
        required: true,
        trim: true
    },
    courseCode: {
        type: String,
        required: true,
        unique: true,
        uppercase: true,
        trim: true
    },
    description: {
        type: String,
        trim: true
    },
    duration: {
        type: String,
        required: true
    },
    fee: {
        type: Number,
        required: true,
        min: 0
    },
    status: {
        type: String,
        enum: ["Active", "Inactive"],
        default: "Active"
    },
    instructor: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Instructor",
        required: true
    }
}, {
    timestamps: true
});

module.exports = mongoose.model("Course", courseSchema);