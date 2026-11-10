
import Student from "../models/Student.js";
import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const uploadRoot = path.resolve(__dirname, "../uploads");

// Upload or replace profile photo
export const uploadPhoto = async (req, res) => {
  let newFile;

  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "Please select a photo.",
      });
    }

    newFile = req.file;

    const student = await Student.findById(req.params.id);

    if (!student) {
      await fs.unlink(newFile.path).catch(() => {});
      return res.status(404).json({
        success: false,
        message: "Student not found.",
      });
    }

    const oldPath = student.profilePhoto?.path;

    student.profilePhoto = {
      filename: newFile.filename,
      path: `photos/${newFile.filename}`,
      mimetype: newFile.mimetype,
      size: newFile.size,
    };

    await student.save();

    if (oldPath) {
      await fs.unlink(path.join(uploadRoot, oldPath)).catch(() => {});
    }

    res.json({
      success: true,
      message: "Profile photo uploaded successfully.",
      data: student.profilePhoto,
    });
  } catch (error) {
    if (newFile) {
      await fs.unlink(newFile.path).catch(() => {});
    }

    res.status(500).json({
      success: false,
      message: "Photo upload failed.",
    });
  }
};

// Upload supporting document
export const uploadDocument = async (req, res) => {
  let newFile;

  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "Please select a document.",
      });
    }

    newFile = req.file;

    const student = await Student.findById(req.params.id);

    if (!student) {
      await fs.unlink(newFile.path).catch(() => {});
      return res.status(404).json({
        success: false,
        message: "Student not found.",
      });
    }

    const document = {
      filename: newFile.filename,
      originalName: path.basename(newFile.originalname),
      path: `documents/${newFile.filename}`,
      mimetype: newFile.mimetype,
      size: newFile.size,
      uploadedAt: new Date(),
    };

    student.documents.push(document);
    await student.save();

    res.status(201).json({
      success: true,
      message: "Document uploaded successfully.",
      data: document,
    });
  } catch (error) {
    if (newFile) {
      await fs.unlink(newFile.path).catch(() => {});
    }

    res.status(500).json({
      success: false,
      message: "Document upload failed.",
    });
  }
};

// Remove profile photo
export const deletePhoto = async (req, res) => {
  try {
    const student = await Student.findById(req.params.id);

    if (!student) {
      return res.status(404).json({
        success: false,
        message: "Student not found.",
      });
    }

    const oldPath = student.profilePhoto?.path;

    if (!oldPath) {
      return res.status(404).json({
        success: false,
        message: "No profile photo found.",
      });
    }

    student.profilePhoto = undefined;
    await student.save();

    await fs.unlink(path.join(uploadRoot, oldPath)).catch(() => {});

    res.json({
      success: true,
      message: "Profile photo removed successfully.",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to remove profile photo.",
    });
  }
};

// Download private document
export const downloadDocument = async (req, res) => {
  try {
    const student = await Student.findById(req.params.id);

    if (!student) {
      return res.status(404).json({
        success: false,
        message: "Student not found.",
      });
    }

    const document = student.documents.id(req.params.documentId);

    if (!document) {
      return res.status(404).json({
        success: false,
        message: "Document not found.",
      });
    }

    const filePath = path.resolve(uploadRoot, document.path);

    if (!filePath.startsWith(uploadRoot + path.sep)) {
      return res.status(400).json({
        success: false,
        message: "Invalid file path.",
      });
    }

    res.download(filePath, document.originalName, (error) => {
      if (error && !res.headersSent) {
        res.status(404).json({
          success: false,
          message: "Document file not found.",
        });
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Document download failed.",
    });
  }
};

// Delete supporting document
export const deleteDocument = async (req, res) => {
  try {
    const student = await Student.findById(req.params.id);

    if (!student) {
      return res.status(404).json({
        success: false,
        message: "Student not found.",
      });
    }

    const document = student.documents.id(req.params.documentId);

    if (!document) {
      return res.status(404).json({
        success: false,
        message: "Document not found.",
      });
    }

    const oldPath = document.path;

    document.deleteOne();
    await student.save();

    await fs.unlink(path.join(uploadRoot, oldPath)).catch(() => {});

    res.json({
      success: true,
      message: "Document deleted successfully.",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Document deletion failed.",
    });
  }
};

// View student profile photo securely
export const getPhoto = async (req, res) => {
  try {
    const student = await Student.findById(req.params.id);

    if (!student || !student.profilePhoto?.path) {
      return res.status(404).json({
        success: false,
        message: "Profile photo not found.",
      });
    }

    const filePath = path.resolve(uploadRoot, student.profilePhoto.path);

    if (!filePath.startsWith(uploadRoot + path.sep)) {
      return res.status(400).json({
        success: false,
        message: "Invalid file path.",
      });
    }

    res.setHeader("X-Content-Type-Options", "nosniff");
    res.setHeader("Content-Type", student.profilePhoto.mimetype);
    res.setHeader("Cache-Control", "private, no-store");

    res.sendFile(filePath, (error) => {
      if (error && !res.headersSent) {
        res.status(404).json({
          success: false,
          message: "Photo file not found.",
        });
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Unable to retrieve profile photo.",
    });
  }
};
