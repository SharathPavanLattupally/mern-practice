
import { beforeEach, describe, expect, it, vi } from "vitest";
import express from "express";
import request from "supertest";

const {
  jwtVerify,
  findById,
  selectUser,
  registerUser,
  loginUser,
  getProfile,
  updateProfile,
  changePassword,
  forgotPassword,
  resetPassword,
  updateUserRole,
  logoutUser,
} = vi.hoisted(() => ({
  jwtVerify: vi.fn(),
  findById: vi.fn(),
  selectUser: vi.fn(),

  registerUser: vi.fn(),
  loginUser: vi.fn(),
  getProfile: vi.fn(),
  updateProfile: vi.fn(),
  changePassword: vi.fn(),
  forgotPassword: vi.fn(),
  resetPassword: vi.fn(),
  updateUserRole: vi.fn(),
  logoutUser: vi.fn(),
}));

vi.mock("jsonwebtoken", () => ({
  default: {
    verify: jwtVerify,
  },
}));

vi.mock("../models/User.js", () => ({
  default: {
    findById,
  },
}));

vi.mock("../controllers/authController.js", () => ({
  registerUser,
  loginUser,
  getProfile,
  updateProfile,
  changePassword,
  forgotPassword,
  resetPassword,
  updateUserRole,
  logoutUser,
}));

import authRoutes from "../routes/authRoutes.js";

const userId = "507f1f77bcf86cd799439011";

const app = express();

app.use(express.json());
app.use("/api/auth", authRoutes);

function configureControllerMocks() {
  const handlers = [
    registerUser,
    loginUser,
    getProfile,
    updateProfile,
    changePassword,
    forgotPassword,
    resetPassword,
    updateUserRole,
    logoutUser,
  ];

  handlers.forEach((handler) => {
    handler.mockImplementation((req, res) => {
      return res.status(200).json({
        success: true,
        message: "Route controller executed successfully.",
      });
    });
  });
}

describe("Authentication routes and RBAC", () => {
  beforeEach(() => {
    vi.clearAllMocks();

    configureControllerMocks();

    jwtVerify.mockReturnValue({
      id: userId,
      tokenVersion: 0,
    });

    findById.mockReturnValue({
      select: selectUser,
    });

    selectUser.mockResolvedValue({
      _id: userId,
      role: "admin",
      tokenVersion: 0,
    });
  });

  it("allows public user registration without a token", async () => {
    const response = await request(app)
      .post("/api/auth/register")
      .send({
        username: "testuser",
        email: "test@example.com",
        password: "Password123",
      });

    expect(response.status).toBe(200);
    expect(registerUser).toHaveBeenCalledOnce();
    expect(jwtVerify).not.toHaveBeenCalled();
  });

  it("allows public login without a token", async () => {
    const response = await request(app)
      .post("/api/auth/login")
      .send({
        email: "test@example.com",
        password: "Password123",
      });

    expect(response.status).toBe(200);
    expect(loginUser).toHaveBeenCalledOnce();
    expect(jwtVerify).not.toHaveBeenCalled();
  });

  it("blocks profile access without authentication", async () => {
    const response = await request(app)
      .get("/api/auth/profile");

    expect(response.status).toBe(401);
    expect(getProfile).not.toHaveBeenCalled();
  });

  it("allows an authenticated user to access their profile", async () => {
    const response = await request(app)
      .get("/api/auth/profile")
      .set("Authorization", "Bearer valid-token");

    expect(response.status).toBe(200);
    expect(getProfile).toHaveBeenCalledOnce();
  });

  it("blocks a viewer from updating user roles", async () => {
    selectUser.mockResolvedValue({
      _id: userId,
      role: "viewer",
      tokenVersion: 0,
    });

    const response = await request(app)
      .patch(`/api/auth/users/${userId}/role`)
      .set("Authorization", "Bearer viewer-token")
      .send({ role: "staff" });

    expect(response.status).toBe(403);
    expect(updateUserRole).not.toHaveBeenCalled();
  });

  it("blocks a staff user from updating user roles", async () => {
    selectUser.mockResolvedValue({
      _id: userId,
      role: "staff",
      tokenVersion: 0,
    });

    const response = await request(app)
      .patch(`/api/auth/users/${userId}/role`)
      .set("Authorization", "Bearer staff-token")
      .send({ role: "viewer" });

    expect(response.status).toBe(403);
    expect(updateUserRole).not.toHaveBeenCalled();
  });

  it("allows an admin to update user roles", async () => {
    selectUser.mockResolvedValue({
      _id: userId,
      role: "admin",
      tokenVersion: 0,
    });

    const response = await request(app)
      .patch(`/api/auth/users/${userId}/role`)
      .set("Authorization", "Bearer admin-token")
      .send({ role: "staff" });

    expect(response.status).toBe(200);
    expect(updateUserRole).toHaveBeenCalledOnce();
  });

  it("blocks role updates when the JWT is invalid", async () => {
    jwtVerify.mockImplementation(() => {
      const error = new Error("Invalid token");
      error.name = "JsonWebTokenError";
      throw error;
    });

    const response = await request(app)
      .patch(`/api/auth/users/${userId}/role`)
      .set("Authorization", "Bearer invalid-token")
      .send({ role: "staff" });

    expect(response.status).toBe(401);
    expect(updateUserRole).not.toHaveBeenCalled();
  });

  it("allows an authenticated user to log out", async () => {
    const response = await request(app)
      .post("/api/auth/logout")
      .set("Authorization", "Bearer valid-token");

    expect(response.status).toBe(200);
    expect(logoutUser).toHaveBeenCalledOnce();
  });
});
