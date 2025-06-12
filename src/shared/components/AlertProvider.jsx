import React from 'react';
import SuccessAlert from './SuccessAlert';
import ErrorAlert from './ErrorAlert';
import InfoAlert from './InfoAlert';

const AlertProvider = ({ alert, onClose }) => {
  const { open, type, message } = alert;

  const alertComponents = {
    success: <SuccessAlert open={open} message={message} onClose={onClose} />,
    error: <ErrorAlert open={open} message={message} onClose={onClose} />,
    info: <InfoAlert open={open} message={message} onClose={onClose} />
  };

  return alertComponents[type] || null;
};

export default AlertProvider;