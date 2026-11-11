
import { describe, it, expect, vi, beforeEach } from "vitest";

const {
  create,
  findById,
  sendEnrollmentConfirmation,
} = vi.hoisted(() => ({
  create: vi.fn(),
  findById: vi.fn(),
  sendEnrollmentConfirmation: vi.fn(),
}));

vi.mock("../models/Student.js", () => ({
  default: { create, findById },
}));

vi.mock("../models/Course.js", () => ({
  default: { findById: vi.fn() },
}));

vi.mock("../services/enrollmentEmailService.js", () => ({
  sendEnrollmentConfirmation,
}));

import { createStudent } from "../controllers/studentController.js";

const makeResponse = () => {
  const res = {};
  res.status = vi.fn().mockReturnValue(res);
  res.json = vi.fn().mockReturnValue(res);
  return res;
};

const studentData = {
  fullName: "Test Student",
  email: "student@example.com",
  mobile: "9876543210",
  gender: "Male",
  course: "MERN Stack Development",
  address: "Hyderabad Telangana",
};

const populatedStudent = {
  _id: "student123",
  ...studentData,
};

describe("Student Enrollment Email Notification", () => {
  beforeEach(() => {
    vi.clearAllMocks();

    create.mockResolvedValue({ _id: "student123" });

    findById.mockReturnValue({
      populate: vi.fn().mockResolvedValue(populatedStudent),
    });

    sendEnrollmentConfirmation.mockResolvedValue({
      messageId: "test-email-id",
    });
  });

  it("should send confirmation email after successful enrollment", async () => {
    const req = { body: studentData };
    const res = makeResponse();
    const next = vi.fn();

    await createStudent(req, res, next);

    expect(create).toHaveBeenCalledWith(
      expect.objectContaining({
        fullName: studentData.fullName,
        email: studentData.email,
      })
    );

    expect(sendEnrollmentConfirmation).toHaveBeenCalledWith(
      populatedStudent
    );

    expect(res.status).toHaveBeenCalledWith(201);

    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        success: true,
        emailSent: true,
      })
    );

    expect(next).not.toHaveBeenCalled();
  });

  it("should preserve enrollment when email delivery fails", async () => {
    sendEnrollmentConfirmation.mockRejectedValueOnce(
      new Error("SMTP unavailable")
    );

    const errorSpy = vi.spyOn(console, "error").mockImplementation(() => {});
    const logSpy = vi.spyOn(console, "log").mockImplementation(() => {});

    const req = { body: studentData };
    const res = makeResponse();
    const next = vi.fn();

    try {
      await createStudent(req, res, next);

      expect(create).toHaveBeenCalledTimes(1);
      expect(sendEnrollmentConfirmation).toHaveBeenCalledTimes(1);

      expect(res.status).toHaveBeenCalledWith(201);

      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: true,
          emailSent: false,
        })
      );

      expect(next).not.toHaveBeenCalled();
    } finally {
      errorSpy.mockRestore();
      logSpy.mockRestore();
    }
  });
});
