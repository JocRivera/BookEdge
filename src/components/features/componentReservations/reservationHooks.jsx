import { useState } from "react"

const useReservationForm = (initialData = null) => {
  const [formData, setFormData] = useState({
    // Datos básicos
    idUser: initialData?.idUser || initialData?.user?.idUser || "",
    idPlan: initialData?.idPlan || initialData?.plan?.idPlan || "",
    startDate: initialData?.startDate || "",
    endDate: initialData?.endDate || "",
    status: initialData?.status || "Pendiente",

    // Acompañantes
    hasCompanions: initialData?.companions ? initialData.companions.length > 0 : false,
    companionCount: initialData?.companions ? initialData.companions.length : 0,
    companions: initialData?.companions || [],

    // Alojamiento
    idCabin:
      initialData?.idCabin ||
      (initialData?.cabins && initialData.cabins.length > 0 ? initialData.cabins[0].idCabin : ""),
    idRoom:
      initialData?.idRoom ||
      (initialData?.bedrooms && initialData.bedrooms.length > 0 ? initialData.bedrooms[0].idRoom : ""),

    // ✅ SERVICIOS CON CANTIDADES
    selectedServices: initialData?.services 
      ? initialData.services.map((s) => ({
          serviceId: s.Id_Service,
          quantity: s.quantity || 1
        }))
      : [],

    // Datos cargados del servidor (se llenarán después)
    users: [],
    planes: [],
    cabins: [],
    bedrooms: [],
    availableServices: [],
    availableCabins: [],
    availableBedrooms: [],
  })

  const [errors, setErrors] = useState({})
  const [currentStep, setCurrentStep] = useState(0)

  const updateFormData = (data) => {
    if (typeof data === "function") {
      setFormData((prevData) => {
        const newData = data(prevData)
        return newData
      })
    } else {
      setFormData((prevData) => ({ ...prevData, ...data }))
    }
  }

  // Resto del código del hook permanece igual...
  const nextStep = () => {
    const newErrors = validateStep(currentStep)
    if (Object.keys(newErrors).length === 0) {
      setErrors({})
      setCurrentStep((prevStep) => prevStep + 1)
    } else {
      setErrors(newErrors)
    }
  }

  const prevStep = () => {
    setCurrentStep((prevStep) => prevStep - 1)
    setErrors({})
  }

  const validateStep = (step, dataToValidate = formData) => {
    const newErrors = {}

    if (step === 1 || step === 0) {
      if (!dataToValidate.idUser) newErrors.idUser = "Cliente es requerido"
      if (!dataToValidate.idPlan) newErrors.idPlan = "Plan es requerido"
      if (!dataToValidate.startDate) newErrors.startDate = "Fecha de entrada es requerida"
      if (!dataToValidate.endDate) newErrors.endDate = "Fecha de salida es requerida"

      // Validación mejorada de fechas
      const today = new Date()
      today.setHours(0, 0, 0, 0)

      if (dataToValidate.startDate) {
        const startDate = new Date(dataToValidate.startDate)
        startDate.setHours(0, 0, 0, 0)

        if (startDate < today) {
          newErrors.startDate = "La fecha de inicio no puede ser anterior a hoy"
        }
      }

      if (dataToValidate.startDate && dataToValidate.endDate) {
        const startDate = new Date(dataToValidate.startDate)
        const endDate = new Date(dataToValidate.endDate)

        if (endDate <= startDate) {
          newErrors.endDate = "La fecha de salida debe ser posterior a la fecha de inicio"
        }
      }

      const validStatuses = ["Confirmado", "Pendiente", "Anulado", "Reservado"]
      if (dataToValidate.status && !validStatuses.includes(dataToValidate.status)) {
        newErrors.status = `Estado no válido. Use uno de: ${validStatuses.join(", ")}`
      }

      if (dataToValidate.hasCompanions && (!dataToValidate.companionCount || dataToValidate.companionCount <= 0)) {
        newErrors.companionCount = "Debe especificar al menos 1 acompañante"
      }

      if (dataToValidate.hasCompanions && dataToValidate.companionCount > 6) {
        newErrors.companionCount = "Máximo 6 acompañantes permitidos"
      }
    }

    // Validación del paso 3 (disponibilidad)
    if (step === 3) {
      if (!dataToValidate.idCabin && !dataToValidate.idRoom) {
        newErrors.accommodation = "Debe seleccionar una cabaña o habitación"
      }
    }

    return newErrors
  }

  const handleSubmit = () => {
    const newErrors = validateStep(2)
    if (Object.keys(newErrors).length === 0) {
      setErrors({})
      alert("Form submitted successfully!")
    } else {
      setErrors(newErrors)
    }
  }

  return {
    formData,
    updateFormData,
    errors,
    currentStep,
    nextStep,
    prevStep,
    handleSubmit,
    validateStep,
  }
}

export default useReservationForm
