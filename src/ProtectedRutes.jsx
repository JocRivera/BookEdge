
import React from "react";
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "./context/AuthContext"; 

/**
 * Componente de Ruta Protegida.
 *
 * Funcionalidad:
 * 1. Muestra "Cargando..." mientras se verifica el estado de autenticación inicial.
 * 2. Si el usuario no está autenticado, redirige a "/login", guardando la ruta original.
 * 3. Si el usuario es un "Cliente" intentando acceder, redirige a "/unauthorized".
 *    (Esto asume que este componente se usa para rutas del panel de admin/staff).
 * 4. Si se especifican `requiredModule` (y opcionalmente `requiredPrivilege`),
 *    verifica si el usuario (que ya se sabe que es staff) tiene esos permisos.
 *    Si no los tiene, redirige a "/unauthorized".
 * 5. Si todas las condiciones se cumplen, renderiza el contenido de la ruta (ya sea `<Outlet />` para rutas anidadas
 *    o `children` si se usa para envolver un componente directamente).
 *
 * Props:
 *  - children: Elementos hijos a renderizar si se cumplen las condiciones. Usar si <ProtectedRoute><MiPagina/></ProtectedRoute>.
 *  - requiredModule (string, opcional): El nombre del módulo requerido para acceder a esta ruta.
 *  - requiredPrivilege (string, opcional): El nombre del privilegio requerido para el módulo.
 *                                          Si se omite y `requiredModule` está presente, se verificará
 *                                          acceso general al módulo.
 */
const ProtectedRoute = ({ children, requiredModule, requiredPrivilege }) => {
  const {
    user,
    isAuthenticated,
    isLoadingAuth,
    isClient,
    isStaff,
    hasPermission,
  } = useAuth();
  const location = useLocation();

  // 1. Manejo del estado de carga inicial de autenticación
  if (isLoadingAuth) {
    // Puedes poner un spinner más elaborado aquí
    return (
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "100vh",
        }}
      >
        Cargando Autenticación...
      </div>
    );
  }

  // 2. Redirigir si no está autenticado
  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // 3. Redirigir si es un Cliente intentando acceder a rutas de Staff/Admin
  //    Esta es una regla general. Si alguna ruta específica de staff *también* fuera accesible por clientes
  //    con ciertos permisos, la lógica necesitaría ser más compleja o esta regla iría en un nivel más alto.
  //    Asumimos por ahora que las rutas protegidas por este componente son para "no-clientes".
  if (isClient()) {
    // Si tienes alguna ruta "protegida" que SÍ sea para clientes (ej /mi-cuenta-cliente),
    // esa ruta necesitaría su propia lógica de protección o este if debería ser más específico.
    // Pero para el panel de admin, esta regla está bien.
    return (
      <Navigate
        to="/unauthorized"
        state={{ message: "Acceso restringido a clientes." }}
        replace
      />
    );
  }

  // A este punto, sabemos que el usuario está autenticado y NO es un cliente (es staff).
  // 4. Verificar permisos específicos si se requieren para esta ruta
  if (requiredModule) {
    // Si `hasPermission` no existe o el usuario no está completamente cargado, podríamos tener un problema.
    // Pero `isLoadingAuth` debería cubrir el caso de `user` siendo null inicialmente.
    if (!user || !hasPermission(requiredModule, requiredPrivilege || null)) {
      return (
        <Navigate
          to="/unauthorized"
          state={{
            message: `No tienes los permisos necesarios para acceder a: ${requiredModule}${
              requiredPrivilege ? ` (${requiredPrivilege})` : ""
            }.`,
          }}
          replace
        />
      );
    }
  }

  // 5. Si todas las comprobaciones pasan, renderizar el contenido.
  // Si este <ProtectedRoute> actúa como un layout para rutas anidadas (<Route element={<ProtectedRoute />}><Route .../></Route>), usa <Outlet />.
  // Si envuelve un componente directamente (<ProtectedRoute><DashboardPage /></ProtectedRoute>), usa `children`.
  // React Router v6 tiende a favorecer <Outlet /> para layouts. Si children no se pasa, Outlet es el fallback.
  return children ? children : <Outlet />;
};

export default ProtectedRoute;
