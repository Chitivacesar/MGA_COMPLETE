const Aula = require('../models/Aula');

// GET - Get all classrooms
exports.getAulas = async (req, res) => {
  try {
    const aulas = await Aula.find();
    res.json(aulas);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// GET - Get classroom by ID
exports.getAulaById = async (req, res) => {
  try {
    const aula = await Aula.findById(req.params.id);
    if (aula) {
      res.json(aula);
    } else {
      res.status(404).json({ message: 'Classroom not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// POST - Create new classroom
exports.createAula = async (req, res) => {
  const aula = new Aula({
    numeroAula: req.body.numeroAula,
    capacidad: req.body.capacidad,
    estado: req.body.estado
  });

  try {
    const newAula = await aula.save();
    res.status(201).json(newAula);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// PUT - Update classroom
exports.updateAula = async (req, res) => {
  try {
    const aula = await Aula.findById(req.params.id);
    if (aula) {
      Object.assign(aula, req.body);
      const updatedAula = await aula.save();
      res.json(updatedAula);
    } else {
      res.status(404).json({ message: 'Classroom not found' });
    }
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// DELETE - Delete classroom
exports.deleteAula = async (req, res) => {
  try {
    const aula = await Aula.findById(req.params.id);
    if (aula) {
      await aula.deleteOne();
      res.json({ message: 'Classroom deleted' });
    } else {
      res.status(404).json({ message: 'Classroom not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};