const mongoose = require('mongoose');

const grupoSchema = new mongoose.Schema({
  profesor: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'Profesor'
  },
  beneficiario: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'Beneficiario'
  },
  asignacionGrupoId: {
    type: String,
    required: true
  },
  estado: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Grupo', grupoSchema);