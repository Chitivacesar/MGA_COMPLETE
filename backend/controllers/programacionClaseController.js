const ProgramacionClase = require("../models/ProgramacionClase")
const ProgramacionProfesor = require("../models/ProgramacionProfesor")
const mongoose = require("mongoose")

// POST - Crear nueva programación de clase
const createProgramacion = async (req, res) => {
  try {
    const {
      venta,
      programacionProfesor,
      dia,
      horaInicio,
      horaFin,
      especialidad,
      beneficiariosAdicionales = [],
      observaciones,
      estado = "programada",
    } = req.body

    console.log("📝 Datos recibidos:", {
      venta,
      programacionProfesor,
      dia,
      horaInicio,
      horaFin,
      especialidad,
      estado,
    })

    // Validaciones básicas
    if (!venta || !programacionProfesor || !dia || !horaInicio || !horaFin || !especialidad) {
      return res.status(400).json({
        message: "Faltan campos requeridos",
        camposFaltantes: {
          venta: !venta,
          programacionProfesor: !programacionProfesor,
          dia: !dia,
          horaInicio: !horaInicio,
          horaFin: !horaFin,
          especialidad: !especialidad,
        },
      })
    }

    // ✅ CREAR CON NOMBRES CORRECTOS
    const datosParaGuardar = {
      venta: new mongoose.Types.ObjectId(venta),
      programacionProfesor: new mongoose.Types.ObjectId(programacionProfesor),
      dia,
      horaInicio, // ✅ camelCase
      horaFin, // ✅ camelCase
      especialidad: especialidad.trim(),
      estado, // ✅ String
      beneficiariosAdicionales: beneficiariosAdicionales
        .filter((id) => id && mongoose.Types.ObjectId.isValid(id))
        .map((id) => new mongoose.Types.ObjectId(id)),
      observaciones: observaciones?.trim() || null,
    }

    console.log("💾 Datos para guardar:", datosParaGuardar)

    const nuevaProgramacion = new ProgramacionClase(datosParaGuardar)
    const programacionGuardada = await nuevaProgramacion.save()

    console.log("✅ Programación creada:", programacionGuardada._id)

    // Populate para respuesta
    const programacionCompleta = await ProgramacionClase.findById(programacionGuardada._id)
      .populate({
        path: "programacionProfesor",
        populate: {
          path: "profesor",
          select: "nombres apellidos especialidades color",
        },
      })
      .populate({
        path: "venta",
        populate: {
          path: "beneficiarioId",
          select: "nombre apellido",
        },
      })

    res.status(201).json(programacionCompleta)
  } catch (error) {
    console.error("❌ Error al crear programación:", error)

    if (error.name === "ValidationError") {
      const errores = Object.values(error.errors).map((err) => ({
        campo: err.path,
        mensaje: err.message,
        valorRecibido: err.value,
      }))

      return res.status(400).json({
        message: "Errores de validación",
        errores,
        datosRecibidos: req.body,
      })
    }

    res.status(500).json({
      message: "Error interno del servidor",
      error: error.message,
    })
  }
}

// GET - Obtener programaciones
const getProgramaciones = async (req, res) => {
  try {
    const programaciones = await ProgramacionClase.find()
      .populate({
        path: "programacionProfesor",
        populate: {
          path: "profesor",
          select: "nombres apellidos especialidades color",
        },
      })
      .populate({
        path: "venta",
        populate: {
          path: "beneficiarioId",
          select: "nombre apellido",
        },
      })
      .sort({ createdAt: -1 })

    console.log(`📚 Obtenidas ${programaciones.length} programaciones`)
    res.json(programaciones)
  } catch (error) {
    console.error("Error al obtener programaciones:", error)
    res.status(500).json({ message: error.message })
  }
}

// PUT - Actualizar programación
const updateProgramacion = async (req, res) => {
  try {
    const programacion = await ProgramacionClase.findById(req.params.id)
    if (!programacion) {
      return res.status(404).json({ message: "Programación no encontrada" })
    }

    Object.assign(programacion, req.body)
    const programacionActualizada = await programacion.save()

    res.json(programacionActualizada)
  } catch (error) {
    console.error("Error al actualizar programación:", error)
    res.status(400).json({ message: error.message })
  }
}

// DELETE - Eliminar programación
const deleteProgramacion = async (req, res) => {
  try {
    const programacion = await ProgramacionClase.findById(req.params.id)
    if (!programacion) {
      return res.status(404).json({ message: "Programación no encontrada" })
    }

    await programacion.deleteOne()
    res.json({ message: "Programación eliminada correctamente" })
  } catch (error) {
    console.error("Error al eliminar programación:", error)
    res.status(500).json({ message: error.message })
  }
}

// ✅ EXPORTACIONES CORRECTAS
module.exports = {
  createProgramacion,
  getProgramaciones,
  updateProgramacion,
  deleteProgramacion,
}
