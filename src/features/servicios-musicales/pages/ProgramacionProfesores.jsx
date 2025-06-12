"use client"

import { useState, useEffect, useMemo } from "react"
import { Calendar, momentLocalizer } from "react-big-calendar"
import moment from "moment"
import "moment/locale/es"
import withDragAndDrop from "react-big-calendar/lib/addons/dragAndDrop"
import "react-big-calendar/lib/css/react-big-calendar.css"
import "react-big-calendar/lib/addons/dragAndDrop/styles.css"
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  TextField,
  Typography,
  Paper,
  IconButton,
  Menu,
  MenuItem,
  Chip,
  Avatar,
  Select,
  FormControl,
  InputLabel,
  Grid,
  Divider,
  Fade,
  Zoom,
  InputAdornment,
  Stack,
  Badge,
  alpha,
  useTheme,
  useMediaQuery,
  Drawer,
  CircularProgress,
  Alert,
  Snackbar,
  ListItemIcon,
  List,
  Tooltip,
} from "@mui/material"
import {
  CalendarMonth as CalendarIcon,
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Search as SearchIcon,
  Close as CloseIcon,
  AccessTime as TimeIcon,
  Person as PersonIcon,
  Room as RoomIcon,
  School as SchoolIcon,
  Event as EventIcon,
  EventBusy as EventBusyIcon,
  EventAvailable as EventAvailableIcon,
  ArrowBack as ArrowBackIcon,
  ArrowForward as ArrowForwardIcon,
  FilterAlt as FilterAltIcon,
  FileDownload as FileDownloadIcon,
} from "@mui/icons-material"
import { ConfirmationDialog } from "../../../shared/components/ConfirmationDialog"
import { DetailModal } from "../../../shared/components/DetailModal"
import { jsPDF } from "jspdf"
import * as XLSX from "xlsx"

// Añadir esta importación al principio del archivo, después de las otras importaciones
import { ScheduleModal } from "../components/ScheduleModal"

// Configurar localización en español
moment.locale("es")
const localizer = momentLocalizer(moment)
const DragAndDropCalendar = withDragAndDrop(Calendar)

// Datos de ejemplo para profesores
const profesores = [
  { id: 1, nombre: "Juan López", especialidad: "Piano", color: "#4f46e5" },
  { id: 2, nombre: "Ana Martínez", especialidad: "Guitarra", color: "#0891b2" },
  { id: 3, nombre: "Carlos Rodríguez", especialidad: "Violín", color: "#7c3aed" },
  { id: 4, nombre: "María González", especialidad: "Canto", color: "#16a34a" },
  { id: 5, nombre: "Pedro Sánchez", especialidad: "Batería", color: "#ea580c" },
  { id: 6, nombre: "Laura Pérez", especialidad: "Flauta", color: "#db2777" },
]

// Datos de ejemplo para aulas
const aulas = [
  { id: 1, nombre: "Aula A101", capacidad: 15 },
  { id: 2, nombre: "Aula B202", capacidad: 20 },
  { id: 3, nombre: "Aula C303", capacidad: 10 },
  { id: 4, nombre: "Aula D404", capacidad: 25 },
  { id: 5, nombre: "Aula E505", capacidad: 8 },
]

// Datos de ejemplo para cursos
const cursos = [
  { id: 1, nombre: "Piano básico", duracion: 60 },
  { id: 2, nombre: "Guitarra avanzada", duracion: 90 },
  { id: 3, nombre: "Violín intermedio", duracion: 60 },
  { id: 4, nombre: "Canto y técnica vocal", duracion: 45 },
  { id: 5, nombre: "Batería para principiantes", duracion: 60 },
]

