import { useState } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import AuthNavbar from '../../layout/auth/AuthNavbar';
import { ToastContainer, toast } from "react-toastify";  // ✅ Importación correcta
import "react-toastify/dist/ReactToastify.css";
import './recoveryPassword.css';

const RecoveryPassword = () => {
  const [formulario, setFormulario] = useState({
    email: '',
  });

  const [errores, setErrores] = useState({});
  const navigate = useNavigate();

  const validarFormulario = (nombre, valor) => {
    switch (nombre) {
      case 'email': {
        const expresion = /^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+$/;
        if (!expresion.test(valor)) {
          return 'El correo no es válido';
        }
        break;
      }
      default:
        break;
    }
    return '';
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    setFormulario(prev => ({
      ...prev,
      [name]: value
    }));

    const error = validarFormulario(name, value);
    setErrores(prev => ({
      ...prev,
      [name]: error
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    const nuevosErrores = {};
    Object.keys(formulario).forEach(key => {
      const error = validarFormulario(key, formulario[key]);
      if (error) {
        nuevosErrores[key] = error;
      }
    });

    setErrores(nuevosErrores);

    if (Object.keys(nuevosErrores).length === 0) {
      console.log('Email enviado:', formulario.email);
      toast.success(`Se ha enviado un correo electrónico a ${formulario.email}  📧`, { autoClose: 2000 });
      setTimeout(() => {
        navigate('/Emailcode');
      }, 5000);
    }
  };


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
            <h1 className="recovery-title">Recuperar contraseña</h1>
            <p className="recovery-subtitle">
              Para recuperar tu contraseña, ingresa tu correo electrónico.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="recovery-form">
            <div className="form-group">
              <label htmlFor="email" className="form-label">
                Correo electrónico
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={formulario.email}
                onChange={handleChange}
                className="form-input"
                placeholder="ejemplo@correo.com"
                required
              />
              {errores.email && <p className="error-message">{errores.email}</p>}
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

      <ToastContainer /> 
    </div>
  );
};

export default RecoveryPassword;
