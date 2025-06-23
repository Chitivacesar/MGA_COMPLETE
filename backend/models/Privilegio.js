const mongoose = require('mongoose');

const privilegioSchema = new mongoose.Schema({
  nombre_privilegio: {
    type: String,
    required: true,
    unique: true
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Privilegio', privilegioSchema);