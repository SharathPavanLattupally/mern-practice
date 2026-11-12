
import { describe, it, expect } from "vitest";
import request from "supertest";
import app from "../app.js";

const trustedOrigin = "http://localhost:5173";
const untrustedOrigin = "https://malicious.example";

describe("Express API Tests", () => {
  it("should return API running message", async () => {
    const response = await request(app).get("/");

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.message).toBe(
      "Student Management System API is running"
    );
  });

  it("should return 404 for an unknown endpoint", async () => {
    const response = await request(app).get("/api/unknown");

    expect(response.status).toBe(404);
    expect(response.body.success).toBe(false);
  });

  it("should reject malformed JSON", async () => {
    const response = await request(app)
      .post("/api/students")
      .set("Authorization", "Bearer invalid-token")
      .set("Content-Type", "application/json")
      .send('{"fullName":');

    expect(response.status).toBe(400);
  });

  it("should allow a trusted Origin through CSRF middleware", async () => {
    const response = await request(app)
      .post("/api/students")
      .set("Origin", trustedOrigin)
      .set("Authorization", "Bearer invalid-token")
      .send({});

    // CSRF middleware allows the request.
    // Authentication rejects the invalid token.
    expect(response.status).toBe(401);
  });

  it("should reject an untrusted Origin", async () => {
    const response = await request(app)
      .post("/api/students")
      .set("Origin", untrustedOrigin)
      .send({});

    expect(response.status).toBe(403);
    expect(response.body.message).toBe(
      "Request origin is not allowed."
    );
  });

  it("should reject a missing Origin when refresh cookie exists", async () => {
    const response = await request(app)
      .post("/api/students")
      .set("Cookie", "refreshToken=test-refresh-token")
      .send({});

    expect(response.status).toBe(403);
    expect(response.body.message).toBe(
      "Request origin is required."
    );
  });

  it("should allow a missing Origin without refresh cookie through CSRF middleware", async () => {
    const response = await request(app)
      .post("/api/students")
      .set("Authorization", "Bearer invalid-token")
      .send({});

    // No Origin and no refresh cookie: CSRF middleware passes.
    // Authentication rejects the invalid token.
    expect(response.status).toBe(401);
  });

  it("should skip CSRF Origin validation for safe GET requests", async () => {
    const response = await request(app)
      .get("/api/students")
      .set("Origin", untrustedOrigin);

    // GET is safe, so CSRF middleware skips Origin validation.
    expect(response.status).toBe(401);
  });
});
