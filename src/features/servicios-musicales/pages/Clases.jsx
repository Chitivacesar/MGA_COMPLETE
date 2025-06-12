"use client"

import React, { useState, useMemo } from "react"
import {
  Box,
  Paper,
  Tabs,
  Tab,
  Typography,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  IconButton,
  Grid,
  InputAdornment,
  Chip,
  Avatar,
  alpha,
  Snackbar,
  Alert,
  List,
} from "@mui/material"
import { Calendar, momentLocalizer } from "react-big-calendar"
import moment from "moment"
import "moment/locale/es"
import "react-big-calendar/lib/css/react-big-calendar.css"
import { GenericList } from "../../../shared/components/GenericList"
import { DetailModal } from "../../../shared/components/DetailModal"
import { FormModal } from "../../../shared/components/FormModal"
import { StatusButton } from "../../../shared/components/StatusButton"
import {
  Add as AddIcon,
  Edit as EditIcon,
  Search as SearchIcon,
  Close as CloseIcon,
  AccessTime as TimeIcon,
  Person as PersonIcon,
  School as SchoolIcon,
  ArrowBack as ArrowBackIcon,
  ArrowForward as ArrowForwardIcon,
  CalendarMonth as CalendarIcon,
} from "@mui/icons-material"

// Configurar localización en español
moment.locale("es")
const localizer = momentLocalizer(moment)

// Status colors and button styles
const statusColors = {
  no_iniciada: "#ffa500",
  en_ejecucion: "#4caf50",
  ejecutada: "#2196f3",
  cancelada: "#f44336",
}

const buttonStyles = {
  fontSize: "0.75rem",
  padding: "4px 8px",
  minWidth: "70px",
  borderRadius: "4px",
  textTransform: "none",
  boxShadow: "none",
  "&:hover": {
    boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
  },
}

// Estilos CSS personalizados para el calendario
const calendarStyles = `
  /* Estilos generales del calendario */
  .rbc-calendar {
    font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    font-size: 14px;
    height: 100%;
  }
  
  /* Cabecera de días de la semana */
  .rbc-header {
    padding: 10px 3px;
    font-weight: 500;
    font-size: 0.85rem;
    color: #555;
    text-transform: capitalize;
  }
  
  /* Celdas del calendario */
  .rbc-date-cell {
    padding: 4px 5px 0;
    font-weight: 500;
    font-size: 0.85rem;
    color: #555;
  }
  
  /* Día actual */
  .rbc-now {
    font-weight: bold;
    color: #0455a2;
  }
  
  /* Eventos */
  .rbc-event {
    border-radius: 6px;
    box-shadow: 0 1px 3px rgba(0,0,0,0.12);
    padding: 0;
    overflow: visible !important;
  }
  
  /* Contenedor de eventos */
  .event-container {
    height: 100%;
    width: 100%;
    overflow: visible;
    display: flex;
    flex-direction: column;
    padding: 4px 6px;
    position: relative;
  }
  
  /* Título del evento */
  .event-title {
    font-weight: 600;
    font-size: 0.8rem;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    margin-bottom: 2px;
    display: flex;
    align-items: center;
    gap: 4px;
  }
  
  /* Detalles del evento */
  .event-details {
    font-size: 0.75rem;
    display: flex;
    align-items: center;
    gap: 4px;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    margin-bottom: 1px;
  }
  
  /* Evento cancelado */
  .event-cancelled {
    text-decoration: line-through;
    opacity: 0.7;
  }
  
  /* Tooltip personalizado */
  .custom-tooltip {
    position: absolute;
    z-index: 1000;
    background-color: white;
    border-radius: 8px;
    box-shadow: 0 4px 12px rgba(0,0,0,0.15);
    padding: 10px;
    width: 220px;
    visibility: hidden;
    opacity: 0;
    transition: opacity 0.2s, visibility 0.2s;
    pointer-events: none;
    left: 105%;
    top: 0;
  }
  
  .event-container:hover .custom-tooltip {
    visibility: visible;
    opacity: 1;
  }
  
  /* Estilos para la vista de agenda */
  .rbc-agenda-view table.rbc-agenda-table {
    border: none;
    border-spacing: 0;
    border-collapse: separate;
  }
  
  .rbc-agenda-view table.rbc-agenda-table thead > tr > th {
    padding: 10px;
    font-weight: 500;
    border-bottom: 1px solid #e0e0e0;
  }
  
  .rbc-agenda-view table.rbc-agenda-table tbody > tr > td {
    padding: 10px;
    border-bottom: 1px solid #f0f0f0;
  }
  
  /* Estilos para la vista de día/semana */
  .rbc-time-view .rbc-time-header-content .rbc-header {
    border-bottom: 1px solid #e0e0e0;
  }
  
  .rbc-time-view .rbc-time-content {
    border-top: 1px solid #e0e0e0;
  }
  
  .rbc-time-view .rbc-time-content > * + * > * {
    border-left: 1px solid #f0f0f0;
  }
  
  .rbc-timeslot-group {
    border-bottom: 1px solid #f0f0f0;
  }
  
  /* Estilos para múltiples eventos */
  .rbc-row-segment .rbc-event {
    margin-bottom: 2px;
  }
  
  .rbc-show-more {
    background-color: transparent;
    color: #0455a2;
    font-weight: 500;
    padding: 2px 5px;
    margin-top: 2px;
    border-radius: 4px;
    transition: background-color 0.2s;
  }
  
  .rbc-show-more:hover {
    background-color: rgba(4, 85, 162, 0.1);
  }
  
  /* Estilos para el contenedor de eventos del día */
  .day-cell-content {
    position: relative;
    height: 100%;
    width: 100%;
    overflow: hidden;
  }
  
  .day-cell-events {
    position: relative;
    height: calc(100% - 20px);
    overflow-y: auto;
    padding-right: 2px;
    margin-top: 2px;
  }
  
  .day-cell-events::-webkit-scrollbar {
    width: 4px;
  }
  
  .day-cell-events::-webkit-scrollbar-track {
    background: transparent;
  }
  
  .day-cell-events::-webkit-scrollbar-thumb {
    background-color: rgba(0, 0, 0, 0.2);
    border-radius: 4px;
  }
  
  .day-cell-events::-webkit-scrollbar-thumb:hover {
    background-color: rgba(0, 0, 0, 0.3);
  }
  
  /* Estilos para el modal de eventos del día */
  .day-events-modal-title {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 16px;
  }
  
  .day-events-list {
    max-height: 400px;
    overflow-y: auto;
    scrollbar-width: thin;
    scrollbar-color: rgba(0, 0, 0, 0.2) transparent;
  }

  .day-events-list::-webkit-scrollbar {
    width: 6px;
  }

  .day-events-list::-webkit-scrollbar-track {
    background: transparent;
  }

  .day-events-list::-webkit-scrollbar-thumb {
    background-color: rgba(0, 0, 0, 0.2);
    border-radius: 10px;
  }

  .day-events-list::-webkit-scrollbar-thumb:hover {
    background-color: rgba(0, 0, 0, 0.3);
  }
  
  .day-events-list-item {
    margin-bottom: 8px;
    border-radius: 8px;
    overflow: hidden;
    transition: all 0.2s;
  }
  
  .day-events-list-item:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  }
  
  .day-events-list-item-header {
    padding: 8px 12px;
    display: flex;
    justify-content: space-between;
    align-items: center;
  }
  
  .day-events-list-item-content {
    padding: 0 12px 12px 12px;
  }
  
  .day-events-list-item-actions {
    display: flex;
    justify-content: flex-end;
    gap: 8px;
    padding: 0 12px 8px 12px;
  }
  
  /* Estilos para la vista personalizada del calendario */
  .custom-calendar {
    display: grid;
    grid-template-columns: repeat(7, 1fr);
    gap: 8px;
    padding: 8px;
    height: 100%;
    overflow-y: auto;
    scrollbar-width: none; /* Firefox */
  }

  .custom-calendar::-webkit-scrollbar {
    width: 0;
    background: transparent; /* Chrome/Safari/Edge */
  }
`

