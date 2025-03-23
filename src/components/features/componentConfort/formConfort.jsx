import React, { useEffect, useState } from "react";
import "./componentConfort.css";

function FormConfort({ comfortData, onClose, onSave,isOpen }) {
  const [formDataComfort, setFormDataComfort] = useState({
    name: "",
    status: "Activo",
  });

  useEffect(() => {
    if (comfortData) {
      setFormDataComfort(comfortData);
    }
  }, [comfortData]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormDataComfort((prevState) => ({
      ...prevState,
      [name]: value,
    }));
  };
  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formDataComfort);
    onClose();
  };
  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-container">
        <div className="modal-header">
          <h2>
          {comfortData && comfortData.id ? "Editar Comodidad" : "Registrar Nueva Comodidad"}
          </h2>
          <button className="close-button" onClick={onClose}>
            ×
          </button>
        </div>
        <div className="modal-body">
          <form onSubmit={handleSubmit}>
            <div className="fom-grid">
              <div className="form-group">
                <label htmlFor="">Nomre de la Comodidad</label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formDataComfort.name}
                  placeholder="Nombre Comodidad"
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="modal-footer">
                <button
                  type="button"
                  className="cancel-btn"
                  onClick={onClose}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="submit-btn"
                >
                  {comfortData && comfortData.id ? "Guardar Cambios" : "Registrar Comodidad"}
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default FormConfort;
