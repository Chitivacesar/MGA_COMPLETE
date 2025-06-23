const express = require('express');
const router = express.Router();
const profesorController = require('../controllers/profesorController');

// GET - Obtener todos los profesores
router.get('/', profesorController.getProfesores);

// GET - Obtener un profesor por ID
router.get('/:id', profesorController.getProfesorById);

// POST - Crear nuevo profesor
router.post('/', profesorController.createProfesor);

// PUT - Actualizar profesor
router.put('/:id', profesorController.updateProfesor);

// DELETE - Eliminar profesor
router.delete('/:id', profesorController.deleteProfesor);

module.exports = router;