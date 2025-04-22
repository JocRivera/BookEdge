import React, { useEffect, useState } from "react";
import "./componentConfort.css";

function FormConfort({ comfortData, onClose, onSave, isOpen, backendErrors }) {
  const [formDataComfort, setFormDataComfort] = useState({
    name: "",
  });
  const [errors, setErrors] = useState({ name: "" });

  useEffect(() => {
    if (backendErrors?.name) {
      setErrors({ name: backendErrors.name });
    }
  }, [backendErrors]);

  useEffect(() => {
    if (isOpen) {
      if (comfortData) {
        setFormDataComfort({
          ...comfortData,
          name: comfortData.name || "",
        });
      } else {
        setFormDataComfort({
          name: "",
        });
      }
      setErrors({ name: "" }); // Reiniciar errores locales
    }
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

    const nameError = validateName(formDataComfort.name);
    if (nameError) {
      setErrors({ name: nameError });
      return;
    }

    onSave(formDataComfort);
    // En CardCabin.jsx o en tu servicio donde manejas errores
try {
  // Intenta guardar la cabaña...
} catch (error) {
  console.error("ERROR:", error);
  
  // Manejar los errores del backend
  if (error.response?.data?.errors) {
    const errorMap = {};
    error.response.data.errors.forEach(err => {
      errorMap[err.path] = err.msg;
    });
    setBackendErrors(errorMap);
    
    // Configurar un temporizador para limpiar los errores después de un tiempo
    setTimeout(() => {
      setBackendErrors({});
    }, 5000); // 5 segundos
  } else {
    // Manejo general de errores
    alert(`Error al ${cabinToEdit ? "editar" : "crear"}. Ver consola.`);
  }
}
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
