// --- START OF FILE recoveryPassword.jsx ---

import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { recoverPassword } from "../../../services/AuthService";
import { useAuth } from "../../../context/AuthContext";
import "./recoveryPassword.css"; // CSS original
import logo from "../../../assets/logo.png";

const RecoveryPassword = () => {
  const { loading, setLoading } = useAuth();
  const [email, setEmail] = useState(""); // Cambiado de 'formulario.email' a solo 'email'
  const [emailError, setEmailError] = useState(""); // Estado para el mensaje de error del email

  const navigate = useNavigate();

  const validarEmail = (valorEmail) => { // Renombrado para claridad
    if (!valorEmail.trim()) { // Validar que no esté vacío primero
        return "El correo electrónico es obligatorio.";
    }
    const expresion = /^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+$/;
    if (!expresion.test(valorEmail)) {
      return "El formato del correo electrónico no es válido.";
    }
    return ""; // No hay error
  };

  const handleChange = (e) => {
    const { value } = e.target; // Solo necesitamos el valor del input de email
    setEmail(value);

    // Validar al escribir para dar feedback inmediato (opcional, pero buena UX)
    const error = validarEmail(value);
    setEmailError(error);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setEmailError(""); // Limpiar errores previos

    const currentEmailError = validarEmail(email);
    if (currentEmailError) {
      setEmailError(currentEmailError);
      return; // Detener si hay error de validación
    }

    // Si no hay error, proceder
    try {
      setLoading(true);
      await recoverPassword(email); // Enviar solo el string del email
      toast.success(
        `Se ha enviado un correo electrónico a ${email} con las instrucciones. 📧`,
        { autoClose: 4000 }
      );
      setTimeout(() => {
        navigate("/login"); // Asegúrate que la ruta sea correcta
      }, 5000);
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Error al enviar el correo. Inténtalo de nuevo.",
        { autoClose: 3000 }
      );
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    navigate("/login"); // Asegúrate que la ruta sea correcta
  };

  return (
    <div className="page-container"> {/* CLASE ORIGINAL */}
      {/* Navbar (manteniendo tus clases originales de login si son las mismas) */}
      <div className="login-navbar">
        <div className="login-navbar__content">
          <div className="login-navbar__brand" onClick={() => navigate("/")}>
            <img src={logo} alt="Logo" className="login-navbar__logo" />
            <h1 className="login-navbar__title">Los Lagos</h1>
          </div>
        </div>
      </div>
      <div className="recovery-container"> {/* CLASE ORIGINAL */}
        <div className="recovery-card"> {/* CLASE ORIGINAL */}
          <div className="recovery-header"> {/* CLASE ORIGINAL */}
            <h1 className="recovery-title">Recuperar contraseña</h1> {/* CLASE ORIGINAL */}
            <p className="recovery-subtitle"> {/* CLASE ORIGINAL */}
              Para recuperar tu contraseña, ingresa tu correo electrónico.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="recovery-form"> {/* CLASE ORIGINAL */}
            <div className="form-group"> {/* CLASE ORIGINAL */}
              <label htmlFor="email" className="form-label"> {/* CLASE ORIGINAL */}
                Correo electrónico
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={email} // Usar el estado 'email'
                onChange={handleChange}
                className={`form-input ${emailError ? "form-input--error" : ""}`} /* CLASE ORIGINAL + modificador para error */
                placeholder="ejemplo@correo.com"
                required
                disabled={loading}
              />
              {/* Mensaje de error con clase renombrada y condicional */}
              {emailError && (
                <p className="login-form__error-message">{emailError}</p> 
                /* ^^^ USAREMOS ESTA CLASE (o la que uses en login para el error DEBAJO del input) */
              )}
            </div>

            <div className="buttons-recovery-password"> {/* CLASE ORIGINAL */}
              <button
                type="submit"
                className="recovery-button" /* CLASE ORIGINAL */
                disabled={loading}
              >
                {loading ? "Enviando..." : "Enviar"}
              </button>
              <button
                type="button"
                onClick={handleCancel}
                className="cancel-button" /* CLASE ORIGINAL */
                disabled={loading} // También deshabilitar cancelar si está cargando
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
};

export default RecoveryPassword;
// --- END OF FILE recoveryPassword.jsx ---