import axios from "axios"

const API_URL_RESERVATIONS = "http://localhost:3000/reservations"
const API_URL_USERS = "http://localhost:3000/user"
const API_URL_PLANS = "http://localhost:3000/plan"


/**
 * Función auxiliar para validar IDs
 * @param {any} id - ID a validar
 * @param {string} name - Nombre del campo para el mensaje de error
 * @returns {number} - ID convertido a número
 * @throws {Error} - Si el ID no es válido
 */
const validateId = (id, name = "ID") => {
  const numId = Number(id)
  if (isNaN(numId) || numId <= 0) {
    throw new Error(`${name} inválido: debe ser un número positivo`)
  }
  return numId
}

/**
 * Obtiene todas las reservas
 * @returns {Promise<Array>} - Lista de reservas
 */
export const getReservation = async () => {
  try {
    const { data } = await axios.get(API_URL_RESERVATIONS)

    if (!Array.isArray(data)) {
      console.warn("La respuesta del servidor no es un array:", data)
      return []
    }

    return data
  } catch (error) {
    console.error("Error al obtener reservas:", {
      message: error.message,
      response: error.response?.data,
    })
    throw new Error(`Error al obtener reservas: ${error.message}`)
  }
}

/**
 * Obtiene una reserva por su ID
 * @param {number|string} idReservation - ID de la reserva
 * @returns {Promise<Object>} - Datos de la reserva
 */
export const getReservationById = async (idReservation) => {
  try {
    // Validar ID
    const id = validateId(idReservation, "ID de reserva")

    const { data } = await axios.get(`${API_URL_RESERVATIONS}/${id}`)
    return data
  } catch (error) {
    console.error(`Error al obtener reserva con ID ${idReservation}:`, {
      message: error.message,
      response: error.response?.data,
    })
    throw new Error(`Error al obtener reserva: ${error.message}`)
  }
}

/**
 * Obtiene todos los usuarios
 * @returns {Promise<Array>} - Lista de usuarios
 */
export const getUsers = async () => {
  try {
    const { data } = await axios.get(API_URL_USERS)

    if (!Array.isArray(data)) {
      console.warn("La respuesta del servidor no es un array:", data)
      return []
    }

    return data
  } catch (error) {
    console.error("Error al obtener usuarios:", {
      message: error.message,
      response: error.response?.data,
    })
    return []
  }
}

/**
 * Obtiene todos los planes
 * @returns {Promise<Array>} - Lista de planes
 */
export const getAllPlanes = async () => {
  try {
    const { data } = await axios.get(API_URL_PLANS)

    if (!Array.isArray(data)) {
      console.warn("La respuesta del servidor no es un array:", data)
      return []
    }

    return data
  } catch (error) {
    console.error("Error al obtener planes:", {
      message: error.message,
      response: error.response?.data,
      config: error.config,
    })
    return []
  }
}

/**
 * Valida los datos de una reserva
 * @param {Object} reservationData - Datos de la reserva
 * @returns {Object} - Errores encontrados
 */
const validateReservationData = (reservationData) => {
  if (!reservationData) {
    throw new Error("No se proporcionaron datos de reserva")
  }

  const errors = {
    missingFields: [],
    typeErrors: [],
    businessErrors: [],
  }

  // Validar campos requeridos y tipos
  const requiredFields = {
    idUser: "number",
    idPlan: "number",
    startDate: "string",
    endDate: "string",
    status: "string",
  }

  Object.entries(requiredFields).forEach(([field, type]) => {
    if (reservationData[field] === undefined || reservationData[field] === null || reservationData[field] === "") {
      errors.missingFields.push(field)
    } else {
      const actualType = typeof reservationData[field]
      if (actualType !== type) {
        // Intentar convertir al tipo correcto
        if (type === "number" && !isNaN(Number(reservationData[field]))) {
          // Se puede convertir a número, no es un error
        } else {
          errors.typeErrors.push(`${field} debe ser ${type}, pero es ${actualType}`)
        }
      }
    }
  })

  // Validaciones de negocio
  const today = new Date().toISOString().split("T")[0]

  if (reservationData.startDate && reservationData.startDate < today) {
    errors.businessErrors.push("La fecha de inicio no puede ser en el pasado")
  }

  if (reservationData.startDate && reservationData.endDate && reservationData.startDate > reservationData.endDate) {
    errors.businessErrors.push("La fecha de fin debe ser posterior a la de inicio")
  }

  const validStatuses = ["Confirmado", "Pendiente", "Anulado", "Reservado"]
  if (reservationData.status && !validStatuses.includes(reservationData.status)) {
    errors.businessErrors.push(`Estado no válido. Use uno de: ${validStatuses.join(", ")}`)
  }

  return errors
}

