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


//CUSTOMERS
export const getCustomers = async () => {
  const response = await api.get("/user/customers/get");
  return response.data;
};

export const postCustomers = async (customer) => {
  const response = await api.post("/user/customers/post", customer);
  return response.data;
}

export const updateCustomers = async (customer) => {
  const response = await api.put(`/user/customers/put/${customer.idUser}`, customer);
  return response.data;
}

export const deleteCustomer = async (id) => {
  const response = await api.delete(`/user/customers/delete/${id}`);
  return response.data;
}

export const changeSatus = async (id, customer) => {
  const response = await api.patch(`/user/customers/patch/${id}`, customer);
  return response.data;
}