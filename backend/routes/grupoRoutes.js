const express = require('express');
const router = express.Router();
const grupoController = require('../controllers/grupoController');

// Group routes
router.get('/', grupoController.getGrupos);
router.get('/:id', grupoController.getGrupoById);
router.post('/', grupoController.createGrupo);
router.put('/:id', grupoController.updateGrupo);
router.delete('/:id', grupoController.deleteGrupo);

module.exports = router;