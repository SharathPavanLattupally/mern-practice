
import { describe, it, expect, vi, beforeEach } from "vitest";

const { findById, unlink } = vi.hoisted(() => ({
  findById: vi.fn(),
  unlink: vi.fn(),
}));

vi.mock("../models/Student.js", () => ({
  default: { findById },
}));

vi.mock("node:fs/promises", () => ({
  default: { unlink },
}));

import {
  uploadPhoto,
  uploadDocument,
  deletePhoto,
  deleteDocument,
  downloadDocument,
  getPhoto,
} from "../controllers/fileController.js";

const makeResponse = () => {
  const res = {};
  res.status = vi.fn().mockReturnValue(res);
  res.json = vi.fn().mockReturnValue(res);
  res.sendFile = vi.fn();
  res.setHeader = vi.fn();
  res.download = vi.fn();
  return res;
};

const makeStudent = () => ({
  profilePhoto: undefined,
  documents: {
    push: vi.fn(),
    id: vi.fn(),
  },
  save: vi.fn().mockResolvedValue(true),
});

describe("File Controller", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    unlink.mockResolvedValue(undefined);
  });

  it("should reject photo upload when no file is selected", async () => {
    const req = { file: undefined, params: { id: "student1" } };
    const res = makeResponse();

    await uploadPhoto(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ success: false })
    );
  });

  it("should return 404 when uploading photo for missing student", async () => {
    const req = {
      file: { path: "photo.jpg" },
      params: { id: "student1" },
    };
    const res = makeResponse();

    findById.mockResolvedValue(null);

    await uploadPhoto(req, res);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(unlink).toHaveBeenCalledWith("photo.jpg");
  });

  it("should upload a photo successfully", async () => {
    const student = makeStudent();
    const req = {
      file: {
        filename: "photo-123.jpg",
        path: "photo.jpg",
        mimetype: "image/jpeg",
        size: 1000,
      },
      params: { id: "student1" },
    };
    const res = makeResponse();

    findById.mockResolvedValue(student);

    await uploadPhoto(req, res);

    expect(student.save).toHaveBeenCalled();
    expect(student.profilePhoto).toMatchObject({
      filename: "photo-123.jpg",
      path: "photos/photo-123.jpg",
      mimetype: "image/jpeg",
      size: 1000,
    });
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ success: true })
    );
  });

  it("should reject document upload when no file is selected", async () => {
    const req = { file: undefined, params: { id: "student1" } };
    const res = makeResponse();

    await uploadDocument(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
  });

  it("should return 404 when uploading document for missing student", async () => {
    const req = {
      file: { path: "document.pdf" },
      params: { id: "student1" },
    };
    const res = makeResponse();

    findById.mockResolvedValue(null);

    await uploadDocument(req, res);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(unlink).toHaveBeenCalledWith("document.pdf");
  });

  it("should upload a document successfully", async () => {
    const student = makeStudent();
    const req = {
      file: {
        filename: "doc-123.pdf",
        originalname: "certificate.pdf",
        path: "document.pdf",
        mimetype: "application/pdf",
        size: 2000,
      },
      params: { id: "student1" },
    };
    const res = makeResponse();

    findById.mockResolvedValue(student);

    await uploadDocument(req, res);

    expect(student.documents.push).toHaveBeenCalledWith(
      expect.objectContaining({
        filename: "doc-123.pdf",
        originalName: "certificate.pdf",
        path: "documents/doc-123.pdf",
      })
    );
    expect(student.save).toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(201);
  });

  it("should return 404 when deleting photo for missing student", async () => {
    const req = { params: { id: "student1" } };
    const res = makeResponse();

    findById.mockResolvedValue(null);

    await deletePhoto(req, res);

    expect(res.status).toHaveBeenCalledWith(404);
  });

  it("should return 404 when student has no photo", async () => {
    const req = { params: { id: "student1" } };
    const res = makeResponse();

    findById.mockResolvedValue(makeStudent());

    await deletePhoto(req, res);

    expect(res.status).toHaveBeenCalledWith(404);
  });

  it("should delete an existing photo", async () => {
    const student = makeStudent();
    student.profilePhoto = { path: "photos/old.jpg" };

    const req = { params: { id: "student1" } };
    const res = makeResponse();

    findById.mockResolvedValue(student);

    await deletePhoto(req, res);

    expect(student.profilePhoto).toBeUndefined();
    expect(student.save).toHaveBeenCalled();
    expect(unlink).toHaveBeenCalled();
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ success: true })
    );
  });

  it("should return 404 when deleting a missing document", async () => {
    const student = makeStudent();
    student.documents.id.mockReturnValue(null);

    const req = {
      params: { id: "student1", documentId: "doc1" },
    };
    const res = makeResponse();

    findById.mockResolvedValue(student);

    await deleteDocument(req, res);

    expect(res.status).toHaveBeenCalledWith(404);
  });

  it("should return 404 when downloading a missing document", async () => {
    const student = makeStudent();
    student.documents.id.mockReturnValue(null);

    const req = {
      params: { id: "student1", documentId: "doc1" },
    };
    const res = makeResponse();

    findById.mockResolvedValue(student);

    await downloadDocument(req, res);

    expect(res.status).toHaveBeenCalledWith(404);
  });

  it("should return 404 when profile photo does not exist", async () => {
    const req = { params: { id: "student1" } };
    const res = makeResponse();

    findById.mockResolvedValue(makeStudent());

    await getPhoto(req, res);

    expect(res.status).toHaveBeenCalledWith(404);
  });
});
