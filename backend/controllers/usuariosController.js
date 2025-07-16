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
    // Validar campos requeridos
    if (!req.body.nombre || !req.body.apellido || !req.body.correo || !req.body.tipo_de_documento || !req.body.documento) {
      return res.status(400).json({ message: 'Todos los campos obligatorios deben ser proporcionados' });
    }

    // Validar formato de correo
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!emailRegex.test(req.body.correo)) {
      return res.status(400).json({ message: 'El formato del correo electrónico no es válido' });
    }

    // Validar existencia por correo o documento
    const usuarioExistente = await Usuario.findOne({ $or: [
      { correo: req.body.correo.toLowerCase() },
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

    // Validar tipo de documento
    const tiposDocumentoValidos = ['TI', 'CC', 'CE', 'PP', 'NIT'];
    if (!tiposDocumentoValidos.includes(req.body.tipo_de_documento)) {
      return res.status(400).json({ message: 'Tipo de documento no válido' });
    }

    // Validar formato de documento
    const documentoRegex = /^[0-9]{6,15}$/;
    if (!documentoRegex.test(req.body.documento)) {
      return res.status(400).json({ message: 'El documento debe contener solo números, entre 6 y 15 dígitos' });
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

    // Verificar si el usuario tiene rol de profesor para crear entrada en la colección de profesores
    if (req.body.rol === 'profesor' || req.body.esProfesor) {
      try {
        const mongoose = require('mongoose');
        const session = await mongoose.startSession();
        await session.startTransaction();

        try {
          // Importar el modelo de Profesor
          const Profesor = require('../models/profesor');
          
          // Verificar si ya existe un profesor con este correo o identificación
          const profesorExistente = await Profesor.findOne({ 
            $or: [
              { correo: req.body.correo },
              { identificacion: req.body.documento }
            ]
          }).session(session);
          
          if (!profesorExistente) {
            // Crear datos del profesor
            const profesorData = {
              usuarioId: nuevoUsuario._id,
              nombres: req.body.nombre,
              apellidos: req.body.apellido,
              tipoDocumento: req.body.tipo_de_documento,
              identificacion: req.body.documento,
              correo: req.body.correo,
              estado: 'Activo'
            };
            
            // Agregar campos opcionales si están presentes
            if (req.body.telefono) profesorData.telefono = req.body.telefono;
            if (req.body.direccion) profesorData.direccion = req.body.direccion;
            if (req.body.especialidades) profesorData.especialidades = req.body.especialidades;
            
            // Si no hay especialidades, agregar una por defecto
            if (!profesorData.especialidades || !Array.isArray(profesorData.especialidades) || profesorData.especialidades.length === 0) {
              profesorData.especialidades = ['General'];
            }
            
            // Validar y asignar teléfono
            profesorData.telefono = req.body.telefono || '0000000000';
            
            // Validar y asignar dirección
            if (req.body.direccion) {
              profesorData.direccion = req.body.direccion;
            }
            
            // Crear el profesor usando la sesión de transacción
            const nuevoProfesor = new Profesor(profesorData);
            await nuevoProfesor.save({ session });
            
            // Crear la relación usuario-rol usando la sesión de transacción
            const UsuarioHasRol = require('../models/UsuarioHasRol');
            const Rol = require('../models/rol');
            
            const rolProfesor = await Rol.findOne({ nombre: 'Profesor' }).session(session);
            if (!rolProfesor) {
              throw new Error('No se encontró el rol de profesor');
            }
            
            const nuevaRelacion = new UsuarioHasRol({
              usuarioId: nuevoUsuario._id,
              rolId: rolProfesor._id
            });
            await nuevaRelacion.save({ session });
            
            await session.commitTransaction();
            console.log('Profesor y relación usuario-rol creados exitosamente');
          }
        } catch (error) {
          await session.abortTransaction();
          throw error;
        } finally {
          session.endSession();
        }
      } catch (profesorError) {
        console.error('Error al crear profesor:', profesorError);
        // Ahora sí devolvemos el error para que el cliente sepa que algo falló
        return res.status(500).json({ 
          message: 'Error al crear el profesor',
          error: profesorError.message 
        });
      }
    }
    
    res.status(201).json(usuarioRespuesta);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// PUT - Actualizar usuario
exports.updateUsuario = async (req, res) => {
  try {
    // Validar formato de correo si se proporciona
    if (req.body.correo) {
      const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
      if (!emailRegex.test(req.body.correo)) {
        return res.status(400).json({ message: 'El formato del correo electrónico no es válido' });
      }
    }

    // Validar tipo de documento si se proporciona
    if (req.body.tipo_de_documento) {
      const tiposDocumentoValidos = ['TI', 'CC', 'CE', 'PP', 'NIT'];
      if (!tiposDocumentoValidos.includes(req.body.tipo_de_documento)) {
        return res.status(400).json({ message: 'Tipo de documento no válido' });
      }
    }

    // Validar formato de documento si se proporciona
    if (req.body.documento) {
      const documentoRegex = /^[0-9]{6,15}$/;
      if (!documentoRegex.test(req.body.documento)) {
        return res.status(400).json({ message: 'El documento debe contener solo números, entre 6 y 15 dígitos' });
      }
    }

    const usuario = await Usuario.findById(req.params.id);
    if (usuario) {
      // Campos que se pueden actualizar
      const camposActualizables = [
        'nombre',
        'apellido',
        'tipo_de_documento',
        'documento',
        'correo',
        'estado',
        'rol'
      ];

      // Verificar si el correo ya existe en otro usuario
      if (req.body.correo && req.body.correo !== usuario.correo) {
        const usuarioExistente = await Usuario.findOne({
          _id: { $ne: req.params.id },
          correo: req.body.correo.toLowerCase()
        });
        if (usuarioExistente) {
          return res.status(400).json({ message: 'Ya existe un usuario con este correo' });
        }
      }

      // Verificar si el documento ya existe en otro usuario
      if (req.body.documento && req.body.documento !== usuario.documento) {
        const usuarioExistente = await Usuario.findOne({
          _id: { $ne: req.params.id },
          documento: req.body.documento
        });
        if (usuarioExistente) {
          return res.status(400).json({ message: 'Ya existe un usuario con este documento' });
        }
      }

      // Actualizar solo los campos permitidos que vienen en el request
      camposActualizables.forEach(campo => {
        if (req.body[campo] !== undefined) {
          usuario[campo] = campo === 'correo' ? req.body[campo].toLowerCase() : req.body[campo];
        }
      });

      // Solo actualizar contraseña si se proporciona una nueva
      if (req.body.contrasena) {
        const salt = await bcrypt.genSalt(10);
        usuario.contrasena = await bcrypt.hash(req.body.contrasena, salt);
      }

      const usuarioActualizado = await usuario.save();
      
      // Verificar si el usuario tiene rol de profesor para actualizar o crear entrada en la colección de profesores
      if (usuarioActualizado.rol === 'profesor' || req.body.esProfesor) {
        let session;
        try {
          const mongoose = require('mongoose');
          session = await mongoose.startSession();
          await session.startTransaction();

          try {
            // Importar el modelo de Profesor
            const Profesor = require('../models/profesor');
            const UsuarioHasRol = require('../models/UsuarioHasRol');
            const Rol = require('../models/rol');
            
            // Buscar si existe un profesor asociado a este usuario
            let profesor = await Profesor.findOne({ usuarioId: usuarioActualizado._id }).session(session);
            
            // Datos del profesor a actualizar o crear
            let profesorData = {
              nombres: usuarioActualizado.nombre,
              apellidos: usuarioActualizado.apellido,
              tipoDocumento: usuarioActualizado.tipo_de_documento,
              identificacion: usuarioActualizado.documento,
              correo: usuarioActualizado.correo,
              estado: usuarioActualizado.estado ? 'Activo' : 'Inactivo'
            };
            
            // Agregar campos opcionales si están presentes en la solicitud
            if (req.body.telefono) profesorData.telefono = req.body.telefono;
            if (req.body.direccion) profesorData.direccion = req.body.direccion;
            if (req.body.especialidades) profesorData.especialidades = req.body.especialidades;
            
            if (profesor) {
              // Mantener los campos existentes si no se proporcionan nuevos
              profesorData = {
                ...profesor.toObject(),
                ...profesorData,
                especialidades: req.body.especialidades || profesor.especialidades,
                telefono: req.body.telefono || profesor.telefono,
                direccion: req.body.direccion || profesor.direccion
              };
              
              // Actualizar profesor existente
              await Profesor.findByIdAndUpdate(
                profesor._id,
                { $set: profesorData },
                { new: true, session, runValidators: true }
              );
            } else {
              // Crear nuevo profesor
              profesorData.usuarioId = usuarioActualizado._id;
              
              // Si no hay especialidades, agregar una por defecto
              if (!profesorData.especialidades || !Array.isArray(profesorData.especialidades) || profesorData.especialidades.length === 0) {
                profesorData.especialidades = ['General'];
              }
              
              // Validar y asignar teléfono
              profesorData.telefono = req.body.telefono || '0000000000';
              
              // Validar y asignar dirección
              if (req.body.direccion) {
                profesorData.direccion = req.body.direccion;
              }
              
              const nuevoProfesor = new Profesor(profesorData);
              await nuevoProfesor.save({ session });

              // Verificar y crear la relación usuario-rol si no existe
              const rolProfesor = await Rol.findOne({ nombre: 'Profesor' }).session(session);
              if (!rolProfesor) {
                throw new Error('No se encontró el rol de profesor');
              }

              const relacionExistente = await UsuarioHasRol.findOne({
                usuarioId: usuarioActualizado._id,
                rolId: rolProfesor._id
              }).session(session);

              if (!relacionExistente) {
                const nuevaRelacion = new UsuarioHasRol({
                  usuarioId: usuarioActualizado._id,
                  rolId: rolProfesor._id
                });
                await nuevaRelacion.save({ session });
              }
            }

            await session.commitTransaction();
            console.log('Profesor y relación usuario-rol actualizados exitosamente');
          } catch (error) {
            if (session) await session.abortTransaction();
            console.error('Error al actualizar/crear profesor automáticamente:', error);
            return res.status(500).json({ 
              message: 'Error al actualizar/crear el profesor',
              error: error.message 
            });
          } finally {
            if (session) session.endSession();
          }
        } catch (profesorError) {
          console.error('Error al actualizar/crear profesor automáticamente:', profesorError);
          return res.status(500).json({ 
            message: 'Error al actualizar/crear el profesor',
            error: profesorError.message 
          });
        }
      }

      const usuarioRespuesta = usuarioActualizado.toObject();
      delete usuarioRespuesta.contrasena;
      return res.json(usuarioRespuesta);
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
    if (!usuario) {
      return res.status(404).json({ message: 'Usuario no encontrado' });
    }

    // Obtener los roles del usuario
    const UsuarioHasRol = require('../models/UsuarioHasRol');
    const Rol = require('../models/rol');
    
    const usuarioRoles = await UsuarioHasRol.find({ usuarioId: req.params.id })
      .populate('rolId');
    
    const rolesNombres = usuarioRoles.map(ur => ur.rolId.nombre.toLowerCase());
    
    // Validaciones de integridad referencial según el rol
    
    // 1. Si el usuario tiene rol de Cliente
    if (rolesNombres.includes('cliente')) {
      const Beneficiario = require('../models/Beneficiario');
      const beneficiariosAsociados = await Beneficiario.find({ clienteId: req.params.id });
      
      if (beneficiariosAsociados.length > 0) {
        return res.status(400).json({
          message: 'No se puede eliminar el usuario porque tiene beneficiarios asociados',
          details: `El usuario está asociado a ${beneficiariosAsociados.length} beneficiario(s)`,
          associatedRecords: beneficiariosAsociados.map(b => ({
            id: b._id,
            nombre: `${b.nombre} ${b.apellido}`,
            documento: b.numero_de_documento
          }))
        });
      }
    }
    
    // 2. Si el usuario tiene rol de Beneficiario
    if (rolesNombres.includes('beneficiario')) {
      // Verificar si está asociado a matrículas
      const Matricula = require('../models/Matricula');
      const Venta = require('../models/Venta');
      
      // Buscar ventas donde el beneficiario sea el usuario actual
      const ventasAsociadas = await Venta.find({ beneficiario: req.params.id });
      
      if (ventasAsociadas.length > 0) {
        return res.status(400).json({
          message: 'No se puede eliminar el usuario porque está asociado a ventas/matrículas',
          details: `El usuario está asociado a ${ventasAsociadas.length} venta(s)`,
          associatedRecords: ventasAsociadas.map(v => ({
            id: v._id,
            codigoVenta: v.codigoVenta,
            fechaVenta: v.fechaVenta
          }))
        });
      }
      
      // Verificar si está asociado a programaciones de clase
      const ProgramacionClase = require('../models/ProgramacionClase');
      const programacionesClase = await ProgramacionClase.find({
        $or: [
          { venta: { $in: ventasAsociadas.map(v => v._id) } },
          { beneficiariosAdicionales: { $in: ventasAsociadas.map(v => v._id) } }
        ]
      });
      
      if (programacionesClase.length > 0) {
        return res.status(400).json({
          message: 'No se puede eliminar el usuario porque está asociado a programaciones de clase',
          details: `El usuario está asociado a ${programacionesClase.length} programación(es) de clase`,
          associatedRecords: programacionesClase.map(pc => ({
            id: pc._id,
            dia: pc.dia,
            horaInicio: pc.horaInicio,
            horaFin: pc.horaFin,
            estado: pc.estado
          }))
        });
      }
    }
    
    // 3. Si el usuario tiene rol de Profesor
    if (rolesNombres.includes('profesor')) {
      const Profesor = require('../models/profesor');
      const ProgramacionProfesor = require('../models/ProgramacionProfesor');
      const ProgramacionClase = require('../models/ProgramacionClase');
      
      // Buscar el registro de profesor asociado al usuario
      const profesorRecord = await Profesor.findOne({ usuarioId: req.params.id });
      
      if (profesorRecord) {
        // Verificar programaciones de profesor
        const programacionesProfesor = await ProgramacionProfesor.find({ 
          profesor: profesorRecord._id,
          estado: { $in: ['activo', 'completado'] }
        });
        
        if (programacionesProfesor.length > 0) {
          return res.status(400).json({
            message: 'No se puede eliminar el usuario porque tiene programaciones de profesor asociadas',
            details: `El profesor está asociado a ${programacionesProfesor.length} programación(es) de profesor`,
            associatedRecords: programacionesProfesor.map(pp => ({
              id: pp._id,
              horaInicio: pp.horaInicio,
              horaFin: pp.horaFin,
              estado: pp.estado,
              diasSeleccionados: pp.diasSeleccionados
            }))
          });
        }
        
        // Verificar programaciones de clase donde participe el profesor
        const programacionesClaseProfesor = await ProgramacionClase.find({
          programacionProfesor: { $in: programacionesProfesor.map(pp => pp._id) }
        });
        
        if (programacionesClaseProfesor.length > 0) {
          return res.status(400).json({
            message: 'No se puede eliminar el usuario porque tiene programaciones de clase asociadas como profesor',
            details: `El profesor está asociado a ${programacionesClaseProfesor.length} programación(es) de clase`,
            associatedRecords: programacionesClaseProfesor.map(pc => ({
              id: pc._id,
              dia: pc.dia,
              horaInicio: pc.horaInicio,
              horaFin: pc.horaFin,
              estado: pc.estado
            }))
          });
        }
      }
    }
    
    // Si pasa todas las validaciones, proceder con la eliminación
    await usuario.deleteOne();
    
    // También eliminar las relaciones usuario-rol
    await UsuarioHasRol.deleteMany({ usuarioId: req.params.id });
    
    res.json({ 
      message: 'Usuario eliminado exitosamente',
      deletedUser: {
        id: usuario._id,
        nombre: usuario.nombre,
        apellido: usuario.apellido,
        correo: usuario.correo
      }
    });
    
  } catch (error) {
    console.error('Error al eliminar usuario:', error);
    res.status(500).json({ 
      message: 'Error interno del servidor al eliminar usuario',
      error: error.message 
    });
  }
};