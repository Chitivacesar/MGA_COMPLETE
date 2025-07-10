const ProgramacionProfesor = require("../models/ProgramacionProfesor")
const mongoose = require("mongoose")

// GET - Obtener todas las programaciones de profesores
exports.getProgramacionesProfesores = async (req, res) => {
  try {
    const programaciones = await ProgramacionProfesor.find()
      .populate("profesor", "nombres apellidos email especialidades color")
      .lean()

    // Filtrar programacionesClases si está vacío
    const programacionesFiltradas = programaciones.map((prog) => {
      if (prog.programacionesClases && prog.programacionesClases.length === 0) {
        const { programacionesClases, ...resto } = prog
        return resto
      }
      return prog
    })

    res.json(programacionesFiltradas)
  } catch (error) {
    console.error("Error al obtener programaciones:", error)
    res.status(500).json({ message: error.message })
  }
}

// GET - Obtener programación de profesor por ID
exports.getProgramacionProfesorById = async (req, res) => {
  try {
    let programacion = null

    // Intenta buscar como ObjectId si es válido
    if (mongoose.Types.ObjectId.isValid(req.params.id)) {
      programacion = await ProgramacionProfesor.findById(req.params.id)
        .populate("profesor", "nombres apellidos email especialidades color")
        .populate("programacionesClases")
    }

    // Si no encontró y el id es string, busca por string
    if (!programacion) {
      programacion = await ProgramacionProfesor.findOne({ _id: req.params.id })
        .populate("profesor", "nombres apellidos email especialidades color")
        .populate("programacionesClases")
    }

    if (programacion) {
      res.json(programacion)
    } else {
      res.status(404).json({ message: "Programación de profesor no encontrada" })
    }
  } catch (error) {
    console.error("Error al obtener programación por ID:", error)
    res.status(500).json({ message: error.message })
  }
}

// GET - Obtener programaciones por profesor
exports.getProgramacionesByProfesor = async (req, res) => {
  try {
    const programaciones = await ProgramacionProfesor.find({ profesor: req.params.profesorId })
      .populate("profesor", "nombres apellidos email especialidades color")
      .populate("programacionesClases")
    res.json(programaciones)
  } catch (error) {
    console.error("Error al obtener programaciones por profesor:", error)
    res.status(500).json({ message: error.message })
  }
}

// GET - Obtener programaciones por estado
exports.getProgramacionesByEstado = async (req, res) => {
  try {
    const programaciones = await ProgramacionProfesor.find({ estado: req.params.estado })
      .populate("profesor", "nombres apellidos email especialidades color")
      .populate("programacionesClases")
    res.json(programaciones)
  } catch (error) {
    console.error("Error al obtener programaciones por estado:", error)
    res.status(500).json({ message: error.message })
  }
}

// POST - Crear nueva programación de profesor
exports.createProgramacionProfesor = async (req, res) => {
  try {
    const { horaInicio, horaFin, diasSeleccionados, profesor, motivo } = req.body

    // Validar que profesor exista y sea un string no vacío
    if (!profesor || typeof profesor !== "string" || profesor.trim() === "") {
      return res.status(400).json({ message: "El campo 'profesor' es obligatorio y debe ser un ID válido." })
    }

    // Validar que los días estén seleccionados
    if (!diasSeleccionados || !Array.isArray(diasSeleccionados) || diasSeleccionados.length === 0) {
      return res.status(400).json({ message: "Debe seleccionar al menos un día." })
    }

    // Logging detallado de los días recibidos
    console.log("=== ANÁLISIS DE DÍAS RECIBIDOS ===")
    console.log("Días recibidos:", diasSeleccionados)
    console.log("Tipo:", typeof diasSeleccionados)
    console.log("Es array:", Array.isArray(diasSeleccionados))
    console.log("Longitud:", diasSeleccionados.length)
    diasSeleccionados.forEach((dia, index) => {
      console.log(`Día ${index}:`)
      console.log(`  Valor: "${dia}"`)
      console.log(`  Tipo: ${typeof dia}`)
      console.log(`  Longitud: ${dia.length}`)
      console.log(`  Código de carácter: ${dia.charCodeAt(0)}`)
      console.log(`  Bytes: ${new TextEncoder().encode(dia)}`)
    })

    // Validar cada día individualmente
    console.log("=== VALIDACIÓN INDIVIDUAL DE DÍAS ===")
    const validDaysEnum = ["L", "M", "X", "J", "V", "S", "D"]
    diasSeleccionados.forEach((dia, index) => {
      const isValid = validDaysEnum.includes(dia)
      console.log(`Día ${index}: "${dia}" - Válido: ${isValid}`)
      if (!isValid) {
        console.error(`❌ Día inválido encontrado: "${dia}"`)
      }
    })

    console.log("=== DATOS FINALES PARA MONGOOSE ===")
    const finalData = {
      profesor,
      horaInicio,
      horaFin,
      diasSeleccionados,
      estado: "activo",
      motivo: motivo || null,
    }
    console.log("Datos finales:", JSON.stringify(finalData, null, 2))

    // Validar formato de horas
    const timeRegex = /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/
    if (!timeRegex.test(horaInicio) || !timeRegex.test(horaFin)) {
      return res.status(400).json({ message: "Formato de hora inválido. Use HH:MM" })
    }

    // Verificar que no exista una programación activa para el mismo profesor
    const existingProgramacion = await ProgramacionProfesor.findOne({
      profesor: profesor,
      estado: "activo",
    })

    if (existingProgramacion) {
      return res.status(400).json({
        message:
          "Ya existe una programación activa para este profesor. Debe cancelar o eliminar la programación existente primero.",
      })
    }

    const programacion = new ProgramacionProfesor({
      profesor,
      horaInicio,
      horaFin,
      diasSeleccionados,
      estado: "activo",
      motivo: motivo || null,
    })

    const nuevaProgramacion = await programacion.save()

    // Populate la respuesta para devolver datos completos
    const programacionCompleta = await ProgramacionProfesor.findById(nuevaProgramacion._id).populate(
      "profesor",
      "nombres apellidos email especialidades color",
    )

    res.status(201).json(programacionCompleta)
  } catch (error) {
    console.error("Error al crear programación:", error)
    if (error.name === "ValidationError") {
      const errors = Object.values(error.errors).map((err) => err.message)
      return res.status(400).json({ message: errors.join(", ") })
    }
    res.status(400).json({ message: error.message })
  }
}

