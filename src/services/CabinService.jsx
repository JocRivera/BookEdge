import axios from "axios";

const API_URL = "http://localhost:3000/cabins";
const IMAGE_API_URL = "http://localhost:3000/cabin-images";

// Servicios para cabañas
export const getCabins = async () => {
  const { data } = await axios.get(API_URL);
  return data;
};

export const getCabinById = async (id) => {
  const { data } = await axios.get(`${API_URL}/${id}`);
  return data;
};
export const createCabin = async (cabinData) => {
  try {
    // Convertimos capacity a número si existe
    const dataToSend = {
      ...cabinData,
      capacity: cabinData.capacity ? Number(cabinData.capacity) : undefined
    };
    
    const response = await axios.post(API_URL, dataToSend);
    return response.data;
  } catch (error) {
    throw error.response?.data || { 
      message: error.message || "Error al crear la cabaña",
      errors: error.response?.data?.errors // Asegúrate de pasar los errores
    };
  }
};
export const updateCabin = async (id, cabinData) => {
  try {
    // Convertimos capacity a número si existe
    const dataToSend = {
      ...cabinData,
      capacity: cabinData.capacity ? Number(cabinData.capacity) : undefined
    };
    
    const response = await axios.put(`${API_URL}/${id}`, dataToSend);
    return response.data;
  } catch (error) {
    throw error.response?.data || { 
      message: error.message || "Error al crear la habitación",
      errors: error.response?.data?.errors // Asegúrate de pasar los errores
    };
  }
};

export const deleteCabin = async (id) => {
  const { data } = await axios.delete(`${API_URL}/${id}`);
  return data;
};

// Servicios para imágenes de cabañas
export const getCabinImages = async (cabinId) => {
  const { data } = await axios.get(`${IMAGE_API_URL}/${cabinId}`);
  return data;
};

export const uploadCabinImages = async (cabinId, imageFiles) => {
  const formData = new FormData();
  
  // Permitir subir múltiples imágenes
  imageFiles.forEach(file => {
    formData.append("images", file);
  });
  
  const { data } = await axios.post(`${IMAGE_API_URL}/${cabinId}`, formData, {
    headers: { "Content-Type": "multipart/form-data" }
  });
  
  return data;
};

export const deleteCabinImage = async (imageId) => {
  const { data } = await axios.delete(`${IMAGE_API_URL}/${imageId}`);
  return data;
};

export const setPrimaryImage = async (cabinId, imageId) => {
  const { data } = await axios.put(`${IMAGE_API_URL}/${cabinId}/primary/${imageId}`);
  return data;
};