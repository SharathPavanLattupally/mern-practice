
import { beforeEach, describe, expect, it, vi } from "vitest";

const {
  findById,
  findByIdAndUpdate,
  findOne,
  hashPassword,
  comparePassword,
  sendEmail,
} = vi.hoisted(() => ({
  findById: vi.fn(),
  findByIdAndUpdate: vi.fn(),
  findOne: vi.fn(),
  hashPassword: vi.fn(),
  comparePassword: vi.fn(),
  sendEmail: vi.fn(),
}));

vi.mock("../models/User.js", () => ({
  default: {
    findById,
    findByIdAndUpdate,
    findOne,
  },
}));

vi.mock("bcryptjs", () => ({
  default: {
    hash: hashPassword,
    compare: comparePassword,
  },
}));

vi.mock("../config/email.js", () => ({
  sendEmail,
}));

import {
  getProfile,
  updateProfile,
  changePassword,
  forgotPassword,
  resetPassword,
  updateUserRole,
} from "../controllers/authController.js";

const userId = "507f1f77bcf86cd799439011";

function createResponse() {
  const res = {
    status: vi.fn(),
    json: vi.fn(),
  };

  res.status.mockReturnValue(res);
  res.json.mockReturnValue(res);

  return res;
}

describe("Authentication - profile management", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("retrieves the user profile successfully", async () => {
    const user = {
      _id: userId,
      username: "testuser",
      email: "test@example.com",
      role: "admin",
    };

    findById.mockResolvedValue(user);

    const req = { user: { id: userId } };
    const res = createResponse();

    await getProfile(req, res);

    expect(findById).toHaveBeenCalledWith(userId);
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        success: true,
        data: expect.objectContaining({
          username: "testuser",
          email: "test@example.com",
          role: "admin",
        }),
      })
    );
  });

  it("returns 404 when the profile user does not exist", async () => {
    findById.mockResolvedValue(null);

    const req = { user: { id: userId } };
    const res = createResponse();

    await getProfile(req, res);

    expect(res.status).toHaveBeenCalledWith(404);
  });

  it("updates the user profile successfully", async () => {
    const updatedUser = {
      _id: userId,
      username: "updateduser",
      email: "updated@example.com",
    };

    const select = vi.fn().mockResolvedValue(updatedUser);

    findByIdAndUpdate.mockReturnValue({ select });

    const req = {
      user: { id: userId },
      body: {
        username: "updateduser",
        email: "UPDATED@EXAMPLE.COM",
      },
    };

    const res = createResponse();

    await updateProfile(req, res);

    expect(findByIdAndUpdate).toHaveBeenCalledWith(
      userId,
      {
        $set: {
          username: "updateduser",
          email: "updated@example.com",
        },
      },
      {
        new: true,
        runValidators: true,
      }
    );

    expect(res.status).toHaveBeenCalledWith(200);
  });

  it("returns 404 when the profile user cannot be updated", async () => {
    const select = vi.fn().mockResolvedValue(null);

    findByIdAndUpdate.mockReturnValue({ select });

    const req = {
      user: { id: userId },
      body: { username: "updateduser" },
    };

    const res = createResponse();

    await updateProfile(req, res);

    expect(res.status).toHaveBeenCalledWith(404);
  });
});

describe("Authentication - change password", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    hashPassword.mockResolvedValue("new-hashed-password");
  });

  it("changes the password successfully", async () => {
    const user = {
      password: "old-hashed-password",
      save: vi.fn().mockResolvedValue(true),
    };

    const select = vi.fn().mockResolvedValue(user);

    findById.mockReturnValue({ select });

    comparePassword
      .mockResolvedValueOnce(true)
      .mockResolvedValueOnce(false);

    const req = {
      user: { id: userId },
      body: {
        currentPassword: "OldPassword123",
        newPassword: "NewPassword123",
      },
    };

    const res = createResponse();

    await changePassword(req, res);

    expect(comparePassword).toHaveBeenCalledTimes(2);
    expect(hashPassword).toHaveBeenCalledWith(
      "NewPassword123",
      12
    );
    expect(user.save).toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(200);
  });

  it("rejects an incorrect current password", async () => {
    const user = {
      password: "old-hashed-password",
      save: vi.fn(),
    };

    const select = vi.fn().mockResolvedValue(user);

    findById.mockReturnValue({ select });
    comparePassword.mockResolvedValue(false);

    const req = {
      user: { id: userId },
      body: {
        currentPassword: "WrongPassword",
        newPassword: "NewPassword123",
      },
    };

    const res = createResponse();

    await changePassword(req, res);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(user.save).not.toHaveBeenCalled();
  });

  it("rejects a new password shorter than 8 characters", async () => {
    const req = {
      user: { id: userId },
      body: {
        currentPassword: "OldPassword123",
        newPassword: "123",
      },
    };

    const res = createResponse();

    await changePassword(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(findById).not.toHaveBeenCalled();
  });
});

