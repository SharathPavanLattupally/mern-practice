
const express = require("express");
const router = express.Router();

const {
  upload,
  validateUploadedFile,
} = require("../middleware/uploadMiddleware");

const { protect } = require("../middleware/authMiddleware");
const { authorize } = require("../middleware/roleMiddleware");

const {
  uploadPhoto,
  uploadDocument,
  deletePhoto,
  downloadDocument,
  deleteDocument,
  getPhoto,
} = require("../controllers/fileController");

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
router.get(
  "/:id/photo",
  protect,
  getPhoto
);

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

module.exports = router;
