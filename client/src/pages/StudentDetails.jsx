
import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { studentApi } from "../api/studentApi";
import "./CourseManagement.css";

export default function StudentDetails() {
    const { id } = useParams();

    const [student, setStudent] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        async function loadStudent() {
            try {
                const result = await studentApi.getById(id);
                setStudent(result.data);
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        }

        loadStudent();
    }, [id]);

    if (loading) {
        return <div className="course-container">Loading student details...</div>;
    }

    if (error) {
        return <div className="course-container error-message">{error}</div>;
    }

    if (!student) {
        return <div className="course-container">Student not found.</div>;
    }

    const course = student.courseId;

    return (
        <div className="course-container">
            <Link to="/students" className="back-link">
                ← Back to Students
            </Link>

            <div className="details-card">
                <h1>Student Details</h1>

                <h2>{student.fullName}</h2>

                <p><strong>Email:</strong> {student.email}</p>
                <p><strong>Mobile:</strong> {student.mobile}</p>
                <p><strong>Gender:</strong> {student.gender}</p>
                <p><strong>Address:</strong> {student.address}</p>

                <hr />

                <h2>Enrolled Course</h2>

                {course ? (
                    <>
                        <p><strong>Course Name:</strong> {course.courseName}</p>
                        <p><strong>Course Code:</strong> {course.courseCode}</p>
                        <p><strong>Duration:</strong> {course.duration}</p>
                        <p><strong>Fee:</strong> ₹{course.fee}</p>
                        <p><strong>Status:</strong> {course.status}</p>

                        <Link
                            to={`/courses/${course._id}`}
                            className="view-btn"
                        >
                            View Course Details
                        </Link>
                    </>
                ) : (
                    <p>No linked course information available for this student.</p>
                )}
            </div>
        </div>
    );
}
