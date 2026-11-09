const express = require("express");

const { protect } = require("../middleware/authMiddleware");
const { authorize } = require("../middleware/roleMiddleware");

const {
    getStudents,
    getStudentById,
    createStudent,
    updateStudent,
    deleteStudent
} = require("../controllers/studentController");

const router = express.Router();

// All student routes require authentication
router.use(protect);

// All roles can view and search students
router.get("/", authorize("admin", "staff", "viewer"), getStudents);
router.get("/:id", authorize("admin", "staff", "viewer"), getStudentById);

// Admin and staff can create and edit
router.post("/", authorize("admin", "staff"), createStudent);
router.patch("/:id", authorize("admin", "staff"), updateStudent);

// Only admin can delete
router.delete("/:id", authorize("admin"), deleteStudent);

module.exports = router;