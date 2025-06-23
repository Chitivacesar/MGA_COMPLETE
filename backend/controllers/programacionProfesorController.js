const ProgramacionProfesor = require('../models/ProgramacionProfesor');

// GET - Obtener todas las programaciones de profesores
exports.getProgramacionesProfesores = async (req, res) => {
  try {
    const programaciones = await ProgramacionProfesor.find()
      .populate('profesor', 'nombre apellido email')
      .populate('programacionesClases');
    res.json(programaciones);
  } catch (error) {
    console.error('Error al obtener programaciones:', error);
    res.status(500).json({ message: error.message });
  }
};

// GET - Obtener programación de profesor por ID
exports.getProgramacionProfesorById = async (req, res) => {
  try {
    const programacion = await ProgramacionProfesor.findById(req.params.id)
      .populate('profesor', 'nombre apellido email')
      .populate('programacionesClases');
    
    if (!programacion) {
      return res.status(404).json({ message: 'Programación de profesor no encontrada' });
    }
    
    res.json(programacion);
  } catch (error) {
    console.error('Error al obtener programación por ID:', error);
    res.status(500).json({ message: error.message });
  }
};

// GET - Obtener programaciones por profesor
exports.getProgramacionesByProfesor = async (req, res) => {
  try {
    const programaciones = await ProgramacionProfesor.find({ profesor: req.params.profesorId })
      .populate('profesor', 'nombre apellido email')
      .populate('programacionesClases');
    res.json(programaciones);
  } catch (error) {
    console.error('Error al obtener programaciones por profesor:', error);
    res.status(500).json({ message: error.message });
  }
};

// GET - Obtener programaciones por fecha
exports.getProgramacionesByFecha = async (req, res) => {
  try {
    const fecha = new Date(req.params.fecha);
    
    // Validar fecha
    if (isNaN(fecha.getTime())) {
      return res.status(400).json({ message: 'Fecha inválida' });
    }
    
    // Buscar por rango de fecha (todo el día)
    const inicioDelDia = new Date(fecha);
    inicioDelDia.setHours(0, 0, 0, 0);
    
    const finDelDia = new Date(fecha);
    finDelDia.setHours(23, 59, 59, 999);
    
    const programaciones = await ProgramacionProfesor.find({
      fecha: {
        $gte: inicioDelDia,
        $lte: finDelDia
      }
    })
      .populate('profesor', 'nombre apellido email')
      .populate('programacionesClases');
    
    res.json(programaciones);
  } catch (error) {
    console.error('Error al obtener programaciones por fecha:', error);
    res.status(500).json({ message: error.message });
  }
};

// GET - Obtener programaciones por estado
exports.getProgramacionesByEstado = async (req, res) => {
  try {
    const estadosValidos = ['activo', 'cancelado', 'completado'];
    
    if (!estadosValidos.includes(req.params.estado)) {
      return res.status(400).json({ message: 'Estado inválido' });
    }
    
    const programaciones = await ProgramacionProfesor.find({ estado: req.params.estado })
      .populate('profesor', 'nombre apellido email')
      .populate('programacionesClases');
    res.json(programaciones);
  } catch (error) {
    console.error('Error al obtener programaciones por estado:', error);
    res.status(500).json({ message: error.message });
  }
};

// POST - Crear nueva programación de profesor
exports.createProgramacionProfesor = async (req, res) => {
  try {
    const programacion = new ProgramacionProfesor(req.body);
    const nuevaProgramacion = await programacion.save();
    
    const programacionPopulada = await ProgramacionProfesor.findById(nuevaProgramacion._id)
      .populate('profesor', 'nombre apellido email')
      .populate('programacionesClases');
    
    res.status(201).json(programacionPopulada);
  } catch (error) {
    console.error('Error al crear programación:', error);
    res.status(400).json({ message: error.message });
  }
};

// PUT - Actualizar programación de profesor
exports.updateProgramacionProfesor = async (req, res) => {
  try {
    const programacion = await ProgramacionProfesor.findById(req.params.id);
    
    if (!programacion) {
      return res.status(404).json({ message: 'Programación de profesor no encontrada' });
    }
    
    Object.assign(programacion, req.body);
    const programacionActualizada = await programacion.save();
    
    const programacionPopulada = await ProgramacionProfesor.findById(programacionActualizada._id)
      .populate('profesor', 'nombre apellido email')
      .populate('programacionesClases');
    
    res.json(programacionPopulada);
  } catch (error) {
    console.error('Error al actualizar programación:', error);
    res.status(400).json({ message: error.message });
  }
};

// PATCH - Actualizar estado de programación
exports.updateEstadoProgramacion = async (req, res) => {
  try {
    const { estado, motivo } = req.body;
    const estadosValidos = ['activo', 'cancelado', 'completado'];
    
    if (!estadosValidos.includes(estado)) {
      return res.status(400).json({ message: 'Estado inválido' });
    }
    
    const programacion = await ProgramacionProfesor.findById(req.params.id);
    
    if (!programacion) {
      return res.status(404).json({ message: 'Programación de profesor no encontrada' });
    }
    
    programacion.estado = estado;
    if (motivo !== undefined) {
      programacion.motivo = motivo;
    }
    
    const programacionActualizada = await programacion.save();
    
    const programacionPopulada = await ProgramacionProfesor.findById(programacionActualizada._id)
      .populate('profesor', 'nombre apellido email')
      .populate('programacionesClases');
    
    res.json(programacionPopulada);
  } catch (error) {
    console.error('Error al actualizar estado:', error);
    res.status(400).json({ message: error.message });
  }
};

// DELETE - Eliminar programación de profesor
exports.deleteProgramacionProfesor = async (req, res) => {
  try {
    const programacion = await ProgramacionProfesor.findById(req.params.id);
    
    if (!programacion) {
      return res.status(404).json({ message: 'Programación de profesor no encontrada' });
    }
    
    await ProgramacionProfesor.findByIdAndDelete(req.params.id);
    res.json({ message: 'Programación de profesor eliminada' });
  } catch (error) {
    console.error('Error al eliminar programación:', error);
    res.status(500).json({ message: error.message });
  }
};