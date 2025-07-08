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
  ventas: {
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
  if (this.ventas && this.ventas.beneficiarioId) {
    return {
      _id: this.ventas.beneficiarioId._id,
      nombre: this.ventas.beneficiarioId.nombre || 'Sin nombre',
      apellido: this.ventas.beneficiarioId.apellido || 'Sin apellido',
      email: this.ventas.beneficiarioId.email || 'Sin email',
      documento: this.ventas.beneficiarioId.documento || 'Sin documento',
      telefono: this.ventas.beneficiarioId.telefono || 'Sin teléfono'
    };
  }
  return null;
});

// Virtual para información de la venta
pagoSchema.virtual('infoVenta').get(function() {
  if (this.ventas) {
    return {
      _id: this.ventas._id,
      tipo: this.ventas.tipo || 'Sin tipo',
      fechaInicio: this.ventas.fechaInicio,
      fechaFin: this.ventas.fechaFin,
      estado: this.ventas.estado || 'Sin estado',
      valor_total: this.ventas.valor_total || 0,
      valorTotal: this.ventas.valor_total || 0
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