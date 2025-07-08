const express = require('express');
const router = express.Router();
const ventaController = require('../controllers/ventaController');

// Rutas CRUD para ventas
router.get('/', ventaController.getVentas);
router.get('/:id', ventaController.getVentaById);
router.post('/', ventaController.createVenta);
router.put('/:id', ventaController.updateVenta);
router.delete('/:id', ventaController.deleteVenta);

// Ruta para anular una venta con motivo
router.patch('/:id/anular', ventaController.anularVenta);

module.exports = router;
