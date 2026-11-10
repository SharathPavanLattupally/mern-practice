
import express from "express";

import {
  upload,
  validateUploadedFile,
} from "../middleware/uploadMiddleware.js";

import { protect } from "../middleware/authMiddleware.js";
import { authorize } from "../middleware/roleMiddleware.js";

import {
  uploadPhoto,
  uploadDocument,
  deletePhoto,
  downloadDocument,
  deleteDocument,
  getPhoto,
} from "../controllers/fileController.js";

const router = express.Router();

// Upload or replace profile photo
router.post(
  "/:id/photo",
  protect,
  authorize("admin", "staff"),
  upload.single("photo"),
  validateUploadedFile,
  uploadPhoto
);

// View profile photo
router.get("/:id/photo", protect, getPhoto);

// Upload supporting document
router.post(
  "/:id/documents",
  protect,
  authorize("admin", "staff"),
  upload.single("document"),
  validateUploadedFile,
  uploadDocument
);

// Download private document
router.get(
  "/:id/documents/:documentId",
  protect,
  authorize("admin", "staff"),
  downloadDocument
);

// Remove profile photo
router.delete(
  "/:id/photo",
  protect,
  authorize("admin", "staff"),
  deletePhoto
);

// Delete supporting document
router.delete(
  "/:id/documents/:documentId",
  protect,
  authorize("admin", "staff"),
  deleteDocument
);

export default router;
