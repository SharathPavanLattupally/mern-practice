
import { Link } from "react-router-dom";

export default function Footer() {
  return (
    <footer className="footer">
      <p>© {new Date().getFullYear()} MERN App. All rights reserved.</p>
      <Link to="/privacy-policy">Privacy Policy</Link>
    </footer>
  );
}
