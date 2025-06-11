import { Link, useNavigate } from "react-router-dom";
import "./register.css"; // Tu CSS existente
import { useState } from "react";
import { toast } from "react-toastify";
import { register,getUserData } from "../../../services/AuthService";
import logo from "../../../assets/logo.png";
import { IoEye, IoEyeOff } from "react-icons/io5";
import { useAuth } from "../../../context/authContext";

export default function RegisterForm() {
  const navigate = useNavigate();
  const { setUser, setIsAuthenticated,isLoadingAuth} = useAuth();

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

    // Validar al escribir y limpiar error si es válido
    const error = validateField(name, value); // Asumo que validateField existe y funciona
    setErrors((prev) => ({ ...prev, [name]: error }));
  };

  const togglePasswordVisibility = (field) => {
    if (field === "password") {
      setShowPassword(!showPassword);
    } else {
      // asume "confirm"
      setShowConfirmPassword(!showConfirmPassword);
    }
  };

  // ... (getMaxBirthdate, validateForm, validateField, handleSubmit se mantienen igual) ...
  // Solo asegúrate que validateField para password y confirmPassword estén bien.
  const getMaxBirthdate = () => {
    const today = new Date();
    const minAgeDate = new Date();
    minAgeDate.setFullYear(today.getFullYear() - 18); // Resta 18 años
    return minAgeDate.toISOString().split("T")[0]; // Formato YYYY-MM-DD
  };

  const maxBirthdate = getMaxBirthdate();
  const validateForm = () => {
    // Esta se usa en handleSubmit
    const newErrors = {};

    // Validar todos los campos antes de enviar
    for (const key in formData) {
      const error = validateField(key, formData[key]);
      if (error) {
        newErrors[key] = error;
      }
    }
    // Validación específica para confirmPassword
    if (
      formData.password !== formData.confirmPassword &&
      formData.confirmPassword.trim() !== ""
    ) {
      newErrors.confirmPassword =
        newErrors.confirmPassword || "Las contraseñas no coinciden";
    } else if (
      !formData.confirmPassword.trim() &&
      formData.password.trim() !== ""
    ) {
      newErrors.confirmPassword = "Por favor, confirma tu contraseña.";
    }

    return newErrors;
  };

  const validateField = (name, value) => {
    let error = "";
    const { password } = formData; // Necesitamos la contraseña actual para comparar con confirmPassword

    switch (name) {
      case "name":
        if (!value.trim()) error = "El nombre es obligatorio";
        else if (value.trim().length < 3)
          error = "El nombre debe ser mayor a 3 caracteres";
        break;
      case "email":
        if (!value.trim()) error = "El email es obligatorio";
        else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value))
          error = "El email no es válido";
        break;
      case "password":
        if (!value.trim()) error = "La contraseña no puede estar vacía";
        else if (value.length < 8)
          error = "La contraseña debe tener al menos 8 caracteres";
        else if (
          !/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_])[A-Za-z\d\W_]{8,}$/.test(
            value
          )
        ) {
          error =
            "Debe contener mayúscula, minúscula, número y carácter especial";
        }
        break;
      case "confirmPassword":
        if (!value.trim() && password.trim() !== "")
          error =
            "Por favor, confirma tu contraseña."; // Solo si password tiene algo
        else if (password && value.trim() !== "" && value !== password)
          error = "Las contraseñas no coinciden.";
        break;
      case "cellphone":
        if (!value.trim()) error = "El Número es obligatorio";
        else if (!/^\d{10}$/.test(value.trim()))
          error = "El número debe tener 10 dígitos."; // Ejemplo de validación más estricta
        break;
      case "identificationType":
        if (!value.trim()) error = "Debes seleccionar un tipo de documento.";
        break;
      case "identification":
        if (!value.trim()) error = "La identificación no puede estar vacía";
        else if (value.trim().length < 5)
          error = "La identificación debe tener mínimo 5 caracteres";
        break;
      case "birthdate":
        if (!value.trim()) {
          error = "La fecha de nacimiento es obligatoria.";
        } else {
          const birthDate = new Date(value);
          const eighteenYearsAgo = new Date();
          eighteenYearsAgo.setFullYear(eighteenYearsAgo.getFullYear() - 18);

          if (birthDate > eighteenYearsAgo) {
            error = "Debes ser mayor de 18 años para registrarte.";
          }
        }
        break;
      default:
        break;
    }
    return error;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const formValidationErrors = validateForm();
    if (Object.keys(formValidationErrors).length > 0) {
      setErrors(formValidationErrors);
      return;
    }

    setIsSubmitting(true);
    const { confirmPassword, ...dataToSend } = formData;

    try {
      await register(dataToSend);
      window.location.href = "/";
    } catch (error) {
      if (
        error.response &&
        error.response.data &&
        Array.isArray(error.response.data.errors)
      ) {
        const backendErrors = {};
        error.response.data.errors.forEach((err) => {
          backendErrors[err.path] = err.msg;
        });
        setErrors((prev) => ({ ...prev, ...backendErrors }));
        // Mostrar un toast general si hay errores del backend
        const firstBackendError =
          error.response.data.errors[0]?.msg || "Error en el registro.";
        toast.error(firstBackendError, { autoClose: 3000 });
      } else if (
        error.response &&
        error.response.data &&
        error.response.data.message
      ) {
        // Caso para error de backend con un solo mensaje (ej: email ya existe)
        setErrors((prev) => ({ ...prev, email: error.response.data.message })); // Asumiendo que es un error de email
        toast.error(error.response.data.message, { autoClose: 3000 });
      } else {
        toast.error("Ocurrió un error desconocido al registrarse.", {
          autoClose: 3000,
        });
      }
    } finally {
      setIsSubmitting(false);
    }
  };

    if (isLoadingAuth) {
    return (
      <div className="loading-screen">
        <h2>Cargando...</h2>
      </div>
    );
  }

  return (
    <>
      <div className="login-navbar">
        <div className="login-navbar__content">
          <div className="login-navbar__brand" onClick={() => navigate("/")}>
            <img src={logo} alt="Logo" className="login-navbar__logo" />
            <h1 className="login-navbar__title">Los Lagos</h1>
          </div>
        </div>
      </div>

      <main className="register-container">
        <form className="register-form" onSubmit={handleSubmit} noValidate>
          {" "}
          {/* Añadido noValidate */}
          <h2 className="title-register">
            ¡Bienvenido Al Formulario de Registro!
          </h2>
          <div className="form-grid-register">
            <div className="form-column-register">
              {/* Nombre */}
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
                  className={
                    errors.name ? "form-input--error" : ""
                  } /* Clase para error */
                />
                {errors.name && (
                  <span className="error-text">{errors.name}</span>
                )}
              </div>

              {/* Tipo de Documento */}
              <div className="form-group-register">
                <label htmlFor="identificationType">Tipo de documento</label>
                <select
                  id="identificationType"
                  name="identificationType"
                  required
                  value={formData.identificationType}
                  onChange={handleChange}
                  className={
                    errors.identificationType ? "form-input--error" : ""
                  } /* Clase para error */
                >
                  <option value="">Selecciona un tipo</option>
                  <option value="CC">Cédula de Ciudadanía</option>
                  <option value="CE">Cédula de Extranjería</option>
                  {/* <option value="PAS">Pasaporte</option> */}
                </select>
                {errors.identificationType && (
                  <span className="error-text">
                    {errors.identificationType}
                  </span>
                )}
              </div>

              {/* Número de Documento */}
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
                  className={
                    errors.identification ? "form-input--error" : ""
                  } /* Clase para error */
                />
                {errors.identification && (
                  <span className="error-text">{errors.identification}</span>
                )}
              </div>

              {/* Número de Contacto */}
              <div className="form-group-register">
                <label htmlFor="cellphone">Número de contacto</label>
                <input
                  type="tel"
                  id="cellphone"
                  name="cellphone"
                  required
                  placeholder="Ej: 3001234567"
                  value={formData.cellphone}
                  onChange={handleChange}
                  className={
                    errors.cellphone ? "form-input--error" : ""
                  } /* Clase para error */
                />
                {errors.cellphone && (
                  <span className="error-text">{errors.cellphone}</span>
                )}
              </div>
            </div>

            <div className="form-column-register">
              {/* Fecha de Nacimiento */}
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
                  className={
                    errors.birthdate ? "form-input--error" : ""
                  } /* Clase para error */
                />
                {errors.birthdate && (
                  <span className="error-text">{errors.birthdate}</span>
                )}
              </div>

              {/* Correo Electrónico */}
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
                  className={
                    errors.email ? "form-input--error" : ""
                  } /* Clase para error */
                />
                {errors.email && (
                  <span className="error-text">{errors.email}</span>
                )}
              </div>

              {/* Contraseña */}
              <div className="form-group-register">
                <label htmlFor="password">Contraseña</label>
                <div className="password-input-container">
                  {" "}
                  {/* Contenedor para input y ojo */}
                  <input
                    type={showPassword ? "text" : "password"}
                    id="password"
                    name="password"
                    required
                    placeholder="Al menos 8 caracteres"
                    value={formData.password}
                    onChange={handleChange}
                    className={
                      errors.password ? "form-input--error" : ""
                    } /* Clase para error */
                  />
                  <button
                    type="button"
                    className="toggle-password" /* Tu clase existente */
                    onClick={() => togglePasswordVisibility("password")}
                    aria-label={
                      showPassword ? "Ocultar contraseña" : "Mostrar contraseña"
                    }
                  >
                    {showPassword ? <IoEye /> : <IoEyeOff />}
                  </button>
                </div>
                {errors.password && (
                  <span className="error-text">{errors.password}</span>
                )}
              </div>

              {/* Confirmar Contraseña */}
              <div className="form-group-register">
                <label htmlFor="confirmPassword">Confirmar contraseña</label>
                <div className="password-input-container">
                  {" "}
                  {/* Contenedor para input y ojo */}
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    id="confirmPassword"
                    name="confirmPassword"
                    required
                    placeholder="Repite tu contraseña"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    className={
                      errors.confirmPassword ? "form-input--error" : ""
                    } /* Clase para error */
                  />
                  <button
                    type="button"
                    className="toggle-password" /* Tu clase existente */
                    onClick={() => togglePasswordVisibility("confirm")}
                    aria-label={
                      showConfirmPassword
                        ? "Ocultar contraseña"
                        : "Mostrar contraseña"
                    }
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
            <input type="checkbox" id="terms" name="termsAccepted" required />{" "}
            {/* Es buena idea darle un name si lo vas a manejar en el estado */}
            <label htmlFor="terms">
              Acepto los{" "}
              <Link to="/terms" target="_blank">
                Términos y Condiciones
              </Link>{" "}
              y la{" "}
              <Link to="/privacy" target="_blank">
                Política de Privacidad
              </Link>
            </label>
          </div>
          {/* Error para el checkbox si es necesario */}
          {/* {errors.termsAccepted && <span className="error-text">{errors.termsAccepted}</span>} */}
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

// --- END OF FILE register.jsx ---
