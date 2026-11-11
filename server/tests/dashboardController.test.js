
import { describe, it, expect, vi, beforeEach } from "vitest";

const {
  studentCount,
  studentFind,
  studentAggregate,
  courseCount,
  courseAggregate,
  instructorCount,
} = vi.hoisted(() => ({
  studentCount: vi.fn(),
  studentFind: vi.fn(),
  studentAggregate: vi.fn(),
  courseCount: vi.fn(),
  courseAggregate: vi.fn(),
  instructorCount: vi.fn(),
}));

vi.mock("../models/Student.js", () => ({
  default: {
    countDocuments: studentCount,
    find: studentFind,
    aggregate: studentAggregate,
    collection: { name: "students" },
  },
}));

vi.mock("../models/Course.js", () => ({
  default: {
    countDocuments: courseCount,
    aggregate: courseAggregate,
  },
}));

vi.mock("../models/Instructor.js", () => ({
  default: {
    countDocuments: instructorCount,
  },
}));

import { getDashboardStats } from "../controllers/dashboardController.js";

const makeResponse = () => {
  const res = {};

  res.status = vi.fn().mockReturnValue(res);
  res.json = vi.fn().mockReturnValue(res);

  return res;
};

const makeQuery = (result) => {
  const query = {};

  query.select = vi.fn().mockReturnValue(query);
  query.populate = vi.fn().mockReturnValue(query);
  query.sort = vi.fn().mockReturnValue(query);
  query.limit = vi.fn().mockReturnValue(query);
  query.lean = vi.fn().mockResolvedValue(result);

  return query;
};

describe("Dashboard Controller", () => {
  beforeEach(() => {
    vi.clearAllMocks();

    studentCount.mockResolvedValue(10);
    courseCount.mockResolvedValue(4);
    instructorCount.mockResolvedValue(3);

    studentFind.mockImplementation(() =>
      makeQuery([{ fullName: "Student One" }])
    );

    courseAggregate.mockResolvedValue([
      {
        courseName: "MERN",
        studentCount: 5,
      },
    ]);

    studentAggregate.mockResolvedValue([
      {
        _id: "MERN Stack Development",
        studentCount: 5,
      },
    ]);
  });

  it("should return dashboard statistics for default period", async () => {
    const req = { query: {} };
    const res = makeResponse();
    const next = vi.fn();

    await getDashboardStats(req, res, next);

    expect(next).not.toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(200);

    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        success: true,
        filters: { period: "7" },
        data: expect.objectContaining({
          summary: {
            totalStudents: 10,
            totalActiveCourses: 4,
            totalInstructors: 3,
          },
        }),
      })
    );
  });

  it("should accept period 7", async () => {
    const req = { query: { period: "7" } };
    const res = makeResponse();

    await getDashboardStats(req, res, vi.fn());

    expect(res.status).toHaveBeenCalledWith(200);
  });

  it("should accept period 30", async () => {
    const req = { query: { period: "30" } };
    const res = makeResponse();

    await getDashboardStats(req, res, vi.fn());

    expect(res.status).toHaveBeenCalledWith(200);
  });

  it("should accept period 90", async () => {
    const req = { query: { period: "90" } };
    const res = makeResponse();

    await getDashboardStats(req, res, vi.fn());

    expect(res.status).toHaveBeenCalledWith(200);
  });

  it("should accept all-time period without date filter", async () => {
    const req = { query: { period: "all" } };
    const res = makeResponse();

    await getDashboardStats(req, res, vi.fn());

    expect(res.status).toHaveBeenCalledWith(200);

    expect(studentFind).toHaveBeenCalledWith({});
  });

  it("should reject invalid period", async () => {
    const req = { query: { period: "365" } };
    const res = makeResponse();

    await getDashboardStats(req, res, vi.fn());

    expect(res.status).toHaveBeenCalledWith(400);

    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        success: false,
        message: "Period must be 7, 30, 90, or all.",
      })
    );

    expect(studentCount).not.toHaveBeenCalled();
  });

  it("should return course distribution and student grouping", async () => {
    const req = { query: { period: "all" } };
    const res = makeResponse();

    await getDashboardStats(req, res, vi.fn());

    expect(courseAggregate).toHaveBeenCalledTimes(1);
    expect(studentAggregate).toHaveBeenCalledTimes(1);

    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          courseDistribution: expect.any(Array),
          studentsByCourse: expect.any(Array),
        }),
      })
    );
  });

  it("should forward database errors to error middleware", async () => {
    const error = new Error("Database unavailable");

    studentCount.mockRejectedValueOnce(error);

    const req = { query: {} };
    const res = makeResponse();
    const next = vi.fn();

    await getDashboardStats(req, res, next);

    expect(next).toHaveBeenCalledWith(error);
    expect(res.status).not.toHaveBeenCalled();
  });
});
