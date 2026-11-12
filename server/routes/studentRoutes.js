
import express from "express";

import { protect } from "../middleware/authMiddleware.js";
import { authorize } from "../middleware/roleMiddleware.js";

import {
  getStudents,
  getStudentById,
  createStudent,
  updateStudent,
  deleteStudent,
} from "../controllers/studentController.js";

const router = express.Router();

// All student routes require authentication
router.use(protect);

// All roles can view shared student records
router.get(
  "/",
  authorize("admin", "staff", "viewer"),
  getStudents
);

router.get(
  "/:id",
  authorize("admin", "staff", "viewer"),
  getStudentById
);

// Admin and staff can create and update
router.post(
  "/",
  authorize("admin", "staff"),
  createStudent
);

router.patch(
  "/:id",
  authorize("admin", "staff"),
  updateStudent
);

// Only admin can delete
router.delete(
  "/:id",
  authorize("admin"),
  deleteStudent
);

export default router;
