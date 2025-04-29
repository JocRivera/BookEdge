import { useState, useEffect } from "react";
import { useAuth } from "../../../context/authContext";
import {
  FiEdit,
  FiSave,
  FiUser,
  FiMapPin,
  FiShield,
} from "react-icons/fi";
import "./Profile.css";
import { updateProfile } from "../../../services/AuthService";

const Profile = () => {
  const { user } = useAuth();
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
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    if (user) {
      setFormData({
        idUser:user.idUser,
        name: user.name || "",
        email: user.email || "",
        eps: user.eps || "",
        identificationType: user.identificationType || "CC",
        identification: user.identification || "",
        cellphone: user.cellphone || "",
        address: user.address || "",
        birthdate: user.birthdate || "",
      });
    }
  }, [user]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await updateProfile(formData);
      console.log("Datos a actualizar:", formData);
      setIsEditing(false);
    } catch (error) {
      console.error("Error al actualizar:", error);
    }
  };

  return (
<div className={`profile-container profile-container-${user?.role?.name?.toLowerCase() || 'default'}`}>

<div className="profile-card">
        <div className="profile-header">
          <div className="profile-header-content">
            <h2>Mi Perfil</h2>
            <h2 className="profile-name">{user?.name}</h2>
            <span className="profile-user-role">
              <FiShield /> {user?.role?.name || "Rol no definido"}
            </span>
          </div>
          {!isEditing && (
            <button onClick={() => setIsEditing(true)} className="profile-edit-button">
              <FiEdit /> Editar
            </button>
          )}
        </div>

        <form onSubmit={handleSubmit} className="profile-form">
          <div className="profile-form-section">
            <h3 className="profile-section-title">
              <FiUser className="profile-section-icon" />
              Información Personal
            </h3>

            <div className="profile-form-grid">
              <div className="profile-form-group">
                <label>Nombre Completo</label>
                {isEditing ? (
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                  />
                ) : (
                  <p>{formData.name || "No especificado"}</p>
                )}
              </div>

              <div className="profile-form-group">
                <label>
                  Email
                </label>
                {isEditing ? (
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                  />
                ) : (
                  <p>{formData.email}</p>
                )}
              </div>

              <div className="profile-form-group">
                <label>Tipo de ID
                </label>
                {isEditing ? (
                  <select
                    name="identificationType"
                    value={formData.identificationType}
                    onChange={handleChange}
                  >
                     <option value="CC">Cédula</option>
                     <option value="CE">Cédula Extranjería</option>
                  </select>
                ) : (
                  <p>
                    {formData.identificationType === "CC" && "Cédula"}
                    {formData.identificationType === "CE" &&
                      "Cédula Extranjería"}
                  </p>
                )}
              </div>

              <div className="profile-form-group">
                <label>
                  Número de ID
                </label>
                {isEditing ? (
                  <input
                    type="text"
                    name="identification"
                    value={formData.identification}
                    onChange={handleChange}
                    required
                    
                  />
                ) : (
                  <p>{formData.identification || "No especificado"}</p>
                )}
              </div>
            </div>
          </div>

          {/* Sección 2: Datos Médicos y Contacto */}
          <div className="profile-form-section">
            <h3 className="profile-section-title">
              <FiMapPin className="profile-section-icon" />
              Datos Adicionales
            </h3>
            <div className="profile-form-grid">
              {/* EPS */}
              <div className="profile-form-group">
                <label>EPS</label>
                {isEditing ? (
                  <input
                    type="text"
                    name="eps"
                    value={formData.eps}
                    onChange={handleChange}
                  />
                ) : (
                  <p>{formData.eps || "No especificada"}</p>
                )}
              </div>

              {/* Teléfono */}
              <div className="profile-form-group">
                <label>
                  Teléfono/Celular
                </label>
                {isEditing ? (
                  <input
                    type="tel"
                    name="cellphone"
                    value={formData.cellphone}
                    onChange={handleChange}
                    required
                  />
                ) : (
                  <p>{formData.cellphone || "No especificado"}</p>
                )}
              </div>

              {/* Fecha de Nacimiento */}
              <div className="profile-form-group">
                <label>
                  Fecha de Nacimiento
                </label>
                {isEditing ? (
                  <input
                    type="date"
                    name="birthdate"
                    value={formData.birthdate}
                    onChange={handleChange}
                  />
                ) : (
                  <p>{formData.birthdate || "No especificada"}</p>
                )}
              </div>

              {/* Dirección */}
              <div className="profile-form-group">
                <label>
                  Dirección
                </label>
                {isEditing ? (
                  <input
                    type="text"
                    name="address"
                    value={formData.address}
                    onChange={handleChange}
                  />
                ) : (
                  <p>{formData.address || "No especificada"}</p>
                )}
              </div>
            </div>
            <div className="profile-form-actions">
            {isEditing && (
              <>
                <button
                  type="button"
                  className="profile-secondary-button"
                  onClick={() => setIsEditing(false)}
                >
                  Cancelar
                </button>
                <button type="submit" className="profile-primary-button">
                  <FiSave /> Guardar Cambios
                </button>
              </>
            )}
          </div>
          </div>

          
        </form>
      </div>
    </div>
  );
};

export default Profile;