describe("Authentication - forgot password", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    sendEmail.mockResolvedValue(true);
  });

  it("returns a generic response when the email is not registered", async () => {
    findOne.mockResolvedValue(null);

    const req = {
      body: { email: "unknown@example.com" },
    };

    const res = createResponse();

    await forgotPassword(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      success: true,
      message: "If an account exists, a password reset link will be sent.",
    });

    expect(sendEmail).not.toHaveBeenCalled();
  });

  it("sends a password reset email for an existing user", async () => {
    const user = {
      email: "test@example.com",
      username: "testuser",
      save: vi.fn().mockResolvedValue(true),
    };

    findOne.mockResolvedValue(user);

    const req = {
      body: { email: "TEST@EXAMPLE.COM" },
    };

    const res = createResponse();

    await forgotPassword(req, res);

    expect(findOne).toHaveBeenCalledWith({
      email: "test@example.com",
    });

    expect(user.resetPasswordTokenHash).toEqual(
      expect.any(String)
    );

    expect(user.resetPasswordExpires).toBeTruthy();
    expect(user.save).toHaveBeenCalled();
    expect(sendEmail).toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(200);
  });

  it("clears the reset token if the reset email fails", async () => {
    const user = {
      email: "test@example.com",
      username: "testuser",
      save: vi.fn().mockResolvedValue(true),
    };

    findOne.mockResolvedValue(user);
    sendEmail.mockRejectedValue(new Error("SMTP failure"));

    const req = {
      body: { email: "test@example.com" },
    };

    const res = createResponse();

    await forgotPassword(req, res);

    expect(user.resetPasswordTokenHash).toBeNull();
    expect(user.resetPasswordExpires).toBeNull();
    expect(user.save).toHaveBeenCalledTimes(2);
    expect(res.status).toHaveBeenCalledWith(503);
  });
});

describe("Authentication - reset password", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    hashPassword.mockResolvedValue("reset-hashed-password");
  });

  it("rejects a password reset token that does not exist", async () => {
    const select = vi.fn().mockResolvedValue(null);

    findOne.mockReturnValue({ select });

    const req = {
      params: { token: "sample-reset-token" },
      body: { newPassword: "NewPassword123" },
    };

    const res = createResponse();

    await resetPassword(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
  });

  it("resets the password and clears the reset token", async () => {
    const user = {
      password: "old-password",
      resetPasswordTokenHash: "stored-hash",
      resetPasswordExpires: Date.now() + 60000,
      save: vi.fn().mockResolvedValue(true),
    };

    const select = vi.fn().mockResolvedValue(user);

    findOne.mockReturnValue({ select });

    const req = {
      params: { token: "sample-reset-token" },
      body: { newPassword: "NewPassword123" },
    };

    const res = createResponse();

    await resetPassword(req, res);

    expect(findOne).toHaveBeenCalledWith(
      expect.objectContaining({
        resetPasswordTokenHash: expect.any(String),
        resetPasswordExpires: expect.objectContaining({
          $gt: expect.any(Number),
        }),
      })
    );

    expect(hashPassword).toHaveBeenCalledWith(
      "NewPassword123",
      12
    );

    expect(user.resetPasswordTokenHash).toBeNull();
    expect(user.resetPasswordExpires).toBeNull();
    expect(user.save).toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(200);
  });
});

describe("Authentication - admin role management", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("rejects an invalid role", async () => {
    const req = {
      params: { id: userId },
      body: { role: "superadmin" },
    };

    const res = createResponse();

    await updateUserRole(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(findByIdAndUpdate).not.toHaveBeenCalled();
  });

  it("updates a user's role successfully", async () => {
    const updatedUser = {
      _id: userId,
      username: "testuser",
      role: "staff",
    };

    const select = vi.fn().mockResolvedValue(updatedUser);

    findByIdAndUpdate.mockReturnValue({ select });

    const req = {
      params: { id: userId },
      body: { role: "staff" },
    };

    const res = createResponse();

    await updateUserRole(req, res);

    expect(findByIdAndUpdate).toHaveBeenCalledWith(
      userId,
      { $set: { role: "staff" } },
      { new: true, runValidators: true }
    );

    expect(res.status).toHaveBeenCalledWith(200);
  });

  it("returns 404 when the user to update does not exist", async () => {
    const select = vi.fn().mockResolvedValue(null);

    findByIdAndUpdate.mockReturnValue({ select });

    const req = {
      params: { id: userId },
      body: { role: "viewer" },
    };

    const res = createResponse();

    await updateUserRole(req, res);

    expect(res.status).toHaveBeenCalledWith(404);
  });
});
