
import { describe, it, expect } from "vitest";
import Student from "../models/Student.js";

describe("Student Model Validation", () => {
  const validStudent = {
    fullName: "Sharath Pavan",
    email: "sharath@example.com",
    mobile: "9876543210",
    gender: "Male",
    course: "Data Science",
    address: "Hyderabad Telangana",
  };

  it("should accept valid student data", async () => {
    const student = new Student(validStudent);

    await expect(student.validate()).resolves.toBeUndefined();
  });

  it("should reject missing full name", async () => {
    const student = new Student({
      ...validStudent,
      fullName: "",
    });

    await expect(student.validate()).rejects.toThrow();
  });

  it("should reject invalid email", async () => {
    const student = new Student({
      ...validStudent,
      email: "invalid-email",
    });

    await expect(student.validate()).rejects.toThrow();
  });

  it("should reject invalid mobile number", async () => {
    const student = new Student({
      ...validStudent,
      mobile: "12345",
    });

    await expect(student.validate()).rejects.toThrow();
  });

  it("should reject invalid gender", async () => {
    const student = new Student({
      ...validStudent,
      gender: "Unknown",
    });

    await expect(student.validate()).rejects.toThrow();
  });

  it("should reject invalid course", async () => {
    const student = new Student({
      ...validStudent,
      course: "Artificial Intelligence",
    });

    await expect(student.validate()).rejects.toThrow();
  });
});
