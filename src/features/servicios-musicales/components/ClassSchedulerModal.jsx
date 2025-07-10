"use client"

import React from "react"
import { useState, useEffect, useMemo } from "react"
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  IconButton,
  Box,
  Typography,
  Grid,
  Paper,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Chip,
  alpha,
  useMediaQuery,
  useTheme,
  TextField,
  Autocomplete,
  Card,
  CardContent,
  Divider,
  CircularProgress,
  Skeleton,
} from "@mui/material"
import {
  Close as CloseIcon,
  Info as InfoIcon,
  Person as PersonIcon,
  Schedule as ScheduleIcon,
  Group as GroupIcon,
  Remove as RemoveIcon,
} from "@mui/icons-material"
import axios from "axios"

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

// Horarios expandidos (6 AM a 11 PM)
const defaultTimeSlots = [
  "06:00-07:00",
  "07:00-08:00",
  "08:00-09:00",
  "09:00-10:00",
  "10:00-11:00",
  "11:00-12:00",
  "12:00-13:00",
  "13:00-14:00",
  "14:00-15:00",
  "15:00-16:00",
  "16:00-17:00",
  "17:00-18:00",
  "18:00-19:00",
  "19:00-20:00",
  "20:00-21:00",
  "21:00-22:00",
  "22:00-23:00",
]

// Estilos mejorados para scroll
const scrollbarStyles = {
  "&::-webkit-scrollbar": {
    width: "8px",
    height: "8px",
  },
  "&::-webkit-scrollbar-track": {
    background: "#f1f3f4",
    borderRadius: "4px",
  },
  "&::-webkit-scrollbar-thumb": {
    background: "#0455a2",
    borderRadius: "4px",
    "&:hover": {
      background: "#034589",
    },
  },
  scrollbarWidth: "thin",
  scrollbarColor: "#0455a2 #f1f3f4",
}

