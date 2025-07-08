const mongoose = require('mongoose');

const ventaSchema = new mongoose.Schema({
  consecutivo: {
    type: Number,
    required: true
  },
  codigoVenta: {
    type: String,
    required: true,
    trim: true
  },
  beneficiarioId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Beneficiario',
    required: true
  },
  matriculaId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Matricula',
    default: null
  },
  cursoId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Curso',
    required: true
  },
  numero_de_clases: {
    type: Number,
    required: true
  },
  ciclo: {
    type: Number,
    required: true
  },
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
  motivoAnulacion: {
    type: String,
    default: null
  }
}, {
  timestamps: true,
  collection: 'ventas'
});

module.exports = mongoose.model('Venta', ventaSchema, 'ventas');