import axios from "axios";

const API_URL = "http://localhost:3000/reservations";


export const getReservation = async () => {
  const { data } = await axios.get(API_URL);
  return data;
};

export const getReservationById = async (id) => {
  const { data } = await axios.get(`${API_URL}/${id}`);
  return data;
};

export const createReservation = async (reservationData) => {
  const needsFormData = reservationData.paymentProof instanceof File || reservationData.documents?.some(doc => doc instanceof File);
  
  if (needsFormData) {
    const formData = new FormData();
    
    // Campos básicos
    formData.append("idUse", reservationData.idUser);
    formData.append("plan", reservationData.plan.idPlan);
    formData.append("startDate", reservationData.startDate);
    formData.append("endDate", reservationData.endDate);
    formData.append("status", reservationData.status || "Reservada");
    formData.append("total", reservationData.plan.salePrice);
    formData.append("companionCount", reservationData.companionCount);
    
    // Acompañantes 
    if (reservationData.companions && reservationData.companions.length > 0) {
      formData.append("companions", JSON.stringify(reservationData.companions));
    }
    
    
    if (reservationData.documents) {
      reservationData.documents.forEach((doc, index) => {
        if (doc instanceof File) {
          formData.append(`document_${index}`, doc);
        }
      });
    }

    const { data } = await axios.post(API_URL, formData, {
      headers: { "Content-Type": "multipart/form-data" }
    });
    return data;
  } else {
    // Si no hay archivos, envía como JSON normal
    const { data } = await axios.post(API_URL, reservationData);
    return data;
  }
};

export const updateReservation = async (id, reservationData) => {
  // Similar a create pero con PUT
  const needsFormData = reservationData.paymentProof instanceof File || 
                       reservationData.documents?.some(doc => doc instanceof File);
  
  if (needsFormData) {
    const formData = new FormData();
    
    // Campos básicos
    formData.append("client", reservationData.client);
    formData.append("plan", reservationData.plan);
    formData.append("startDate", reservationData.startDate);
    formData.append("endDate", reservationData.endDate);
    formData.append("status", reservationData.status);
    formData.append("total", reservationData.total);
    
    // Acompañantes
    if (reservationData.companions) {
      formData.append("companions", JSON.stringify(reservationData.companions));
    }
    
    // Documentos
    if (reservationData.documents) {
      reservationData.documents.forEach((doc, index) => {
        if (doc instanceof File) {
          formData.append(`document_${index}`, doc);
        } else if (doc) {
          formData.append(`documentPath_${index}`, doc);
        }
      });
    }

    const { data } = await axios.put(`${API_URL}/${id}`, formData, {
      headers: { "Content-Type": "multipart/form-data" }
    });
    return data;
  } else {
    const { data } = await axios.put(`${API_URL}/${id}`, reservationData);
    return data;
  }
};

export const deleteReservation = async (id) => {
  const { data } = await axios.delete(`${API_URL}/${id}`);
  return data;
};

export const changeReservationStatus = async (id, status) => {
  const { data } = await axios.patch(`${API_URL}/${id}/status`, { status });
  return data;
};

export const getReservationCompanions = async (reservationId) => {
  const { data } = await axios.get(`${API_URL}/${reservationId}/companions`);
  return data;
};

export const addCompanionToReservation = async (reservationId, companionData) => {
  const { data } = await axios.post(`${API_URL}/${reservationId}/companions`, companionData);
  return data;
};

export const getReservationPayments = async (reservationId) => {
  const { data } = await axios.get(`${API_URL}/${reservationId}/payments`);
  return data;
};