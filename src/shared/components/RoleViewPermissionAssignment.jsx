"use client"

import { useState, useEffect } from "react"
import {
  Dialog,
  Button,
  Typography,
  Box,
  IconButton,
  Checkbox,
  FormControlLabel,
  Switch,
  Collapse,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Divider,
  Paper,
} from "@mui/material"
import {
  Close as CloseIcon,
  ExpandLess,
  ExpandMore,
  Dashboard,
  MusicNote,
  ShoppingCart,
  Settings,
  People,
  Schedule,
  School,
  MeetingRoom,
  Class,
  Person,
  Payment,
  AssignmentTurnedIn,
  VpnKey,
  Security,
  Visibility as VisibilityIcon,
} from "@mui/icons-material"

// Estructura de las vistas de la aplicación
const viewsStructure = [
  {
    id: "dashboard",
    label: "Dashboard",
    icon: <Dashboard />,
  },
  {
    id: "servicios-musicales",
    label: "Servicios Musicales",
    icon: <MusicNote />,
    children: [
      { id: "profesores", label: "Profesores", icon: <People /> },
      { id: "programacion-profesores", label: "Programación de Profesores", icon: <Schedule /> },
      { id: "cursos-matriculas", label: "Cursos/Matrículas", icon: <School /> },
      { id: "aulas", label: "Aulas", icon: <MeetingRoom /> },
      { id: "clases", label: "Clases", icon: <Class /> },
      { id: "programacion-clases", label: "Programación de Clases", icon: <Schedule /> },
    ],
  },
  {
    id: "venta-servicios",
    label: "Venta de Servicios",
    icon: <ShoppingCart />,
    children: [
      { id: "clientes", label: "Clientes", icon: <People /> },
      { id: "beneficiarios", label: "Beneficiarios", icon: <School /> },
      { id: "venta-matriculas", label: "Venta de Matrículas", icon: <ShoppingCart /> },
      { id: "pagos", label: "Pagos", icon: <Payment /> },
      { id: "asistencia", label: "Asistencia", icon: <AssignmentTurnedIn /> },
    ],
  },
  {
    id: "configuracion",
    label: "Configuración",
    icon: <Settings />,
    children: [
      { id: "roles", label: "Roles", icon: <VpnKey /> },
      { id: "usuarios", label: "Usuarios", icon: <Person /> },
    ],
  },
]

// Función para aplanar la estructura de vistas en un array simple
const flattenViews = (views) => {
  const result = []
  views.forEach((view) => {
    result.push({ id: view.id, label: view.label })
    if (view.children) {
      view.children.forEach((child) => {
        result.push({ id: `${view.id}-${child.id}`, label: `${view.label} - ${child.label}` })
      })
    }
  })
  return result
}

