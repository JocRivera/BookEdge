import axios from "axios";

const API_URL = "http://localhost:3000/cabins";

// Versión SUPER SIMPLE pero FUNCIONAL
export const getCabins = async () => {
  const { data } = await axios.get(API_URL);
  return data;
};
export const getCabinById = async (id) =>{
  const { data } = await axios.get(`${API_URL}/${id}`);
  return data;
}
export const createCabin = async (cabinData) => {
  const formData = new FormData();
  formData.append("name", cabinData.name);
  formData.append("description", cabinData.description);
  formData.append("capacity", cabinData.capacity);
  formData.append("status", cabinData.status);
  
  if (cabinData.imagen instanceof File) {
    formData.append("imagen", cabinData.imagen);
  }

  const { data } = await axios.post(API_URL, formData, {
    headers: { "Content-Type": "multipart/form-data" }
  });
  return data;
};
export const updateCabin = async (id, cabinData) => {
  const formData = new FormData();
  
  // Adjunta todos los campos, incluso si no cambian
  formData.append("name", cabinData.name);
  formData.append("description", cabinData.description);
  formData.append("capacity", cabinData.capacity);
  formData.append("status", cabinData.status);

  // Manejo de imágenes:
  if (cabinData.imagen instanceof File) {
    // Si hay una imagen nueva, adjúntala
    formData.append("imagen", cabinData.imagen);
  } else if (cabinData.imagen) {
    // Si es una ruta (string), envía la ruta como campo normal (no como File)
    // Esto depende de tu backend. Algunas opciones:
    // Opción 1: Enviar como campo adicional
    formData.append("imagenPath", cabinData.imagen);
    // Opción 2: Omitir el campo si no hay imagen nueva (ajusta el backend para que ignore este caso)
  }

  const { data } = await axios.put(`${API_URL}/${id}`, formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return data;
};

export const deleteCabin = async (id) => {
  const {data} =await axios.delete(`${API_URL}/${id}`);
  return data
};