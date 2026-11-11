
import { beforeEach, describe, expect, it, vi } from "vitest";

const {
  findById,
  findByIdAndUpdate,
  countDocuments,
  findInstructor,
} = vi.hoisted(() => ({
  findById: vi.fn(),
  findByIdAndUpdate: vi.fn(),
  countDocuments: vi.fn(),
  findInstructor: vi.fn(),
}));

vi.mock("../models/Course.js", () => ({
  default: {
    findById,
    findByIdAndUpdate,
  },
}));

vi.mock("../models/Instructor.js", () => ({
  default: {
    findById: findInstructor,
  },
}));

vi.mock("../models/Student.js", () => ({
  default: {
    countDocuments,
  },
}));

import {
  updateCourse,
  deleteCourse,
} from "../controllers/courseController.js";

const courseId = "507f1f77bcf86cd799439011";
const instructorId = "507f1f77bcf86cd799439012";

function createResponse() {
  const res = {
    status: vi.fn(),
    json: vi.fn(),
  };

  res.status.mockReturnValue(res);
  res.json.mockReturnValue(res);

  return res;
}

describe("Course update and delete tests", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("rejects an invalid course ID during update", async () => {
    const req = {
      params: { id: "invalid-id" },
      body: { courseName: "Updated Course" },
    };
    const res = createResponse();

    await updateCourse(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(findByIdAndUpdate).not.toHaveBeenCalled();
  });

  it("rejects an empty update request", async () => {
    const req = {
      params: { id: courseId },
      body: {},
    };
    const res = createResponse();

    await updateCourse(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(findByIdAndUpdate).not.toHaveBeenCalled();
  });

  it("rejects a negative fee during update", async () => {
    const req = {
      params: { id: courseId },
      body: { fee: -500 },
    };
    const res = createResponse();

    await updateCourse(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(findByIdAndUpdate).not.toHaveBeenCalled();
  });

  it("returns 404 when the course to update does not exist", async () => {
    const populate = vi.fn().mockResolvedValue(null);
    findByIdAndUpdate.mockReturnValue({ populate });

    const req = {
      params: { id: courseId },
      body: { courseName: "Updated Course" },
    };
    const res = createResponse();

    await updateCourse(req, res);

    expect(res.status).toHaveBeenCalledWith(404);
  });

  it("updates a course successfully", async () => {
    const updatedCourse = {
      _id: courseId,
      courseName: "Updated MERN Course",
    };

    const populate = vi.fn().mockResolvedValue(updatedCourse);
    findByIdAndUpdate.mockReturnValue({ populate });

    const req = {
      params: { id: courseId },
      body: { courseName: "Updated MERN Course" },
    };
    const res = createResponse();

    await updateCourse(req, res);

    expect(findByIdAndUpdate).toHaveBeenCalledWith(
      courseId,
      { $set: { courseName: "Updated MERN Course" } },
      { new: true, runValidators: true }
    );
    expect(res.status).toHaveBeenCalledWith(200);
  });

  it("rejects deleting a course with an invalid ID", async () => {
    const req = { params: { id: "bad-id" } };
    const res = createResponse();

    await deleteCourse(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(findById).not.toHaveBeenCalled();
  });

  it("returns 404 when the course to delete does not exist", async () => {
    findById.mockResolvedValue(null);

    const req = { params: { id: courseId } };
    const res = createResponse();

    await deleteCourse(req, res);

    expect(res.status).toHaveBeenCalledWith(404);
  });

  it("prevents deletion when students are enrolled", async () => {
    findById.mockResolvedValue({ _id: courseId });
    countDocuments.mockResolvedValue(2);

    const req = { params: { id: courseId } };
    const res = createResponse();

    await deleteCourse(req, res);

    expect(countDocuments).toHaveBeenCalledWith({
      courseId,
    });
    expect(res.status).toHaveBeenCalledWith(409);
  });

  it("deletes a course when no students are enrolled", async () => {
    const deleteOne = vi.fn().mockResolvedValue({});

    findById.mockResolvedValue({
      _id: courseId,
      deleteOne,
    });
    countDocuments.mockResolvedValue(0);

    const req = { params: { id: courseId } };
    const res = createResponse();

    await deleteCourse(req, res);

    expect(deleteOne).toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(200);
  });
});
