"use client"

import { useState, useEffect } from "react"
import { Box, Chip, Dialog, Typography, TextField, Button } from "@mui/material"
import { Person as PersonIcon, AccessTime as TimeIcon, CheckCircle, Cancel } from "@mui/icons-material"
import { GenericList } from "../../../shared/components/GenericList"
import { DetailModal } from "../../../shared/components/DetailModal"
import { ScheduleModal } from "../components/ScheduleModal"
import { SuccessAlert } from "../../../shared/components/SuccessAlert"
import { ConfirmationDialog } from "../../../shared/components/ConfirmationDialog"
import axios from "axios"

// Días para mostrar en español
const dayNames = {
  L: "Lunes",
  M: "Martes",
  X: "Miércoles",
  J: "Jueves",
  V: "Viernes",
  S: "Sábado",
  D: "Domingo",
}

// Componente que replica EXACTAMENTE el StatusButton original
const ProgramacionStatusButton = ({ active, onClick }) => {
  return (
    <Button
      onClick={onClick}
      variant="outlined"
      size="small"
      startIcon={active ? <CheckCircle /> : <Cancel />}
      sx={{
        borderRadius: "16px", // Más redondeado como el original
        textTransform: "none",
        fontWeight: 500,
        fontSize: "0.75rem", // Tamaño de fuente más pequeño
        minWidth: "70px", // Ancho mínimo más pequeño
        height: "24px", // Altura más pequeña
        px: 1, // Padding horizontal más pequeño
        borderColor: active ? "#4caf50" : "#f44336",
        color: active ? "#4caf50" : "#f44336",
        backgroundColor: "transparent",
        "&:hover": {
          borderColor: active ? "#388e3c" : "#d32f2f",
          backgroundColor: active ? "rgba(76, 175, 80, 0.04)" : "rgba(244, 67, 54, 0.04)",
        },
        "& .MuiButton-startIcon": {
          marginRight: "2px", // Espacio más pequeño entre icono y texto
          "& svg": {
            fontSize: "14px", // Icono más pequeño
          },
        },
      }}
    >
      {active ? "Activo" : "Cancelado"}
    </Button>
  )
}

