// --- START OF FILE Navbar.jsx (Completo y Modificado) ---
import React, { useState, useEffect, useRef } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../../../context/AuthContext"; 
import logo from "../../../assets/logo.png"; 
import "./Navbar.css"; 

// Iconos
import {
  IoLogOutOutline,
  IoCalendarOutline,
  IoPersonOutline,
  IoHomeOutline,
  IoBedOutline,
  IoMailOutline,
  IoGridOutline,      // Para el panel de admin
  IoSettingsOutline,  // Para configuración
  IoReturnUpBackOutline // Para volver al sitio público
} from "react-icons/io5";
import { FiStar, FiChevronDown, FiChevronUp } from "react-icons/fi";

const Navbar = () => {
  const { isAuthenticated, isLoadingAuth, user, logout, isClient, isStaff } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const userDropdownRef = useRef(null);
  const navigate = useNavigate();
  const location = useLocation();

  // Efecto para el scroll del navbar público
  useEffect(() => {
    const handleScroll = () => {
      const isScrolled = window.scrollY > 10;
      if (isScrolled !== scrolled) {
        setScrolled(isScrolled);
      }
    };
    if (!isAdminPanel) { // Solo aplicar scroll effect al navbar público
      document.addEventListener("scroll", handleScroll);
      return () => document.removeEventListener("scroll", handleScroll);
    }
  }, [scrolled, location.pathname]); // Añadir location.pathname para re-evaluar

  // Cerrar dropdown al hacer click fuera
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (userDropdownRef.current && !userDropdownRef.current.contains(event.target)) {
        setUserDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const isAdminPanel = location.pathname.startsWith("/admin");

  const handleNavigation = (path) => {
    navigate(path);
    setUserDropdownOpen(false);
    setMobileMenuOpen(false); // También cierra el menú móvil
  };

  const scrollToSection = (sectionId) => {
    if (location.pathname !== '/') {
      navigate('/');
      setTimeout(() => scrollWithOffset(sectionId), 100);
    } else {
      scrollWithOffset(sectionId);
    }
    setMobileMenuOpen(false);
    setUserDropdownOpen(false);
  };

  const scrollWithOffset = (sectionId) => {
    const section = document.getElementById(sectionId);
    if (section) {
      const yOffset = -80; // Ajusta según la altura de tu navbar fijo
      const elementPosition = section.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset + yOffset;
      window.scrollTo({ top: offsetPosition, behavior: 'smooth' });
    }
  };

  const getInitials = (name) => {
    if (!name) return "?";
    return name.split(" ").map((n) => n[0]).join("").toUpperCase();
  };

  // Estado de Carga
  if (isLoadingAuth) {
    return (
      <nav className={`navbar-loading-state ${isAdminPanel ? "admin" : "public"}`}>
        <div className="loading-spinner"></div>
        {/* Opcional: <p>Cargando...</p> */}
      </nav>
    );
  }

  // =================================================================
  //       NAVBAR PARA EL PANEL DE ADMINISTRADOR
  // =================================================================
  if (isAuthenticated && isStaff() && isAdminPanel) {
    return (
      <nav className="navbar-admin">
        <div className="navbar-admin-content">
          

          <div className="navbar-admin-actions">
            <div className="admin-user-dropdown" ref={userDropdownRef}>
              <button
                className="admin-user-dropdown-toggle"
                onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                aria-expanded={userDropdownOpen}
                aria-label="Menú de usuario"
              >
                <div className="admin-user-avatar">{getInitials(user?.name)}</div>
                <span className="admin-user-name">{user?.name || "Staff"}</span>
                {userDropdownOpen ? <FiChevronUp size={18} /> : <FiChevronDown size={18} />}
              </button>

              {userDropdownOpen && (
                <div className="admin-dropdown-menu">
                  <div className="admin-dropdown-header">
                    <div className="admin-user-avatar large">{getInitials(user?.name)}</div>
                    <div className="admin-user-details">
                      <strong>{user?.name}</strong>
                      <span>{user?.email}</span>
                      <span className="admin-role-badge">{user?.role?.name || "Staff"}</span>
                    </div>
                  </div>
                  
                  <Link to="/admin/profile" className="admin-dropdown-item" onClick={() => setUserDropdownOpen(false)}>
                    <IoPersonOutline /> Mi Perfil
                  </Link>
                  
                  <Link to="/admin/settings" className="admin-dropdown-item" onClick={() => setUserDropdownOpen(false)}>
                    <IoSettingsOutline /> Configuración
                  </Link>
                  <Link to="/" className="admin-dropdown-item" onClick={() => setUserDropdownOpen(false)}>
                    <IoReturnUpBackOutline /> Volver al Sitio Público
                  </Link>
                  <div className="admin-dropdown-divider"></div>
                  <button onClick={logout} className="admin-dropdown-item logout">
                    <IoLogOutOutline /> Cerrar Sesión
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </nav>
    );
  }

  // =================================================================
  //       NAVBAR PÚBLICO (PARA CLIENTES Y VISITANTES)
  // =================================================================
  return (
    <nav className={`navbar-public ${scrolled ? "scrolled" : ""} ${mobileMenuOpen ? "mobile-open" : ""}`}>
      <div className="navbar-public-container">
        <div className="navbar-public-logo" onClick={() => handleNavigation("/")}>
          <img src={logo} alt="Bookedge Logo" className="public-logo-img" />
        </div>

        <button
          className={`navbar-mobile-menu-button ${mobileMenuOpen ? "active" : ""}`}
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          aria-label={mobileMenuOpen ? "Cerrar menú" : "Abrir menú"}
          aria-expanded={mobileMenuOpen}
        >
          <span></span><span></span><span></span>
        </button>

        <div className={`navbar-public-links ${mobileMenuOpen ? "active" : ""}`}>
          <div className="navbar-public-link" onClick={() => scrollToSection("inicio")}> {/* Cambia 'inicio' por el ID real de tu sección de inicio */}
            <IoHomeOutline /> Inicio
          </div>
          <div className="navbar-public-link" onClick={() => scrollToSection("habitaciones")}>
            <IoBedOutline /> Habitaciones
          </div>
          <div className="navbar-public-link" onClick={() => scrollToSection("services")}> {/* O "planes" */}
            <FiStar /> Planes
          </div>
          <div className="navbar-public-link" onClick={() => handleNavigation("/contact")}>
            <IoMailOutline /> Contacto
          </div>
          {/* Opciones de login/registro si el menú móvil está abierto y no autenticado */}
          {mobileMenuOpen && !isAuthenticated && (
            <div className="navbar-mobile-auth-actions">
              <button className="navbar-public-button secondary" onClick={() => handleNavigation("/login")}>Iniciar Sesión</button>
              <button className="navbar-public-button primary" onClick={() => handleNavigation("/register")}>Registrarse</button>
            </div>
          )}
        </div>

        <div className="navbar-public-actions">
          {isAuthenticated ? (
            <div className="public-user-dropdown" ref={userDropdownRef}>
              <button
                className="public-user-dropdown-toggle"
                onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                aria-expanded={userDropdownOpen}
                aria-label="Menú de usuario"
              >
                <div className="public-user-avatar">{getInitials(user?.name)}</div>
                <span className="public-user-name-desktop">{user?.name}</span> {/* Visible en desktop */}
                {userDropdownOpen ? <FiChevronUp size={18} /> : <FiChevronDown size={18} />}
              </button>
              {userDropdownOpen && (
                <div className="public-dropdown-menu">
                  <div className="public-dropdown-header">
                    <div className="public-user-avatar large">{getInitials(user?.name)}</div>
                    <div className="public-user-details">
                      <strong>{user?.name}</strong>
                      <span>{user?.email}</span>
                    </div>
                  </div>
                  
                  <Link to={isClient() ? "/profile" : "/admin"} className="public-dropdown-item" onClick={() => setUserDropdownOpen(false)}>
                    <IoPersonOutline /> {isClient() ? "Mi Perfil" : (isAdminPanel ? "Mi Perfil Admin" : "Panel Admin")}
                  </Link>

                  {isClient() && (
                    <Link to="/my-reservations" className="public-dropdown-item" onClick={() => setUserDropdownOpen(false)}>
                      <IoCalendarOutline /> Mis Reservas
                    </Link>
                  )}
                  
                    

                  <div className="public-dropdown-divider"></div>
                  <button onClick={logout} className="public-dropdown-item logout">
                    <IoLogOutOutline /> Cerrar Sesión
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="navbar-public-auth-buttons-desktop">
              <button className="navbar-public-button secondary" onClick={() => handleNavigation("/login")}>
                Iniciar Sesión
              </button>
              <button className="navbar-public-button primary" onClick={() => handleNavigation("/register")}>
                Registrarse
              </button>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
// --- END OF FILE Navbar.jsx ---