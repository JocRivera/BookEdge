

import api from "./api"; 


export const assignComfortsToCabin = async (idCabin, comfortsArray) => { 
  
  const response = await api.post(`/cabin-comforts/${idCabin}/comforts`, { comforts: comfortsArray });
  return response.data; 
};

export const updateCabinComforts = async (idCabin, comfortsArray) => { 
  const response = await api.put(`/cabin-comforts/${idCabin}/comforts`, { comforts: comfortsArray });
  return response.data; 
};

