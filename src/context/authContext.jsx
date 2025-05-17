import { createContext, useContext, useState, useEffect } from "react";
import { loginUser, logoutUser, getUserData, refreshToken as refreshAccessToken } from "../services/AuthService";
import { useNavigate } from "react-router-dom";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [errors, setErrors] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isLoadingAuth, setIsLoadingAuth] = useState(true);
  const navigate = useNavigate();
  
  const hasPermission = (moduleName, privilegeName = null) => {
    if (!user || !user.role || !user.role.permissionRoles) return false;
  
    return user.role.permissionRoles.some((pr) => {
      const matchesModule = pr.permissions?.name === moduleName;
      const matchesPrivilege = privilegeName ? pr.privileges?.name === privilegeName : true;
      return matchesModule && matchesPrivilege;
    });
  };
  
  // Verificar si el usuario es Cliente
  const isClient = () => {
    return user?.role?.name === 'Cliente';
  };

  // Verificar si el usuario es Staff (admin, empleado, etc.)
  const isStaff = () => {
    return user?.role?.name && user.role.name !== 'Cliente';
  };
  
  // Limpiar errores después de 5 segundos
useEffect(() => {
  if (errors.length > 0) {
    // const timer = setTimeout(() => setErrors([]), 5000);  // <-- Comentado: ya no se autolimpia
    // return () => clearTimeout(timer);  
  }
}, [errors]);

  // Escuchar eventos de error de autenticación del interceptor
  useEffect(() => {
    const handleAuthError = () => {
      setUser(null);
      setIsAuthenticated(false);
    };

    // Agregar listener para el evento auth-error
    window.addEventListener('auth-error', handleAuthError);
    
    // Limpiar el listener al desmontar el componente
    return () => {
      window.removeEventListener('auth-error', handleAuthError);
    };
  }, [navigate]);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const userData = await getUserData();
        setUser(userData);
        setIsAuthenticated(true);
      } catch (error) {
        // El interceptor ya maneja los errores 401, no es necesario hacer nada aquí
        setIsAuthenticated(false);
        setUser(null);
      } finally {
        setIsLoadingAuth(false);
      }
    };
  
    checkAuth();
  }, []);
  
  const signin = async (credentials) => {
    setLoading(true);
    try {
      await loginUser(credentials);
      const userData = await getUserData();
      setUser(userData);
      setIsAuthenticated(true);
      
      if (userData.role?.name === 'Cliente') {
        navigate("/"); 
      } else {
        navigate("/admin"); 
      }
    } catch (error) {
      setErrors([error.response?.data?.message || "Error al iniciar sesión"]);
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      await logoutUser();
      setUser(null);
      setIsAuthenticated(false);
      navigate("/");
    } catch (error) {
      setErrors([error.message]);
    }
  };

  const refreshToken = async () => {
    try {
      return await refreshAccessToken();
    } catch (error) {
      logout();
      throw error;
    }
  };

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
        isStaff
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within an AuthProvider");
  return context;
};