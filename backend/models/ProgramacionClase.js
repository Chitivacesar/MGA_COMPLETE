const mongoose = require('mongoose');

const programacionClaseSchema = new mongoose.Schema({
  fecha: {
    type: Date,
    required: true
  },
  hora_inicio: {
    type: Date,
    required: true
  },
  hora_fin: {
    type: Date,
    required: true
  },
  estado: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('ProgramacionClase', programacionClaseSchema,'programacion_de_clases');