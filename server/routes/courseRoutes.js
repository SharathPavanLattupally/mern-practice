
import express from "express";

import { protect } from "../middleware/authMiddleware.js";
import { authorize } from "../middleware/roleMiddleware.js";

import {
  getCourses,
  createCourse,
  getCourseById,
  updateCourse,
  deleteCourse,
} from "../controllers/courseController.js";

const router = express.Router();

router.use(protect);

router.get("/", authorize("admin", "staff", "viewer"), getCourses);
router.get("/:id", authorize("admin", "staff", "viewer"), getCourseById);
router.post("/", authorize("admin"), createCourse);
router.patch("/:id", authorize("admin"), updateCourse);
router.delete("/:id", authorize("admin"), deleteCourse);

export default router;
