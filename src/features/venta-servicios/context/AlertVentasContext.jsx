import React, { createContext, useState, useContext } from 'react';
import { Alert, Snackbar } from '@mui/material';

const AlertVentasContext = createContext();

export const useAlertVentas = () => {
  const context = useContext(AlertVentasContext);
  if (!context) {
    throw new Error('useAlertVentas debe ser usado dentro de un AlertVentasProvider');
  }
  return context;
};

export const AlertVentasProvider = ({ children }) => {
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
    <AlertVentasContext.Provider
      value={{
        alert,
        showAlert,
        hideAlert,
        showSuccess,
        showError,
        showInfo
      }}
    >
      {children}
      {alert.open && (
        <Snackbar
          open={alert.open}
          autoHideDuration={6000}
          onClose={hideAlert}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        >
          <Alert
            onClose={hideAlert}
            severity={alert.type}
            sx={{ width: '100%' }}
            variant="filled"
          >
            {alert.message}
          </Alert>
        </Snackbar>
      )}
    </AlertVentasContext.Provider>
  );
};