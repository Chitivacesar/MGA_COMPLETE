const mongoose = require('mongoose');

const rolPermisoPrivilegioSchema = new mongoose.Schema({
  rolId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'Rol'
  },
  permisoId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'Permiso'
  },
  privilegioId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'Privilegio'
  }
}, {
  timestamps: true,
  collection: 'rol_permiso_privilegio'
});

module.exports = mongoose.model('RolPermisoPrivilegio', rolPermisoPrivilegioSchema);