const express = require('express');
const router = express.Router();
const contadorController = require('../controllers/contadorController');

router.get('/', contadorController.getContadores);
router.get('/:id', contadorController.getContadorById);
router.post('/', contadorController.createContador);
router.patch('/:id/incrementar', contadorController.incrementarContador);
router.delete('/:id', contadorController.deleteContador);

module.exports = router;
