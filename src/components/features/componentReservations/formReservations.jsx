import { useState, useEffect } from "react"
import PropTypes from "prop-types"
import "./componentsReservations.css"
import CompanionsForm from "../componentCompanions/formCompanions"
import PaymentForm from "../componentPayments/fromPayments.jsx"
import TableCompanions from "../componentCompanions/tableCompanions"
import {
  createReservation,
  getAllPlanes,
  getUsers,
  updateReservation,
  getReservationById,
  addCompanionReservation,
} from "../../../services/reservationsService.jsx"
import { createCompanion, deleteCompanion } from "../../../services/companionsService.jsx"

function FormReservation({ reservationData = null, onClose, onSave, isOpen, isReadOnly = false }) {
  const [step, setStep] = useState(1)
  const [formData, setFormData] = useState({
    idUser: "",
    idPlan: "",
    startDate: "",
    endDate: "",
    hasCompanions: false,
    companionCount: 0,
    companions: [],
    status: "Reservado",
    total: 0,
    paymentMethod: "Efectivo",
  })

  const [errors, setErrors] = useState({})
  const [planes, setPlanes] = useState([])
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(false)

  // Mejorado: useEffect para cargar datos iniciales
  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        setLoading(true)
        const planesData = await getAllPlanes()
        const usersData = await getUsers()

        setPlanes(planesData)
        setUsers(usersData)

        if (reservationData) {
          console.log("Cargando datos de reserva existente:", reservationData)

          // Si tenemos el ID de la reservación, intentar obtener los datos actualizados
          if (reservationData.idReservation) {
            try {
              const freshData = await getReservationById(reservationData.idReservation)
              if (freshData) {
                console.log("Datos actualizados de la reserva:", freshData)
                reservationData = freshData
              }
            } catch (error) {
              console.warn("No se pudieron obtener datos actualizados de la reserva:", error.message)
            }
          }

          // Asegurar que los IDs sean números
          const idUser = reservationData.idUser ? Number(reservationData.idUser) : ""
          const idPlan = reservationData.idPlan ? Number(reservationData.idPlan) : ""

          setFormData({
            idUser: idUser,
            idPlan: idPlan,
            startDate: reservationData.startDate || "",
            endDate: reservationData.endDate || "",
            hasCompanions: Array.isArray(reservationData.companions) && reservationData.companions.length > 0,
            companionCount: Array.isArray(reservationData.companions) ? reservationData.companions.length : 0,
            companions: Array.isArray(reservationData.companions) ? reservationData.companions : [],
            status: reservationData.status || "Reservado",
            total: reservationData.total || 0,
            paymentMethod: reservationData.paymentMethod || "Efectivo",
          })
        } else {
          // Inicializar nueva reserva
          setFormData({
            idUser: "",
            idPlan: "",
            startDate: "",
            endDate: "",
            hasCompanions: false,
            companionCount: 0,
            companions: [],
            status: "Reservado",
            total: 0,
            paymentMethod: "Efectivo",
          })
        }
      } catch (error) {
        console.error("Error inicializando formulario:", error)
        alert(`Error al cargar datos: ${error.message}`)
      } finally {
        setLoading(false)
      }
    }

    if (isOpen) fetchInitialData()
  }, [isOpen, reservationData])

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target

    if (name === "hasCompanions" && !checked) {
      setFormData((prev) => ({
        ...prev,
        hasCompanions: false,
        companionCount: 0,
        companions: [],
      }))
    } else if (name === "companionCount" && formData.hasCompanions) {
      const count = Number.parseInt(value) || 0
      setFormData((prev) => ({
        ...prev,
        [name]: count,
        companions: prev.companions.slice(0, count),
      }))
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: type === "checkbox" ? checked : value || "",
      }))
    }

    if (errors[name]) {
      setErrors((prev) => {
        const updatedErrors = { ...prev }
        delete updatedErrors[name]
        return updatedErrors
      })
    }
  }

  const validateStep = (step) => {
    const newErrors = {}
    const today = new Date().toISOString().split("T")[0]

    if (step === 1) {
      if (!formData.idUser) newErrors.idUser = "Cliente es requerido"
      if (!formData.idPlan) newErrors.idPlan = "Plan es requerido"
      if (!formData.startDate) newErrors.startDate = "Fecha de entrada es requerida"
      if (!formData.endDate) newErrors.endDate = "Fecha de salida es requerida"
      if (formData.startDate && formData.startDate < today) {
        newErrors.startDate = "La fecha de inicio no puede ser en el pasado"
      }

      if (formData.startDate && formData.endDate && formData.startDate > formData.endDate) {
        newErrors.endDate = "La fecha de salida debe ser posterior a la de entrada"
      }
      const validStatuses = ["Confirmado", "Pendiente", "Anulado", "Reservado"]
      if (formData.status && !validStatuses.includes(formData.status)) {
        newErrors.status = `Estado no válido. Use uno de: ${validStatuses.join(", ")}`
      }

      if (formData.hasCompanions && (!formData.companionCount || formData.companionCount <= 0)) {
        newErrors.companionCount = "Debe especificar al menos 1 acompañante"
      }
    } else if (step === 2 && formData.hasCompanions) {
      if (formData.companions.length === 0) {
        newErrors.companions = "Debe agregar al menos un acompañante"
      }
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const nextStep = () => {
    if (validateStep(step)) {
      if (step === 1 && !formData.hasCompanions) {
        setStep(3)
      } else {
        setStep(step + 1)
      }
    }
  }

  const prevStep = () => {
    if (step === 3 && !formData.hasCompanions) {
      setStep(1)
    } else {
      setStep(step - 1)
    }
  }

  // Mejorado: Función para calcular el total de forma consistente
  const calculateTotal = () => {
    const selectedPlan = planes.find((p) => p.idPlan === Number(formData.idPlan))
    if (!selectedPlan) return 0

    const basePrice = selectedPlan.price || selectedPlan.salePrice || 0
    const companionFee = 150
    return basePrice + formData.companions.length * companionFee
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);

      // Validaciones básicas
      if (!formData.idUser || !formData.idPlan || !formData.startDate || !formData.endDate) {
        throw new Error("Faltan datos requeridos para la reserva");
      }

      // Preparar payload sin acompañantes inicialmente
      const payload = {
        idUser: Number(formData.idUser),
        idPlan: Number(formData.idPlan),
        startDate: formData.startDate,
        endDate: formData.endDate,
        status: formData.status || "Reservado",
        total: calculateTotal(),
        paymentMethod: formData.paymentMethod || "Efectivo",
      };

      // Validar fechas
      const today = new Date().toISOString().split("T")[0];
      if (payload.startDate < today) {
        throw new Error("La fecha de inicio no puede ser en el pasado");
      }

      if (payload.startDate > payload.endDate) {
        throw new Error("La fecha de fin debe ser posterior a la de inicio");
      }

      console.log("Enviando payload:", payload);

      // Guardar la reserva primero
      let resultado;
      if (reservationData?.idReservation) {
        resultado = await updateReservation(reservationData.idReservation, payload);
      } else {
        resultado = await createReservation(payload);
      }

      // Si hay acompañantes, guardarlos después de tener el ID de reserva
      if (formData.hasCompanions && formData.companions.length > 0) {
        console.log("Guardando acompañantes para la reserva:", resultado.idReservation);

        const companionsPromises = formData.companions.map(companion => {
          // Solo crear acompañantes que no tengan ID (nuevos)
          if (!companion.idCompanions) {
            return handleSaveCompanionInReservation(companion, resultado.idReservation);
          }
          return Promise.resolve(companion); // Ya existe, no hacer nada
        });

        await Promise.all(companionsPromises);
      }

      console.log("Operación completada con resultado:", resultado);
      onClose();
      onSave(resultado);
    } catch (error) {
      console.error("Error al guardar:", error);
      alert(`Error al guardar: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveCompanionInReservation = async (companionData, reservationId) => {
    try {
      console.log("Iniciando guardado de acompañante:", { companionData, reservationId });

      if (!reservationId) {
        throw new Error("No se puede agregar acompañante sin ID de reserva");
      }

      // 1. Crear el acompañante
      const companionResponse = await createCompanion(companionData);

      // Verificar respuesta
      if (!companionResponse?.idCompanions) {
        console.error("Respuesta inesperada de createCompanion:", companionResponse);
        throw new Error("El servidor no devolvió un ID válido para el acompañante");
      }

      console.log("Acompañante creado, ID:", companionResponse.idCompanions);

      // 2. Asociar a la reserva
      try {
        const associationResponse = await addCompanionReservation(
          reservationId,
          { idCompanions: companionResponse.idCompanions }
        );
        console.log("Asociación exitosa:", associationResponse);
      } catch (associationError) {
        console.error("Error al asociar acompañante:", associationError);
        // Intentar eliminar el acompañante creado si falla la asociación
        try {
          await deleteCompanion(companionResponse.idCompanions);
          console.log("Acompañante eliminado por fallo en asociación");
        } catch (deleteError) {
          console.error("Error al limpiar acompañante:", deleteError);
        }
        throw new Error("Error al asociar acompañante a la reserva");
      }

      // 3. Actualizar estado local
      const savedCompanion = {
        ...companionData,
        idCompanions: companionResponse.idCompanions
      };

      setFormData(prev => ({
        ...prev,
        companions: prev.companions.map(c =>
          c.documentNumber === companionData.documentNumber ? savedCompanion : c
        )
      }));

      return savedCompanion;
    } catch (error) {
      console.error("Error completo en handleSaveCompanionInReservation:", {
        error: error.message,
        companionData,
        reservationId,
        stack: error.stack
      });
      throw error;
    }
  };

  if (!isOpen) return null

  return (
    <div className="reservations-modal-overlay">
      <div className="reservations-modal-container">
        <div className="reservations-modal-header">
          <h2>{reservationData?.idReservation ? "Editar Reserva" : "Nueva Reserva"}</h2>
          <button className="reservations-close-button" onClick={onClose} type="button" aria-label="Cerrar"></button>
        </div>

        {loading && (
          <div className="loading-overlay">
            <div className="loading-spinner"></div>
            <p>Cargando...</p>
          </div>
        )}

        <div className="steps-indicator">
          <div className={`step ${step === 1 ? "active" : ""}`}>1. Datos Reserva</div>
          {formData.hasCompanions && <div className={`step ${step === 2 ? "active" : ""}`}>2. Acompañantes</div>}
          <div className={`step ${step === 3 ? "active" : ""}`}>{formData.hasCompanions ? "3" : "2"}. Pagos</div>
        </div>

        <div className="reservations-modal-body">
          <form onSubmit={handleSubmit} noValidate>
            {step === 1 && (
              <div className="reservations-form-step">
                <div className="reservations-form-grid">
                  <div className={`reservations-form-group ${errors.idUser ? "has-error" : ""}`}>
                    <label htmlFor="idUser">Cliente</label>
                    <select
                      id="idUser"
                      name="idUser"
                      value={formData.idUser || ""}
                      onChange={handleChange}
                      disabled={isReadOnly || loading}
                      aria-invalid={!!errors.idUser}
                      aria-describedby={errors.idUser ? "idUser-error" : undefined}
                    >
                      <option value="">Seleccione un cliente</option>
                      {users.map((user) => (
                        <option key={user.idUser} value={user.idUser}>
                          {user.name} {user.lastName} -({user.identification})
                        </option>
                      ))}
                    </select>
                    {errors.idUser && (
                      <span className="error-message" id="idUser-error">
                        {errors.idUser}
                      </span>
                    )}
                  </div>

                  <div className={`reservations-form-group ${errors.idPlan ? "has-error" : ""}`}>
                    <label htmlFor="idPlan">Plan</label>

                    <select
                      id="idPlan"
                      name="idPlan"
                      value={formData.idPlan || ""}
                      onChange={handleChange}
                      disabled={isReadOnly || loading}
                    >
                      <option value="">Seleccione un plan</option>
                      {planes.map((plan) => (
                        <option key={plan.idPlan} value={plan.idPlan}>
                          {plan.name || plan.nombre} - ${plan.price || plan.precio || plan.total}
                        </option>
                      ))}
                    </select>
                    {errors.idPlan && (
                      <span className="error-message" id="idPlan-error">
                        {errors.idPlan}
                      </span>
                    )}
                  </div>

                  <div className="reservations-date-group">
                    <div className={`reservations-form-group ${errors.startDate ? "has-error" : ""}`}>
                      <label htmlFor="startDate">Fecha Inicio</label>
                      <input
                        type="date"
                        id="startDate"
                        name="startDate"
                        value={formData.startDate || ""}
                        onChange={handleChange}
                        min={new Date().toISOString().split("T")[0]}
                        disabled={isReadOnly || loading}
                        aria-invalid={!!errors.startDate}
                        aria-describedby={errors.startDate ? "startDate-error" : undefined}
                      />
                      {errors.startDate && (
                        <span className="error-message" id="startDate-error">
                          {errors.startDate}
                        </span>
                      )}
                    </div>

                    <div className={`reservations-form-group ${errors.endDate ? "has-error" : ""}`}>
                      <label htmlFor="endDate">Fecha Fin</label>
                      <input
                        type="date"
                        id="endDate"
                        name="endDate"
                        value={formData.endDate || ""}
                        onChange={handleChange}
                        min={formData.startDate || new Date().toISOString().split("T")[0]}
                        disabled={isReadOnly || loading}
                        aria-invalid={!!errors.endDate}
                        aria-describedby={errors.endDate ? "endDate-error" : undefined}
                      />
                      {errors.endDate && (
                        <span className="error-message" id="endDate-error">
                          {errors.endDate}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="companion-controls">
                    <div className="checkbox-group">
                      <label htmlFor="hasCompanions">
                        <input
                          type="checkbox"
                          id="hasCompanions"
                          name="hasCompanions"
                          checked={formData.hasCompanions}
                          onChange={handleChange}
                          disabled={isReadOnly || loading}
                        />
                        ¿Incluye acompañantes?
                      </label>
                    </div>
                    {formData.hasCompanions && (
                      <div className={`form-group ${errors.companionCount ? "has-error" : ""}`}>
                        <label htmlFor="companionCount">Cantidad de acompañantes</label>
                        <input
                          type="number"
                          id="companionCount"
                          name="companionCount"
                          value={formData.companionCount}
                          onChange={handleChange}
                          min="1"
                          max="10"
                          placeholder="Número de acompañantes"
                          disabled={isReadOnly || loading}
                          aria-invalid={!!errors.companionCount}
                          aria-describedby={errors.companionCount ? "companionCount-error" : undefined}
                        />
                        {errors.companionCount && (
                          <span className="error-message" id="companionCount-error">
                            {errors.companionCount}
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
            {step === 2 && formData.hasCompanions && (
              <div className="form-step">
                <h3>Registro de Acompañantes</h3>
                {errors.companions && (
                  <div className="error-banner">
                    <p>{errors.companions}</p>
                  </div>
                )}

                <CompanionsForm
                  onSaveCompanion={(newCompanion) => {
                    setFormData(prev => ({
                      ...prev,
                      companions: [...prev.companions, newCompanion],
                      companionCount: prev.companions.length + 1
                    }));
                  }}
                />

                <div className="companions-section">
                  <TableCompanions
                    companions={formData.companions}
                    onDeleteCompanion={(id) => {
                      setFormData(prev => ({
                        ...prev,
                        companions: prev.companions.filter(c => c.idCompanions !== id),
                        companionCount: prev.companions.length - 1,
                      }));
                    }}
                    isReadOnly={isReadOnly}
                  />
                </div>
              </div>
            )}

            {step === 3 && (
              <div className="form-step">
                <PaymentForm
                  totalAmount={calculateTotal()}
                  onPaymentSubmit={(paymentData) => {
                    const completeData = {
                      ...formData,
                      payment: paymentData,
                      savedCompanions: formData.companions,
                      companionCount: formData.companions.length,
                      total: calculateTotal(),
                    }
                    onSave(completeData)
                    onClose()
                  }}
                />
              </div>
            )}

            <div className="modal-footer">
              {step > 1 && (
                <button type="button" className="reservations-cancel-btn" onClick={prevStep} disabled={loading}>
                  Anterior
                </button>
              )}

              {step < 3 && (
                <button type="button" className="submit-btn" onClick={nextStep} disabled={loading}>
                  {step === 2 ? "Ir a Pago" : "Siguiente"}
                </button>
              )}

              {!isReadOnly && step === 3 && (
                <button type="submit" className="btn btn-primary" disabled={loading}>
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
