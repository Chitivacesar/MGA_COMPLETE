const Beneficiario = require('../models/Beneficiario');

// Endpoint temporal para ver beneficiarios y su clienteId
exports.getBeneficiariosConCliente = async (req, res) => {
  try {
    const beneficiarios = await Beneficiario.find().populate('clienteId');
    const resultado = beneficiarios.map(b => ({
      _id: b._id,
      nombre: b.nombre,
      apellido: b.apellido,
      numero_de_documento: b.numero_de_documento,
      clienteId: b.clienteId ? {
        _id: b.clienteId._id,
        nombre: b.clienteId.nombre,
        apellido: b.clienteId.apellido,
        tipoDocumento: b.clienteId.tipoDocumento,
        numeroDocumento: b.clienteId.numeroDocumento,
        telefono: b.clienteId.telefono,
        correo: b.clienteId.correo,
        direccion: b.clienteId.direccion,
        fechaNacimiento: b.clienteId.fechaNacimiento,
        estado: b.clienteId.estado
      } : null
    }));
    res.json(resultado);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
