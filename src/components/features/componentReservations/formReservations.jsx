import React, { useEffect, useState } from "react";
import "./componentsReservations.css";
import { FaUser, FaBed, FaCalendarAlt, FaDollarSign, FaInfoCircle } from "react-icons/fa";

function FormReservation({ reservationData, onClose, onSave, isOpen }) {
  const [formData, setFormData] = useState({
    client: "",
    room: "",
    checkIn: "",
    checkOut: "",
    status: "Confirmada",
    total: 0,
    specialRequests: ""
  });

  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (reservationData) {
      setFormData(reservationData);
    } else {
      // Reset form when creating new reservation
      setFormData({
        client: "",
        room: "",
        checkIn: "",
        checkOut: "",
        status: "Confirmada",
        total: 0,
        specialRequests: ""
      });
    }
  }, [reservationData]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error when field is edited
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: null
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    const today = new Date().toISOString().split('T')[0];
    
    if (!formData.client) newErrors.client = "Cliente es requerido";
    if (!formData.room) newErrors.room = "Habitación es requerida";
    if (!formData.checkIn) newErrors.checkIn = "Fecha de entrada es requerida";
    if (!formData.checkOut) newErrors.checkOut = "Fecha de salida es requerida";
    
    if (formData.checkIn && formData.checkOut && formData.checkIn > formData.checkOut) {
      newErrors.checkOut = "La fecha de salida debe ser posterior a la de entrada";
    }
    
    if (formData.checkIn && formData.checkIn < today) {
      newErrors.checkIn = "La fecha de entrada no puede ser en el pasado";
    }
    
    if (formData.total < 0) newErrors.total = "El total no puede ser negativo";
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validateForm()) {
      onSave({
        ...formData,
        total: parseFloat(formData.total)
      });
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-container">
        <div className="modal-header">
          <h2>
            {reservationData && reservationData.id ? "Editar Reservación" : "Nueva Reservación"}
          </h2>
          <button className="close-button" onClick={onClose}>
            ×
          </button>
        </div>
        <div className="modal-body">
          <form onSubmit={handleSubmit}>
            <div className="form-grid">
              {/* Cliente */}
              <div className={`form-group ${errors.client ? 'has-error' : ''}`}>
                <label htmlFor="client">
                  <FaUser className="input-icon" /> Cliente
                </label>
                <input
                  type="text"
                  id="client"
                  name="client"
                  value={formData.client}
                  onChange={handleChange}
                  placeholder="Nombre del cliente"
                  required
                />
                {errors.client && <span className="error-message">{errors.client}</span>}
              </div>

              {/* Habitación */}
              <div className={`form-group ${errors.room ? 'has-error' : ''}`}>
                <label htmlFor="room">
                  <FaBed className="input-icon" /> Habitación
                </label>
                <select
                  id="room"
                  name="room"
                  value={formData.room}
                  onChange={handleChange}
                  required
                >
                  <option value="">Seleccione una habitación</option>
                  <option value="Habitación 101">Habitación 101</option>
                  <option value="Habitación 102">Habitación 102</option>
                  <option value="Suite 201">Suite 201</option>
                  <option value="Suite 202">Suite 202</option>
                  <option value="Habitación VIP 301">Habitación VIP 301</option>
                </select>
                {errors.room && <span className="error-message">{errors.room}</span>}
              </div>

              {/* Fechas */}
              <div className="date-group">
                <div className={`form-group ${errors.checkIn ? 'has-error' : ''}`}>
                  <label htmlFor="checkIn">
                    <FaCalendarAlt className="input-icon" /> Check-In
                  </label>
                  <input
                    type="date"
                    id="checkIn"
                    name="checkIn"
                    value={formData.checkIn}
                    onChange={handleChange}
                    required
                  />
                  {errors.checkIn && <span className="error-message">{errors.checkIn}</span>}
                </div>

                <div className={`form-group ${errors.checkOut ? 'has-error' : ''}`}>
                  <label htmlFor="checkOut">
                    <FaCalendarAlt className="input-icon" /> Check-Out
                  </label>
                  <input
                    type="date"
                    id="checkOut"
                    name="checkOut"
                    value={formData.checkOut}
                    onChange={handleChange}
                    required
                  />
                  {errors.checkOut && <span className="error-message">{errors.checkOut}</span>}
                </div>
              </div>

              {/* Estado y Total */}
              <div className="status-total-group">
                <div className="form-group">
                  <label htmlFor="status">Estado</label>
                  <select
                    id="status"
                    name="status"
                    value={formData.status}
                    onChange={handleChange}
                  >
                    <option value="Confirmada">Confirmada</option>
                    <option value="Pendiente">Pendiente</option>
                    <option value="Cancelada">Cancelada</option>
                    <option value="Completada">Completada</option>
                  </select>
                </div>

                <div className={`form-group ${errors.total ? 'has-error' : ''}`}>
                  <label htmlFor="total">
                    <FaDollarSign className="input-icon" /> Total
                  </label>
                  <input
                    type="number"
                    id="total"
                    name="total"
                    value={formData.total}
                    onChange={handleChange}
                    min="0"
                    step="0.01"
                    placeholder="0.00"
                  />
                  {errors.total && <span className="error-message">{errors.total}</span>}
                </div>
              </div>

              {/* Solicitudes especiales */}
              <div className="form-group full-width">
                <label htmlFor="specialRequests">
                  <FaInfoCircle className="input-icon" /> Solicitudes Especiales
                </label>
                <textarea
                  id="specialRequests"
                  name="specialRequests"
                  value={formData.specialRequests}
                  onChange={handleChange}
                  placeholder="Notas adicionales o solicitudes especiales..."
                  rows="3"
                />
              </div>
            </div>

            <div className="modal-footer">
              <button type="button" className="cancel-btn" onClick={onClose}>
                Cancelar
              </button>
              <button type="submit" className="submit-btn">
                {reservationData && reservationData.id ? "Guardar Cambios" : "Crear Reservación"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default FormReservation;