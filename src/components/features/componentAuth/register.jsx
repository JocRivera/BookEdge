import { Outlet, Link, useNavigate } from "react-router-dom";
import AuthNavbar from "../../layout/auth/AuthNavbar";
import "./register.css";
import { useState } from "react";
import { toast } from "react-toastify";
import { register } from "../../../services/AuthService";




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

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
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
      console.log("Error a conectar", error);
      toast.error("Ocurrió un error al registrarse");
    }
  };
  
  return (
    <>
      <AuthNavbar />
      <Outlet />
      <main className="register-container">
        <form className="register-form" onSubmit={handleSubmit}>
          <h2 className="title">Crear cuenta en BookEdge</h2>
          <p className="description">
            Completa tus datos para comenzar nuestra hostería.
          </p>

          <div className="form-grid">
            <div className="form-column">
              <div className="form-group">
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
              </div>

              <div className="form-group">
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
              </div>

              <div className="form-group">
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
              </div>
              <div className="form-group">
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
              </div>
            </div>

            <div className="form-column">
              <div className="form-group">
                <label htmlFor="birthdate">Fecha de nacimiento</label>
                <input
                  type="date"
                  id="birthdate"
                  name="birthdate"
                  required
                  value={formData.birthdate}
                  onChange={handleChange}
                />
              </div>

              <div className="form-group">
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
              </div>

              <div className="form-group">
                <label htmlFor="password">Contraseña</label>
                <input
                  type="password"
                  id="password"
                  name="password"
                  required
                  placeholder="Al menos 8 caracteres"
                  value={formData.password}
                  onChange={handleChange}
                />
              </div>

              <div className="form-group">
                <label htmlFor="confirmPassword">Confirmar contraseña</label>
                <input
                  type="password"
                  id="confirmPassword"
                  name="confirmPassword"
                  required
                  placeholder="Repite tu contraseña"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                />
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

          <button type="submit">Crear cuenta</button>
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
