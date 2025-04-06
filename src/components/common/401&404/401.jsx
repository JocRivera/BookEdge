import React, { useEffect, useState } from 'react';
import './ErrorPage.css';

const Error401 = () => {
  const [shake, setShake] = useState(false);
  const [lockPosition, setLockPosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const handleMouseMove = (e) => {
      const x = (e.clientX / window.innerWidth - 0.5) * 10;
      const y = (e.clientY / window.innerHeight - 0.5) * 10;
      setLockPosition({ x, y });
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  const handleButtonClick = () => {
    setShake(true);
    setTimeout(() => {
      setShake(false);
      window.location.href = '/profile';
    }, 1000);
  };

  return (
    <div className="error-page error-401">
      <div className="security-container">
        <div 
          className={`lock-container ${shake ? 'shake' : ''}`}
          style={{
            transform: `translate(${lockPosition.x}px, ${lockPosition.y}px)`
          }}
        >
          <div className="lock">🔒</div>
          <div className="lock-shadow"></div>
        </div>
        <div className="error-code">401</div>
        <h1 className="error-title">¡Acceso no autorizado!</h1>
        <p className="error-message">
          No tienes los permisos necesarios para acceder a esta página.
        </p>
        <div className="security-tape left"></div>
        <div className="security-tape right"></div>
        <button 
          className="error-button login-button" 
          onClick={handleButtonClick}
        >
          Iniciar sesión
        </button>
      </div>
      <div className="shield left">🛡️</div>
      <div className="shield right">🛡️</div>
      <div className="laser-beams"></div>
    </div>
  );
};

export default Error401;