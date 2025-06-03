
import PropTypes from "prop-types"
import { useState, useEffect } from "react"
import {
  FaCreditCard,
  FaMoneyBillWave,
  FaCalendarAlt,
  FaCheckCircle,
  FaExchangeAlt,
  FaEye,
  FaUpload,
  FaExclamationTriangle,
} from "react-icons/fa"
import { toast } from "react-toastify"
import { useAlert } from "../../../context/AlertContext"
import "./componentPayments.css"

// Importamos la función syncReservationStatus
import { syncReservationStatus } from "../../../services/paymentsService"

const PaymentForm = ({
  totalAmount,
  onPaymentSubmit,
  initialData = {},
  isViewMode = false,
  onCloseView = null,
  onCancel = null,
  keepFormOpen = false,
}) => {
  console.log("💳 PaymentForm RENDER - keepFormOpen:", keepFormOpen)

  useEffect(() => {
    console.log("💳 PaymentForm MOUNTED - keepFormOpen:", keepFormOpen)
    return () => {
      console.log("💳 PaymentForm UNMOUNTED")
    }
  }, [keepFormOpen])

  const [paymentData, setPaymentData] = useState({
    paymentMethod: initialData.paymentMethod || "",
    paymentDate: initialData.paymentDate || new Date().toISOString().split("T")[0],
    amount: initialData.amount || "",
    status: initialData.status || "Pendiente",
    voucher: initialData.voucher || null,
  })

  const [errors, setErrors] = useState({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [voucherPreview, setVoucherPreview] = useState(null)
  const [touched, setTouched] = useState({})

  // Usar el contexto de alertas
  const { showAlert } = useAlert()

  const handleChange = (e) => {
    if (isViewMode) return

    const { name, value } = e.target
    console.log("💳 PaymentForm handleChange - field:", name, "value:", value)

    setPaymentData((prev) => ({
      ...prev,
      [name]: value,
    }))

    // Marcar campo como tocado
    setTouched((prev) => ({
      ...prev,
      [name]: true,
    }))

    // Limpiar error si existe
    if (errors[name]) {
      setErrors((prev) => {
        const updatedErrors = { ...prev }
        delete updatedErrors[name]
        return updatedErrors
      })
    }
  }

  const handleBlur = (fieldName) => {
    setTouched((prev) => ({
      ...prev,
      [fieldName]: true,
    }))

    // Validar campo específico al perder el foco
    const fieldErrors = validateField(fieldName, paymentData[fieldName])
    if (fieldErrors) {
      setErrors((prev) => ({
        ...prev,
        [fieldName]: fieldErrors,
      }))
    }
  }

  const validateField = (fieldName, value) => {
    switch (fieldName) {
      case "paymentMethod": {
        return !value ? "Método de pago es requerido" : null
      }
      case "paymentDate": {
        if (!value) return "Fecha de pago es requerida"
        const today = new Date().toISOString().split("T")[0]
        return value > today ? "La fecha no puede ser futura" : null
      }
      case "amount": {
        return validateAmount(value)
      }
      default: {
        return null
      }
    }
  }

  const validateAmount = (value) => {
    if (!value || value === "" || value === null || value === undefined) {
      return "Monto es requerido"
    }

    const cleanAmount = String(value).replace(/,/g, "").replace(/\s/g, "").trim()

    if (cleanAmount === "" || cleanAmount === "0") {
      return "Monto es requerido"
    }

    const amount = Number.parseFloat(cleanAmount)

    if (isNaN(amount)) {
      return "El monto debe ser un número válido"
    }

    if (amount <= 0) {
      return "El monto debe ser mayor a 0"
    }

    if (amount < 1000) {
      return "El monto mínimo es $1,000 COP"
    }

    if (totalAmount && amount > Number.parseFloat(totalAmount)) {
      return "El monto no puede ser mayor al total a pagar"
    }

    return null
  }

  const handleFileChange = (e) => {
    if (isViewMode) return

    const file = e.target.files[0]

    if (file) {
      // Validar tipo de archivo
      const allowedTypes = ["image/jpeg", "image/png", "image/jpg", "application/pdf"]
      if (!allowedTypes.includes(file.type)) {
        setErrors((prev) => ({
          ...prev,
          voucher: "Solo se permiten archivos JPEG, PNG o PDF",
        }))
        return
      }

      // Validar tamaño (2MB máximo)
      if (file.size > 2 * 1024 * 1024) {
        setErrors((prev) => ({
          ...prev,
          voucher: "El archivo no puede ser mayor a 2MB",
        }))
        return
      }

      setPaymentData((prev) => ({ ...prev, voucher: file }))

      // Crear preview para imágenes
      if (file.type.startsWith("image/")) {
        const reader = new FileReader()
        reader.onload = (e) => setVoucherPreview(e.target.result)
        reader.readAsDataURL(file)
      } else {
        setVoucherPreview(null)
      }

      // Limpiar error si existía
      if (errors.voucher) {
        setErrors((prev) => {
          const updatedErrors = { ...prev }
          delete updatedErrors.voucher
          return updatedErrors
        })
      }
    }
  }

  const validateForm = () => {
    if (isViewMode) return {}

    const errors = {}

    if (!paymentData.paymentMethod) {
      errors.paymentMethod = "Método de pago es requerido"
    }

    if (!paymentData.paymentDate) {
      errors.paymentDate = "Fecha de pago es requerida"
    } else {
      const today = new Date().toISOString().split("T")[0]
      if (paymentData.paymentDate > today) {
        errors.paymentDate = "La fecha no puede ser futura"
      }
    }

    // Validación del monto
    const amountError = validateAmount(paymentData.amount)
    if (amountError) {
      errors.amount = amountError
    }

    return errors
  }

  const handleSubmit = async (e) => {
    // ✅ PREVENIR COMPLETAMENTE LA PROPAGACIÓN DEL EVENTO
    if (e) {
      e.preventDefault()
      e.stopPropagation()
      // Asegurarnos de que el evento no burbujee hacia arriba en absoluto
      if (e.nativeEvent) {
        e.nativeEvent.stopImmediatePropagation?.()
      }
    }

    console.log("💳 PaymentForm handleSubmit CALLED - isViewMode:", isViewMode)

    if (isViewMode) {
      console.log("💳 PaymentForm isViewMode is true, calling onCloseView")
      onCloseView?.()
      return
    }

    const validationErrors = validateForm()

    if (Object.keys(validationErrors).length === 0) {
      // Mostrar alerta de confirmación antes de procesar el pago
      console.log("💳 PaymentForm showing confirmation alert")
      showAlert({
        type: "confirm-edit",
        title: "Confirmar Pago",
        message: `¿Está seguro de registrar este pago por ${formatCOP(paymentData.amount)}?`,
        confirmText: "Sí, Registrar Pago",
        onConfirm: async () => {
          console.log("💳 PaymentForm alert confirmed, starting payment submission")
          try {
            setIsSubmitting(true)
            console.log("💳 PaymentForm isSubmitting set to true")

            const cleanAmount = String(paymentData.amount).replace(/,/g, "").replace(/\s/g, "").trim()
            const numericAmount = Number.parseFloat(cleanAmount)

            if (isNaN(numericAmount) || numericAmount <= 0) {
              throw new Error(`El monto del pago no es válido: ${numericAmount}`)
            }

            const formData = new FormData()
            formData.append("paymentMethod", paymentData.paymentMethod)
            formData.append("paymentDate", paymentData.paymentDate)
            formData.append("amount", numericAmount.toString())
            formData.append("status", paymentData.status)

            if (paymentData.voucher && paymentData.voucher instanceof File) {
              formData.append("voucher", paymentData.voucher)
            }

            // ✅ Esperar a que se complete el guardado
            console.log("💳 PaymentForm calling onPaymentSubmit")
            const savedPayment = await onPaymentSubmit(formData)
            console.log(
              "💳 PaymentForm onPaymentSubmit completed successfully",
              savedPayment?.tempId || savedPayment?.idPayments,
            )

            // Sincronizar estado de reserva si es necesario
            if (savedPayment && savedPayment.idReservation && savedPayment.voucher) {
              try {
                console.log("💳 PaymentForm syncing reservation status")
                await syncReservationStatus(savedPayment.idReservation, savedPayment)
              } catch (syncError) {
                console.error("Error al sincronizar estado de reserva:", syncError)
                toast.warning("El pago se registró pero hubo un error al sincronizar el estado de la reserva")
              }
            }

            toast.success("Pago registrado correctamente")
            console.log("💳 PaymentForm payment registered successfully")

            // Solo resetear el formulario para permitir agregar otro pago
            console.log("💳 PaymentForm resetting form data")
            setPaymentData({
              paymentMethod: "",
              paymentDate: new Date().toISOString().split("T")[0],
              amount: "",
              status: "Pendiente",
              voucher: null,
            })
            setVoucherPreview(null)
            setErrors({})
            setTouched({})

            // Asegurar que se resetee el estado de envío
            console.log("💳 PaymentForm setting isSubmitting to false")
            setIsSubmitting(false)

            // ✅ IMPORTANTE: NO llamar onCancel - mantener el formulario abierto siempre
            console.log("💳 PaymentForm keepFormOpen:", keepFormOpen, "- NOT calling onCancel to keep form open")
          } catch (error) {
            console.error("❌ PaymentForm Error al guardar el pago:", error)
            console.log("💳 PaymentForm Error in payment submission:", error.message)
            toast.error(`Error al registrar el pago: ${error.message}`)
            setErrors({ submit: error.message })
            setIsSubmitting(false)
          }
        },
      })
    } else {
      console.log("💳 PaymentForm validation errors found:", validationErrors)
      setErrors(validationErrors)

      // Marcar todos los campos como tocados para mostrar errores
      setTouched({
        paymentMethod: true,
        paymentDate: true,
        amount: true,
        status: true,
        voucher: true,
      })

      // Mostrar mensaje de error
      toast.error("Por favor, corrija los errores en el formulario")
    }
  }

  const renderPaymentMethodIcon = () => {
    switch (paymentData.paymentMethod) {
      case "Tarjeta de Crédito":
      case "Tarjeta de Débito":
        return <FaCreditCard className="field-icon" />
      case "Transferencia Bancaria":
        return <FaExchangeAlt className="field-icon" />
      case "Efectivo":
        return <FaMoneyBillWave className="field-icon" />
      default:
        return <FaCreditCard className="field-icon" />
    }
  }

  const formatCOP = (value) => {
    return new Intl.NumberFormat("es-CO", {
      style: "currency",
      currency: "COP",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value || 0)
  }

  const renderVoucherPreview = () => {
    if (isViewMode && paymentData.voucher) {
      return (
        <div className="voucher-preview">
          <a
            href={
              typeof paymentData.voucher === "string" ? paymentData.voucher : URL.createObjectURL(paymentData.voucher)
            }
            target="_blank"
            rel="noopener noreferrer"
            className="proof-link"
          >
            <FaEye /> Ver comprobante
          </a>
        </div>
      )
    }

    if (!isViewMode && (voucherPreview || paymentData.voucher)) {
      return (
        <div className="voucher-preview">
          {voucherPreview ? (
            <img src={voucherPreview || "/placeholder.svg"} alt="Preview" className="voucher-image-preview" />
          ) : paymentData.voucher instanceof File ? (
            <div className="file-info">
              <span>📄 {paymentData.voucher.name}</span>
            </div>
          ) : null}
        </div>
      )
    }

    return null
  }

  // Función para determinar si mostrar error
  const shouldShowError = (fieldName) => {
    return errors[fieldName] && touched[fieldName]
  }

  // Función para manejar el cancelar
  const handleCancel = () => {
    console.log("💳 PaymentForm handleCancel CALLED - isViewMode:", isViewMode)

    if (isViewMode) {
      console.log("💳 PaymentForm isViewMode is true, calling onCloseView")
      onCloseView?.()
      return
    }

    // Si hay datos ingresados, mostrar confirmación
    if (paymentData.paymentMethod || paymentData.amount || paymentData.voucher) {
      console.log("💳 PaymentForm showing cancel confirmation alert")
      showAlert({
        type: "confirm-delete",
        title: "Cancelar Pago",
        message: "¿Está seguro de cancelar este pago? Los datos ingresados se perderán.",
        confirmText: "Sí, Cancelar",
        onConfirm: () => {
          console.log("💳 PaymentForm cancel confirmed, calling onCancel")
          onCancel?.()
        },
      })
    } else {
      console.log("💳 PaymentForm no data entered, calling onCancel directly")
      onCancel?.()
    }
  }

  return (
    <div
      className={`payment-form-container ${isViewMode ? "view-mode" : ""}`}
      onClick={(e) => {
        // Detener la propagación de cualquier clic dentro del formulario de pago
        e.stopPropagation()
      }}
    >
      <h3 className="payment-form-title">{isViewMode ? "Detalles del Pago" : "Información de Pago"}</h3>

      {/* Resumen de pago */}
      <div className="payment-summary-card">
        <div className="payment-total-display">
          <span>Total a Pagar:</span>
          <strong>{formatCOP(totalAmount)}</strong>
        </div>
      </div>

      {/* Grid de dos columnas */}
      <div className="payment-form-grid">
        {/* Columna izquierda */}
        <div className="payment-form-column">
          {/* Campo Método de Pago */}
          <div className="payment-field-group">
            <label htmlFor="paymentMethod" className="payment-field-label">
              {renderPaymentMethodIcon()} Método de Pago *
            </label>
            {isViewMode ? (
              <div className="payment-field-value">{paymentData.paymentMethod || "N/A"}</div>
            ) : (
              <>
                <select
                  id="paymentMethod"
                  name="paymentMethod"
                  value={paymentData.paymentMethod}
                  onChange={handleChange}
                  onBlur={() => handleBlur("paymentMethod")}
                  className={`payment-field-input ${shouldShowError("paymentMethod") ? "error" : ""}`}
                >
                  <option value="">Seleccione un método</option>
                  <option value="Tarjeta de Crédito">Tarjeta de Crédito</option>
                  <option value="Tarjeta de Débito">Tarjeta de Débito</option>
                  <option value="Transferencia Bancaria">Transferencia Bancaria</option>
                  <option value="Efectivo">Efectivo</option>
                  <option value="Otro">Otro</option>
                </select>
                {shouldShowError("paymentMethod") && (
                  <div className="payment-error-message">
                    <FaExclamationTriangle className="error-icon" />
                    {errors.paymentMethod}
                  </div>
                )}
              </>
            )}
          </div>

          {/* Campo Monto */}
          <div className="payment-field-group">
            <label htmlFor="amount" className="payment-field-label">
              <FaMoneyBillWave className="field-icon" /> Monto Pagado *
            </label>
            {isViewMode ? (
              <div className="payment-field-value">{formatCOP(Number.parseFloat(paymentData.amount || 0))}</div>
            ) : (
              <>
                <input
                  type="number"
                  id="amount"
                  name="amount"
                  value={paymentData.amount}
                  onChange={handleChange}
                  onBlur={() => handleBlur("amount")}
                  min="1000"
                  step="1000"
                  placeholder="000"
                  className={`payment-field-input ${shouldShowError("amount") ? "error" : ""}`}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !isViewMode && !isSubmitting) {
                      e.preventDefault()
                      e.stopPropagation() // ✅ PREVENIR PROPAGACIÓN
                      handleSubmit(e)
                    }
                  }}
                />
                {shouldShowError("amount") && (
                  <div className="payment-error-message">
                    <FaExclamationTriangle className="error-icon" />
                    {errors.amount}
                  </div>
                )}
              </>
            )}
          </div>
        </div>

        {/* Columna derecha */}
        <div className="payment-form-column">
          {/* Campo Fecha de Pago */}
          <div className="payment-field-group">
            <label htmlFor="paymentDate" className="payment-field-label">
              <FaCalendarAlt className="field-icon" /> Fecha de Pago *
            </label>
            {isViewMode ? (
              <div className="payment-field-value">{paymentData.paymentDate || "N/A"}</div>
            ) : (
              <>
                <input
                  type="date"
                  id="paymentDate"
                  name="paymentDate"
                  value={paymentData.paymentDate}
                  onChange={handleChange}
                  onBlur={() => handleBlur("paymentDate")}
                  max={new Date().toISOString().split("T")[0]}
                  className={`payment-field-input ${shouldShowError("paymentDate") ? "error" : ""}`}
                />
                {shouldShowError("paymentDate") && (
                  <div className="payment-error-message">
                    <FaExclamationTriangle className="error-icon" />
                    {errors.paymentDate}
                  </div>
                )}
              </>
            )}
          </div>

          {/* Campo Estado */}
          <div className="payment-field-group">
            <label className="payment-field-label">
              <FaCheckCircle className="field-icon" /> Estado del Pago
            </label>
            {isViewMode ? (
              <div className="payment-field-value">{paymentData.status || "N/A"}</div>
            ) : (
              <div className="payment-status-options">
                <label className="payment-radio-label">
                  <input
                    type="radio"
                    name="status"
                    value="Pendiente"
                    checked={paymentData.status === "Pendiente"}
                    onChange={handleChange}
                  />
                  <span className="radio-custom"></span>
                  Pendiente
                </label>
                <label className="payment-radio-label">
                  <input
                    type="radio"
                    name="status"
                    value="Confirmado"
                    checked={paymentData.status === "Confirmado"}
                    onChange={handleChange}
                  />
                  <span className="radio-custom"></span>
                  Confirmado
                </label>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Campo Comprobante - Ancho completo */}
      <div className="payment-field-group payment-field-full-width">
        <label htmlFor="voucher" className="payment-field-label">
          <FaUpload className="field-icon" /> Comprobante de Pago
        </label>
        {!isViewMode && (
          <input
            type="file"
            id="voucher"
            name="voucher"
            onChange={handleFileChange}
            accept="image/*,.pdf"
            className={`payment-field-input file-input ${shouldShowError("voucher") ? "error" : ""}`}
          />
        )}
        {shouldShowError("voucher") && (
          <div className="payment-error-message">
            <FaExclamationTriangle className="error-icon" />
            {errors.voucher}
          </div>
        )}
        {renderVoucherPreview()}
      </div>

      {/* Error de envío */}
      {errors.submit && (
        <div className="payment-error-message submit-error">
          <FaExclamationTriangle className="error-icon" />
          {errors.submit}
        </div>
      )}

      {/* Botones de acción */}
      <div className="payment-form-actions">
        {!isViewMode && onCancel && (
          <button type="button" className="payment-cancel-btn" onClick={handleCancel} disabled={isSubmitting}>
            Cancelar
          </button>
        )}

        <button
          type="button"
          className={`payment-submit-btn ${isViewMode ? "view-mode" : ""} ${isSubmitting ? "loading" : ""}`}
          disabled={isSubmitting || isViewMode}
          onClick={(e) => {
            console.log("💳 PaymentForm submit button clicked")
            // Prevenir la propagación del evento de forma más agresiva
            e.preventDefault()
            e.stopPropagation()
            if (e.nativeEvent) {
              e.nativeEvent.stopImmediatePropagation?.()
            }

            if (isViewMode) {
              console.log("💳 PaymentForm isViewMode is true, calling onCloseView")
              onCloseView?.()
            } else {
              console.log("💳 PaymentForm isViewMode is false, calling handleSubmit")
              handleSubmit(e)
            }
          }}
        >
          {isViewMode ? (
            "Cerrar"
          ) : isSubmitting ? (
            <>
              <span className="spinner"></span> Procesando pago...
            </>
          ) : (
            "Confirmar Pago"
          )}
        </button>
      </div>
    </div>
  )
}

PaymentForm.propTypes = {
  totalAmount: PropTypes.number.isRequired,
  onPaymentSubmit: PropTypes.func.isRequired,
  initialData: PropTypes.object,
  isViewMode: PropTypes.bool,
  onCloseView: PropTypes.func,
  onCancel: PropTypes.func,
  onPaymentSuccess: PropTypes.func,
  keepFormOpen: PropTypes.bool,
}

export default PaymentForm
