
import { beforeEach, describe, expect, it, vi } from "vitest";

const {
  findById,
  findByIdAndUpdate,
  countDocuments,
} = vi.hoisted(() => ({
  findById: vi.fn(),
  findByIdAndUpdate: vi.fn(),
  countDocuments: vi.fn(),
}));

vi.mock("../models/Instructor.js", () => ({
  default: {
    findById,
    findByIdAndUpdate,
  },
}));

vi.mock("../models/Course.js", () => ({
  default: { countDocuments },
}));

import {
  updateInstructor,
  deleteInstructor,
} from "../controllers/instructorController.js";

const instructorId = "507f1f77bcf86cd799439011";

function createResponse() {
  const res = {
    status: vi.fn(),
    json: vi.fn(),
  };

  res.status.mockReturnValue(res);
  res.json.mockReturnValue(res);

  return res;
}

describe("Instructor update and delete tests", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("rejects an invalid instructor ID during update", async () => {
    const req = {
      params: { id: "invalid-id" },
      body: { fullName: "Updated Name" },
    };
    const res = createResponse();

    await updateInstructor(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(findByIdAndUpdate).not.toHaveBeenCalled();
  });

  it("rejects an empty update request", async () => {
    const req = {
      params: { id: instructorId },
      body: {},
    };
    const res = createResponse();

    await updateInstructor(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(findByIdAndUpdate).not.toHaveBeenCalled();
  });

  it("rejects an invalid email during update", async () => {
    const req = {
      params: { id: instructorId },
      body: { email: "invalid-email" },
    };
    const res = createResponse();

    await updateInstructor(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(findByIdAndUpdate).not.toHaveBeenCalled();
  });

  it("returns 404 when the instructor does not exist during update", async () => {
    findByIdAndUpdate.mockResolvedValue(null);

    const req = {
      params: { id: instructorId },
      body: { fullName: "Updated Name" },
    };
    const res = createResponse();

    await updateInstructor(req, res);

    expect(res.status).toHaveBeenCalledWith(404);
  });

  it("updates instructor details successfully", async () => {
    findByIdAndUpdate.mockResolvedValue({
      _id: instructorId,
      fullName: "Updated Name",
      email: "updated@example.com",
    });

    const req = {
      params: { id: instructorId },
      body: { fullName: "Updated Name" },
    };
    const res = createResponse();

    await updateInstructor(req, res);

    expect(findByIdAndUpdate).toHaveBeenCalledWith(
      instructorId,
      { $set: { fullName: "Updated Name" } },
      { new: true, runValidators: true }
    );
    expect(res.status).toHaveBeenCalledWith(200);
  });

  it("rejects deleting an instructor with an invalid ID", async () => {
    const req = { params: { id: "bad-id" } };
    const res = createResponse();

    await deleteInstructor(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(findById).not.toHaveBeenCalled();
  });

  it("returns 404 when the instructor does not exist", async () => {
    findById.mockResolvedValue(null);

    const req = { params: { id: instructorId } };
    const res = createResponse();

    await deleteInstructor(req, res);

    expect(res.status).toHaveBeenCalledWith(404);
  });

  it("prevents deletion when courses are assigned", async () => {
    findById.mockResolvedValue({ _id: instructorId });
    countDocuments.mockResolvedValue(2);

    const req = { params: { id: instructorId } };
    const res = createResponse();

    await deleteInstructor(req, res);

    expect(countDocuments).toHaveBeenCalledWith({
      instructor: instructorId,
    });
    expect(res.status).toHaveBeenCalledWith(409);
  });

  it("deletes an instructor when no courses are assigned", async () => {
    const deleteOne = vi.fn().mockResolvedValue({});

    findById.mockResolvedValue({
      _id: instructorId,
      deleteOne,
    });
    countDocuments.mockResolvedValue(0);

    const req = { params: { id: instructorId } };
    const res = createResponse();

    await deleteInstructor(req, res);

    expect(deleteOne).toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(200);
  });
});
