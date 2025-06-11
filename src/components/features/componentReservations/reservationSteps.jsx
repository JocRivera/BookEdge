"use client"

import { toast } from "react-toastify"
import "./componentsReservations.css"
import { useState, useRef } from "react"
import PropTypes from "prop-types"
import { planHasAccommodation } from "./reservationUtils"

// Función para formatear moneda
const formatCurrency = (amount) => {
  return new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount || 0)
}

// Componente de selector de cantidad
function QuantitySelector({ value, onChange, min = 0, max = 99, disabled = false }) {
  const handleDecrease = () => {
    if (value > min) {
      onChange(value - 1)
    }
  }

  const handleIncrease = () => {
    if (value < max) {
      onChange(value + 1)
    }
  }

  const handleInputChange = (e) => {
    const newValue = Number.parseInt(e.target.value) || 0
    if (newValue >= min && newValue <= max) {
      onChange(newValue)
    }
  }

  return (
    <div className="quantity-selector">
      <button
        type="button"
        className="quantity-btn decrease"
        onClick={handleDecrease}
        disabled={disabled || value <= min}
        aria-label="Disminuir cantidad"
      >
        −
      </button>
      <input
        type="number"
        className="quantity-input"
        value={value}
        onChange={handleInputChange}
        min={min}
        max={max}
        disabled={disabled}
        aria-label="Cantidad"
      />
      <button
        type="button"
        className="quantity-btn increase"
        onClick={handleIncrease}
        disabled={disabled || value >= max}
        aria-label="Aumentar cantidad"
      >
        +
      </button>
    </div>
  )
}

