const mongoose = require('mongoose');

const pagoSchema = new mongoose.Schema({
  fechaPago: {
    type: Date,
    required: true
  },
  valor_total: {
    type: Number,
    required: true
  },
  metodoPago: {
    type: String,
    required: true,
    trim: true
  },
  estado: {
    type: String,
    default: 'completado',
    enum: ['pendiente', 'completado', 'fallido', 'cancelado']
  },
  descripcion: {
    type: String,
    trim: true
  },
  numeroTransaccion: {
    type: String,
    trim: true
  },
  venta: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Venta',
    required: true
  }
}, {
  timestamps: true,
  collection: 'pagos'
});

// Virtual corregido para valorTotal (compatibilidad)
pagoSchema.virtual('valorTotal').get(function() {
  return this.valor_total;
});

// Virtual corregido para información del beneficiario
pagoSchema.virtual('beneficiario').get(function() {
  // Solo devolver información si existe la venta populada con beneficiario
  if (this.venta && this.venta.beneficiarioId) {
    return {
      _id: this.venta.beneficiarioId._id,
      nombre: this.venta.beneficiarioId.nombre || 'Sin nombre',
      apellido: this.venta.beneficiarioId.apellido || 'Sin apellido',
      email: this.venta.beneficiarioId.email || 'Sin email',
      documento: this.venta.beneficiarioId.documento || 'Sin documento',
      telefono: this.venta.beneficiarioId.telefono || 'Sin teléfono'
    };
  }
  return null;
});

// Virtual para información de la venta
pagoSchema.virtual('infoVenta').get(function() {
  if (this.venta) {
    return {
      _id: this.venta._id,
      tipo: this.venta.tipo || 'Sin tipo',
      fechaInicio: this.venta.fechaInicio,
      fechaFin: this.venta.fechaFin,
      estado: this.venta.estado || 'Sin estado',
      valor_total: this.venta.valor_total || 0,
      valorTotal: this.venta.valor_total || 0
    };
  }
  return null;
});

// Asegurar que los virtuals se incluyan cuando se convierta a JSON
pagoSchema.set('toJSON', { 
  virtuals: true,
  transform: function(doc, ret) {
    // Limpiar campos internos de mongoose
    delete ret.__v;
    delete ret.id; // Eliminar el id virtual duplicado de mongoose
    return ret;
  }
});

pagoSchema.set('toObject', { 
  virtuals: true,
  transform: function(doc, ret) {
    delete ret.__v;
    delete ret.id;
    return ret;
  }
});

// Método estático para buscar con detalles completos
pagoSchema.statics.buscarConDetalles = function() {
  return this.find()
    .populate({
      path: 'venta',
      populate: {
        path: 'beneficiarioId',
        model: 'Beneficiario'
      }
    })
    .sort({ createdAt: -1 });
};

// Método de instancia para obtener información completa
pagoSchema.methods.obtenerInfoCompleta = function() {
  return this.populate({
    path: 'venta',
    populate: {
      path: 'beneficiarioId',
      model: 'Beneficiario'
    }
  });
};

module.exports = mongoose.model('Pago', pagoSchema, 'pagos');