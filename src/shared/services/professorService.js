let setUsuariosState = null;

export const initializeUsuariosState = (_, setState) => {
  setUsuariosState = setState;
};

export const createProfessorUser = (professorData) => {
  const userData = {
    id: professorData.cc,
    nombre: `${professorData.nombre} ${professorData.apellido}`,
    tel: professorData.telefono,
    correo: professorData.email,
    estado: true,
    roles: [{ id: 3, nombre: "Profesor" }],
    primaryRoleId: 3
  };

  if (setUsuariosState) {
    setUsuariosState(prev => [...prev, userData]);
  }

  return userData;
};