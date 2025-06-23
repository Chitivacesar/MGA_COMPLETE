const EspecialidadProfesor = require('../models/EspecialidadProfesor');

// GET - Get all teacher specialties
exports.getEspecialidades = async (req, res) => {
  try {
    const especialidades = await EspecialidadProfesor.find();
    res.json(especialidades);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// GET - Get specialty by ID
exports.getEspecialidadById = async (req, res) => {
  try {
    const especialidad = await EspecialidadProfesor.findById(req.params.id);
    if (especialidad) {
      res.json(especialidad);
    } else {
      res.status(404).json({ message: 'Specialty not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// POST - Create new specialty
exports.createEspecialidad = async (req, res) => {
  const especialidad = new EspecialidadProfesor({
    profesor: req.body.profesor,
    especialidad: req.body.especialidad
  });

  try {
    const newEspecialidad = await especialidad.save();
    res.status(201).json(newEspecialidad);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// PUT - Update specialty
exports.updateEspecialidad = async (req, res) => {
  try {
    const especialidad = await EspecialidadProfesor.findById(req.params.id);
    if (especialidad) {
      Object.assign(especialidad, req.body);
      const updatedEspecialidad = await especialidad.save();
      res.json(updatedEspecialidad);
    } else {
      res.status(404).json({ message: 'Specialty not found' });
    }
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// DELETE - Delete specialty
exports.deleteEspecialidad = async (req, res) => {
  try {
    const especialidad = await EspecialidadProfesor.findById(req.params.id);
    if (especialidad) {
      await especialidad.deleteOne();
      res.json({ message: 'Specialty deleted successfully' });
    } else {
      res.status(404).json({ message: 'Specialty not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};