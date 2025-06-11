// Función para calcular el total de la reserva
export const calculateTotal = (formData, planes) => {
  const selectedPlan = planes.find((p) => p.idPlan === Number(formData.idPlan))
  if (!selectedPlan) return 0

  const basePrice = selectedPlan.price || selectedPlan.salePrice || selectedPlan.precio || 0
  const companionFee = 150000

  const servicesCost =
    formData.selectedServices?.reduce((total, serviceSelection) => {
      const service = formData.availableServices?.find((s) => s.Id_Service === serviceSelection.serviceId)
      const quantity = serviceSelection.quantity || 1
      const servicePrice = service?.Price || 0
      return total + servicePrice * quantity
    }, 0) || 0

  return basePrice + (formData.companions?.length || 0) * companionFee + servicesCost
}

const getAccommodationCapacity = (accommodation, type) => {
  const capacityFields = [
    accommodation.capacity,
    accommodation.maxCapacity,
    accommodation.maxOccupancy,
    accommodation.maxGuests,
    accommodation.occupancy,
  ]
  const capacity = capacityFields.find((field) => field !== undefined && field !== null && Number(field) > 0)
  const defaultCapacity = type === "cabin" ? 7 : 2
  return Number(capacity) || defaultCapacity
}

export const updateAvailability = (formData) => {
  const companionCount = Number(formData.companionCount) || 0
  const totalGuests = companionCount + 1

  const newAvailableCabins = formData.cabins.filter((cabin) => {
    const capacity = Number(getAccommodationCapacity(cabin, "cabin"))
    const isActive = (cabin.status || "").trim().toLowerCase() === "en servicio"
    const hasCapacity = capacity >= totalGuests
    return isActive && hasCapacity
  })

  const newAvailableBedrooms = formData.bedrooms.filter((bedroom) => {
    const capacity = Number(getAccommodationCapacity(bedroom, "bedroom"))
    const isActive = (bedroom.status || "").trim().toLowerCase() === "en servicio"
    const hasCapacity = capacity >= totalGuests
    return isActive && hasCapacity
  })

  const isSelectedCabinAvailable = newAvailableCabins.some((c) => c.idCabin === formData.idCabin)
  const isSelectedRoomAvailable = newAvailableBedrooms.some((b) => b.idRoom === formData.idRoom)

  return {
    ...formData,
    availableCabins: newAvailableCabins,
    availableBedrooms: newAvailableBedrooms,
    idCabin: !isSelectedCabinAvailable ? "" : formData.idCabin,
    idRoom: !isSelectedRoomAvailable ? "" : formData.idRoom,
    availabilityStatus: {
      hasCabinAvailability: newAvailableCabins.length > 0,
      hasRoomAvailability: newAvailableBedrooms.length > 0,
      requiredCapacity: totalGuests,
      accommodationType: totalGuests > 4 ? "cabin-only" : totalGuests > 2 ? "cabin-preferred" : "room-preferred",
    },
  }
}

export const validateAccommodationCapacity = (formData) => {
  const totalGuests = (formData.companionCount || 0) + 1

  if (formData.idCabin) {
    const selectedCabin = formData.availableCabins?.find((c) => c.idCabin === formData.idCabin)
    if (!selectedCabin) return false
    const capacity = getAccommodationCapacity(selectedCabin, "cabin")
    return capacity >= totalGuests
  }

  if (formData.idRoom) {
    const selectedRoom = formData.availableBedrooms?.find((r) => r.idRoom === formData.idRoom)
    if (!selectedRoom) return false
    const capacity = getAccommodationCapacity(selectedRoom, "bedroom")
    return capacity >= totalGuests
  }

  return false
}

export const createFormChangeHandler = (formData, setFormData, clearError) => {
  return (e) => {
    const { name, value, type, checked } = e.target

    if (name === "hasCompanions") {
      setFormData((prev) => ({
        ...prev,
        hasCompanions: checked,
        companionCount: checked ? Math.max(prev.companionCount || 1, 1) : 0,
        companions: checked ? prev.companions : [],
        idCabin: "",
        idRoom: "",
      }))
    } else if (name === "companionCount" && formData.hasCompanions) {
      const count = Math.max(0, Math.min(6, Number.parseInt(value) || 0))
      setFormData((prev) => {
        const newCompanions = prev.companions?.slice(0, count) || []
        return {
          ...prev,
          companionCount: count,
          companions: newCompanions,
          idCabin: "",
          idRoom: "",
        }
      })
    } else if (name === "startDate" || name === "endDate") {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
        idCabin: "",
        idRoom: "",
      }))
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: type === "checkbox" ? checked : value,
      }))
    }

    if (clearError) {
      clearError(name)
    }
  }
}

