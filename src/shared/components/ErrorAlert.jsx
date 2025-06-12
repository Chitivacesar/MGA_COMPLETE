import { Snackbar, Alert } from '@mui/material';

const ErrorAlert = ({ open, message, onClose }) => {
  return (
    <Snackbar
      open={open}
      autoHideDuration={3000}
      onClose={onClose}
      anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
    >
      <Alert 
        onClose={onClose} 
        severity="error" 
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

export default ErrorAlert;