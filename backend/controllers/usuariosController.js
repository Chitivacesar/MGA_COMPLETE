

const Usuario = require('../models/usuario');
const bcrypt = require('bcryptjs');

// GET - Obtener todos los usuarios
exports.getUsuarios = async (req, res) => {
  try {
    const usuarios = await Usuario.find().select('-contrasena -confirmacionContrasena');
    res.json(usuarios);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// GET - Obtener un usuario por ID
exports.getUsuarioById = async (req, res) => {
  try {
    const usuario = await Usuario.findById(req.params.id).select('-contrasena -confirmacionContrasena');
    if (usuario) {
      res.json(usuario);
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
    // Verificar si el usuario ya existe
    const usuarioExistente = await Usuario.findOne({ correo: req.body.correo });
    if (usuarioExistente) {
      return res.status(400).json({ message: 'El usuario ya existe' });
    }

    // Verificar que las contraseñas coincidan
    if (req.body.contrasena !== req.body.confirmacionContrasena) {
      return res.status(400).json({ message: 'Las contraseñas no coinciden' });
    }

    // Encriptar contraseña
    const salt = await bcrypt.genSalt(10);
    const contrasenaHash = await bcrypt.hash(req.body.contrasena, salt);

    const usuario = new Usuario({
      correo: req.body.correo,
      contrasena: contrasenaHash,
      confirmacionContrasena: contrasenaHash,
      apellido: req.body.apellido,
      nombre: req.body.nombre,
      documento: req.body.documento,
      estado: req.body.estado
    });

    const nuevoUsuario = await usuario.save();
    
    // Retornar usuario sin contraseñas
    const usuarioRespuesta = nuevoUsuario.toObject();
    delete usuarioRespuesta.contrasena;
    delete usuarioRespuesta.confirmacionContrasena;
    
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
      // Si se proporcionan nuevas contraseñas
      if (req.body.contrasena) {
        if (req.body.contrasena !== req.body.confirmacionContrasena) {
          return res.status(400).json({ message: 'Las contraseñas no coinciden' });
        }
        const salt = await bcrypt.genSalt(10);
        req.body.contrasena = await bcrypt.hash(req.body.contrasena, salt);
        req.body.confirmacionContrasena = req.body.contrasena;
      }

      Object.assign(usuario, req.body);
      const usuarioActualizado = await usuario.save();
      
      // Retornar usuario sin contraseñas
      const usuarioRespuesta = usuarioActualizado.toObject();
      delete usuarioRespuesta.contrasena;
      delete usuarioRespuesta.confirmacionContrasena;
      
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