
import { describe, it, expect } from "vitest";
import request from "supertest";
import app from "../app.js";

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
});
