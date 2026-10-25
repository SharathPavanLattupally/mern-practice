
import { NavLink } from "react-router-dom";

const links = [
  { label: "Home", path: "/" },
  { label: "About Us", path: "/about" },
  { label: "Services", path: "/services" },
  { label: "Contact Us", path: "/contact" },
  { label: "Privacy Policy", path: "/privacy-policy" },
];

export default function Navbar() {
  return (
    <header className="navbar">
      <NavLink to="/" className="brand">
        MERN<span>App</span>
      </NavLink>

      <nav className="nav-links" aria-label="Main navigation">
        {links.map((link) => (
          <NavLink
            key={link.path}
            to={link.path}
            end={link.path === "/"}
            className={({ isActive }) =>
              isActive ? "nav-link active" : "nav-link"
            }
          >
            {link.label}
          </NavLink>
        ))}
      </nav>
    </header>
  );
}
