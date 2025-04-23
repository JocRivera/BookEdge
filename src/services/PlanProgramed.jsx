import axios from "axios";

export const getAllProgramedPlans = async() =>{
    const response = await axios.get("http://localhost:3000/planProgramed")
    return response.data
}

export const createProgramedPlan = async (planProgramed) => {
    const response = await axios.post("http://localhost:3000/planProgramed", planProgramed)
    return response.data
}

export const updateProgramedPlan = async (id, planProgramed) => {
    const response = await axios.put(`http://localhost:3000/planProgramed/${id}`, planProgramed)
    return response.data
}

export const deleteProgramedPlan = async (id) => {
    const response = await axios.delete(`http://localhost:3000/planProgramed/${id}`)
    return response.data
}