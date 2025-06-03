
import { useState, useEffect } from "react"
import PropTypes from "prop-types"
import { toast } from "react-toastify"
import { useAlert } from "../../../context/AlertContext"
import "./componentCompanions.css"

function CompanionsForm({ onSaveCompanion = [] }) {
  const [currentCompanion, setCurrentCompanion] = useState({
    name: "",
    birthdate: "",
    age: "",
    documentType: "Cédula de Ciudadanía",
    documentNumber: "",
    eps: "",
  })

  const [errors, setErrors] = useState({})
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Usar el contexto de alertas
  const { showAlert } = useAlert()

  useEffect(() => {
    if (currentCompanion.birthdate) {
      const birthdate = new Date(currentCompanion.birthdate)
      const ageDiff = Date.now() - birthdate.getTime()
      const ageDate = new Date(ageDiff)
      const calculatedAge = Math.abs(ageDate.getUTCFullYear() - 1970)

      setCurrentCompanion((prev) => ({
        ...prev,
        age: calculatedAge.toString(),
      }))
    }
  }, [currentCompanion.birthdate])

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setCurrentCompanion((prev) => ({
      ...prev,
      [name]: value,
    }))

    if (errors[name]) {
      setErrors((prev) => {
        const updatedErrors = { ...prev }
        delete updatedErrors[name]
        return updatedErrors
      })
    }
  }

  const validateForm = () => {
    const newErrors = {}

    if (!currentCompanion.name.trim()) {
      newErrors.name = "El nombre es obligatorio"
    }

    if (!currentCompanion.birthdate) {
      newErrors.birthdate = "La fecha de nacimiento es obligatoria"
    }

    if (!currentCompanion.documentType) {
      newErrors.documentType = "El tipo de documento es obligatorio"
    }

    if (!currentCompanion.documentNumber.trim()) {
      newErrors.documentNumber = "El número de documento es obligatorio"
    }

    if (!currentCompanion.eps.trim()) {
      newErrors.eps = "La EPS es obligatoria"
    }

    return newErrors
  }

  // ✅ FUNCIÓN CORREGIDA: Estructura de datos mejorada
  const handleSubmit = (e) => {
    if (e) e.preventDefault()

    console.log("📝 === ENVIANDO FORMULARIO DE ACOMPAÑANTE ===")
    console.log("Datos del formulario:", currentCompanion)

    const formErrors = validateForm()
    if (Object.keys(formErrors).length > 0) {
      setErrors(formErrors)
      toast.error("Por favor, complete todos los campos obligatorios")
      return
    }

    // ✅ MEJORADO: Crear objeto con estructura consistente y sin IDs temporales problemáticos
    const companionToAdd = {
      name: currentCompanion.name.trim(),
      birthdate: currentCompanion.birthdate,
      age: Number.parseInt(currentCompanion.age) || 0,
      documentType: currentCompanion.documentType,
      documentNumber: currentCompanion.documentNumber.trim(),
      eps: currentCompanion.eps.trim(),
      // ✅ IMPORTANTE: Marcar como temporal para el estado local
      isTemporary: true,
      tempId: `temp-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
    }

    console.log("📤 Datos preparados para envío:", companionToAdd)

    // Mostrar confirmación antes de guardar
    showAlert({
      type: "confirm-edit",
      title: "Confirmar Registro",
      message: `¿Está seguro de registrar a ${companionToAdd.name} como acompañante?`,
      confirmText: "Sí, Registrar",
      onConfirm: async () => {
        setIsSubmitting(true)

        try {
          console.log("🚀 Llamando a onSaveCompanion...")

          if (typeof onSaveCompanion === "function") {
            await onSaveCompanion(companionToAdd)

            // ✅ Solo mostrar éxito y limpiar si todo salió bien
            toast.success(`Acompañante ${companionToAdd.name} agregado correctamente`, {
              position: "top-right",
              autoClose: 3000,
            })

            // Resetear formulario
            setCurrentCompanion({
              name: "",
              birthdate: "",
              age: "",
              documentType: "Cédula de Ciudadanía",
              documentNumber: "",
              eps: "",
            })
            setErrors({})

            console.log("✅ Formulario limpiado después del éxito")
          } else {
            throw new Error("onSaveCompanion no es una función válida")
          }
        } catch (error) {
          console.error("❌ Error al registrar acompañante:", error)
          toast.error(`Error al registrar acompañante: ${error.message}`, {
            position: "top-right",
            autoClose: 4000,
          })
        } finally {
          setIsSubmitting(false)
        }
      },
    })
  }

  // Función para limpiar el formulario con confirmación
  const handleClear = () => {
    if (currentCompanion.name || currentCompanion.documentNumber || currentCompanion.eps) {
      showAlert({
        type: "confirm-delete",
        title: "Limpiar Formulario",
        message: "¿Está seguro de limpiar todos los campos? Los datos ingresados se perderán.",
        confirmText: "Sí, Limpiar",
        onConfirm: () => {
          setCurrentCompanion({
            name: "",
            birthdate: "",
            age: "",
            documentType: "Cédula de Ciudadanía",
            documentNumber: "",
            eps: "",
          })
          setErrors({})
          toast.info("Formulario limpiado")
        },
      })
    } else {
      setCurrentCompanion({
        name: "",
        birthdate: "",
        age: "",
        documentType: "Cédula de Ciudadanía",
        documentNumber: "",
        eps: "",
      })
      setErrors({})
    }
  }

  return (
    <div className="companion-form">
      <h3>Registrar Acompañante</h3>

      {/* ✅ INDICADOR DE ESTADO DE ENVÍO */}
      {isSubmitting && (
        <div
          className="submitting-indicator"
          style={{
            padding: "10px",
            backgroundColor: "#e3f2fd",
            border: "1px solid #2196f3",
            borderRadius: "4px",
            marginBottom: "15px",
            display: "flex",
            alignItems: "center",
            gap: "10px",
          }}
        >
          <span
            className="spinner"
            style={{
              width: "16px",
              height: "16px",
              border: "2px solid #f3f3f3",
              borderTop: "2px solid #2196f3",
              borderRadius: "50%",
              animation: "spin 1s linear infinite",
            }}
          ></span>
          <span>Guardando acompañante...</span>
        </div>
      )}

      <div>
        <div className={`form-group ${errors.name ? "has-error" : ""}`}>
          <label htmlFor="name">Nombre completo:</label>
          <input
            type="text"
            id="name"
            name="name"
            value={currentCompanion.name}
            onChange={handleInputChange}
            aria-invalid={!!errors.name}
            aria-describedby={errors.name ? "name-error" : undefined}
            disabled={isSubmitting}
          />
          {errors.name && (
            <span className="error-message" id="name-error">
              {errors.name}
            </span>
          )}
        </div>

        <div className={`form-group ${errors.birthdate ? "has-error" : ""}`}>
          <label htmlFor="birthdate">Fecha de nacimiento:</label>
          <input
            type="date"
            id="birthdate"
            name="birthdate"
            value={currentCompanion.birthdate}
            onChange={handleInputChange}
            max={new Date().toISOString().split("T")[0]}
            aria-invalid={!!errors.birthdate}
            aria-describedby={errors.birthdate ? "birthdate-error" : undefined}
            disabled={isSubmitting}
          />
          {errors.birthdate && (
            <span className="error-message" id="birthdate-error">
              {errors.birthdate}
            </span>
          )}
        </div>

        <div className="form-group">
          <label htmlFor="age">Edad:</label>
          <input type="text" id="age" name="age" value={currentCompanion.age} readOnly disabled={isSubmitting} />
        </div>

        <div className={`form-group ${errors.documentType ? "has-error" : ""}`}>
          <label htmlFor="documentType">Tipo de documento:</label>
          <select
            id="documentType"
            name="documentType"
            value={currentCompanion.documentType}
            onChange={handleInputChange}
            aria-invalid={!!errors.documentType}
            aria-describedby={errors.documentType ? "documentType-error" : undefined}
            disabled={isSubmitting}
          >
            <option value="Cédula de ciudadanía">Cédula de Ciudadanía</option>
            <option value="Tarjeta de identidad">Tarjeta de Identidad</option>
            <option value="Cédula de extranjería">Cédula de Extranjería</option>
            <option value="Pasaporte">Pasaporte</option>
          </select>
          {errors.documentType && (
            <span className="error-message" id="documentType-error">
              {errors.documentType}
            </span>
          )}
        </div>

        <div className={`form-group ${errors.documentNumber ? "has-error" : ""}`}>
          <label htmlFor="documentNumber">Número de documento:</label>
          <input
            type="text"
            id="documentNumber"
            name="documentNumber"
            value={currentCompanion.documentNumber}
            onChange={handleInputChange}
            aria-invalid={!!errors.documentNumber}
            aria-describedby={errors.documentNumber ? "documentNumber-error" : undefined}
            disabled={isSubmitting}
          />
          {errors.documentNumber && (
            <span className="error-message" id="documentNumber-error">
              {errors.documentNumber}
            </span>
          )}
        </div>

        <div className={`form-group ${errors.eps ? "has-error" : ""}`}>
          <label htmlFor="eps">EPS:</label>
          <input
            type="text"
            id="eps"
            name="eps"
            value={currentCompanion.eps}
            onChange={handleInputChange}
            aria-invalid={!!errors.eps}
            aria-describedby={errors.eps ? "eps-error" : undefined}
            disabled={isSubmitting}
          />
          {errors.eps && (
            <span className="error-message" id="eps-error">
              {errors.eps}
            </span>
          )}
        </div>

        <div className="form-actions">
          <button type="button" className="btn-secondary" onClick={handleClear} disabled={isSubmitting}>
            Limpiar
          </button>
          <button type="button" className="btn-primary" onClick={handleSubmit} disabled={isSubmitting}>
            {isSubmitting ? (
              <>
                <span className="spinner"></span> Guardando...
              </>
            ) : (
              "Guardar Acompañante"
            )}
          </button>
        </div>
      </div>
    </div>
  )
}

CompanionsForm.propTypes = {
  onSaveCompanion: PropTypes.func.isRequired,
  currentCompanions: PropTypes.array,
}

export default CompanionsForm
