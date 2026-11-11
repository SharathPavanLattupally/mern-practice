
import { beforeEach, describe, expect, it, vi } from "vitest";

const {
  studentCreate,
  studentFindById,
  courseFindById,
  sendEmail,
} = vi.hoisted(() => ({
  studentCreate: vi.fn(),
  studentFindById: vi.fn(),
  courseFindById: vi.fn(),
  sendEmail: vi.fn(),
}));

vi.mock("../models/Student.js", () => ({
  default: {
    create: studentCreate,
    findById: studentFindById,
  },
}));

vi.mock("../models/Course.js", () => ({
  default: {
    findById: courseFindById,
  },
}));

vi.mock("../services/enrollmentEmailService.js", () => ({
  sendEnrollmentConfirmation: sendEmail,
}));

import { createStudent } from "../controllers/studentController.js";

const validStudent = {
  fullName: "Rahul Kumar",
  email: "rahul@example.com",
  mobile: "9876543210",
  gender: "Male",
  course: "MERN Stack Development",
  address: "Hyderabad Telangana",
};

const studentId = "507f1f77bcf86cd799439011";

function createResponse() {
  const res = {
    status: vi.fn(),
    json: vi.fn(),
  };

  res.status.mockReturnValue(res);
  res.json.mockReturnValue(res);

  return res;
}

function mockStudentCreation() {
  const populatedStudent = {
    _id: studentId,
    ...validStudent,
  };

  studentCreate.mockResolvedValue({ _id: studentId });

  studentFindById.mockReturnValue({
    populate: vi.fn().mockResolvedValue(populatedStudent),
  });

  sendEmail.mockResolvedValue(true);
}

describe("Student controller - createStudent", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockStudentCreation();
  });

  it("creates a student successfully", async () => {
    const req = { body: { ...validStudent } };
    const res = createResponse();
    const next = vi.fn();

    await createStudent(req, res, next);

    expect(studentCreate).toHaveBeenCalledWith({
      ...validStudent,
      courseId: null,
    });

    expect(sendEmail).toHaveBeenCalled();

    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        success: true,
        message: "Student created successfully.",
        emailSent: true,
      })
    );

    expect(next).not.toHaveBeenCalled();
  });

  it("rejects an invalid course ID", async () => {
    const req = {
      body: {
        ...validStudent,
        courseId: "invalid-id",
      },
    };

    const res = createResponse();
    const next = vi.fn();

    await createStudent(req, res, next);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(studentCreate).not.toHaveBeenCalled();
    expect(next).not.toHaveBeenCalled();
  });

  it("rejects an inactive course", async () => {
    const courseId = "507f1f77bcf86cd799439012";

    courseFindById.mockResolvedValue({
      _id: courseId,
      status: "Inactive",
    });

    const req = {
      body: {
        ...validStudent,
        courseId,
      },
    };

    const res = createResponse();
    const next = vi.fn();

    await createStudent(req, res, next);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(studentCreate).not.toHaveBeenCalled();
  });

  it("returns conflict when student email already exists", async () => {
    studentCreate.mockRejectedValue({
      code: 11000,
    });

    const req = { body: { ...validStudent } };
    const res = createResponse();
    const next = vi.fn();

    await createStudent(req, res, next);

    expect(res.status).toHaveBeenCalledWith(409);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        success: false,
        message: "A student with this email already exists.",
      })
    );
  });

  it("keeps student registration successful when email delivery fails", async () => {
    sendEmail.mockRejectedValue(new Error("SMTP connection failed"));

    const req = { body: { ...validStudent } };
    const res = createResponse();
    const next = vi.fn();

    await createStudent(req, res, next);

    expect(studentCreate).toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        success: true,
        emailSent: false,
      })
    );

    expect(next).not.toHaveBeenCalled();
  });
});
