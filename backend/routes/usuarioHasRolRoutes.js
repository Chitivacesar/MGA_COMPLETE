const express = require('express');
const router = express.Router();
const controller = require('../controllers/usuarioHasRolController');

router.get('/', controller.getUsuariosHasRoles);
router.get('/:id', controller.getUsuarioHasRolById);
router.post('/', controller.createUsuarioHasRol);
router.put('/:id', controller.updateUsuarioHasRol);
router.delete('/:id', controller.deleteUsuarioHasRol);

module.exports = router;
