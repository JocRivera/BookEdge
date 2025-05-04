import { useState, useEffect, useMemo } from 'react';
import PropTypes from 'prop-types';
import {
  getReservationPayments,
  updatePayment,
  deletePayment,
  changePaymentStatus,
  getAllPayments
} from '../../../services/paymentsService';
import TablePayments from './tablePayments';
import './componentPayments.css';

const ViewPayments = ({ idReservation = null, totalAmount = 0, isReadOnly = false }) => {
  // Estados
  const [payments, setPayments] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(0);
  const [triggerRefresh,] = useState(0);
  const [showAnulados, setShowAnulados] = useState(false); // Nuevo estado para mostrar anulados
  const itemsPerPage = 5;

  // Efecto para cargar pagos
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

    // Filtrar primero por estado (anulados o no)
    const filteredByStatus = showAnulados
      ? payments
      : payments.filter(payment => payment.status !== 'Anulado');

    // Luego aplicar el filtro de búsqueda
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

  // Cálculo del total pagado (excluyendo anulados)
  const totalPaid = useMemo(() => {
    return payments.reduce((sum, payment) => {
      return payment.status !== 'Anulado' ? sum + (Number(payment.amount) || 0) : sum;
    }, 0);
  }, [payments]);

  // Manejador de cambio de estado
  const handleStatusChange = async (paymentId, newStatus) => {
    if (!paymentId || !newStatus) return;

    try {
      setIsLoading(true);
      const updatedPayment = await changePaymentStatus(paymentId, newStatus);

      // Actualizar el estado local
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

  // Manejador de actualización de pago
  const handleUpdatePayment = async (paymentId, updatedData) => {
    if (!paymentId || !updatedData) return;

    try {
      setIsLoading(true);

      // Convertir amount a número si existe
      if (updatedData.amount) {
        updatedData.amount = Number(updatedData.amount);
      }

      const updatedPayment = await updatePayment(paymentId, updatedData);

      // Actualizar el estado local
      setPayments(prev => prev.map(p =>
        p.idPayments === updatedPayment.idPayments ? updatedPayment : p
      ));

      setError(null);
    } catch (err) {
      console.error('Error al actualizar pago:', err);
      setError(`Error al actualizar pago: ${err.response?.data?.message || err.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  // Manejador de eliminación de pago
  const handleDeletePayment = async (paymentId) => {
    if (!paymentId || !window.confirm('¿Estás seguro de eliminar este pago?')) return;

    try {
      setIsLoading(true);
      await deletePayment(paymentId);

      // Eliminar del estado local
      setPayments(prev => prev.filter(p => p.idPayments !== paymentId));

      setError(null);
    } catch (err) {
      console.error('Error al eliminar pago:', err);
      setError(`Error al eliminar pago: ${err.response?.data?.message || err.message}`);
    } finally {
      setIsLoading(false);
    }
  };
  // Efecto para actualización periódica (cada 30 segundos)
  useEffect(() => {
    const interval = setInterval(() => {
      if (!isLoading) {
        triggerRefresh();
      }
    }, 30000); // 30 segundos

    return () => clearInterval(interval); // Limpieza al desmontar
  }, [isLoading, triggerRefresh]);

  return (
    <div className="view-payments-container">
      <div className="payments-header">
        <h2>Gestión de Pagos</h2>
        <div className="payments-summary">
          <div className="summary-item">
            <span>Total Reserva:</span>
            <strong>${Number(totalAmount).toFixed(2)}</strong>
          </div>
          <div className="summary-item">
            <span>Total Pagado:</span>
            <strong>${totalPaid.toFixed(2)}</strong>
          </div>
          <div className="summary-item">
            <span>Saldo Pendiente:</span>
            <strong>${(Number(totalAmount) - totalPaid).toFixed(2)}</strong>
          </div>
        </div>
      </div>

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

        {/* Botón para mostrar/ocultar anulados */}
        <button
          onClick={() => setShowAnulados(!showAnulados)}
          className={`toggle-anulados ${showAnulados ? 'active' : ''}`}
        >
          {showAnulados ? 'Ocultar Anulados' : 'Mostrar Anulados'}
        </button>
      </div>

      {error && (
        <div className="error-message">
          {error}
          <button onClick={() => setError(null)}>×</button>
        </div>
      )}

      <div className="payments-table-wrapper">
        <TablePayments
          payments={currentItems}
          onEditPayment={!isReadOnly ? handleUpdatePayment : null}
          onDeletePayment={!isReadOnly ? handleDeletePayment : null}
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