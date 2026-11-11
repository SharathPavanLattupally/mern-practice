
import { describe, it, expect } from "vitest";
import request from "supertest";
import app from "../app.js";

process.env.JWT_SECRET = "test_jwt_secret_for_automated_testing";

describe("Authentication Middleware Tests", () => {
  it("should reject requests without an access token", async () => {
    const response = await request(app).get("/api/students");

    expect(response.status).toBe(401);
    expect(response.body.success).toBe(false);
    expect(response.body.message).toBe(
      "Authentication required."
    );
  });

  it("should reject an invalid access token", async () => {
    const response = await request(app)
      .get("/api/students")
      .set("Authorization", "Bearer invalid-token");

    expect(response.status).toBe(401);
    expect(response.body.success).toBe(false);
    expect(response.body.message).toBe(
      "Invalid or expired authentication token."
    );
  });

  it("should reject an incorrectly formatted authorization header", async () => {
    const response = await request(app)
      .get("/api/students")
      .set("Authorization", "InvalidFormat token");

    expect(response.status).toBe(401);
    expect(response.body.message).toBe(
      "Authentication required."
    );
  });
});