const Clases = () => {
  const [tabValue, setTabValue] = useState(0)
  const [date, setDate] = useState(new Date())
  const [view, setView] = useState("month")
  const [searchTerm, setSearchTerm] = useState("")
  const [isSearchVisible, setIsSearchVisible] = useState(false)
  const [dayEventsModalOpen, setDayEventsModalOpen] = useState(false)
  const [selectedDay, setSelectedDay] = useState(null)

  // Data for selects
  const profesores = [
    { id: "P001", nombre: "Juan Pérez" },
    { id: "P002", nombre: "Maria Gómez" },
    { id: "P003", nombre: "Carlos Sánchez" },
    { id: "P004", nombre: "Laura Méndez" },
  ]

  const cursos = [
    { id: "GC001", nombre: "Guitarra Clásica Nivel 1" },
    { id: "PI002", nombre: "Piano Intermedio" },
    { id: "VI003", nombre: "Violín Avanzado" },
    { id: "CA004", nombre: "Canto Básico" },
  ]

  // Classes state
  const [classes, setClasses] = useState([
    {
      id: "C001",
      curso: "Guitarra Clásica",
      profesor: "Juan Pérez",
      fecha: "2023-01-01",
      hora_inicio: "10:00",
      hora_fin: "11:00",
      estado: "no_iniciada",
    },
    {
      id: "C002",
      curso: "Piano Intermedio",
      profesor: "Maria Gómez",
      fecha: "2023-02-01",
      hora_inicio: "11:00",
      hora_fin: "12:00",
      estado: "en_ejecucion",
    },
    {
      id: "C003",
      curso: "Violín Avanzado",
      profesor: "Carlos Sánchez",
      fecha: "2023-01-15",
      hora_inicio: "14:00",
      hora_fin: "15:30",
      estado: "ejecutada",
    },
    {
      id: "C004",
      curso: "Canto Básico",
      profesor: "Laura Méndez",
      fecha: "2023-01-20",
      hora_inicio: "16:00",
      hora_fin: "17:00",
      estado: "cancelada",
    },
    {
      id: "C005",
      curso: "Guitarra Clásica",
      profesor: "Juan Pérez",
      fecha: "2023-01-08",
      hora_inicio: "09:00",
      hora_fin: "10:00",
      estado: "no_iniciada",
    },
    {
      id: "C006",
      curso: "Piano Intermedio",
      profesor: "Maria Gómez",
      fecha: "2023-01-10",
      hora_inicio: "13:00",
      hora_fin: "14:00",
      estado: "en_ejecucion",
    },
    {
      id: "C007",
      curso: "Violín Avanzado",
      profesor: "Carlos Sánchez",
      fecha: "2023-01-22",
      hora_inicio: "15:00",
      hora_fin: "16:30",
      estado: "ejecutada",
    },
    {
      id: "C008",
      curso: "Canto Básico",
      profesor: "Laura Méndez",
      fecha: "2023-01-25",
      hora_inicio: "10:00",
      hora_fin: "11:00",
      estado: "no_iniciada",
    },
  ])
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false)
  const [cancelReason, setCancelReason] = useState("")
  const [selectedClass, setSelectedClass] = useState(null)
  const [classDetailOpen, setClassDetailOpen] = useState(false)
  const [classFormOpen, setClassFormOpen] = useState(false)
  const [isEditingClass, setIsEditingClass] = useState(false)
  const [snackbar, setSnackbar] = useState({ open: false, message: "", severity: "success" })

  // Calendar events
  const events = useMemo(() => {
    return classes.map((cls) => ({
      id: cls.id,
      title: `${cls.curso} - ${cls.profesor}`,
      start: new Date(`${cls.fecha}T${cls.hora_inicio}`),
      end: new Date(`${cls.fecha}T${cls.hora_fin}`),
      resource: cls,
      color: statusColors[cls.estado],
    }))
  }, [classes])

  // Agrupar eventos por fecha
  const eventsByDate = useMemo(() => {
    const grouped = {}

    events.forEach((event) => {
      const dateKey = moment(event.start).format("YYYY-MM-DD")
      if (!grouped[dateKey]) {
        grouped[dateKey] = []
      }
      grouped[dateKey].push(event)
    })

    return grouped
  }, [events])

  // Generar días del calendario para la vista personalizada
  const calendarDays = useMemo(() => {
    const startOfMonth = moment(date).startOf("month")
    const endOfMonth = moment(date).endOf("month")
    const startDate = moment(startOfMonth).startOf("week")
    const endDate = moment(endOfMonth).endOf("week")

    const days = []
    const day = startDate.clone()

    while (day.isSameOrBefore(endDate)) {
      days.push(day.clone())
      day.add(1, "day")
    }

    return days
  }, [date])

  // Filtrar eventos basados en término de búsqueda
  const filteredEvents = useMemo(() => {
    if (!searchTerm) return events

    return events.filter((event) => {
      const resource = event.resource
      return (
        resource.curso.toLowerCase().includes(searchTerm.toLowerCase()) ||
        resource.profesor.toLowerCase().includes(searchTerm.toLowerCase())
      )
    })
  }, [events, searchTerm])

  const handleSelectSlot = ({ start, end }) => {
    setIsEditingClass(false)
    setSelectedClass(null)
    const formattedStart = moment(start).format("YYYY-MM-DD")
    const formattedStartTime = moment(start).format("HH:mm")
    const formattedEndTime = moment(end).format("HH:mm")

    const initialData = {
      fecha: formattedStart,
      hora_inicio: formattedStartTime,
      hora_fin: formattedEndTime,
      estado: "no_iniciada",
    }

    setSelectedClass(initialData)
    setClassFormOpen(true)
  }

  const handleSelectEvent = (event) => {
    setSelectedClass(event.resource)
    setClassDetailOpen(true)
  }

  // Tab handling
  const handleTabChange = (event, newValue) => {
    setTabValue(newValue)
  }

  // Classes handlers
  const handleCreateClass = () => {
    setIsEditingClass(false)
    setSelectedClass(null)
    setClassFormOpen(true)
  }

  const handleEditClass = (cls) => {
    setIsEditingClass(true)
    setSelectedClass(cls)
    setClassFormOpen(true)
  }

  const handleCancelClass = (cls) => {
    setSelectedClass(cls)
    setCancelDialogOpen(true)
  }

  const handleConfirmCancel = () => {
    if (cancelReason.trim() === "") {
      setSnackbar({
        open: true,
        message: "Por favor, ingrese una razón para la cancelación",
        severity: "error",
      })
      return
    }
    setClasses((prev) =>
      prev.map((item) =>
        item.id === selectedClass.id ? { ...item, estado: "cancelada", razon_cancelacion: cancelReason } : item,
      ),
    )
    setCancelDialogOpen(false)
    setCancelReason("")
    setSelectedClass(null)
    setSnackbar({
      open: true,
      message: "Clase cancelada correctamente",
      severity: "success",
    })
  }

  const handleViewClass = (cls) => {
    setSelectedClass(cls)
    setClassDetailOpen(true)
  }

  const handleCloseClassDetail = () => {
    setClassDetailOpen(false)
    setSelectedClass(null)
  }

  const handleCloseClassForm = () => {
    setClassFormOpen(false)
    setSelectedClass(null)
    setIsEditingClass(false)
  }

  const handleSubmitClass = (formData) => {
    if (isEditingClass) {
      setClasses((prev) => prev.map((item) => (item.id === selectedClass.id ? { ...formData, id: item.id } : item)))
      setSnackbar({
        open: true,
        message: "Clase actualizada correctamente",
        severity: "success",
      })
    } else {
      // Generate a new ID for new classes
      const newId = `C${String(Math.floor(Math.random() * 1000)).padStart(3, "0")}`
      setClasses((prev) => [...prev, { ...formData, id: newId }])
      setSnackbar({
        open: true,
        message: "Clase creada correctamente",
        severity: "success",
      })
    }
    handleCloseClassForm()
  }

  const handleUpdateClassStatus = (classId, newStatus) => {
    setClasses((prev) => prev.map((item) => (item.id === classId ? { ...item, estado: newStatus } : item)))
    setSnackbar({
      open: true,
      message: `Estado de la clase actualizado a ${newStatus.replace("_", " ")}`,
      severity: "success",
    })
  }

  // Manejadores para la navegación
  const handleNavigate = (action) => {
    if (action === "TODAY") {
      setDate(new Date())
    } else if (action === "PREV") {
      const newDate = new Date(date)
      if (view === "month") {
        newDate.setMonth(date.getMonth() - 1)
      } else if (view === "week") {
        newDate.setDate(date.getDate() - 7)
      } else if (view === "day") {
        newDate.setDate(date.getDate() - 1)
      }
      setDate(newDate)
    } else if (action === "NEXT") {
      const newDate = new Date(date)
      if (view === "month") {
        newDate.setMonth(date.getMonth() + 1)
      } else if (view === "week") {
        newDate.setDate(date.getDate() + 7)
      } else if (view === "day") {
        newDate.setDate(date.getDate() + 1)
      }
      setDate(newDate)
    }
  }

  const handleViewChange = (newView) => {
    setView(newView)
  }

  const handleOpenDayEventsModal = (date) => {
    setSelectedDay(date)
    setDayEventsModalOpen(true)
  }

  const handleCloseDayEventsModal = () => {
    setDayEventsModalOpen(false)
    setSelectedDay(null)
  }

  // Obtener el título del calendario basado en la vista y fecha actual
  const getCalendarTitle = () => {
    if (view === "month") {
      return moment(date).format("MMMM YYYY")
    } else if (view === "week") {
      const start = moment(date).startOf("week")
      const end = moment(date).endOf("week")
      return `${start.format("D")} - ${end.format("D")} ${end.format("MMMM YYYY")}`
    } else if (view === "day") {
      return moment(date).format("dddd, D [de] MMMM YYYY")
    } else if (view === "agenda") {
      return moment(date).format("dddd, D [de] MMMM YYYY")
    }
    return ""
  }

  // Classes columns and fields
  const classesColumns = [
    { id: "curso", label: "Curso" },
    { id: "profesor", label: "Profesor" },
    { id: "fecha", label: "Fecha" },
    { id: "hora_inicio", label: "Hora de Inicio" },
    { id: "hora_fin", label: "Hora de Fin" },
    {
      id: "estado",
      label: "Estado",
      filterOptions: [
        { value: "no_iniciada", label: "No Iniciada" },
        { value: "en_ejecucion", label: "En Ejecución" },
        { value: "ejecutada", label: "Ejecutada" },
        { value: "cancelada", label: "Cancelada" },
      ],
      render: (value, row) => (
        <Box
          sx={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            width: "100%",
          }}
        >
          <StatusButton
            status={value}
            onAction={
              value === "no_iniciada"
                ? () => handleUpdateClassStatus(row.id, "en_ejecucion")
                : value === "en_ejecucion"
                  ? () => handleUpdateClassStatus(row.id, "ejecutada")
                  : undefined
            }
            actionLabel={value === "no_iniciada" ? "Iniciar" : value === "en_ejecucion" ? "Finalizar" : undefined}
          />
        </Box>
      ),
    },
  ]

  const classesDetailFields = [
    { id: "id", label: "Código" },
    { id: "curso", label: "Curso" },
    { id: "profesor", label: "Profesor" },
    { id: "fecha", label: "Fecha" },
    { id: "hora_inicio", label: "Hora de Inicio" },
    { id: "hora_fin", label: "Hora de Fin" },
    { id: "estado", label: "Estado", render: (value) => <StatusButton status={value} /> },
  ]

  const classesFormFields = [
    {
      id: "curso",
      label: "Curso",
      type: "select",
      required: true,
      options: cursos.map((curso) => ({ value: curso.nombre, label: curso.nombre })),
    },
    {
      id: "profesor",
      label: "Profesor",
      type: "select",
      required: true,
      options: profesores.map((profesor) => ({ value: profesor.nombre, label: profesor.nombre })),
    },
    {
      id: "fecha",
      label: "Fecha",
      type: "date",
      required: true,
      disabled: selectedClass?.fecha !== undefined,
      defaultValue: selectedClass?.fecha || moment().format("YYYY-MM-DD"),
    },
    {
      id: "hora_inicio",
      label: "Hora de Inicio",
      type: "time",
      required: true,
      disabled: selectedClass?.hora_inicio !== undefined,
      defaultValue: selectedClass?.hora_inicio || "08:00",
    },
    {
      id: "hora_fin",
      label: "Hora de Fin",
      type: "time",
      required: true,
      disabled: selectedClass?.hora_fin !== undefined,
      defaultValue: selectedClass?.hora_fin || "09:00",
    },
    {
      id: "estado",
      label: "Estado",
      type: "select",
      required: true,
      options: [
        { value: "no_iniciada", label: "No Iniciada" },
        { value: "en_ejecucion", label: "En Ejecución" },
        { value: "ejecutada", label: "Ejecutada" },
      ],
      defaultValue: selectedClass?.estado || "no_iniciada",
    },
  ]

  // Renderizar la vista personalizada del calendario
  const renderCustomCalendar = () => {
    return (
      <Box sx={{ height: "100%", display: "flex", flexDirection: "column", overflow: "hidden" }}>
        <Box className="custom-calendar-header">
          {["Domingo", "Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado"].map((day) => (
            <Box key={day} className="custom-calendar-header-cell">
              {day}
            </Box>
          ))}
        </Box>
        <Box
          className="custom-calendar"
          sx={{
            flexGrow: 1,
            overflowY: "auto",
            "&::-webkit-scrollbar": {
              width: 0,
              background: "transparent",
            },
            scrollbarWidth: "none",
            msOverflowStyle: "none",
          }}
        >
          {calendarDays.map((day) => {
            const dateKey = day.format("YYYY-MM-DD")
            const dayEvents = eventsByDate[dateKey] || []
            const isToday = day.isSame(moment(), "day")
            const isCurrentMonth = day.isSame(moment(date), "month")

            return (
              <Paper
                key={dateKey}
                className={`custom-calendar-day ${isToday ? "custom-calendar-day-today" : ""} ${
                  !isCurrentMonth ? "custom-calendar-day-outside" : ""
                }`}
                elevation={0}
                sx={{
                  minHeight: "150px",
                  height: "auto",
                  display: "flex",
                  flexDirection: "column",
                  border: "1px solid #e0e0e0",
                  borderRadius: "8px",
                  ...(isToday && { borderColor: "#0455a2", borderWidth: "2px" }),
                  cursor: "pointer",
                }}
                onClick={(e) => {
                  // Asegurarse de que el clic no sea en un evento o en el botón "más"
                  if (
                    !e.target.closest(".custom-calendar-event") &&
                    !e.target.closest(".custom-calendar-more-events")
                  ) {
                    const start = new Date(day.toDate())
                    start.setHours(9, 0, 0)
                    const end = new Date(day.toDate())
                    end.setHours(10, 0, 0)
                    handleSelectSlot({ start, end })
                  }
                }}
              >
                <Box
                  className="custom-calendar-day-header"
                  sx={{
                    p: 1,
                    display: "flex",
                    justifyContent: "space-between",
                    bgcolor: isToday ? alpha("#0455a2", 0.1) : "#f9fafb",
                    borderBottom: "1px solid #e0e0e0",
                  }}
                  onClick={(e) => e.stopPropagation()}
                >
                  <Typography
                    className="custom-calendar-day-number"
                    variant="body2"
                    sx={{
                      fontWeight: 600,
                      color: isToday ? "#0455a2" : "#374151",
                    }}
                  >
                    {day.format("D")}
                  </Typography>
                  {dayEvents.length > 0 && (
                    <Chip
                      size="small"
                      label={dayEvents.length}
                      color="primary"
                      sx={{ height: 20, minWidth: 20, fontSize: "0.7rem" }}
                    />
                  )}
                </Box>
                <Box
                  className="custom-calendar-day-content"
                  sx={{
                    flexGrow: 1,
                    overflowY: "auto",
                    p: 0.5,
                    maxHeight: "200px",
                  }}
                  onClick={(e) => e.stopPropagation()}
                >
                  {dayEvents
                    .sort((a, b) => a.start - b.start)
                    .slice(0, 5)
                    .map((event) => (
                      <Box
                        key={event.id}
                        className={`custom-calendar-event ${
                          event.resource.estado === "cancelada" ? "custom-calendar-event-cancelled" : ""
                        }`}
                        sx={{
                          bgcolor: alpha(event.color, 0.2),
                          color: event.color,
                          borderLeft: `3px solid ${event.color}`,
                          mb: 0.5,
                          p: 0.5,
                          borderRadius: "4px",
                          cursor: "pointer",
                          ...(event.resource.estado === "cancelada" && {
                            textDecoration: "line-through",
                            opacity: 0.7,
                          }),
                        }}
                        onClick={(e) => {
                          e.stopPropagation()
                          handleSelectEvent(event)
                        }}
                      >
                        <Box
                          className="custom-calendar-event-title"
                          sx={{
                            display: "flex",
                            alignItems: "center",
                            gap: 0.5,
                            fontSize: "0.75rem",
                            fontWeight: 600,
                            whiteSpace: "nowrap",
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                          }}
                        >
                          <SchoolIcon sx={{ fontSize: "0.75rem" }} />
                          {event.resource.curso}
                        </Box>
                        <Box
                          className="custom-calendar-event-details"
                          sx={{
                            display: "flex",
                            alignItems: "center",
                            gap: 0.5,
                            fontSize: "0.7rem",
                            whiteSpace: "nowrap",
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                          }}
                        >
                          <TimeIcon sx={{ fontSize: "0.7rem" }} />
                          {moment(event.start).format("HH:mm")}
                        </Box>
                      </Box>
                    ))}
                  {dayEvents.length > 5 && (
                    <Box
                      className="custom-calendar-more-events"
                      sx={{
                        textAlign: "center",
                        p: 0.5,
                        bgcolor: alpha("#0455a2", 0.1),
                        color: "#0455a2",
                        borderRadius: "4px",
                        fontSize: "0.7rem",
                        fontWeight: 500,
                        cursor: "pointer",
                        "&:hover": {
                          bgcolor: alpha("#0455a2", 0.2),
                        },
                      }}
                      onClick={(e) => {
                        e.stopPropagation()
                        handleOpenDayEventsModal(day.toDate())
                      }}
                    >
                      +{dayEvents.length - 5} más
                    </Box>
                  )}
                </Box>
              </Paper>
            )
          })}
        </Box>
      </Box>
    )
  }

  // Efecto para agregar estilos CSS personalizados para el calendario
  React.useEffect(() => {
    const styleElement = document.createElement("style")
    styleElement.textContent = calendarStyles
    document.head.appendChild(styleElement)

    return () => {
      document.head.removeChild(styleElement)
    }
  }, [])

  return (
    <Box sx={{ height: "calc(100vh - 64px)", display: "flex", flexDirection: "column" }}>
      <Paper
        sx={{ borderBottom: 0, borderColor: "transparent", mb: 2, boxShadow: "none", backgroundColor: "transparent" }}
      >
        <Tabs
          value={tabValue}
          onChange={handleTabChange}
          variant="standard"
          sx={{
            "& .MuiTab-root": {
              fontWeight: "bold",
              fontSize: "0.9rem",
              color: "#555",
              textTransform: "none",
              minWidth: "120px",
              minHeight: "36px",
              padding: "6px 12px",
              marginRight: "8px",
              marginTop: "8px",
              marginBottom: "8px",
              borderRadius: "4px",
              transition: "all 0.3s ease",
              border: "1px solid #ddd",
              backgroundColor: "transparent",
            },
            "& .Mui-selected": {
              color: "#fff !important",
              backgroundColor: "#0455a2 !important",
              boxShadow: "0 2px 5px rgba(0,0,0,0.2)",
            },
            "& .MuiTabs-indicator": {
              display: "none",
            },
          }}
        >
          <Tab
            label="Calendario"
            id="tab-0"
            aria-controls="tabpanel-0"
            sx={{
              "&:hover": {
                backgroundColor: "rgba(4, 85, 162, 0.05)",
              },
            }}
          />
          <Tab
            label="Clases"
            id="tab-1"
            aria-controls="tabpanel-1"
            sx={{
              "&:hover": {
                backgroundColor: "rgba(4, 85, 162, 0.05)",
              },
            }}
          />
        </Tabs>
      </Paper>

      <div
        role="tabpanel"
        hidden={tabValue !== 0}
        id="tabpanel-0"
        aria-labelledby="tab-0"
        style={{ height: "calc(100% - 48px)" }}
      >
        {tabValue === 0 && (
          <Box sx={{ height: "100%", display: "flex", flexDirection: "column" }}>
            {/* Barra superior con título */}
            <Box
              sx={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                mb: 2,
                pb: 1,
                borderBottom: "1px solid #e0e0e0",
              }}
            >
              <Typography variant="h5" component="h1" sx={{ fontWeight: 500 }}>
                Gestión de Clases
              </Typography>

              <Box sx={{ display: "flex", gap: 1 }}>
                <TextField
                  placeholder="Buscar..."
                  size="small"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <SearchIcon />
                      </InputAdornment>
                    ),
                  }}
                  sx={{ width: { xs: "120px", sm: "200px" } }}
                />

                <Button
                  variant="contained"
                  startIcon={<AddIcon />}
                  onClick={handleCreateClass}
                  sx={{
                    bgcolor: "#0455a2",
                    textTransform: "none",
                    "&:hover": {
                      bgcolor: "#033b70",
                    },
                  }}
                >
                  Nueva clase
                </Button>
              </Box>
            </Box>

            {/* Barra de navegación del calendario */}
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                mb: 2,
                px: 1,
                py: 0.5,
                borderBottom: "1px solid #e0e0e0",
              }}
            >
              <Box sx={{ display: "flex", alignItems: "center" }}>
                <IconButton onClick={() => handleNavigate("PREV")} size="small">
                  <ArrowBackIcon fontSize="small" />
                </IconButton>

                <Button
                  variant="text"
                  onClick={() => handleNavigate("TODAY")}
                  sx={{
                    textTransform: "none",
                    color: "#1a73e8",
                    minWidth: "auto",
                    px: 1,
                    fontSize: "0.875rem",
                  }}
                >
                  Hoy
                </Button>

                <IconButton onClick={() => handleNavigate("NEXT")} size="small">
                  <ArrowForwardIcon fontSize="small" />
                </IconButton>

                <Typography sx={{ ml: 1, fontSize: "1.125rem", fontWeight: 400 }}>{getCalendarTitle()}</Typography>
              </Box>

              <Box sx={{ display: "flex", gap: 1 }}>
                <Button
                  variant={view === "month" ? "contained" : "outlined"}
                  size="small"
                  onClick={() => handleViewChange("month")}
                  sx={{
                    textTransform: "none",
                    bgcolor: view === "month" ? "#0455a2" : "#f5f5f5",
                    color: view === "month" ? "white" : "black",
                    border: "1px solid #ddd",
                    "&:hover": {
                      bgcolor: view === "month" ? "#033b70" : "#e0e0e0",
                    },
                  }}
                >
                  Mes
                </Button>
                <Button
                  variant={view === "week" ? "contained" : "outlined"}
                  size="small"
                  onClick={() => handleViewChange("week")}
                  sx={{
                    textTransform: "none",
                    bgcolor: view === "week" ? "#0455a2" : "#f5f5f5",
                    color: view === "week" ? "white" : "black",
                    border: "1px solid #ddd",
                    "&:hover": {
                      bgcolor: view === "week" ? "#033b70" : "#e0e0e0",
                    },
                  }}
                >
                  Semana
                </Button>
                <Button
                  variant={view === "day" ? "contained" : "outlined"}
                  size="small"
                  onClick={() => handleViewChange("day")}
                  sx={{
                    textTransform: "none",
                    bgcolor: view === "day" ? "#0455a2" : "#f5f5f5",
                    color: view === "day" ? "white" : "black",
                    border: "1px solid #ddd",
                    "&:hover": {
                      bgcolor: view === "day" ? "#033b70" : "#e0e0e0",
                    },
                  }}
                >
                  Día
                </Button>
              </Box>
            </Box>

            {/* Calendario */}
            <Paper
              elevation={0}
              sx={{
                flexGrow: 1,
                borderRadius: "12px",
                boxShadow: "0 2px 10px rgba(0,0,0,0.08)",
                overflow: "hidden",
                display: "flex",
                flexDirection: "column",
              }}
            >
              {view === "custom" ? (
                renderCustomCalendar()
              ) : (
                <Calendar
                  localizer={localizer}
                  events={filteredEvents}
                  startAccessor="start"
                  endAccessor="end"
                  style={{ height: "100%" }}
                  selectable
                  onSelectEvent={handleSelectEvent}
                  onSelectSlot={handleSelectSlot}
                  views={["month", "week", "day"]}
                  view={view}
                  onView={handleViewChange}
                  date={date}
                  onNavigate={handleNavigate}
                  min={new Date(0, 0, 0, 6, 0, 0)} // 6:00 AM
                  max={new Date(0, 0, 0, 22, 0, 0)} // 10:00 PM
                  step={60}
                  timeslots={1}
                  eventPropGetter={(event) => ({
                    style: {
                      backgroundColor: event.color,
                      borderColor: event.color,
                      opacity: event.resource.estado === "cancelada" ? 0.6 : 1,
                      textDecoration: event.resource.estado === "cancelada" ? "line-through" : "none",
                    },
                  })}
                  messages={{
                    today: "Hoy",
                    previous: "Anterior",
                    next: "Siguiente",
                    month: "Mes",
                    week: "Semana",
                    day: "Día",
                    agenda: "Agenda",
                    date: "Fecha",
                    time: "Hora",
                    event: "Evento",
                    noEventsInRange: "No hay clases en este período",
                    showMore: (total) => `+ ${total} más`,
                  }}
                />
              )}
            </Paper>
          </Box>
        )}
      </div>

      <div
        role="tabpanel"
        hidden={tabValue !== 1}
        id="tabpanel-1"
        aria-labelledby="tab-1"
        style={{ height: "calc(100% - 48px)" }}
      >
        {tabValue === 1 && (
          <Box sx={{ height: "100%" }}>
            <GenericList
              data={classes}
              columns={classesColumns}
              onEdit={handleEditClass}
              onDelete={handleCancelClass}
              deleteButtonLabel="Cancelar Clase"
              onCreate={handleCreateClass}
              onView={handleViewClass}
              title="Gestión de Clases"
            />
          </Box>
        )}
      </div>

      {/* Modal para mostrar todos los eventos de un día */}
      <Dialog
        open={dayEventsModalOpen}
        onClose={handleCloseDayEventsModal}
        fullWidth
        maxWidth="sm"
        PaperProps={{
          sx: {
            borderRadius: "12px",
            boxShadow: "0 4px 30px rgba(0,0,0,0.2)",
            overflow: "hidden",
          },
        }}
      >
        {selectedDay && (
          <>
            <DialogTitle sx={{ pb: 1 }}>
              <Box className="day-events-modal-title">
                <Box sx={{ display: "flex", alignItems: "center" }}>
                  <CalendarIcon sx={{ mr: 1, color: "#0455a2" }} />
                  <Typography variant="h6" sx={{ fontWeight: 600 }}>
                    Clases del {moment(selectedDay).format("D [de] MMMM")}
                  </Typography>
                </Box>
                <IconButton onClick={handleCloseDayEventsModal} size="small">
                  <CloseIcon />
                </IconButton>
              </Box>
            </DialogTitle>
            <DialogContent>
              <List className="day-events-list">
                {eventsByDate[moment(selectedDay).format("YYYY-MM-DD")]
                  ?.sort((a, b) => a.start - b.start)
                  .map((event) => (
                    <Paper
                      key={event.id}
                      variant="outlined"
                      className="day-events-list-item"
                      sx={{ mb: 2, overflow: "hidden" }}
                    >
                      <Box
                        className="day-events-list-item-header"
                        sx={{
                          bgcolor: alpha(event.color, 0.1),
                          borderBottom: `1px solid ${alpha(event.color, 0.2)}`,
                        }}
                      >
                        <Box sx={{ display: "flex", alignItems: "center" }}>
                          <Avatar sx={{ width: 24, height: 24, bgcolor: event.color, mr: 1, fontSize: "0.75rem" }}>
                            {event.resource.curso.charAt(0)}
                          </Avatar>
                          <Typography
                            variant="subtitle2"
                            sx={{
                              fontWeight: 600,
                              ...(event.resource.estado === "cancelada" && {
                                textDecoration: "line-through",
                                opacity: 0.7,
                              }),
                            }}
                          >
                            {event.resource.curso}
                          </Typography>
                        </Box>
                        <Box>
                          <StatusButton status={event.resource.estado} />
                        </Box>
                      </Box>
                      <Box className="day-events-list-item-content">
                        <Grid container spacing={1} sx={{ mt: 0.5 }}>
                          <Grid item xs={12}>
                            <Typography variant="body2" sx={{ display: "flex", alignItems: "center" }}>
                              <PersonIcon fontSize="small" sx={{ mr: 0.5, fontSize: "0.9rem", color: "#0455a2" }} />
                              {event.resource.profesor}
                            </Typography>
                          </Grid>
                          <Grid item xs={12}>
                            <Typography variant="body2" sx={{ display: "flex", alignItems: "center" }}>
                              <TimeIcon fontSize="small" sx={{ mr: 0.5, fontSize: "0.9rem", color: "#0455a2" }} />
                              {moment(event.start).format("HH:mm")} - {moment(event.end).format("HH:mm")}
                            </Typography>
                          </Grid>
                        </Grid>
                      </Box>
                      <Box className="day-events-list-item-actions">
                        <Button
                          size="small"
                          startIcon={<EditIcon fontSize="small" />}
                          onClick={() => {
                            handleEditClass(event.resource)
                            handleCloseDayEventsModal()
                          }}
                          sx={{ textTransform: "none" }}
                        >
                          Editar
                        </Button>
                      </Box>
                    </Paper>
                  ))}
              </List>
            </DialogContent>
            <DialogActions>
              <Button
                onClick={handleCloseDayEventsModal}
                variant="outlined"
                sx={{ borderRadius: "8px", textTransform: "none" }}
              >
                Cerrar
              </Button>
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={() => {
                  const start = new Date(selectedDay)
                  start.setHours(9, 0, 0)
                  const end = new Date(selectedDay)
                  end.setHours(10, 0, 0)
                  handleSelectSlot({ start, end })
                  handleCloseDayEventsModal()
                }}
                sx={{
                  borderRadius: "8px",
                  bgcolor: "#0455a2",
                  textTransform: "none",
                  "&:hover": {
                    bgcolor: "#033b70",
                  },
                }}
              >
                Agregar clase
              </Button>
            </DialogActions>
          </>
        )}
      </Dialog>

      <DetailModal
        title={`Detalle de Clase: ${selectedClass?.curso}`}
        data={selectedClass}
        fields={classesDetailFields}
        open={classDetailOpen}
        onClose={handleCloseClassDetail}
      />

      <FormModal
        title={isEditingClass ? "Editar Clase" : "Crear Nueva Clase"}
        fields={classesFormFields}
        initialData={selectedClass}
        open={classFormOpen}
        onClose={handleCloseClassForm}
        onSubmit={handleSubmitClass}
      />

      <Dialog
        open={cancelDialogOpen}
        onClose={() => {
          setCancelDialogOpen(false)
          setCancelReason("")
          setSelectedClass(null)
        }}
      >
        <DialogTitle>Cancelar Clase</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Razón de Cancelación"
            type="text"
            fullWidth
            multiline
            rows={4}
            value={cancelReason}
            onChange={(e) => setCancelReason(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => {
              setCancelDialogOpen(false)
              setCancelReason("")
              setSelectedClass(null)
            }}
          >
            Cancelar
          </Button>
          <Button onClick={handleConfirmCancel} variant="contained" color="primary">
            Confirmar
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar para notificaciones */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={5000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
      >
        <Alert
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          severity={snackbar.severity}
          variant="filled"
          sx={{ width: "100%", borderRadius: "8px" }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  )
}

export default Clases
