import "./Footer.css";

export default function Footer() {

    const currentYear = new Date().getFullYear();
  return (
    <footer className="footer">
      <nav className="footer-content">
        <section className="company-info">
          <h3>Sobre nosotros</h3>
          <p>
            Somos una empresa comprometida con brindar los mejores servicios a
            nuestros clientes.
          </p>
        </section>
        <nav className="quick-links">
          <h3>Enlaces rapidos</h3>
          <ul>
            <li>
              <a href="#">Inicio</a>
            </li>
            <li>
              <a href="#">Servicios</a>
            </li>
            <li>
              <a href="#">Contacto</a>
            </li>
          </ul>
        </nav>

        <address className="contact-info">
          <h3>Contacto</h3>
          <ul>
            <li>
              <a href="juan201pablo@gmail.com">info@empresa.com</a>
            </li>
            <li>
              <a href="tel:123456789">+54 9 11 1234 5678</a>
            </li>
            <li> Cr51 N95 30 aranjuez</li>
          </ul>
        </address>

        <nav className="social-media">
          <h3>Redes Sociales</h3>
          <ul>
            <li><a href="#">Facebook</a></li>
            <li><a href="#">Twitter</a></li>
            <li><a href="#">Instagram</a></li>
            <li><a href="#">LinkedIn</a></li>
          </ul>
        </nav>
        
      </nav>
      <small className="copyright">
             &copy; {currentYear} BookEdge. Todos los derechos reservados.
        </small>
    </footer>
  );
}
