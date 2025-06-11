"use client"

import PropTypes from "prop-types"
import { useState, useEffect } from "react"
import { FaEye, FaInfoCircle } from "react-icons/fa"
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
  onPaymentSuccess = null,
  reservationData = null, // ✅ NUEVO: Datos completos de la reserva
  existingPayments = [], // ✅ NUEVO: Pagos existentes de la reserva
}) => {
  console.log("💳 PaymentForm RENDER - reservationData:", reservationData)
  console.log("💳 PaymentForm RENDER - existingPayments:", existingPayments)

  useEffect(() => {
    console.log("💳 PaymentForm MOUNTED - keepFormOpen:", keepFormOpen)
    return () => {
      console.log("💳 PaymentForm UNMOUNTED")
    }
  }, [keepFormOpen])

  // ✅ CALCULAR INFORMACIÓN DE PAGOS
  const getPaymentInfo = () => {
    if (!reservationData) {
      return {
        totalReservation: totalAmount || 0,
        validPayments: [],
        canAddPayment: true,
        nextPaymentType: "first",
        nextPaymentAmount: 0,
        isComplete: false,
      }
    }

    // Calcular total de la reserva
    const planPrice = reservationData.plan?.salePrice || reservationData.plan?.price || 0
    const servicesTotal = (reservationData.services || []).reduce((sum, service) => sum + (service.Price || 0), 0)
    const totalReservation = planPrice + servicesTotal

    // Filtrar pagos válidos (no anulados)
    const validPayments = existingPayments.filter((payment) => payment.status !== "Anulado")

    // ✅ CALCULAR TOTAL YA PAGADO
    const totalPaid = validPayments.reduce((sum, payment) => sum + (Number(payment.amount) || 0), 0)

    // Calcular montos de pago
    const firstPaymentAmount = Math.round(totalReservation * 0.5) // 50%

    // ✅ EL SEGUNDO PAGO ES EXACTAMENTE LO QUE FALTA POR PAGAR
    const remainingAmount = totalReservation - totalPaid
    const secondPaymentAmount = remainingAmount

    // Determinar estado actual
    const paymentCount = validPayments.length
    const canAddPayment = paymentCount < 2 && remainingAmount > 0
    const isComplete = totalPaid >= totalReservation

    let nextPaymentType = "first"
    let nextPaymentAmount = firstPaymentAmount

    if (paymentCount === 1) {
      nextPaymentType = "second"
      nextPaymentAmount = secondPaymentAmount // Usar el monto restante exacto
    }

    return {
      totalReservation,
      validPayments,
      canAddPayment,
      nextPaymentType,
      nextPaymentAmount,
      firstPaymentAmount,
      secondPaymentAmount,
      isComplete,
      paymentCount,
      totalPaid, // ✅ AGREGAR TOTAL PAGADO
      remainingAmount, // ✅ AGREGAR MONTO RESTANTE
    }
  }

  const paymentInfo = getPaymentInfo()

  const [paymentData, setPaymentData] = useState({
    paymentMethod: initialData.paymentMethod || "",
    paymentDate: initialData.paymentDate || new Date().toISOString().split("T")[0],
    amount: initialData.amount || paymentInfo.nextPaymentAmount.toString(),
    status: initialData.status || "Pendiente",
    voucher: initialData.voucher || null,
  })

  const [errors, setErrors] = useState({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [voucherPreview, setVoucherPreview] = useState(null)
  const [touched, setTouched] = useState({})

  // Usar el contexto de alertas
  const { showAlert } = useAlert()

  // ✅ ACTUALIZAR MONTO CUANDO CAMBIE LA INFORMACIÓN DE PAGOS
  useEffect(() => {
    if (!isViewMode && paymentInfo.canAddPayment) {
      setPaymentData((prev) => ({
        ...prev,
        amount: paymentInfo.nextPaymentAmount.toString(),
      }))
    }
  }, [paymentInfo.nextPaymentAmount, paymentInfo.canAddPayment, isViewMode])

  const handleChange = (e) => {
    if (isViewMode) return

    const { name, value } = e.target
    console.log("💳 PaymentForm handleChange - field:", name, "value:", value)

    // ✅ BLOQUEAR CAMBIOS EN EL MONTO - debe ser exacto
    if (name === "amount" && reservationData) {
      toast.warning(
        `El monto debe ser exactamente ${formatCOP(paymentInfo.nextPaymentAmount)} para el ${paymentInfo.nextPaymentType === "first" ? "primer" : "segundo"} pago`,
      )
      return
    }

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

    // ✅ VALIDACIÓN ESPECÍFICA PARA RESERVAS CON LÓGICA DE 50%
    if (reservationData && paymentInfo.canAddPayment) {
      const expectedAmount = paymentInfo.nextPaymentAmount

      if (amount !== expectedAmount) {
        const paymentType = paymentInfo.nextPaymentType === "first" ? "primer" : "segundo"

        // ✅ MENSAJE MÁS ESPECÍFICO PARA EL SEGUNDO PAGO
        if (paymentInfo.nextPaymentType === "second") {
          return `El ${paymentType} pago debe ser exactamente ${formatCOP(expectedAmount)} (monto restante por pagar)`
        } else {
          return `El ${paymentType} pago debe ser exactamente ${formatCOP(expectedAmount)}`
        }
      }

      // ✅ VALIDACIÓN ADICIONAL: NO PERMITIR QUE EL TOTAL EXCEDA EL MONTO DE LA RESERVA
      const totalAfterThisPayment = paymentInfo.totalPaid + amount
      if (totalAfterThisPayment > paymentInfo.totalReservation) {
        const maxAllowed = paymentInfo.totalReservation - paymentInfo.totalPaid
        return `El monto excede el total de la reserva. Máximo permitido: ${formatCOP(maxAllowed)}`
      }
    } else {
      // Validaciones generales para casos sin reserva específica
      if (amount < 1000) {
        return "El monto mínimo es $1,000 COP"
      }

      if (totalAmount && amount > Number.parseFloat(totalAmount)) {
        return "El monto no puede ser mayor al total a pagar"
      }
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

    // ✅ VALIDAR SI SE PUEDEN AGREGAR MÁS PAGOS
    if (!paymentInfo.canAddPayment) {
      errors.submit = "Esta reserva ya tiene los 2 pagos requeridos (50% + 50%)"
      return errors
    }

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
      // ✅ MENSAJE DE CONFIRMACIÓN ESPECÍFICO
      const paymentType = paymentInfo.nextPaymentType === "first" ? "primer" : "segundo"
      const paymentDescription =
        paymentInfo.nextPaymentType === "first" ? "primer pago (50%)" : "segundo pago (50% restante)"

      console.log("💳 PaymentForm showing confirmation alert")
      showAlert({
        type: "confirm-edit",
        title: "Confirmar Pago",
        message: `¿Está seguro de registrar el ${paymentDescription} por ${formatCOP(paymentData.amount)}?`,
        confirmText: `Sí, Registrar ${paymentType} Pago`,
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

            // ✅ MENSAJE DE ÉXITO ESPECÍFICO
            const successMessage =
              paymentInfo.nextPaymentType === "first"
                ? "Primer pago (50%) registrado correctamente"
                : "Segundo pago (50% restante) registrado correctamente. ¡Reserva completamente pagada!"

            toast.success(successMessage)
            console.log("💳 PaymentForm payment registered successfully")

            // ✅ NUEVO: Notificar al componente padre sobre el éxito
            if (onPaymentSuccess) {
              console.log("💳 PaymentForm calling onPaymentSuccess callback")
              onPaymentSuccess(savedPayment)
            }

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

  // ✅ SI NO SE PUEDEN AGREGAR MÁS PAGOS, MOSTRAR MENSAJE INFORMATIVO
  if (!paymentInfo.canAddPayment && !isViewMode) {
    return (
      <div className="payment-complete-message">
        <div className="payment-complete-icon">
          <FaInfoCircle size={48} color="#28a745" />
        </div>
        <h3>Pagos Completados</h3>
        <p>Esta reserva ya tiene los 2 pagos requeridos:</p>
        <ul>
          <li>✅ Primer pago (50%): {formatCOP(paymentInfo.firstPaymentAmount)}</li>
          <li>✅ Segundo pago (50%): {formatCOP(paymentInfo.secondPaymentAmount)}</li>
        </ul>
        <p>
          <strong>Total pagado: {formatCOP(paymentInfo.totalReservation)}</strong>
        </p>

        {onCancel && (
          <button type="button" className="reservation-cancel-button" onClick={onCancel}>
            Cerrar
          </button>
        )}
      </div>
    )
  }

  return (
    <>
      {/* ✅ INFORMACIÓN DE PAGO ACTUAL */}
      {reservationData && paymentInfo.canAddPayment && (
        <div className="payment-info-banner">
          <FaInfoCircle className="info-icon" />
          <div className="payment-info-content">
            <h4>{paymentInfo.nextPaymentType === "first" ? "Primer Pago (50%)" : `Segundo Pago (Monto Restante)`}</h4>
            <p>
              Monto requerido: <strong>{formatCOP(paymentInfo.nextPaymentAmount)}</strong>
            </p>
            <small>
              Total reserva: {formatCOP(paymentInfo.totalReservation)} | Ya pagado: {formatCOP(paymentInfo.totalPaid)} |
              Restante: {formatCOP(paymentInfo.remainingAmount)} | Pagos: {paymentInfo.paymentCount}/2
            </small>
          </div>
        </div>
      )}

      <div className="form-row">
        <div className="form-group">
          <label htmlFor="paymentMethod" className="form-label">
            Método de Pago *
          </label>
          {isViewMode ? (
            <div className="form-value">{paymentData.paymentMethod || "N/A"}</div>
          ) : (
            <>
              <select
                id="paymentMethod"
                name="paymentMethod"
                value={paymentData.paymentMethod}
                onChange={handleChange}
                onBlur={() => handleBlur("paymentMethod")}
                className={`form-input ${shouldShowError("paymentMethod") ? "error" : ""}`}
                disabled={!paymentInfo.canAddPayment}
              >
                <option value="">Seleccione un método</option>
                <option value="Tarjeta de Crédito">Tarjeta de Crédito</option>
                <option value="Tarjeta de Débito">Tarjeta de Débito</option>
                <option value="Transferencia Bancaria">Transferencia Bancaria</option>
                <option value="Efectivo">Efectivo</option>
                <option value="Otro">Otro</option>
              </select>
              {shouldShowError("paymentMethod") && <div className="error-message">{errors.paymentMethod}</div>}
            </>
          )}
        </div>
        <div className="form-group">
          <label htmlFor="amount" className="form-label">
            Monto Pagado *
          </label>
          {isViewMode ? (
            <div className="form-value">{formatCOP(Number.parseFloat(paymentData.amount || 0))}</div>
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
                className={`form-input ${shouldShowError("amount") ? "error" : ""}`}
                disabled={!paymentInfo.canAddPayment || (reservationData && true)} // Deshabilitar si hay reserva específica
                readOnly={reservationData && true} // Solo lectura si hay reserva específica
                title={
                  reservationData
                    ? `Monto fijo para ${paymentInfo.nextPaymentType === "first" ? "primer" : "segundo"} pago`
                    : ""
                }
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !isViewMode && !isSubmitting && paymentInfo.canAddPayment) {
                    e.preventDefault()
                    e.stopPropagation()
                    handleSubmit(e)
                  }
                }}
              />
              {shouldShowError("amount") && <div className="error-message">{errors.amount}</div>}
            </>
          )}
        </div>
      </div>

      <div className="form-row">
        <div className="form-group">
          <label htmlFor="paymentDate" className="form-label">
            Fecha de Pago *
          </label>
          {isViewMode ? (
            <div className="form-value">{paymentData.paymentDate || "N/A"}</div>
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
                className={`form-input ${shouldShowError("paymentDate") ? "error" : ""}`}
                disabled={!paymentInfo.canAddPayment}
              />
              {shouldShowError("paymentDate") && <div className="error-message">{errors.paymentDate}</div>}
            </>
          )}
        </div>
        <div className="form-row">
        <div className="form-group full-width">
          <label htmlFor="voucher" className="form-label">
            Comprobante de Pago
          </label>
          {!isViewMode && (
            <input
              type="file"
              id="voucher"
              name="voucher"
              onChange={handleFileChange}
              accept="image/*,.pdf"
              className={`form-input file-input ${shouldShowError("voucher") ? "error" : ""}`}
              disabled={!paymentInfo.canAddPayment}
            />
          )}
          {shouldShowError("voucher") && <div className="error-message">{errors.voucher}</div>}
          {renderVoucherPreview()}
        </div>
      </div>
      </div>

      

      {errors.submit && <div className="error-message submit-error">{errors.submit}</div>}

      <div className="form-actions">
        {!isViewMode && onCancel && (
          <button type="button" className="reservation-cancel-button" onClick={handleCancel} disabled={isSubmitting}>
            Cancelar
          </button>
        )}
        {/* Botón oculto para disparar desde el footer */}
        <button
          type="button"
          id="confirmar-pago-btn"
          style={{ display: "none" }}
          disabled={isSubmitting || isViewMode || !paymentInfo.canAddPayment}
          onClick={handleSubmit}
        >
          Confirmar Pago
        </button>
      </div>
    </>
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
  reservationData: PropTypes.object, // ✅ NUEVO
  existingPayments: PropTypes.array, // ✅ NUEVO
}

export default PaymentForm
