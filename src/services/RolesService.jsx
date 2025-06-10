import api from "./api";

const API_URL_ROL = "/roles";

class RolesService {
  async getRoles() {
    try {
      const response = await api.get(API_URL_ROL);
      return response.data;
    } catch (error) {
      console.error("Error fetching roles:", error);
      throw error;
    }
  }

  async getRoleById(id) {
    try {
      const response = await api.get(`${API_URL_ROL}/${id}`);
      return response.data;
    } catch (error) {
      console.error("Error fetching role by ID:", error);
      throw error;
    }
  }

  async createRole(roleData) {
    try {
      const response = await api.post(API_URL_ROL, roleData);
      return response.data;
    } catch (error) {
      throw error.response?.data?.errors?.[0]?.msg;
    }
  }

  async updateRole(id, roleData) {
    try {
      const response = await api.put(`${API_URL_ROL}/${id}`, roleData);
      return response.data;
    } catch (error) {
      console.error("Error updating role:", error);
      throw error;
    }
  }

  async deleteRole(id) {
    try {
      const response = await api.delete(`${API_URL_ROL}/${id}`);
      return response.data;
    } catch (error) {
      console.error("Error deleting role:", error);
      throw error;
    }
  }

  async changeStatus(id, status) {
    try {
      const response = await api.patch(`${API_URL_ROL}/${id}`, { status });
      return response.data;
    } catch (error) {
      console.error("Error changing role status:", error);
      throw error;
    }
  }
}

const rolesService = new RolesService();

export default rolesService;