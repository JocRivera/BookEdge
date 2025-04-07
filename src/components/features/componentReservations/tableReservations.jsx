import { useState, useMemo , useEffect} from "react";
import { ActionButtons, CustomButton } from "../../common/Button/customButton";
import Pagination from "../../common/Paginator/Pagination";
import { CiSearch } from "react-icons/ci";
import "./componentsReservations.css";
import TablePayments from "../componentPayments/tablePayments"
import TableCompanions from "../componentCompanions/tableCompanions";
import FormReservation from "./formReservations";
import { getReservation } from "../../../services/reservationsService";

function TableReservations() {
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentReservation, setCurrentReservation] = useState(null);
  const [isReadOnly] = useState(false); // Estado para controlar modo lectura
  const [reservations, setReservations] = useState([]);

  useEffect(()=>{
    const fethReservation= async()=>{
      try {
        const dataReservations= await getReservation();
        setReservations (dataReservations)
        console.log(dataReservations)
      }catch(error){        
        console.log("Error al traer la reserva: ",error)
      }
    }
    fethReservation();
  },[])

  const [payments, setPayments] = useState([
    {
      id: 1,
      paymentMethod: "Tarjeta de Crédito",
      paymentDate: "2025-11-15",
      amount: 750.0,
      status: "Confirmado",
      reservationId: 1
    },
    {
      id: 2,
      paymentMethod: "Efectivo",
      paymentDate: "2025-11-18",
      amount: 1200.0,
      status: "Pendiente",
      reservationId: 2
    }
  ]);


  const handleEditPayment = (payment) => {
    console.log("Editar pago:", payment);

  };

  const handleDeletePayment = (paymentId) => {
    setPayments(payments.filter(payment => payment.id !== paymentId));
  };


  <TablePayments
    payments={payments || []}
    onEditPayment={handleEditPayment}
    onDeletePayment={handleDeletePayment}
  />
  const filteredData = useMemo(() => {
    return reservations.filter(
      (reservation) =>
        reservation.client
          ?.toLowerCase()
          .includes(searchTerm?.toLowerCase() || "") ||
        reservation.status
          ?.toLowerCase()
          .includes(searchTerm?.toLowerCase() || "")
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
    const reservationToEdit = reservations.find(
      (reservation) => reservation.id === id
    );
    setCurrentReservation(reservationToEdit);
    setIsModalOpen(true);
  };

  const handleDelete = (id) => {
    console.log("Reservación eliminada exitosamente", id);
    setReservations(reservations.filter((reservation) => reservation.id !== id));
  };

  const handleStatusChange = (id, newStatus) => {
    setReservations(
      reservations.map((reservation) =>
        reservation.id === id
          ? { ...reservation, status: newStatus }
          : reservation
      )
    );
  };

  const handleSaveReservation = (newReservation) => {
    console.log("Reserva a guardar:", newReservation);
    if (currentReservation) {
      setReservations(
        reservations.map((res) =>
          res.id === currentReservation.id
            ? {
              ...newReservation,
              savedCompanions: newReservation.companions || [],
              payments: newReservation.payments || []

            }
            : res
        )
      );
    } else {
      const newId =
        reservations.length > 0
          ? Math.max(...reservations.map((r) => r.id)) + 1
          : 1;
      setReservations([
        ...reservations,
        {
          ...newReservation,
          id: newId,
          savedCompanions: newReservation.companions || []
        }
      ]);
    }
    setIsModalOpen(false);
  };

  const formatCurrency = (amount) => {
    return typeof amount === "number" ? `$${amount.toFixed(2)}` : amount;
  };

  const handleViewDetails = (id) => {
    const reservationToView = reservations.find(
      (reservation) => reservation.id === id
    );
    setCurrentReservation(reservationToView);
    setIsDetailModalOpen(true);
  };

  const handleDeleteCompanion = (reservationId, companionId) => {
    setReservations((prev) =>
      prev.map((res) => {
        if (res.id === reservationId) {
          return {
            ...res,
            savedCompanions: res.savedCompanions.filter(
              (c) => c.id !== companionId
            )
          };
        }
        return res;
      })
    );
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
                  key={`reservation-${reservation.id || Date.now() + Math.random()}`}
                  className={
                    index % 2 === 0
                      ? "reservations-table-row-even"
                      : "reservations-table-row-odd"
                  }
                >
                  <td className="reservations-table-cell">{reservation.idReservation}</td>
                  <td className="reservations-table-cell">
                    {reservation.user.idUser}
                  </td>
                  <td className="reservations-table-cell">{reservation.plan.name}</td>
                  <td className="reservations-table-cell">
                    {reservation.startDate}
                  </td>
                  <td className="reservations-table-cell">
                    {reservation.endDate}
                  </td>
                  <td className="reservations-table-cell">
                    {reservation.savedCompanions?.length > 0 ? (
                      <div className="companions-list">
                        <TableCompanions
                          companions={reservation.savedCompanions}
                          compact={true}
                          onDeleteCompanion={
                            isReadOnly
                              ? undefined
                              : (id) => handleDeleteCompanion(reservation.id, id)
                          }
                        />
                      </div>
                    ) : (
                      "Sin acompañantes"
                    )}
                  </td>
                  <td className="reservations-table-cell">
                    <select
                      value={reservation.status}
                      onChange={(e) =>
                        handleStatusChange(reservation.id, e.target.value)
                      }
                      className={`status-select ${reservation.status.toLowerCase()}`}
                    >
                      <option value="Confirmada">Confirmada</option>
                      <option value="Pendiente">Pendiente</option>
                      <option value="Anulada">Anulada</option>
                      <option value="Reservada">Reservada</option>
                    </select>
                  </td>
                  <td className="reservations-table-cell">
                    {formatCurrency(reservation.plan.salePrice)}
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
                          action: () =>
                            console.log("Generar factura", reservation.id)
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
        {isDetailModalOpen && currentReservation && (
          <div className="modal-overlay">
            <div className="modal-container" style={{ maxWidth: "800px" }}>
              <div className="modal-header">
                <h2>Detalles de la Reserva</h2>
                <button
                  className="close-button"
                  onClick={() => setIsDetailModalOpen(false)}
                >
                  ×
                </button>
              </div>

              <div className="modal-body">
                <div className="reservation-details">
                  <div>
                    <h3>Información Principal</h3>
                    <p>
                      <strong>Cliente:</strong> {currentReservation.client}
                    </p>
                    <p>
                      <strong>Plan:</strong> {currentReservation.plan}
                    </p>
                    <p>
                      <strong>Fechas:</strong> {currentReservation.startDate} a{" "}
                      {currentReservation.endDate}
                    </p>
                    <p>
                      <strong>Total:</strong> $
                      {currentReservation.total?.toFixed(2)}
                    </p>
                  </div>

                  <div style={{ marginTop: "30px" }}>
                    <h3>Acompañantes</h3>
                    <TableCompanions
                      companions={currentReservation.savedCompanions || []}
                      isReadOnly={true}
                      onDeleteCompanion={undefined}
                    />
                  </div>

                  <div style={{ marginTop: "30px" }}>
                    <h3>Pagos</h3>
                    <TablePayments
                      payments={payments.filter(p => p.reservationId === currentReservation.id)}
                      onEditPayment={handleEditPayment}
                      onDeletePayment={handleDeletePayment}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default TableReservations;