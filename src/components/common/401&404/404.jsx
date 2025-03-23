import React, { useEffect, useState } from 'react';
import './ErrorPage.css';

const Error404 = () => {
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    const handleMouseMove = (e) => {
      const x = e.clientX / window.innerWidth - 0.5;
      const y = e.clientY / window.innerHeight - 0.5;
      setPosition({ x, y });
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  const handleButtonClick = () => {
    setIsAnimating(true);
    setTimeout(() => {
      window.location.href = '/';
    }, 1000);
  };

  return (
    <div className="error-page">
      <div 
        className="parallax-container"
        style={{
          transform: `translate(${position.x * 20}px, ${position.y * 20}px)`
        }}
      >
        <div className="error-code">404</div>
        <div className="error-characters">
          <div className="character ghost" style={{ 
            transform: `translate(${position.x * -40}px, ${position.y * -40}px)`,
            opacity: 0.9 
          }}>
            👻
          </div>
          <div className="character alien" style={{ 
            transform: `translate(${position.x * 30}px, ${position.y * 30}px)`,
            opacity: 0.8 
          }}>
            👽
          </div>
          <div className="character robot" style={{ 
            transform: `translate(${position.x * -15}px, ${position.y * -15}px)`,
            opacity: 0.7 
          }}>
            🤖
          </div>
        </div>
        <h1 className="error-title">¡Página no encontrada!</h1>
        <p className="error-message">
          La página que buscas se perdió en otra dimensión.
        </p>
        <button 
          className={`error-button ${isAnimating ? 'animate' : ''}`} 
          onClick={handleButtonClick}
        >
          Regresar al inicio
        </button>
      </div>
      <div className="stars"></div>
    </div>
  );
};

export default Error404;