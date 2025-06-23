const express = require('express');
const router = express.Router();
const rolPermisoPrivilegioController = require('../controllers/rolPermisoPrivilegioController');

// Rol-Permiso-Privilegio relationship routes
router.get('/', rolPermisoPrivilegioController.getRolPermisoPrivilegios);
router.get('/:id', rolPermisoPrivilegioController.getRolPermisoPrivilegioById);
router.post('/', rolPermisoPrivilegioController.createRolPermisoPrivilegio);
router.put('/:id', rolPermisoPrivilegioController.updateRolPermisoPrivilegio);
router.delete('/:id', rolPermisoPrivilegioController.deleteRolPermisoPrivilegio);

module.exports = router;