import React, { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { IoSettingsOutline, IoHelpCircleOutline, IoLogOutOutline } from 'react-icons/io5';
import { MdOutlineAccountCircle } from 'react-icons/md';
import './navDropdown.css';

const NavDropdown = ({ sidebarCollapsed}) => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);
  
  // Datos del usuario (puedes reemplazar con tu lógica de autenticación)
  const user = {
    name: "Daniel Rodriguez",
    role: "Administrador",
    avatar: null // URL de la imagen o null para usar iniciales
  };

  // Cerrar dropdown cuando se hace clic fuera de él
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Generar iniciales para el avatar
  const getInitials = (name) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  // Manejar salida del sistema
  const handleLogout = () => {
    // Tu lógica de logout aquí
    console.log('Logout clicked');
  };

  return (
    <nav className={`nav-header ${sidebarCollapsed ? 'sidebar-collapsed' : ''}`}>
      <div className="nav-container">
        <div className="nav-left">
        </div>
        
          {/* Dropdown de usuario */}
          <div className="user-dropdown" ref={dropdownRef}>
            <button 
              className={`user-dropdown-toggle ${isDropdownOpen ? 'active' : ''}`} 
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            >
              {user.avatar ? (
                <img src={user.avatar} alt={user.name} className="user-avatar" />
              ) : (
                <div className="user-avatar-initials">
                  {getInitials(user.name)}
                </div>
              )}
              <span className="user-name">{user.name}</span>
              <span className="dropdown-arrow"></span>
            </button>
            
            {isDropdownOpen && (
              <div className="dropdown-menu">
                <div className="dropdown-header">
                  <div className="user-info">
                    <div className="user-avatar-large">
                      {user.avatar ? (
                        <img src={user.avatar} alt={user.name} />
                      ) : (
                        <div className="avatar-initials-large">{getInitials(user.name)}</div>
                      )}
                    </div>
                    <div className="user-details">
                      <h4>{user.name}</h4>
                      <p>{user.role}</p>
                    </div>
                  </div>
                </div>
                
                <div className="dropdown-content">
                  <Link to="/admin/profile" className="dropdown-item">
                    <MdOutlineAccountCircle className="dropdown-item-icon" />
                    <span>Mi Perfil</span>
                  </Link>
                  <Link to="/admin/settings" className="dropdown-item">
                    <IoSettingsOutline className="dropdown-item-icon" />
                    <span>Configuración</span>
                  </Link>
                  <Link to="/admin/help" className="dropdown-item">
                    <IoHelpCircleOutline className="dropdown-item-icon" />
                    <span>Ayuda</span>
                  </Link>
                  <div className="dropdown-divider"></div>
                  <button onClick={handleLogout} className="dropdown-item logout-item">
                    <IoLogOutOutline className="dropdown-item-icon" />
                    <span>Cerrar Sesión</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      
    </nav>
  );
};

export default NavDropdown;