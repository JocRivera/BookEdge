import { Link } from "react-router-dom";
import "./Navbar.css";
import logo from "../../../assets/logo.png";

export default function Navbar  ()  {
  return (
    <nav className="Nav">
      <div className="logo-nav">
        <img src={logo} alt="Logo" />
      </div>
      <div className="nav-links">
        <ul className="links">
          <li>
            <Link to="/" className="link">
              Inicio
            </Link>
          </li>
          <li>
            <Link to="/about" className="link">
              Habitaciones
            </Link>
          </li>
          <li>
            <Link to="/services" className="link">
              Planes
            </Link>
          </li>
          <li>
            <Link to="/contact" className="link">
              Contacto
            </Link>
          </li>
        </ul>
      </div>
      <div className="link-login">
        <Link to="/login" className="btn-link login">
          Iniciar Sesión
        </Link>
        <Link to="/register" className="btn-link register">
          Registrarse
        </Link>
      </div>
    </nav>
  );
};

