const Asistencia = require('../models/Asistencia');

// GET - Obtener todas las asistencias
exports.getAsistencias = async (req, res) => {
  try {
    const asistencias = await Asistencia.find();
    res.json(asistencias);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// GET - Obtener una asistencia por ID
exports.getAsistenciaById = async (req, res) => {
  try {
    const asistencia = await Asistencia.findById(req.params.id);
    if (asistencia) {
      res.json(asistencia);
    } else {
      res.status(404).json({ message: 'Asistencia no encontrada' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// POST - Crear nueva asistencia
exports.createAsistencia = async (req, res) => {
  const asistencia = new Asistencia({
    beneficiarioId: req.body.beneficiarioId,
    cursoId: req.body.cursoId,
    programacionClasesId: req.body.programacionClasesId,
    estado: req.body.estado
  });

  try {
    const nuevaAsistencia = await asistencia.save();
    res.status(201).json(nuevaAsistencia);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// PUT - Actualizar asistencia
exports.updateAsistencia = async (req, res) => {
  try {
    const asistencia = await Asistencia.findById(req.params.id);
    if (asistencia) {
      Object.assign(asistencia, req.body);
      const asistenciaActualizada = await asistencia.save();
      res.json(asistenciaActualizada);
    } else {
      res.status(404).json({ message: 'Asistencia no encontrada' });
    }
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// DELETE - Eliminar asistencia
exports.deleteAsistencia = async (req, res) => {
  try {
    const asistencia = await Asistencia.findById(req.params.id);
    if (asistencia) {
      await asistencia.deleteOne();
      res.json({ message: 'Asistencia eliminada' });
    } else {
      res.status(404).json({ message: 'Asistencia no encontrada' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};