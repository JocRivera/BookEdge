import axios from "axios";

const API_URL = "http://localhost:3000/services"; // Corrige la URL si es necesario

class ServiceService {
    async getServices() {
        try {
            const response = await axios.get(API_URL);
            return response.data;
        } catch (error) {
            console.error("Error fetching services:", error);
            throw error;
        }
    }

    async createService(service) {
        try {
            const response = await axios.post(API_URL, service);
            return response.data;
        } catch (error) {
            console.error("Error creating service:", error);
            throw error;
        }
    }

    async updateService(serviceId, updatedService) {
        try {
            const response = await axios.put(`${API_URL}/${serviceId}`, updatedService);
            return response.data;
        } catch (error) {
            console.error("Error updating service:", error);
            throw error;
        }
    }

    async deleteService(serviceId) {
        try {
            const response = await axios.delete(`${API_URL}/${serviceId}`);
            return response.data;
        } catch (error) {
            console.error("Error deleting service:", error);
            throw error;
        }
    }
}

const serviceService = new ServiceService();
export default serviceService;
