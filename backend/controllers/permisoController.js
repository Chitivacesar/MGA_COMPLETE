const Permiso = require('../models/Permiso');

// GET - Get all permissions
exports.getPermisos = async (req, res) => {
  try {
    const permisos = await Permiso.find();
    res.json(permisos);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// GET - Get permission by ID
exports.getPermisoById = async (req, res) => {
  try {
    const permiso = await Permiso.findById(req.params.id);
    if (permiso) {
      res.json(permiso);
    } else {
      res.status(404).json({ message: 'Permission not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// POST - Create new permission
exports.createPermiso = async (req, res) => {
  const permiso = new Permiso({
    permiso: req.body.permiso
  });

  try {
    const newPermiso = await permiso.save();
    res.status(201).json(newPermiso);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// PUT - Update permission
exports.updatePermiso = async (req, res) => {
  try {
    const permiso = await Permiso.findById(req.params.id);
    if (permiso) {
      permiso.permiso = req.body.permiso;
      const updatedPermiso = await permiso.save();
      res.json(updatedPermiso);
    } else {
      res.status(404).json({ message: 'Permission not found' });
    }
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// DELETE - Delete permission
exports.deletePermiso = async (req, res) => {
  try {
    const permiso = await Permiso.findById(req.params.id);
    if (permiso) {
      await permiso.deleteOne();
      res.json({ message: 'Permission deleted successfully' });
    } else {
      res.status(404).json({ message: 'Permission not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};