export const RoleViewPermissionAssignment = ({ open, onClose, role, onSave }) => {
  const [expandedSections, setExpandedSections] = useState({})
  const [selectedViews, setSelectedViews] = useState({})
  const [selectAll, setSelectAll] = useState(false)

  useEffect(() => {
    if (role && open) {
      // Inicializar con los permisos de vista existentes del rol
      if (role.viewPermissions) {
        const permissions = {}
        role.viewPermissions.forEach((permission) => {
          permissions[permission] = true
        })
        setSelectedViews(permissions)

        // Verificar si todos están seleccionados
        const allViews = getAllViewIds()
        const allSelected = allViews.every((viewId) => permissions[viewId])
        setSelectAll(allSelected)
      } else {
        setSelectedViews({})
        setSelectAll(false)
      }

      // Expandir todas las secciones por defecto
      const sections = {}
      viewsStructure.forEach((section) => {
        if (section.children) {
          sections[section.id] = true
        }
      })
      setExpandedSections(sections)
    }
  }, [role, open])

  const getAllViewIds = () => {
    const ids = []
    viewsStructure.forEach((section) => {
      ids.push(section.id)
      if (section.children) {
        section.children.forEach((child) => {
          ids.push(`${section.id}-${child.id}`)
        })
      }
    })
    return ids
  }

  const handleToggleSection = (sectionId) => {
    setExpandedSections((prev) => ({
      ...prev,
      [sectionId]: !prev[sectionId],
    }))
  }

  const handleToggleView = (viewId) => {
    setSelectedViews((prev) => {
      const newState = { ...prev }
      newState[viewId] = !prev[viewId]

      // Si es una sección principal, actualizar también los hijos
      const section = viewsStructure.find((s) => s.id === viewId)
      if (section && section.children) {
        section.children.forEach((child) => {
          newState[`${viewId}-${child.id}`] = newState[viewId]
        })
      }

      // Si es un hijo, verificar si todos los hijos están seleccionados para actualizar el padre
      if (viewId.includes("-")) {
        const [parentId, _] = viewId.split("-")
        const parent = viewsStructure.find((s) => s.id === parentId)
        if (parent && parent.children) {
          const allChildrenSelected = parent.children.every((child) => newState[`${parentId}-${child.id}`])
          newState[parentId] = allChildrenSelected
        }
      }

      // Verificar si todos están seleccionados
      const allViews = getAllViewIds()
      const allSelected = allViews.every((id) => newState[id])
      setSelectAll(allSelected)

      return newState
    })
  }

  const handleToggleAll = () => {
    const newSelectAll = !selectAll
    setSelectAll(newSelectAll)

    const newSelectedViews = {}
    getAllViewIds().forEach((viewId) => {
      newSelectedViews[viewId] = newSelectAll
    })

    setSelectedViews(newSelectedViews)
  }

  const handleSave = () => {
    // Convertir el objeto de permisos a un array de IDs de vistas permitidas
    const viewPermissions = Object.keys(selectedViews).filter((viewId) => selectedViews[viewId])

    // In handleSave:
    if (role.name === 'admin') {
      onSave({
        roleId: role.id,
        viewPermissions: ['*'] // Grant all permissions
      });
    } else {
      onSave({
        roleId: role.id,
        viewPermissions: Object.keys(selectedViews).filter(viewId => selectedViews[viewId])
      });
    }

    onClose()
  }

  const isParentPartiallySelected = (parentId) => {
    const section = viewsStructure.find((s) => s.id === parentId)
    if (!section || !section.children) return false

    const childrenIds = section.children.map((child) => `${parentId}-${child.id}`)
    const selectedCount = childrenIds.filter((id) => selectedViews[id]).length

    return selectedCount > 0 && selectedCount < childrenIds.length
  }

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: "12px",
          boxShadow: "0 4px 20px rgba(0, 0, 0, 0.08)",
          p: 2,
        },
      }}
    >
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 0.5 }}>
        <Typography variant="h6" sx={{ fontWeight: 600, fontSize: "1.125rem" }}>
          Asignar Permisos de Vistas a {role?.nombre}
        </Typography>
        <IconButton
          onClick={onClose}
          aria-label="close"
          sx={{
            color: "text.secondary",
            p: 0.5,
            "&:hover": {
              backgroundColor: "rgba(0, 0, 0, 0.04)",
            },
          }}
        >
          <CloseIcon fontSize="small" />
        </IconButton>
      </Box>

      <Typography variant="body2" color="text.secondary" sx={{ mb: 1.5 }}>
        Seleccione las vistas a las que este rol tendrá acceso.
      </Typography>

      <Box sx={{ mb: 2 }}>
        <FormControlLabel
          control={<Switch checked={selectAll} onChange={handleToggleAll} color="primary" />}
          label="Seleccionar todas las vistas"
        />
      </Box>

      <Paper
        variant="outlined"
        sx={{
          mb: 2,
          maxHeight: "400px",
          overflow: "auto",
          borderRadius: "8px",
          borderColor: "rgba(0, 0, 0, 0.12)",
        }}
      >
        <List component="nav" aria-label="vistas de la aplicación">
          {viewsStructure.map((section) => (
            <Box key={section.id}>
              <ListItem sx={{ py: 0.5 }}>
                <ListItemIcon sx={{ minWidth: 40 }}>{section.icon}</ListItemIcon>
                <ListItemText primary={section.label} />

                <Checkbox
                  edge="start"
                  checked={!!selectedViews[section.id]}
                  indeterminate={isParentPartiallySelected(section.id)}
                  onChange={() => handleToggleView(section.id)}
                  inputProps={{ "aria-labelledby": section.id }}
                />

                {section.children && (
                  <IconButton onClick={() => handleToggleSection(section.id)}>
                    {expandedSections[section.id] ? <ExpandLess /> : <ExpandMore />}
                  </IconButton>
                )}
              </ListItem>

              {section.children && (
                <Collapse in={expandedSections[section.id]} timeout="auto" unmountOnExit>
                  <List component="div" disablePadding>
                    {section.children.map((child) => (
                      <ListItem key={`${section.id}-${child.id}`} sx={{ pl: 4, py: 0.5 }}>
                        <ListItemIcon sx={{ minWidth: 40 }}>{child.icon}</ListItemIcon>
                        <ListItemText primary={child.label} />
                        <Checkbox
                          edge="start"
                          checked={!!selectedViews[`${section.id}-${child.id}`]}
                          onChange={() => handleToggleView(`${section.id}-${child.id}`)}
                          inputProps={{ "aria-labelledby": `${section.id}-${child.id}` }}
                        />
                      </ListItem>
                    ))}
                  </List>
                </Collapse>
              )}

              <Divider component="li" />
            </Box>
          ))}
        </List>
      </Paper>

      <Box sx={{ display: "flex", justifyContent: "flex-end", gap: 1 }}>
        <Button
          onClick={onClose}
          variant="outlined"
          sx={{
            borderRadius: "8px",
            textTransform: "none",
            fontWeight: 500,
            px: 3,
            borderColor: "rgba(0, 0, 0, 0.12)",
          }}
        >
          Cancelar
        </Button>
        <Button
          onClick={handleSave}
          variant="contained"
          disableElevation
          startIcon={<VisibilityIcon />}
          sx={{
            backgroundColor: "#4f46e5",
            borderRadius: "8px",
            textTransform: "none",
            fontWeight: 500,
            px: 3,
            "&:hover": {
              backgroundColor: "#4338ca",
            },
          }}
        >
          Guardar Permisos de Vistas
        </Button>
      </Box>
    </Dialog>
  )
}

