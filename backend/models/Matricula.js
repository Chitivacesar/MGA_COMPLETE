const mongoose = require('mongoose');

const matriculaSchema = new mongoose.Schema({
  fechaInicio: {
    type: Date,
    required: true
  },
  fechaFin: {
    type: Date,
    required: true
  },
  valorMatricula: {
    type: Number,
    required: true
  },
  estado: {
    type: Boolean,
    default: true
  }
});

module.exports = mongoose.model('Matricula', matriculaSchema);