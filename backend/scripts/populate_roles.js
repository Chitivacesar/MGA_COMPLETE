const mongoose = require('mongoose');
const Rol = require('../models/rol');

// Conectar a MongoDB
mongoose.connect('mongodb://localhost:27017/mga_db', {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

// Roles predefinidos
const roles = [
  {
    nombre: 'Usuario',
    descripcion: 'Usuario estándar del sistema',
    estado: true
  },
  {
    nombre: 'Admin',
    descripcion: 'Administrador del sistema con acceso completo',
    estado: true
  },
  {
    nombre: 'Profesor',
    descripcion: 'Profesor con acceso a funcionalidades específicas de enseñanza',
    estado: true
  }
];

// Función para crear roles
async function crearRoles() {
  try {
    for (const rol of roles) {
      // Verificar si el rol ya existe
      const rolExistente = await Rol.findOne({ nombre: rol.nombre });
      
      if (!rolExistente) {
        // Crear nuevo rol
        const nuevoRol = new Rol(rol);
        await nuevoRol.save();
        console.log(`Rol ${rol.nombre} creado exitosamente`);
      } else {
        console.log(`El rol ${rol.nombre} ya existe`);
      }
    }
    
    console.log('Proceso de población de roles completado');
  } catch (error) {
    console.error('Error al crear roles:', error);
  } finally {
    mongoose.disconnect();
  }
}

// Ejecutar la función
crearRoles();