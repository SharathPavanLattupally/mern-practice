
import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { studentApi } from "../api/studentApi";
import StudentFileUpload from "../components/StudentFileUpload";
import "./CourseManagement.css";

export default function StudentDetails() {
  const { id } = useParams();

  const [student, setStudent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;

    async function loadStudent() {
      try {
        const result = await studentApi.getById(id);

        if (!cancelled) {
          setStudent(result.data);
        }
      } catch (err) {
        if (!cancelled) {
          setError(err.message || "Failed to load student details.");
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    loadStudent();

    return () => {
      cancelled = true;
    };
  }, [id]);

  if (loading) {
    return (
      <div className="course-container">
        Loading student details...
      </div>
    );
  }

  if (error) {
    return (
      <div className="course-container error-message">
        {error}
      </div>
    );
  }

  if (!student) {
    return (
      <div className="course-container">
        Student not found.
      </div>
    );
  }

  const course = student.courseId;

  return (
    <div className="course-container">
      <Link to="/students" className="back-link">
        ← Back to Students
      </Link>

      {/* Student information */}
      <div className="details-card">
        <h1>Student Details</h1>

        <h2>{student.fullName}</h2>

        <p><strong>Email:</strong> {student.email}</p>
        <p><strong>Mobile:</strong> {student.mobile}</p>
        <p><strong>Gender:</strong> {student.gender}</p>
        <p><strong>Address:</strong> {student.address}</p>

        <hr />

        {/* Course information */}
        <h2>Enrolled Course</h2>

        {course && typeof course === "object" ? (
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
          <p>No linked course information available.</p>
        )}
      </div>

      {/* Profile photo and document uploads */}
      <div className="details-card">
        <StudentFileUpload
          studentId={student._id}
          student={student}
        />
      </div>
    </div>
  );
}
