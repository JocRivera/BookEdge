import React, { useState, useEffect, useRef } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../../../context/AuthContext";
import logo from "../../../assets/logo.png";
import "./Navbar.css"; 
import Profile from "../../features/componentAuth/Profile"; 

import {
  IoLogOutOutline,
  IoCalendarOutline,
  IoPersonOutline,
  IoHomeOutline,
  IoBedOutline,
  IoMailOutline,
  IoSettingsOutline,
  IoReturnUpBackOutline,
} from "react-icons/io5";
import { FiStar, FiChevronDown, FiChevronUp } from "react-icons/fi";
import { RiCalendarScheduleLine } from "react-icons/ri";

const Navbar = () => {
  // ----- ESTADOS DEL COMPONENTE -----
  const { isAuthenticated, isLoadingAuth, user, logout, isClient, isStaff } = useAuth();
  
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false); // Controla el menú móvil
  const [userDropdownOpen, setUserDropdownOpen] = useState(false); // Controla el dropdown de usuario
  const [scrolled, setScrolled] = useState(false); // Para el efecto de scroll en navbar público
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false); // Controla la visibilidad del modal de perfil

  // ----- REFERENCIAS Y HOOKS DE ROUTER -----
  const userDropdownRef = useRef(null); // Ref para detectar clics fuera del dropdown
  const navigate = useNavigate(); // Para navegación programática
  const location = useLocation(); // Para obtener la ruta actual

  const isAdminPanel = location.pathname.startsWith("/admin"); // Determina si estamos en el panel de admin

  // ----- EFECTOS (useEffect) -----

  //SCROOLL PUBLICO
  useEffect(() => {
    if (isProfileModalOpen) {
      // Cuando el modal se abre, deshabilita el scroll del body
      document.body.style.overflow = 'hidden';
    } else {
      // Cuando el modal se cierra, restaura el scroll del body
      document.body.style.overflow = 'visible'; // O 'auto' si prefieres
    }

    // Función de limpieza para asegurarse de que el scroll se restaure si el componente se desmonta con el modal abierto
    return () => {
      document.body.style.overflow = 'visible'; // O 'auto'
    };
  }, [isProfileModalOpen]); // Este efecto se ejecuta cada vez que 'isProfileModalOpen' cambia


  // Efecto para el scroll del navbar público (se añade/quita transparencia)
  useEffect(() => {
    const handleScroll = () => {
      const isScrolled = window.scrollY > 10;
      if (isScrolled !== scrolled) {
        setScrolled(isScrolled);
      }
    };
    // Solo aplica este efecto si NO estamos en el panel de admin
    if (!isAdminPanel) {
      document.addEventListener("scroll", handleScroll);
      return () => document.removeEventListener("scroll", handleScroll);
    } else {
      // Si entramos al panel de admin, nos aseguramos que el navbar público no tenga 'scrolled'
      setScrolled(false); 
    }
  }, [scrolled, isAdminPanel, location.pathname]); // location.pathname aquí para re-evaluar cuando cambiamos de público a admin y viceversa

  // Efecto para cerrar el dropdown de usuario si se hace clic fuera de él
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (userDropdownRef.current && !userDropdownRef.current.contains(event.target)) {
        setUserDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []); // Se ejecuta solo una vez al montar el componente

  // Efecto para cerrar el Modal de Perfil con la tecla "Escape"
  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === 'Escape' && isProfileModalOpen) {
        setIsProfileModalOpen(false);
      }
    };
    if (isProfileModalOpen) { // Solo añade el listener si el modal está abierto
      document.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isProfileModalOpen]); // Depende del estado de visibilidad del modal

  // ----- FUNCIONES AUXILIARES -----

  // Navegación genérica, cierra menús
  const handleNavigation = (path) => {
    navigate(path);
    setUserDropdownOpen(false);
    setMobileMenuOpen(false);
  };

  // Scroll suave a secciones dentro de la misma página o navega a home y luego hace scroll
  const scrollToSection = (sectionId) => {
    setMobileMenuOpen(false);
    setUserDropdownOpen(false);
    if (location.pathname !== '/') {
      navigate('/');
      // Esperamos un poco para que la navegación a home se complete antes de intentar hacer scroll
      setTimeout(() => scrollWithOffset(sectionId), 150); 
    } else {
      scrollWithOffset(sectionId);
    }
  };

  // Lógica real del scroll con un offset para el navbar fijo
  const scrollWithOffset = (sectionId) => {
    const section = document.getElementById(sectionId);
    if (section) {
      const yOffset = -80; // Ajusta esto a la altura de tu navbar fijo
      const elementPosition = section.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset + yOffset;
      window.scrollTo({ top: offsetPosition, behavior: 'smooth' });
    }
  };

  // Obtiene iniciales del nombre para el avatar
  const getInitials = (name) => {
    if (!name) return "?";
    return name.split(" ").map((n) => n[0]).join("").toUpperCase();
  };

  // ----- RENDERIZADO -----

  // Estado de Carga mientras se verifica la autenticación
  if (isLoadingAuth) {
    return (
      <nav className={`navbar-loading-state ${isAdminPanel ? "admin" : "public"}`}>
        <div className="loading-spinner"></div>
      </nav>
    );
  }

  // --- NAVBAR PARA EL PANEL DE ADMINISTRADOR ---
  if (isAuthenticated && isStaff() && isAdminPanel) {
    return (
      <> {/* Fragmento para poder renderizar el modal fuera del <nav> */}
        <nav className="navbar-admin">
          <div className="navbar-admin-content">
            {/* Logo o Título del Panel (opcional) - No estaba en tu original, pero podrías añadirlo */}
            {/* 
            <Link to="/admin" className="navbar-admin-logo">
              <img src={logo} alt="Bookedge Admin Panel" />
              <span>Panel Admin</span>
            </Link> 
            */}

            <div className="navbar-admin-actions"> {/* Contenedor para alinear a la derecha */}
              <div className="admin-user-dropdown" ref={userDropdownRef}>
                <button
                  className="admin-user-dropdown-toggle"
                  onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                  aria-expanded={userDropdownOpen}
                  aria-label="Menú de usuario del administrador"
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
                    
                    {/* Botón para abrir el Modal de Perfil */}
                    <button
                      className="admin-dropdown-item" 
                      onClick={() => {
                        setIsProfileModalOpen(true);
                        setUserDropdownOpen(false); // Cierra el dropdown
                      }}
                    >
                      <IoPersonOutline /> Mi Perfil
                    </button>
                    
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
        
        {/* Renderizado del Modal de Perfil (si está abierto) */}
        {isProfileModalOpen && (
          <div 
            className="profile-modal-overlay"
            onClick={(e) => { // Cierre al hacer clic en el overlay
              if (e.target === e.currentTarget) {
                setIsProfileModalOpen(false);
              }
            }}
          >
            <Profile onClose={() => setIsProfileModalOpen(false)} /> {/* Pasa la función para cerrar el modal */}
          </div>
        )}
      </>
    );
  }

  // --- NAVBAR PÚBLICO (PARA CLIENTES Y VISITANTES) ---
  return (
    <> {/* Fragmento para poder renderizar el modal fuera del <nav> */}
      <nav className={`navbar-public ${scrolled ? "scrolled" : ""} ${mobileMenuOpen ? "mobile-open" : ""}`}>
        <div className="navbar-public-container">
          {/* Logo */}
          <div className="navbar-public-logo" onClick={() => handleNavigation("/")}>
            <img src={logo} alt="Bookedge Logo" className="public-logo-img" />
          </div>

          {/* Botón del Menú Móvil (Hamburguesa) */}
          <button
            className={`navbar-mobile-menu-button ${mobileMenuOpen ? "active" : ""}`}
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label={mobileMenuOpen ? "Cerrar menú" : "Abrir menú"}
            aria-expanded={mobileMenuOpen}
          >
            <span></span><span></span><span></span> {/* Para el icono de hamburguesa/cruz */}
          </button>

          {/* Enlaces del Navbar Público */}
          <div className={`navbar-public-links ${mobileMenuOpen ? "active" : ""}`}>
            <div className="navbar-public-link" onClick={() => scrollToSection("inicio")}>
              <IoHomeOutline /> Inicio
            </div>
            <div className="navbar-public-link" onClick={() => scrollToSection("habitaciones")}>
              <IoBedOutline /> Habitaciones
            </div>
            <div className="navbar-public-link" onClick={() => scrollToSection("services")}>
              <FiStar /> Servicios
            </div>
            <div className="navbar-public-link" onClick={() => scrollToSection("plans")}>
              <RiCalendarScheduleLine /> Planes
            </div>
            <div className="navbar-public-link" onClick={() => handleNavigation("/contact")}>
              <IoMailOutline /> Contacto
            </div>
            {/* Botones de autenticación en el menú móvil (si no está autenticado) */}
            {mobileMenuOpen && !isAuthenticated && (
              <div className="navbar-mobile-auth-actions">
                <button className="navbar-public-button secondary" onClick={() => handleNavigation("/login")}>Iniciar Sesión</button>
                <button className="navbar-public-button primary" onClick={() => handleNavigation("/register")}>Registrarse</button>
              </div>
            )}
          </div>

          {/* Acciones del Navbar Público (Dropdown de usuario o botones de Login/Registro) */}
          <div className="navbar-public-actions">
            {isAuthenticated ? ( // Si el usuario está autenticado
              <div className="public-user-dropdown" ref={userDropdownRef}>
                <button
                  className="public-user-dropdown-toggle"
                  onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                  aria-expanded={userDropdownOpen}
                  aria-label="Menú de usuario"
                >
                  <div className="public-user-avatar">{getInitials(user?.name)}</div>
                  <span className="public-user-name-desktop">{user?.name}</span>
                  {userDropdownOpen ? <FiChevronUp size={18} /> : <FiChevronDown size={18} />}
                </button>
                {userDropdownOpen && (
                  <div className="public-dropdown-menu">
                    <div className="public-dropdown-header">
                      <div className="public-user-avatar large">{getInitials(user?.name)}</div>
                      <div className="public-user-details">
                        <strong>{user?.name}</strong>
                        <span>{user?.email}</span>
                        {/* No mostramos rol explícitamente en el dropdown público a menos que sea relevante */}
                      </div>
                    </div>
                    
                    {/* Botón para abrir el Modal de Perfil para clientes y staff desde el navbar público */}
                    <button
                      className="public-dropdown-item"
                      onClick={() => {
                        setIsProfileModalOpen(true);
                        setUserDropdownOpen(false);
                      }}
                    >
                      <IoPersonOutline /> Mi Perfil
                    </button>

                    {/* Enlace a "Mis Reservas" solo si es cliente */}
                    {isClient() && (
                      <Link to="/my-reservations" className="public-dropdown-item" onClick={() => setUserDropdownOpen(false)}>
                        <IoCalendarOutline /> Mis Reservas
                      </Link>
                    )}

                    {/* Enlace al Panel Admin si el usuario es Staff y NO está ya en el panel de admin */}
                    {isStaff() && !isAdminPanel && (
                         <Link to="/admin" className="public-dropdown-item" onClick={() => setUserDropdownOpen(false)}>
                            <IoReturnUpBackOutline /> Ir al Panel Admin 
                            {/* Opcional: Usar IoGridOutline si se prefiere para panel */}
                         </Link>
                    )}
                    
                    <div className="public-dropdown-divider"></div>
                    <button onClick={logout} className="public-dropdown-item logout">
                      <IoLogOutOutline /> Cerrar Sesión
                    </button>
                  </div>
                )}
              </div>
            ) : ( // Si el usuario NO está autenticado (visible en desktop)
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

      {/* Renderizado del Modal de Perfil (si está abierto) */}
      {isProfileModalOpen && (
        <div 
          className="profile-modal-overlay"
          onClick={(e) => { // Cierre al hacer clic en el overlay
            if (e.target === e.currentTarget) { // Asegura que el clic es en el overlay, no en el modal
              setIsProfileModalOpen(false);
            }
          }}
        >
          <Profile onClose={() => setIsProfileModalOpen(false)} /> {/* Componente de contenido del modal */}
        </div>
      )}
    </>
  );
};

export default Navbar;
