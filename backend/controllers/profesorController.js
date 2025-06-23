const Profesor = require('../models/profesor');

// Función auxiliar para manejar errores de validación de Mongoose
const handleValidationError = (error) => {
  if (error.name === 'ValidationError') {
    const messages = Object.values(error.errors).map(err => err.message);
    return {
      message: 'Error de validación',
      errors: messages,
      details: messages.join(', ')
    };
  }
  
  if (error.code === 11000) {
    const field = Object.keys(error.keyValue)[0];
    const value = error.keyValue[field];
    return {
      message: 'Datos duplicados',
      details: `Ya existe un profesor con ${field}: "${value}"`
    };
  }
  
  return {
    message: error.message || 'Error interno del servidor'
  };
};

// GET - Obtener todos los profesores
exports.getProfesores = async (req, res) => {
  try {
    const profesores = await Profesor.find().sort({ nombres: 1 });
    res.json(profesores);
  } catch (error) {
    console.error('Error al obtener profesores:', error);
    res.status(500).json({ message: 'Error al obtener los profesores' });
  }
};

// GET - Obtener un profesor por ID
exports.getProfesorById = async (req, res) => {
  try {
    const profesor = await Profesor.findById(req.params.id);
    if (profesor) {
      res.json(profesor);
    } else {
      res.status(404).json({ message: 'Profesor no encontrado' });
    }
  } catch (error) {
    console.error('Error al obtener profesor:', error);
    if (error.name === 'CastError') {
      res.status(400).json({ message: 'ID de profesor inválido' });
    } else {
      res.status(500).json({ message: 'Error al obtener el profesor' });
    }
  }
};

// POST - Crear nuevo profesor
exports.createProfesor = async (req, res) => {
  try {
    console.log('Datos recibidos en el controlador:', req.body);
    
    const { 
      nombres, 
      apellidos, 
      tipoDocumento, 
      identificacion, 
      telefono, 
      direccion, 
      correo, 
      contraseña, 
      confirmacionContraseña, 
      especialidades, 
      estado
    } = req.body;
    
    // Validar campos requeridos básicos (según el modelo flexible)
    if (!nombres || !apellidos || !tipoDocumento || !identificacion || 
        !telefono || !correo || !especialidades) {
      return res.status(400).json({
        message: 'Faltan campos requeridos',
        details: 'nombres, apellidos, tipoDocumento, identificacion, telefono, correo y especialidades son obligatorios'
      });
    }

    // Validar contraseñas
    if (!contraseña || !confirmacionContraseña) {
      return res.status(400).json({
        message: 'Contraseñas requeridas',
        details: 'La contraseña y su confirmación son obligatorias'
      });
    }

    if (contraseña !== confirmacionContraseña) {
      return res.status(400).json({
        message: 'Las contraseñas no coinciden'
      });
    }

    // Verificar si ya existe un profesor con ese correo
    const profesorExistente = await Profesor.findOne({ 
      correo: correo.toLowerCase().trim()
    });
    
    if (profesorExistente) {
      return res.status(400).json({
        message: 'Profesor duplicado',
        details: `Ya existe un profesor con el correo "${correo}"`
      });
    }

    // Verificar si ya existe un profesor con esa identificación
    const profesorExistenteId = await Profesor.findOne({ 
      identificacion: identificacion.toString().trim()
    });
    
    if (profesorExistenteId) {
      return res.status(400).json({
        message: 'Profesor duplicado',
        details: `Ya existe un profesor con la identificación "${identificacion}"`
      });
    }

    // Validar especialidades
    if (!Array.isArray(especialidades) || especialidades.length === 0) {
      return res.status(400).json({
        message: 'Especialidades inválidas',
        details: 'Debe proporcionar al menos una especialidad en formato array'
      });
    }

    if (especialidades.length > 10) {
      return res.status(400).json({
        message: 'Demasiadas especialidades',
        details: 'No puede tener más de 10 especialidades'
      });
    }

    // 1. Crear el usuario primero
    const Usuario = require('../models/usuario');
    const bcrypt = require('bcryptjs');

    // Encriptar contraseña
    const salt = await bcrypt.genSalt(10);
    const contrasenaHash = await bcrypt.hash(contraseña, salt);

    const nuevoUsuario = new Usuario({
      correo: correo.toLowerCase().trim(),
      contrasena: contrasenaHash,
      confirmacionContrasena: contrasenaHash,
      apellido: apellidos.trim(),
      nombre: nombres.trim(),
      documento: identificacion.toString().trim(),
      estado: true
    });
    
    const usuarioCreado = await nuevoUsuario.save();

    // 2. Crear el profesor
    const profesorData = {
      nombres: nombres.trim(),
      apellidos: apellidos.trim(),
      tipoDocumento,
      identificacion: identificacion.toString().trim(),
      telefono: telefono.trim(),
      correo: correo.toLowerCase().trim(),
      contraseña,
      confirmacionContraseña,
      especialidades: especialidades.map(esp => esp.trim()),
      estado: estado || 'Activo'
    };

    if (direccion && direccion.trim()) {
      profesorData.direccion = direccion.trim();
    }

    const profesor = new Profesor(profesorData);
    const nuevoProfesor = await profesor.save();
    
    // 3. Buscar el ID del rol 'profesor'
    const Rol = require('../models/rol');
    const rolProfesor = await Rol.findOne({ nombre: 'Profesor' });
    
    if (!rolProfesor) {
      throw new Error('No se encontró el rol de profesor');
    }

    // 4. Crear la relación usuario-rol
    const UsuarioHasRol = require('../models/UsuarioHasRol');
    const nuevaRelacion = new UsuarioHasRol({
      usuarioId: usuarioCreado._id,
      rolId: rolProfesor._id
    });

    await nuevaRelacion.save();
    
    res.status(201).json(nuevoProfesor);
    
  } catch (error) {
    console.error('Error al crear profesor:', error);
    const errorResponse = handleValidationError(error);
    res.status(400).json(errorResponse);
  }
};

