import { useState, useMemo, useEffect } from "react"
import { ActionButtons, CustomButton } from "../../common/Button/customButton"
import Pagination from "../../common/Paginator/Pagination"
import { CiSearch } from "react-icons/ci"
import "./componentsReservations.css"
import TablePayments from "../componentPayments/tablePayments"
import TableCompanions from "../componentCompanions/tableCompanions"
import FormReservation from "./formReservations"
import {
  getReservation,
  getAllPlanes,
  getUsers,
  changeReservationStatus,
  deleteCompanionReservation
} from "../../../services/reservationsService"

function TableReservations() {
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [currentReservation, setCurrentReservation] = useState(null)
  const isReadOnly = false
  const [reservations, setReservations] = useState([])
  const [isLoading, setIsLoading] = useState(false)

  // Función para cargar datos
  const loadReservationData = async () => {
    try {
      setIsLoading(true)
      const dataReservations = await getReservation()
      console.log(dataReservations)
      const usersData = await getUsers()
      const planesData = await getAllPlanes()

      // Verificar que los datos existen antes de mapear
      if (!dataReservations || !usersData || !planesData) {
        throw new Error("No se pudieron cargar todos los datos necesarios")
      }

      // Enriquecer cada reserva con datos del usuario y plan
      const enrichedReservations = dataReservations.map((res) => {
        const user = usersData.find((u) => u.idUser === res.idUser)
        const plan = planesData.find((p) => p.idPlan === res.idPlan)

        if (!plan) {
          console.warn(`No se encontró plan para la reserva ${res.idReservation}`)
        }

        return {
          ...res,
          user: user || null,
          plan: plan || { name: "Plan no disponible", salePrice: 0 }, // Valor por defecto
        }
      })

      setReservations(enrichedReservations)
    } catch (error) {
      console.error("Error al cargar datos:", error)
      // Opcional: Mostrar mensaje al usuario
      alert(`Error al cargar datos: ${error.message}`)
    } finally {
      setIsLoading(false)
    }
  }

  // Después de obtener las reservas, enriquecerlas con datos de usuario y plan
  useEffect(() => {
    loadReservationData()
  }, [])

  const [payments, setPayments] = useState([
    {
      id: 1,
      paymentMethod: "Tarjeta de Crédito",
      paymentDate: "2025-11-15",
      amount: 750.0,
      status: "Confirmado",
      reservationId: 1,
    },
    {
      id: 2,
      paymentMethod: "Efectivo",
      paymentDate: "2025-11-18",
      amount: 1200.0,
      status: "Pendiente",
      reservationId: 2,
    },
  ])

  const handleEditPayment = (payment) => {
    console.log("Editar pago:", payment)
  }

  const handleDeletePayment = (paymentId) => {
    setPayments(payments.filter((payment) => payment.id !== paymentId))
  }

  const [showAnuladas, setShowAnuladas] = useState(false);

  const filteredData = useMemo(() => {
    const safeSearchTerm = String(searchTerm || "").toLowerCase().trim();

    return reservations
      .filter(reservation => showAnuladas || reservation.status !== "Anulado")
      .filter((reservation) => {
        if (!reservation) return false;
        if (!safeSearchTerm) return true; // Mostrar todos si no hay término de búsqueda

        // Buscar por ID
        if (String(reservation.idReservation).includes(safeSearchTerm)) {
          return true;
        }

        // Buscar por nombre de cliente
        const user = reservation.user || {};
        const userName = String(user.name || "").toLowerCase();
        const userLastName = String(user.lastName || "").toLowerCase();
        if (`${userName} ${userLastName}`.includes(safeSearchTerm)) {
          return true;
        }

        // Buscar por nombre del plan
        const planName = String(reservation.plan?.name || "").toLowerCase();
        if (planName.includes(safeSearchTerm)) {
          return true;
        }

        // Buscar por fechas
        if (reservation.startDate.includes(safeSearchTerm) ||
          reservation.endDate.includes(safeSearchTerm)) {
          return true;
        }

        // Buscar por estado
        const status = String(reservation.status || "").toLowerCase();
        if (status.includes(safeSearchTerm)) {
          return true;
        }

        // Buscar por total (formato numérico)
        const total = String(reservation.total || 0);
        if (total.includes(safeSearchTerm)) {
          return true;
        }

        // Buscar en acompañantes
        if (Array.isArray(reservation.companions)) {
          const hasMatchingCompanion = reservation.companions.some(companion => {
            return (
              String(companion.name || "").toLowerCase().includes(safeSearchTerm) ||
              String(companion.lastName || "").toLowerCase().includes(safeSearchTerm) ||
              String(companion.documentNumber || "").includes(safeSearchTerm)
            );
          });
          if (hasMatchingCompanion) return true;
        }

        return false;
      });
  }, [reservations, searchTerm, showAnuladas]);

  const itemsPerPage = 6
  const [currentPage, setCurrentPage] = useState(0)

  const { currentItems, pageCount } = useMemo(() => {
    if (!Array.isArray(filteredData)) {
      console.warn("⚠️ filteredData no es un array:", filteredData)
      return { currentItems: [], pageCount: 0 }
    }

    const offset = currentPage * itemsPerPage
    const currentItems = filteredData.slice(offset, offset + itemsPerPage)
    const pageCount = Math.ceil(filteredData.length / itemsPerPage)

    return { currentItems, pageCount }
  }, [currentPage, filteredData])

  const handlePageClick = ({ selected }) => setCurrentPage(selected)

  const handleAdd = () => {
    setCurrentReservation(null)
    setIsModalOpen(true)
  }

  const handleEdit = (idReservation) => {
    console.log("[EDIT] Iniciando edición de reserva ID:", idReservation);

    // Asegurarse que el ID sea número entero
    const id = parseInt(idReservation, 10);

    if (isNaN(id) || id <= 0) {
      console.error("[EDIT] ID de reserva inválido:", idReservation);
      return;
    }

    const reservationToEdit = reservations.find(
      (reservation) => reservation.idReservation === id
    );

    if (!reservationToEdit) {
      console.error("[EDIT] No se encontró la reserva con ID:", id);
      alert(`No se encontró la reserva con ID: ${id}`);
      return;
    }

    console.log("[EDIT] Reserva encontrada para editar:", {
      idReservation: reservationToEdit.idReservation,
      user: reservationToEdit.user,
      plan: reservationToEdit.plan,
      status: reservationToEdit.status,
    });

    // Asegurar que idReservation es un número entero
    setCurrentReservation({
      ...reservationToEdit,
      idReservation: id
    });
    setIsModalOpen(true);
  }


  const handleStatusChange = async (idReservation, newStatus) => {
    console.log("[STATUS] Cambiando estado:", { idReservation, newStatus })

    try {
      // Validar ID
      const id = Number(idReservation)
      if (isNaN(id) || id <= 0) {
        console.error("[STATUS] ID de reserva inválido:", idReservation)
        return
      }

      // Validar estado
      const validStatuses = ["Confirmado", "Pendiente", "Anulado", "Reservado"]
      if (!validStatuses.includes(newStatus)) {
        console.error("[STATUS] Estado inválido:", newStatus)
        return
      }

      // Guardar el estado anterior para poder revertir en caso de error
      const reservation = reservations.find((r) => r.idReservation === id)
      if (!reservation) {
        console.error("[STATUS] No se encontró la reserva con ID:", id)
        return
      }

      setIsLoading(true)

      // Actualizar primero el estado local para una respuesta rápida
      setReservations((prevReservations) =>
        prevReservations.map((reservation) =>
          reservation.idReservation === id ? { ...reservation, status: newStatus } : reservation,
        ),
      )

      // Enviar la actualización al backend
      console.log("[STATUS] Enviando cambio al servidor:", { id, newStatus })
      await changeReservationStatus(id, newStatus)

      console.log(`[STATUS] Estado de reserva ${id} actualizado a ${newStatus}`)

      // Recargar los datos para asegurar sincronización
      await loadReservationData()
    } catch (error) {
      console.error("[STATUS] Error al cambiar estado:", error)

      // Revertir el cambio en caso de error
      setReservations((prevReservations) =>
        prevReservations.map((reservation) =>
          reservation.idReservation === idReservation && reservation
            ? { ...reservation, status: reservation.status }
            : reservation,
        ),
      )

      // Mostrar mensaje de error al usuario
      alert(`Error al cambiar estado: ${error.message}`)
    } finally {
      setIsLoading(false)
    }
  }

  // FUNCIÓN CORREGIDA: handleSaveReservation
  const handleSaveReservation = async (updatedReservation) => {
    console.log("[TABLE] Recibida reserva para actualizar:", updatedReservation)
    console.log("Recibido en onSave:", updatedReservation)


    if (!updatedReservation) {
      console.error("[TABLE] No se recibieron datos de reserva")
      return
    }

    try {
      setIsLoading(true)

      // Asegurar que tenemos un ID válido
      const reservationId = updatedReservation.idReservation ? Number(updatedReservation.idReservation) : null

      if (reservationId) {
        console.log("[TABLE] Actualizando reserva existente con ID:", reservationId)

        // Actualizar reserva existente
        setReservations((prev) =>
          prev.map((r) =>
            r.idReservation === reservationId
              ? {
                ...updatedReservation,
                // Preservar datos enriquecidos si existen
                user: r.user || updatedReservation.user,
                plan: r.plan || updatedReservation.plan,
              }
              : r,
          ),
        )
      } else {
        console.log("[TABLE] Agregando nueva reserva")

        // Es una nueva reserva, agregarla al estado
        setReservations((prev) => [...prev, updatedReservation])
      }

      // Recargar datos desde el servidor para asegurar sincronización
      await loadReservationData()
    } catch (error) {
      console.error("[TABLE] Error actualizando estado:", error)
      alert(`Error al guardar la reserva: ${error.message}`)
    } finally {
      setIsLoading(false)
    }
  }

  const formatCurrency = (amount) => {
    // Verifica si amount es un número válido
    const value = typeof amount === "number" ? amount : typeof amount === "string" ? Number.parseFloat(amount) : 0

    return `$${value.toFixed(2)}`
  }

  const handleViewDetails = (idReservation) => {
    // Asegurarse que el ID sea número
    const id = Number(idReservation)

    if (isNaN(id) || id <= 0) {
      console.error("ID de reserva inválido:", idReservation)
      return
    }

    const reservationToView = reservations.find((reservation) => reservation.idReservation === id)

    if (!reservationToView) {
      console.error("No se encontró la reserva con ID:", id)
      return
    }

    setCurrentReservation(reservationToView)
    setIsDetailModalOpen(true)
  }

  const handleDeleteCompanion = async (reservationId, companionId) => {
    try {
      // Validar IDs
      const resId = Number(reservationId);
      const compId = Number(companionId);
  
      if (isNaN(resId) || isNaN(compId)) {
        throw new Error("IDs de reserva o acompañante inválidos");
      }
  
      // Llamar al servicio para eliminar el acompañante
      await deleteCompanionReservation(resId, compId);
  
      // Actualizar el estado local
      setReservations((prev) =>
        prev.map((res) => {
          if (res.idReservation === resId) {
            return {
              ...res,
              companions: res.companions.filter((c) => c.idCompanion !== compId),
            };
          }
          return res;
        })
      );
  
    } catch (error) {
      console.error("Error al eliminar acompañante:", error);
      alert(`Error al eliminar acompañante: ${error.message}`);
    }
  };

  return (
    <div className="reservations-table-container">
      {isLoading && (
        <div className="loading-overlay">
          <div className="loading-spinner"></div>
          <p>Cargando...</p>
        </div>
      )}

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
        <CustomButton variant="primary" icon="add" onClick={handleAdd}>
          Nueva Reserva
        </CustomButton>
        <button
          onClick={() => setShowAnuladas(!showAnuladas)}
          className={`reservation-filter-btn ${showAnuladas ? 'active' : ''}`}
        >
          {showAnuladas ? 'Ocultar anuladas' : 'Mostrar anuladas'}
        </button>
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
                  key={`reservation-${reservation.idReservation}`}

                  className={index % 2 === 0 ? "reservations-table-row-even" : "reservations-table-row-odd"}
                >
                  <td className="reservations-table-cell">{reservation.idReservation}</td>
                  <td className="reservations-table-cell">
                    {reservation.user ? `${reservation.user.name}` : "Cliente no disponible"}
                  </td>
                  <td className="reservations-table-cell">{reservation.plan?.name || "Plan no disponible"}</td>
                  <td className="reservations-table-cell">{reservation.startDate}</td>
                  <td className="reservations-table-cell">{reservation.endDate}</td>
                  <td className="reservations-table-cell">
                    {Array.isArray(reservation.companions) && reservation.companions.length > 0 ? (
                      <div className="companions-list">
                        <TableCompanions
                          companions={reservation.companions}
                          compact={true}
                          onDeleteCompanion={
                            isReadOnly ? undefined : (id) => handleDeleteCompanion(reservation.idReservation, id)
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
                    {formatCurrency(reservation.plan?.salePrice || reservation.plan?.price || reservation.total || 0)}
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
                  No se encontraron reservas
                </td>
              </tr>
            )}
          </tbody>
        </table>
        {pageCount > 1 && <Pagination pageCount={pageCount} onPageChange={handlePageClick} />}

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
                <button className="close-button" onClick={() => setIsDetailModalOpen(false)}>
                  ×
                </button>
              </div>

              <div className="modal-body">
                <div className="reservation-details">
                  <div>
                    <h3>Información Principal</h3>
                    <p>
                      <strong>Cliente:</strong>{" "}
                      {currentReservation.user
                        ? `${currentReservation.user.name} ${currentReservation.user.lastName}`
                        : "Cliente no disponible"}
                    </p>
                    <p>
                      <strong>Plan:</strong> {currentReservation.plan?.name || "Plan no disponible"}
                    </p>
                    <p>
                      <strong>Fechas:</strong> {currentReservation.startDate} a {currentReservation.endDate}
                    </p>
                    <p>
                      <strong>Total:</strong> {formatCurrency(currentReservation.total || 0)}
                    </p>
                  </div>

                  <div style={{ marginTop: "30px" }}>
                    <h3>Acompañantes</h3>
                    <TableCompanions
                      companions={Array.isArray(currentReservation.companions) ? currentReservation.companions : []}
                      isReadOnly={true}
                      onDeleteCompanion={undefined}
                    />
                  </div>

                  <div style={{ marginTop: "30px" }}>
                    <h3>Pagos</h3>
                    <TablePayments
                      payments={payments.filter((p) => p.reservationId === currentReservation.idReservation)}
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
  )
}

export default TableReservations
