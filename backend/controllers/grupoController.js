const Grupo = require('../models/Grupo');

// GET - Get all groups
exports.getGrupos = async (req, res) => {
  try {
    const grupos = await Grupo.find()
      .populate('profesor')
      .populate('beneficiario');
    res.json(grupos);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// GET - Get group by ID
exports.getGrupoById = async (req, res) => {
  try {
    const grupo = await Grupo.findById(req.params.id)
      .populate('profesor')
      .populate('beneficiario');
    if (grupo) {
      res.json(grupo);
    } else {
      res.status(404).json({ message: 'Group not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// POST - Create new group
exports.createGrupo = async (req, res) => {
  const grupo = new Grupo({
    profesor: req.body.profesor,
    beneficiario: req.body.beneficiario,
    asignacionGrupoId: req.body.asignacionGrupoId,
    estado: req.body.estado
  });

  try {
    const newGrupo = await grupo.save();
    res.status(201).json(newGrupo);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// PUT - Update group
exports.updateGrupo = async (req, res) => {
  try {
    const grupo = await Grupo.findById(req.params.id);
    if (grupo) {
      Object.assign(grupo, req.body);
      const updatedGrupo = await grupo.save();
      res.json(updatedGrupo);
    } else {
      res.status(404).json({ message: 'Group not found' });
    }
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// DELETE - Delete group
exports.deleteGrupo = async (req, res) => {
  try {
    const grupo = await Grupo.findById(req.params.id);
    if (grupo) {
      await grupo.deleteOne();
      res.json({ message: 'Group deleted successfully' });
    } else {
      res.status(404).json({ message: 'Group not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};