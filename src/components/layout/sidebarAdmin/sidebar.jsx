import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { IoBedSharp } from 'react-icons/io5';
import { MdDashboard, MdBedroomParent, MdCabin, MdPeople } from 'react-icons/md';
import { IoMdArrowDropdown, IoMdArrowDropup } from 'react-icons/io';
import './sidebar.css';

const Sidebar = () => {
  const [collapsed, setCollapsed] = useState(false);
  const [activeSubMenu, setActiveSubMenu] = useState('');
  const menuRef = useRef(null);

  const toggleSidebar = () => {
    setCollapsed(!collapsed);
    // Propagar el estado del sidebar al componente padre
    const event = new CustomEvent('sidebarToggle', { detail: { collapsed: !collapsed } });
    document.dispatchEvent(event);
    
    // Cerrar submenús al colapsar
    if (!collapsed) {
      setActiveSubMenu('');
    }
  };

  const toggleSubMenu = (menuName, e) => {
    e.preventDefault(); // Prevenir el comportamiento predeterminado
    e.stopPropagation(); // Prevenir que el clic se propague
    
   
      setActiveSubMenu(activeSubMenu === menuName ? '' : menuName);
    
  };

  // Cierra el submenú si se hace clic fuera de él
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setActiveSubMenu('');
      }
    };

    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

  // Datos del submenú para habitaciones
  const habitacionesSubmenu = [
    { 
      path: "/admin/cabins", 
      icon: <MdCabin />, 
      text: "Cabañas" 
    },
    { 
      path: "/admin/rooms", 
      icon: <IoBedSharp />, 
      text: "Habitaciones" 
    }
  ];

  // Calcular la posición del submenú basado en el elemento padre
  const calculateSubmenuPosition = (e) => {
    if (!collapsed) return;
    
    const menuItem = e.currentTarget.closest('.menu-item');
    if (menuItem) {
      const rect = menuItem.getBoundingClientRect();
      const submenu = menuItem.querySelector('.submenu.stacked-buttons');
      
      if (submenu) {
        submenu.style.top = `${rect.top}px`;
      }
    }
  };

  return (
    <div className={`sidebar ${collapsed ? 'collapsed' : ''}`} ref={menuRef}>
      <div className="sidebar-header">
        <div className="logo">
          <div className="logo-icon">B</div>
          <span className="logo-text">BookEdge</span>
        </div>
        <button className="toggle-btn" onClick={toggleSidebar}>
          {collapsed ? '→' : '←'}
        </button>
      </div>
      
      <div className="sidebar-content">
        <ul className="menu-list">
          <li className="menu-item">
            <Link to="/admin/dashboard">
              <span className="menu-icon"><MdDashboard /></span>
              <span className="menu-text">Dashboard</span>
            </Link>
          </li>
          
          <li className="menu-item">
            <Link to="/admin/clients">
              <span className="menu-icon"><MdPeople /></span>
              <span className="menu-text">Clientes</span>
            </Link>
          </li>
          
          <li className={`menu-item ${activeSubMenu === 'habitaciones' ? 'active' : ''}`}>
            <div 
              className="menu-header" 
              onClick={(e) => {
                toggleSubMenu('habitaciones', e);
                calculateSubmenuPosition(e);
              }}
            >
              <span className="menu-icon"><MdBedroomParent /></span>
              <span className="menu-text">Habitaciones</span>
              <span className="menu-arrow">
                {activeSubMenu === 'habitaciones' ? <IoMdArrowDropup /> : <IoMdArrowDropdown />}
              </span>
            </div>
            
            {/* Mostrar submenú normal cuando no está colapsado */}
            {!collapsed && (
              <ul className={`submenu ${activeSubMenu === 'habitaciones' ? 'open' : ''}`}>
                {habitacionesSubmenu.map((item, index) => (
                  <li key={index}>
                    <Link to={item.path}>
                      <span className="menu-icon">{item.icon}</span>
                      <span className="menu-text">{item.text}</span>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
            
            {/* Mostrar botones apilados cuando está colapsado */}
            {collapsed && (
              <ul className={`submenu stacked-buttons ${activeSubMenu === 'habitaciones' ? 'open' : ''}`}>
                {habitacionesSubmenu.map((item, index) => (
                  <li key={index} style={{"--item-index": index}}>
                    <Link to={item.path}>
                      <span className="menu-icon">{item.icon}</span>
                      <span className="menu-text">{item.text}</span>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </li>
          
          <li className="menu-item">
            <Link to="/admin/accommodations">
              <span className="menu-icon"><MdCabin /></span>
              <span className="menu-text">Comodidades</span>
            </Link>
          </li>
        </ul>
      </div>
    </div>
  );
};

export default Sidebar;