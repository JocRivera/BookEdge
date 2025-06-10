import api from "./api";

export const getComforts = async () => {
  try {
    const response = await api.get("/comforts");
    return response.data;
  } catch (error) {
    console.error("Error obteniendo comodidades:", error);
    throw error;
  }
};

export const createComfort = async (comfortData) => {
  try {
    const response = await api.post("/comforts", comfortData);
    return response.data;
  } catch (error) {
    if (error.response) {
      throw error.response.data;
    }
    throw error;
  }
};

export const updateComfort = async (id, comfortData) => {
  try {
    const response = await api.put(`/comforts/${id}`, comfortData);
    return response.data;
  } catch (error) {
    throw error.response?.data || {
      message: error.message || "Error al crear la comodidad",
      errors: error.response?.data?.errors
    };
  }
};
export const deleteComfort = async (id) => {
  try {
    await api.delete(`/comforts/${id}`);
  } catch (error) {
    console.error("Error eliminando comodidad:", error);
    throw error;
  }
};
