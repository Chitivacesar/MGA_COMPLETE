'use client'

import { useState, useEffect } from "react"
import { GenericList } from "../../../shared/components/GenericList"
import { DetailModal } from "../../../shared/components/DetailModal"
import { FormModal } from "../../../shared/components/FormModal"
import { StatusButton } from "../../../shared/components/StatusButton"
import { UserRoleAssignment } from "../../../shared/components/UserRoleAssignment"
import { Button, Box, IconButton } from "@mui/material"
import { PersonAdd as PersonAddIcon, Visibility as VisibilityIcon, VisibilityOff as VisibilityOffIcon } from "@mui/icons-material"
import { usuariosService, rolesService, usuariosHasRolService } from "../../../shared/services/api"

const Usuarios = () => {
  const [roles, setRoles] = useState([])
  const [usuarios, setUsuarios] = useState([])
  const [showPasswords, setShowPasswords] = useState({})
  const [selectedUsuario, setSelectedUsuario] = useState(null)
  const [detailModalOpen, setDetailModalOpen] = useState(false)
  const [formModalOpen, setFormModalOpen] = useState(false)
  const [roleAssignmentOpen, setRoleAssignmentOpen] = useState(false)
  const [isEditing, setIsEditing] = useState(false)

  useEffect(() => {
    const fetchData = async () => {
      try {
        console.log('Iniciando fetchData...');
        const [usuariosData, rolesData, usuariosHasRolData] = await Promise.all([
          usuariosService.getAll(),
          rolesService.getAll(),
          usuariosHasRolService.getAll()
        ]);
        
        console.log('Datos recibidos:', { usuariosData, rolesData, usuariosHasRolData });
        
        // Verificar si tenemos los datos necesarios
        if (!Array.isArray(usuariosData)) {
          throw new Error('No se recibieron datos de usuarios válidos');
        }
        
        // Asignar roles a cada usuario, manejando el caso cuando no hay datos de roles
        const usuariosConRoles = usuariosData.map(usuario => {
          const asignacionesUsuario = Array.isArray(usuariosHasRolData) 
            ? usuariosHasRolData.filter(
                asignacion => asignacion?.usuarioId?._id === usuario._id
              )
            : [];
          
          const rolesUsuario = asignacionesUsuario
            .map(asignacion => asignacion?.rolId)
            .filter(Boolean);
          
          return {
            ...usuario,
            roles: rolesUsuario
          };
        });
        
        setUsuarios(usuariosConRoles);
        setRoles(Array.isArray(rolesData) ? rolesData : []);
      } catch (error) {
        console.error('Error detallado al cargar datos:', error);
      }
    };

    fetchData();
  }, []);

  const handleCreate = () => {
    setIsEditing(false)
    setSelectedUsuario(null)
    setFormModalOpen(true)
  }

  const handleEdit = (usuario) => {
    setIsEditing(true)
    setSelectedUsuario(usuario)
    setFormModalOpen(true)
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

  // Modificar formFields para hacer los campos de contraseña opcionales al editar
  const formFields = [
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
    { 
      id: "contrasena", 
      label: "Contraseña", 
      type: "password", 
      required: !isEditing, // Solo requerido al crear
      validation: (value) => {
        if (!isEditing && !value) return "La contraseña es requerida";
        if (value) {
          const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
          return passwordRegex.test(value) ? null : "La contraseña debe tener mínimo 8 caracteres con mayúsculas, minúsculas, números y símbolos";
        }
        return null;
      }
    },
    { 
      id: "confirmacionContrasena", 
      label: "Confirmar Contraseña", 
      type: "password", 
      required: !isEditing, // Solo requerido al crear
      validation: (value, formData) => {
        if (!isEditing && !value) return "La confirmación de contraseña es requerida";
        if (value && value !== formData.contrasena) return "Las contraseñas no coinciden";
        return null;
      }
    },
    { id: "estado", label: "Estado", type: "switch", defaultValue: true },
  ];

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

      // Obtener las asignaciones actuales del usuario
      const allAssignments = await usuariosHasRolService.getAll();
      const userAssignments = allAssignments.filter(assignment => assignment.usuarioId === userId);
      
      // Eliminar las asignaciones existentes
      for (const assignment of userAssignments) {
        await usuariosHasRolService.delete(assignment._id);
      }

      // Crear nuevas asignaciones de roles
      const assignmentPromises = roleIds.map(roleId =>
        usuariosHasRolService.create({
          usuarioId: userId,
          rolId: roleId
        })
      );

      await Promise.all(assignmentPromises);

      // Actualizar la lista de usuarios
      const updatedUser = await usuariosService.getById(userId);
      
      // Obtener los roles completos para el usuario
      const roles = await rolesService.getAll();
      const userRoles = roles.filter(role => roleIds.includes(role._id));
      
      // Añadir los roles al usuario actualizado
      updatedUser.roles = userRoles;
      
      setUsuarios(prev =>
        prev.map(user => user._id === userId ? updatedUser : user)
      );
    } catch (error) {
      console.error('Error al asignar roles:', error);
    }
  }

  const columns = [
    { id: "nombre", label: "Nombre" },
    { id: "apellido", label: "Apellido" },
    { id: "documento", label: "N° Documento" },
    { id: "correo", label: "Correo" },
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
    { id: "documento", label: "Documento" },
    { id: "correo", label: "Correo" },
    {
      id: "roles",
      label: "Rol",
      render: (value, row) => {
        console.log('Renderizando roles:', { value, row, selectedUsuario });
        // Si estamos en el modal de detalle, usar selectedUsuario
        if (detailModalOpen && selectedUsuario) {
          const userRoles = selectedUsuario.roles;
          console.log('Roles del usuario seleccionado:', userRoles);
          if (userRoles && userRoles.length > 0) {
            return userRoles.map(rol => {
              // Verificar si el rol es un objeto completo o solo tiene el ID
              if (typeof rol === 'object' && rol !== null) {
                return rol.nombre || (rol.rolId && rol.rolId.nombre) || 'Rol sin nombre';
              }
              return 'Rol sin nombre';
            }).join(", ");
          }
          return "Sin rol asignado";
        }
        
        // Si estamos en la tabla, usar el valor de la fila
        if (value && Array.isArray(value) && value.length > 0) {
          return value.map(rol => {
            if (typeof rol === 'object' && rol !== null) {
              return rol.nombre || (rol.rolId && rol.rolId.nombre) || 'Rol sin nombre';
            }
            return 'Rol sin nombre';
          }).join(", ");
        }
        return "Sin rol asignado";
      },
    },
    // Se ha eliminado la visualización de contraseña por motivos de seguridad
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
