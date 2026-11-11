
import { describe, it, expect } from "vitest";
import mongoose from "mongoose";
import Course from "../models/Course.js";

describe("Course Model Validation", () => {
  const validCourse = {
    courseName: "MERN Stack Development",
    courseCode: "MERN101",
    description: "Full stack development course",
    duration: "6 Months",
    fee: 25000,
    instructor: new mongoose.Types.ObjectId(),
  };

  it("should accept valid course data", async () => {
    const course = new Course(validCourse);

    await expect(course.validate()).resolves.toBeUndefined();
  });

  it("should reject missing course name", async () => {
    const course = new Course({
      ...validCourse,
      courseName: "",
    });

    await expect(course.validate()).rejects.toThrow();
  });

  it("should reject missing course code", async () => {
    const course = new Course({
      ...validCourse,
      courseCode: "",
    });

    await expect(course.validate()).rejects.toThrow();
  });

  it("should convert course code to uppercase", () => {
    const course = new Course({
      ...validCourse,
      courseCode: "mern101",
    });

    expect(course.courseCode).toBe("MERN101");
  });

  it("should reject negative course fee", async () => {
    const course = new Course({
      ...validCourse,
      fee: -1000,
    });

    await expect(course.validate()).rejects.toThrow();
  });

  it("should reject invalid course status", async () => {
    const course = new Course({
      ...validCourse,
      status: "Pending",
    });

    await expect(course.validate()).rejects.toThrow();
  });

  it("should reject missing instructor reference", async () => {
    const course = new Course({
      ...validCourse,
      instructor: undefined,
    });

    await expect(course.validate()).rejects.toThrow();
  });

  it("should default course status to Active", () => {
    const course = new Course(validCourse);

    expect(course.status).toBe("Active");
  });
});
