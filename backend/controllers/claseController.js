const Clase = require('../models/Clase');

// GET - Get all classes
exports.getClases = async (req, res) => {
  try {
    const clases = await Clase.find();
    res.json(clases);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// GET - Get class by ID
exports.getClaseById = async (req, res) => {
  try {
    const clase = await Clase.findById(req.params.id);
    if (clase) {
      res.json(clase);
    } else {
      res.status(404).json({ message: 'Class not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// POST - Create new class
exports.createClase = async (req, res) => {
  const clase = new Clase({
    cursoId: req.body.cursoId,
    profesorId: req.body.profesorId,
    fecha: req.body.fecha,
    horaInicio: req.body.horaInicio,
    horaFin: req.body.horaFin,
    ubicacion: req.body.ubicacion
  });

  try {
    const newClase = await clase.save();
    res.status(201).json(newClase);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// PUT - Update class
exports.updateClase = async (req, res) => {
  try {
    const clase = await Clase.findById(req.params.id);
    if (clase) {
      Object.assign(clase, req.body);
      const updatedClase = await clase.save();
      res.json(updatedClase);
    } else {
      res.status(404).json({ message: 'Class not found' });
    }
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// DELETE - Delete class
exports.deleteClase = async (req, res) => {
  try {
    const clase = await Clase.findById(req.params.id);
    if (clase) {
      await clase.deleteOne();
      res.json({ message: 'Class deleted' });
    } else {
      res.status(404).json({ message: 'Class not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};