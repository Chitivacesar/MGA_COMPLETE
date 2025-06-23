const express = require('express');
const router = express.Router();
const programacionClaseController = require('../controllers/programacionClaseController');

// Rutas de programación de clases
router.get('/', programacionClaseController.getProgramaciones);
router.get('/:id', programacionClaseController.getProgramacionById);
router.post('/', programacionClaseController.createProgramacion);
router.put('/:id', programacionClaseController.updateProgramacion);
router.delete('/:id', programacionClaseController.deleteProgramacion);

module.exports = router;