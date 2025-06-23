const mongoose = require('mongoose');

const programacionProfesorSchema = new mongoose.Schema({
  profesor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Profesor',
    required: [true, 'El profesor es requerido']
  },
  fecha: {
    type: Date,
    required: [true, 'La fecha es requerida']
  },
  horaInicio: {
    type: String,
    required: [true, 'La hora de inicio es requerida'],
    validate: {
      validator: function(v) {
        return /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/.test(v);
      },
      message: 'Formato de hora inválido (HH:MM)'
    }
  },
  horaFin: {
    type: String,
    required: [true, 'La hora de fin es requerida'],
    validate: {
      validator: function(v) {
        return /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/.test(v);
      },
      message: 'Formato de hora inválido (HH:MM)'
    }
  },
  estado: {
    type: String,
    enum: {
      values: ['activo', 'cancelado', 'completado'],
      message: 'El estado debe ser: activo, cancelado o completado'
    },
    default: 'activo'
  },
  motivo: {
    type: String,
    default: null
  },
  programacionesClases: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'ProgramacionClase'
  }]
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Índices para mejorar el rendimiento
programacionProfesorSchema.index({ profesor: 1, fecha: 1 });
programacionProfesorSchema.index({ fecha: 1 });
programacionProfesorSchema.index({ estado: 1 });

// Virtual para obtener la duración en minutos
programacionProfesorSchema.virtual('duracionMinutos').get(function() {
  if (this.horaInicio && this.horaFin) {
    const [inicioHora, inicioMin] = this.horaInicio.split(':').map(Number);
    const [finHora, finMin] = this.horaFin.split(':').map(Number);
    
    const inicioTotal = inicioHora * 60 + inicioMin;
    const finTotal = finHora * 60 + finMin;
    
    return finTotal - inicioTotal;
  }
  return 0;
});

// Validación personalizada para verificar que horaFin > horaInicio
programacionProfesorSchema.pre('save', function(next) {
  if (this.horaInicio && this.horaFin) {
    const [inicioHora, inicioMin] = this.horaInicio.split(':').map(Number);
    const [finHora, finMin] = this.horaFin.split(':').map(Number);
    
    const inicioTotal = inicioHora * 60 + inicioMin;
    const finTotal = finHora * 60 + finMin;
    
    if (finTotal <= inicioTotal) {
      next(new Error('La hora de fin debe ser posterior a la hora de inicio'));
    }
  }
  next();
});

module.exports = mongoose.model('ProgramacionProfesor', programacionProfesorSchema, 'programacion_de_profesores');