// PATCH - Actualizar estado de programación
exports.updateEstadoProgramacion = async (req, res) => {
  try {
    const { estado, motivo } = req.body

    if (!["activo", "cancelado", "completado"].includes(estado)) {
      return res.status(400).json({ message: "Estado inválido. Debe ser: activo, cancelado o completado" })
    }

    const programacion = await ProgramacionProfesor.findById(req.params.id)

    if (!programacion) {
      return res.status(404).json({ message: "Programación no encontrada" })
    }

    programacion.estado = estado
    if (motivo !== undefined) {
      programacion.motivo = motivo
    }

    const programacionActualizada = await programacion.save()

    // Populate la respuesta
    const programacionCompleta = await ProgramacionProfesor.findById(programacionActualizada._id).populate(
      "profesor",
      "nombres apellidos email especialidades color",
    )

    res.json(programacionCompleta)
  } catch (error) {
    console.error("Error al actualizar estado:", error)
    res.status(400).json({ message: error.message })
  }
}

// PUT - Actualizar programación de profesor
exports.updateProgramacionProfesor = async (req, res) => {
  try {
    let programacion = null

    if (mongoose.Types.ObjectId.isValid(req.params.id)) {
      programacion = await ProgramacionProfesor.findById(req.params.id)
    }

    if (!programacion) {
      programacion = await ProgramacionProfesor.findOne({ _id: req.params.id })
    }

    if (!programacion) {
      return res.status(404).json({ message: "Programación de profesor no encontrada" })
    }

    // Validar datos si se están actualizando
    const { horaInicio, horaFin, diasSeleccionados, profesor } = req.body

    if (horaInicio || horaFin) {
      const timeRegex = /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/
      if (horaInicio && !timeRegex.test(horaInicio)) {
        return res.status(400).json({ message: "Formato de hora de inicio inválido. Use HH:MM" })
      }
      if (horaFin && !timeRegex.test(horaFin)) {
        return res.status(400).json({ message: "Formato de hora de fin inválido. Use HH:MM" })
      }
    }

    if (diasSeleccionados && (!Array.isArray(diasSeleccionados) || diasSeleccionados.length === 0)) {
      return res.status(400).json({ message: "Debe seleccionar al menos un día." })
    }

    // Si se está cambiando el profesor, verificar que no tenga otra programación activa
    if (profesor && profesor !== String(programacion.profesor) && req.body.estado !== "cancelado") {
      const existingProgramacion = await ProgramacionProfesor.findOne({
        profesor: profesor,
        estado: "activo",
        _id: { $ne: req.params.id },
      })

      if (existingProgramacion) {
        return res.status(400).json({
          message: "El profesor seleccionado ya tiene una programación activa.",
        })
      }
    }

    // Actualizar campos
    Object.assign(programacion, req.body)

    const programacionActualizada = await programacion.save()

    // Populate la respuesta
    const programacionCompleta = await ProgramacionProfesor.findById(programacionActualizada._id).populate(
      "profesor",
      "nombres apellidos email especialidades color",
    )

    res.json(programacionCompleta)
  } catch (error) {
    console.error("Error al actualizar programación:", error)
    if (error.name === "ValidationError") {
      const errors = Object.values(error.errors).map((err) => err.message)
      return res.status(400).json({ message: errors.join(", ") })
    }
    res.status(400).json({ message: error.message })
  }
}

// DELETE - Eliminar programación de profesor
exports.deleteProgramacionProfesor = async (req, res) => {
  try {
    let programacion = null

    if (mongoose.Types.ObjectId.isValid(req.params.id)) {
      programacion = await ProgramacionProfesor.findById(req.params.id)
    }

    if (!programacion) {
      programacion = await ProgramacionProfesor.findOne({ _id: req.params.id })
    }

    if (!programacion) {
      return res.status(404).json({ message: "Programación de profesor no encontrada" })
    }

    await programacion.deleteOne()
    res.json({ message: "Programación de profesor eliminada correctamente" })
  } catch (error) {
    console.error("Error al eliminar programación:", error)
    res.status(500).json({ message: error.message })
  }
}
