const Profesor = require('../models/profesor');
const Usuario = require('../models/usuario');

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
      especialidades,
      estado,
      contrasena
    } = req.body;

    // Validar campos requeridos según el modelo
    if (!nombres || !apellidos || !tipoDocumento || !identificacion || !telefono || !correo || !especialidades || !contrasena) {
      return res.status(400).json({
        message: 'Faltan campos requeridos',
        details: 'nombres, apellidos, tipoDocumento, identificacion, telefono, correo, especialidades y contrasena son obligatorios'
      });
    }

    // Validar especialidades
    if (!Array.isArray(especialidades) || especialidades.length < 1 || especialidades.length > 10) {
      return res.status(400).json({
        message: 'Especialidades inválidas',
        details: 'Debe proporcionar entre 1 y 10 especialidades en formato array'
      });
    }
    if (!especialidades.every(esp => typeof esp === 'string' && esp.length >= 2 && esp.length <= 100)) {
      return res.status(400).json({
        message: 'Especialidades inválidas',
        details: 'Cada especialidad debe tener entre 2 y 100 caracteres'
      });
    }

    // Verificar si ya existe un profesor con ese correo
    const profesorExistente = await Profesor.findOne({ correo: correo.toLowerCase().trim() });
    if (profesorExistente) {
      return res.status(400).json({
        message: 'Profesor duplicado',
        details: `Ya existe un profesor con el correo "${correo}"`
      });
    }

    // Verificar si ya existe un profesor con esa identificación
    const profesorExistenteId = await Profesor.findOne({ identificacion: identificacion.toString().trim() });
    if (profesorExistenteId) {
      return res.status(400).json({
        message: 'Profesor duplicado',
        details: `Ya existe un profesor con la identificación "${identificacion}"`
      });
    }

    // Crear el profesor
    const profesorData = {
      nombres: nombres.trim(),
      apellidos: apellidos.trim(),
      tipoDocumento,
      identificacion: identificacion.toString().trim(),
      telefono: telefono.trim(),
      correo: correo.toLowerCase().trim(),
      especialidades: especialidades.map(esp => esp.trim()),
      estado: estado || 'Activo'
    };
    if (direccion && direccion.trim()) {
      profesorData.direccion = direccion.trim();
    }
    const profesor = new Profesor(profesorData);
    const nuevoProfesor = await profesor.save();

    // Crear el usuario asociado
    const usuarioData = {
      nombre: nombres.trim(),
      apellido: apellidos.trim(),
      correo: correo.toLowerCase().trim(),
      contrasena,
      rol: 'profesor',
      estado: true,
      tipo_de_documento: tipoDocumento,
      documento: identificacion.toString().trim()
    };
    const usuario = new Usuario(usuarioData);
    await usuario.save();

    res.status(201).json({
      message: 'Profesor y usuario creados correctamente',
      profesor: nuevoProfesor
    });
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
      usuarioId,
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
    if (usuarioId !== undefined) {
      if (!usuarioId.match(/^[0-9a-fA-F]{24}$/)) {
        return res.status(400).json({
          message: 'usuarioId inválido',
          details: 'usuarioId debe ser un ObjectId válido de MongoDB'
        });
      }
      datosActualizacion.usuarioId = usuarioId;
    }
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
      if (!Array.isArray(especialidades) || especialidades.length < 1 || especialidades.length > 10) {
        return res.status(400).json({
          message: 'Especialidades inválidas',
          details: 'Debe proporcionar entre 1 y 10 especialidades en formato array'
        });
      }
      if (!especialidades.every(esp => typeof esp === 'string' && esp.length >= 2 && esp.length <= 100)) {
        return res.status(400).json({
          message: 'Especialidades inválidas',
          details: 'Cada especialidad debe tener entre 2 y 100 caracteres'
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