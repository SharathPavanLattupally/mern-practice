
import { beforeEach, describe, expect, it, vi } from "vitest";

const {
  findOne,
  createUser,
  hashPassword,
  comparePassword,
  signToken,
} = vi.hoisted(() => ({
  findOne: vi.fn(),
  createUser: vi.fn(),
  hashPassword: vi.fn(),
  comparePassword: vi.fn(),
  signToken: vi.fn(),
}));

vi.mock("../models/User.js", () => ({
  default: {
    findOne,
    create: createUser,
  },
}));

vi.mock("bcryptjs", () => ({
  default: {
    hash: hashPassword,
    compare: comparePassword,
  },
}));

vi.mock("jsonwebtoken", () => ({
  default: {
    sign: signToken,
  },
}));

vi.mock("../config/email.js", () => ({
  sendEmail: vi.fn(),
}));

import {
  registerUser,
  loginUser,
} from "../controllers/authController.js";

const validUser = {
  username: "testuser",
  email: "test@example.com",
  password: "Password123",
};

function createResponse() {
  const res = {
    status: vi.fn(),
    json: vi.fn(),
    cookie: vi.fn(),
  };

  res.status.mockReturnValue(res);
  res.json.mockReturnValue(res);
  res.cookie.mockReturnValue(res);

  return res;
}

describe("Authentication controller - registration", () => {
  beforeEach(() => {
    vi.clearAllMocks();

    hashPassword.mockResolvedValue("hashed-password");

    findOne.mockResolvedValue(null);

    createUser.mockResolvedValue({
      _id: "507f1f77bcf86cd799439011",
      username: validUser.username,
      email: validUser.email,
      createdAt: new Date("2026-01-01"),
    });
  });

  it("registers a user successfully", async () => {
    const req = { body: { ...validUser } };
    const res = createResponse();

    await registerUser(req, res);

    expect(findOne).toHaveBeenCalledWith({
      $or: [
        { username: "testuser" },
        { email: "test@example.com" },
      ],
    });

    expect(hashPassword).toHaveBeenCalledWith(
      "Password123",
      12
    );

    expect(createUser).toHaveBeenCalledWith({
      username: "testuser",
      email: "test@example.com",
      password: "hashed-password",
    });

    expect(res.status).toHaveBeenCalledWith(201);
  });

  it("rejects missing registration fields", async () => {
    const req = {
      body: {
        username: "",
        email: "",
        password: "",
      },
    };

    const res = createResponse();

    await registerUser(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(createUser).not.toHaveBeenCalled();
  });

  it("rejects an invalid username", async () => {
    const req = {
      body: {
        ...validUser,
        username: "ab",
      },
    };

    const res = createResponse();

    await registerUser(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(findOne).not.toHaveBeenCalled();
  });

  it("rejects an invalid email", async () => {
    const req = {
      body: {
        ...validUser,
        email: "invalid-email",
      },
    };

    const res = createResponse();

    await registerUser(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(createUser).not.toHaveBeenCalled();
  });

  it("rejects a password shorter than 8 characters", async () => {
    const req = {
      body: {
        ...validUser,
        password: "123",
      },
    };

    const res = createResponse();

    await registerUser(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(createUser).not.toHaveBeenCalled();
  });

  it("rejects an already registered username or email", async () => {
    findOne.mockResolvedValue({
      username: "testuser",
      email: "test@example.com",
    });

    const req = { body: { ...validUser } };
    const res = createResponse();

    await registerUser(req, res);

    expect(res.status).toHaveBeenCalledWith(409);
    expect(createUser).not.toHaveBeenCalled();
  });
});

describe("Authentication controller - login", () => {
  beforeEach(() => {
    vi.clearAllMocks();

    process.env.JWT_SECRET = "test-secret-key";

    comparePassword.mockResolvedValue(true);
    signToken.mockReturnValue("mock-access-token");
  });

  it("logs in successfully with valid credentials", async () => {
    const user = {
      _id: "507f1f77bcf86cd799439011",
      username: "testuser",
      email: "test@example.com",
      password: "hashed-password",
      role: "admin",
      tokenVersion: 0,
      save: vi.fn().mockResolvedValue(true),
    };

    findOne.mockReturnValue({
      select: vi.fn().mockResolvedValue(user),
    });

    const req = {
      body: {
        email: "TEST@EXAMPLE.COM",
        password: "Password123",
      },
    };

    const res = createResponse();

    await loginUser(req, res);

    expect(findOne).toHaveBeenCalledWith({
      email: "test@example.com",
    });

    expect(comparePassword).toHaveBeenCalledWith(
      "Password123",
      "hashed-password"
    );

    expect(signToken).toHaveBeenCalled();

    expect(user.save).toHaveBeenCalled();

    expect(res.cookie).toHaveBeenCalledWith(
      "refreshToken",
      expect.any(String),
      expect.objectContaining({
        httpOnly: true,
        path: "/api/auth",
      })
    );

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        success: true,
        message: "Login successful.",
        accessToken: "mock-access-token",
        expiresIn: "15m",
      })
    );
  });

  it("rejects missing login credentials", async () => {
    const req = {
      body: {
        email: "",
        password: "",
      },
    };

    const res = createResponse();

    await loginUser(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(findOne).not.toHaveBeenCalled();
  });

  it("rejects a user who does not exist", async () => {
    findOne.mockReturnValue({
      select: vi.fn().mockResolvedValue(null),
    });

    const req = {
      body: {
        email: "unknown@example.com",
        password: "Password123",
      },
    };

    const res = createResponse();

    await loginUser(req, res);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.cookie).not.toHaveBeenCalled();
  });

  it("rejects an incorrect password", async () => {
    const user = {
      _id: "507f1f77bcf86cd799439011",
      email: "test@example.com",
      password: "hashed-password",
    };

    findOne.mockReturnValue({
      select: vi.fn().mockResolvedValue(user),
    });

    comparePassword.mockResolvedValue(false);

    const req = {
      body: {
        email: "test@example.com",
        password: "WrongPassword",
      },
    };

    const res = createResponse();

    await loginUser(req, res);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.cookie).not.toHaveBeenCalled();
    expect(signToken).not.toHaveBeenCalled();
  });
});
