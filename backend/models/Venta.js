const mongoose = require("mongoose")

const ventaSchema = new mongoose.Schema({
  consecutivo: {
    type: Number,
    required: true,
  },
  codigoVenta: {
    type: String,
    required: true,
    unique: true,
  },
  tipo: {
    type: String,
    required: true,
    enum: ["matricula", "curso"],
  },
  beneficiarioId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Beneficiario",
    required: true,
  },
  matriculaId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Matricula",
  },
  cursoId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Curso",
  },
  fechaInicio: {
    type: Date,
    required: true,
  },
  fechaFin: {
    type: Date,
    required: true,
  },
  valor_total: {
    type: Number,
    required: true,
  },
  descuento: {
    type: Number,
    default: 0,
  },
  observaciones: {
    type: String,
  },
  estado: {
    type: String,
    enum: ["vigente", "vencida", "cancelada"],
    default: "vigente",
  },
  fechaRegistro: {
    type: Date,
    default: Date.now,
  },
})

module.exports = mongoose.model("Venta", ventaSchema)
