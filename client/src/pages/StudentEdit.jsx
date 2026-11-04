
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { studentApi } from "../api/studentApi";

const initialForm = {
  fullName: "",
  email: "",
  mobile: "",
  gender: "",
  course: "",
  address: "",
};

export default function StudentEdit() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [form, setForm] = useState(initialForm);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadStudent() {
      try {
        const result = await studentApi.getById(id);
        setForm({ ...initialForm, ...result.data });
      } catch (err) {
        setError(err.message || "Failed to load student.");
      } finally {
        setLoading(false);
      }
    }

    loadStudent();
  }, [id]);

  function handleChange(event) {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");
    setSaving(true);

    try {
      await studentApi.update(id, {
        fullName: form.fullName.trim(),
        email: form.email.trim(),
        mobile: form.mobile.trim(),
        gender: form.gender,
        course: form.course,
        address: form.address.trim(),
      });

      navigate("/students");
    } catch (err) {
      setError(err.message || "Failed to update student.");
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return <p className="page-container">Loading student...</p>;
  }

  if (error && !form.fullName && !form.email) {
    return (
      <section className="page-container edit-student-page">
        <p className="error-message" role="alert">{error}</p>
        <button type="button" onClick={() => navigate("/students")}>
          Back to Students
        </button>
      </section>
    );
  }

  return (
    <section className="page-container edit-student-page">
      <h1>Edit Student</h1>

      {error && <p className="error-message" role="alert">{error}</p>}

      <form className="edit-student-form" onSubmit={handleSubmit}>
        <label>
          Full Name
          <input
            name="fullName"
            value={form.fullName}
            onChange={handleChange}
            required
          />
        </label>

        <label>
          Email
          <input
            name="email"
            type="email"
            value={form.email}
            onChange={handleChange}
            required
          />
        </label>

        <label>
          Mobile
          <input
            name="mobile"
            value={form.mobile}
            onChange={handleChange}
            required
          />
        </label>

        <label>
          Gender
          <select
            name="gender"
            value={form.gender}
            onChange={handleChange}
            required
          >
            <option value="">Select gender</option>
            <option value="Male">Male</option>
            <option value="Female">Female</option>
            <option value="Other">Other</option>
          </select>
        </label>

        <label>
          Course
          <select
            name="course"
            value={form.course}
            onChange={handleChange}
            required
          >
            <option value="">Select course</option>
            <option value="Data Science">Data Science</option>
            <option value="MERN Stack Development">
              MERN Stack Development
            </option>
            <option value="Java Full Stack">Java Full Stack</option>
            <option value="Cloud Computing">Cloud Computing</option>
          </select>
        </label>

        <label>
          Address
          <textarea
            name="address"
            value={form.address}
            onChange={handleChange}
            required
          />
        </label>

        <button type="submit" disabled={saving}>
          {saving ? "Saving..." : "Update Student"}
        </button>

        <button
          type="button"
          onClick={() => navigate("/students")}
          disabled={saving}
        >
          Cancel
        </button>
      </form>
    </section>
  );
}
