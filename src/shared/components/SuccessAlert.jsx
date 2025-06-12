
import { Snackbar, Alert } from '@mui/material';

export const SuccessAlert = ({ open, message, onClose }) => {
  return (
    <Snackbar
      open={open}
      autoHideDuration={3000}
      onClose={onClose}
      anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
    >
      <Alert 
        onClose={onClose} 
        severity="success"
        variant="filled"
        sx={{ 
          bgcolor: '#2e7d32',
          color: 'white',
          '& .MuiAlert-icon': {
            color: 'white'
          }
        }}
      >
        {message}
      </Alert>
    </Snackbar>
  );
};

export default SuccessAlert;