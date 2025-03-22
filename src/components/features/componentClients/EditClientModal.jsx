import React, { useEffect, useState } from "react";
import { CustomButton } from "../../common/Button/customButton";
import "./createClientes.css";

export default function EditClientModal({ onClose, onSave, client, isOpen }) {
  // Inicializa el estado con un objeto vacío
  const [editClient, setEditClient] = useState({
    fullName: "",
    documentType: "DNI",
    documentNumber: "",
    phoneNumber: "",
    birthDate: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  // Actualiza el estado cuando `client` cambia
  useEffect(() => {
    if (client) {
      setEditClient(client); // Actualiza el estado con los datos del cliente
    }
  }, [client]);

  const handleChange = (e) => {// Maneja el cambio de los campos
    const { name, value } = e.target;// Obtiene el nombre y el valor del campo
    setEditClient({ ...editClient, [name]: value }); // Actualiza el estado con los nuevos datos usamos el spread operator para mantener el resto de los datos (...)
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(editClient);
    onClose();
  };

  // No renderizar si el modal no está abierto o si `client` es null
  if (!isOpen || !client) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <h2>Editar Cliente</h2>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Nombre Completo</label>
            <input
              type="text"
              name="fullName"
              value={editClient.fullName || ""}
              onChange={handleChange}
              required
            />
          </div>
          <div className="form-group">
            <label>Tipo de Documento</label>
            <select
              name="documentType"
              value={editClient.documentType || "DNI"}
              onChange={handleChange}
              required
            >
              <option value="DNI">DNI</option>
              <option value="CC">Pasaporte</option>
              <option value="EX">Otro</option>
            </select>
          </div>
          <div className="form-group">
            <label>Número de Documento</label>
            <input
              type="text"
              name="documentNumber"
              value={editClient.documentNumber || ""}
              onChange={handleChange}
              required
            />
          </div>
          <div className="form-group">
            <label>Número de Telefono</label>
            <input
              type="text"
              name="phoneNumber"
              value={editClient.phoneNumber || ""}
              onChange={handleChange}
            />
          </div>
          <div className="form-group">
            <label>Fecha de Nacimiento</label>
            <input
              type="date"
              name="birthDate"
              value={editClient.birthDate || ""}
              onChange={handleChange}
            />
          </div>
          <div className="form-group">
            <label>Correo Electronico</label>
            <input
              type="email"
              name="email"
              value={editClient.email || ""}
              onChange={handleChange}
            />
          </div>
          <div className="form-group">
            <label>Contraseña</label>
            <input
              type="password"
              name="password"
              value={editClient.password || ""}
              onChange={handleChange}
            />
          </div>
          <div className="form-group">
            <label>Confirmar Contraseña</label>
            <input
              type="password"
              name="confirmPassword"
              value={editClient.confirmPassword || ""}
              onChange={handleChange}
            />
          </div>
        </form>
          <div className="modal-actions">
            <CustomButton
              type="submit"
              variant="primary"
              title="Guardar"
              className="buttons"
              onClick={handleSubmit}
            >
              Guardar
            </CustomButton>
            <CustomButton
              type="button"
              variant="danger"
              title="Cancelar"
              onClick={onClose}
              className="buttons"
            >
              Cancelar
            </CustomButton>
          </div>
      </div>
    </div>
  );
}