/**
 * Prepara el payload para enviar al servidor
 * @param {Object} reservationData - Datos de la reserva
 * @returns {Object} - Payload preparado
 */
const prepareReservationPayload = (reservationData) => {
  return {
    idUser: Number(reservationData.idUser),
    idPlan: Number(reservationData.idPlan),
    startDate: reservationData.startDate,
    endDate: reservationData.endDate,
    status: reservationData.status || "Reservado",
    total: Number(reservationData.total) || 0,
    companionCount: Array.isArray(reservationData.companions) ? reservationData.companions.length : 0,
    companions: Array.isArray(reservationData.companions) ? reservationData.companions : [],
    paymentMethod: reservationData.paymentMethod || "Efectivo",
  }
}

/**
 * Crea una nueva reserva
 * @param {Object} reservationData - Datos de la reserva
 * @returns {Promise<Object>} - Reserva creada
 */
export const createReservation = async (reservationData) => {
  try {
    // Validar datos
    const errors = validateReservationData(reservationData)

    // Si hay errores, lanzar excepción
    if (errors.missingFields.length > 0 || errors.typeErrors.length > 0 || errors.businessErrors.length > 0) {
      const errorMessages = [
        errors.missingFields.length > 0 ? `Campos requeridos: ${errors.missingFields.join(", ")}` : "",
        errors.typeErrors.length > 0 ? `Errores de tipo: ${errors.typeErrors.join(", ")}` : "",
        errors.businessErrors.length > 0 ? `Errores de negocio: ${errors.businessErrors.join(", ")}` : "",
      ]
        .filter(Boolean)
        .join(" | ")

      throw new Error(errorMessages)
    }

    // Preparar payload
    const payload = prepareReservationPayload(reservationData)

    console.log("Payload final a enviar:", payload)

    // Enviar solicitud
    const response = await axios.post(API_URL_RESERVATIONS, payload, {
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      timeout: 5000,
    })

    console.log("Respuesta del servidor:", response.data)
    return response.data
  } catch (error) {
    console.error("Error en createReservation:", {
      message: error.message,
      response: error.response?.data,
      request: error.config?.data,
    })

    let errorMessage = error.message
    if (error.response?.data?.message) {
      errorMessage = error.response.data.message
    } else if (error.response?.data?.errors) {
      errorMessage = error.response.data.errors.map((e) => e.msg).join("\n")
    }

    throw new Error(errorMessage)
  }
}

/**
 * Actualiza una reserva existente
 * @param {number|string} idReservation - ID de la reserva
 * @param {Object} reservationData - Datos de la reserva
 * @returns {Promise<Object>} - Reserva actualizada
 */
