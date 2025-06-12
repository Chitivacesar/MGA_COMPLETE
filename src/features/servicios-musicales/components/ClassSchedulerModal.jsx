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
  Tooltip,
  useMediaQuery,
  useTheme,
  TextField,
  FormHelperText,
} from "@mui/material"
import { Close as CloseIcon, Info as InfoIcon } from "@mui/icons-material"

// Assuming diasSemana and horasClase are consistent
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

// Helper to get class color (assuming it's defined elsewhere or passed as prop)
const getClassColor = (className) => {
  // Basic placeholder color logic
  const colors = ["#4f46e5", "#0891b2", "#7c3aed", "#16a34a", "#ea580c", "#db2777"]
  let hash = 0
  if (!className) return "#cccccc"
  for (let i = 0; i < className.length; i++) {
    hash = className.charCodeAt(i) + ((hash << 5) - hash)
  }
  const index = Math.abs(hash) % colors.length
  return colors[index]
}

// Estilos personalizados para el scroll
const scrollbarStyles = {
  "&::-webkit-scrollbar": {
    width: "8px",
    height: "8px",
  },
  "&::-webkit-scrollbar-track": {
    background: "#f1f1f1",
    borderRadius: "10px",
  },
  "&::-webkit-scrollbar-thumb": {
    background: "#c1c1c1",
    borderRadius: "10px",
    transition: "background 0.2s ease",
  },
  "&::-webkit-scrollbar-thumb:hover": {
    background: "#0455a2",
  },
  scrollbarWidth: "thin",
  scrollbarColor: "#c1c1c1 #f1f1f1",
}

