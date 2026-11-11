
import { describe, it, expect, beforeEach, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import StudentRegistration from "../StudentRegistration";
import { studentApi } from "../../api/studentApi";
import { apiRequest } from "../../services/api";

vi.mock("../../api/studentApi", () => ({
    studentApi: {
        create: vi.fn(),
    },
}));

vi.mock("../../services/api", () => ({
    apiRequest: vi.fn(),
}));

const mockCourses = [
    {
        _id: "course123",
        courseName: "Data Science",
        courseCode: "DS101",
        status: "Active",
    },
];

function renderRegistration() {
    return render(<StudentRegistration />);
}

async function fillValidForm(user) {
    await user.type(screen.getByLabelText(/Full Name/), "Sharath Pavan");
    await user.type(screen.getByLabelText(/Email Address/), "sharath@example.com");
    await user.type(screen.getByLabelText(/Mobile Number/), "9876543210");

    await user.selectOptions(
        screen.getByLabelText(/Gender/),
        "Male"
    );

    await user.selectOptions(
        screen.getByLabelText(/Course/),
        "course123"
    );

    await user.type(
        screen.getByLabelText("Address *"),
        "Hyderabad Telangana"
    );
}

describe("Student Registration Component", () => {

    beforeEach(() => {
        vi.clearAllMocks();

        apiRequest.mockResolvedValue({
            data: mockCourses,
        });
    });

    it("renders the student registration form", async () => {
        renderRegistration();

        expect(
            screen.getByRole("heading", {
                name: "Student Registration",
            })
        ).toBeInTheDocument();

        expect(
            screen.getByRole("button", {
                name: "Register Student",
            })
        ).toBeInTheDocument();

        expect(
            await screen.findByRole("option", {
                name: /Data Science/,
            })
        ).toBeInTheDocument();
    });

    it("displays required-field validation errors", async () => {
        const user = userEvent.setup();

        renderRegistration();

        await user.click(
            screen.getByRole("button", {
                name: "Register Student",
            })
        );

        expect(
            await screen.findByText("Full name is required.")
        ).toBeInTheDocument();

        expect(
            screen.getByText("Email address is required.")
        ).toBeInTheDocument();

        expect(
            screen.getByText("Mobile number is required.")
        ).toBeInTheDocument();

        expect(
            screen.getByText("Please select your gender.")
        ).toBeInTheDocument();

        expect(
            screen.getByText("Please select an available course.")
        ).toBeInTheDocument();

        expect(
            screen.getByText("Address is required.")
        ).toBeInTheDocument();

        expect(studentApi.create).not.toHaveBeenCalled();
    });

    it("rejects an invalid email address", async () => {
        const user = userEvent.setup();

        renderRegistration();

        await screen.findByRole("option", {
            name: /Data Science/,
        });

        await fillValidForm(user);

        const emailInput = screen.getByLabelText(/Email Address/);

        await user.clear(emailInput);
        await user.type(emailInput, "invalid-email");

        await user.click(
            screen.getByRole("button", {
                name: "Register Student",
            })
        );

        expect(
            await screen.findByText("Enter a valid email address.")
        ).toBeInTheDocument();

        expect(studentApi.create).not.toHaveBeenCalled();
    });

    it("rejects an invalid Indian mobile number", async () => {
        const user = userEvent.setup();

        renderRegistration();

        await screen.findByRole("option", {
            name: /Data Science/,
        });

        await fillValidForm(user);

        const mobileInput = screen.getByLabelText(/Mobile Number/);

        await user.clear(mobileInput);
        await user.type(mobileInput, "12345");

        await user.click(
            screen.getByRole("button", {
                name: "Register Student",
            })
        );

        expect(
            await screen.findByText(
                "Enter a valid 10-digit Indian mobile number."
            )
        ).toBeInTheDocument();

        expect(studentApi.create).not.toHaveBeenCalled();
    });

    it("successfully registers a student", async () => {
        const user = userEvent.setup();

        studentApi.create.mockResolvedValue({
            message: "Student registered successfully!",
        });

        renderRegistration();

        await screen.findByRole("option", {
            name: /Data Science/,
        });

        await fillValidForm(user);

        await user.click(
            screen.getByRole("button", {
                name: "Register Student",
            })
        );

        expect(
            await screen.findByRole("status")
        ).toHaveTextContent("Student registered successfully!");

        expect(studentApi.create).toHaveBeenCalledWith({
            fullName: "Sharath Pavan",
            email: "sharath@example.com",
            mobile: "9876543210",
            gender: "Male",
            course: "Data Science",
            courseId: "course123",
            address: "Hyderabad Telangana",
        });

        expect(
            screen.getByLabelText(/Full Name/)
        ).toHaveValue("");
    });

    it("displays an API error when registration fails", async () => {
        const user = userEvent.setup();

        studentApi.create.mockRejectedValue(
            new Error("Email already exists.")
        );

        renderRegistration();

        await screen.findByRole("option", {
            name: /Data Science/,
        });

        await fillValidForm(user);

        await user.click(
            screen.getByRole("button", {
                name: "Register Student",
            })
        );

        expect(
            await screen.findByRole("alert")
        ).toHaveTextContent("Email already exists.");
    });

    it("displays a message when no active courses are available", async () => {
        apiRequest.mockResolvedValue({
            data: [],
        });

        renderRegistration();

        expect(
            await screen.findByText(
                "No active courses are currently available."
            )
        ).toBeInTheDocument();

        expect(
            screen.getByRole("button", {
                name: "Register Student",
            })
        ).toBeDisabled();
    });

});
