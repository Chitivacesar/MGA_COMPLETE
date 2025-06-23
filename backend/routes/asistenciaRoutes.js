const express = require('express');
const router = express.Router();
const asistenciaController = require('../controllers/asistenciaController');

// Rutas para asistencias
router.get('/', asistenciaController.getAsistencias);
router.get('/:id', asistenciaController.getAsistenciaById);
router.post('/', asistenciaController.createAsistencia);
router.put('/:id', asistenciaController.updateAsistencia);
router.delete('/:id', asistenciaController.deleteAsistencia);

module.exports = router;