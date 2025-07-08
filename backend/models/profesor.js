const mongoose = require('mongoose');

const profesorSchema = new mongoose.Schema({
  usuarioId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Usuario',
    required: true
  },
  nombres: {
    type: String,
    required: true,
    trim: true,
    minlength: 1,
    maxlength: 100,
    match: [/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s.'-]+$/, 'Permite letras, espacios, puntos, apostrofes y guiones']
  },
  apellidos: {
    type: String,
    required: true,
    trim: true,
    minlength: 1,
    maxlength: 100,
    match: [/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s.'-]+$/, 'Permite letras, espacios, puntos, apostrofes y guiones']
  },
  tipoDocumento: {
    type: String,
    required: true,
    enum: ['CC', 'CE', 'TI', 'PP', 'RC', 'NIT', 'PEP', 'DNI']
  },
  identificacion: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    minlength: 4,
    maxlength: 20,
    match: [/^[0-9A-Za-z\-]+$/, 'Permite números, letras y guiones']
  },
  telefono: {
    type: String,
    required: true,
    trim: true,
    minlength: 7,
    maxlength: 20,
    match: [/^[0-9+\-\s().ext]+$/, 'Teléfono más flexible - incluye extensiones']
  },
  direccion: {
    type: String,
    trim: true,
    minlength: 5,
    maxlength: 200
  },
  correo: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true,
    minlength: 5,
    maxlength: 100,
    match: [/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/, 'Debe ser un correo electrónico válido']
  },
  especialidades: {
    type: [String],
    required: true,
    validate: [
      {
        validator: function(arr) {
          return Array.isArray(arr) && arr.length >= 1 && arr.length <= 10;
        },
        message: 'Debe tener entre 1 y 10 especialidades'
      },
      {
        validator: function(arr) {
          return arr.every(esp => typeof esp === 'string' && esp.length >= 2 && esp.length <= 100);
        },
        message: 'Cada especialidad debe tener entre 2 y 100 caracteres'
      }
    ]
  },
  estado: {
    type: String,
    enum: ['Activo', 'Inactivo', 'Pendiente', 'Suspendido'],
    default: 'Activo'
  }
}, {
  timestamps: true
});

profesorSchema.index({ correo: 1 });
profesorSchema.index({ identificacion: 1 });
profesorSchema.index({ nombres: 1, apellidos: 1 });

module.exports = mongoose.model('Profesor', profesorSchema, 'profesores');