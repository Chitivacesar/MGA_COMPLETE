const mongoose = require('mongoose');

const profesorSchema = new mongoose.Schema({
  nombres: {
    type: String,
    required: [true, 'El nombre es requerido'],
    trim: true,
    minLength: [1, 'El nombre debe tener al menos 1 caracter'],
    maxLength: [100, 'El nombre no puede exceder los 100 caracteres'],
    match: [/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s.'-]+$/, 'Permite letras, espacios, puntos, apostrofes y guiones']
  },
  apellidos: {
    type: String,
    required: [true, 'Los apellidos son requeridos'],
    trim: true,
    minLength: [1, 'Los apellidos deben tener al menos 1 caracter'],
    maxLength: [100, 'Los apellidos no pueden exceder los 100 caracteres'],
    match: [/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s.'-]+$/, 'Permite letras, espacios, puntos, apostrofes y guiones']
  },
  tipoDocumento: {
    type: String,
    required: [true, 'El tipo de documento es requerido'],
    enum: {
      values: ['CC', 'CE', 'TI', 'PP', 'RC', 'NIT', 'PEP', 'DNI'],
      message: 'El tipo de documento debe ser: CC, CE, TI, PP, RC, NIT, PEP o DNI'
    }
  },
  identificacion: {
    type: String,
    required: [true, 'La identificación es requerida'],
    unique: true,
    trim: true,
    minLength: [4, 'La identificación debe tener al menos 4 caracteres'],
    maxLength: [20, 'La identificación no puede exceder los 20 caracteres'],
    match: [/^[0-9A-Za-z\-]+$/, 'Permite números, letras y guiones']
  },
  telefono: {
    type: String,
    required: [true, 'El teléfono es requerido'],
    trim: true,
    minLength: [7, 'El teléfono debe tener al menos 7 caracteres'],
    maxLength: [20, 'El teléfono no puede exceder los 20 caracteres'],
    match: [/^[0-9+\-\s().ext]+$/, 'Teléfono más flexible - incluye extensiones']
  },
  direccion: {
    type: String,
    trim: true,
    minLength: [5, 'La dirección debe tener al menos 5 caracteres'],
    maxLength: [200, 'La dirección no puede exceder los 200 caracteres']
  },
  correo: {
    type: String,
    required: [true, 'El correo es requerido'],
    unique: true,
    trim: true,
    lowercase: true,
    minLength: [5, 'El correo debe tener al menos 5 caracteres'],
    maxLength: [100, 'El correo no puede exceder los 100 caracteres'],
    match: [/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/, 'Debe ser un correo electrónico válido']
  },
  contraseña: {
    type: String,
    required: function() {
      return this.isNew;
    },
    minlength: [6, 'La contraseña debe tener al menos 6 caracteres'],
    maxlength: [128, 'La contraseña no puede exceder los 128 caracteres']
  },
  confirmacionContraseña: {
    type: String,
    required: function() {
      return this.isNew && this.contraseña;
    },
    minlength: [6, 'La confirmación debe tener al menos 6 caracteres'],
    maxlength: [128, 'La confirmación no puede exceder los 128 caracteres'],
    validate: {
      validator: function(value) {
        return !this.contraseña || value === this.contraseña;
      },
      message: 'Las contraseñas no coinciden'
    }
  },
  especialidades: {
    type: [String],
    required: [true, 'Al menos una especialidad es requerida'],
    validate: [
      {
        validator: function(arr) {
          return Array.isArray(arr) && arr.length >= 1 && arr.length <= 10;
        },
        message: 'Debe tener entre 1 y 10 especialidades'
      },
      {
        validator: function(arr) {
          return arr.every(esp => esp.length >= 2 && esp.length <= 100);
        },
        message: 'Cada especialidad debe tener entre 2 y 100 caracteres'
      }
    ]
  },
  estado: {
    type: String,
    enum: {
      values: ['Activo', 'Inactivo', 'Pendiente', 'Suspendido'],
      message: 'El estado debe ser: Activo, Inactivo, Pendiente o Suspendido'
    },
    default: 'Activo'
  }
}, {
  timestamps: true
});

// Middleware para eliminar confirmacionContraseña antes de guardar
profesorSchema.pre('save', function(next) {
  if (this.confirmacionContraseña !== undefined) {
    this.confirmacionContraseña = undefined;
  }
  next();
});

// Índices para mejorar el rendimiento
profesorSchema.index({ correo: 1 });
profesorSchema.index({ identificacion: 1 });
profesorSchema.index({ nombres: 1, apellidos: 1 });

module.exports = mongoose.model('Profesor', profesorSchema, 'profesores');