import axios from 'axios';
import { API_CONFIG } from '../config/api.config';

const api = axios.create({
  baseURL: API_CONFIG.BASE_URL,
  headers: {
    ...API_CONFIG.HEADERS,
    'Accept': 'application/json'
  },
  timeout: 10000
});

// Interceptor para manejar respuestas y errores
api.interceptors.response.use(
  response => response.data,
  error => {
    console.error('Error en la llamada API:', {
      url: error.config?.url,
      method: error.config?.method,
      status: error.response?.status,
      data: error.response?.data
    });
    throw error.response?.data || error;
  }
);

// Servicios para usuarios
export const usuariosService = {
  getAll: async () => {
    try {
      const response = await api.get(API_CONFIG.ENDPOINTS.USUARIOS);
      return response;
    } catch (error) {
      console.error('Error en getAll usuarios:', error);
      throw error;
    }
  },

  getById: async (id) => {
    try {
      const response = await api.get(`${API_CONFIG.ENDPOINTS.USUARIOS}/${id}`);
      return response;
    } catch (error) {
      console.error('Error en getById usuarios:', error);
      throw error;
    }
  },

  create: async (userData) => {
    try {
      const response = await api.post(API_CONFIG.ENDPOINTS.USUARIOS, userData);
      return response;
    } catch (error) {
      console.error('Error en create usuarios:', error);
      throw error;
    }
  },

  update: async (id, userData) => {
    try {
      const response = await api.put(`${API_CONFIG.ENDPOINTS.USUARIOS}/${id}`, userData);
      return response;
    } catch (error) {
      console.error('Error en update usuarios:', error);
      throw error;
    }
  },

  delete: async (id) => {
    try {
      const response = await api.delete(`${API_CONFIG.ENDPOINTS.USUARIOS}/${id}`);
      return response;
    } catch (error) {
      console.error('Error en delete usuarios:', error);
      throw error;
    }
  },
};

// Servicios para roles
export const rolesService = {
  getAll: async () => {
    try {
      const response = await api.get(API_CONFIG.ENDPOINTS.ROLES);
      return response;
    } catch (error) {
      console.error('Error en getAll roles:', error);
      throw error;
    }
  },

  getById: async (id) => {
    try {
      const response = await api.get(`${API_CONFIG.ENDPOINTS.ROLES}/${id}`);
      return response;
    } catch (error) {
      console.error('Error en getById roles:', error);
      throw error;
    }
  },
};

// Servicios para usuarios_has_rol
export const usuariosHasRolService = {
  getAll: async () => {
    try {
      const response = await api.get(API_CONFIG.ENDPOINTS.USUARIOS_HAS_ROL);
      return response;
    } catch (error) {
      console.error('Error en getAll usuariosHasRol:', error);
      throw error;
    }
  },

  getByUsuarioId: async (usuarioId) => {
    try {
      const response = await api.get(`${API_CONFIG.ENDPOINTS.USUARIOS_HAS_ROL}/usuario/${usuarioId}`);
      return response;
    } catch (error) {
      console.error('Error en getByUsuarioId usuariosHasRol:', error);
      throw error;
    }
  },

  create: async (usuarioRolData) => {
    try {
      const response = await api.post(API_CONFIG.ENDPOINTS.USUARIOS_HAS_ROL, usuarioRolData);
      return response;
    } catch (error) {
      console.error('Error en create usuariosHasRol:', error);
      throw error;
    }
  },

  delete: async (id) => {
    try {
      const response = await api.delete(`${API_CONFIG.ENDPOINTS.USUARIOS_HAS_ROL}/${id}`);
      return response;
    } catch (error) {
      console.error('Error en delete usuariosHasRol:', error);
      throw error;
    }
  },

  deleteByUsuarioId: async (usuarioId) => {
    try {
      const response = await api.delete(`${API_CONFIG.ENDPOINTS.USUARIOS_HAS_ROL}/usuario/${usuarioId}`);
      return response;
    } catch (error) {
      console.error('Error en deleteByUsuarioId usuariosHasRol:', error);
      throw error;
    }
  },
};