import React from 'react';
import useAlert from '../../../shared/hooks/useAlert';
import AlertProvider from '../../../shared/components/AlertProvider';

const AlertComponent = () => {
  const { alert, hideAlert } = useAlert();

  return (
    <AlertProvider 
      alert={alert}
      onClose={hideAlert}
    />
  );
};

export default AlertComponent;