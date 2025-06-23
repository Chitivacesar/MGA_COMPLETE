const express = require('express');
const router = express.Router();
const rolController = require('../controllers/rolController');

// Rutas para roles
router.get('/', rolController.getRoles);
router.get('/:id', rolController.getRolById);
router.post('/', rolController.createRol);
router.put('/:id', rolController.updateRol);
router.delete('/:id', rolController.deleteRol);

module.exports = router;