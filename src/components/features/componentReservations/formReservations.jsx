/* eslint-disable react/prop-types */
import { useState, useEffect } from "react";
import "./componentsReservations.css";
import { FaUser, FaBed, FaCalendarAlt, FaUsers } from "react-icons/fa";
import CompanionsForm from '../componentCompanions/formCompanions';
import TableCompanions from '../componentCompanions/tableCompanions';
import PaymentForm from '../componentPayments/fromPayments';
function FormReservation({ reservationData, onClose, onSave, isOpen, isReadOnly }) {
  const [step, setStep] = useState(1);

  const [formData, setFormData] = useState({
    client: "",
    plan: "",
    startDate: "",
    endDate: "",
    hasCompanions: false,
    companionCount: 0,
    companionsData: [],
    savedCompanions: [],
    status: "Reservada",
    total: 0
  });

  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (reservationData) {
      setFormData({
        client: reservationData.client || "",
        plan: reservationData.plan || "",
        startDate: reservationData.startDate || "",
        endDate: reservationData.endDate || "",
        hasCompanions: reservationData.hasCompanions || false,
        companionCount: reservationData.companionCount || 0,
        companionsData: reservationData.companionsData || [],
        savedCompanions: reservationData.savedCompanions || [],
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
        companionsData: [],
        savedCompanions: [],
        status: "Reservada",
        total: 0
      });
    }
    setStep(1);
  }, [reservationData, isOpen]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    if (name === 'companionCount' && formData.hasCompanions) {
      const count = parseInt(value) || 0;
      const newCompanions = Array(count).fill().map((_, i) =>
        (formData.companionsData && formData.companionsData[i]) || {
          name: '',
          birthDate: '',
          age: '',
          documentType: '',
          documentNumber: '',
          eps: ''
        }
      );

      setFormData(prev => ({
        ...prev,
        [name]: value,
        companionsData: newCompanions
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: type === 'checkbox' ? checked : value
      }));
    }

    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: null
      }));
    }
  };

  const validateStep = (step) => {
    const newErrors = {};
    const today = new Date().toISOString().split('T')[0];

    if (step === 1) {
      if (!formData.client) newErrors.client = "Cliente es requerido";
      if (!formData.plan) newErrors.plan = "Plan es requerido";
      if (!formData.startDate) newErrors.startDate = "Fecha de entrada es requerida";
      if (!formData.endDate) newErrors.endDate = "Fecha de salida es requerida";

      if (formData.startDate && formData.endDate && formData.startDate > formData.endDate) {
        newErrors.endDate = "La fecha de salida debe ser posterior a la de entrada";
      }

      if (formData.startDate && formData.startDate < today) {
        newErrors.startDate = "La fecha de entrada no puede ser en el pasado";
      }
    }
    else if (step === 2) {
      if (formData.hasCompanions) {
        if (formData.companionCount <= 0) {
          newErrors.companionCount = "Debe especificar al menos 1 acompañante";
        }

        // Validar cada acompañante
        formData.companionsData.forEach((companion, index) => {
          if (!companion.name) newErrors[`companionName_${index}`] = "Nombre es requerido";
          if (!companion.birthDate) newErrors[`companionBirthDate_${index}`] = "Fecha de nacimiento es requerida";
          if (!companion.documentType) newErrors[`companionDocType_${index}`] = "Tipo de documento es requerido";
          if (!companion.documentNumber) newErrors[`companionDocNumber_${index}`] = "Número de documento es requerido";
          if (!companion.eps) newErrors[`companionEps_${index}`] = "EPS es requerida";
        });
      }
    }


    // Mover la validación de acompañantes al paso 2
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const nextStep = () => {
    if (validateStep(step)) {
      setStep(step + 1);
    }
  };

  const prevStep = () => {
    setStep(step - 1);
  };
  const handleSubmit = (e) => {
    e.preventDefault();
    if (validateStep(step)) {
      const calculatedTotal = calculateTotal(formData.plan, formData.companionCount);

      onSave({
        ...formData,
        total: calculatedTotal
      });
      onClose();
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
  const handleCompanionDataChange = (index, e) => {
    const { name, value } = e.target;
    setFormData(prev => {
      const updatedCompanions = [...(prev.companionsData || [])];
      updatedCompanions[index] = {
        ...(updatedCompanions[index] || {}),
        [name]: value
      };
      return {
        ...prev,
        companionsData: updatedCompanions
      };
    });
  };

  const handleDeleteCompanion = (id) => {
    setFormData(prev => ({
      ...prev,
      savedCompanions: (prev.savedCompanions || []).filter(companion => companion.id !== id)
    }));
  };
  const handleSaveCompanion = (index) => {
    const companionToSave = formData.companionsData[index];
    
    if (!companionToSave?.name || !companionToSave?.birthDate ||
      !companionToSave?.documentType || !companionToSave?.documentNumber || !companionToSave?.eps) {
      alert("Por favor complete todos los campos del acompañante");
      return;
    }
  
    const newCompanion = {
      ...companionToSave,
      id: Date.now()
    };

    setFormData(prev => ({
      ...prev,
      savedCompanions: [...(prev.savedCompanions || []), newCompanion],
      companionsData: prev.companionsData.map((comp, i) => 
        i === index ? {
          name: '',
          birthDate: '',
          age: '',
          documentType: '',
          documentNumber: '',
          eps: ''
        } : comp
      )
    }));
  };


  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-container">
        <div className="modal-header">
          <h2>
            {reservationData && reservationData.id ? "Editar Reserva" : "Nueva Reserva"}
          </h2>
          <button className="close-button" onClick={onClose}>×</button>
        </div>

        <div className="steps-indicator">
          <div className={`step ${step === 1 ? 'active' : ''}`}>1. Datos Reserva</div>
          <div className={`step ${step === 2 ? 'active' : ''}`}>2. Acompañantes</div>
          <div className={`step ${step === 3 ? 'active' : ''}`}>3. Pagos</div>
        </div>

        <div className="modal-body">
          <form onSubmit={handleSubmit}>
            {step === 1 && (
              <div className="form-step">
                <div className="form-grid">
                  <div className={`form-group ${errors.client ? 'has-error' : ''}`}>
                    <label htmlFor="client">
                      <FaUser className="input-icon" /> Cliente
                    </label>
                    <input
                      type="text"
                      id="client"
                      name="client"
                      value={formData.client}
                      onChange={handleChange}
                      placeholder="Nombre del cliente"
                      required
                      readOnly={isReadOnly}
                    />
                    {errors.client && <span className="error-message">{errors.client}</span>}
                  </div>

                  <div className={`form-group ${errors.plan ? 'has-error' : ''}`}>
                    <label htmlFor="plan">
                      <FaBed className="input-icon" /> Plan
                    </label>
                    <select
                      id="plan"
                      name="plan"
                      value={formData.plan}
                      onChange={handleChange}
                      required
                      readOnly={isReadOnly}
                    >
                      <option value="">Seleccione un plan</option>
                      <option value="Romántico">Plan Romántico</option>
                      <option value="Empresarial">Plan Empresarial</option>
                      <option value="Pasadia Cumpleaños">Pasadia Cumpleaños</option>
                      <option value="Spa">Plan Spa</option>
                    </select>
                    {errors.plan && <span className="error-message">{errors.plan}</span>}
                  </div>

                  <div className="date-group">
                    <div className={`form-group ${errors.startDate ? 'has-error' : ''}`}>
                      <label htmlFor="startDate">
                        <FaCalendarAlt className="input-icon" /> Fecha Inicio
                      </label>
                      <input
                        type="date"
                        id="startDate"
                        name="startDate"
                        value={formData.startDate}
                        onChange={handleChange}
                        required
                        readOnly={isReadOnly}
                      />
                      {errors.startDate && <span className="error-message">{errors.startDate}</span>}
                    </div>

                    <div className={`form-group ${errors.endDate ? 'has-error' : ''}`}>
                      <label htmlFor="endDate">
                        <FaCalendarAlt className="input-icon" /> Fecha Fin
                      </label>
                      <input
                        type="date"
                        id="endDate"
                        name="endDate"
                        value={formData.endDate}
                        onChange={handleChange}
                        required
                        readOnly={isReadOnly}
                      />
                      {errors.endDate && <span className="error-message">{errors.endDate}</span>}
                    </div>
                  </div>
                  <div className="companion-controls">
                    <div className="checkbox-group">
                      <label>
                        <input
                          type="checkbox"
                          name="hasCompanions"
                          checked={formData.hasCompanions}
                          onChange={handleChange}
                        />
                        ¿Incluye acompañantes?
                      </label>
                    </div>
                    {formData.hasCompanions && (
                      <div className={`form-group ${errors.companionCount ? 'has-error' : ''}`}>
                        <label htmlFor="companionCount">
                          <FaUsers className="input-icon" /> Cantidad de acompañantes
                        </label>
                        <input
                          type="number"
                          id="companionCount"
                          name="companionCount"
                          value={formData.companionCount}
                          onChange={handleChange}
                          min="1"
                          placeholder="Número de acompañantes"
                          readOnly={isReadOnly}
                        />
                        {errors.companionCount && <span className="error-message">{errors.companionCount}</span>}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {step === 2 && (
              <div className="form-step">
                {formData.hasCompanions && (
                  <>
                    <CompanionsForm
                      companionsData={formData.companionsData}
                      onCompanionDataChange={handleCompanionDataChange}
                      onSaveCompanion={handleSaveCompanion}
                      onDeleteCompanion={handleDeleteCompanion}
                    />

                    {formData.savedCompanions?.length > 0 && (
                      <div className="saved-companions-section">
                        <h3>Acompañantes Guardados</h3>
                        <TableCompanions
                          companions={formData.savedCompanions || []}
                          onDeleteCompanion={handleDeleteCompanion}
                        />
                      </div>
                    )}
                  </>
                )}
              </div>
            )}
            {step === 3 && (
              <div className="form-step">
                <PaymentForm
                  totalAmount={calculateTotal(formData.plan, formData.companionCount)}
                  onPaymentSubmit={(paymentData) => {
                    const completeData = {
                      ...formData,
                      payment: paymentData,
                      total: calculateTotal(formData.plan, formData.companionCount)
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
            </div>
            {!isReadOnly && step === 3 && (
              <button type="submit" className="btn btn-primary">
                Guardar Reserva
              </button>
            )}


          </form>
        </div>
      </div >
    </div >
  );
}

export default FormReservation;