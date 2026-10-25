
import { useEffect, useState } from "react";
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
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) {
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

// Reusable select component: demonstrates props and controlled inputs.
function SelectField({ label, name, value, onChange, options, error }) {
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

// Reusable error message component.
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
  const [success, setSuccess] = useState("");

  useEffect(() => {
    document.title = "Student Registration | MERN App";
  }, []);

  function handleChange(event) {
    const { name, value } = event.target;

    setForm((previous) => ({
      ...previous,
      [name]: value,
    }));

    setSuccess("");

    // Revalidate a field after the user changes it.
    setErrors((previous) => {
      const next = { ...previous };
      delete next[name];
      return next;
    });
  }

  function handleSubmit(event) {
    event.preventDefault();

    const validationErrors = validateForm(form);
    setErrors(validationErrors);
    setSuccess("");

    if (Object.keys(validationErrors).length > 0) {
      return;
    }

    // Frontend demonstration only. Backend validation is still required.
    console.log("Validated student form:", form);
    setSuccess(
      "Registration form validated successfully! Backend submission is not connected yet."
    );
    setForm({ ...initialForm });
    setErrors({});
  }

  function handleReset() {
    setForm({ ...initialForm });
    setErrors({});
    setSuccess("");
  }

  return (
    <section className="page-container registration-page">
      <p className="eyebrow">JOIN OUR PROGRAM</p>
      <h1>Student Registration</h1>
      <p className="page-intro">
        Enter your details below. Fields marked with * are required.
      </p>

      <form className="contact-form registration-form" onSubmit={handleSubmit} noValidate>
        <FormField
          label="Full Name *"
          name="fullName"
          value={form.fullName}
          onChange={handleChange}
          placeholder="Enter your full name"
          autoComplete="name"
          required
        />
        <FieldError id="fullName-error" message={errors.fullName} />

        <FormField
          label="Email Address *"
          name="email"
          type="email"
          value={form.email}
          onChange={handleChange}
          placeholder="you@example.com"
          autoComplete="email"
          required
        />
        <FieldError id="email-error" message={errors.email} />

        <FormField
          label="Mobile Number *"
          name="mobile"
          type="tel"
          value={form.mobile}
          onChange={handleChange}
          placeholder="10-digit mobile number"
          autoComplete="tel-national"
          required
        />
        <FieldError id="mobile-error" message={errors.mobile} />

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
            { value: "Prefer not to say", label: "Prefer not to say" },
          ]}
        />

        <SelectField
          label="Course *"
          name="course"
          value={form.course}
          onChange={handleChange}
          error={errors.course}
          options={[
            { value: "MERN Stack Development", label: "MERN Stack Development" },
            { value: "Java Full Stack", label: "Java Full Stack" },
            { value: "Data Science", label: "Data Science" },
            { value: "Cloud Computing", label: "Cloud Computing" },
          ]}
        />

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

        <div className="form-actions">
          <button className="button button-primary" type="submit">
            Register Student
          </button>
          <button
            className="button button-outline"
            type="button"
            onClick={handleReset}
          >
            Reset Form
          </button>
        </div>

        {success && (
          <p className="success-message" role="status">
            {success}
          </p>
        )}
      </form>
    </section>
  );
}
