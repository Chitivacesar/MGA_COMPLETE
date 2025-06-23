const mongoose = require('mongoose');

const ventaSchema = new mongoose.Schema({
  tipo: {
    type: String,
    required: true,
    trim: true
  },
  fechaInicio: {
    type: Date,
    required: true
  },
  fechaFin: {
    type: Date,
    required: true
  },
  estado: {
    type: String,
    default: 'vigente'
  },
  valor_total: {
    type: Number,
    required: true
  },
  beneficiarioId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Beneficiario',
    required: true
  },
  matriculaId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Matricula',
    required: true
  },
  curso_has_numero_de_clasesId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'CursoHasNumeroDeClases',
    required: true
  }
}, {
  timestamps: true,
  collection: 'ventas'
});

// CORREGIDO: Usar exportación estándar en lugar de mongoose.models
module.exports = mongoose.model('Venta', ventaSchema, 'ventas');