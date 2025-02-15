import { Outlet, Link } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import AuthNavbar from "../../layout/auth/AuthNavbar";
import "./login.css";

export default function LoginForm() {
  const Navigate = useNavigate();

  const handleclick = () => {
    Navigate("/admin");
  }
  return (
    <>
      <AuthNavbar />
      <Outlet />
      <main className="login-container">
        <form className="login-form">
          <h2 className="title">Inicio de Sesión</h2>
          <p className="description">
            Para acceder a la plataforma, ingresa tu correo electrónico y contraseña.
          </p>
          <fieldset>
            <label htmlFor="email">Correo Electrónico</label>
            <input type="email" id="email" name="email" required />

            <label htmlFor="password">Contraseña</label>
            <input type="password" id="password" name="password" required />

            <button type="submit" onClick={handleclick}>Iniciar Sesión</button>
            <p className="section-recovery">¿ Olvidaste tu contraseña?  <Link to= "/recoveryPassword" className="forgot-password-link">Aquí</Link></p>
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