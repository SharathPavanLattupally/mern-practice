
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

const { sendMail, enrollmentEmailTemplate } = vi.hoisted(() => ({
  sendMail: vi.fn(),
  enrollmentEmailTemplate: vi.fn(),
}));

vi.mock("../config/email.js", () => ({
  default: { sendMail },
}));

vi.mock("../templates/enrollmentEmailTemplate.js", () => ({
  enrollmentEmailTemplate,
}));

import { sendEnrollmentConfirmation } from "../services/enrollmentEmailService.js";

describe("Enrollment Email Service", () => {
  const originalEnv = { ...process.env };

  beforeEach(() => {
    vi.clearAllMocks();

    process.env.EMAIL_FROM = "noreply@example.com";
    process.env.EMAIL_FROM_NAME = "Student Management System";

    sendMail.mockResolvedValue({
      messageId: "test-message-id",
    });

    enrollmentEmailTemplate.mockReturnValue("<h1>Welcome</h1>");
  });

  afterEach(() => {
    process.env = { ...originalEnv };
  });

  it("should send enrollment confirmation to the student", async () => {
    const student = {
      fullName: "Test Student",
      email: "student@example.com",
    };

    await sendEnrollmentConfirmation(student);

    expect(sendMail).toHaveBeenCalledWith(
      expect.objectContaining({
        to: "student@example.com",
        subject: "Student Enrollment Confirmation",
        html: "<h1>Welcome</h1>",
      })
    );
  });

  it("should use EMAIL_FROM as sender address", async () => {
    await sendEnrollmentConfirmation({
      email: "student@example.com",
    });

    expect(sendMail).toHaveBeenCalledWith(
      expect.objectContaining({
        from: {
          name: "Student Management System",
          address: "noreply@example.com",
        },
      })
    );
  });

  it("should use SMTP_USER when EMAIL_FROM is unavailable", async () => {
    delete process.env.EMAIL_FROM;
    process.env.SMTP_USER = "smtp@example.com";

    await sendEnrollmentConfirmation({
      email: "student@example.com",
    });

    expect(sendMail).toHaveBeenCalledWith(
      expect.objectContaining({
        from: expect.objectContaining({
          address: "smtp@example.com",
        }),
      })
    );
  });

  it("should reject when sender email is not configured", async () => {
    delete process.env.EMAIL_FROM;
    delete process.env.SMTP_USER;
    delete process.env.EMAIL_USER;

    await expect(
      sendEnrollmentConfirmation({
        email: "student@example.com",
      })
    ).rejects.toThrow("Email sender address is not configured.");

    expect(sendMail).not.toHaveBeenCalled();
  });

  it("should propagate email transport failures", async () => {
    sendMail.mockRejectedValueOnce(new Error("SMTP unavailable"));

    await expect(
      sendEnrollmentConfirmation({
        email: "student@example.com",
      })
    ).rejects.toThrow("SMTP unavailable");
  });
});
