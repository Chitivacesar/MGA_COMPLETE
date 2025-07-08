const Cliente = require('../models/Cliente');

// Obtener todos los clientes
exports.getClientes = async (req, res) => {
  try {
    const clientes = await Cliente.find();
    res.json({ success: true, data: clientes });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Obtener un cliente por ID
exports.getClienteById = async (req, res) => {
  try {
    const cliente = await Cliente.findById(req.params.id);
    if (!cliente) {
      return res.status(404).json({ success: false, message: 'Cliente no encontrado' });
    }
    res.json({ success: true, data: cliente });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Crear un nuevo cliente
exports.createCliente = async (req, res) => {
  try {
    const nuevoCliente = new Cliente(req.body);
    await nuevoCliente.save();
    res.status(201).json({ success: true, data: nuevoCliente });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// Actualizar un cliente
exports.updateCliente = async (req, res) => {
  try {
    const clienteActualizado = await Cliente.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!clienteActualizado) {
      return res.status(404).json({ success: false, message: 'Cliente no encontrado' });
    }
    res.json({ success: true, data: clienteActualizado });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// Eliminar un cliente
exports.deleteCliente = async (req, res) => {
  try {
    const clienteEliminado = await Cliente.findByIdAndDelete(req.params.id);
    if (!clienteEliminado) {
      return res.status(404).json({ success: false, message: 'Cliente no encontrado' });
    }
    res.json({ success: true, data: clienteEliminado });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
