const express = require('express');
const router = express.Router();
const matriculaController = require('../controllers/matriculaController');

// Enrollment routes
router.get('/', matriculaController.getMatriculas);
router.get('/:id', matriculaController.getMatriculaById);
router.post('/', matriculaController.createMatricula);
router.put('/:id', matriculaController.updateMatricula);
router.delete('/:id', matriculaController.deleteMatricula);

module.exports = router;