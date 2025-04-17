import axios from "axios";

const API_URL = "http://localhost:3000/bedroom";

export const getBedrooms = async () => {
  const { data } = await axios.get(API_URL);
  return data;
};

export const getBedroomById = async (id) => {
  const { data } = await axios.get(`${API_URL}/${id}`);
  return data;
};

export const createBedroom = async (bedroomData) => {
  const formData = new FormData();
  formData.append("name", bedroomData.name);
  formData.append("description", bedroomData.description);
  formData.append("capacity", bedroomData.capacity);
  formData.append("status", bedroomData.status);

  if (bedroomData.imagen instanceof File) {
    formData.append("imagen", bedroomData.imagen);
  }

  const { data } = await axios.post(API_URL, formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return data;
};

export const updateBedroom = async (id, bedroomData) => {
  const formData = new FormData();

  formData.append("name", bedroomData.name);
  formData.append("description", bedroomData.description);
  formData.append("capacity", bedroomData.capacity);
  formData.append("status", bedroomData.status);

  if (bedroomData.imagen instanceof File) {
    formData.append("imagen", bedroomData.imagen);
  } else if (bedroomData.imagen) {
    formData.append("imagenPath", bedroomData.imagen); 
  }

  const { data } = await axios.put(`${API_URL}/${id}`, formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return data;
};

export const deleteBedroom = async (id) => {
  const { data } = await axios.delete(`${API_URL}/${id}`);
  return data;
};
