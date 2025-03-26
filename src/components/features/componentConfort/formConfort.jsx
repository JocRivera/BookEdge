import React, { useEffect, useState } from "react";
import "./componentConfort.css";

function FormConfort({ comfortData, onClose, onSave, isOpen }) {
  const [formDataComfort, setFormDataComfort] = useState({
    name: "",
    status: "Activo",
  });

  const [errors, setErrors] = useState({ name: "" }); // Estado para errores

  useEffect(() => {
    if (isOpen && comfortData) {
      setFormDataComfort({
        ...comfortData,
        name: comfortData.name || "",
      });
    } else if (isOpen && !comfortData) {
      setFormDataComfort({
        name: "",
        status: "Activo",
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
    <div className="modal-overlay">
      <div className="modal-container">
        <div className="modal-header">
          <h2>{comfortData ? "Editar Comodidad" : "Registrar Nueva Comodidad"}</h2>
          <button className="close-button" onClick={onClose}>×</button>
        </div>
        <div className="modal-body">
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="name">Nombre de la Comodidad</label>
              <input
                type="text"
                id="name"
                name="name"
                value={formDataComfort.name}
                placeholder="Nombre Comodidad"
                onChange={handleChange}
                required
              />
              {errors.name && <p className="error-text">{errors.name}</p>}
            </div>

            <div className="modal-footer">
              <button type="button" className="cancel-btn" onClick={onClose}>
                Cancelar
              </button>
              <button type="submit" className="submit-btn">
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
