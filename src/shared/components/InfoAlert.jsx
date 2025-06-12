import { Snackbar, Alert } from '@mui/material';

const InfoAlert = ({ open, message, onClose }) => {
  return (
    <Snackbar
      open={open}
      autoHideDuration={3000}
      onClose={onClose}
      anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }} // Cambiado a 'right'
    >
      <Alert 
        onClose={onClose} 
        severity="info" 
        variant="filled"
        sx={{ 
          minWidth: '200px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
          borderRadius: '8px'
        }}
      >
        {message}
      </Alert>
    </Snackbar>
  );
};

export default InfoAlert;