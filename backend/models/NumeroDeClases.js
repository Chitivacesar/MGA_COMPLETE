const mongoose = require('mongoose');

const numeroDeClasesSchema = new mongoose.Schema({
  numero_de_clases: {
    type: Number,
    required: true,
    unique: true
  }
}, {
  collection: 'numero_de_clases' // Forzar el nombre exacto de la colección
});

// Asegurar que use exactamente el nombre de colección que especificamos
module.exports = mongoose.model('NumeroDeClases', numeroDeClasesSchema, 'numero_de_clases');