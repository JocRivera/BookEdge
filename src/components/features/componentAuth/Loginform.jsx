import { useAuth } from "../../../context/AuthContext"; // Asegúrate de que la ruta sea correcta
import { Outlet, Link } from "react-router-dom";
import AuthNavbar from "../../layout/auth/AuthNavbar";
import "./login.css";

export default function LoginForm() {
  const { signin, errors, loading } = useAuth(); // Usa el hook useAuth

  const handleSubmit = async (e) => {
    e.preventDefault(); // Previene el comportamiento por defecto del formulario
    
    const email = e.target.email.value;
    const password = e.target.password.value;

    await signin({ email, password }); // Llama a la función signin del contexto
  };

  return (
    <>
      <AuthNavbar />
      <Outlet />
      <main className="login-container">
        <form className="login-form" onSubmit={handleSubmit}> {/* Usa onSubmit en el form */}
          <h2 className="title">Inicio de Sesión</h2>
          <p className="description">
            Para acceder a la plataforma, ingresa tu correo electrónico y contraseña.
          </p>
          
          {/* Muestra errores si existen */}
          {errors.length > 0 && (
            <div className="error-message">
              {errors.map((error, index) => (
                <p key={index}>{error}</p>
              ))}
            </div>
          )}

          <fieldset>
            <label htmlFor="email">Correo Electrónico</label>
            <input 
              type="email" 
              id="email" 
              name="email" 
              required 
              disabled={loading} // Desactiva campos durante la carga
            />

            <label htmlFor="password">Contraseña</label>
            <input 
              type="password" 
              id="password" 
              name="password" 
              required 
              disabled={loading}
            />

            <button type="submit" disabled={loading}>
              {loading ? "Cargando..." : "Iniciar Sesión"}
            </button>

            <p className="section-recovery">
              ¿Olvidaste tu contraseña?  
              <Link to="/recoveryPassword" className="forgot-password-link">Aquí</Link>
            </p>
          </fieldset>
        </form>

        <div className="signup-prompt">
          <div className="divider">
            <span>¿Eres nuevo en BookEdge?</span>
          </div>
          <Link to="/register" className="create-account-button">
            Crear tu cuenta de BookEdge
          </Link>
          <p className="terms">
            Al crear una cuenta, aceptas los 
            <Link to="/terms" className="terms-link"> Términos y Condiciones </Link> 
            y la 
            <Link to="/privacy" className="terms-link"> Política de Privacidad </Link> 
            de BookEdge.
          </p>
        </div>
      </main>
    </>
  );
}