

'use client'

import { useState, useEffect, useMemo } from "react"
import { GenericList } from "../../../shared/components/GenericList"
import { DetailModal } from "../../../shared/components/DetailModal"
import { FormModal } from "../../../shared/components/FormModal"
import { StatusButton } from "../../../shared/components/StatusButton"
import { UserRoleAssignment } from "../../../shared/components/UserRoleAssignment"
import { Button } from "@mui/material"
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

  useEffect(() => {
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
      } catch (error) {
        console.error('Error al cargar datos:', error);
      }
    };

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

      // Obtener todos los roles asignados al usuario
      const rolesAsignados = userAssignments.map(assignment => 
        assignment.rolId
      ).filter(Boolean);

      // Preparar el usuario con sus roles actuales
      const usuarioConRoles = {
        ...usuario,
        roles: rolesAsignados
      };

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

  const handleCloseForm = () => {
    setFormModalOpen(false)
    setSelectedUsuario(null)
    setIsEditing(false)
  }

  const handleSubmit = async (formData) => {
    try {
      const { confirmacionContrasena, rolId, contrasena, ...userData } = formData;

      if (isEditing) {
        // Al editar, no enviamos la contraseña
        const updatedUser = await usuariosService.update(selectedUsuario._id, userData);
        
        // Actualizar la asignación de rol si se proporcionó un rolId
        if (rolId) {
          try {
            // Obtener las asignaciones actuales del usuario
            const allAssignments = await usuariosHasRolService.getAll();
            const userAssignments = allAssignments.filter(assignment => 
              assignment.usuarioId && assignment.usuarioId._id === selectedUsuario._id
            );
            
            // Eliminar las asignaciones existentes
            for (const assignment of userAssignments) {
              await usuariosHasRolService.delete(assignment._id);
            }

            // Crear la nueva asignación de rol
            await usuariosHasRolService.create({
              usuarioId: selectedUsuario._id,
              rolId: rolId
            });
            
            // Obtener el rol completo
            const rol = await rolesService.getById(rolId);
            
            // Añadir el rol al usuario actualizado
            updatedUser.roles = rol ? [rol] : [];
          } catch (rolError) {
            console.error('Error al actualizar el rol:', rolError);
            throw new Error(`Error al actualizar el rol: ${rolError.message}`);
          }
        }

        setUsuarios((prev) =>
          prev.map((item) =>
            item._id === selectedUsuario._id ? updatedUser : item
          )
        );
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

        setUsuarios((prev) => [...prev, newUser]);
      }
      handleCloseForm();
    } catch (error) {
      console.error('Error al guardar usuario:', error);
      alert(`Error: ${error.message || 'Ocurrió un error al procesar la solicitud'}`);
    }
  };

  // Definir los campos del formulario según el modo (crear o editar)
  const formFields = useMemo(() => [
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
    {
      id: "rolId",
      label: "Rol",
      type: "select",
      required: true,
      validation: (value) => !value ? "Debe seleccionar un rol" : null,
      options: roles.map(role => ({
        value: role._id,
        label: role.nombre
      }))
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
          const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%?&])[A-Za-z\d@$!%?&]{8,}$/;
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
  ], [roles, isEditing]);

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

  const handleAssignRoles = (usuario) => {
    setSelectedUsuario(usuario)
    setRoleAssignmentOpen(true)
  }

  const handleSaveRoleAssignment = async (data) => {
    try {
      const { userId, roleIds } = data;
      console.log('Guardando asignación de roles:', { userId, roleIds });

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
          rolId: roleId
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

      // Obtener los roles actualizados del usuario usando el endpoint modificado
      const updatedRoles = await usuariosHasRolService.getByUsuarioId(userId);
      console.log('Roles actualizados del usuario:', updatedRoles);
      
      // Recargar todos los datos para asegurar que tenemos la información más actualizada
      const [updatedUsers, allRoles, updatedAssignments] = await Promise.all([
        usuariosService.getAll(),
        rolesService.getAll(),
        usuariosHasRolService.getAll()
      ]);

      // Procesar los usuarios con sus roles actualizados
      const usuariosConRoles = updatedUsers.map(usuario => {
        const asignacionesUsuario = updatedAssignments.filter(
          asignacion => asignacion.usuarioId && asignacion.usuarioId._id === usuario._id
        );

        // Agrupar por rolId y mantener solo la más reciente
        const asignacionesPorRol = asignacionesUsuario.reduce((acc, asignacion) => {
          const rolId = asignacion.rolId._id;
          if (!acc[rolId] || new Date(acc[rolId].createdAt) < new Date(asignacion.createdAt)) {
            acc[rolId] = asignacion;
          }
          return acc;
        }, {});

        // Filtrar solo las asignaciones activas
        const rolesActivos = Object.values(asignacionesPorRol)
          .filter(asignacion => asignacion.estado === true)
          .map(asignacion => asignacion.rolId);

        return {
          ...usuario,
          roles: rolesActivos
        };
      });

      // Actualizar el estado local
      setUsuarios(usuariosConRoles);
      setRoles(allRoles);

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
    },
    {
      id: "actions",
      label: "Gestión de Roles",
      render: (_, row) => (
        <Button
          size="small"
          startIcon={<PersonAddIcon />}
          onClick={() => handleAssignRoles(row)}
          sx={{
            borderRadius: "8px",
            textTransform: "none",
            fontWeight: 500,
          }}
        >
          Asignar Roles
        </Button>
      ),
    },
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
        onSave={handleSaveRoleAssignment}
        usuario={selectedUsuario}
        roles={roles}
      />
    </div>
  )
}

export default Usuarios