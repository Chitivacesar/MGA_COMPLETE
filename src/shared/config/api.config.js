export const API_CONFIG = {
  BASE_URL: 'http://localhost:3000/api',
  HEADERS: {
    'Content-Type': 'application/json'
  },
  ENDPOINTS: {
    USUARIOS: '/usuarios',
    ROLES: '/roles',
    USUARIOS_HAS_ROL: '/usuarios-has-rol'  // Corregido para coincidir con la ruta del backend
  }
};