// PUT - Actualizar profesor
exports.updateProfesor = async (req, res) => {
  try {
    const profesor = await Profesor.findById(req.params.id);
    if (!profesor) {
      return res.status(404).json({ message: 'Profesor no encontrado' });
    }

    // Extraer datos de actualización
    const { 
      confirmacionContraseña, 
      contraseña,
      especialidades,
      identificacion,
      correo,
      nombres,
      apellidos,
      tipoDocumento,
      telefono,
      direccion,
      estado
    } = req.body;

    // Crear objeto con datos de actualización
    const datosActualizacion = {};

    // Validar y agregar campos básicos
    if (nombres !== undefined) {
      if (!nombres || !nombres.trim()) {
        return res.status(400).json({
          message: 'Nombre inválido',
          details: 'El nombre no puede estar vacío'
        });
      }
      datosActualizacion.nombres = nombres.trim();
    }

    if (apellidos !== undefined) {
      if (!apellidos || !apellidos.trim()) {
        return res.status(400).json({
          message: 'Apellidos inválidos',
          details: 'Los apellidos no pueden estar vacíos'
        });
      }
      datosActualizacion.apellidos = apellidos.trim();
    }

    if (tipoDocumento !== undefined) {
      datosActualizacion.tipoDocumento = tipoDocumento;
    }

    if (telefono !== undefined) {
      if (!telefono || !telefono.trim()) {
        return res.status(400).json({
          message: 'Teléfono inválido',
          details: 'El teléfono no puede estar vacío'
        });
      }
      datosActualizacion.telefono = telefono.trim();
    }

    if (direccion !== undefined) {
      datosActualizacion.direccion = direccion ? direccion.trim() : '';
    }

    if (estado !== undefined) {
      datosActualizacion.estado = estado;
    }

    // Validar contraseñas si se proporcionan
    if (contraseña !== undefined || confirmacionContraseña !== undefined) {
      if (!contraseña || !confirmacionContraseña) {
        return res.status(400).json({
          message: 'Contraseñas incompletas',
          details: 'Debe proporcionar tanto la contraseña como su confirmación'
        });
      }
      
      if (contraseña !== confirmacionContraseña) {
        return res.status(400).json({ 
          message: 'Las contraseñas no coinciden' 
        });
      }
      datosActualizacion.contraseña = contraseña;
    }

    // Si se está actualizando el correo, verificar que no exista otro con ese correo
    if (correo !== undefined) {
      if (!correo || !correo.trim()) {
        return res.status(400).json({
          message: 'Correo inválido',
          details: 'El correo no puede estar vacío'
        });
      }

      const correoLimpio = correo.toLowerCase().trim();
      if (correoLimpio !== profesor.correo) {
        const profesorExistente = await Profesor.findOne({ 
          correo: correoLimpio,
          _id: { $ne: req.params.id }
        });
        
        if (profesorExistente) {
          return res.status(400).json({
            message: 'Correo duplicado',
            details: `Ya existe otro profesor con el correo "${correo}"`
          });
        }
      }
      datosActualizacion.correo = correoLimpio;
    }

    // Si se está actualizando la identificación, verificar que no exista otra con esa identificación
    if (identificacion !== undefined) {
      if (!identificacion) {
        return res.status(400).json({
          message: 'Identificación inválida',
          details: 'La identificación no puede estar vacía'
        });
      }

      const identificacionLimpia = identificacion.toString().trim();
      if (identificacionLimpia !== profesor.identificacion) {
        const profesorExistenteId = await Profesor.findOne({ 
          identificacion: identificacionLimpia,
          _id: { $ne: req.params.id }
        });
        
        if (profesorExistenteId) {
          return res.status(400).json({
            message: 'Identificación duplicada',
            details: `Ya existe otro profesor con la identificación "${identificacion}"`
          });
        }
      }
      datosActualizacion.identificacion = identificacionLimpia;
    }

    // Validar especialidades si se están actualizando
    if (especialidades !== undefined) {
      if (!Array.isArray(especialidades) || especialidades.length === 0) {
        return res.status(400).json({
          message: 'Especialidades inválidas',
          details: 'Debe proporcionar al menos una especialidad en formato array'
        });
      }
      
      if (especialidades.length > 10) {
        return res.status(400).json({
          message: 'Demasiadas especialidades',
          details: 'No puede tener más de 10 especialidades'
        });
      }
      
      datosActualizacion.especialidades = especialidades.map(esp => esp.trim());
    }

    // Aplicar actualizaciones
    Object.assign(profesor, datosActualizacion);
    const profesorActualizado = await profesor.save();
    res.json(profesorActualizado);
    
  } catch (error) {
    console.error('Error al actualizar profesor:', error);
    if (error.name === 'CastError') {
      res.status(400).json({ message: 'ID de profesor inválido' });
    } else {
      const errorResponse = handleValidationError(error);
      res.status(400).json(errorResponse);
    }
  }
};

