import React, { useState, useEffect } from "react";
import "./createClientes.css";
import Switch from "../../common/Switch/Switch";
import rolesService from "../../../services/RolesService";

const FormUser = ({ isOpen, onClose, userData = null, onSave }) => {
  // Estado inicial como una constante separada para mayor claridad
  const initialFormData = {
    name: "",
    eps: "",
    birthdate: "",
    password: "",
    confirmPassword: "", // Campo para confirmar contraseña (solo para validación)
    identificationType: "",
    identification: "",
    email: "",
    cellphone: "",
    address: "",
    idRol: 0,
    status: true,
    role: {},
  };

  const [formData, setFormData] = useState(initialFormData);
  const [rolesData, setRoles] = useState([]);
  const [passwordError, setPasswordError] = useState("");

  useEffect(() => {
    const fetchRoles = async () => {
      try {
        const roles = await rolesService.getRoles();
        setRoles(roles);
      } catch (error) {
        console.log(error);
      }
    };
    fetchRoles();
    
    // Si se proporciona userData, establece los datos del formulario a los de ese usuario
    if (userData) {
      // En edición, dejamos los campos de contraseña vacíos
      setFormData({
        ...userData,
        password: "", // Contraseña vacía al editar
        confirmPassword: "" // Confirmación de contraseña vacía al editar
      });
    } else {
      // Si no hay userData (nuevo usuario), restablece al estado inicial
      setFormData(initialFormData);
    }
  }, [userData, isOpen]); // Añadir isOpen para restablecer cuando se abre el modal

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    // Manejo especial para la selección de rol
    if (name === "rol") {
      // Buscar el rol seleccionado en rolesData
      const selectedRole = rolesData.find(role => role.name === value);
      if (selectedRole) {
        setFormData(prevState => ({
          ...prevState,
          idRol: selectedRole.idRol,
          role: selectedRole
        }));
      }
    } else {
      setFormData(prevState => ({
        ...prevState,
        [name]: value,
      }));
    }

    if (name === "confirmPassword" || name === "password") {
      const password = name === "password" ? value : formData.password;
      const confirmPassword = name === "confirmPassword" ? value : formData.confirmPassword;
      
      if (confirmPassword && password !== confirmPassword) {
        setPasswordError("Las contraseñas no coinciden");
      } else {
        setPasswordError("");
      }
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (formData.password !== formData.confirmPassword) {
      setPasswordError("Las contraseñas no coinciden");
      return;
    }
    
    // Validar que todos los campos requeridos estén completos
    

    if (!userData && !formData.password) {
      setPasswordError("La contraseña es obligatoria para nuevos usuarios");
      return;
    }
    
    const dataToSubmit = {
      ...formData,
      idRol: formData.idRol || (formData.role?.idRol || 0)
    };
    
    if (userData && !dataToSubmit.password) {
      delete dataToSubmit.password;
    }
    
    delete dataToSubmit.confirmPassword;
    
    onSave(dataToSubmit);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="user-modal-overlay">
      <div className="user-modal-container">
        <div className="user-modal-header">
          <h2>{userData ? "Editar Usuario" : "Registrar Nuevo Usuario"}</h2>
          <button className="user-close-button" onClick={onClose}>
            ×
          </button>
        </div>

        <div className="user-modal-body">
          <form onSubmit={handleSubmit}>
            <div className="user-form-grid">
              <div className="user-form-group">
                <label htmlFor="name">Nombre Completo *</label>
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

              <div className="user-form-group">
                <label htmlFor="identificationType">
                  Tipo de Identificación *
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
                </select>
              </div>

              <div className="user-form-group">
                <label htmlFor="identification">Número de Identificación *</label>
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

              <div className="user-form-group">
                <label htmlFor="email">Correo Electrónico *</label>
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

              <div className="user-form-group">
                <label htmlFor="cellphone">Teléfono Celular *</label>
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

              <div className="user-form-group">
                <label htmlFor="address">Dirección</label>
                <input
                  type="text"
                  id="address"
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                  placeholder="Dirección completa"
                />
              </div>
              
              <div className="user-form-group">
                <label htmlFor="birthdate">Fecha de Nacimiento *</label>
                <input
                  type="date"
                  id="birthdate"
                  name="birthdate"
                  value={formData.birthdate}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="user-form-group">
                <label htmlFor="rol">Rol *</label>
                <select
                  id="rol"
                  name="rol"
                  value={formData.role?.name || ""}
                  onChange={handleChange}
                  required
                >
                  <option value="">Seleccione un rol</option>
                  {rolesData.map((role) => (
                    <option key={role.idRol} value={role.name}>
                      {role.name}
                    </option>
                  ))}
                </select>
              </div>
              
              <div className="user-form-group">
                <label htmlFor="eps">EPS</label>
                <input
                  type="text"
                  id="eps"
                  name="eps"
                  value={formData.eps}
                  onChange={handleChange}
                  placeholder="EPS"
                />
              </div>
              
              <div className="user-form-group">
                <label htmlFor="password">
                  {userData ? "Contraseña (Dejar vacío para mantener actual)" : "Contraseña *"}
                </label>
                <input
                  type="password"
                  id="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder={userData ? "Dejar vacío para mantener actual" : "Contraseña"}
                  required={!userData} // Solo obligatorio para nuevos usuarios
                />
              </div>
              
              <div className="user-form-group">
                <label htmlFor="confirmPassword">
                  {userData ? "Confirmar Contraseña (si cambia)" : "Confirmar Contraseña *"}
                </label>
                <input
                  type="password"
                  id="confirmPassword"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  placeholder="Confirmar contraseña"
                  required={!userData || formData.password !== ""} // Obligatorio solo si se ingresa contraseña
                />
                {passwordError && <p className="error-message">{passwordError}</p>}
              </div>

              <div className="user-form-group">
                <label htmlFor="status">Estado</label>
                <Switch
                  isOn={formData.status === true}
                  handleToggle={() =>
                    setFormData((prevState) => ({
                      ...prevState,
                      status: !prevState.status,
                    }))
                  }
                  id="status"
                />
              </div>
            </div>

            <div className="user-modal-footer">
              <button type="button" className="user-cancel-btn" onClick={onClose}>
                Cancelar
              </button>
              <button type="submit" className="user-submit-btn">
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