const mongoose = require('mongoose');

const rolSchema = new mongoose.Schema({
  nombre: {
    type: String,
    required: [true, 'El nombre es requerido'],
    trim: true,
    maxlength: [100, 'El nombre no puede exceder 100 caracteres']
  },
  descripcion: {
    type: String,
    required: [true, 'La descripción es requerida'],
    trim: true,
    maxlength: [500, 'La descripción no puede exceder 500 caracteres']
  },
  estado: {
    type: Boolean,
    default: true
  },
  permisos: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Permiso'
  }],
  privilegios: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Privilegio'
  }]
}, {
  timestamps: true,
  collection: 'roles',
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Índice único para el nombre
rolSchema.index({ nombre: 1 }, {
  unique: true,
  collation: { locale: 'es', strength: 2 }
});

// Middleware pre-save para normalizar el nombre
rolSchema.pre('save', function (next) {
  if (this.nombre && this.isModified('nombre')) {
    this.nombre = this.nombre.charAt(0).toUpperCase() + this.nombre.slice(1).toLowerCase();
  }
  next();
});

// Virtual para rol_permiso_privilegio
rolSchema.virtual('rol_permiso_privilegio', {
  ref: 'RolPermisoPrivilegio',
  localField: '_id',
  foreignField: 'rolId',
  justOne: false
});

module.exports = mongoose.models.Rol || mongoose.model('Rol', rolSchema);
