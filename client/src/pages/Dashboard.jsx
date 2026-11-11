
import { useEffect, useState } from "react";
import { dashboardApi } from "../api/studentApi.js";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";
import "./Dashboard.css";

const COLORS = ["#4f46e5", "#0ea5e9", "#10b981", "#f59e0b", "#8b5cf6"];

function SummaryCard({ title, value, icon, description }) {
  return (
    <div className="dashboard-card">
      <div className="dashboard-card-top">
        <span>{title}</span>
        <span className="dashboard-card-icon">{icon}</span>
      </div>
      <h2>{value ?? 0}</h2>
      <p>{description}</p>
    </div>
  );
}

export default function Dashboard() {
  const [stats, setStats] = useState(null);
  const [period, setPeriod] = useState("7");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;

    async function loadDashboard() {
      try {
        setLoading(true);
        setError("");

        const response = await dashboardApi.getStats(period);

        if (!cancelled) {
          setStats(response.data);
        }
      } catch (err) {
        if (!cancelled) {
          setError(err.message || "Unable to load dashboard.");
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    loadDashboard();

    return () => {
      cancelled = true;
    };
  }, [period]);

  if (loading) {
    return (
      <div className="dashboard-message">
        Loading dashboard statistics...
      </div>
    );
  }

  if (error) {
    return (
      <div className="dashboard-message dashboard-error">
        <p>{error}</p>
        <button onClick={() => setPeriod(period)}>Retry</button>
      </div>
    );
  }

  const summary = stats?.summary || {};
  const courseData = stats?.courseDistribution || [];
  const students = stats?.recentStudents || [];
  const activities = stats?.recentActivity || [];

  return (
    <div className="dashboard-container">
      <div className="dashboard-heading">
        <div>
          <h1>Dashboard</h1>
          <p>Student Management System overview</p>
        </div>

        <select
          value={period}
          onChange={(e) => setPeriod(e.target.value)}
          aria-label="Dashboard date filter"
        >
          <option value="7">Last 7 days</option>
          <option value="30">Last 30 days</option>
          <option value="90">Last 90 days</option>
          <option value="all">All time</option>
        </select>
      </div>

      <div className="dashboard-summary">
        <SummaryCard
          title="Total Students"
          value={summary.totalStudents}
          icon="👨‍🎓"
          description="Registered students"
        />

        <SummaryCard
          title="Active Courses"
          value={summary.totalActiveCourses}
          icon="📚"
          description="Currently active courses"
        />

        <SummaryCard
          title="Total Instructors"
          value={summary.totalInstructors}
          icon="👨‍🏫"
          description="Registered instructors"
        />

        <SummaryCard
          title="Course Enrollments"
          value={courseData.reduce(
            (total, course) => total + course.studentCount,
            0
          )}
          icon="📊"
          description="Students linked to courses"
        />
      </div>

      <div className="dashboard-charts">
        <section className="dashboard-panel">
          <h2>Course-wise Student Distribution</h2>

          {courseData.length === 0 ? (
            <p className="dashboard-empty">No course data available.</p>
          ) : (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={courseData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis
  dataKey="courseCode"
  tick={{ fontSize: 11 }}
  interval={0}
/> 
                <YAxis allowDecimals={false} />
                <Tooltip />
                <Bar
                  dataKey="studentCount"
                  name="Students"
                  fill="#4f46e5"
                  radius={[6, 6, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          )}
        </section>

        <section className="dashboard-panel">
          <h2>Enrollment Distribution</h2>

          {courseData.length === 0 ? (
            <p className="dashboard-empty">No enrollment data available.</p>
          ) : (
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
  data={courseData}
  dataKey="studentCount"
  nameKey="courseName"
  cx="50%"
  cy="50%"
  outerRadius={90}
>
  {courseData.map((course, index) => (
    <Cell
      key={course._id}
      fill={COLORS[index % COLORS.length]}
    />
  ))}
</Pie>
<Tooltip />
<Legend
  layout="horizontal"
  verticalAlign="bottom"
  align="center"
/>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          )}
        </section>
      </div>

      <section className="dashboard-panel dashboard-table-panel">
        <h2>Recently Registered Students</h2>

        {students.length === 0 ? (
          <p className="dashboard-empty">No recent registrations.</p>
        ) : (
          <div className="dashboard-table-wrapper">
            <table className="dashboard-table">
              <thead>
                <tr>
                  <th>Student Name</th>
                  <th>Email</th>
                  <th>Course</th>
                  <th>Registration Date</th>
                </tr>
              </thead>

              <tbody>
                {students.map((student) => (
                  <tr key={student._id}>
                    <td>{student.fullName}</td>
                    <td>{student.email}</td>
                    <td>
                      {student.courseId?.courseName ||
                        student.course ||
                        "N/A"}
                    </td>
                    <td>
                      {student.createdAt
                        ? new Date(student.createdAt).toLocaleDateString()
                        : "N/A"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <section className="dashboard-panel dashboard-table-panel">
        <h2>Recent Enrollment Activity</h2>

        {activities.length === 0 ? (
          <p className="dashboard-empty">No recent activity.</p>
        ) : (
          <div className="dashboard-table-wrapper">
            <table className="dashboard-table">
              <thead>
                <tr>
                  <th>Student</th>
                  <th>Email</th>
                  <th>Course</th>
                  <th>Date</th>
                </tr>
              </thead>

              <tbody>
                {activities.map((activity) => (
                  <tr key={activity._id}>
                    <td>{activity.fullName}</td>
                    <td>{activity.email}</td>
                    <td>{activity.course || "N/A"}</td>
                    <td>
                      {new Date(activity.createdAt).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}
