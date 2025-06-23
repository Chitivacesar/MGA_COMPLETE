const express = require('express');
const router = express.Router();
const profesorHasCursoController = require('../controllers/profesorHasCursoController');

// Rutas para relaciones profesor-curso
router.get('/', profesorHasCursoController.getProfesorHasCursos);
router.get('/:id', profesorHasCursoController.getProfesorHasCursoById);
router.get('/profesor/:profesorId', profesorHasCursoController.getCursosByProfesorId);
router.get('/curso/:cursoId', profesorHasCursoController.getProfesoresByCursoId);
router.post('/', profesorHasCursoController.createProfesorHasCurso);
router.put('/:id', profesorHasCursoController.updateProfesorHasCurso);
router.delete('/:id', profesorHasCursoController.deleteProfesorHasCurso);

module.exports = router;