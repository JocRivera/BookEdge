// src/components/common/CustomAlert/CustomAlert.jsx
import React, { useEffect, useState } from 'react';
import './CustomAlert.css';
import {
  FaExclamationTriangle,
  FaInfoCircle,
 
} from 'react-icons/fa';

const CustomAlert = ({
  isOpen,
  onClose,
  title,
  message,
  type = 'info-modal',
  confirmText = 'Aceptar',
  cancelText = 'Cancelar',
  onConfirm,
  showCancelButton = false,
  children,
}) => {
  const [shouldRender, setShouldRender] = useState(isOpen);

  useEffect(() => {
    if (isOpen) setShouldRender(true);
    else {
      const timer = setTimeout(() => setShouldRender(false), 250);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  const handleConfirm = () => { if (onConfirm) onConfirm(); };
  const handleCancel = () => { onClose(); };

  const renderIcon = () => {
  
    switch (type) {
      case 'confirm-delete':
      case 'error-modal': 
        return <FaExclamationTriangle />; 
      case 'confirm-edit':
        return <FaInfoCircle />; 
      case 'info-modal':
      default:
        return <FaInfoCircle />;
    }
  };
  // Alternativa para iconos más específicos:
  // const renderIcon = () => {
  //   switch (type) {
  //     case 'confirm-delete': return <FaTrashAlt />;
  //     case 'confirm-edit': return <FaEdit />;
  //     case 'error-modal': return <FaTimesCircle />;
  //     case 'info-modal': default: return <FaInfoCircle />;
  //   }
  // };


  if (!shouldRender && !isOpen) return null;

  const hasPrimaryButton = true;

  return (
    <div
      className={`custom-alert-overlay ${isOpen ? 'open' : ''}`}
      onClick={(e) => {
        if (e.target === e.currentTarget && type === 'info-modal') onClose();
      }}
    >
      <div
        className={`custom-alert-content ${type}`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="custom-alert-header">
          <div className="custom-alert-icon-wrapper">
            <div className="custom-alert-icon-area">
              {renderIcon()}
            </div>
          </div>
          {title && <h3 className="custom-alert-title">{title}</h3>}
        </div>
        
        <div className="custom-alert-message">
          {message}{children}
        </div>
        
        <div className="custom-alert-actions">
          
          {showCancelButton && (
            <button
              className="custom-alert-button cancel"
              onClick={handleCancel}
            >
              {cancelText}
            </button>
          )}
           {hasPrimaryButton && (
            <button
              className="custom-alert-button confirm"
              onClick={handleConfirm}
            >
              {confirmText}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default CustomAlert;