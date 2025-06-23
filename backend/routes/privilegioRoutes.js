const express = require('express');
const router = express.Router();
const privilegioController = require('../controllers/privilegioController');

// Privilege routes
router.get('/', privilegioController.getPrivilegios);
router.get('/:id', privilegioController.getPrivilegioById);
router.post('/', privilegioController.createPrivilegio);
router.put('/:id', privilegioController.updatePrivilegio);
router.delete('/:id', privilegioController.deletePrivilegio);

module.exports = router;