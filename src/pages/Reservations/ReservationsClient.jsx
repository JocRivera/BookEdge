import { useState, useEffect, useRef } from "react"
import { useAuth } from "../../context/AuthContext"
import { useLocation } from "react-router-dom" // <-- Agrega esto

//  REUTILIZAR TODOS LOS SERVICIOS DEL ADMIN
import {
  getReservationsByUser,
  getAllPlanes,
  getCabins,
  getBedrooms,
  getServices,
} from "../../services/reservationsService.jsx"
import { getReservationPayments } from "../../services/paymentsService"

//  REUTILIZAR COMPONENTES EXISTENTES DEL ADMIN
import FormReservation from "../../components/features/componentReservations/formReservations"
import TableCompanions from "../../components/features/componentCompanions/tableCompanions"

// REUTILIZAR UTILIDADES EXISTENTES
import { formatDate, calculateDaysBetween } from "../../components/features/componentReservations/reservationUtils"

import "./ReservationsClient.css"

const ReservationsClient = () => {
  const { user } = useAuth()
  const location = useLocation() // <-- Agrega esto
  const [reservations, setReservations] = useState([])
  const [filteredReservations, setFilteredReservations] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  // Estados de filtros
  const [filters, setFilters] = useState({
    status: "all",
    plan: "all",
    sortBy: "newest",
  })

  // Estados de modales
  const [selectedReservation, setSelectedReservation] = useState(null)
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false)
  const [isNewReservationModalOpen, setIsNewReservationModalOpen] = useState(false)

  // ✅ REUTILIZAR TODOS LOS DATOS DEL ADMIN
  const [currentPayments, setCurrentPayments] = useState([])
  const [availablePlans, setAvailablePlans] = useState([])
  const [availableCabins, setAvailableCabins] = useState([])
  const [availableBedrooms, setAvailableBedrooms] = useState([])
  const [availableServices, setAvailableServices] = useState([])

  const hasOpenedAutoModal = useRef(false) // <-- Nuevo estado

  console.log("[ReservationsClient] Component mounted", { user, loading, error })

  useEffect(() => {
    if (user?.idUser) {
      fetchAllData()
    }
  }, [user])

  useEffect(() => {
    applyFilters()
  }, [reservations, filters])

  // ✅ CARGAR TODOS LOS DATOS NECESARIOS
  const fetchAllData = async () => {
    try {
      setLoading(true)
      setError(null)

      console.log("[ReservationsClient] Fetching all data for user:", user?.idUser)

      // Cargar datos en paralelo
      const [userReservations, plans, cabins, bedrooms, services] = await Promise.all([
        getReservationsByUser(user.idUser),
        getAllPlanes(),
        getCabins(),
        getBedrooms(),
        getServices(),
      ])

      console.log("[ReservationsClient] Data loaded:", {
        reservations: userReservations?.length || 0,
        plans: plans?.length || 0,
        cabins: cabins?.length || 0,
        bedrooms: bedrooms?.length || 0,
        services: services?.length || 0,
      })

      setReservations(Array.isArray(userReservations) ? userReservations : [])
      setAvailablePlans(Array.isArray(plans) ? plans : [])
      setAvailableCabins(Array.isArray(cabins) ? cabins : [])
      setAvailableBedrooms(Array.isArray(bedrooms) ? bedrooms : [])
      setAvailableServices(Array.isArray(services) ? services : [])
    } catch (err) {
      console.error("[ReservationsClient] Error fetching data:", err)
      setError("Error al cargar los datos")
    } finally {
      setLoading(false)
    }
  }

  // ✅ REUTILIZAR FUNCIÓN DE FORMATEO DEL ADMIN
  const formatCOP = (value) => {
    return new Intl.NumberFormat("es-CO", {
      style: "currency",
      currency: "COP",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value)
  }

  // Aplicar filtros y ordenamiento
  const applyFilters = () => {
    let filtered = [...reservations]

    // Filtrar por estado específico
    if (filters.status !== "all") {
      filtered = filtered.filter((reservation) => {
        const status = reservation.status?.toLowerCase()
        return status === filters.status
      })
    }

    // Filtrar por plan
    if (filters.plan !== "all") {
      filtered = filtered.filter((reservation) => reservation.plan?.idPlan === Number.parseInt(filters.plan))
    }

    // Ordenar solo por fecha
    filtered.sort((a, b) => {
      switch (filters.sortBy) {
        case "newest":
          return new Date(b.startDate) - new Date(a.startDate)
        case "oldest":
          return new Date(a.startDate) - new Date(b.startDate)
        default:
          return new Date(b.startDate) - new Date(a.startDate) // Por defecto más recientes
      }
    })

    setFilteredReservations(filtered)
  }

  // ✅ REUTILIZAR FUNCIONES DEL ADMIN
  const getAccommodationInfo = (reservation) => {
    if (reservation.cabins && Array.isArray(reservation.cabins) && reservation.cabins.length > 0) {
      const cabin = reservation.cabins[0]
      return {
        type: "cabin",
        icon: "🏠",
        label: "Cabaña",
        name: cabin.name || `Cabaña ${cabin.idCabin}`,
        capacity: cabin.capacity || "No especificada",
        description: cabin.description || "Sin descripción",
      }
    }

    if (reservation.bedrooms && Array.isArray(reservation.bedrooms) && reservation.bedrooms.length > 0) {
      const bedroom = reservation.bedrooms[0]
      return {
        type: "bedroom",
        icon: "🛏️",
        label: "Habitación",
        name: bedroom.name || `Habitación ${bedroom.idRoom}`,
        capacity: bedroom.capacity || "2 personas",
        description: bedroom.description || "Habitación estándar",
      }
    }

    return {
      type: "none",
      icon: "📍",
      label: "Sin alojamiento",
      name: "No asignado",
      capacity: "N/A",
      description: "No se ha asignado alojamiento a esta reserva",
    }
  }

  const getServicesInfo = (reservation) => {
    if (reservation.services && Array.isArray(reservation.services) && reservation.services.length > 0) {
      return reservation.services.map((service) => ({
        id: service.Id_Service,
        name: service.name || "Servicio sin nombre",
        price: service.Price || 0,
        description: service.Description || "Sin descripción",
        quantity: service.quantity || 1,
      }))
    }
    return []
  }

  const formatCurrency = (amount) => {
    const value = Number(amount) || 0
    return formatCOP(value)
  }

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case "confirmado":
        return "#28a745"
      case "pendiente":
        return "#ffc107"
      case "completado":
        return "#6c757d"
      case "anulado":
        return "#dc3545"
      case "reservado":
        return "#007bff"
      default:
        return "#6c757d"
    }
  }

  const getStatusText = (status) => {
    switch (status?.toLowerCase()) {
      case "confirmado":
        return "Confirmada"
      case "pendiente":
        return "Pendiente"
      case "completado":
        return "Completada"
      case "anulado":
        return "Cancelada"
      case "reservado":
        return "Reservada"
      default:
        return status || "Sin estado"
    }
  }

  const handleViewDetails = async (reservation) => {
    try {
      setSelectedReservation(reservation)
      const payments = await getReservationPayments(reservation.idReservation)
      setCurrentPayments(Array.isArray(payments) ? payments : [])
      setIsDetailModalOpen(true)
    } catch (error) {
      console.error("Error cargando detalles:", error)
      setCurrentPayments([])
      setSelectedReservation(reservation)
      setIsDetailModalOpen(true)
    }
  }

  // ✅ PREPARAR DATOS PARA EL FORMULARIO DE RESERVA
  const handleNewReservation = () => {
    console.log("[ReservationsClient] Opening new reservation form with data:", {
      user,
      plans: availablePlans.length,
      cabins: availableCabins.length,
      bedrooms: availableBedrooms.length,
      services: availableServices.length,
    })

    setSelectedReservation(null)
    setIsNewReservationModalOpen(true)
  }

  const handleSaveReservation = async (savedReservation) => {
    console.log("Reserva guardada:", savedReservation)
    setIsNewReservationModalOpen(false)
    // Limpia el estado de navegación para evitar que el modal se vuelva a abrir
    window.history.replaceState({}, document.title)
    await fetchAllData() // Recargar todos los datos
  }

  const handleCancelReservation = async (reservation) => {
    if (window.confirm("¿Estás seguro de que deseas cancelar esta reserva?")) {
      try {
        console.log("Cancelando reserva:", reservation.idReservation)
        await fetchAllData()
      } catch (error) {
        console.error("Error cancelando reserva:", error)
      }
    }
  }

  const calculateDays = (startDate, endDate) => {
    return calculateDaysBetween(startDate, endDate)
  }

  const calculateTotalPaid = (payments) => {
    return Array.isArray(payments) ? payments.reduce((sum, payment) => sum + (Number(payment?.amount) || 0), 0) : 0
  }

  const calculatePendingBalance = (reservation, payments) => {
    const total = reservation.total || reservation.plan?.salePrice || reservation.plan?.price || 0
    const paid = calculateTotalPaid(payments)
    return total - paid
  }

  // Abre el modal si viene un plan seleccionado desde la navegación
  useEffect(() => {
    if (
      location.state?.selectedPlan &&
      availablePlans.length > 0 &&
      !hasOpenedAutoModal.current // Solo si no se ha abierto antes
    ) {
      const planFromList = availablePlans.find(
        (p) => p.idPlan === (location.state.selectedPlan.Plan?.idPlan || location.state.selectedPlan.idPlan)
      )
      setSelectedReservation({
        plan: planFromList || location.state.selectedPlan.Plan || location.state.selectedPlan,
      })
      setIsNewReservationModalOpen(true)
      hasOpenedAutoModal.current = true // Marcar como abierto
      window.history.replaceState({}, document.title)
    }
  }, [location.state, availablePlans])

  if (loading) {
    return (
      <div className="reservations-client-container">
        <div className="reservations-loading">
          <div className="loading-spinner">
            <div className="spinner"></div>
            <p>Cargando tus reservas...</p>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="reservations-client-container">
        <div className="reservations-error">
          <h3>Error al cargar reservas</h3>
          <p>{error}</p>
          <button onClick={fetchAllData} className="btn-retry">
            Intentar de nuevo
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="reservations-client-container">
      <div className="reservations-header">
        <div className="reservations-header-content">
          <h1 className="reservations-title">Mis Reservas</h1>
          <p className="reservations-subtitle">Gestiona y revisa todas tus reservas</p>
        </div>
        <button className="btn-new-reservation-header" onClick={handleNewReservation}>
          + Nueva Reserva
        </button>
      </div>

      {/* Filtros */}
      <div className="reservations-filters">
        <div className="filters-row">
          <div className="filter-group">
            <label>Estado:</label>
            <select
              value={filters.status}
              onChange={(e) => setFilters({ ...filters, status: e.target.value })}
              className="filter-select"
            >
              <option value="all">Todas ({reservations.length})</option>
              <option value="confirmado">
                Confirmadas ({reservations.filter((r) => r.status?.toLowerCase() === "confirmado").length})
              </option>
              <option value="reservado">
                Reservadas ({reservations.filter((r) => r.status?.toLowerCase() === "reservado").length})
              </option>
              <option value="pendiente">
                Pendientes ({reservations.filter((r) => r.status?.toLowerCase() === "pendiente").length})
              </option>
              <option value="anulado">
                Anuladas ({reservations.filter((r) => r.status?.toLowerCase() === "anulado").length})
              </option>
            </select>
          </div>

          <div className="filter-group">
            <label>Plan:</label>
            <select
              value={filters.plan}
              onChange={(e) => setFilters({ ...filters, plan: e.target.value })}
              className="filter-select"
            >
              <option value="all">Todos los planes</option>
              {availablePlans.map((plan) => (
                <option key={plan.idPlan} value={plan.idPlan}>
                  {plan.name || plan.nombre}
                </option>
              ))}
            </select>
          </div>

          <div className="filter-group">
            <label>Ordenar por:</label>
            <select
              value={filters.sortBy}
              onChange={(e) => setFilters({ ...filters, sortBy: e.target.value })}
              className="filter-select"
            >
              <option value="newest">Más recientes</option>
              <option value="oldest">Más antiguas</option>
            </select>
          </div>
        </div>
      </div>

      {filteredReservations.length === 0 ? (
        <div className="no-reservations">
          <h3>
            No tienes reservas{" "}
            {filters.status !== "all" || filters.plan !== "all" ? "que coincidan con los filtros" : ""}
          </h3>
          <p>Cuando realices una reserva, aparecerá aquí.</p>
          <button className="btn-new-reservation" onClick={handleNewReservation}>
            Nueva Reserva
          </button>
        </div>
      ) : (
        <div className="reservations-list">
          {filteredReservations.map((reservation) => {
            const accommodationInfo = getAccommodationInfo(reservation)
            const days = calculateDays(reservation.startDate, reservation.endDate)
            const total = reservation.total || reservation.plan?.salePrice || reservation.plan?.price || 0

            return (
              <div
                key={reservation.idReservation}
                className="reservation-card"
                data-status={reservation.status?.toLowerCase()}
              >
                <div className="reservation-header">
                  <div className="reservation-id">
                    <h3>Reserva #{reservation.idReservation}</h3>
                  </div>
                  <span className="status-badge" style={{ backgroundColor: getStatusColor(reservation.status) }}>
                    {getStatusText(reservation.status)}
                  </span>
                </div>

                <div className="reservation-card-content">
                  {/* Solo mostrar información esencial */}
                  <h4 className="plan-name">{reservation.plan?.name || "Plan no disponible"}</h4>

                  <div className="date-range">
                    <div className="date-range-icon">📅</div>
                    <div className="date-range-dates">
                      <div className="date-range-start">
                        Entrada: <span>{formatDate(reservation.startDate)}</span>
                      </div>
                      <div className="date-range-end">
                        Salida: <span>{formatDate(reservation.endDate)}</span>
                      </div>
                    </div>
                  </div>

                  <div className="accommodation-info">
                    <span className="accommodation-icon">{accommodationInfo.icon}</span>
                    <span className="accommodation-name">{accommodationInfo.name}</span>
                  </div>
                </div>

                <div className="reservation-card-footer">
                  <div className="reservation-price">{formatCurrency(total)}</div>
                  <button className="btn-details" onClick={() => handleViewDetails(reservation)}>
                    Ver detalles
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Modal de detalles */}
      {isDetailModalOpen && selectedReservation && (
        <div className="reservations-modal-overlay">
          <div className="reservations-modal-container reservation-details-modal">
            <div className="modal-header">
              <h2>Detalles de la Reserva #{selectedReservation.idReservation}</h2>
              <button className="close-button" onClick={() => setIsDetailModalOpen(false)} aria-label="Cerrar">
                &times;
              </button>
            </div>

            <div className="modal-body">
              <div className="reservation-details-container">
                <div className="reservation-main-column">
                  <div className="reservation-card-detail">
                    <h3>Información Principal</h3>
                    <div className="info-grid">
                      <div className="info-group">
                        <label>Plan</label>
                        <p>{selectedReservation.plan?.name || "Plan no disponible"}</p>
                      </div>
                      <div className="info-group">
                        <label>Precio del plan</label>
                        <p className="plan-price">
                          {formatCOP(selectedReservation.plan?.price || selectedReservation.plan?.salePrice || 0)}
                        </p>
                      </div>
                      <div className="info-group">
                        <label>Fechas</label>
                        <p>
                          {formatDate(selectedReservation.startDate)} - {formatDate(selectedReservation.endDate)}
                        </p>
                      </div>
                      <div className="info-group">
                        <label>Duración</label>
                        <p>{calculateDays(selectedReservation.startDate, selectedReservation.endDate)} días</p>
                      </div>
                      <div className="info-group">
                        <label>Total</label>
                        <p className="total-amount">
                          {formatCurrency(
                            selectedReservation.total ||
                              selectedReservation.plan?.salePrice ||
                              selectedReservation.plan?.price ||
                              0,
                          )}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="reservation-card-detail">
                    <h3>Alojamiento</h3>
                    {(() => {
                      const accommodationInfo = getAccommodationInfo(selectedReservation)
                      return (
                        <div className="accommodation-details">
                          <div className="accommodation-header">
                            <span className="accommodation-icon">{accommodationInfo.icon}</span>
                            <div className="accommodation-main-info">
                              <h4 className="accommodation-title">{accommodationInfo.name}</h4>
                              <span className="accommodation-type">{accommodationInfo.label}</span>
                            </div>
                          </div>
                          <div className="accommodation-specs">
                            <div className="spec-item">
                              <label>Capacidad:</label>
                              <span>{accommodationInfo.capacity}</span>
                            </div>
                          </div>
                          {accommodationInfo.description && (
                            <div className="accommodation-description">
                              <label>Descripción:</label>
                              <p>{accommodationInfo.description}</p>
                            </div>
                          )}
                        </div>
                      )
                    })()}
                  </div>

                  <div className="reservation-card-detail">
                    <h3>Servicios Adicionales</h3>
                    {(() => {
                      const services = getServicesInfo(selectedReservation)
                      return services.length > 0 ? (
                        <div className="services-list-detail">
                          {services.map((service) => (
                            <div key={service.id} className="service-item-detail">
                              <div className="service-header">
                                <h4 className="service-name">
                                  {service.name} {service.quantity > 1 && `(x${service.quantity})`}
                                </h4>
                                <span className="service-price">{formatCOP(service.price * service.quantity)}</span>
                              </div>
                              {service.description && <p className="service-description">{service.description}</p>}
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="no-services">No se han agregado servicios adicionales</p>
                      )
                    })()}
                  </div>
                </div>

                <div className="reservation-secondary-column">
                  <div className="reservation-card-detail">
                    <h3>Acompañantes</h3>
                    {Array.isArray(selectedReservation.companions) && selectedReservation.companions.length > 0 ? (
                      <div className="companions-list-detail">
                        <TableCompanions
                          companions={selectedReservation.companions}
                          compact={true}
                          showActions={false}
                        />
                      </div>
                    ) : (
                      <p className="no-companions">No hay acompañantes registrados</p>
                    )}
                  </div>

                  <div className="reservation-card-detail">
                    <h3>Información de Pagos</h3>
                    <div className="payment-summary">
                      <div className="payment-row">
                        <span>Total pagado:</span>
                        <span className="payment-amount">{formatCurrency(calculateTotalPaid(currentPayments))}</span>
                      </div>
                      <div className="payment-row">
                        <span>Saldo pendiente:</span>
                        <span className="payment-amount pending">
                          {formatCurrency(calculatePendingBalance(selectedReservation, currentPayments))}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="modal-footer">
                <div className="reservation-status-final">
                  <span
                    className="status-badge-large"
                    style={{ backgroundColor: getStatusColor(selectedReservation.status) }}
                  >
                    {getStatusText(selectedReservation.status)}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ✅ FORMULARIO CON TODOS LOS DATOS PRECARGADOS */}
      {isNewReservationModalOpen && (
        <FormReservation
          isOpen={isNewReservationModalOpen}
          reservationData={selectedReservation}
          onClose={() => setIsNewReservationModalOpen(false)}
          onSave={handleSaveReservation}
          isReadOnly={false}
          // ✅ PASAR TODOS LOS DATOS NECESARIOS
          preloadedData={{
            user: user, // Cliente por defecto
            plans: availablePlans,
            cabins: availableCabins,
            bedrooms: availableBedrooms,
            services: availableServices,
            isClientMode: true, // Indicar que es modo cliente
          }}
        />
      )}
    </div>
  )
}

export default ReservationsClient