export const updateReservation = async (idReservation, reservationData) => {
  try {
    console.log("Iniciando actualización de reserva con ID:", idReservation, "y datos:", reservationData);
    
    // Validar ID - asegurar que sea un número entero positivo
    const reservationId = Number(idReservation);
    
    if (isNaN(reservationId) || !Number.isInteger(reservationId) || reservationId <= 0) {
      throw new Error("El ID de la reserva debe ser un número entero positivo");
    }

    // Validar datos de la reserva
    const errors = validateReservationData(reservationData);

    // Si hay errores, lanzar excepción
    if (errors.missingFields.length > 0 || errors.typeErrors.length > 0 || errors.businessErrors.length > 0) {
      const errorMessages = [
        errors.missingFields.length > 0 ? `Campos requeridos: ${errors.missingFields.join(", ")}` : "",
        errors.typeErrors.length > 0 ? `Errores de tipo: ${errors.typeErrors.join(", ")}` : "",
        errors.businessErrors.length > 0 ? `Errores de negocio: ${errors.businessErrors.join(", ")}` : "",
      ]
        .filter(Boolean)
        .join(" | ");

      throw new Error(errorMessages);
    }

    // Verificar primero si la reserva existe
    console.log(`Verificando si existe la reserva con ID ${reservationId}...`);
    try {
      const { data } = await axios.get(`${API_URL_RESERVATIONS}/${reservationId}`);
      if (!data || !data.idReservation) {
        throw new Error(`La reserva con ID ${reservationId} no existe`);
      }
      console.log("Reserva encontrada:", data);
    } catch (error) {
      if (error.response && error.response.status === 404) {
        throw new Error(`La reserva con ID ${reservationId} no existe`);
      }
      console.error("Error al verificar existencia de reserva:", error.message);
      throw error;
    }

    // Preparar payload
    const payload = {
      ...prepareReservationPayload(reservationData),
      // Incluir el ID de la reserva en el payload si es requerido por el API
      idReservation: reservationId,
    };

    console.log(`Enviando PUT a ${API_URL_RESERVATIONS}/${reservationId}`);
    console.log("Payload:", payload);

    // Enviar solicitud
    const response = await axios.put(`${API_URL_RESERVATIONS}/${reservationId}`, payload, {
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      timeout: 10000,
    });

    console.log("Respuesta del servidor:", response.data);
    return response.data;
  } catch (error) {
    console.error("Error detallado en updateReservation:", {
      message: error.message,
      response: error.response?.data,
      request: error.config?.data,
    });

    let errorMessage = "Error al actualizar la reserva";
    if (error.response?.data?.message) {
      errorMessage = error.response.data.message;
    } else if (error.response?.data?.errors) {
      errorMessage = error.response.data.errors.map((e) => e.msg).join(", ");
    } else {
      errorMessage = error.message;
    }

    throw new Error(errorMessage);
  }
}

export const changeReservationStatus = async (idReservation, status) => {
  try {
    console.log("[DEBUG] Attempting to change status with:", {
      idReservation,
      status,
      typeOfStatus: typeof status,
    })

    // Validar ID
    const id = validateId(idReservation, "ID de reserva")

    // Validar estado
    const validStatuses = ["Confirmado", "Pendiente", "Anulado", "Reservado"]
    if (!validStatuses.includes(status)) {
      throw new Error(`Estado no válido. Use uno de: ${validStatuses.join(", ")}`)
    }

    // Obtener primero la reserva actual para no perder datos
    const currentReservation = await getReservationById(id)

    if (!currentReservation) {
      throw new Error(`No se encontró la reserva con ID ${id}`)
    }

    // Preparar payload completo con todos los datos de la reserva
    // Asegurarse de que todos los campos necesarios estén presentes
    const payload = {
      idUser: currentReservation.idUser,
      idPlan: currentReservation.idPlan,
      startDate: currentReservation.startDate,
      endDate: currentReservation.endDate,
      status: status, // Actualizar solo el estado
      total: currentReservation.total || 0,
      companionCount: Array.isArray(currentReservation.companions) ? currentReservation.companions.length : 0,
      companions: Array.isArray(currentReservation.companions) ? currentReservation.companions : [],
      paymentMethod: currentReservation.paymentMethod || "Efectivo",
      // Incluir el ID de la reserva en el payload si es necesario
      idReservation: id,
    }

    console.log("[DEBUG] Full payload:", payload)

    // Usar PUT en lugar de PATCH
    const response = await axios.put(`${API_URL_RESERVATIONS}/${id}`, payload, {
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      timeout: 10000,
    })

    console.log("[DEBUG] Server response:", response.data)
    return response.data
  } catch (error) {
    console.error(`[ERROR] Changing status for reservation ${idReservation}:`, {
      message: error.message,
      response: error.response?.data,
      config: error.config,
    })

    // Mostrar detalles específicos del error si están disponibles
    if (error.response?.data?.errors) {
      console.error("Validation errors:", error.response.data.errors)
    }

    throw new Error(`Error al cambiar estado: ${error.message}`)
  }
}


