import React, { useState, useEffect, useRef } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../../../context/AuthContext";
import logo from "../../../assets/logo.png";
import "./Navbar.css";
// Iconos de Ionicons 5 (Io...)
import {
  IoLogOutOutline,
  IoCalendarOutline,
  IoPersonOutline,
  IoHomeOutline,
  IoBedOutline,
  IoMailOutline,
  IoGridOutline 
} from "react-icons/io5";

import { FiStar, FiChevronDown } from "react-icons/fi";

const Navbar = () => {
  const { isAuthenticated, isLoadingAuth, user, logout, isClient, isStaff } =
    useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const dropdownRef = useRef(null);
  const navigate = useNavigate();
  const location = useLocation();

  // Efecto para el scroll
  useEffect(() => {
    const handleScroll = () => {
      const isScrolled = window.scrollY > 10;
      if (isScrolled !== scrolled) {
        setScrolled(isScrolled);
      }
    };

    document.addEventListener("scroll", handleScroll);
    return () => document.removeEventListener("scroll", handleScroll);
  }, [scrolled]);

  // Cerrar dropdown al hacer click fuera
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Determinar si estamos en el panel administrativo
  const isAdminPanel = location.pathname.startsWith("/admin");

  // Función para manejar la navegación
  const handleNavigation = (path) => {
    navigate(path);
    setDropdownOpen(false);
    setMobileMenuOpen(false);
  };

  const getInitials = (name) => {
    if (!name) return "?";
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase();
  };

  if (isLoadingAuth) {
    return (
      <div className="Nav loading">
        <div className="loading-spinner"></div>
        <p>Cargando experiencia...</p>
      </div>
    );
  }

  // =================================================================
// NAVBAR PARA ADMINISTRADORES (CON EL NUEVO DROPDOWN UNIFICADO)
// =================================================================
if (isAuthenticated && isStaff() && isAdminPanel) {
  return (
    <nav className="Nav admin-panel-nav">
      <div className="logo-nav">
        <button
          className={`mobile-menu-button ${mobileMenuOpen ? "active" : ""}`}
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          aria-label="Menú móvil"
        >
          <span></span>
          <span></span>
          <span></span>
        </button>
      </div>

      <div className={`nav-container ${mobileMenuOpen ? "mobile-open" : ""}`}>
        <div className="luxury-user-dropdown" ref={dropdownRef}>
          <div
            className="luxury-user-info"
            onClick={() => setDropdownOpen(!dropdownOpen)}
          >
            <div className="luxury-user-avatar admin-avatar">
              {getInitials(user?.name)}
            </div>
            <FiChevronDown className={`dropdown-chevron ${dropdownOpen ? "open" : ""}`} />
            </div>

          {dropdownOpen && (
            <div className="luxury-dropdown-menu">
              <div className="luxury-dropdown-header">
                <div className="luxury-user-avatar large">
                  {getInitials(user?.name)}
                </div>
                <div className="luxury-user-details">
                  <h4>{user?.name || "Usuario"}</h4>
                  <p>{user?.email || ""}</p>
                  <span className="user-role-badge">{user?.role?.name || "Admin"}</span>
                </div>
              </div>

              <div
                className="luxury-dropdown-item"
                onClick={() => handleNavigation("/admin/profile")}
              >
                <IoPersonOutline className="dropdown-icon" />
                <span>Mi Perfil</span>
              </div>

              <div
                className="luxury-dropdown-item"
                onClick={() => handleNavigation("/admin/dashboard")}
              >
                <IoGridOutline className="dropdown-icon" />
                <span>Panel Administrativo</span>
              </div>

              <div className="luxury-dropdown-divider"></div>

              <button
                onClick={() => logout()}
                className="luxury-dropdown-item logout"
              >
                <IoLogOutOutline className="dropdown-icon" />
                <span>Cerrar Sesión</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </nav>
  );

  }
  return (
    <nav
      className={`luxury-nav ${scrolled ? "scrolled" : ""} ${
        mobileMenuOpen ? "mobile-open" : ""
      }`}
    >
      <div className="luxury-nav-container">
        {/* Logo */}
        <div className="luxury-logo" onClick={() => handleNavigation("/")}>
          <img
            src={logo} // Usa tu logo normal
            alt="Logo"
            className={`luxury-logo-img ${scrolled ? "" : "logo-light"}`}
          />
          <span className="luxury-logo-text">
            Los <span>Lagos Barbosa</span>
          </span>
        </div>

        {/* Menú hamburguesa para móvil */}
        <button
          className={`luxury-mobile-menu ${mobileMenuOpen ? "active" : ""}`}
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        >
          <span></span>
          <span></span>
          <span></span>
        </button>

        {/* Menú principal */}
        <div className={`luxury-nav-links ${mobileMenuOpen ? "active" : ""}`}>
          <div
            className="luxury-nav-link"
            onClick={() => handleNavigation("/")}
          >
            <IoHomeOutline className="link-icon" />
            <span>Inicio</span>
          </div>

          <div
            className="luxury-nav-link"
            onClick={() => handleNavigation("/rooms")}
          >
            <IoBedOutline className="link-icon" />
            <span>Habitaciones</span>
          </div>

          <div
            className="luxury-nav-link"
            onClick={() => handleNavigation("/Plans")}
          >
            <FiStar className="link-icon" />
            <span>Planes</span>
          </div>

          <div
            className="luxury-nav-link"
            onClick={() => handleNavigation("/contact")}
          >
            <IoMailOutline className="link-icon" />
            <span>Contacto</span>
          </div>
        </div>

        {/* Sección de usuario/reservas */}
        <div className="luxury-nav-actions">
          {isAuthenticated ? (
            <div className="luxury-user-dropdown" ref={dropdownRef}>
              <div
                className="luxury-user-info"
                onClick={() => setDropdownOpen(!dropdownOpen)}
              >
                <div className="luxury-user-avatar">
                  {getInitials(user?.name)}
                </div>
                <FiChevronDown
                  className={`dropdown-chevron ${dropdownOpen ? "open" : ""}`}
                />
              </div>

              {dropdownOpen && (
                <div className="luxury-dropdown-menu">
                  <div className="luxury-dropdown-header">
                    <div className="luxury-user-avatar large">
                      {getInitials(user?.name)}
                    </div>
                    <div className="luxury-user-details">
                      <h4>{user?.name || "Usuario"}</h4>
                      <p>{user?.email || ""}</p>
                    </div>
                  </div>

                  <div
                    className="luxury-dropdown-item"
                    onClick={() =>
                      handleNavigation(isClient() ? "/profile" : "/admin")
                    }
                  >
                    <IoPersonOutline className="dropdown-icon" />
                    <span>Mi Perfil</span>
                  </div>

                  {isClient() && (
                    <div
                      className="luxury-dropdown-item"
                      onClick={() => handleNavigation("/my-reservations")}
                    >
                      <IoCalendarOutline className="dropdown-icon" />
                      <span>Mis Reservas</span>
                    </div>
                  )}

                  <div className="luxury-dropdown-divider"></div>

                  <button
                    onClick={() => logout()}
                    className="luxury-dropdown-item logout"
                  >
                    <IoLogOutOutline className="dropdown-icon" />
                    <span>Cerrar Sesión</span>
                  </button>
                </div>
              )}
            </div>
          ) : (
            <>
              <button
                className="luxury-nav-button secondary"
                onClick={() => handleNavigation("/login")}
              >
                Iniciar Sesión
              </button>
              <button
                className="luxury-nav-button primary"
                onClick={() => handleNavigation("/register")}
              >
                Reservar Ahora
              </button>
            </>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
