const express = require('express');
const router = express.Router();
const permisoController = require('../controllers/permisoController');

// Permission routes
router.get('/', permisoController.getPermisos);
router.get('/:id', permisoController.getPermisoById);
router.post('/', permisoController.createPermiso);
router.put('/:id', permisoController.updatePermiso);
router.delete('/:id', permisoController.deletePermiso);

module.exports = router;