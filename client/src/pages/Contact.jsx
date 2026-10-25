
import { useState } from "react";

export default function Contact() {
  const [submitted, setSubmitted] = useState(false);

  function handleSubmit(event) {
    event.preventDefault();
    setSubmitted(true);
    event.currentTarget.reset();
  }

  return (
    <section className="page-container">
      <p className="eyebrow">GET IN TOUCH</p>
      <h1>Contact Us</h1>
      <p className="page-intro">
        Have a question or idea? Send us a message.
      </p>

      <form className="contact-form" onSubmit={handleSubmit}>
        <label htmlFor="name">Full Name</label>
        <input id="name" name="name" type="text" required />

        <label htmlFor="email">Email Address</label>
        <input id="email" name="email" type="email" required />

        <label htmlFor="message">Message</label>
        <textarea id="message" name="message" rows="5" required />

        <button className="button button-primary" type="submit">
          Send Message
        </button>

        {submitted && (
          <p className="success-message" role="status">
            Form submitted successfully! This demo does not send your message
            to a server.
          </p>
        )}
      </form>
    </section>
  );
}
