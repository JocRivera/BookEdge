import api from "./api";

const API_URL = "/services";

class ServiceService {
    async getServices() {
        try {
            const response = await api.get(API_URL);
            return response.data;
        } catch (error) {
            console.error("Error fetching services:", error);
            throw error;
        }
    }

    async createService(service) {
        try {
            const response = await api.post(API_URL, service);
            return response.data;
        } catch (error) {
            throw error.response?.data?.errors?.[0]?.msg;
        }
    }

    async updateService(serviceId, updatedService) {
        try {
            const response = await api.put(`${API_URL}/${serviceId}`, updatedService);
            return response.data;
        } catch (error) {
            console.error("Error updating service:", error);
            throw error;
        }
    }

    async deleteService(serviceId) {
        try {
            const response = await api.delete(`${API_URL}/${serviceId}`);
            return response.data;
        } catch (error) {
            console.error("Error deleting service:", error);
            throw error;
        }
    }

    async changeStatus(serviceId, StatusServices) {
        try {
            const response = await api.patch(`${API_URL}/${serviceId}`, { StatusServices });
            return response.data;
        } catch (error) {
            console.error("Error changing service status:", error);
            throw error;
        }
    }
}

const serviceService = new ServiceService();
export default serviceService;
