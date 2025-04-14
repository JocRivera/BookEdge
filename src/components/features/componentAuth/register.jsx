import { Outlet, Link, useNavigate } from "react-router-dom";
import AuthNavbar from "../../layout/auth/AuthNavbar";
import "./register.css";
import { useState } from "react";
import { toast } from "react-toastify";
import { register } from "../../../services/AuthService";
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
  const [errors, setErrors] = useState({}); // Estado para almacenar errores
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const togglePasswordVisibility = (field) => {
    if (field === "password") {
      setShowPassword(!showPassword);
    } else {
      setShowConfirmPassword(!showConfirmPassword);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (formData.password !== formData.confirmPassword) {
      return toast.error("Las contraseñas no coinciden");
    }

    const { confirmPassword, ...dataToSend } = formData;

    try {
      await register(dataToSend);

      toast.success("¡Usuario registrado exitosamente!", {
        position: "top-right",
        autoClose: 2000,
        onClose: () => navigate("/login"),
      });
    } catch (error) {
      if (
        error.response &&
        error.response.data &&
        Array.isArray(error.response.data.errors)
      ) {
        // Procesar los errores del backend
        const backendErrors = error.response.data.errors;
        const formattedErrors = {};

        // Mapear los errores al formato { campo: mensaje }
        backendErrors.forEach((err) => {
          formattedErrors[err.path] = err.msg;
        });

        setErrors(formattedErrors); // Actualizar el estado con los errores del backend
      } else {
        toast.error("Ocurrió un error al registrarse");
      }
    }
  };

  return (
    <>
      <AuthNavbar />
      <Outlet />
      <main className="register-container">
        <form className="register-form" onSubmit={handleSubmit}>
          <h2 className="title-register">Crear cuenta en BookEdge</h2>
          <p className="description-register">
            Completa tus datos para comenzar nuestra hostería.
          </p>

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
                <label htmlFor="idNumber">Número de documento</label>
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
                  placeholder="Ingresa por favor un número válido"
                  value={formData.cellphone}
                  onChange={handleChange}
                />
                {errors.cellphone && (
                  <span className="error-text">{errors.cellphone}</span>
                )}
              </div>
            </div>

            <div className="form-column">
              <div className="form-group-register">
                <label htmlFor="birthdate">Fecha de nacimiento</label>
                <input
                  type="date"
                  id="birthdate"
                  name="birthdate"
                  required
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
                  {errors.password && (
                    <span className="error-text">{errors.password}</span>
                  )}

                  <button
                    type="button"
                    className="toggle-password"
                    onClick={() => togglePasswordVisibility("password")}
                  >
                    {showPassword ? <IoEye /> : <IoEyeOff />}
                  </button>
                </div>
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
                  {errors.confirmPassword && (
                    <span className="error-text">{errors.confirmPassword}</span>
                  )}

                  <button
                    type="button"
                    className="toggle-password"
                    onClick={() => togglePasswordVisibility("confirm")}
                  >
                    {showConfirmPassword ? <IoEye /> : <IoEyeOff />}
                  </button>
                </div>
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

          <button type="submit" className="register-button">
            Crear cuenta
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
