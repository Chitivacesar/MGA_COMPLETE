const mongoose = require('mongoose');

// Import models
const Asistencia = require('./Asistencia');
const Cliente = require('./Cliente');
const Aula = require('./Aula');
const Beneficiario = require('./Beneficiario');
const Clase = require('./Clase');
const Curso = require('./Curso');
const CursoHasNumeroDeClases = require('./CursoHasNumeroDeClases');
const EspecialidadProfesor = require('./EspecialidadProfesor');
const Grupo = require('./Grupo');
const Matricula = require('./Matricula');
const NumeroDeClases = require('./NumeroDeClases');
const Pago = require('./Pago');
const Permiso = require('./Permiso');
const Privilegio = require('./Privilegio');
const Profesor = require('./profesor');
const ProfesorHasCurso = require('./ProfesorHasCurso');
const ProgramacionClase = require('./ProgramacionClase');
const ProgramacionProfesor = require('./ProgramacionProfesor');
const Rol = require('./rol');
const RolPermisoPrivilegio = require('./RolPermisoPrivilegio');
const Usuario = require('./usuario');
const UsuarioHasRol = require('./UsuarioHasRol');
const Venta = require('./Venta');

// Export models
module.exports = {
  Asistencia,
  Aula,
  Beneficiario,
  Clase,
  Cliente,
  Curso,
  CursoHasNumeroDeClases,
  EspecialidadProfesor,
  Grupo,
  Matricula,
  NumeroDeClases,
  Pago,
  Permiso,
  Privilegio,
  Profesor,
  ProfesorHasCurso,
  ProgramacionClase,
  ProgramacionProfesor,
  Rol,
  RolPermisoPrivilegio,
  Usuario,
  UsuarioHasRol,
  Venta
};