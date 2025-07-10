"use client"

import { useState, useEffect, useMemo } from "react"
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
  Grid,
  IconButton,
  InputAdornment,
  Chip,
  CircularProgress,
  alpha,
  Snackbar,
  Alert,
  Tooltip,
  Badge,
} from "@mui/material"
import {
  Add as AddIcon,
  Delete as DeleteIcon,
  Search as SearchIcon,
  Close as CloseIcon,
  AccessTime as TimeIcon,
  Person as PersonIcon,
  ArrowBack as ArrowBackIcon,
  ArrowForward as ArrowForwardIcon,
  FilterAlt as FilterAltIcon,
  Group as GroupIcon,
  Edit as EditIcon,
  Cancel as CancelIcon,
  Save as SaveIcon,
} from "@mui/icons-material"
import moment from "moment"
import "moment/locale/es"
import { ClassSchedulerModal } from "../components/ClassSchedulerModal"
import { ConfirmationDialog } from "../../../shared/components/ConfirmationDialog"
import axios from "axios"

moment.locale("es")

// Días de la semana INCLUYENDO DOMINGO
const diasSemana = ["Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado", "Domingo"]
const diasCodigo = {
  Lunes: "L",
  Martes: "M",
  Miércoles: "X",
  Jueves: "J",
  Viernes: "V",
  Sábado: "S",
  Domingo: "D",
}
const codigoDias = {
  L: "Lunes",
  M: "Martes",
  X: "Miércoles",
  J: "Jueves",
  V: "Viernes",
  S: "Sábado",
  D: "Domingo",
}

// HORARIOS EXPANDIDOS (6 AM a 11 PM)
const horasClase = [
  "06:00 - 07:00",
  "07:00 - 08:00",
  "08:00 - 09:00",
  "09:00 - 10:00",
  "10:00 - 11:00",
  "11:00 - 12:00",
  "12:00 - 13:00",
  "13:00 - 14:00",
  "14:00 - 15:00",
  "15:00 - 16:00",
  "16:00 - 17:00",
  "17:00 - 18:00",
  "18:00 - 19:00",
  "19:00 - 20:00",
  "20:00 - 21:00",
  "21:00 - 22:00",
  "22:00 - 23:00",
]

// Estilos mejorados para scroll
const scrollbarStyles = {
  "&::-webkit-scrollbar": {
    width: "12px",
    height: "12px",
  },
  "&::-webkit-scrollbar-track": {
    background: "#f1f3f4",
    borderRadius: "8px",
    margin: "2px",
  },
  "&::-webkit-scrollbar-thumb": {
    background: "linear-gradient(180deg, #0455a2 0%, #034589 100%)",
    borderRadius: "8px",
    border: "2px solid #f1f3f4",
    transition: "all 0.2s ease",
    "&:hover": {
      background: "linear-gradient(180deg, #034589 0%, #023660 100%)",
    },
  },
  "&::-webkit-scrollbar-corner": {
    background: "#f1f3f4",
  },
  scrollbarWidth: "thin",
  scrollbarColor: "#0455a2 #f1f3f4",
}

const getClassColor = (especialidad) => {
  const colors = [
    "#4f46e5",
    "#0891b2",
    "#7c3aed",
    "#16a34a",
    "#ea580c",
    "#db2777",
    "#9333ea",
    "#0284c7",
    "#65a30d",
    "#0d9488",
  ]
  let hash = 0
  if (!especialidad) return "#cccccc"
  for (let i = 0; i < especialidad.length; i++) {
    hash = especialidad.charCodeAt(i) + ((hash << 5) - hash)
  }
  const index = Math.abs(hash) % colors.length
  return colors[index]
}

