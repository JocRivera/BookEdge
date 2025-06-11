"use client"

import { useState, useEffect, useRef } from "react"
import { useAuth } from "../../context/AuthContext"
import { useLocation } from "react-router-dom"

//  REUTILIZAR TODOS LOS SERVICIOS DEL ADMIN
import {
  getReservationsByUser,
  getAllPlanes,
  getCabins,
  getBedrooms,
  getServices,
  updateReservation,
} from "../../services/reservationsService.jsx"
import { getReservationPayments, addPaymentToReservation, syncReservationStatus } from "../../services/paymentsService"

//  REUTILIZAR COMPONENTES EXISTENTES DEL ADMIN
import FormReservation from "../../components/features/componentReservations/formReservations"
import TableCompanions from "../../components/features/componentCompanions/tableCompanions"

// REUTILIZAR UTILIDADES EXISTENTES DEL ADMIN
import {
  formatDate,
  calculateDaysBetween,
  getPaymentInfo,
  validatePaymentAmount,
} from "../../components/features/componentReservations/reservationUtils"

import "./ReservationsClient.css"
import PaymentForm from "../../components/features/componentPayments/formPayments"

const ReservationsClient = () => {
  const { user } = useAuth()
  const location = useLocation()
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
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false)

  // ✅ REUTILIZAR TODOS LOS DATOS DEL ADMIN
  const [currentPayments, setCurrentPayments] = useState([])
  const [availablePlans, setAvailablePlans] = useState([])
  const [availableCabins, setAvailableCabins] = useState([])
  const [availableBedrooms, setAvailableBedrooms] = useState([])
  const [availableServices, setAvailableServices] = useState([])

  const hasOpenedAutoModal = useRef(false)
  useEffect(() => {
    if (user?.idUser) {
      fetchAllData()
    }
  }, [user])

  useEffect(() => {
    applyFilters()
  }, [reservations, filters])

  // ✅ CARGAR TODOS LOS DATOS NECESARIOS
  // Modificar la función fetchAllData para cargar también los pagos de cada reserva
  const fetchAllData = async () => {
    try {
      setLoading(true)
      setError(null)


      // Cargar datos en paralelo
      const [userReservations, plans, cabins, bedrooms, services] = await Promise.all([
        getReservationsByUser(user.idUser),
        getAllPlanes(),
        getCabins(),
        getBedrooms(),
        getServices(),
      ])


      // Cargar los pagos para cada reserva
      if (Array.isArray(userReservations) && userReservations.length > 0) {
        const reservationsWithPayments = await Promise.all(
          userReservations.map(async (reservation) => {
            try {
              const payments = await getReservationPayments(reservation.idReservation)
              return {
                ...reservation,
                payments: Array.isArray(payments) ? payments : [],
              }
            } catch (error) {
              console.error(`Error loading payments for reservation ${reservation.idReservation}:`, error)
              return reservation
            }
          }),
        )
        // AGREGA ESTE LOG:
        console.log("[DEBUG] Reservas con pagos:", reservationsWithPayments)
        setReservations(reservationsWithPayments)
      } else {
        setReservations([])
      }

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
      console.log("Pagos cargados:", payments) // Agregar log para depuración
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

  // ✅ FUNCIÓN PARA CANCELAR RESERVA
  const handleCancelReservation = async (reservation) => {
    // Verificar si la reserva está confirmada
    if (reservation.status?.toLowerCase() === "confirmado") {
      alert("No se puede cancelar una reserva confirmada. Contacte al administrador.")
      return
    }

    if (window.confirm("¿Estás seguro de que deseas cancelar esta reserva?")) {
      try {
        console.log("Cancelando reserva:", reservation.idReservation)

        // Actualizar el estado de la reserva a "anulado"
        const updatedReservation = {
          ...reservation,
          status: "anulado",
        }

        await updateReservation(reservation.idReservation, updatedReservation)
        await fetchAllData() // Recargar datos

        alert("Reserva cancelada exitosamente")
      } catch (error) {
        console.error("Error cancelando reserva:", error)
        alert("Error al cancelar la reserva. Inténtalo de nuevo.")
      }
    }
  }

  // ✅ FUNCIÓN PARA ABRIR MODAL DE PAGO
  const handleOpenPayment = async (reservation) => {
    try {
      setSelectedReservation(reservation)
      const payments = await getReservationPayments(reservation.idReservation)
      setCurrentPayments(Array.isArray(payments) ? payments : [])

      setIsPaymentModalOpen(true)
    } catch (error) {
      console.error("Error cargando información de pagos:", error)
      alert("Error al cargar información de pagos")
    }
  }

  const calculateDays = (startDate, endDate) => {
    return calculateDaysBetween(startDate, endDate)
  }

  // ✅ USAR FUNCIONES DEL ADMINISTRADOR PARA CÁLCULOS DE PAGO
  const calculateTotalPaid = (payments) => {
    if (!Array.isArray(payments) || payments.length === 0) return 0

    return payments.reduce((sum, payment) => {
      // Solo sumar pagos que no estén anulados
      if (payment.status?.toLowerCase() !== "anulado") {
        const amount = Number(payment?.amount) || 0
        return sum + amount
      }
      return sum
    }, 0)
  }

  const calculatePendingBalance = (reservation, payments) => {
    const total = reservation.total || reservation.plan?.salePrice || reservation.plan?.price || 0
    const paid = calculateTotalPaid(payments)
    return total - paid
  }

  // ✅ FUNCIÓN PARA OBTENER INFORMACIÓN DETALLADA DE PAGOS USANDO LÓGICA DEL ADMIN
  const getReservationPaymentInfo = (reservation) => {
    if (!reservation) return null

    const payments = reservation.payments || []
    const paymentInfo = getPaymentInfo(reservation, payments)

    return {
      ...paymentInfo,
      totalPaid: calculateTotalPaid(payments),
      pendingBalance: calculatePendingBalance(reservation, payments),
      paymentProgress:
        paymentInfo.totalReservation > 0 ? (calculateTotalPaid(payments) / paymentInfo.totalReservation) * 100 : 0,
    }
  }

  // ✅ VERIFICAR SI SE PUEDE CANCELAR LA RESERVA
  const canCancelReservation = (reservation) => {
    return reservation.status?.toLowerCase() !== "confirmado" && reservation.status?.toLowerCase() !== "anulado"
  }

  // Abre el modal si viene un plan seleccionado desde la navegación
  useEffect(() => {
    if (
      location.state?.selectedPlan &&
      availablePlans.length > 0 &&
      !hasOpenedAutoModal.current // Solo si no se ha abierto antes
    ) {
      const planFromList = availablePlans.find(
        (p) => p.idPlan === (location.state.selectedPlan.Plan?.idPlan || location.state.selectedPlan.idPlan),
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

            // ✅ USAR INFORMACIÓN DE PAGOS DEL ADMINISTRADOR
            const paymentInfo = getReservationPaymentInfo(reservation)

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

                  {/* ✅ INFORMACIÓN DE PAGOS MEJORADA CON LÓGICA DEL ADMIN */}
                  {paymentInfo && (
                    <div className="payment-info-card">
                      <div className="payment-info-details">
                        {paymentInfo.isComplete && <div className="payment-status-complete">✅ Pagos completados</div>}
                      </div>
                    </div>
                  )}
                </div>

                <div className="reservation-card-footer">
                  <div className="reservation-price">{formatCurrency(total)}</div>
                  <div className="reservation-actions">
                    <button className="btn-details" onClick={() => handleViewDetails(reservation)}>
                      Ver detalles
                    </button>
                    <button
                      className="btn-cancel"
                      onClick={() => handleCancelReservation(reservation)}
                      disabled={!canCancelReservation(reservation)}
                      title={
                        !canCancelReservation(reservation)
                          ? "No se puede cancelar una reserva confirmada"
                          : "Cancelar reserva"
                      }
                    >
                      Cancelar
                    </button>
                    <button
                      className="btn-pay"
                      onClick={() => handleOpenPayment(reservation)}
                      disabled={paymentInfo?.isComplete}
                      title={paymentInfo?.isComplete ? "Pagos completados" : "Realizar pago"}
                    >
                      {paymentInfo?.isComplete ? "Pagado" : "Pagar"}
                    </button>
                  </div>
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
              {/* Tarjeta horizontal arriba */}
              <div className="reservation-summary-horizontal">
                <div className="summary-section">
                  <span className="pretty-icon big">📄</span>
                  <div>
                    <div className="summary-title">{selectedReservation.plan?.name || "N/A"}</div>
                    <div className="summary-dates">
                      {formatDate(selectedReservation.startDate)} - {formatDate(selectedReservation.endDate)}
                    </div>
                    <div className="summary-days">
                      {calculateDays(selectedReservation.startDate, selectedReservation.endDate)} días
                    </div>
                  </div>
                </div>
                <div className="summary-section">
                  <span className="pretty-label">Estado:</span>
                  <span
                    className="pretty-status"
                    style={{
                      background: getStatusColor(selectedReservation.status),
                      fontSize: "0.95em",
                      padding: "2px 12px",
                    }}
                  >
                    {getStatusText(selectedReservation.status)}
                  </span>
                </div>
                <div className="summary-section">
                  <span className="pretty-label">Total:</span>
                  <span className="pretty-total">
                    {formatCurrency(selectedReservation.total || selectedReservation.plan?.salePrice || selectedReservation.plan?.price || 0)}
                  </span>
                </div>
              </div>

              {/* Secciones en dos columnas */}
              <div className="reservation-details-columns">
                <div className="reservation-details-col">
                  {/* Alojamiento */}
                  <div className="pretty-section minimal-section">
                    <div className="pretty-section-header minimal-header">
                      <span className="pretty-icon">🏨</span>
                      <h3>Alojamiento</h3>
                    </div>
                    {(() => {
                      const acc = getAccommodationInfo(selectedReservation)
                      return (
                        <div className="pretty-info-list minimal-list">
                          <div><span className="pretty-label">Tipo:</span> <span>{acc.label}</span></div>
                          <div><span className="pretty-label">Nombre:</span> <span>{acc.name}</span></div>
                        </div>
                      )
                    })()}
                  </div>
                  {/* Pagos */}
                  <div className="pretty-section minimal-section">
                    <div className="pretty-section-header minimal-header">
                      <span className="pretty-icon">💳</span>
                      <h3>Pagos</h3>
                    </div>
                    {(() => {
                      const info = getReservationPaymentInfo(selectedReservation)
                      if (!info) return <p style={{ fontSize: "0.95em" }}>Sin pagos</p>
                      return (
                        <div className="pretty-info-list minimal-list">
                          <div><span className="pretty-label">Total:</span> <span>{formatCurrency(info.totalReservation)}</span></div>
                          <div><span className="pretty-label">Pagado:</span> <span>{formatCurrency(info.totalPaid)}</span></div>
                          <div>
                            <span className="pretty-label">Pendiente:</span>
                            <span className={info.pendingBalance <= 0 ? "pretty-value completed" : "pretty-value pending"}>
                              {formatCurrency(info.pendingBalance)}
                            </span>
                          </div>
                          <div style={{ fontSize: "0.95em", marginTop: 4 }}>
                            {info.isComplete ? <span className="pretty-status-complete">✅ Completo</span> : <span className="pretty-status-pending">⏳ Pendiente</span>}
                          </div>
                        </div>
                      )
                    })()}
                  </div>
                </div>
                <div className="reservation-details-col">
                  {/* Acompañantes */}
                  <div className="pretty-section minimal-section">
                    <div className="pretty-section-header minimal-header">
                      <span className="pretty-icon">👥</span>
                      <h3>Acompañantes</h3>
                    </div>
                    {Array.isArray(selectedReservation.companions) && selectedReservation.companions.length > 0 ? (
                      <div style={{ fontSize: "0.95em" }}>
                        <TableCompanions companions={selectedReservation.companions} compact={true} showActions={false} />
                      </div>
                    ) : (
                      <p className="no-companions" style={{ fontSize: "0.95em" }}>Ninguno</p>
                    )}
                  </div>
                  {/* Servicios */}
                  <div className="pretty-section minimal-section">
                    <div className="pretty-section-header minimal-header">
                      <span className="pretty-icon">🛎️</span>
                      <h3>Servicios</h3>
                    </div>
                    {(() => {
                      const services = getServicesInfo(selectedReservation)
                      return services.length > 0 ? (
                        <ul className="pretty-services-list minimal-list">
                          {services.map((service) => (
                            <li key={service.id} style={{ fontSize: "0.95em" }}>
                              <span>{service.name}</span>
                              {service.quantity > 1 && <span className="pretty-qty"> x{service.quantity}</span>}
                              <span style={{ marginLeft: 6 }}>{formatCOP(service.price * service.quantity)}</span>
                            </li>
                          ))}
                        </ul>
                      ) : (
                        <p className="no-services" style={{ fontSize: "0.95em" }}>Ninguno</p>
                      )
                    })()}
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
      )}

      {/* Modal de Pago */}
      {isPaymentModalOpen && selectedReservation && (
        <div className="reservations-modal-overlay">
          <div className="reservations-modal-container">
            <div className="modal-header">
              <h2>Realizar Pago - Reserva #{selectedReservation.idReservation}</h2>
              <button className="close-button" onClick={() => setIsPaymentModalOpen(false)} aria-label="Cerrar">
                &times;
              </button>
            </div>

            <div className="modal-body">
              <PaymentForm
                totalAmount={
                  selectedReservation.total ||
                  selectedReservation.plan?.salePrice ||
                  selectedReservation.plan?.price ||
                  0
                }
                onPaymentSubmit={async (formData) => {
                  try {
                    // Crear objeto de pago a partir del FormData
                    const paymentPayload = {
                      idReservation: selectedReservation.idReservation,
                      amount: formData.get("amount"),
                      paymentMethod: formData.get("paymentMethod"),
                      paymentDate: formData.get("paymentDate"),
                      status: formData.get("status") || "Pendiente",
                      voucher: formData.get("voucher"),
                    }

                    // Validar el monto usando la lógica del administrador
                    const validationError = validatePaymentAmount(
                      Number(paymentPayload.amount),
                      selectedReservation,
                      currentPayments,
                    )

                    if (validationError) {
                      throw new Error(validationError)
                    }

                    // Registrar el pago
                    const savedPayment = await addPaymentToReservation(paymentPayload)

                    // Sincronizar estado de reserva si es necesario
                    if (savedPayment && savedPayment.idReservation) {
                      try {
                        await syncReservationStatus(savedPayment.idReservation, savedPayment)
                      } catch (syncError) {
                        console.error("Error al sincronizar estado de reserva:", syncError)
                        alert("El pago se registró pero hubo un error al sincronizar el estado de la reserva")
                      }
                    }

                    return savedPayment
                  } catch (error) {
                    console.error("Error al procesar el pago:", error)
                    throw new Error("No se pudo procesar el pago. Inténtalo de nuevo.")
                  }
                }}
                onCancel={() => setIsPaymentModalOpen(false)}
                onPaymentSuccess={async () => {
                  setIsPaymentModalOpen(false)
                  await fetchAllData()
                  // Si el modal de detalles está abierto, actualiza la reserva seleccionada con los datos más recientes
                  if (isDetailModalOpen && selectedReservation) {
                    // Busca la reserva actualizada en el nuevo array de reservas
                    const updated = reservations.find(r => r.idReservation === selectedReservation.idReservation)
                    if (updated) setSelectedReservation(updated)
                  }
                }}
                reservationData={selectedReservation}
                existingPayments={currentPayments}
                keepFormOpen={false}
              />
            </div>

            {/* Footer del modal con botón de confirmar pago */}
            <div
              className="modal-footer"
              style={{
                padding: "16px 24px",
                borderTop: "1px solid var(--card-border)",
                display: "flex",
                justifyContent: "flex-end",
                gap: "12px",
                background: "var(--card-light)",
              }}
            >
              <button
                type="button"
                className="btn-payment-cancel"
                onClick={() => setIsPaymentModalOpen(false)}
                style={{
                  padding: "12px 24px",
                  borderRadius: "calc(var(--card-radius) - 4px)",
                  fontWeight: "600",
                  cursor: "pointer",
                  transition: "var(--card-transition)",
                  background: "transparent",
                  color: "var(--card-gray)",
                  border: "1px solid var(--card-border)",
                }}
              >
                Cancelar
              </button>
              <button
                type="button"
                className="btn-payment-submit"
                onClick={() => {
                  // Activar el botón oculto del formulario de pagos
                  const hiddenButton = document.getElementById("confirmar-pago-btn")
                  if (hiddenButton) {
                    hiddenButton.click()
                  }
                }}
                style={{
                  padding: "12px 24px",
                  borderRadius: "calc(var(--card-radius) - 4px)",
                  fontWeight: "600",
                  cursor: "pointer",
                  transition: "var(--card-transition)",
                  border: "none",
                  background: "var(--card-success)",
                  color: "white",
                }}
              >
                Confirmar Pago
              </button>
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
