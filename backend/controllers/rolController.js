const Rol = require('../models/rol');
const RolPermisoPrivilegio = require('../models/RolPermisoPrivilegio');

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
      details: `Ya existe un rol con ${field}: "${value}"`
    };
  }

  return {
    message: error.message || 'Error interno del servidor'
  };
};

// GET - Obtener todos los roles
exports.getRoles = async (req, res) => {
  try {
    const roles = await Rol.find()
      .populate('permisos')
      .populate('privilegios')
      .populate({
        path: 'rol_permiso_privilegio',
        populate: [
          { 
            path: 'permisoId',
            select: 'nombre permiso descripcion'
          },
          { 
            path: 'privilegioId',
            select: 'nombre nombre_privilegio descripcion'
          }
        ]
      })
      .sort({ nombre: 1 });

    res.json({ roles });
  } catch (error) {
    console.error('Error al obtener roles:', error);
    res.status(500).json({ message: 'Error al obtener los roles' });
  }
};

// GET - Obtener un rol por ID
exports.getRolById = async (req, res) => {
  try {
    const rol = await Rol.findById(req.params.id)
      .populate('permisos')
      .populate('privilegios')
      .populate({
        path: 'rol_permiso_privilegio',
        populate: [
          { 
            path: 'permisoId',
            select: 'nombre permiso descripcion'
          },
          { 
            path: 'privilegioId',
            select: 'nombre nombre_privilegio descripcion'
          }
        ]
      });

    if (!rol) {
      return res.status(404).json({ message: 'Rol no encontrado' });
    }

    res.json(rol);
  } catch (error) {
    console.error('Error al obtener rol:', error);
    res.status(400).json({ message: 'ID de rol inválido' });
  }
};

// POST - Crear nuevo rol
exports.createRol = async (req, res) => {
  try {
    const { nombre, descripcion, estado, permisos, privilegios } = req.body;

    // Validaciones básicas
    if (!nombre || !descripcion) {
      return res.status(400).json({
        message: 'Faltan campos requeridos',
        details: 'Nombre y descripción son obligatorios'
      });
    }

    // Verificar duplicados
    const rolExistente = await Rol.findOne({ 
      nombre: { $regex: new RegExp(`^${nombre.trim()}$`, 'i') } 
    });

    if (rolExistente) {
      return res.status(400).json({
        message: 'Rol duplicado',
        details: `Ya existe un rol con el nombre "${nombre}"`
      });
    }

    // Crear el rol
    const rol = new Rol({
      nombre: nombre.trim(),
      descripcion: descripcion.trim(),
      estado: Boolean(estado),
      permisos: Array.isArray(permisos) ? permisos : [],
      privilegios: Array.isArray(privilegios) ? privilegios : []
    });

    const nuevoRol = await rol.save();

    // Crear las relaciones rol-permiso-privilegio
    if (Array.isArray(permisos) && Array.isArray(privilegios)) {
      const relaciones = [];
      for (const permisoId of permisos) {
        for (const privilegioId of privilegios) {
          relaciones.push({
            rolId: nuevoRol._id,
            permisoId,
            privilegioId
          });
        }
      }
      await RolPermisoPrivilegio.insertMany(relaciones);
    }

    // Obtener el rol completo con sus relaciones
    const rolCompleto = await Rol.findById(nuevoRol._id)
      .populate('permisos')
      .populate('privilegios')
      .populate({
        path: 'rol_permiso_privilegio',
        populate: [
          { path: 'permisoId' },
          { path: 'privilegioId' }
        ]
      });

    res.status(201).json(rolCompleto);
  } catch (error) {
    console.error('Error al crear rol:', error);
    const errorResponse = handleValidationError(error);
    res.status(400).json(errorResponse);
  }
};

// PUT - Actualizar rol
exports.updateRol = async (req, res) => {
  try {
    const { nombre, descripcion, estado, permisos, privilegios } = req.body;

    const rol = await Rol.findById(req.params.id);
    if (!rol) {
      return res.status(404).json({ message: 'Rol no encontrado' });
    }

    // Verificar nombre duplicado
    if (nombre && nombre.trim().toLowerCase() !== rol.nombre.toLowerCase()) {
      const rolExistente = await Rol.findOne({
        nombre: { $regex: new RegExp(`^${nombre.trim()}$`, 'i') },
        _id: { $ne: req.params.id }
      });

      if (rolExistente) {
        return res.status(400).json({
          message: 'Rol duplicado',
          details: `Ya existe otro rol con el nombre "${nombre}"`
        });
      }
    }

    // Actualizar campos básicos
    if (nombre) rol.nombre = nombre.trim();
    if (descripcion) rol.descripcion = descripcion.trim();
    if (typeof estado === 'boolean') rol.estado = estado;

    // Actualizar permisos y privilegios
    if (Array.isArray(permisos)) rol.permisos = permisos;
    if (Array.isArray(privilegios)) rol.privilegios = privilegios;

    // Guardar cambios en el rol
    const rolActualizado = await rol.save();

    // Actualizar relaciones rol-permiso-privilegio
    if (Array.isArray(permisos) && Array.isArray(privilegios)) {
      // Eliminar relaciones existentes
      await RolPermisoPrivilegio.deleteMany({ rolId: rol._id });

      // Crear nuevas relaciones
      const relaciones = [];
      for (const permisoId of permisos) {
        for (const privilegioId of privilegios) {
          relaciones.push({
            rolId: rol._id,
            permisoId,
            privilegioId
          });
        }
      }
      await RolPermisoPrivilegio.insertMany(relaciones);
    }

    // Obtener rol actualizado con todas sus relaciones
    const rolCompleto = await Rol.findById(rolActualizado._id)
      .populate('permisos')
      .populate('privilegios')
      .populate({
        path: 'rol_permiso_privilegio',
        populate: [
          { path: 'permisoId' },
          { path: 'privilegioId' }
        ]
      });

    res.json(rolCompleto);
  } catch (error) {
    console.error('Error al actualizar rol:', error);
    const errorResponse = handleValidationError(error);
    res.status(400).json(errorResponse);
  }
};

// DELETE - Eliminar rol
exports.deleteRol = async (req, res) => {
  try {
    const rol = await Rol.findById(req.params.id);
    if (!rol) {
      return res.status(404).json({ message: 'Rol no encontrado' });
    }

    // Eliminar relaciones rol-permiso-privilegio
    await RolPermisoPrivilegio.deleteMany({ rolId: rol._id });

    // Eliminar el rol
    await rol.deleteOne();
    res.json({ message: 'Rol eliminado correctamente' });
  } catch (error) {
    console.error('Error al eliminar rol:', error);
    res.status(400).json({ message: 'ID de rol inválido' });
  }
};
