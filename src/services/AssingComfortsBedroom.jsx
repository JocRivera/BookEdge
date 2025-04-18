import api from "./api";

export const getAllComfortsForBedRoom = async () => {
    const response = await api.get("/bedroom-comforts/all");
    return response.data;
  };
export const getBedRoomsWithoutComforts = async () => {
  const response = await api.get("/bedroom-comforts/bedrooms-without-comforts");
  return response.data;
};


// Asignar comodidades a una cabaña
export const assignComfortsToBedRoom = async (data) => {
  const response = await api.post("/bedroom-comforts/assign", data);
  return response.data;
};

export const updateComfortsToBedRoom = async (data,id) => {
  const response = await api.put("/bedroom-comforts/update", data,id);
  return response.data;
};