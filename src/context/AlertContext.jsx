import React, { createContext, useState, useContext, useCallback } from 'react';
import CustomAlert from '../components/common/CustomAlert/CustomAlert'; 

const AlertContext = createContext();

export const useAlert = () => {
  const context = useContext(AlertContext);
  if (!context) {
    throw new Error('useAlert must be used within an AlertProvider');
  }
  return context;
};

export const AlertProvider = ({ children }) => {
  const [alertState, setAlertState] = useState({
    isOpen: false,
    title: '',
    message: '',
    type: 'info', // Tipos ahora serán 'confirm-delete', 'confirm-edit', 'error-modal', 'info-modal'
    confirmText: 'Aceptar',
    cancelText: 'Cancelar',
    onConfirm: () => {},
    showCancelButton: false,
    childrenContent: null,
  });


  const showAlert = useCallback((options) => {
    // Validar que el tipo sea uno de los esperados para modales
    const validModalTypes = ['confirm-delete', 'confirm-edit', 'error-modal', 'info-modal'];
    if (!validModalTypes.includes(options.type)) {
      console.warn(`showAlert: Tipo de modal no válido '${options.type}'. Usar react-toastify para éxitos/errores simples.`);
      return; // No mostrar modal para tipos no válidos (ej. 'success')
    }

    let defaultConfirmText = 'Aceptar';
    let showDefaultCancelButton = false;

    if (options.type === 'confirm-delete' || options.type === 'confirm-edit') {
      defaultConfirmText = options.type === 'confirm-delete' ? 'Eliminar' : 'Modificar';
      showDefaultCancelButton = true;
    }


    setAlertState({
      isOpen: true,
      title: options.title || '',
      message: options.message || '',
      type: options.type, // Usamos el tipo específico
      confirmText: options.confirmText || defaultConfirmText,
      cancelText: options.cancelText || 'Cancelar',
      onConfirm: options.onConfirm || (() => {}),
      showCancelButton: options.showCancelButton !== undefined ? options.showCancelButton : showDefaultCancelButton,
      childrenContent: options.children || null,
    });
  }, []);

  const hideAlert = useCallback(() => {
    setAlertState((prev) => ({ ...prev, isOpen: false }));
  }, []);

  const handleConfirmWithClose = () => {
    if (alertState.onConfirm) {
      alertState.onConfirm();
    }
    hideAlert(); // Todos los modales ahora se cierran después de la acción de confirmar
  };

  return (
    <AlertContext.Provider value={{ showAlert, hideAlert }}>
      {children}
      <CustomAlert
        isOpen={alertState.isOpen}
        onClose={hideAlert}
        title={alertState.title}
        message={alertState.message}
        type={alertState.type}
        confirmText={alertState.confirmText}
        cancelText={alertState.cancelText}
        onConfirm={handleConfirmWithClose}
        showCancelButton={alertState.showCancelButton}
        // key para asegurar re-render si el mensaje cambia, aunque menos crítico ahora
        key={alertState.message + alertState.title + alertState.type}
      >
        {alertState.childrenContent}
      </CustomAlert>
    </AlertContext.Provider>
  );
};