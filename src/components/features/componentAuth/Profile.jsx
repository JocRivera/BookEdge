
import React, { useState, useEffect } from "react";
import { useAuth } from "../../../context/AuthContext";
import { FiUser, FiSave, FiX } from "react-icons/fi";
import { FaUserShield, FaUserEdit } from "react-icons/fa";
import { FaCircleUser } from "react-icons/fa6";
import "./Profile.css";
import { updateProfile } from "../../../services/AuthService";
import { toast } from "react-toastify";

const Profile = ({ onClose, isOpen }) => {
  // Añadido isOpen para el useEffect
  const { user, setUser } = useAuth();
  const [isEditing, setIsEditing] = useState(false);

  const initialFormData = {
    name: "",
    email: "",
    eps: "",
    identificationType: "CC",
    identification: "",
    cellphone: "",
    address: "",
    birthdate: "",
  };
  const [formData, setFormData] = useState(initialFormData);

  const [submitError, setSubmitError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [errors, setErrors] = useState({}); // Para errores de campo

  useEffect(() => {
    if (user) {
      const userData = {
        idUser: user.idUser,
        name: user.name || "",
        email: user.email || "",
        eps: user.eps || "",
        identificationType: user.identificationType || "CC",
        identification: user.identification || "",
        cellphone: user.cellphone || "",
        address: user.address || "",
        birthdate: user.birthdate ? user.birthdate.split("T")[0] : "",
      };
      setFormData(userData);
    } else {
      setFormData(initialFormData); // Reset si no hay usuario (o al cerrar y reabrir)
    }
    // Limpiar errores cada vez que el modal se abre o el usuario cambia
    setErrors({});
    setSubmitError(null);
    setSuccess(null);
  }, [user, isOpen]); // Dependencia de isOpen para resetear al reabrir

  const validateField = (name, value) => {
    let error = "";
    switch (name) {
      case "name":
        if (!value.trim()) error = "El nombre completo es obligatorio.";
        else if (value.trim().length < 3)
          error = "Debe tener al menos 3 caracteres.";
        break;
      case "identificationType":
        if (!value) error = "El tipo de identificación es obligatorio.";
        break;
      case "identification":
        if (!value.trim())
          error = "El número de identificación es obligatorio.";
        else if (value.trim().length < 5)
          error = "Debe tener al menos 5 caracteres.";
        break;
      case "cellphone":
        if (!value.trim()) error = "El teléfono/celular es obligatorio.";
        else if (!/^\d{10}$/.test(value.trim()))
          error = "Debe ser un número de 10 dígitos.";
        break;
      case "birthdate":
        if (value) {
          // Solo valida si tiene valor, asumiendo opcional o requerido de otra forma
          const today = new Date();
          const birthDate = new Date(value);
          today.setHours(0, 0, 0, 0); // Normalizar hora para comparación
          birthDate.setHours(0, 0, 0, 0); // Normalizar hora

          let age = today.getFullYear() - birthDate.getFullYear();
          const m = today.getMonth() - birthDate.getMonth();
          if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
            age--;
          }
          if (birthDate > today) error = "La fecha no puede ser futura.";
          else if (age < 18) error = "Debes ser mayor de 18 años."; // Si es un requisito
        }
        // Si 'birthdate' fuese estrictamente obligatorio y está vacío:
        // else if (!value && isEditing) error = "La fecha de nacimiento es obligatoria";
        break;
      default:
        break;
    }
    return error;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    // Validación al cambiar
    const errorMsg = validateField(name, value);
    setErrors((prev) => ({ ...prev, [name]: errorMsg }));
  };

  const validateForm = () => {
    const newErrors = {};
    let formIsValid = true;

    // Lista de campos a validar y si son requeridos
    // El email está deshabilitado, no lo validamos en el front al editar
    const fieldsToValidate = [
      { name: "name", required: true },
      { name: "identificationType", required: true },
      { name: "identification", required: true },
      { name: "cellphone", required: true },
      { name: "birthdate", required: false }, // Cambiar a true si es estrictamente requerido
      // { name: "eps", required: false }, // Opcional
      // { name: "address", required: false }, // Opcional
    ];

    fieldsToValidate.forEach((field) => {
      const error = validateField(field.name, formData[field.name]);
      if (error) {
        newErrors[field.name] = error;
        if (field.required || formData[field.name]) {
          // Si es requerido, o si tiene valor aunque sea opcional pero con error
          formIsValid = false;
        }
      }
    });

    setErrors(newErrors);
    return formIsValid;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitError(null);
    setSuccess(null);

    if (!validateForm()) {
      toast.error("Por favor, corrige los errores en el formulario.");
      return;
    }

    try {
      const dataToSubmit = { ...formData };
      const updatedUserResponse = await updateProfile(dataToSubmit); // Esta es tu función de AuthService.jsx

      // ---- CAMBIO CRUCIAL AQUÍ ----
      if (setUser && updatedUserResponse) { // Asegúrate que updatedUserResponse no sea undefined o null
        // Asumimos que updatedUserResponse ES el objeto usuario COMPLETO y ACTUALIZADO
        // devuelto por tu backend, incluyendo 'idUser', 'name', 'email', 'role' (con 'permissionRoles' DENTRO de 'role').
        console.log("Actualizando usuario en AuthContext con:", updatedUserResponse);
        setUser(updatedUserResponse); // <--- Usa directamente la respuesta del backend
      }
      // ---- FIN DEL CAMBIO ----

      setSuccess("Perfil actualizado con éxito.");
      setIsEditing(false);
      toast.success("¡Perfil actualizado!");
    } catch (error) {
      console.error("Error al actualizar:", error);
      if (error.response && error.response.data && error.response.data.errors) {
        const backendErrors = {};
        let generalErrorMessage = "Algunos datos son inválidos. ";
        error.response.data.errors.forEach((err) => {
          if (err.path && err.msg) {
            backendErrors[err.path] = err.msg;
          } else if (err.msg) {
            // Error más general del backend
            generalErrorMessage += err.msg;
          }
        });
        setErrors((prev) => ({ ...prev, ...backendErrors }));
        setSubmitError(
          Object.keys(backendErrors).length > 0
            ? "Revisa los campos marcados."
            : generalErrorMessage
        );
        toast.error(
          "Error al actualizar. " +
            (Object.keys(backendErrors).length > 0
              ? "Revisa los campos."
              : generalErrorMessage)
        );
      } else {
        const errorMessage =
          error.response?.data?.message ||
          error.message ||
          "Error al actualizar el perfil.";
        setSubmitError(errorMessage);
        toast.error(errorMessage);
      }
      setTimeout(() => setSubmitError(null), 7000);
    }
  };

  const handleCancel = () => {
    if (user) {
      setFormData({
        idUser: user.idUser,
        name: user.name || "",
        email: user.email || "",
        eps: user.eps || "",
        identificationType: user.identificationType || "CC",
        identification: user.identification || "",
        cellphone: user.cellphone || "",
        address: user.address || "",
        birthdate: user.birthdate ? user.birthdate.split("T")[0] : "",
      });
    }
    setIsEditing(false);
    setSubmitError(null);
    setSuccess(null);
    setErrors({});
  };

  if (!user) return null;

  return (
    <div className="profile-modal-card">
      <div className="profile-modal-header">
        <div className="profile-modal-header-title">
          <FaCircleUser />
          <h2>Mi Perfil</h2>
        </div>
        <button
          onClick={onClose}
          className="profile-modal-close-btn"
          aria-label="Cerrar"
        >
          <FiX />
        </button>
      </div>

      <div className="profile-modal-user-summary">
        <div className="profile-modal-avatar">
          {user.name ? user.name.charAt(0).toUpperCase() : <FiUser />}
        </div>
        <div className="profile-modal-user-info">
          <h3>{user.name || "Nombre de Usuario"}</h3>
          <p>{user.email}</p>
          <span className="profile-modal-role-badge">
            <FaUserShield size={14} /> {user.role?.name || "Rol no definido"}
          </span>
        </div>
        {!isEditing && (
          <button
            onClick={() => setIsEditing(true)}
            className="profile-modal-edit-main-btn"
          >
            <FaUserEdit /> Editar Perfil
          </button>
        )}
      </div>

      {submitError && (
        <div className="profile-modal-message error">{submitError}</div>
      )}
      {success && (
        <div className="profile-modal-message success">{success}</div>
      )}

      <form
        onSubmit={handleSubmit}
        className={`profile-modal-form ${isEditing ? "is-editing" : ""}`}
      >
        {/* --- Sección Información Personal --- */}
        <div className="profile-modal-section">
          <h4>Información Personal</h4>
          <div className="profile-modal-grid">
            {/* Nombre Completo */}
            <div className="profile-modal-field">
              <label htmlFor="name">
                Nombre Completo
                {isEditing && <span className="required-asterisk">*</span>}
              </label>
              {isEditing ? (
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  className={errors.name ? "input-error-profile" : ""}
                />
              ) : (
                <p className="profile-modal-field-value">
                  {formData.name || "No especificado"}
                </p>
              )}
              {isEditing && errors.name && (
                <span className="error-message-profile">{errors.name}</span>
              )}
            </div>

            {/* Email (No editable) */}
            <div className="profile-modal-field">
              <label htmlFor="email">Email</label>
              {isEditing ? ( // Lo mostramos como input disabled si se está editando, sino como <p>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  readOnly
                  disabled
                  className={errors.email ? "input-error-profile" : ""}
                />
              ) : (
                <p className="profile-modal-field-value">{formData.email}</p>
              )}
              {/* No debería haber errores de front para email si está deshabilitado */}
            </div>

            {/* Tipo de Identificación */}
            <div className="profile-modal-field">
              <label htmlFor="identificationType">
                Tipo de Identificación
                {isEditing && <span className="required-asterisk">*</span>}
              </label>
              {isEditing ? (
                <select
                  id="identificationType"
                  name="identificationType"
                  value={formData.identificationType}
                  onChange={handleChange}
                  required
                  disabled={!isEditing && !!formData.identificationType}
                  className={
                    errors.identificationType ? "input-error-profile" : ""
                  }
                >
                  <option value="CC">Cédula de Ciudadanía</option>
                  <option value="CE">Cédula de Extranjería</option>
                </select>
              ) : (
                <p className="profile-modal-field-value">
                  {formData.identificationType
                    ? formData.identificationType.toUpperCase()
                    : "No especificado"}
                </p>
              )}
              {isEditing && errors.identificationType && (
                <span className="error-message-profile">
                  {errors.identificationType}
                </span>
              )}
            </div>

            {/* Número de Identificación */}
            <div className="profile-modal-field">
              <label htmlFor="identification">
                Número de Identificación
                {isEditing && <span className="required-asterisk">*</span>}
              </label>
              {isEditing ? (
                <input
                  type="text"
                  id="identification"
                  name="identification"
                  value={formData.identification}
                  onChange={handleChange}
                  required
                  disabled={!isEditing && !!formData.identification}
                  className={errors.identification ? "input-error-profile" : ""}
                />
              ) : (
                <p className="profile-modal-field-value">
                  {formData.identification || "No especificado"}
                </p>
              )}
              {isEditing && errors.identification && (
                <span className="error-message-profile">
                  {errors.identification}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* --- Sección Contacto y Datos Adicionales --- */}
        <div className="profile-modal-section">
          <h4>Contacto y Datos Adicionales</h4>
          <div className="profile-modal-grid">
            {/* Teléfono/Celular */}
            <div className="profile-modal-field">
              <label htmlFor="cellphone">
                Teléfono/Celular
                {isEditing && <span className="required-asterisk">*</span>}
              </label>
              {isEditing ? (
                <input
                  type="tel"
                  id="cellphone"
                  name="cellphone"
                  value={formData.cellphone}
                  onChange={handleChange}
                  required
                  className={errors.cellphone ? "input-error-profile" : ""}
                />
              ) : (
                <p className="profile-modal-field-value">
                  {formData.cellphone || "No especificado"}
                </p>
              )}
              {isEditing && errors.cellphone && (
                <span className="error-message-profile">
                  {errors.cellphone}
                </span>
              )}
            </div>

            {/* Fecha de Nacimiento (Opcional o Requerido según tu lógica) */}
            <div className="profile-modal-field">
              <label htmlFor="birthdate">Fecha de Nacimiento</label>
              {isEditing ? (
                <input
                  type="date"
                  id="birthdate"
                  name="birthdate"
                  value={formData.birthdate}
                  onChange={handleChange}
                  className={errors.birthdate ? "input-error-profile" : ""}
                />
              ) : (
                <p className="profile-modal-field-value">
                  {formData.birthdate || "No especificada"}
                </p>
              )}
              {isEditing && errors.birthdate && (
                <span className="error-message-profile">
                  {errors.birthdate}
                </span>
              )}
            </div>

            {/* Dirección de Residencia (Opcional) */}
            <div className="profile-modal-field">
              <label htmlFor="address">Dirección de Residencia</label>
              {isEditing ? (
                <input
                  type="text"
                  id="address"
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                  className={errors.address ? "input-error-profile" : ""}
                />
              ) : (
                <p className="profile-modal-field-value">
                  {formData.address || "No especificada"}
                </p>
              )}
              {isEditing && errors.address && (
                <span className="error-message-profile">{errors.address}</span>
              )}
            </div>

            {/* EPS (Opcional) */}
            <div className="profile-modal-field">
              <label htmlFor="eps">EPS</label>
              {isEditing ? (
                <input
                  type="text"
                  id="eps"
                  name="eps"
                  value={formData.eps}
                  onChange={handleChange}
                  className={errors.eps ? "input-error-profile" : ""}
                />
              ) : (
                <p className="profile-modal-field-value">
                  {formData.eps || "No especificada"}
                </p>
              )}
              {isEditing && errors.eps && (
                <span className="error-message-profile">{errors.eps}</span>
              )}
            </div>
          </div>
        </div>

        {isEditing && (
          <div className="profile-modal-actions">
            <button
              type="button"
              className="profile-modal-btn secondary"
              onClick={handleCancel}
            >
              Cancelar
            </button>
            <button type="submit" className="profile-modal-btn primary">
              <FiSave /> Guardar Cambios
            </button>
          </div>
        )}
      </form>
    </div>
  );
};

export default Profile;
