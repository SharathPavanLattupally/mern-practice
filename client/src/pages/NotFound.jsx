
import { Link } from "react-router-dom";

export default function NotFound() {
  return (
    <section className="not-found">
      <p className="eyebrow">ERROR 404</p>
      <h1>Page not found</h1>
      <p>The page you're looking for doesn't exist or may have moved.</p>
      <Link to="/" className="button button-primary">
        Back to Home
      </Link>
    </section>
  );
}
