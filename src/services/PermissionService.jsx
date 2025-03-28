import axios from "axios";

const API_URL_PERMISSION = "http://localhost:3000/permissions";

class PermissionService {
    async getPermissions() {
        try {
            const response = await axios.get(API_URL_PERMISSION);
            return response.data;
        } catch (error) {
            console.error("Error fetching permissions:", error);
            throw error;
        }
    }

    async getPermissionById(id) {
        try {
            const response = await axios.get(`${API_URL_PERMISSION}/${id}`);
            return response.data;
        } catch (error) {
            console.error("Error fetching permission by ID:", error);
            throw error;
        }
    }

    async createPermission(permissionData) {
        try {
            const response = await axios.post(API_URL_PERMISSION, permissionData);
            return response.data;
        } catch (error) {
            console.error("Error creating permission:", error);
            throw error;
        }
    }

    async updatePermission(id, permissionData) {
        try {
            const response = await axios.put(`${API_URL_PERMISSION}/${id}`, permissionData);
            return response.data;
        } catch (error) {
            console.error("Error updating permission:", error);
            throw error;
        }
    }

    async deletePermission(id) {
        try {
            const response = await axios.delete(`${API_URL_PERMISSION}/${id}`);
            return response.data;
        } catch (error) {
            console.error("Error deleting permission:", error);
            throw error;
        }
    }
}
const permissionService = new PermissionService();
export default permissionService;