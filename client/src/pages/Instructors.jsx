
import { useEffect, useState } from "react";
import { apiRequest, getCurrentRole } from "../services/api";
import "./CourseManagement.css";

export default function Instructors() {
    const [instructors, setInstructors] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [showForm, setShowForm] = useState(false);
    const [formError, setFormError] = useState("");

    const role = getCurrentRole();

    const initialForm = {
        fullName: "",
        email: "",
        specialization: "",
    };

    const [form, setForm] = useState(initialForm);

    const loadInstructors = async () => {
        try {
            const result = await apiRequest("/api/instructors");
            setInstructors(result.data || []);
            setError("");
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadInstructors();
    }, []);

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
        setFormError("");
    };

    const validateForm = () => {
        if (!form.fullName.trim()) {
            return "Instructor name is required.";
        }

        if (!form.email.trim()) {
            return "Email address is required.";
        }

        const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

        if (!emailPattern.test(form.email.trim())) {
            return "Please enter a valid email address.";
        }

        if (!form.specialization.trim()) {
            return "Specialization is required.";
        }

        return "";
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        const validationError = validateForm();

        if (validationError) {
            setFormError(validationError);
            return;
        }

        try {
            await apiRequest("/api/instructors", {
                method: "POST",
                body: JSON.stringify({
                    fullName: form.fullName.trim(),
                    email: form.email.trim().toLowerCase(),
                    specialization: form.specialization.trim(),
                }),
            });

            alert("Instructor created successfully!");

            setForm(initialForm);
            setFormError("");
            setShowForm(false);

            setLoading(true);
            await loadInstructors();
        } catch (err) {
            setFormError(err.message);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm("Delete this instructor?")) return;

        try {
            await apiRequest(`/api/instructors/${id}`, {
                method: "DELETE",
            });

            alert("Instructor deleted successfully!");

            setLoading(true);
            await loadInstructors();
        } catch (err) {
            alert(err.message);
        }
    };

    if (loading) return <div className="course-container">Loading instructors...</div>;

    return (
        <div className="course-container">
            <div className="course-header">
                <div>
                    <h1>Instructor Management</h1>
                    <p>Manage instructors and their assigned courses.</p>
                </div>

                {role === "admin" && (
                    <button
                        className="primary-btn"
                        onClick={() => {
                            setShowForm(!showForm);
                            setFormError("");
                        }}
                    >
                        {showForm ? "Close Form" : "+ Add Instructor"}
                    </button>
                )}
            </div>

            {error && <p className="error-message">{error}</p>}

            {showForm && role === "admin" && (
                <form className="management-form" onSubmit={handleSubmit}>
                    <h2>Add Instructor</h2>

                    {formError && (
                        <p className="error-message">{formError}</p>
                    )}

                    <input
                        name="fullName"
                        placeholder="Full Name"
                        value={form.fullName}
                        onChange={handleChange}
                        required
                    />

                    <input
                        type="email"
                        name="email"
                        placeholder="Email Address"
                        value={form.email}
                        onChange={handleChange}
                        required
                    />

                    <input
                        name="specialization"
                        placeholder="Specialization"
                        value={form.specialization}
                        onChange={handleChange}
                        required
                    />

                    <button type="submit" className="primary-btn">
                        Save Instructor
                    </button>
                </form>
            )}

            <div className="instructor-grid">
                {instructors.map((instructor) => (
                    <div className="instructor-card" key={instructor._id}>
                        <h2>{instructor.fullName}</h2>

                        <p><strong>Email:</strong> {instructor.email}</p>

                        <p>
                            <strong>Specialization:</strong>{" "}
                            {instructor.specialization}
                        </p>

                        <h3>Assigned Courses</h3>

                        {instructor.courses?.length > 0 ? (
                            <ul>
                                {instructor.courses.map((course) => (
                                    <li key={course._id}>
                                        {course.courseName} ({course.courseCode})
                                    </li>
                                ))}
                            </ul>
                        ) : (
                            <p>No courses assigned.</p>
                        )}

                        {role === "admin" && (
                            <button
                                className="delete-btn"
                                onClick={() => handleDelete(instructor._id)}
                            >
                                Delete Instructor
                            </button>
                        )}
                    </div>
                ))}
            </div>

            {!instructors.length && (
                <p className="empty-message">No instructors found.</p>
            )}
        </div>
    );
}
