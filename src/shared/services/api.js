import axios from 'axios';
import { API_CONFIG } from '../config/api.config';

const api = axios.create({
  baseURL: API_CONFIG.BASE_URL,
  headers: {
    ...API_CONFIG.HEADERS,
    'Accept': 'application/json'
  },
  timeout: 10000 // Agregamos un timeout de 10 segundos
});

// Mejorar el interceptor para manejar errores
api.interceptors.response.use(
  response => response.data, // Ya retorna response.data
  error => {
    console.error('Error en la llamada API:', {
      url: error.config?.url,
      method: error.config?.method,
      status: error.response?.status,
      data: error.response?.data
    });
    throw error;
  }
);

// Servicios para usuarios
export const usuariosService = {
  getAll: async () => {
    return await api.get(API_CONFIG.ENDPOINTS.USUARIOS);
    return response.data; // Esto causa undefined porque response ya es data
  },

  getById: async (id) => {
    const response = await api.get(`${API_CONFIG.ENDPOINTS.USUARIOS}/${id}`);
    return response.data;
  },

  create: async (userData) => {
    const response = await api.post(API_CONFIG.ENDPOINTS.USUARIOS, userData);
    return response.data;
  },

  update: async (id, userData) => {
    const response = await api.put(`${API_CONFIG.ENDPOINTS.USUARIOS}/${id}`, userData);
    return response.data;
  },

  delete: async (id) => {
    const response = await api.delete(`${API_CONFIG.ENDPOINTS.USUARIOS}/${id}`);
    return response.data;
  },
};

// Servicios para roles
export const rolesService = {
  getAll: async () => {
    const response = await api.get(API_CONFIG.ENDPOINTS.ROLES);
    return response.data;
  },

  getById: async (id) => {
    const response = await api.get(`${API_CONFIG.ENDPOINTS.ROLES}/${id}`);
    return response.data;
  },
};

// Servicios para usuarios_has_rol
export const usuariosHasRolService = {
  getAll: async () => {
    const response = await api.get(API_CONFIG.ENDPOINTS.USUARIOS_HAS_ROL);
    return response.data;
  },

  create: async (usuarioRolData) => {
    const response = await api.post(API_CONFIG.ENDPOINTS.USUARIOS_HAS_ROL, usuarioRolData);
    return response.data;
  },

  delete: async (id) => {
    const response = await api.delete(`${API_CONFIG.ENDPOINTS.USUARIOS_HAS_ROL}/${id}`);
    return response.data;
  },
};