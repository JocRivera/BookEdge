
import { useState, useEffect, useMemo, useCallback, useRef } from "react"
import PropTypes from "prop-types"
import { getReservationPayments, changePaymentStatus, getAllPayments } from "../../../services/paymentsService"
import { getReservationById } from "../../../services/reservationsService"
import TablePayments from "./tablePayments"
import { FaSync, FaClock, FaExclamationTriangle, FaSearch, FaTimes } from "react-icons/fa"
import { toast } from "react-toastify"
import { useAlert } from "../../../context/AlertContext"
import "./componentPayments.css"
import Pagination from "../../common/Paginator/Pagination"

const ViewPayments = ({ idReservation = null, isReadOnly = false }) => {
  // Estados principales
  const [payments, setPayments] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [currentPage, setCurrentPage] = useState(0)
  const [showAnulados, setShowAnulados] = useState(false)
  const itemsPerPage = 6 // Igual que en servicios

  // Estados para el modal de detalles
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false)
  const [selectedPayment, setSelectedPayment] = useState(null)
  const [selectedReservationData, setSelectedReservationData] = useState(null)
  const [selectedReservationPayments, setSelectedReservationPayments] = useState([])
  const [loadingReservationData, setLoadingReservationData] = useState(false)

  // Cache para reservas ya buscadas
  const [reservationCache, setReservationCache] = useState(new Map())

  // Estados para auto-refresh
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [lastRefresh, setLastRefresh] = useState(null)
  const [refreshError, setRefreshError] = useState(null)
  const [autoRefreshEnabled, setAutoRefreshEnabled] = useState(true)
  const intervalRef = useRef(null)
  const refreshInterval = 30000 // 30 segundos

  // Usar el contexto de alertas
  const { showAlert } = useAlert()

  // Función para cargar pagos
  const fetchPayments = useCallback(async () => {
    try {
      setError(null)
      const paymentsData = idReservation ? await getReservationPayments(idReservation) : await getAllPayments()
      setPayments(Array.isArray(paymentsData) ? paymentsData : [])
      return true
    } catch (error) {
      console.error("Error al cargar pagos:", error)
      setError(`Error al cargar pagos: ${error.message}`)
      setRefreshError(`Error al cargar pagos: ${error.message}`)
      throw error
    }
  }, [idReservation])

  // Función para ejecutar el refresh
  const executeRefresh = useCallback(
    async (isManual = false) => {
      if (isRefreshing && !isManual) return

      try {
        setIsRefreshing(true)
        setRefreshError(null)

        await fetchPayments()
        setLastRefresh(new Date())

        if (isManual) {
          toast.success("Datos actualizados correctamente")
        }
      } catch (error) {
        console.error("Error en auto-refresh:", error)
        setRefreshError(error.message)

        if (isManual) {
          toast.error(`Error al actualizar: ${error.message}`)
        }
      } finally {
        setIsRefreshing(false)
      }
    },
    [fetchPayments, isRefreshing],
  )

  // Función para refresh manual
  const manualRefresh = useCallback(() => {
    executeRefresh(true)
  }, [executeRefresh])

  // Toggle del auto-refresh
  const toggleAutoRefresh = useCallback(() => {
    setAutoRefreshEnabled((prev) => {
      const newState = !prev
      toast.info(newState ? "Auto-actualización activada" : "Auto-actualización desactivada")
      return newState
    })
  }, [])

  // Configurar el intervalo automático
  useEffect(() => {
    if (autoRefreshEnabled && refreshInterval > 0) {
      intervalRef.current = setInterval(() => {
        executeRefresh(false)
      }, refreshInterval)

      return () => {
        if (intervalRef.current) {
          clearInterval(intervalRef.current)
        }
      }
    }
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }
  }, [autoRefreshEnabled, refreshInterval, executeRefresh])

  // Limpiar intervalo al desmontar
  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }
  }, [])

  // Cargar pagos inicial
  useEffect(() => {
    const loadInitialData = async () => {
      try {
        setIsLoading(true)
        await fetchPayments()
        setLastRefresh(new Date())
      } catch (error) {
        console.error("Error al cargar pagos iniciales:", error)
        // Error ya manejado en fetchPayments
      } finally {
        setIsLoading(false)
      }
    }

    loadInitialData()
  }, [fetchPayments])

  // Filtrado y paginación
  const { currentItems, pageCount } = useMemo(() => {
    const term = searchTerm.toLowerCase()
    const filteredByStatus = showAnulados ? payments : payments.filter((payment) => payment.status !== "Anulado")

    const filtered = filteredByStatus.filter((payment) => {
      return (
        payment.paymentMethod?.toLowerCase().includes(term) ||
        payment.status?.toLowerCase().includes(term) ||
        payment.paymentDate?.includes(searchTerm) ||
        String(payment.amount || "").includes(searchTerm)
      )
    })

    const offset = currentPage * itemsPerPage
    return {
      currentItems: filtered.slice(offset, offset + itemsPerPage),
      pageCount: Math.max(Math.ceil(filtered.length / itemsPerPage), 1),
    }
  }, [payments, searchTerm, currentPage, itemsPerPage, showAnulados])

  // Función para buscar reserva por ID de pago
  const findReservationByPaymentId = async (paymentId) => {
    try {
      // Verificar cache primero
      if (reservationCache.has(paymentId)) {
        return reservationCache.get(paymentId)
      }

      // Estrategia: Intentar IDs de reserva secuencialmente
      let foundReservation = null
      let attempts = 0
      const maxAttempts = 50

      for (let reservationId = 1; reservationId <= maxAttempts; reservationId++) {
        attempts++
        try {
          const reservation = await getReservationById(reservationId)

          if (reservation && reservation.payments) {
            const hasPayment = reservation.payments.some((p) => p.idPayments === paymentId || p.id === paymentId)

            if (hasPayment) {
              foundReservation = reservation
              // Guardar en cache
              setReservationCache((prev) => new Map(prev.set(paymentId, reservation)))
              break
            }
          }
        } catch (err) {
          if (err.response?.status === 404) {
            continue
          }
        }
      }

      return foundReservation
    } catch (error) {
      console.error("❌ Error en búsqueda de reserva:", error)
      return null
    }
  }

  // Cambiar estado con auto-refresh y confirmación
  const handleStatusChange = async (paymentId, newStatus) => {
    if (!paymentId || !newStatus) return

    // Obtener el pago actual para mostrar información en la alerta
    const currentPayment = payments.find((p) => p.idPayments === paymentId || p.id === paymentId)
    if (!currentPayment) return

    // Determinar el mensaje según el nuevo estado
    let statusMessage = ""
    let statusType = ""

    switch (newStatus) {
      case "Confirmado":
        statusMessage = "confirmar"
        statusType = "confirm-edit"
        break
      case "Pendiente":
        statusMessage = "marcar como pendiente"
        statusType = "confirm-edit"
        break
      case "Anulado":
        statusMessage = "anular"
        statusType = "confirm-delete"
        break
      default:
        statusMessage = "cambiar el estado de"
        statusType = "confirm-edit"
    }

    // Mostrar alerta de confirmación
    showAlert({
      type: statusType,
      title: `Confirmar Cambio de Estado`,
      message: `¿Está seguro de ${statusMessage} este pago por ${formatCurrency(currentPayment.amount)}?`,
      confirmText: `Sí, ${statusMessage}`,
      onConfirm: async () => {
        try {
          setIsLoading(true)

          // Cambiar estado del pago
          const updatedPayment = await changePaymentStatus(paymentId, newStatus)

          // Actualizar el estado local
          setPayments((prev) => prev.map((p) => (p.idPayments === updatedPayment.idPayments ? updatedPayment : p)))

          // Mostrar mensaje de éxito
          toast.success(`Pago ${newStatus.toLowerCase()} correctamente`)

          // Si el pago actualizado es el seleccionado, actualizar también los datos de la reserva
          if (selectedPayment && selectedPayment.idPayments === updatedPayment.idPayments) {
            setSelectedPayment(updatedPayment)

            if (updatedPayment.idReservation) {
              try {
                // Recargar los datos de la reserva para mostrar el estado actualizado
                const updatedReservation = await getReservationById(updatedPayment.idReservation)
                setSelectedReservationData(updatedReservation)

                // Recargar los pagos de la reserva
                const reservationPayments = await getReservationPayments(updatedPayment.idReservation)
                setSelectedReservationPayments(Array.isArray(reservationPayments) ? reservationPayments : [])
              } catch (reservationError) {
                console.error("Error al actualizar datos de la reserva:", reservationError)
                toast.error(`Error al actualizar datos de la reserva: ${reservationError.message}`)
              }
            }
          }
        } catch (err) {
          console.error("Error al cambiar estado:", err)
          toast.error(`Error al cambiar estado: ${err.response?.data?.message || err.message}`)
          setError(`Error al cambiar estado: ${err.response?.data?.message || err.message}`)
        } finally {
          setIsLoading(false)
        }
      },
    })
  }

  // Ver detalles - Cargar datos específicos de la reserva
  const handleViewDetails = async (paymentId, payment) => {
    try {
      setLoadingReservationData(true)
      setSelectedPayment(payment)
      setIsDetailModalOpen(true)

      let reservationData = null
      let reservationPayments = []

      if (payment.idReservation) {
        try {
          reservationData = await getReservationById(payment.idReservation)
          reservationPayments = await getReservationPayments(payment.idReservation)
        } catch (reservationError) {
          console.error("❌ Error al cargar reserva por ID:", reservationError)
          toast.error(`Error al cargar datos de la reserva: ${reservationError.message}`)
        }
      } else {
        reservationData = await findReservationByPaymentId(payment.idPayments || paymentId)
        if (reservationData) {
          reservationPayments = reservationData.payments || []
        } else {
          toast.info("No se encontró una reserva asociada a este pago")
        }
      }

      setSelectedReservationData(reservationData)
      setSelectedReservationPayments(Array.isArray(reservationPayments) ? reservationPayments : [])
    } catch (err) {
      console.error("Error al cargar datos:", err)
      toast.error(`Error al cargar datos: ${err.message}`)
      setError(`Error al cargar datos de la reserva: ${err.message}`)
      setSelectedReservationData(null)
      setSelectedReservationPayments([])
    } finally {
      setLoadingReservationData(false)
    }
  }

  // Calcular totales específicos de la reserva seleccionada
  const getReservationSummary = () => {
    if (!selectedReservationData) {
      return {
        totalReservation: 0,
        totalPaid: 0,
        remainingBalance: 0,
      }
    }

    const planPrice = selectedReservationData.plan?.salePrice || selectedReservationData.plan?.price || 0
    const servicesTotal = (selectedReservationData.services || []).reduce(
      (sum, service) => sum + (service.Price || 0),
      0,
    )
    const totalReservation = planPrice + servicesTotal

    const totalPaidReservation = selectedReservationPayments.reduce((sum, payment) => {
      return payment.status !== "Anulado" ? sum + (Number(payment.amount) || 0) : sum
    }, 0)

    return {
      totalReservation,
      totalPaid: totalPaidReservation,
      remainingBalance: Math.max(0, totalReservation - totalPaidReservation),
    }
  }

  // Formatear moneda
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("es-CO", {
      style: "currency",
      currency: "COP",
    }).format(amount || 0)
  }

  // Formatear fecha
  const formatDate = (dateString) => {
    if (!dateString) return "N/A"
    const options = { year: "numeric", month: "long", day: "numeric" }
    return new Date(dateString).toLocaleDateString("es-CO", options)
  }

  // Formatear última actualización
  const formatLastRefresh = (date) => {
    if (!date) return "Nunca"

    const now = new Date()
    const diff = Math.floor((now - date) / 1000)

    if (diff < 60) return `Hace ${diff}s`
    if (diff < 3600) return `Hace ${Math.floor(diff / 60)}m`
    return date.toLocaleTimeString("es-CO", {
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  // Manejar cambio de página
  const handlePageClick = ({ selected }) => {
    setCurrentPage(selected)
  }

  // Limpiar búsqueda
  const handleClearSearch = () => {
    setSearchTerm("")
    setCurrentPage(0) // Resetear a la primera página
  }

  const reservationSummary = getReservationSummary()

  return (
    <div className="table-container">
      {/* Encabezado igual que servicios */}
      <div className="title-container">
        <h2 className="table-title">Gestión de Pagos</h2>
      </div>

      {/* Controles de búsqueda y acciones - Estilo servicios */}
      <div className="container-search">
        <div className="search-wrapper-comfort">
          <FaSearch className="config-search-icon" />
          <input
            type="text"
            className="comfort-search"
            placeholder="Buscar pago..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            disabled={isLoading}
          />
          {searchTerm && (
            <button className="clear-search" onClick={handleClearSearch} aria-label="Limpiar búsqueda">
              <FaTimes />
            </button>
          )}
        </div>

        <div className="payments-action-buttons">
          <button
            onClick={() => setShowAnulados(!showAnulados)}
            className={`toggle-anulados ${showAnulados ? "active" : ""}`}
          >
            {showAnulados ? "Ocultar Anulados" : "Mostrar Anulados"}
          </button>

          <button
            className="manual-refresh-btn"
            onClick={manualRefresh}
            disabled={isRefreshing || isLoading}
            title="Actualizar manualmente"
          >
            <FaSync className={isRefreshing || isLoading ? "animate-spin" : ""} />
            Actualizar
          </button>
        </div>
      </div>

      {/* Indicador de estado compacto */}
      <div className="refresh-status-compact">
        <div className="auto-refresh-indicator">
          {refreshError ? (
            <FaExclamationTriangle style={{ color: "#dc3545" }} />
          ) : isRefreshing || isLoading ? (
            <div className="refresh-spinner" />
          ) : (
            <FaClock style={{ color: autoRefreshEnabled ? "#28a745" : "#6c757d" }} />
          )}
          <span>
            {refreshError
              ? "Error al actualizar"
              : isRefreshing || isLoading
                ? "Actualizando..."
                : autoRefreshEnabled
                  ? "Auto-actualización activa"
                  : "Auto-actualización pausada"}
          </span>
          {lastRefresh && !refreshError && (
            <span className="last-refresh">• Última: {formatLastRefresh(lastRefresh)}</span>
          )}
        </div>

        <label className={`auto-refresh-toggle ${autoRefreshEnabled ? "active" : ""}`}>
          <input
            type="checkbox"
            checked={autoRefreshEnabled}
            onChange={toggleAutoRefresh}
            style={{ display: "none" }}
          />
          <span>Auto-actualizar cada 30s</span>
        </label>
      </div>

      {/* Mensaje de error */}
      {(error || refreshError) && (
        <div className="error-message">
          {error || refreshError}
          <button
            onClick={() => {
              setError(null)
              setRefreshError(null)
              manualRefresh()
            }}
          >
            <FaTimes />
          </button>
        </div>
      )}

      {/* Wrapper de tabla igual que servicios */}
      <div className="comfort-table-wrapper">
        {isLoading && !isRefreshing ? (
          <div className="loading-indicator">
            <div className="loading-spinner"></div>
            <p>Cargando pagos...</p>
          </div>
        ) : error && !refreshError ? (
          <div className="error-message">
            {error}
            <button onClick={() => setError(null)}>
              <FaTimes />
            </button>
          </div>
        ) : (
          <>
            <TablePayments
              payments={currentItems}
              onDetailPayment={handleViewDetails}
              onStatusChange={!isReadOnly ? handleStatusChange : null}
              isLoading={isRefreshing}
            />

            {/* Paginación igual que servicios */}
            {pageCount > 1 && (
              <div className="pagination-container">
                <Pagination pageCount={pageCount} onPageChange={handlePageClick} />
              </div>
            )}
          </>
        )}
      </div>

      {/* Modal de detalles - mantener igual */}
      {isDetailModalOpen && selectedPayment && (
        <div className="payments-modal-overlay">
          <div className="payments-modal-container">
            <div className="modal-header-payments">
              <h2>Detalles del Pago</h2>
              <button className="close-button-payments" onClick={() => setIsDetailModalOpen(false)} aria-label="Cerrar">
                &times;
              </button>
            </div>

            {/* Resumen específico de la reserva */}
            {loadingReservationData ? (
              <div className="modal-payments-summary">
                <div className="loading-summary">🔍 Buscando reserva asociada...</div>
              </div>
            ) : selectedReservationData ? (
              <div className="modal-payments-summary">
                <div className="summary-item">
                  <span>Reserva #{selectedReservationData.idReservation}:</span>
                  <strong>{formatCurrency(reservationSummary.totalReservation)}</strong>
                </div>
                <div className="summary-item">
                  <span>Cliente:</span>
                  <strong>
                    {selectedReservationData.user?.name || selectedReservationData.user?.identification || "N/A"}
                  </strong>
                </div>
                <div className="summary-item">
                  <span>Total Pagado:</span>
                  <strong>{formatCurrency(reservationSummary.totalPaid)}</strong>
                </div>
                <div className="summary-item">
                  <span>Saldo Pendiente:</span>
                  <strong>{formatCurrency(reservationSummary.remainingBalance)}</strong>
                </div>
              </div>
            ) : (
              <div className="modal-payments-summary">
                <div className="summary-item">
                  <span>❌ No se encontró reserva asociada</span>
                  <strong>-</strong>
                </div>
              </div>
            )}

            <div className="modal-body-payments">
              <div className="payment-details-grid">
                <div className="detail-group">
                  <label>ID del Pago:</label>
                  <p>{selectedPayment.idPayments || selectedPayment.id || "N/A"}</p>
                </div>

                {selectedReservationData && (
                  <div className="detail-group">
                    <label>ID de Reserva:</label>
                    <p>#{selectedReservationData.idReservation}</p>
                  </div>
                )}

                <div className="detail-group">
                  <label>Método de Pago:</label>
                  <p>{selectedPayment.paymentMethod || "N/A"}</p>
                </div>

                <div className="detail-group">
                  <label>Fecha:</label>
                  <p>{formatDate(selectedPayment.paymentDate)}</p>
                </div>

                <div className="detail-group">
                  <label>Monto:</label>
                  <p className="amount">{formatCurrency(selectedPayment.amount)}</p>
                </div>

                <div className="detail-group">
                  <label>Estado:</label>
                  <div className="status-badge-container">
                    <span className={`status-badge ${selectedPayment.status?.toLowerCase() || "pendiente"}`}>
                      {selectedPayment.status || "Pendiente"}
                    </span>
                  </div>
                </div>

                {selectedReservationData && (
                  <>
                    {selectedReservationData.user && (
                      <div className="detail-group">
                        <label>Cliente:</label>
                        <p>{selectedReservationData.user.name || selectedReservationData.user.identification}</p>
                      </div>
                    )}

                    <div className="detail-group">
                      <label>Fechas de Reserva:</label>
                      <p>
                        {formatDate(selectedReservationData.startDate)} - {formatDate(selectedReservationData.endDate)}
                      </p>
                    </div>

                    {selectedReservationData.plan && (
                      <div className="detail-group">
                        <label>Plan:</label>
                        <p>
                          {selectedReservationData.plan.name} - {formatCurrency(selectedReservationData.plan.salePrice)}
                        </p>
                      </div>
                    )}
                  </>
                )}

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
                    ) : (
                      "N/A"
                    )}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

ViewPayments.propTypes = {
  idReservation: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  totalAmount: PropTypes.number,
  isReadOnly: PropTypes.bool,
}

export default ViewPayments
