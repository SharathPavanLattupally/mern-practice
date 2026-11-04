
import { useEffect, useState } from "react";
import { studentApi } from "../api/studentApi";
import { useNavigate } from "react-router-dom";

export default function StudentsList() {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [deletingId, setDeletingId] = useState(null);
  const [successMessage, setSuccessMessage] = useState("");
  const navigate = useNavigate();

  
  useEffect(() => {
    async function loadStudents() {
      try {
        const result = await studentApi.getAll();
        setStudents(result.data || []);
      } catch (err) {
        setError(err.message || "Failed to load students.");
      } finally {
        setLoading(false);
      }
    }

    loadStudents();
  }, []);

  async function handleDelete(id) {
    const confirmed = window.confirm(
      "Are you sure you want to delete this student?"
    );

    if (!confirmed) return;

    setDeletingId(id);
    setError("");
    setSuccessMessage("");

    try {
      await studentApi.remove(id);

      setStudents((currentStudents) =>
        currentStudents.filter((student) => student._id !== id)
      );

      setSuccessMessage("Student deleted successfully.");
    } catch (err) {
      setError(err.message || "Failed to delete student.");
    } finally {
      setDeletingId(null);
    }
  }


  if (loading) {
    return <p className="page-container">Loading students...</p>;
  }

  if (error) {
    return (
      <p className="page-container error-message" role="alert">
        {error}
      </p>
    );
  }

  return (
    <section className="page-container">
      <h1>Students List</h1>

      {students.length === 0 ? (
        <p>No students registered yet.</p>
      ) : (
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Full Name</th>
                <th>Email</th>
                <th>Mobile</th>
                <th>Course</th>
                <th>Address</th>
                <th>Actions</th>
              </tr>
            </thead>

            <tbody>
              {students.map((student) => (
              <tr key={student._id}>
                <td>{student.fullName}</td>
                <td>{student.email}</td>
                <td>{student.mobile}</td>
                <td>{student.course}</td>
                <td>{student.address}</td>

                <td>
                  <button
                  type="button"
                   onClick={() => navigate(`/students/edit/${student._id}`)}
                  >
                    Edit
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDelete(student._id)}
                    disabled={deletingId === student._id}
                  >
                    {deletingId === student._id ? "Deleting..." : "Delete"}
                  </button>
                </td>
              </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}
