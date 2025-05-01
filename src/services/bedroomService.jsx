import axios from "axios";

const API_URL = "http://localhost:3000/bedroom"; 
const IMAGE_API_URL = "http://localhost:3000/room-images"; 

export const getBedrooms = async () => {
  const { data } = await axios.get(API_URL);
  console.log(data);
  
  return data;
};

export const getBedroomById = async (id) => {
  const { data } = await axios.get(`${API_URL}/${id}`);
  return data;
};

export const createBedroom = async (bedroomData) => {
  try {
    const dataToSend = {
      ...bedroomData,
      capacity: bedroomData.capacity ? Number(bedroomData.capacity) : undefined
    };
    
    const response = await axios.post(API_URL, dataToSend);
    return response.data;
  } catch (error) {
    // Lanza el error completo de la respuesta
    throw error.response?.data || { 
      message: error.message || "Error al crear la habitación",
      errors: error.response?.data?.errors // Asegúrate de pasar los errores
    };
  }
};

// Haz lo mismo para updateBedroom
export const updateBedroom = async (id, bedroomData) => {
  try {
    const dataToSend = {
      ...bedroomData,
      capacity: bedroomData.capacity ? Number(bedroomData.capacity) : undefined
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
export const deleteBedroom = async (id) => {
  const { data } = await axios.delete(`${API_URL}/${id}`);
  return data;
};

export const getBedroomImages = async (bedroomId) => {
  const { data } = await axios.get(`${IMAGE_API_URL}/${bedroomId}`);
  return data;
};

export const uploadBedroomImages = async (bedroomId, imageFiles) => {
  const formData = new FormData();
  
  imageFiles.forEach(file => {
    formData.append("images", file);
  });
  
  const { data } = await axios.post(`${IMAGE_API_URL}/${bedroomId}`, formData, {
    headers: { "Content-Type": "multipart/form-data" }
  });
  
  return data;
};

export const deleteBedroomImage = async (imageId) => {
  const { data } = await axios.delete(`${IMAGE_API_URL}/${imageId}`);
  return data;
};

export const setPrimaryBedroomImage = async (bedroomId, imageId) => {
  const { data } = await axios.put(`${IMAGE_API_URL}/${bedroomId}/primary/${imageId}`);
  return data;
};