const ProgramacionClases = () => {
  const [clases, setClases] = useState([])
  const [profesores, setProfesores] = useState([])
  const [beneficiarios, setBeneficiarios] = useState([])
  const [searchTerm, setSearchTerm] = useState("")
  const [snackbar, setSnackbar] = useState({ open: false, message: "", severity: "success" })
  const [detailDialogOpen, setDetailDialogOpen] = useState(false)
  const [editDialogOpen, setEditDialogOpen] = useState(false)
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false)
  const [selectedClase, setSelectedClase] = useState(null)
  const [editingClase, setEditingClase] = useState(null)
  const [cancelMotivo, setCancelMotivo] = useState("")
  const [date, setDate] = useState(new Date())
  const [isSearchVisible, setIsSearchVisible] = useState(false)
  const [loading, setLoading] = useState(true)
  const [schedulerOpen, setSchedulerOpen] = useState(false)
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false)
  const [claseToDelete, setClaseToDelete] = useState(null)

  // Cargar datos iniciales
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)

        // Cargar clases programadas
        const clasesResponse = await axios.get("http://localhost:3000/api/programacion_de_clases")
        console.log("Clases cargadas:", clasesResponse.data)
        setClases(clasesResponse.data)

        // Cargar profesores
        const profesoresResponse = await axios.get("http://localhost:3000/api/profesores")
        setProfesores(profesoresResponse.data)

        // Cargar beneficiarios solo de cursos vigentes
        const beneficiariosResponse = await axios.get("http://localhost:3000/api/ventas")
        const beneficiariosCursos = beneficiariosResponse.data.filter(
          (v) => v.estado === "vigente" && v.tipo === "curso",
        )
        setBeneficiarios(beneficiariosCursos)
      } catch (error) {
        console.error("Error al cargar datos:", error)
        setSnackbar({
          open: true,
          message: "Error al cargar los datos",
          severity: "error",
        })
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  // Procesar clases para la vista - FILTRAR SOLO LAS QUE TIENEN ESTUDIANTES Y ESPECIALIDAD
  const clasesProcessed = useMemo(() => {
    return clases
      .filter((clase) => {
        // Solo mostrar clases que tengan:
        // 1. Especialidad definida
        // 2. Al menos un beneficiario (venta principal)
        // 3. Profesor asignado
        return (
          clase.especialidad && clase.especialidad.trim() !== "" && clase.venta && clase.programacionProfesor?.profesor
        )
      })
      .map((clase) => {
        const profesor = clase.programacionProfesor?.profesor
        const beneficiarioPrincipal = clase.venta
        const beneficiariosAdicionales = clase.beneficiariosAdicionales || []

        // Extraer nombres de beneficiarios
        const nombreBeneficiarioPrincipal = beneficiarioPrincipal?.beneficiarioId
          ? `${beneficiarioPrincipal.beneficiarioId.nombre} ${beneficiarioPrincipal.beneficiarioId.apellido}`
          : "Sin beneficiario"

        const nombresBeneficiariosAdicionales = beneficiariosAdicionales
          .map((b) => (b.beneficiarioId ? `${b.beneficiarioId.nombre} ${b.beneficiarioId.apellido}` : null))
          .filter(Boolean)

        return {
          id: clase._id,
          dia: codigoDias[clase.dia] || clase.dia,
          diaCodigo: clase.dia,
          hora: `${clase.horaInicio} - ${clase.horaFin}`,
          horaInicio: clase.horaInicio,
          horaFin: clase.horaFin,
          clase: clase.especialidad,
          especialidad: clase.especialidad,
          profesor: profesor ? `${profesor.nombres} ${profesor.apellidos}` : "Sin profesor",
          profesorColor: profesor?.color || "#0455a2",
          beneficiarioPrincipal: nombreBeneficiarioPrincipal,
          beneficiarios: [nombreBeneficiarioPrincipal, ...nombresBeneficiariosAdicionales].filter(Boolean),
          totalBeneficiarios: 1 + beneficiariosAdicionales.length,
          estado: clase.estado,
          fecha: clase.fecha,
          observaciones: clase.observaciones,
          asistencia: clase.asistencia,
          motivo: clase.motivo,
          fechaCreacion: clase.createdAt,
          fechaActualizacion: clase.updatedAt,
          original: clase,
        }
      })
  }, [clases])

  // Filtrado por búsqueda
  const filteredClases = useMemo(() => {
    if (!searchTerm) return clasesProcessed
    return clasesProcessed.filter((c) =>
      [c.dia, c.hora, c.clase, c.profesor, ...c.beneficiarios]
        .join(" ")
        .toLowerCase()
        .includes(searchTerm.toLowerCase()),
    )
  }, [clasesProcessed, searchTerm])

  // Agrupar clases por día y hora para la grilla semanal
  const clasesPorDiaHora = useMemo(() => {
    const map = {}
    filteredClases.forEach((c) => {
      map[`${c.dia}-${c.hora}`] = c
    })
    return map
  }, [filteredClases])

  // Handlers
  const handleDeleteClase = (clase) => {
    setClaseToDelete(clase)
    setConfirmDialogOpen(true)
  }

  const handleEditClase = (clase) => {
    setEditingClase({ ...clase })
    setEditDialogOpen(true)
  }

  const handleCancelClase = (clase) => {
    setSelectedClase(clase)
    setCancelMotivo("")
    setCancelDialogOpen(true)
  }

  const handleConfirmDelete = async () => {
    if (!claseToDelete) return

    try {
      await axios.delete(`http://localhost:3000/api/programacion_de_clases/${claseToDelete.id}`)
      await reloadClases()
      setSnackbar({
        open: true,
        message: "Clase eliminada correctamente",
        severity: "success",
      })
    } catch (error) {
      console.error("Error al eliminar:", error)
      setSnackbar({
        open: true,
        message: "Error al eliminar la clase",
        severity: "error",
      })
    } finally {
      setConfirmDialogOpen(false)
      setClaseToDelete(null)
      setDetailDialogOpen(false)
    }
  }

  const handleConfirmCancel = async () => {
    if (!selectedClase || !cancelMotivo.trim()) return

    try {
      await axios.put(`http://localhost:3000/api/programacion_de_clases/${selectedClase.id}`, {
        estado: "cancelada",
        motivo: cancelMotivo.trim(),
      })
      await reloadClases()
      setSnackbar({
        open: true,
        message: "Clase cancelada correctamente",
        severity: "success",
      })
    } catch (error) {
      console.error("Error al cancelar:", error)
      setSnackbar({
        open: true,
        message: "Error al cancelar la clase",
        severity: "error",
      })
    } finally {
      setCancelDialogOpen(false)
      setSelectedClase(null)
      setCancelMotivo("")
      setDetailDialogOpen(false)
    }
  }

  const handleSaveEdit = async () => {
    if (!editingClase) return

    try {
      const updateData = {
        horaInicio: editingClase.horaInicio,
        horaFin: editingClase.horaFin,
        especialidad: editingClase.especialidad,
        observaciones: editingClase.observaciones,
      }

      await axios.put(`http://localhost:3000/api/programacion_de_clases/${editingClase.id}`, updateData)
      await reloadClases()
      setSnackbar({
        open: true,
        message: "Clase actualizada correctamente",
        severity: "success",
      })
    } catch (error) {
      console.error("Error al actualizar:", error)
      setSnackbar({
        open: true,
        message: "Error al actualizar la clase",
        severity: "error",
      })
    } finally {
      setEditDialogOpen(false)
      setEditingClase(null)
    }
  }

  const handleSchedulerSubmit = async (nuevaClase) => {
    try {
      console.log("📤 Enviando nueva clase al backend:", nuevaClase)

      // VALIDAR DATOS ANTES DE ENVIAR
      if (!nuevaClase.venta || !nuevaClase.programacionProfesor || !nuevaClase.especialidad) {
        throw new Error("Faltan datos requeridos para crear la clase")
      }

      const response = await axios.post("http://localhost:3000/api/programacion_de_clases", nuevaClase)
      console.log("✅ Respuesta del servidor:", response.data)

      await reloadClases()
      setSnackbar({
        open: true,
        message: "Clase programada correctamente",
        severity: "success",
      })
    } catch (error) {
      console.error("❌ Error al crear clase:", error)
      console.error("📋 Datos enviados:", nuevaClase)
      console.error("📋 Respuesta del error:", error.response?.data)

      setSnackbar({
        open: true,
        message: `Error al programar la clase: ${error.response?.data?.message || error.message}`,
        severity: "error",
      })
    }
  }

  const reloadClases = async () => {
    try {
      const clasesResponse = await axios.get("http://localhost:3000/api/programacion_de_clases")
      setClases(clasesResponse.data)
    } catch (error) {
      console.error("Error al recargar clases:", error)
    }
  }

  // Vista semanal con scroll mejorado
  const renderWeekView = () => (
    <Box sx={{ height: "100%", display: "flex", flexDirection: "column", overflow: "hidden" }}>
      {/* Cabecera CON TÍTULOS DE DÍAS */}
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: "120px repeat(7, 1fr)",
          bgcolor: "#0455a2",
          color: "white",
          borderBottom: "2px solid #023660",
          position: "sticky",
          top: 0,
          zIndex: 10,
          boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
        }}
      >
        <Box
          sx={{
            p: 1.5,
            borderRight: "1px solid rgba(255,255,255,0.2)",
            fontWeight: "bold",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            bgcolor: "#0455a2",
          }}
        >
          <TimeIcon sx={{ mr: 0.5, fontSize: 18 }} />
          <Typography variant="subtitle2" sx={{ fontWeight: 700, fontSize: "0.85rem" }}>
            Horarios
          </Typography>
        </Box>
        {/* TÍTULOS DE LOS DÍAS */}
        <Box
          sx={{
            p: 1.5,
            textAlign: "center",
            borderRight: "1px solid rgba(255,255,255,0.2)",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            bgcolor: "#0455a2",
          }}
        >
          <Typography variant="subtitle1" sx={{ fontWeight: 700, fontSize: "0.9rem", mb: 0.3 }}>
            Lunes
          </Typography>
          <Typography variant="caption" sx={{ opacity: 0.8, fontSize: "0.65rem" }}>
            {moment().startOf("week").add(1, "day").format("DD/MM")}
          </Typography>
        </Box>
        <Box
          sx={{
            p: 1.5,
            textAlign: "center",
            borderRight: "1px solid rgba(255,255,255,0.2)",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            bgcolor: "#0455a2",
          }}
        >
          <Typography variant="subtitle1" sx={{ fontWeight: 700, fontSize: "0.9rem", mb: 0.3 }}>
            Martes
          </Typography>
          <Typography variant="caption" sx={{ opacity: 0.8, fontSize: "0.65rem" }}>
            {moment().startOf("week").add(2, "day").format("DD/MM")}
          </Typography>
        </Box>
        <Box
          sx={{
            p: 1.5,
            textAlign: "center",
            borderRight: "1px solid rgba(255,255,255,0.2)",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            bgcolor: "#0455a2",
          }}
        >
          <Typography variant="subtitle1" sx={{ fontWeight: 700, fontSize: "0.9rem", mb: 0.3 }}>
            Miércoles
          </Typography>
          <Typography variant="caption" sx={{ opacity: 0.8, fontSize: "0.65rem" }}>
            {moment().startOf("week").add(3, "day").format("DD/MM")}
          </Typography>
        </Box>
        <Box
          sx={{
            p: 1.5,
            textAlign: "center",
            borderRight: "1px solid rgba(255,255,255,0.2)",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            bgcolor: "#0455a2",
          }}
        >
          <Typography variant="subtitle1" sx={{ fontWeight: 700, fontSize: "0.9rem", mb: 0.3 }}>
            Jueves
          </Typography>
          <Typography variant="caption" sx={{ opacity: 0.8, fontSize: "0.65rem" }}>
            {moment().startOf("week").add(4, "day").format("DD/MM")}
          </Typography>
        </Box>
        <Box
          sx={{
            p: 1.5,
            textAlign: "center",
            borderRight: "1px solid rgba(255,255,255,0.2)",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            bgcolor: "#0455a2",
          }}
        >
          <Typography variant="subtitle1" sx={{ fontWeight: 700, fontSize: "0.9rem", mb: 0.3 }}>
            Viernes
          </Typography>
          <Typography variant="caption" sx={{ opacity: 0.8, fontSize: "0.65rem" }}>
            {moment().startOf("week").add(5, "day").format("DD/MM")}
          </Typography>
        </Box>
        <Box
          sx={{
            p: 1.5,
            textAlign: "center",
            borderRight: "1px solid rgba(255,255,255,0.2)",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            bgcolor: "#0455a2",
          }}
        >
          <Typography variant="subtitle1" sx={{ fontWeight: 700, fontSize: "0.9rem", mb: 0.3 }}>
            Sábado
          </Typography>
          <Typography variant="caption" sx={{ opacity: 0.8, fontSize: "0.65rem" }}>
            {moment().startOf("week").add(6, "day").format("DD/MM")}
          </Typography>
        </Box>
        <Box
          sx={{
            p: 1.5,
            textAlign: "center",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            bgcolor: "#0455a2",
          }}
        >
          <Typography variant="subtitle1" sx={{ fontWeight: 700, fontSize: "0.85rem", mb: 0.3 }}>
            Domingo
          </Typography>
          <Typography variant="caption" sx={{ opacity: 0.8, fontSize: "0.65rem" }}>
            {moment().startOf("week").add(7, "day").format("DD/MM")}
          </Typography>
        </Box>
      </Box>

      {/* Filas con scroll oculto y líneas unidas */}
      <Box
        sx={{
          flexGrow: 1,
          overflow: "auto",
          // OCULTAR SCROLLBARS
          "&::-webkit-scrollbar": {
            display: "none",
          },
          scrollbarWidth: "none",
          msOverflowStyle: "none",
        }}
      >
        <Box sx={{ minWidth: "900px" }}>
          {horasClase.map((hora, index) => {
            const isEvenRow = index % 2 === 0
            return (
              <Box
                key={hora}
                sx={{
                  display: "grid",
                  gridTemplateColumns: "120px repeat(7, 1fr)",
                  borderBottom: "1px solid #e0e0e0",
                  minHeight: "80px", // Reducir altura para líneas más juntas
                  "&:hover": {
                    bgcolor: alpha("#f0f7ff", 0.5),
                    transition: "all 0.2s ease",
                  },
                }}
              >
                <Box
                  sx={{
                    p: 1.5,
                    borderRight: "1px solid #0455a2",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    bgcolor: isEvenRow ? "#f8f9fa" : "#ffffff",
                    position: "sticky",
                    left: 0,
                    zIndex: 1,
                    boxShadow: "1px 0 3px rgba(0,0,0,0.05)",
                  }}
                >
                  <Box sx={{ textAlign: "center" }}>
                    <Typography variant="body2" sx={{ fontWeight: 600, color: "#0455a2", fontSize: "0.85rem" }}>
                      {hora.split(" - ")[0]}
                    </Typography>
                    <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 500, fontSize: "0.7rem" }}>
                      {hora.split(" - ")[1]}
                    </Typography>
                  </Box>
                </Box>
                {diasSemana.map((dia) => {
                  const clase = clasesPorDiaHora[`${dia}-${hora}`]
                  const tieneClase = !!clase
                  const numBeneficiarios = clase?.totalBeneficiarios || 0

                  return (
                    <Box
                      key={`${hora}-${dia}`}
                      sx={{
                        p: 1,
                        borderRight: "1px solid #e0e0e0",
                        height: "100%",
                        minHeight: "80px", // Reducir altura
                        position: "relative",
                        bgcolor: isEvenRow ? "#fafbfc" : "#ffffff",
                      }}
                    >
                      {tieneClase ? (
                        <Paper
                          elevation={0}
                          sx={{
                            height: "100%",
                            p: 1,
                            bgcolor: alpha(getClassColor(clase.especialidad), 0.15),
                            borderLeft: `4px solid ${getClassColor(clase.especialidad)}`,
                            borderRadius: "6px",
                            display: "flex",
                            flexDirection: "column",
                            justifyContent: "space-between",
                            transition: "all 0.2s ease",
                            position: "relative",
                            cursor: "pointer",
                            "&:hover": {
                              bgcolor: alpha(getClassColor(clase.especialidad), 0.25),
                              transform: "translateY(-2px)",
                              boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                            },
                          }}
                          onClick={() => {
                            setSelectedClase(clase)
                            setDetailDialogOpen(true)
                          }}
                        >
                          <Typography variant="subtitle2" sx={{ fontWeight: "bold", mb: 0.3, fontSize: "0.8rem" }}>
                            {clase.especialidad}
                          </Typography>
                          <Box sx={{ display: "flex", flexDirection: "column", gap: 0.3 }}>
                            <Typography
                              variant="caption"
                              sx={{ display: "flex", alignItems: "center", gap: 0.3, fontSize: "0.7rem" }}
                            >
                              <PersonIcon fontSize="inherit" />
                              {clase.profesor}
                            </Typography>
                            <Typography
                              variant="caption"
                              sx={{ display: "flex", alignItems: "center", gap: 0.3, fontSize: "0.7rem" }}
                            >
                              <GroupIcon fontSize="inherit" />
                              <Badge
                                badgeContent={numBeneficiarios}
                                color="primary"
                                sx={{ "& .MuiBadge-badge": { fontSize: "0.55rem", height: 12, minWidth: 12 } }}
                              >
                                <Typography variant="caption" sx={{ fontSize: "0.7rem" }}>
                                  Estudiantes
                                </Typography>
                              </Badge>
                            </Typography>
                          </Box>
                          <Box sx={{ display: "flex", justifyContent: "flex-end", mt: 0.5, gap: 0.3 }}>
                            <IconButton
                              size="small"
                              color="primary"
                              onClick={(e) => {
                                e.stopPropagation()
                                handleEditClase(clase)
                              }}
                              sx={{
                                p: 0.3,
                                "&:hover": {
                                  bgcolor: alpha("#2196f3", 0.1),
                                },
                              }}
                            >
                              <EditIcon sx={{ fontSize: 14 }} />
                            </IconButton>
                            <IconButton
                              size="small"
                              color="warning"
                              onClick={(e) => {
                                e.stopPropagation()
                                handleCancelClase(clase)
                              }}
                              sx={{
                                p: 0.3,
                                "&:hover": {
                                  bgcolor: alpha("#ff9800", 0.1),
                                },
                              }}
                            >
                              <CancelIcon sx={{ fontSize: 14 }} />
                            </IconButton>
                            <IconButton
                              size="small"
                              color="error"
                              onClick={(e) => {
                                e.stopPropagation()
                                handleDeleteClase(clase)
                              }}
                              sx={{
                                p: 0.3,
                                "&:hover": {
                                  bgcolor: alpha("#f44336", 0.1),
                                },
                              }}
                            >
                              <DeleteIcon sx={{ fontSize: 14 }} />
                            </IconButton>
                          </Box>
                          <Box
                            sx={{
                              position: "absolute",
                              top: 3,
                              right: 3,
                              width: 8,
                              height: 8,
                              borderRadius: "50%",
                              bgcolor:
                                clase.estado === "ejecutada"
                                  ? "#4caf50"
                                  : clase.estado === "cancelada"
                                    ? "#f44336"
                                    : clase.estado === "programada"
                                      ? "#2196f3"
                                      : "#ffc107",
                              boxShadow: "0 1px 3px rgba(0,0,0,0.2)",
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
                            opacity: 0.3,
                            transition: "all 0.2s ease",
                            "&:hover": {
                              opacity: 0.8,
                              bgcolor: alpha("#0455a2", 0.05),
                              borderRadius: "6px",
                            },
                          }}
                        >
                          <Tooltip title="Agregar clase" arrow>
                            <IconButton
                              size="small"
                              onClick={() => setSchedulerOpen(true)}
                              sx={{
                                "&:hover": {
                                  bgcolor: alpha("#0455a2", 0.1),
                                },
                              }}
                            >
                              <AddIcon sx={{ fontSize: 18 }} />
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
    </Box>
  )

  return (
    <Box sx={{ height: "calc(100vh - 64px)", display: "flex", flexDirection: "column", mt: 2 }}>
      {/* Barra superior */}
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
          <Typography variant="caption" display="block" color="text.secondary">
            Mostrando solo clases con estudiantes asignados
          </Typography>
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
            onClick={() => setSchedulerOpen(true)}
            sx={{
              bgcolor: "#0455a2",
              textTransform: "none",
              "&:hover": {
                bgcolor: "#033b70",
              },
            }}
          >
            Nueva Clase
          </Button>
        </Box>
      </Box>

      {/* Barra de navegación */}
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
          <IconButton onClick={() => setDate(moment(date).subtract(7, "days").toDate())} size="small">
            <ArrowBackIcon fontSize="small" />
          </IconButton>
          <Button
            variant="text"
            onClick={() => setDate(new Date())}
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
          <IconButton onClick={() => setDate(moment(date).add(7, "days").toDate())} size="small">
            <ArrowForwardIcon fontSize="small" />
          </IconButton>
          <Typography sx={{ ml: 1, fontSize: "1.125rem", fontWeight: 400 }}>
            {moment(date).format("MMMM YYYY")}
          </Typography>
        </Box>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <Chip label={`${filteredClases.length} clases activas`} color="primary" variant="outlined" size="small" />
          <IconButton size="small" onClick={() => setIsSearchVisible(!isSearchVisible)}>
            <FilterAltIcon fontSize="small" />
          </IconButton>
        </Box>
      </Box>

      {/* Campo de búsqueda avanzado */}
      <Box
        sx={{
          mb: 2,
          px: 1,
          display: isSearchVisible ? "block" : "none",
        }}
      >
        <TextField
          placeholder="Filtrar por profesor, beneficiario o especialidad..."
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

      {/* Contenido principal */}
      <Paper
        elevation={0}
        sx={{
          flexGrow: 1,
          borderRadius: "12px",
          boxShadow: "0 4px 20px rgba(0,0,0,0.1)",
          overflow: "hidden",
          display: "flex",
          flexDirection: "column",
        }}
      >
        {loading ? (
          <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100%" }}>
            <CircularProgress size={50} sx={{ color: "#0455a2" }} />
            <Typography variant="body1" sx={{ ml: 2, fontWeight: 500 }}>
              Cargando programación...
            </Typography>
          </Box>
        ) : (
          renderWeekView()
        )}
      </Paper>

      {/* Modal detalle */}
      <Dialog open={detailDialogOpen} onClose={() => setDetailDialogOpen(false)} maxWidth="sm" fullWidth>
        {selectedClase && (
          <>
            <DialogTitle
              sx={{
                backgroundColor: getClassColor(selectedClase.especialidad),
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
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <Typography variant="h6" sx={{ mb: 2, color: getClassColor(selectedClase.especialidad) }}>
                    {selectedClase.especialidad}
                  </Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="body2" sx={{ display: "flex", alignItems: "center", gap: 0.5, mb: 1 }}>
                    <TimeIcon fontSize="inherit" />
                    <strong>Día:</strong> {selectedClase.dia}
                  </Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="body2" sx={{ display: "flex", alignItems: "center", gap: 0.5, mb: 1 }}>
                    <TimeIcon fontSize="inherit" />
                    <strong>Hora:</strong> {selectedClase.hora}
                  </Typography>
                </Grid>
                <Grid item xs={12}>
                  <Typography variant="body2" sx={{ display: "flex", alignItems: "center", gap: 0.5, mb: 1 }}>
                    <PersonIcon fontSize="inherit" />
                    <strong>Profesor:</strong> {selectedClase.profesor}
                  </Typography>
                </Grid>
                <Grid item xs={12}>
                  <Typography variant="body2" sx={{ display: "flex", alignItems: "center", gap: 0.5, mb: 1 }}>
                    <GroupIcon fontSize="inherit" />
                    <strong>Estudiantes ({selectedClase.totalBeneficiarios}):</strong>
                  </Typography>
                  <Box sx={{ ml: 3 }}>
                    {selectedClase.beneficiarios.map((beneficiario, index) => (
                      <Typography key={index} variant="body2" sx={{ mb: 0.5 }}>
                        • {beneficiario} {index === 0 && "(Principal)"}
                      </Typography>
                    ))}
                  </Box>
                </Grid>
                <Grid item xs={12}>
                  <Chip
                    label={selectedClase.estado.charAt(0).toUpperCase() + selectedClase.estado.slice(1)}
                    color={
                      selectedClase.estado === "ejecutada"
                        ? "success"
                        : selectedClase.estado === "cancelada"
                          ? "error"
                          : selectedClase.estado === "programada"
                            ? "info"
                            : "default"
                    }
                    sx={{ mb: 2 }}
                  />
                </Grid>
                {selectedClase.observaciones && (
                  <Grid item xs={12}>
                    <Typography variant="body2">
                      <strong>Observaciones:</strong> {selectedClase.observaciones}
                    </Typography>
                  </Grid>
                )}
                {selectedClase.motivo && (
                  <Grid item xs={12}>
                    <Typography variant="body2">
                      <strong>Motivo:</strong> {selectedClase.motivo}
                    </Typography>
                  </Grid>
                )}
              </Grid>
            </DialogContent>
            <DialogActions sx={{ p: 2 }}>
              <Button
                variant="outlined"
                color="primary"
                startIcon={<EditIcon />}
                onClick={() => handleEditClase(selectedClase)}
                sx={{ mr: 1 }}
              >
                Editar
              </Button>
              <Button
                variant="outlined"
                color="warning"
                startIcon={<CancelIcon />}
                onClick={() => handleCancelClase(selectedClase)}
                sx={{ mr: 1 }}
              >
                Cancelar
              </Button>
              <Button
                variant="outlined"
                color="error"
                startIcon={<DeleteIcon />}
                onClick={() => handleDeleteClase(selectedClase)}
                sx={{ mr: 1 }}
              >
                Eliminar
              </Button>
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

      {/* Modal editar clase */}
      <Dialog open={editDialogOpen} onClose={() => setEditDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ bgcolor: "#0455a2", color: "white" }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <EditIcon />
            Editar Clase
          </Box>
        </DialogTitle>
        <DialogContent sx={{ mt: 2 }}>
          {editingClase && (
            <Grid container spacing={2}>
              <Grid item xs={6}>
                <TextField
                  label="Hora Inicio"
                  type="time"
                  value={editingClase.horaInicio}
                  onChange={(e) => setEditingClase({ ...editingClase, horaInicio: e.target.value })}
                  fullWidth
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>
              <Grid item xs={6}>
                <TextField
                  label="Hora Fin"
                  type="time"
                  value={editingClase.horaFin}
                  onChange={(e) => setEditingClase({ ...editingClase, horaFin: e.target.value })}
                  fullWidth
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  label="Especialidad"
                  value={editingClase.especialidad}
                  onChange={(e) => setEditingClase({ ...editingClase, especialidad: e.target.value })}
                  fullWidth
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  label="Observaciones"
                  value={editingClase.observaciones || ""}
                  onChange={(e) => setEditingClase({ ...editingClase, observaciones: e.target.value })}
                  fullWidth
                  multiline
                  rows={3}
                />
              </Grid>
            </Grid>
          )}
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setEditDialogOpen(false)}>Cancelar</Button>
          <Button variant="contained" startIcon={<SaveIcon />} onClick={handleSaveEdit} sx={{ bgcolor: "#0455a2" }}>
            Guardar Cambios
          </Button>
        </DialogActions>
      </Dialog>

      {/* Modal cancelar clase */}
      <Dialog open={cancelDialogOpen} onClose={() => setCancelDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ bgcolor: "#ff9800", color: "white" }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <CancelIcon />
            Cancelar Clase
          </Box>
        </DialogTitle>
        <DialogContent sx={{ mt: 2 }}>
          <Typography variant="body1" sx={{ mb: 2 }}>
            ¿Está seguro de cancelar esta clase?
          </Typography>
          {selectedClase && (
            <Box sx={{ mb: 2, p: 2, bgcolor: "#f5f5f5", borderRadius: 1 }}>
              <Typography variant="subtitle2">{selectedClase.especialidad}</Typography>
              <Typography variant="body2">
                {selectedClase.dia} - {selectedClase.hora}
              </Typography>
              <Typography variant="body2">Profesor: {selectedClase.profesor}</Typography>
            </Box>
          )}
          <TextField
            label="Motivo de cancelación"
            value={cancelMotivo}
            onChange={(e) => setCancelMotivo(e.target.value)}
            fullWidth
            multiline
            rows={3}
            required
            helperText="Por favor, indique el motivo de la cancelación"
          />
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setCancelDialogOpen(false)}>Cancelar</Button>
          <Button
            variant="contained"
            color="warning"
            startIcon={<CancelIcon />}
            onClick={handleConfirmCancel}
            disabled={!cancelMotivo.trim()}
          >
            Confirmar Cancelación
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar */}
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

      {/* Diálogo de confirmación para eliminar */}
      <ConfirmationDialog
        open={confirmDialogOpen}
        onClose={() => setConfirmDialogOpen(false)}
        onConfirm={handleConfirmDelete}
        title="Eliminar Clase"
        content={
          claseToDelete
            ? `¿Está seguro de eliminar la clase de ${claseToDelete.especialidad} programada para ${claseToDelete.dia} de ${claseToDelete.hora}?`
            : ""
        }
        confirmButtonColor="#f44336"
        confirmButtonText="Eliminar"
      />

      {/* Modal del programador de clases */}
      <ClassSchedulerModal
        isOpen={schedulerOpen}
        onClose={() => setSchedulerOpen(false)}
        onSubmit={handleSchedulerSubmit}
      />
    </Box>
  )
}

export default ProgramacionClases
