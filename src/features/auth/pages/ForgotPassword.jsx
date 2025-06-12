// React imports
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

// Material-UI imports
import {
  Box,
  TextField,
  Button,
  Typography,
  Container,
  Grid,
  Card,
  CardContent,
} from '@mui/material';

// Asset imports
import TeAcuerdasLogo from '../../../assets/TeAcuerdas.png';
import backgroundImage from '../../../assets/backgroundTeacuerdas.jpg';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');
    
    try {
      // Aquí iría la lógica real de recuperación de contraseña
      // Por ahora, solo simulamos una respuesta exitosa
      setMessage('Se ha enviado un enlace de recuperación a tu correo electrónico.');
      setTimeout(() => {
        navigate('/');
      }, 3000);
    } catch (err) {
      setError('Ocurrió un error al procesar tu solicitud. Por favor, intenta nuevamente.');
    }
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
          {/* Left side - Form */}
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
              backgroundColor: 'rgba(255, 255, 255, 0)',
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
                  Recuperar Contraseña
                </Typography>

                {message && (
                  <Typography color="success" variant="body2" sx={{ mb: 2, textAlign: 'center' }}>
                    {message}
                  </Typography>
                )}

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
                      Enviar Enlace de Recuperación
                    </Button>

                    <Box sx={{ mt: 2, textAlign: 'center' }}>
                      <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.875rem' }}>
                        <Link to="/" style={{ color: '#0455a2', textDecoration: 'none' }}>Volver al inicio de sesión</Link>
                      </Typography>
                    </Box>
                  </Box>
                </form>
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
                Recupera tu Acceso
              </Typography>
              <Typography variant="h6" sx={{
                color: '#0455a2',
                mb: 4,
                textShadow: '1px 1px 3px rgba(0,0,0,0.3)',
                fontWeight: 500
              }}>
                Te enviaremos las instrucciones a tu correo
              </Typography>
            </Box>
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
};

export default ForgotPassword;