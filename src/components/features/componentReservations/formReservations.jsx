"use client"

import { useState, useEffect, useRef } from "react"
import { toast } from "react-toastify"
import { X } from "lucide-react"
import PropTypes from "prop-types"
import "./componentsReservations.css"

import useReservationForm from "./reservationHooks"
import { BasicInfoStep, CompanionsStep, AvailabilityStep } from "./reservationSteps"
import { createReservation, updateReservation, addCompanionReservation } from "../../../services/reservationsService"
import { createCompanion, deleteCompanion } from "../../../services/companionsService"
import { getUsers, getAllPlanes, getCabins, getBedrooms, getServices } from "../../../services/reservationsService"
import { getReservationPayments, addPaymentToReservationWithId } from "../../../services/paymentsService"
import { useAlert } from "../../../context/AlertContext"
import PaymentForm from "../componentPayments/formPayments"
import { calculateTotal } from "./reservationUtils" // <-- asegúrate de importar esto
import { createSelectionHandlers, updateAvailability, planHasAccommodation } from "./reservationUtils" // <-- importa si son utilidades propias

function FormReservation({
  reservationData = null,
  onClose,
  onSave,
  isOpen,
  isReadOnly = false,
  preloadedData = null,
}) {
  const {
    formData,
    updateFormData,
    errors,
    setFieldError,
    validateStep, // <-- agrégalo aquí
  } = useReservationForm(reservationData || preloadedData)

  const [step, setStep] = useState(1)
  const [tempPayments, setTempPayments] = useState([])
  const [loading, setLoading] = useState(false)
  const [reservationPayments, setReservationPayments] = useState([])
  const [isAlertActive, setIsAlertActive] = useState(false)
  const [isPaymentProcessing, setIsPaymentProcessing] = useState(false)
  const [paymentsKey, setPaymentsKey] = useState(0);
  const [planes, setPlanes] = useState([]);
  const modalRef = useRef(null)

  const isClientMode = preloadedData?.isClientMode || false
  const clientUser = preloadedData?.user || null
  const { showAlert } = useAlert()

  // Simplemente usa updateFormData directamente
  const setFormData = updateFormData

  const clearError = (fieldName) => {
    updateFormData((prev) => ({
      ...prev,
      errors: {
        ...prev.errors,
        [fieldName]: null,
      },
    }))
  }

  // Mantener toda la lógica de debug original
  const debugCompanionsState = () => {
    console.log("🔍 === ESTADO ACTUAL DE ACOMPAÑANTES ===")
    console.log("hasCompanions:", formData.hasCompanions)
    console.log("companionCount:", formData.companionCount)
    console.log("companions array:", formData.companions)
    console.log("companions length:", formData.companions?.length)
    console.log(
      "companions data:",
      formData.companions?.map((c) => ({
        name: c.name,
        document: c.documentNumber,
        id: c.id || c.idCompanions,
        isTemp: c.isTemporary || c.isTemp,
      })),
    )
  }

  useEffect(() => {
    debugCompanionsState()
  }, [formData.companions, formData.companionCount])

  // Mantener toda la lógica de filtrado original
  const filterAccommodationsByCapacity = (accommodations, totalPeople, defaultCapacity) => {
    if (!accommodations || !Array.isArray(accommodations)) return []

    return accommodations.filter((item) => {
      const capacity = item.capacity || item.maxCapacity || defaultCapacity
      const isAvailable = item.status?.toLowerCase() === "en servicio"
      const hasCapacity = capacity >= totalPeople

      return isAvailable && hasCapacity
    })
  }

  // Validación de campo individual (puedes moverla a utils si prefieres)
  const validateReservationField = (name, value, data) => {
    let error = ""
    switch (name) {
      case "idUser":
        if (!value) error = "Cliente es requerido"
        break
      case "idPlan":
        if (!value) error = "Plan es requerido"
        break
      case "startDate":
        if (!value) error = "Fecha de inicio es requerida"
        break
      case "endDate":
        if (!value) error = "Fecha de fin es requerida"
        break
      case "companionCount":
        if (data.hasCompanions && (!value || value < 1)) error = "Debe especificar al menos 1 acompañante"
        break

      default:
        break
    }
    return error
  }

  // Handler de cambio con validación en tiempo real
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    updateFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }))

    // Validación en tiempo real
    const error = validateReservationField(name, type === "checkbox" ? checked : value, formData)
    setFieldError(name, error)
  }

  // Mantener todos los handlers originales
  const { handleCabinSelect, handleRoomSelect, handleServiceToggle, handleServiceQuantityChange } =
    createSelectionHandlers(setFormData)

  // Mantener toda la lógica de navegación original
  const nextStep = () => {
    const isValid = validateStep(step, formData)

    if (isValid) {
      if (step === 1 && !formData.hasCompanions) {
        setStep(3)
      } else {
        setStep(step + 1)
      }
    } else {
      toast.error("Por favor, complete todos los campos requeridos", {
        position: "top-right",
        autoClose: 5000,
      })
    }
  }

  const prevStep = () => {
    if (step === 4 && !formData.hasCompanions) {
      setStep(1)
    } else if (step === 3 && !formData.hasCompanions) {
      setStep(1)
    } else {
      setStep(step - 1)
    }
  }

  // Mantener toda la lógica de alertas original
  const showAlertWithTracking = (alertConfig) => {
    setIsAlertActive(true)

    const originalOnConfirm = alertConfig.onConfirm
    const originalOnCancel = alertConfig.onCancel

    showAlert({
      ...alertConfig,
      onConfirm: (...args) => {
        setIsAlertActive(false)
        if (originalOnConfirm) {
          originalOnConfirm(...args)
        }
      },
      onCancel: (...args) => {
        setIsAlertActive(false)
        if (originalOnCancel) {
          originalOnCancel(...args)
        }
      },
    })
  }

  // Mantener toda la lógica de acompañantes original
  const handleSaveCompanion = (newCompanion) => {
    console.log("💾 === GUARDANDO ACOMPAÑANTE ===")
    console.log("📋 Datos recibidos:", newCompanion)

    try {
      if (!newCompanion.name || !newCompanion.documentNumber) {
        throw new Error("Datos del acompañante incompletos")
      }

      const existingCompanion = formData.companions?.find((c) => c.documentNumber === newCompanion.documentNumber)

      if (existingCompanion) {
        toast.error(`Ya existe un acompañante con el documento ${newCompanion.documentNumber}`)
        return
      }

      const currentCount = formData.companions?.length || 0
      const maxCount = Number.parseInt(formData.companionCount) || 0

      if (currentCount >= maxCount) {
        toast.error(`No se pueden agregar más acompañantes. Límite: ${maxCount}`)
        return
      }

      const companionWithId = {
        ...newCompanion,
        id: newCompanion.tempId || `temp-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
        isTemporary: true,
      }

      console.log("📝 Acompañante preparado:", companionWithId)

      setFormData((prev) => {
        const updatedCompanions = [...(prev.companions || []), companionWithId]

        console.log("📊 Estado actualizado:")
        console.log("- Companions antes:", prev.companions?.length || 0)
        console.log("- Companions después:", updatedCompanions.length)
        console.log("- Nuevo acompañante:", companionWithId.name)

        return {
          ...prev,
          companions: updatedCompanions,
        }
      })

      toast.success(`Acompañante ${companionWithId.name} agregado correctamente`, {
        position: "top-right",
        autoClose: 3000,
      })

      console.log("✅ Acompañante agregado exitosamente")
    } catch (error) {
      console.error("❌ Error al agregar acompañante:", error)
      toast.error(`Error al agregar acompañante: ${error.message}`)
    }
  }

  const handleDeleteCompanion = (idOrDocNumber) => {
    if (isReadOnly || loading) return

    console.log("🗑️ === ELIMINANDO ACOMPAÑANTE ===")
    console.log("🆔 Identificador:", idOrDocNumber)

    const companion = formData.companions?.find(
      (c) =>
        c.idCompanions === idOrDocNumber ||
        c.documentNumber === idOrDocNumber ||
        c.id === idOrDocNumber ||
        c.tempId === idOrDocNumber,
    )

    if (!companion) {
      toast.error("Acompañante no encontrado")
      return
    }

    const companionName = companion.name || "este acompañante"

    showAlertWithTracking({
      type: "confirm-delete",
      title: "Eliminar Acompañante",
      message: `¿Está seguro de eliminar a ${companionName} de la reserva?`,
      confirmText: "Sí, Eliminar",
      onConfirm: () => {
        console.log("🗑️ Confirmado - eliminando acompañante:", companionName)

        setFormData((prev) => {
          const filteredCompanions = (prev.companions || []).filter(
            (c) =>
              c.idCompanions !== idOrDocNumber &&
              c.documentNumber !== idOrDocNumber &&
              c.id !== idOrDocNumber &&
              c.tempId !== idOrDocNumber,
          )

          console.log("📊 Companions después de eliminar:", filteredCompanions.length)

          return {
            ...prev,
            companions: filteredCompanions,
          }
        })

        toast.success(`Acompañante ${companionName} eliminado correctamente`, {
          position: "top-right",
          autoClose: 4000,
        })
      },
    })
  }

  // Mantener toda la lógica de pagos original
  const handleAddPayment = async (paymentDataOrFormData) => {
    setIsPaymentProcessing(true)

    try {
      if (reservationData?.idReservation) {
        const savedPayment = await addPaymentToReservationWithId(reservationData.idReservation, paymentDataOrFormData)
        setReservationPayments((prev) => [...prev, savedPayment])
        toast.success("Pago agregado correctamente", {
          position: "top-right",
          autoClose: 5000,
        })
        setPaymentsKey(prev => prev + 1) // <--- Usa el setter aquí
        return savedPayment
      } else {
        let paymentData

        if (paymentDataOrFormData instanceof FormData) {
          const rawAmount = paymentDataOrFormData.get("amount")

          if (!rawAmount || rawAmount === "" || rawAmount === "null" || rawAmount === "undefined") {
            throw new Error("El monto del pago es requerido")
          }

          let cleanAmount = rawAmount
          if (typeof cleanAmount === "string") {
            cleanAmount = cleanAmount.replace(/,/g, "").replace(/\s/g, "").trim()
          }

          const amount = Number.parseFloat(cleanAmount)

          if (isNaN(amount) || amount <= 0) {
            throw new Error(`El monto del pago no es válido: ${amount}`)
          }

          paymentData = {
            paymentMethod: paymentDataOrFormData.get("paymentMethod"),
            paymentDate: paymentDataOrFormData.get("paymentDate"),
            amount: amount,
            status: paymentDataOrFormData.get("status") || "Pendiente",
            voucher: paymentDataOrFormData.get("voucher"),
          }
        } else {
          const rawAmount = paymentDataOrFormData.amount

          if (!rawAmount && rawAmount !== 0) {
            throw new Error("El monto del pago es requerido")
          }

          const amount = Number.parseFloat(rawAmount)

          if (isNaN(amount) || amount <= 0) {
            throw new Error(`El monto del pago no es válido: ${amount}`)
          }

          paymentData = {
            ...paymentDataOrFormData,
            amount: amount,
          }
        }

        const tempPayment = {
          ...paymentData,
          tempId: `temp-${Date.now()}`,
          isTemp: true,
        }

        setTempPayments((prev) => {
          const newPayments = [...prev, tempPayment]
          return newPayments
        })

        return tempPayment
      }
    } catch (error) {
      console.error("❌ handleAddPayment ERROR:", error.message)
      throw error
    } finally {
      setIsPaymentProcessing(false)
    }
  }

  // Mantener toda la lógica de guardado en servidor original
  const saveCompanionsToServer = async (reservationId, companions) => {
    console.log("🌐 === GUARDANDO ACOMPAÑANTES EN SERVIDOR ===")
    console.log("🏨 Reservation ID:", reservationId)
    console.log("👥 Total companions:", companions.length)

    const results = []
    const errors = []
    let companionResponse = null

    for (const [index, companion] of companions.entries()) {
      try {
        if (companion.isTemporary || companion.id?.startsWith("temp-") || companion.tempId) {
          console.log(`\n👤 === PROCESANDO ACOMPAÑANTE ${index + 1}/${companions.length} ===`)
          console.log(`📝 Nombre: ${companion.name}`)
          console.log(`🆔 Documento: ${companion.documentNumber}`)

          const { ...cleanCompanionData } = companion
          console.log("📤 Datos limpios para servidor:", cleanCompanionData)

          console.log("1️⃣ Creando acompañante en servidor...")
          companionResponse = await createCompanion(cleanCompanionData)
          console.log("✅ Acompañante creado:", companionResponse)

          if (!companionResponse?.idCompanions) {
            throw new Error("El servidor no devolvió un ID válido para el acompañante")
          }

          console.log("2️⃣ Asociando acompañante a la reserva...")
          const associationData = {
            idCompanions: companionResponse.idCompanions,
          }

          const associationResponse = await addCompanionReservation(reservationId, associationData)
          console.log("✅ Asociación exitosa:", associationResponse)

          const finalCompanion = {
            ...companion,
            idCompanions: companionResponse.idCompanions,
            isTemporary: false,
            id: undefined,
            tempId: undefined,
            isTemp: undefined,
          }

          results.push(finalCompanion)
          console.log(`✅ Acompañante ${index + 1} procesado correctamente`)
        } else if (companion.idCompanions) {
          console.log(`⏭️ Acompañante ${index + 1} ya existe en servidor (ID: ${companion.idCompanions})`)
          results.push(companion)
        } else {
          console.log(`⚠️ Acompañante ${index + 1} sin ID válido, saltando...`)
        }
      } catch (error) {
        console.error(`❌ Error con acompañante ${index + 1}:`, error)
        errors.push({
          index: index + 1,
          companion: companion.name || `Acompañante ${index + 1}`,
          error: error.message,
          fullError: error,
        })

        if (error.message.includes("asociar") && companionResponse?.idCompanions) {
          console.log("🔄 Haciendo rollback del acompañante creado...")
          try {
            await deleteCompanion(companionResponse.idCompanions)
            console.log("✅ Rollback completado")
          } catch (rollbackError) {
            console.error("❌ Error en rollback:", rollbackError)
          }
        }
      }
    }

    console.log("\n📊 === RESUMEN FINAL ===")
    console.log(`✅ Exitosos: ${results.length}`)
    console.log(`❌ Errores: ${errors.length}`)

    return { results, errors }
  }
console.log("Valor de endDate en formData:", formData.endDate);
  // Mantener toda la lógica de sanitización original
  const sanitizeDataForServer = (data, planes) => {
    const payload = {
      idUser: Number(data.idUser),
      idPlan: Number(data.idPlan),
      startDate: data.startDate,
      endDate: data.endDate,
      status: data.status || "Reservado",
    };

    if (data.idCabin) {
      payload.idCabin = Number(data.idCabin);
    } else if (data.idRoom) {
      payload.idRoom = Number(data.idRoom);
    }

    if (
      data.selectedServices &&
      Array.isArray(data.selectedServices) &&
      data.selectedServices.length > 0
    ) {
      payload.services = data.selectedServices.map((service) => ({
        serviceId: Number(service.serviceId),
        quantity: Number(service.quantity) || 1,
      }));
    }

    // Usa la lista de planes pasada como argumento
    const selectedPlan =
      (planes || []).find((p) => p.idPlan === Number(data.idPlan)) || {};

    if (!planHasAccommodation(selectedPlan)) {
      delete payload.endDate;
    }

    return payload;
  }

  // Mantener toda la lógica de submit original
  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!validateStep(3, formData)) {
      toast.error("Por favor, complete todos los campos requeridos", {
        position: "top-right",
        autoClose: 5000,
      })
      return
    }

    // Agrega este log antes de armar el payload
    console.log("Valor de endDate en formData antes de enviar:", formData.endDate);

    const totalAmount = calculateTotal(formData, formData.planes || [])
    const clientName = formData.users?.find((u) => u.idUser === Number(formData.idUser))?.name || "Cliente"
    const planName = formData.planes?.find((p) => p.idPlan === Number(formData.idPlan))?.name || "Plan"

    showAlertWithTracking({
      type: "confirm-edit",
      title: reservationData?.idReservation ? "Actualizar Reserva" : "Crear Reserva",
      message: `¿Confirma ${reservationData?.idReservation ? "actualizar" : "crear"} la reserva para ${clientName} con el plan ${planName} por un total de $${totalAmount.toLocaleString()}?`,
      confirmText: reservationData?.idReservation ? "Sí, Actualizar" : "Sí, Crear",
      onConfirm: async () => {
        try {
          setLoading(true)

          const payload = sanitizeDataForServer(formData, formData.planes || [])

          const selectedPlan = (formData.planes || []).find(p => p.idPlan === Number(formData.idPlan));
          console.log("Planes disponibles:", formData.planes || []);
          console.log("Plan seleccionado:", selectedPlan);
          console.log("¿Tiene alojamiento?:", planHasAccommodation(selectedPlan));
          console.log("Payload enviado:", payload);

          let resultado
          if (reservationData?.idReservation) {
            resultado = await updateReservation(reservationData.idReservation, payload)
            toast.success("Reserva actualizada correctamente", {
              position: "top-right",
              autoClose: 5000,
            })
          } else {
            resultado = await createReservation(payload)
            toast.success("Reserva creada correctamente", {
              position: "top-right",
              autoClose: 5000,
            })
          }

          if (!resultado?.idReservation) {
            throw new Error("No se recibió un ID de reserva válido del servidor")
          }

          if (formData.hasCompanions && formData.companions && formData.companions.length > 0) {
            console.log("👥 === PROCESANDO ACOMPAÑANTES ===")

            const { results, errors } = await saveCompanionsToServer(resultado.idReservation, formData.companions)

            if (results.length > 0) {
              setFormData((prev) => ({
                ...prev,
                companions: results,
              }))
            }

            if (results.length > 0) {
              toast.success(`${results.length} acompañante(s) guardado(s) correctamente`, {
                position: "top-right",
                autoClose: 4000,
              })
            }

            if (errors.length > 0) {
              console.error("❌ Errores al guardar acompañantes:", errors)
              errors.forEach(({ companion, error }) => {
                toast.error(`Error con ${companion}: ${error}`, {
                  position: "top-right",
                  autoClose: 8000,
                })
              })
            }
          }

          if (tempPayments.length > 0) {
            console.log("💳 Procesando pagos temporales:", tempPayments.length)

            // Supón que esto va después de crear la reserva y obtener el idReservation
            const paymentResults = await Promise.allSettled(
              tempPayments.map((payment) => {
                const cleanPayment = { ...payment };
                delete cleanPayment.tempId;
                delete cleanPayment.isTemp;

                // Si hay comprobante (voucher) y es un archivo, usa FormData
                if (cleanPayment.voucher instanceof File) {
                  const formData = new FormData();
                  Object.entries(cleanPayment).forEach(([key, value]) => {
                    // Solo agrega si no es undefined ni null
                    if (value !== undefined && value !== null) {
                      formData.append(key, value);
                    }
                  });
                  // El servicio ya agrega idReservation si es necesario
                  return addPaymentToReservationWithId(resultado.idReservation, formData);
                } else {
                  return addPaymentToReservationWithId(resultado.idReservation, cleanPayment);
                }
              }),
            )

            setTempPayments([])

            const successfulPayments = paymentResults.filter((result) => result.status === "fulfilled").length
            const failedPayments = paymentResults.filter((result) => result.status === "rejected").length

            if (successfulPayments > 0) {
              toast.success(`${successfulPayments} pago(s) procesado(s) correctamente`, {
                position: "top-right",
                autoClose: 4000,
              })
            }

            if (failedPayments > 0) {
              toast.error(`Error con ${failedPayments} pago(s)`, {
                position: "top-right",
                autoClose: 4000,
              })
            }
          }

          if (planHasAccommodation(selectedPlan) && !formData.endDate) {
  toast.error("La fecha de fin es obligatoria para este plan.");
  setLoading(false);
  return;
}

          setLoading(false)
          onSave(resultado)
          onClose()
        } catch (error) {
          console.error("❌ Error al guardar:", error)
          toast.error(`Error al guardar: ${error.message}`, {
            position: "top-right",
            autoClose: 5000,
          })
          setLoading(false)
        }
      },
    })
  }

  // Mantener toda la lógica de cierre original
  const handleClose = () => {
    if (step === (formData.hasCompanions ? 4 : 3)) {
      toast.info("Complete el proceso de pago o use el botón 'Guardar Reserva'", {
        position: "top-right",
        autoClose: 4000,
      })
      return
    }

    if (isAlertActive) {
      return
    }

    if (isPaymentProcessing) {
      return
    }

    if (loading) {
      toast.warning("No se puede cerrar mientras se procesa la reserva", {
        position: "top-right",
        autoClose: 4000,
      })
      return
    }

    const hasUnsavedFormData =
      formData.idUser ||
      formData.idPlan ||
      formData.startDate ||
      formData.endDate ||
      (formData.companions && formData.companions.length > 0)

    if (hasUnsavedFormData && !reservationData?.idReservation) {
      showAlertWithTracking({
        type: "confirm-delete",
        title: "Cerrar Formulario",
        message: "¿Está seguro de cerrar? Los datos no guardados se perderán.",
        confirmText: "Sí, Cerrar",
        onConfirm: () => {
          setTempPayments([])
          onClose()
        },
      })
    } else {
      onClose()
    }
  }

  // Mantener todos los useEffect originales
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        modalRef.current &&
        !modalRef.current.contains(event.target) &&
        event.target.classList.contains("reservation-modal-overlay")
      ) {
        handleClose("click-outside")
      }
    }

    const handleEscapeKey = (event) => {
      if (event.key === "Escape") {
        handleClose("escape-key")
      }
    }

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside)
      document.addEventListener("keydown", handleEscapeKey)
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
      document.removeEventListener("keydown", handleEscapeKey)
    }
  }, [isOpen, loading, isAlertActive, isPaymentProcessing, step, formData.hasCompanions])

  useEffect(() => {}, [tempPayments])

  useEffect(() => {}, [reservationPayments])

  useEffect(() => {
    const loadInitialData = async () => {
      try {
        setLoading(true)

        if (preloadedData) {
          updateFormData((prevData) => {
            const newData = {
              ...prevData,
              users: preloadedData.users || (isClientMode ? [clientUser] : []),
              planes: preloadedData.plans || [],
              cabins: preloadedData.cabins || [],
              bedrooms: preloadedData.bedrooms || [],
              availableServices: preloadedData.services || [],
              idUser: isClientMode ? clientUser?.idUser || "" : prevData.idUser,
            }

            const updatedWithAvailability = updateAvailability(newData)
            return updatedWithAvailability
          })
        } else {
          const [usersData, planesData, cabinsData, bedroomsData, servicesData] = await Promise.all([
            getUsers(),
            getAllPlanes(),
            getCabins(),
            getBedrooms(),
            getServices(),
          ])

          const activeCabins = cabinsData?.filter((cabin) => cabin.status?.toLowerCase() === "en servicio") || []
          const activeBedrooms =
            bedroomsData?.filter((bedroom) => bedroom.status?.toLowerCase() === "en servicio") || []

          updateFormData((prevData) => {
            const newData = {
              ...prevData,
              users: usersData || [],
              planes: planesData || [],
              cabins: cabinsData || [],
              bedrooms: bedroomsData || [],
              availableServices: servicesData || [],
            }

            const updatedWithAvailability = updateAvailability({
              ...newData,
              cabins: activeCabins,
              bedrooms: activeBedrooms,
            })

            return updatedWithAvailability
          })
        }

        if (reservationData?.idReservation) {
          try {
            const payments = await getReservationPayments(reservationData.idReservation)
            setReservationPayments(Array.isArray(payments) ? payments : [])
          } catch (error) {
            console.error("❌ Error al cargar pagos de reserva:", error)
            setReservationPayments([])
            toast.warning("No se pudieron cargar los pagos existentes", {
              position: "top-right",
              autoClose: 4000,
            })
          }
        }
      } catch (error) {
        console.error("❌ Error al cargar datos:", error)
        toast.error(`Error al cargar datos: ${error.message}`, {
          position: "top-right",
          autoClose: 4000,
        })
      } finally {
        setLoading(false)
      }
    }

    if (isOpen) {
      loadInitialData()
    }
  }, [isOpen, reservationData?.idReservation, preloadedData, isClientMode, clientUser])

  useEffect(() => {
    if (reservationData && isOpen) {
      updateFormData({
        idUser:
          reservationData.idUser || reservationData.user?.idUser || (isClientMode ? clientUser?.idUser || "" : ""),
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
        selectedServices: reservationData.services
          ? reservationData.services.map((s) => ({
              serviceId: s.Id_Service,
              quantity: s.quantity || 1,
            }))
          : [],
      })
    }
  }, [reservationData, isOpen, isClientMode, clientUser])

  useEffect(() => {
    if (isOpen && !reservationData) {
      updateFormData({
        idUser: "",
        idPlan: "",
        startDate: "",
        endDate: "",
        status: "Pendiente",
        hasCompanions: false,
        companionCount: 0,
        companions: [],
        idCabin: "",
        idRoom: "",
        selectedServices: [],
        // Agrega aquí otros campos que uses en tu formulario
      });
      setFieldError({});
      setStep(1); // Opcional: vuelve al primer paso del formulario
      setTempPayments([]);
      setReservationPayments([]);
    }
  }, [isOpen, reservationData]);

  if (!isOpen) return null

  const totalAmount = calculateTotal(formData, formData.planes || [])

  return (
    <div className="reservation-modal-overlay">
      <div className="reservation-modal-container" ref={modalRef}>
        <div className="reservation-modal-header">
          <h2 className="reservation-modal-title">
            {reservationData?.idReservation ? "Editar Reserva" : "Nueva Reserva"}
          </h2>
          <button
            className="reservation-close-button"
            onClick={() => handleClose("close-button")}
            type="button"
            aria-label="Cerrar"
            disabled={loading || isAlertActive || isPaymentProcessing}
            title={
              loading
                ? "Guardando datos..."
                : isAlertActive
                  ? "Hay una alerta activa"
                  : isPaymentProcessing
                    ? "Procesando pago..."
                    : "Cerrar"
            }
          >
            {loading ? "..." : <X size={24} />}
          </button>
        </div>

        {/* CAMBIO VISUAL: Sistema de pestañas limpio */}
        <div className="reservation-tabs-container">
          <ul className="reservation-tabs">
            <li className={`reservation-tab ${step === 1 ? "active" : ""}`}>Información Básica</li>
            {formData.hasCompanions && (
              <li className={`reservation-tab ${step === 2 ? "active" : ""}`}>Acompañantes</li>
            )}
            <li className={`reservation-tab ${step === (formData.hasCompanions ? 3 : 2) ? "active" : ""}`}>
              Disponibilidad
            </li>
            <li className={`reservation-tab ${step === (formData.hasCompanions ? 4 : 3) ? "active" : ""}`}>Pagos</li>
          </ul>
        </div>

        <div className="reservation-modal-body">
          <form onSubmit={handleSubmit} noValidate>
            {/* CAMBIO VISUAL: Contenido directo sin contenedores extra */}
            {step === 1 && (
              <div className="reservation-tab-content active">
                <BasicInfoStep
                  formData={formData}
                  errors={errors}
                  users={formData.users || []}
                  planes={formData.planes || []}
                  loading={loading}
                  isReadOnly={isReadOnly}
                  onChange={handleChange}
                  isClientMode={isClientMode}
                  clientUser={clientUser}
                />
              </div>
            )}

            {step === 2 && formData.hasCompanions && (
              <div className="reservation-tab-content active">
                <CompanionsStep
                  formData={formData}
                  errors={errors}
                  loading={loading}
                  isReadOnly={isReadOnly}
                  onSaveCompanion={handleSaveCompanion}
                  onDeleteCompanion={handleDeleteCompanion}
                />
              </div>
            )}

            {step === (formData.hasCompanions ? 3 : 2) && (
              <div className="reservation-tab-content active">
                <AvailabilityStep
                  formData={formData}
                  errors={errors}
                  loading={loading}
                  onCabinSelect={handleCabinSelect}
                  onRoomSelect={handleRoomSelect}
                  onServiceToggle={handleServiceToggle}
                  onServiceQuantityChange={handleServiceQuantityChange}
                />
              </div>
            )}

            {step === (formData.hasCompanions ? 4 : 3) && (
              <div className="reservation-tab-content active">
                <PaymentForm
                  totalAmount={totalAmount}
                  onPaymentSubmit={handleAddPayment}
                  isViewMode={isReadOnly}
                  key={paymentsKey} // Agregar key aquí
                />
              </div>
            )}

            <div className="reservation-modal-footer">
              {step > 1 && (
                <button type="button" className="reservation-cancel-button" onClick={prevStep} disabled={loading}>
                  Anterior
                </button>
              )}

              {step < (formData.hasCompanions ? 4 : 3) && (
                <button type="button" className="reservation-submit-button" onClick={nextStep} disabled={loading}>
                  {step === (formData.hasCompanions ? 3 : 2)
                    ? "Ir a Pagos"
                    : step === 2
                      ? "Verificar Disponibilidad"
                      : "Siguiente"}
                </button>
              )}

              {!isReadOnly && step === (formData.hasCompanions ? 4 : 3) && (
                <button
                  type="button"
                  className={`reservation-submit-button ${loading ? "loading" : ""}`}
                  disabled={loading}
                  onClick={handleSubmit}
                >
                  {loading ? (
                    <>
                      <span className="loading-spinner"></span>
                      {reservationData?.idReservation ? "Actualizando..." : "Guardando..."}
                    </>
                  ) : reservationData?.idReservation ? (
                    "Actualizar Reserva"
                  ) : (
                    "Guardar Reserva"
                  )}
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
  preloadedData: PropTypes.object,
}

export default FormReservation
