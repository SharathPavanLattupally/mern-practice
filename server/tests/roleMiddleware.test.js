
import { describe, it, expect, vi } from "vitest";
import { authorize } from "../middleware/roleMiddleware.js";

describe("Role-Based Access Control Tests", () => {
  function createResponse() {
    const res = {};

    res.status = vi.fn().mockReturnValue(res);
    res.json = vi.fn().mockReturnValue(res);

    return res;
  }

  it("should allow admin access", () => {
    const req = {
      user: { id: "admin123", role: "admin" },
    };

    const res = createResponse();
    const next = vi.fn();

    authorize("admin", "staff")(req, res, next);

    expect(next).toHaveBeenCalledOnce();
    expect(res.status).not.toHaveBeenCalled();
  });

  it("should allow staff access", () => {
    const req = {
      user: { id: "staff123", role: "staff" },
    };

    const res = createResponse();
    const next = vi.fn();

    authorize("admin", "staff")(req, res, next);

    expect(next).toHaveBeenCalledOnce();
    expect(res.status).not.toHaveBeenCalled();
  });

  it("should reject viewer access to restricted operations", () => {
    const req = {
      user: { id: "viewer123", role: "viewer" },
    };

    const res = createResponse();
    const next = vi.fn();

    authorize("admin", "staff")(req, res, next);

    expect(next).not.toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(403);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      message: "You do not have permission to perform this action.",
    });
  });

  it("should reject requests without an authenticated user", () => {
    const req = {};
    const res = createResponse();
    const next = vi.fn();

    authorize("admin")(req, res, next);

    expect(next).not.toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      message: "Authentication required.",
    });
  });
});
