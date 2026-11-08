

const express = require("express");
const { protect } = require("../middleware/authMiddleware");

const {
  getStudents,
  getStudentById,
  createStudent,
  updateStudent,
  deleteStudent,
} = require("../controllers/studentController");

const router = express.Router();

// Protect all student routes
router.use(protect);

// Student CRUD routes
router.route("/")
  .get(getStudents)
  .post(createStudent);

router.route("/:id")
  .get(getStudentById)
  .patch(updateStudent)
  .delete(deleteStudent);

module.exports = router;
