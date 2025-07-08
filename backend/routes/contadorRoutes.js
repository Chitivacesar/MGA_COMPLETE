const express = require('express');
const router = express.Router();
const contadorController = require('../controllers/contadorController');
console.log('getContadores:', typeof contadorController.getContadores);
console.log('getContadorById:', typeof contadorController.getContadorById);
console.log('createContador:', typeof contadorController.createContador);
console.log('incrementarContador:', typeof contadorController.incrementarContador);
console.log('deleteContador:', typeof contadorController.deleteContador);

router.get('/', contadorController.getContadores);
router.get('/:id', contadorController.getContadorById);
router.post('/', contadorController.createContador);
router.patch('/:id/incrementar', contadorController.incrementarContador);
router.delete('/:id', contadorController.deleteContador);

module.exports = router;
