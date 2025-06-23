const Privilegio = require('../models/Privilegio');

// GET - Get all privileges
exports.getPrivilegios = async (req, res) => {
  try {
    const privilegios = await Privilegio.find();
    res.json(privilegios);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// GET - Get privilege by ID
exports.getPrivilegioById = async (req, res) => {
  try {
    const privilegio = await Privilegio.findById(req.params.id);
    if (privilegio) {
      res.json(privilegio);
    } else {
      res.status(404).json({ message: 'Privilege not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// POST - Create new privilege
exports.createPrivilegio = async (req, res) => {
  const privilegio = new Privilegio({
    nombre_privilegio: req.body.nombre_privilegio
  });

  try {
    const newPrivilegio = await privilegio.save();
    res.status(201).json(newPrivilegio);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// PUT - Update privilege
exports.updatePrivilegio = async (req, res) => {
  try {
    const privilegio = await Privilegio.findById(req.params.id);
    if (privilegio) {
      privilegio.nombre_privilegio = req.body.nombre_privilegio;
      const updatedPrivilegio = await privilegio.save();
      res.json(updatedPrivilegio);
    } else {
      res.status(404).json({ message: 'Privilege not found' });
    }
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// DELETE - Delete privilege
exports.deletePrivilegio = async (req, res) => {
  try {
    const privilegio = await Privilegio.findById(req.params.id);
    if (privilegio) {
      await privilegio.deleteOne();
      res.json({ message: 'Privilege deleted' });
    } else {
      res.status(404).json({ message: 'Privilege not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};