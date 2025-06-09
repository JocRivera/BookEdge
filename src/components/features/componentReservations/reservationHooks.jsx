"use client"

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

    // Servicios con cantidades
    selectedServices: initialData?.services
      ? initialData.services.map((s) => ({
          serviceId: s.Id_Service,
          quantity: s.quantity || 1,
        }))
      : [],

    // Datos cargados del servidor
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

  
  // Función para actualizar datos del formulario
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

  // Función para limpiar errores específicos
  const clearError = (fieldName) => {
    setErrors((prevErrors) => {
      const newErrors = { ...prevErrors }
      delete newErrors[fieldName]
      return newErrors
    })
  }

  // Función para limpiar todos los errores
  const clearAllErrors = () => {
    setErrors({})
  }

  // Navegación entre pasos
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

  // Función para ir a un paso específico
  const goToStep = (step) => {
    setCurrentStep(step)
    setErrors({})
  }

  // Validación de pasos
  const validateStep = (step, dataToValidate = formData) => {
    const newErrors = {}

    // Validación del paso 1 (información básica)
    if (step === 1 || step === 0) {
      if (!dataToValidate.idUser) {
        newErrors.idUser = "Cliente es requerido"
      }

      if (!dataToValidate.idPlan) {
        newErrors.idPlan = "Plan es requerido"
      }

      if (!dataToValidate.startDate) {
        newErrors.startDate = "Fecha de entrada es requerida"
      }

      if (!dataToValidate.endDate) {
        newErrors.endDate = "Fecha de salida es requerida"
      }

      // Validación de fechas
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

      // Validación de estado
      const validStatuses = ["Confirmado", "Pendiente", "Anulado", "Reservado"]
      if (dataToValidate.status && !validStatuses.includes(dataToValidate.status)) {
        newErrors.status = `Estado no válido. Use uno de: ${validStatuses.join(", ")}`
      }

      // Validación de acompañantes
      if (dataToValidate.hasCompanions && (!dataToValidate.companionCount || dataToValidate.companionCount <= 0)) {
        newErrors.companionCount = "Debe especificar al menos 1 acompañante"
      }

      if (dataToValidate.hasCompanions && dataToValidate.companionCount > 6) {
        newErrors.companionCount = "Máximo 6 acompañantes permitidos"
      }
    }

    // Validación del paso 2 (acompañantes)
    if (step === 2 && dataToValidate.hasCompanions) {
      const expectedCount = Number.parseInt(dataToValidate.companionCount) || 0
      const actualCount = dataToValidate.companions?.length || 0

      if (actualCount < expectedCount) {
        newErrors.companions = `Faltan ${expectedCount - actualCount} acompañante(s) por registrar`
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

  // Validación completa del formulario
  const validateForm = () => {
    const allErrors = {}

    // Validar todos los pasos
    for (let step = 0; step <= 3; step++) {
      const stepErrors = validateStep(step, formData)
      Object.assign(allErrors, stepErrors)
    }

    return allErrors
  }

  // Función para verificar si el formulario es válido
  const isFormValid = () => {
    const allErrors = validateForm()
    return Object.keys(allErrors).length === 0
  }

  // Función para resetear el formulario
  const resetForm = () => {
    setFormData({
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
      users: [],
      planes: [],
      cabins: [],
      bedrooms: [],
      availableServices: [],
      availableCabins: [],
      availableBedrooms: [],
    })
    setErrors({})
    setCurrentStep(0)
  }

  // Función para manejar el envío del formulario
  const handleSubmit = () => {
    const allErrors = validateForm()

    if (Object.keys(allErrors).length === 0) {
      setErrors({})
      return { success: true, data: formData }
    } else {
      setErrors(allErrors)
      return { success: false, errors: allErrors }
    }
  }

  // Función para obtener el progreso del formulario
  const getProgress = () => {
    const totalSteps = formData.hasCompanions ? 4 : 3
    return {
      current: currentStep + 1,
      total: totalSteps,
      percentage: Math.round(((currentStep + 1) / totalSteps) * 100),
    }
  }

  // Función para verificar si se puede avanzar al siguiente paso
  const canProceedToNext = () => {
    const stepErrors = validateStep(currentStep, formData)
    return Object.keys(stepErrors).length === 0
  }

  // NUEVO: función para actualizar un error de campo en tiempo real
  const setFieldError = (field, error) => {
    setErrors((prev) => ({ ...prev, [field]: error }))
  }

  return {
    // Estado
    formData,
    errors,
    currentStep,

    // Funciones de actualización
    updateFormData,
    clearError,
    clearAllErrors,
    setFieldError, // <-- agrega esto

    // Navegación
    nextStep,
    prevStep,
    goToStep,

    // Validación
    validateStep,
    validateForm,
    isFormValid,
    canProceedToNext,

    // Utilidades
    resetForm,
    handleSubmit,
    getProgress,
  }
}

export default useReservationForm
