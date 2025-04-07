import api from "./api";

export const getUsers = async () => {
  const response = await api.get("/user");
  return response.data;
};

export const createUser = async (userData) => {
  const response = await api.post("/user", userData);
  return response.data;
};

export const updateUser = async (id, userData) => {
  try {
    const response = await api.put(`/user/${id}`, userData);
    return response.data;
  } catch (error) {
    console.log(error);
  }
};
export const deleteUser = async (id) => {
  await api.delete(`/user/${id}`);
};

export const toggleUserStatus = async (id, userState) => {
  await api.patch(`/user/${id}`, userState);
};
