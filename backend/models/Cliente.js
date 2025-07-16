const mongoose = require('mongoose');

const clienteSchema = new mongoose.Schema({
  nombre: { type: String, required: true },
  apellido: { type: String, required: true },
  tipoDocumento: { type: String },
  numeroDocumento: { type: String },
  telefono: { type: String },
  correo: { type: String },
  direccion: { type: String },
  fechaNacimiento: { type: Date },
  estado: { type: Boolean, default: true }
});

// Especificar el nombre de la colección explícitamente
module.exports = mongoose.model('Cliente', clienteSchema, 'clientes');
