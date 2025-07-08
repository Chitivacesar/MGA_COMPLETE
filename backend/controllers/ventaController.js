const Venta = require('../models/Venta');

// GET - Obtener todas las ventas
exports.getVentas = async (req, res) => {
  try {
    const ventas = await Venta.find()
      .sort({ createdAt: -1 })
      .populate('beneficiarioId')
      .populate('matriculaId')
      .populate('cursoId');
    res.json(ventas);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// GET - Obtener una venta por ID
exports.getVentaById = async (req, res) => {
  try {
    const venta = await Venta.findById(req.params.id)
      .populate('beneficiarioId')
      .populate('matriculaId')
      .populate('cursoId');
    if (venta) {
      res.json(venta);
    } else {
      res.status(404).json({ message: 'Venta no encontrada' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// POST - Crear una nueva venta
exports.createVenta = async (req, res) => {
  try {
    const venta = new Venta({
      beneficiarioId: req.body.beneficiarioId,
      matriculaId: req.body.matriculaId || null,
      cursoId: req.body.cursoId || null,
      numero_de_clases: req.body.numero_de_clases || null,
      ciclo: req.body.ciclo || null,
      tipo: req.body.tipo,
      fechaInicio: req.body.fechaInicio,
      fechaFin: req.body.fechaFin,
      estado: req.body.estado,
      valor_total: req.body.valor_total
    });

    const nuevaVenta = await venta.save();
    res.status(201).json(nuevaVenta);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// PUT - Actualizar una venta
exports.updateVenta = async (req, res) => {
  try {
    const venta = await Venta.findById(req.params.id);
    if (!venta) {
      return res.status(404).json({ message: 'Venta no encontrada' });
    }

    Object.assign(venta, req.body);
    venta.updatedAt = new Date();

    const ventaActualizada = await venta.save();
    res.json(ventaActualizada);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// DELETE - Eliminar una venta
exports.deleteVenta = async (req, res) => {
  try {
    const venta = await Venta.findById(req.params.id);
    if (!venta) {
      return res.status(404).json({ message: 'Venta no encontrada' });
    }

    await venta.deleteOne();
    res.json({ message: 'Venta eliminada' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
