const mongoose = require('mongoose');

const aulaSchema = new mongoose.Schema({
  numeroAula: {
    type: String,
    required: true,
    unique: true
  },
  capacidad: {
    type: Number,
    required: true
  },
  estado: {
    type: String,
    enum: ['Activo', 'Inactivo'],
    default: 'Activo'
  }
});

module.exports = mongoose.model('Aula', aulaSchema);