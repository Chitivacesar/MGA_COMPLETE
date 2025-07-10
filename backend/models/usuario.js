
const mongoose = require('mongoose');

const usuarioSchema = new mongoose.Schema({
  nombre: {
    type: String,
    required: true,
    trim: true
  },
  apellido: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  password: {
    type: String,
    required: true,
    minlength: 6
  },
  rol: {
    type: String,
    enum: ['usuario', 'admin'],
    default: 'usuario'
  },
  estado: {
    type: Boolean,
    default: true
  },
  tipo_de_documento: {
    type: String,
    required: true,
    enum: ['TI', 'CC', 'CE', 'PP', 'NIT'],
    trim: true
  },
  documento: {
    type: String,
    required: true,
    match: [/^[0-9]{6,15}$/, 'Debe contener solo números, entre 6 y 15 dígitos']
  },
  correo: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/, 'Debe ser un correo electrónico válido']
  },
  contrasena: {
    type: String,
    required: true,
    minlength: 8
  }
}, {
  timestamps: true,
  collection: 'usuarios' 
});

module.exports = mongoose.model('Usuario', usuarioSchema);