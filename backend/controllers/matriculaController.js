const Matricula = require('../models/Matricula');

// GET - Get all enrollments
exports.getMatriculas = async (req, res) => {
  try {
    const matriculas = await Matricula.find();
    res.json(matriculas);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// GET - Get enrollment by ID
exports.getMatriculaById = async (req, res) => {
  try {
    const matricula = await Matricula.findById(req.params.id);
    if (matricula) {
      res.json(matricula);
    } else {
      res.status(404).json({ message: 'Enrollment not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// POST - Create new enrollment
exports.createMatricula = async (req, res) => {
  const matricula = new Matricula({
    fechaInicio: req.body.fechaInicio,
    fechaFin: req.body.fechaFin,
    valorMatricula: req.body.valorMatricula,
    estado: req.body.estado
  });

  try {
    const newMatricula = await matricula.save();
    res.status(201).json(newMatricula);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// PUT - Update enrollment
exports.updateMatricula = async (req, res) => {
  try {
    const matricula = await Matricula.findById(req.params.id);
    if (matricula) {
      Object.assign(matricula, req.body);
      const updatedMatricula = await matricula.save();
      res.json(updatedMatricula);
    } else {
      res.status(404).json({ message: 'Enrollment not found' });
    }
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// DELETE - Delete enrollment
exports.deleteMatricula = async (req, res) => {
  try {
    const matricula = await Matricula.findById(req.params.id);
    if (matricula) {
      await matricula.deleteOne();
      res.json({ message: 'Enrollment deleted successfully' });
    } else {
      res.status(404).json({ message: 'Enrollment not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};