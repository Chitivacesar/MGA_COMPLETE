

const Usuario = require('../models/usuario');
const bcrypt = require('bcryptjs');

// GET - Obtener todos los usuarios
exports.getUsuarios = async (req, res) => {
  try {
    const usuarios = await Usuario.find().select('-contrasena');
    res.json({ success: true, usuarios });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// GET - Obtener un usuario por ID
exports.getUsuarioById = async (req, res) => {
  try {
    const usuario = await Usuario.findById(req.params.id).select('-contrasena');
    if (usuario) {
      res.json({ success: true, usuario });
    } else {
      res.status(404).json({ message: 'Usuario no encontrado' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// POST - Crear nuevo usuario
exports.createUsuario = async (req, res) => {
  try {
    // Validar existencia por correo o documento
    const usuarioExistente = await Usuario.findOne({ $or: [
      { correo: req.body.correo },
      { documento: req.body.documento }
    ] });
    if (usuarioExistente) {
      return res.status(400).json({ message: 'Ya existe un usuario con este correo o documento' });
    }

    // Encriptar contraseña
    let hash = req.body.contrasena;
    if (req.body.contrasena) {
      const salt = await bcrypt.genSalt(10);
      hash = await bcrypt.hash(req.body.contrasena, salt);
    }

    const usuario = new Usuario({
      nombre: req.body.nombre,
      apellido: req.body.apellido,
      tipo_de_documento: req.body.tipo_de_documento,
      documento: req.body.documento,
      correo: req.body.correo,
      contrasena: hash,
      estado: req.body.estado !== undefined ? req.body.estado : true,
      rol: req.body.rol || 'usuario'
    });

    const nuevoUsuario = await usuario.save();
    const usuarioRespuesta = nuevoUsuario.toObject();
    delete usuarioRespuesta.contrasena;
    res.status(201).json(usuarioRespuesta);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// PUT - Actualizar usuario
exports.updateUsuario = async (req, res) => {
  try {
    const usuario = await Usuario.findById(req.params.id);
    if (usuario) {
      // Si se proporciona una nueva contraseña, encriptarla
      if (req.body.contrasena) {
        const salt = await bcrypt.genSalt(10);
        req.body.contrasena = await bcrypt.hash(req.body.contrasena, salt);
      }
      Object.assign(usuario, req.body);
      const usuarioActualizado = await usuario.save();
      const usuarioRespuesta = usuarioActualizado.toObject();
      delete usuarioRespuesta.contrasena;
      res.json(usuarioRespuesta);
    } else {
      res.status(404).json({ message: 'Usuario no encontrado' });
    }
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// DELETE - Eliminar usuario
exports.deleteUsuario = async (req, res) => {
  try {
    const usuario = await Usuario.findById(req.params.id);
    if (usuario) {
      await usuario.deleteOne();
      res.json({ message: 'Usuario eliminado' });
    } else {
      res.status(404).json({ message: 'Usuario no encontrado' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};