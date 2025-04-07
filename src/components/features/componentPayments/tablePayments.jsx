import PropTypes from 'prop-types';
import { useState, useMemo } from "react";
import { ActionButtons } from "../../common/Button/customButton";
import Pagination from "../../common/Paginator/Pagination";
import { CiSearch } from "react-icons/ci";
import "./componentPayments.css";

function TablePayments({ 
  payments = [], 
  onEditPayment = () => {}, 
  onDeletePayment = () => {} 
}) {
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(0);
  const itemsPerPage = 6;

  // Función segura para filtrar pagos
  const filteredData = useMemo(() => {
    if (!Array.isArray(payments)) {
      console.error('Payments no es un array válido:', payments);
      return [];
    }
    
    return payments.filter(payment => {
      if (!payment) return false;
      
      const term = searchTerm?.toLowerCase() || "";
      return (
        payment.paymentMethod?.toLowerCase().includes(term) ||
        payment.status?.toLowerCase().includes(term) ||
        payment.paymentDate?.includes(searchTerm || "")
      );
    });
  }, [payments, searchTerm]);

  // Cálculo seguro de paginación
  const { currentItems, pageCount } = useMemo(() => {
    const safeData = Array.isArray(filteredData) ? filteredData : [];
    const offset = currentPage * itemsPerPage;
    const currentItems = safeData.slice(offset, offset + itemsPerPage);
    const pageCount = Math.max(1, Math.ceil(safeData.length / itemsPerPage));
    
    return { currentItems, pageCount };
  }, [currentPage, filteredData, itemsPerPage]);

  const handlePageClick = ({ selected }) => setCurrentPage(selected);

  const formatCurrency = (amount) => {
    return amount && typeof amount === "number" ? `$${amount.toFixed(2)}` : "$0.00";
  };

  return (
    <div className="payments-table-container">
      <div className="payments-title-container">
        <h2 className="payments-table-title">Pagos</h2>
      </div>
      
      <div className="payments-container-search">
        <div className="payments-search-wrapper">
          <CiSearch className="payments-search-icon" />
          <input
            type="text"
            className="payments-search"
            placeholder="Buscar pago..."
            onChange={(e) => setSearchTerm(e.target.value)}
            value={searchTerm}
          />
        </div>
      </div>

      <div className="payments-table-wrapper">
        <table className="payments-table">
          <thead className="payments-table-header">
            <tr>
              <th>Método de Pago</th>
              <th>Fecha</th>
              <th>Monto</th>
              <th>Estado</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody className="payments-table-body">
            {currentItems.length > 0 ? (
              currentItems.map((payment, index) => (
                <tr
                  key={`payment-${payment?.id || `payment-${index}-${Date.now()}`}`}
                  className={
                    index % 2 === 0 ? "payments-table-row-even" : "payments-table-row-odd"
                  }
                >
                  <td className="payments-table-cell">{payment?.paymentMethod || "N/A"}</td>
                  <td className="payments-table-cell">{payment?.paymentDate || "N/A"}</td>
                  <td className="payments-table-cell">{formatCurrency(payment?.amount)}</td>
                  <td className="payments-table-cell">
                    <span className={`payment-status ${payment?.status?.toLowerCase() || 'pendiente'}`}>
                      {payment?.status || "Pendiente"}
                    </span>
                  </td>
                  <td className="payments-table-cell">
                    <ActionButtons
                      onEdit={() => payment?.id && onEditPayment(payment)}
                      onDelete={() => payment?.id && onDeletePayment(payment.id)}
                    />
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="5" className="no-results">
                  {payments.length === 0 ? "No hay pagos registrados" : "No se encontraron resultados"}
                </td>
              </tr>
            )}
          </tbody>
        </table>
        
        {pageCount > 1 && (
          <Pagination pageCount={pageCount} onPageChange={handlePageClick} />
        )}
      </div>
    </div>
  );
}

TablePayments.propTypes = {
  payments: PropTypes.array,
  onEditPayment: PropTypes.func,
  onDeletePayment: PropTypes.func,
};

TablePayments.defaultProps = {
  payments: [],
  onEditPayment: () => console.warn('Función onEditPayment no proporcionada'),
  onDeletePayment: () => console.warn('Función onDeletePayment no proporcionada'),
};

export default TablePayments;