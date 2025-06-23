const RolPermisoPrivilegio = require('../models/RolPermisoPrivilegio');
const Rol = require('../models/rol');
const Permiso = require('../models/Permiso');
const Privilegio = require('../models/Privilegio');

// GET - Get all rol-permiso-privilegio relationships
exports.getRolPermisoPrivilegios = async (req, res) => {
  try {
    const relationships = await RolPermisoPrivilegio.find()
      .populate('rolId', 'nombre')
      .populate('permisoId', 'nombre')
      .populate('privilegioId', 'nombre_privilegio');
    res.json(relationships);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// GET - Get rol-permiso-privilegio by ID
exports.getRolPermisoPrivilegioById = async (req, res) => {
  try {
    const relationship = await RolPermisoPrivilegio.findById(req.params.id)
      .populate('rolId', 'nombre')
      .populate('permisoId', 'nombre')
      .populate('privilegioId', 'nombre_privilegio');
    if (relationship) {
      res.json(relationship);
    } else {
      res.status(404).json({ message: 'Relationship not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// POST - Create new rol-permiso-privilegio relationship
exports.createRolPermisoPrivilegio = async (req, res) => {
  try {
    // Validate that all referenced documents exist
    const [rol, permiso, privilegio] = await Promise.all([
      Rol.findById(req.body.rolId),
      Permiso.findById(req.body.permisoId),
      Privilegio.findById(req.body.privilegioId)
    ]);

    if (!rol || !permiso || !privilegio) {
      return res.status(400).json({ 
        message: 'One or more referenced documents do not exist' 
      });
    }

    const relationship = new RolPermisoPrivilegio({
      rolId: req.body.rolId,
      permisoId: req.body.permisoId,
      privilegioId: req.body.privilegioId
    });

    const newRelationship = await relationship.save();
    res.status(201).json(newRelationship);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// PUT - Update rol-permiso-privilegio relationship
exports.updateRolPermisoPrivilegio = async (req, res) => {
  try {
    // Validate that all referenced documents exist if they are being updated
    if (req.body.rolId || req.body.permisoId || req.body.privilegioId) {
      const [rol, permiso, privilegio] = await Promise.all([
        req.body.rolId ? Rol.findById(req.body.rolId) : Promise.resolve(true),
        req.body.permisoId ? Permiso.findById(req.body.permisoId) : Promise.resolve(true),
        req.body.privilegioId ? Privilegio.findById(req.body.privilegioId) : Promise.resolve(true)
      ]);

      if (!rol || !permiso || !privilegio) {
        return res.status(400).json({ 
          message: 'One or more referenced documents do not exist' 
        });
      }
    }

    const relationship = await RolPermisoPrivilegio.findById(req.params.id);
    if (relationship) {
      if (req.body.rolId) relationship.rolId = req.body.rolId;
      if (req.body.permisoId) relationship.permisoId = req.body.permisoId;
      if (req.body.privilegioId) relationship.privilegioId = req.body.privilegioId;

      const updatedRelationship = await relationship.save();
      res.json(updatedRelationship);
    } else {
      res.status(404).json({ message: 'Relationship not found' });
    }
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// DELETE - Delete rol-permiso-privilegio relationship
exports.deleteRolPermisoPrivilegio = async (req, res) => {
  try {
    const relationship = await RolPermisoPrivilegio.findById(req.params.id);
    if (relationship) {
      await relationship.deleteOne();
      res.json({ message: 'Relationship deleted successfully' });
    } else {
      res.status(404).json({ message: 'Relationship not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};