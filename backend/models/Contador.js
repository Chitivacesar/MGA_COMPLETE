const mongoose = require('mongoose');

const contadorSchema = new mongoose.Schema({
  _id: {
    type: String,
    required: true // nombre del contador, ej: "ventas"
  },
  seq: {
    type: Number,
    default: 0
  }
});

module.exports = mongoose.model('Contador', contadorSchema, 'contador');

