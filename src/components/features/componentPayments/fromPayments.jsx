import React, { useState } from 'react';
// Corrige las importaciones de iconos
import { FaCreditCard, FaMoneyBillWave, FaCalendarAlt, FaCheckCircle } from 'react-icons/fa';
// Para el icono de transferencia bancaria, puedes usar otro icono similar
import { FaExchangeAlt } from 'react-icons/fa'; // Alternativa para transferencia bancaria
import './componentPayments.css';

const PaymentForm = ({ 
  totalAmount, 
  onPaymentSubmit,
  initialData = {}
}) => {
  const [paymentData, setPaymentData] = useState({
    paymentMethod: initialData.paymentMethod || '',
    paymentDate: initialData.paymentDate || '',
    amount: initialData.amount || totalAmount,
    status: initialData.status || 'Pendiente',
    confirmationDate: initialData.confirmationDate || ''
  });

  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    const { name, value } = e.target;
    setPaymentData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Limpiar error cuando se modifica el campo
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: null
      }));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const validationErrors = validateForm();
    
    if (Object.keys(validationErrors).length === 0) {
      const completePaymentData = {
        ...paymentData,
        amount: parseFloat(paymentData.amount),
        confirmationDate: paymentData.status === 'Confirmado' ? new Date().toISOString().split('T')[0] : null
      };
      onPaymentSubmit(completePaymentData);
    } else {
      setErrors(validationErrors);
    }
  };

  const validateForm = () => {
    const errors = {};
    const today = new Date().toISOString().split('T')[0];

    if (!paymentData.paymentMethod) {
      errors.paymentMethod = 'Método de pago es requerido';
    }

    if (!paymentData.paymentDate) {
      errors.paymentDate = 'Fecha de pago es requerida';
    } else if (paymentData.paymentDate > today) {
      errors.paymentDate = 'La fecha no puede ser futura';
    }

    if (!paymentData.amount || isNaN(paymentData.amount) ){
      errors.amount = 'Monto es requerido';
    } else if (parseFloat(paymentData.amount) <= 0) {
      errors.amount = 'El monto debe ser mayor a 0';
    }

    return errors;
  };

  return (
    <div className="payment-form-container">
      <h3 className="payment-title">Información de Pago</h3>
      
      <form onSubmit={handleSubmit}>
        <div className="payment-summary">
          <div className="payment-total">
            <span>Total a Pagar:</span>
            <strong>${totalAmount.toFixed(2)}</strong>
          </div>
        </div>

        <div className={`form-group ${errors.paymentMethod ? 'has-error' : ''}`}>
          <label>
            <FaCreditCard className="input-icon" /> Método de Pago
          </label>
          <select
            name="paymentMethod"
            value={paymentData.paymentMethod}
            onChange={handleChange}
            required
          >
            <option value="">Seleccione un método</option>
            <option value="Tarjeta de Crédito">Tarjeta de Crédito</option>
            <option value="Tarjeta de Débito">Tarjeta de Débito</option>
            <option value="Transferencia Bancaria">Transferencia Bancaria</option>
            <option value="Efectivo">Efectivo</option>
            <option value="Otro">Otro</option>
          </select>
          {errors.paymentMethod && <span className="error-message">{errors.paymentMethod}</span>}
        </div>

        <div className={`form-group ${errors.paymentDate ? 'has-error' : ''}`}>
          <label>
            <FaCalendarAlt className="input-icon" /> Fecha de Pago
          </label>
          <input
            type="date"
            name="paymentDate"
            value={paymentData.paymentDate}
            onChange={handleChange}
            max={new Date().toISOString().split('T')[0]}
            required
          />
          {errors.paymentDate && <span className="error-message">{errors.paymentDate}</span>}
        </div>

        <div className={`form-group ${errors.amount ? 'has-error' : ''}`}>
          <label>
            <FaMoneyBillWave className="input-icon" /> Monto Pagado
          </label>
          <input
            type="number"
            name="amount"
            value={paymentData.amount}
            onChange={handleChange}
            min="0.01"
            step="0.01"
            required
          />
          {errors.amount && <span className="error-message">{errors.amount}</span>}
        </div>

        <div className="form-group">
          <label>
            <FaCheckCircle className="input-icon" /> Estado del Pago
          </label>
          <div className="payment-status-options">
            <label>
              <input
                type="radio"
                name="status"
                value="Pendiente"
                checked={paymentData.status === 'Pendiente'}
                onChange={handleChange}
              />
              Pendiente
            </label>
            <label>
              <input
                type="radio"
                name="status"
                value="Confirmado"
                checked={paymentData.status === 'Confirmado'}
                onChange={handleChange}
              />
              Confirmado
            </label>
          </div>
        </div>

        <div className="payment-form-actions">
          <button type="submit" className="submit-btn">
            Confirmar Pago
          </button>
        </div>
      </form>
    </div>
  );
};

export default PaymentForm;