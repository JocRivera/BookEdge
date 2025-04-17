import React, { useEffect, useState } from "react";
import "./componentConfort.css";

function FormConfort({ comfortData, onClose, onSave, isOpen, backendErrors }) {
  const [formDataComfort, setFormDataComfort] = useState({
    name: "",
  });

  const [errors, setErrors] = useState({
    name: "",
    backend: "",
  });

  useEffect(() => {
    if (isOpen && comfortData) {
      setFormDataComfort({
        ...comfortData,
        name: comfortData.name || "",
      });
    } else if (isOpen && !comfortData) {
      setFormDataComfort({
        name: "",
      });
    }
    setErrors({ name: "" }); // Reiniciar errores al abrir el modal
  }, [isOpen, comfortData]);

  const validateName = (name) => {
    if (!name.trim()) {
      return "El nombre es obligatorio";
    }
    return "";
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormDataComfort((prevState) => ({
      ...prevState,
      [name]: value,
    }));

    if (name === "name") {
      setErrors((prevErrors) => ({
        ...prevErrors,
        name: validateName(value),
      }));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    // 🔹 Validación antes de enviar
    const nameError = validateName(formDataComfort.name);
    if (nameError) {
      setErrors({ name: nameError });
      return;
    }

    onSave(formDataComfort);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="comfort-modal-overlay">
      <div className="comfort-modal-container">
        <div className="comfort-modal-header">
          <h2>
            {comfortData ? "Editar Comodidad" : "Registrar Nueva Comodidad"}
          </h2>
          <button className="comfort-close-button" onClick={onClose}>
            ×
          </button>
        </div>
        <div className="comfort-modal-body">
          <form onSubmit={handleSubmit}>
            <div className="comfort-form-group">
              <label htmlFor="name">Nombre de la Comodidad</label>
              <input
                type="text"
                id="name"
                name="name"
                value={formDataComfort.name}
                placeholder="Nombre Comodidad"
                onChange={handleChange}
                required
                className={
                  errors.name || backendErrors.name ? "input-error" : undefined
                }
              />

              {errors.name && <span className="error-text">{errors.name}</span>}
              {!errors.name && backendErrors.name && (
                <span className="error-text">{backendErrors.name}</span>
              )}
            </div>

            <div className="comfort-modal-footer">
              <button
                type="button"
                className="comfort-cancel-btn"
                onClick={onClose}
              >
                Cancelar
              </button>
              <button type="submit" className="comfort-submit-btn">
                {comfortData ? "Guardar Cambios" : "Registrar Comodidad"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default FormConfort;