// DELETE - Eliminar profesor
exports.deleteProfesor = async (req, res) => {
  try {
    const profesor = await Profesor.findById(req.params.id);
    if (!profesor) {
      return res.status(404).json({ message: 'Profesor no encontrado' });
    }

    await profesor.deleteOne();
    res.json({ message: 'Profesor eliminado correctamente' });
    
  } catch (error) {
    console.error('Error al eliminar profesor:', error);
    if (error.name === 'CastError') {
      res.status(400).json({ message: 'ID de profesor inválido' });
    } else {
      res.status(500).json({ message: 'Error al eliminar el profesor' });
    }
  }
};

// GET - Buscar profesores por especialidad
exports.getProfesorByEspecialidad = async (req, res) => {
  try {
    const { especialidad } = req.params;
    const profesores = await Profesor.find({ 
      especialidades: { $in: [especialidad] },
      estado: 'Activo'
    }).sort({ nombres: 1 });
    
    res.json(profesores);
  } catch (error) {
    console.error('Error al buscar profesores por especialidad:', error);
    res.status(500).json({ message: 'Error al buscar profesores por especialidad' });
  }
};

// GET - Buscar profesores por estado
exports.getProfesorByEstado = async (req, res) => {
  try {
    const { estado } = req.params;
    const profesores = await Profesor.find({ estado }).sort({ nombres: 1 });
    res.json(profesores);
  } catch (error) {
    console.error('Error al buscar profesores por estado:', error);
    res.status(500).json({ message: 'Error al buscar profesores por estado' });
  }
};

// PATCH - Cambiar estado del profesor
exports.cambiarEstadoProfesor = async (req, res) => {
  try {
    const { estado } = req.body;
    
    if (!estado || !['Activo', 'Inactivo', 'Pendiente', 'Suspendido'].includes(estado)) {
      return res.status(400).json({
        message: 'Estado inválido',
        details: 'El estado debe ser: Activo, Inactivo, Pendiente o Suspendido'
      });
    }

    const profesor = await Profesor.findByIdAndUpdate(
      req.params.id,
      { estado },
      { new: true }
    );

    if (!profesor) {
      return res.status(404).json({ message: 'Profesor no encontrado' });
    }

    res.json({
      message: `Estado del profesor cambiado a ${estado}`,
      profesor
    });
    
  } catch (error) {
    console.error('Error al cambiar estado del profesor:', error);
    if (error.name === 'CastError') {
      res.status(400).json({ message: 'ID de profesor inválido' });
    } else {
      res.status(500).json({ message: 'Error al cambiar el estado del profesor' });
    }
  }
};