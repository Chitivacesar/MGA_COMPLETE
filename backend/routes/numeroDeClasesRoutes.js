const express = require('express');
const router = express.Router();
const numeroDeClasesController = require('../controllers/numeroDeClasesController');

// Class number routes
router.get('/', numeroDeClasesController.getNumeroDeClases);
router.get('/:id', numeroDeClasesController.getNumeroDeClasesById);
router.post('/', numeroDeClasesController.createNumeroDeClases);
router.put('/:id', numeroDeClasesController.updateNumeroDeClases);
router.delete('/:id', numeroDeClasesController.deleteNumeroDeClases);

module.exports = router;