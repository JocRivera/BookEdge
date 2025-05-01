import React, { useEffect, useState } from "react";
import "./componentConfort.css";

function FormConfort({ comfortData, onClose, onSave, isOpen }) {
  const [formDataComfort, setFormDataComfort] = useState({
    name: "",
  });
  const [errors, setErrors] = useState({ name: "" });

  useEffect(() => {
    if (isOpen) {
      // Limpiar errores al abrir el modal
      setErrors({ name: "" });
      
      if (comfortData) {
        setFormDataComfort({
          name: comfortData.name || "",
        });
      } else {
        setFormDataComfort({
          name: "",
        });
      }
    }
  }, [isOpen, comfortData]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormDataComfort(prev => ({ ...prev, [name]: value }));
    
    // Limpiar error cuando el usuario escribe
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: "" }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    
    // Validación básica del frontend
    const newErrors = {};
    if (!formDataComfort.name.trim()) {
      newErrors.name = "El nombre es obligatorio";
    }
    
    setErrors(newErrors);
    
    // Si hay errores, no continuar
    if (Object.keys(newErrors).length > 0) {
      return;
    }

    try {
      const backendErrors = await onSave(formDataComfort);
      
      if (backendErrors) {
        setErrors(backendErrors);
      } else {
        onClose();
      }
    } catch (error) {
      console.error("Error inesperado:", error);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="comfort-modal-overlay">
      <div className="comfort-modal-container">
        <div className="comfort-modal-header">
          <h2>{comfortData ? "Editar Comodidad" : "Registrar Nueva Comodidad"}</h2>
          <button className="comfort-close-button" onClick={onClose}>×</button>
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
                className={errors.name ? "input-error-admin" : ""}
              />
              {errors.name && (
                <div className="error-message-admin">{errors.name}</div>
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