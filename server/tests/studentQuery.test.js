
import { beforeEach, describe, expect, it, vi } from "vitest";

const {
  studentFind,
  studentCountDocuments,
  studentFindById,
} = vi.hoisted(() => ({
  studentFind: vi.fn(),
  studentCountDocuments: vi.fn(),
  studentFindById: vi.fn(),
}));

vi.mock("../models/Student.js", () => ({
  default: {
    find: studentFind,
    countDocuments: studentCountDocuments,
    findById: studentFindById,
    schema: {
      path: (field) => ({
        enumValues:
          field === "course"
            ? [
                "MERN Stack Development",
                "Java Full Stack",
                "Data Science",
                "Cloud Computing",
              ]
            : ["Male", "Female", "Other", "Prefer not to say"],
      }),
    },
  },
}));

vi.mock("../models/Course.js", () => ({
  default: {},
}));

vi.mock("../services/enrollmentEmailService.js", () => ({
  sendEnrollmentConfirmation: vi.fn(),
}));

import {
  getStudents,
  getStudentById,
} from "../controllers/studentController.js";

const studentId = "507f1f77bcf86cd799439011";

function createResponse() {
  const res = {
    status: vi.fn(),
    json: vi.fn(),
  };

  res.status.mockReturnValue(res);
  res.json.mockReturnValue(res);

  return res;
}

function mockStudentQuery(students = []) {
  const query = {
    populate: vi.fn(),
    sort: vi.fn(),
    skip: vi.fn(),
    limit: vi.fn(),
    lean: vi.fn(),
  };

  query.populate.mockReturnValue(query);
  query.sort.mockReturnValue(query);
  query.skip.mockReturnValue(query);
  query.limit.mockReturnValue(query);
  query.lean.mockResolvedValue(students);

  studentFind.mockReturnValue(query);

  return query;
}

describe("Student search, filtering and pagination", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    studentCountDocuments.mockResolvedValue(0);
    mockStudentQuery([]);
  });

  it("returns students successfully", async () => {
    const students = [{ fullName: "Rahul Kumar" }];

    mockStudentQuery(students);
    studentCountDocuments.mockResolvedValue(1);

    const req = { query: {} };
    const res = createResponse();
    const next = vi.fn();

    await getStudents(req, res, next);

    expect(studentFind).toHaveBeenCalledWith({});
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        success: true,
        count: 1,
        total: 1,
        currentPage: 1,
        pageSize: 10,
        data: students,
      })
    );
  });

  it("searches students by name and email", async () => {
    const req = {
      query: { search: "rahul" },
    };
    const res = createResponse();
    const next = vi.fn();

    await getStudents(req, res, next);

    expect(studentFind).toHaveBeenCalledWith({
      $or: [
        { fullName: { $regex: "rahul", $options: "i" } },
        { email: { $regex: "rahul", $options: "i" } },
      ],
    });

    expect(res.status).toHaveBeenCalledWith(200);
  });

  it("filters students by course, gender and course ID", async () => {
    const courseId = "507f1f77bcf86cd799439012";

    const req = {
      query: {
        course: "MERN Stack Development",
        gender: "Male",
        courseId,
      },
    };
    const res = createResponse();
    const next = vi.fn();

    await getStudents(req, res, next);

    expect(studentFind).toHaveBeenCalledWith({
      course: "MERN Stack Development",
      gender: "Male",
      courseId,
    });

    expect(res.status).toHaveBeenCalledWith(200);
  });

  it("supports sorting by student name in ascending order", async () => {
    const query = mockStudentQuery([]);

    const req = {
      query: {
        sortBy: "name",
        order: "asc",
      },
    };
    const res = createResponse();
    const next = vi.fn();

    await getStudents(req, res, next);

    expect(query.sort).toHaveBeenCalledWith({
      fullName: 1,
      _id: 1,
    });
  });

  it("supports pagination with page 2 and limit 25", async () => {
    const query = mockStudentQuery([]);

    const req = {
      query: {
        page: "2",
        limit: "25",
      },
    };
    const res = createResponse();
    const next = vi.fn();

    await getStudents(req, res, next);

    expect(query.skip).toHaveBeenCalledWith(25);
    expect(query.limit).toHaveBeenCalledWith(25);
  });

  it("rejects an invalid page number", async () => {
    const req = {
      query: { page: "0" },
    };
    const res = createResponse();
    const next = vi.fn();

    await getStudents(req, res, next);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(studentFind).not.toHaveBeenCalled();
  });

  it("rejects an unsupported page limit", async () => {
    const req = {
      query: { limit: "100" },
    };
    const res = createResponse();
    const next = vi.fn();

    await getStudents(req, res, next);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(studentFind).not.toHaveBeenCalled();
  });

  it("rejects an invalid course filter", async () => {
    const req = {
      query: { course: "Invalid Course" },
    };
    const res = createResponse();
    const next = vi.fn();

    await getStudents(req, res, next);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(studentFind).not.toHaveBeenCalled();
  });

  it("rejects an invalid gender filter", async () => {
    const req = {
      query: { gender: "Unknown" },
    };
    const res = createResponse();
    const next = vi.fn();

    await getStudents(req, res, next);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(studentFind).not.toHaveBeenCalled();
  });

  it("rejects an invalid course ID filter", async () => {
    const req = {
      query: { courseId: "invalid-id" },
    };
    const res = createResponse();
    const next = vi.fn();

    await getStudents(req, res, next);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(studentFind).not.toHaveBeenCalled();
  });
});

describe("Get student by ID", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("rejects an invalid student ID", async () => {
    const req = {
      params: { id: "invalid-id" },
    };
    const res = createResponse();
    const next = vi.fn();

    await getStudentById(req, res, next);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(studentFindById).not.toHaveBeenCalled();
  });

  it("returns 404 when the student does not exist", async () => {
    const populate = vi.fn().mockResolvedValue(null);

    studentFindById.mockReturnValue({ populate });

    const req = {
      params: { id: studentId },
    };
    const res = createResponse();
    const next = vi.fn();

    await getStudentById(req, res, next);

    expect(studentFindById).toHaveBeenCalledWith(studentId);
    expect(res.status).toHaveBeenCalledWith(404);
  });

  it("returns student details successfully", async () => {
    const student = {
      _id: studentId,
      fullName: "Rahul Kumar",
    };

    const populate = vi.fn().mockResolvedValue(student);

    studentFindById.mockReturnValue({ populate });

    const req = {
      params: { id: studentId },
    };
    const res = createResponse();
    const next = vi.fn();

    await getStudentById(req, res, next);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      success: true,
      data: student,
    });
  });
});