const ProgramacionProfesores = () => {
  const [profesores, setProfesores] = useState([])
  const [events, setEvents] = useState([])
  const [selectedEvent, setSelectedEvent] = useState(null)
  const [detailModalOpen, setDetailModalOpen] = useState(false)
  const [scheduleModalOpen, setScheduleModalOpen] = useState(false)
  const [editScheduleData, setEditScheduleData] = useState(null)
  const [alert, setAlert] = useState({ open: false, message: "" })
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false)
  const [eventToDelete, setEventToDelete] = useState(null)
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false)
  const [eventToCancel, setEventToCancel] = useState(null)
  const [cancelMotivo, setCancelMotivo] = useState("")
  const [isEditing, setIsEditing] = useState(false)
  const [loading, setLoading] = useState(true)

  // Cargar profesores
  useEffect(() => {
    const fetchProfesores = async () => {
      try {
        const response = await axios.get("http://localhost:3000/api/profesores")
        const mapped = response.data.map((p) => ({
          id: String(p._id),
          nombre: `${p.nombres} ${p.apellidos}`,
          especialidad: p.especialidades && p.especialidades.length > 0 ? p.especialidades[0] : "Sin especialidad",
          color: p.color || "#0455a2",
        }))
        setProfesores(mapped)
        console.log("Profesores cargados:", mapped)
      } catch (error) {
        console.error("Error al cargar profesores:", error)
        setProfesores([])
        setAlert({
          open: true,
          message: "Error al cargar los profesores",
        })
      }
    }

    fetchProfesores()
  }, [])

  // Cargar programaciones
  useEffect(() => {
    const fetchProgramaciones = async () => {
      try {
        setLoading(true)
        const response = await axios.get("http://localhost:3000/api/programacion_de_profesores")
        console.log("Respuesta de programaciones:", response.data)

        const mapped = response.data.map((prog) => {
          // Manejar diferentes formatos del campo profesor
          let profesorId
          if (typeof prog.profesor === "object" && prog.profesor !== null) {
            profesorId = String(prog.profesor._id || prog.profesor.id)
          } else {
            profesorId = String(prog.profesor)
          }

          return {
            ...prog,
            profesor: profesorId,
          }
        })

        setEvents(mapped)
        console.log("Programaciones procesadas:", mapped)
      } catch (error) {
        console.error("Error al cargar programaciones:", error)
        setEvents([])
        setAlert({
          open: true,
          message: "Error al cargar las programaciones",
        })
      } finally {
        setLoading(false)
      }
    }

    fetchProgramaciones()
  }, [])

  // Unir programación con datos del profesor
  const rows =
    events.length > 0 && profesores.length > 0
      ? events
          .map((prog) => {
            // Buscar profesor por ID
            const prof = profesores.find((p) => {
              const profesorId =
                typeof prog.profesor === "object" && prog.profesor !== null
                  ? String(prog.profesor._id || prog.profesor.id)
                  : String(prog.profesor)

              return String(p.id).trim() === profesorId.trim()
            })

            if (!prof) {
              console.warn("No se encontró profesor para programación:", {
                programacion: prog,
                profesorBuscado: prog.profesor,
                profesoresDisponibles: profesores.map((p) => ({ id: p.id, nombre: p.nombre })),
              })
              return null
            }

            return {
              id: prog._id,
              profesor: prof.nombre,
              especialidad: prof.especialidad,
              dias: prog.diasSeleccionados || [],
              horaInicio: prog.horaInicio,
              horaFin: prog.horaFin,
              estado: prog.estado || "activo",
              motivo: prog.motivo || "",
              color: prof.color,
              profesorId: prof.id,
              fechaCreacion: prog.createdAt,
              fechaActualizacion: prog.updatedAt,
            }
          })
          .filter(Boolean)
      : []

  const columns = [
    {
      id: "profesor",
      label: "Profesor",
      render: (value, row) => (
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <PersonIcon sx={{ color: row.color, fontSize: 18 }} />
          <span>{value}</span>
        </Box>
      ),
    },
    {
      id: "dias",
      label: "Días Disponibles",
      render: (dias) => {
        // Detectar patrones comunes
        const allDays = ["L", "M", "X", "J", "V", "S", "D"]
        const weekdays = ["L", "M", "X", "J", "V"]
        const weekend = ["S", "D"]
        const mondayToSaturday = ["L", "M", "X", "J", "V", "S"]

        const sortedDias = [...(dias || [])].sort()

        // Si son todos los días
        if (sortedDias.length === 7 && sortedDias.every((d, i) => d === allDays[i])) {
          return (
            <Chip label="Todos los días" size="small" color="primary" sx={{ fontSize: "0.75rem", fontWeight: 500 }} />
          )
        }

        // Si son días de semana
        if (sortedDias.length === 5 && sortedDias.every((d, i) => d === weekdays[i])) {
          return <Chip label="Lun - Vie" size="small" color="info" sx={{ fontSize: "0.75rem", fontWeight: 500 }} />
        }

        // Si es fin de semana
        if (sortedDias.length === 2 && sortedDias.every((d, i) => d === weekend[i])) {
          return (
            <Chip label="Fin de semana" size="small" color="secondary" sx={{ fontSize: "0.75rem", fontWeight: 500 }} />
          )
        }

        // Si es lunes a sábado
        if (sortedDias.length === 6 && sortedDias.every((d, i) => d === mondayToSaturday[i])) {
          return <Chip label="Lun - Sáb" size="small" color="info" sx={{ fontSize: "0.75rem", fontWeight: 500 }} />
        }

        // Para otros casos, mostrar chips individuales organizados en 2 filas (4 arriba, 3 abajo)
        return (
          <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 0.5 }}>
            {/* Primera fila - máximo 4 días */}
            <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5, justifyContent: "center" }}>
              {dias?.slice(0, 4).map((d) => (
                <Chip key={d} label={dayNames[d] || d} size="small" color="primary" sx={{ fontSize: "0.75rem" }} />
              ))}
            </Box>
            {/* Segunda fila - días restantes */}
            {dias?.length > 4 && (
              <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5, justifyContent: "center" }}>
                {dias?.slice(4).map((d) => (
                  <Chip key={d} label={dayNames[d] || d} size="small" color="primary" sx={{ fontSize: "0.75rem" }} />
                ))}
              </Box>
            )}
          </Box>
        )
      },
    },
    {
      id: "horaInicio",
      label: "Hora de Inicio",
      render: (v) => (
        <Box sx={{ display: "flex", alignItems: "center", gap: 0.5, justifyContent: "center" }}>
          <TimeIcon sx={{ fontSize: 14, color: "text.secondary" }} />
          <Typography variant="body2" sx={{ fontWeight: 500 }}>
            {v}
          </Typography>
        </Box>
      ),
    },
    {
      id: "horaFin",
      label: "Hora de Fin",
      render: (v) => (
        <Box sx={{ display: "flex", alignItems: "center", gap: 0.5, justifyContent: "center" }}>
          <TimeIcon sx={{ fontSize: 14, color: "text.secondary" }} />
          <Typography variant="body2" sx={{ fontWeight: 500 }}>
            {v}
          </Typography>
        </Box>
      ),
    },
    {
      id: "estado",
      label: "Estado",
      render: (value, row) => (
        <ProgramacionStatusButton active={value === "activo"} onClick={() => handleToggleStatus(row.id)} />
      ),
      filterOptions: [
        { value: "activo", label: "Activo" },
        { value: "cancelado", label: "Cancelado" },
      ],
    },
  ]

  const detailFields = [
    {
      id: "profesor",
      label: "Profesor",
      render: (value, data) => (
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <Box
            sx={{
              width: 12,
              height: 12,
              borderRadius: "50%",
              bgcolor: data?.color || "#0455a2",
            }}
          />
          <PersonIcon sx={{ color: data?.color || "#0455a2" }} />
          <span>{value}</span>
        </Box>
      ),
    },
    { id: "especialidad", label: "Especialidad" },
    {
      id: "dias",
      label: "Días Disponibles",
      render: (dias) => (
        <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5 }}>
          {dias?.map((d) => (
            <Chip key={d} label={dayNames[d] || d} size="small" color="primary" />
          ))}
        </Box>
      ),
    },
    {
      id: "horaInicio",
      label: "Hora de Inicio",
      render: (v) => (
        <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
          <TimeIcon sx={{ fontSize: 18 }} />
          {v}
        </Box>
      ),
    },
    {
      id: "horaFin",
      label: "Hora de Fin",
      render: (v) => (
        <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
          <TimeIcon sx={{ fontSize: 18 }} />
          {v}
        </Box>
      ),
    },
    {
      id: "estado",
      label: "Estado",
      render: (v) =>
        v === "activo" ? (
          <Chip label="Activo" color="success" size="small" />
        ) : (
          <Chip label="Cancelado" color="error" size="small" />
        ),
    },
    {
      id: "motivo",
      label: "Motivo/Observaciones",
      render: (value) => value || "Sin observaciones",
    },
    {
      id: "fechaCreacion",
      label: "Fecha de Creación",
      render: (value) => (value ? new Date(value).toLocaleDateString("es-ES") : "N/A"),
    },
    {
      id: "fechaActualizacion",
      label: "Última Actualización",
      render: (value) => (value ? new Date(value).toLocaleDateString("es-ES") : "N/A"),
    },
  ]

  // Handlers
  const handleEdit = (row) => {
    setIsEditing(true)
    setEditScheduleData({
      profesorId: row.profesorId,
      days: row.dias,
      startTime: row.horaInicio,
      endTime: row.horaFin,
      eventId: row.id,
      estado: row.estado,
      motivo: row.motivo || "",
    })
    setScheduleModalOpen(true)
  }

  const handleCreate = () => {
    setIsEditing(false)
    setEditScheduleData(null)
    setScheduleModalOpen(true)
  }

  const handleView = (row) => {
    setSelectedEvent(row)
    setDetailModalOpen(true)
  }

  const handleDelete = (event) => {
    setEventToDelete(event)
    setConfirmDialogOpen(true)
  }

  const handleCancel = (event) => {
    if (event.estado === "cancelado") {
      setAlert({
        open: true,
        message: "Esta programación ya está cancelada",
      })
      return
    }

    setEventToCancel(event)
    setCancelMotivo("")
    setCancelDialogOpen(true)
  }

  const handleConfirmDelete = async () => {
    if (!eventToDelete) return

    try {
      await axios.delete(`http://localhost:3000/api/programacion_de_profesores/${eventToDelete.id}`)
      setEvents((prev) => prev.filter((e) => e._id !== eventToDelete.id))
      setAlert({
        open: true,
        message: "Programación eliminada correctamente",
      })
    } catch (error) {
      console.error("Error al eliminar:", error)
      setAlert({
        open: true,
        message: "Error al eliminar la programación",
      })
    } finally {
      setConfirmDialogOpen(false)
      setEventToDelete(null)
    }
  }

  const handleConfirmCancel = async () => {
    if (!eventToCancel || !cancelMotivo.trim()) {
      setAlert({
        open: true,
        message: "Por favor, ingrese un motivo para la cancelación",
      })
      return
    }

    try {
      const eventToUpdate = events.find((e) => e._id === eventToCancel.id)
      if (!eventToUpdate) return

      await axios.put(`http://localhost:3000/api/programacion_de_profesores/${eventToCancel.id}`, {
        ...eventToUpdate,
        estado: "cancelado",
        motivo: cancelMotivo,
      })

      setEvents((prev) =>
        prev.map((e) => (e._id === eventToCancel.id ? { ...e, estado: "cancelado", motivo: cancelMotivo } : e)),
      )

      setAlert({
        open: true,
        message: "Programación cancelada correctamente",
      })
    } catch (error) {
      console.error("Error al cancelar programación:", error)
      setAlert({
        open: true,
        message: "Error al cancelar la programación",
      })
    } finally {
      setCancelDialogOpen(false)
      setEventToCancel(null)
      setCancelMotivo("")
    }
  }

  // Función para validar y limpiar los días - VERSIÓN MEJORADA
  const validateAndCleanDays = (days) => {
    console.log("=== FUNCIÓN validateAndCleanDays ===")
    console.log("Días recibidos:", days)

    // Crear un mapeo exacto de caracteres válidos
    const validDayMapping = {
      L: "L",
      M: "M",
      X: "X",
      J: "J",
      V: "V",
      S: "S",
      D: "D",
    }

    // Procesar cada día
    const cleanedDays = days
      .map((day, index) => {
        console.log(`Procesando día ${index}:`, {
          valor: day,
          tipo: typeof day,
          longitud: day?.length,
          codigo: day?.charCodeAt ? day.charCodeAt(0) : "N/A",
        })

        // Convertir a string y limpiar
        const dayStr = String(day).trim().toUpperCase()

        // Verificar si es válido
        if (validDayMapping[dayStr]) {
          console.log(`✅ Día válido: ${dayStr}`)
          return validDayMapping[dayStr]
        } else {
          console.log(`❌ Día inválido: ${dayStr}`)
          return null
        }
      })
      .filter((day) => day !== null)

    // Remover duplicados
    const uniqueDays = [...new Set(cleanedDays)]

    console.log("Días finales:", uniqueDays)
    console.log("Validación final:")
    uniqueDays.forEach((day, index) => {
      console.log(`  ${index}: "${day}" (código: ${day.charCodeAt(0)})`)
    })

    return uniqueDays
  }

  const handleScheduleSubmit = async (data) => {
    const { profesorId, days, startTime, endTime, motivo, estado } = data

    console.log("=== INICIO handleScheduleSubmit ===")
    console.log("Datos recibidos del modal:", data)

    // Validar y limpiar los días
    const cleanedDays = validateAndCleanDays(days)

    if (cleanedDays.length === 0) {
      setAlert({
        open: true,
        message: "Debe seleccionar al menos un día válido",
      })
      return
    }

    try {
      if (isEditing && editScheduleData) {
        // Actualizar programación existente
        const updateData = {
          profesor: profesorId,
          diasSeleccionados: cleanedDays,
          horaInicio: startTime,
          horaFin: endTime,
          estado: estado || "activo",
          motivo: motivo || "",
        }

        console.log("Enviando datos de actualización:", updateData)

        await axios.put(`http://localhost:3000/api/programacion_de_profesores/${editScheduleData.eventId}`, updateData)

        setEvents((prev) =>
          prev.map((e) =>
            e._id === editScheduleData.eventId
              ? {
                  ...e,
                  profesor: profesorId,
                  diasSeleccionados: cleanedDays,
                  horaInicio: startTime,
                  horaFin: endTime,
                  estado: estado || "activo",
                  motivo: motivo || "",
                }
              : e,
          ),
        )

        setAlert({
          open: true,
          message: "Programación actualizada correctamente",
        })
      } else {
        // Crear nueva programación
        const newData = {
          profesor: profesorId,
          diasSeleccionados: cleanedDays,
          horaInicio: startTime,
          horaFin: endTime,
          estado: "activo",
          motivo: motivo || "",
        }

        console.log("=== DATOS FINALES PARA ENVÍO ===")
        console.log("Objeto completo:", newData)
        console.log("JSON stringificado:", JSON.stringify(newData, null, 2))
        console.log("Análisis detallado:")
        console.log("- profesor:", newData.profesor, "(tipo:", typeof newData.profesor, ")")
        console.log(
          "- diasSeleccionados:",
          newData.diasSeleccionados,
          "(tipo:",
          typeof newData.diasSeleccionados,
          ", longitud:",
          newData.diasSeleccionados.length,
          ")",
        )
        console.log("- horaInicio:", newData.horaInicio, "(tipo:", typeof newData.horaInicio, ")")
        console.log("- horaFin:", newData.horaFin, "(tipo:", typeof newData.horaFin, ")")
        console.log("- estado:", newData.estado, "(tipo:", typeof newData.estado, ")")

        // Análisis específico de cada día
        console.log("Análisis de cada día en diasSeleccionados:")
        newData.diasSeleccionados.forEach((dia, index) => {
          console.log(
            `  [${index}]: "${dia}" (código: ${dia.charCodeAt(0)}, bytes: [${Array.from(new TextEncoder().encode(dia)).join(", ")}])`,
          )
        })

        const response = await axios.post("http://localhost:3000/api/programacion_de_profesores", newData)

        console.log("Respuesta del servidor:", response.data)

        // Procesar la respuesta para extraer el ID del profesor si viene como objeto
        const newEvent = {
          _id: response.data._id,
          profesor: profesorId, // Usar el ID que enviamos
          diasSeleccionados: cleanedDays,
          horaInicio: startTime,
          horaFin: endTime,
          estado: "activo",
          motivo: motivo || "",
          createdAt: response.data.createdAt,
          updatedAt: response.data.updatedAt,
        }

        setEvents((prev) => [...prev, newEvent])

        setAlert({
          open: true,
          message: "Programación creada correctamente",
        })
      }
    } catch (error) {
      console.error("=== ERROR DETALLADO ===")
      console.error("Error completo:", error)
      console.error("Status:", error.response?.status)
      console.error("Status Text:", error.response?.statusText)
      console.error("Respuesta del servidor:", error.response?.data)
      console.error("Headers de respuesta:", error.response?.headers)
      console.error("Config de la request:", error.config)

      const errorMessage = error.response?.data?.message || error.message || "Error desconocido"

      setAlert({
        open: true,
        message: `Error al ${isEditing ? "actualizar" : "crear"} la programación: ${errorMessage}`,
      })
    } finally {
      setScheduleModalOpen(false)
      setEditScheduleData(null)
      setIsEditing(false)
    }
  }

  const handleToggleStatus = async (programacionId) => {
    try {
      const programacion = events.find((e) => e._id === programacionId)
      if (!programacion) return

      const nuevoEstado = programacion.estado === "activo" ? "cancelado" : "activo"

      await axios.patch(`http://localhost:3000/api/programacion_de_profesores/${programacionId}/estado`, {
        estado: nuevoEstado,
      })

      setEvents((prevEvents) => prevEvents.map((e) => (e._id === programacionId ? { ...e, estado: nuevoEstado } : e)))

      setAlert({
        open: true,
        message: `Estado actualizado a ${nuevoEstado === "activo" ? "activo" : "cancelado"} correctamente`,
      })
    } catch (error) {
      console.error("Error updating status:", error)
      setAlert({
        open: true,
        message: "Error al actualizar el estado",
      })
    }
  }

  // Filtrar profesores sin programación activa para el modal de creación
  const profesoresSinProgramacion = isEditing
    ? profesores
    : profesores.filter((profesor) => {
        return !rows.some((row) => row.profesorId === profesor.id && row.estado === "activo")
      })

  const renderCancelDialog = () => (
    <Dialog
      open={cancelDialogOpen}
      onClose={() => setCancelDialogOpen(false)}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: "12px",
          boxShadow: "0 4px 20px rgba(0, 0, 0, 0.08)",
          overflow: "hidden",
        },
      }}
    >
      <Box
        sx={{
          bgcolor: "#f44336",
          color: "white",
          p: 2,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <Typography variant="h6" sx={{ fontWeight: 600 }}>
          Cancelar Programación
        </Typography>
      </Box>
      <Box sx={{ p: 3 }}>
        <Typography variant="body1" sx={{ mb: 3 }}>
          ¿Está seguro que desea cancelar la programación del profesor <strong>{eventToCancel?.profesor}</strong>?
        </Typography>
        <TextField
          label="Motivo de cancelación"
          fullWidth
          multiline
          rows={3}
          value={cancelMotivo}
          onChange={(e) => setCancelMotivo(e.target.value)}
          sx={{ mb: 3 }}
          required
        />
        <Box sx={{ display: "flex", justifyContent: "flex-end", gap: 1 }}>
          <Button
            onClick={() => setCancelDialogOpen(false)}
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
            onClick={handleConfirmCancel}
            variant="contained"
            color="error"
            disableElevation
            sx={{
              borderRadius: "8px",
              textTransform: "none",
              fontWeight: 500,
              px: 3,
            }}
          >
            Confirmar Cancelación
          </Button>
        </Box>
      </Box>
    </Dialog>
  )

  if (loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", height: "400px" }}>
        <Typography>Cargando programaciones...</Typography>
      </Box>
    )
  }

  return (
    <Box sx={{ height: "100%", display: "flex", flexDirection: "column" }}>
      <GenericList
        title="Programación de Profesores"
        data={rows}
        columns={columns}
        onEdit={handleEdit}
        onDelete={handleDelete}
        onCancel={handleCancel}
        onCreate={handleCreate}
        onView={handleView}
      />

      <DetailModal
        title="Detalle de Programación"
        data={selectedEvent}
        fields={detailFields}
        open={detailModalOpen}
        onClose={() => setDetailModalOpen(false)}
      />

      <ScheduleModal
        isOpen={scheduleModalOpen}
        onClose={() => {
          setScheduleModalOpen(false)
          setEditScheduleData(null)
          setIsEditing(false)
        }}
        onSubmit={handleScheduleSubmit}
        profesores={profesoresSinProgramacion}
        defaultProfesorId={editScheduleData?.profesorId}
        defaultDays={editScheduleData?.days}
        defaultStartTime={editScheduleData?.startTime}
        defaultEndTime={editScheduleData?.endTime}
        defaultMotivo={editScheduleData?.motivo}
        defaultEstado={editScheduleData?.estado}
        isEditing={isEditing}
      />

      <ConfirmationDialog
        open={confirmDialogOpen}
        title="Confirmar Eliminación"
        content={`¿Está seguro que desea eliminar la programación del profesor ${eventToDelete?.profesor}?`}
        onConfirm={handleConfirmDelete}
        onClose={() => setConfirmDialogOpen(false)}
        confirmButtonColor="#f44336"
        confirmButtonText="Eliminar"
      />

      {renderCancelDialog()}

      <SuccessAlert open={alert.open} message={alert.message} onClose={() => setAlert({ ...alert, open: false })} />
    </Box>
  )
}

export default ProgramacionProfesores
