const mongoose = require('mongoose');

const asistenciaSchema = new mongoose.Schema({
  beneficiarioId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'Beneficiario'
  },
  cursoId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'Curso'
  },
  programacionClasesId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'ProgramacionClases'
  },
  estado: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Asistencia', asistenciaSchema);