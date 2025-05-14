// --- Sidebar.jsx ---
import React, { useState, useEffect, useRef, useCallback } from "react";
import { Link, useLocation } from "react-router-dom";
import {
  LuLayoutDashboard, LuUsers, LuBedDouble, LuHotel, LuSettings,
  LuCalendar, LuChevronDown, LuChevronRight, LuBookmark, LuCreditCard,
  LuChevronsLeft, LuChevronsRight, LuGitBranch
} from "react-icons/lu";
import "./sidebar.css";
import miLogoCompleto from "../../../assets/bookedge4.jpg";

const Sidebar = () => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [activeSubMenu, setActiveSubMenu] = useState("");
  const [flyoutPanelStyle, setFlyoutPanelStyle] = useState({});
  const [toggleButtonLeft, setToggleButtonLeft] = useState("0px"); // Estado para el left del botón

  const sidebarRef = useRef(null);
  const flyoutPanelRef = useRef(null);
  const location = useLocation();

  useEffect(() => {
    const manuallyCollapsed = localStorage.getItem("sidebarManuallyCollapsed") === "true";
    if (manuallyCollapsed) {
      setIsCollapsed(true);
    } else {
      setIsCollapsed(window.innerWidth < 768);
    }
  }, []);

  // Efecto para calcular la posición del botón cuando cambie isCollapsed o al montar
  useEffect(() => {
    const rootStyle = getComputedStyle(document.documentElement);
    const sidebarWidthExpandedPx = parseInt(rootStyle.getPropertyValue('--sidebar-width-expanded').replace('px', '')) || 230;
    const sidebarWidthCollapsedPx = parseInt(rootStyle.getPropertyValue('--sidebar-width-collapsed').replace('px', '')) || 68;
    // Debes asegurarte que --toggle-btn-actual-width esté definido en tu CSS
    const toggleBtnWidthPx = parseInt(rootStyle.getPropertyValue('--toggle-btn-actual-width').replace('px', '')) || 40;

    let newLeft;
    if (isCollapsed) {
      newLeft = `${sidebarWidthCollapsedPx - (toggleBtnWidthPx / 2)}px`;
    } else {
      newLeft = `${sidebarWidthExpandedPx - (toggleBtnWidthPx / 2)}px`;
    }
    setToggleButtonLeft(newLeft);

  }, [isCollapsed]); // Depende de isCollapsed


  const toggleSidebar = () => {
    const newCollapsedState = !isCollapsed;
    setIsCollapsed(newCollapsedState);
    setActiveSubMenu("");

    const event = new CustomEvent("sidebarToggle", {
      detail: { collapsed: newCollapsedState },
    });
    document.dispatchEvent(event);

    if (newCollapsedState) {
      localStorage.setItem("sidebarManuallyCollapsed", "true");
    } else {
      localStorage.removeItem("sidebarManuallyCollapsed");
    }
  };

  const handleMenuHeaderClick = useCallback(
    (menuName, e) => {
      e.preventDefault();
      e.stopPropagation();
      const newActiveSubMenu = activeSubMenu === menuName ? "" : menuName;
      setActiveSubMenu(newActiveSubMenu);

      if (isCollapsed && newActiveSubMenu) {
        const menuItemElement = e.currentTarget.closest(".menu-item");
        if (menuItemElement && sidebarRef.current) {
          const itemRect = menuItemElement.getBoundingClientRect();
          let topPosition = itemRect.top;
          const flyoutHeightEstimate = 150;
          const windowHeight = window.innerHeight;
          const rootStyle = getComputedStyle(document.documentElement);
          const sidebarCollapsedWidth = parseInt(rootStyle.getPropertyValue("--sidebar-width-collapsed").replace("px","")) || 68;
          const spaceXs = parseInt(rootStyle.getPropertyValue("--space-xs").replace("px", "")) || 4;

          if (topPosition + flyoutHeightEstimate > windowHeight - 10) {
            topPosition = windowHeight - flyoutHeightEstimate - 10;
          }
          if (topPosition < 10) {
            topPosition = 10;
          }
          setFlyoutPanelStyle({
            top: `${topPosition}px`,
            left: `${sidebarCollapsedWidth + spaceXs}px`,
          });
        }
      }
    },
    [activeSubMenu, isCollapsed]
  );

  useEffect(() => {
    const handleClickOutside = (event) => {
      const target = event.target;
      if (isCollapsed && activeSubMenu && flyoutPanelRef.current && !flyoutPanelRef.current.contains(target)) {
        const clickedOnCollapsedMenuHeader = target.closest(".sidebar.collapsed .menu-item > .menu-header");
        if (!clickedOnCollapsedMenuHeader) setActiveSubMenu("");
      }
      // Comentado para no cerrar dropdowns si se hace clic fuera del sidebar cuando está expandido
      // if (!isCollapsed && activeSubMenu && sidebarRef.current && !sidebarRef.current.contains(target)) {
      //   setActiveSubMenu("");
      // }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isCollapsed, activeSubMenu]);

  useEffect(() => {
    const handleResize = () => {
      const manuallyCollapsed = localStorage.getItem("sidebarManuallyCollapsed") === "true";
      if (window.innerWidth < 768) {
        if (!isCollapsed) setIsCollapsed(true);
      } else {
        if (isCollapsed && !manuallyCollapsed) setIsCollapsed(false);
      }
      // Recalcular la posición del botón en resize también
      const rootStyle = getComputedStyle(document.documentElement);
      const sidebarWidthExpandedPx = parseInt(rootStyle.getPropertyValue('--sidebar-width-expanded').replace('px', '')) || 230;
      const sidebarWidthCollapsedPx = parseInt(rootStyle.getPropertyValue('--sidebar-width-collapsed').replace('px', '')) || 68;
      const toggleBtnWidthPx = parseInt(rootStyle.getPropertyValue('--toggle-btn-actual-width').replace('px', '')) || 40;
      let newLeft;
        if (window.innerWidth < 768 || (isCollapsed && manuallyCollapsed)) { // Considera el estado actual de isCollapsed
            newLeft = `${sidebarWidthCollapsedPx - (toggleBtnWidthPx / 2)}px`;
        } else {
            newLeft = `${sidebarWidthExpandedPx - (toggleBtnWidthPx / 2)}px`;
        }
      setToggleButtonLeft(newLeft);

    };
    window.addEventListener("resize", handleResize);
    // Ejecutar handleResize una vez al montar para establecer la posición inicial correcta del botón
    handleResize(); 
    return () => window.removeEventListener("resize", handleResize);
  }, [isCollapsed]); // Añadimos isCollapsed a las dependencias de resize

  const menuItemsStructure = [
    { type: "title", text: "Principal" },
    { path: "/admin/dashboard", icon: <LuLayoutDashboard />, text: "Dashboard" },
    { type: "title", text: "Gestión" },
    { path: "/admin/users", icon: <LuUsers />, text: "Usuarios" },
    { path: "/admin/customer", icon: <LuUsers />, text: "Clientes" },
    { type: "title", text: "Gestión  Habitaciones" },
    {
      text: "Habitaciones", icon: <LuBedDouble />, submenuName: "rooms",
      subItems: [
        { path: "/admin/cabins", icon: <LuHotel />, text: "Cabañas" },
        { path: "/admin/rooms", icon: <LuBedDouble />, text: "Habitaciones" },
        { path: "/admin/AssignAmenities", icon: <LuHotel />, text: "Comodidades Habit." },
        { path: "/admin/accommodations", icon: <LuHotel />, text: "Lista Comodidades" },
      ],
    },
    { type: "title", text: "Planes & Reservas" },
    {
      text: "Planes", icon: <LuCreditCard />, submenuName: "plans",
      subItems: [
        { path: "/admin/plans", icon: <LuCreditCard />, text: "Planes" },
        { path: "/admin/plansProgramed", icon: <LuCalendar />, text: "Planes Prog." },
      ],
    },
    {
      text: "Reservas", icon: <LuCalendar />, submenuName: "bookings",
      subItems: [
        { path: "/admin/reservations", icon: <LuBookmark />, text: "Lista Reservas" },
        { path: "/admin/companions", icon: <LuUsers />, text: "Acompañantes" },
        { path: "/admin/payments", icon: <LuCreditCard />, text: "Pagos" },
      ],
    },
    { path: "/admin/services", icon: <LuGitBranch />, text: "Servicios" },
    { path: "/admin/config", icon: <LuSettings />, text: "Configuración" },
  ];

  const isActiveRoute = (path) => path && (location.pathname === path || (path !== "/admin/dashboard" && location.pathname.startsWith(path + "/")));
  const isSubmenuParentActive = (subItems) => Array.isArray(subItems) && subItems.some((item) => isActiveRoute(item.path));

  const renderSubmenuItems = (subItems, isFlyout = false) => {
    if (!Array.isArray(subItems)) return null;
    return subItems.map((item, index) => {
      if (typeof item !== "object" || item === null || !item.path) {
        return <li key={`${isFlyout ? "flyout" : "dropdown"}-invalid-item-${index}`}><span>Ítem Inválido</span></li>;
      }
      return (
        <li key={`${isFlyout ? "flyout" : "dropdown"}-item-${index}-${item.path}`} style={isFlyout ? { "--item-index": index } : {}} className={isActiveRoute(item.path) ? "active" : ""}>
          <Link to={item.path} onClick={() => { if (isFlyout || !isCollapsed) setActiveSubMenu(""); }}>
            {item.icon && <span className="menu-icon">{item.icon}</span>}
            {item.text && <span className="menu-text">{item.text}</span>}
          </Link>
        </li>
      );
    });
  };

  return (
    <> {/* MUY IMPORTANTE: El botón está FUERA del div.sidebar */}
      <div
        className={`sidebar ${isCollapsed ? "collapsed" : ""}`}
        ref={sidebarRef}
      >
        <div className="sidebar-header">
          <div className="logo-logo-stacked">
            <img
              src={miLogoCompleto}
              alt="Logo Principal"
              className={`logo-image-display ${isCollapsed ? 'collapsed-logo' : 'expanded-logo'}`}
            />
          </div>
        </div>
        <nav className="sidebar-content">
          <ul className="menu-list">
            {menuItemsStructure.map((item, index) => {
              if (item.type === "title") {
                return (
                  <li key={`title-${index}-${item.text}`} className="menu-section-title-container">
                    <div className="menu-section-title-line"></div>
                    <span className="menu-section-title-text">{item.text}</span>
                    <div className="menu-section-title-line"></div>
                  </li>
                );
              }
              if (item.subItems) {
                const isParentActive = isSubmenuParentActive(item.subItems);
                return (
                  <li key={item.submenuName || `subparent-${index}-${item.text}`} className={`menu-item ${activeSubMenu === item.submenuName || (!activeSubMenu && isParentActive) ? "active" : ""}`}>
                    <div className="menu-header" onClick={(e) => handleMenuHeaderClick(item.submenuName, e)} aria-expanded={activeSubMenu === item.submenuName} role="button" tabIndex={0}>
                      <span className="menu-icon">{item.icon}</span>
                      <span className="menu-text">{item.text}</span>
                      {!isCollapsed && (
                        <span className="menu-arrow">
                          {activeSubMenu === item.submenuName ? <LuChevronDown /> : <LuChevronRight />}
                        </span>
                      )}
                    </div>
                    {!isCollapsed && (
                      <ul className={`submenu-dropdown ${activeSubMenu === item.submenuName ? "open" : ""}`}>
                        {renderSubmenuItems(item.subItems, false)}
                      </ul>
                    )}
                    {isCollapsed && activeSubMenu === item.submenuName && item.subItems && (
                      <ul className="submenu-flyout-panel open" style={flyoutPanelStyle} ref={flyoutPanelRef}>
                        {renderSubmenuItems(item.subItems, true)}
                      </ul>
                    )}
                  </li>
                );
              }
              return (
                <li key={item.path || `menuitem-${index}-${item.text}`} className={`menu-item ${isActiveRoute(item.path) ? "active" : ""}`}>
                  <Link to={item.path}>
                    <span className="menu-icon">{item.icon}</span>
                    <span className="menu-text">{item.text}</span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>
      </div>

      <button
        className="toggle-btn"
        onClick={toggleSidebar}
        aria-label={isCollapsed ? "Expandir menú" : "Contraer menú"}
        style={{ left: toggleButtonLeft }} // Aplicamos la posición 'left' dinámicamente
      >
        {isCollapsed ? <LuChevronsRight /> : <LuChevronsLeft />}
      </button>
    </>
  );
};

export default Sidebar;