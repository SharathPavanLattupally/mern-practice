
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import Navbar from "../Navbar";

function renderNavbar(initialRoute = "/") {
    return render(
        <MemoryRouter initialEntries={[initialRoute]}>
            <Navbar />
        </MemoryRouter>
    );
}

describe("Navbar Component", () => {

    it("renders the brand and navigation links", () => {
        renderNavbar();

        expect(screen.getByText("MERN")).toBeInTheDocument();
        expect(screen.getByText("Home")).toBeInTheDocument();
        expect(screen.getByText("Dashboard")).toBeInTheDocument();
        expect(screen.getByText("Students List")).toBeInTheDocument();
        expect(screen.getByText("Courses")).toBeInTheDocument();
        expect(screen.getByText("Instructors")).toBeInTheDocument();
    });

    it("opens the mobile navigation menu", async () => {
        const user = userEvent.setup();

        renderNavbar();

        const menuButton = screen.getByRole("button", {
            name: "Open navigation menu",
        });

        expect(menuButton).toHaveAttribute("aria-expanded", "false");

        await user.click(menuButton);

        expect(
            screen.getByRole("button", {
                name: "Close navigation menu",
            })
        ).toHaveAttribute("aria-expanded", "true");

        expect(
            screen.getByRole("navigation", {
                name: "Main navigation",
            })
        ).toHaveClass("nav-links-open");
    });

    it("closes the mobile menu when a navigation link is clicked", async () => {
        const user = userEvent.setup();

        renderNavbar();

        await user.click(
            screen.getByRole("button", {
                name: "Open navigation menu",
            })
        );

        await user.click(
            screen.getByRole("link", {
                name: "Dashboard",
            })
        );

        expect(
            screen.getByRole("button", {
                name: "Open navigation menu",
            })
        ).toHaveAttribute("aria-expanded", "false");

        expect(
            screen.getByRole("navigation", {
                name: "Main navigation",
            })
        ).not.toHaveClass("nav-links-open");
    });

});
