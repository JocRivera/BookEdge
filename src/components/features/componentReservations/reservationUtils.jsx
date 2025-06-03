// Función para calcular el total de la reserva
export const calculateTotal = (formData, planes) => {
  const selectedPlan = planes.find((p) => p.idPlan === Number(formData.idPlan))
  if (!selectedPlan) return 0

  const basePrice = selectedPlan.price || selectedPlan.salePrice || selectedPlan.precio || 0
  const companionFee = 150000

  // ✅ CÁLCULO DE SERVICIOS CON CANTIDADES
  const servicesCost =
    formData.selectedServices?.reduce((total, serviceSelection) => {
      const service = formData.availableServices?.find((s) => s.Id_Service === serviceSelection.serviceId)
      const quantity = serviceSelection.quantity || 1
      const servicePrice = service?.Price || 0
      return total + servicePrice * quantity
    }, 0) || 0

  return basePrice + formData.companions.length * companionFee + servicesCost
}

// ✅ FUNCIÓN AUXILIAR PARA DEBUGGING DE CAPACIDADES
const debugAccommodationCapacity = (accommodation, type, totalGuests) => {
  const id = accommodation.idCabin || accommodation.idRoom
  const name = accommodation.name || `${type} ${id}`
  const status = accommodation.status
  const capacity = accommodation.capacity || accommodation.maxCapacity || accommodation.maxOccupancy
  const isActive = status?.toLowerCase() === "en servicio"

 

  return {
    id,
    name,
    status,
    capacity,
    isActive,
    hasCapacity: capacity >= totalGuests,
  }
}

export const updateAvailability = (formData) => {


  if (!formData.cabins || !formData.bedrooms) {
    return formData
  }

  const companionCount = formData.companionCount || 0
  const totalGuests = companionCount + 1

  

  // ✅ FUNCIÓN AUXILIAR MEJORADA PARA OBTENER CAPACIDAD
  const getAccommodationCapacity = (accommodation, type) => {
    // Lista de posibles campos de capacidad en orden de prioridad
    const capacityFields = [
      accommodation.capacity,
      accommodation.maxCapacity,
      accommodation.maxOccupancy,
      accommodation.maxGuests,
      accommodation.occupancy,
    ]

    // Buscar el primer valor válido (no undefined, no null, mayor que 0)
    const capacity = capacityFields.find((field) => field !== undefined && field !== null && field > 0)

    // Valores por defecto según el tipo
    const defaultCapacity = type === "cabin" ? 7 : 2
    const finalCapacity = capacity || defaultCapacity


    return finalCapacity
  }

  // ✅ FILTRAR CABAÑAS CON DEBUGGING MEJORADO
  const newAvailableCabins = formData.cabins.filter((cabin) => {
    const capacity = getAccommodationCapacity(cabin, "cabin")
    const isActive = cabin.status?.toLowerCase() === "en servicio"
    const hasCapacity = capacity >= totalGuests
    const isValid = isActive && hasCapacity

  

    return isValid
  })

  // ✅ FILTRAR HABITACIONES CON DEBUGGING MEJORADO
  const newAvailableBedrooms = formData.bedrooms.filter((bedroom) => {
    const capacity = getAccommodationCapacity(bedroom, "bedroom")
    const isActive = bedroom.status?.toLowerCase() === "en servicio"
    const hasCapacity = capacity >= totalGuests
    const isValid = isActive && hasCapacity

   

    return isValid
  })



  // ✅ VERIFICAR SELECCIONES ACTUALES
  const isSelectedCabinAvailable = newAvailableCabins.some((c) => c.idCabin === formData.idCabin)
  const isSelectedRoomAvailable = newAvailableBedrooms.some((b) => b.idRoom === formData.idRoom)

  const result = {
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

  return result
}

export const validateAccommodationCapacity = (formData) => {
  const totalGuests = formData.companionCount + 1

  if (formData.idCabin) {
    const selectedCabin = formData.availableCabins.find((c) => c.idCabin === formData.idCabin)
    const capacity = selectedCabin?.capacity || selectedCabin?.maxCapacity || selectedCabin?.maxOccupancy
  
    return selectedCabin ? capacity >= totalGuests : false
  }

  if (formData.idRoom) {
    const selectedRoom = formData.availableBedrooms.find((r) => r.idRoom === formData.idRoom)
    const capacity = selectedRoom?.capacity || selectedRoom?.maxCapacity || selectedRoom?.maxOccupancy || 2
 
    return selectedRoom ? capacity >= totalGuests : false
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
      const count = Math.max(0, Math.min(10, Number.parseInt(value) || 0))
      setFormData((prev) => {
        const newCompanions = prev.companions.slice(0, count)
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

    clearError(name)
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
      const existingService = currentServices.find((s) => s.serviceId !== serviceId)

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

// ✅ FUNCIÓN CORREGIDA: Formato exacto que espera tu backend
export const sanitizeDataForServer = (formData) => {
  const payload = {
    idUser: Number(formData.idUser),
    idPlan: Number(formData.idPlan),
    startDate: formData.startDate,
    endDate: formData.endDate,
    status: formData.status || "Pendiente",
  }

  // Agregar alojamiento
  if (formData.idCabin) {
    payload.idCabin = Number(formData.idCabin)
  } else if (formData.idRoom) {
    payload.idRoom = Number(formData.idRoom)
  }

  // ✅ SERVICIOS: Formato exacto que espera tu backend
  if (formData.selectedServices && formData.selectedServices.length > 0) {
    payload.services = formData.selectedServices.map((service) => ({
      serviceId: Number(service.serviceId),
      quantity: Number(service.quantity) || 1,
    }))
  }

  return payload
}

// ✅ FUNCIÓN PARA PROCESAR SERVICIOS DEL BACKEND AL FRONTEND
export const processServicesFromBackend = (backendServices) => {
  if (!Array.isArray(backendServices) || backendServices.length === 0) {
    return []
  }

  // Contar ocurrencias de cada servicio para obtener las cantidades
  const serviceCount = {}
  const serviceDetails = {}

  backendServices.forEach((service) => {
    const serviceId = service.Id_Service

    // Contar cantidad
    serviceCount[serviceId] = (serviceCount[serviceId] || 0) + 1

    // Guardar detalles del servicio (solo una vez)
    if (!serviceDetails[serviceId]) {
      serviceDetails[serviceId] = {
        id: service.Id_Service,
        name: service.name || "Servicio sin nombre",
        price: service.Price || 0,
        description: service.Description || "Sin descripción",
      }
    }
  })

  // Convertir a formato frontend
  const frontendServices = Object.keys(serviceCount).map((serviceId) => ({
    serviceId: Number(serviceId),
    quantity: serviceCount[serviceId],
    ...serviceDetails[serviceId],
  }))

  return frontendServices
}
