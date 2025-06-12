import { createContext, useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { mockUsers } from '../data/mockUsers';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    // Recuperar el usuario de localStorage al cargar la aplicación
    const storedUser = localStorage.getItem('user');
    return storedUser ? JSON.parse(storedUser) : null;
  });
  const navigate = useNavigate();

  const login = ({ email, password }) => {
    const foundUser = mockUsers.find(
      (u) => u.email === email && u.password === password
    );
    if (foundUser) {
      setUser(foundUser);
      localStorage.setItem('user', JSON.stringify(foundUser)); // Guardar el usuario en localStorage
      navigate('/dashboard'); // Redirigir al dashboard después del login
    } else {
      alert('Credenciales incorrectas');
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('user'); // Eliminar el usuario de localStorage
    navigate('/'); // Redirigir al Home después del logout
  };

  const updateUser = (userData) => {
    try {
      // Mantener los permisos y roles existentes si no se proporcionan nuevos
      const existingUser = JSON.parse(localStorage.getItem('user')) || user;
      const updatedData = {
        ...existingUser,
        ...userData,
        // Mantener la contraseña existente si no se modifica
        password: userData.password === '********' ? existingUser.password : userData.password,
        // Asegurar que se mantengan los permisos y roles
        permissions: userData.permissions || existingUser.permissions,
        role: userData.role || existingUser.role
      };

      // Actualizar el usuario en el estado y localStorage
      setUser(updatedData);
      localStorage.setItem('user', JSON.stringify(updatedData));
      alert('Datos guardados exitosamente'); // Agregar alerta de éxito
      navigate('/dashboard'); // Redirigir al dashboard después de actualizar
      return true;
    } catch (error) {
      console.error('Error al actualizar usuario:', error);
      throw new Error('Error al actualizar los datos del usuario');
    }
  };

  useEffect(() => {
    // Sincronizar el estado del usuario con localStorage
    const storedUser = localStorage.getItem('user');
    if (storedUser && !user) {
      setUser(JSON.parse(storedUser));
    }
  }, [user]);

  return (
    <AuthContext.Provider value={{ user, login, logout, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth debe ser usado dentro de un AuthProvider');
  }
  return context;
}