
import { beforeEach, describe, expect, it, vi } from "vitest";

const {
  findByIdAndUpdate,
  findByIdAndDelete,
  courseFindById,
} = vi.hoisted(() => ({
  findByIdAndUpdate: vi.fn(),
  findByIdAndDelete: vi.fn(),
  courseFindById: vi.fn(),
}));

vi.mock("../models/Student.js", () => ({
  default: {
    findByIdAndUpdate,
    findByIdAndDelete,
  },
}));

vi.mock("../models/Course.js", () => ({
  default: {
    findById: courseFindById,
  },
}));

vi.mock("../services/enrollmentEmailService.js", () => ({
  sendEnrollmentConfirmation: vi.fn(),
}));

import {
  updateStudent,
  deleteStudent,
} from "../controllers/studentController.js";

const studentId = "507f1f77bcf86cd799439011";
const courseId = "507f1f77bcf86cd799439012";

function createResponse() {
  const res = {
    status: vi.fn(),
    json: vi.fn(),
  };

  res.status.mockReturnValue(res);
  res.json.mockReturnValue(res);

  return res;
}

describe("Student update and delete tests", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("rejects an invalid student ID during update", async () => {
    const req = {
      params: { id: "invalid-id" },
      body: { fullName: "Updated Name" },
    };
    const res = createResponse();
    const next = vi.fn();

    await updateStudent(req, res, next);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(findByIdAndUpdate).not.toHaveBeenCalled();
  });

  it("rejects an empty update request", async () => {
    const req = {
      params: { id: studentId },
      body: {},
    };
    const res = createResponse();
    const next = vi.fn();

    await updateStudent(req, res, next);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(findByIdAndUpdate).not.toHaveBeenCalled();
  });

  it("updates student details successfully", async () => {
    const updatedStudent = {
      _id: studentId,
      fullName: "Updated Student",
    };

    const populate = vi.fn().mockResolvedValue(updatedStudent);

    findByIdAndUpdate.mockReturnValue({ populate });

    const req = {
      params: { id: studentId },
      body: { fullName: "Updated Student" },
    };
    const res = createResponse();
    const next = vi.fn();

    await updateStudent(req, res, next);

    expect(findByIdAndUpdate).toHaveBeenCalledWith(
      studentId,
      { $set: { fullName: "Updated Student" } },
      {
        new: true,
        runValidators: true,
        context: "query",
      }
    );

    expect(res.status).toHaveBeenCalledWith(200);
  });

  it("returns 404 when the student does not exist during update", async () => {
    const populate = vi.fn().mockResolvedValue(null);
    findByIdAndUpdate.mockReturnValue({ populate });

    const req = {
      params: { id: studentId },
      body: { fullName: "Updated Student" },
    };
    const res = createResponse();
    const next = vi.fn();

    await updateStudent(req, res, next);

    expect(res.status).toHaveBeenCalledWith(404);
  });

  it("rejects an invalid course reference during update", async () => {
    const req = {
      params: { id: studentId },
      body: { courseId: "invalid-id" },
    };
    const res = createResponse();
    const next = vi.fn();

    await updateStudent(req, res, next);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(findByIdAndUpdate).not.toHaveBeenCalled();
  });

  it("rejects an inactive course during update", async () => {
    courseFindById.mockResolvedValue({
      _id: courseId,
      status: "Inactive",
    });

    const req = {
      params: { id: studentId },
      body: { courseId },
    };
    const res = createResponse();
    const next = vi.fn();

    await updateStudent(req, res, next);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(findByIdAndUpdate).not.toHaveBeenCalled();
  });

  it("returns conflict when the updated email already exists", async () => {
    findByIdAndUpdate.mockReturnValue({
      populate: vi.fn().mockRejectedValue({ code: 11000 }),
    });

    const req = {
      params: { id: studentId },
      body: { email: "existing@example.com" },
    };
    const res = createResponse();
    const next = vi.fn();

    await updateStudent(req, res, next);

    expect(res.status).toHaveBeenCalledWith(409);
  });

  it("deletes a student successfully", async () => {
    findByIdAndDelete.mockResolvedValue({
      _id: studentId,
      fullName: "Rahul Kumar",
    });

    const req = { params: { id: studentId } };
    const res = createResponse();
    const next = vi.fn();

    await deleteStudent(req, res, next);

    expect(findByIdAndDelete).toHaveBeenCalledWith(studentId);
    expect(res.status).toHaveBeenCalledWith(200);
  });

  it("rejects an invalid student ID during deletion", async () => {
    const req = { params: { id: "bad-id" } };
    const res = createResponse();
    const next = vi.fn();

    await deleteStudent(req, res, next);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(findByIdAndDelete).not.toHaveBeenCalled();
  });

  it("returns 404 when the student to delete does not exist", async () => {
    findByIdAndDelete.mockResolvedValue(null);

    const req = { params: { id: studentId } };
    const res = createResponse();
    const next = vi.fn();

    await deleteStudent(req, res, next);

    expect(res.status).toHaveBeenCalledWith(404);
  });
});
