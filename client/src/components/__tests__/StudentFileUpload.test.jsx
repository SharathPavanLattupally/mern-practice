
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";

vi.mock("../../services/api", () => ({
  apiRequest: vi.fn(),
}));

import StudentFileUpload from "../StudentFileUpload.jsx";

describe("Student File Upload Component", () => {
  beforeEach(() => {
    localStorage.clear();

    Object.defineProperty(URL, "createObjectURL", {
      configurable: true,
      value: vi.fn(() => "blob:test-preview"),
    });

    Object.defineProperty(URL, "revokeObjectURL", {
      configurable: true,
      value: vi.fn(),
    });
  });

  it("should display empty photo and document messages", () => {
    render(
      <StudentFileUpload
        studentId="student1"
        student={{ documents: [] }}
      />
    );

    expect(
      screen.getByText("No profile photo uploaded.")
    ).toBeInTheDocument();

    expect(
      screen.getByText("No supporting documents uploaded.")
    ).toBeInTheDocument();
  });

  it("should reject unsupported photo types", () => {
    render(
      <StudentFileUpload
        studentId="student1"
        student={{ documents: [] }}
      />
    );

    const inputs = document.querySelectorAll('input[type="file"]');

    const invalidPhoto = new File(["test"], "photo.gif", {
      type: "image/gif",
    });

    fireEvent.change(inputs[0], {
      target: { files: [invalidPhoto] },
    });

    expect(
      screen.getByText("Select a JPG, PNG or WEBP image.")
    ).toBeInTheDocument();

    expect(
      screen.getByRole("button", { name: "Upload / Replace Photo" })
    ).toBeDisabled();
  });

  it("should reject photos larger than 5 MB", () => {
    render(
      <StudentFileUpload
        studentId="student1"
        student={{ documents: [] }}
      />
    );

    const inputs = document.querySelectorAll('input[type="file"]');

    const largePhoto = new File(
      [new Uint8Array(5 * 1024 * 1024 + 1)],
      "large-photo.jpg",
      { type: "image/jpeg" }
    );

    fireEvent.change(inputs[0], {
      target: { files: [largePhoto] },
    });

    expect(
      screen.getByText("Photo size must be below 5 MB.")
    ).toBeInTheDocument();
  });

  it("should accept a valid photo and show its preview", () => {
    render(
      <StudentFileUpload
        studentId="student1"
        student={{ documents: [] }}
      />
    );

    const inputs = document.querySelectorAll('input[type="file"]');

    const photo = new File(["image-data"], "profile.jpg", {
      type: "image/jpeg",
    });

    fireEvent.change(inputs[0], {
      target: { files: [photo] },
    });

    expect(screen.getByText("Selected photo: profile.jpg")).toBeInTheDocument();

    expect(
      screen.getByRole("button", { name: "Upload / Replace Photo" })
    ).toBeEnabled();
  });

  it("should reject unsupported document types", () => {
    render(
      <StudentFileUpload
        studentId="student1"
        student={{ documents: [] }}
      />
    );

    const inputs = document.querySelectorAll('input[type="file"]');

    const invalidDocument = new File(["data"], "notes.txt", {
      type: "text/plain",
    });

    fireEvent.change(inputs[1], {
      target: { files: [invalidDocument] },
    });

    expect(
      screen.getByText("Select a PDF, JPG or PNG document.")
    ).toBeInTheDocument();

    expect(
      screen.getByRole("button", { name: "Upload Document" })
    ).toBeDisabled();
  });

  it("should accept a valid PDF document", () => {
    render(
      <StudentFileUpload
        studentId="student1"
        student={{ documents: [] }}
      />
    );

    const inputs = document.querySelectorAll('input[type="file"]');

    const documentFile = new File(["pdf-data"], "certificate.pdf", {
      type: "application/pdf",
    });

    fireEvent.change(inputs[1], {
      target: { files: [documentFile] },
    });

    expect(
      screen.getByText("Selected document: certificate.pdf")
    ).toBeInTheDocument();

    expect(
      screen.getByRole("button", { name: "Upload Document" })
    ).toBeEnabled();
  });

  it("should show an error when protected photo loading fails", async () => {
    localStorage.setItem("accessToken", "test-token");

    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: false,
      })
    );

    render(
      <StudentFileUpload
        studentId="student1"
        student={{
          profilePhoto: { filename: "profile.jpg" },
          documents: [],
        }}
      />
    );

    expect(
      await screen.findByText("Unable to load profile photo.")
    ).toBeInTheDocument();

    vi.unstubAllGlobals();
  });
});
