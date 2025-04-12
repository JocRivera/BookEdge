import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../../context/AuthContext';
import logo from '../../../assets/logo.png';
import './Navbar.css';
import { 
  IoLogOutOutline,
  IoCalendarOutline,
  IoPersonOutline,
  IoHomeOutline,
  IoBedOutline,
  IoMailOutline
} from 'react-icons/io5';

const Navbar = () => {
  const { isAuthenticated, isLoadingAuth, user, logout, isClient, isStaff } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);
  const navigate = useNavigate();

  // Cerrar dropdown al hacer click fuera
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Función para manejar la navegación desde el dropdown
  const handleNavigation = (path) => {
    navigate(path);
    setDropdownOpen(false);
    setMobileMenuOpen(false);
  };

  const getInitials = (name) => {
    if (!name) return '?';
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  if (isLoadingAuth) {
    return (
      <div className="Nav loading">
        <div className="loading-spinner"></div>
        <p>Cargando experiencia...</p>
      </div>
    );
  }

  return (
    <nav className={`Nav ${isAuthenticated && !isClient() ? 'staff-nav' : ''}`}>
      {/* Logo a la izquierda */}
      <div className="logo-nav">
        {/* Solo mostrar logo para clientes o cuando no hay autenticación */}
        {(!isAuthenticated || isClient()) && (
          <Link to="/" className="logo-link">
            <img src={logo} alt="Logo" className="logo-image" />
          </Link>
        )}
        
        {/* Botón hamburguesa para móviles */}
        <button 
          className={`mobile-menu-button ${mobileMenuOpen ? 'active' : ''}`}
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          aria-label="Menú móvil"
        >
          <span></span>
          <span></span>
          <span></span>
        </button>
      </div>

      <div className={`nav-container ${mobileMenuOpen ? 'mobile-open' : ''}`}>
        {isAuthenticated ? (
          <>
            <div className="nav-links">
              {isClient() && (
                <ul className="links">
                  <li>
                    <div 
                      className="link" 
                      onClick={() => handleNavigation('/')}
                    >
                      <IoHomeOutline className="link-icon" />
                      <span>Inicio</span>
                    </div>
                  </li>
                  <li>
                    <div 
                      className="link" 
                      onClick={() => handleNavigation('/rooms')}
                    >
                      <IoBedOutline className="link-icon" />
                      <span>Habitaciones</span>
                    </div>
                  </li>
                  <li>
                    <div 
                      className="link" 
                      onClick={() => handleNavigation('/contact')}
                    >
                      <IoMailOutline className="link-icon" />
                      <span>Contacto</span>
                    </div>
                  </li>
                </ul>
              )}
            </div>

            {/* Dropdown de usuario a la derecha */}
            <div className="user-dropdown" ref={dropdownRef}>
              <div 
                className={`user-info ${dropdownOpen ? 'dropdown-open' : ''}`}
                onClick={() => setDropdownOpen(!dropdownOpen)}
              >
                <div className={`user-avatar ${!isClient() ? 'admin-avatar' : ''}`}>
                  {getInitials(user?.name)}
                </div>
                <div className="user-details">
                  <span className="user-name">{user?.name || 'Usuario'}</span>
                  <span className="user-role">{user?.role?.name || 'Sin rol'}</span>
                </div>
              </div>
              
              {dropdownOpen && (
                <div className="dropdown-actions open">
                  <div 
                    className="dropdown-item"
                    onClick={() => handleNavigation(isClient() ? '/profile' : '/admin/profile')}
                  >
                    <IoPersonOutline className="dropdown-item-icon" />
                    <span>Mi Perfil</span>
                  </div>
                  
                  {isClient() && (
                    <div 
                      className="dropdown-item"
                      onClick={() => handleNavigation('/my-reservations')}
                    >
                      <IoCalendarOutline className="dropdown-item-icon" />
                      <span>Mis Reservas</span>
                    </div>
                  )}
                  
                  <button 
                    onClick={() => logout()} 
                    className="dropdown-item logout-item"
                  >
                    <IoLogOutOutline className="dropdown-item-icon" />
                    <span>Cerrar Sesión</span>
                  </button>
                </div>
              )}
            </div>
          </>
        ) : (
          <>
            {/* Enlaces de navegación centrados para usuarios no autenticados */}
            <div className="nav-links">
              <ul className="links">
                <li>
                  <div 
                    className="link" 
                    onClick={() => handleNavigation('/')}
                  >
                    <IoHomeOutline className="link-icon" />
                    <span>Inicio</span>
                  </div>
                </li>
                <li>
                  <div 
                    className="link" 
                    onClick={() => handleNavigation('/rooms')}
                  >
                    <IoBedOutline className="link-icon" />
                    <span>Habitaciones</span>
                  </div>
                </li>
                <li>
                  <div 
                    className="link" 
                    onClick={() => handleNavigation('/contact')}
                  >
                    <IoMailOutline className="link-icon" />
                    <span>Contacto</span>
                  </div>
                </li>
              </ul>
            </div>
            
            <div className="auth-section">
              <div 
                className="btn-link login" 
                onClick={() => handleNavigation('/login')}
              >
                Iniciar Sesión
              </div>
              <div 
                className="btn-link register" 
                onClick={() => handleNavigation('/register')}
              >
                Registrarse
              </div>
            </div>
          </>
        )}
      </div>
    </nav>
  );
};

export default Navbar;