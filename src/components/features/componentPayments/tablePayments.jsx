import PropTypes from 'prop-types';
import { FaEye } from 'react-icons/fa';
import './componentPayments.css';

const TablePayments = ({ payments, onDetailPayment, onStatusChange, isLoading }) => {
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString('es-CO', options);
  };

  const formatCurrency = (amount) => {
  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(amount || 0);
};

  const handleStatusChange = (paymentId, e) => {
    if (onStatusChange) {
      onStatusChange(paymentId, e.target.value);
    }
  };

  const handleViewDetails = (paymentId, payment) => {
    if (onDetailPayment) {
      onDetailPayment(paymentId, payment);
    }
  };

  return (
    <div className="payments-table-container">
      <table className="payments-table">
        <thead>
          <tr>
            <th>Método</th>
            <th>Fecha</th>
            <th>Monto</th>
            <th>Estado</th>
            <th>Comprobante</th>
            {(onDetailPayment) && <th>Acciones</th>}
          </tr>
        </thead>
        <tbody>
          {isLoading ? (
            <tr>
              <td colSpan={6} className="loading-row">
                Cargando pagos...
              </td>
            </tr>
          ) : (!payments || payments.length === 0) ? (
            <tr>
              <td colSpan={6} className="no-data-row">
                No se encontraron pagos
              </td>
            </tr>
          ) : (
            payments.map((payment) => (
              <tr key={payment.idPayments || payment.tempId}>
                <td>{payment.paymentMethod}</td>
                <td>{formatDate(payment.paymentDate)}</td>
                <td>{formatCurrency(payment.amount)}</td>
                <td>
                  {onStatusChange ? (
                    <select
                      value={payment.status}
                      onChange={(e) => handleStatusChange(payment.idPayments || payment.tempId, e)}
                      className={`status-select ${(payment.status || 'Pendiente').toLowerCase()}`}
                      disabled={isLoading || payment.isTemp}
                    >
                      <option value="Confirmado">Confirmado</option>
                      <option value="Pendiente">Pendiente</option>
                      <option value="Anulado">Anulado</option>
                    </select>
                  ) : (
                    <span className={`status-badge ${(payment.status || 'Pendiente').toLowerCase()}`}>
                      {payment.status || 'Pendiente'}
                    </span>
                  )}
                </td>
                <td>
                  {payment.voucher ? (
                    <a
                      href={payment.voucher}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="proof-link"
                    >
                      Ver
                    </a>
                  ) : 'N/A'}
                </td>

                {(onDetailPayment) && (
                  <td className="actions-cell">
                    <button
                      onClick={() => handleViewDetails(payment.idPayments || payment.tempId, payment)}
                      className="action-btn eye-btn"
                      title="Ver detalles"
                      disabled={isLoading}
                    >
                      <FaEye />
                    </button>
                  </td>
                )}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
};

TablePayments.propTypes = {
  payments: PropTypes.array.isRequired,
  onDetailPayment: PropTypes.func,
  onStatusChange: PropTypes.func,
  isLoading: PropTypes.bool
};

export default TablePayments;