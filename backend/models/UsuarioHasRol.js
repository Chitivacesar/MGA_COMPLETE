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
  }
}, {
  timestamps: true,
  collection: 'usuarios_has_rol'
});

module.exports = mongoose.models.UsuarioHasRol || mongoose.model('UsuarioHasRol', usuarioHasRolSchema);
