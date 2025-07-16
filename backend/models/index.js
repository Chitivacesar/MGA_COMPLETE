const mongoose = require('mongoose');

// Import models
const Asistencia = require('./Asistencia');
// Al inicio del archivo, donde están los imports
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
const Contador = require('./Contador');

// En la sección de exports
module.exports = {
  Asistencia,
  Aula,
  Beneficiario,
  Clase,
  Cliente,  // Asegúrate de que esté incluido aquí
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
  Venta,
  Contador
};