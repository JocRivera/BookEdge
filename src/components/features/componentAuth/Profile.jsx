// Profile.jsx (Reimaginado para ser el contenido de un modal)

import React, { useState, useEffect } from "react";
import { useAuth } from "../../../context/AuthContext";
import {
  FiUser,
  FiMail,
  FiPhone,
  FiMapPin,
  FiCalendar,
  FiKey,
  FiEdit2,
  FiSave,
  FiX, 
  FiShield,
  FiBriefcase, 
} from "react-icons/fi";
import "./Profile.css"; 
import { updateProfile } from "../../../services/AuthService"; 

const ProfileField = ({
  label,
  value,
  name,
  isEditing,
  onChange,
  type = "text",
  required = false,
  options, 
  disabled = false
}) => (
  <div className="profile-modal-field">
    <label htmlFor={name}>{label}</label>
    {isEditing ? (
      options ? (
        <select id={name} name={name} value={value} onChange={onChange} required={required} disabled={disabled}>
          {options.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
        </select>
      ) : (
        <input
          id={name}
          type={type}
          name={name}
          value={value}
          onChange={onChange}
          required={required}
          disabled={disabled}
        />
      )
    ) : (
      <p className="profile-modal-field-value">{value || "No especificado"}</p>
    )}
  </div>
);


const Profile = ({ onClose }) => { 
  const { user, setUser } = useAuth(); 
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    eps: "",
    identificationType: "CC",
    identification: "",
    cellphone: "",
    address: "",
    birthdate: "",
  });
  // Añadimos estado para manejo de errores y éxito
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  useEffect(() => {
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
        birthdate: user.birthdate ? user.birthdate.split('T')[0] : "", // Formatear para input date
      });
    }
  }, [user]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    try {
      // Aquí podrías añadir validaciones del lado del cliente si quieres
      const updatedUser = await updateProfile(formData); // Suponemos que updateProfile devuelve el usuario actualizado
      
      // Es crucial actualizar el usuario en el contexto de Auth si la API lo devuelve actualizado
      // O si no lo devuelve, podrías manualmente fusionar formData con el user del contexto
      // Ejemplo (si la API devuelve el usuario completo actualizado):
      if (setUser && updatedUser) { // Si tienes setUser en tu contexto
          setUser(prevUser => ({ ...prevUser, ...updatedUser }));
      } else { // Si no o si la API no devuelve el user completo, actualiza localmente para UI
           setUser(prevUser => ({ ...prevUser, ...formData }));
      }
      
      setSuccess("Perfil actualizado con éxito.");
      setIsEditing(false);
      setTimeout(() => setSuccess(null), 3000); // Limpiar mensaje después de 3s
    } catch (error) {
      console.error("Error al actualizar:", error);
      setError(error.response?.data?.message || error.message || "Error al actualizar el perfil.");
      setTimeout(() => setError(null), 5000); // Limpiar mensaje de error
    }
  };
  
  const handleCancel = () => {
    // Resetear el formulario a los datos originales del usuario
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
            birthdate: user.birthdate ? user.birthdate.split('T')[0] : "",
        });
    }
    setIsEditing(false);
    setError(null); // Limpiar errores al cancelar
    setSuccess(null);
  };


  if (!user) return null; // O un loader si es necesario

  return (
    <div className="profile-modal-card">
      <div className="profile-modal-header">
        <div className="profile-modal-header-title">
          <FiUser />
          <h2>Mi Perfil</h2>
        </div>
        <button onClick={onClose} className="profile-modal-close-btn" aria-label="Cerrar">
          <FiX />
        </button>
      </div>

      <div className="profile-modal-user-summary">
        <div className="profile-modal-avatar">{user.name ? user.name.charAt(0).toUpperCase() : <FiUser/>}</div>
        <div className="profile-modal-user-info">
          <h3>{user.name || "Nombre de Usuario"}</h3>
          <p>{user.email}</p>
          <span className="profile-modal-role-badge">
            <FiShield size={14} /> {user.role?.name || "Rol no definido"}
          </span>
        </div>
        {!isEditing && (
          <button onClick={() => setIsEditing(true)} className="profile-modal-edit-main-btn">
            <FiEdit2 /> Editar Perfil
          </button>
        )}
      </div>
      
      {error && <div className="profile-modal-message error">{error}</div>}
      {success && <div className="profile-modal-message success">{success}</div>}

      <form onSubmit={handleSubmit} className="profile-modal-form">
        <div className="profile-modal-section">
          <h4>Información Personal</h4>
          <div className="profile-modal-grid">
            <ProfileField label="Nombre Completo" name="name" value={formData.name} isEditing={isEditing} onChange={handleChange} required />
            <ProfileField label="Email" name="email" type="email" value={formData.email} isEditing={isEditing} onChange={handleChange} required disabled={!isEditing} /> {/* Email no editable usualmente, o editable con confirmación */}
            <ProfileField
              label="Tipo de Identificación"
              name="identificationType"
              value={formData.identificationType}
              isEditing={isEditing}
              onChange={handleChange}
              options={[{value: "CC", label: "Cédula de Ciudadanía"}, {value: "CE", label: "Cédula de Extranjería"}, {value: "TI", label: "Tarjeta de Identidad"}, {value: "NIT", label: "NIT"}, {value: "PAS", label: "Pasaporte"}]}
              disabled={!isEditing && !!formData.identificationType} // No editable si ya tiene un valor y no está editando
            />
            <ProfileField label="Número de Identificación" name="identification" value={formData.identification} isEditing={isEditing} onChange={handleChange} required disabled={!isEditing && !!formData.identification}/>
          </div>
        </div>

        <div className="profile-modal-section">
          <h4>Contacto y Datos Adicionales</h4>
          <div className="profile-modal-grid">
            <ProfileField label="Teléfono/Celular" name="cellphone" type="tel" value={formData.cellphone} isEditing={isEditing} onChange={handleChange} required />
            <ProfileField label="Fecha de Nacimiento" name="birthdate" type="date" value={formData.birthdate} isEditing={isEditing} onChange={handleChange} />
            <ProfileField label="Dirección de Residencia" name="address" value={formData.address} isEditing={isEditing} onChange={handleChange} />
            <ProfileField label="EPS" name="eps" value={formData.eps} isEditing={isEditing} onChange={handleChange} />
          </div>
        </div>
        
        {/* Aquí podrías añadir una sección para cambiar contraseña si lo deseas */}

        {isEditing && (
          <div className="profile-modal-actions">
            <button type="button" className="profile-modal-btn secondary" onClick={handleCancel}>
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

export default Profile; // Exportamos el contenido para ser usado en un modal