"use client"

import { useState, useEffect, useMemo } from "react"
import PropTypes from "prop-types"
import { getReservationPayments, changePaymentStatus, getAllPayments } from "../../../services/paymentsService"
import { getReservationById } from "../../../services/reservationsService"
import TablePayments from "./tablePayments"
import "./componentPayments.css"

const ViewPayments = ({ idReservation = null, isReadOnly = false }) => {
  // Estados principales
  const [payments, setPayments] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [currentPage, setCurrentPage] = useState(0)
  const [showAnulados, setShowAnulados] = useState(false)
  const itemsPerPage = 5

  // Estados para el modal de detalles
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false)
  const [selectedPayment, setSelectedPayment] = useState(null)
  const [selectedReservationData, setSelectedReservationData] = useState(null)
  const [selectedReservationPayments, setSelectedReservationPayments] = useState([])
  const [loadingReservationData, setLoadingReservationData] = useState(false)

  // Cache para reservas ya buscadas
  const [reservationCache, setReservationCache] = useState(new Map())

  // Cargar pagos
  useEffect(() => {
    const fetchPayments = async () => {
      try {
        setIsLoading(true)
        setError(null)

        const paymentsData = idReservation ? await getReservationPayments(idReservation) : await getAllPayments()

        setPayments(Array.isArray(paymentsData) ? paymentsData : [])
      } catch (err) {
        console.error("Error al cargar pagos:", err)
        setError(`Error al cargar pagos: ${err.message}`)
      } finally {
        setIsLoading(false)
      }
    }

    fetchPayments()
  }, [idReservation])

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

  // Total pagado general (para cuando no hay reserva específica)
  
  // Función para buscar reserva por ID de pago
  const findReservationByPaymentId = async (paymentId) => {
    try {
      console.log("🔍 Buscando reserva para el pago ID:", paymentId)

      // Verificar cache primero
      if (reservationCache.has(paymentId)) {
        console.log("✅ Reserva encontrada en cache")
        return reservationCache.get(paymentId)
      }

      // Estrategia: Intentar IDs de reserva secuencialmente
      // Esto es una solución temporal hasta que el backend incluya idReservation
      let foundReservation = null
      let attempts = 0
      const maxAttempts = 50 // Limitar intentos para evitar bucles infinitos

      for (let reservationId = 1; reservationId <= maxAttempts; reservationId++) {
        attempts++
        try {
          console.log(`🔍 Intentando reserva ID: ${reservationId} (intento ${attempts}/${maxAttempts})`)

          const reservation = await getReservationById(reservationId)

          if (reservation && reservation.payments) {
            const hasPayment = reservation.payments.some((p) => p.idPayments === paymentId || p.id === paymentId)

            if (hasPayment) {
              console.log(`✅ ¡Reserva encontrada! ID: ${reservationId}`)
              foundReservation = reservation

              // Guardar en cache
              setReservationCache((prev) => new Map(prev.set(paymentId, reservation)))
              break
            }
          }
        } catch (err) {
          // Si la reserva no existe, continuar con la siguiente
          if (err.response?.status === 404) {
            continue
          }
          console.warn(`⚠️ Error al buscar reserva ${reservationId}:`, err.message)
        }
      }

      if (!foundReservation) {
        console.log("❌ No se encontró reserva para el pago después de", attempts, "intentos")
      }

      return foundReservation
    } catch (error) {
      console.error("❌ Error en búsqueda de reserva:", error)
      return null
    }
  }

  // Cambiar estado
  const handleStatusChange = async (paymentId, newStatus) => {
    if (!paymentId || !newStatus) return

    try {
      setIsLoading(true)
      const updatedPayment = await changePaymentStatus(paymentId, newStatus)

      setPayments((prev) => prev.map((p) => (p.idPayments === updatedPayment.idPayments ? updatedPayment : p)))

      // Si el pago actualizado es el seleccionado, actualizar también los datos de la reserva
      if (selectedPayment && selectedPayment.idPayments === updatedPayment.idPayments) {
        setSelectedPayment(updatedPayment)
        // Recargar los pagos de la reserva específica
        if (updatedPayment.idReservation) {
          const reservationPayments = await getReservationPayments(updatedPayment.idReservation)
          setSelectedReservationPayments(Array.isArray(reservationPayments) ? reservationPayments : [])
        }
      }

      setError(null)
    } catch (err) {
      console.error("Error al cambiar estado:", err)
      setError(`Error al cambiar estado: ${err.response?.data?.message || err.message}`)
    } finally {
      setIsLoading(false)
    }
  }

  // Ver detalles - Cargar datos específicos de la reserva
  const handleViewDetails = async (paymentId, payment) => {
    try {
      setLoadingReservationData(true)
      setSelectedPayment(payment)
      setIsDetailModalOpen(true)

      console.log("🔍 Pago seleccionado:", payment)
      console.log("🔍 ID del pago:", paymentId)

      let reservationData = null
      let reservationPayments = []

      // Si el pago tiene idReservation directamente (poco probable en vista global)
      if (payment.idReservation) {
        console.log("✅ El pago tiene idReservation:", payment.idReservation)

        try {
          reservationData = await getReservationById(payment.idReservation)
          reservationPayments = await getReservationPayments(payment.idReservation)
        } catch (reservationError) {
          console.error("❌ Error al cargar reserva por ID:", reservationError)
        }
      } else {
        // Buscar la reserva que contiene este pago
        console.log("🔍 Buscando reserva que contiene el pago...")

        reservationData = await findReservationByPaymentId(payment.idPayments || paymentId)

        if (reservationData) {
          reservationPayments = reservationData.payments || []
          console.log("✅ Reserva encontrada:", reservationData.idReservation)
        } else {
          console.log("❌ No se encontró reserva para este pago")
        }
      }

      setSelectedReservationData(reservationData)
      setSelectedReservationPayments(Array.isArray(reservationPayments) ? reservationPayments : [])
    } catch (err) {
      console.error("❌ Error general al cargar datos de la reserva:", err)
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

    // Calcular total de la reserva basado en el plan
    const planPrice = selectedReservationData.plan?.salePrice || selectedReservationData.plan?.price || 0
    const servicesTotal = (selectedReservationData.services || []).reduce(
      (sum, service) => sum + (service.Price || 0),
      0,
    )
    const totalReservation = planPrice + servicesTotal

    // Calcular total pagado
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

  const reservationSummary = getReservationSummary()

  return (
    <div className="view-payments-container">
      {/* Encabezado */}
      <div className="payments-header">
        <h2>Gestión de Pagos</h2>
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
            <button onClick={() => setSearchTerm("")} disabled={isLoading} className="clear-search">
              ×
            </button>
          )}
        </div>

        <button
          onClick={() => setShowAnulados(!showAnulados)}
          className={`toggle-anulados ${showAnulados ? "active" : ""}`}
        >
          {showAnulados ? "Ocultar Anulados" : "Mostrar Anulados"}
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
            <button onClick={() => setCurrentPage((p) => Math.max(0, p - 1))} disabled={currentPage === 0 || isLoading}>
              Anterior
            </button>
            <span>
              Página {currentPage + 1} de {pageCount}
            </span>
            <button
              onClick={() => setCurrentPage((p) => Math.min(pageCount - 1, p + 1))}
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
