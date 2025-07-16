'use client'

import { useState, useEffect, useMemo } from "react"
import { GenericList } from "../../../shared/components/GenericList"
import { DetailModal } from "../../../shared/components/DetailModal"
import { FormModal } from "../../../shared/components/FormModal"
import { StatusButton } from "../../../shared/components/StatusButton"
import { UserRoleAssignment } from "../../../shared/components/UserRoleAssignment"
import axios from 'axios'
import { Button, Box, Typography, Chip } from "@mui/material"
import { PersonAdd as PersonAddIcon } from "@mui/icons-material"
import { usuariosService, rolesService, usuariosHasRolService } from "../../../shared/services/api"
import { toast } from 'react-toastify'

const Usuarios = () => {
  const [roles, setRoles] = useState([])
  const [usuarios, setUsuarios] = useState([])
  const [selectedUsuario, setSelectedUsuario] = useState(null)
  const [detailModalOpen, setDetailModalOpen] = useState(false)
  const [formModalOpen, setFormModalOpen] = useState(false)
  const [roleAssignmentOpen, setRoleAssignmentOpen] = useState(false)
  const [isEditing, setIsEditing] = useState(false)

  const fetchData = async () => {
    try {
      const [usuariosResp, rolesResp, usuariosHasRolResp] = await Promise.all([
        usuariosService.getAll(),
        rolesService.getAll(),
        usuariosHasRolService.getAll()
      ]);

      // Extraer arrays de la respuesta, protegiendo si vienen como objeto
      const usuariosData = Array.isArray(usuariosResp)
        ? usuariosResp
        : (Array.isArray(usuariosResp?.usuarios) ? usuariosResp.usuarios : []);
      const rolesData = Array.isArray(rolesResp)
        ? rolesResp
        : (Array.isArray(rolesResp?.roles) ? rolesResp.roles : []);
      const usuariosHasRolData = Array.isArray(usuariosHasRolResp)
        ? usuariosHasRolResp
        : (Array.isArray(usuariosHasRolResp?.asignaciones) ? usuariosHasRolResp.asignaciones : []);

      // Procesar usuarios con sus roles

      // Asignar roles a cada usuario
      const usuariosConRoles = usuariosData.map(usuario => {
        // Obtener todas las asignaciones del usuario
        const asignacionesUsuario = usuariosHasRolData.filter(asignacion => {
          if (!asignacion.usuarioId) return false;
          
          // Manejar tanto ObjectId como objeto poblado
          const usuarioIdEnAsignacion = typeof asignacion.usuarioId === 'string' 
            ? asignacion.usuarioId 
            : asignacion.usuarioId._id || asignacion.usuarioId.id;
            
          return usuarioIdEnAsignacion === usuario._id;
        });
        
        // Extraer roles de las asignaciones activas
        const rolesUsuario = asignacionesUsuario
          .filter(asignacion => {
            // Por defecto, considerar activo si no hay campo estado
            const estado = asignacion.estado !== false;
            return estado && asignacion.rolId;
          })
          .map(asignacion => asignacion.rolId)
          .filter(rol => rol); // Solo roles válidos
        
        return {
          ...usuario,
          roles: rolesUsuario
        };
      });
      
      console.log('Usuarios procesados con roles activos:', usuariosConRoles);
      
      setUsuarios(usuariosConRoles);
      setRoles(rolesData);
      return usuariosConRoles;
    } catch (error) {
      console.error('Error al cargar datos:', error);
      return [];
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleCreate = () => {
    setIsEditing(false)
    setSelectedUsuario(null)
    setFormModalOpen(true)
  }

  const handleEdit = async (usuario) => {
    try {
      // Obtener las asignaciones actuales del usuario
      const allAssignments = await usuariosHasRolService.getAll();
      const userAssignments = allAssignments.filter(assignment => 
        assignment.usuarioId && assignment.usuarioId._id === usuario._id
      );

      // Obtener los roles completos para cada asignación
      const rolesAsignados = userAssignments.map(assignment => {
        // Si rolId ya es un objeto completo, usarlo directamente
        if (assignment.rolId && typeof assignment.rolId === 'object') {
          return assignment.rolId;
        }
        // Si no, buscar el rol completo en la lista de roles
        return roles.find(rol => rol._id === assignment.rolId);
      }).filter(Boolean); // Eliminar posibles valores null/undefined

      const usuarioConRoles = {
        ...usuario,
        roles: rolesAsignados,
        rolId: rolesAsignados.length > 0 ? rolesAsignados[0]._id : ''
      };

      // Establecer el rolId en el usuario
      if (rolesAsignados.length > 0) {
        usuarioConRoles.rolId = rolesAsignados[0]._id;
      }
      
      // Editar información del usuario directamente
      setIsEditing(true);
      setSelectedUsuario(usuarioConRoles);
      setFormModalOpen(true);
    } catch (error) {
      console.error('Error al cargar los roles del usuario:', error);
      alert('Error al cargar los roles del usuario');
    }
  }

  const handleDelete = async (usuario) => {
    const confirmDelete = window.confirm(`¿Está seguro de eliminar al usuario ${usuario.nombre}?`)
    if (confirmDelete) {
      try {
        await usuariosService.delete(usuario._id);
        setUsuarios((prev) => prev.filter((item) => item._id !== usuario._id))
      } catch (error) {
        console.error('Error al eliminar usuario:', error);
      }
    }
  }

  const handleView = (usuario) => {
    console.log('Usuario seleccionado para ver detalles:', usuario);
    // Asegurarse de que el usuario tenga la propiedad roles
    let usuarioConRoles = usuario;
    
    if (!usuario.roles || !Array.isArray(usuario.roles)) {
      // Buscar el usuario en el estado actual para obtener sus roles
      const usuarioCompleto = usuarios.find(u => u._id === usuario._id);
      if (usuarioCompleto && Array.isArray(usuarioCompleto.roles)) {
        usuarioConRoles = usuarioCompleto;
      } else {
        usuarioConRoles = { ...usuario, roles: [] };
      }
    }
    
    console.log('Usuario con roles:', usuarioConRoles);
    setSelectedUsuario(usuarioConRoles);
    setDetailModalOpen(true);
  }

  const handleCloseDetail = () => {
    setDetailModalOpen(false)
    setSelectedUsuario(null)
  }

  const handleCloseForm = (action) => {
    if (action === 'assignRoles' && selectedUsuario) {
      // Si se cerró el formulario con la acción de asignar roles, abrir el diálogo de asignación
      setRoleAssignmentOpen(true);
    } else {
      setFormModalOpen(false);
      setSelectedUsuario(null);
      setIsEditing(false);
    }
  }

  const handleSubmit = async (formData) => {
    try {
      const { confirmacionContrasena, rolId, contrasena, telefono, direccion, especialidades, ...userData } = formData;

      // Verificar si el rol seleccionado es de profesor (solo para creación)
      const profesorRol = roles.find(rol => rol.nombre.toLowerCase().includes('profesor'));
      const isProfesorRole = !isEditing && profesorRol && rolId === profesorRol._id;

      if (isEditing) {
        // Al editar, solo actualizamos los datos del usuario, no los roles
        const updatedUser = await usuariosService.update(selectedUsuario._id, userData);

        // Si el usuario tiene rol de profesor, actualizar datos del profesor
        const tieneRolProfesor = selectedUsuario.roles?.some(rol => 
          (typeof rol === 'string' && rol === profesorRol?._id) ||
          (typeof rol === 'object' && rol._id === profesorRol?._id)
        );

        if (tieneRolProfesor && (telefono || direccion || especialidades)) {
          try {
            // Verificar si ya existe un profesor asociado a este usuario
            const response = await axios.get(`http://localhost:3000/api/profesores?usuarioId=${selectedUsuario._id}`);
            const profesoresData = response.data;
            const profesorExistente = profesoresData.find(p => p.usuarioId === selectedUsuario._id);
            
            if (profesorExistente && (telefono || direccion || especialidades)) {
              // Solo actualizar si se proporcionaron datos de profesor
              const profesorData = {
                usuarioId: selectedUsuario._id,
                nombres: userData.nombre,
                apellidos: userData.apellido,
                tipoDocumento: userData.tipo_de_documento,
                identificacion: userData.documento,
                correo: userData.correo,
                estado: 'Activo'
              };
              
              if (telefono) profesorData.telefono = telefono;
              if (direccion) profesorData.direccion = direccion;
              if (especialidades && Array.isArray(especialidades) && especialidades.length > 0) {
                profesorData.especialidades = especialidades;
              }
              
              await axios.put(`http://localhost:3000/api/profesores/${profesorExistente._id}`, profesorData);
              toast.success('Usuario y datos de profesor actualizados correctamente');
            } else {
              toast.success('Usuario actualizado correctamente');
            }
          } catch (profesorError) {
            console.error('Error al actualizar profesor:', profesorError);
            toast.error(`Error al actualizar datos de profesor: ${profesorError.message}`);
          }
        } else {
          toast.success('Usuario actualizado correctamente');
        }

        // Recargar datos
        await fetchData();
      } else {
        // Crear el usuario primero
        const newUser = await usuariosService.create({
          ...userData,
          contrasena // Solo incluimos la contraseña al crear
        });
        
        if (!newUser || !newUser._id) {
          throw new Error('Error al crear el usuario: respuesta inválida del servidor');
        }

        // Crear la asignación de rol si se proporcionó un rolId
        if (rolId) {
          try {
            await usuariosHasRolService.create({
              usuarioId: newUser._id,
              rolId: rolId
            });
            
            // Obtener el rol completo
            const rol = await rolesService.getById(rolId);
            
            // Añadir el rol al nuevo usuario
            newUser.roles = rol ? [rol] : [];
            
          } catch (rolError) {
            // Si falla la asignación del rol, eliminar el usuario creado
            await usuariosService.delete(newUser._id);
            throw new Error(`Error al asignar el rol: ${rolError.message}`);
          }
        } else {
          newUser.roles = [];
        }

        // Si es un profesor, crear el registro de profesor
        if (isProfesorRole) {
          try {
            // Asegurar que las especialidades no estén vacías
            const especialidadesArray = especialidades && Array.isArray(especialidades) && especialidades.length > 0 
              ? especialidades 
              : ['Piano']; // Especialidad por defecto si no se proporciona
            
            const profesorData = {
              usuarioId: newUser._id,
              nombres: userData.nombre,
              apellidos: userData.apellido,
              tipoDocumento: userData.tipo_de_documento,
              identificacion: userData.documento,
              telefono: telefono || '3000000000',
              correo: userData.correo,
              especialidades: especialidadesArray,
              estado: 'Activo'
            };
            
            if (direccion) {
              profesorData.direccion = direccion;
            }
            
            console.log('Datos del profesor a crear:', profesorData);
            
            // Crear nuevo profesor
            const profesorResponse = await axios.post('http://localhost:3000/api/profesores', profesorData);
            
            console.log('Profesor creado correctamente:', profesorResponse.data);
            toast.success('Usuario y profesor creados correctamente');
          } catch (profesorError) {
            console.error('Error al crear profesor:', profesorError);
            console.error('Detalles del error:', profesorError.response?.data);
            toast.error(`Error al crear profesor: ${profesorError.response?.data?.details || profesorError.message}`);
            // No eliminamos el usuario creado, pero mostramos el error
          }
        }

        setUsuarios((prev) => [...prev, newUser]);
      }
      handleCloseForm();
    } catch (error) {
      console.error('Error al guardar usuario:', error);
      toast.error(`Error: ${error.message || 'Ocurrió un error al procesar la solicitud'}`);
    }
  };

  // Estado para controlar los campos adicionales del profesor
  const [showProfesorFields, setShowProfesorFields] = useState(false);
  
  // Cuando se abre el formulario para editar, verificar si el usuario ya tiene rol de profesor
  useEffect(() => {
    if (isEditing && selectedUsuario && selectedUsuario.roles) {
      console.log('Usuario seleccionado para editar:', selectedUsuario);
      
      // Buscar el rol de profesor
      const profesorRol = roles.find(rol => rol.nombre.toLowerCase().includes('profesor'));
      
      // Verificar si el usuario tiene rol de profesor
      if (roles.length > 0) {
        const tieneRolProfesor = selectedUsuario.roles.some(rol => 
          (typeof rol === 'string' && rol === profesorRol?._id) ||
          (typeof rol === 'object' && rol._id === profesorRol?._id)
        );
        
        if (tieneRolProfesor) {
          setShowProfesorFields(true);
          
          // Cargar información adicional del profesor si existe
          const cargarDatosProfesor = async () => {
            try {
              const response = await axios.get(`http://localhost:3000/api/profesores?usuarioId=${selectedUsuario._id}`);
              if (response.data && response.data.length > 0) {
                const profesorData = response.data[0];
                // Actualizar el usuario seleccionado con los datos del profesor
                setSelectedUsuario(prev => ({
                  ...prev,
                  telefono: profesorData.telefono || '',
                  direccion: profesorData.direccion || '',
                  especialidades: profesorData.especialidades || []
                }));
              }
            } catch (error) {
              console.error('Error al cargar datos del profesor:', error);
            }
          };
          
          cargarDatosProfesor();
        } else {
          setShowProfesorFields(false);
        }
      }
    } else if (!isEditing) {
      setShowProfesorFields(false);
    }
  }, [isEditing, selectedUsuario?._id, roles]);

  // Definir los campos del formulario según el modo (crear o editar)
  const formFields = useMemo(() => [
    // Solo mostrar campo de rol al crear nuevo usuario, no al editar
    ...(!isEditing ? [{
      id: "rolId",
      label: "Rol",
      type: "select",
      required: true,
      validation: (value) => !value ? "Debe seleccionar un rol" : null,
      options: roles
        .filter(role => role.nombre === 'Administrador' || role.nombre === 'Profesor')
        .map(role => ({
          value: role._id,
          label: role.nombre
        })),
      onChange: (value) => {
        // Verificar si es rol de profesor para mostrar campos adicionales
        const profesorRol = roles.find(rol => rol.nombre.toLowerCase().includes('profesor'));
        setShowProfesorFields(value === profesorRol?._id);
      }
    }] : [
      // Campo especial para mostrar y editar roles en modo edición
      {
        id: "rolesAsignados",
        label: "Roles Asignados",
        type: "custom",
        render: (value, onChange, formData) => {
          const userRoles = selectedUsuario?.roles || [];
          return (
            <Box sx={{ mt: 1 }}>
              <Typography variant="body2" sx={{ mb: 1, fontWeight: 500 }}>
                Roles actuales:
              </Typography>
              {userRoles.length > 0 ? (
                <Box sx={{ mb: 2 }}>
                  {userRoles.map((rol, index) => (
                    <Chip
                      key={index}
                      label={rol.nombre || 'Rol sin nombre'}
                      variant="outlined"
                      sx={{ mr: 1, mb: 1 }}
                    />
                  ))}
                </Box>
              ) : (
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  Sin roles asignados
                </Typography>
              )}

            </Box>
          );
        }
      }
    ]),
    // Campos adicionales para profesor
    ...(showProfesorFields ? [
      { 
        id: "telefono", 
        label: "Teléfono", 
        type: "text", 
        required: true,
        validation: (value) => !value ? "El teléfono es requerido" : null
      },
      { 
        id: "direccion", 
        label: "Dirección", 
        type: "text", 
        required: false
      },
      {
        id: "especialidades",
        label: "Especialidades",
        type: "multiSelect",
        required: true,
        validation: (value) => {
          if (!value || !Array.isArray(value) || value.length === 0) return "Debe seleccionar al menos una especialidad";
          return null;
        },
        options: [
          { value: "Piano", label: "Piano" },
          { value: "Guitarra", label: "Guitarra" },
          { value: "Violín", label: "Violín" },
          { value: "Batería", label: "Batería" },
          { value: "Canto", label: "Canto" },
          { value: "Flauta", label: "Flauta" },
          { value: "Saxofón", label: "Saxofón" },
          { value: "Trompeta", label: "Trompeta" },
          { value: "Bajo", label: "Bajo" },
          { value: "Teoría Musical", label: "Teoría Musical" }
        ]
      }
    ] : []),
    { 
      id: "nombre", 
      label: "Nombre", 
      type: "text", 
      required: true,
      validation: (value) => !value ? "El nombre es requerido" : null
    },
    { 
      id: "apellido", 
      label: "Apellido", 
      type: "text", 
      required: true,
      validation: (value) => !value ? "El apellido es requerido" : null
    },
    {
      id: "tipo_de_documento",
      label: "Tipo de Documento",
      type: "select",
      required: true,
      validation: (value) => !value ? "El tipo de documento es requerido" : null,
      options: [
        { value: "TI", label: "Tarjeta de Identidad" },
        { value: "CC", label: "Cédula de Ciudadanía" },
        { value: "CE", label: "Cédula de Extranjería" },
        { value: "PP", label: "Pasaporte" },
        { value: "NIT", label: "NIT" }
      ]
    },
    { 
      id: "documento", 
      label: "N° Documento", 
      type: "text", 
      required: true,
      validation: (value) => !value ? "El número de documento es requerido" : null
    },
    { 
      id: "correo", 
      label: "Correo", 
      type: "email", 
      required: true,
      validation: (value) => {
        if (!value) return "El correo es requerido";
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) return "El correo no es válido";
        return null;
      }
    },
    // Mostrar campos de contraseña solo al crear nuevo usuario
    ...(!isEditing ? [
      { 
        id: "contrasena", 
        label: "Contraseña", 
        type: "password", 
        required: true,
        validation: (value) => {
          if (!value) return "La contraseña es requerida";
          const passwordRegex = /^(?=.[a-z])(?=.[A-Z])(?=.\d)(?=.[@$!%?&])[A-Za-z\d@$!%?&]{8,}$/;
          return passwordRegex.test(value) ? null : "La contraseña debe tener mínimo 8 caracteres con mayúsculas, minúsculas, números y símbolos";
        }
      },
      { 
        id: "confirmacionContrasena", 
        label: "Confirmar Contraseña", 
        type: "password", 
        required: true,
        validation: (value, formData) => {
          if (!value) return "La confirmación de contraseña es requerida";
          if (value !== formData.contrasena) return "Las contraseñas no coinciden";
          return null;
        }
      }
    ] : []),
    { id: "estado", label: "Estado", type: "switch", defaultValue: true },
  ], [roles, isEditing, showProfesorFields]);

  const handleToggleStatus = async (usuarioId) => {
    try {
      const usuario = usuarios.find(u => u._id === usuarioId);
      const updatedUser = await usuariosService.update(usuarioId, {
        ...usuario,
        estado: !usuario.estado
      });
      setUsuarios((prev) => prev.map((item) => (item._id === usuarioId ? updatedUser : item)));
    } catch (error) {
      console.error('Error al actualizar estado:', error);
    }
  }

  const handleSaveRoleAssignment = async (data) => {
    try {
      const { userId, roleIds, primaryRoleId } = data;
      console.log('Guardando asignación de roles:', { userId, roleIds, primaryRoleId });

      // Primero eliminar todas las asignaciones existentes del usuario
      try {
        await usuariosHasRolService.deleteByUsuarioId(userId);
        console.log('Asignaciones anteriores eliminadas');
      } catch (error) {
        console.log('No había asignaciones anteriores o error al eliminar:', error);
      }

      // Crear nuevas asignaciones para cada rol seleccionado
      console.log('Creando asignaciones para roles:', roleIds);
      const assignmentPromises = roleIds.map(roleId => {
        const newAssignment = {
          usuarioId: userId,
          rolId: roleId,
          estado: true,
          esPrimario: roleId === primaryRoleId
        };
        console.log('Creando asignación:', newAssignment);
        return usuariosHasRolService.create(newAssignment);
      });

      const results = await Promise.allSettled(assignmentPromises);
      
      // Verificar si hubo errores en las asignaciones
      const errors = results.filter(result => result.status === 'rejected');
      if (errors.length > 0) {
        console.warn('Algunos roles no pudieron ser asignados:', errors);
        // Continuar con el proceso aunque haya algunos errores
      }

      // Recargar todos los datos usando la función fetchData
      const usuariosConRoles = await fetchData();
      
      // Actualizar el usuario seleccionado si está siendo mostrado
      if (selectedUsuario && selectedUsuario._id === userId) {
        const usuarioActualizado = usuariosConRoles.find(u => u._id === userId);
        setSelectedUsuario(usuarioActualizado);
      }

      // Cerrar el modal de asignación de roles
      setRoleAssignmentOpen(false);
      
      // Mostrar mensaje de éxito
      toast.success('Roles asignados correctamente');
      
    } catch (error) {
      console.error('Error al asignar roles:', error);
      toast.error('Error al asignar roles: ' + error.message);
    }
  }

  const columns = [
    { id: "nombre", label: "Nombre" },
    { id: "apellido", label: "Apellido" },
    { id: "tipo_de_documento", label: "Tipo de Documento" },
    { id: "documento", label: "N° Documento" },
    { id: "correo", label: "Correo" },
    {
      id: "roles",
      label: "Roles Actuales",
      render: (_, row) => {
        if (row.roles && Array.isArray(row.roles) && row.roles.length > 0) {
          return row.roles.map(rol => {
            if (typeof rol === 'object' && rol !== null) {
              return rol.nombre || rol.name || 'Rol sin nombre';
            }
            return 'Rol sin nombre';
          }).join(", ");
        }
        return "Sin roles asignados";
      }
    },
    {
      id: "estado",
      label: "Estado",
      render: (value, row) => <StatusButton active={value} onClick={() => handleToggleStatus(row._id)} />,
    }
  ]

  const detailFields = [
    { id: "nombre", label: "Nombre" },
    { id: "apellido", label: "Apellido" },
    { id: "tipo_de_documento", label: "Tipo de Documento" },
    { id: "documento", label: "Número de Documento" },
    { id: "correo", label: "Correo" },
    {
      id: "roles",
      label: "Roles Asignados",
      render: (value, row) => {
        // Usar selectedUsuario si está disponible, sino usar la fila
        const usuario = selectedUsuario || row;
        const userRoles = usuario?.roles;
        
        if (userRoles && Array.isArray(userRoles) && userRoles.length > 0) {
          return userRoles.map(rol => {
            if (typeof rol === 'object' && rol !== null) {
              return rol.nombre || rol.name || 'Rol sin nombre';
            }
            return 'Rol sin nombre';
          }).join(", ");
        }
        return "Sin roles asignados";
      },
    },
    { id: "estado", label: "Estado", render: (value) => <StatusButton active={value} /> },
  ]

  return (
    <div className="usuarios-container">
      <GenericList
        data={usuarios}
        columns={columns}
        onEdit={handleEdit}
        onDelete={handleDelete}
        onView={handleView}
        onCreate={handleCreate}
        title="Gestión de Usuarios"
      />

      <DetailModal
        title={`Detalle del Usuario: ${selectedUsuario?.nombre}`}
        data={selectedUsuario}
        fields={detailFields}
        open={detailModalOpen}
        onClose={handleCloseDetail}
      />

      <FormModal
        title={isEditing ? "Editar Usuario" : "Crear Nuevo Usuario"}
        fields={formFields}
        initialData={selectedUsuario}
        open={formModalOpen}
        onClose={handleCloseForm}
        onSubmit={handleSubmit}
      />

      <UserRoleAssignment
        open={roleAssignmentOpen}
        onClose={() => setRoleAssignmentOpen(false)}
        usuario={selectedUsuario}
        roles={roles}
        onSave={handleSaveRoleAssignment}
      />

    </div>
  )
}

export default Usuarios