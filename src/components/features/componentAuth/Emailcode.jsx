import { useNavigate, useLocation } from 'react-router-dom';
import { useState } from 'react';
import { resetPassword } from '../../../services/authService'; 
import logo from "../../../assets/logo.png";


export default function ResetPassword() {
  const navigate = useNavigate();
  const location = useLocation();
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const queryParams = new URLSearchParams(location.search);
  const token = queryParams.get('token');

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (newPassword !== confirmPassword) {
      setError('Las contraseñas no coinciden');
      return;
    }

    try {
      await resetPassword(token, newPassword);
      setSuccess('Contraseña restablecida correctamente');
      setTimeout(() => navigate('/login'), 2000);
    } catch (error) {
      setError('Error al restablecer la contraseña'.error);
    }
  };

  const handleCancel = () => {
    navigate('/login');
  };

  return (
    
    <div className="page-container">
          <div className="simple-navbar">
        <div className="navbar-content">
          <div className="brand" onClick={() => navigate("/")}>
            <img src={logo} alt="Logo" className="navbar-logo" />
            <h1 className="navbar-title">Los Lagos</h1>
          </div>
        </div>
      </div>
      <div className="recovery-container">
        <div className="recovery-card">
          <div className="recovery-header">
            <h1 className="recovery-title">Restablece tu contraseña</h1>
            <p className="recovery-subtitle">
              Ingresa una nueva contraseña para tu cuenta.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="recovery-form">
            <div className="form-group">
              <input
                type="password"
                placeholder="Nueva contraseña"
                className="form-input"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <input
                type="password"
                placeholder="Confirmar contraseña"
                className="form-input"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
              />
            </div>

            {error && <p className="error-text">{error}</p>}
            {success && <p className="success-text">{success}</p>}

            <div className="buttons-recovery-password">
              <button type="submit" className="recovery-button">
                Restablecer contraseña
              </button>
              <button type="button" onClick={handleCancel} className="cancel-button">
                Cancelar
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
