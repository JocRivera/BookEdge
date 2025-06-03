// --- START OF FILE Loginform.jsx ---

import { useAuth } from "../../../context/AuthContext";
import { Link, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import logo from "../../../assets/logo.png";
import "./login.css"; // Asegúrate que este archivo también se actualice
import imagen1 from "../../../assets/lagos4.png";
import imagen2 from "../../../assets/lagos1.png";
import imagen3 from "../../../assets/lagos2.png";
import imagen4 from "../../../assets/lagos3.png";

export default function LoginForm() {
  const { signin, errors: authErrors, loading } = useAuth();
  const navigate = useNavigate();

  const [credentials, setCredentials] = useState({
    email: "",
    password: "",
  });
  const [formErrors, setFormErrors] = useState({});

  const [focused, setFocused] = useState({
    email: false,
    password: false,
  });
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  const carouselImages = [
    { src: imagen1, alt: "Imagen de lagos 1" },
    { src: imagen2, alt: "Imagen de lagos 2" },
    { src: imagen3, alt: "Imagen de lagos 3" },
    { src: imagen4, alt: "Imagen de lagos 4" },
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImageIndex((prev) =>
        prev === carouselImages.length - 1 ? 0 : prev + 1
      );
    }, 3000);
    return () => clearInterval(interval);
  }, [carouselImages.length]);

  const validateField = (name, value) => {
    let error = "";
    switch (name) {
      case "email":
        if (!value.trim()) {
          error = "El correo electrónico es obligatorio";
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
          error = "El formato del correo electrónico no es válido";
        }
        break;
      case "password":
        if (!value.trim()) {
          error = "La contraseña es obligatoria";
        }
        break;
      default:
        break;
    }
    return error;
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setCredentials((prev) => ({ ...prev, [name]: value }));
    const error = validateField(name, value);
    setFormErrors((prevErrors) => ({ ...prevErrors, [name]: error }));
  };

  const validateForm = () => {
    const newErrors = {};
    const emailError = validateField("email", credentials.email);
    if (emailError) newErrors.email = emailError;
    const passwordError = validateField("password", credentials.password);
    if (passwordError) newErrors.password = passwordError;
    return newErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormErrors({});
    const currentFormErrors = validateForm();
    if (Object.keys(currentFormErrors).length > 0) {
      setFormErrors(currentFormErrors);
      return;
    }
    await signin(credentials);
  };

  const handleFocus = (field) => {
    setFocused((prev) => ({ ...prev, [field]: true }));
  };

  const handleBlur = (e) => {
    const { name, value } = e.target;
    if (value.trim() === "") {
      setFocused((prev) => ({ ...prev, [name]: false }));
    }
    const error = validateField(name, value);
    setFormErrors((prevErrors) => ({ ...prevErrors, [name]: error }));
  };

  return (
    <div className="login-page-wrapper"> {/* Renombrado */}
      <div className="login-navbar"> {/* Renombrado */}
        <div className="login-navbar__content"> {/* Renombrado */}
          <div className="login-navbar__brand" onClick={() => navigate("/")}> {/* Renombrado */}
            <img src={logo} alt="Logo" className="login-navbar__logo" /> {/* Renombrado */}
            <h1 className="login-navbar__title">Los Lagos</h1> {/* Renombrado */}
          </div>
        </div>
      </div>

      <div className="login-main-container"> {/* Renombrado */}
        <div className="login-card-container"> {/* Renombrado */}
          <div className="login-card__form-section"> {/* Renombrado */}
            <form className="login-form-main" onSubmit={handleSubmit} noValidate> {/* Renombrado */}
              <h2 className="login-form__title">Bienvenido</h2> {/* Renombrado */}
              <p className="login-form__subtitle">
                Ingresa tus credenciales para continuar
              </p>

              {authErrors && authErrors.length > 0 && (
                <div className="login-form__backend-error-container"> {/* Renombrado */}
                  {authErrors.map((error, index) => (
                    <p key={index} className="login-form__backend-error-text"> {/* Renombrado */}
                      {error}
                    </p>
                  ))}
                </div>
              )}

              <div className="login-form__input-group"> {/* Renombrado */}
                {/* CAMPO EMAIL */}
             <div
                  className={`login-form__field ${
                    focused.email || credentials.email ? "login-form__field--focused" : ""
                  }`}
                >
                  <label
                    htmlFor="email"
                    className={
                      focused.email || credentials.email
                        ? "login-form__label login-form__label--active"
                        : "login-form__label"
                    }
                  >
                    Correo Electrónico
                  </label>
                  {/* El wrapper puede quedarse, pero su CSS cambiará */}
                  <div className="login-form__input-error-wrapper">
                    <input
                      type="email"
                      id="email"
                      name="email"
                      className="login-form__input"
                      value={credentials.email}
                      onChange={handleInputChange}
                      // ... (otros props)
                    />
                    {/* El error ahora irá debajo del input, estilizado por CSS */}
                    {formErrors.email && (
                      <p className="login-form__error-message"> {/* Eliminamos --beside o lo ignoramos en CSS */}
                        {formErrors.email}
                      </p>
                    )}
                  </div>
                </div>

                {/* CAMPO CONTRASEÑA */}
                <div
                  className={`login-form__field ${
                    focused.password || credentials.password ? "login-form__field--focused" : ""
                  }`}
                >
                  <label
                    htmlFor="password"
                    className={
                      focused.password || credentials.password
                        ? "login-form__label login-form__label--active"
                        : "login-form__label"
                    }
                  >
                    Contraseña
                  </label>
                  <div className="login-form__input-error-wrapper">
                    <input
                      type="password"
                      id="password"
                      name="password"
                      className="login-form__input"
                      value={credentials.password}
                      onChange={handleInputChange}
                      // ... (otros props)
                    />
                    {formErrors.password && (
                      <p className="login-form__error-message"> {/* Eliminamos --beside o lo ignoramos en CSS */}
                        {formErrors.password}
                      </p>
                    )}
                  </div>
                </div>

                <div className="login-form__forgot-password"> {/* Renombrado */}
                  <Link to="/recoveryPassword">¿Olvidaste tu contraseña?</Link>
                </div>
              </div>

              <button
                type="submit"
                className="login-form__submit-button" /* Renombrado */
                disabled={loading}
              >
                {loading ? (
                  <div className="login-form__submit-button-loading"> {/* Renombrado */}
                    <div className="login-form__submit-button-spinner"></div> {/* Renombrado */}
                    <span>Iniciando sesión...</span>
                  </div>
                ) : (
                  "Iniciar Sesión"
                )}
              </button>
            </form>

            <div className="login-card__signup-section"> {/* Renombrado */}
              <p>¿No tienes una cuenta?</p>
              <Link to="/register" className="login-card__signup-link"> {/* Renombrado */}
                Crear cuenta
              </Link>
            </div>

            <div className="login-card__terms-section"> {/* Renombrado */}
              <p>
                Al continuar, aceptas los
                <Link to="/terms"> Términos y Condiciones </Link>y la
                <Link to="/privacy"> Política de Privacidad</Link>
              </p>
            </div>
          </div>

          <div className="login-card__brand-section"> {/* Renombrado */}
            <div className="login-card__image-carousel"> {/* Renombrado */}
              {carouselImages.map((image, index) => (
                <img
                  key={index}
                  src={image.src}
                  alt={image.alt}
                  className={`login-card__carousel-image ${
                    index === currentImageIndex ? "login-card__carousel-image--active" : ""
                  }`} /* Renombrado y clase de estado */
                />
              ))}
            </div>
            <div className="login-card__brand-overlay"></div> {/* Renombrado */}
          </div>
        </div>
      </div>
    </div>
  );
}
