const mongoose = require('mongoose');
const Counter = require('./Contador'); // Asegúrate de que el nombre coincida con tu archivo/modelo

const ventaSchema = new mongoose.Schema({
  consecutivo: Number,
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
    default: null
  },
  numero_de_clases: {
    type: Number,
    default: null
  },
  ciclo: {
    type: Number,
    default: null
  },
  tipo: {
    type: String,
    enum: ['matricula', 'curso'],
    required: true
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
    enum: ['vigente', 'vencida', 'Anulada'],
    required: true
  },
  valor_total: {
    type: Number,
    required: true
  },
  createdAt: {
    type: Date,
    default: () => new Date()
  },
  updatedAt: {
    type: Date,
    default: () => new Date()
  },
  codigoVenta: {
    type: String,
    default: null
  },
  motivoAnulacion: {
    type: String,
    default: null
  }
});

// Middleware: genera consecutivo automáticamente antes de guardar
ventaSchema.pre('save', async function (next) {
  if (!this.consecutivo) {
    try {
      // Incrementar el contador según el tipo de venta
      const contadorId = this.tipo === 'matricula' ? 'matriculas' : 'curso';
      const counter = await Counter.findByIdAndUpdate(
        { _id: contadorId },
        { $inc: { seq: 1 } },
        { new: true, upsert: true }
      );
      this.consecutivo = counter.seq;

      const prefijo = this.tipo === 'matricula' ? 'MA' : 'CU';
      this.codigoVenta = `${prefijo}-${String(counter.seq).padStart(4, '0')}`;

      // Incrementar el contador de ventas general
      await Counter.findByIdAndUpdate(
        { _id: 'ventas' },
        { $inc: { seq: 1 } },
        { new: true, upsert: true }
      );
    } catch (error) {
      return next(error);
    }
  }

  this.updatedAt = new Date();
  next();
});

module.exports = mongoose.model('Venta', ventaSchema);
