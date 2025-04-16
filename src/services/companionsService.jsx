import axios from "axios";

const API_URL = "http://localhost:3000/companions";

export const getCompanions = async () => {
  try {
    const response = await axios.get(API_URL);
    return response.data;
  } catch (error) {
    console.error("Error obteniendo acompañantes:", error);
    throw error;
  }
};

export const getCompanionById = async (id) => {
  try {
    const response = await axios.get(`${API_URL}/${id}`);
    return response.data;
  } catch (error) {
    console.error(`Error obteniendo acompañante con ID ${id}:`, error);
    throw error;
  }
};

export const createCompanion = async (companionData) => {
  try {
    const response = await axios.post(API_URL, companionData);
    return response.data;
  } catch (error) {
    console.error("Error creando acompañante:", error);
    throw error;
  }
};

export const updateCompanion = async (id, companionData) => {
  try {
    const response = await axios.put(`${API_URL}/${id}`, companionData);
    return response.data;
  } catch (error) {
    console.error(`Error actualizando acompañante con ID ${id}:`, error);
    throw error;
  }
};

export const deleteCompanion = async (id) => {
  try {
    await axios.delete(`${API_URL}/${id}`);
  } catch (error) {
    console.error(`Error eliminando acompañante con ID ${id}:`, error);
    throw error;
  }
};

export const searchCompanions = async (filters = {}) => {
  try {
    const response = await axios.get(API_URL, { params: filters });
    return response.data;
  } catch (error) {
    console.error("Error buscando acompañantes:", error);
    throw error;
  }
};