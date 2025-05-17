import { useAuth } from "../../../context/AuthContext";
import { Link, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import logo from "../../../assets/logo.png";
import "./login.css";
import imagen1 from "../../../assets/lagos4.png"
import imagen2 from "../../../assets/lagos1.png"
import imagen3 from "../../../assets/lagos2.png"
import imagen4 from "../../../assets/lagos3.png"
import { IoEye, IoEyeOff } from "react-icons/io5";


export default function LoginForm() {
  const { signin, errors, loading } = useAuth();
  
  const navigate = useNavigate();
  const [focused, setFocused] = useState({
    email: false,
    password: false,
  });
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  const carouselImages = [
    { src:imagen1, alt: "Imagen de lagos 1" },
    { src: imagen2, alt: "Imagen de lagos 2" },
    { src: imagen3, alt: "Imagen de lagos 3" },
    { src: imagen4, alt: "Imagen de lagos 4" },
  ];


useEffect(() => {
  const interval = setInterval(() => {
    setCurrentImageIndex((prev) => (prev === carouselImages.length - 1 ? 0 : prev + 1));
  }, 3000);
  return () => clearInterval(interval);
}, [carouselImages.length]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    const email = e.target.email.value;
    const password = e.target.password.value;

    await signin({ email, password });
  };

  const handleFocus = (field) => {
    setFocused((prev) => ({ ...prev, [field]: true }));
  };

  const handleBlur = (e) => {
    if (e.target.value === "") {
      setFocused((prev) => ({ ...prev, [e.target.name]: false }));
    }
  };

  return (
    <div className="login-page">
      <div className="simple-navbar">
        <div className="navbar-content">
          <div className="brand" onClick={() => navigate("/")}>
            <img src={logo} alt="Logo" className="navbar-logo" />
            <h1 className="navbar-title">Los Lagos</h1>
          </div>
        </div>
      </div>

      <div className="login-container">
        <div className="login-card">
          <div className="form-side">
            <form className="login-form" onSubmit={handleSubmit}>
              <h2 className="form-title">Bienvenido</h2>
              <p className="form-subtitle">
                Ingresa tus credenciales para continuar
              </p>

              {errors.length > 0 && (
                <div className="error-container">
                  {errors.map((error, index) => (
                    <p key={index} className="error-text-ss">
                      {error}
                    </p>
                  ))}
                </div>
              )}

              <div className="input-group">
                <div className={`form-input ${focused.email ? "focused" : ""}`}>
                  <label
                    htmlFor="email"
                    className={focused.email ? "label-active" : ""}
                  >
                    Correo Electrónico
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    required
                    disabled={loading}
                    onFocus={() => handleFocus("email")}
                    onBlur={handleBlur}
                  />
                </div>

                <div
                  className={`form-input ${focused.password ? "focused" : ""}`}
                >
                  <label
                    htmlFor="password"
                    className={focused.password ? "label-active" : ""}
                  >
                    Contraseña
                  </label>
                  <input
                    type="password"
                    id="password"
                    name="password"
                    required
                    disabled={loading}
                    onFocus={() => handleFocus("password")}
                    onBlur={handleBlur}
                  />
                </div>

                <div className="forgot-password">
                  <Link to="/recoveryPassword">¿Olvidaste tu contraseña?</Link>
                </div>
              </div>

              <button type="submit" className="login-button" disabled={loading}>
                {loading ? (
                  <div className="loading-spinner">
                    <div className="spinner"></div>
                    <span>Iniciando sesión...</span>
                  </div>
                ) : (
                  "Iniciar Sesión"
                )}
              </button>
            </form>

            <div className="signup-section">
              <p>¿No tienes una cuenta?</p>
              <Link to="/register" className="signup-button">
                Crear cuenta
              </Link>
            </div>

            <div className="terms-section">
              <p>
                Al continuar, aceptas los
                <Link to="/terms"> Términos y Condiciones </Link>y la
                <Link to="/privacy"> Política de Privacidad</Link>
              </p>
            </div>
          </div>

          <div className="brand-side">
        
            <div className="image-carousel">
              {carouselImages.map((image, index) => (
                <img
                  key={index}
                  src={image.src}
                  alt={image.alt}
                  className={`carousel-image ${index === currentImageIndex ? "active" : ""}`}
                />
              ))}
            </div>
            
            <div className="brand-overlay"></div>
            
         
          </div>
        </div>
      </div>
    </div>
  );
}