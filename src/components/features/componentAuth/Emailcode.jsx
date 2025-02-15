import AuthNavbar from '../../layout/auth/AuthNavbar'
import { Outlet } from 'react-router-dom'
import { useNavigate } from 'react-router-dom'
export default function Emailcode() {

 const navigate = useNavigate();
  
  const handleCancel = () => {
    navigate('/login');
  };

  return (
<div className="page-container">
      <AuthNavbar />
      <Outlet />
      
      <div className="recovery-container">
        <div className="recovery-card">
          <div className="recovery-header">
            <h1 className="recovery-title">Ingrese el código</h1>
            <p className="recovery-subtitle">
              Para reestablecer su contraseña debe de ingresar el codigo enviado a su correo.
            </p>
          </div>

          <form  className="recovery-form">
            <div className="form-group">
              
              <input
                type="text"
                id="email"
                name="email"
                className="form-input"
                placeholder='por favor ingrese el código'

                required
              />
              
            </div>

            <div className="buttons-recovery-password">
              <button type="submit" className="recovery-button">
                Enviar
              </button>
              <button type="button" onClick={handleCancel} className="cancel-button">
                Cancelar
              </button>
            </div>
          </form>
        </div>
      </div>

    </div>  )
}
