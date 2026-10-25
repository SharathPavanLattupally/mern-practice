
import { Link } from "react-router-dom";
import Button from "../components/Button";
import Card from "../components/Card";

const features = [
  {
    icon: "⚡",
    title: "Fast Performance",
    description: "Enjoy a responsive application built with modern React.",
  },
  {
    icon: "🧩",
    title: "Reusable Components",
    description: "Build consistent interfaces with reusable UI components.",
  },
  {
    icon: "🧭",
    title: "Easy Navigation",
    description: "Move between pages smoothly with React Router.",
  },
];

export default function Home() {
  return (
    <>
      <section className="hero">
        <p className="eyebrow">WELCOME TO OUR WEBSITE</p>
        <h1>Build better experiences with React</h1>
        <p className="hero-description">
          A simple multi-page application demonstrating reusable components,
          clean layouts, and smooth navigation.
        </p>
        <div className="hero-actions">
          <Button to="/services">Explore Services</Button>
          <Button to="/about" variant="outline">About Us</Button>
        </div>
      </section>

      <section className="section">
        <div className="section-heading">
          <p className="eyebrow">WHAT WE OFFER</p>
          <h2>Designed for simplicity</h2>
        </div>
        <div className="card-grid">
          {features.map((feature) => (
            <Card key={feature.title} {...feature} />
          ))}
        </div>
      </section>

      <section className="cta">
        <h2>Have a project in mind?</h2>
        <p>We would love to hear from you.</p>
        <Link to="/contact" className="button button-primary">
          Contact Us
        </Link>
      </section>
    </>
  );
}
