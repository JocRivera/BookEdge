// --- Sidebar.jsx (CORREGIDO PARA EVITAR BUCLE DE UPDATES Y MEJORAR FILTRADO DE PERMISOS) ---
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
  LuPanelRight,
  LuPanelLeft,
} from "react-icons/lu";
import { RiMenuFoldFill, RiMenuFold2Fill } from "react-icons/ri";

import "./sidebar.css";
import miLogoCompleto from "../../../assets/bookedge4.jpg";
import { useAuth } from "../../../context/AuthContext";
import { MODULES, PRIVILEGES } from "../../../constants/permissions";

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
  const [filteredMenuItems, setFilteredMenuItems] = useState([]); // Inicializar vacío, useEffect lo poblará
  const [toggleButtonLeft, setToggleButtonLeft] = useState("0px");

  // EFECTO 1: Dark Mode
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add("dark-mode-html");
    } else {
      document.documentElement.classList.remove("dark-mode-html");
    }
    localStorage.setItem("sidebarTheme", isDarkMode ? "dark" : "light");
  }, [isDarkMode]);

  // EFECTO 2: Colapso
  useEffect(() => {
    const event = new CustomEvent("sidebarToggle", {
      detail: { collapsed: isCollapsed },
    });
    document.dispatchEvent(event);
    const rootStyle = getComputedStyle(document.documentElement);
    const sidebarWidthExpandedPx =
      parseInt(rootStyle.getPropertyValue("--sidebar-width-expanded").replace("px", "")) || 230;
    const sidebarWidthCollapsedPx =
      parseInt(rootStyle.getPropertyValue("--sidebar-width-collapsed").replace("px", "")) || 68;
    const toggleBtnWidthPx =
      parseInt(rootStyle.getPropertyValue("--toggle-btn-actual-width").replace("px", "")) || 36;
    setToggleButtonLeft(
      isCollapsed
        ? `${sidebarWidthCollapsedPx - toggleBtnWidthPx / 2}px`
        : `${sidebarWidthExpandedPx - toggleBtnWidthPx / 2}px`
    );
  }, [isCollapsed]);

  // EFECTO 3: Resize
  useEffect(() => {
    const handleResize = () => {
      if (localStorage.getItem("sidebarManuallyCollapsed") === null) {
        setIsCollapsed(window.innerWidth < 768);
      }
    };
    window.addEventListener("resize", handleResize);
    if (localStorage.getItem("sidebarManuallyCollapsed") === null) {
      setIsCollapsed(window.innerWidth < 768);
    }
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // EFECTO 4: Filtrado de menú (Revisado)
  useEffect(() => {
    if (!user || !hasPermission) {
      setFilteredMenuItems([]);
      return;
    }

    // 1. Obtener ítems base permitidos por rol/permisos
    const getPermittedBaseItems = (menuItems) => {
      const permitted = [];
      for (const item of menuItems) {
        if (item.type === "title") {
          permitted.push(item); // Los títulos se mantienen por ahora
          continue;
        }

        if (item.subItems) {
          const visiblePermittedSubItems = item.subItems.filter(sub =>
            sub.module ? hasPermission(sub.module, sub.privilege || null) : true
          );
          if (visiblePermittedSubItems.length > 0) {
            permitted.push({ ...item, subItems: visiblePermittedSubItems });
          }
          // Si no hay subítems visibles, el padre del submenú no se añade.
        } else {
          if (item.module && !hasPermission(item.module, item.privilege || null)) {
            // Sin permiso para ítem directo
          } else {
            permitted.push(item); // Permitido o no requiere permiso
          }
        }
      }
      return permitted;
    };

    let basePermittedItems = getPermittedBaseItems(staticMenuItemsStructure);
    const lowerSearchTerm = searchTerm.toLowerCase();
    let searchAndPermissionFilteredItems;

    if (!lowerSearchTerm) {
      searchAndPermissionFilteredItems = basePermittedItems;
    } else {
      // 2. Aplicar filtro de búsqueda sobre los ítems permitidos
      const searchFilteredReduced = basePermittedItems.reduce(
        (acc, item) => {
          if (item.type === "title") {
            acc.potentialTitle = item; // Guardar para añadir si hay contenido después
            return acc;
          }

          let itemMatchesSearch = item.text.toLowerCase().includes(lowerSearchTerm);
          let subItemsResultForSearch = null; // Para los subítems que coinciden con la búsqueda

          if (item.subItems) { // item.subItems ya son los permitidos
            const matchingSubItems = item.subItems.filter(sub =>
              sub.text.toLowerCase().includes(lowerSearchTerm)
            );
            if (matchingSubItems.length > 0) {
              subItemsResultForSearch = matchingSubItems;
              itemMatchesSearch = true; // Padre coincide si algún hijo (permitido+buscado) coincide
            }
            // Si no, itemMatchesSearch depende solo del texto del padre
          }

          if (itemMatchesSearch) {
            if (acc.potentialTitle) {
              acc.items.push(acc.potentialTitle);
              acc.potentialTitle = null;
            }
            if (subItemsResultForSearch) { // Hay subítems que coinciden con la búsqueda
              acc.items.push({ ...item, subItems: subItemsResultForSearch });
            } else if (item.subItems && itemMatchesSearch) { // Padre coincide, tenía subítems permitidos, pero ninguno coincidió con búsqueda
              acc.items.push({ ...item, subItems: [] }); // Mostrar padre, desplegable vacío
            } else { // Ítem simple que coincide, o padre que coincide sin subítems originalmente
              acc.items.push(item);
            }
          }
          return acc;
        },
        { items: [], potentialTitle: null }
      );
      searchAndPermissionFilteredItems = searchFilteredReduced.items;
    }
    
    // 3. Filtrar títulos que quedaron sin contenido visible debajo
    const filterOutEmptyTitlesFinal = (itemsToFilter) => {
      const result = [];
      for (let i = 0; i < itemsToFilter.length; i++) {
        const currentItem = itemsToFilter[i];
        if (currentItem.type === "title") {
          let hasVisibleContentBelow = false;
          for (let j = i + 1; j < itemsToFilter.length; j++) {
            const nextItem = itemsToFilter[j];
            if (nextItem.type !== "title") {
              hasVisibleContentBelow = true; // Cualquier ítem no-título cuenta como contenido
              break;
            }
            if (nextItem.type === "title") { // Siguiente título encontrado
              break;
            }
          }
          if (hasVisibleContentBelow) {
            result.push(currentItem);
          }
        } else {
          result.push(currentItem); // Ítem de contenido, se añade
        }
      }
      return result;
    };

    setFilteredMenuItems(filterOutEmptyTitlesFinal(searchAndPermissionFilteredItems));

  }, [searchTerm, user, hasPermission]); // staticMenuItemsStructure es constante, no necesita ser dependencia


  const toggleSidebar = () => {
    setIsCollapsed((prev) => {
      const newState = !prev;
      localStorage.setItem("sidebarManuallyCollapsed", newState.toString());
      return newState;
    });
    setActiveSubMenu("");
  };

  const toggleDarkMode = () => setIsDarkMode((prev) => !prev);
  const handleSearchChange = (e) => setSearchTerm(e.target.value);

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
            parseInt(rootStyle.getPropertyValue("--sidebar-width-collapsed").replace("px", "")) || 72;
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

  const isSubmenuParentActive = (subItems) => {
    if (!Array.isArray(subItems) || subItems.length === 0) return false;
    return subItems.some((item) => isActiveRoute(item.path));
  };

  const renderProtectedSubmenuItems = (subItems, isFlyout = false) => {
    // El filtrado de permisos ya se hizo al construir filteredMenuItems.
    // Este filtro interno es ahora una redundancia segura.
    if (!user || !hasPermission) return null;
    if (!Array.isArray(subItems)) return null;

    return subItems
      .filter((item) => // Esta línea podría quitarse si confiamos 100% en el pre-filtrado
        item.module ? hasPermission(item.module, item.privilege || null) : true
      )
      .map((item, index) => {
        if (typeof item !== "object" || item === null || !item.path) {
          return <li key={`${isFlyout ? "flyout" : "dropdown"}-invalid-item-${index}`}><span>Ítem Inválido</span></li>;
        }
        return (
          <li
            key={`${isFlyout ? "flyout" : "dropdown"}-item-${index}-${item.path}`}
            style={isFlyout ? { "--item-index": index } : {}}
            className={isActiveRoute(item.path) ? "active" : ""}
          >
            <Link
              to={item.path}
              onClick={() => { if (isFlyout || !isCollapsed) setActiveSubMenu(""); }}
            >
              {item.icon && <span className="menu-icon">{item.icon}</span>}
              {item.text && <span className="menu-text">{item.text}</span>}
            </Link>
          </li>
        );
      });
  };

  const sidebarFinalClasses = `sidebar ${isCollapsed ? "collapsed" : ""} ${isDarkMode ? "dark-mode" : ""}`;

  return (
    <>
      <div className={sidebarFinalClasses}>
        <div className="sidebar-header">
          <div className="logo-area">
            <img
              src={miLogoCompleto}
              alt="BookEdge Logo"
              className={`logo-image-display ${isCollapsed ? "collapsed-logo" : "expanded-logo"}`}
            />
            {!isCollapsed && <span className="logo-text-title">BookEdge</span>}
          </div>
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
              // La comprobación de permisos para ítems directos ya se hizo al construir filteredMenuItems
              // No es necesario repetirla aquí.
              // if (item.type !== "title" && item.module && (!user || !hasPermission || !hasPermission(item.module, item.privilege || null))) return null;

              if (item.subItems) { // El ítem tiene una propiedad subItems (puede ser array vacío)
                const subItemsToRender = item.subItems; // Estos ya están filtrados por permiso y búsqueda
                const isParentActive = isSubmenuParentActive(subItemsToRender);
                
                // No necesitamos más la lógica compleja de 'if (visibleSubItems.length === 0 && ... ) return null;' aquí
                // porque getPermittedBaseItems ya maneja la no inclusión de padres sin subítems permitidos.

                return (
                  <li
                    key={item.submenuName || `subparent-${index}-${item.text}`}
                    className={`menu-item ${ activeSubMenu === item.submenuName || (!activeSubMenu && isParentActive) ? "active" : "" }`}
                  >
                    <div
                      className="menu-header"
                      onClick={(e) => handleMenuHeaderClick(item.submenuName, e)}
                      aria-expanded={activeSubMenu === item.submenuName}
                      role="button"
                      tabIndex={0}
                    >
                      <span className="menu-icon">{item.icon}</span>
                      <span className="menu-text">{item.text}</span>
                      {!isCollapsed && (
                        <span className="menu-arrow">
                          {activeSubMenu === item.submenuName ? <LuChevronDown /> : <LuChevronRight />}
                        </span>
                      )}
                    </div>
                    {/* Solo renderizar el UL si hay elementos en subItemsToRender */}
                    {subItemsToRender.length > 0 && !isCollapsed && activeSubMenu === item.submenuName && (
                        <ul className="submenu-dropdown open">
                          {renderProtectedSubmenuItems(subItemsToRender, false)}
                        </ul>
                      )}
                    {subItemsToRender.length > 0 && isCollapsed && activeSubMenu === item.submenuName && (
                        <ul
                          className="submenu-flyout-panel open"
                          style={flyoutPanelStyle}
                          ref={flyoutPanelRef}
                        >
                          {renderProtectedSubmenuItems(subItemsToRender, true)}
                        </ul>
                      )}
                  </li>
                );
              }
              if (item.type === "title") {
                return (
                  <li key={`title-${index}-${item.text}`} className="menu-section-title-container" >
                    <span className="menu-section-title-text">{item.text}</span>
                  </li>
                );
              }
              // Ítem simple (enlace directo)
              return (
                <li
                  key={item.path || `menuitem-${index}-${item.text}`}
                  className={`menu-item ${isActiveRoute(item.path) ? "active" : ""}`}
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
            aria-label={isDarkMode ? "Activar tema claro" : "Activar tema oscuro"}
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