import axios from "axios";

const API_URL = "http://localhost:3000/bedroom"; 
const IMAGE_API_URL = "http://localhost:3000/room-images"; 

export const getBedrooms = async () => {
  const { data } = await axios.get(API_URL);
  return data;
};

export const getBedroomById = async (id) => {
  const { data } = await axios.get(`${API_URL}/${id}`);
  return data;
};

// <<< CORRECCIÓN: Eliminamos el try/catch para que el error de Axios se propague completo.
export const createBedroom = async (bedroomData) => {
  const dataToSend = {
    ...bedroomData,
    capacity: bedroomData.capacity ? Number(bedroomData.capacity) : undefined
  };
  
  const response = await axios.post(API_URL, dataToSend);
  return response.data;
};

// <<< CORRECCIÓN: Mismo cambio aquí.
export const updateBedroom = async (id, bedroomData) => {
  const dataToSend = {
    ...bedroomData,
    capacity: bedroomData.capacity ? Number(bedroomData.capacity) : undefined
  };
  
  const response = await axios.put(`${API_URL}/${id}`, dataToSend);
  return response.data;
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