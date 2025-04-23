import PropTypes from 'prop-types';
import { useState } from 'react';
import { FaCreditCard, FaMoneyBillWave, FaCalendarAlt, FaCheckCircle, FaExchangeAlt } from 'react-icons/fa';
import './componentPayments.css';

const PaymentForm = ({ 
  totalAmount, 
  onPaymentSubmit,
  initialData = {}
}) => {
  const [paymentData, setPaymentData] = useState({
    paymentMethod: initialData.paymentMethod || '',
    paymentDate: initialData.paymentDate || '',
    amount: initialData.amount || totalAmount || 0,
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
      setErrors(prev => {
        const updatedErrors = { ...prev };
        delete updatedErrors[name];
        return updatedErrors;
      });
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const validationErrors = validateForm();
    
    if (Object.keys(validationErrors).length === 0) {
      const completePaymentData = {
        ...paymentData,
        amount: parseFloat(paymentData.amount),
        confirmationDate: paymentData.status === 'Confirmado' 
          ? new Date().toISOString().split('T')[0] 
          : paymentData.confirmationDate
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

    if (!paymentData.amount || isNaN(parseFloat(paymentData.amount))) {
      errors.amount = 'Monto es requerido';
    } else if (parseFloat(paymentData.amount) <= 0) {
      errors.amount = 'El monto debe ser mayor a 0';
    } else if (parseFloat(paymentData.amount) > parseFloat(totalAmount || 0)) {
      errors.amount = 'El monto no puede ser mayor al total a pagar';
    }

    return errors;
  };

  const renderPaymentMethodIcon = () => {
    switch (paymentData.paymentMethod) {
      case 'Tarjeta de Crédito':
      case 'Tarjeta de Débito':
        return <FaCreditCard className="input-icon" />;
      case 'Transferencia Bancaria':
        return <FaExchangeAlt className="input-icon" />;
      case 'Efectivo':
        return <FaMoneyBillWave className="input-icon" />;
      default:
        return <FaCreditCard className="input-icon" />;
    }
  };

  return (
    <div className="payment-form-container">
      <h3 className="payment-title">Información de Pago</h3>
      
      <div onSubmit={handleSubmit} noValidate>
        <div className="payment-summary">
          <div className="payment-total">
            <span>Total a Pagar:</span>
            <strong>${(totalAmount || 0).toFixed(2)}</strong>
          </div>
        </div>

        <div className={`form-group ${errors.paymentMethod ? 'has-error' : ''}`}>
          <label htmlFor="paymentMethod">
            {renderPaymentMethodIcon()} Método de Pago
          </label>
          <select
            id="paymentMethod"
            name="paymentMethod"
            value={paymentData.paymentMethod}
            onChange={handleChange}
            aria-invalid={!!errors.paymentMethod}
            aria-describedby={errors.paymentMethod ? "paymentMethod-error" : undefined}
          >
            <option value="">Seleccione un método</option>
            <option value="Tarjeta de Crédito">Tarjeta de Crédito</option>
            <option value="Tarjeta de Débito">Tarjeta de Débito</option>
            <option value="Transferencia Bancaria">Transferencia Bancaria</option>
            <option value="Efectivo">Efectivo</option>
            <option value="Otro">Otro</option>
          </select>
          {errors.paymentMethod && (
            <span className="error-message" id="paymentMethod-error">{errors.paymentMethod}</span>
          )}
        </div>

        <div className={`form-group ${errors.paymentDate ? 'has-error' : ''}`}>
          <label htmlFor="paymentDate">
            <FaCalendarAlt className="input-icon" /> Fecha de Pago
          </label>
          <input
            type="date"
            id="paymentDate"
            name="paymentDate"
            value={paymentData.paymentDate}
            onChange={handleChange}
            max={new Date().toISOString().split('T')[0]}
            aria-invalid={!!errors.paymentDate}
            aria-describedby={errors.paymentDate ? "paymentDate-error" : undefined}
          />
          {errors.paymentDate && (
            <span className="error-message" id="paymentDate-error">{errors.paymentDate}</span>
          )}
        </div>

        <div className={`form-group ${errors.amount ? 'has-error' : ''}`}>
          <label htmlFor="amount">
            <FaMoneyBillWave className="input-icon" /> Monto Pagado
          </label>
          <input
            type="number"
            id="amount"
            name="amount"
            value={paymentData.amount}
            onChange={handleChange}
            min="0.01"
            step="0.01"
            aria-invalid={!!errors.amount}
            aria-describedby={errors.amount ? "amount-error" : undefined}
          />
          {errors.amount && (
            <span className="error-message" id="amount-error">{errors.amount}</span>
          )}
        </div>

        <div className="form-group">
          <label>
            <FaCheckCircle className="input-icon" /> Estado del Pago
          </label>
          <div className="payment-status-options">
            <label htmlFor="status-pending">
              <input
                type="radio"
                id="status-pending"
                name="status"
                value="Pendiente"
                checked={paymentData.status === 'Pendiente'}
                onChange={handleChange}
              />
              Pendiente
            </label>
            <label htmlFor="status-confirmed">
              <input
                type="radio"
                id="status-confirmed"
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
      </div>
    </div>
  );
};

// Validación de propiedades
PaymentForm.propTypes = {
  totalAmount: PropTypes.number.isRequired,
  onPaymentSubmit: PropTypes.func.isRequired,
  initialData: PropTypes.object
};

export default PaymentForm;