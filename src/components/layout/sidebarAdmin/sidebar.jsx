// --- Sidebar.jsx ---
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
  LuChevronsLeft,
  LuChevronsRight,
  LuGitBranch,
} from "react-icons/lu";
import "./sidebar.css";
import miLogoCompleto from "../../../assets/bookedge4.jpg";
import { useAuth } from "../../../context/AuthContext";
import { MODULES, PRIVILEGES } from "../../../constants/permissions"; // Asegúrate que esta ruta sea correcta

const Sidebar = () => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [activeSubMenu, setActiveSubMenu] = useState("");
  const [flyoutPanelStyle, setFlyoutPanelStyle] = useState({});
  const [toggleButtonLeft, setToggleButtonLeft] = useState("0px");
  const sidebarRef = useRef(null);
  const flyoutPanelRef = useRef(null);
  const location = useLocation();

  // --- LÓGICA DE PERMISOS: Obteniendo user y hasPermission del contexto ---
  const { user, hasPermission } = useAuth();

  useEffect(() => {
    const manuallyCollapsed =
      localStorage.getItem("sidebarManuallyCollapsed") === "true";
    if (manuallyCollapsed) {
      setIsCollapsed(true);
    } else {
      setIsCollapsed(window.innerWidth < 768);
    }
  }, []);

  useEffect(() => {
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
      ) || 40;
    let newLeft;
    if (isCollapsed) {
      newLeft = `${sidebarWidthCollapsedPx - toggleBtnWidthPx / 2}px`;
    } else {
      newLeft = `${sidebarWidthExpandedPx - toggleBtnWidthPx / 2}px`;
    }
    setToggleButtonLeft(newLeft);
  }, [isCollapsed]);

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
          const sidebarCollapsedWidth =
            parseInt(
              rootStyle
                .getPropertyValue("--sidebar-width-collapsed")
                .replace("px", "")
            ) || 68;
          const spaceXs =
            parseInt(
              rootStyle.getPropertyValue("--space-xs").replace("px", "")
            ) || 4;
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
      if (
        isCollapsed &&
        activeSubMenu &&
        flyoutPanelRef.current &&
        !flyoutPanelRef.current.contains(target)
      ) {
        const clickedOnCollapsedMenuHeader = target.closest(
          ".sidebar.collapsed .menu-item > .menu-header"
        );
        if (!clickedOnCollapsedMenuHeader) setActiveSubMenu("");
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isCollapsed, activeSubMenu]);

  useEffect(() => {
    const handleResize = () => {
      const manuallyCollapsed =
        localStorage.getItem("sidebarManuallyCollapsed") === "true";
      if (window.innerWidth < 768) {
        if (!isCollapsed) setIsCollapsed(true);
      } else {
        if (isCollapsed && !manuallyCollapsed) setIsCollapsed(false);
      }
      const rootStyle = getComputedStyle(document.documentElement);
      const sidebarWidthExpandedPx =
        parseInt(
          rootStyle
            .getPropertyValue("--sidebar-width-expanded")
            .replace("px", "")
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
        ) || 40;
      let newLeft;
      if (window.innerWidth < 768 || (isCollapsed && manuallyCollapsed)) {
        newLeft = `${sidebarWidthCollapsedPx - toggleBtnWidthPx / 2}px`;
      } else {
        newLeft = `${sidebarWidthExpandedPx - toggleBtnWidthPx / 2}px`;
      }
      setToggleButtonLeft(newLeft);
    };
    window.addEventListener("resize", handleResize);
    handleResize();
    return () => window.removeEventListener("resize", handleResize);
  }, [isCollapsed]);

  // --- LÓGICA DE PERMISOS: Definiendo módulos y privilegios para cada ítem del menú ---
  const menuItemsStructure = [
    { type: "title", text: "Principal" },
    {
      path: "/admin",
      icon: <LuLayoutDashboard />,
      text: "Dashboard",
      // No se define module/privilege, se asume visible para todos los usuarios staff
    },
    { type: "title", text: "Gestión" },
    {
      path: "/admin/users",
      icon: <LuUsers />,
      text: "Usuarios",
      module: MODULES.USUARIOS, // Módulo al que pertenece este enlace
      privilege: PRIVILEGES.READ, // Privilegio mínimo para ver este enlace
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
      // El padre del submenú no tiene un módulo/privilegio propio en este ejemplo;
      // su visibilidad dependerá de si alguno de sus sub-ítems es visible.
      // Si quisiera un permiso explícito para el padre:
      // module: MODULES.ALOJAMIENTOS_MENU, privilege: PRIVILEGES.READ,
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
          module: MODULES.ALOJAMIENTOS /*O MODULES.HABITACIONES*/,
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
          module: MODULES.PLANES ,
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
          module: MODULES.RESERVAS /*O CLIENTES*/,
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

  const isActiveRoute = (path) =>
    path &&
    (location.pathname === path ||
      (path !== "/admin" && location.pathname.startsWith(path + "/")));

  const isSubmenuParentActive = (visibleSubItems) => {
    if (!Array.isArray(visibleSubItems) || visibleSubItems.length === 0)
      return false;
    return visibleSubItems.some((item) => isActiveRoute(item.path));
  };

  // --- LÓGICA DE PERMISOS: Función para renderizar sub-ítems, filtrando por permiso ---
  const renderProtectedSubmenuItems = (subItems, isFlyout = false) => {
    if (!user || !hasPermission) return null; // No renderizar si no hay usuario o función hasPermission
    if (!Array.isArray(subItems)) return null;

    return subItems
      .filter((item) => {
        // FILTRAR sub-ítems
        if (item.module) {
          // Si privilege no está definido en el item, hasPermission (con su valor por defecto para privilegeName) chequeará acceso general al módulo
          return hasPermission(item.module, item.privilege || null);
        }
        return true; // Si el sub-item no tiene 'module' definido, se asume accesible por defecto
      })
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

  // Renderización principal del Sidebar
  return (
    <>
      <div
        className={`sidebar ${isCollapsed ? "collapsed" : ""}`}
        ref={sidebarRef}
      >
        <div className="sidebar-header">
          <div className="logo-logo-stacked">
            <img
              src={miLogoCompleto}
              alt="Logo Principal"
              className={`logo-image-display ${
                isCollapsed ? "collapsed-logo" : "expanded-logo"
              }`}
            />
          </div>
        </div>
        <nav className="sidebar-content">
          <ul className="menu-list">
            {/* --- LÓGICA DE PERMISOS: Iterando sobre menuItemsStructure y aplicando filtros --- */}
            {menuItemsStructure.map((item, index) => {
              // Protección para ítems de nivel superior y padres de submenús
              if (item.type !== "title" && item.module) {
                if (!hasPermission(item.module, item.privilege || null)) {
                  return null; // Ocultar este ítem si no hay permiso
                }
              }

              // Lógica para menús con subItems
              if (item.subItems) {
                // Filtramos los subItems ANTES de decidir si el padre se muestra o se renderizan los hijos
                const visibleSubItems = item.subItems.filter((subItem) =>
                  subItem.module
                    ? hasPermission(subItem.module, subItem.privilege || null)
                    : true
                );

                // Si el padre no tiene módulo propio Y no hay subítems visibles, no mostrar el padre.
                if (!item.module && visibleSubItems.length === 0) {
                  return null;
                }
                // Si el padre SÍ tiene módulo y no se cumple el permiso (ya lo chequeamos arriba), se oculta.
                // Si tiene módulo y SÍ se cumple el permiso, pero NO hay subítems visibles, podría ser decisión de diseño ocultarlo.
                // Por ahora, si el padre tiene permiso propio (chequeado arriba) O tiene hijos visibles, se muestra.
                if (
                  visibleSubItems.length === 0 &&
                  !(
                    item.module &&
                    hasPermission(item.module, item.privilege || null)
                  )
                ) {
                  // (Esta condición puede ser redundante con el primer if de item.module, pero es para ser explícito)
                  // Si el padre no tiene permiso propio Y no hay hijos visibles, no mostrar.
                  if (!item.module) return null;
                }
                // Si después de filtrar no queda ningún subítem visible, no mostramos el menú padre
                // A MENOS que el menú padre en sí tenga un permiso que le permita mostrarse (ya chequeado antes)
                if (visibleSubItems.length === 0 && !item.module) {
                  // Si es un agrupador sin permiso propio y sin hijos visibles
                  return null;
                }

                const isParentActive = isSubmenuParentActive(visibleSubItems); // Estado activo basado en hijos visibles
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
                    {/* Solo renderiza los contenedores de submenú si hay subítems visibles */}
                    {visibleSubItems.length > 0 &&
                      !isCollapsed &&
                      activeSubMenu === item.submenuName && (
                        <ul className={`submenu-dropdown open`}>
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

              // Renderizar títulos de sección
              if (item.type === "title") {
                // Aquí se podría añadir lógica para no mostrar el título si los siguientes N ítems están todos ocultos.
                // Por simplicidad, de momento siempre se muestran.
                return (
                  <li
                    key={`title-${index}-${item.text}`}
                    className="menu-section-title-container"
                  >
                    <div className="menu-section-title-line"></div>
                    <span className="menu-section-title-text">{item.text}</span>
                    <div className="menu-section-title-line"></div>
                  </li>
                );
              }

              // Renderizar ítem de menú simple (si llegó hasta aquí, es porque o no tiene 'module' o sí tiene permiso)
              return (
                <li
                  key={item.path || `menuitem-${index}-${item.text}`}
                  className={`menu-item ${
                    isActiveRoute(item.path) ? "active" : ""
                  }`}
                >
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
        style={{ left: toggleButtonLeft }}
      >
        {isCollapsed ? <LuChevronsRight /> : <LuChevronsLeft />}
      </button>
    </>
  );
};

export default Sidebar;
