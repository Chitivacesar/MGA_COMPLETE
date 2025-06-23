const express = require('express');
const router = express.Router();
const programacionProfesorController = require('../controllers/programacionProfesorController');

// Rutas adicionales para filtros específicos
router.get('/profesor/:profesorId', programacionProfesorController.getProgramacionesByProfesor);
router.get('/fecha/:fecha', programacionProfesorController.getProgramacionesByFecha);
router.get('/estado/:estado', programacionProfesorController.getProgramacionesByEstado);

// Rutas principales
router.get('/', programacionProfesorController.getProgramacionesProfesores);
router.get('/:id', programacionProfesorController.getProgramacionProfesorById);
router.post('/', programacionProfesorController.createProgramacionProfesor);
router.put('/:id', programacionProfesorController.updateProgramacionProfesor);
router.delete('/:id', programacionProfesorController.deleteProgramacionProfesor);

// Ruta para actualizar solo el estado
router.patch('/:id/estado', programacionProfesorController.updateEstadoProgramacion);

module.exports = router;