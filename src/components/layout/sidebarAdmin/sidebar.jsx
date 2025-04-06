import React, { useState, useEffect, useRef } from "react";
import { Link, useLocation } from "react-router-dom";
import {
  LuLayoutDashboard,
  LuUsers,
  LuBedDouble,
  LuHotel,
  LuSettings,
  LuCalendar,
  LuChevronDown,
  LuChevronRight,
  LuBookmark,
} from "react-icons/lu";
import "./sidebar.css";
import { useAuth } from "../../../context/AuthContext";

const Sidebar = () => {
  const [collapsed, setCollapsed] = useState(false);
  const [activeSubMenu, setActiveSubMenu] = useState("");
  const menuRef = useRef(null);
  const location = useLocation();
  const { hasPermission } = useAuth();

  const toggleSidebar = () => {
    setCollapsed(!collapsed);
    const event = new CustomEvent("sidebarToggle", {
      detail: { collapsed: !collapsed },
    });
    document.dispatchEvent(event);

    if (!collapsed) {
      setActiveSubMenu("");
    }
  };

  const toggleSubMenu = (menuName, e) => {
    e.preventDefault();
    e.stopPropagation();
    setActiveSubMenu(activeSubMenu === menuName ? "" : menuName);
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setActiveSubMenu("");
      }
    };

    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, []);

  const roomsSubmenu = [
    {
      path: "/admin/cabins",
      icon: <LuHotel />,
      text: "Cabañas",
    },
    {
      path: "/admin/rooms",
      icon: <LuBedDouble />,
      text: "Habitaciones",
    },
    {
      path: "/admin/AssignAmenities",
      icon: <LuBedDouble />,
      text: "Asignar Comodidades",
    },
  ];

  const bookingsSubmenu = [
    {
      path: "/admin/reservations",
      icon: <LuBookmark />,
      text: "Lista de Reservas",
    },
    {
      path: "/admin/companions",
      icon: <LuUsers />,
      text: "Acompañantes",
    },
    {
      path: "/admin/payments",
      icon: <LuCalendar />,
      text: "Pagos",
    },
  ];

  const calculateSubmenuPosition = (e) => {
    if (!collapsed) return;

    const menuItem = e.currentTarget.closest(".menu-item");
    if (menuItem) {
      const rect = menuItem.getBoundingClientRect();
      const submenu = menuItem.querySelector(".submenu.stacked-buttons");

      if (submenu) {
        submenu.style.top = `${rect.top}px`;
      }
    }
  };

  const isActiveRoute = (path) => {
    return location.pathname === path;
  };

  const isRouteInSubmenu = (submenu) => {
    return submenu.some((item) => isActiveRoute(item.path));
  };


  return (
    <div className={`sidebar ${collapsed ? "collapsed" : ""}`} ref={menuRef}>
      <div className="sidebar-header">
        <div className="logo">
          <div className="logo-icon">B</div>
          {!collapsed && <span className="logo-text">BookEdge</span>}
        </div>
        <button className="toggle-btn" onClick={toggleSidebar}>
          {collapsed ? "→" : "←"}
        </button>
      </div>

      <nav className="sidebar-content">
        <ul className="menu-list">
          <li
            className={`menu-item ${
              isActiveRoute("/admin/dashboard") ? "active" : ""
            }`}
          >
            <Link to="/admin/dashboard">
              <span className="menu-icon">
                <LuLayoutDashboard />
              </span>
              <span className="menu-text">Dashboard</span>
            </Link>
          </li>
          {hasPermission("view_users") && (
            <li
              className={`menu-item ${
                isActiveRoute("/admin/clients") ? "active" : ""
              }`}
            >
              <Link to="/admin/clients">
                <span className="menu-icon">
                  <LuUsers />
                </span>
                <span className="menu-text">Clientes</span>
              </Link>
            </li>
          )}
          <li
            className={`menu-item ${
              activeSubMenu === "rooms" || isRouteInSubmenu(roomsSubmenu)
                ? "active"
                : ""
            }`}
          >
            <div
              className="menu-header"
              onClick={(e) => {
                toggleSubMenu("rooms", e);
                calculateSubmenuPosition(e);
              }}
            >
              <span className="menu-icon">
                <LuBedDouble />
              </span>
              <span className="menu-text">Habitaciones</span>
              <span className="menu-arrow">
                {activeSubMenu === "rooms" ? (
                  <LuChevronDown />
                ) : (
                  <LuChevronRight />
                )}
              </span>
            </div>

            {!collapsed && (
              <ul
                className={`submenu ${activeSubMenu === "rooms" ? "open" : ""}`}
              >
                {roomsSubmenu.map((item, index) => (
                  <li
                    key={index}
                    className={isActiveRoute(item.path) ? "active" : ""}
                  >
                    <Link
                      to={item.path}
                      className={isActiveRoute(item.path) ? "active" : ""}
                    >
                      <span className="menu-icon">{item.icon}</span>
                      <span className="menu-text">{item.text}</span>
                    </Link>
                  </li>
                ))}
              </ul>
            )}

            {collapsed && (
              <ul
                className={`submenu stacked-buttons ${
                  activeSubMenu === "rooms" ? "open" : ""
                }`}
              >
                {roomsSubmenu.map((item, index) => (
                  <li
                    key={index}
                    style={{ "--item-index": index }}
                    className={isActiveRoute(item.path) ? "active" : ""}
                  >
                    <Link
                      to={item.path}
                      className={isActiveRoute(item.path) ? "active" : ""}
                    >
                      <span className="menu-icon">{item.icon}</span>
                      <span className="menu-text">{item.text}</span>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </li>

          <li
            className={`menu-item ${
              isActiveRoute("/admin/accommodations") ? "active" : ""
            }`}
          >
            <Link to="/admin/accommodations">
              <span className="menu-icon">
                <LuHotel />
              </span>
              <span className="menu-text">Comodidades</span>
            </Link>
          </li>

          <li
            className={`menu-item ${
              activeSubMenu === "bookings" || isRouteInSubmenu(bookingsSubmenu)
                ? "active"
                : ""
            }`}
          >
            <div
              className="menu-header"
              onClick={(e) => {
                toggleSubMenu("bookings", e);
                calculateSubmenuPosition(e);
              }}
            >
              <span className="menu-icon">
                <LuCalendar />
              </span>
              <span className="menu-text">Reservas</span>
              <span className="menu-arrow">
                {activeSubMenu === "bookings" ? (
                  <LuChevronDown />
                ) : (
                  <LuChevronRight />
                )}
              </span>
            </div>

            {!collapsed && (
              <ul
                className={`submenu ${
                  activeSubMenu === "bookings" ? "open" : ""
                }`}
              >
                {bookingsSubmenu.map((item, index) => (
                  <li
                    key={index}
                    className={isActiveRoute(item.path) ? "active" : ""}
                  >
                    <Link
                      to={item.path}
                      className={isActiveRoute(item.path) ? "active" : ""}
                    >
                      <span className="menu-icon">{item.icon}</span>
                      <span className="menu-text">{item.text}</span>
                    </Link>
                  </li>
                ))}
              </ul>
            )}

            {collapsed && (
              <ul
                className={`submenu stacked-buttons ${
                  activeSubMenu === "bookings" ? "open" : ""
                }`}
              >
                {bookingsSubmenu.map((item, index) => (
                  <li
                    key={index}
                    style={{ "--item-index": index }}
                    className={isActiveRoute(item.path) ? "active" : ""}
                  >
                    <Link
                      to={item.path}
                      className={isActiveRoute(item.path) ? "active" : ""}
                    >
                      <span className="menu-icon">{item.icon}</span>
                      <span className="menu-text">{item.text}</span>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </li>

          <li
            className={`menu-item ${
              isActiveRoute("/admin/config") ? "active" : ""
            }`}
          >
            <Link to="/admin/config">
              <span className="menu-icon">
                <LuSettings />
              </span>
              <span className="menu-text">Configuración</span>
            </Link>
          </li>
          <li className="menu-item">
            <Link to="/admin/services">
              <span className="menu-icon">
                <LuHotel />
              </span>
              <span className="menu-text">Servicios</span>
            </Link>
          </li>
        </ul>
      </nav>
    </div>
  );
};

export default Sidebar;

//provando cambios
