import { useState, useMemo } from "react";
import { ActionButtons, CustomButton } from "../../common/Button/customButton";
import Pagination from "../../common/Paginator/Pagination";
import { CiSearch } from "react-icons/ci";
import "./componentsReservations.css";
import FormReservation from "./formReservations";
function TableReservations() {
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentReservation, setCurrentReservation] = useState(null);
  const [reservations, setReservations] = useState([
    {
      id: 1,
      client: "Juan Pérez",
      plan: "Romantico",
      startDate: "2023-11-15",
      endDate: "2023-11-20",
      status: "Confirmada",
      total: 750.00,
      savedCompanions: []
    },
    {
      id: 2,
      client: "María García",
      plan: "Dia de sol",
      startDate: "2023-11-18",
      endDate: "2023-11-22",
      status: "Pendiente",
      total: 1200.00,
      savedCompanions: []
    },
    {
      id: 3,
      client: "Carlos López",
      plan: "Empresarial",
      startDate: "2023-11-20",
      endDate: "2023-11-25",
      status: "Anulada",
      total: 600.00,
      savedCompanions: []
    },
  ]);

  const filteredData = useMemo(() => {
    return reservations.filter((reservation) =>
      reservation.client?.toLowerCase().includes(searchTerm?.toLowerCase() || "") ||
      reservation.plan?.toLowerCase().includes(searchTerm?.toLowerCase() || "") ||
      reservation.status?.toLowerCase().includes(searchTerm?.toLowerCase() || "")
    );
  }, [reservations, searchTerm]);


  const itemsPerPage = 6;
  const [currentPage, setCurrentPage] = useState(0);

  const { currentItems, pageCount } = useMemo(() => {
    if (!Array.isArray(filteredData)) {
      console.warn("⚠️ filteredData no es un array:", filteredData);
      return { currentItems: [], pageCount: 0 };
    }

    const offset = currentPage * itemsPerPage;
    const currentItems = filteredData.slice(offset, offset + itemsPerPage);
    const pageCount = Math.ceil(filteredData.length / itemsPerPage);

    return { currentItems, pageCount };
  }, [currentPage, filteredData]);



  const handlePageClick = ({ selected }) => setCurrentPage(selected);

  const handleAdd = () => {
    setCurrentReservation(null);
    setIsModalOpen(true);
  };

  const handleEdit = (id) => {
    const reservationToEdit = reservations.find((reservation) => reservation.id === id);
    setCurrentReservation(reservationToEdit);
    setIsModalOpen(true);
  };

  const handleDelete = (id) => {
    console.log("Reservación eliminada exitosamente", id);
    setReservations(reservations.filter(reservation => reservation.id !== id));
  };

  const handleStatusChange = (id, newStatus) => {
    setReservations(reservations.map(reservation =>
      reservation.id === id ? { ...reservation, status: newStatus } : reservation
    ));
  };

  const handleSaveReservation = (newReservation) => {
    if (currentReservation) {
      setReservations(reservations.map(res =>
        res.id === currentReservation.id ? {
          ...newReservation,
          savedCompanions: newReservation.savedCompanions || []
        } : res
      ));
    } else {
      const newId = reservations.length > 0
        ? Math.max(...reservations.map(r => r.id)) + 1
        : 1;
      setReservations([...reservations, {
        ...newReservation,
        id: newId,
        savedCompanions: newReservation.savedCompanions || []
      }]);
    }
    setIsModalOpen(false);
  };

  const formatCurrency = (amount) => {
    return typeof amount === 'number'
      ? `$${amount.toFixed(2)}`
      : amount;
  };
  const handleViewDetails = (id) => {
    const reservationToView = reservations.find((reservation) => reservation.id === id);
    setCurrentReservation(reservationToView);
    setIsDetailModalOpen(true);
  };


  return (
    <div className="reservations-table-container">
      <div className="reservations-title-container">
        <h2 className="reservations-table-title">Reservas</h2>
      </div>
      <div className="reservations-container-search">
        <div className="reservations-container-search">
          <CiSearch className="reservations-search-icon" />
          <input
            type="text"
            className="reservations-search"
            placeholder="Buscar reservación..."
            onChange={(e) => setSearchTerm(e.target.value)}
            value={searchTerm}
          />
        </div>
        <CustomButton variant="primary" icon="add" onClick={handleAdd}>
          Nueva Reserva
        </CustomButton>
      </div>
      <div className="reservations-table-wrapper">
        <table className="reservations-table">
          <thead className="reservations-table-header">
            <tr>
              <th>ID</th>
              <th>Cliente</th>
              <th>Plan</th>
              <th>Fecha inicio</th>
              <th>Fecha fin</th>
              <th>Acompañantes</th>
              <th>Estado</th>
              <th>Total</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody className="reservations-table-body">
            {currentItems.length > 0 ? (
              currentItems.map((reservation, index) => (
                <tr
                  key={reservation.id}
                  className={
                    index % 2 === 0
                      ? "reservations-table-row-even"
                      : "reservations-table-row-odd"
                  }
                >
                  <td className="reservations-table-cell">{reservation.id}</td>
                  <td className="reservations-table-cell">{reservation.client}</td>
                  <td className="reservations-table-cell">{reservation.plan}</td>
                  <td className="reservations-table-cell">{reservation.startDate}</td>
                  <td className="reservations-table-cell">{reservation.endDate}</td>
                  <td className="reservations-table-cell">
                    {reservation.savedCompanions?.length > 0 ? (
                      <span className="companions-badge">
                        {reservation.savedCompanions.length} acompañantes
                      </span>
                    ) : 'Sin acompañantes'}
                  </td>
                  <td className="reservations-table-cell">
                    <select
                      value={reservation.status}
                      onChange={(e) => handleStatusChange(reservation.id, e.target.value)}
                      className={`status-select ${reservation.status.toLowerCase()} `}
                    >
                      <option value="Confirmada">Confirmada</option>
                      <option value="Pendiente">Pendiente</option>
                      <option value="Anulada">anulada</option>
                      <option value="Reservada">Reservada</option>
                    </select>
                  </td>
                  <td className="reservations-table-cell">
                    {formatCurrency(reservation.total)}
                  </td>
                  <td className="reservations-table-cell">
                    <ActionButtons
                      onEdit={() => handleEdit(reservation.id)}
                      onDelete={() => handleDelete(reservation.id)}
                      onView={() => handleViewDetails(reservation.id)}
                      additionalActions={[
                        {
                          icon: "receipt",
                          tooltip: "Generar factura",
                          action: () => console.log("Generar factura", reservation.id)
                        }
                      ]}
                    />
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="8" className="no-results">
                  No se encontraron reservas
                </td>
              </tr>
            )}
          </tbody>
        </table>
        {pageCount > 1 && (
          <Pagination pageCount={pageCount} onPageChange={handlePageClick} />
        )}

        <FormReservation
          isOpen={isModalOpen}
          reservationData={currentReservation}
          onClose={() => setIsModalOpen(false)}
          onSave={handleSaveReservation}
        />
        {isDetailModalOpen && (
          <FormReservation
            isOpen={isDetailModalOpen}
            reservationData={currentReservation}
            onClose={() => setIsDetailModalOpen(false)}
            isReadOnly={true}
            onSave={() => { }} //pa evitar errores
          />
        )}

      </div>
    </div>
  );
}

export default TableReservations;