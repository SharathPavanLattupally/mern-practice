
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor, fireEvent } from "@testing-library/react";

const { getStats } = vi.hoisted(() => ({
  getStats: vi.fn(),
}));

vi.mock("../../api/studentApi.js", () => ({
  dashboardApi: { getStats },
}));

vi.mock("recharts", () => {
  const Wrapper = ({ children }) => <div>{children}</div>;

  return {
    ResponsiveContainer: Wrapper,
    BarChart: Wrapper,
    Bar: Wrapper,
    XAxis: () => null,
    YAxis: () => null,
    CartesianGrid: () => null,
    Tooltip: () => null,
    PieChart: Wrapper,
    Pie: Wrapper,
    Cell: () => null,
    Legend: () => null,
  };
});

import Dashboard from "../Dashboard.jsx";

const dashboardResponse = {
  data: {
    summary: {
      totalStudents: 10,
      totalActiveCourses: 4,
      totalInstructors: 3,
    },
    courseDistribution: [
      {
        _id: "course1",
        courseName: "MERN Stack",
        courseCode: "MERN",
        studentCount: 5,
      },
    ],
    recentStudents: [
      {
        _id: "student1",
        fullName: "Test Student",
        email: "student@example.com",
        course: "MERN Stack Development",
        createdAt: "2026-11-10T10:00:00.000Z",
      },
    ],
    recentActivity: [
      {
        _id: "activity1",
        fullName: "Test Student",
        email: "student@example.com",
        course: "MERN Stack Development",
        createdAt: "2026-11-10T10:00:00.000Z",
      },
    ],
  },
};

describe("Dashboard Component", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should display loading state while statistics are being fetched", () => {
    getStats.mockReturnValue(new Promise(() => {}));

    render(<Dashboard />);

    expect(
      screen.getByText("Loading dashboard statistics...")
    ).toBeInTheDocument();
  });

  it("should display dashboard summary after successful loading", async () => {
    getStats.mockResolvedValue(dashboardResponse);

    render(<Dashboard />);

    expect(
      await screen.findAllByText("Total Students")
    ).toHaveLength(1);

    expect(
      screen.getAllByText("Active Courses").length
    ).toBeGreaterThan(0);

    expect(
      screen.getAllByText("Total Instructors").length
    ).toBeGreaterThan(0);

    expect(
      screen.getAllByText("Test Student").length
    ).toBeGreaterThan(0);

    expect(
      screen.getAllByText("student@example.com").length
    ).toBeGreaterThan(0);

    expect(
      screen.getByText("10")
    ).toBeInTheDocument();
  });

  it("should display an error when dashboard API fails", async () => {
    getStats.mockRejectedValue(
      new Error("Unable to connect to server")
    );

    render(<Dashboard />);

    expect(
      await screen.findByText("Unable to connect to server")
    ).toBeInTheDocument();

    expect(
      screen.getByRole("button", { name: "Retry" })
    ).toBeInTheDocument();
  });

  it("should display empty messages when no dashboard records exist", async () => {
    getStats.mockResolvedValue({
      data: {
        summary: {
          totalStudents: 0,
          totalActiveCourses: 0,
          totalInstructors: 0,
        },
        courseDistribution: [],
        recentStudents: [],
        recentActivity: [],
      },
    });

    render(<Dashboard />);

    expect(
      await screen.findByText("No course data available.")
    ).toBeInTheDocument();

    expect(
      screen.getByText("No recent registrations.")
    ).toBeInTheDocument();

    expect(
      screen.getByText("No recent activity.")
    ).toBeInTheDocument();
  });

  it("should request new statistics when date filter changes", async () => {
    getStats.mockResolvedValue(dashboardResponse);

    render(<Dashboard />);

    await screen.findByText("Total Students");

    fireEvent.change(
      screen.getByRole("combobox", {
        name: "Dashboard date filter",
      }),
      { target: { value: "30" } }
    );

    await waitFor(() => {
      expect(getStats).toHaveBeenLastCalledWith("30");
    });
  });
});