export const ClassSchedulerModal = ({
  isOpen,
  onClose,
  onSubmit,
  profesores = [], // List of all available professors { id, nombre, apellidos, color? }
  aulas = [], // List of all available classrooms { id, nombre }
  programacion = [], // Existing schedule data [{ id, hora, lunes, ..., profesor, aula }]
  clasesDisponibles = [], // List of possible class subjects ["Guitarra Básica", ...]
  // Nuevos props para controlar la capacidad y estudiantes
  capacidadClases = {}, // { "Guitarra Básica": 6, "Piano Intermedio": 4, ... }
  estudiantesPorClase = {}, // { "Lunes-8:00 - 9:00-Guitarra Básica": ["Estudiante1", "Estudiante2"], ... }
}) => {
  const [selectedSlots, setSelectedSlots] = useState([]) // [{ dia, hora }]
  const [selectedClass, setSelectedClass] = useState("")
  const [selectedProfesor, setSelectedProfesor] = useState("")
  const [selectedAula, setSelectedAula] = useState("")
  const [nombreEstudiante, setNombreEstudiante] = useState("")
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down("md"))
  const [hoveredSlot, setHoveredSlot] = useState(null) // Para mostrar info adicional en hover

  useEffect(() => {
    // Reset state when modal opens
    if (isOpen) {
      setSelectedSlots([])
      setSelectedClass("")
      setSelectedProfesor("")
      setSelectedAula("")
      setNombreEstudiante("")
    }
  }, [isOpen])

  // Memoize availability check for performance
  const availability = useMemo(() => {
    const grid = {}

    // Crear una estructura para rastrear qué aulas están ocupadas en cada horario
    const aulasOcupadas = {}

    // Primero, inicializar la estructura
    horasClase.forEach((hora) => {
      grid[hora] = {}
      aulasOcupadas[hora] = {}

      diasSemana.forEach((dia) => {
        aulasOcupadas[hora][dia] = [] // Usar array en lugar de Set
      })
    })

    // Ahora, llenar la información de ocupación basada en la programación
    programacion.forEach((item) => {
      const hora = item.hora

      diasSemana.forEach((dia) => {
        const diaKey = dia.toLowerCase().replace("é", "e").replace("á", "a")

        if (item[diaKey] && item[diaKey].trim() !== "") {
          // Marcar el aula como ocupada para este día y hora
          if (item.aula && !aulasOcupadas[hora][dia].includes(item.aula)) {
            aulasOcupadas[hora][dia].push(item.aula)
          }

          // Generar la clave para buscar en estudiantesPorClase
          const claseKey = `${dia}-${hora}-${item[diaKey]}`
          const estudiantesEnClase = estudiantesPorClase[claseKey] || []
          const capacidadTotal = capacidadClases[item[diaKey]] || 8 // Default de 8 si no está especificado

          grid[hora][dia] = {
            isOccupied: true,
            profesor: item.profesor,
            aula: item.aula,
            clase: item[diaKey],
            estudiantes: estudiantesEnClase,
            capacidad: capacidadTotal,
            disponible: estudiantesEnClase.length < capacidadTotal,
          }
        } else {
          grid[hora][dia] = {
            isOccupied: false,
            profesor: null,
            aula: null,
            clase: null,
            estudiantes: [],
            capacidad: 0,
            disponible: true,
          }
        }
      })
    })

    // Agregar información sobre qué aulas están ocupadas
    Object.keys(grid).forEach((hora) => {
      Object.keys(grid[hora]).forEach((dia) => {
        grid[hora][dia].aulasOcupadas = aulasOcupadas[hora][dia]
      })
    })

    return { grid, aulasOcupadas }
  }, [programacion, estudiantesPorClase, capacidadClases]) // Recalculate when these dependencies change

  const handleSlotClick = (dia, hora) => {
    // Verificar que availability.grid y el slot existan
    if (!availability.grid || !availability.grid[hora] || !availability.grid[hora][dia]) {
      console.error("Datos de disponibilidad no encontrados para:", dia, hora)
      return
    }

    const slotData = availability.grid[hora][dia]

    // Nueva lógica: permitir hacer clic en slot ocupado si tiene disponibilidad
    if (slotData?.isOccupied && !slotData.disponible) {
      // Si está ocupado y no tiene disponibilidad, no hacer nada
      return
    }

    // Seleccionar el slot
    setSelectedSlots([{ dia, hora }])

    // Si el slot ya tiene una clase asignada y está disponible, pre-seleccionar esos valores
    if (slotData?.isOccupied && slotData.disponible) {
      setSelectedClass(slotData.clase)
      setSelectedProfesor(slotData.profesor)
      setSelectedAula(slotData.aula)
    } else {
      // Si es un slot vacío, resetear las selecciones
      setSelectedClass("")
      setSelectedProfesor("")
      setSelectedAula("")
    }

    setNombreEstudiante("")
  }

  const isSlotSelected = (dia, hora) => {
    return selectedSlots.some((slot) => slot.dia === dia && slot.hora === hora)
  }

  // Verificar si un aula está disponible para el slot seleccionado
  const isAulaAvailable = (aula) => {
    if (selectedSlots.length === 0) return true

    const { dia, hora } = selectedSlots[0]

    // Verificar que availability.aulasOcupadas y el slot existan
    if (!availability.aulasOcupadas || !availability.aulasOcupadas[hora] || !availability.aulasOcupadas[hora][dia]) {
      return true // Si no hay datos, asumimos que está disponible
    }

    const ocupadas = availability.aulasOcupadas[hora][dia]

    // Si estamos editando una clase existente y es la misma aula, está disponible
    if (availability.grid && availability.grid[hora] && availability.grid[hora][dia]) {
      const slotData = availability.grid[hora][dia]
      if (slotData?.isOccupied && slotData.aula === aula) {
        return true
      }
    }

    // Verificar si el aula está en la lista de ocupadas
    return !ocupadas.includes(aula)
  }

  const getAvailableAulas = () => {
    // Si no hay aulas definidas, devolver un array vacío
    if (!aulas || !Array.isArray(aulas)) {
      console.error("La lista de aulas no está definida o no es un array")
      return []
    }

    return aulas.filter((a) => isAulaAvailable(a.nombre))
  }

  const canSubmit =
    selectedSlots.length > 0 && selectedClass && selectedProfesor && selectedAula && nombreEstudiante.trim() !== ""

  const handleSubmit = () => {
    if (!canSubmit) return

    const submissionData = selectedSlots.map((slot) => ({
      ...slot, // dia, hora
      clase: selectedClass,
      profesor: selectedProfesor,
      aula: selectedAula,
      estudiante: nombreEstudiante.trim(),
    }))
    onSubmit(submissionData) // Pass the array of new schedule entries
    onClose()
  }

  // Calcular el número de días a mostrar basado en el tamaño de la pantalla
  const visibleDays = isMobile ? 3 : diasSemana.length

  return (
    <Dialog
      open={isOpen}
      onClose={onClose}
      fullWidth
      maxWidth="lg"
      PaperProps={{
        sx: {
          maxHeight: "90vh",
          display: "flex",
          flexDirection: "column",
          borderRadius: "12px",
          overflow: "hidden", // Evita el scroll en el Dialog principal
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
          flexShrink: 0, // Evita que el título se encoja
        }}
      >
        Programar Nueva Clase
        <IconButton onClick={onClose} sx={{ color: "white" }}>
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      <DialogContent
        sx={{
          p: 3,
          flexGrow: 1,
          overflow: "hidden", // Evitamos el scroll en el DialogContent
          display: "flex",
          flexDirection: "column",
          ...scrollbarStyles, // Aplicamos los estilos de scroll personalizados
        }}
      >
        <Grid container spacing={3} sx={{ flexGrow: 1, height: "100%" }}>
          {/* Calendar Grid */}
          <Grid item xs={12} md={8} sx={{ height: isMobile ? "auto" : "100%" }}>
            <Typography variant="h6" gutterBottom>
              Seleccionar Horario Disponible
            </Typography>
            <Paper
              elevation={1}
              sx={{
                height: isMobile ? "auto" : "calc(100% - 40px)",
                display: "flex",
                flexDirection: "column",
                border: "1px solid #e0e0e0",
                borderRadius: "8px",
                overflow: "hidden", // Oculta el desbordamiento
              }}
            >
              <Box
                sx={{
                  overflow: "auto",
                  flexGrow: 1,
                  ...scrollbarStyles, // Aplicamos los estilos de scroll personalizados
                  // Usamos position: relative para que los elementos fixed funcionen correctamente
                  position: "relative",
                }}
              >
                <Box
                  sx={{
                    display: "grid",
                    gridTemplateColumns: `100px repeat(${visibleDays}, 1fr)`,
                    minWidth: isMobile ? "600px" : "auto", // Asegura un ancho mínimo en móviles
                  }}
                >
                  {/* Header Row */}
                  <Box
                    sx={{
                      p: 1,
                      borderRight: "1px solid #e0e0e0",
                      borderBottom: "1px solid #e0e0e0",
                      fontWeight: "bold",
                      textAlign: "center",
                      bgcolor: "#f5f5f5",
                      position: "sticky",
                      top: 0,
                      left: 0, // Esto es lo que hace que se quede fijo en la esquina
                      zIndex: 3, // Nivel más alto para estar por encima de todo
                    }}
                  >
                    Hora
                  </Box>
                  {diasSemana.slice(0, visibleDays).map((dia) => (
                    <Box
                      key={dia}
                      sx={{
                        p: 1,
                        borderRight: "1px solid #e0e0e0",
                        borderBottom: "1px solid #e0e0e0",
                        fontWeight: "bold",
                        textAlign: "center",
                        bgcolor: "#f5f5f5",
                        position: "sticky",
                        top: 0,
                        zIndex: 2, // Por encima de las celdas pero por debajo de la esquina
                      }}
                    >
                      {dia}
                    </Box>
                  ))}

                  {/* Data Rows */}
                  {horasClase.map((hora) => (
                    <React.Fragment key={hora}>
                      <Box
                        sx={{
                          p: 1,
                          borderRight: "1px solid #e0e0e0",
                          borderBottom: "1px solid #e0e0e0",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          bgcolor: "#f9f9f9",
                          position: "sticky",
                          left: 0, // Esto es lo que hace que se quede fijo en el lado izquierdo
                          zIndex: 1, // Por encima del contenido normal
                        }}
                      >
                        <Typography variant="body2">{hora}</Typography>
                      </Box>
                      {diasSemana.slice(0, visibleDays).map((dia) => {
                        const slotData = availability.grid[hora]?.[dia]
                        const occupied = slotData?.isOccupied
                        const selected = isSlotSelected(dia, hora)
                        const color = occupied ? getClassColor(slotData.clase) : "#ffffff"
                        const disponible = !occupied || slotData.disponible

                        // Info para mostrar en el tooltip
                        const tooltipContent = disponible
                          ? occupied
                            ? `${slotData.clase} (${slotData.estudiantes.length}/${slotData.capacidad} estudiantes)`
                            : "Disponible"
                          : `${slotData.clase} (Capacidad máxima: ${slotData.capacidad} estudiantes)`

                        return (
                          <Tooltip key={`${hora}-${dia}`} title={tooltipContent} placement="top" arrow>
                            <Box
                              onClick={() => disponible && handleSlotClick(dia, hora)}
                              onMouseEnter={() => setHoveredSlot({ dia, hora })}
                              onMouseLeave={() => setHoveredSlot(null)}
                              sx={{
                                p: 1,
                                minHeight: 50, // Reducimos un poco la altura para que quepa mejor
                                borderRight: "1px solid #e0e0e0",
                                borderBottom: "1px solid #e0e0e0",
                                cursor: disponible ? "pointer" : "not-allowed",
                                bgcolor: selected
                                  ? alpha("#1976d2", 0.3)
                                  : occupied && !disponible
                                    ? alpha(color, 0.1)
                                    : occupied && disponible
                                      ? alpha(color, 0.15)
                                      : "#ffffff",
                                "&:hover": {
                                  bgcolor: disponible
                                    ? occupied
                                      ? alpha(color, 0.25)
                                      : alpha("#1976d2", 0.1)
                                    : alpha(color, 0.1),
                                },
                                position: "relative",
                                display: "flex",
                                flexDirection: "column",
                                justifyContent: "center",
                                alignItems: "center",
                                textAlign: "center",
                                transition: "background-color 0.2s ease",
                                opacity: disponible ? 1 : 0.7, // Reducir la opacidad para slots no disponibles
                              }}
                            >
                              {occupied && (
                                <Chip
                                  label={slotData.clase}
                                  size="small"
                                  sx={{
                                    bgcolor: alpha(color, disponible ? 0.7 : 0.4),
                                    color: "#fff",
                                    fontSize: "0.7rem",
                                    mb: 0.5,
                                    textDecoration: disponible ? "none" : "line-through",
                                  }}
                                />
                              )}
                              {occupied && (
                                <Typography
                                  variant="caption"
                                  display="block"
                                  sx={{ fontSize: "0.65rem", color: "text.secondary" }}
                                >
                                  {slotData.estudiantes.length}/{slotData.capacidad} estudiantes
                                </Typography>
                              )}
                              {!occupied && selected && (
                                <Typography variant="caption" sx={{ color: "#1976d2", fontWeight: "bold" }}>
                                  Seleccionado
                                </Typography>
                              )}
                              {!occupied && !selected && (
                                <Typography variant="caption" sx={{ color: "text.secondary" }}>
                                  Disponible
                                </Typography>
                              )}

                              {/* Indicador de si está lleno o disponible */}
                              {occupied && (
                                <Box
                                  sx={{
                                    position: "absolute",
                                    top: 2,
                                    right: 2,
                                    width: 8,
                                    height: 8,
                                    borderRadius: "50%",
                                    bgcolor: disponible ? "#4caf50" : "#f44336",
                                  }}
                                />
                              )}
                            </Box>
                          </Tooltip>
                        )
                      })}
                    </React.Fragment>
                  ))}
                </Box>
              </Box>

              {/* Leyenda explicativa */}
              <Box
                sx={{
                  p: 1,
                  borderTop: "1px solid #e0e0e0",
                  display: "flex",
                  flexWrap: "wrap",
                  gap: 2,
                  justifyContent: "center",
                }}
              >
                <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                  <Box sx={{ width: 8, height: 8, borderRadius: "50%", bgcolor: "#4caf50" }} />
                  <Typography variant="caption">Con disponibilidad</Typography>
                </Box>
                <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                  <Box sx={{ width: 8, height: 8, borderRadius: "50%", bgcolor: "#f44336" }} />
                  <Typography variant="caption">Sin disponibilidad</Typography>
                </Box>
              </Box>
            </Paper>
          </Grid>

          {/* Selection Details */}
          <Grid item xs={12} md={4} sx={{ height: isMobile ? "auto" : "100%" }}>
            <Typography variant="h6" gutterBottom>
              Detalles de la Clase
            </Typography>
            {selectedSlots.length > 0 ? (
              <Paper
                elevation={1}
                sx={{
                  p: 2,
                  border: "1px solid #e0e0e0",
                  borderRadius: "8px",
                  height: isMobile ? "auto" : "calc(100% - 40px)",
                  display: "flex",
                  flexDirection: "column",
                  overflow: "auto",
                  ...scrollbarStyles, // Aplicamos los estilos de scroll personalizados
                }}
              >
                <Typography variant="subtitle1" gutterBottom>
                  Horario Seleccionado: {selectedSlots[0].dia} {selectedSlots[0].hora}
                </Typography>

                <FormControl fullWidth margin="normal" required>
                  <InputLabel id="clase-label">Clase</InputLabel>
                  <Select
                    labelId="clase-label"
                    value={selectedClass}
                    label="Clase"
                    onChange={(e) => setSelectedClass(e.target.value)}
                    MenuProps={{
                      PaperProps: {
                        sx: scrollbarStyles, // Aplicamos los estilos de scroll al menú
                      },
                    }}
                  >
                    {clasesDisponibles.map((clase) => (
                      <MenuItem key={clase} value={clase}>
                        {clase}
                        {capacidadClases[clase] ? ` (max. ${capacidadClases[clase]} estudiantes)` : ""}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>

                <FormControl fullWidth margin="normal" required>
                  <InputLabel id="profesor-label">Profesor</InputLabel>
                  <Select
                    labelId="profesor-label"
                    value={selectedProfesor}
                    label="Profesor"
                    onChange={(e) => setSelectedProfesor(e.target.value)}
                    MenuProps={{
                      PaperProps: {
                        sx: scrollbarStyles, // Aplicamos los estilos de scroll al menú
                      },
                    }}
                  >
                    {/* Filter available professors later if needed */}
                    {profesores.map((p) => (
                      <MenuItem key={p.id || p.nombre} value={p.nombre + " " + p.apellidos}>
                        {p.nombre} {p.apellidos}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>

                <FormControl fullWidth margin="normal" required>
                  <InputLabel id="aula-label">Aula</InputLabel>
                  <Select
                    labelId="aula-label"
                    value={selectedAula}
                    label="Aula"
                    onChange={(e) => setSelectedAula(e.target.value)}
                    MenuProps={{
                      PaperProps: {
                        sx: scrollbarStyles, // Aplicamos los estilos de scroll al menú
                      },
                    }}
                  >
                    {/* Solo mostrar aulas disponibles */}
                    {getAvailableAulas().map((a) => (
                      <MenuItem key={a.id || a.nombre} value={a.nombre}>
                        {a.nombre}
                      </MenuItem>
                    ))}
                  </Select>
                  {getAvailableAulas().length < aulas.length && (
                    <FormHelperText>Algunas aulas no están disponibles en este horario</FormHelperText>
                  )}
                </FormControl>

                <FormControl fullWidth margin="normal" required>
                  <InputLabel id="estudiante-label">Estudiante</InputLabel>
                  <Select
                    labelId="estudiante-label"
                    value={nombreEstudiante}
                    label="Estudiante"
                    onChange={(e) => setNombreEstudiante(e.target.value)}
                    MenuProps={{
                      PaperProps: {
                        sx: scrollbarStyles, // Aplicamos los estilos de scroll personalizados
                      },
                    }}
                  >
                    {Object.values(estudiantesPorClase).flat().map((estudiante, index) => (
                      <MenuItem key={index} value={estudiante}>
                        {estudiante}
                      </MenuItem>
                    ))}
                  </Select>
                  <FormHelperText>Seleccione el estudiante</FormHelperText>
                </FormControl>

                {/* Mostrar información de capacidad si se ha seleccionado una clase */}
                {selectedClass && (
                  <Box sx={{ mt: 2, display: "flex", alignItems: "center", gap: 1 }}>
                    <InfoIcon fontSize="small" color="info" />
                    <Typography variant="caption">
                      Capacidad: {capacidadClases[selectedClass] || 8} estudiantes
                    </Typography>
                  </Box>
                )}

                {/* Mostrar estudiantes actuales si estamos añadiendo a una clase existente */}
                {selectedSlots.length > 0 &&
                  selectedClass &&
                  (() => {
                    const { dia, hora } = selectedSlots[0]
                    const slotData = availability.grid[hora]?.[dia]
                    if (slotData?.isOccupied && slotData.clase === selectedClass && slotData.estudiantes.length > 0) {
                      return (
                        <Box sx={{ mt: 2 }}>
                          <Typography variant="caption" sx={{ fontWeight: "bold" }}>
                            Estudiantes actuales:
                          </Typography>
                          <Box component="ul" sx={{ mt: 0.5, pl: 2, fontSize: "0.75rem" }}>
                            {slotData.estudiantes.map((est, idx) => (
                              <Box component="li" key={idx}>
                                {est}
                              </Box>
                            ))}
                          </Box>
                        </Box>
                      )
                    }
                    return null
                  })()}
              </Paper>
            ) : (
              <Typography sx={{ color: "text.secondary", mt: 2 }}>
                Seleccione un horario disponible en la cuadrícula.
              </Typography>
            )}
          </Grid>
        </Grid>
      </DialogContent>
      <DialogActions
        sx={{
          p: 2,
          borderTop: "1px solid #e0e0e0",
          flexShrink: 0, // Evita que las acciones se encojan
        }}
      >
        <Button onClick={onClose} color="secondary">
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
          }}
        >
          Guardar Programación
        </Button>
      </DialogActions>
    </Dialog>
  )
}
