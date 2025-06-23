

const mongoose = require('mongoose');

const usuarioSchema = new mongoose.Schema({
  correo: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  contrasena: {
    type: String,
    required: true
  },
  confirmacionContrasena: {
    type: String,
    required: true
  },
  apellido: {
    type: String,
    required: true,
    trim: true
  },
  nombre: {
    type: String,
    required: true,
    trim: true
  },
  documento: {
    type: String,
    required: true,
    trim: true
  },
  estado: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true,
  collection: 'usuarios'
});

module.exports = mongoose.model('Usuario', usuarioSchema);