export const ClassSchedulerModal = ({ isOpen, onClose, onSubmit }) => {
  const [profesores, setProfesores] = useState([])
  const [profesorSeleccionado, setProfesorSeleccionado] = useState("")
  const [programacionProfesor, setProgramacionProfesor] = useState(null)
  const [horariosDisponibles, setHorariosDisponibles] = useState([])
  const [selectedSlot, setSelectedSlot] = useState(null)
  const [beneficiarios, setBeneficiarios] = useState([])
  const [beneficiarioPrincipal, setBeneficiarioPrincipal] = useState(null)
  const [beneficiariosAdicionales, setBeneficiariosAdicionales] = useState([])
  const [especialidadSeleccionada, setEspecialidadSeleccionada] = useState("")
  const [observaciones, setObservaciones] = useState("")
  const [loadingHorarios, setLoadingHorarios] = useState(false)
  const [clasesExistentes, setClasesExistentes] = useState([])

  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down("md"))

  // Cargar profesores con programación activa
  useEffect(() => {
    const fetchProfesores = async () => {
      try {
        const response = await axios.get("http://localhost:3000/api/programacion_de_profesores")
        const profesoresActivos = response.data
          .filter((prog) => prog.estado === "activo")
          .map((prog) => ({
            id: prog.profesor._id || prog.profesor,
            nombre: prog.profesor.nombres ? `${prog.profesor.nombres} ${prog.profesor.apellidos}` : prog.profesor,
            especialidades: prog.profesor.especialidades || [],
            color: prog.profesor.color || "#0455a2",
            programacionId: prog._id,
            diasSeleccionados: prog.diasSeleccionados || [],
            horaInicio: prog.horaInicio,
            horaFin: prog.horaFin,
          }))

        console.log("Profesores cargados:", profesoresActivos)
        setProfesores(profesoresActivos)
      } catch (error) {
        console.error("Error al cargar profesores:", error)
      }
    }

    if (isOpen) {
      fetchProfesores()
    }
  }, [isOpen])

  // Cargar beneficiarios SOLO de ventas tipo "curso"
  useEffect(() => {
    const fetchBeneficiarios = async () => {
      try {
        const response = await axios.get("http://localhost:3000/api/ventas")
        const beneficiariosActivos = response.data
          .filter(
            (venta) =>
              venta.estado === "vigente" &&
              venta.tipo === "curso" && // SOLO ventas tipo curso
              venta.beneficiarioId,
          )
          .map((venta) => ({
            id: venta._id,
            nombre: `${venta.beneficiarioId.nombre} ${venta.beneficiarioId.apellido}`,
            especialidad: venta.cursoId?.nombre || "General",
            codigoVenta: venta.codigoVenta,
            tipo: venta.tipo,
            numeroClases: venta.numero_de_clases,
            ciclo: venta.ciclo,
          }))

        console.log("Beneficiarios de cursos cargados:", beneficiariosActivos)
        setBeneficiarios(beneficiariosActivos)
      } catch (error) {
        console.error("Error al cargar beneficiarios:", error)
      }
    }

    if (isOpen) {
      fetchBeneficiarios()
    }
  }, [isOpen])

  // Cargar todas las clases existentes una sola vez
  useEffect(() => {
    const fetchClasesExistentes = async () => {
      if (!isOpen) return

      try {
        console.log("📚 Cargando clases existentes...")
        const response = await axios.get("http://localhost:3000/api/programacion_de_clases")
        console.log("✅ Clases existentes cargadas:", response.data.length)
        setClasesExistentes(response.data)
      } catch (error) {
        console.error("❌ Error al cargar clases existentes:", error)
        setClasesExistentes([])
      }
    }

    fetchClasesExistentes()
  }, [isOpen])

  // Cargar horarios disponibles del profesor seleccionado
  useEffect(() => {
    const fetchHorariosDisponibles = async () => {
      if (!profesorSeleccionado) {
        setHorariosDisponibles([])
        setProgramacionProfesor(null)
        return
      }

      setLoadingHorarios(true)

      try {
        console.log("🔍 Generando horarios para profesor:", profesorSeleccionado)

        // Buscar el profesor seleccionado
        const profesorData = profesores.find((p) => p.id === profesorSeleccionado)
        if (!profesorData) {
          console.warn("⚠️ No se encontró data del profesor")
          setLoadingHorarios(false)
          return
        }

        console.log("👨‍🏫 Datos del profesor encontrado:", profesorData)

        // Crear objeto de programación del profesor
        const programacionProfesorData = {
          _id: profesorData.programacionId,
          profesor: {
            _id: profesorData.id,
            nombres: profesorData.nombre.split(" ")[0],
            apellidos: profesorData.nombre.split(" ").slice(1).join(" "),
            especialidades: profesorData.especialidades,
            color: profesorData.color,
          },
          horaInicio: profesorData.horaInicio || "08:00",
          horaFin: profesorData.horaFin || "18:00",
          diasSeleccionados: profesorData.diasSeleccionados || ["L", "M", "X", "J", "V", "S", "D"],
        }

        console.log("📋 Programación del profesor:", programacionProfesorData)

        // Generar horarios disponibles usando la función mejorada
        const horarios = generarHorariosDisponibles(
          programacionProfesorData.horaInicio,
          programacionProfesorData.horaFin,
          programacionProfesorData.diasSeleccionados,
          profesorSeleccionado,
        )

        setProgramacionProfesor(programacionProfesorData)
        setHorariosDisponibles(horarios)

        console.log("✅ Horarios generados exitosamente:", horarios.length)
      } catch (error) {
        console.error("❌ Error al procesar horarios:", error)
        setProgramacionProfesor(null)
        setHorariosDisponibles([])
      } finally {
        setLoadingHorarios(false)
      }
    }

    fetchHorariosDisponibles()
  }, [profesorSeleccionado, profesores, clasesExistentes])

  // Función mejorada para generar horarios disponibles
  const generarHorariosDisponibles = (horaInicio, horaFin, dias, profesorId) => {
    console.log("🔧 === INICIO generarHorariosDisponibles ===")
    console.log("📊 Parámetros:", { horaInicio, horaFin, dias, profesorId })
    console.log("📚 Total clases existentes:", clasesExistentes.length)

    const horarios = []

    const convertirAMinutos = (hora) => {
      const [h, m] = hora.split(":").map(Number)
      return h * 60 + m
    }

    const convertirAHora = (minutos) => {
      const h = Math.floor(minutos / 60)
      const m = minutos % 60
      return `${h.toString().padStart(2, "0")}:${m.toString().padStart(2, "0")}`
    }

    const inicioMinutos = convertirAMinutos(horaInicio)
    const finMinutos = convertirAMinutos(horaFin)

    const diasMap = {
      L: "Lunes",
      M: "Martes",
      X: "Miércoles",
      J: "Jueves",
      V: "Viernes",
      S: "Sábado",
      D: "Domingo",
    }

    // Filtrar clases del profesor actual que no estén canceladas
    const clasesDelProfesor = clasesExistentes.filter((clase) => {
      // Verificar múltiples formas de identificar al profesor
      const profesorClase = clase.programacionProfesor?.profesor
      let esDelProfesor = false

      if (profesorClase) {
        // Si profesor es un objeto con _id
        if (typeof profesorClase === "object" && profesorClase._id) {
          esDelProfesor = String(profesorClase._id) === String(profesorId)
        }
        // Si profesor es directamente un string/ObjectId
        else if (typeof profesorClase === "string") {
          esDelProfesor = String(profesorClase) === String(profesorId)
        }
      }

      // También verificar por programacionProfesor._id
      if (!esDelProfesor && clase.programacionProfesor?._id) {
        // Buscar en profesores si la programación corresponde al profesor seleccionado
        const profesorEncontrado = profesores.find((p) => p.programacionId === String(clase.programacionProfesor._id))
        esDelProfesor = profesorEncontrado?.id === String(profesorId)
      }

      const noEsCancelada = clase.estado !== "cancelada"

      return esDelProfesor && noEsCancelada
    })

    console.log("🎯 Clases del profesor filtradas:", clasesDelProfesor.length)

    // Generar slots de 1 hora para cada día
    dias.forEach((diaCode) => {
      const diaNombre = diasMap[diaCode]
      console.log(`📅 Procesando día: ${diaCode} (${diaNombre})`)

      for (let minutos = inicioMinutos; minutos < finMinutos; minutos += 60) {
        const horaInicioSlot = convertirAHora(minutos)
        const horaFinSlot = convertirAHora(minutos + 60)

        if (minutos + 60 <= finMinutos) {
          // ⚠️ VERIFICAR CON NOMBRES CORRECTOS DE CAMPOS
          const claseExistente = clasesDelProfesor.find((clase) => {
            const mismoHorario =
              clase.dia === diaCode &&
              (clase.horaInicio === horaInicioSlot || clase.hora_inicio === horaInicioSlot) && // ✅ Verificar ambos formatos
              (clase.horaFin === horaFinSlot || clase.hora_fin === horaFinSlot) // ✅ Verificar ambos formatos
            return mismoHorario
          })

          const estaOcupado = !!claseExistente

          horarios.push({
            dia: diaCode,
            diaNombre: diaNombre,
            horaInicio: horaInicioSlot,
            horaFin: horaFinSlot,
            disponible: !estaOcupado,
            ocupadoPor: estaOcupado ? `Clase: ${claseExistente.especialidad || "Sin especialidad"}` : null,
            claseId: claseExistente?._id || null,
          })
        }
      }
    })

    console.log("🎯 === RESUMEN FINAL ===")
    console.log(`📈 Total horarios generados: ${horarios.length}`)
    console.log(`✅ Horarios disponibles: ${horarios.filter((h) => h.disponible).length}`)
    console.log(`❌ Horarios ocupados: ${horarios.filter((h) => !h.disponible).length}`)

    return horarios
  }

  // Reset form when modal opens
  useEffect(() => {
    if (isOpen) {
      setProfesorSeleccionado("")
      setProgramacionProfesor(null)
      setHorariosDisponibles([])
      setSelectedSlot(null)
      setBeneficiarioPrincipal(null)
      setBeneficiariosAdicionales([])
      setEspecialidadSeleccionada("")
      setObservaciones("")
    }
  }, [isOpen])

  // Organizar horarios en una grilla
  const { horariosGrid, timeSlots } = useMemo(() => {
    const grid = {}
    let slots = defaultTimeSlots

    if (horariosDisponibles.length > 0) {
      const uniqueSlots = [...new Set(horariosDisponibles.map((h) => `${h.horaInicio}-${h.horaFin}`))].sort()
      if (uniqueSlots.length > 0) {
        slots = uniqueSlots
      }
    }

    // Inicializar la grilla
    slots.forEach((slotKey) => {
      grid[slotKey] = {}
    })

    // Llenar la grilla con los horarios disponibles
    horariosDisponibles.forEach((horario) => {
      const key = `${horario.horaInicio}-${horario.horaFin}`
      if (!grid[key]) {
        grid[key] = {}
      }
      grid[key][horario.dia] = horario
    })

    return { horariosGrid: grid, timeSlots: slots }
  }, [horariosDisponibles])

  const handleSlotClick = (dia, horaInicio, horaFin, disponible) => {
    if (!disponible) return
    setSelectedSlot({ dia, horaInicio, horaFin })
  }

  const isSlotSelected = (dia, horaInicio, horaFin) => {
    return selectedSlot?.dia === dia && selectedSlot?.horaInicio === horaInicio && selectedSlot?.horaFin === horaFin
  }

  const handleRemoveBeneficiarioAdicional = (beneficiarioId) => {
    setBeneficiariosAdicionales(beneficiariosAdicionales.filter((b) => b.id !== beneficiarioId))
  }

  const canSubmit = selectedSlot && beneficiarioPrincipal && especialidadSeleccionada

  // ✅ FUNCIÓN CORREGIDA - ENVIAR CON NOMBRES CORRECTOS
  const handleSubmit = () => {
    if (!canSubmit) return

    // ✅ ESTRUCTURA CORREGIDA CON NOMBRES DE CAMPOS CORRECTOS
    const nuevaClase = {
      venta: beneficiarioPrincipal.id,
      programacionProfesor: programacionProfesor._id,
      dia: diasCodigo[selectedSlot.dia],
      horaInicio: selectedSlot.horaInicio, // ✅ camelCase para la BD
      horaFin: selectedSlot.horaFin, // ✅ camelCase para la BD
      especialidad: especialidadSeleccionada,
      beneficiariosAdicionales: beneficiariosAdicionales.map((b) => b.id),
      observaciones: observaciones || null,
      estado: "programada",
    }

    console.log("📤 Enviando nueva clase con campos corregidos:", nuevaClase)
    onSubmit(nuevaClase)
    onClose()
  }

  // Filtrar beneficiarios por especialidad seleccionada
  const beneficiariosFiltrados = useMemo(() => {
    if (!especialidadSeleccionada) return beneficiarios
    return beneficiarios.filter(
      (b) =>
        b.especialidad.toLowerCase().includes(especialidadSeleccionada.toLowerCase()) || b.especialidad === "General",
    )
  }, [beneficiarios, especialidadSeleccionada])

  return (
    <Dialog
      open={isOpen}
      onClose={onClose}
      fullWidth
      maxWidth="xl"
      PaperProps={{
        sx: {
          height: "95vh",
          display: "flex",
          flexDirection: "column",
          borderRadius: "12px",
          overflow: "hidden",
          mt: 3,
        },
      }}
    >
      <DialogTitle
        sx={{
          bgcolor: "#0455a2",
          color: "white",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          p: 2,
          flexShrink: 0,
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <ScheduleIcon />
          Programar nueva clase
        </Box>
        <IconButton onClick={onClose} sx={{ color: "white" }}>
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent
        sx={{
          p: 3,
          pt: 3,
          pb: 0,
          flex: 1,
          overflow: "hidden",
          display: "flex",
          flexDirection: "column",
          minHeight: 0,
          mt: 3,
          maxHeight: "calc(95vh - 120px)",
        }}
      >
        <Grid container spacing={3} sx={{ flex: 1, minHeight: 0 }}>
          {/* Selección de profesor y horarios */}
          <Grid item xs={12} lg={8} sx={{ flex: 1, display: "flex", flexDirection: "column", minHeight: 0 }}>
            <Box sx={{ mb: 2, display: "flex", alignItems: "center", gap: 2 }}>
              <FormControl fullWidth>
                <InputLabel>Seleccionar Profesor</InputLabel>
                <Select
                  value={profesorSeleccionado}
                  onChange={(e) => setProfesorSeleccionado(e.target.value)}
                  label="Seleccionar Profesor"
                >
                  {profesores.map((profesor) => (
                    <MenuItem key={profesor.id} value={profesor.id}>
                      <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                        <Box
                          sx={{
                            width: 12,
                            height: 12,
                            borderRadius: "50%",
                            bgcolor: profesor.color,
                          }}
                        />
                        <PersonIcon sx={{ color: profesor.color, fontSize: 18 }} />
                        <span>{profesor.nombre}</span>
                        <Chip
                          label={profesor.especialidades.join(", ")}
                          size="small"
                          sx={{ ml: 1, bgcolor: alpha(profesor.color, 0.1), color: profesor.color }}
                        />
                      </Box>
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              {programacionProfesor && (
                <Chip
                  label={`${programacionProfesor.horaInicio} - ${programacionProfesor.horaFin}`}
                  color="primary"
                  variant="outlined"
                />
              )}
            </Box>

            {/* Grilla de horarios */}
            <Paper
              elevation={1}
              sx={{
                flex: 1,
                minHeight: 0,
                display: "flex",
                flexDirection: "column",
                border: "1px solid #e0e0e0",
                borderRadius: "8px",
                overflow: "hidden",
                position: "relative",
              }}
            >
              {loadingHorarios && (
                <Box
                  sx={{
                    position: "absolute",
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    bgcolor: "rgba(255, 255, 255, 0.9)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    zIndex: 4,
                    backdropFilter: "blur(3px)",
                  }}
                >
                  <Box sx={{ textAlign: "center" }}>
                    <CircularProgress size={50} sx={{ mb: 2, color: "#0455a2" }} />
                    <Typography variant="body1" color="text.secondary" sx={{ fontWeight: 500 }}>
                      Cargando horarios disponibles...
                    </Typography>
                  </Box>
                </Box>
              )}

              <Box
                sx={{
                  flex: 1,
                  minHeight: 0,
                  overflow: "auto",
                  maxHeight: "550px",
                  ...scrollbarStyles,
                }}
              >
                <Box
                  sx={{
                    display: "grid",
                    gridTemplateColumns: `140px repeat(7, minmax(120px, 1fr))`,
                    minWidth: "1000px",
                    minHeight: `${timeSlots.length * 70 + 60}px`,
                  }}
                >
                  {/* Header Row */}
                  <Box
                    sx={{
                      p: 1.5,
                      borderRight: "2px solid #0455a2",
                      borderBottom: "3px solid #0455a2",
                      fontWeight: "bold",
                      textAlign: "center",
                      bgcolor: "#0455a2",
                      color: "white",
                      position: "sticky",
                      top: 0,
                      left: 0,
                      zIndex: 3,
                      boxShadow: "2px 2px 4px rgba(0,0,0,0.1)",
                    }}
                  >
                    <ScheduleIcon sx={{ mb: 0.5, fontSize: 20 }} />
                    <Typography variant="subtitle2" sx={{ fontWeight: 700, fontSize: "0.8rem" }}>
                      Horario
                    </Typography>
                  </Box>
                  {diasSemana.map((dia) => (
                    <Box
                      key={dia}
                      sx={{
                        p: 1.5,
                        borderRight: "1px solid #e0e0e0",
                        borderBottom: "3px solid #0455a2",
                        fontWeight: "bold",
                        textAlign: "center",
                        bgcolor: "#f8f9fa",
                        position: "sticky",
                        top: 0,
                        zIndex: 2,
                        boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
                      }}
                    >
                      <Typography
                        variant="subtitle2"
                        sx={{
                          fontWeight: 700,
                          color: "#0455a2",
                          fontSize: "0.8rem",
                        }}
                      >
                        {dia}
                      </Typography>
                    </Box>
                  ))}

                  {/* Data Rows */}
                  {timeSlots.map((horarioKey, index) => {
                    const [horaInicio, horaFin] = horarioKey.split("-")
                    const isEvenRow = index % 2 === 0
                    return (
                      <React.Fragment key={horarioKey}>
                        {/* Columna de hora */}
                        <Box
                          sx={{
                            p: 1.5,
                            borderRight: "2px solid #0455a2",
                            borderBottom: "1px solid #e0e0e0",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            bgcolor: isEvenRow ? "#f8f9fa" : "#ffffff",
                            position: "sticky",
                            left: 0,
                            zIndex: 1,
                            boxShadow: "1px 0 3px rgba(0,0,0,0.05)",
                            minHeight: 70,
                          }}
                        >
                          <Box sx={{ textAlign: "center" }}>
                            <Typography variant="body2" sx={{ fontWeight: 600, color: "#0455a2", fontSize: "0.8rem" }}>
                              {horaInicio}
                            </Typography>
                            <Typography
                              variant="caption"
                              color="text.secondary"
                              sx={{ fontWeight: 500, fontSize: "0.7rem" }}
                            >
                              {horaFin}
                            </Typography>
                          </Box>
                        </Box>

                        {/* Celdas de días */}
                        {diasSemana.map((dia) => {
                          const horario = horariosGrid[horarioKey]?.[diasCodigo[dia]]
                          const disponible = horario?.disponible || false
                          const selected = disponible && isSlotSelected(dia, horaInicio, horaFin)

                          let cellContent
                          const cellSx = {
                            p: 1,
                            minHeight: 70,
                            borderRight: "1px solid #e0e0e0",
                            borderBottom: "1px solid #e0e0e0",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            textAlign: "center",
                            transition: "all 0.2s ease",
                            position: "relative",
                            cursor: "pointer",
                          }

                          if (!profesorSeleccionado) {
                            cellContent = <Skeleton variant="rectangular" width="90%" height={40} />
                            cellSx.bgcolor = isEvenRow ? "#fafbfc" : "#ffffff"
                            cellSx.cursor = "not-allowed"
                          } else if (horario) {
                            cellContent = (
                              <Box sx={{ textAlign: "center", width: "100%" }}>
                                <Typography
                                  variant="caption"
                                  sx={{
                                    color: selected ? "#1976d2" : disponible ? "#4caf50" : "#f44336",
                                    fontWeight: "bold",
                                    display: "block",
                                    mb: 0.5,
                                    fontSize: "0.7rem",
                                  }}
                                >
                                  {selected ? "✓ Seleccionado" : disponible ? "✓ Disponible" : "✗ Ocupado"}
                                </Typography>
                                {!disponible && (
                                  <Typography variant="caption" sx={{ color: "#f44336", fontSize: "0.6rem" }}>
                                    {horario.ocupadoPor}
                                  </Typography>
                                )}
                              </Box>
                            )
                            cellSx.cursor = disponible ? "pointer" : "not-allowed"
                            cellSx.bgcolor = selected
                              ? alpha("#1976d2", 0.2)
                              : disponible
                                ? alpha("#4caf50", 0.1)
                                : alpha("#f44336", 0.1)
                            cellSx["&:hover"] = {
                              bgcolor: disponible
                                ? selected
                                  ? alpha("#1976d2", 0.3)
                                  : alpha("#4caf50", 0.2)
                                : alpha("#f44336", 0.15),
                              transform: disponible ? "scale(1.02)" : "none",
                            }
                            if (selected) {
                              cellSx.border = "2px solid #1976d2"
                            }
                          } else {
                            cellContent = (
                              <Typography variant="caption" sx={{ color: "text.disabled", fontSize: "0.7rem" }}>
                                No programado
                              </Typography>
                            )
                            cellSx.bgcolor = isEvenRow ? alpha("#bdbdbd", 0.05) : alpha("#bdbdbd", 0.02)
                            cellSx.cursor = "not-allowed"
                          }

                          return (
                            <Box
                              key={`${horarioKey}-${dia}`}
                              onClick={() =>
                                profesorSeleccionado &&
                                horario &&
                                disponible &&
                                handleSlotClick(dia, horaInicio, horaFin, disponible)
                              }
                              sx={cellSx}
                            >
                              {cellContent}
                            </Box>
                          )
                        })}
                      </React.Fragment>
                    )
                  })}
                </Box>
              </Box>
            </Paper>
          </Grid>

          {/* Panel de detalles */}
          <Grid item xs={12} lg={4} sx={{ display: "flex", flexDirection: "column", minHeight: 0 }}>
            <Typography variant="h6" gutterBottom sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <InfoIcon color="primary" />
              Detalles de la clase
            </Typography>

            {selectedSlot ? (
              <Card
                elevation={1}
                sx={{
                  flex: 1,
                  display: "flex",
                  flexDirection: "column",
                  overflow: "hidden",
                  minHeight: 0,
                  maxHeight: "calc(95vh - 200px)",
                }}
              >
                <CardContent
                  sx={{
                    flex: 1,
                    overflow: "auto",
                    ...scrollbarStyles,
                    p: 2,
                  }}
                >
                  {/* Horario seleccionado */}
                  <Box sx={{ mb: 3 }}>
                    <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 600 }}>
                      📅 Horario seleccionado
                    </Typography>
                    <Chip
                      label={`${selectedSlot.dia} ${selectedSlot.horaInicio} - ${selectedSlot.horaFin}`}
                      color="primary"
                      sx={{ fontWeight: 500 }}
                    />
                  </Box>

                  <Divider sx={{ my: 2 }} />

                  {/* Selección de especialidad */}
                  <FormControl fullWidth margin="normal" required>
                    <InputLabel>Especialidad</InputLabel>
                    <Select
                      value={especialidadSeleccionada}
                      onChange={(e) => setEspecialidadSeleccionada(e.target.value)}
                      label="Especialidad"
                    >
                      {programacionProfesor?.profesor.especialidades.map((esp) => (
                        <MenuItem key={esp} value={esp}>
                          {esp}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>

                  <Divider sx={{ my: 2 }} />

                  {/* Selección de beneficiario principal */}
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="subtitle2" gutterBottom sx={{ fontWeight: 600 }}>
                      👤 Beneficiario Principal (Solo Cursos)
                    </Typography>
                    <Autocomplete
                      options={beneficiariosFiltrados}
                      value={beneficiarioPrincipal}
                      onChange={(event, newValue) => setBeneficiarioPrincipal(newValue)}
                      getOptionLabel={(option) => `${option.nombre} (${option.codigoVenta})`}
                      renderInput={(params) => (
                        <TextField {...params} label="Buscar beneficiario" size="small" fullWidth />
                      )}
                      disabled={!especialidadSeleccionada}
                      renderOption={(props, option) => (
                        <Box component="li" {...props}>
                          <PersonIcon sx={{ mr: 1, fontSize: 18 }} />
                          <Box>
                            <Typography variant="body2">{option.nombre}</Typography>
                            <Typography variant="caption" color="text.secondary">
                              {option.codigoVenta} - {option.tipo} - {option.numeroClases} clases
                            </Typography>
                          </Box>
                        </Box>
                      )}
                    />
                  </Box>

                  {/* Beneficiarios adicionales */}
                  <Box sx={{ mb: 2 }}>
                    <Typography
                      variant="subtitle2"
                      gutterBottom
                      sx={{ fontWeight: 600, display: "flex", alignItems: "center", gap: 1 }}
                    >
                      <GroupIcon fontSize="small" />
                      Beneficiarios Adicionales (Opcional)
                    </Typography>

                    <Box sx={{ display: "flex", gap: 1, alignItems: "center", mb: 2 }}>
                      <Autocomplete
                        options={beneficiariosFiltrados.filter(
                          (ben) =>
                            ben.id !== beneficiarioPrincipal?.id &&
                            !beneficiariosAdicionales.find((b) => b.id === ben.id),
                        )}
                        value={null}
                        onChange={(event, newValue) => {
                          if (newValue) {
                            setBeneficiariosAdicionales([...beneficiariosAdicionales, newValue])
                          }
                        }}
                        getOptionLabel={(option) => option.nombre}
                        renderInput={(params) => <TextField {...params} label="Añadir beneficiario" size="small" />}
                        sx={{ flex: 1 }}
                        disabled={!especialidadSeleccionada || !beneficiarioPrincipal}
                      />
                    </Box>

                    {/* Lista de beneficiarios adicionales */}
                    {beneficiariosAdicionales.length > 0 && (
                      <Box sx={{ mt: 2 }}>
                        <Typography variant="caption" sx={{ fontWeight: "bold", mb: 1, display: "block" }}>
                          Beneficiarios adicionales añadidos:
                        </Typography>
                        <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
                          {beneficiariosAdicionales.map((beneficiario) => (
                            <Chip
                              key={beneficiario.id}
                              label={beneficiario.nombre}
                              onDelete={() => handleRemoveBeneficiarioAdicional(beneficiario.id)}
                              color="secondary"
                              sx={{ justifyContent: "space-between" }}
                              deleteIcon={<RemoveIcon />}
                            />
                          ))}
                        </Box>
                      </Box>
                    )}
                  </Box>

                  <Divider sx={{ my: 2 }} />

                  {/* Observaciones */}
                  <TextField
                    label="Observaciones (Opcional)"
                    multiline
                    rows={3}
                    fullWidth
                    value={observaciones}
                    onChange={(e) => setObservaciones(e.target.value)}
                    sx={{ mb: 2 }}
                  />

                  {/* Info del profesor */}
                  {programacionProfesor && (
                    <Box sx={{ mt: 2, p: 2, bgcolor: alpha("#0455a2", 0.05), borderRadius: 1 }}>
                      <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1 }}>
                        <InfoIcon fontSize="small" color="info" />
                        <Typography variant="caption" sx={{ fontWeight: 600 }}>
                          Información del profesor
                        </Typography>
                      </Box>
                      <Typography variant="caption" display="block">
                        👨‍🏫 {programacionProfesor.profesor.nombres} {programacionProfesor.profesor.apellidos}
                      </Typography>
                      <Typography variant="caption" display="block">
                        🎯 Especialidades: {programacionProfesor.profesor.especialidades.join(", ")}
                      </Typography>
                      <Typography variant="caption" display="block">
                        📅 Días disponibles:{" "}
                        {programacionProfesor.diasSeleccionados
                          .map((d) =>
                            d === "L"
                              ? "Lun"
                              : d === "M"
                                ? "Mar"
                                : d === "X"
                                  ? "Mié"
                                  : d === "J"
                                    ? "Jue"
                                    : d === "V"
                                      ? "Vie"
                                      : d === "S"
                                        ? "Sáb"
                                        : "Dom",
                          )
                          .join(", ")}
                      </Typography>
                    </Box>
                  )}
                </CardContent>
              </Card>
            ) : (
              <Card sx={{ mt: 2 }}>
                <CardContent sx={{ textAlign: "center", py: 4 }}>
                  <ScheduleIcon sx={{ fontSize: 48, color: "text.secondary", mb: 2 }} />
                  <Typography variant="body1" color="text.secondary" gutterBottom>
                    {profesorSeleccionado
                      ? "Seleccione un horario disponible en la cuadrícula"
                      : "Seleccione un profesor para ver los horarios disponibles"}
                  </Typography>
                  {profesorSeleccionado && (
                    <Typography variant="caption" color="text.secondary">
                      Nota: Solo se muestran beneficiarios de ventas tipo "curso"
                    </Typography>
                  )}
                </CardContent>
              </Card>
            )}
          </Grid>
        </Grid>
      </DialogContent>

      <DialogActions
        sx={{
          p: 3,
          borderTop: "1px solid #e0e0e0",
          flexShrink: 0,
          gap: 2,
        }}
      >
        <Button
          onClick={onClose}
          color="secondary"
          sx={{
            textTransform: "none",
            px: 3,
            py: 1,
          }}
        >
          Cancelar
        </Button>
        <Button
          onClick={handleSubmit}
          variant="contained"
          disabled={!canSubmit}
          sx={{
            bgcolor: "#0455a2",
            "&:hover": {
              bgcolor: "#034589",
            },
            textTransform: "none",
            px: 3,
            py: 1,
            fontWeight: 600,
          }}
        >
          Programar Clase
        </Button>
      </DialogActions>
    </Dialog>
  )
}
