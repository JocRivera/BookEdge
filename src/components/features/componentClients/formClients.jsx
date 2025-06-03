import React, { useState, useEffect } from "react";
import "./createClientes.css";
import Switch from "../../common/Switch/Switch";
import rolesService from "../../../services/RolesService";
import { toast } from "react-toastify";

const FormUser = ({ isOpen, onClose, userData = null, onSave }) => {
  const [activeTab, setActiveTab] = useState("personal");
  const initialFormData = {
    name: "",
    eps: "",
    birthdate: "",
    password: "",
    confirmPassword: "",
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
  const [errors, setErrors] = useState({
    name: "",
    identificationType: "",
    identification: "",
    email: "",
    cellphone: "",
    address: "",
    birthdate: "",
    password: "",
    eps: "",
    status: "",
  });

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

    if (userData) {
      setFormData({
        ...userData,
        password: "",
        confirmPassword: "",
      });
    } else {
      setFormData(initialFormData);
    }

    setErrors({});
    setPasswordError("");
  }, [userData, isOpen]);

  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name === "rol") {
      const selectedRole = rolesData.find((role) => role.name === value);
      if (selectedRole) {
        setFormData((prevState) => ({
          ...prevState,
          idRol: selectedRole.idRol,
          role: selectedRole,
        }));
      }
    } else {
      setFormData((prevState) => ({
        ...prevState,
        [name]: value,
      }));
    }

    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: "",
      }));
    }

    const error = validateField(name, value);
    setErrors((prev) => ({ ...prev, [name]: error }));

    if (name === "confirmPassword" || name === "password") {
      const password = name === "password" ? value : formData.password;
      const confirmPassword =
        name === "confirmPassword" ? value : formData.confirmPassword;

      if (confirmPassword && password !== confirmPassword) {
        setPasswordError("Las contraseñas no coinciden");
      } else {
        setPasswordError("");
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors({});

    if (formData.password !== formData.confirmPassword) {
      setPasswordError("Las contraseñas no coinciden");
      return;
    }

    if (!userData && !formData.password) {
      setPasswordError("La contraseña es obligatoria para nuevos usuarios");
      return;
    }

    const dataToSubmit = {
      ...formData,
      idRol: formData.idRol || formData.role?.idRol || 0,
    };

    if (userData && !dataToSubmit.password) {
      delete dataToSubmit.password;
    }

    delete dataToSubmit.confirmPassword;

    try {
      await onSave(dataToSubmit);
      onClose();
    } catch (error) {
      console.log("Error completo:", error);

      if (error.errors) {
        const formattedErrors = {};
        error.errors.forEach((err) => {
          formattedErrors[err.path] = err.msg;
        });
        setErrors(formattedErrors);
        toast.error("Error al crear usuario Validar los Campos");
      } else if (error.message) {
        console.error("Error:", error.message);
      } else {
        console.error("Error inesperado:", error);
      }
    }
  };

  const validateField = (name, value) => {
    let error = "";

    switch (name) {
      case "name":
        if (!value.trim()) {
          error = "El nombre es obligatorio";
        } else if (value.trim().length < 3) {
          error = "El nombre debe tener al menos 3 caracteres";
        } else if (/[0-9]/.test(value)) {
          error = "El nombre no puede contener números";
        } else if (/[^a-zA-ZáéíóúÁÉÍÓÚñÑ\s]/.test(value)) {
          error = "El nombre no puede contener caracteres especiales";
        } else if (value.trim().length > 50) {
          error = "El nombre debe tener menos de 50 caracteres";
        }
        break;

      case "email":
        if (!value.trim()) {
          error = "El correo electrónico es obligatorio";
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
          error = "El correo electrónico no es válido";
        }
        break;

      case "identification":
        if (!value.trim()) {
          error = "La identificación es obligatoria";
        } else if (/^0/.test(value)) {
          error = "La identificación no puede empezar con 0";
        } else if (/\./.test(value)) {
          error = "La identificación no puede ser un número decimal";
        } else if (/[a-zA-Z]/.test(value)) {
          error = "La identificación no puede tener letras";
        } else if (/[^0-9]/.test(value)) {
          error = "La identificación no puede contener caracteres especiales";
        } else if (/^-/.test(value)) {
          error = "La identificación no puede ser un número negativo";
        } else if (value.trim().length < 6) {
          error = "La identificación debe tener al menos 6 caracteres";
        } else if (value.trim().length > 15) {
          error = "La identificación no puede ser mayor a 15 caracteres";
        }
        break;

      case "cellphone":
        if (!value.trim()) {
          error = "El teléfono es obligatorio";
        } else if (/[a-zA-Z]/.test(value)) {
          error = "El teléfono no debe contener letras";
        } else if (/^-/.test(value)) {
          error = "El teléfono no debe ser un número negativo";
        } else if (/[^0-9]/.test(value)) {
          error = "El teléfono no debe contener caracteres especiales";
        } else if (!/^\d{10}$/.test(value)) {
          error = "El teléfono debe tener 10 dígitos";
        }
        break;

      case "birthdate":
        if (!value) {
          error = "La fecha de nacimiento es obligatoria";
        } else {
          const age = calculateAge(value);
          if (age < 18) {
            error = "Debe ser mayor de 18 años";
          }
        }
        break;

      case "password":
        if (!customerData && !value) {
          error = "La contraseña es obligatoria para nuevos clientes";
        } else if (value && value.length < 8) {
          error = "La contraseña debe tener al menos 8 caracteres";
        } else if (value && value.length > 15) {
          error = "La contraseña no debe contener más de 15 dígitos";
        } else if (
          value &&
          !/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_])[A-Za-z\d\W_]{8,}$/.test(value)
        ) {
          error =
            "La contraseña debe contener mayúsculas, minúsculas, números y caracteres especiales";
        }
        break;

      case "identificationType":
        if (!value) {
          error = "El tipo de identificación es obligatorio";
        }
        break;

      case "eps":
        if (value.trim()) {
          if (value.length < 4) {
            error = "La EPS debe tener al menos 4 caracteres";
          } else if (value.length > 50) {
            error = "La EPS no puede tener más de 50 caracteres";
          } else if (/[^a-zA-ZáéíóúÁÉÍÓÚñÑ\s0-9]/.test(value)) {
            error = "La EPS no puede contener caracteres especiales";
          }
        }
        break;

      case "address":
        if (value.trim()) {
          if (value.length < 3) {
            error = "La dirección debe tener al menos 3 caracteres";
          } else if (value.length > 50) {
            error = "La dirección no puede tener más de 50 caracteres";
          }
        }
        break;
    }

    return error;
  };
  
  const calculateAge = (birthdate) => {
    const birthDate = new Date(birthdate);
    const today = new Date();

    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();

    // Ajustar si aún no ha pasado el mes de cumpleaños o el día exacto
    if (
      monthDiff < 0 ||
      (monthDiff === 0 && today.getDate() < birthDate.getDate())
    ) {
      age--;
    }

    return age;
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
            <div className="user-tabs-container">
              <ul className="user-tabs">
                <li
                  className={`user-tab ${
                    activeTab === "personal" ? "active" : ""
                  }`}
                  onClick={() => setActiveTab("personal")}
                >
                  Datos Personales
                </li>
                <li
                  className={`user-tab ${
                    activeTab === "contact" ? "active" : ""
                  }`}
                  onClick={() => setActiveTab("contact")}
                >
                  Información de Contacto
                </li>
                <li
                  className={`user-tab ${
                    activeTab === "security" ? "active" : ""
                  }`}
                  onClick={() => setActiveTab("security")}
                >
                  Seguridad
                </li>
              </ul>
            </div>

            {/* Pestaña de Datos Personales */}
            <div
              className={`user-tab-content ${
                activeTab === "personal" ? "active" : ""
              }`}
            >
              <div className="user-form-grid">
                <div className="user-form-group">
                  <label htmlFor="name">Nombre Completo </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="Nombre completo"
                    required
                    className={errors.name ? "input-error-admin" : ""}
                  />
                  {errors.name && (
                    <span className="error-message-admin">{errors.name}</span>
                  )}
                </div>

                <div className="user-form-group">
                  <label htmlFor="identificationType">
                    Tipo de Identificación{" "}
                  </label>
                  <select
                    id="identificationType"
                    name="identificationType"
                    value={formData.identificationType}
                    onChange={handleChange}
                    required
                    className={
                      errors.identificationType ? "input-error-admin" : ""
                    }
                  >
                    <option value="">Seleccione</option>
                    <option value="CC">Cédula de Ciudadanía</option>
                    <option value="CE">Cédula de Extranjería</option>
                  </select>
                  {errors.identificationType && (
                    <span className="error-message-admin">
                      {errors.identificationType}
                    </span>
                  )}
                </div>

                <div className="user-form-group">
                  <label htmlFor="identification">
                    Número de Identificación{" "}
                  </label>
                  <input
                    type="text"
                    id="identification"
                    name="identification"
                    value={formData.identification}
                    onChange={handleChange}
                    placeholder="Número de identificación"
                    required
                    className={errors.identification ? "input-error-admin" : ""}
                  />
                  {errors.identification && (
                    <span className="error-message-admin">
                      {errors.identification}
                    </span>
                  )}
                </div>

                <div className="user-form-group">
                  <label htmlFor="birthdate">Fecha de Nacimiento </label>
                  <input
                    type="date"
                    id="birthdate"
                    name="birthdate"
                    value={formData.birthdate}
                    onChange={handleChange}
                    required
                    className={errors.birthdate ? "input-error-admin" : ""}
                  />
                  {errors.birthdate && (
                    <span className="error-message-admin">
                      {errors.birthdate}
                    </span>
                  )}
                </div>

                <div className="user-form-group">
                  <label htmlFor="eps" className="optional">
                    EPS
                  </label>
                  <input
                    type="text"
                    id="eps"
                    name="eps"
                    value={formData.eps}
                    onChange={handleChange}
                    placeholder="EPS"
                    className={errors.eps ? "input-error-admin" : ""}
                  />
                  {errors.eps && (
                    <span className="error-message-admin">{errors.eps}</span>
                  )}
                </div>

                <div className="user-form-group">
                  <label htmlFor="rol">Rol *</label>
                  <select
                    id="rol"
                    name="rol"
                    value={formData.role?.name || ""}
                    onChange={handleChange}
                    required
                    className={errors.idRol ? "input-error-admin" : ""}
                  >
                    <option value="">Seleccione un rol</option>
                    {rolesData.map((role) => (
                      <option key={role.idRol} value={role.name}>
                        {role.name}
                      </option>
                    ))}
                  </select>
                  {errors.idRol && (
                    <span className="error-message-admin">{errors.idRol}</span>
                  )}
                </div>
              </div>
            </div>

            {/* Pestaña de Información de Contacto */}
            <div
              className={`user-tab-content ${
                activeTab === "contact" ? "active" : ""
              }`}
            >
              <div className="user-form-grid">
                <div className="user-form-group">
                  <label htmlFor="email">Correo Electrónico </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="ejemplo@correo.com"
                    required
                    className={errors.email ? "input-error-admin" : ""}
                  />
                  {errors.email && (
                    <span className="error-message-admin">{errors.email}</span>
                  )}
                </div>

                <div className="user-form-group">
                  <label htmlFor="cellphone">Teléfono Celular </label>
                  <input
                    type="tel"
                    id="cellphone"
                    name="cellphone"
                    value={formData.cellphone}
                    onChange={handleChange}
                    placeholder="Número de celular"
                    required
                    className={errors.cellphone ? "input-error-admin" : ""}
                  />
                  {errors.cellphone && (
                    <span className="error-message-admin">
                      {errors.cellphone}
                    </span>
                  )}
                </div>

                <div className="user-form-group">
                  <label htmlFor="address" className="optional">
                    Dirección
                  </label>
                  <input
                    type="text"
                    id="address"
                    name="address"
                    value={formData.address}
                    onChange={handleChange}
                    placeholder="Dirección completa"
                    className={errors.address ? "input-error-admin" : ""}
                  />
                  {errors.address && (
                    <span className="error-message-admin">
                      {errors.address}
                    </span>
                  )}
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
            </div>

            {/* Pestaña de Seguridad */}
            <div
              className={`user-tab-content ${
                activeTab === "security" ? "active" : ""
              }`}
            >
              <div className="user-form-grid">
                <div className="user-form-group">
                  <label htmlFor="password">
                    {userData
                      ? "Contraseña (Dejar vacío para mantener actual)"
                      : "Contraseña "}
                  </label>
                  <input
                    type="password"
                    id="password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    placeholder={
                      userData
                        ? "Dejar vacío para mantener actual"
                        : "Contraseña"
                    }
                    required={!userData}
                    className={errors.password ? "input-error-admin" : ""}
                  />
                  {errors.password && (
                    <span className="error-message-admin">
                      {errors.password}
                    </span>
                  )}
                </div>

                <div className="user-form-group">
                  <label htmlFor="confirmPassword">
                    {userData
                      ? "Confirmar Contraseña (si cambia)"
                      : "Confirmar Contraseña "}
                  </label>
                  <input
                    type="password"
                    id="confirmPassword"
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    placeholder="Confirmar contraseña"
                    required={!userData || formData.password !== ""}
                  />
                  {passwordError && (
                    <p className="error-message-admin">{passwordError}</p>
                  )}
                </div>
              </div>
            </div>

            <div className="user-modal-footer">
              <button
                type="button"
                className="user-cancel-btn"
                onClick={onClose}
              >
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
