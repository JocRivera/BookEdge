

import { useNavigate, useLocation } from "react-router-dom";
import { useState, useEffect } from "react"; 
import { resetPassword } from "../../../services/authService";
import logo from "../../../assets/logo.png";
import { IoEye, IoEyeOff } from "react-icons/io5";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "./resetPassword.css"; 

export default function ResetPassword() {
  const navigate = useNavigate();
  const location = useLocation();

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [newPasswordError, setNewPasswordError] = useState("");
  const [confirmPasswordError, setConfirmPasswordError] = useState("");
  const [generalError, setGeneralError] = useState("");
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const [token, setToken] = useState(null);

 useEffect(() => {
  const queryParams = new URLSearchParams(location.search);
  const extractedToken = queryParams.get("token");
  if (!extractedToken) {
    toast.error("Token inválido o no proporcionado. Serás redirigido.", { autoClose: 3000 });
    setTimeout(() => navigate("/login"), 3500);
  } else {
    setToken(extractedToken);
  }
}, [location.search, navigate]);

  const validatePassword = (password) => {
    if (!password.trim()) return "La nueva contraseña es obligatoria.";
    if (password.length < 8) return "La contraseña debe tener al menos 8 caracteres.";
    if (!/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_])[A-Za-z\d\W_]{8,}$/.test(password)) {
      return "Debe contener mayúscula, minúscula, número y carácter especial.";
    }
    return "";
  };

  const handleNewPasswordChange = (e) => {
    const value = e.target.value;
    setNewPassword(value);
    setNewPasswordError(validatePassword(value));
    if (confirmPasswordError === "Las contraseñas no coinciden." && value === confirmPassword) {
        setConfirmPasswordError("");
    } else if (confirmPassword.trim() !== "" && value !== confirmPassword && value.trim() !== "") { // Validar solo si confirmPassword no está vacía
        setConfirmPasswordError("Las contraseñas no coinciden.");
    }
  };

  const handleConfirmPasswordChange = (e) => {
    const value = e.target.value;
    setConfirmPassword(value);
    if (value !== newPassword && value.trim() !== "") {
      setConfirmPasswordError("Las contraseñas no coinciden.");
    } else {
      setConfirmPasswordError("");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!token) {
      setGeneralError("Token no disponible para restablecer la contraseña.");
      toast.error("Token no disponible.");
      return;
    }

    setNewPasswordError("");
    setConfirmPasswordError("");
    setGeneralError("");

    const valNewPasswordError = validatePassword(newPassword);
    let valConfirmPasswordError = "";

    if (newPassword !== confirmPassword) {
      valConfirmPasswordError = "Las contraseñas no coinciden.";
    } else if (!confirmPassword.trim() && newPassword.trim()) { // Si newPassword tiene algo y confirm no.
        valConfirmPasswordError = "Por favor, confirma tu nueva contraseña.";
    }
    
    setNewPasswordError(valNewPasswordError);
    setConfirmPasswordError(valConfirmPasswordError);

    if (valNewPasswordError || valConfirmPasswordError) return;

    setIsLoading(true);
    try {
      await resetPassword(token, newPassword);
      toast.success("¡Contraseña restablecida con éxito! Serás redirigido al inicio de sesión.", { autoClose: 3000 });
      setTimeout(() => navigate("/login"), 3500);
    } catch (error) {
      const errorMessage = error.response?.data?.message || "Error al restablecer la contraseña. Intenta de nuevo o solicita un nuevo enlace.";
      setGeneralError(errorMessage);
      toast.error(errorMessage, { autoClose: 4000 });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => navigate("/login");

  const togglePasswordVisibility = (field) => {
    if (field === "newPassword") setShowNewPassword(!showNewPassword);
    else if (field === "confirmPassword") setShowConfirmPassword(!showConfirmPassword);
  };

  return (
    <div className="reset-page-container"> {/* RENOMBRADO */}
      {/* Navbar (clases de login-navbar se mantienen intactas) */}
      <div className="login-navbar">
        <div className="login-navbar__content">
          <div className="login-navbar__brand" onClick={() => navigate("/")}>
            <img src={logo} alt="Logo" className="login-navbar__logo" />
            <h1 className="login-navbar__title">Los Lagos</h1>
          </div>
        </div>
      </div>

      <div className="reset-main-container"> {/* RENOMBRADO */}
        <div className="reset-card-content"> {/* RENOMBRADO */}
          <div className="reset-card__header"> {/* RENOMBRADO */}
            <h1 className="reset-card__title">Restablece tu contraseña</h1> {/* RENOMBRADO */}
            <p className="reset-card__subtitle">
              Ingresa y confirma tu nueva contraseña.
            </p> {/* RENOMBRADO */}
          </div>

          <form onSubmit={handleSubmit} className="reset-form-main"> {/* RENOMBRADO */}
            {/* Nueva Contraseña */}
            <div className="reset-form__field"> {/* RENOMBRADO */}
              <label htmlFor="newPassword" className="reset-form__label">Nueva Contraseña</label> {/* RENOMBRADO */}
              <div className="reset-form__password-input-wrapper"> {/* RENOMBRADO */}
                <input
                  type={showNewPassword ? "text" : "password"}
                  id="newPassword"
                  placeholder="Nueva contraseña"
                  className={`reset-form__input ${newPasswordError ? "reset-form__input--error" : ""}`} /* RENOMBRADO */
                  value={newPassword}
                  onChange={handleNewPasswordChange}
                  required
                  disabled={isLoading}
                />
                <button
                  type="button"
                  className="reset-form__toggle-password-button" /* RENOMBRADO */
                  onClick={() => togglePasswordVisibility("newPassword")}
                  disabled={isLoading}
                  aria-label={showNewPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
                >
                  {showNewPassword ? <IoEye /> : <IoEyeOff />}
                </button>
              </div>
              {newPasswordError && <p className="reset-form__error-message">{newPasswordError}</p>} {/* RENOMBRADO */}
            </div>

            {/* Confirmar Contraseña */}
            <div className="reset-form__field"> {/* RENOMBRADO */}
              <label htmlFor="confirmPassword" className="reset-form__label">Confirmar Contraseña</label> {/* RENOMBRADO */}
              <div className="reset-form__password-input-wrapper"> {/* RENOMBRADO */}
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  id="confirmPassword"
                  placeholder="Confirmar nueva contraseña"
                  className={`reset-form__input ${confirmPasswordError ? "reset-form__input--error" : ""}`} /* RENOMBRADO */
                  value={confirmPassword}
                  onChange={handleConfirmPasswordChange}
                  required
                  disabled={isLoading}
                />
                <button
                  type="button"
                  className="reset-form__toggle-password-button" /* RENOMBRADO */
                  onClick={() => togglePasswordVisibility("confirmPassword")}
                  disabled={isLoading}
                  aria-label={showConfirmPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
                >
                  {showConfirmPassword ? <IoEye /> : <IoEyeOff />}
                </button>
              </div>
              {confirmPasswordError && <p className="reset-form__error-message">{confirmPasswordError}</p>} {/* RENOMBRADO */}
            </div>

            {generalError && <p className="reset-form__error-message reset-form__error-message--general">{generalError}</p>} {/* RENOMBRADO */}

            <div className="reset-form__actions"> {/* RENOMBRADO */}
              <button type="submit" className="reset-form__button reset-form__button--submit" disabled={isLoading}> {/* RENOMBRADO */}
                {isLoading ? "Restableciendo..." : "Restablecer Contraseña"}
              </button>
              <button
                type="button"
                onClick={handleCancel}
                className="reset-form__button reset-form__button--cancel" /* RENOMBRADO */
                disabled={isLoading}
              >
                Cancelar
              </button>
            </div>
          </form>
        </div>
      </div>
      <ToastContainer position="top-right" />
    </div>
  );
}
