const mongoose = require('mongoose');

const cursoHasNumeroDeClasesSchema = new mongoose.Schema({
  cursoId: {
    type: mongoose.Schema.Types.ObjectId,
    required: [true, 'El ID del curso es requerido'],
    ref: 'Curso'
  },
  numeroClasesId: {
    type: mongoose.Schema.Types.ObjectId,
    required: [true, 'El ID del número de clases es requerido'],
    ref: 'NumeroDeClases'
  }
}, {
  timestamps: true
});

// Índice único para evitar duplicados
cursoHasNumeroDeClasesSchema.index({ cursoId: 1, numeroClasesId: 1 }, { unique: true });

// IMPORTANTE: Cambiar el nombre de la colección para que coincida con la existente
module.exports = mongoose.model('CursoHasNumeroDeClases', cursoHasNumeroDeClasesSchema, 'curso_has_numero_de_clases');