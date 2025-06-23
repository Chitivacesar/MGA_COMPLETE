const mongoose = require('mongoose');

const cursoSchema = new mongoose.Schema({
  nombre: {
    type: String,
    required: true
  },
  descripcion: {
    type: String,
    required: true
  },
  valor_por_hora: {
    type: Number,
    required: true
  },
  estado: {
    type: Boolean,
    default: true
  }
});

module.exports = mongoose.model('Curso', cursoSchema);