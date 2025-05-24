"use client"

import { useState, useEffect } from "react"
import Switch from "../../common/Switch/Switch"
import PropTypes from "prop-types"
import "./componentsReservations.css"

// Hooks y utilidades
import useReservationForm from "./reservationHooks"
import { calculateTotal, updateAvailability, createSelectionHandlers, sanitizeDataForServer } from "./reservationUtils"

// Componentes de pasos
import { BasicInfoStep, CompanionsStep, AvailabilityStep, PaymentStep } from "./reservationSteps"

// Servicios
import { createReservation, updateReservation, addCompanionReservation } from "../../../services/reservationsService"
import { createCompanion, deleteCompanion } from "../../../services/companionsService"
import { addPaymentToReservation } from "../../../services/paymentsService"

function FormReservation({ reservationData = null, onClose, onSave, isOpen, isReadOnly = false }) {
  const [step, setStep] = useState(1)
  const [tempPayments, setTempPayments] = useState([])
  const [loading, setLoading] = useState(false)
  const [reservationPayments, setReservationPayments] = useState([])

  // ✅ CORREGIDO - Usar el hook correctamente
  const { formData, updateFormData, errors, validateStep } = useReservationForm()

  // ✅ Crear setFormData como wrapper de updateFormData
  const setFormData = (newData) => {
    if (typeof newData === "function") {
      // Si es una función, obtener el estado actual y aplicar la función
      updateFormData(newData(formData))
    } else {
      // Si es un objeto, actualizar directamente
      updateFormData(newData)
    }
  }

  // Función para limpiar errores
  const clearError = (fieldName) => {
    // Implementar lógica para limpiar errores específicos si es necesario
    console.log(`Clearing error for field: ${fieldName}`)
  }

  // Handlers
  const handleChange = async (e) => {
    const { name, value } = e.target

    console.log("📝 HandleChange ejecutado:", { name, value })

    // Actualización inmediata del estado
    setFormData((prev) => {
      const newData = { ...prev, [name]: value }
      console.log("📝 Nuevo estado después del cambio:", {
        field: name,
        oldValue: prev[name],
        newValue: value,
        selectedServices: newData.selectedServices,
        idRoom: newData.idRoom,
        idCabin: newData.idCabin,
      })
      return newData
    })
    clearError(name)

    // Validación especial para el campo de acompañantes
    if (name === "companionCount") {
      const companionCount = Number.parseInt(value) || 0
      console.log("👥 Procesando cambio en companionCount:", companionCount)

      if (formData.hasCompanions && companionCount > 0 && formData.cabins && formData.bedrooms) {
        // Pequeño delay para permitir que el estado se actualice
        setTimeout(() => {
          console.log("⏰ Ejecutando actualización de disponibilidad después del delay")
          const updatedData = updateAvailability({
            ...formData,
            companionCount: companionCount,
          })

          // Determinar el mensaje de disponibilidad
          let message = ""
          if (companionCount > 1) {
            const availableCabins = updatedData.availableCabins.length
            message =
              availableCabins > 0
                ? `✅ Hay ${availableCabins} cabañas disponibles para ${companionCount + 1} personas`
                : `❌ No hay cabañas disponibles para ${companionCount + 1} personas`
          } else {
            const availableRooms = updatedData.availableBedrooms.length
            message =
              availableRooms > 0
                ? `✅ Hay ${availableRooms} habitaciones disponibles`
                : `❌ No hay habitaciones disponibles`
          }

          console.log("💬 Mensaje de disponibilidad:", message)

          // Mostrar notificación (puedes usar tu sistema de notificaciones preferido)
          Switch({
            show: true,
            message: message,
            type: message.includes("✅") ? "success" : "error",
          })
        }, 100)
      }
    }
  }

  const { handleCabinSelect, handleRoomSelect, handleServiceToggle } = createSelectionHandlers(setFormData)

  const nextStep = () => {
    console.log("➡️ Intentando avanzar al siguiente paso. Paso actual:", step)
    const isValid = validateStep(step, formData)
    console.log("✅ Validación del paso:", isValid)

    if (isValid) {
      if (step === 1 && !formData.hasCompanions) {
        console.log("⏭️ Saltando paso de acompañantes (no hay acompañantes)")
        setStep(3) // Saltar al paso de disponibilidad
      } else {
        console.log("➡️ Avanzando al paso:", step + 1)
        setStep(step + 1)
      }
    } else {
      console.log("❌ Validación falló, no se puede avanzar")
    }
  }

  const prevStep = () => {
    console.log("⬅️ Retrocediendo desde el paso:", step)
    if (step === 4 && !formData.hasCompanions) {
      setStep(1)
    } else if (step === 3 && !formData.hasCompanions) {
      setStep(1)
    } else {
      setStep(step - 1)
    }
  }

  const handleSaveCompanion = (newCompanion) => {
    console.log("👤 Guardando nuevo acompañante:", newCompanion)

    // forma funcional para garantizar la actualización correcta
    setFormData((prev) => {
      const updatedCompanions = [...(prev.companions || []), newCompanion]
      console.log("👥 Acompañantes actualizados:", {
        antes: prev.companions?.length || 0,
        después: updatedCompanions.length,
        nuevo: newCompanion,
      })

      return {
        ...prev,
        companions: updatedCompanions,
        companionCount: updatedCompanions.length, // Mantener sincronizado
      }
    })

    // Verificación después de actualizar el estado
    setTimeout(() => {
      console.log("✅ Verificación post-guardado de acompañante completada")
    }, 0)
  }

  const handleDeleteCompanion = (idOrDocNumber) => {
    if (isReadOnly || loading) return

    console.log("🗑️ Eliminando acompañante:", idOrDocNumber)

    setFormData((prev) => {
      const filteredCompanions = (prev.companions || []).filter(
        (c) => c.idCompanions !== idOrDocNumber && c.documentNumber !== idOrDocNumber,
      )

      console.log("👥 Acompañantes después de eliminar:", {
        antes: prev.companions?.length || 0,
        después: filteredCompanions.length,
        eliminado: idOrDocNumber,
      })

      return {
        ...prev,
        companions: filteredCompanions,
      }
    })
  }

  const handleAddPayment = async (paymentData) => {
    try {
      setLoading(true)
      console.log("💳 Agregando pago:", paymentData)

      if (!paymentData.amount || isNaN(Number.parseFloat(paymentData.amount))) {
        throw new Error("El monto del pago no es válido")
      }

      const amount = Number.parseFloat(paymentData.amount)
      if (amount <= 0) {
        throw new Error("El monto debe ser mayor que cero")
      }

      const newPayment = {
        ...paymentData,
        amount: amount,
        status: paymentData.status || "Pendiente",
        paymentDate: paymentData.paymentDate || new Date().toISOString().split("T")[0],
        paymentMethod: paymentData.paymentMethod || "Efectivo",
      }

      console.log("💳 Pago preparado:", newPayment)

      if (reservationData?.idReservation) {
        console.log("💾 Guardando pago en reserva existente:", reservationData.idReservation)
        const savedPayment = await addPaymentToReservation({
          ...newPayment,
          idReservation: reservationData.idReservation,
        })
        console.log("✅ Pago guardado:", savedPayment)
        setReservationPayments((prev) => [...prev, savedPayment])
        return savedPayment
      } else {
        console.log("📝 Agregando pago temporal (reserva nueva)")
        const tempPayment = {
          ...newPayment,
          tempId: `temp-${Date.now()}`,
          isTemp: true,
        }
        console.log("📝 Pago temporal creado:", tempPayment)
        setTempPayments((prev) => [...prev, tempPayment])
        return tempPayment
      }
    } catch (error) {
      console.error("❌ Error al agregar pago:", error)
      throw error
    } finally {
      setLoading(false)
    }
  }

  const handleSaveCompanionInReservation = async (companionData, reservationId) => {
    try {
      console.log("👤 Guardando acompañante en reserva:", { companionData, reservationId })

      if (!reservationId) {
        throw new Error("No se puede agregar acompañante sin ID de reserva")
      }

      const companionResponse = await createCompanion(companionData)
      console.log("👤 Respuesta de creación de acompañante:", companionResponse)

      if (!companionResponse?.idCompanions) {
        throw new Error("El servidor no devolvió un ID válido para el acompañante")
      }

      try {
        console.log("🔗 Asociando acompañante a reserva...")
        await addCompanionReservation(reservationId, { idCompanions: companionResponse.idCompanions })
        console.log("✅ Acompañante asociado exitosamente")
      } catch (Error) {
        console.error("❌ Error al asociar, eliminando acompañante creado...")
        await deleteCompanion(companionResponse.idCompanions).catch(() => {})
        throw new Error("Error al asociar acompañante a la reserva")
      }

      const savedCompanion = {
        ...companionData,
        idCompanions: companionResponse.idCompanions,
      }

      console.log("✅ Acompañante guardado completamente:", savedCompanion)

      setFormData((prev) => ({
        ...prev,
        companions: (prev.companions || []).map((c) =>
          c.documentNumber === companionData.documentNumber ? savedCompanion : c,
        ),
      }))

      return savedCompanion
    } catch (error) {
      console.error("❌ Error completo en handleSaveCompanionInReservation:", error)
      throw error
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    console.log("🚀 Iniciando proceso de guardado de reserva")
    console.log("📋 Estado actual del formulario:", {
      step,
      formData: {
        idUser: formData.idUser,
        idPlan: formData.idPlan,
        idCabin: formData.idCabin,
        idRoom: formData.idRoom,
        selectedServices: formData.selectedServices,
        companions: formData.companions?.length,
        hasCompanions: formData.hasCompanions,
      },
    })

    if (!validateStep(3, formData)) {
      console.log("❌ Validación del paso 3 falló")
      return
    }

    try {
      setLoading(true)

      // Usar la función de sanitización mejorada
      const payload = sanitizeDataForServer(formData)

      console.log("📦 Payload final para enviar:", payload)

      let resultado
      if (reservationData?.idReservation) {
        console.log("✏️ Actualizando reserva existente:", reservationData.idReservation)
        resultado = await updateReservation(reservationData.idReservation, payload)
      } else {
        console.log("➕ Creando nueva reserva")
        resultado = await createReservation(payload)
      }

      console.log("✅ Resultado de la operación de reserva:", resultado)

      if (!resultado?.idReservation) {
        throw new Error("No se recibió un ID de reserva válido del servidor")
      }

      // Guardar acompañantes si existen
      if (formData.hasCompanions && formData.companions && formData.companions.length > 0) {
        console.log("👥 Procesando acompañantes...")
        for (const companion of formData.companions) {
          if (!companion.idCompanions) {
            console.log("👤 Guardando acompañante sin ID:", companion)
            await handleSaveCompanionInReservation(companion, resultado.idReservation)
          } else {
            console.log("👤 Acompañante ya tiene ID, saltando:", companion.idCompanions)
          }
        }
        console.log("✅ Todos los acompañantes procesados")
      }

      // Guardar pagos temporales si existen
      if (tempPayments.length > 0) {
        console.log("💳 Procesando pagos temporales:", tempPayments.length)
        const paymentResults = await Promise.allSettled(
          tempPayments.map((payment) => {
            console.log("💳 Guardando pago temporal:", payment)
            return addPaymentToReservation({
              ...payment,
              idReservation: resultado.idReservation,
            })
          }),
        )

        console.log("💳 Resultados de pagos:", paymentResults)
        setTempPayments([])
      }

      console.log("🎉 Reserva guardada exitosamente")
      onClose()
      onSave(resultado)
    } catch (error) {
      console.error("❌ Error al guardar reserva:", error)
      alert(`Error al guardar: ${error.message}`)
    } finally {
      setLoading(false)
    }
  }

  // Cerrar modal al hacer clic fuera
  useEffect(() => {
    const handleClickOutside = (event) => {
      const modal = document.querySelector(".reservations-modal-container")
      if (modal && !modal.contains(event.target)) {
        onClose()
      }
    }

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside)
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [isOpen, onClose])

  if (!isOpen) return null

  const totalAmount = calculateTotal(formData, formData.planes || [])
  console.log("💰 Total calculado para mostrar:", totalAmount)
  console.log("📊 Estado completo de formData:", {
    step: step,
    companionCount: formData.companionCount,
    companions: formData.companions,
    hasCompanions: formData.hasCompanions,
    selectedServices: formData.selectedServices,
    idRoom: formData.idRoom,
    idCabin: formData.idCabin,
    errors: errors,
  })

  return (
    <div className="reservations-modal-overlay" onClick={(e) => e.stopPropagation()}>
      <div className="reservations-modal-container" onClick={(e) => e.stopPropagation()}>
        <div className="reservations-modal-header">
          <h2>{reservationData?.idReservation ? "Editar Reserva" : "Nueva Reserva"}</h2>
          <button
            className="reservations-close-button"
            onClick={onClose}
            type="button"
            aria-label="Cerrar"
            disabled={loading}
          >
            &times;
          </button>
        </div>

        <div className="steps-indicator">
          <div className={`step ${step === 1 ? "active" : ""}`}>1. Datos Reserva</div>
          {formData.hasCompanions && <div className={`step ${step === 2 ? "active" : ""}`}>2. Acompañantes</div>}
          <div className={`step ${step === (formData.hasCompanions ? 3 : 2) ? "active" : ""}`}>
            {formData.hasCompanions ? "3" : "2"}. Disponibilidad
          </div>
          <div className={`step ${step === (formData.hasCompanions ? 4 : 3) ? "active" : ""}`}>
            {formData.hasCompanions ? "4" : "3"}. Pagos
          </div>
        </div>

        <div className="reservations-modal-body">
          <form onSubmit={handleSubmit} noValidate>
            {step === 1 && (
              <BasicInfoStep
                formData={formData}
                errors={errors}
                users={formData.users || []}
                planes={formData.planes || []}
                loading={loading}
                isReadOnly={isReadOnly}
                onChange={handleChange}
              />
            )}

            {step === 2 && formData.hasCompanions && (
              <CompanionsStep
                formData={formData}
                errors={errors}
                loading={loading}
                isReadOnly={isReadOnly}
                onSaveCompanion={handleSaveCompanion}
                onDeleteCompanion={handleDeleteCompanion}
              />
            )}

            {step === (formData.hasCompanions ? 3 : 2) && (
              <AvailabilityStep
                formData={formData}
                errors={errors}
                loading={loading}
                onCabinSelect={handleCabinSelect}
                onRoomSelect={handleRoomSelect}
                onServiceToggle={handleServiceToggle}
              />
            )}

            {step === (formData.hasCompanions ? 4 : 3) && (
              <PaymentStep
                totalAmount={totalAmount}
                reservationPayments={reservationPayments}
                tempPayments={tempPayments}
                reservationData={reservationData}
                isReadOnly={isReadOnly}
                loading={loading}
                onPaymentSubmit={handleAddPayment}
              />
            )}

            <div className="modal-footer">
              {step > 1 && (
                <button type="button" className="reservations-cancel-btn" onClick={prevStep} disabled={loading}>
                  Anterior
                </button>
              )}

              {step < (formData.hasCompanions ? 4 : 3) && (
                <button type="button" className="submit-btn" onClick={nextStep} disabled={loading}>
                  {step === (formData.hasCompanions ? 3 : 2)
                    ? "Ir a Pagos"
                    : step === 2
                      ? "Verificar Disponibilidad"
                      : "Siguiente"}
                </button>
              )}

              {!isReadOnly && step === (formData.hasCompanions ? 4 : 3) && (
                <button type="button" className="btn btn-primary" disabled={loading} onClick={handleSubmit}>
                  {loading ? "Guardando..." : "Guardar Reserva"}
                </button>
              )}
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}

FormReservation.propTypes = {
  reservationData: PropTypes.object,
  onClose: PropTypes.func.isRequired,
  onSave: PropTypes.func.isRequired,
  isOpen: PropTypes.bool.isRequired,
  isReadOnly: PropTypes.bool,
}

export default FormReservation
