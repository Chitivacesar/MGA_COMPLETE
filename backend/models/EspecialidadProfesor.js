const mongoose = require('mongoose');

const especialidadProfesorSchema = new mongoose.Schema({
  profesor: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'Profesor'
  },
  especialidad: {
    type: String,
    required: true
  }
}, {
  timestamps: true,
  collection: 'especialidades_de_profesores' // Forzar el nombre exacto de la colección
});

// Asegurar que use exactamente el nombre de colección que especificamos
module.exports = mongoose.model('EspecialidadProfesor', especialidadProfesorSchema, 'especialidades_de_profesores');