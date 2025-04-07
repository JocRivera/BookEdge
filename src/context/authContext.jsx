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
    

    const hasPermission = (permName) => {
      if (!user || !user.role || !user.role.permissions) return false;
      return user.role.permissions.some(p => p.name === permName);
    };
    

    // Limpiar errores después de 5 segundos sassd
    useEffect(() => {
      if (errors.length > 0) {
        const timer = setTimeout(() => setErrors([]), 5000);
        return () => clearTimeout(timer);
      }
    }, [errors]);


    useEffect(() => {
      const checkAuth = async () => {
        try {
          const userData = await getUserData();
          setUser(userData);
          setIsAuthenticated(true);
        } catch (error) {
          if (error.response?.status === 401) {
            try {
              await refreshAccessToken(); 
              const userData = await getUserData(); // <-- Intenta otra vez
              setUser(userData);
              setIsAuthenticated(true);
            } catch (refreshError) {
              console.log("No se pudo refrescar el token.");
              setIsAuthenticated(false);
              setUser(null);
            }
          } else {
            console.error("Error inesperado al verificar autenticación:", error);
            setIsAuthenticated(false);
          }
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
        const userData = await getUserData()
        setUser(userData);
        setIsAuthenticated(true);
        navigate("/admin");
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
        navigate("/login");
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
          user,
          isAuthenticated,
          isLoadingAuth,
          loading,
          errors,
          signin,
          logout,
          refreshToken,
          hasPermission
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