// ==========================
// PASO 1: INFORMACIÓN BÁSICA
// ==========================
export function BasicInfoStep({
  formData,
  users = [],
  planes = [],
  loading,
  isReadOnly,
  onChange,
  isClientMode = false,
  clientUser = null,
  errors = {},
  setFieldError,
}) {
  const [searchTerm, setSearchTerm] = useState("");
  const [showSuggestions, setShowSuggestions] = useState(false);

  const companionCount = Number(formData.companionCount) || 0;
  const totalGuests = companionCount + 1;

  // Validación en tiempo real
  const handleFieldChange = (e) => {
    onChange(e);
    const { name, value } = e.target;
    let error = "";

    if (name === "idUser" && !value) error = "Cliente es requerido";
    if (name === "idPlan" && !value) error = "Plan es requerido";
    if (name === "startDate" && !value) error = "Fecha de inicio es requerida";
    if (name === "endDate" && !value) error = "Fecha de fin es requerida";
    if (name === "companionCount" && formData.hasCompanions && (!value || value < 1)) error = "Debe especificar al menos 1 acompañante";

    setFieldError && setFieldError(name, error);
  };

  // Validación de fechas
  const handleDateChange = (e) => {
    const { name, value } = e.target

    // Validate that end date is not before start date
    if (name === "endDate" && formData.startDate && value < formData.startDate) {
      toast.error("La fecha de fin no puede ser anterior a la fecha de inicio", {
        position: "top-right",
        autoClose: 5000,
      })
      return
    }

    // Validate that dates are not in the past
    const today = new Date().toISOString().split("T")[0]
    if (value < today) {
      toast.warning("Se recomienda no seleccionar fechas pasadas", {
        position: "top-right",
        autoClose: 5000,
      })
    }

    handleFieldChange(e)

    // If end date is before the new start date, clear it
    if (name === "startDate" && formData.endDate && value > formData.endDate) {
      setTimeout(() => {
        onChange({ target: { name: "endDate", value: "" } })
        toast.info("Fecha de fin actualizada automáticamente", {
          position: "top-right",
          autoClose: 3000,
        })
      }, 0)
    }
  }

  // Generar la fecha local en formato YYYY-MM-DD
  const todayLocal = new Date();
  const yyyy = todayLocal.getFullYear();
  const mm = String(todayLocal.getMonth() + 1).padStart(2, '0');
  const dd = String(todayLocal.getDate()).padStart(2, '0');
  const todayStr = `${yyyy}-${mm}-${dd}`;

  const selectedPlan = planes.find(p => p.idPlan === Number(formData.idPlan));
  const requiereAlojamiento = selectedPlan && planHasAccommodation(selectedPlan);

  console.log("Cabins:", formData.availableCabins);
  console.log("Bedrooms:", formData.availableBedrooms);
  console.log("selectedPlan:", selectedPlan);
  console.log("planHasAccommodation(selectedPlan):", planHasAccommodation(selectedPlan));
  console.log("totalGuests:", totalGuests);

  return (
    <div className="step-content">
      {/* Primera fila - Cliente y Plan */}
      <div className="form-row">
        <div className="form-group">
          <label htmlFor="idUser" className="form-label">
            Cliente *
          </label>
          {isClientMode ? (
            <div className="client-info-display">
              <div className="client-card">
                <div className="client-avatar">{clientUser?.name?.charAt(0)?.toUpperCase() || "C"}</div>
                <div className="client-details">
                  <h4>{clientUser?.name || "Cliente"}</h4>
                  <p>{clientUser?.email || "Sin email"}</p>
                  <span className="client-id">ID: {clientUser?.idUser}</span>
                </div>
                <span className="client-mode-badge">Tú</span>
              </div>
            </div>
          ) : (
            <div className="user-search-container" style={{ position: "relative" }}>
              <input
                type="text"
                className={`user-search-input form-input${errors.idUser ? " error" : ""}`}
                placeholder="Buscar cliente por nombre o identificación"
                value={
                  formData.idUser
                    ? users.find(u => u.idUser === Number(formData.idUser))?.name + " - " + users.find(u => u.idUser === Number(formData.idUser))?.identification
                    : searchTerm
                }
                onChange={e => {
                  setSearchTerm(e.target.value);
                  setShowSuggestions(true);
                  onChange({ target: { name: "idUser", value: "" } });
                  setFieldError && setFieldError("idUser", "Cliente es requerido");
                }}
                onFocus={() => setShowSuggestions(true)}
                disabled={loading || isReadOnly}
                autoComplete="off"
              />
              {showSuggestions && searchTerm && (
                <ul className="autocomplete-suggestions">
                  {users
                    .filter(
                      user =>
                        user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                        (user.identification && user.identification.toLowerCase().includes(searchTerm.toLowerCase()))
                    )
                    .map(user => (
                      <li
                        key={user.idUser}
                        onClick={() => {
                          onChange({ target: { name: "idUser", value: user.idUser } });
                          setSearchTerm(user.name + " - " + user.identification);
                          setShowSuggestions(false);
                          setFieldError && setFieldError("idUser", "");
                        }}
                      >
                        {user.name} - {user.identification}
                      </li>
                    ))}
                  {users.filter(
                    user =>
                      user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                      (user.identification && user.identification.toLowerCase().includes(searchTerm.toLowerCase()))
                  ).length === 0 && (
                      <li className="no-suggestions">No hay resultados</li>
                    )}
                </ul>
              )}
            </div>
          )}
          {errors.idUser && <span className="error-message">{errors.idUser}</span>}
        </div>

        <div className="form-group">
          <label htmlFor="idPlan" className="form-label">
            Plan *
          </label>
          <select
            id="idPlan"
            name="idPlan"
            value={formData.idPlan}
            onChange={handleFieldChange}
            disabled={loading || isReadOnly}
            className={`form-input${errors.idPlan ? " error" : ""}`}
          >
            <option value="">Seleccione un plan</option>
            {planes.map((plan) => (
              <option key={plan.idPlan} value={plan.idPlan}>
                {plan.name} - {formatCurrency(plan.salePrice || plan.price)}
              </option>
            ))}
          </select>
          {errors.idPlan && <span className="error-message">{errors.idPlan}</span>}
        </div>
      </div>

      {/* Segunda fila - Fechas */}
      <div className="form-row">
        <div className="form-group">
          <label htmlFor="startDate" className="form-label">
            Fecha de Inicio *
          </label>
          <input
            type="date"
            id="startDate"
            name="startDate"
            value={formData.startDate}
            onChange={handleDateChange}
            min={todayStr}
            disabled={loading || isReadOnly}
            className={`form-input${errors.startDate ? " error" : ""}`}
          />
          {errors.startDate && <span className="error-message">{errors.startDate}</span>}
        </div>

        <div className="form-group">
          {requiereAlojamiento ? (
            <>
              <label htmlFor="endDate" className="form-label">
                Fecha de Fin *
              </label>
              <input
                type="date"
                id="endDate"
                name="endDate"
                value={formData.endDate}
                onChange={handleDateChange}
                min={formData.startDate || todayStr}
                disabled={
                  loading ||
                  isReadOnly ||
                  (!!selectedPlan && !planHasAccommodation(selectedPlan))
                }
                className={`form-input${errors.endDate ? " error" : ""}`}
              />
              {errors.endDate && <span className="error-message">{errors.endDate}</span>}
            </>
          ) : (
            <>
              <label className="form-label">Fecha de Fin</label>
              <div className="form-input-disabled">
                No aplica para este plan
              </div>
            </>
          )}
        </div>
      </div>

      {/* Tercera fila - Configuración de acompañantes */}
      <div className="form-row">
        <div className="form-group">
          <div className="checkbox-container">
            <label className="checkbox-option">
              <input
                type="checkbox"
                name="hasCompanions"
                checked={formData.hasCompanions}
                onChange={onChange}
                disabled={loading || isReadOnly}
              />
              <span className="checkbox-custom"></span>
              <span className="checkbox-label">¿Incluye acompañantes?</span>
            </label>
          </div>
        </div>

        {formData.hasCompanions && (
          <div className="form-group">
            <label htmlFor="companionCount" className="form-label">
              Número de Acompañantes *
            </label>
            <input
              type="number"
              id="companionCount"
              name="companionCount"
              min="1"
              max="6"
              value={formData.companionCount}
              onChange={handleFieldChange}
              disabled={loading || isReadOnly}
              className={`form-input${errors.companionCount ? " error" : ""}`}
              placeholder="Ej: 2"
            />
            {errors.companionCount && <span className="error-message">{errors.companionCount}</span>}
            <div className="input-hint">Máximo 6 acompañantes por reserva</div>
          </div>
        )}
      </div>

      {formData.hasCompanions && formData.companionCount > 0 && (
        <div className="companions-info-card">
          <div className="info-header">
            <span className="info-icon">ℹ</span>
            <h4>Información sobre Acompañantes</h4>
          </div>
          <div className="info-content">
            <p>
              <strong>Total de huéspedes:</strong> {Number(formData.companionCount) + 1} personas (1 titular +{" "}
              {formData.companionCount} acompañante{formData.companionCount > 1 ? "s" : ""})
            </p>
            <p>
              <strong>Tipo de alojamiento requerido:</strong>{" "}
              {formData.companionCount > 1 ? "Cabañas (para grupos)" : "Habitaciones o cabañas"}
            </p>
            <div className="info-note">
              En la siguiente pestaña podrás registrar los datos personales de cada acompañante.
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

BasicInfoStep.propTypes = {
  formData: PropTypes.object.isRequired,
  users: PropTypes.array,
  planes: PropTypes.array,
  loading: PropTypes.bool,
  isReadOnly: PropTypes.bool,
  onChange: PropTypes.func.isRequired,
  isClientMode: PropTypes.bool,
  clientUser: PropTypes.object,
  errors: PropTypes.object,
  setFieldError: PropTypes.func,
}

// ==========================
// PASO 2: ACOMPAÑANTES
// ==========================
export function CompanionsStep({ formData, errors, loading, isReadOnly, onSaveCompanion, onDeleteCompanion }) {
  const expectedCount = Number.parseInt(formData.companionCount) || 0
  const currentCount = formData.companions?.length || 0
  const remainingCount = Math.max(0, expectedCount - currentCount)

  // Función para calcular la edad a partir de la fecha de nacimiento
  const calcularEdad = (fechaNacimiento) => {
    if (!fechaNacimiento) return "";
    const hoy = new Date();
    const nacimiento = new Date(fechaNacimiento);
    let edad = hoy.getFullYear() - nacimiento.getFullYear();
    const m = hoy.getMonth() - nacimiento.getMonth();
    if (m < 0 || (m === 0 && hoy.getDate() < nacimiento.getDate())) {
      edad--;
    }
    return edad;
  };

  const companionFormRef = useRef(null);

  const [fields, setFields] = useState({
    name: "",
    documentType: "Cédula de ciudadanía",
    documentNumber: "",
    age: "",
    eps: "",
    birthdate: "",
  });
  const [companionErrors, setCompanionErrors] = useState({});

  // Validación en tiempo real
  const validateField = (name, value) => {
    switch (name) {
      case "name":
        return value.trim() === "" ? "El nombre es obligatorio" : "";
      case "documentNumber":
        return value.trim() === "" ? "El número de documento es obligatorio" : "";
      case "age":
        return !value || isNaN(value) || value <= 0 ? "Edad inválida" : "";
      case "eps":
        return value.trim() === "" ? "La EPS es obligatoria" : "";
      default:
        return "";
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    let newFields = { ...fields, [name]: value };

    // Si cambia la fecha de nacimiento, calcula la edad automáticamente
    if (name === "birthdate") {
      const edadCalculada = calcularEdad(value);
      newFields.age = edadCalculada;
    }

    setFields(newFields);

    // Validación en tiempo real
    setCompanionErrors((prev) => ({
      ...prev,
      [name]: validateField(name, value),
      ...(name === "birthdate" && { age: validateField("age", newFields.age) }),
    }));
  };

  const handleSave = () => {
    // Validar todos los campos antes de guardar
    const newErrors = {};
    Object.keys(fields).forEach((key) => {
      if (key !== "birthdate") {
        const error = validateField(key, fields[key]);
        if (error) newErrors[key] = error;
      }
    });
    setCompanionErrors(newErrors);
    if (Object.keys(newErrors).length === 0) {
      onSaveCompanion(fields);
      setFields({
        name: "",
        documentType: "Cédula de ciudadanía",
        documentNumber: "",
        age: "",
        eps: "",
        birthdate: "",
      });
      setCompanionErrors({});
    }
  };

  return (
    <div className="step-content">
      {errors?.companions && <div className="error-message">{errors.companions}</div>}

      {/* Lista de acompañantes */}
      <div className="companions-list">
        {formData.companions && formData.companions.length > 0 ? (
          formData.companions.map((companion, index) => {
            const companionKey =
              companion.idCompanions || companion.id || companion.tempId || companion.documentNumber || index
            const companionId = companion.idCompanions || companion.id || companion.tempId || companion.documentNumber

            return (
              <div key={companionKey} className="companion-card">
                <div className="companion-content">
                  <div className="companion-info">
                    <div className="companion-header">
                      <strong className="companion-name">{companion.name}</strong>
                      {companion.isTemporary && <span className="temp-badge">Temporal</span>}
                    </div>
                    <div className="companion-details">
                      <p>
                        <strong>Documento:</strong> {companion.documentType || "N/A"} - {companion.documentNumber}
                      </p>
                      <p>
                        <strong>Edad:</strong> {companion.age} años
                      </p>
                      <p>
                        <strong>EPS:</strong> {companion.eps}
                      </p>
                      {companion.birthdate && (
                        <p>
                          <strong>Fecha de nacimiento:</strong> {companion.birthdate}
                        </p>
                      )}
                    </div>
                  </div>
                  {!isReadOnly && (
                    <button
                      type="button"
                      onClick={() => onDeleteCompanion(companionId)}
                      disabled={loading}
                      className="delete-btn"
                    >
                      {loading ? "..." : "Eliminar"}
                    </button>
                  )}
                </div>
              </div>
            )
          })
        ) : (
          <div className="empty-companions">
            <p className="empty-title">👥 No hay acompañantes registrados</p>
          </div>
        )}
      </div>

      {/* Formulario de acompañante - Solo mostrar si se pueden agregar más */}
      {!isReadOnly && remainingCount > 0 && (
        <div className="companion-form-section">
          <div className="form-alert">
            <p>
              📝 Faltan {remainingCount} acompañante{remainingCount > 1 ? "s" : ""} por registrar
            </p>
          </div>

          <div
            ref={companionFormRef}
            className="companion-form"
            onKeyDown={e => {
              if (e.key === "Enter") {
                e.preventDefault();
              }
            }}
          >
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="name" className="form-label">
                  Nombre completo *
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  className={`form-input ${companionErrors.name ? "error" : ""}`}
                  disabled={loading}
                  placeholder="Nombre completo del acompañante"
                  value={fields.name}
                  onChange={handleInputChange}
                />
                {companionErrors.name && <span className="error-message">{companionErrors.name}</span>}
              </div>

              <div className="form-group">
                <label htmlFor="documentType" className="form-label">
                  Tipo de documento *
                </label>
                <select
                  id="documentType"
                  name="documentType"
                  className="form-input"
                  disabled={loading}
                  value={fields.documentType}
                  onChange={handleInputChange}
                >
                  <option value="Cédula de ciudadanía">Cédula de Ciudadanía</option>
                  <option value="Tarjeta de identidad">Tarjeta de Identidad</option>
                  <option value="Cédula de extranjería">Cédula de Extranjería</option>
                  <option value="Pasaporte">Pasaporte</option>
                </select>
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="documentNumber" className="form-label">
                  Número de documento *
                </label>
                <input
                  type="text"
                  id="documentNumber"
                  name="documentNumber"
                  className={`form-input ${companionErrors.documentNumber ? "error" : ""}`}
                  disabled={loading}
                  placeholder="Número de documento"
                  value={fields.documentNumber}
                  onChange={handleInputChange}
                />
                {companionErrors.documentNumber && <span className="error-message">{companionErrors.documentNumber}</span>}
              </div>

              <div className="form-group">
                <label htmlFor="age" className="form-label">
                  Edad *
                </label>
                <input
                  type="number"
                  id="age"
                  name="age"
                  className={`form-input ${companionErrors.age ? "error" : ""}`}
                  disabled={loading}
                  min="0"
                  max="120"
                  placeholder="Edad"
                  readOnly // Opcional: para que solo se calcule automáticamente
                  value={fields.age}
                  onChange={handleInputChange}
                />
                {companionErrors.age && <span className="error-message">{companionErrors.age}</span>}
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="eps" className="form-label">
                  EPS *
                </label>
                <input
                  type="text"
                  id="eps"
                  name="eps"
                  className={`form-input ${companionErrors.eps ? "error" : ""}`}
                  disabled={loading}
                  placeholder="Entidad de salud"
                  value={fields.eps}
                  onChange={handleInputChange}
                />
                {companionErrors.eps && <span className="error-message">{companionErrors.eps}</span>}
              </div>

              <div className="form-group">
                <label htmlFor="birthdate" className="form-label">
                  Fecha de nacimiento
                </label>
                <input
                  type="date"
                  id="birthdate"
                  name="birthdate"
                  className="form-input"
                  disabled={loading}
                  value={fields.birthdate}
                  onChange={handleInputChange}
                />
              </div>
            </div>

            <div className="form-actions">
              <button
                type="button"
                className="submit-btn"
                disabled={loading}
                onClick={handleSave}
              >
                {loading ? "Guardando..." : "Agregar Acompañante"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Mensaje de finalización */}
      {currentCount === expectedCount && expectedCount > 0 && (
        <div className="completion-message">
          <h4>✅ ¡Todos los acompañantes han sido registrados!</h4>
          <p>Puedes continuar al siguiente paso o agregar/eliminar acompañantes si es necesario.</p>
        </div>
      )}
    </div>
  )
}

CompanionsStep.propTypes = {
  formData: PropTypes.object.isRequired,
  errors: PropTypes.object,
  loading: PropTypes.bool,
  isReadOnly: PropTypes.bool,
  onSaveCompanion: PropTypes.func.isRequired,
  onDeleteCompanion: PropTypes.func.isRequired,
}

// ==========================
// PASO 3: DISPONIBILIDAD
// ==========================
export function AvailabilityStep({
  formData,
  errors,
  onCabinSelect,
  onRoomSelect,
  onServiceQuantityChange,
}) {
  const companionCount = Number(formData.companionCount) || 0;
  const totalGuests = companionCount + 1;
  const selectedPlan = (formData.planes || []).find(p => p.idPlan === Number(formData.idPlan));

  const hasAccommodation = planHasAccommodation(selectedPlan);

  const showBedrooms = hasAccommodation && totalGuests <= 2;
  const showCabins = hasAccommodation && totalGuests >= 3;

  function getServiceQuantity(serviceId) {
    const found = formData.selectedServices?.find(s => s.serviceId === serviceId);
    return found ? found.quantity : 0;
  }

  function handleQuantityChange(serviceId, newQuantity) {
    onServiceQuantityChange(serviceId, newQuantity);
  }

  return (
    <div className="step-content">
      <div className="guest-info">
        <p>
          <strong>Huéspedes totales:</strong> {totalGuests} persona{totalGuests !== 1 ? "s" : ""}
        </p>
        <p>
          <strong>Alojamiento disponible:</strong>
          {!hasAccommodation
            ? "Solo servicios"
            : totalGuests <= 2
              ? "Habitaciones"
              : "Cabañas"}
        </p>
      </div>

      {errors.accommodation && <div className="error-message">{errors.accommodation}</div>}

      {/* Mostrar solo habitaciones */}
      {showBedrooms && (
        <div className="section-container">
          <h4 className="section-title">
            Habitaciones Disponibles ({formData.availableBedrooms?.length || 0})
            <span className="recommended-badge">
              Recomendado para {totalGuests} persona{totalGuests !== 1 ? "s" : ""}
            </span>
          </h4>
          {formData.availableBedrooms?.length > 0 ? (
            <div className="options-grid">
              {formData.availableBedrooms.map((bedroom) => (
                <div
                  key={bedroom.idRoom}
                  className={`option-item ${formData.idRoom === bedroom.idRoom ? "selected" : ""}`}
                  onClick={() => onRoomSelect(bedroom.idRoom)}
                >
                  <div className="option-selector">
                    {formData.idRoom === bedroom.idRoom ? (
                      <span className="selected-icon">✓</span>
                    ) : (
                      <span className="unselected-icon">○</span>
                    )}
                  </div>
                  <div className="option-content">
                    <h5 className="option-name">Habitación {bedroom.name || bedroom.idRoom}</h5>
                    <p className="option-detail">
                      Capacidad: {bedroom.capacity || 2} personas
                      {(bedroom.capacity || 2) >= totalGuests && <span className="capacity-ok"> ✓</span>}
                    </p>
                    <p className="option-description">{bedroom.description}</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="no-options">No hay habitaciones disponibles para este número de huéspedes.</p>
          )}
        </div>
      )}

      {/* Mostrar solo cabañas */}
      {showCabins && (
        <div className="section-container">
          <h4 className="section-title">
            Cabañas Disponibles ({formData.availableCabins?.length || 0})
            <span className="recommended-badge">Recomendado para {totalGuests} personas</span>
          </h4>
          {formData.availableCabins?.length > 0 ? (
            <div className="options-grid">
              {formData.availableCabins.map((cabin) => (
                <div
                  key={cabin.idCabin}
                  className={`option-item ${formData.idCabin === cabin.idCabin ? "selected" : ""}`}
                  onClick={() => onCabinSelect(cabin.idCabin)}
                >
                  <div className="option-selector">
                    {formData.idCabin === cabin.idCabin ? (
                      <span className="selected-icon">✓</span>
                    ) : (
                      <span className="unselected-icon">○</span>
                    )}
                  </div>
                  <div className="option-content">
                    <h5 className="option-name">{cabin.name}</h5>
                    <p className="option-detail">
                      Capacidad: {cabin.capacity || 7} personas
                      {cabin.capacity >= totalGuests && <span className="capacity-ok"> ✓</span>}
                    </p>
                    <p className="option-description">{cabin.description}</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="no-options">No hay cabañas disponibles para este número de huéspedes.</p>
          )}
        </div>
      )}

      {/* Servicios adicionales siempre visibles */}
      <div className="section-container">
        <h4 className="section-title">Servicios Adicionales</h4>

        {formData.availableServices?.length > 0 ? (
          <div className="services-grid">
            {formData.availableServices.map((service) => {
              const currentQuantity = getServiceQuantity(service.Id_Service)
              const isSelected = currentQuantity > 0

              return (
                <div key={service.Id_Service} className={`service-item ${isSelected ? "selected" : ""}`}>
                  <div className="service-info">
                    <div className="service-header">
                      <h5 className="service-name">{service.name}</h5>
                      <span className="service-price">{formatCurrency(service.Price)}</span>
                    </div>
                    <p className="service-description">{service.Description}</p>
                  </div>

                  <div className="service-controls">
                    <QuantitySelector
                      value={currentQuantity}
                      onChange={(newQuantity) => handleQuantityChange(service.Id_Service, newQuantity)}
                      min={0}
                      max={20}
                    />
                    {currentQuantity > 0 && (
                      <div className="service-subtotal">
                        Subtotal: {formatCurrency(service.Price * currentQuantity)}
                      </div>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        ) : (
          <p className="no-options">No hay servicios disponibles</p>
        )}

        {/* Resumen de servicios seleccionados */}
        {formData.selectedServices && formData.selectedServices.length > 0 && (
          <div className="services-summary">
            <h5>Servicios seleccionados:</h5>
            <div className="selected-services-list">
              {formData.selectedServices.map((serviceSelection) => {
                const service = formData.availableServices.find((s) => s.Id_Service === serviceSelection.serviceId)
                if (!service) return null

                return (
                  <div key={serviceSelection.serviceId} className="selected-service-item">
                    <span className="service-name">{service.name}</span>
                    <span className="service-quantity">x{serviceSelection.quantity}</span>
                    <span className="service-total">{formatCurrency(service.Price * serviceSelection.quantity)}</span>
                  </div>
                )
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

AvailabilityStep.propTypes = {
  formData: PropTypes.object.isRequired,
  errors: PropTypes.object,
  loading: PropTypes.bool,
  onCabinSelect: PropTypes.func.isRequired,
  onRoomSelect: PropTypes.func.isRequired,
  onServiceToggle: PropTypes.func.isRequired,
  onServiceQuantityChange: PropTypes.func.isRequired,
};

// ==========================
// PASO 4: PAGO
// ==========================
export function PaymentStep({
  totalAmount,
  reservationPayments,
  tempPayments,
  isReadOnly,
  loading,
  onPaymentSubmit,
}) {
  // Combinar pagos de la reserva y pagos temporales
  const allPayments = [...(reservationPayments || []), ...(tempPayments || [])]

  // Calcular totales
  const totalPaid = allPayments.reduce((sum, payment) => {
    return payment.status !== "Anulado" ? sum + (Number(payment.amount) || 0) : sum
  }, 0)

  const remainingBalance = Math.max(0, totalAmount - totalPaid)

  return (
    <div className="step-content">
      {/* Resumen de pagos */}
      {/* ...tu lógica de resumen... */}

      {/* Formulario de pago */}
      {!isReadOnly && (
        <div className="payment-form-section">
          <div className="payment-form" onKeyDown={e => {
            if (e.key === "Enter") {
              e.preventDefault();
            }
          }}>
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">
                  Método de pago *
                </label>
                <select id="paymentMethod" name="paymentMethod" className="form-input" disabled={loading}>
                  <option value="">Seleccione un método</option>
                  <option value="Tarjeta de Crédito">Tarjeta de Crédito</option>
                  <option value="Tarjeta de Débito">Tarjeta de Débito</option>
                  <option value="Transferencia Bancaria">Transferencia Bancaria</option>
                  <option value="Efectivo">Efectivo</option>
                  <option value="Otro">Otro</option>
                </select>
              </div>

              <div className="form-group">
                <label htmlFor="paymentDate" className="form-label">
                  Fecha de pago *
                </label>
                <input
                  type="date"
                  id="paymentDate"
                  name="paymentDate"
                  defaultValue={new Date().toISOString().split("T")[0]}
                  className="form-input"
                  disabled={loading}
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="amount" className="form-label">
                  Monto *
                </label>
                <input
                  type="number"
                  id="amount"
                  name="amount"
                  className="form-input"
                  disabled={loading}
                  placeholder="0"
                  min="0"
                  step="1000"
                />
              </div>

              <div className="form-group">
                <label htmlFor="status" className="form-label">
                  Estado
                </label>
                <select id="status" name="status" defaultValue="Pendiente" className="form-input" disabled={loading}>
                  <option value="Pendiente">Pendiente</option>
                  <option value="Confirmado">Confirmado</option>
                </select>
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="voucher" className="form-label">
                  Comprobante de pago
                </label>
                <input
                  type="file"
                  id="voucher"
                  name="voucher"
                  className="form-input"
                  disabled={loading}
                  accept="image/*,.pdf"
                />
                <div className="input-hint">Formatos permitidos: JPG, PNG, PDF (máx. 5MB)</div>
              </div>
            </div>

            <div className="form-actions">
              <button
                type="button"
                className="submit-btn"
                disabled={loading}
                onClick={e => {
                  const form = e.target.closest('.payment-form');
                  const paymentMethod = form.querySelector('[name="paymentMethod"]').value;
                  const paymentDate = form.querySelector('[name="paymentDate"]').value;
                  const amount = form.querySelector('[name="amount"]').value;
                  const status = form.querySelector('[name="status"]').value;
                  const voucherInput = form.querySelector('[name="voucher"]');
                  const voucher = voucherInput && voucherInput.files.length > 0 ? voucherInput.files[0] : null;

                  if (!paymentMethod || !paymentDate || !amount) {
                    alert("Por favor complete todos los campos obligatorios.");
                    return;
                  }

                  // Si hay comprobante, usa FormData
                  if (voucher) {
                    const formData = new FormData();
                    formData.append("paymentMethod", paymentMethod);
                    formData.append("paymentDate", paymentDate);
                    formData.append("amount", amount);
                    formData.append("status", status);
                    formData.append("voucher", voucher);
                    // Envía el FormData al handler del padre
                    onPaymentSubmit(formData);
                  } else {
                    // Si no hay comprobante, envía objeto normal
                    onPaymentSubmit({
                      paymentMethod,
                      paymentDate,
                      amount,
                      status,
                    });
                  }
                }}
              >
                {loading ? "Registrando..." : "Registrar Pago"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

PaymentStep.propTypes = {
  totalAmount: PropTypes.number.isRequired,
  reservationPayments: PropTypes.array,
  tempPayments: PropTypes.array,
  isReadOnly: PropTypes.bool,
  loading: PropTypes.bool,
  onPaymentSubmit: PropTypes.func.isRequired,
};