/**
 * Obtiene los acompañantes de una reserva
 * @param {number|string} reservationId - ID de la reserva
 * @returns {Promise<Array>} - Lista de acompañantes
 */
export const getReservationCompanions = async (reservationId) => {
  try {
    // Validar ID
    const id = validateId(reservationId, "ID de reserva")

    const { data } = await axios.get(`${API_URL_RESERVATIONS}/${id}/companions`)

    if (!Array.isArray(data)) {
      console.warn("La respuesta del servidor no es un array:", data)
      return []
    }

    return data
  } catch (error) {
    console.error(`Error al obtener acompañantes de reserva con ID ${reservationId}:`, {
      message: error.message,
      response: error.response?.data,
    })
    return []
  }
}
// En reservationsService.jsx, actualiza estos métodos:

/**
 * Agrega un acompañante a una reserva
 * @param {number|string} reservationId - ID de la reserva
 * @param {Object} companionData - Datos del acompañante
 * @returns {Promise<Object>} - Acompañante agregado
 */
// Modificar addCompanionReservation
export const addCompanionReservation = async (reservationId, companionData) => {
  try {
    console.log("Intentando asociar acompañante:", { reservationId, companionData });
    
    const id = validateId(reservationId, "ID de reserva");
    
    if (!companionData?.idCompanions) {
      throw new Error("Falta el ID del acompañante");
    }

    const payload = {
      idCompanions: Number(companionData.idCompanions)
    };

    const response = await axios.post(
      `${API_URL_RESERVATIONS}/${id}/companions`,
      payload,
      {
        headers: {
          "Content-Type": "application/json",
        }
      }
    );
    
    console.log("Respuesta del servidor:", response.data);
    return response.data;
    
  } catch (error) {
    console.error("Error detallado:", {
      url: error.config?.url,
      data: error.config?.data,
      status: error.response?.status,
      response: error.response?.data
    });
    
    let errorMessage = error.response?.data?.message || error.message;
    throw new Error(`Error al asociar acompañante: ${errorMessage}`);
  }
};
export const associateCompanionToReservation = async (reservationId, companionId) => {
  try {
    const response = await axios.post(
      `/reservations/${reservationId}/companions`,
      { idCompanions: companionId }, // Asegúrate que coincida con lo que espera tu backend
      {
        headers: {
          'Content-Type': 'application/json',
        }
      }
    );
    return response.data;
  } catch (error) {
    console.error("Error en associateCompanionToReservation:", {
      reservationId,
      companionId,
      error: error.response?.data || error.message
    });
    throw error;
  }
};

/**
 * Elimina un acompañante de una reserva
 * @param {number|string} reservationId - ID de la reserva
 * @param {number|string} companionId - ID del acompañante
 * @returns {Promise<Object>} - Respuesta del servidor
 */
export const deleteCompanionReservation = async (reservationId, companionId) => {
  try {
    // Validar IDs
    const resId = validateId(reservationId, "ID de reserva");
    const compId = validateId(companionId, "ID de acompañante");

    const { data } = await axios.delete(`${API_URL_RESERVATIONS}/${resId}/companions/${compId}`);
    return data;
  } catch (error) {
    console.error(`Error al eliminar acompañante ${companionId} de reserva ${reservationId}:`, {
      message: error.message,
      response: error.response?.data,
    });
    throw new Error(`Error al eliminar acompañante: ${error.message}`);
  }
}
/**
 * Obtiene los pagos de una reserva
 * @param {number|string} reservationId - ID de la reserva
 * @returns {Promise<Array>} - Lista de pagos
 */
export const getReservationPayments = async (reservationId) => {
  try {
    // Validar ID
    const id = validateId(reservationId, "ID de reserva")

    const { data } = await axios.get(`${API_URL_RESERVATIONS}/${id}/payments`)

    if (!Array.isArray(data)) {
      console.warn("La respuesta del servidor no es un array:", data)
      return []
    }

    return data
  } catch (error) {
    console.error(`Error al obtener pagos de reserva con ID ${reservationId}:`, {
      message: error.message,
      response: error.response?.data,
    })
    return []
  }
}
