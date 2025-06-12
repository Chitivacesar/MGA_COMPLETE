export const mockUsers = [
  {
    id: 1,
    name: 'Administrador',
    email: 'admin@teacuerdas.com',
    password: 'admin123',
    role: 'admin',
    permissions: [
      'dashboard',
      'configuracion-roles',
      'configuracion-usuarios',
      'servicios-musicales-profesores',
      'servicios-musicales-programacion-profesores',
      'servicios-musicales-programacion-clases',
      'servicios-musicales-cursos-matriculas',
      'servicios-musicales-aulas',
      'servicios-musicales-clases',
      'venta-servicios-clientes',
      'venta-servicios-beneficiarios',
      'venta-servicios-venta-matriculas',
      'venta-servicios-venta-cursos',
      'venta-servicios-pagos',
      'venta-servicios-asistencia'
    ],
    avatar: null
  },
  {
    id: 2,
    name: 'Profesor Demo',
    email: 'profesor@teacuerdas.com',
    password: 'profesor123',
    role: 'teacher',
    permissions: [
      'servicios-musicales-programacion-profesores',
      'servicios-musicales-programacion-clases',
      'venta-servicios-asistencia'
    ],
    avatar: null
  },
  {
    id: 3,
    name: 'Beneficiario Demo',
    email: 'beneficiario@teacuerdas.com',
    password: 'beneficiario123',
    role: 'beneficiary',
    permissions: [
      'servicios-musicales-programacion-clases',
      'venta-servicios-asistencia',
      'venta-servicios-pagos'
    ],
    avatar: null
  }
];