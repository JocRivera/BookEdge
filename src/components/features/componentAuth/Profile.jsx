import { useState, useEffect } from "react";
import { useAuth } from "../../../context/authContext";
// Importaciones CORRECTAS de react-icons/fi
import {
  FiEye,
  FiEyeOff,
  FiEdit,
  FiSave,
  FiLock,
  FiMail,
  FiUser,
  FiPhone,
  FiCalendar,
  FiMapPin,
  FiCreditCard, // Para identificación (reemplaza FiId)
  FiShield,
  FiHome, // Para dirección (opcional)
} from "react-icons/fi";
import "./Profile.css";

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

  // Cargar datos del perfil al montar el componente
  useEffect(() => {
    if (user) {
      setFormData({
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
      // Aquí llamarías a tu servicio de actualización:
      // await updateProfileService(formData);
      console.log("Datos a actualizar:", formData);
      setIsEditing(false);
      // Opcional: Mostrar notificación de éxito
    } catch (error) {
      console.error("Error al actualizar:", error);
    }
  };

  return (
    <div className="profile-container">
      <div className="profile-card">
        <div className="profile-header">
          <div>
            <h2>Mi Perfil</h2>
            <h2>{user?.name }</h2>
            <span className="user-role">
              <FiShield /> {user?.role?.name || "Rol no definido"}
            </span>
          </div>
          {!isEditing && (
            <button onClick={() => setIsEditing(true)} className="edit-button">
              <FiEdit /> Editar
            </button>
          )}
        </div>

        <form onSubmit={handleSubmit} className="profile-form">
          <div className="form-section">
            <h3 className="section-title">
              <FiUser className="section-icon" />
              Información Personal
            </h3>

            <div className="form-grid">
              <div className="form-group">
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

              <div className="form-group">
                <label>
                  <FiMail /> Email
                </label>
                {isEditing ? (
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    disabled 
                  />
                ) : (
                  <p>{formData.email}</p>
                )}
              </div>

              <div className="form-group">
                <label>
                  <FiCreditCard /> Tipo de ID
                </label>
                {isEditing ? (
                  <select
                    name="identificationType"
                    value={formData.identificationType}
                    onChange={handleChange}
                  >
                    <option value="CC">Cédula</option>
                    <option value="TI">Tarjeta de Identidad</option>
                    <option value="CE">Cédula Extranjería</option>
                  </select>
                ) : (
                  <p>
                    {formData.identificationType === "CC" && "Cédula"}
                    {formData.identificationType === "TI" &&
                      "Tarjeta de Identidad"}
                    {formData.identificationType === "CE" &&
                      "Cédula Extranjería"}
                  </p>
                )}
              </div>

              <div className="form-group">
                <label>
                  <FiCreditCard /> Número de ID
                </label>
                {isEditing ? (
                  <input
                    type="text"
                    name="identification"
                    value={formData.identification}
                    onChange={handleChange}
                    required
                    disabled
                  />
                ) : (
                  <p>{formData.identification || "No especificado"}</p>
                )}
              </div>
            </div>
          </div>

          {/* Sección 2: Datos Médicos y Contacto */}
          <div className="form-section">
            <h3 className="section-title">
              <FiMapPin className="section-icon" />
              Datos Adicionales
            </h3>
            <div className="form-grid">
              {/* EPS */}
              <div className="form-group">
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
              <div className="form-group">
                <label>
                  <FiPhone /> Teléfono/Celular
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
              <div className="form-group">
                <label>
                  <FiCalendar /> Fecha de Nacimiento
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
              <div className="form-group">
                <label>
                  <FiMapPin /> Dirección
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
          </div>

          {/* Botones */}
          <div className="form-actions">
            {isEditing ? (
              <>
                <button
                  type="button"
                  className="secondary-button"
                  onClick={() => setIsEditing(false)}
                >
                  Cancelar
                </button>
                <button type="submit" className="primary-button">
                  <FiSave /> Guardar Cambios
                </button>
              </>
            ) : (
              <button
                type="button"
                className="primary-button"
                onClick={() => setIsEditing(true)}
              >
                <FiEdit /> Editar Perfil
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
};

export default Profile;
