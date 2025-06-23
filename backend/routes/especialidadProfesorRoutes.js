const express = require('express');
const router = express.Router();
const especialidadProfesorController = require('../controllers/especialidadProfesorController');

// Teacher specialty routes
router.get('/', especialidadProfesorController.getEspecialidades);
router.get('/:id', especialidadProfesorController.getEspecialidadById);
router.post('/', especialidadProfesorController.createEspecialidad);
router.put('/:id', especialidadProfesorController.updateEspecialidad);
router.delete('/:id', especialidadProfesorController.deleteEspecialidad);

module.exports = router;