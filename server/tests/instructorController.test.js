
import { beforeEach, describe, expect, it, vi } from "vitest";

const { createInstructor } = vi.hoisted(() => ({
  createInstructor: vi.fn(),
}));

vi.mock("../models/Instructor.js", () => ({
  default: { create: createInstructor },
}));

vi.mock("../models/Course.js", () => ({
  default: {},
}));

import {
  createInstructor as createInstructorController,
} from "../controllers/instructorController.js";

const validInstructor = {
  fullName: "John Smith",
  email: "john@example.com",
  specialization: "MERN Stack",
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

describe("Instructor controller - createInstructor", () => {
  beforeEach(() => {
    vi.clearAllMocks();

    createInstructor.mockResolvedValue({
      _id: "507f191e810c19729de860ea",
      ...validInstructor,
    });
  });

  it("creates an instructor with valid data", async () => {
    const req = { body: { ...validInstructor } };
    const res = createResponse();

    await createInstructorController(req, res);

    expect(createInstructor).toHaveBeenCalledWith(validInstructor);
    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        success: true,
        message: "Instructor created successfully.",
      })
    );
  });

  it("rejects a missing instructor name", async () => {
    const req = {
      body: { ...validInstructor, fullName: "" },
    };
    const res = createResponse();

    await createInstructorController(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(createInstructor).not.toHaveBeenCalled();
  });

  it("rejects an invalid email address", async () => {
    const req = {
      body: { ...validInstructor, email: "not-an-email" },
    };
    const res = createResponse();

    await createInstructorController(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(createInstructor).not.toHaveBeenCalled();
  });

  it("rejects a missing specialization", async () => {
    const req = {
      body: { ...validInstructor, specialization: " " },
    };
    const res = createResponse();

    await createInstructorController(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(createInstructor).not.toHaveBeenCalled();
  });

  it("trims the name and normalizes the email to lowercase", async () => {
    const req = {
      body: {
        fullName: "  John Smith  ",
        email: "  JOHN@EXAMPLE.COM  ",
        specialization: "  MERN Stack  ",
      },
    };
    const res = createResponse();

    await createInstructorController(req, res);

    expect(createInstructor).toHaveBeenCalledWith({
      fullName: "John Smith",
      email: "john@example.com",
      specialization: "MERN Stack",
    });
    expect(res.status).toHaveBeenCalledWith(201);
  });
});
