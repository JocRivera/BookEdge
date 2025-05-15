import { useState, useEffect } from "react"
import PropTypes from "prop-types"
import "./componentsReservations.css"
import CompanionsForm from "../componentCompanions/formCompanions"
import PaymentForm from "../componentPayments/formPayments"
import TableCompanions from "../componentCompanions/tableCompanions"

import {
  createReservation,
  getAllPlanes,
  getUsers,
  updateReservation,
  getReservationById,
  addCompanionReservation,
  getCabins
} from "../../../services/reservationsService"
import { createCompanion, deleteCompanion } from "../../../services/companionsService"
import {
  addPaymentToReservation,
  getReservationPayments,
} from "../../../services/paymentsService";

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
    cabins: "",
    availableCabins: [],
    selectedCabin: null
  })
  const [errors, setErrors] = useState({})
  const [planes, setPlanes] = useState([])
  const [users, setUsers] = useState([])
  const [cabins, setCabins] = useState([])

  const [loading, setLoading] = useState(false)
  const [tempPayments, setTempPayments] = useState([]);
  const [reservationPayments, setReservationPayments] = useState([]);


  // Cargar datos iniciales
  useEffect(() => {
    const fetchInitialData = async () => {
      if (!isOpen) return;

      try {
        setLoading(true);
        console.log("Iniciando carga de datos iniciales...");

        // 1. Cargar datos básicos (planes y usuarios)
        const [planesData, usersData, cabinsData] = await Promise.all([
          getAllPlanes(),
          getUsers(),
          getCabins()
        ]);
        setPlanes(planesData);
        setUsers(usersData);
        setCabins(cabinsData)
        const availableCabins = cabinsData.filter(cabin => {
          // Verificación exacta del estado (case-sensitive)
          const isAvailable = cabin.status === "En Servicio";

          // Verificación de capacidad (con protección contra NaN)
          const requiredCapacity = Number(formData.companionCount) + 1;
          const cabinCapacity = Number(cabin.capacity) || 0;
          const hasCapacity = cabinCapacity >= requiredCapacity;

          console.log(`Cabaña: ${cabin.name} | Estado: ${cabin.status} | Cumple: ${isAvailable && hasCapacity}`);

          return isAvailable && hasCapacity;
        });
        console.log("Datos brutos de cabañas:", cabinsData);

        setFormData(prev => {
          const newAvailableCabins = availableCabins;
          console.log("Actualizando estado con:", newAvailableCabins);

          return {
            ...prev,
            availableCabins: newAvailableCabins,
            updateFlag: !prev.updateFlag
          };
        });

        // 2. Manejo de reserva existente
        if (reservationData) {
          console.log("Cargando datos de reserva existente:", reservationData);
          if (reservationData.idReservation) {
            try {
              const payments = await getReservationPayments(reservationData.idReservation);
              setReservationPayments(Array.isArray(payments) ? payments : []);
            } catch (error) {
              console.error("Error al cargar pagos:", error);
              setReservationPayments([]);
            }
          }


          let freshData = reservationData;

          // 2.1 Obtener datos actualizados de la reserva
          if (reservationData.idReservation) {
            try {
              freshData = await getReservationById(reservationData.idReservation) || reservationData;
              console.log("Datos actualizados de la reserva:", freshData);
            } catch (error) {
              console.warn("Error obteniendo datos actualizados:", error);
              // Continuamos con los datos originales si falla
            }
          }

          if (freshData.idReservation) {
            try {
              const payments = await getReservationPayments(freshData.idReservation);
              const safePayments = (Array.isArray(payments?.data) ? payments.data :
                (Array.isArray(payments)) ? payments : []);

              setReservationPayments(safePayments.filter(p => p?.id && p?.amount));
            } catch (error) {
              console.error("Payment load error:", error);
              setReservationPayments([]);
            }
          }

          // 2.3 Preparar datos del formulario
          const companions = Array.isArray(freshData.companions) ? freshData.companions : [];

          setFormData({
            idUser: freshData.idUser ? Number(freshData.idUser) : "",
            idPlan: freshData.idPlan ? Number(freshData.idPlan) : "",
            idCabin: freshData.idCabin ? Number(freshData.idCabin) : "",
            startDate: freshData.startDate || "",
            endDate: freshData.endDate || "",
            hasCompanions: companions.length > 0,
            companionCount: companions.length,
            companions: companions,
            status: freshData.status || "Reservado",
            total: freshData.total || 0,
            paymentMethod: freshData.paymentMethod || "Efectivo",
          });
        }
        // 3. Inicializar nueva reserva
        else {
          console.log("Inicializando nueva reserva");
          setFormData({
            idUser: "",
            idPlan: "",
            idCabin: "",
            startDate: "",
            endDate: "",
            hasCompanions: false,
            companionCount: 0,
            companions: [],
            status: "Reservado",
            total: 0,
            paymentMethod: "Efectivo",
          });
          setReservationPayments([]);
          setTempPayments([])
        }
      } catch (error) {
        console.error("Error crítico en fetchInitialData:", {
          message: error.message,
          stack: error.stack
        });
        alert(`Error al cargar datos: ${error.message}`);
      } finally {
        setLoading(false);
        console.log("Finalizada carga de datos iniciales");
      }
    };

    fetchInitialData();
  }, [isOpen, reservationData]);
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target

    if (name === "hasCompanions") {
      setFormData((prev) => ({
        ...prev,
        hasCompanions: checked,
        companionCount: checked ? prev.companionCount || 1 : 0,
        companions: checked ? prev.companions : [],
      }))
    } else if (name === "companionCount" && formData.hasCompanions) {
      const count = Math.max(0, parseInt(value) || 0)
      setFormData((prev) => ({
        ...prev,
        [name]: count,
        // No recortamos los companions aquí para evitar pérdida de datos
      }))
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: type === "checkbox" ? checked : value,
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
      } else if (formData.companions.length !== formData.companionCount) {
        newErrors.companions = `Debe agregar ${formData.companionCount} acompañantes (actualmente: ${formData.companions.length})`
      }
      if (step === (formData.hasCompanions ? 3 : 2)) {
        if (!formData.selectedCabin) {
          newErrors.selectedCabin = "Debe seleccionar una cabaña";
        }
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
    if (step === 4 && !formData.hasCompanions) {
      // Si estamos en pagos (paso 4) y no hay acompañantes, volver al paso 1
      setStep(1)
    } else if (step === 3 && !formData.hasCompanions) {
      // Si estamos en disponibilidad (paso 3) y no hay acompañantes, volver al paso 1
      setStep(1)
    } else {
      setStep(step - 1)
    }
  }

  const calculateTotal = () => {
    const selectedPlan = planes.find((p) => p.idPlan === Number(formData.idPlan))
    if (!selectedPlan) return 0

    // Usar precio de venta si está disponible, si no usar precio regular
    const basePrice = selectedPlan.price || selectedPlan.salePrice || selectedPlan.precio || 0
    const companionFee = 150  // Tarifa por acompañante
    return basePrice + formData.companions.length * companionFee
  }

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateStep(3)) {
      return;
    }

    try {
      setLoading(true);

      // Preparar payload
      const payload = {
        idUser: Number(formData.idUser),
        idPlan: Number(formData.idPlan),
        idCabin: Number(formData.selectedCabin),
        startDate: formData.startDate,
        endDate: formData.endDate,
        status: formData.status || "Reservado",
        total: calculateTotal(),
        paymentMethod: formData.paymentMethod || "Efectivo",
      };

      // Guardar la reserva
      let resultado;
      if (reservationData?.idReservation) {
        resultado = await updateReservation(reservationData.idReservation, payload);
      } else {
        resultado = await createReservation(payload);
      }

      if (!resultado?.idReservation) {
        throw new Error("No se recibió un ID de reserva válido del servidor");
      }

      // Guardar acompañantes si existen
      if (formData.hasCompanions && formData.companions.length > 0) {
        for (const companion of formData.companions) {
          if (!companion.idCompanions) {
            await handleSaveCompanionInReservation(companion, resultado.idReservation);
          }
        }
      }

      // Guardar pagos temporales si existen
      if (tempPayments.length > 0) {
        const paymentResults = await Promise.allSettled(
          tempPayments.map(payment =>
            addPaymentToReservation({
              ...payment,
              idReservation: resultado.idReservation
            })
          )
        );

        // Manejar resultados de los pagos
        paymentResults.forEach((result, index) => {
          if (result.status === 'rejected') {
            console.error(`Error al guardar pago ${tempPayments[index].tempId}:`, result.reason);
          }
        });

        setTempPayments([]);
      }

      onClose();
      onSave(resultado);
    } catch (error) {
      console.error("Error al guardar:", error);
      alert(`Error al guardar: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleCabinChange = (e) => {
    const { value } = e.target;
    setFormData(prev => ({
      ...prev,
      selectedCabin: value,
      idCabin: value, // Actualiza el idCabin en el formulario
    }));
  };

  const handleSaveCompanionInReservation = async (companionData, reservationId) => {
    try {
      console.log("Iniciando guardado de acompañante:", { companionData, reservationId });

      if (!reservationId) {
        throw new Error("No se puede agregar acompañante sin ID de reserva");
      }

      // 1. Crear el acompañante
      const companionResponse = await createCompanion(companionData);
      if (!companionResponse?.idCompanions) {
        throw new Error("El servidor no devolvió un ID válido para el acompañante");
      }

      // 2. Asociar a la reserva
      try {
        await addCompanionReservation(reservationId, { idCompanions: companionResponse.idCompanions });
      } catch (error) {
        // Intentar eliminar el acompañante si falla la asociación
        await deleteCompanion(companionResponse.idCompanions).catch(error);
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
      console.error("Error completo en handleSaveCompanionInReservation:", error);
      throw error;
    }
  };

  const handleAddPayment = async (paymentData) => {
    try {
      setLoading(true);

      // Validaciones básicas
      if (!paymentData.amount || isNaN(parseFloat(paymentData.amount))) {
        throw new Error("El monto del pago no es válido");
      }

      const amount = parseFloat(paymentData.amount);
      if (amount <= 0) {
        throw new Error("El monto debe ser mayor que cero");
      }

      // Crear objeto de pago
      const newPayment = {
        ...paymentData,
        amount: amount,
        status: paymentData.status || 'Pendiente',
        paymentDate: paymentData.paymentDate || new Date().toISOString().split('T')[0],
        paymentMethod: paymentData.paymentMethod || 'Efectivo'
      };

      // Si ya tenemos ID de reserva, guardar en el backend
      if (reservationData?.idReservation) {
        const savedPayment = await addPaymentToReservation({
          ...newPayment,
          idReservation: reservationData.idReservation
        });

        // Actualizar estado con el pago confirmado
        setReservationPayments(prev => [...prev, savedPayment]);
        return savedPayment;
      } else {
        // Si no hay ID de reserva, guardar como temporal
        const tempPayment = {
          ...newPayment,
          tempId: `temp-${Date.now()}`,
          isTemp: true
        };
        setTempPayments(prev => [...prev, tempPayment]);
        return tempPayment;
      }
    } catch (error) {
      console.error("Error al agregar pago:", error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="reservations-modal-overlay">
      <div className="reservations-modal-container">
        <div className="reservations-modal-header">
          <h2>{reservationData?.idReservation ? "Editar Reserva" : "Nueva Reserva"}</h2>
          <button
            className="reservations-close-button"
            onClick={onClose}
            type="button"
            aria-label="Cerrar"
            disabled={loading}
          >
            &times;
          </button>
        </div>

        <div className="steps-indicator">
          <div className={`step ${step === 1 ? "active" : ""}`}>1. Datos Reserva</div>
          {formData.hasCompanions && <div className={`step ${step === 2 ? "active" : ""}`}>2. Acompañantes</div>}
          <div className={`step ${step === (formData.hasCompanions ? 3 : 2) ? "active" : ""}`}>
            {formData.hasCompanions ? "3" : "2"}. Disponibilidad
          </div>
          <div className={`step ${step === (formData.hasCompanions ? 4 : 3) ? "active" : ""}`}>
            {formData.hasCompanions ? "4" : "3"}. Pagos
          </div>
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
                      required
                    >
                      <option value="">Seleccione un cliente</option>
                      {users.map((user) => (
                        <option key={user.idUser} value={user.idUser}>
                          {user.name} {user.lastName} - ({user.identification})
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
                      required
                    >
                      <option value="">Seleccione un plan</option>
                      {planes.map((plan) => (
                        <option key={plan.idPlan} value={plan.idPlan}>
                          {plan.name || plan.nombre} - ${plan.price || plan.precio || plan.salePrice || plan.total}
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
                        required
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
                        required
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
                          required={formData.hasCompanions}
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
                {errors.companions && (
                  <div className="error-banner">
                    <p>{errors.companions}</p>
                  </div>
                )}

                <CompanionsForm
                  onSaveCompanion={(newCompanion) => {
                    setFormData(prev => ({
                      ...prev,
                      companions: [...prev.companions, newCompanion]
                    }));
                  }}
                  maxCompanions={formData.companionCount}
                  currentCompanionsCount={formData.companions.length}
                  disabled={formData.companions.length >= formData.companionCount || isReadOnly || loading}
                />

                <div className="companions-section">
                  <TableCompanions
                    companions={formData.companions}
                    onDeleteCompanion={(id) => {
                      if (isReadOnly || loading) return;

                      setFormData(prev => ({
                        ...prev,
                        companions: prev.companions.filter(c => c.idCompanions !== id)
                      }));
                    }}
                    isReadOnly={isReadOnly || loading}
                  />
                </div>
              </div>
            )}

            {step === (formData.hasCompanions ? 3 : 2) && (
              <div className="form-step">
                <h3>Selecciona tu cabaña</h3>
                <p className="availability-subtitle">
                  Disponibles para {formData.companionCount + 1} personas
                </p>

                {/* Contenedor de cabañas con validación */}
                <div className="cabins-grid">
                  {formData.availableCabins?.length > 0 ? (
                    formData.availableCabins.map((cabin) => {
                      console.log("Renderizando cabaña:", cabin);
                      return (
                        <div
                          key={`cabin-${cabin.idCabin}`}
                          className={`cabin-card ${formData.selectedCabin === cabin.idCabin ? "selected" : ""
                            }`}
                          onClick={() =>
                            handleCabinChange({
                              target: {
                                value: cabin.idCabin,
                                name: "selectedCabin"
                              }
                            })
                          }
                        >
                          <div className="cabin-header">
                            <h4>{cabin.name}</h4>
                            <span className="cabin-capacity">
                              👥 {cabin.capacity} personas
                            </span>
                          </div>

                          <div className="cabin-description">
                            {cabin.description || "Cabaña con todas las comodidades"}
                          </div>


                          <button
                            className="select-button"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleCabinChange({
                                target: {
                                  value: cabin.idCabin,
                                  name: "selectedCabin"
                                }
                              });
                            }}
                          >
                            {formData.selectedCabin === cabin.idCabin
                              ? "✓ Seleccionada"
                              : "Seleccionar"}
                          </button>
                        </div>
                      );
                    })
                  ) : (
                    <div className="no-cabins-message">
                      {loading ? (
                        <p>Cargando cabañas disponibles...</p>
                      ) : (
                        <p>
                          No hay cabañas disponibles que cumplan con los criterios actuales.
                          <br />
                          <small>
                            Estado requerido: &apos;En Servicio&apos; | Capacidad mínima:{" "}
                            {formData.companionCount + 1} personas
                          </small>
                        </p>
                      )}
                    </div>
                  )}
                </div>

                {/* Mensaje de error */}
                {errors.selectedCabin && (
                  <div className="error-message" style={{ marginTop: "10px" }}>
                    {errors.selectedCabin}
                  </div>
                )}

                {/* Detalles de la cabaña seleccionada */}
                {formData.selectedCabin && (
                  <div className="selected-cabin-details">
                    <h4>Detalles de tu selección:</h4>
                    <p>
                      {cabins.find((c) => c.idCabin === Number(formData.selectedCabin))
                        ?.description || "Descripción no disponible"}
                    </p>
                  </div>
                )}


                {/* Debug (puedes eliminar esto en producción) */}
                <div style={{ display: "none" }}>
                  Debug Data:
                  <pre>
                    {JSON.stringify(
                      {
                        availableCabins: formData.availableCabins,
                        selectedCabin: formData.selectedCabin,
                        cabinsData: cabins
                      }, null, 2)}</pre>
                </div>
              </div>
            )}

            {step === (formData.hasCompanions ? 4 : 3) && (
              <div className="form-step">
                {/* Sección de Formulario de Pago */}
                <div className="payment-form-section">
                  <PaymentForm
                    totalAmount={calculateTotal()}
                    onPaymentSubmit={async (paymentData) => {
                      try {
                        await handleAddPayment(paymentData);
                      } catch (error) {
                        console.error("Error al agregar pago:", error);
                      }
                    }}
                    disabled={!reservationData?.idReservation || isReadOnly || loading}
                  />
                </div>

                {/* Sección de Lista de Pagos */}
                <div className="payment-list-section">
                  <div className="payment-summary">
                    <div className="summary-item">
                      <span>Total Reserva:</span>
                      <strong>${calculateTotal().toFixed(2)}</strong>
                    </div>
                    <div className="summary-item">
                      <span>Total Pagado:</span>
                      <strong>${[...reservationPayments, ...tempPayments]
                        .reduce((sum, p) => sum + (Number(p.amount) || 0), 0)
                        .toFixed(2)}</strong>
                    </div>
                    <div className="summary-item">
                      <span>Saldo Pendiente:</span>
                      <strong>${(calculateTotal() -
                        [...reservationPayments, ...tempPayments]
                          .reduce((sum, p) => sum + (Number(p.amount) || 0), 0))
                        .toFixed(2)}</strong>
                    </div>
                  </div>
                </div>
              </div>
            )}

            <div className="modal-footer">
              {step > 1 && (
                <button
                  type="button"
                  className="reservations-cancel-btn"
                  onClick={prevStep}
                  disabled={loading}
                >
                  Anterior
                </button>
              )}

              {step < (formData.hasCompanions ? 4 : 3) && (
                <button
                  type="button"
                  className="submit-btn"
                  onClick={nextStep}
                  disabled={loading}
                >
                  {step === (formData.hasCompanions ? 3 : 2) ? "Ir a Pagos" :
                    step === 2 ? "Verificar Disponibilidad" : "Siguiente"}
                </button>
              )}

              {!isReadOnly && step === (formData.hasCompanions ? 4 : 3) && (
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={loading || !formData.availabilityChecked}
                >
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