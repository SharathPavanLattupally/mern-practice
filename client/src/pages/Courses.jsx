
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { apiRequest, getCurrentRole } from "../services/api";
import "./CourseManagement.css";

export default function Courses() {
    const [courses, setCourses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [showForm, setShowForm] = useState(false);
    const role = getCurrentRole();

    const [form, setForm] = useState({
        courseName: "",
        courseCode: "",
        description: "",
        duration: "",
        fee: "",
        status: "Active",
        instructor: "",
    });

    const [instructors, setInstructors] = useState([]);

    const loadCourses = async () => {
        try {
            setLoading(true);
            const result = await apiRequest("/api/courses");
            setCourses(result.data || []);
            setError("");
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const loadInstructors = async () => {
        try {
            const result = await apiRequest("/api/instructors");
            setInstructors(result.data || []);
        } catch (err) {
            setError(err.message);
        }
    };

    useEffect(() => {
        loadCourses();
        loadInstructors();
    }, []);

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            await apiRequest("/api/courses", {
                method: "POST",
                body: JSON.stringify({
                    ...form,
                    fee: Number(form.fee),
                }),
            });

            alert("Course created successfully!");

            setForm({
                courseName: "",
                courseCode: "",
                description: "",
                duration: "",
                fee: "",
                status: "Active",
                instructor: "",
            });

            setShowForm(false);
            loadCourses();
        } catch (err) {
            alert(err.message);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm("Are you sure you want to delete this course?")) {
            return;
        }

        try {
            await apiRequest(`/api/courses/${id}`, {
                method: "DELETE",
            });

            alert("Course deleted successfully!");
            loadCourses();
        } catch (err) {
            alert(err.message);
        }
    };

    if (loading) return <div className="course-container">Loading courses...</div>;

    return (
        <div className="course-container">
            <div className="course-header">
                <div>
                    <h1>Course Management</h1>
                    <p>Manage courses, instructors and student enrollment.</p>
                </div>

                {role === "admin" && (
                    <button
                        className="primary-btn"
                        onClick={() => setShowForm(!showForm)}
                    >
                        {showForm ? "Close Form" : "+ Add Course"}
                    </button>
                )}
            </div>

            {error && <p className="error-message">{error}</p>}

            {showForm && role === "admin" && (
                <form className="management-form" onSubmit={handleSubmit}>
                    <h2>Create New Course</h2>

                    <input
                        name="courseName"
                        placeholder="Course Name"
                        value={form.courseName}
                        onChange={handleChange}
                        required
                    />

                    <input
                        name="courseCode"
                        placeholder="Course Code"
                        value={form.courseCode}
                        onChange={handleChange}
                        required
                    />

                    <textarea
                        name="description"
                        placeholder="Course Description"
                        value={form.description}
                        onChange={handleChange}
                    />

                    <input
                        name="duration"
                        placeholder="Duration (e.g. 6 Months)"
                        value={form.duration}
                        onChange={handleChange}
                        required
                    />

                    <input
                        type="number"
                        name="fee"
                        placeholder="Course Fee"
                        min="0"
                        value={form.fee}
                        onChange={handleChange}
                        required
                    />

                    <select
                        name="instructor"
                        value={form.instructor}
                        onChange={handleChange}
                        required
                    >
                        <option value="">Select Instructor</option>
                        {instructors.map((instructor) => (
                            <option key={instructor._id} value={instructor._id}>
                                {instructor.fullName}
                            </option>
                        ))}
                    </select>

                    <select
                        name="status"
                        value={form.status}
                        onChange={handleChange}
                    >
                        <option value="Active">Active</option>
                        <option value="Inactive">Inactive</option>
                    </select>

                    <button className="primary-btn" type="submit">
                        Save Course
                    </button>
                </form>
            )}

            <div className="course-grid">
                {courses.map((course) => (
                    <div className="course-card" key={course._id}>
                        <div className="course-card-top">
                            <span className="course-code">
                                {course.courseCode}
                            </span>
                            <span className={`status ${course.status?.toLowerCase()}`}>
                                {course.status}
                            </span>
                        </div>

                        <h2>{course.courseName}</h2>
                        <p>{course.description || "No description available."}</p>

                        <div className="course-info">
                            <span>Duration: {course.duration}</span>
                            <span>Fee: ₹{course.fee}</span>
                            <span>
                                Instructor: {course.instructor?.fullName || "Not assigned"}
                            </span>
                            <span>Students: {course.studentCount ?? 0}</span>
                        </div>

                        <div className="course-actions">
                            <Link to={`/courses/${course._id}`} className="view-btn">
                                View Details
                            </Link>

                            {role === "admin" && (
                                <button
                                    className="delete-btn"
                                    onClick={() => handleDelete(course._id)}
                                >
                                    Delete
                                </button>
                            )}
                        </div>
                    </div>
                ))}
            </div>

            {!courses.length && (
                <p className="empty-message">No courses found.</p>
            )}
        </div>
    );
}
