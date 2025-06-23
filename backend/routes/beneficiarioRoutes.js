const express = require('express');
const router = express.Router();
const beneficiarioController = require('../controllers/beneficiarioController');

// Beneficiary routes
router.get('/', beneficiarioController.getBeneficiarios);
router.get('/:id', beneficiarioController.getBeneficiarioById);
router.post('/', beneficiarioController.createBeneficiario);
router.put('/:id', beneficiarioController.updateBeneficiario);
router.delete('/:id', beneficiarioController.deleteBeneficiario);

module.exports = router;