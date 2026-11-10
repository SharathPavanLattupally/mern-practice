
import express from "express";

import { protect } from "../middleware/authMiddleware.js";
import { authorize } from "../middleware/roleMiddleware.js";

import {
  getInstructors,
  createInstructor,
  updateInstructor,
  deleteInstructor,
} from "../controllers/instructorController.js";

const router = express.Router();

router.use(protect);

router.get("/", authorize("admin", "staff", "viewer"), getInstructors);
router.post("/", authorize("admin"), createInstructor);
router.patch("/:id", authorize("admin"), updateInstructor);
router.delete("/:id", authorize("admin"), deleteInstructor);

export default router;
