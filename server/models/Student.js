
import mongoose from "mongoose";

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
      maxlength: [254, "Email cannot exceed 254 characters."],
      match: [
        /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
        "Please provide a valid email address.",
      ],
    },

    mobile: {
      type: String,
      required: [true, "Mobile number is required."],
      trim: true,
      match: [
        /^[6-9]\d{9}$/,
        "Enter a valid 10-digit Indian mobile number.",
      ],
    },

    gender: {
      type: String,
      required: [true, "Gender is required."],
      enum: {
        values: ["Male", "Female", "Other", "Prefer not to say"],
        message: "Invalid gender value.",
      },
    },

    course: {
      type: String,
      required: [true, "Course is required."],
      enum: {
        values: [
          "MERN Stack Development",
          "Java Full Stack",
          "Data Science",
          "Cloud Computing",
        ],
        message: "Invalid course selection.",
      },
    },

    address: {
      type: String,
      required: [true, "Address is required."],
      trim: true,
      minlength: [5, "Address must contain at least 5 characters."],
      maxlength: [500, "Address cannot exceed 500 characters."],
    },

    courseId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Course",
      default: null,
    },

    profilePhoto: {
      filename: {
        type: String,
        trim: true,
        maxlength: 255,
      },
      path: {
        type: String,
        trim: true,
        maxlength: 1000,
      },
      mimetype: {
        type: String,
        trim: true,
        maxlength: 100,
      },
      size: {
        type: Number,
        min: 0,
        max: 5 * 1024 * 1024,
      },
    },

    documents: [
      {
        filename: {
          type: String,
          trim: true,
          maxlength: 255,
        },
        originalName: {
          type: String,
          trim: true,
          maxlength: 255,
        },
        path: {
          type: String,
          trim: true,
          maxlength: 1000,
        },
        mimetype: {
          type: String,
          trim: true,
          maxlength: 100,
        },
        size: {
          type: Number,
          min: 0,
          max: 10 * 1024 * 1024,
        },
        uploadedAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
  },
  {
    timestamps: true,
    strict: "throw",
    versionKey: false,
  }
);

// Database indexes
// Email uniqueness is enforced by the unique email index.
studentSchema.index({ createdAt: -1, _id: 1 });
studentSchema.index({ fullName: 1 });
studentSchema.index({ course: 1 });
studentSchema.index({ courseId: 1 });
studentSchema.index({ gender: 1 });

const Student = mongoose.model("Student", studentSchema);

export default Student;
