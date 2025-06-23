const mongoose = require('mongoose');

const claseSchema = new mongoose.Schema({
  cursoId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'Curso'
  },
  profesorId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'Profesor'
  },
  fecha: {
    type: Date,
    required: true
  },
  horaInicio: {
    type: Date,
    required: true
  },
  horaFin: {
    type: Date,
    required: true
  },
  ubicacion: {
    type: String,
    required: true
  }
});

module.exports = mongoose.model('Clase', claseSchema);