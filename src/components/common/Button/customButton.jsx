// components/CustomButton/CustomButton.jsx
import React from 'react';
import './CustomButton.css';
import { FaEye, FaEdit, FaTrash, FaPlus,  } from 'react-icons/fa';

export const CustomButton = ({ 
  children, 
  variant = "primary", 
  icon, 
  onClick,  
  className = "",
  iconOnly = false,
  ...props 
}) => {
  const getIcon = (iconName) => {
    const icons = {
      view: <FaEye />,
      edit: <FaEdit />,
      delete: <FaTrash />,
      add: <FaPlus />,
    };
    return icons[iconName];
  };

  return (
    <button
      className={`custom-button ${variant} ${iconOnly ? 'icon-only' : ''} ${className}`}
      onClick={onClick}
      {...props}
    >
      {icon && <span className="button-icon">{getIcon(icon)}</span>}
      {!iconOnly && children}
    </button>
  );
};

// componente de los iconos se puede se parar NOOO OLVIDAAAAR LE MANDAS LOS PROPS PARA QUE FUNCIONE Y IMPORTAS Y LLMAS
export const ActionButtons = ({ onView, onEdit, onDelete}) => {
  return (
    <div className="action-buttons">
      {/* Botón de "Ver" solo si onView está definido */}
      {onView && (
        <CustomButton
          variant="primary"
          icon="view"
          iconOnly
          onClick={onView}
          title="Ver"
        />
      )}
      {/* Botón de "Editar" solo si onEdit está definido */}
      {onEdit && (
        <CustomButton
          variant="warning"
          icon="edit"
          iconOnly
          onClick={onEdit}
          title="Editar"
        />
      )}
      {/* Botón de "Eliminar" solo si onDelete está definido */}
      {onDelete && (
        <CustomButton
          variant="danger"
          icon="delete"
          iconOnly
          onClick={onDelete}
          title="Eliminar"
        />
      )}

    </div>
  );
};