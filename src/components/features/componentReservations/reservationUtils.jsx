// Función para calcular el total de la reserva
export const calculateTotal = (formData, planes) => {
  const selectedPlan = planes.find((p) => p.idPlan === Number(formData.idPlan))
  if (!selectedPlan) return 0

  const basePrice = selectedPlan.price || selectedPlan.salePrice || selectedPlan.precio || 0
  const companionFee = 150000 // Cambiado a 150,000 COP (ajusta este valor según tu necesidad)

  // ✅ NUEVO CÁLCULO DE SERVICIOS CON CANTIDADES
  const servicesCost = formData.selectedServices?.reduce((total, serviceSelection) => {
    const service = formData.availableServices?.find((s) => s.Id_Service === serviceSelection.serviceId)
    const quantity = serviceSelection.quantity || 1
    const servicePrice = service?.Price || 0
    return total + (servicePrice * quantity)
  }, 0) || 0

  return basePrice + formData.companions.length * companionFee + servicesCost
}

export const updateAvailability = (formData) => {
  if (!formData.cabins || !formData.bedrooms) return formData

  const companionCount = formData.companionCount || 0
  const totalGuests = companionCount + 1 // +1 para el huésped principal

  console.log("🏨 Actualizando disponibilidad:", {
    companionCount,
    totalGuests,
    hasCompanions: formData.hasCompanions,
  })

  let newAvailableCabins = []
  let newAvailableBedrooms = []

  // REGLA: Si hay MÁS de 1 acompañante (2+ personas total), solo mostrar cabañas
  if (companionCount > 1) {
    console.log("🏠 Más de 1 acompañante - Mostrando solo cabañas")
    newAvailableCabins = formData.cabins.filter(
      (cabin) => cabin.status?.toLowerCase() === "en servicio" && cabin.capacity >= totalGuests,
    )
    newAvailableBedrooms = [] // No mostrar habitaciones
  }
  // REGLA: Si hay 1 acompañante o menos (1-2 personas total), solo mostrar habitaciones
  else {
    console.log("🛏️ 1 acompañante o menos - Mostrando solo habitaciones")
    newAvailableBedrooms = formData.bedrooms.filter((bedroom) => bedroom.status?.toLowerCase() === "en servicio")
    newAvailableCabins = [] // No mostrar cabañas
  }

  // Verificar si las selecciones actuales siguen siendo válidas
  const isSelectedCabinAvailable = newAvailableCabins.some((c) => c.idCabin === formData.idCabin)

  const isSelectedRoomAvailable = newAvailableBedrooms.some((b) => b.idRoom === formData.idRoom)

  console.log("✅ Disponibilidad actualizada:", {
    availableCabins: newAvailableCabins.length,
    availableBedrooms: newAvailableBedrooms.length,
    selectedCabinValid: isSelectedCabinAvailable,
    selectedRoomValid: isSelectedRoomAvailable,
  })

  return {
    ...formData,
    availableCabins: newAvailableCabins,
    availableBedrooms: newAvailableBedrooms,
    // Limpiar selecciones inválidas
    idCabin: !isSelectedCabinAvailable ? "" : formData.idCabin,
    idRoom: !isSelectedRoomAvailable ? "" : formData.idRoom,
    availabilityStatus: {
      hasCabinAvailability: newAvailableCabins.length > 0,
      hasRoomAvailability: newAvailableBedrooms.length > 0,
      requiredCapacity: totalGuests,
      accommodationType: companionCount > 1 ? "cabin" : "bedroom",
    },
  }
}

// Validador de capacidad de alojamiento
export const validateAccommodationCapacity = (formData) => {
  const totalGuests = formData.companionCount + 1

  if (formData.idCabin) {
    const selectedCabin = formData.availableCabins.find(c => c.idCabin === formData.idCabin)
    return selectedCabin ? selectedCabin.capacity >= totalGuests : false
  }

  if (formData.idRoom) {
    const selectedRoom = formData.availableBedrooms.find(r => r.idRoom === formData.idRoom)
    return selectedRoom ? (selectedRoom.capacity || 2) >= totalGuests : false
  }

  return false
}

