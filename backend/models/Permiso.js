const mongoose = require('mongoose');

const permisoSchema = new mongoose.Schema({
  permiso: {
    type: String,
    required: true,
    unique: true
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Permiso', permisoSchema);