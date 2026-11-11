
import { beforeEach, describe, expect, it, vi } from "vitest";

const { findInstructor, createCourse } = vi.hoisted(() => ({
  findInstructor: vi.fn(),
  createCourse: vi.fn(),
}));

vi.mock("../models/Instructor.js", () => ({
  default: { findById: findInstructor },
}));

vi.mock("../models/Course.js", () => ({
  default: { create: createCourse },
}));

vi.mock("../models/Student.js", () => ({
  default: {},
}));

import { createCourse as createCourseController } from "../controllers/courseController.js";

const validInstructorId = "507f1f77bcf86cd799439011";

const validCourse = {
  courseName: "MERN Stack Development",
  courseCode: "MERN101",
  duration: "6 months",
  fee: 25000,
  instructor: validInstructorId,
};

function createResponse() {
  const res = {
    status: vi.fn(),
    json: vi.fn(),
  };

  res.status.mockReturnValue(res);
  res.json.mockReturnValue(res);

  return res;
}

describe("Course controller - createCourse", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    findInstructor.mockResolvedValue({ _id: validInstructorId });
    createCourse.mockResolvedValue({
      _id: "507f191e810c19729de860ea",
      ...validCourse,
    });
  });

  it("creates a course with valid data", async () => {
    const req = { body: { ...validCourse } };
    const res = createResponse();

    await createCourseController(req, res);

    expect(findInstructor).toHaveBeenCalledWith(validInstructorId);
    expect(createCourse).toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        success: true,
        message: "Course created successfully.",
      })
    );
  });

  it("rejects missing required fields", async () => {
    const req = { body: { courseName: "MERN" } };
    const res = createResponse();

    await createCourseController(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(createCourse).not.toHaveBeenCalled();
  });

  it("rejects an invalid instructor ID", async () => {
    const req = {
      body: { ...validCourse, instructor: "invalid-id" },
    };
    const res = createResponse();

    await createCourseController(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(findInstructor).not.toHaveBeenCalled();
  });

  it("rejects a negative course fee", async () => {
    const req = {
      body: { ...validCourse, fee: -100 },
    };
    const res = createResponse();

    await createCourseController(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(createCourse).not.toHaveBeenCalled();
  });

  it("rejects a non-numeric course fee", async () => {
    const req = {
      body: { ...validCourse, fee: "25000" },
    };
    const res = createResponse();

    await createCourseController(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(createCourse).not.toHaveBeenCalled();
  });

  it("rejects an invalid course status", async () => {
    const req = {
      body: { ...validCourse, status: "Pending" },
    };
    const res = createResponse();

    await createCourseController(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(createCourse).not.toHaveBeenCalled();
  });

  it("rejects a course when the instructor does not exist", async () => {
    findInstructor.mockResolvedValue(null);

    const req = { body: { ...validCourse } };
    const res = createResponse();

    await createCourseController(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(createCourse).not.toHaveBeenCalled();
  });
});
