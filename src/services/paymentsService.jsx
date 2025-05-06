import axios from "axios";

const API_URL_PAYMENTS = "http://localhost:3000/payments";
const API_URL_RESERVATIONS = "http://localhost:3000/reservations"
// Servicio para operaciones básicas de pagos

// Configuración común de axios para todas las solicitudes
const api = axios.create({
  baseURL: API_URL_PAYMENTS,
  timeout: 10000, // 10 segundos de timeout
  headers: {
    "Content-Type": "application/json",
  },
});

export const getAllPayments = async (params = {}) => {
  try {
    const response = await api.get("/", {
      params: {
        // Parámetros opcionales para filtrado, paginación, etc.
        ...params,
      },
    });
    
    // Validar que la respuesta sea un array
    if (!Array.isArray(response.data)) {
      throw new Error("La respuesta del servidor no es un arreglo válido");
    }
    
    return response.data;
  } catch (error) {
    console.error("Error fetching payments:", error);
    
    // Personalizar mensajes de error según el tipo de error
    if (error.response) {
      // Error de respuesta del servidor (4xx, 5xx)
      throw new Error(
        error.response.data.message || 
        `Error del servidor: ${error.response.status}`
      );
    } else if (error.request) {
      // Error de conexión (no se recibió respuesta)
      throw new Error("No se pudo conectar al servidor. Verifique su conexión.");
    } else {
      // Error en la configuración de la solicitud
      throw new Error("Error al configurar la solicitud de pagos");
    }
  }
};


export const getPaymentById = async (id) => {
  try {
    // Validación básica del ID
    if (!id) {
      throw new Error("Se requiere un ID de pago válido");
    }

    const response = await api.get(`/${id}`);
    
    // Validar que la respuesta tenga datos
    if (!response.data) {
      throw new Error("No se encontraron datos para este pago");
    }
    
    return response.data;
  } catch (error) {
    console.error(`Error fetching payment with ID ${id}:`, error);
    
    // Manejo específico para error 404 (No encontrado)
    if (error.response?.status === 404) {
      throw new Error("El pago solicitado no fue encontrado");
    }
    
    // Propagamos otros errores
    throw error;
  }
};

export const createPayment = async (paymentData) => {
  try {
    const formData = new FormData();

    // Campos obligatorios
    formData.append('paymentMethod', paymentData.paymentMethod);
    formData.append('paymentDate', paymentData.paymentDate);
    formData.append('amount', paymentData.amount);

    // Campos opcionales
    if (paymentData.status) formData.append('status', paymentData.status);
    if (paymentData.confirmationDate) formData.append('confirmationDate', paymentData.confirmationDate);
    if (paymentData.voucher) formData.append('voucher', paymentData.voucher);
    if (paymentData.idReservation) formData.append('idReservation', paymentData.idReservation);

    const response = await axios.post(API_URL_PAYMENTS, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      }
    });

    return response.data;
  } catch (error) {
    console.error("Error creating payment:", error.response?.data || error.message);
    throw error;
  }
};

export const updatePayment = async (id, paymentData) => {
  try {
    const formData = new FormData();

    // Campos actualizables
    if (paymentData.paymentMethod) formData.append('paymentMethod', paymentData.paymentMethod);
    if (paymentData.paymentDate) formData.append('paymentDate', paymentData.paymentDate);
    if (paymentData.amount) formData.append('amount', paymentData.amount);
    if (paymentData.status) formData.append('status', paymentData.status);
    if (paymentData.confirmationDate) formData.append('confirmationDate', paymentData.confirmationDate);
    if (paymentData.voucher) formData.append('voucher', paymentData.voucher);

    const response = await axios.put(`${API_URL_PAYMENTS}/${id}`, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      }
    });

    return response.data;
  } catch (error) {
    console.error(`Error updating payment with ID ${id}:`, error);
    throw error;
  }
};

export const deletePayment = async (id) => {
  try {
    const response = await axios.delete(`${API_URL_PAYMENTS}/${id}`);
    return response.data;
  } catch (error) {
    console.error(`Error deleting payment with ID ${id}:`, error);
    throw error;
  }
};

// Servicio para operaciones específicas de estado
export const changePaymentStatus = async (id, status) => {
  try {
    // Validar el estado según el modelo
    const validStatuses = ["Confirmado", "Pendiente", "Anulado"];
    if (!validStatuses.includes(status)) {
      throw new Error(`Invalid status. Must be one of: ${validStatuses.join(", ")}`);
    }

    const response = await axios.patch(`${API_URL_PAYMENTS}/${id}/status`, { status });
    return response.data;
  } catch (error) {
    console.error(`Error changing status for payment ${id}:`, error);
    throw error;
  }
};

// Servicio para operaciones relacionadas con reservas
export const getReservationPayments = async (idReservation) => {
  try {
    const response = await axios.get(
      `${API_URL_PAYMENTS}/reservations/${idReservation}/payments`
    );
    // Asegurar que siempre devuelva un array
    return Array.isArray(response?.data) ? response.data : [];
  } catch (error) {
    console.error(`Error getting payments for reservation ${idReservation}:`, error);
    return []; // Devuelve array vacío en caso de error
  }
};

export const addPaymentToReservation = async (paymentData) => {
  try {
    console.log("Datos de pago recibidos:", paymentData);
  const completeData = {
    amount: Number(paymentData.amount || 0),
    date: paymentData.date || new Date().toISOString().split('T')[0],
    paymentMethod: paymentData.paymentMethod || 'efectivo',
    ...paymentData
  };
  
  console.log('Enviando datos completos:', completeData);
    const response = await axios.post(`${API_URL_RESERVATIONS}/${paymentData.idReservation}/payments`, completeData);
    return response.data;
  } catch (error) {
    console.error('Error completo:', error);
    if (error.response && error.response.data) {
      console.error('Datos de respuesta del servidor:', error.response.data);
    }
    throw error;
  }
};

//Función de validación de ID (usada internamente)
// const validateId = (id, fieldName = "ID") => {
//   if (!id || isNaN(Number(id))) {
//     throw new Error(`${fieldName} must be a valid number`);
//   }
//   return Number(id);
// };

  

  