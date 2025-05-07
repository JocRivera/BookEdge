import React, { useEffect, useState } from "react";
import "./componentConfort.css";

function FormConfort({ comfortData, onClose, onSave, isOpen }) {
  const [formDataComfort, setFormDataComfort] = useState({
    name: "",
    idComfort: null, 
  });
  const [errors, setErrors] = useState({ name: "" });
  const [touched, setTouched] = useState({ name: false });

  useEffect(() => {
    if (isOpen) {
      // Limpiar errores y estado de campos tocados al abrir el modal
      setErrors({ name: "" });
      setTouched({ name: false });
      
      if (comfortData) {
        setFormDataComfort({
          name: comfortData.name || "",
          idComfort: comfortData.idComfort 
        });
      } else {
        setFormDataComfort({
          name: "",
          idComfort: null
        });
      }
    }
  }, [isOpen, comfortData]);

  const validateField = (name, value) => {
    let error = "";
    
    if (name === "name") {
      if (!value.trim()) {
        error = "El nombre es obligatorio";
      } else if (value.trim().length < 3) {
        error = "El nombre debe tener al menos 3 caracteres";
      } 
    }
    
    return error;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormDataComfort(prev => ({ ...prev, [name]: value }));
    
    // Marcar el campo como tocado
    if (!touched[name]) {
      setTouched(prev => ({ ...prev, [name]: true }));
    }
    
    // Validar en tiempo real si el campo ha sido tocado
    if (touched[name]) {
      const error = validateField(name, value);
      setErrors(prev => ({ ...prev, [name]: error }));
    }
  };

  const handleBlur = (e) => {
    const { name, value } = e.target;
    
    // Marcar el campo como tocado cuando pierde el foco
    setTouched(prev => ({ ...prev, [name]: true }));
    
    // Validar cuando el campo pierde el foco
    const error = validateField(name, value);
    setErrors(prev => ({ ...prev, [name]: error }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Marcar todos los campos como tocados
    setTouched({ name: true });
    
    // Validar todos los campos antes de enviar
    const nameError = validateField("name", formDataComfort.name);
    const newErrors = { name: nameError };
    setErrors(newErrors);
    
    // Si hay errores, no continuar
    if (Object.values(newErrors).some(error => error !== "")) {
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
                onBlur={handleBlur}
                className={errors.name && touched.name ? "input-error-admin" : ""}
              />
              {errors.name && touched.name && (
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