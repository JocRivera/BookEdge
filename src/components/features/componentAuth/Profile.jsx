
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

  // Función para validar campos (puedes llamarla igual en tu componente de Perfil)
// Solo incluirá los cases para los campos del perfil que necesitas validar.

const validateField = (name, value) => { // Mismo nombre de función
  let error = "";

  switch (name) {
    case "name": // Nombre completo
      if (!value.trim()) {
        error = "El nombre completo es obligatorio.";
      } else if (value.trim().length < 3) {
        error = "El nombre debe tener al menos 3 caracteres.";
      } else if (value.trim().length > 50) {
        error = "El nombre no puede exceder los 50 caracteres.";
      }
      break;

    case "identificationType": // Tipo de documento
      if (!value.trim()) {
        error = "Debes seleccionar un tipo de documento.";
      }
      break;

    case "identification": // Número de documento/identificación
      if (!value.trim()) {
        error = "El número de documento es obligatorio.";
      } else if (value.trim().length < 5) {
        error = "La identificación debe tener mínimo 5 caracteres.";
      }
      // else if (value.trim().length > 10) { // Si tienes un máximo
      //   error = "La identificación no puede tener más de 10 caracteres.";
      // }
      else if (!/^\d+$/.test(value.trim())) {
        error = "El número de documento solo debe contener números."
      }
      break;

    case "cellphone": // Número de contacto/celular
      if (!value.trim()) {
        error = "El número de contacto es obligatorio.";
      } else if (value.trim().length < 10) {
        error = "El número de contacto debe tener al menos 10 caracteres.";
      } else if (!/^\d+$/.test(value.trim())) {
        error = "El número de contacto solo debe contener números."
      }
      break;

    case "birthdate": // Fecha de nacimiento
      if (!value.trim()) {
        error = "La fecha de nacimiento es obligatoria.";
      } else {
        const birthDate = new Date(value);
        const eighteenYearsAgo = new Date();
        eighteenYearsAgo.setFullYear(eighteenYearsAgo.getFullYear() - 18);

        if (birthDate > eighteenYearsAgo) {
          error = "Debes ser mayor de 18 años.";
        }
      }
      break;
    
    // NO INCLUIR cases para 'email', 'password', 'confirmPassword' aquí si no los validas en el perfil.

    default:
      break;
  }
  return error;
};

const handleChange = (e) => { // MISMA FUNCIÓN handleChange
  const { name, value } = e.target;
  setFormData(prevData => ({ ...prevData, [name]: value })); // Actualiza el estado 'formData'

  // Validar el campo modificado
  const error = validateField(name, value); // Llama a TU función validateField
  setErrors(prevErrors => ({
    ...prevErrors,
    [name]: error,
    // Opcional: Limpiar el error si el campo ahora es válido
    // [name]: error || null, // si error es "", se pondrá null y limpiará
  }));
};

  const validateForm = () => { // MISMA FUNCIÓN validateForm
  const newErrors = {};
  let isValid = true;

  // Lista de los CAMPOS DEL PERFIL que quieres validar
  // Asegúrate que estos nombres coincidan con las 'keys' en tu estado 'formData' del perfil
  const fieldsToValidateInProfile = ["name", "identificationType", "identification", "cellphone", "birthdate"];

  fieldsToValidateInProfile.forEach(fieldName => {
    // Solo valida si el campo existe en el estado formData y tiene un valor o se espera que tenga uno
    if (formData.hasOwnProperty(fieldName)) {
        const valueToValidate = formData[fieldName] === null || formData[fieldName] === undefined ? "" : String(formData[fieldName]);
        const error = validateField(fieldName, valueToValidate);
        if (error) {
            newErrors[fieldName] = error;
            isValid = false;
        }
    }
  });

  setErrors(newErrors); // Actualiza el estado 'errors'
  return isValid;
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
