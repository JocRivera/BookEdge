import axios from "axios";

const API_URL_ROL = "http://localhost:3000/roles";

class RolesService {
  async getRoles() {
    try {
      const response = await axios.get(API_URL_ROL);
      return response.data;
    } catch (error) {
      console.error("Error fetching roles:", error);
      throw error;
    }
  }

  async getRoleById(id) {
    try {
      const response = await axios.get(`${API_URL_ROL}/${id}`);
      return response.data;
    } catch (error) {
      console.error("Error fetching role by ID:", error);
      throw error;
    }
  }

  async createRole(roleData) {
    try {
      const response = await axios.post(API_URL_ROL, roleData);
      return response.data;
    } catch (error) {
      console.error("Error creating role:", error);
      throw error;
    }
  }

  async updateRole(id, roleData) {
    try {
      const response = await axios.put(`${API_URL_ROL}/${id}`, roleData);
      return response.data;
    } catch (error) {
      console.error("Error updating role:", error);
      throw error;
    }
  }

  async deleteRole(id) {
    try {
      const response = await axios.delete(`${API_URL_ROL}/${id}`);
      return response.data;
    } catch (error) {
      console.error("Error deleting role:", error);
      throw error;
    }
  }

}

const rolesService = new RolesService();

export default rolesService;