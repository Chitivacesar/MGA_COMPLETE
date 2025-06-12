'use client'

import { useState, useEffect, StrictMode } from "react"
import { GenericList } from "../../../shared/components/GenericList"
import { DetailModal } from "../../../shared/components/DetailModal"
import { FormModal } from "../../../shared/components/FormModal"
import { StatusButton } from "../../../shared/components/StatusButton"
import { UserRoleAssignment } from "../../../shared/components/UserRoleAssignment"
import { Button, Chip, Box, IconButton } from "@mui/material"
import { PersonAdd as PersonAddIcon, Visibility as VisibilityIcon, VisibilityOff as VisibilityOffIcon } from "@mui/icons-material"

const Usuarios = () => {
  useEffect(() => {
    // Ensure the component is mounted before rendering
    return () => {
      // Cleanup
    }
  }, [])

  // Simulamos obtener los roles desde algún servicio o API
  const [roles, setRoles] = useState([
    { id: 1, nombre: "Administrador", descripcion: "Control total del sistema", estado: true },
    { id: 2, nombre: "Secretario", descripcion: "Gestión administrativa", estado: true },
    { id: 3, nombre: "Profesor", descripcion: "Gestión de cursos", estado: true },
    { id: 4, nombre: "Beneficiario", descripcion: "Usuario beneficiario del sistema", estado: true },
  ])

  const [usuarios, setUsuarios] = useState([
    {
      id: 1,
      nombre: "Juan Pérez",
      tipoDocumento: "CC",
      documento: "12345678",
      tel: "123456789",
      correo: "juan@example.com",
      contraseña: "admin123",
      estado: true,
      roles: [{ id: 1, nombre: "Administrador" }],
      primaryRoleId: 1,
    },
    {
      id: 2,
      nombre: "Ana Gómez",
      tipoDocumento: "TI",
      documento: "87654321",
      tel: "987654321",
      correo: "ana@example.com",
      contraseña: "profesor123",
      estado: false,
      roles: [
        { id: 3, nombre: "Profesor" }
      ],
      primaryRoleId: 3,
    },
  ])

  const [showPasswords, setShowPasswords] = useState({})

  const [selectedUsuario, setSelectedUsuario] = useState(null)
  const [detailModalOpen, setDetailModalOpen] = useState(false)
  const [formModalOpen, setFormModalOpen] = useState(false)
  const [roleAssignmentOpen, setRoleAssignmentOpen] = useState(false)
  const [isEditing, setIsEditing] = useState(false)

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

  const handleDelete = (usuario) => {
    const confirmDelete = window.confirm(`¿Está seguro de eliminar al usuario ${usuario.nombre}?`)
    if (confirmDelete) {
      setUsuarios((prev) => prev.filter((item) => item.id !== usuario.id))
    }
  }

  const handleView = (usuario) => {
    setSelectedUsuario(usuario)
    setDetailModalOpen(true)
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

  const handleSubmit = (formData) => {
    // Eliminar el campo de confirmación de contraseña antes de guardar
    const { confirmarContraseña, primaryRoleId, ...userData } = formData;

    // Find the selected role
    const selectedRole = roles.find(role => role.id === primaryRoleId);

    if (isEditing) {
      setUsuarios((prev) =>
        prev.map((item) =>
          item.id === selectedUsuario.id
            ? {
                ...userData,
                id: item.id,
                roles: selectedRole ? [selectedRole] : [],
                primaryRoleId: primaryRoleId,
              }
            : item,
        ),
      )
    } else {
      const newId = Math.max(...usuarios.map((u) => u.id)) + 1
      setUsuarios((prev) => [
        ...prev,
        {
          ...userData,
          id: newId,
          roles: selectedRole ? [selectedRole] : [],
          primaryRoleId: primaryRoleId,
        },
      ])
    }
    handleCloseForm()
  }

  const handleToggleStatus = (usuarioId) => {
    setUsuarios((prev) => prev.map((item) => (item.id === usuarioId ? { ...item, estado: !item.estado } : item)))
  }

  const handleAssignRoles = (usuario) => {
    setSelectedUsuario(usuario)
    setRoleAssignmentOpen(true)
  }

  const handleSaveRoleAssignment = (data) => {
    const { userId, roleIds, primaryRoleId } = data

    // Actualizar el usuario con los roles asignados
    setUsuarios((prev) =>
      prev.map((user) => {
        if (user.id === userId) {
          // Obtener los objetos de rol completos basados en los IDs
          const assignedRoles = roles.filter((role) => roleIds.includes(role.id))

          return {
            ...user,
            roles: assignedRoles,
            primaryRoleId: primaryRoleId,
          }
        }
        return user
      }),
    )
  }

  function getPrimaryRoleName(user) {
    // Verificar si el usuario y sus roles existen
    if (!user) return 'Usuario no definido';
    if (!user.roles) return 'Sin roles asignados';
    if (!Array.isArray(user.roles)) return 'Formato de roles inválido';
    if (user.roles.length === 0) return 'Sin roles asignados';
    
    // Si no hay rol principal asignado
    if (!user.primaryRoleId) return 'Sin rol principal';
    
    // Buscar el rol principal entre los roles asignados
    const primaryRole = user.roles.find(role => role && role.id === user.primaryRoleId);
    return primaryRole && primaryRole.nombre ? primaryRole.nombre : 'Rol principal no encontrado';
  }

  const columns = [
    { id: "id", label: "ID" },
    { id: "nombre", label: "Nombre" },
    { id: "apellido", label: "Apellido" },
    { id: "tipoDocumento", label: "Tipo Documento" },
    { id: "documento", label: "N° Documento" },
    { id: "tel", label: "Tel" },
    { id: "correo", label: "Correo" },
    {
      id: "roles",
      label: "Roles",
      render: (value, row) => {
        if (!value || value.length === 0) return "—";
        return value.map(role => role.nombre).join(", ");
      },
    },
    {
      id: "estado",
      label: "Estado",
      render: (value, row) => <StatusButton active={value} onClick={() => handleToggleStatus(row.id)} />,
    },
    {
      id: "actions",
      label: "Gestión de Roles",  // Changed from "Acciones"
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
    { id: "id", label: "ID" },
    { id: "nombre", label: "Nombre" },
    {
      id: "tipoDocumento",
      label: "Tipo de Documento",
      render: (value) => value || "—"
    },
    {
      id: "documento",
      label: "Documento",
      render: (value, row) => `${row.tipoDocumento || ""} ${value}`
    },
    { id: "tel", label: "Tel" },
    { id: "correo", label: "Correo" },
    {
      id: "contraseña",
      label: "Contraseña",
      render: (value, row) => (
        <Box sx={{ display: "flex", alignItems: "center" }}>
          {showPasswords[row.id] ? value : "••••••••"}
          <IconButton
            size="small"
            onClick={() => setShowPasswords(prev => ({ ...prev, [row.id]: !prev[row.id] }))}
          >
            {showPasswords[row.id] ? <VisibilityOffIcon /> : <VisibilityIcon />}
          </IconButton>
        </Box>
      ),
    },
    {
      id: "roles",
      label: "Roles",
      render: (value, row) => getPrimaryRoleName(row)
    },
    {
      id: "primaryRoleId",
      label: "Rol Principal",
      render: (value, row) => getPrimaryRoleName(row),
    },
    { id: "estado", label: "Estado", render: (value) => <StatusButton active={value} /> },
  ]

  const formFields = [
    { id: "nombre", label: "Nombre", type: "text", required: true },
    { id: "apellido", label: "Apellido", type: "text", required: true },
    {
      id: "tipoDocumento",
      label: "Tipo de Documento",
      type: "select",
      required: true,
      options: [
        { value: "TI", label: "TI - Tarjeta de Identidad" },
        { value: "CC", label: "CC - Cédula de Ciudadanía" },
        { value: "CE", label: "CE - Cédula de Extranjería" },
        { value: "TE", label: "TE - Tarjeta de Extranjería" }
      ]
    },
    { id: "documento", label: "N° Documento" },
    { id: "tel", label: "Tel", type: "text", required: true },
    { id: "correo", label: "Correo", type: "email", required: true },
    {
      id: "primaryRoleId",
      label: "Rol",
      type: "select",
      required: true,
      options: roles.map(role => ({
        value: role.id,
        label: role.nombre
      }))
    },
    { id: "contraseña", label: "Contraseña", type: "password", required: true },
    { id: "confirmarContraseña", label: "Confirmar Contraseña", type: "password", required: true,
      validation: (value, formData) => value === formData.contraseña ? null : "Las contraseñas no coinciden" },
    { id: "estado", label: "Estado", type: "switch", defaultValue: true },
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
        user={selectedUsuario}
        allRoles={roles}
        onSave={handleSaveRoleAssignment}
      />
    </div>
  )
}

export default Usuarios