export const createSelectionHandlers = (setFormData) => {
  const handleCabinSelect = (cabinId) => {
    setFormData((prev) => ({
      ...prev,
      idCabin: prev.idCabin === cabinId ? "" : cabinId,
      idRoom: "",
    }))
  }

  const handleRoomSelect = (roomId) => {
    setFormData((prev) => ({
      ...prev,
      idRoom: prev.idRoom === roomId ? "" : roomId,
      idCabin: "",
    }))
  }

  const handleServiceQuantityChange = (serviceId, quantity) => {
    setFormData((prev) => {
      const currentServices = prev.selectedServices || []

      if (quantity <= 0) {
        return {
          ...prev,
          selectedServices: currentServices.filter((s) => s.serviceId !== serviceId),
        }
      } else {
        const existingServiceIndex = currentServices.findIndex((s) => s.serviceId === serviceId)

        if (existingServiceIndex >= 0) {
          const updatedServices = [...currentServices]
          updatedServices[existingServiceIndex] = { serviceId, quantity }
          return {
            ...prev,
            selectedServices: updatedServices,
          }
        } else {
          return {
            ...prev,
            selectedServices: [...currentServices, { serviceId, quantity }],
          }
        }
      }
    })
  }

  const handleServiceToggle = (serviceId) => {
    setFormData((prev) => {
      const currentServices = prev.selectedServices || []
      const existingService = currentServices.find((s) => s.serviceId === serviceId)

      if (existingService) {
        return {
          ...prev,
          selectedServices: currentServices.filter((s) => s.serviceId !== serviceId),
        }
      } else {
        return {
          ...prev,
          selectedServices: [...currentServices, { serviceId, quantity: 1 }],
        }
      }
    })
  }

  return {
    handleCabinSelect,
    handleRoomSelect,
    handleServiceToggle,
    handleServiceQuantityChange,
  }
}

export const validateCompanionData = (companion) => {
  const errors = {}

  if (!companion.documentNumber?.trim()) {
    errors.documentNumber = "Número de documento es requerido"
  }

  if (!companion.name?.trim()) {
    errors.name = "Nombre es requerido"
  }

  if (!companion.age || companion.age <= 0) {
    errors.age = "Edad es requerida y debe ser mayor a 0"
  }

  if (!companion.eps?.trim()) {
    errors.eps = "EPS es requerida"
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  }
}

export const formatDate = (dateString) => {
  if (!dateString) return ""
  const date = new Date(dateString)
  return date.toLocaleDateString("es-ES", {
    year: "numeric",
    month: "long",
    day: "numeric",
  })
}

export const calculateDaysBetween = (startDate, endDate) => {
  if (!startDate || !endDate) return 0
  const start = new Date(startDate)
  const end = new Date(endDate)
  const diffTime = Math.abs(end - start)
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24))
}

export const generateTempId = () => `temp-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`

export const sanitizeDataForServer = (formData) => {
  const payload = {
    idUser: Number(formData.idUser),
    idPlan: Number(formData.idPlan),
    startDate: formData.startDate,
    endDate: formData.endDate,
    status: formData.status || "Pendiente",
  }

  if (formData.idCabin) {
    payload.idCabin = Number(formData.idCabin)
  } else if (formData.idRoom) {
    payload.idRoom = Number(formData.idRoom)
  }

  if (formData.selectedServices && formData.selectedServices.length > 0) {
    payload.services = formData.selectedServices.map((service) => ({
      serviceId: Number(service.serviceId),
      quantity: Number(service.quantity) || 1,
    }))
  }

  return payload
}

export const processServicesFromBackend = (backendServices) => {
  if (!Array.isArray(backendServices) || backendServices.length === 0) {
    return []
  }

  const serviceCount = {}
  const serviceDetails = {}

  backendServices.forEach((service) => {
    const serviceId = service.Id_Service
    serviceCount[serviceId] = (serviceCount[serviceId] || 0) + 1

    if (!serviceDetails[serviceId]) {
      serviceDetails[serviceId] = {
        id: service.Id_Service,
        name: service.name || "Servicio sin nombre",
        price: service.Price || 0,
        description: service.Description || "Sin descripción",
      }
    }
  })

  const frontendServices = Object.keys(serviceCount).map((serviceId) => ({
    serviceId: Number(serviceId),
    quantity: serviceCount[serviceId],
    ...serviceDetails[serviceId],
  }))

  return frontendServices
}

