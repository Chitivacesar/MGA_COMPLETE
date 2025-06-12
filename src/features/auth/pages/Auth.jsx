import { useState } from 'react';
import { 
  Box, 
  Paper, 
  TextField, 
  Button, 
  Typography, 
  Container,
  Checkbox,
  FormControlLabel,
  Link
} from '@mui/material';
// Update these imports
import { useAuth } from '../context/AuthContext';
import { mockUsers } from '../data/mockUsers';

const Auth = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const { login } = useAuth();

  const handleSubmit = (e) => {
    e.preventDefault();
    const user = mockUsers.find(u => u.email === email);
    if (user) {
      login(user);
    }
  };

  return (
    <Container maxWidth="sm">
      <Box sx={{ 
        height: '100vh',
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center',
        mt: -10
      }}>
        <Paper elevation={3} sx={{ p: 4, width: '100%' }}>
          <Typography variant="h4" align="center" sx={{ mb: 4, color: '#0455a2' }}>
            Iniciar Sesión
          </Typography>
          
          <form onSubmit={handleSubmit}>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <TextField
                label="Email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                fullWidth
              />
              
              <TextField
                label="Contraseña"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                fullWidth
              />
              
              <Box sx={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'center',
                mt: 1
              }}>
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                      sx={{ color: '#0455a2', '&.Mui-checked': { color: '#0455a2' } }}
                    />
                  }
                  label="Mantener sesión iniciada"
                />
                <Link 
                  href="/forgot-password"
                  sx={{ 
                    color: '#0455a2',
                    textDecoration: 'none',
                    '&:hover': { textDecoration: 'underline' }
                  }}
                >
                  ¿Olvidó su contraseña?
                </Link>
              </Box>
              
              <Button 
                type="submit" 
                variant="contained" 
                fullWidth
                sx={{ 
                  mt: 2,
                  backgroundColor: '#0455a2',
                  '&:hover': {
                    backgroundColor: '#7c9427'
                  }
                }}
              >
                Iniciar Sesión
              </Button>
            </Box>
          </form>
        </Paper>
      </Box>
    </Container>
  );
};

export default Auth;