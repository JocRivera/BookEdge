import axios from "axios";

const API_URL = "http://localhost:3000/comforts";

export const getComforts = async () => {
  try {
    const response = await axios.get(API_URL);
    return response.data;
  } catch (error) {
    console.error("Error obteniendo comodidades:", error);
    throw error;
  }
};

// services/ComfortService.js
export const createComfort = async (comfortData) => {
  try {
    const response = await axios.post(API_URL, comfortData);
    return response.data;
  } catch (error) {
    // Nuevo: Lanza el error completo para manejarlo en el componente
    throw error.response?.data || { message: "Error desconocido" };
  }
};

export const updateComfort = async (id, comfortData) => {
  try {
    const response = await axios.put(`${API_URL}/${id}`, comfortData);
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: "Error al actualizar" };
  }
};
export const deleteComfort = async (id) => {
  try {
    await axios.delete(`${API_URL}/${id}`);
  } catch (error) {
    console.error("Error eliminando comodidad:", error);
    throw error;
  }
};
