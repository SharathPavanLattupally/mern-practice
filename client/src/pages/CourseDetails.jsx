
import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { apiRequest } from "../services/api";
import "./CourseManagement.css";

export default function CourseDetails() {
    const { id } = useParams();
    const [course, setCourse] = useState(null);
    const [students, setStudents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        const loadDetails = async () => {
            try {
                const result = await apiRequest(`/api/courses/${id}`);

                setCourse(result.data.course);
                setStudents(result.data.students || []);
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        loadDetails();
    }, [id]);

    if (loading) return <div className="course-container">Loading course details...</div>;

    if (error) {
        return <div className="course-container error-message">{error}</div>;
    }

    if (!course) return <div className="course-container">Course not found.</div>;

    return (
        <div className="course-container">
            <Link to="/courses" className="back-link">
                ← Back to Courses
            </Link>

            <div className="details-card">
                <h1>{course.courseName}</h1>

                <p><strong>Course Code:</strong> {course.courseCode}</p>
                <p><strong>Description:</strong> {course.description || "Not provided"}</p>
                <p><strong>Duration:</strong> {course.duration}</p>
                <p><strong>Fee:</strong> ₹{course.fee}</p>
                <p><strong>Status:</strong> {course.status}</p>

                <h3>Instructor Information</h3>

                <p><strong>Name:</strong> {course.instructor?.fullName || "Not assigned"}</p>
                <p><strong>Email:</strong> {course.instructor?.email || "Not available"}</p>
                <p><strong>Specialization:</strong> {course.instructor?.specialization || "Not available"}</p>
            </div>

            <div className="students-section">
                <h2>Enrolled Students ({students.length})</h2>

                {students.length > 0 ? (
                    <div className="table-wrapper">
                        <table className="course-table">
                            <thead>
                                <tr>
                                    <th>Full Name</th>
                                    <th>Email</th>
                                    <th>Mobile</th>
                                    <th>Gender</th>
                                </tr>
                            </thead>

                            <tbody>
                                {students.map((student) => (
                                    <tr key={student._id}>
                                        <td>{student.fullName}</td>
                                        <td>{student.email}</td>
                                        <td>{student.mobile}</td>
                                        <td>{student.gender}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                ) : (
                    <p className="empty-message">
                        No students are enrolled in this course yet.
                    </p>
                )}
            </div>
        </div>
    );
}
