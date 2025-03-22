import React, { useState } from "react";
import { CustomButton } from "../../common/Button/customButton";

export default function FormConfort({ onSave, onClose, isOpen }) {
  const [newConfort, setNewConfort] = useState({
    code: "",
    name: "",
    entry_date: "",
    description: "",
    status: "Disponible",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setNewConfort({ ...newConfort, [name]: value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(newConfort); // Guardar el nuevo cliente
    onClose(); // Cerrar el modal
    setNewConfort({
      // Limpiar el formulario
      code: "",
      name: "",
      entry_date: "",
      description: "",
      status: "",
    });
  };
  if (!isOpen) return null;
  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <h1>Formulario de inmobiliaria</h1>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="">Código del inmueble</label>
            <input
              type="text"
              name="code"
              required
              value={newConfort.code}
              onChange={handleChange}
            />
          </div>
          <div className="form-group">
            <label htmlFor="">Nombre del inmueble</label>
            <input
              type="text"
              name="name"
              required
              value={newConfort.name}
              onChange={handleChange}
            />
          </div>
          <div className="form-group">
            <label htmlFor="">Fecha de ingreso</label>
            <input
              type="date"
              name="entry_date"
              required
              value={newConfort.entry_date}
              onChange={handleChange}
            />
          </div>
          <div className="form-group">
            {" "}
            <label htmlFor="">Descripción</label>
            <input
              type="text"
              name="description"
              required
              value={newConfort.description}
              onChange={handleChange}
            />
          </div>
          <div className="form-group">
            <label htmlFor="">Estado</label>
            <select
              name="status"
              required
              value={newConfort.status}
              onChange={handleChange}
            >
              <option value="Disponible">Disponible</option>
              <option value="No disponible">No disponible</option>
              <option value="Mantenimiento"> Mantenimiento</option>
            </select>
          </div>
        </form>
        <div className="actions-modal">
          <CustomButton
            type="submit"
            variant="primary"
            tittle="Guardar"
            className="buttons"
            onClick={handleSubmit}
          >
            {" "}
            Guardar
          </CustomButton>
          <CustomButton
            type="submit"
            variant="danger"
            tittle="Cancelar"
            className="buttons"
            onClick={onClose}
          >
            {" "}
            Cancelar
          </CustomButton>
        </div>
      </div>
    </div>
  );
}
