import { Outlet, Link } from "react-router-dom";
import AuthNavbar from "../../layout/auth/AuthNavbar";
import "./register.css";

export default function RegisterForm() {
  return (
    <>
      <AuthNavbar />
      <Outlet />
      <main className="register-container">
        <form className="register-form">
          <h2 className="title">Crear cuenta en BookEdge</h2>
          <p className="description">
            Completa tus datos para comenzar a explorar nuestra biblioteca
            digital.
          </p>

          <div className="form-grid">
            <div className="form-column">
              <div className="form-group">
                <label htmlFor="fullName">Nombre completo</label>
                <input
                  type="text"
                  id="fullName"
                  name="fullName"
                  required
                  placeholder="Como aparece en tu identificación"
                />
              </div>

              <div className="form-group">
                <label htmlFor="tipoDocumento">Tipo de documento</label>
                <select id="tipoDocumento" name="tipoDocumento" required>
                  <option value="">Selecciona un tipo</option>
                  <option value="dni">DNI</option>
                  <option value="pasaporte">Pasaporte</option>
                  <option value="ce">Carné de Extranjería</option>
                </select>
              </div>

              <div className="form-group">
                <label htmlFor="idNumber">Número de documento</label>
                <input
                  type="text"
                  id="idNumber"
                  name="idNumber"
                  required
                  placeholder="Ingresa tu número de documento"
                />
              </div>
              <div className="form-group">
                <label htmlFor="phone">Número de contacto</label>
                <input
                  type="tel"
                  id="phone"
                  name="phone"
                  required
                  placeholder="Ingresa porfavor un número valido"
                />
              </div>
            </div>

            <div className="form-column">
              <div className="form-group">
                <label htmlFor="birthdate">Fecha de nacimiento</label>
                <input type="date" id="birthdate" name="birthdate" required />
              </div>

              <div className="form-group">
                <label htmlFor="email">Correo electrónico</label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  required
                  placeholder="ejemplo@correo.com"
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
