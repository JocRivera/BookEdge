import api from "./api";

class PermissionService {
    async getPermissions() {
        try {
            const response = await api.get("/permissions");
            return response.data;
        } catch (error) {
            console.error("Error fetching permissions:", error);
            throw error;
        }
    }

    async getPermissionById(id) {
        try {
            const response = await api.get(`/permissions/${id}`);
            return response.data;
        } catch (error) {
            console.error("Error fetching permission by ID:", error);
            throw error;
        }
    }

    async createPermission(permissionData) {
        try {
            const response = await api.post("/permissions", permissionData);
            return response.data;
        } catch (error) {
            console.error("Error creating permission:", error);
            throw error;
        }
    }

    async updatePermission(id, permissionData) {
        try {
            const response = await api.put(`/permissions/${id}`, permissionData);
            return response.data;
        } catch (error) {
            console.error("Error updating permission:", error);
            throw error;
        }
    }

    async deletePermission(id) {
        try {
            const response = await api.delete(`/permissions/${id}`);
            return response.data;
        } catch (error) {
            console.error("Error deleting permission:", error);
            throw error;
        }
    }

    async getPrivileges() {
        try {
            const response = await api.get("/privileges");
            return response.data;
        } catch (error) {
            console.error("Error fetching privileges:", error);
            throw error;
        }
    }

    async getPrivilegeById(id) {
        try {
            const response = await api.get(`/privileges/${id}`);
            return response.data;
        } catch (error) {
            console.error("Error fetching privilege by ID:", error);
            throw error;
        }
    }
}
const permissionService = new PermissionService();
export default permissionService;