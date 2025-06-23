const Curso = require('../models/Curso');

// GET - Get all courses
exports.getCursos = async (req, res) => {
  try {
    const cursos = await Curso.find();
    res.json(cursos);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// GET - Get course by ID
exports.getCursoById = async (req, res) => {
  try {
    const curso = await Curso.findById(req.params.id);
    if (curso) {
      res.json(curso);
    } else {
      res.status(404).json({ message: 'Course not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// POST - Create new course
exports.createCurso = async (req, res) => {
  const curso = new Curso({
    nombre: req.body.nombre,
    descripcion: req.body.descripcion,
    valor_por_hora: req.body.valor_por_hora,
    estado: req.body.estado
  });

  try {
    const newCurso = await curso.save();
    res.status(201).json(newCurso);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// PUT - Update course
exports.updateCurso = async (req, res) => {
  try {
    const curso = await Curso.findById(req.params.id);
    if (curso) {
      Object.assign(curso, req.body);
      const updatedCurso = await curso.save();
      res.json(updatedCurso);
    } else {
      res.status(404).json({ message: 'Course not found' });
    }
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// DELETE - Delete course
exports.deleteCurso = async (req, res) => {
  try {
    const curso = await Curso.findById(req.params.id);
    if (curso) {
      await curso.deleteOne();
      res.json({ message: 'Course deleted successfully' });
    } else {
      res.status(404).json({ message: 'Course not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};