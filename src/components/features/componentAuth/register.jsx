import { Link, useNavigate } from "react-router-dom";
import "./register.css";
import { useState } from "react";
import { toast } from "react-toastify";
import { register } from "../../../services/AuthService";
import logo from "../../../assets/logo.png";
import { IoEye, IoEyeOff } from "react-icons/io5";

export default function RegisterForm() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    cellphone: "",
    identificationType: "",
    identification: "",
    birthdate: "",
  });

  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));

    // Clear error when user starts typing
    if (errors[name]) {
      setErrors((prevErrors) => ({
        ...prevErrors,
        [name]: null,
      }));
    }
     const error = validateField(name, value);
    setErrors((prev) => ({ ...prev, [name]: error }));
  };

  const togglePasswordVisibility = (field) => {
    if (field === "password") {
      setShowPassword(!showPassword);
    } else {
      setShowConfirmPassword(!showConfirmPassword);
    }
  };

  const getMaxBirthdate = () => {
    const today = new Date();
    const minAgeDate = new Date();
    minAgeDate.setFullYear(today.getFullYear() - 18); // Resta 18 años
    return minAgeDate.toISOString().split("T")[0]; // Formato YYYY-MM-DD
  };

  const maxBirthdate = getMaxBirthdate(); 
  const validateForm = () => {
    const newErrors = {};

    // Basic validation
    if (!formData.name.trim()) newErrors.name = "Nombre es requerido";
    if (!formData.email.trim()) newErrors.email = "Email es requerido";
    else if (!/\S+@\S+\.\S+/.test(formData.email))
      newErrors.email = "Email inválido";

    if (!formData.password) newErrors.password = "Contraseña es requerida";
    else if (formData.password.length < 8)
      newErrors.password = "Mínimo 8 caracteres";

    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "Las contraseñas no coinciden";
    }

    return newErrors;
  };

   const validateField = (name, value) => {
    let error = "";

    switch (name) {
      case "name":
        if (!value.trim()) {
          error = "El nombre es obligatorio";
        } else if (value.trim().length < 3) {
          error = "El nombre debe ser mayor a 3 caracteres";
        }
        break;

      case "email":
        if (!value.trim()) {
          error = "El email es obligatorio";
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
          error = "El email no es válido";
        }
        break;

      case "password":
        if (!value.trim()) {
          error = "La contraseña no puede estar vacía";
        } else if (value.length < 8) {
          error = "La contraseña debe tener al menos 8 caracteres";
        } else if (
          !/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_])[A-Za-z\d\W_]{8,}$/.test(
            value
          )
        ) {
          error =
            "Debe contener al menos una mayúscula, una minúscula, un número y un carácter especial";
        }
        break;
      case "cellphone":
        if (!value.trim()) {
          error = "El Número es obligatorio";
        } else if (value.trim().length < 10) {
          error = "El número debe tener al menos 10 caracteres";
        }
        break;
      case "identification":
        if (!value.trim()) {
          error = "La identificación no puede estar vacía";
        } else if (value.trim().length < 5) {
          error = "La identificación debe tener mínimo 5 caracteres";
        }
        break;
    
      default:
        break;
    }

    return error;
  };
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Client-side validation
    const formErrors = validateForm();
    if (Object.keys(formErrors).length > 0) {
      setErrors(formErrors);
      return;
    }

    setIsSubmitting(true);

    const { confirmPassword, ...dataToSend } = formData;

    try {
      await register(dataToSend);

      toast.success("¡Usuario registrado exitosamente!", {
        position: "top-right",
        autoClose: 2000,
        onClose: () => navigate("/"),
      });
    } catch (error) {
      if (
        error.response &&
        error.response.data &&
        Array.isArray(error.response.data.errors)
      ) {
        // Process backend errors
        const backendErrors = {};
        error.response.data.errors.forEach((err) => {
          backendErrors[err.path] = err.msg;
        });
        setErrors(backendErrors);
      } else {
        toast.error("Ocurrió un error al registrarse");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <div className="simple-navbar">
        <div className="navbar-content">
          <div className="brand" onClick={() => navigate("/")}>
            <img src={logo} alt="Logo" className="navbar-logo" />
            <h1 className="navbar-title">Los Lagos</h1>
          </div>
        </div>
      </div>

      <main className="register-container">
        <form className="register-form" onSubmit={handleSubmit}>
          <h2 className="title-register">¡Bienvenido Al Formulario de Registro!</h2>
          {/* <p className="description-register">
            Completa tus datos para comenzar a disfrutar de nuestra hostería
          </p> */}

          <div className="form-grid-register">
            <div className="form-column-register">
              <div className="form-group-register">
                <label htmlFor="name">Nombre completo</label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  required
                  placeholder="Como aparece en tu identificación"
                  value={formData.name}
                  onChange={handleChange}
                />
                {errors.name && (
                  <span className="error-text">{errors.name}</span>
                )}
              </div>

              <div className="form-group-register">
                <label htmlFor="identificationType">Tipo de documento</label>
                <select
                  id="identificationType"
                  name="identificationType"
                  required
                  value={formData.identificationType}
                  onChange={handleChange}
                >
                  <option value="">Selecciona un tipo</option>
                  <option value="CC">Cédula</option>
                  <option value="CE">CE</option>
                </select>
                {errors.identificationType && (
                  <span className="error-text">
                    {errors.identificationType}
                  </span>
                )}
              </div>

              <div className="form-group-register">
                <label htmlFor="identification">Número de documento</label>
                <input
                  type="text"
                  id="identification"
                  name="identification"
                  required
                  placeholder="Ingresa tu número de documento"
                  value={formData.identification}
                  onChange={handleChange}
                />
                {errors.identification && (
                  <span className="error-text">{errors.identification}</span>
                )}
              </div>

              <div className="form-group-register">
                <label htmlFor="cellphone">Número de contacto</label>
                <input
                  type="tel"
                  id="cellphone"
                  name="cellphone"
                  required
                  placeholder="Ingresa un número válido"
                  value={formData.cellphone}
                  onChange={handleChange}
                />
                {errors.cellphone && (
                  <span className="error-text">{errors.cellphone}</span>
                )}
              </div>
            </div>

            <div className="form-column-register">
              <div className="form-group-register">
                <label htmlFor="birthdate">Fecha de nacimiento</label>
                <input
                  type="date"
                  id="birthdate"
                  name="birthdate"
                  required
                  max={maxBirthdate} 
                  value={formData.birthdate}
                  onChange={handleChange}
                />
                {errors.birthdate && (
                  <span className="error-text">{errors.birthdate}</span>
                )}
              </div>

              <div className="form-group-register">
                <label htmlFor="email">Correo electrónico</label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  required
                  placeholder="ejemplo@correo.com"
                  value={formData.email}
                  onChange={handleChange}
                />
                {errors.email && (
                  <span className="error-text">{errors.email}</span>
                )}
              </div>

              <div className="form-group-register">
                <label htmlFor="password">Contraseña</label>
                <div className="password-input-container">
                  <input
                    type={showPassword ? "text" : "password"}
                    id="password"
                    name="password"
                    required
                    placeholder="Al menos 8 caracteres"
                    value={formData.password}
                    onChange={handleChange}
                  />
                  <button
                    type="button"
                    className="toggle-password"
                    onClick={() => togglePasswordVisibility("password")}
                  >
                    {showPassword ? <IoEye /> : <IoEyeOff />}
                  </button>
                </div>
                {errors.password && (
                  <span className="error-text">{errors.password}</span>
                )}
              </div>

              <div className="form-group-register">
                <label htmlFor="confirmPassword">Confirmar contraseña</label>
                <div className="password-input-container">
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    id="confirmPassword"
                    name="confirmPassword"
                    required
                    placeholder="Repite tu contraseña"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                  />
                  <button
                    type="button"
                    className="toggle-password"
                    onClick={() => togglePasswordVisibility("confirm")}
                  >
                    {showConfirmPassword ? <IoEye /> : <IoEyeOff />}
                  </button>
                </div>
                {errors.confirmPassword && (
                  <span className="error-text">{errors.confirmPassword}</span>
                )}
              </div>
            </div>
          </div>

          <div className="terms-checkbox">
            <input type="checkbox" id="terms" required />
            <label htmlFor="terms">
              Acepto los <Link to="/terms">Términos y Condiciones</Link> y la{" "}
              <Link to="/privacy">Política de Privacidad</Link>
            </label>
          </div>

          <button
            type="submit"
            className="register-button"
            disabled={isSubmitting}
          >
            {isSubmitting ? "Procesando..." : "Crear cuenta"}
          </button>
        </form>

        <div className="login-prompt">
          <p>
            ¿Ya tienes una cuenta?{" "}
            <Link to="/login" className="login-link">
              Iniciar sesión
            </Link>
          </p>
        </div>
      </main>
    </>
  );
}
