const express = require('express');
const router = express.Router();
const pagoController = require('../controllers/pagoController');

// Middleware para logging de rutas
router.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.originalUrl}`);
  console.log('Body:', req.body);
  console.log('Params:', req.params);
  console.log('Query:', req.query);
  next();
});

// Rutas de pagos
router.get('/', pagoController.getPagos);
router.get('/debug', pagoController.debugPagos); // RUTA DE DEBUG
router.get('/:id', pagoController.getPagoById);
router.post('/', pagoController.createPago);
router.put('/:id', pagoController.updatePago);
router.delete('/:id', pagoController.deletePago);

// Ruta adicional para cambiar estado
router.patch('/:id/estado', async (req, res) => {
  try {
    const { id } = req.params;
    const { estado } = req.body;
    
    console.log(`Updating payment ${id} status to:`, estado);
    
    // Validar que el estado sea válido
    const estadosValidos = ['pendiente', 'completado', 'fallido', 'cancelado'];
    if (!estadosValidos.includes(estado)) {
      return res.status(400).json({
        success: false,
        message: 'Estado no válido. Los estados permitidos son: ' + estadosValidos.join(', ')
      });
    }
    
    const pago = await require('../models/Pago').findByIdAndUpdate(
      id,
      { estado },
      { new: true, runValidators: true }
    ).populate({
      path: 'venta',
      populate: {
        path: 'beneficiarioId',
        model: 'Beneficiario'
      }
    });

    if (!pago) {
      return res.status(404).json({
        success: false,
        message: 'Pago no encontrado'
      });
    }

    res.json({
      success: true,
      data: pago,
      message: 'Estado actualizado correctamente'
    });

  } catch (error) {
    console.error('Error updating payment status:', error);
    res.status(500).json({
      success: false,
      message: 'Error al actualizar el estado del pago',
      error: error.message
    });
  }
});

module.exports = router;