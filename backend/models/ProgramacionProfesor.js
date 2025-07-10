const mongoose = require("mongoose")

const programacionProfesorSchema = new mongoose.Schema(
  {
    profesor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Profesor",
      required: [true, "El profesor es requerido"],
    },
    horaInicio: {
      type: String,
      required: [true, "La hora de inicio es requerida"],
      validate: {
        validator: (v) => /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/.test(v),
        message: "Formato de hora inválido (HH:MM)",
      },
    },
    horaFin: {
      type: String,
      required: [true, "La hora de fin es requerida"],
      validate: {
        validator: (v) => /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/.test(v),
        message: "Formato de hora inválido (HH:MM)",
      },
    },
    estado: {
      type: String,
      enum: {
        values: ["activo", "cancelado", "completado"],
        message: "El estado debe ser: activo, cancelado o completado",
      },
      default: "activo",
    },
    motivo: {
      type: String,
      default: null,
      maxlength: [500, "El motivo no puede exceder 500 caracteres"],
    },
    diasSeleccionados: [
      {
        type: String,
        enum: {
          values: ["L", "M", "X", "J", "V", "S", "D"],
          message: "Día inválido. Debe ser: L, M, X, J, V, S, D",
        },
        required: [true, "Debe seleccionar al menos un día"],
      },
    ],
    programacionesClases: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "ProgramacionClase",
      },
    ],
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
      transform: (doc, ret) => {
        if (ret.programacionesClases && ret.programacionesClases.length === 0) {
          delete ret.programacionesClases
        }
        return ret
      },
    },
    toObject: { virtuals: true },
  },
)

// Índices para mejorar el rendimiento
programacionProfesorSchema.index({ profesor: 1 })
programacionProfesorSchema.index({ estado: 1 })
programacionProfesorSchema.index({ profesor: 1, estado: 1 })

// Validación personalizada para verificar que horaFin > horaInicio
programacionProfesorSchema.pre("save", function (next) {
  if (this.horaInicio && this.horaFin) {
    const [inicioHora, inicioMin] = this.horaInicio.split(":").map(Number)
    const [finHora, finMin] = this.horaFin.split(":").map(Number)

    const inicioTotal = inicioHora * 60 + inicioMin
    const finTotal = finHora * 60 + finMin

    if (finTotal <= inicioTotal) {
      next(new Error("La hora de fin debe ser posterior a la hora de inicio"))
      return
    }
  }

  // Validar que diasSeleccionados no esté vacío
  if (!this.diasSeleccionados || this.diasSeleccionados.length === 0) {
    next(new Error("Debe seleccionar al menos un día"))
    return
  }

  next()
})

// Middleware para evitar programaciones duplicadas activas para el mismo profesor
programacionProfesorSchema.pre("save", async function (next) {
  if (this.isNew || this.isModified("profesor") || this.isModified("estado")) {
    if (this.estado === "activo") {
      const existingProgramacion = await this.constructor.findOne({
        profesor: this.profesor,
        estado: "activo",
        _id: { $ne: this._id },
      })

      if (existingProgramacion) {
        next(new Error("Ya existe una programación activa para este profesor"))
        return
      }
    }
  }
  next()
})

module.exports = mongoose.model("ProgramacionProfesor", programacionProfesorSchema, "programacion_de_profesores")
