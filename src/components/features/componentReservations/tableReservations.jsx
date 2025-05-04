import { useState, useMemo, useEffect } from "react"
import { ActionButtons, CustomButton } from "../../common/Button/customButton"
import Pagination from "../../common/Paginator/Pagination"
import { CiSearch } from "react-icons/ci"
import "./componentsReservations.css"
// import TablePayments from "../componentPayments/tablePayments"
import TableCompanions from "../componentCompanions/tableCompanions"
import FormReservation from "./formReservations"
import {
  getReservation,
  getAllPlanes,
  getUsers,
  changeReservationStatus,
  deleteCompanionReservation,
} from "../../../services/reservationsService"
import {
  getReservationPayments,
  // deletePayment
} from "../../../services/paymentsService.jsx";

function TableReservations() {
  // Estados principales
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentReservation, setCurrentReservation] = useState(null);
  const [reservations, setReservations] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [currentPayments, setCurrentPayments] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [showAnuladas, setShowAnuladas] = useState(false);
  const [currentPage, setCurrentPage] = useState(0);
  const itemsPerPage = 6;

  // Cargar datos de reservas
  const loadReservationData = async () => {
    try {
      setIsLoading(true);
      const [dataReservations, usersData, planesData] = await Promise.all([
        getReservation(),
        getUsers(),
        getAllPlanes()
      ]);

      // Validar datos
      if (!dataReservations || !usersData || !planesData) {
        throw new Error("No se pudieron cargar todos los datos necesarios");
      }

      // Enriquecer reservas con datos de usuario y plan
      const enrichedReservations = dataReservations.map((res) => {
        const user = usersData.find((u) => u.idUser === res.idUser);
        const plan = planesData.find((p) => p.idPlan === res.idPlan);

        return {
          ...res,
          user: user || null,
          plan: plan || { name: "Plan no disponible", price: 0, salePrice: 0 },
          // Asegúrate de tomar el precio correcto
          total: plan?.salePrice || plan?.price || res.total || 0
        };
      });

      setReservations(enrichedReservations);
    } catch (error) {
      console.error("Error al cargar datos:", error);
      alert(`Error al cargar datos: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  // Cargar datos iniciales
  useEffect(() => {
    loadReservationData();
  }, []);

  // Filtrar datos
  const filteredData = useMemo(() => {
    const safeSearchTerm = String(searchTerm || "").toLowerCase().trim();

    return reservations
      .filter(reservation => showAnuladas || reservation.status !== "Anulado")
      .filter((reservation) => {
        if (!reservation) return false;
        if (!safeSearchTerm) return true;

        // Búsqueda por múltiples campos
        const searchFields = [
          String(reservation.idReservation),
          reservation.user?.name?.toLowerCase() || "",
          reservation.user?.lastName?.toLowerCase() || "",
          reservation.plan?.name?.toLowerCase() || "",
          reservation.startDate,
          reservation.endDate,
          reservation.status?.toLowerCase() || "",
          String(reservation.total || 0),
          ...(Array.isArray(reservation.companions))
            ? reservation.companions.map(c =>
              `${c.name} ${c.lastName} ${c.documentNumber}`.toLowerCase())
            : []
        ];

        return searchFields.some(field => field.includes(safeSearchTerm));
      });
  }, [reservations, searchTerm, showAnuladas]);

  // Paginación
  const { currentItems, pageCount } = useMemo(() => {
    const safeData = Array.isArray(filteredData) ? filteredData : [];
    const offset = currentPage * itemsPerPage;
    return {
      currentItems: safeData.slice(offset, offset + itemsPerPage),
      pageCount: Math.max(1, Math.ceil(safeData.length / itemsPerPage))
    };
  }, [currentPage, filteredData]);

  // Manejo de reservas
  const handleAdd = () => {
    setCurrentReservation(null);
    setIsModalOpen(true);
  };

  const handleEdit = (idReservation) => {
    const id = Number(idReservation);
    if (isNaN(id) || id <= 0) return;

    const reservationToEdit = reservations.find(r => r.idReservation === id);
    if (reservationToEdit) {
      setCurrentReservation(reservationToEdit);
      setIsModalOpen(true);
    }
  };

  const handleSaveReservation = async (updatedReservation) => {
    console.log("[TABLE] Recibida reserva para actualizar:", updatedReservation);
    console.log("Recibido en onSave:", updatedReservation);

    if (!updatedReservation) {
      console.error("[TABLE] No se recibieron datos de reserva");
      return;
    }

    try {
      setIsLoading(true);
      await loadReservationData(); // Recargar datos del servidor
    } catch (error) {
      console.error("Error al guardar reserva:", error);
      alert(`Error al guardar reserva: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  // Manejo de estado de reservas
  const handleStatusChange = async (idReservation, newStatus) => {
    const id = Number(idReservation);
    if (isNaN(id)) return;

    const validStatuses = ["Confirmado", "Pendiente", "Anulado", "Reservado"];
    if (!validStatuses.includes(newStatus)) return;

    try {
      setIsLoading(true);
      await changeReservationStatus(id, newStatus);
      await loadReservationData(); // Recargar datos actualizados
    } catch (error) {
      console.error("Error al cambiar estado:", error);
      alert(`Error al cambiar estado: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  // Manejo de detalles
  const handleViewDetails = async (idReservation) => {
    const id = Number(idReservation);
    const reservationToView = reservations.find(r => r.idReservation === id);
  
    if (reservationToView) {
      try {
        const payments = await getReservationPayments(id);
        setCurrentPayments(Array.isArray(payments) ? payments : []); // Asegurar que sea array
        setCurrentReservation(reservationToView);
        setIsDetailModalOpen(true);
      } catch (error) {
        console.error("Error cargando pagos:", error);
        setCurrentPayments([]); // En caso de error, establecer array vacío
        setCurrentReservation(reservationToView);
        setIsDetailModalOpen(true);
      }
    }
  };

  // Manejo de acompañantes
  const handleDeleteCompanion = async (reservationId, companionId) => {
    try {
      await deleteCompanionReservation(Number(reservationId), Number(companionId));
      await loadReservationData(); // Recargar datos actualizados
    } catch (error) {
      console.error("Error al eliminar acompañante:", error);
      alert(`Error al eliminar acompañante: ${error.message}`);
    }
  };

  // Manejo de pagos
  // const handleDeletePayment = async (paymentId) => {
  //   if (!window.confirm("¿Estás seguro de eliminar este pago?")) return;

  //   try {
  //     setIsLoading(true);
  //     await deletePayment(paymentId);
  //     // Actualizar pagos después de eliminar
  //     if (currentReservation?.idReservation) {
  //       const updatedPayments = await getReservationPayments(currentReservation.idReservation);
  //       setCurrentPayments(updatedPayments);
  //     }
  //   } catch (error) {
  //     console.error("Error eliminando pago:", error);
  //     alert(`Error al eliminar pago: ${error.message}`);
  //   } finally {
  //     setIsLoading(false);
  //   }
  // };

  const formatCurrency = (amount) => {
    const value = Number(amount) || 0;
    return `$${value.toFixed(2)}`;
  };

  return (
    <div className="reservations-table-container">
      {/* Encabezado y búsqueda */}
      <div className="reservations-title-container">
        <h2 className="reservations-table-title">Reservas</h2>
      </div>

      <div className="reservations-container-search">
        <div className="search-input-container">
          <CiSearch className="reservations-search-icon" />
          <input
            type="text"
            className="reservations-search"
            placeholder="Buscar por ID, cliente, plan, fechas..."
            onChange={(e) => setSearchTerm(e.target.value)}
            value={searchTerm}
          />
          {searchTerm && (
            <button
              className="clear-search-btn"
              onClick={() => setSearchTerm("")}
              aria-label="Limpiar búsqueda"
            >
              ×
            </button>
          )}
        </div>

        <CustomButton
          variant="primary"
          icon="add"
          onClick={handleAdd}
          disabled={isLoading}
        >
          Nueva Reserva
        </CustomButton>

        <button
          onClick={() => setShowAnuladas(!showAnuladas)}
          className={`reservation-filter-btn ${showAnuladas ? 'active' : ''}`}
          disabled={isLoading}
        >
          {showAnuladas ? 'Ocultar anuladas' : 'Mostrar anuladas'}
        </button>
      </div>

      {/* Tabla principal */}
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
                  key={`reservation-${reservation.idReservation}`}
                  className={index % 2 === 0 ? "reservations-table-row-even" : "reservations-table-row-odd"}
                >
                  <td className="reservations-table-cell">{reservation.idReservation}</td>
                  <td className="reservations-table-cell">
                    {reservation.user?.name || "Cliente no disponible"}
                  </td>
                  <td className="reservations-table-cell">
                    {reservation.plan?.name || "Plan no disponible"}
                  </td>
                  <td className="reservations-table-cell">{reservation.startDate}</td>
                  <td className="reservations-table-cell">{reservation.endDate}</td>
                  <td className="reservations-table-cell">
                    {Array.isArray(reservation.companions) && reservation.companions.length > 0 ? (
                      <div className="companions-list">
                        <TableCompanions
                          companions={reservation.companions}
                          compact={true}
                          onDeleteCompanion={(id) =>
                            handleDeleteCompanion(reservation.idReservation, id)
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
                      onChange={(e) => handleStatusChange(reservation.idReservation, e.target.value)}
                      className={`status-select ${reservation.status.toLowerCase()}`}
                      disabled={isLoading}
                    >
                      <option value="Confirmado">Confirmada</option>
                      <option value="Pendiente">Pendiente</option>
                      <option value="Anulado">Anulada</option>
                      <option value="Reservado">Reservada</option>
                    </select>
                  </td>
                  <td className="reservations-table-cell">
                    {formatCurrency(reservation.plan.salePrice || reservation.plan?.price || reservation.total || 0)}
                  </td>
                  <td className="reservations-table-cell">
                    <ActionButtons
                      onEdit={() => handleEdit(reservation.idReservation)}
                      onView={() => handleViewDetails(reservation.idReservation)}
                      additionalActions={[
                        {
                          icon: "receipt",
                          tooltip: "Generar factura",
                          action: () => console.log("Generar factura", reservation.idReservation),
                        },
                      ]}
                      disabled={isLoading}
                    />
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="9" className="no-results">
                  {isLoading ? "Cargando..." : "No se encontraron reservas"}
                </td>
              </tr>
            )}
          </tbody>
        </table>

        {pageCount > 1 && (
          <Pagination
            pageCount={pageCount}
            onPageChange={({ selected }) => setCurrentPage(selected)}
            forcePage={currentPage}
          />
        )}
      </div>

      {/* Modales */}
      <FormReservation
        isOpen={isModalOpen}
        reservationData={currentReservation}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveReservation}
      />

      {isDetailModalOpen && currentReservation && (
        <div className="modal-overlay">
          <div className="modal-container reservation-details-modal">
            <div className="modal-header">
              <div className="reservation-header-content">
                <h2>Detalles de la Reserva #{currentReservation.idReservation}</h2>
                <span className={`status-badge ${currentReservation.status.toLowerCase()}`}>
                  {currentReservation.status}
                </span>
              </div>
              <button
                className="close-button"
                onClick={() => setIsDetailModalOpen(false)}
                disabled={isLoading}
                aria-label="Cerrar"
              >
                &times;
              </button>
            </div>
            <div className="modal-body">
              <div className="reservation-details-container">
                {/* Columna principal - Información de la reserva */}
                <div className="reservation-main-column">
                  <div className="reservation-card">
                    <h3>Información Principal</h3>
                    <div className="reservation-info-grid">
                      <div className="info-group">
                        <label>Cliente</label>
                        <p>
                          {currentReservation.user
                            ? `${currentReservation.user.name}`
                            : "Cliente no disponible"}
                        </p>
                      </div>
                      <div className="info-group">
                        <label>Plan</label>
                        <p>{currentReservation.plan?.name || "Plan no disponible"}</p>
                      </div>
                      <div className="info-group">
                        <label>Fechas</label>
                        <p>{currentReservation.startDate} a {currentReservation.endDate}</p>
                      </div>
                      <div className="info-group">
                        <label>Total</label>
                        <p className="total-amount">
                          {formatCurrency(currentReservation.total || 0)}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="reservation-secondary-column">
                  <div className="reservation-card">
                    <div className="card-header-with-actions">
                      <h3>Pagos</h3>
                      <div className="payment-summary">
                        <span>Total pagado: {formatCurrency(
                          Array.isArray(currentPayments)
                            ? currentPayments.reduce((sum, payment) => sum + (Number(payment?.amount) || 0), 0)
                            : 0
                        )}</span>
                      </div>
                    </div>
                  </div>
                </div>
                {/* Sección de Acompañantes */}
                <div className="reservation-card">
                  <div className="card-header-with-actions">
                    <h3>Acompañantes</h3>
                    <span className="companions-count">
                      {Array.isArray(currentReservation.companions) ? currentReservation.companions.length : 0} personas
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )
      }
    </div >
  );
}

export default TableReservations;