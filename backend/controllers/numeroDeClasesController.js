const NumeroDeClases = require('../models/NumeroDeClases');

// GET - Get all class numbers
exports.getNumeroDeClases = async (req, res) => {
  try {
    const numeroDeClases = await NumeroDeClases.find();
    res.json(numeroDeClases);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// GET - Get class number by ID
exports.getNumeroDeClasesById = async (req, res) => {
  try {
    const numeroDeClases = await NumeroDeClases.findById(req.params.id);
    if (numeroDeClases) {
      res.json(numeroDeClases);
    } else {
      res.status(404).json({ message: 'Class number not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// POST - Create new class number
exports.createNumeroDeClases = async (req, res) => {
  const numeroDeClases = new NumeroDeClases({
    numero_de_clases: req.body.numero_de_clases
  });

  try {
    const newNumeroDeClases = await numeroDeClases.save();
    res.status(201).json(newNumeroDeClases);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// PUT - Update class number
exports.updateNumeroDeClases = async (req, res) => {
  try {
    const numeroDeClases = await NumeroDeClases.findById(req.params.id);
    if (numeroDeClases) {
      numeroDeClases.numero_de_clases = req.body.numero_de_clases;
      const updatedNumeroDeClases = await numeroDeClases.save();
      res.json(updatedNumeroDeClases);
    } else {
      res.status(404).json({ message: 'Class number not found' });
    }
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// DELETE - Delete class number
exports.deleteNumeroDeClases = async (req, res) => {
  try {
    const numeroDeClases = await NumeroDeClases.findById(req.params.id);
    if (numeroDeClases) {
      await numeroDeClases.deleteOne();
      res.json({ message: 'Class number deleted successfully' });
    } else {
      res.status(404).json({ message: 'Class number not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};