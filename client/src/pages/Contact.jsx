
import { useState } from "react";
import FormField from "../components/FormField";

export default function Contact() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    message: "",
  });
  const [submitted, setSubmitted] = useState(false);

  function handleChange(event) {
    const { name, value } = event.target;
    setForm((previous) => ({ ...previous, [name]: value }));
    setSubmitted(false);
  }

  function handleSubmit(event) {
    event.preventDefault();
    setSubmitted(true);
    setForm({ name: "", email: "", message: "" });
  }

  return (
    <section className="page-container">
      <p className="eyebrow">GET IN TOUCH</p>
      <h1>Contact Us</h1>
      <p className="page-intro">
        Have a question or idea? Send us a message.
      </p>

      <form className="contact-form" onSubmit={handleSubmit}>
        <FormField
          label="Full Name"
          name="name"
          value={form.name}
          onChange={handleChange}
          placeholder="Enter your full name"
          autoComplete="name"
          required
        />

        <FormField
          label="Email Address"
          name="email"
          type="email"
          value={form.email}
          onChange={handleChange}
          placeholder="you@example.com"
          autoComplete="email"
          required
        />

        <FormField
          label="Message"
          name="message"
          value={form.message}
          onChange={handleChange}
          placeholder="How can we help?"
          multiline
          required
        />

        <button className="button button-primary" type="submit">
          Send Message
        </button>

        {submitted && (
          <p className="success-message" role="status">
            Demo submission successful. No message was sent to a server.
          </p>
        )}
      </form>
    </section>
  );
}
