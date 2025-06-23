const ProfesorHasCurso = require('../models/ProfesorHasCurso');

// GET - Obtener todas las relaciones profesor-curso
exports.getProfesorHasCursos = async (req, res) => {
  try {
    const profesorHasCursos = await ProfesorHasCurso.find()
      .populate('profesor')
      .populate('curso');
    res.json(profesorHasCursos);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// GET - Obtener una relación profesor-curso por ID
exports.getProfesorHasCursoById = async (req, res) => {
  try {
    const profesorHasCurso = await ProfesorHasCurso.findById(req.params.id)
      .populate('profesor')
      .populate('curso');
    if (profesorHasCurso) {
      res.json(profesorHasCurso);
    } else {
      res.status(404).json({ message: 'Relación profesor-curso no encontrada' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// GET - Obtener cursos por profesor ID
exports.getCursosByProfesorId = async (req, res) => {
  try {
    const cursos = await ProfesorHasCurso.find({ profesor: req.params.profesorId })
      .populate('curso');
    res.json(cursos);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// GET - Obtener profesores por curso ID
exports.getProfesoresByCursoId = async (req, res) => {
  try {
    const profesores = await ProfesorHasCurso.find({ curso: req.params.cursoId })
      .populate('profesor');
    res.json(profesores);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// POST - Crear nueva relación profesor-curso
exports.createProfesorHasCurso = async (req, res) => {
  const profesorHasCurso = new ProfesorHasCurso({
    profesor: req.body.profesor,
    curso: req.body.curso
  });

  try {
    const nuevaRelacion = await profesorHasCurso.save();
    res.status(201).json(nuevaRelacion);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// PUT - Actualizar relación profesor-curso
exports.updateProfesorHasCurso = async (req, res) => {
  try {
    const profesorHasCurso = await ProfesorHasCurso.findById(req.params.id);
    if (profesorHasCurso) {
      Object.assign(profesorHasCurso, req.body);
      const relacionActualizada = await profesorHasCurso.save();
      res.json(relacionActualizada);
    } else {
      res.status(404).json({ message: 'Relación profesor-curso no encontrada' });
    }
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// DELETE - Eliminar relación profesor-curso
exports.deleteProfesorHasCurso = async (req, res) => {
  try {
    const profesorHasCurso = await ProfesorHasCurso.findById(req.params.id);
    if (profesorHasCurso) {
      await profesorHasCurso.deleteOne();
      res.json({ message: 'Relación profesor-curso eliminada' });
    } else {
      res.status(404).json({ message: 'Relación profesor-curso no encontrada' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};