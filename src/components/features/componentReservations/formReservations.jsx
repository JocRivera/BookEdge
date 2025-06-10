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
import { calculateTotal } from "./reservationUtils"
import { createSelectionHandlers, updateAvailability, planHasAccommodation } from "./reservationUtils"

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
    validateStep,
  } = useReservationForm(reservationData || preloadedData)

  const [step, setStep] = useState(1)
  const [tempPayments, setTempPayments] = useState([])
  const [loading, setLoading] = useState(false)
  const [reservationPayments, setReservationPayments] = useState([])
  const [isAlertActive, setIsAlertActive] = useState(false)
  const [isPaymentProcessing, setIsPaymentProcessing] = useState(false)
  const [paymentsKey, setPaymentsKey] = useState(0)
  const modalRef = useRef(null)
  const [allCabins, setAllCabins] = useState([])
  const [allBedrooms, setAllBedrooms] = useState([])

  const isClientMode = preloadedData?.isClientMode || false
  const clientUser = preloadedData?.user || null
  const { showAlert } = useAlert()

  const setFormData = updateFormData

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

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    updateFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));

    // Validación personalizada de acompañantes según el plan
    if (name === "companionCount") {
      const selectedPlan = (formData.planes || []).find(
        (p) => p.idPlan === Number(formData.idPlan)
      );
      // Ejemplo: tu plan especial tiene idPlan === 99 (ajusta según tu base de datos)
      const isPlanEspecial = selectedPlan && selectedPlan.capacidadMaxima === 30; // o usa un idPlan específico
      const maxAcompanantes = isPlanEspecial ? 30 : 6;
      if (Number(value) > maxAcompanantes) {
        toast.error(
          isPlanEspecial
            ? "El máximo permitido para este plan es 30 acompañantes."
            : "El máximo permitido para este plan es 6 acompañantes.",
          {
            position: "top-right",
            autoClose: 5000,
          }
        );
        setFieldError("companionCount", `Máximo ${maxAcompanantes} acompañantes permitidos para este plan`);
      } else {
        setFieldError("companionCount", "");
      }
    } else {
      const error = validateReservationField(name, type === "checkbox" ? checked : value, formData);
      setFieldError(name, error);
    }
  }

  const { handleCabinSelect, handleRoomSelect, handleServiceToggle, handleServiceQuantityChange } =
    createSelectionHandlers(setFormData)

  // Cambia la lógica de navegación de pasos:
  const nextStep = () => {
    const errors = validateStep(step, formData);
    if (Object.keys(errors).length > 0) {
      setFieldError(errors);
      if (errors.accommodation) {
        toast.error(errors.accommodation, {
          position: "top-right",
          autoClose: 5000,
        });
      } else {
        toast.error("Por favor, complete todos los campos requeridos", {
          position: "top-right",
          autoClose: 5000,
        });
      }
      return;
    }
    // Avanza de paso normalmente
    if (step === 1) {
      setStep(formData.hasCompanions ? 2 : 2);
    } else if (step === 2 && formData.hasCompanions) {
      setStep(3);
    } else {
      setStep(step + 1);
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

  const handleSaveCompanion = (newCompanion) => {
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
      setFormData((prev) => {
        const updatedCompanions = [...(prev.companions || []), companionWithId]
        return {
          ...prev,
          companions: updatedCompanions,
        }
      })
      toast.success(`Acompañante ${companionWithId.name} agregado correctamente`, {
        position: "top-right",
        autoClose: 3000,
      })
    } catch (error) {
      toast.error(`Error al agregar acompañante: ${error.message}`)
    }
  }

  const handleDeleteCompanion = (idOrDocNumber) => {
    if (isReadOnly || loading) return
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
        setFormData((prev) => {
          const filteredCompanions = (prev.companions || []).filter(
            (c) =>
              c.idCompanions !== idOrDocNumber &&
              c.documentNumber !== idOrDocNumber &&
              c.id !== idOrDocNumber &&
              c.tempId !== idOrDocNumber,
          )
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
        setPaymentsKey(prev => prev + 1)
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
      toast.error(`Error al agregar pago: ${error.message}`)
      throw error
    } finally {
      setIsPaymentProcessing(false)
    }
  }

  const saveCompanionsToServer = async (reservationId, companions) => {
    const results = []
    const errors = []
    let companionResponse = null
    for (const companion of companions) {
      try {
        if (companion.isTemporary || companion.id?.startsWith("temp-") || companion.tempId) {
          const { ...cleanCompanionData } = companion
          companionResponse = await createCompanion(cleanCompanionData)
          if (!companionResponse?.idCompanions) {
            throw new Error("El servidor no devolvió un ID válido para el acompañante")
          }
          const associationData = {
            idCompanions: companionResponse.idCompanions,
          }
          await addCompanionReservation(reservationId, associationData)
          const finalCompanion = {
            ...companion,
            idCompanions: companionResponse.idCompanions,
            isTemporary: false,
            id: undefined,
            tempId: undefined,
            isTemp: undefined,
          }
          results.push(finalCompanion)
        } else if (companion.idCompanions) {
          results.push(companion)
        }
      } catch (error) {
        errors.push({
          companion: companion.name || "Acompañante",
          error: error.message,
          fullError: error,
        })
        if (error.message.includes("asociar") && companionResponse?.idCompanions) {
          try {
            await deleteCompanion(companionResponse.idCompanions)
          } catch (error) {
            console.error(`Error al eliminar acompañante temporal: ${error.message}`, error)
          }
        }
      }
    }
    return { results, errors }
  }

  const sanitizeDataForServer = (data, planes) => {
    const payload = {
      idUser: Number(data.idUser),
      idPlan: Number(data.idPlan),
      startDate: data.startDate,
      endDate: data.endDate,
      status: data.status || "Reservado",
    }
    if (data.idCabin) {
      payload.idCabin = Number(data.idCabin)
    } else if (data.idRoom) {
      payload.idRoom = Number(data.idRoom)
    }
    if (
      data.selectedServices &&
      Array.isArray(data.selectedServices) &&
      data.selectedServices.length > 0
    ) {
      payload.services = data.selectedServices.map((service) => ({
        serviceId: Number(service.serviceId),
        quantity: Number(service.quantity) || 1,
      }))
    }
    const selectedPlan =
      (planes || []).find((p) => p.idPlan === Number(data.idPlan)) || {}
    if (!planHasAccommodation(selectedPlan)) {
      delete payload.endDate
    }
    return payload
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (step === 1) {
      const errors = validateStep(1, formData);
      if (Object.keys(errors).length > 0) {
        setFieldError(errors);
        toast.error("Por favor, complete todos los campos requeridos", {
          position: "top-right",
          autoClose: 5000,
        });
        return;
      }
      setStep(formData.hasCompanions ? 2 : 2);
      return
    }
    if (!validateStep(3, formData)) {
      toast.error("Por favor, complete todos los campos requeridos", {
        position: "top-right",
        autoClose: 5000,
      })
      return
    }
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
            const { results, errors } = await saveCompanionsToServer(resultado.idReservation, formData.companions)
            if (results.length > 0) {
              setFormData((prev) => ({
                ...prev,
                companions: results,
              }))
              toast.success(`${results.length} acompañante(s) guardado(s) correctamente`, {
                position: "top-right",
                autoClose: 4000,
              })
            }
            if (errors.length > 0) {
              errors.forEach(({ companion, error }) => {
                toast.error(`Error con ${companion}: ${error}`, {
                  position: "top-right",
                  autoClose: 8000,
                })
              })
            }
          }
          if (tempPayments.length > 0) {
            const paymentResults = await Promise.allSettled(
              tempPayments.map((payment) => {
                const cleanPayment = { ...payment }
                delete cleanPayment.tempId
                delete cleanPayment.isTemp
                if (cleanPayment.voucher instanceof File) {
                  const formData = new FormData()
                  Object.entries(cleanPayment).forEach(([key, value]) => {
                    if (value !== undefined && value !== null) {
                      formData.append(key, value)
                    }
                  })
                  return addPaymentToReservationWithId(resultado.idReservation, formData)
                } else {
                  return addPaymentToReservationWithId(resultado.idReservation, cleanPayment)
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
          if (planHasAccommodation(formData.planes?.find(p => p.idPlan === Number(formData.idPlan))) && !formData.endDate) {
            toast.error("La fecha de fin es obligatoria para este plan.")
            setLoading(false)
            return
          }
          setLoading(false)
          onSave(resultado)
          onClose()
        } catch (error) {
          toast.error(`Error al guardar: ${error.message}`, {
            position: "top-right",
            autoClose: 5000,
          })
          setLoading(false)
        }
      },
    })
  }

  const handleClose = () => {
    if (step === (formData.hasCompanions ? 4 : 3)) {
      toast.info("Complete el proceso de pago o use el botón 'Guardar Reserva'", {
        position: "top-right",
        autoClose: 4000,
      })
      return
    }
    if (isAlertActive) return
    if (isPaymentProcessing) return
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
            setAllCabins(preloadedData.cabins || [])
            setAllBedrooms(preloadedData.bedrooms || [])
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
          setAllCabins(cabinsData || [])
          setAllBedrooms(bedroomsData || [])
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
            console.error(error)
            setReservationPayments([])
            toast.warning("No se pudieron cargar los pagos existentes", {
            
              position: "top-right",
              autoClose: 4000,
            })
          }
        }
      } catch (error) {
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
      })
      setFieldError({})
      setStep(1)
      setTempPayments([])
      setReservationPayments([])
    }
  }, [isOpen, reservationData])

  useEffect(() => {
    if (allCabins.length && allBedrooms.length) {
      const updated = updateAvailability({
        ...formData,
        cabins: allCabins,
        bedrooms: allBedrooms,
      })
      updateFormData((prev) => ({
        ...prev,
        availableCabins: updated.availableCabins,
        availableBedrooms: updated.availableBedrooms,
        idCabin: updated.idCabin,
        idRoom: updated.idRoom,
        availabilityStatus: updated.availabilityStatus,
      }))
    }
    // eslint-disable-next-line
  }, [
    formData.companionCount,
    formData.hasCompanions,
    formData.startDate,
    formData.endDate,
    formData.idPlan,
    allCabins,
    allBedrooms,
  ])

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
                  key={paymentsKey}
                />
              </div>
            )}

            {/* FOOTER ÚNICO */}
            <div className="reservation-modal-footer">
              {step > 1 && (
                <button
                  type="button"
                  className="reservation-cancel-button"
                  onClick={prevStep}
                  disabled={loading}
                >
                  Anterior
                </button>
              )}
              {step === (formData.hasCompanions ? 4 : 3) && (
                <>
                  <button
                    type="button"
                    className="reservation-submit-button"
                    onClick={() => {
                      document.getElementById("confirmar-pago-btn")?.click();
                    }}
                    disabled={loading}
                  >
                    Confirmar Pago
                  </button>
                  <button
                    type="button"
                    className={`reservation-submit-button ${loading ? "loading" : ""}`}
                    disabled={loading}
                    onClick={handleSubmit}
                  >
                    {loading ? (
                      <>
                        <span className="loading-spinner"></span>
                        {reservationData?.idReservation ? "Actualizando..." : "Guardar Reserva"}
                      </>
                    ) : reservationData?.idReservation ? (
                      "Actualizar Reserva"
                    ) : (
                      "Guardar Reserva"
                    )}
                  </button>
                </>
              )}
              {step < (formData.hasCompanions ? 4 : 3) && (
                <button
                  type={step === 1 ? "submit" : "button"}
                  className="reservation-submit-button"
                  onClick={step === 1 ? undefined : nextStep}
                  disabled={
                    loading ||
                    (step === 2 && formData.hasCompanions && (
                      formData.companions?.length !== Number(formData.companionCount) ||
                      Number(formData.companionCount) === 0
                    )) ||
                    (step === (formData.hasCompanions ? 3 : 2) && !!errors.accommodation)
                  }
                >
                  {step === 1
                    ? "Verificar Disponibilidad"
                    : step === (formData.hasCompanions ? 3 : 2)
                    ? "Ir a Pagos"
                    : "Siguiente"}
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