// Función para generar eventos aleatorios para demostración
const generateRandomEvents = () => {
  const events = []
  const startDate = moment().startOf("week").toDate()
  const endDate = moment().add(2, "weeks").endOf("week").toDate()

  // Generar más eventos para demostrar el problema de múltiples eventos
  for (let i = 0; i < 80; i++) {
    const profesor = profesores[Math.floor(Math.random() * profesores.length)]
    const aula = aulas[Math.floor(Math.random() * aulas.length)]
    const curso = cursos[Math.floor(Math.random() * cursos.length)]

    // Generar fecha aleatoria entre startDate y endDate
    const start = new Date(startDate.getTime() + Math.random() * (endDate.getTime() - startDate.getTime()))

    // Redondear a la hora o media hora más cercana
    start.setMinutes(Math.round(start.getMinutes() / 30) * 30)
    start.setSeconds(0)
    start.setMilliseconds(0)

    // Asegurarse de que la hora esté entre 8am y 8pm
    start.setHours(8 + Math.floor(Math.random() * 12))

    // Crear fecha de fin basada en la duración del curso
    const end = new Date(start.getTime() + curso.duracion * 60000)

    events.push({
      id: i + 1,
      title: profesor.nombre,
      start,
      end,
      profesor: profesor,
      aula: aula,
      curso: curso,
      color: profesor.color,
      status: Math.random() > 0.8 ? "cancelada" : "activa",
    })
  }

  return events
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
  
  /* Estilos para el selector de profesor */
  .profesor-selector {
    margin-bottom: 16px;
  }
  
  .profesor-selector .MuiAutocomplete-tag {
    background-color: #f0f7ff;
    border: 1px solid #cce3ff;
    border-radius: 4px;
  }
  
  /* Estilos para el botón de filtro */
  .filter-button {
    display: flex;
    align-items: center;
    gap: 8px;
    background-color: #f0f7ff;
    color: #0455a2;
    border: 1px solid #cce3ff;
    border-radius: 8px;
    padding: 6px 12px;
    font-weight: 500;
    transition: all 0.2s;
  }
  
  .filter-button:hover {
    background-color: #e0f0ff;
  }
  
  .filter-button.active {
    background-color: #0455a2;
    color: white;
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
  
  .custom-calendar-header {
    display: grid;
    grid-template-columns: repeat(7, 1fr);
    gap: 8px;
    padding: 8px;
    background-color: #f9fafb;
    position: sticky;
    top: 0;
    z-index: 10;
  }
  
  .custom-calendar-header-cell {
    text-align: center;
    padding: 8px;
    font-weight: 600;
    color: #374151;
  }
  
  .custom-calendar-day {
    min-height: 120px;
    border: 1px solid #e5e7eb;
    border-radius: 8px;
    overflow: hidden;
    display: flex;
    flex-direction: column;
  }
  
  .custom-calendar-day-header {
    padding: 8px;
    background-color: #f9fafb;
    border-bottom: 1px solid #e5e7eb;
    display: flex;
    justify-content: space-between;
    align-items: center;
  }
  
  .custom-calendar-day-number {
    font-weight: 600;
    color: #374151;
  }
  
  .custom-calendar-day-content {
    flex: 1;
    overflow-y: auto;
    padding: 4px;
    scrollbar-width: thin;
    scrollbar-color: transparent transparent;
  }

  .custom-calendar-day-content:hover {
    scrollbar-color: rgba(0, 0, 0, 0.2) transparent;
  }

  .custom-calendar-day-content::-webkit-scrollbar {
    width: 4px;
  }

  .custom-calendar-day-content::-webkit-scrollbar-track {
    background: transparent;
  }

  .custom-calendar-day-content::-webkit-scrollbar-thumb {
    background-color: transparent;
    border-radius: 4px;
  }

  .custom-calendar-day-content:hover::-webkit-scrollbar-thumb {
    background-color: rgba(0, 0, 0, 0.2);
  }
  
  .custom-calendar-event {
    margin-bottom: 4px;
    padding: 4px 6px;
    border-radius: 4px;
    font-size: 0.75rem;
    cursor: pointer;
    transition: all 0.2s;
  }
  
  .custom-calendar-event:hover {
    filter: brightness(1.1);
  }
  
  .custom-calendar-event-cancelled {
    text-decoration: line-through;
    opacity: 0.7;
  }
  
  .custom-calendar-event-title {
    font-weight: 600;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    display: flex;
    align-items: center;
    gap: 4px;
  }
  
  .custom-calendar-event-details {
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    display: flex;
    align-items: center;
    gap: 4px;
  }
  
  .custom-calendar-day-today {
    border: 2px solid #0455a2;
  }
  
  .custom-calendar-day-today .custom-calendar-day-header {
    background-color: rgba(4, 85, 162, 0.1);
  }
  
  .custom-calendar-day-today .custom-calendar-day-number {
    color: #0455a2;
  }
  
  .custom-calendar-day-outside {
    opacity: 0.5;
  }
  
  .custom-calendar-more-events {
    text-align: center;
    padding: 2px;
    background-color: rgba(4, 85, 162, 0.1);
    color: #0455a2;
    border-radius: 4px;
    font-size: 0.7rem;
    font-weight: 500;
    cursor: pointer;
  }
  
  .custom-calendar-more-events:hover {
    background-color: rgba(4, 85, 162, 0.2);
  }
`

const ProgramacionProfesores = () => {
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down("md"))
  const [events, setEvents] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedEvent, setSelectedEvent] = useState(null)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [eventDetailsOpen, setEventDetailsOpen] = useState(false)
  const [menuAnchorEl, setMenuAnchorEl] = useState(null)
  const [filterMenuAnchorEl, setFilterMenuAnchorEl] = useState(null)
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false)
  const [snackbar, setSnackbar] = useState({ open: false, message: "", severity: "success" })
  const [view, setView] = useState("month")
  const [date, setDate] = useState(new Date())
  const [filteredProfesores, setFilteredProfesores] = useState([])
  const [searchTerm, setSearchTerm] = useState("")
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [selectedProfesor, setSelectedProfesor] = useState(null)
  const [dayEventsModalOpen, setDayEventsModalOpen] = useState(false)
  const [selectedDay, setSelectedDay] = useState(null)
  const [formData, setFormData] = useState({
    profesorId: "",
    aulaId: "",
    cursoId: "",
    start: "",
    end: "",
    notas: "",
  })

  // Añadir el estado para controlar el modal de programación en el componente principal
  // Añadir después de la declaración de los estados existentes, cerca de la línea 400
  const [scheduleModalOpen, setScheduleModalOpen] = useState(false)
  const [actionToConfirm, setActionToConfirm] = useState(null)

  const classesDetailFields = [
    { label: "Profesor", value: selectedEvent?.profesor?.nombre, icon: <PersonIcon /> },
    { label: "Curso", value: selectedEvent?.curso?.nombre, icon: <SchoolIcon /> },
    { label: "Aula", value: selectedEvent?.aula?.nombre, icon: <RoomIcon /> },
    { label: "Fecha", value: moment(selectedEvent?.start).format("DD/MM/YYYY"), icon: <CalendarIcon /> },
    {
      label: "Horario",
      value: `${moment(selectedEvent?.start).format("HH:mm")} - ${moment(selectedEvent?.end).format("HH:mm")}`,
      icon: <TimeIcon />,
    },
    {
      label: "Estado",
      value: selectedEvent?.status,
      icon: selectedEvent?.status === "activa" ? <EventAvailableIcon /> : <EventBusyIcon />,
    },
  ]

  // Cargar datos al iniciar
  useEffect(() => {
    const loadData = async () => {
      setLoading(true)
      try {
        // Simular carga de datos
        await new Promise((resolve) => setTimeout(resolve, 1000))
        setEvents(generateRandomEvents())
        setFilteredProfesores(profesores.map((p) => p.id))
      } catch (error) {
        console.error("Error loading data:", error)
        setSnackbar({
          open: true,
          message: "Error al cargar los datos. Intente nuevamente.",
          severity: "error",
        })
      } finally {
        setLoading(false)
      }
    }

    loadData()

    // Agregar estilos CSS personalizados para el calendario
    const styleElement = document.createElement("style")
    styleElement.textContent = calendarStyles
    document.head.appendChild(styleElement)

    return () => {
      document.head.removeChild(styleElement)
    }
  }, [])

  // Filtrar eventos basados en profesores seleccionados y término de búsqueda
  const filteredEvents = useMemo(() => {
    return events.filter((event) => {
      // Filtrar por profesor seleccionado si existe
      if (selectedProfesor && event.profesor.id !== selectedProfesor.id) {
        return false
      }

      // Filtrar por profesores seleccionados en el filtro múltiple
      const profesorMatch = filteredProfesores.includes(event.profesor.id)

      // Filtrar por término de búsqueda
      const searchMatch =
        searchTerm === "" ||
        event.profesor.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
        event.curso.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
        event.aula.nombre.toLowerCase().includes(searchTerm.toLowerCase())

      return profesorMatch && searchMatch
    })
  }, [events, filteredProfesores, searchTerm, selectedProfesor])

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

  // Agrupar eventos por fecha
  const eventsByDate = useMemo(() => {
    const grouped = {}

    filteredEvents.forEach((event) => {
      const dateKey = moment(event.start).format("YYYY-MM-DD")
      if (!grouped[dateKey]) {
        grouped[dateKey] = []
      }
      grouped[dateKey].push(event)
    })

    return grouped
  }, [filteredEvents])

  // Manejadores de eventos
  const handleSelectEvent = (event, e) => {
    setSelectedEvent(event)
    if (isMobile) {
      setEventDetailsOpen(true)
    } else {
      setMenuAnchorEl(e.currentTarget)
    }
  }

  const handleSelectSlot = ({ start, end }) => {
    setSelectedEvent(null)
    setFormData({
      profesorId: selectedProfesor ? selectedProfesor.id.toString() : "",
      aulaId: "",
      cursoId: "",
      start: moment(start).format("YYYY-MM-DDTHH:mm"),
      end: moment(end).format("YYYY-MM-DDTHH:mm"),
      notas: "",
    })
    setDialogOpen(true)
  }

  const handleCloseMenu = () => {
    setMenuAnchorEl(null)
  }

  const handleCloseDialog = () => {
    setDialogOpen(false)
  }

  const handleCloseEventDetails = () => {
    setEventDetailsOpen(false)
    setSelectedEvent(null)
  }

  const handleEditEvent = () => {
    setFormData({
      profesorId: selectedEvent.profesor.id.toString(),
      aulaId: selectedEvent.aula.id.toString(),
      cursoId: selectedEvent.curso.id.toString(),
      start: moment(selectedEvent.start).format("YYYY-MM-DDTHH:mm"),
      end: moment(selectedEvent.end).format("YYYY-MM-DDTHH:mm"),
      notas: selectedEvent.notas || "",
    })
    setDialogOpen(true)
    handleCloseMenu()
    setEventDetailsOpen(false)
  }

  const handleDeleteEvent = () => {
    setConfirmDialogOpen(true)
    handleCloseMenu()
    setActionToConfirm("eliminar")
  }

  const confirmDelete = () => {
    setEvents(events.filter((event) => event.id !== selectedEvent.id))
    setConfirmDialogOpen(false)
    setEventDetailsOpen(false)
    setSnackbar({
      open: true,
      message: "Profesor eliminado correctamente",
      severity: "success",
    })
  }

  const handleSubmit = () => {
    const profesor = profesores.find((p) => p.id === Number.parseInt(formData.profesorId))
    const aula = aulas.find((a) => a.id === Number.parseInt(formData.aulaId))
    const curso = cursos.find((c) => c.id === Number.parseInt(formData.cursoId))

    if (!profesor || !aula || !curso) {
      setSnackbar({
        open: true,
        message: "Por favor complete todos los campos requeridos",
        severity: "error",
      })
      return
    }

    const newEvent = {
      id: selectedEvent ? selectedEvent.id : events.length + 1,
      title: profesor.nombre,
      start: new Date(formData.start),
      end: new Date(formData.end),
      profesor,
      aula,
      curso,
      color: profesor.color,
      notas: formData.notas,
      status: "activa",
    }

    if (selectedEvent) {
      setEvents(events.map((event) => (event.id === selectedEvent.id ? newEvent : event)))
      setSnackbar({
        open: true,
        message: "Profesor actualizado correctamente",
        severity: "success",
      })
    } else {
      setEvents([...events, newEvent])
      setSnackbar({
        open: true,
        message: "Profesor programado correctamente",
        severity: "success",
      })
    }

    handleCloseDialog()
  }

  const handleExportPdf = () => {
    const doc = new jsPDF()

    // Título y fecha
    doc.setFontSize(18)
    doc.setTextColor(5, 69, 162) // Color azul institucional
    doc.text("Programación de Profesores", 14, 22)

    doc.setFontSize(11)
    doc.setTextColor(100, 100, 100)
    doc.text(`Generado el ${moment().format("DD/MM/YYYY [a las] HH:mm")}`, 14, 30)

    // Filtros aplicados
    if (selectedProfesor) {
      doc.setFontSize(10)
      doc.text(`Profesor: ${selectedProfesor.nombre}`, 14, 38)
    } else if (filteredProfesores.length < profesores.length) {
      const profesoresNames = profesores
        .filter((p) => filteredProfesores.includes(p.id))
        .map((p) => p.nombre)
        .join(", ")

      doc.setFontSize(10)
      doc.text(`Filtrado por profesores: ${profesoresNames}`, 14, 38)
    }

    // Crear tabla manualmente
    const startY = 50
    const cellPadding = 5
    const colWidths = [40, 35, 40, 25, 25, 20, 20, 25]
    const tableHeaders = ["Profesor", "Especialidad", "Curso", "Aula", "Fecha", "Inicio", "Fin", "Estado"]

    // Dibujar encabezados
    doc.setFillColor(5, 69, 162)
    doc.setTextColor(255, 255, 255)
    doc.setFontSize(9)
    doc.setFont(undefined, "bold")

    let xPos = 10
    tableHeaders.forEach((header, i) => {
      doc.rect(xPos, startY, colWidths[i], 10, "F")
      doc.text(header, xPos + cellPadding, startY + 7)
      xPos += colWidths[i]
    })

    // Dibujar filas
    doc.setFont(undefined, "normal")
    doc.setTextColor(0, 0, 0)

    let yPos = startY + 10
    let rowCount = 0

    filteredEvents.forEach((event) => {
      // Alternar color de fondo para filas
      if (rowCount % 2 === 0) {
        doc.setFillColor(240, 240, 240)
      } else {
        doc.setFillColor(255, 255, 255)
      }

      // Color de texto para eventos cancelados
      if (event.status === "cancelada") {
        doc.setTextColor(220, 53, 69)
      } else {
        doc.setTextColor(0, 0, 0)
      }

      // Dibujar fondo de fila
      doc.rect(
        10,
        yPos,
        colWidths.reduce((a, b) => a + b, 0),
        10,
        "F",
      )

      // Dibujar contenido de celdas
      xPos = 10
      const rowData = [
        event.profesor.nombre,
        event.profesor.especialidad,
        event.curso.nombre,
        event.aula.nombre,
        moment(event.start).format("DD/MM/YYYY"),
        moment(event.start).format("HH:mm"),
        moment(event.end).format("HH:mm"),
        event.status === "activa" ? "Activa" : "Cancelada",
      ]

      rowData.forEach((cell, i) => {
        // Truncar texto si es demasiado largo
        let cellText = cell
        if (cellText.length > 15) {
          cellText = cellText.substring(0, 12) + "..."
        }

        doc.text(cellText, xPos + cellPadding, yPos + 7)
        xPos += colWidths[i]
      })

      yPos += 10
      rowCount++

      // Nueva página si es necesario
      if (yPos > 270) {
        doc.addPage()
        yPos = 20
        rowCount = 0
      }
    })

    doc.save("programacion-profesores.pdf")
  }

  // Función para exportar a Excel
  const handleExportExcel = () => {
    try {
      // Crear un nuevo libro de trabajo
      const wb = XLSX.utils.book_new()

      // Preparar los datos para Excel
      const excelData = filteredEvents.map((event) => ({
        Profesor: event.profesor.nombre,
        Especialidad: event.profesor.especialidad,
        Curso: event.curso.nombre,
        Aula: event.aula.nombre,
        Fecha: moment(event.start).format("DD/MM/YYYY"),
        "Hora Inicio": moment(event.start).format("HH:mm"),
        "Hora Fin": moment(event.end).format("HH:mm"),
        Estado: event.status === "activa" ? "Activa" : "Cancelada",
      }))

      // Convertir los datos a una hoja de cálculo
      const ws = XLSX.utils.json_to_sheet(excelData)

      // Añadir la hoja al libro
      XLSX.utils.book_append_sheet(wb, ws, "Programación")

      // Generar el archivo y descargarlo
      XLSX.writeFile(wb, "programacion-profesores.xlsx")

      setSnackbar({
        open: true,
        message: "Datos exportados a Excel correctamente",
        severity: "success",
      })
    } catch (error) {
      console.error("Error al exportar a Excel:", error)
      setSnackbar({
        open: true,
        message: "Error al exportar a Excel",
        severity: "error",
      })
    }
  }

  const handleFilterChange = (profesorId) => {
    setFilteredProfesores((prev) => {
      if (prev.includes(profesorId)) {
        return prev.filter((id) => id !== profesorId)
      } else {
        return [...prev, profesorId]
      }
    })
  }

  const handleSelectAllFilters = () => {
    setFilteredProfesores(profesores.map((p) => p.id))
    setFilterMenuAnchorEl(null)
  }

  const handleClearFilters = () => {
    setFilteredProfesores([])
    setFilterMenuAnchorEl(null)
  }

  const handleViewChange = (newView) => {
    setView(newView)
  }

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

  const handleRefresh = async () => {
    setLoading(true)
    try {
      // Simular recarga de datos
      await new Promise((resolve) => setTimeout(resolve, 1000))
      setEvents(generateRandomEvents())
      setSnackbar({
        open: true,
        message: "Datos actualizados correctamente",
        severity: "success",
      })
    } catch (error) {
      console.error("Error refreshing data:", error)
      setSnackbar({
        open: true,
        message: "Error al actualizar los datos",
        severity: "error",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleProfesorChange = (event, newValue) => {
    setSelectedProfesor(newValue)
  }

  const handleClearProfesor = () => {
    setSelectedProfesor(null)
  }

  const handleOpenDayEventsModal = (date) => {
    setSelectedDay(date)
    setDayEventsModalOpen(true)
  }

  const handleCloseDayEventsModal = () => {
    setDayEventsModalOpen(false)
    setSelectedDay(null)
  }

  // Modificar la función handleScheduleSubmit para usar el nuevo tipo ScheduleData
  // y para crear eventos en los días seleccionados
  const handleScheduleSubmit = (scheduleData) => {
    const { days, startTime, endTime, profesorId } = scheduleData

    if (!profesorId) {
      setSnackbar({
        open: true,
        message: "Por favor seleccione un profesor",
        severity: "error",
      })
      return
    }

    const profesor = profesores.find((p) => p.id === profesorId)
    if (!profesor) {
      setSnackbar({
        open: true,
        message: "Profesor no encontrado",
        severity: "error",
      })
      return
    }

    // Obtener la fecha actual como base
    const currentDate = new Date()
    const dayMap = {
      L: 1, // Lunes
      M: 2, // Martes
      X: 3, // Miércoles
      J: 4, // Jueves
      V: 5, // Viernes
      S: 6, // Sábado
      D: 0, // Domingo
    }

    // Crear eventos para cada día seleccionado
    const newEvents = []

    days.forEach((day) => {
      // Calcular la fecha del próximo día de la semana seleccionado
      const targetDay = dayMap[day]
      const daysToAdd = (targetDay + 7 - currentDate.getDay()) % 7
      const eventDate = new Date(currentDate)
      eventDate.setDate(currentDate.getDate() + daysToAdd)

      // Establecer las horas de inicio y fin
      const [startHour, startMinute] = startTime.split(":").map(Number)
      const [endHour, endMinute] = endTime.split(":").map(Number)

      const start = new Date(eventDate)
      start.setHours(startHour, startMinute, 0)

      const end = new Date(eventDate)
      end.setHours(endHour, endMinute, 0)

      // Crear el evento
      newEvents.push({
        id: events.length + newEvents.length + 1,
        title: profesor.nombre,
        start,
        end,
        profesor,
        aula: aulas[0], // Por defecto la primera aula, esto debería ser seleccionable
        curso: cursos[0], // Por defecto el primer curso, esto debería ser seleccionable
        color: profesor.color,
        status: "activa",
      })
    })

    // Añadir los nuevos eventos
    setEvents((prevEvents) => [...prevEvents, ...newEvents])

    setSnackbar({
      open: true,
      message: `Programación creada para ${days.length} día(s)`,
      severity: "success",
    })
  }

  // 1. Eliminar la variable tabValue y su manejador
  // Eliminar esta línea, ya no necesitamos tabValue

  // 2. Eliminar el handleTabChange
  // Eliminar esta función, ya no necesitamos handleTabChange

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

  // 3. Modificar el método renderCustomCalendar para permitir crear eventos al hacer clic
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
                          event.status === "cancelada" ? "custom-calendar-event-cancelled" : ""
                        }`}
                        sx={{
                          bgcolor: alpha(event.color, 0.2),
                          color: event.color,
                          borderLeft: `3px solid ${event.color}`,
                          mb: 0.5,
                          p: 0.5,
                          borderRadius: "4px",
                          cursor: "pointer",
                          ...(event.status === "cancelada" && {
                            textDecoration: "line-through",
                            opacity: 0.7,
                          }),
                        }}
                        onClick={(e) => {
                          e.stopPropagation()
                          handleSelectEvent(event, e)
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
                          <PersonIcon sx={{ fontSize: "0.75rem" }} />
                          {event.profesor.nombre}
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

  // 4. Reemplazar el return principal para eliminar las pestañas y simplificar la interfaz
  return (
    <Box sx={{ height: "100%", display: "flex", flexDirection: "column", overflow: "visible" }}>
      {/* Barra superior con título estilo lista */}
      <Box
        sx={{
          display: "flex",
          flexDirection: { xs: "column", md: "row" },
          alignItems: { xs: "stretch", md: "center" },
          justifyContent: "space-between",
          borderBottom: "1px solid #e0e0e0",
          pb: 2,
          mb: 2,
        }}
      >
        <Typography variant="h5" component="h1" sx={{ fontWeight: 500, color: "#333" }}>
          Programación de Profesores
        </Typography>

        <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap", alignItems: "center" }}>
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
              sx: { borderRadius: "4px" },
            }}
            sx={{ width: { xs: "100%", sm: "200px" } }}
          />

          <Tooltip title="Exportar a Excel">
            <IconButton
              onClick={handleExportExcel}
              sx={{
                color: "#217346", // Color verde de Excel
                backgroundColor: "rgba(33, 115, 70, 0.05)",
                "&:hover": {
                  backgroundColor: "rgba(33, 115, 70, 0.1)",
                },
                borderRadius: "50%",
                padding: "8px",
                transition: "all 0.2s ease",
              }}
            >
              <FileDownloadIcon />
            </IconButton>
          </Tooltip>

          {/* Añadir el botón para abrir el modal de programación */}
          {/* Buscar la sección donde están los botones de acción (cerca de la línea 1000) */}
          {/* y añadir un nuevo botón junto a "Crear nuevo" */}
          {/* Modificar la sección de botones en la barra superior: */}
          <Box sx={{ display: "flex", gap: 1 }}>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              sx={{
                bgcolor: "#0455a2",
                textTransform: "none",
                "&:hover": {
                  bgcolor: "#033b70",
                },
              }}
              onClick={() => setScheduleModalOpen(true)}

            >
              Crear Nuevo
            </Button>
          </Box>
        </Box>
      </Box>

      {/* Barra de navegación del calendario */}
      <Paper
        elevation={0}
        sx={{
          p: 2,
          mb: 2,
          borderRadius: "12px",
          boxShadow: "0 2px 10px rgba(0,0,0,0.08)",
        }}
      >
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} md={6}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <IconButton onClick={() => handleNavigate("PREV")} aria-label="Anterior">
                <ArrowBackIcon />
              </IconButton>

              <Button
                variant="text"
                onClick={() => handleNavigate("TODAY")}
                sx={{ fontWeight: 500, textTransform: "none" }}
              >
                Hoy
              </Button>

              <IconButton onClick={() => handleNavigate("NEXT")} aria-label="Siguiente">
                <ArrowForwardIcon />
              </IconButton>

              <Typography variant="h6" sx={{ fontWeight: 500, ml: 1 }}>
                {getCalendarTitle()}
              </Typography>
            </Box>
          </Grid>
          <Grid item xs={12} md={6}>
            <Box sx={{ display: "flex", justifyContent: "flex-end" }}>
              <IconButton
                onClick={(e) => setFilterMenuAnchorEl(e.currentTarget)}
                color={filteredProfesores.length < profesores.length ? "primary" : "default"}
                sx={{ ml: 1 }}
              >
                <Badge
                  badgeContent={
                    profesores.length - filteredProfesores.length > 0
                      ? profesores.length - filteredProfesores.length
                      : null
                  }
                  color="primary"
                >
                  <FilterAltIcon />
                </Badge>
              </IconButton>
            </Box>
          </Grid>
        </Grid>
      </Paper>

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
        {loading ? (
          <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100%" }}>
            <CircularProgress />
            <Typography variant="body1" sx={{ ml: 2 }}>
              Cargando programación...
            </Typography>
          </Box>
        ) : (
          renderCustomCalendar()
        )}
      </Paper>

      {/* Menú contextual para eventos */}
      <Menu
        anchorEl={menuAnchorEl}
        open={Boolean(menuAnchorEl)}
        onClose={handleCloseMenu}
        TransitionComponent={Fade}
        PaperProps={{
          sx: {
            borderRadius: "12px",
            boxShadow: "0 4px 20px rgba(0,0,0,0.15)",
          },
        }}
      >
        <MenuItem
          onClick={() => {
            setConfirmDialogOpen(true)
            setMenuAnchorEl(null)
            // Guardar el tipo de acción a confirmar
            setActionToConfirm("cancelar")
          }}
        >
          <EventBusyIcon fontSize="small" sx={{ mr: 1 }} />
          Cancelar programación
        </MenuItem>
        <MenuItem onClick={handleEditEvent}>
          <EditIcon fontSize="small" sx={{ mr: 1 }} />
          Editar
        </MenuItem>
        <MenuItem onClick={handleDeleteEvent}>
          <DeleteIcon fontSize="small" sx={{ mr: 1 }} />
          Eliminar
        </MenuItem>
      </Menu>

      {/* Diálogo de detalles del evento (móvil) */}
      <Drawer
        anchor="bottom"
        open={eventDetailsOpen}
        onClose={handleCloseEventDetails}
        PaperProps={{
          sx: {
            borderTopLeftRadius: "16px",
            borderTopRightRadius: "16px",
            maxHeight: "80vh",
          },
        }}
      >
        {selectedEvent && (
          <Box sx={{ p: 2 }}>
            <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
              <Typography variant="h6" sx={{ fontWeight: 600 }}>
                Detalles del profesor
              </Typography>
              <IconButton onClick={handleCloseEventDetails}>
                <CloseIcon />
              </IconButton>
            </Box>

            <Divider sx={{ mb: 2 }} />

            <Grid container spacing={2}>
              <Grid item xs={12}>
                <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
                  <Avatar sx={{ bgcolor: selectedEvent.color, mr: 2 }}>
                    <PersonIcon />
                  </Avatar>
                  <Box>
                    <Typography variant="h6">{selectedEvent.profesor.nombre}</Typography>
                    <Typography variant="body2" color="text.secondary">
                      {selectedEvent.profesor.especialidad}
                    </Typography>
                  </Box>
                </Box>
              </Grid>

              <Grid item xs={12}>
                <Paper variant="outlined" sx={{ p: 2, borderRadius: "8px" }}>
                  <Stack spacing={2}>
                    <Box sx={{ display: "flex", alignItems: "center" }}>
                      <SchoolIcon sx={{ color: "primary.main", mr: 1 }} />
                      <Box>
                        <Typography variant="body2" color="text.secondary">
                          Curso
                        </Typography>
                        <Typography variant="body1">{selectedEvent.curso.nombre}</Typography>
                      </Box>
                    </Box>

                    <Box sx={{ display: "flex", alignItems: "center" }}>
                      <RoomIcon sx={{ color: "primary.main", mr: 1 }} />
                      <Box>
                        <Typography variant="body2" color="text.secondary">
                          Aula
                        </Typography>
                        <Typography variant="body1">{selectedEvent.aula.nombre}</Typography>
                      </Box>
                    </Box>

                    <Box sx={{ display: "flex", alignItems: "center" }}>
                      <EventIcon sx={{ color: "primary.main", mr: 1 }} />
                      <Box>
                        <Typography variant="body2" color="text.secondary">
                          Fecha
                        </Typography>
                        <Typography variant="body1">
                          {moment(selectedEvent.start).format("dddd, D [de] MMMM [de] YYYY")}
                        </Typography>
                      </Box>
                    </Box>

                    <Box sx={{ display: "flex", alignItems: "center" }}>
                      <TimeIcon sx={{ color: "primary.main", mr: 1 }} />
                      <Box>
                        <Typography variant="body2" color="text.secondary">
                          Horario
                        </Typography>
                        <Typography variant="body1">
                          {moment(selectedEvent.start).format("HH:mm")} - {moment(selectedEvent.end).format("HH:mm")}
                        </Typography>
                      </Box>
                    </Box>

                    <Box>
                      <Chip
                        label={selectedEvent.status === "activa" ? "Clase activa" : "Clase cancelada"}
                        color={selectedEvent.status === "activa" ? "success" : "error"}
                        icon={selectedEvent.status === "activa" ? <EventAvailableIcon /> : <EventBusyIcon />}
                      />
                    </Box>
                  </Stack>
                </Paper>
              </Grid>

              <Grid item xs={12}>
                <Box sx={{ display: "flex", gap: 1, mt: 1 }}>
                  <Button
                    variant="outlined"
                    fullWidth
                    startIcon={<EditIcon />}
                    onClick={handleEditEvent}
                    sx={{ textTransform: "none" }}
                  >
                    Editar
                  </Button>
                  <Button
                    variant="outlined"
                    fullWidth
                    color="error"
                    startIcon={<DeleteIcon />}
                    onClick={handleDeleteEvent}
                    sx={{ textTransform: "none" }}
                  >
                    Eliminar
                  </Button>
                </Box>
              </Grid>
            </Grid>
          </Box>
        )}
      </Drawer>

      {/* Diálogo para crear/editar eventos */}
      <Dialog
        open={dialogOpen}
        onClose={handleCloseDialog}
        fullWidth
        maxWidth="sm"
        TransitionComponent={Zoom}
        PaperProps={{
          sx: {
            borderRadius: "12px",
            boxShadow: "0 4px 30px rgba(0,0,0,0.2)",
          },
        }}
      >
        <DialogTitle
          sx={{
            bgcolor: selectedEvent ? "#0455a2" : "#6c8221",
            color: "white",
            fontWeight: 600,
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          {selectedEvent ? "Editar profesor" : "Programar nuevo profesor"}
          <IconButton onClick={handleCloseDialog} sx={{ color: "white" }} aria-label="cerrar">
            <CloseIcon />
          </IconButton>
        </DialogTitle>

        <DialogContent sx={{ mt: 2 }}>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <FormControl fullWidth margin="normal">
                <InputLabel id="profesor-label">Profesor</InputLabel>
                <Select
                  labelId="profesor-label"
                  value={formData.profesorId}
                  onChange={(e) => setFormData({ ...formData, profesorId: e.target.value })}
                  label="Profesor"
                  required
                >
                  {profesores.map((profesor) => (
                    <MenuItem key={profesor.id} value={profesor.id.toString()}>
                      <Box sx={{ display: "flex", alignItems: "center" }}>
                        <Box
                          sx={{
                            width: 12,
                            height: 12,
                            borderRadius: "50%",
                            bgcolor: profesor.color,
                            mr: 1,
                          }}
                        />
                        {profesor.nombre} - {profesor.especialidad}
                      </Box>
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} sm={6}>
              <FormControl fullWidth margin="normal">
                <InputLabel id="curso-label">Curso</InputLabel>
                <Select
                  labelId="curso-label"
                  value={formData.cursoId}
                  onChange={(e) => setFormData({ ...formData, cursoId: e.target.value })}
                  label="Curso"
                  required
                >
                  {cursos.map((curso) => (
                    <MenuItem key={curso.id} value={curso.id.toString()}>
                      {curso.nombre} ({curso.duracion} min)
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} sm={6}>
              <FormControl fullWidth margin="normal">
                <InputLabel id="aula-label">Aula</InputLabel>
                <Select
                  labelId="aula-label"
                  value={formData.aulaId}
                  onChange={(e) => setFormData({ ...formData, aulaId: e.target.value })}
                  label="Aula"
                  required
                >
                  {aulas.map((aula) => (
                    <MenuItem key={aula.id} value={aula.id.toString()}>
                      {aula.nombre} (Cap: {aula.capacidad})
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                label="Fecha y hora de inicio"
                type="datetime-local"
                value={formData.start}
                onChange={(e) => setFormData({ ...formData, start: e.target.value })}
                fullWidth
                margin="normal"
                required
                InputLabelProps={{
                  shrink: true,
                }}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <EventIcon />
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                label="Fecha y hora de fin"
                type="datetime-local"
                value={formData.end}
                onChange={(e) => setFormData({ ...formData, end: e.target.value })}
                fullWidth
                margin="normal"
                required
                InputLabelProps={{
                  shrink: true,
                }}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <EventIcon />
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                label="Notas adicionales"
                multiline
                rows={3}
                value={formData.notas}
                onChange={(e) => setFormData({ ...formData, notas: e.target.value })}
                fullWidth
                margin="normal"
                placeholder="Información adicional sobre la clase..."
              />
            </Grid>
          </Grid>
        </DialogContent>

        <DialogActions sx={{ p: 2, pt: 0 }}>
          <Button
            onClick={handleCloseDialog}
            variant="outlined"
            sx={{
              borderRadius: "8px",
              textTransform: "none",
              fontWeight: 500,
            }}
          >
            Cancelar
          </Button>
          <Button
            onClick={handleSubmit}
            variant="contained"
            sx={{
              borderRadius: "8px",
              textTransform: "none",
              fontWeight: 500,
              bgcolor: selectedEvent ? "#0455a2" : "#6c8221",
              "&:hover": {
                bgcolor: selectedEvent ? "#033b70" : "#556619",
              },
            }}
          >
            {selectedEvent ? "Guardar cambios" : "Programar profesor"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Diálogo de confirmación para eliminar */}
      <ConfirmationDialog
        open={confirmDialogOpen}
        onClose={() => setConfirmDialogOpen(false)}
        onConfirm={() => {
          if (actionToConfirm === "eliminar") {
            setEvents(events.filter((event) => event.id !== selectedEvent.id))
            setSnackbar({
              open: true,
              message: "Programación eliminada correctamente",
              severity: "success",
            })
          } else if (actionToConfirm === "cancelar") {
            setEvents(events.map((event) =>
              event.id === selectedEvent.id
                ? { ...event, status: "cancelada" }
                : event
            ))
            setSnackbar({
              open: true,
              message: "Programación cancelada correctamente",
              severity: "info",
            })
          }
          setConfirmDialogOpen(false)
          setEventDetailsOpen(false)
          setActionToConfirm(null)
        }}
        title={actionToConfirm === "eliminar" ? "Eliminar Programación" : "Cancelar Programación"}
        content={
          actionToConfirm === "eliminar"
            ? `¿Está seguro de eliminar la programación de ${selectedEvent?.profesor?.nombre || ""}?`
            : `¿Está seguro de cancelar la programación de ${selectedEvent?.profesor?.nombre || ""}?`
        }
      />

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
                    Profesores del {moment(selectedDay).format("D [de] MMMM")}
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
                            {event.profesor.nombre.charAt(0)}
                          </Avatar>
                          <Typography
                            variant="subtitle2"
                            sx={{
                              fontWeight: 600,
                              ...(event.status === "cancelada" && {
                                textDecoration: "line-through",
                                opacity: 0.7,
                              }),
                            }}
                          >
                            {event.profesor.nombre}
                          </Typography>
                        </Box>
                        <Box>
                          {event.status === "cancelada" ? (
                            <Chip label="Cancelada" size="small" color="error" variant="outlined" sx={{ height: 20 }} />
                          ) : (
                            <Chip label="Activa" size="small" color="success" variant="outlined" sx={{ height: 20 }} />
                          )}
                        </Box>
                      </Box>
                      <Box className="day-events-list-item-content">
                        <Grid container spacing={1} sx={{ mt: 0.5 }}>
                          <Grid item xs={6}>
                            <Typography variant="body2" sx={{ display: "flex", alignItems: "center" }}>
                              <SchoolIcon fontSize="small" sx={{ mr: 0.5, fontSize: "0.9rem", color: "#0455a2" }} />
                              {event.curso.nombre}
                            </Typography>
                          </Grid>
                          <Grid item xs={6}>
                            <Typography variant="body2" sx={{ display: "flex", alignItems: "center" }}>
                              <RoomIcon fontSize="small" sx={{ mr: 0.5, fontSize: "0.9rem", color: "#0455a2" }} />
                              {event.aula.nombre}
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
                            setSelectedEvent(event)
                            handleEditEvent()
                            handleCloseDayEventsModal()
                          }}
                          sx={{ textTransform: "none" }}
                        >
                          Editar
                        </Button>
                        <Button
                          size="small"
                          color="error"
                          startIcon={<DeleteIcon fontSize="small" />}
                          onClick={() => {
                            setSelectedEvent(event)
                            handleCloseDayEventsModal()
                            setConfirmDialogOpen(true)
                          }}
                          sx={{ textTransform: "none" }}
                        >
                          Eliminar
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
                Agregar profesor
              </Button>
            </DialogActions>
          </>
        )}
      </Dialog>

      {/* Detalles del evento en modal */}
      <DetailModal
        title={`Detalle de Profesor: ${selectedEvent?.profesor?.nombre || ""}`}
        data={selectedEvent}
        fields={classesDetailFields}
        open={eventDetailsOpen && !isMobile}
        onClose={handleCloseEventDetails}
      />

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

      {/* Menú de filtros */}
      <Menu
        anchorEl={filterMenuAnchorEl}
        open={Boolean(filterMenuAnchorEl)}
        onClose={() => setFilterMenuAnchorEl(null)}
        PaperProps={{
          sx: {
            borderRadius: "8px",
            boxShadow: "0 4px 20px rgba(0,0,0,0.15)",
            maxHeight: "300px",
            width: "250px",
            overflowY: "auto",
            "&::-webkit-scrollbar": {
              display: "none",
            },
            scrollbarWidth: "none" /* Firefox */,
            msOverflowStyle: "none" /* IE and Edge */,
          },
        }}
      >
        <MenuItem onClick={handleSelectAllFilters}>
          <Typography variant="body2">Seleccionar todos</Typography>
        </MenuItem>
        <MenuItem onClick={handleClearFilters}>
          <Typography variant="body2">Limpiar filtros</Typography>
        </MenuItem>
        <Divider sx={{ my: 1 }} />
        {profesores.map((profesor) => (
          <MenuItem
            key={profesor.id}
            onClick={() => handleFilterChange(profesor.id)}
            sx={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}
          >
            <Box sx={{ display: "flex", alignItems: "center" }}>
              <Box
                sx={{
                  width: 12,
                  height: 12,
                  borderRadius: "50%",
                  bgcolor: profesor.color,
                  mr: 1.5,
                }}
              />
              <Typography variant="body2">{profesor.nombre}</Typography>
            </Box>
            {filteredProfesores.includes(profesor.id) && <Box sx={{ color: "primary.main", ml: 2 }}>✓</Box>}
          </MenuItem>
        ))}
      </Menu>

      {/* Modal de Programación */}
      <ScheduleModal
        isOpen={scheduleModalOpen}
        onClose={() => setScheduleModalOpen(false)}
        onSubmit={handleScheduleSubmit}
        profesores={profesores}
        defaultProfesorId={selectedProfesor?.id}
      />
    </Box>
  )
}

export default ProgramacionProfesores
