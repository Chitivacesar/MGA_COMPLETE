"use client"

import { useState, useMemo, useCallback, useRef, useEffect } from "react"
import {
  Box,
  Paper,
  Typography,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
  Grid,
  IconButton,
  InputAdornment,
  Chip,
  Avatar,
  CircularProgress,
  alpha,
  Snackbar,
  Alert,
  List,
  Divider,
  useTheme,
  useMediaQuery,
  Tooltip,
  Badge,
} from "@mui/material"
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Search as SearchIcon,
  Close as CloseIcon,
  AccessTime as TimeIcon,
  Person as PersonIcon,
  Room as RoomIcon,
  School as SchoolIcon,
  ArrowBack as ArrowBackIcon,
  ArrowForward as ArrowForwardIcon,
  FilterAlt as FilterAltIcon,
  FileDownload as FileDownloadIcon,
  Group as GroupIcon,
} from "@mui/icons-material"
import moment from "moment"
import "moment/locale/es"
import * as XLSX from "xlsx"

// Importar los componentes de confirmación y alerta
import { ConfirmationDialog } from "../../../shared/components/ConfirmationDialog"
import SuccessAlert from "../../../shared/components/SuccessAlert"
// Importar el nuevo componente ClassSchedulerModal
import { ClassSchedulerModal } from "../components/ClassSchedulerModal"
import { ProgramacionModal } from "../Components/ProgramacionModal"

// Configurar localización en español
moment.locale("es")

// Colores para las clases
const classColors = {
  "Guitarra Básica": "#4f46e5",
  "Piano Intermedio": "#0891b2",
  "Violín Avanzado": "#7c3aed",
  "Canto Básico": "#16a34a",
  "Batería Básica": "#ea580c",
  "Flauta Intermedia": "#db2777",
  "Saxofón Avanzado": "#9333ea",
  "Trompeta Básica": "#0284c7",
  "Violonchelo Intermedio": "#65a30d",
  "Arpa Avanzada": "#0d9488",
}

// Capacidad máxima por clase (cuántos estudiantes)
const capacidadClases = {
  "Guitarra Básica": 6,
  "Piano Intermedio": 4,
  "Violín Avanzado": 3,
  "Canto Básico": 8,
  "Batería Básica": 5,
  "Flauta Intermedia": 6,
  "Saxofón Avanzado": 4,
  "Trompeta Básica": 6,
  "Violonchelo Intermedio": 4,
  "Arpa Avanzada": 3,
}

// Función para obtener color para una clase
const getClassColor = (className) => {
  if (classColors[className]) {
    return classColors[className]
  }

  // Color por defecto si no está en la lista
  const colors = Object.values(classColors)
  let hash = 0
  for (let i = 0; i < className.length; i++) {
    hash = className.charCodeAt(i) + ((hash << 5) - hash)
  }
  const index = Math.abs(hash) % colors.length
  return colors[index]
}

