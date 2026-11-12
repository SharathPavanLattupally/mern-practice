
import express from "express";

import { authorize } from "../middleware/roleMiddleware.js";
import { protect } from "../middleware/authMiddleware.js";

import {
  authLimiter,
  passwordResetLimiter,
} from "../middleware/rateLimitMiddleware.js";

import {
  registerUser,
  loginUser,
  getProfile,
  updateProfile,
  changePassword,
  forgotPassword,
  resetPassword,
  updateUserRole,
  logoutUser,
} from "../controllers/authController.js";

const router = express.Router();

// Public authentication routes.
router.post("/register", authLimiter, registerUser);
router.post("/login", authLimiter, loginUser);

router.post(
  "/forgot-password",
  passwordResetLimiter,
  forgotPassword
);

router.post(
  "/reset-password/:token",
  passwordResetLimiter,
  resetPassword
);

// Protected account routes.
router.get("/profile", protect, getProfile);
router.patch("/profile", protect, updateProfile);
router.patch("/change-password", protect, changePassword);
router.post("/logout", protect, logoutUser);

// Admin-only operation.
router.patch(
  "/users/:id/role",
  protect,
  authorize("admin"),
  updateUserRole
);

export default router;
