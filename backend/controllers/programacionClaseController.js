const ProgramacionClase = require('../models/ProgramacionClase');

// GET - Obtener todas las programaciones
exports.getProgramaciones = async (req, res) => {
  try {
    const programaciones = await ProgramacionClase.find();
    res.json(programaciones);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// GET - Obtener programación por ID
exports.getProgramacionById = async (req, res) => {
  try {
    const programacion = await ProgramacionClase.findById(req.params.id);
    if (programacion) {
      res.json(programacion);
    } else {
      res.status(404).json({ message: 'Programación no encontrada' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// POST - Crear nueva programación
exports.createProgramacion = async (req, res) => {
  const programacion = new ProgramacionClase(req.body);
  try {
    const nuevaProgramacion = await programacion.save();
    res.status(201).json(nuevaProgramacion);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// PUT - Actualizar programación
exports.updateProgramacion = async (req, res) => {
  try {
    const programacion = await ProgramacionClase.findById(req.params.id);
    if (programacion) {
      Object.assign(programacion, req.body);
      const programacionActualizada = await programacion.save();
      res.json(programacionActualizada);
    } else {
      res.status(404).json({ message: 'Programación no encontrada' });
    }
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// DELETE - Eliminar programación
exports.deleteProgramacion = async (req, res) => {
  try {
    const programacion = await ProgramacionClase.findById(req.params.id);
    if (programacion) {
      await programacion.deleteOne();
      res.json({ message: 'Programación eliminada' });
    } else {
      res.status(404).json({ message: 'Programación no encontrada' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};