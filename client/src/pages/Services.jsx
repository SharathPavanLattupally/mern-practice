
import Card from "../components/Card";

const services = [
  {
    icon: "💻",
    title: "Web Development",
    description: "Responsive websites built with modern frontend technologies.",
  },
  {
    icon: "⚙️",
    title: "Backend Development",
    description: "APIs and server-side applications using Node.js and Express.",
  },
  {
    icon: "🗄️",
    title: "Database Solutions",
    description: "Structured data management and MongoDB integration.",
  },
  {
    icon: "📱",
    title: "Responsive Design",
    description: "Layouts that work smoothly across desktop and mobile devices.",
  },
  {
    icon: "🔌",
    title: "API Integration",
    description: "Connect frontend applications to external or internal APIs.",
  },
  {
    icon: "🛠️",
    title: "Maintenance",
    description: "Updates, improvements, and bug fixes for web applications.",
  },
];

export default function Services() {
  return (
    <section className="page-container">
      <p className="eyebrow">OUR EXPERTISE</p>
      <h1>Our Services</h1>
      <p className="page-intro">
        Explore the services we offer to build and improve your digital products.
      </p>

      <div className="card-grid">
        {services.map((service) => (
          <Card key={service.title} {...service} />
        ))}
      </div>
    </section>
  );
}
