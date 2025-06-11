import api from "./api";

// Servicios para habitaciones
export const getBedrooms = async () => {
  const { data } = await api.get("/bedroom");
  return data;
};

export const getBedroomById = async (id) => {
  const { data } = await api.get(`/bedroom/${id}`);
  return data;
};

export const createBedroom = async (bedroomData) => {
  const dataToSend = {
    ...bedroomData,
    capacity: bedroomData.capacity ? Number(bedroomData.capacity) : undefined
  };
  const response = await api.post("/bedroom", dataToSend);
  return response.data;
};

export const updateBedroom = async (id, bedroomData) => {
  const dataToSend = {
    ...bedroomData,
    capacity: bedroomData.capacity ? Number(bedroomData.capacity) : undefined
  };
  const response = await api.put(`/bedroom/${id}`, dataToSend);
  return response.data;
};

export const deleteBedroom = async (id) => {
  const { data } = await api.delete(`/bedroom/${id}`);
  return data;
};

export const getBedroomImages = async (bedroomId) => {
  const { data } = await api.get(`/room-images/${bedroomId}`);
  return data;
};

export const uploadBedroomImages = async (bedroomId, imageFiles) => {
  const formData = new FormData();
  imageFiles.forEach(file => {
    formData.append("images", file);
  });
  const { data } = await api.post(`/room-images/${bedroomId}`, formData, {
    headers: { "Content-Type": "multipart/form-data" }
  });
  return data;
};

export const deleteBedroomImage = async (imageId) => {
  const { data } = await api.delete(`/room-images/${imageId}`);
  return data;
};

export const setPrimaryBedroomImage = async (bedroomId, imageId) => {
  const { data } = await api.put(`/room-images/${bedroomId}/primary/${imageId}`);
  return data;
};