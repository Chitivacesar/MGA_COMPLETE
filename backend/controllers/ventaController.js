const Venta = require('../models/Venta');

// GET - Todas las ventas
exports.getVentas = async (req, res) => {
  try {
    const ventas = await Venta.find()
      .populate('beneficiarioId')
      .populate('matriculaId')
      .populate('curso_has_numero_de_clasesId');
    res.json(ventas);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// GET - Venta por ID
exports.getVentaById = async (req, res) => {
  try {
    const venta = await Venta.findById(req.params.id)
      .populate('beneficiarioId')
      .populate('matriculaId')
      .populate('curso_has_numero_de_clasesId');
    if (venta) {
      res.json(venta);
    } else {
      res.status(404).json({ message: 'Venta no encontrada' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// POST - Crear nueva venta
exports.createVenta = async (req, res) => {
  const venta = new Venta(req.body);
  try {
    const nuevaVenta = await venta.save();
    res.status(201).json(nuevaVenta);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// PUT - Actualizar venta
exports.updateVenta = async (req, res) => {
  try {
    const venta = await Venta.findById(req.params.id);
    if (venta) {
      Object.assign(venta, req.body);
      const ventaActualizada = await venta.save();
      res.json(ventaActualizada);
    } else {
      res.status(404).json({ message: 'Venta no encontrada' });
    }
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// DELETE - Eliminar venta
exports.deleteVenta = async (req, res) => {
  try {
    const venta = await Venta.findById(req.params.id);
    if (venta) {
      await venta.deleteOne();
      res.json({ message: 'Venta eliminada' });
    } else {
      res.status(404).json({ message: 'Venta no encontrada' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
