
const mongoose = require("mongoose");

const studentSchema = new mongoose.Schema(
  {
    fullName: {
      type: String,
      required: [true, "Full name is required."],
      trim: true,
      minlength: [2, "Full name must contain at least 2 characters."],
      maxlength: [100, "Full name cannot exceed 100 characters."],
    },

    email: {
      type: String,
      required: [true, "Email is required."],
      unique: true,
      lowercase: true,
      trim: true,
      match: [
        /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
        "Please provide a valid email address.",
      ],
    },

    mobile: {
      type: String,
      required: [true, "Mobile number is required."],
      trim: true,
      match: [/^[6-9]\d{9}$/, "Enter a valid 10-digit Indian mobile number."],
    },

    gender: {
      type: String,
      required: [true, "Gender is required."],
      enum: ["Male", "Female", "Other", "Prefer not to say"],
    },

    course: {
      type: String,
      required: [true, "Course is required."],
      enum: [
        "MERN Stack Development",
        "Java Full Stack",
        "Data Science",
        "Cloud Computing",
      ],
    },

    address: {
      type: String,
      required: [true, "Address is required."],
      trim: true,
      minlength: [5, "Address must contain at least 5 characters."],
      maxlength: [500, "Address cannot exceed 500 characters."],
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Student", studentSchema);
