// --- Sidebar.jsx (CORREGIDO PARA EVITAR BUCLE DE UPDATES) ---
import React, { useState, useEffect, useRef, useCallback } from "react";
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
  LuCreditCard,
  LuGitBranch,
  LuSearch,
  LuSun,
  LuMoon,
  LuPanelRight, // Para el botón flotante cuando está colapsado
  LuPanelLeft, // Para el botón flotante cuando está expandido
} from "react-icons/lu";
import { RiMenuFoldFill, RiMenuFold2Fill } from "react-icons/ri";

import "./sidebar.css";
import miLogoCompleto from "../../../assets/bookedge4.jpg";
import { useAuth } from "../../../context/AuthContext";
import { MODULES, PRIVILEGES } from "../../../constants/permissions"; // Asegúrate que esta ruta sea correcta

// Define menuItemsStructure FUERA del componente Sidebar
// Esto es crucial para evitar que se recree en cada render y cause bucles en useEffect.
const staticMenuItemsStructure = [
  { type: "title", text: "Principal" },
  { path: "/admin", icon: <LuLayoutDashboard />, text: "Dashboard" },
  { type: "title", text: "Gestión" },
  {
    path: "/admin/users",
    icon: <LuUsers />,
    text: "Usuarios",
    module: MODULES.USUARIOS,
    privilege: PRIVILEGES.READ,
  },
  {
    path: "/admin/customer",
    icon: <LuUsers />,
    text: "Clientes",
    module: MODULES.CLIENTES,
    privilege: PRIVILEGES.READ,
  },
  { type: "title", text: "Gestión  Habitaciones" },
  {
    text: "Habitaciones",
    icon: <LuBedDouble />,
    submenuName: "rooms",
    subItems: [
      {
        path: "/admin/cabins",
        icon: <LuHotel />,
        text: "Cabañas",
        module: MODULES.ALOJAMIENTOS,
        privilege: PRIVILEGES.READ,
      },
      {
        path: "/admin/rooms",
        icon: <LuBedDouble />,
        text: "Habitaciones",
        module: MODULES.ALOJAMIENTOS,
        privilege: PRIVILEGES.READ,
      },
      {
        path: "/admin/accommodations",
        icon: <LuHotel />,
        text: " Comodidades",
        module: MODULES.COMODIDADES,
        privilege: PRIVILEGES.READ,
      },
    ],
  },
  { type: "title", text: "Planes & Reservas" },
  {
    text: "Planes",
    icon: <LuCreditCard />,
    submenuName: "plans",
    subItems: [
      {
        path: "/admin/plans",
        icon: <LuCreditCard />,
        text: "Planes",
        module: MODULES.PLANES,
        privilege: PRIVILEGES.READ,
      },
      {
        path: "/admin/plansProgramed",
        icon: <LuCalendar />,
        text: "Planes Prog.",
        module: MODULES.PLANES,
        privilege: PRIVILEGES.READ,
      },
    ],
  },
  {
    text: "Reservas",
    icon: <LuCalendar />,
    submenuName: "bookings",
    subItems: [
      {
        path: "/admin/reservations",
        icon: <LuBookmark />,
        text: "Lista Reservas",
        module: MODULES.RESERVAS,
        privilege: PRIVILEGES.READ,
      },
      {
        path: "/admin/companions",
        icon: <LuUsers />,
        text: "Acompañantes",
        module: MODULES.RESERVAS,
        privilege: PRIVILEGES.READ,
      },
      {
        path: "/admin/payments",
        icon: <LuCreditCard />,
        text: "Pagos",
        module: MODULES.PAGOS,
        privilege: PRIVILEGES.READ,
      },
    ],
  },
  {
    path: "/admin/services",
    icon: <LuGitBranch />,
    text: "Servicios",
    module: MODULES.SERVICIOS,
    privilege: PRIVILEGES.READ,
  },
  { path: "/admin/config", icon: <LuSettings />, text: "Configuración" },
];

