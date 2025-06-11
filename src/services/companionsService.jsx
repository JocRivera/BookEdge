import api from "./api";

export const getAllCompanions = async () => {
  try {
    const { data } = await api.get("/companions");
    return data;
  } catch (error) {
    console.error('Error fetching companions:', error);
    throw new Error('Error al obtener los acompañantes');
  }
};


/*export const getCompanionsReservations = async (idReservation) => {
  try {
    const {idReservation} = await api.get(`/reservationscompanions`)
    return;
  }catch(error){
    console.error("Error al obtener el id de la reserva")
    throw new Error ('ERROR CON EL ID DE LA RESERVA ')
  }
}*/

export const getCompanionById = async (id) => {
  try {
    const response = await api.get(`/companions/${id}`);
    return response.data;
  } catch (error) {
    console.error(`Error obteniendo acompañante con ID ${id}:`, error);
    throw error;
  }
};


export const createCompanion = async (companionData) => {
  try {
    console.log("Enviando datos de acompañante al backend:", companionData);
    
    const response = await api.post("/companions", companionData, {
      headers: {
        "Content-Type": "application/json"
      }
    });

    console.log("Respuesta del backend:", response.data);

    // Manejar diferentes formatos de respuesta del backend
    const companionId = response.data?.idCompanions || 
                       response.data?.id || 
                       response.data?.data?.id;

    if (!companionId) {
      console.error("Formato de respuesta inesperado:", response.data);
      throw new Error("El servidor no devolvió un ID válido para el acompañante");
    }

    // Devolver datos normalizados
    return {
      idCompanions: companionId,
      ...response.data
    };
  } catch (error) {
    console.error("Error detallado en createCompanion:", {
      message: error.message,
      response: error.response?.data,
      request: error.config?.data,
    });
    throw error;
  }
};
export const updateCompanion = async (id, companionData) => {
  try {
    const response = await api.put(`/companions/${id}`, companionData);
    return response.data;
  } catch (error) {
    console.error(`Error actualizando acompañante con ID ${id}:`, error);
    throw error;
  }
};

export const deleteCompanion = async (id) => {
  try {
    await api.delete(`/companions/${id}`);
  } catch (error) {
    console.error(`Error eliminando acompañante con ID ${id}:`, error);
    throw error;
  }
};
