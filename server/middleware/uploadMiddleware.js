
import multer from "multer";
import path from "node:path";
import fs from "node:fs";
import fsPromises from "node:fs/promises";
import crypto from "node:crypto";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Create upload directories automatically
const photoDir = path.join(__dirname, "../uploads/photos");
const documentDir = path.join(__dirname, "../uploads/documents");

fs.mkdirSync(photoDir, { recursive: true });
fs.mkdirSync(documentDir, { recursive: true });

// Allowed file types
const photoTypes = ["image/jpeg", "image/png", "image/webp"];
const documentTypes = [
  "application/pdf",
  "image/jpeg",
  "image/png",
];

// Generate safe random filenames
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    if (file.fieldname === "photo") {
      cb(null, photoDir);
    } else if (file.fieldname === "document") {
      cb(null, documentDir);
    } else {
      cb(new Error("Invalid upload field."));
    }
  },

  filename: (req, file, cb) => {
    const extension = path.extname(file.originalname).toLowerCase();
    cb(null, `${crypto.randomUUID()}${extension}`);
  },
});

// Validate file types and extensions
const fileFilter = (req, file, cb) => {
  const extension = path.extname(file.originalname).toLowerCase();

  if (file.fieldname === "photo") {
    const valid =
      [".jpg", ".jpeg", ".png", ".webp"].includes(extension) &&
      photoTypes.includes(file.mimetype);

    if (!valid) {
      return cb(new Error("Only JPG, PNG and WEBP photos are allowed."));
    }
  } else if (file.fieldname === "document") {
    const valid =
      [".pdf", ".jpg", ".jpeg", ".png"].includes(extension) &&
      documentTypes.includes(file.mimetype);

    if (!valid) {
      return cb(new Error("Only PDF, JPG and PNG documents are allowed."));
    }
  } else {
    return cb(new Error("Invalid upload field."));
  }

  cb(null, true);
};

// Upload configuration
const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024,
    files: 1,
  },
});

// Validate actual file content
async function validateUploadedFile(req, res, next) {
  if (!req.file) return next();

  try {
    const { fileTypeFromFile } = await import("file-type");
    const detected = await fileTypeFromFile(req.file.path);

    const allowed = {
      photo: photoTypes,
      document: documentTypes,
    };

    if (
      !detected ||
      !allowed[req.file.fieldname]?.includes(detected.mime)
    ) {
      await fsPromises.unlink(req.file.path).catch(() => {});

      return res.status(400).json({
        success: false,
        message: "Invalid file content. Please upload a genuine supported file.",
      });
    }

    next();
  } catch (error) {
    await fsPromises.unlink(req.file.path).catch(() => {});

    return res.status(400).json({
      success: false,
      message: "Unable to validate uploaded file.",
    });
  }
}

export { upload, validateUploadedFile };
