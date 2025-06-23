const CursoHasNumeroDeClases = require('../models/CursoHasNumeroDeClases');

// GET - Get all course-class number relationships
exports.getAll = async (req, res) => {
  try {
    const relationships = await CursoHasNumeroDeClases.find()
      .populate('cursoId', 'nombre descripcion')
      .populate('numeroClasesId', 'cantidad descripcion');
    res.json(relationships);
  } catch (error) {
    console.error('Error al obtener relaciones:', error);
    res.status(500).json({ message: error.message });
  }
};

// GET - Get relationship by ID
exports.getById = async (req, res) => {
  try {
    const relationship = await CursoHasNumeroDeClases.findById(req.params.id)
      .populate('cursoId', 'nombre descripcion')
      .populate('numeroClasesId', 'cantidad descripcion');
    
    if (!relationship) {
      return res.status(404).json({ message: 'Relationship not found' });
    }
    
    res.json(relationship);
  } catch (error) {
    console.error('Error al obtener relación por ID:', error);
    res.status(500).json({ message: error.message });
  }
};

// GET - Get relationships by curso ID
exports.getByCursoId = async (req, res) => {
  try {
    const relationships = await CursoHasNumeroDeClases.find({ cursoId: req.params.cursoId })
      .populate('cursoId', 'nombre descripcion')
      .populate('numeroClasesId', 'cantidad descripcion');
    res.json(relationships);
  } catch (error) {
    console.error('Error al obtener relaciones por curso:', error);
    res.status(500).json({ message: error.message });
  }
};

// GET - Get relationships by numero de clases ID
exports.getByNumeroClasesId = async (req, res) => {
  try {
    const relationships = await CursoHasNumeroDeClases.find({ numeroClasesId: req.params.numeroClasesId })
      .populate('cursoId', 'nombre descripcion')
      .populate('numeroClasesId', 'cantidad descripcion');
    res.json(relationships);
  } catch (error) {
    console.error('Error al obtener relaciones por número de clases:', error);
    res.status(500).json({ message: error.message });
  }
};

// POST - Create new relationship
exports.create = async (req, res) => {
  try {
    // Verificar si la relación ya existe
    const existingRelationship = await CursoHasNumeroDeClases.findOne({
      cursoId: req.body.cursoId,
      numeroClasesId: req.body.numeroClasesId
    });

    if (existingRelationship) {
      return res.status(400).json({ message: 'Esta relación ya existe' });
    }

    const relationship = new CursoHasNumeroDeClases({
      cursoId: req.body.cursoId,
      numeroClasesId: req.body.numeroClasesId
    });

    const newRelationship = await relationship.save();
    
    // Poblar la relación creada para devolverla completa
    const populatedRelationship = await CursoHasNumeroDeClases.findById(newRelationship._id)
      .populate('cursoId', 'nombre descripcion')
      .populate('numeroClasesId', 'cantidad descripcion');

    res.status(201).json(populatedRelationship);
  } catch (error) {
    console.error('Error al crear relación:', error);
    res.status(400).json({ message: error.message });
  }
};

// PUT - Update relationship
exports.update = async (req, res) => {
  try {
    const relationship = await CursoHasNumeroDeClases.findById(req.params.id);
    
    if (!relationship) {
      return res.status(404).json({ message: 'Relationship not found' });
    }

    // Verificar si la nueva relación ya existe (si se están cambiando los IDs)
    if (req.body.cursoId || req.body.numeroClasesId) {
      const existingRelationship = await CursoHasNumeroDeClases.findOne({
        cursoId: req.body.cursoId || relationship.cursoId,
        numeroClasesId: req.body.numeroClasesId || relationship.numeroClasesId,
        _id: { $ne: req.params.id }
      });

      if (existingRelationship) {
        return res.status(400).json({ message: 'Esta relación ya existe' });
      }
    }

    Object.assign(relationship, req.body);
    const updatedRelationship = await relationship.save();
    
    // Poblar la relación actualizada
    const populatedRelationship = await CursoHasNumeroDeClases.findById(updatedRelationship._id)
      .populate('cursoId', 'nombre descripcion')
      .populate('numeroClasesId', 'cantidad descripcion');

    res.json(populatedRelationship);
  } catch (error) {
    console.error('Error al actualizar relación:', error);
    res.status(400).json({ message: error.message });
  }
};

// DELETE - Delete relationship
exports.delete = async (req, res) => {
  try {
    const relationship = await CursoHasNumeroDeClases.findById(req.params.id);
    
    if (!relationship) {
      return res.status(404).json({ message: 'Relationship not found' });
    }

    await CursoHasNumeroDeClases.findByIdAndDelete(req.params.id);
    res.json({ message: 'Relationship deleted successfully' });
  } catch (error) {
    console.error('Error al eliminar relación:', error);
    res.status(500).json({ message: error.message });
  }
};