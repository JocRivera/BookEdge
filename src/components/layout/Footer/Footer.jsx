import { FaFacebookF, FaTwitter, FaInstagram, FaLinkedinIn } from "react-icons/fa";
import "./Footer.css";

export default function Footer() {
  const currentYear = new Date().getFullYear();
  
  return (
    <footer className="footer">
      <div className="footer-content">
        <div className="footer-section">
          <h3>Contacto</h3>
          <ul>
            <li>
              <a href="mailto:reservas@superlujos.com">loslagos@gmail.com</a>
            </li>
            <li>
              <a href="tel:+541112345678">+57 3021456987</a>
            </li>
            <li>Av El morro dobla la esquina por el sancocho zona Premium</li>
          </ul>
        </div>

        <div className="footer-section">
          <h3>Explorar</h3>
          <ul>
            <li><a href="/habitaciones">Habitaciones</a></li>
            <li><a href="/servicios">Servicios</a></li>
            <li><a href="/galeria">Galería</a></li>
            <li><a href="/contacto">Contacto</a></li>
          </ul>
        </div>

        {/* Sección Redes Sociales */}
        <div className="footer-section">
          <h3>Conéctate</h3>
          <div className="social-links">
            <a href="#"><FaFacebookF /></a>
            <a href="#"><FaTwitter /></a>
            <a href="#"><FaInstagram /></a>
            <a href="#"><FaLinkedinIn /></a>
          </div>
        </div>
      </div>
      
      <div className="copyright">
        &copy; {currentYear} Hosteria Los Lagos. Todos los derechos reservados.
      </div>
    </footer>
  );
}