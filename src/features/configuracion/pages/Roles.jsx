"use client"

import { useState } from "react"
import { GenericList2 } from "../../../shared/components/genericlist2"
import { DetailModal } from "../../../shared/components/DetailModal"
import { FormModal } from "../../../shared/components/formModal2"
import { StatusButton } from "../../../shared/components/StatusButton"
import { RolePrivilegeAssignment } from "../../../shared/components/RolePrivilegeAssignment"
import { RoleViewPermissionAssignment } from "../../../shared/components/RoleViewPermissionAssignment"
import { Button, Chip, Box, Typography } from "@mui/material"
// Corregir la importación - asegúrate de que la ruta sea correcta
import SuccessAlert from "../../../shared/components/Alert"

const Roles = () => {
  // Estado para la alerta de éxito
  const [successAlert, setSuccessAlert] = useState({
    open: false,
    message: ""
  })

  // Función para cerrar la alerta
  const handleCloseSuccessAlert = () => {
    setSuccessAlert({...successAlert, open: false})
  }

  // Función para mostrar la alerta
  const showSuccessAlert = (message) => {
    setSuccessAlert({
      open: true,
      message
    })
  }

  const [privilegios, setPrivilegios] = useState([
    { id: 1, nombre_privilegio: "Crear" },
    { id: 2, nombre_privilegio: "Ver" },
    { id: 3, nombre_privilegio: "Editar" },
    { id: 4, nombre_privilegio: "Eliminar" },
  ])

  // Initial roles data with privileges
  const [roles, setRoles] = useState([
    {
      id: 1,
      nombre: "Administrador",
      descripcion: "Control total del sistema",
      fecha: "5/11/2024",
      estado: true,
      privileges: [
        { id: 1, nombre_privilegio: "Crear" },
        { id: 2, nombre_privilegio: "Ver" },
        { id: 3, nombre_privilegio: "Editar" },
        { id: 4, nombre_privilegio: "Eliminar" },
      ],
      viewPermissions: [
        "dashboard",
        "servicios-musicales-profesores",
        "servicios-musicales-programacion-profesores",
        "servicios-musicales-cursos-matriculas",
        "servicios-musicales-aulas",
        "servicios-musicales-clases",
        "venta-servicios-clientes",
        "venta-servicios-beneficiarios",
        "venta-servicios-venta-matriculas",
        "venta-servicios-pagos",
        "venta-servicios-programacion-clases",
        "venta-servicios-asistencia",
        "configuracion-roles",
        "configuracion-usuarios",
      ],
    },
    {
      id: 2,
      nombre: "Secretario",
      descripcion: "Gestión administrativa",
      fecha: "5/11/2024",
      estado: true,
      privileges: [
        { id: 1, nombre_privilegio: "Crear" },
        { id: 2, nombre_privilegio: "Ver" },
      ],
      viewPermissions: [
        "dashboard",
        "venta-servicios",
        "venta-servicios-clientes",
        "venta-servicios-beneficiarios",
        "venta-servicios-venta-matriculas",
        "venta-servicios-pagos",
      ],
    },
    {
      id: 3,
      nombre: "Profesor",
      descripcion: "Gestión de cursos y estudiantes",
      fecha: "5/11/2024",
      estado: true,
      privileges: [
        { id: 2, nombre_privilegio: "Ver" },
        { id: 3, nombre_privilegio: "Editar" },
      ],
      viewPermissions: [
        "dashboard",
        "servicios-musicales-clases",
        "venta-servicios-beneficiarios",
        "venta-servicios-asistencia",
      ],
    },
    {
      id: 4,
      nombre: "Beneficiarios",
      descripcion: "Acceso limitado para beneficiarios",
      fecha: "5/11/2024",
      estado: true,
      privileges: [{ id: 2, nombre_privilegio: "Ver" }],
      viewPermissions: ["dashboard"],
    },
  ])

  const [selectedRole, setSelectedRole] = useState(null)
  const [detailModalOpen, setDetailModalOpen] = useState(false)
  const [formModalOpen, setFormModalOpen] = useState(false)
  const [privilegeAssignmentOpen, setPrivilegeAssignmentOpen] = useState(false)
  const [viewPermissionAssignmentOpen, setViewPermissionAssignmentOpen] = useState(false)
  const [isEditing, setIsEditing] = useState(false)

  const handleCreate = () => {
    setIsEditing(false)
    setSelectedRole(null)
    setFormModalOpen(true)
  }

  const handleEdit = (role) => {
    setIsEditing(true)
    setSelectedRole(role)
    setFormModalOpen(true)
  }

  const handleDelete = (role) => {
    const confirmDelete = window.confirm(`¿Está seguro de eliminar el rol ${role.nombre}?`)
    if (confirmDelete) {
      setRoles((prev) => prev.filter((item) => item.id !== role.id))
      showSuccessAlert(`El rol ${role.nombre} ha sido eliminado correctamente`)
    }
  }

  const handleView = (role) => {
    setSelectedRole(role)
    setDetailModalOpen(true)
  }

  const handleCloseDetail = () => {
    setDetailModalOpen(false)
    setSelectedRole(null)
  }

  const handleCloseForm = () => {
    setFormModalOpen(false)
    setSelectedRole(null)
    setIsEditing(false)
  }

  const handleSubmit = (formData) => {
    if (isEditing) {
      setRoles((prev) =>
        prev.map((item) =>
          item.id === selectedRole.id
            ? {
                ...formData,
                id: item.id,
                fecha: item.fecha,
                privileges: item.privileges || [],
                viewPermissions: item.viewPermissions || [],
              }
            : item,
        ),
      )
      showSuccessAlert(`El rol ${formData.nombre} ha sido actualizado correctamente`)
    } else {
      // Generate a new ID for new roles
      const newId = Math.max(...roles.map((r) => r.id)) + 1
      const today = new Date().toLocaleDateString()
      setRoles((prev) => [
        ...prev,
        {
          ...formData,
          id: newId,
          fecha: today,
          privileges: [],
          viewPermissions: [],
        },
      ])
      showSuccessAlert(`El rol ${formData.nombre} ha sido creado correctamente`)
    }
    handleCloseForm()
  }

  const handleToggleStatus = (roleId) => {
    setRoles((prev) => prev.map((item) => (item.id === roleId ? { ...item, estado: !item.estado } : item)))
  }

  const handleAssignPrivileges = (role) => {
    setSelectedRole(role)
    setPrivilegeAssignmentOpen(true)
  }

  const handleAssignViewPermissions = (role) => {
    setSelectedRole(role)
    setViewPermissionAssignmentOpen(true)
  }

  const handleSavePrivilegeAssignment = (data) => {
    const { roleId, privilegeIds } = data

    // Actualizar el rol con los privilegios asignados
    setRoles((prev) => {
      const updatedRoles = prev.map((role) => {
        if (role.id === roleId) {
          // Obtener los objetos de privilegio completos basados en los IDs
          const assignedPrivileges = privilegios.filter((priv) => privilegeIds.includes(priv.id))

          return {
            ...role,
            privileges: assignedPrivileges,
          }
        }
        return role
      })
      
      const updatedRole = updatedRoles.find(role => role.id === roleId)
      showSuccessAlert(`Privilegios actualizados para el rol ${updatedRole.nombre}`)
      return updatedRoles
    })
  }

  const handleSaveViewPermissionAssignment = (data) => {
    const { roleId, viewPermissions } = data

    // Actualizar el rol con los permisos de vista asignados
    setRoles((prev) =>
      prev.map((role) => {
        if (role.id === roleId) {
          return {
            ...role,
            viewPermissions,
          }
        }
        return role
      }),
    )
  }

  const countViewPermissions = (role) => {
    if (!role.viewPermissions) return 0
    return role.viewPermissions.length
  }

  // Modify the columns array to match the wireframe
  const columns = [
    { id: "id", label: "ID" },
    { id: "nombre", label: "Nombre" },
    { id: "descripcion", label: "Descripción" },
    { id: "fecha", label: "Fecha" },
    {
      id: "estado",
      label: "Estado",
      render: (value, row) => <StatusButton active={value} onClick={() => handleToggleStatus(row.id)} />,
    }
  ]

  const detailFields = [
    { id: "id", label: "IDENTIFICACIÓN" },
    { id: "nombre", label: "Nombre" },
    { id: "descripcion", label: "Descripción" },
    { id: "fecha", label: "Fecha de creación" },
    {
      id: "viewPermissions",
      label: "Vistas y Privilegios",
      render: (value, row) => (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          {value?.map((permission) => (
            <Box key={permission} sx={{ p: 2, bgcolor: 'background.paper', borderRadius: 1, boxShadow: 1 }}>
              <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 500 }}>
                {permission.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' - ')}
              </Typography>
              <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
                {row.privileges.map((priv) => (
                  <Chip
                    key={`${permission}-${priv.id}`}
                    label={priv.nombre_privilegio}
                    size="small"
                    color="primary"
                    variant="outlined"
                  />
                ))}
              </Box>
            </Box>
          ))}
        </Box>
      ),
    },
    { 
      id: "estado", 
      label: "Estado", 
      render: (value) => <StatusButton active={value} /> 
    },
  ]

  const formFields = [
    {
      id: "nombre",
      label: "Nombre",
      type: "text",
      required: true,
      size: "small"
    },
    {
      id: "descripcion",
      label: "Descripción",
      type: "text",
      required: true,
      size: "small"
    },
    {
      id: "permissions",
      type: "permissionsTable",
      section: "Permisos",
      modules: [
        {
          id: "panel",
          label: "Dashboard",
        },
        {
          id: "profesores",
          label: "Profesores"
        },
        {
          id: "programacion-profesores",
          label: "Programación de Profesores"
        },
        {
          id: "programacion-clases",
          label: "Programación de Clases"
        },
        {
          id: "cursos-matriculas",
          label: "Cursos/Matrículas"
        },
        {
          id: "aulas",
          label: "Aulas"
        },
        {
          id: "clases",
          label: "Clases"
        },
        {
          id: "clientes",
          label: "Clientes"
        },
        {
          id: "estudiantes",
          label: "Beneficiarios"
        },
        {
          id: "venta-matriculas",
          label: "Venta de Matrículas"
        },
        {
          id: "venta-cursos",
          label: "Venta de Cursos"
        },
        {
          id: "asistencia",
          label: "Asistencia"
        },
        {
          id: "pagos",
          label: "Pagos"
        },
        {
          id: "usuarios",
          label: "Usuarios"
        },
        {
          id: "roles",
          label: "Roles"
        }
      ],
      sx: {
        '& .MuiTableContainer-root': {
          maxHeight: '300px',
          overflowX: 'hidden',
          '& .MuiTableCell-root': {
            padding: '4px 6px',
            fontSize: '0.813rem'
          },
          '& .MuiTableCell-head': {
            backgroundColor: '#f5f5f5',
            fontWeight: 600,
            textDecoration: 'none'
          }
        },
        '& .MuiCheckbox-root': {
          padding: '2px'
        },
        '& .MuiFormGroup-root': {
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'flex-start',
          width: '100%',
          maxWidth: '500px',
          margin: '0 auto',
          '& .MuiFormControlLabel-root': {
            width: '100%',
            margin: '2px 0',
            paddingLeft: '8px'
          }
        }
      },
      actions: ["visualizar", "crear", "editar", "eliminar"]
    },
    {
      id: "estado",
      label: "Estado",
      type: "switch",
      defaultValue: true
    }
  ]

  return (
    <>
      <GenericList2
        data={roles}
        columns={columns}
        onEdit={handleEdit}
        onDelete={handleDelete}
        onCreate={handleCreate}
        onView={handleView}
        title="Roles"
        searchFields={["nombre", "descripcion"]} // Add searchable fields
      />

      <DetailModal
        title={`Detalle del Rol: ${selectedRole?.nombre}`}
        data={selectedRole}
        fields={detailFields}
        open={detailModalOpen}
        onClose={handleCloseDetail}
      />

      <FormModal  // This should match the import name
            title={isEditing ? "Editar Rol" : "Crear Nuevo Rol"}
            fields={formFields}
            initialData={selectedRole}
            open={formModalOpen}
            onClose={handleCloseForm}
            onSubmit={handleSubmit}
          />

      <RolePrivilegeAssignment
        open={privilegeAssignmentOpen}
        onClose={() => setPrivilegeAssignmentOpen(false)}
        role={selectedRole}
        allPrivileges={privilegios}
        onSave={handleSavePrivilegeAssignment}
      />

      <RoleViewPermissionAssignment
        open={viewPermissionAssignmentOpen}
        onClose={() => setViewPermissionAssignmentOpen(false)}
        role={selectedRole}
        onSave={handleSaveViewPermissionAssignment}
      />

      {/* Asegúrate de que el componente SuccessAlert esté incluido en el renderizado */}
      <SuccessAlert 
        open={successAlert.open} 
        message={successAlert.message} 
        onClose={handleCloseSuccessAlert} 
      />
    </>
  )
}

export default Roles
