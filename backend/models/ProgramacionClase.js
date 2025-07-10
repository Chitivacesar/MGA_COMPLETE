const mongoose = require("mongoose")

const programacionClaseSchema = new mongoose.Schema(
  {
    venta: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Venta",
      required: [true, "El beneficiario principal es requerido"],
    },
    programacionProfesor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "ProgramacionProfesor",
      required: [true, "La programación del profesor es requerida"],
    },
    dia: {
      type: String,
      enum: {
        values: ["L", "M", "X", "J", "V", "S", "D"],
        message: "Día inválido. Debe ser: L, M, X, J, V, S, D",
      },
      required: [true, "El día es requerido"],
    },
    // ✅ CAMPOS CORRECTOS - EXACTAMENTE como en la BD
    horaInicio: {
      type: String,
      required: [true, "La hora de inicio es requerida"],
    },
    horaFin: {
      type: String,
      required: [true, "La hora de fin es requerida"],
    },
    especialidad: {
      type: String,
      required: [true, "La especialidad es requerida"],
      trim: true,
    },
    // ✅ ESTADO COMO STRING
    estado: {
      type: String,
      enum: ["programada", "ejecutada", "cancelada", "reprogramada"],
      default: "programada",
    },
    asistencia: {
      type: Boolean,
      default: null,
    },
    motivo: {
      type: String,
      maxlength: [500, "El motivo no puede exceder 500 caracteres"],
      trim: true,
    },
    beneficiariosAdicionales: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Venta",
      },
    ],
    observaciones: {
      type: String,
      maxlength: [1000, "Las observaciones no pueden exceder 1000 caracteres"],
      trim: true,
    },
    // ✅ NO INCLUIR FECHA - no existe en la BD
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  },
)

// Índices
programacionClaseSchema.index({ programacionProfesor: 1 })
programacionClaseSchema.index({ venta: 1 })
programacionClaseSchema.index({ estado: 1 })
programacionClaseSchema.index({ dia: 1, horaInicio: 1 })

module.exports = mongoose.model("ProgramacionClase", programacionClaseSchema, "programacion_de_clases")
