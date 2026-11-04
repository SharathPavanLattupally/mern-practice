
import { useEffect, useState } from "react";
import { studentApi } from "../api/studentApi";
import { useNavigate } from "react-router-dom";

export default function StudentsList() {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [deletingId, setDeletingId] = useState(null);
  const [successMessage, setSuccessMessage] = useState("");

  // Search, filters, sorting and pagination
  const [searchInput, setSearchInput] = useState("");
  const [filters, setFilters] = useState({
    search: "",
    course: "",
    gender: "",
    sortBy: "createdAt",
    order: "desc",
    page: 1,
    limit: 10,
  });

  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  const navigate = useNavigate();

  useEffect(() => {
    let cancelled = false;

    async function loadStudents() {
      setLoading(true);
      setError("");

      try {
        const result = await studentApi.getAll(filters);

        if (cancelled) return;

        setStudents(result.data || []);
        setTotal(result.total ?? result.count ?? 0);
        setTotalPages(result.totalPages ?? 0);
      } catch (err) {
        if (!cancelled) {
          setError(err.message || "Failed to load students.");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    loadStudents();

    return () => {
      cancelled = true;
    };
  }, [filters]);

  function updateFilter(name, value) {
    setFilters((current) => ({
      ...current,
      [name]: value,
      page: 1,
    }));
    setSuccessMessage("");
  }

  function handleSearchSubmit(event) {
    event.preventDefault();
    updateFilter("search", searchInput.trim());
  }

  function clearFilters() {
    setSearchInput("");
    setFilters({
      search: "",
      course: "",
      gender: "",
      sortBy: "createdAt",
      order: "desc",
      page: 1,
      limit: 10,
    });
  }

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

      // Reload the current page so counts and pagination stay accurate.
      setSuccessMessage("Student deleted successfully.");

      setFilters((current) => ({
        ...current,
        page: Math.max(1, current.page),
        _refresh: Date.now(),
      }));
    } catch (err) {
      setError(err.message || "Failed to delete student.");
    } finally {
      setDeletingId(null);
    }
  }

  // Re-fetch when deletion succeeds, including when page is unchanged.
  // The _refresh value is removed from API parameters below.
  const isFirstPage = filters.page === 1;

  return (
    <section className="page-container">
      <h1>Students List</h1>

      {successMessage && (
        <p className="success-message" role="status">
          {successMessage}
        </p>
      )}

      {error && (
        <p className="error-message" role="alert">
          {error}
        </p>
      )}

      <form onSubmit={handleSearchSubmit}>
        <label htmlFor="student-search">
          Search by name or email
        </label>
        <div className="student-search-row">
          <input
            id="student-search"
            type="search"
            placeholder="Enter student name or email"
            value={searchInput}
            maxLength={100}
            onChange={(event) => setSearchInput(event.target.value)}
          />
          <button type="submit">Search</button>
        </div>
      </form>

      <div className="student-filters">
        <div>
          <label htmlFor="course-filter">Course</label>
          <select
            id="course-filter"
            value={filters.course}
            onChange={(event) => updateFilter("course", event.target.value)}
          >
            <option value="">All courses</option>
            <option value="MERN Stack Development">
              MERN Stack Development
            </option>
            <option value="Java Full Stack Development">
              Java Full Stack Development
            </option>
            <option value="Data Science">Data Science</option>
            <option value="Cloud Computing">Cloud Computing</option>
          </select>
        </div>

        <div>
          <label htmlFor="gender-filter">Gender</label>
          <select
            id="gender-filter"
            value={filters.gender}
            onChange={(event) => updateFilter("gender", event.target.value)}
          >
            <option value="">All genders</option>
            <option value="Male">Male</option>
            <option value="Female">Female</option>
            <option value="Other">Other</option>
          </select>
        </div>

        <div>
          <label htmlFor="sort-filter">Sort by</label>
          <select
            id="sort-filter"
            value={`${filters.sortBy}-${filters.order}`}
            onChange={(event) => {
              const [sortBy, order] = event.target.value.split("-");
              setFilters((current) => ({
                ...current,
                sortBy,
                order,
                page: 1,
              }));
            }}
          >
            <option value="createdAt-desc">Newest first</option>
            <option value="createdAt-asc">Oldest first</option>
            <option value="name-asc">Name A–Z</option>
            <option value="name-desc">Name Z–A</option>
          </select>
        </div>

        <div>
          <label htmlFor="page-size">Records per page</label>
          <select
            id="page-size"
            value={filters.limit}
            onChange={(event) =>
              updateFilter("limit", Number(event.target.value))
            }
          >
            <option value={10}>10</option>
            <option value={25}>25</option>
            <option value={50}>50</option>
          </select>
        </div>

        <button type="button" onClick={clearFilters}>
          Clear filters
        </button>
      </div>

      <p>
        Total matching students: <strong>{total}</strong>
      </p>

      {loading ? (
        <p role="status">Loading students...</p>
      ) : error && students.length === 0 ? (
        <p>No student data could be loaded. Please try again.</p>
      ) : students.length === 0 ? (
        <p>
          {filters.search || filters.course || filters.gender
            ? "No students match your search or filters."
            : "No students registered yet."}
        </p>
      ) : (
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Full Name</th>
                <th>Email</th>
                <th>Mobile</th>
                <th>Gender</th>
                <th>Course</th>
                <th>Address</th>
                <th>Created</th>
                <th>Actions</th>
              </tr>
            </thead>

            <tbody>
              {students.map((student) => (
                <tr key={student._id}>
                  <td>{student.fullName}</td>
                  <td>{student.email}</td>
                  <td>{student.mobile}</td>
                  <td>{student.gender}</td>
                  <td>{student.course}</td>
                  <td>{student.address}</td>
                  <td>
                    {student.createdAt
                      ? new Date(student.createdAt).toLocaleDateString()
                      : "—"}
                  </td>
                  <td>
                    <button
                      type="button"
                      onClick={() =>
                        navigate(`/students/edit/${student._id}`)
                      }
                    >
                      Edit
                    </button>

                    <button
                      type="button"
                      onClick={() => handleDelete(student._id)}
                      disabled={deletingId === student._id}
                    >
                      {deletingId === student._id
                        ? "Deleting..."
                        : "Delete"}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {!loading && totalPages > 0 && (
        <div className="pagination">
          <button
            type="button"
            disabled={filters.page <= 1}
            onClick={() =>
              setFilters((current) => ({
                ...current,
                page: current.page - 1,
              }))
            }
          >
            Previous
          </button>

          <span>
            Page {filters.page} of {totalPages}
          </span>

          <button
            type="button"
            disabled={filters.page >= totalPages}
            onClick={() =>
              setFilters((current) => ({
                ...current,
                page: current.page + 1,
              }))
            }
          >
            Next
          </button>
        </div>
      )}
    </section>
  );
}
