import axios from "axios";

const API_URL_COMPANIONS = "http://localhost:3000/companions";

export const getAllCompanions = async () => {
  try {
    const { data } = await axios.get(`${API_URL_COMPANIONS}`);
    return data;
  } catch (error) {
    console.error('Error fetching companions:', error);
    throw new Error('Error al obtener los acompañantes');
  }
};

export const getCompanionById = async (id) => {
  try {
    const response = await axios.get(`${API_URL_COMPANIONS}/${id}`);
    return response.data;
  } catch (error) {
    console.error(`Error obteniendo acompañante con ID ${id}:`, error);
    throw error;
  }
};


export const createCompanion = async (companionData) => {
  try {
    console.log("Enviando datos de acompañante al backend:", companionData);
    
    const response = await axios.post(API_URL_COMPANIONS, companionData, {
      headers: {
        "Content-Type": "application/json"
      }
    });

    console.log("Respuesta del backend:", response.data);

    // Manejar diferentes formatos de respuesta del backend
    const companionId = response.data?.idCompanions || 
                       response.data?.id || 
                       response.data?.data?.id;

    if (!companionId) {
      console.error("Formato de respuesta inesperado:", response.data);
      throw new Error("El servidor no devolvió un ID válido para el acompañante");
    }

    // Devolver datos normalizados
    return {
      idCompanions: companionId,
      ...response.data
    };
  } catch (error) {
    console.error("Error detallado en createCompanion:", {
      message: error.message,
      response: error.response?.data,
      request: error.config?.data,
    });
    throw error;
  }
};
export const updateCompanion = async (id, companionData) => {
  try {
    const response = await axios.put(`${API_URL_COMPANIONS}/${id}`, companionData);
    return response.data;
  } catch (error) {
    console.error(`Error actualizando acompañante con ID ${id}:`, error);
    throw error;
  }
};

export const deleteCompanion = async (id) => {
  try {
    await axios.delete(`${API_URL_COMPANIONS}/${id}`);
  } catch (error) {
    console.error(`Error eliminando acompañante con ID ${id}:`, error);
    throw error;
  }
};

export const searchCompanions = async (filters = {}) => {
  try {
    const response = await axios.get(API_URL_COMPANIONS, { params: filters });
    return response.data;
  } catch (error) {
    console.error("Error buscando acompañantes:", error);
    throw error;
  }
};