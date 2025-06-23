const Beneficiario = require('../models/Beneficiario');

// GET - Get all beneficiaries
exports.getBeneficiarios = async (req, res) => {
  try {
    const beneficiarios = await Beneficiario.find();
    res.json(beneficiarios);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// GET - Get beneficiary by ID
exports.getBeneficiarioById = async (req, res) => {
  try {
    const beneficiario = await Beneficiario.findById(req.params.id);
    if (beneficiario) {
      res.json(beneficiario);
    } else {
      res.status(404).json({ message: 'Beneficiary not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// POST - Create new beneficiary
exports.createBeneficiario = async (req, res) => {
  const beneficiario = new Beneficiario({
    nombre: req.body.nombre,
    apellido: req.body.apellido,
    tipo_de_documento: req.body.tipo_de_documento,
    numero_de_documento: req.body.numero_de_documento,
    telefono: req.body.telefono,
    direccion: req.body.direccion,
    fechaDeNacimiento: req.body.fechaDeNacimiento,
    fechaRegistro: req.body.fechaRegistro,
    clienteId: req.body.clienteId,
    usuario_has_rolId: req.body.usuario_has_rolId
  });

  try {
    const newBeneficiario = await beneficiario.save();
    res.status(201).json(newBeneficiario);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// PUT - Update beneficiary
exports.updateBeneficiario = async (req, res) => {
  try {
    const beneficiario = await Beneficiario.findById(req.params.id);
    if (beneficiario) {
      Object.assign(beneficiario, req.body);
      const updatedBeneficiario = await beneficiario.save();
      res.json(updatedBeneficiario);
    } else {
      res.status(404).json({ message: 'Beneficiary not found' });
    }
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// DELETE - Delete beneficiary
exports.deleteBeneficiario = async (req, res) => {
  try {
    const beneficiario = await Beneficiario.findById(req.params.id);
    if (beneficiario) {
      await beneficiario.deleteOne();
      res.json({ message: 'Beneficiary deleted' });
    } else {
      res.status(404).json({ message: 'Beneficiary not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};