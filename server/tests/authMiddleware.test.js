
import { beforeEach, describe, expect, it, vi } from "vitest";

const { jwtVerify, findById, selectUser } = vi.hoisted(() => ({
  jwtVerify: vi.fn(),
  findById: vi.fn(),
  selectUser: vi.fn(),
}));

vi.mock("jsonwebtoken", () => ({
  default: {
    verify: jwtVerify,
  },
}));

vi.mock("../models/User.js", () => ({
  default: {
    findById,
  },
}));

import { protect } from "../middleware/authMiddleware.js";

const userId = "507f1f77bcf86cd799439011";

function createResponse() {
  const res = {
    status: vi.fn(),
    json: vi.fn(),
  };

  res.status.mockReturnValue(res);
  res.json.mockReturnValue(res);

  return res;
}

describe("JWT authentication middleware", () => {
  beforeEach(() => {
    vi.clearAllMocks();

    jwtVerify.mockReturnValue({
      id: userId,
      tokenVersion: 0,
    });

    findById.mockReturnValue({
      select: selectUser,
    });

    selectUser.mockResolvedValue({
      _id: userId,
      role: "admin",
      tokenVersion: 0,
    });
  });

  it("rejects a request without an authorization header", async () => {
    const req = { headers: {} };
    const res = createResponse();
    const next = vi.fn();

    await protect(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(jwtVerify).not.toHaveBeenCalled();
    expect(next).not.toHaveBeenCalled();
  });

  it("rejects an authorization header without Bearer", async () => {
    const req = {
      headers: {
        authorization: "Basic invalid-token",
      },
    };

    const res = createResponse();
    const next = vi.fn();

    await protect(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(jwtVerify).not.toHaveBeenCalled();
  });

  it("rejects an invalid JWT token", async () => {
    const error = new Error("Invalid token");
    error.name = "JsonWebTokenError";

    jwtVerify.mockImplementation(() => {
      throw error;
    });

    const req = {
      headers: {
        authorization: "Bearer invalid-token",
      },
    };

    const res = createResponse();
    const next = vi.fn();

    await protect(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(next).not.toHaveBeenCalled();
  });

  it("rejects an expired JWT token", async () => {
    const error = new Error("Token expired");
    error.name = "TokenExpiredError";

    jwtVerify.mockImplementation(() => {
      throw error;
    });

    const req = {
      headers: {
        authorization: "Bearer expired-token",
      },
    };

    const res = createResponse();
    const next = vi.fn();

    await protect(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(next).not.toHaveBeenCalled();
  });

  it("rejects a token when the user no longer exists", async () => {
    selectUser.mockResolvedValue(null);

    const req = {
      headers: {
        authorization: "Bearer valid-token",
      },
    };

    const res = createResponse();
    const next = vi.fn();

    await protect(req, res, next);

    expect(findById).toHaveBeenCalledWith(userId);
    expect(res.status).toHaveBeenCalledWith(401);
    expect(next).not.toHaveBeenCalled();
  });

  it("rejects a revoked token when token versions do not match", async () => {
    jwtVerify.mockReturnValue({
      id: userId,
      tokenVersion: 1,
    });

    selectUser.mockResolvedValue({
      _id: userId,
      role: "admin",
      tokenVersion: 2,
    });

    const req = {
      headers: {
        authorization: "Bearer revoked-token",
      },
    };

    const res = createResponse();
    const next = vi.fn();

    await protect(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(next).not.toHaveBeenCalled();
  });

  it("authenticates a valid user and attaches user details to request", async () => {
    const req = {
      headers: {
        authorization: "Bearer valid-token",
      },
    };

    const res = createResponse();
    const next = vi.fn();

    await protect(req, res, next);

    expect(jwtVerify).toHaveBeenCalledWith(
    "valid-token",
    process.env.JWT_SECRET,
    {
        algorithms: ["HS256"],
    }
);

    expect(req.user).toEqual({
      id: userId,
      role: "admin",
    });

    expect(next).toHaveBeenCalledOnce();
    expect(res.status).not.toHaveBeenCalled();
  });

  it("returns 500 when an unexpected database error occurs", async () => {
    selectUser.mockRejectedValue(
      new Error("Database connection failed")
    );

    const consoleSpy = vi
      .spyOn(console, "error")
      .mockImplementation(() => {});

    const req = {
      headers: {
        authorization: "Bearer valid-token",
      },
    };

    const res = createResponse();
    const next = vi.fn();

    await protect(req, res, next);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(next).not.toHaveBeenCalled();

    consoleSpy.mockRestore();
  });
});