// Funciones auxiliares para manejo de eventos
export const createFormChangeHandler = (formData, setFormData, clearError) => {
  return (e) => {
    const { name, value, type, checked } = e.target

    if (name === "hasCompanions") {
      setFormData((prev) => ({
        ...prev,
        hasCompanions: checked,
        companionCount: checked ? Math.max(prev.companionCount || 1, 1) : 0,
        companions: checked ? prev.companions : [],
        // Limpiar selección de alojamiento si cambia el número de huéspedes
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
          // Limpiar selección de alojamiento si cambia el número
          idCabin: "",
          idRoom: "",
        }
      })
    } else if (name === "startDate" || name === "endDate") {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
        // Recalcular disponibilidad cuando cambien las fechas
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
      idCabin: prev.idCabin === cabinId ? "" : cabinId, // Toggle selection
      idRoom: "", // Deseleccionar habitación
    }))
  }

  const handleRoomSelect = (roomId) => {
    setFormData((prev) => ({
      ...prev,
      idRoom: prev.idRoom === roomId ? "" : roomId, // Toggle selection
      idCabin: "", // Deseleccionar cabaña
    }))
  }

  // ✅ NUEVA FUNCIÓN PARA MANEJAR SERVICIOS CON CANTIDADES
  const handleServiceQuantityChange = (serviceId, quantity) => {
    setFormData((prev) => {
      const currentServices = prev.selectedServices || []
      
      if (quantity <= 0) {
        // Remover el servicio si la cantidad es 0 o menor
        return {
          ...prev,
          selectedServices: currentServices.filter(s => s.serviceId !== serviceId)
        }
      } else {
        // Buscar si el servicio ya existe
        const existingServiceIndex = currentServices.findIndex(s => s.serviceId === serviceId)
        
        if (existingServiceIndex >= 0) {
          // Actualizar cantidad existente
          const updatedServices = [...currentServices]
          updatedServices[existingServiceIndex] = { serviceId, quantity }
          return {
            ...prev,
            selectedServices: updatedServices
          }
        } else {
          // Agregar nuevo servicio
          return {
            ...prev,
            selectedServices: [...currentServices, { serviceId, quantity }]
          }
        }
      }
    })
  }

  // Función legacy para compatibilidad (ahora usa cantidad 1)
  const handleServiceToggle = (serviceId) => {
    setFormData((prev) => {
      const currentServices = prev.selectedServices || []
      const existingService = currentServices.find(s => s.serviceId === serviceId)
      
      if (existingService) {
        // Remover el servicio
        return {
          ...prev,
          selectedServices: currentServices.filter(s => s.serviceId !== serviceId)
        }
      } else {
        // Agregar el servicio con cantidad 1
        return {
          ...prev,
          selectedServices: [...currentServices, { serviceId, quantity: 1 }]
        }
      }
    })
  }

  return {
    handleCabinSelect,
    handleRoomSelect,
    handleServiceToggle,
    handleServiceQuantityChange, // Nueva función
  }
}

// Función para validar datos de acompañante
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
    errors
  }
}

// Función para formatear fechas
export const formatDate = (dateString) => {
  if (!dateString) return ""
  const date = new Date(dateString)
  return date.toLocaleDateString('es-ES', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
}

// Función para calcular días entre fechas
export const calculateDaysBetween = (startDate, endDate) => {
  if (!startDate || !endDate) return 0
  const start = new Date(startDate)
  const end = new Date(endDate)
  const diffTime = Math.abs(end - start)
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24))
}

// Función para generar ID temporal
export const generateTempId = () => `temp-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`

// Función para limpiar datos antes de enviar al servidor
export const sanitizeDataForServer = (formData) => {
  return {
    idUser: Number(formData.idUser),
    idPlan: Number(formData.idPlan),
    idCabin: formData.idCabin ? Number(formData.idCabin) : null,
    idRoom: formData.idRoom ? Number(formData.idRoom) : null,
    startDate: formData.startDate,
    endDate: formData.endDate,
    status: formData.status || "Reservado",
    total: calculateTotal(formData, formData.planes),
    paymentMethod: formData.paymentMethod || "Efectivo",
    // ✅ NUEVO FORMATO DE SERVICIOS CON CANTIDADES
    services: (formData.selectedServices || []).map(serviceSelection => ({
      serviceId: serviceSelection.serviceId,
      quantity: serviceSelection.quantity || 1
    })),
    companions: formData.companions.map(companion => ({
      documentNumber: companion.documentNumber,
      name: companion.name,
      lastName: companion.lastName,
      email: companion.email || null,
      phone: companion.phone || null,
    }))
  }
}
