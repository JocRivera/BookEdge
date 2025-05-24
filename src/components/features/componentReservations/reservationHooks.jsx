import { useState } from "react"

const useReservationForm = () => {
  const [formData, setFormData] = useState({
    idUser: "",
    idPlan: "",
    startDate: "",
    endDate: "",
    status: "Pendiente",
    hasCompanions: false,
    companionCount: 0,
  })
  const [errors, setErrors] = useState({})
  const [currentStep, setCurrentStep] = useState(0)

  const updateFormData = (data) => {
    setFormData({ ...formData, ...data })
  }

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

  const validateStep = (step) => {
    const newErrors = {}

    if (step === 0) {
      if (!formData.idUser) newErrors.idUser = "Cliente es requerido"
      if (!formData.idPlan) newErrors.idPlan = "Plan es requerido"
      if (!formData.startDate) newErrors.startDate = "Fecha de entrada es requerida"
      if (!formData.endDate) newErrors.endDate = "Fecha de salida es requerida"

      // Validación mejorada de fechas
      const today = new Date()
      today.setHours(0, 0, 0, 0) // Resetear horas para comparación exacta

      if (formData.startDate) {
        const startDate = new Date(formData.startDate)
        startDate.setHours(0, 0, 0, 0)

        if (startDate < today) {
          newErrors.startDate = "La fecha de inicio no puede ser anterior a hoy"
        }
      }

      if (formData.startDate && formData.endDate) {
        const startDate = new Date(formData.startDate)
        const endDate = new Date(formData.endDate)

        if (endDate <= startDate) {
          newErrors.endDate = "La fecha de salida debe ser posterior a la fecha de inicio"
        }
      }

      const validStatuses = ["Confirmado", "Pendiente", "Anulado", "Reservado"]
      if (formData.status && !validStatuses.includes(formData.status)) {
        newErrors.status = `Estado no válido. Use uno de: ${validStatuses.join(", ")}`
      }

      if (formData.hasCompanions && (!formData.companionCount || formData.companionCount <= 0)) {
        newErrors.companionCount = "Debe especificar al menos 1 acompañante"
      }

      if (formData.hasCompanions && formData.companionCount > 10) {
        newErrors.companionCount = "Máximo 10 acompañantes permitidos"
      }
    }

    return newErrors
  }

  const handleSubmit = () => {
    const newErrors = validateStep(2) // Assuming step 2 is the final step
    if (Object.keys(newErrors).length === 0) {
      setErrors({})
      // Here you would typically submit the form data
      console.log("Form submitted:", formData)
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
  }
}

export default useReservationForm
