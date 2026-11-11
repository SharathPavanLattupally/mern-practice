
import express from "express";
import { getDashboardStats } from "../controllers/dashboardController.js";
import { protect } from "../middleware/authMiddleware.js";
import { authorize } from "../middleware/roleMiddleware.js";

const router = express.Router();

// Dashboard is available to authenticated admin, staff and viewer users
router.get(
  "/",
  protect,
  authorize("admin", "staff", "viewer"),
  getDashboardStats
);

export default router;
