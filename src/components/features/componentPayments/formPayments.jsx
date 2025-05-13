import PropTypes from 'prop-types';
import { useState } from 'react';
import { FaCreditCard, FaMoneyBillWave, FaCalendarAlt, FaCheckCircle, FaExchangeAlt, FaEye } from 'react-icons/fa';
import './componentPayments.css';

const PaymentForm = ({ 
  totalAmount, 
  onPaymentSubmit, 
  initialData = {}, 
  isViewMode = false, 
  onCloseView = null 
}) => {
  const [paymentData, setPaymentData] = useState({
    paymentMethod: initialData.paymentMethod || '',
    paymentDate: initialData.paymentDate || new Date().toISOString().split('T')[0],
    amount: initialData.amount || '',
    status: initialData.status || 'Pendiente',
    voucher: initialData.voucher || null
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e) => {
    if (isViewMode) return; // No permitir cambios en modo visualización
    
    const { name, value } = e.target;
    setPaymentData(prev => ({
      ...prev,
      [name]: value
    }));

    if (errors[name]) {
      setErrors(prev => {
        const updatedErrors = { ...prev };
        delete updatedErrors[name];
        return updatedErrors;
      });
    }
  };

  const handleFileChange = (e) => {
    if (isViewMode) return; 
    
    const file = e.target.files[0];
    if (file) {
      setPaymentData(prev => ({ ...prev, voucher: file }));
    }
  };

  const handleSubmit = async (e) => {
    if (isViewMode) {
      onCloseView?.();
      return;
    }
    
    e.preventDefault();
    const validationErrors = validateForm();

    if (Object.keys(validationErrors).length === 0) {
      try {
        setIsSubmitting(true);
        await onPaymentSubmit(paymentData);

        setPaymentData({
          paymentMethod: '',
          paymentDate: new Date().toISOString().split('T')[0],
          amount: '',
          status: 'Pendiente',
          voucher: null
        });
      } catch (error) {
        console.error('Error al guardar el pago:', error);
        setErrors({ submit: error.message });
      } finally {
        setIsSubmitting(false);
      }
    } else {
      setErrors(validationErrors);
    }
  };

  const validateForm = () => {
    if (isViewMode) return {}; // No validar en modo visualización
    
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
    <div className={`payment-form-container ${isViewMode ? 'view-mode' : ''}`}>
      <h3 className="payment-title">
        {isViewMode ? 'Detalles del Pago' : 'Información de Pago'}
      </h3>

      <div>
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
          {isViewMode ? (
            <div className="view-mode-value">{paymentData.paymentMethod || 'N/A'}</div>
          ) : (
            <select
              id="paymentMethod"
              name="paymentMethod"
              value={paymentData.paymentMethod}
              onChange={handleChange}
              disabled={isViewMode}
            >
              <option value="">Seleccione un método</option>
              <option value="Tarjeta de Crédito">Tarjeta de Crédito</option>
              <option value="Tarjeta de Débito">Tarjeta de Débito</option>
              <option value="Transferencia Bancaria">Transferencia Bancaria</option>
              <option value="Efectivo">Efectivo</option>
              <option value="Otro">Otro</option>
            </select>
          )}
          {errors.paymentMethod && (
            <span className="error-message">{errors.paymentMethod}</span>
          )}
        </div>

        <div className={`form-group ${errors.paymentDate ? 'has-error' : ''}`}>
          <label htmlFor="paymentDate">
            <FaCalendarAlt className="input-icon" /> Fecha de Pago
          </label>
          {isViewMode ? (
            <div className="view-mode-value">{paymentData.paymentDate || 'N/A'}</div>
          ) : (
            <input
              type="date"
              id="paymentDate"
              name="paymentDate"
              value={paymentData.paymentDate}
              onChange={handleChange}
              max={new Date().toISOString().split('T')[0]}
              disabled={isViewMode}
            />
          )}
          {errors.paymentDate && (
            <span className="error-message">{errors.paymentDate}</span>
          )}
        </div>

        <div className={`form-group ${errors.amount ? 'has-error' : ''}`}>
          <label htmlFor="amount">
            <FaMoneyBillWave className="input-icon" /> Monto Pagado
          </label>
          {isViewMode ? (
            <div className="view-mode-value">
              ${parseFloat(paymentData.amount || 0).toFixed(2)}
            </div>
          ) : (
            <input
              type="number"
              id="amount"
              name="amount"
              value={paymentData.amount}
              onChange={handleChange}
              min="0.01"
              step="0.01"
              disabled={isViewMode}
            />
          )}
          {errors.amount && (
            <span className="error-message">{errors.amount}</span>
          )}
        </div>

        <div className="form-group">
          <label>
            <FaCheckCircle className="input-icon" /> Estado del Pago
          </label>
          {isViewMode ? (
            <div className="view-mode-value">{paymentData.status || 'N/A'}</div>
          ) : (
            <div className="payment-status-options">
              <label htmlFor="status-pending">
                <input
                  type="radio"
                  id="status-pending"
                  name="status"
                  value="Pendiente"
                  checked={paymentData.status === 'Pendiente'}
                  onChange={handleChange}
                  disabled={isViewMode}
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
                  disabled={isViewMode}
                />
                Confirmado
              </label>
            </div>
          )}
        </div>

        <div className="form-group">
          <label htmlFor="voucher">
            Comprobante de Pago
          </label>
          {isViewMode ? (
            paymentData.voucher ? (
              <a 
                href={typeof paymentData.voucher === 'string' ? paymentData.voucher : URL.createObjectURL(paymentData.voucher)}
                target="_blank"
                rel="noopener noreferrer"
                className="proof-link"
              >
                <FaEye /> Ver comprobante
              </a>
            ) : (
              <div className="view-mode-value">No hay comprobante</div>
            )
          ) : (
            <input
              type="file"
              id="voucher"
              name="voucher"
              onChange={handleFileChange}
              accept="image/*,.pdf"
            />
          )}
        </div>

        <div className="payment-form-actions">
          <button
            type="button"
            className={`submit-btn ${isViewMode ? 'view-mode-btn' : ''}`}
            onClick={handleSubmit}
          >
            {isViewMode ? (
              'Cerrar'
            ) : isSubmitting ? (
              <>
                <span className="spinner"></span> Procesando...
              </>
            ) : (
              'Confirmar Pago'
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

PaymentForm.propTypes = {
  totalAmount: PropTypes.number.isRequired,
  onPaymentSubmit: PropTypes.func.isRequired,
  initialData: PropTypes.object,
  isViewMode: PropTypes.bool, 
  onCloseView: PropTypes.func 
};

export default PaymentForm;