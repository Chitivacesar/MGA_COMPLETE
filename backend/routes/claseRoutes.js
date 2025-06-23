const express = require('express');
const router = express.Router();
const claseController = require('../controllers/claseController');

// Class routes
router.get('/', claseController.getClases);
router.get('/:id', claseController.getClaseById);
router.post('/', claseController.createClase);
router.put('/:id', claseController.updateClase);
router.delete('/:id', claseController.deleteClase);

module.exports = router;