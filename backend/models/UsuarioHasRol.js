const mongoose = require('mongoose');

const usuarioHasRolSchema = new mongoose.Schema({
  usuarioId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Usuario',
    required: true
  },
  rolId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Rol',
    required: true
  },
  estado: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true,
  collection: 'usuarios_has_rol'
});

// Crear índice único compuesto para evitar duplicados
usuarioHasRolSchema.index({ usuarioId: 1, rolId: 1 }, { unique: true });

module.exports = mongoose.models.UsuarioHasRol || mongoose.model('UsuarioHasRol', usuarioHasRolSchema);