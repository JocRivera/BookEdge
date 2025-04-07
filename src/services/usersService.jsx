import axios from "axios";
import api from "./api"; // donde sea que guardaste ese archivo


const API_URL = "http://localhost:3000/user/";

export const getUsers = async () => {
  const response = await api.get("/user");
  return response.data;
};



export const createUser = async (userData) => {
  const response = await api.post("/user", userData); // ✅ ahora sí
  return response.data;
};

export const updateUser = async (id, userData) => {
  const response = await axios.put(`${API_URL}/${id}`, userData);
  return response.data;
};
export const deleteUser = async (id) => {
  await axios.delete(`${API_URL}/${id}`);
};
