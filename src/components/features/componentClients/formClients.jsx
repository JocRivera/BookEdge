import React, { useState, useEffect } from "react";
import "./createClientes.css";
import Switch from "../../common/Switch/Switch";
import { getRoles } from "../../../services/RolesService"

const FormUser = ({ isOpen, onClose, userData = null, onSave }) => {
  // Estado inicial como una constante separada para mayor claridad
  const initialFormData = {
    name: "",
    identificationType: "",
    identification: "",
    email: "",
    cellphone: "",
    address: "",
    idRol: 0,
    status: true,
    password: "",
    eps: "",
    role: {},
  };

  const [formData, setFormData] = useState(initialFormData);
  const [rolesData, setRoles] = useState([]);

  useEffect(() => {
    const fetchRoles = async () => {
      try {
        const roles = await getRoles();
        setRoles(roles);
      } catch (error) {
        console.log(error);
      }
    };
    fetchRoles();
    // Si se proporciona userData, establece los datos del formulario a los de ese usuario
    if (userData) {
      setFormData(userData);
    } else {
      // Si no hay userData (nuevo usuario), restablece al estado inicial
      setFormData(initialFormData);
    }
  }, [userData, isOpen]); // Añadir isOpen para restablecer cuando se abre el modal

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevState) => ({
      ...prevState,
      [name]: value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-container">
        <div className="modal-header">
          <h2>{userData ? "Editar Usuario" : "Registrar Nuevo Usuario"}</h2>
          <button className="close-button" onClick={onClose}>
            ×
          </button>
        </div>

        <div className="modal-body">
          <form onSubmit={handleSubmit}>
            <div className="form-grid">
              <div className="form-group">
                <label htmlFor="name">Nombre Completo</label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Nombre completo"
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="identificationType">
                  Tipo de Identificación
                </label>
                <select
                  id="identificationType"
                  name="identificationType"
                  value={formData.identificationType}
                  onChange={handleChange}
                  required
                >
                  <option value="">Seleccione</option>
                  <option value="CC">Cédula de Ciudadanía</option>
                  <option value="CE">Cédula de Extranjería</option>
                  {/* <option value="TI">Tarjeta de Identidad</option>
                  <option value="PP">Pasaporte</option> */}
                </select>
              </div>

              <div className="form-group">
                <label htmlFor="identification">Número de Identificación</label>
                <input
                  type="text"
                  id="identification"
                  name="identification"
                  value={formData.identification}
                  onChange={handleChange}
                  placeholder="Número de identificación"
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="email">Correo Electrónico</label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="ejemplo@correo.com"
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="cellphone">Teléfono Celular</label>
                <input
                  type="tel"
                  id="cellphone"
                  name="cellphone"
                  value={formData.cellphone}
                  onChange={handleChange}
                  placeholder="Número de celular"
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="address">Dirección</label>
                <input
                  type="text"
                  id="address"
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                  placeholder="Dirección completa"
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="rol">Rol</label>
                {/* {console.log(rolesData[0].idRol, rolesData[0].name, rolesData)} */}
                <select
                  id="rol"
                  name="rol"
                  value={formData.role.name}
                  onChange={handleChange}
                  required
                >
                  <option value="">Seleccione un rol</option>
                  {rolesData.map((role) => (
                    <option key={role.idRol} value={role.idRol}>
                      {role.name}
                    </option>
                  ))}
                </select>
              </div>
              {/* <div className="form-group">
                <label htmlFor="rol">Rol</label>
                <select
                  id="rol"
                  name="rol"
                  value={formData.idRol}
                  onChange={handleChange}
                  required
                >
                  <option value="">Seleccione un rol</option>
                  <option value="Administrador">Administrador</option>
                  <option value="Editor">Editor</option>
                  <option value="Usuario">Usuario</option>
                </select>
              </div> */}

              <div className="form-group">
                <label htmlFor="status">Estado</label>
                <Switch
                  isOn={formData.status === "Activo"}
                  handleToggle={() =>
                    setFormData((prevState) => ({
                      ...prevState,
                      status:
                        prevState.status === "Activo" ? "Inactivo" : "Activo",
                    }))
                  }
                  id="status"
                />
              </div>
            </div>

            <div className="modal-footer">
              <button type="button" className="cancel-btn" onClick={onClose}>
                Cancelar
              </button>
              <button type="submit" className="submit-btn">
                {userData ? "Guardar Cambios" : "Registrar Usuario"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default FormUser;
