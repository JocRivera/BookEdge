// AuthContext.jsx
import { createContext, useContext, useState, useEffect } from "react";
import {
  loginUser,
  logoutUser,
  getUserData,
  refreshToken as refreshAccessToken,
} from "../services/AuthService"; // Asumo que loginService es tu servicio real
import { useNavigate } from "react-router-dom";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [errors, setErrors] = useState([]); // Estado para los errores
  const [loading, setLoading] = useState(false);
  const [isLoadingAuth, setIsLoadingAuth] = useState(true);
  const navigate = useNavigate();

  const hasPermission = (moduleName, privilegeName = null) => {
    if (!user || !user.role || !user.role.permissionRoles) return false;

    return user.role.permissionRoles.some((pr) => {
      // pr.permissions?.name es el nombre del Módulo (ej: "usuarios")
      // pr.privileges?.name es el nombre del Privilegio (ej: "post")
      const matchesModule = pr.permissions?.name === moduleName;
      // Si privilegeName es null, solo verificamos el acceso al módulo en general.
      // Si se proporciona un privilegeName, verificamos también ese privilegio.
      const matchesPrivilege = privilegeName
        ? pr.privileges?.name === privilegeName
        : true;
      return matchesModule && matchesPrivilege;
    });
  };

  const isClient = () => {
    return user?.role?.name === "Cliente";
  };

  const isStaff = () => {
    return user?.role?.name && user.role.name !== "Cliente";
  };

  const clearAuthErrors = () => {
    setErrors([]);
  };

  // Escuchar eventos de error de autenticación del interceptor
  useEffect(() => {
    const handleAuthError = () => {
      setUser(null);
      setIsAuthenticated(false);
      // Podrías querer limpiar errores aquí también si un error 401 no debe persistir en UI
      // clearAuthErrors();
    };
    window.addEventListener("auth-error", handleAuthError);
    return () => {
      window.removeEventListener("auth-error", handleAuthError);
    };
  }, [navigate]); // No necesitas clearAuthErrors como dependencia aquí si la llamas desde dentro

  // Chequear autenticación al cargar
  useEffect(() => {
    const checkAuth = async () => {
      setIsLoadingAuth(true); // Mover aquí para que se active al inicio del check
      try {
        const userData = await getUserData(); // Asumo que esto obtiene el usuario si hay token válido
        setUser(userData);
        setIsAuthenticated(true);
      } catch (error) {
        setIsAuthenticated(false);
        setUser(null);
        // No establecer errores aquí por fallos de checkAuth inicial,
        // ya que el usuario simplemente no está logueado.
      } finally {
        setIsLoadingAuth(false);
      }
    };
    checkAuth();
  }, []); // Se ejecuta solo una vez al montar el AuthProvider

  const signin = async (credentials) => {
    setLoading(true);
    clearAuthErrors(); // <--- Limpiar errores al inicio de un nuevo intento
    try {
      // Asumo que loginUser es la función que llama a tu API y puede lanzar un error
      // con { response: { data: { message: "..." } } } o { message: "..." }
      await loginUser(credentials); // Esta función idealmente no devuelve el user, sino que indica éxito/fracaso

      // Si loginUser fue exitoso (no lanzó error), obtenemos los datos del usuario actualizados
      const userData = await getUserData();
      setUser(userData);
      setIsAuthenticated(true);
      setLoading(false); // Importante ponerlo aquí antes de navegar

      // Navegar después de actualizar el estado
      if (userData.role?.name === "Cliente") {
        navigate("/");
      } else {
        navigate("/admin");
      }
      // No es necesario devolver nada si la navegación maneja el flujo
    } catch (error) {
      // Estructura para capturar mensajes de error de Axios (común)
      // O un mensaje genérico si la estructura no coincide
      const errorMessages = Array.isArray(error.response?.data?.errors)
        ? error.response.data.errors.map((err) => err.msg) // Si tu backend devuelve array de errores detallados
        : [
            error.response?.data?.message ||
              error.message ||
              "Error al iniciar sesión. Inténtalo de nuevo.",
          ];
      setErrors(errorMessages);
      setLoading(false);
      throw error; // Re-lanzar para que el handleSubmit en LoginForm pueda saber que falló
    }
    // finally no es necesario aquí si setLoading(false) se maneja en try/catch
  };

  const logout = async () => {
    setLoading(true); // Opcional: spinner durante el logout
    try {
      await logoutUser(); // Llama a tu servicio de logout
    } catch (error_logout) {
      // Incluso si el logout del backend falla, limpiamos el frontend
      console.error("Error en logout del servicio:", error_logout);
    } finally {
      setUser(null);
      setIsAuthenticated(false);
      clearAuthErrors(); // Limpiar errores al cerrar sesión
      setLoading(false);
      navigate("/"); // Redirigir a home o login
    }
  };

  const refreshToken = async () => {
    // setLoading(true); // Podrías tener un loading para esto también
    try {
      const success = await refreshAccessToken(); // Tu servicio de refresh token
      // Si refreshAccessToken fue exitoso, el interceptor de Axios debería
      // reintentar la petición original. Aquí podrías re-validar el usuario si es necesario.
      // const userData = await getUserData();
      // setUser(userData);
      // setIsAuthenticated(true);
      return success; // O lo que devuelva tu servicio de refresh
    } catch (error) {
      // Si el refresh token falla, es un error de autenticación crítico -> logout
      console.error("Fallo al refrescar token, deslogueando:", error);
      await logout(); // Llama a tu función logout interna que ya maneja el estado
      throw error; // Re-lanzar para que el interceptor o quien llamó sepa que falló
    } finally {
      // setLoading(false);
    }
  };

  // Redirigir a la ruta adecuada según el rol del usuario autenticado
  useEffect(() => {
    if (isAuthenticated && user?.role?.name === "Cliente") {
      navigate("/");
    }
  }, [isAuthenticated, user, navigate]);

  return (
    <AuthContext.Provider
      value={{
        setUser,
        user,
        isAuthenticated,
        isLoadingAuth,
        loading,
        setLoading,
        errors,
        signin,
        logout,
        refreshToken,
        hasPermission,
        isClient,
        isStaff,
        clearAuthErrors,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

// Hook useAuth (sin cambios)
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within an AuthProvider");
  return context;
};