const ProgramacionClases = () => {
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down("md"))
  const diasSemana = ["Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado"]
  const horasClase = [
    "8:00 - 9:00",
    "9:00 - 10:00",
    "10:00 - 11:00",
    "11:00 - 12:00",
    "14:00 - 15:00",
    "15:00 - 16:00",
    "16:00 - 17:00",
    "17:00 - 18:00",
  ]

  // Estado para almacenar estudiantes por clase
  const [estudiantesPorClase, setEstudiantesPorClase] = useState({
    // Estructura: { "Lunes-8:00 - 9:00-Guitarra Básica": ["Estudiante1", "Estudiante2"], ... }
  })

  const [programacion, setProgramacion] = useState([
    {
      id: 1,
      hora: "8:00 - 9:00",
      lunes: "Guitarra Básica",
      martes: "Piano Intermedio",
      miercoles: "",
      jueves: "Guitarra Básica",
      viernes: "",
      sabado: "Violín Avanzado",
      profesor: "Juan Pérez",
      aula: "A101",
    },
    {
      id: 2,
      hora: "9:00 - 10:00",
      lunes: "",
      martes: "Canto Básico",
      miercoles: "Piano Intermedio",
      jueves: "",
      viernes: "Canto Básico",
      sabado: "",
      profesor: "María Gómez",
      aula: "A102",
    },
    {
      id: 3,
      hora: "10:00 - 11:00",
      lunes: "Violín Avanzado",
      martes: "",
      miercoles: "Guitarra Básica",
      jueves: "Piano Intermedio",
      viernes: "Violín Avanzado",
      sabado: "",
      profesor: "Carlos Sánchez",
      aula: "A103",
    },
    {
      id: 4,
      hora: "11:00 - 12:00",
      lunes: "Batería Básica",
      martes: "Flauta Intermedia",
      miercoles: "",
      jueves: "Batería Básica",
      viernes: "Flauta Intermedia",
      sabado: "",
      profesor: "Ana Rodríguez",
      aula: "A104",
    },
    {
      id: 5,
      hora: "14:00 - 15:00",
      lunes: "Saxofón Avanzado",
      martes: "",
      miercoles: "Saxofón Avanzado",
      jueves: "",
      viernes: "Saxofón Avanzado",
      sabado: "",
      profesor: "Pedro Martínez",
      aula: "A105",
    },
    {
      id: 6,
      hora: "15:00 - 16:00",
      lunes: "",
      martes: "Trompeta Básica",
      miercoles: "",
      jueves: "Trompeta Básica",
      viernes: "",
      sabado: "Trompeta Básica",
      profesor: "Laura García",
      aula: "A106",
    },
    {
      id: 7,
      hora: "16:00 - 17:00",
      lunes: "Violonchelo Intermedio",
      martes: "",
      miercoles: "Violonchelo Intermedio",
      jueves: "",
      viernes: "Violonchelo Intermedio",
      sabado: "",
      profesor: "Roberto Fernández",
      aula: "A107",
    },
    {
      id: 8,
      hora: "17:00 - 18:00",
      lunes: "",
      martes: "Arpa Avanzada",
      miercoles: "",
      jueves: "Arpa Avanzada",
      viernes: "",
      sabado: "Arpa Avanzada",
      profesor: "Carmen López",
      aula: "A108",
    },
  ])

  // Inicializar algunos estudiantes para demostración
  useEffect(() => {
    const inicializarEstudiantes = () => {
      const nuevoEstudiantes = {}

      // Añadir algunos estudiantes de ejemplo
      nuevoEstudiantes["Lunes-8:00 - 9:00-Guitarra Básica"] = ["María López", "Juan García", "Ana Fernández"]
      nuevoEstudiantes["Martes-9:00 - 10:00-Canto Básico"] = ["Carlos Rodríguez", "Laura Martínez"]
      nuevoEstudiantes["Lunes-11:00 - 12:00-Batería Básica"] = [
        "Pedro Sánchez",
        "Elena Gómez",
        "David Torres",
        "Lucía Ramírez",
      ]

      setEstudiantesPorClase(nuevoEstudiantes)
    }

    inicializarEstudiantes()
  }, [])

  const [detalleSeleccionado, setDetalleSeleccionado] = useState(null)
  const [formOpen, setFormOpen] = useState(false)
  const [formData, setFormData] = useState({
    hora: "",
    lunes: "",
    martes: "",
    miercoles: "",
    jueves: "",
    viernes: "",
    sabado: "",
    profesor: "",
    aula: "",
  })
  const [editingId, setEditingId] = useState(null)
  const viewMode = "week"
  const [date, setDate] = useState(new Date())
  const [searchTerm, setSearchTerm] = useState("")
  const [loading, setLoading] = useState(false)
  const [snackbar, setSnackbar] = useState({ open: false, message: "", severity: "success" })
  const [menuAnchorEl, setMenuAnchorEl] = useState(null)
  const [selectedEvent, setSelectedEvent] = useState(null)
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false)
  const [detailDialogOpen, setDetailDialogOpen] = useState(false)
  const [isSearchVisible, setIsSearchVisible] = useState(false)

  // Estado para controlar el modal de programación de clases
  const [schedulerModalOpen, setSchedulerModalOpen] = useState(false)

  const [modalOpen, setModalOpen] = useState(false);
  const [initialData, setInitialData] = useState(null);

  // useRef para mantener una referencia al valor actual de searchTerm
  const searchTermRef = useRef(searchTerm)

  // Actualizar la referencia cada vez que searchTerm cambie
  const updateSearchTermRef = useCallback(() => {
    searchTermRef.current = searchTerm
  }, [searchTerm])

  useEffect(() => {
    updateSearchTermRef()
  }, [updateSearchTermRef])

  // Extraer lista única de profesores y aulas para filtros
  const profesores = useMemo(() => {
    const uniqueProfesores = new Set()
    programacion.forEach((item) => {
      if (item.profesor) uniqueProfesores.add(item.profesor)
    })
    return Array.from(uniqueProfesores).map((nombre) => ({
      id: nombre,
      nombre: nombre.split(" ")[0],
      apellidos: nombre.split(" ").slice(1).join(" "),
    }))
  }, [programacion])

  const aulas = useMemo(() => {
    const uniqueAulas = new Set()
    programacion.forEach((item) => {
      if (item.aula) uniqueAulas.add(item.aula)
    })
    return Array.from(uniqueAulas).map((nombre) => ({
      id: nombre,
      nombre,
    }))
  }, [programacion])

  // Extraer lista única de clases disponibles
  const clasesDisponibles = useMemo(() => {
    const uniqueClases = new Set()
    programacion.forEach((item) => {
      diasSemana.forEach((dia) => {
        const diaKey = dia.toLowerCase().replace("é", "e").replace("á", "a")
        if (item[diaKey] && item[diaKey].trim() !== "") {
          uniqueClases.add(item[diaKey])
        }
      })
    })
    return Array.from(uniqueClases)
  }, [programacion, diasSemana])

  // Filtrar programación basada en búsqueda y filtros
  const filteredProgramacion = useMemo(() => {
    return programacion.filter((item) => {
      if (searchTerm === "") return true

      // Buscar en profesor
      if (item.profesor.toLowerCase().includes(searchTerm.toLowerCase())) return true

      // Buscar en aula
      if (item.aula.toLowerCase().includes(searchTerm.toLowerCase())) return true

      // Buscar en clases (que podrían incluir nombres de estudiantes o cursos)
      for (const dia of diasSemana) {
        const diaKey = dia.toLowerCase().replace("é", "e").replace("á", "a")
        if (item[diaKey] && item[diaKey].toLowerCase().includes(searchTerm.toLowerCase())) return true
      }

      // Buscar en estudiantes
      for (const dia of diasSemana) {
        const diaKey = dia.toLowerCase().replace("é", "e").replace("á", "a")
        if (item[diaKey]) {
          const claseKey = `${dia}-${item.hora}-${item[diaKey]}`
          const estudiantes = estudiantesPorClase[claseKey] || []
          for (const estudiante of estudiantes) {
            if (estudiante.toLowerCase().includes(searchTerm.toLowerCase())) return true
          }
        }
      }

      return false
    })
  }, [programacion, searchTerm, diasSemana, estudiantesPorClase])

  // Obtener el rango de fechas para la vista semanal
  const weekDates = useMemo(() => {
    const startOfWeek = moment(date).startOf("week").add(1, "day") // Empezar en lunes
    return diasSemana.map((dia, index) => {
      const currentDate = startOfWeek.clone().add(index, "days")
      return {
        dia,
        fecha: currentDate,
        isToday: currentDate.isSame(moment(), "day"),
      }
    })
  }, [date, diasSemana])

  const handleOpenForm = (horario = null, dia = null, hora = null) => {
    if (horario) {
      setFormData(horario)
      setEditingId(horario.id)
    } else {
      const newFormData = {
        hora: hora || "",
        lunes: "",
        martes: "",
        miercoles: "",
        jueves: "",
        viernes: "",
        sabado: "",
        profesor: "",
        aula: "",
      }

      // Si se proporciona un día específico, inicializar ese campo
      if (dia) {
        const diaKey = dia.toLowerCase().replace("é", "e").replace("á", "a")
        newFormData[diaKey] = ""
      }

      setFormData(newFormData)
      setEditingId(null)
    }
    setFormOpen(true)
  }

  const handleCloseForm = () => {
    setFormOpen(false)
    setFormData({
      hora: "",
      lunes: "",
      martes: "",
      miercoles: "",
      jueves: "",
      viernes: "",
      sabado: "",
      profesor: "",
      aula: "",
    })
    setEditingId(null)
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleSubmitForm = () => {
    if (!formData.hora || !formData.profesor || !formData.aula) {
      setSnackbar({
        open: true,
        message: "Por favor complete los campos requeridos: Hora, Profesor y Aula",
        severity: "error",
      })
      return
    }

    // Verificar que al menos un día tenga una clase asignada
    const hasDayAssigned = diasSemana.some((dia) => {
      const diaKey = dia.toLowerCase().replace("é", "e").replace("á", "a")
      return formData[diaKey] && formData[diaKey].trim() !== ""
    })

    if (!hasDayAssigned) {
      setSnackbar({
        open: true,
        message: "Debe asignar al menos una clase a un día de la semana",
        severity: "error",
      })
      return
    }

    if (editingId) {
      setProgramacion((prev) => prev.map((item) => (item.id === editingId ? { ...formData, id: editingId } : item)))
      setSnackbar({
        open: true,
        message: "Horario actualizado correctamente",
        severity: "success",
      })
    } else {
      const newId = Math.max(0, ...programacion.map((item) => item.id)) + 1
      setProgramacion((prev) => [...prev, { ...formData, id: newId }])
      setSnackbar({
        open: true,
        message: "Horario creado correctamente",
        severity: "success",
      })
    }
    handleCloseForm()
  }

  const handleSubmitModal = (formData) => {
    if (formData.id) {
      // Actualizar un horario existente
      setProgramacion((prev) =>
        prev.map((item) => (item.id === formData.id ? formData : item))
      );
      setSnackbar({
        open: true,
        message: "Horario actualizado correctamente",
        severity: "success",
      });
    } else {
      // Crear un nuevo horario
      const newId = Math.max(0, ...programacion.map((item) => item.id)) + 1;
      setProgramacion((prev) => [...prev, { ...formData, id: newId }]);
      setSnackbar({
        open: true,
        message: "Horario creado correctamente",
        severity: "success",
      });
    }
    setModalOpen(false); // Cerrar el modal
  };

  const handleDelete = (id) => {
    // Antes de eliminar, obtenemos el horario para eliminar también sus estudiantes
    const horarioAEliminar = programacion.find((item) => item.id === id)
    if (horarioAEliminar) {
      // Eliminar estudiantes de todas las clases de este horario
      const nuevosEstudiantes = { ...estudiantesPorClase }

      diasSemana.forEach((dia) => {
        const diaKey = dia.toLowerCase().replace("é", "e").replace("á", "a")
        if (horarioAEliminar[diaKey] && horarioAEliminar[diaKey].trim() !== "") {
          const claseKey = `${dia}-${horarioAEliminar.hora}-${horarioAEliminar[diaKey]}`
          delete nuevosEstudiantes[claseKey]
        }
      })

      setEstudiantesPorClase(nuevosEstudiantes)
    }

    // Eliminar el horario
    setProgramacion((prev) => prev.filter((item) => item.id !== id))

    setSnackbar({
      open: true,
      message: "Horario eliminado correctamente",
      severity: "success",
    })
  }

  // Manejador para abrir el modal de programación
  const handleOpenSchedulerModal = () => {
    setSchedulerModalOpen(true)
  }

  // Manejador para cerrar el modal de programación
  const handleCloseSchedulerModal = () => {
    setSchedulerModalOpen(false)
  }

  // Manejador para procesar la programación desde el modal
  const handleSchedulerSubmit = (scheduledData) => {
    // scheduledData es un array de objetos con { dia, hora, clase, profesor, aula, estudiante }
    scheduledData.forEach((entry) => {
      if (!entry.estudiante) return // Ignorar entradas sin estudiante

      const diaKey = entry.dia.toLowerCase().replace("é", "e").replace("á", "a")

      // Verificar si ya existe un horario para esta hora
      const existingEntryIndex = programacion.findIndex((item) => item.hora === entry.hora)

      if (existingEntryIndex >= 0) {
        // El horario existe, verificar si ya tiene esta clase asignada
        const existingEntry = programacion[existingEntryIndex]

        if (existingEntry[diaKey] === entry.clase) {
          // La clase ya existe, solo añadir el estudiante
          const claseKey = `${entry.dia}-${entry.hora}-${entry.clase}`

          setEstudiantesPorClase((prev) => {
            const estudiantes = [...(prev[claseKey] || []), entry.estudiante]
            return {
              ...prev,
              [claseKey]: estudiantes,
            }
          })

          // No necesitamos actualizar la programación, solo los estudiantes
        } else if (existingEntry[diaKey]) {
          // El horario existe pero tiene otra clase asignada para este día
          // No permitimos sobrescribir, mostramos un error
          setSnackbar({
            open: true,
            message: `Ya existe una clase programada para ${entry.dia} a las ${entry.hora}`,
            severity: "error",
          })
        } else {
          // El horario existe pero no tiene clase asignada para este día
          // Actualizar el horario existente
          const updatedProgramacion = [...programacion]
          updatedProgramacion[existingEntryIndex] = {
            ...updatedProgramacion[existingEntryIndex],
            [diaKey]: entry.clase,
            profesor: entry.profesor,
            aula: entry.aula,
          }
          setProgramacion(updatedProgramacion)

          // Agregar el estudiante
          const claseKey = `${entry.dia}-${entry.hora}-${entry.clase}`
          setEstudiantesPorClase((prev) => ({
            ...prev,
            [claseKey]: [entry.estudiante],
          }))
        }
      } else {
        // El horario no existe, crear uno nuevo
        const newEntry = {
          hora: entry.hora,
          lunes: "",
          martes: "",
          miercoles: "",
          jueves: "",
          viernes: "",
          sabado: "",
          profesor: entry.profesor,
          aula: entry.aula,
        }

        // Asignar la clase al día correspondiente
        newEntry[diaKey] = entry.clase

        // Crear el nuevo horario
        const newId = Math.max(0, ...programacion.map((item) => item.id)) + 1
        setProgramacion((prev) => [...prev, { ...newEntry, id: newId }])

        // Agregar el estudiante
        const claseKey = `${entry.dia}-${entry.hora}-${entry.clase}`
        setEstudiantesPorClase((prev) => ({
          ...prev,
          [claseKey]: [entry.estudiante],
        }))
      }
    })

    setSnackbar({
      open: true,
      message: "Programación actualizada correctamente",
      severity: "success",
    })
  }

  const handleCreate = () => {
    // Ahora usamos el modal de programación en lugar del formulario antiguo
    handleOpenSchedulerModal()
  }

  // Exportar a Excel
  const handleExportExcel = () => {
    try {
      // Crear un nuevo libro de trabajo
      const wb = XLSX.utils.book_new()

      // Preparar los datos para Excel
      const excelData = programacion.map((item) => {
        const row = {
          Hora: item.hora,
          Profesor: item.profesor,
          Aula: item.aula,
        }

        // Añadir cada día de la semana como columna
        diasSemana.forEach((dia) => {
          const diaKey = dia.toLowerCase().replace("é", "e").replace("á", "a")
          row[dia] = item[diaKey] || "-"

          // Añadir estudiantes si existen
          if (item[diaKey]) {
            const claseKey = `${dia}-${item.hora}-${item[diaKey]}`
            const estudiantes = estudiantesPorClase[claseKey] || []
            row[`${dia} (Estudiantes)`] = estudiantes.join(", ")
          } else {
            row[`${dia} (Estudiantes)`] = "-"
          }
        })

        return row
      })

      // Convertir los datos a una hoja de cálculo
      const ws = XLSX.utils.json_to_sheet(excelData)

      // Añadir la hoja al libro
      XLSX.utils.book_append_sheet(wb, ws, "Programación Clases")

      // Generar el archivo y descargarlo
      XLSX.writeFile(wb, "programacion-clases.xlsx")

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

  // Exportar a PDF
  const handleExportPdf = () => {
    import("jspdf")
      .then(({ jsPDF }) => {
        const doc = new jsPDF("landscape")

        // Título y fecha
        doc.setFontSize(18)
        doc.setTextColor(5, 69, 162) // Color azul institucional
        doc.text("Programación de Clases", 14, 20)

        doc.setFontSize(11)
        doc.setTextColor(100, 100, 100)
        doc.text(`Generado el ${moment().format("DD/MM/YYYY [a las] HH:mm")}`, 14, 28)

        // Crear tabla manualmente
        const startY = 40
        const cellPadding = 5

        // Calcular anchos de columna
        const pageWidth = doc.internal.pageSize.getWidth() - 20
        const firstColWidth = 30
        const dayColWidth = (pageWidth - firstColWidth - 60) / 6 // 6 días
        const lastColsWidth = 30

        // Encabezados
        doc.setFillColor(5, 69, 162)
        doc.setTextColor(255, 255, 255)
        doc.setFontSize(10)
        doc.setFont(undefined, "bold")

        let xPos = 10

        // Primera columna - Hora
        doc.rect(xPos, startY, firstColWidth, 10, "F")
        doc.text("Hora", xPos + cellPadding, startY + 7)
        xPos += firstColWidth

        // Columnas de días
        diasSemana.forEach((dia) => {
          doc.rect(xPos, startY, dayColWidth, 10, "F")
          doc.text(dia, xPos + cellPadding, startY + 7)
          xPos += dayColWidth
        })

        // Últimas columnas - Profesor y Aula
        doc.rect(xPos, startY, lastColsWidth, 10, "F")
        doc.text("Profesor", xPos + cellPadding, startY + 7)
        xPos += lastColsWidth

        doc.rect(xPos, startY, lastColsWidth, 10, "F")
        doc.text("Aula", xPos + cellPadding, startY + 7)

        // Filas de datos
        doc.setFont(undefined, "normal")
        doc.setTextColor(0, 0, 0)
        doc.setFontSize(9)

        let yPos = startY + 10

        filteredProgramacion.forEach((item, index) => {
          // Alternar color de fondo
          if (index % 2 === 0) {
            doc.setFillColor(240, 240, 240)
          } else {
            doc.setFillColor(255, 255, 255)
          }

          xPos = 10

          // Hora
          doc.rect(xPos, yPos, firstColWidth, 10, "F")
          doc.text(item.hora, xPos + cellPadding, yPos + 7)
          xPos += firstColWidth

          // Días
          diasSemana.forEach((dia) => {
            const diaKey = dia.toLowerCase().replace("é", "e").replace("á", "a")
            doc.rect(xPos, yPos, dayColWidth, 10, "F")
            doc.text(item[diaKey] || "-", xPos + cellPadding, yPos + 7)
            xPos += dayColWidth
          })

          // Profesor
          doc.rect(xPos, yPos, lastColsWidth, 10, "F")
          doc.text(item.profesor, xPos + cellPadding, yPos + 7)
          xPos += lastColsWidth

          // Aula
          doc.rect(xPos, yPos, lastColsWidth, 10, "F")
          doc.text(item.aula, xPos + cellPadding, yPos + 7)

          yPos += 10

          // Nueva página si es necesario
          if (yPos > doc.internal.pageSize.getHeight() - 20) {
            doc.addPage()
            yPos = 20
          }
        })

        doc.save("programacion-clases.pdf")
      })
      .catch((error) => {
        console.error("Error al generar PDF:", error)
        setSnackbar({
          open: true,
          message: "Error al exportar a PDF",
          severity: "error",
        })
      })
  }

  // Manejadores para la navegación
  const handleNavigate = (action) => {
    if (action === "TODAY") {
      setDate(new Date())
    } else if (action === "PREV") {
      const newDate = new Date(date)
      if (viewMode === "month") {
        newDate.setMonth(date.getMonth() - 1)
      } else {
        newDate.setDate(date.getDate() - 7)
      }
      setDate(newDate)
    } else if (action === "NEXT") {
      const newDate = new Date(date)
      if (viewMode === "month") {
        newDate.setMonth(date.getMonth() + 1)
      } else {
        newDate.setDate(date.getDate() + 7)
      }
      setDate(newDate)
    }
  }

  const handleSelectEvent = (event) => {
    if (!event) return

    // Crear una copia del evento para no modificar el original
    const eventCopy = { ...event }

    // Asegurarse de que el evento tenga la propiedad dia
    if (!eventCopy.dia && eventCopy.id) {
      // Buscar el horario completo para este evento
      const horario = programacion.find((h) => h.id === eventCopy.id)
      if (horario) {
        // Determinar el día actual o el primer día con clase
        const diaSeleccionado =
          diasSemana.find((d) => {
            const dKey = d.toLowerCase().replace("é", "e").replace("á", "a")
            return horario[dKey] && horario[dKey].trim() !== ""
          }) || diasSemana[0]

        eventCopy.dia = diaSeleccionado
      } else {
        // Si no se encuentra el horario, asignar un día por defecto
        eventCopy.dia = diasSemana[0]
      }
    }

    // Si aún no tiene día asignado, usar el primer día de la semana
    if (!eventCopy.dia) {
      eventCopy.dia = diasSemana[0]
    }

    // Añadir información de estudiantes
    if (eventCopy.dia && eventCopy.hora) {
      const diaKey = eventCopy.dia.toLowerCase().replace("é", "e").replace("á", "a")
      const clase = eventCopy[diaKey]

      if (clase) {
        const claseKey = `${eventCopy.dia}-${eventCopy.hora}-${clase}`
        eventCopy.estudiantes = estudiantesPorClase[claseKey] || []
      }
    }

    setSelectedEvent(eventCopy)
    setDetailDialogOpen(true)
  }

  const handleCloseMenu = () => {
    setMenuAnchorEl(null)
  }

  const handleEditEvent = (horario) => {
    setInitialData(horario); // Pasar los datos del horario al modal
    setModalOpen(true); // Abrir el modal
  }

  const handleDeleteEvent = (id) => {
    setSelectedEvent({ id: id })
    setConfirmDialogOpen(true)
    handleCloseMenu()
  }

  const confirmDelete = () => {
    if (selectedEvent && selectedEvent.id) {
      handleDelete(selectedEvent.id)
      setDetailDialogOpen(false)
    }
    setConfirmDialogOpen(false)
  }

  // Obtener la cantidad de estudiantes para una clase
  const getEstudiantesCount = (hora, dia, clase) => {
    if (!clase) return 0
    const claseKey = `${dia}-${hora}-${clase}`
    return estudiantesPorClase[claseKey]?.length || 0
  }

  // Obtener el título basado en la fecha actual y modo de vista
  const getTitle = () => {
    if (viewMode === "month") {
      return moment(date).format("MMMM YYYY")
    } else {
      const startOfWeek = moment(date).startOf("week").add(1, "day") // Lunes
      const endOfWeek = moment(date).endOf("week").subtract(1, "day") // Sábado
      return `${startOfWeek.format("D [de] MMMM")} - ${endOfWeek.format("D [de] MMMM YYYY")}`
    }
  }

  // Renderizar la vista semanal
  const renderWeekView = () => {
    return (
      <Box sx={{ height: "100%", display: "flex", flexDirection: "column", overflow: "hidden" }}>
        {/* Cabecera con días de la semana */}
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: "100px repeat(6, 1fr)",
            bgcolor: "#f9fafb",
            borderBottom: "1px solid #e0e0e0",
            position: "sticky",
            top: 0,
            zIndex: 10,
          }}
        >
          <Box
            sx={{
              p: 2,
              borderRight: "1px solid #e0e0e0",
              fontWeight: "bold",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <TimeIcon sx={{ mr: 1, color: "#0455a2" }} />
            Hora
          </Box>

          {weekDates.map(({ dia, fecha, isToday }) => (
            <Box
              key={dia}
              sx={{
                p: 2,
                textAlign: "center",
                borderRight: "1px solid #e0e0e0",
                bgcolor: isToday ? alpha("#0455a2", 0.1) : "transparent",
                fontWeight: isToday ? "bold" : "normal",
              }}
            >
              <Typography
                variant="subtitle1"
                sx={{ fontWeight: isToday ? "bold" : "medium", color: isToday ? "#0455a2" : "inherit" }}
              >
                {dia}
              </Typography>
              <Typography variant="caption" sx={{ display: "block", color: isToday ? "#0455a2" : "text.secondary" }}>
                {fecha.format("D [de] MMMM")}
              </Typography>
            </Box>
          ))}
        </Box>

        {/* Filas de horarios */}
        <Box
          sx={{
            flexGrow: 1,
            overflowY: "auto",
            "&::-webkit-scrollbar": {
              width: 8,
            },
            "&::-webkit-scrollbar-track": {
              background: "#f1f1f1",
            },
            "&::-webkit-scrollbar-thumb": {
              background: "#c1c1c1",
              borderRadius: 4,
            },
          }}
        >
          {horasClase.map((hora) => {
            const horario = filteredProgramacion.find((h) => h.hora === hora) || {
              hora,
              lunes: "",
              martes: "",
              miercoles: "",
              jueves: "",
              viernes: "",
              sabado: "",
              profesor: "",
              aula: "",
            }

            return (
              <Box
                key={hora}
                sx={{
                  display: "grid",
                  gridTemplateColumns: "100px repeat(6, 1fr)",
                  borderBottom: "1px solid #e0e0e0",
                  "&:hover": {
                    bgcolor: alpha("#f0f7ff", 0.5),
                  },
                }}
              >
                <Box
                  sx={{
                    p: 2,
                    borderRight: "1px solid #e0e0e0",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    bgcolor: "#f9fafb",
                  }}
                >
                  <Typography variant="body2" sx={{ fontWeight: "medium" }}>
                    {hora}
                  </Typography>
                </Box>

                {diasSemana.map((dia, index) => {
                  const diaKey = dia.toLowerCase().replace("é", "e").replace("á", "a")
                  const clase = horario[diaKey]
                  const tieneClase = clase && clase.trim() !== ""
                  const numEstudiantes = tieneClase ? getEstudiantesCount(hora, dia, clase) : 0
                  const capacidadMax = tieneClase ? capacidadClases[clase] || 8 : 0
                  const estaLleno = numEstudiantes >= capacidadMax

                  return (
                    <Box
                      key={`${hora}-${dia}`}
                      sx={{
                        p: 1,
                        borderRight: "1px solid #e0e0e0",
                        height: "100%",
                        minHeight: "80px",
                        position: "relative",
                        cursor: tieneClase ? "pointer" : "default",
                      }}
                      onClick={() => {
                        if (tieneClase && horario.id) {
                          handleSelectEvent(horario)
                        } else {
                          handleOpenSchedulerModal()
                        }
                      }}
                    >
                      {tieneClase ? (
                        <Paper
                          elevation={0}
                          sx={{
                            height: "100%",
                            p: 1,
                            bgcolor: alpha(getClassColor(clase), 0.15),
                            borderLeft: `4px solid ${getClassColor(clase)}`,
                            borderRadius: "4px",
                            display: "flex",
                            flexDirection: "column",
                            justifyContent: "space-between",
                            transition: "all 0.2s",
                            position: "relative",
                            "&:hover": {
                              bgcolor: alpha(getClassColor(clase), 0.25),
                              transform: "translateY(-2px)",
                              boxShadow: "0 4px 8px rgba(0,0,0,0.1)",
                            },
                          }}
                        >
                          <Typography variant="subtitle2" sx={{ fontWeight: "bold", mb: 0.5 }}>
                            {clase}
                          </Typography>

                          <Box sx={{ display: "flex", flexDirection: "column", gap: 0.5 }}>
                            <Typography variant="caption" sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                              <PersonIcon fontSize="inherit" />
                              {horario.profesor}
                            </Typography>
                            <Typography variant="caption" sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                              <RoomIcon fontSize="inherit" />
                              {horario.aula}
                            </Typography>
                            <Typography variant="caption" sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                              <GroupIcon fontSize="inherit" />
                              <Badge
                                badgeContent={numEstudiantes}
                                color={estaLleno ? "error" : "primary"}
                                sx={{ "& .MuiBadge-badge": { fontSize: "0.6rem", height: 14, minWidth: 14 } }}
                              >
                                <Typography variant="caption" sx={{ fontSize: "0.75rem" }}>
                                  Estudiantes {estaLleno ? "(lleno)" : ""}
                                </Typography>
                              </Badge>
                            </Typography>
                          </Box>

                          <Box sx={{ display: "flex", justifyContent: "flex-end", mt: 1 }}>
                            <IconButton
                              size="small"
                              onClick={(e) => {
                                e.stopPropagation()
                                handleEditEvent(horario)
                              }}
                              sx={{ p: 0.5 }}
                            >
                              <EditIcon fontSize="small" />
                            </IconButton>
                            <IconButton
                              size="small"
                              color="error"
                              onClick={(e) => {
                                e.stopPropagation()
                                handleDeleteEvent(horario.id)
                              }}
                              sx={{ p: 0.5 }}
                            >
                              <DeleteIcon fontSize="small" />
                            </IconButton>
                          </Box>

                          {/* Indicador de capacidad */}
                          <Box
                            sx={{
                              position: "absolute",
                              top: 2,
                              right: 2,
                              width: 8,
                              height: 8,
                              borderRadius: "50%",
                              bgcolor: estaLleno ? "#f44336" : numEstudiantes > 0 ? "#4caf50" : "#ffc107",
                            }}
                          />
                        </Paper>
                      ) : (
                        <Box
                          sx={{
                            height: "100%",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            opacity: 0.5,
                            "&:hover": {
                              opacity: 1,
                              bgcolor: alpha("#0455a2", 0.05),
                            },
                          }}
                        >
                          <Tooltip title="Agregar clase">
                            <IconButton
                              size="small"
                              onClick={(e) => {
                                e.stopPropagation()
                                handleOpenSchedulerModal()
                              }}
                            >
                              <AddIcon />
                            </IconButton>
                          </Tooltip>
                        </Box>
                      )}
                    </Box>
                  )
                })}
              </Box>
            )
          })}
        </Box>
      </Box>
    )
  }

  // Renderizar la vista mensual
  const renderMonthView = () => {
    // Generar días del calendario para la vista mensual
    const calendarDays = useMemo(() => {
      const startOfMonth = moment(date).startOf("month")
      const endOfMonth = moment(date).endOf("month")
      const startDate = moment(startOfMonth).startOf("week").add(1, "day") // Empezar en lunes
      const endDate = moment(endOfMonth).endOf("week")

      const days = []
      const day = startDate.clone()

      while (day.isSameOrBefore(endDate)) {
        days.push({
          date: day.clone(),
          isCurrentMonth: day.month() === moment(date).month(),
          isToday: day.isSame(moment(), "day"),
        })
        day.add(1, "day")
        // Si llegamos al domingo, saltamos al lunes
        if (day.day() === 0) {
          day.add(1, "day")
        }
      }

      return days
    }, [date])

    // Agrupar clases por fecha
    const classesByDate = useCallback(() => {
      const result = {}

      // Para cada día del calendario
      calendarDays.forEach(({ date }) => {
        const dayOfWeek = date.day() // 0 = domingo, 1 = lunes, ..., 6 = sábado
        const dayKey = date.format("YYYY-MM-DD")
        result[dayKey] = []

        // Si es un día entre lunes y sábado (1-6)
        if (dayOfWeek >= 1 && dayOfWeek <= 6) {
          const diaIndex = dayOfWeek - 1 // 0 = lunes, ..., 5 = sábado
          const diaKey = diasSemana[diaIndex].toLowerCase().replace("é", "e").replace("á", "a")

          // Buscar clases para este día de la semana
          filteredProgramacion.forEach((horario) => {
            if (horario[diaKey] && horario[diaKey].trim() !== "") {
              const clase = horario[diaKey]
              const claseKey = `${diasSemana[diaIndex]}-${horario.hora}-${clase}`
              const estudiantes = estudiantesPorClase[claseKey] || []

              result[dayKey].push({
                ...horario,
                clase: clase,
                color: getClassColor(clase),
                estudiantes: estudiantes,
                capacidad: capacidadClases[clase] || 8,
              })
            }
          })
        }
      })

      return result
    }, [filteredProgramacion, calendarDays, diasSemana, estudiantesPorClase])

    const memoizedClassesByDate = useMemo(() => classesByDate(), [classesByDate])

    return (
      <Box sx={{ height: "100%", display: "flex", flexDirection: "column", overflow: "hidden" }}>
        {/* Cabecera con días de la semana */}
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: "repeat(6, 1fr)",
            bgcolor: "#f9fafb",
            borderBottom: "1px solid #e0e0e0",
          }}
        >
          {diasSemana.map((dia) => (
            <Box
              key={dia}
              sx={{
                p: 2,
                textAlign: "center",
                borderRight: "1px solid #e0e0e0",
              }}
            >
              <Typography variant="subtitle1" sx={{ fontWeight: "medium" }}>
                {dia}
              </Typography>
            </Box>
          ))}
        </Box>

        {/* Cuadrícula del calendario */}
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: "repeat(6, 1fr)",
            flexGrow: 1,
            overflowY: "auto",
            "&::-webkit-scrollbar": {
              width: 8,
            },
            "&::-webkit-scrollbar-track": {
              background: "#f1f1f1",
            },
            "&::-webkit-scrollbar-thumb": {
              background: "#c1c1c1",
              borderRadius: 4,
            },
          }}
        >
          {calendarDays.map(({ date, isCurrentMonth, isToday }) => {
            const dayKey = date.format("YYYY-MM-DD")
            const classes = memoizedClassesByDate[dayKey] || []

            return (
              <Box
                key={dayKey}
                sx={{
                  borderRight: "1px solid #e0e0e0",
                  borderBottom: "1px solid #e0e0e0",
                  p: 1,
                  minHeight: "120px",
                  bgcolor: isToday ? alpha("#0455a2", 0.05) : isCurrentMonth ? "transparent" : alpha("#f5f5f5", 0.5),
                  position: "relative",
                }}
              >
                <Typography
                  variant="caption"
                  sx={{
                    position: "absolute",
                    top: 5,
                    right: 8,
                    fontWeight: isToday ? "bold" : "normal",
                    color: isToday ? "#0455a2" : "text.secondary",
                    bgcolor: isToday ? alpha("#0455a2", 0.1) : "transparent",
                    borderRadius: "50%",
                    width: 24,
                    height: 24,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  {date.format("D")}
                </Typography>

                <Box sx={{ mt: 3, display: "flex", flexDirection: "column", gap: 0.5 }}>
                  {classes.slice(0, 3).map((item, index) => {
                    const numEstudiantes = item.estudiantes.length
                    const estaLleno = numEstudiantes >= item.capacidad

                    return (
                      <Paper
                        key={`${dayKey}-${index}`}
                        elevation={0}
                        sx={{
                          p: 1,
                          bgcolor: alpha(item.color, 0.15),
                          borderLeft: `3px solid ${item.color}`,
                          borderRadius: "4px",
                          cursor: "pointer",
                          transition: "all 0.2s",
                          position: "relative",
                          "&:hover": {
                            bgcolor: alpha(item.color, 0.25),
                            transform: "translateY(-2px)",
                            boxShadow: "0 2px 5px rgba(0,0,0,0.1)",
                          },
                        }}
                        onClick={() => handleSelectEvent(item)}
                      >
                        <Typography variant="caption" sx={{ fontWeight: "bold", display: "block", mb: 0.5 }}>
                          {item.clase}
                        </Typography>
                        <Typography variant="caption" sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                          <TimeIcon fontSize="inherit" />
                          {item.hora}
                        </Typography>
                        <Typography variant="caption" sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                          <GroupIcon fontSize="inherit" />
                          {numEstudiantes}/{item.capacidad}
                        </Typography>

                        {/* Indicador de capacidad */}
                        <Box
                          sx={{
                            position: "absolute",
                            top: 2,
                            right: 2,
                            width: 8,
                            height: 8,
                            borderRadius: "50%",
                            bgcolor: estaLleno ? "#f44336" : numEstudiantes > 0 ? "#4caf50" : "#ffc107",
                          }}
                        />
                      </Paper>
                    )
                  })}

                  {classes.length > 3 && (
                    <Box
                      sx={{
                        p: 0.5,
                        textAlign: "center",
                        color: "#0455a2",
                        fontSize: "0.75rem",
                        cursor: "pointer",
                        "&:hover": {
                          bgcolor: alpha("#0455a2", 0.1),
                          borderRadius: "4px",
                        },
                      }}
                      onClick={() =>
                        handleSelectEvent({
                          dia: date.format("dddd"),
                          fecha: date.format("DD/MM/YYYY"),
                          clases: classes,
                        })
                      }
                    >
                      +{classes.length - 3} más
                    </Box>
                  )}

                  {classes.length === 0 && isCurrentMonth && (
                    <Box
                      sx={{
                        height: "100%",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        opacity: 0.5,
                        mt: 2,
                        "&:hover": {
                          opacity: 1,
                        },
                      }}
                    >
                      <Tooltip title="Agregar clase">
                        <IconButton
                          size="small"
                          onClick={() => {
                            handleOpenSchedulerModal()
                          }}
                        >
                          <AddIcon />
                        </IconButton>
                      </Tooltip>
                    </Box>
                  )}
                </Box>
              </Box>
            )
          })}
        </Box>
      </Box>
    )
  }

  return (
    <Box sx={{ height: "calc(100vh - 64px)", display: "flex", flexDirection: "column" }}>
      {/* Barra superior con título */}
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 3,
          pb: 1,
          borderBottom: "1px solid #e0e0e0",
        }}
      >
        <Typography variant="h5" component="h1" sx={{ fontWeight: 500 }}>
          Programación de Clases
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

          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={handleCreate}
            sx={{
              bgcolor: "#0455a2",
              textTransform: "none",
              "&:hover": {
                bgcolor: "#033b70",
              },
            }}
          >
            Crear nuevo
          </Button>
        </Box>
      </Box>

      {/* Barra de navegación minimalista */}
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

          <Typography sx={{ ml: 1, fontSize: "1.125rem", fontWeight: 400 }}>
            {moment(date).format("MMMM YYYY")}
          </Typography>
        </Box>

        <IconButton size="small" onClick={() => setIsSearchVisible(!isSearchVisible)}>
          <FilterAltIcon fontSize="small" />
        </IconButton>
      </Box>

      {/* Campo de búsqueda oculto por defecto */}
      <Box
        id="search-field"
        sx={{
          mb: 2,
          px: 1,
          display: isSearchVisible ? "block" : "none",
        }}
      >
        <TextField
          placeholder="Filtrar por profesor, estudiante o aula..."
          size="small"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          fullWidth
          variant="outlined"
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon fontSize="small" />
              </InputAdornment>
            ),
          }}
        />
      </Box>

      {/* Contenido principal - Horario */}
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
        ) : viewMode === "week" ? (
          renderWeekView()
        ) : (
          renderMonthView()
        )}
      </Paper>

      {/* Modal de Formulario (antiguo) */}
      <Dialog
        open={formOpen}
        onClose={handleCloseForm}
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: "8px",
            boxShadow: "0 4px 20px rgba(0,0,0,0.15)",
          },
        }}
      >
        <DialogTitle sx={{ backgroundColor: "#0455a2", color: "white", fontWeight: "bold" }}>
          {editingId ? "Editar Horario" : "Nuevo Horario"}
        </DialogTitle>
        <DialogContent sx={{ mt: 2 }}>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <TextField
                select
                fullWidth
                label="Hora"
                name="hora"
                value={formData.hora}
                onChange={handleInputChange}
                required
                variant="outlined"
                sx={{ "& .MuiOutlinedInput-root": { borderRadius: "4px" } }}
              >
                {horasClase.map((hora) => (
                  <MenuItem key={hora} value={hora}>
                    {hora}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Profesor"
                name="profesor"
                value={formData.profesor}
                onChange={handleInputChange}
                required
                variant="outlined"
                sx={{ "& .MuiOutlinedInput-root": { borderRadius: "4px" } }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Aula"
                name="aula"
                value={formData.aula}
                onChange={handleInputChange}
                required
                variant="outlined"
                sx={{ "& .MuiOutlinedInput-root": { borderRadius: "4px" } }}
              />
            </Grid>

            <Grid item xs={12}>
              <Divider sx={{ my: 1 }}>
                <Chip label="Clases por día" />
              </Divider>
            </Grid>

            {diasSemana.map((dia) => {
              const diaKey = dia.toLowerCase().replace("é", "e").replace("á", "a")
              return (
                <Grid item xs={12} sm={6} key={dia}>
                  <TextField
                    fullWidth
                    label={`Clase ${dia}`}
                    name={diaKey}
                    value={formData[diaKey]}
                    onChange={handleInputChange}
                    variant="outlined"
                    sx={{ "& .MuiOutlinedInput-root": { borderRadius: "4px" } }}
                  />
                </Grid>
              )
            })}
          </Grid>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button
            onClick={handleCloseForm}
            variant="outlined"
            sx={{
              borderColor: "#0455a2",
              color: "#0455a2",
              "&:hover": {
                borderColor: "#033b7a",
                backgroundColor: "rgba(4, 85, 162, 0.04)",
              },
            }}
          >
            Cancelar
          </Button>
          <Button
            onClick={handleSubmitForm}
            variant="contained"
            sx={{
              backgroundColor: "#0455a2",
              "&:hover": {
                backgroundColor: "#033b7a",
              },
            }}
          >
            Guardar
          </Button>
        </DialogActions>
      </Dialog>

      {/* Nuevo Modal de Programación de Clases */}
      <ClassSchedulerModal
        isOpen={schedulerModalOpen}
        onClose={handleCloseSchedulerModal}
        onSubmit={handleSchedulerSubmit}
        profesores={profesores}
        aulas={aulas}
        programacion={programacion}
        clasesDisponibles={clasesDisponibles}
        capacidadClases={capacidadClases}
        estudiantesPorClase={estudiantesPorClase}
      />

      {/* Diálogo de detalles */}
      <Dialog
        open={detailDialogOpen}
        onClose={() => setDetailDialogOpen(false)}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: "8px",
            boxShadow: "0 4px 20px rgba(0,0,0,0.15)",
          },
        }}
      >
        {selectedEvent && (
          <>
            <DialogTitle
              sx={{
                backgroundColor: "#0455a2",
                color: "white",
                fontWeight: "bold",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <Box>Detalles de la Clase</Box>
              <IconButton onClick={() => setDetailDialogOpen(false)} sx={{ color: "white" }}>
                <CloseIcon />
              </IconButton>
            </DialogTitle>
            <DialogContent sx={{ mt: 2 }}>
              {selectedEvent.clases ? (
                // Vista de múltiples clases para un día
                <Box>
                  <Typography variant="h6" sx={{ mb: 2 }}>
                    Clases del {selectedEvent.dia}, {selectedEvent.fecha}
                  </Typography>

                  <List sx={{ maxHeight: 400, overflow: "auto" }}>
                    {selectedEvent.clases.map((clase, index) => (
                      <Paper key={index} variant="outlined" sx={{ mb: 2, overflow: "hidden" }}>
                        <Box
                          sx={{
                            bgcolor: alpha(clase.color, 0.1),
                            borderBottom: `1px solid ${alpha(clase.color, 0.2)}`,
                            p: 1.5,
                          }}
                        >
                          <Typography variant="subtitle1" sx={{ fontWeight: "bold" }}>
                            {clase.clase}
                          </Typography>
                        </Box>
                        <Box sx={{ p: 1.5 }}>
                          <Grid container spacing={1}>
                            <Grid item xs={12}>
                              <Typography variant="body2" sx={{ display: "flex", alignItems: "center" }}>
                                <TimeIcon fontSize="small" sx={{ mr: 0.5, fontSize: "0.9rem", color: "#0455a2" }} />
                                {clase.hora}
                              </Typography>
                            </Grid>
                            <Grid item xs={12}>
                              <Typography variant="body2" sx={{ display: "flex", alignItems: "center" }}>
                                <PersonIcon fontSize="small" sx={{ mr: 0.5, fontSize: "0.9rem", color: "#0455a2" }} />
                                {clase.profesor}
                              </Typography>
                            </Grid>
                            <Grid item xs={12}>
                              <Typography variant="body2" sx={{ display: "flex", alignItems: "center" }}>
                                <RoomIcon fontSize="small" sx={{ mr: 0.5, fontSize: "0.9rem", color: "#0455a2" }} />
                                {clase.aula}
                              </Typography>
                            </Grid>
                            <Grid item xs={12}>
                              <Typography variant="body2" sx={{ display: "flex", alignItems: "center" }}>
                                <GroupIcon fontSize="small" sx={{ mr: 0.5, fontSize: "0.9rem", color: "#0455a2" }} />
                                {clase.estudiantes?.length || 0} / {clase.capacidad} estudiantes
                              </Typography>
                            </Grid>
                            {clase.estudiantes && clase.estudiantes.length > 0 && (
                              <Grid item xs={12}>
                                <Typography variant="body2" sx={{ fontWeight: "bold", mt: 1 }}>
                                  Estudiantes:
                                </Typography>
                                <Box component="ul" sx={{ mt: 0.5, pl: 2 }}>
                                  {clase.estudiantes.map((est, idx) => (
                                    <Typography component="li" key={idx} variant="body2">
                                      {est}
                                    </Typography>
                                  ))}
                                </Box>
                              </Grid>
                            )}
                          </Grid>
                        </Box>
                        <Box sx={{ display: "flex", justifyContent: "flex-end", p: 1 }}>
                          <Button
                            size="small"
                            startIcon={<EditIcon fontSize="small" />}
                            onClick={() => {
                              handleEditEvent(clase)
                              setDetailDialogOpen(false)
                            }}
                            sx={{ textTransform: "none" }}
                          >
                            Editar
                          </Button>
                        </Box>
                      </Paper>
                    ))}
                  </List>
                </Box>
              ) : (
                // Vista de detalle de una clase
                <Grid container spacing={2}>
                  <Grid item xs={12}>
                    <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
                      <Avatar
                        sx={{
                          bgcolor:
                            selectedEvent && selectedEvent.dia
                              ? getClassColor(
                                  selectedEvent[selectedEvent.dia.toLowerCase().replace("é", "e").replace("á", "a")] ||
                                    "",
                                )
                              : "#0455a2",
                          mr: 2,
                        }}
                      >
                        <SchoolIcon />
                      </Avatar>
                      <Box>
                        <Typography variant="h6">
                          {selectedEvent && selectedEvent.dia
                            ? selectedEvent[selectedEvent.dia.toLowerCase().replace("é", "e").replace("á", "a")] ||
                              "Sin clase asignada"
                            : "Sin clase asignada"}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {selectedEvent.hora}
                        </Typography>
                      </Box>
                    </Box>
                  </Grid>

                  <Grid item xs={12}>
                    <Paper variant="outlined" sx={{ p: 2, borderRadius: "8px" }}>
                      <Grid container spacing={2}>
                        <Grid item xs={12} sm={6}>
                          <Typography variant="body2" color="text.secondary">
                            Profesor
                          </Typography>
                          <Typography variant="body1" sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                            <PersonIcon color="primary" fontSize="small" />
                            {selectedEvent.profesor}
                          </Typography>
                        </Grid>
                        <Grid item xs={12} sm={6}>
                          <Typography variant="body2" color="text.secondary">
                            Aula
                          </Typography>
                          <Typography variant="body1" sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                            <RoomIcon color="primary" fontSize="small" />
                            {selectedEvent.aula}
                          </Typography>
                        </Grid>
                        <Grid item xs={12}>
                          <Divider sx={{ my: 1 }} />
                          <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                            Programación semanal
                          </Typography>
                          <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
                            {diasSemana.map((dia) => {
                              const diaKey = dia.toLowerCase().replace("é", "e").replace("á", "a")
                              return selectedEvent[diaKey] ? (
                                <Chip
                                  key={dia}
                                  label={`${dia}: ${selectedEvent[diaKey]}`}
                                  sx={{
                                    bgcolor: alpha(getClassColor(selectedEvent[diaKey]), 0.1),
                                    color: getClassColor(selectedEvent[diaKey]),
                                    borderColor: getClassColor(selectedEvent[diaKey]),
                                    borderWidth: 1,
                                    borderStyle: "solid",
                                  }}
                                />
                              ) : null
                            })}
                          </Box>
                        </Grid>

                        {/* Mostrar estudiantes */}
                        {selectedEvent.estudiantes && selectedEvent.estudiantes.length > 0 && (
                          <Grid item xs={12}>
                            <Divider sx={{ my: 1 }} />
                            <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                              Estudiantes ({selectedEvent.estudiantes.length})
                            </Typography>
                            <Box sx={{ pl: 1 }}>
                              {selectedEvent.estudiantes.map((estudiante, index) => (
                                <Typography key={index} variant="body2" sx={{ mb: 0.5 }}>
                                  • {estudiante}
                                </Typography>
                              ))}
                            </Box>
                          </Grid>
                        )}
                      </Grid>
                    </Paper>
                  </Grid>
                </Grid>
              )}
            </DialogContent>
            <DialogActions sx={{ p: 2 }}>
              {!selectedEvent.clases && (
                <>
                  <Button
                    variant="outlined"
                    color="error"
                    startIcon={<DeleteIcon />}
                    onClick={() => {
                      handleDeleteEvent(selectedEvent.id)
                      setDetailDialogOpen(false)
                    }}
                    sx={{ mr: "auto" }}
                  >
                    Eliminar
                  </Button>
                  <Button
                    variant="outlined"
                    startIcon={<EditIcon />}
                    onClick={() => {
                      handleEditEvent(selectedEvent)
                      setDetailDialogOpen(false)
                    }}
                  >
                    Editar
                  </Button>
                </>
              )}
              <Button
                variant="contained"
                onClick={() => setDetailDialogOpen(false)}
                sx={{
                  backgroundColor: "#0455a2",
                  "&:hover": {
                    backgroundColor: "#033b7a",
                  },
                }}
              >
                Cerrar
              </Button>
            </DialogActions>
          </>
        )}
      </Dialog>

      {/* Diálogo de confirmación para eliminar */}
      <ConfirmationDialog
        open={confirmDialogOpen}
        onClose={() => setConfirmDialogOpen(false)}
        onConfirm={confirmDelete}
        title="Confirmar eliminación"
        content="¿Está seguro de que desea eliminar este horario? Esta acción no se puede deshacer."
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

    </Box>
  )
}

export default ProgramacionClases
