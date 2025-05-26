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
import { getUsers, getAllPlanes, getCabins, getBedrooms, getServices } from "../../../services/reservationsService"
import { getReservationPayments } from "../../../services/paymentsService"

function FormReservation({ reservationData = null, onClose, onSave, isOpen, isReadOnly = false }) {
  const [step, setStep] = useState(1)
  const [tempPayments, setTempPayments] = useState([])
  const [loading, setLoading] = useState(false)
  const [reservationPayments, setReservationPayments] = useState([])

  // ✅ CORREGIDO - Usar el hook correctamente
  const { formData, updateFormData, errors, validateStep } = useReservationForm(reservationData)

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
    const { name, value, type, checked } = e.target

    console.log("📝 HandleChange ejecutado:", { name, value, type, checked })

    // Actualización inmediata del estado
    setFormData((prev) => {
      let newData = { ...prev }

      // Manejar diferentes tipos de campos
      if (type === "checkbox") {
        newData[name] = checked

        // Si se desmarca hasCompanions, resetear acompañantes
        if (name === "hasCompanions" && !checked) {
          newData.companionCount = 0
          newData.companions = []
        }
        // Si se marca hasCompanions y no hay count, establecer 1
        else if (name === "hasCompanions" && checked && !newData.companionCount) {
          newData.companionCount = 1
        }
      } else {
        newData[name] = value
      }

      if (name === "idPlan") {
        const selectedPlan = formData.planes.find(p => p.idPlan === Number(value))
        if (selectedPlan && selectedPlan.name === "Día de sol") {
          // Para "Día de sol", la fecha fin es igual a la fecha inicio
          if (newData.startDate) {
            newData.endDate = newData.startDate
          }
          // Marcar el plan como sin alojamiento
          newData.requiresAccommodation = false
        } else {
          // Para otros planes, habilitar alojamiento
          newData.requiresAccommodation = true
        }
      }

      // Cuando cambia la fecha de inicio en un plan "Día de sol"
      if (name === "startDate") {
        const selectedPlan = formData.planes.find(p => p.idPlan === Number(newData.idPlan))
        if (selectedPlan && selectedPlan.name === "Día de sol") {
          newData.endDate = value // Sincronizar fecha fin con inicio
        }
      }

      // Aplicar lógica de disponibilidad cuando cambian campos relevantes
      if (name === "companionCount" || name === "hasCompanions") {
        console.log("👥 Actualizando disponibilidad por cambio en:", name)

        // Limpiar selecciones de alojamiento al cambiar número de huéspedes
        newData.idCabin = ""
        newData.idRoom = ""

        // Aplicar nueva disponibilidad
        newData = updateAvailability(newData)

        // Mostrar mensaje informativo
        const companionCount = newData.companionCount || 0
        let message = ""

        if (companionCount > 1) {
          const availableCabins = newData.availableCabins.length
          message =
            availableCabins > 0
              ? `🏠 Disponibles ${availableCabins} cabañas para ${companionCount + 1} Acompañantes`
              : `❌ No hay cabañas disponibles para ${companionCount + 1} Acompañantes`
        } else {
          const availableRooms = newData.availableBedrooms.length
          message =
            availableRooms > 0
              ? `🛏️ Disponibles ${availableRooms} habitaciones para ${companionCount + 1} Acompañantes`
              : `❌ No hay habitaciones disponibles`
        }

        console.log("💬 Mensaje de disponibilidad:", message)

        // Mostrar notificación
        setTimeout(() => {
          Switch({
            show: true,
            message: message,
            type: message.includes("❌") ? "error" : "success",
          })
        }, 100)
      }

      console.log("📝 Nuevo estado después del cambio:", {
        field: name,
        oldValue: prev[name],
        newValue: newData[name],
        companionCount: newData.companionCount,
        hasCompanions: newData.hasCompanions,
        availableCabins: newData.availableCabins?.length,
        availableBedrooms: newData.availableBedrooms?.length,
      })

      return newData
    })

    clearError(name)
  }

  // ✅ ACTUALIZAR HANDLERS PARA INCLUIR CANTIDADES DE SERVICIOS
  const { handleCabinSelect, handleRoomSelect, handleServiceToggle, handleServiceQuantityChange } = createSelectionHandlers(setFormData)

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
        await deleteCompanion(companionResponse.idCompanions).catch(() => { })
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

  // ✅ CARGAR DATOS INICIALES Y DEL SERVIDOR
  useEffect(() => {
    const loadInitialData = async () => {
      try {
        setLoading(true)
        console.log("🔄 Cargando datos iniciales...")

        // Cargar datos del servidor
        const [usersData, planesData, cabinsData, bedroomsData, servicesData] = await Promise.all([
          getUsers(),
          getAllPlanes(),
          getCabins(),
          getBedrooms(),
          getServices(),
        ])

        console.log("📊 Datos cargados del servidor:", {
          users: usersData?.length,
          planes: planesData?.length,
          cabins: cabinsData?.length,
          bedrooms: bedroomsData?.length,
          services: servicesData?.length,
        })

        // Filtrar solo elementos en servicio
        const activeCabins = cabinsData?.filter((cabin) => cabin.status?.toLowerCase() === "en servicio") || []
        const activeBedrooms = bedroomsData?.filter((bedroom) => bedroom.status?.toLowerCase() === "en servicio") || []

        // Actualizar formData con los datos del servidor
        updateFormData((prevData) => {
          const newData = {
            ...prevData,
            users: usersData || [],
            planes: planesData || [],
            cabins: cabinsData || [],
            bedrooms: bedroomsData || [],
            availableServices: servicesData || [],
          }

          // Aplicar lógica de disponibilidad basada en el número de acompañantes
          const updatedWithAvailability = updateAvailability({
            ...newData,
            // Usar los datos filtrados para la disponibilidad
            cabins: activeCabins,
            bedrooms: activeBedrooms,
          })

          console.log("🏨 Disponibilidad inicial aplicada:", {
            companionCount: updatedWithAvailability.companionCount,
            availableCabins: updatedWithAvailability.availableCabins?.length,
            availableBedrooms: updatedWithAvailability.availableBedrooms?.length,
          })

          return updatedWithAvailability
        })

        // Si hay datos de reserva para editar, cargar información adicional
        if (reservationData?.idReservation) {
          console.log("✏️ Modo edición - Cargando datos de reserva:", reservationData.idReservation)

          // Cargar pagos de la reserva
          try {
            const payments = await getReservationPayments(reservationData.idReservation)
            setReservationPayments(Array.isArray(payments) ? payments : [])
            console.log("💳 Pagos cargados:", payments?.length || 0)
          } catch (error) {
            console.error("❌ Error cargando pagos:", error)
            setReservationPayments([])
          }

          console.log("✅ Datos de edición cargados correctamente")
        } else {
          console.log("➕ Modo creación - Nueva reserva")
        }
      } catch (error) {
        console.error("❌ Error cargando datos iniciales:", error)
        alert(`Error al cargar datos: ${error.message}`)
      } finally {
        setLoading(false)
      }
    }

    if (isOpen) {
      loadInitialData()
    }
  }, [isOpen, reservationData?.idReservation])

  // ✅ SINCRONIZAR DATOS CUANDO CAMBIA reservationData
  useEffect(() => {
    if (reservationData && isOpen) {
      console.log("🔄 Sincronizando datos de reserva para edición:", reservationData)

      // Actualizar formData con los datos de la reserva
      updateFormData({
        idUser: reservationData.idUser || reservationData.user?.idUser || "",
        idPlan: reservationData.idPlan || reservationData.plan?.idPlan || "",
        startDate: reservationData.startDate || "",
        endDate: reservationData.endDate || "",
        status: reservationData.status || "Pendiente",
        hasCompanions: reservationData.companions ? reservationData.companions.length > 0 : false,
        companionCount: reservationData.companions ? reservationData.companions.length : 0,
        companions: reservationData.companions || [],
        idCabin:
          reservationData.idCabin ||
          (reservationData.cabins && reservationData.cabins.length > 0 ? reservationData.cabins[0].idCabin : ""),
        idRoom:
          reservationData.idRoom ||
          (reservationData.bedrooms && reservationData.bedrooms.length > 0 ? reservationData.bedrooms[0].idRoom : ""),
        // ✅ CARGAR SERVICIOS CON CANTIDADES
        selectedServices: reservationData.services
          ? reservationData.services.map((s) => ({
            serviceId: s.Id_Service,
            quantity: s.quantity || 1
          }))
          : [],
      })

      console.log("✅ Datos sincronizados para edición")
    }
  }, [reservationData, isOpen])

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
                onServiceQuantityChange={handleServiceQuantityChange}
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
