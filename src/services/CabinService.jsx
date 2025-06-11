import api from "./api";

// Servicios para cabañas
export const getCabins = async () => {
  const { data } = await api.get("/cabins");
  return data;
};

export const getCabinById = async (id) => {
  const { data } = await api.get(`/cabins/${id}`);
  return data;
};

export const createCabin = async (cabinData) => {
  const dataToSend = {
    ...cabinData,
    capacity: cabinData.capacity ? Number(cabinData.capacity) : undefined
  };
  const response = await api.post("/cabins", dataToSend);
  return response.data;
};

export const updateCabin = async (id, cabinData) => {
  const dataToSend = {
    ...cabinData,
    capacity: cabinData.capacity ? Number(cabinData.capacity) : undefined
  };
  const response = await api.put(`/cabins/${id}`, dataToSend);
  return response.data;
};

export const deleteCabin = async (id) => {
  const { data } = await api.delete(`/cabins/${id}`);
  return data;
};

// Servicios para imágenes de cabañas
export const getCabinImages = async (cabinId) => {
  const { data } = await api.get(`/cabin-images/${cabinId}`);
  return data;
};

export const uploadCabinImages = async (cabinId, imageFiles) => {
  const formData = new FormData();
  imageFiles.forEach(file => {
    formData.append("images", file);
  });
  const { data } = await api.post(`/cabin-images/${cabinId}`, formData, {
    headers: { "Content-Type": "multipart/form-data" }
  });
  return data;
};

export const deleteCabinImage = async (imageId) => {
  const { data } = await api.delete(`/cabin-images/${imageId}`);
  return data;
};

export const setPrimaryImage = async (cabinId, imageId) => {
  const { data } = await api.put(`/cabin-images/${cabinId}/primary/${imageId}`);
  return data;
};