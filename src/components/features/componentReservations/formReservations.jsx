import { useState, useEffect } from "react";
import PropTypes from "prop-types";
import "./componentsReservations.css";
import CompanionsForm from '../componentCompanions/formCompanions';
import PaymentForm from '../componentPayments/fromPayments.jsx';
import TableCompanions from "../componentCompanions/tableCompanions";
import { createReservation } from "../../../services/reservationsService.jsx";

function FormReservation({
  reservationData = null,
  onClose,
  onSave,
  isOpen,
  isReadOnly = false
}) {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    client: "",
    plan: "",
    startDate: "",
    endDate: "",
    hasCompanions: false,
    companionCount: 0,
    companions: [],
    status: "Reservada",
    total: 0
  });

  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (isOpen) {
      if (reservationData) {
        setFormData({
          client: reservationData.client || "",
          plan: reservationData.plan || "",
          startDate: reservationData.startDate || "",
          endDate: reservationData.endDate || "",
          hasCompanions: reservationData.hasCompanions || false,
          companionCount: reservationData.companionCount || 0,
          companions: reservationData.savedCompanions || [],
          status: reservationData.status || "Reservada",
          total: reservationData.total || 0
        });
      } else {
        setFormData({
          client: "",
          plan: "",
          startDate: "",
          endDate: "",
          hasCompanions: false,
          companionCount: 0,
          companions: [],
          status: "Reservada",
          total: 0
        });
      }
      setStep(1);
      setErrors({});
    }
  }, [reservationData, isOpen]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    if (name === 'hasCompanions' && !checked) {
      setFormData(prev => ({
        ...prev,
        hasCompanions: false,
        companionCount: 0,
        companions: []
      }));
    } else if (name === 'companionCount' && formData.hasCompanions) {
      const count = parseInt(value) || 0;
      setFormData(prev => ({
        ...prev,
        [name]: count,
        companions: prev.companions.slice(0, count)
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: type === 'checkbox' ? checked : value
      }));
    }

    if (errors[name]) {
      setErrors(prev => {
        const updatedErrors = { ...prev };
        delete updatedErrors[name];
        return updatedErrors;
      });
    }
  };

  const validateStep = (step) => {
    const newErrors = {};
    const today = new Date().toISOString().split('T')[0];

    if (step === 1) {
      if (!formData.client.trim()) newErrors.client = "Cliente es requerido";
      if (!formData.plan) newErrors.plan = "Plan es requerido";
      if (!formData.startDate) newErrors.startDate = "Fecha de entrada es requerida";
      if (!formData.endDate) newErrors.endDate = "Fecha de salida es requerida";

      if (formData.startDate && formData.endDate && formData.startDate > formData.endDate) {
        newErrors.endDate = "La fecha de salida debe ser posterior a la de entrada";
      }

      if (formData.startDate && formData.startDate < today) {
        newErrors.startDate = "La fecha de entrada no puede ser en el pasado";
      }

      if (formData.hasCompanions && (!formData.companionCount || formData.companionCount <= 0)) {
        newErrors.companionCount = "Debe especificar al menos 1 acompañante";
      }
    }
    else if (step === 2 && formData.hasCompanions) {
      if (formData.companions.length === 0) {
        newErrors.companions = "Debe agregar al menos un acompañante";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const nextStep = () => {
    if (validateStep(step)) {
      if (step === 1 && !formData.hasCompanions) {
        setStep(3);
      } else {
        setStep(step + 1);
      }
    }
  };

  const prevStep = () => {
    if (step === 3 && !formData.hasCompanions) {
      setStep(1);
    } else {
      setStep(step - 1);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (validateStep(step)) {
      const calculatedTotal = calculateTotal(formData.plan, formData.companions.length);

      await createReservation ({
        ...formData,
        savedCompanions: formData.companions,
        companionCount: formData.companions.length,
        total: calculatedTotal
      });
      onClose();
      onSave();
     
    
    }
  };

  const calculateTotal = (plan, companions) => {
    const basePrices = {
      "Romántico": 750,
      "Empresarial": 600,
      "Pasadia Cumpleaños": 400,
      "Spa": 900
    };

    const companionFee = 150;
    const basePrice = basePrices[plan] || 0;
    const companionsTotal = formData.hasCompanions ? companions * companionFee : 0;

    return basePrice + companionsTotal;
  };
  const handleSaveCompanionInReservation = (newCompanion) => {
    console.log('Nuevo acompañante a guardar:', newCompanion);
    setFormData(prev => {
      // Verificar si ya existe
      const exists = prev.companions.some(c =>
        c.documentNumber === newCompanion.documentNumber
      );

      if (!exists) {
        return {
          ...prev,
          companions: [...prev.companions, {
            ...newCompanion,
            id: `${newCompanion.documentNumber}-${Date.now()}`
          }],
          companionCount: prev.companions.length + 1
        };
      }
      return prev;
    });
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-container">
        <div className="modal-header">
          <h2>
            {reservationData?.id ? "Editar Reserva" : "Nueva Reserva"}
          </h2>
          <button className="close-button" onClick={onClose} type="button" aria-label="Cerrar"></button>
        </div>

        <div className="steps-indicator">
          <div className={`step ${step === 1 ? 'active' : ''}`}>1. Datos Reserva</div>
          {formData.hasCompanions && (
            <div className={`step ${step === 2 ? 'active' : ''}`}>2. Acompañantes</div>
          )}
          <div className={`step ${step === 3 ? 'active' : ''}`}>{formData.hasCompanions ? '3' : '2'}. Pagos</div>
        </div>

        <div className="modal-body">
          <form onSubmit={handleSubmit} noValidate>
            <div className="form-step">
              <div className="form-grid">
                <div className={`form-group ${errors.client ? 'has-error' : ''}`}>
                  <label htmlFor="client">
                    Cliente
                  </label>
                  <input
                    type="text"
                    id="client"
                    name="client"
                    value={formData.idUser}
                    onChange={handleChange}
                    placeholder="Nombre del cliente"
                    disabled={isReadOnly}
                    aria-invalid={!!errors.idUser}
                    aria-describedby={errors.i ? "client-error" : undefined}
                  />
                  {errors.client && <span className="error-message" id="client-error">{errors.client}</span>}
                </div>

                <div className={`form-group ${errors.plan ? 'has-error' : ''}`}>
                  <label htmlFor="plan">
                    Plan
                  </label>
                  <select
                    id="plan"
                    name="plan"
                    value={formData.plan}
                    onChange={handleChange}
                    disabled={isReadOnly}
                    aria-invalid={!!errors.plan}
                    aria-describedby={errors.plan ? "plan-error" : undefined}
                  >
                    <option value="">Seleccione un plan</option>
                    <option value="Romántico">Plan Romántico</option>
                    <option value="Empresarial">Plan Empresarial</option>
                    <option value="Pasadia Cumpleaños">Pasadia Cumpleaños</option>
                    <option value="Spa">Plan Spa</option>
                  </select>
                  {errors.plan && <span className="error-message" id="plan-error">{errors.plan}</span>}
                </div>

                <div className="date-group">
                  <div className={`form-group ${errors.startDate ? 'has-error' : ''}`}>
                    <label htmlFor="startDate">
                      Fecha Inicio
                    </label>
                    <input
                      type="date"
                      id="startDate"
                      name="startDate"
                      value={formData.startDate}
                      onChange={handleChange}
                      min={new Date().toISOString().split('T')[0]}
                      disabled={isReadOnly}
                      aria-invalid={!!errors.startDate}
                      aria-describedby={errors.startDate ? "startDate-error" : undefined}
                    />
                    {errors.startDate && <span className="error-message" id="startDate-error">{errors.startDate}</span>}
                  </div>

                  <div className={`form-group ${errors.endDate ? 'has-error' : ''}`}>
                    <label htmlFor="endDate">
                      Fecha Fin
                    </label>
                    <input
                      type="date"
                      id="endDate"
                      name="endDate"
                      value={formData.endDate}
                      onChange={handleChange}
                      min={formData.startDate || new Date().toISOString().split('T')[0]}
                      disabled={isReadOnly}
                      aria-invalid={!!errors.endDate}
                      aria-describedby={errors.endDate ? "endDate-error" : undefined}
                    />
                    {errors.endDate && <span className="error-message" id="endDate-error">{errors.endDate}</span>}
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
                        disabled={isReadOnly}
                      />
                      ¿Incluye acompañantes?
                    </label>
                  </div>
                  {formData.hasCompanions && (
                    <div className={`form-group ${errors.companionCount ? 'has-error' : ''}`}>
                      <label htmlFor="companionCount">
                        Cantidad de acompañantes
                      </label>
                      <input
                        type="number"
                        id="companionCount"
                        name="companionCount"
                        value={formData.companionCount}
                        onChange={handleChange}
                        min="1"
                        max="10"
                        placeholder="Número de acompañantes"
                        disabled={isReadOnly}
                        aria-invalid={!!errors.companionCount}
                        aria-describedby={errors.companionCount ? "companionCount-error" : undefined}
                      />
                      {errors.companionCount && <span className="error-message" id="companionCount-error">{errors.companionCount}</span>}
                    </div>
                  )}
                </div>
              </div>
            </div>
            {step === 2 && formData.hasCompanions && (
              <div className="form-step">
                <h3>Registro de Acompañantes</h3>
                {errors.companions && (
                  <div className="error-banner">
                    <p>{errors.companions}</p>
                  </div>
                )}

                <CompanionsForm
                  onSaveCompanion={handleSaveCompanionInReservation}
                />

                <h4>Acompañantes Registrados</h4>
                <TableCompanions
                  companions={formData.companions}
                  onDeleteCompanion={(id) => {
                    setFormData(prev => ({
                      ...prev,
                      companions: prev.companions.filter(c => c.id !== id),
                      companionCount: prev.companions.length - 1
                    }));
                  }}
                />
              </div>
            )}

            {step === 3 && (
              <div className="form-step">
                <PaymentForm
                  totalAmount={calculateTotal(formData.plan, formData.companions.length)}
                  onPaymentSubmit={(paymentData) => {
                    const completeData = {
                      ...formData,
                      payment: paymentData,
                      savedCompanions: formData.companions,
                      companionCount: formData.companions.length,
                      total: calculateTotal(formData.plan, formData.companions.length)
                    };
                    onSave(completeData);
                    onClose();
                  }}
                />
              </div>
            )}

            <div className="modal-footer">
              {step > 1 && (
                <button type="button" className="cancel-btn" onClick={prevStep}>
                  Anterior
                </button>
              )}

              {step < 3 && (
                <button type="button" className="submit-btn" onClick={nextStep}>
                  {step === 2 ? 'Ir a Pago' : 'Siguiente'}
                </button>
              )}

              {!isReadOnly && step === 3 && (
                <button type="submit" className="btn btn-primary">
                  Guardar Reserva
                </button>
              )}
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

FormReservation.propTypes = {
  reservationData: PropTypes.object,
  onClose: PropTypes.func.isRequired,
  onSave: PropTypes.func.isRequired,
  isOpen: PropTypes.bool.isRequired,
  isReadOnly: PropTypes.bool
};

export default FormReservation;