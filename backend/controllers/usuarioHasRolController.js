const UsuarioHasRol = require('../models/UsuarioHasRol');

// GET - Obtener todas las relaciones usuario-rol
exports.getUsuariosHasRoles = async (req, res) => {
  try {
    const relaciones = await UsuarioHasRol.find()
      .populate('usuarioId')
      .populate('rolId');
    res.json(relaciones);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// GET - Obtener una relación por ID
exports.getUsuarioHasRolById = async (req, res) => {
  try {
    const relacion = await UsuarioHasRol.findById(req.params.id)
      .populate('usuarioId')
      .populate('rolId');
    if (relacion) {
      res.json(relacion);
    } else {
      res.status(404).json({ message: 'Relación usuario-rol no encontrada' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// POST - Crear nueva relación usuario-rol
exports.createUsuarioHasRol = async (req, res) => {
  const nuevaRelacion = new UsuarioHasRol({
    usuarioId: req.body.usuarioId,
    rolId: req.body.rolId
  });

  try {
    const guardado = await nuevaRelacion.save();
    res.status(201).json(guardado);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// PUT - Actualizar relación usuario-rol
exports.updateUsuarioHasRol = async (req, res) => {
  try {
    const relacion = await UsuarioHasRol.findById(req.params.id);
    if (relacion) {
      Object.assign(relacion, req.body);
      const actualizada = await relacion.save();
      res.json(actualizada);
    } else {
      res.status(404).json({ message: 'Relación usuario-rol no encontrada' });
    }
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// DELETE - Eliminar relación usuario-rol
exports.deleteUsuarioHasRol = async (req, res) => {
  try {
    const relacion = await UsuarioHasRol.findById(req.params.id);
    if (relacion) {
      await relacion.deleteOne();
      res.json({ message: 'Relación eliminada' });
    } else {
      res.status(404).json({ message: 'Relación no encontrada' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
