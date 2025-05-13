import { useState, useEffect, useMemo } from 'react';
import PropTypes from 'prop-types';
import {
  getReservationPayments,
  changePaymentStatus,
  getAllPayments
} from '../../../services/paymentsService';
import TablePayments from './tablePayments';
import './componentPayments.css';

const ViewPayments = ({ idReservation = null, totalAmount = 0, isReadOnly = false }) => {
  // Estados principales
  const [payments, setPayments] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(0);
  const [showAnulados, setShowAnulados] = useState(false);
  const itemsPerPage = 5;

  // Estados para el modal de detalles
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState(null);

  // Cargar pagos
  useEffect(() => {
    const fetchPayments = async () => {
      try {
        setIsLoading(true);
        setError(null);

        const paymentsData = idReservation
          ? await getReservationPayments(idReservation)
          : await getAllPayments();

        setPayments(Array.isArray(paymentsData) ? paymentsData : []);
      } catch (err) {
        console.error('Error al cargar pagos:', err);
        setError(`Error al cargar pagos: ${err.message}`);
      } finally {
        setIsLoading(false);
      }
    };

    fetchPayments();
  }, [idReservation]);

  // Filtrado y paginación
  const { currentItems, pageCount } = useMemo(() => {
    const term = searchTerm.toLowerCase();
    const filteredByStatus = showAnulados
      ? payments
      : payments.filter(payment => payment.status !== 'Anulado');

    const filtered = filteredByStatus.filter(payment => {
      return (
        payment.paymentMethod?.toLowerCase().includes(term) ||
        payment.status?.toLowerCase().includes(term) ||
        payment.paymentDate?.includes(searchTerm) ||
        String(payment.amount || '').includes(searchTerm)
      );
    });

    const offset = currentPage * itemsPerPage;
    return {
      currentItems: filtered.slice(offset, offset + itemsPerPage),
      pageCount: Math.max(Math.ceil(filtered.length / itemsPerPage), 1)
    };
  }, [payments, searchTerm, currentPage, itemsPerPage, showAnulados]);

  // Total pagado
  const totalPaid = useMemo(() => {
    return payments.reduce((sum, payment) => {
      return payment.status !== 'Anulado' ? sum + (Number(payment.amount) || 0) : sum;
    }, 0);
  }, [payments]);

  // Cambiar estado
  const handleStatusChange = async (paymentId, newStatus) => {
    if (!paymentId || !newStatus) return;

    try {
      setIsLoading(true);
      const updatedPayment = await changePaymentStatus(paymentId, newStatus);

      setPayments(prev => prev.map(p =>
        p.idPayments === updatedPayment.idPayments ? updatedPayment : p
      ));

      setError(null);
    } catch (err) {
      console.error('Error al cambiar estado:', err);
      setError(`Error al cambiar estado: ${err.response?.data?.message || err.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  // Ver detalles
  const handleViewDetails = (paymentId, payment) => {
    setSelectedPayment(payment);
    setIsDetailModalOpen(true);
  };

  // Formatear moneda
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('es-ES', {
      style: 'currency',
      currency: 'USD'
    }).format(amount || 0);
  };

  // Formatear fecha
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString('es-ES', options);
  };

  return (
    <div className="view-payments-container">
      {/* Encabezado */}
      <div className="payments-header">
        <h2>Gestión de Pagos</h2>
        <div className="payments-summary">
          <div className="summary-item">
            <span>Total Reserva:</span>
            <strong>{formatCurrency(totalAmount)}</strong>
          </div>
          <div className="summary-item">
            <span>Total Pagado:</span>
            <strong>{formatCurrency(totalPaid)}</strong>
          </div>
          <div className="summary-item">
            <span>Saldo Pendiente:</span>
            <strong>{formatCurrency(totalAmount - totalPaid)}</strong>
          </div>
        </div>
      </div>

      {/* Controles */}
      <div className="payments-controls">
        <div className="search-container">
          <input
            type="text"
            placeholder="Buscar pagos..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            disabled={isLoading}
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm('')}
              disabled={isLoading}
              className="clear-search"
            >
              ×
            </button>
          )}
        </div>

        <button
          onClick={() => setShowAnulados(!showAnulados)}
          className={`toggle-anulados ${showAnulados ? 'active' : ''}`}
        >
          {showAnulados ? 'Ocultar Anulados' : 'Mostrar Anulados'}
        </button>
      </div>

      {/* Mensaje de error */}
      {error && (
        <div className="error-message">
          {error}
          <button onClick={() => setError(null)}>×</button>
        </div>
      )}

      {/* Tabla */}
      <div className="payments-table-wrapper">
        <TablePayments
          payments={currentItems}
          onDetailPayment={handleViewDetails}
          onStatusChange={!isReadOnly ? handleStatusChange : null}
          isLoading={isLoading}
        />

        {pageCount > 1 && (
          <div className="pagination-container">
            <button
              onClick={() => setCurrentPage(p => Math.max(0, p - 1))}
              disabled={currentPage === 0 || isLoading}
            >
              Anterior
            </button>
            <span>Página {currentPage + 1} de {pageCount}</span>
            <button
              onClick={() => setCurrentPage(p => Math.min(pageCount - 1, p + 1))}
              disabled={currentPage >= pageCount - 1 || isLoading}
            >
              Siguiente
            </button>
          </div>
        )}
      </div>

      {/* Modal de detalles */}
      {isDetailModalOpen && selectedPayment && (
        <div className="payments-modal-overlay">
          <div className="payments-modal-container">
            <div className="modal-header-payments">
              <h2>Detalles del Pago</h2>
              <button
                className="close-button-payments"
                onClick={() => setIsDetailModalOpen(false)}
                aria-label="Cerrar"
              >
                &times;
              </button>
            </div>


            <div className="modal-body-payments">
              <div className="payment-details-grid">
                <div className="detail-group">
                  <label>Método de Pago:</label>
                  <p>{selectedPayment.paymentMethod || 'N/A'}</p>
                </div>

                <div className="detail-group">
                  <label>Fecha:</label>
                  <p>{formatDate(selectedPayment.paymentDate)}</p>
                </div>

                <div className="detail-group">
                  <label>Monto:</label>
                  <p className="amount">{formatCurrency(selectedPayment.amount)}</p>
                </div>

                <div className="status-badge-container">
                  <span className={`status-badge ${selectedPayment.status.toLowerCase()}`}>
                    {selectedPayment.status || 'Pendiente'}
                  </span>
                </div>

                <div className="detail-group">
                  <label>Comprobante:</label>
                  <p>
                    {selectedPayment.voucher ? (
                      <a
                        href={selectedPayment.voucher}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="proof-link"
                      >
                        Ver comprobante
                      </a>
                    ) : 'N/A'}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

ViewPayments.propTypes = {
  idReservation: PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.number
  ]),
  totalAmount: PropTypes.number,
  isReadOnly: PropTypes.bool
};

export default ViewPayments;