import api from "./api";

export const getAllProgramedPlans = async () => {
    const response = await api.get("/planProgramed");
    return response.data;
};

export const createProgramedPlan = async (planProgramed) => {
    const response = await api.post("/planProgramed", planProgramed);
    return response.data;
};

export const updateProgramedPlan = async (id, planProgramed) => {
    const response = await api.put(`/planProgramed/${id}`, planProgramed);
    return response.data;
};

export const deleteProgramedPlan = async (id) => {
    const response = await api.delete(`/planProgramed/${id}`);
    return response.data;
};