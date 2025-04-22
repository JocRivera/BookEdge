import api from "./api";

export const loginUser = async (credentials) => {
  try {
    const response = await api.post("/auth/login", credentials);
    return response.data;
  } catch (error) {
    console.error("Error en el login:", error);
    throw error;
  }
};

export const register = async (userData) => {
  try {
    const response = await api.post("/auth/register", userData);
    return response.data;
  } catch (error) {
    console.error("Errores del backend:", error.response?.data?.errors); // <-- Agrega esto
    throw error;
  }
};

export const logoutUser = async () => {
  try {
    const response = await api.post("/auth/logout");
    return response.data;
  } catch (error) {
    console.error("Error al cerrar sesión:", error);
    throw error;
  }
};

export const refreshToken = async () => {
  try {
    const response = await api.post("/auth/refresh");
    return response.data;
  } catch (error) {
    console.error("Error al refrescar el token:", error);
    throw error;
  }
};

export const recoverPassword = async (email) => {
  try {
    const response = await api.post("/auth/recover-password", { email });
    return response.data;
  } catch (error) {
    console.error("Error al recuperar la contraseña:", error);
    throw error;
  }
};

export const resetPassword = async (token, newPassword) => {
  try {
    const response = await api.post("/auth/reset-password", {
      token,
      newPassword,
    });
    return response.data;
  } catch (error) {
    console.error("Error al restablecer la contraseña:", error);
    throw error;
  }
};

export const getUserData = async () => {
  try {
    const response = await api.get("/auth/me");
    return response.data;
  } catch (error) {
    console.error("Error al obtener los datos del usuario:", error);
    throw error;
  }
};

export const updateProfile = async ({ idUser, ...data }) => {
  
  const payload = (({ name,email,identificationType,identification, eps, cellphone, address, birthdate }) => 
    ({ name,email,identificationType,identification, eps, cellphone, address, birthdate }))(data);

  try {
    const { data: response } = await api.put(`/auth/update/${idUser}`, payload);
    return { ...response, idUser };
  } catch (error) {
    console.error("Error:", error.response?.data || error.message);
    throw error;
  }
};

