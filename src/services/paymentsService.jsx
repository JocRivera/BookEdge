import axios from "axios";

const API_URL_PAYMENTS = "http://localhost:3000/payments";

export const getAllPayments = async () => {
  try {
    const response = await axios.get(API_URL_PAYMENTS);
    return response.data;
  } catch (error) {
    console.error("Error fetching payments:", error);
    throw error;
  }
};

export const addPaymentToReservation = async (paymentData) => {
    try {
      const formData = new FormData();
      formData.append('paymentMethod', paymentData.paymentMethod);
      formData.append('paymentDate', paymentData.paymentDate);
      formData.append('amount', paymentData.amount);
      formData.append('status', paymentData.status);
      formData.append('idReservation', paymentData.idReservation);
      
      if (paymentData.paymentProof) {
        formData.append('voucher', paymentData.paymentProof);
      }
  
      const response = await axios.post(
        `${API_URL_PAYMENTS}`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        }
      );
      return response.data;
    } catch (error) {
      console.error("Error adding payment:", error);
      throw error;
    }
  };
  
  export const getReservationPayments = async (idReservation) => {
    try {
      const response = await axios.get(
        `${API_URL_PAYMENTS}/reservations/${idReservation}/payments`,
        {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        }
      );
      return response.data;
    } catch (error) {
      console.error("Error getting payments:", error);
      throw error;
    }
  };

export const updatePayment = async (paymentId, paymentData) => {
  try {
    // Similar a createPaymentForReservation, manejar FormData y JSON
    const response = await axios.put(
      `${API_URL_PAYMENTS}/${paymentId}`,
      paymentData,
      paymentData instanceof FormData ? {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      } : {}
    );
    return response.data;
  } catch (error) {
    console.error("Error updating payment:", error);
    throw error;
  }
};

export const deletePayment = async (paymentId) => {
  try {
    const response = await axios.delete(`${API_URL_PAYMENTS}/${paymentId}`);
    return response.data;
  } catch (error) {
    console.error("Error deleting payment:", error);
    throw error;
  }
};