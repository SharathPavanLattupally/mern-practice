
import { describe, it, expect } from "vitest";
import Instructor from "../models/Instructor.js";

describe("Instructor Model Validation", () => {
  const validInstructor = {
    fullName: "Rahul Kumar",
    email: "rahul@example.com",
    specialization: "Full Stack Development",
  };

  it("should accept valid instructor data", async () => {
    const instructor = new Instructor(validInstructor);

    await expect(instructor.validate()).resolves.toBeUndefined();
  });

  it("should reject missing instructor name", async () => {
    const instructor = new Instructor({
      ...validInstructor,
      fullName: "",
    });

    await expect(instructor.validate()).rejects.toThrow();
  });

  it("should reject missing email", async () => {
    const instructor = new Instructor({
      ...validInstructor,
      email: "",
    });

    await expect(instructor.validate()).rejects.toThrow();
  });

  it("should convert email to lowercase", () => {
    const instructor = new Instructor({
      ...validInstructor,
      email: "RAHUL@EXAMPLE.COM",
    });

    expect(instructor.email).toBe("rahul@example.com");
  });

  it("should reject missing specialization", async () => {
    const instructor = new Instructor({
      ...validInstructor,
      specialization: "",
    });

    await expect(instructor.validate()).rejects.toThrow();
  });
});