export const validateReservationForm = (formData) => {
  const errors = {}

  if (!formData.idUser) {
    errors.idUser = "Cliente es requerido"
  }

  if (!formData.idPlan) {
    errors.idPlan = "Plan es requerido"
  }

  if (!formData.startDate) {
    errors.startDate = "Fecha de inicio es requerida"
  }

  if (!formData.endDate) {
    errors.endDate = "Fecha de fin es requerida"
  }

  if (formData.startDate) {
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const startDate = new Date(formData.startDate)
    startDate.setHours(0, 0, 0, 0)
    if (startDate < today) {
      errors.startDate = "La fecha de inicio no puede ser anterior a hoy"
    }
  }

  if (formData.startDate && formData.endDate) {
    const startDate = new Date(formData.startDate)
    startDate.setHours(0, 0, 0, 0)
    const endDate = new Date(formData.endDate)
    endDate.setHours(0, 0, 0, 0)
    if (endDate < startDate) {
      errors.endDate = "La fecha de fin no puede ser anterior a la fecha de inicio"
    }
  }

  if (!formData.idCabin && !formData.idRoom) {
    errors.accommodation = "Debe seleccionar una cabaña o habitación"
  }

  if (formData.hasCompanions) {
    if (!formData.companionCount || formData.companionCount <= 0) {
      errors.companionCount = "Debe especificar al menos 1 acompañante"
    }

    const expectedCount = Number.parseInt(formData.companionCount) || 0
    const actualCount = formData.companions?.length || 0

    if (actualCount < expectedCount) {
      errors.companions = `Faltan ${expectedCount - actualCount} acompañante(s) por registrar`
    }
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  }
}

export const formatCurrency = (amount) => {
  return new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount || 0)
}

export const getReservationSummary = (formData) => {
  const totalGuests = (formData.companionCount || 0) + 1
  const selectedPlan = formData.planes?.find((p) => p.idPlan === Number(formData.idPlan))
  const selectedUser = formData.users?.find((u) => u.idUser === Number(formData.idUser))
  const selectedCabin = formData.availableCabins?.find((c) => c.idCabin === formData.idCabin)
  const selectedRoom = formData.availableBedrooms?.find((r) => r.idRoom === formData.idRoom)

  return {
    client: selectedUser?.name || "No seleccionado",
    plan: selectedPlan?.name || "No seleccionado",
    dates: formData.startDate && formData.endDate ? `${formData.startDate} - ${formData.endDate}` : "No seleccionadas",
    guests: totalGuests,
    accommodation: selectedCabin?.name || selectedRoom?.name || "No seleccionado",
    services: formData.selectedServices?.length || 0,
    total: calculateTotal(formData, formData.planes || []),
  }
}

export const planHasAccommodation = (plan) => {
  return (
    (plan?.cabins?.length > 0) ||
    (plan?.bedrooms?.length > 0) ||
    (plan?.cabinDistribution?.length > 0) ||
    (plan?.bedroomDistribution?.length > 0)
  )
}

// ✅ NUEVAS FUNCIONES PARA LÓGICA DE PAGOS 50%
export const getPaymentInfo = (reservationData, existingPayments = []) => {
  if (!reservationData) {
    return {
      totalReservation: 0,
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

  // Calcular montos de pago
  const firstPaymentAmount = Math.round(totalReservation * 0.5) // 50%
  const secondPaymentAmount = totalReservation - firstPaymentAmount // Restante

  // Determinar estado actual
  const paymentCount = validPayments.length
  const canAddPayment = paymentCount < 2
  const isComplete = paymentCount >= 2

  let nextPaymentType = "first"
  let nextPaymentAmount = firstPaymentAmount

  if (paymentCount === 1) {
    nextPaymentType = "second"
    nextPaymentAmount = secondPaymentAmount
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
  }
}

export const validatePaymentAmount = (amount, reservationData, existingPayments = []) => {
  if (!reservationData) {
    // Validaciones generales para casos sin reserva específica
    if (amount < 1000) {
      return "El monto mínimo es $1,000 COP"
    }
    return null
  }

  const paymentInfo = getPaymentInfo(reservationData, existingPayments)
  
  if (!paymentInfo.canAddPayment) {
    return "Esta reserva ya tiene los 2 pagos requeridos (50% + 50%)"
  }

  const expectedAmount = paymentInfo.nextPaymentAmount

  if (amount !== expectedAmount) {
    const paymentType = paymentInfo.nextPaymentType === "first" ? "primer" : "segundo"
    return `El ${paymentType} pago debe ser exactamente ${formatCurrency(expectedAmount)}`
  }

  return null
}