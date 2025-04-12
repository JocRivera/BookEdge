import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "./context/AuthContext";

const ProtectedRoutes = () => {
  const { isAuthenticated, isLoadingAuth, isClient } = useAuth();

  // Mientras verificamos la autenticación, mostramos un cargador
  if (isLoadingAuth) {
    return <div>Cargando...</div>;
  }

  // Si no está autenticado, redirigimos al login
  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }

  // Si es un cliente intentando acceder a rutas admin, redirigimos a unauthorized
  if (isClient()) {
    return <Navigate to="/unauthorized" />;
  }

  // Si es staff, permitimos el acceso
  return <Outlet />;
};

export default ProtectedRoutes;