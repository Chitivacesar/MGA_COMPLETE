const express = require('express');
const router = express.Router();
const cursoHasNumeroDeClasesController = require('../controllers/cursoHasNumeroDeClasesController');

// Rutas adicionales para filtros específicos
router.get('/curso/:cursoId', cursoHasNumeroDeClasesController.getByCursoId);
router.get('/numero-clases/:numeroClasesId', cursoHasNumeroDeClasesController.getByNumeroClasesId);

// Rutas principales
router.get('/', cursoHasNumeroDeClasesController.getAll);
router.get('/:id', cursoHasNumeroDeClasesController.getById);
router.post('/', cursoHasNumeroDeClasesController.create);
router.put('/:id', cursoHasNumeroDeClasesController.update);
router.delete('/:id', cursoHasNumeroDeClasesController.delete);

module.exports = router;