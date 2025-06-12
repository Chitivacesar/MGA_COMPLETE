import React, { createContext, useState, useContext } from 'react';

// Crear el contexto
const AlertContext = createContext();

// Proveedor del contexto
export const AlertProvider = ({ children }) => {
  const [alert, setAlert] = useState({
    open: false,
    type: 'success',
    message: ''
  });

  const showAlert = (type, message) => {
    setAlert({
      open: true,
      type,
      message
    });
  };

  const hideAlert = () => {
    setAlert({
      ...alert,
      open: false
    });
  };

  const showSuccess = (message) => showAlert('success', message);
  const showError = (message) => showAlert('error', message);
  const showInfo = (message) => showAlert('info', message);

  return (
    <AlertContext.Provider
      value={{
        alert,
        showSuccess,
        showError,
        showInfo,
        hideAlert
      }}
    >
      {children}
    </AlertContext.Provider>
  );
};

// Hook personalizado para usar el contexto
export const useAlertContext = () => {
  const context = useContext(AlertContext);
  if (!context) {
    throw new Error('useAlertContext debe ser usado dentro de un AlertProvider');
  }
  return context;
};