import api from "./api";
const API_URL_PLANES = "/plan";

export const getAllPlans = async () => {
    const {data} = await api.get(API_URL_PLANES);
    return data;
};

export const getPlanById = async (id) => {
    const {data} = await api.get(`${API_URL_PLANES}/${id}`);
    return data;
};

export const createPlan = async (plan) => {
    await api.post(API_URL_PLANES, plan);
    const newPlans = await getAllPlans(); // Obtener datos actualizados
    return newPlans[newPlans.length - 1]; // Retornar el último plan (el recién creado)
};

const generateUniqueId = (data) => {
    const maxId = data.reduce((max, item) => (item.id > max ? item.id : max), 0);
    return maxId + 1;
};

export const getCabinsPerCapacity = async () => {
    const {data} = await api.get(`${API_URL_PLANES}/uniqueCapacitiesCabin`);
    let uniqueCapacities = [];
    data.forEach((item) => {
        if (!uniqueCapacities.some((capacity) => capacity.capacity === item.capacity)) {
            uniqueCapacities.push({id: generateUniqueId(uniqueCapacities), name: "Cabin", capacity: item.capacity});
        }
    });
    return uniqueCapacities;
};

export const getBedroomsPerCapacity = async () => {
    const {data} = await api.get(`${API_URL_PLANES}/uniqueCapacitiesBedroom`);
    let uniqueCapacities = [];
    data.forEach((item) => {
        if (!uniqueCapacities.some((capacity) => capacity.capacity === item.capacity)) {
            uniqueCapacities.push({id: generateUniqueId(uniqueCapacities), name: "Bedroom", capacity: item.capacity});
        }
    });
    return uniqueCapacities;
};

export const getServicesPerPlan = async () => {
    const {data} = await api.get(`${API_URL_PLANES}/servicesPerPlan`);
    return data;
};

export const deletePlan = async (planId) => {
    const response = await api.delete(`${API_URL_PLANES}/${planId}`);
    return response;
};

export const updatePlan = async (id, plan) => {
    await api.put(`${API_URL_PLANES}/${id}`, plan);
    const updatedPlan = await getAllPlans(); // Obtener datos actualizados
    return updatedPlan.find(p => p.idPlan === plan.idPlan); // Retornar el plan actualizado
};