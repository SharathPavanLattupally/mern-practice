
import { describe, it, expect } from "vitest";
import User from "../models/User.js";

describe("User Model Validation", () => {
  const validUser = {
    username: "sharath123",
    email: "sharath@example.com",
    password: "password123",
    role: "viewer",
  };

  it("should accept valid user data", async () => {
    const user = new User(validUser);

    await expect(user.validate()).resolves.toBeUndefined();
  });

  it("should reject username shorter than 3 characters", async () => {
    const user = new User({
      ...validUser,
      username: "ab",
    });

    await expect(user.validate()).rejects.toThrow();
  });

  it("should reject invalid username characters", async () => {
    const user = new User({
      ...validUser,
      username: "sharath@123",
    });

    await expect(user.validate()).rejects.toThrow();
  });

  it("should reject invalid email", async () => {
    const user = new User({
      ...validUser,
      email: "invalid-email",
    });

    await expect(user.validate()).rejects.toThrow();
  });

  it("should reject password shorter than 8 characters", async () => {
    const user = new User({
      ...validUser,
      password: "12345",
    });

    await expect(user.validate()).rejects.toThrow();
  });

  it("should reject an invalid role", async () => {
    const user = new User({
      ...validUser,
      role: "superuser",
    });

    await expect(user.validate()).rejects.toThrow();
  });

  it("should use viewer as the default role", () => {
    const user = new User({
      username: "sharath123",
      email: "sharath@example.com",
      password: "password123",
    });

    expect(user.role).toBe("viewer");
  });
});
