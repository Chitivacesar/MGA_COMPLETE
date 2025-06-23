const mongoose = require('mongoose');

const profesorHasCursoSchema = new mongoose.Schema({
  profesor: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'Profesor'
  },
  curso: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'Curso'
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('ProfesorHasCurso', profesorHasCursoSchema, 'profesor_has_curso');