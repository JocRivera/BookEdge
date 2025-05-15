import api from "./api";



export const assignComfortsToRoom = async (idRoom, comfortsArray) => { 
  
  const response = await api.post(`/bedroom-comforts/${idRoom}/comforts`, { comforts: comfortsArray });
  return response.data; 
};

export const updateRoomComforts = async (idRoom, comfortsArray) => { 
  const response = await api.put(`/bedroom-comforts/${idRoom}/comforts`, { comforts: comfortsArray });
  return response.data; 
};