const Sidebar = () => {
  const [isDarkMode, setIsDarkMode] = useState(
    () => localStorage.getItem("sidebarTheme") === "dark"
  );
  const [isCollapsed, setIsCollapsed] = useState(() => {
    const manuallyCollapsed = localStorage.getItem("sidebarManuallyCollapsed");
    if (manuallyCollapsed !== null) return manuallyCollapsed === "true";
    return window.innerWidth < 768;
  });

  const [activeSubMenu, setActiveSubMenu] = useState("");
  const [flyoutPanelStyle, setFlyoutPanelStyle] = useState({});
  const flyoutPanelRef = useRef(null);
  const location = useLocation();
  const { user, hasPermission } = useAuth();
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredMenuItems, setFilteredMenuItems] = useState(
    staticMenuItemsStructure
  ); // Inicializar con la estructura estática
  const [toggleButtonLeft, setToggleButtonLeft] = useState("0px");

  // EFECTO 1: Dark Mode - Aplicar clase a <html> y guardar en localStorage
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add("dark-mode-html");
    } else {
      document.documentElement.classList.remove("dark-mode-html");
    }
    localStorage.setItem("sidebarTheme", isDarkMode ? "dark" : "light");
  }, [isDarkMode]); // Solo se ejecuta cuando isDarkMode cambia

  // EFECTO 2: Colapso - Notificar a AdminLayout y calcular posición del botón flotante
  useEffect(() => {
    const event = new CustomEvent("sidebarToggle", {
      detail: { collapsed: isCollapsed },
    });
    document.dispatchEvent(event);

    const rootStyle = getComputedStyle(document.documentElement);
    const sidebarWidthExpandedPx =
      parseInt(
        rootStyle.getPropertyValue("--sidebar-width-expanded").replace("px", "")
      ) || 230;
    const sidebarWidthCollapsedPx =
      parseInt(
        rootStyle
          .getPropertyValue("--sidebar-width-collapsed")
          .replace("px", "")
      ) || 68;
    const toggleBtnWidthPx =
      parseInt(
        rootStyle
          .getPropertyValue("--toggle-btn-actual-width")
          .replace("px", "")
      ) || 36;

    setToggleButtonLeft(
      isCollapsed
        ? `${sidebarWidthCollapsedPx - toggleBtnWidthPx / 2}px`
        : `${sidebarWidthExpandedPx - toggleBtnWidthPx / 2}px`
    );
  }, [isCollapsed]); // Solo se ejecuta cuando isCollapsed cambia

  // EFECTO 3: Resize - Ajustar colapso automáticamente si no hay preferencia manual
  useEffect(() => {
    const handleResize = () => {
      if (localStorage.getItem("sidebarManuallyCollapsed") === null) {
        // Solo si el usuario no lo ha fijado
        setIsCollapsed(window.innerWidth < 768);
      }
    };
    window.addEventListener("resize", handleResize);
    // Llamada inicial para establecer estado si no hay preferencia manual
    if (localStorage.getItem("sidebarManuallyCollapsed") === null) {
      setIsCollapsed(window.innerWidth < 768);
    }
    return () => window.removeEventListener("resize", handleResize);
  }, []); // Se ejecuta solo al montar/desmontar para configurar/limpiar listener

  const toggleSidebar = () => {
    setIsCollapsed((prev) => {
      const newState = !prev;
      localStorage.setItem("sidebarManuallyCollapsed", newState.toString()); // Guardar preferencia manual
      return newState;
    });
    setActiveSubMenu("");
  };

  const toggleDarkMode = () => setIsDarkMode((prev) => !prev);
  const handleSearchChange = (e) => setSearchTerm(e.target.value);

  // EFECTO 4: Filtrado de menú
  useEffect(() => {
    const lowerSearchTerm = searchTerm.toLowerCase();
    if (!lowerSearchTerm) {
      setFilteredMenuItems(staticMenuItemsStructure); // Usa la constante
      return;
    }
    // Lógica de filtrado (puede ser mejorada para títulos de sección)
    const filtered = staticMenuItemsStructure.reduce(
      (acc, item) => {
        if (item.type === "title") {
          acc.lastTitle = item;
          return acc;
        }
        let itemMatches = item.text.toLowerCase().includes(lowerSearchTerm);
        let subItemsResult = null;
        if (item.subItems) {
          const matchingSubItems = item.subItems.filter((sub) =>
            sub.text.toLowerCase().includes(lowerSearchTerm)
          );
          if (matchingSubItems.length > 0) subItemsResult = matchingSubItems;
          itemMatches = itemMatches || matchingSubItems.length > 0;
        }
        if (itemMatches) {
          if (acc.lastTitle) {
            acc.items.push(acc.lastTitle);
            acc.lastTitle = null;
          }
          acc.items.push(
            subItemsResult ? { ...item, subItems: subItemsResult } : item
          );
        }
        return acc;
      },
      { items: [], lastTitle: null }
    );

    setFilteredMenuItems(
      filtered.items.length > 0
        ? filtered.items
        : searchTerm
        ? []
        : staticMenuItemsStructure
    );
  }, [searchTerm]); // Solo depende de searchTerm porque staticMenuItemsStructure es constante

  const handleMenuHeaderClick = useCallback(
    (menuName, e) => {
      e.preventDefault();
      e.stopPropagation();
      const newActiveSubMenu = activeSubMenu === menuName ? "" : menuName;
      setActiveSubMenu(newActiveSubMenu);
      if (isCollapsed && newActiveSubMenu) {
        const menuItemElement = e.currentTarget.closest(".menu-item");
        if (menuItemElement) {
          const itemRect = menuItemElement.getBoundingClientRect();
          let topPosition = itemRect.top;
          const flyoutHeightEstimate = 180;
          const windowHeight = window.innerHeight;
          const rootStyle = getComputedStyle(document.documentElement);
          const sidebarCollapsedWidth =
            parseInt(
              rootStyle
                .getPropertyValue("--sidebar-width-collapsed")
                .replace("px", "")
            ) || 72;
          const spaceFlyout = 8;

          if (topPosition + flyoutHeightEstimate > windowHeight - 20) {
            topPosition = windowHeight - flyoutHeightEstimate - 20;
          }
          if (topPosition < 10) topPosition = 10;
          setFlyoutPanelStyle({
            top: `${topPosition}px`,
            left: `${sidebarCollapsedWidth + spaceFlyout}px`,
          });
        }
      }
    },
    [activeSubMenu, isCollapsed]
  );

  useEffect(() => {
    const handleClickOutside = (event) => {
      const target = event.target;
      if (
        isCollapsed &&
        activeSubMenu &&
        flyoutPanelRef.current &&
        !flyoutPanelRef.current.contains(target) &&
        !target.closest(".menu-item > .menu-header")
      ) {
        setActiveSubMenu("");
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isCollapsed, activeSubMenu]);

  const isActiveRoute = (path) =>
    path &&
    (location.pathname === path ||
      (path !== "/admin" && location.pathname.startsWith(path + "/")));
  const isSubmenuParentActive = (visibleSubItems) => {
    if (!Array.isArray(visibleSubItems) || visibleSubItems.length === 0)
      return false;
    return visibleSubItems.some((item) => isActiveRoute(item.path));
  };
  const renderProtectedSubmenuItems = (subItems, isFlyout = false) => {
    if (!user || !hasPermission) return null;
    if (!Array.isArray(subItems)) return null;
    return subItems
      .filter((item) =>
        item.module ? hasPermission(item.module, item.privilege || null) : true
      )
      .map((item, index) => {
        if (typeof item !== "object" || item === null || !item.path) {
          return (
            <li
              key={`${isFlyout ? "flyout" : "dropdown"}-invalid-item-${index}`}
            >
              <span>Ítem Inválido</span>
            </li>
          );
        }
        return (
          <li
            key={`${isFlyout ? "flyout" : "dropdown"}-item-${index}-${
              item.path
            }`}
            style={isFlyout ? { "--item-index": index } : {}}
            className={isActiveRoute(item.path) ? "active" : ""}
          >
            <Link
              to={item.path}
              onClick={() => {
                if (isFlyout || !isCollapsed) setActiveSubMenu("");
              }}
            >
              {item.icon && <span className="menu-icon">{item.icon}</span>}
              {item.text && <span className="menu-text">{item.text}</span>}
            </Link>
          </li>
        );
      });
  };

  // Construir clases del sidebar dinámicamente
  const sidebarFinalClasses = `sidebar ${isCollapsed ? "collapsed" : ""} ${
    isDarkMode ? "dark-mode" : ""
  }`;

  return (
    <>
      <div className={sidebarFinalClasses}>
        {" "}
        {/* Aplicar clases directamente */}
        <div className="sidebar-header">
          <div className="logo-area">
            <img
              src={miLogoCompleto}
              alt="BookEdge Logo"
              className={`logo-image-display ${
                isCollapsed ? "collapsed-logo" : "expanded-logo"
              }`}
            />
            {!isCollapsed && <span className="logo-text-title">BookEdge</span>}
          </div>
          {/* El botón de toggle del header se ha quitado. Usaremos el flotante. */}
          {!isCollapsed && (
            <div className="search-container">
              <LuSearch className="search-icon" />
              <input
                type="search"
                placeholder="Buscar..."
                value={searchTerm}
                onChange={handleSearchChange}
                className="search-input"
              />
            </div>
          )}
        </div>
        <nav className="sidebar-content">
          <ul className="menu-list">
            {filteredMenuItems.map((item, index) => {
              if (
                item.type !== "title" &&
                item.module &&
                (!user ||
                  !hasPermission ||
                  !hasPermission(item.module, item.privilege || null))
              )
                return null;

              if (item.subItems) {
                const subItemsToRender = item.subItems;
                const visibleSubItems = subItemsToRender.filter((sub) =>
                  sub.module
                    ? user &&
                      hasPermission &&
                      hasPermission(sub.module, sub.privilege || null)
                    : true
                );

                if (
                  visibleSubItems.length === 0 &&
                  !item.text.toLowerCase().includes(searchTerm.toLowerCase()) &&
                  !item.module
                )
                  return null;
                if (
                  visibleSubItems.length === 0 &&
                  item.module &&
                  (!user ||
                    !hasPermission ||
                    !hasPermission(item.module, item.privilege || null))
                )
                  return null;

                const isParentActive = isSubmenuParentActive(visibleSubItems);
                return (
                  <li
                    key={item.submenuName || `subparent-${index}-${item.text}`}
                    className={`menu-item ${
                      activeSubMenu === item.submenuName ||
                      (!activeSubMenu && isParentActive)
                        ? "active"
                        : ""
                    }`}
                  >
                    <div
                      className="menu-header"
                      onClick={(e) =>
                        handleMenuHeaderClick(item.submenuName, e)
                      }
                      aria-expanded={activeSubMenu === item.submenuName}
                      role="button"
                      tabIndex={0}
                    >
                      <span className="menu-icon">{item.icon}</span>
                      <span className="menu-text">{item.text}</span>
                      {!isCollapsed && (
                        <span className="menu-arrow">
                          {activeSubMenu === item.submenuName ? (
                            <LuChevronDown />
                          ) : (
                            <LuChevronRight />
                          )}
                        </span>
                      )}
                    </div>
                    {visibleSubItems.length > 0 &&
                      !isCollapsed &&
                      activeSubMenu === item.submenuName && (
                        <ul className="submenu-dropdown open">
                          {renderProtectedSubmenuItems(visibleSubItems, false)}
                        </ul>
                      )}
                    {visibleSubItems.length > 0 &&
                      isCollapsed &&
                      activeSubMenu === item.submenuName && (
                        <ul
                          className="submenu-flyout-panel open"
                          style={flyoutPanelStyle}
                          ref={flyoutPanelRef}
                        >
                          {renderProtectedSubmenuItems(visibleSubItems, true)}
                        </ul>
                      )}
                  </li>
                );
              }
              if (item.type === "title") {
                return (
                  <li
                    key={`title-${index}-${item.text}`}
                    className="menu-section-title-container"
                  >
                    <span className="menu-section-title-text">{item.text}</span>
                  </li>
                );
              }
              return (
                <li
                  key={item.path || `menuitem-${index}-${item.text}`}
                  className={`menu-item ${
                    isActiveRoute(item.path) ? "active" : ""
                  }`}
                >
                  <Link to={item.path} onClick={() => setActiveSubMenu("")}>
                    <span className="menu-icon">{item.icon}</span>
                    <span className="menu-text">{item.text}</span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>
        <div className="sidebar-footer">
          <button
            onClick={toggleDarkMode}
            className="theme-toggle-button"
            aria-label={
              isDarkMode ? "Activar tema claro" : "Activar tema oscuro"
            }
          >
            {isDarkMode ? <LuSun /> : <LuMoon />}
            {!isCollapsed && (
              <span className="theme-toggle-text">
                {isDarkMode ? "Tema Claro" : "Tema Oscuro"}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Botón Flotante para colapsar/expandir */}
      <button
        className="toggle-btn"
        onClick={toggleSidebar}
        aria-label={isCollapsed ? "Expandir menú" : "Contraer menú"}
        style={{ left: toggleButtonLeft }}
      >
        {isCollapsed ? <RiMenuFold2Fill /> : <RiMenuFoldFill />}
      </button>
    </>
  );
};

export default Sidebar;
