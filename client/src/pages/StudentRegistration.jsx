
import { useEffect, useState } from "react";
import { studentApi } from "../api/studentApi";
import FormField from "../components/FormField";

const initialForm = {
  fullName: "",
  email: "",
  mobile: "",
  gender: "",
  course: "",
  address: "",
};

function validateForm(form) {
  const errors = {};

  if (!form.fullName.trim()) {
    errors.fullName = "Full name is required.";
  } else if (form.fullName.trim().length < 2) {
    errors.fullName = "Name must contain at least 2 characters.";
  }

  if (!form.email.trim()) {
    errors.email = "Email address is required.";
  } else if (
    !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())
  ) {
    errors.email = "Enter a valid email address.";
  }

  if (!form.mobile.trim()) {
    errors.mobile = "Mobile number is required.";
  } else if (!/^[6-9]\d{9}$/.test(form.mobile.trim())) {
    errors.mobile = "Enter a valid 10-digit Indian mobile number.";
  }

  if (!form.gender) {
    errors.gender = "Please select your gender.";
  }

  if (!form.course) {
    errors.course = "Please select a course.";
  }

  if (!form.address.trim()) {
    errors.address = "Address is required.";
  } else if (form.address.trim().length < 5) {
    errors.address = "Address must contain at least 5 characters.";
  }

  return errors;
}

function SelectField({
  label,
  name,
  value,
  onChange,
  options,
  error,
}) {
  return (
    <div className="form-field">
      <label htmlFor={name}>{label}</label>

      <select
        id={name}
        name={name}
        value={value}
        onChange={onChange}
        required
        aria-invalid={Boolean(error)}
        aria-describedby={error ? `${name}-error` : undefined}
      >
        <option value="">Select {label.toLowerCase()}</option>

        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>

      {error && (
        <p className="field-error" id={`${name}-error`} role="alert">
          {error}
        </p>
      )}
    </div>
  );
}

function FieldError({ id, message }) {
  if (!message) return null;

  return (
    <p className="field-error" id={id} role="alert">
      {message}
    </p>
  );
}

export default function StudentRegistration() {
  const [form, setForm] = useState(initialForm);
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [apiError, setApiError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  useEffect(() => {
    document.title = "Student Registration | MERN App";
  }, []);

  function handleChange(event) {
    const { name, value } = event.target;

    setForm((previous) => ({
      ...previous,
      [name]: value,
    }));

    setApiError("");
    setSuccessMessage("");

    setErrors((previous) => {
      const next = { ...previous };
      delete next[name];
      return next;
    });
  }

  async function handleSubmit(event) {
    event.preventDefault();

    const validationErrors = validateForm(form);
    setErrors(validationErrors);
    setApiError("");
    setSuccessMessage("");

    if (Object.keys(validationErrors).length > 0) {
      return;
    }

    setIsSubmitting(true);

    try {
      const result = await studentApi.create({
        fullName: form.fullName.trim(),
        email: form.email.trim(),
        mobile: form.mobile.trim(),
        gender: form.gender,
        course: form.course,
        address: form.address.trim(),
      });

      setSuccessMessage(
        result.message || "Student registered successfully!"
      );

      setForm({ ...initialForm });
      setErrors({});
    } catch (error) {
      setApiError(
        error.message || "Unable to register the student. Please try again."
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  function handleReset() {
    setForm({ ...initialForm });
    setErrors({});
    setApiError("");
    setSuccessMessage("");
  }

  return (
    <section className="page-container registration-page">
      <p className="eyebrow">JOIN OUR PROGRAM</p>

      <h1>Student Registration</h1>

      <p className="page-intro">
        Enter your details below. Fields marked with * are required.
      </p>

      <form
        className="contact-form registration-form"
        onSubmit={handleSubmit}
        noValidate
      >
        {apiError && (
          <p className="error-message" role="alert">
            {apiError}
          </p>
        )}

        {successMessage && (
          <p className="success-message" role="status">
            {successMessage}
          </p>
        )}

        <FormField
          label="Full Name *"
          name="fullName"
          value={form.fullName}
          onChange={handleChange}
          placeholder="Enter your full name"
          autoComplete="name"
          required
          error={errors.fullName}
        />

        <FormField
          label="Email Address *"
          name="email"
          type="email"
          value={form.email}
          onChange={handleChange}
          placeholder="you@example.com"
          autoComplete="email"
          required
          error={errors.email}
        />

        <FormField
          label="Mobile Number *"
          name="mobile"
          type="tel"
          value={form.mobile}
          onChange={handleChange}
          placeholder="10-digit mobile number"
          autoComplete="tel-national"
          required
          error={errors.mobile}
        />

        <SelectField
          label="Gender *"
          name="gender"
          value={form.gender}
          onChange={handleChange}
          error={errors.gender}
          options={[
            { value: "Male", label: "Male" },
            { value: "Female", label: "Female" },
            { value: "Other", label: "Other" },
            {
              value: "Prefer not to say",
              label: "Prefer not to say",
            },
          ]}
        />

        <SelectField
          label="Course *"
          name="course"
          value={form.course}
          onChange={handleChange}
          error={errors.course}
          options={[
            {
              value: "MERN Stack Development",
              label: "MERN Stack Development",
            },
            { value: "Java Full Stack", label: "Java Full Stack" },
            { value: "Data Science", label: "Data Science" },
            { value: "Cloud Computing", label: "Cloud Computing" },
          ]}
        />

        <FormField
          label="Address *"
          name="address"
          value={form.address}
          onChange={handleChange}
          placeholder="Enter your full address"
          autoComplete="street-address"
          required
          error={errors.address}
        />

        <div className="form-actions">
          <button
            className="button button-primary"
            type="submit"
            disabled={isSubmitting}
          >
            {isSubmitting ? "Registering..." : "Register Student"}
          </button>

          <button
            className="button button-outline"
            type="button"
            onClick={handleReset}
            disabled={isSubmitting}
          >
            Reset Form
          </button>
        </div>
      </form>
    </section>
  );
}
