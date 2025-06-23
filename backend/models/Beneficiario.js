const mongoose = require('mongoose');

const beneficiarioSchema = new mongoose.Schema({
  nombre: {
    type: String,
    required: true
  },
  apellido: {
    type: String,
    required: true
  },
  tipo_de_documento: {
    type: String,
    required: true
  },
  numero_de_documento: {
    type: String,
    required: true,
    unique: true
  },
  telefono: {
    type: String,
    required: true
  },
  direccion: {
    type: String,
    required: true
  },
  fechaDeNacimiento: {
    type: Date,
    required: true
  },
  fechaRegistro: {
    type: Date,
    default: Date.now
  },
  clienteId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Cliente',  // Asumiendo que tienes un modelo Cliente
    required: true
  },
  usuario_has_rolId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true
  }
});

module.exports = mongoose.model('Beneficiario', beneficiarioSchema);