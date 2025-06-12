import { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  Box, 
  TextField, 
  Button, 
  Typography, 
  Container,
  Grid,
  Card,
  CardContent,
  IconButton,
  InputAdornment,
  Checkbox,
  FormControlLabel
} from '@mui/material';
import { Visibility, VisibilityOff } from '@mui/icons-material';
import { useAuth } from './features/auth/context/AuthContext';
import { mockUsers } from './features/auth/data/mockUsers';
import TeAcuerdasLogo from './assets/TeAcuerdas.png';
import backgroundImage from './assets/backgroundTeacuerdas.jpg'; // Import the background image

const Home = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [keepLoggedIn, setKeepLoggedIn] = useState(false);
  const [error, setError] = useState('');
  const { login } = useAuth();

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');
    
    const user = mockUsers.find(u => u.email === email);
    if (user && user.password === password) {
      login(user);
    } else {
      setError('Credenciales inválidas. Por favor intente nuevamente.');
    }
  };

  const handleTogglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  return (
    <Box sx={{ 
      height: '100vh',
      width: '100vw',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      margin: 0,
      padding: 0,
      overflow: 'hidden'
    }}>
      <Container maxWidth={false} disableGutters sx={{ 
        height: '100%',
        width: '100%',
        margin: 0,
        padding: 0
      }}>
        <Grid container sx={{ height: '100%', margin: 0 }}>
          {/* Left side - Login form */}
          <Grid item xs={12} md={6} sx={{ 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center',
            height: '100%',
            padding: { xs: 2, md: 4 },
            backgroundImage: `url(${backgroundImage})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            position: 'relative',
            '&::before': {
              content: '""',
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: 'rgba(255, 255, 255, 0)', // Cambiado de 0.85 a 0
              zIndex: 1
            }
          }}>
            <Card elevation={5} sx={{ 
              maxWidth: 450, 
              mx: 'auto',
              borderRadius: 2,
              overflow: 'hidden',
              boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
              position: 'relative',
              zIndex: 2
            }}>
              <CardContent sx={{ p: 4 }}>
                <Typography variant="h5" align="center" sx={{ mb: 3, fontWeight: 600, color: '#0455a2' }}>
                  Iniciar Sesión
                </Typography>
                
                {error && (
                  <Typography color="error" variant="body2" sx={{ mb: 2, textAlign: 'center' }}>
                    {error}
                  </Typography>
                )}
                
                <form onSubmit={handleSubmit}>
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                    <TextField
                      label="Email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      fullWidth
                      variant="outlined"
                      placeholder="Ingrese su email"
                      size="small"
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          borderRadius: 1
                        }
                      }}
                    />
                    
                    <TextField
                      label="Contraseña"
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      fullWidth
                      variant="outlined"
                      placeholder="Ingrese su contraseña"
                      size="small"
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          borderRadius: 1
                        }
                      }}
                      InputProps={{
                        endAdornment: (
                          <InputAdornment position="end">
                            <IconButton
                              onClick={handleTogglePasswordVisibility}
                              edge="end"
                              size="small"
                            >
                              {showPassword ? <VisibilityOff /> : <Visibility />}
                            </IconButton>
                          </InputAdornment>
                        ),
                      }}
                    />
                    
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 0.5 }}>
                      <FormControlLabel
                        control={
                          <Checkbox 
                            checked={keepLoggedIn}
                            onChange={(e) => setKeepLoggedIn(e.target.checked)}
                            sx={{ '&.Mui-checked': { color: '#0455a2' } }}
                            size="small"
                          />
                        }
                        label={<Typography variant="body2">Mantener sesión iniciada</Typography>}
                      />
                      <Link to="/forgot-password" style={{ color: '#0455a2', textDecoration: 'none', fontSize: '0.875rem' }}>
                        ¿Olvidó su contraseña?
                      </Link>
                    </Box>
                    
                    <Button 
                      type="submit" 
                      variant="contained" 
                      fullWidth
                      size="medium"
                      sx={{ 
                        mt: 2,
                        py: 1,
                        backgroundColor: '#0455a2',
                        '&:hover': {
                          backgroundColor: '#6c8221'
                        },
                        fontWeight: 600,
                        textTransform: 'uppercase',
                        fontSize: '0.875rem',
                        borderRadius: 1
                      }}
                    >
                      INICIAR SESIÓN
                    </Button>
                  </Box>
                </form>
                
                <Box sx={{ mt: 2, textAlign: 'center' }}>
                  <Typography variant="body2" color="text.secondary" sx={{ mt: 1.5, fontSize: '0.75rem' }}>
                    Credenciales de prueba:<br />
                    Email: admin@teacuerdas.com<br />
                    Contraseña: admin123
                  </Typography>
                </Box>
              </CardContent>
            </Card>
          </Grid>

          {/* Right side - Logo and welcome message */}
          <Grid item xs={12} md={6} sx={{ 
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            height: '100%',
            padding: { xs: 2, md: 4 },
            backgroundColor: '#f5f7fa'
          }}>
            <Box sx={{ mb: 4, textAlign: 'center', position: 'relative', zIndex: 2 }}>
              <img 
                src={TeAcuerdasLogo} 
                alt="Te Acuerdas Logo" 
                style={{ 
                  width: '150px',
                  height: '150px',
                  objectFit: 'contain',
                  borderRadius: '50%',
                  backgroundColor: 'white',
                  padding: '15px'
                }} 
              />
            </Box>
            <Box sx={{ textAlign: 'center', position: 'relative', zIndex: 2 }}>
              <Typography variant="h3" component="h1" sx={{ 
                fontWeight: 700, 
                color: '#0455a2',
                mb: 2,
                textShadow: '1px 1px 3px rgba(0,0,0,0.7)'
              }}>
                Bienvenido a Te Acuerdas
              </Typography>
              <Typography variant="h6" sx={{ 
                color: '#0455a2', // Changed from white to match the title color
                mb: 4,
                textShadow: '1px 1px 3px rgba(0,0,0,0.3)', // Lighter shadow for better readability
                fontWeight: 500
              }}>
                Academia Musical
              </Typography>
            </Box>
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
};

export default Home;