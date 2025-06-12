"use client"

import { useState, useEffect } from "react"
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  TextField,
  Typography,
  IconButton,
  InputAdornment,
  Grid,
  Chip,
  FormControl,
  FormControlLabel,
  Checkbox,
  InputLabel,
  Select,
  MenuItem,
  Paper, // Import Paper
  Tooltip, // Import Tooltip
} from "@mui/material"
import {
  Close as CloseIcon,
  AccessTime as TimeIcon,
  Person as PersonIcon,
  CalendarMonth as CalendarIcon, // Import CalendarIcon
} from "@mui/icons-material"

/**
 * Modal para programar horarios de profesores
 * @param {Object} props - Propiedades del componente
 * @param {boolean} props.isOpen - Indica si el modal está abierto
 * @param {Function} props.onClose - Función para cerrar el modal
 * @param {Function} props.onSubmit - Función para manejar el envío del formulario
 * @param {Array} props.profesores - Lista de profesores disponibles
 * @param {number|null} props.defaultProfesorId - ID del profesor seleccionado por defecto
 */
export const ScheduleModal = ({ isOpen, onClose, onSubmit, profesores, defaultProfesorId }) => {
  const [days, setDays] = useState([])
  const [startTime, setStartTime] = useState("")
  const [endTime, setEndTime] = useState("")
  const [selectedOption, setSelectedOption] = useState("")
  const [profesorId, setProfesorId] = useState(defaultProfesorId || null)

  // Resetear el formulario cuando se abre el modal
  useEffect(() => {
    if (isOpen) {
      setDays([])
      setStartTime("")
      setEndTime("")
      setSelectedOption("")
      setProfesorId(defaultProfesorId || null)
    }
  }, [isOpen, defaultProfesorId])

  const handleDayChange = (day) => {
    setDays((prevDays) => (prevDays.includes(day) ? prevDays.filter((d) => d !== day) : [...prevDays, day]))
  }

  const handleOptionChange = (option) => {
    setSelectedOption(option)

    // Establecer los días según la opción seleccionada
    switch (option) {
      case "all":
        setDays(["L", "M", "X", "J", "V", "S", "D"])
        break
      case "weekend":
        setDays(["S", "D"])
        break
      case "weekdays":
        setDays(["L", "M", "X", "J", "V"])
        break
      case "mondayToSaturday":
        setDays(["L", "M", "X", "J", "V", "S"])
        break
      default:
        setDays([])
    }
  }

  const handleProfesorChange = (event) => {
    setProfesorId(event.target.value ? Number(event.target.value) : null)
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    onSubmit({ days, startTime, endTime, profesorId })
    onClose()
  }

  const isFormValid = days.length > 0 && startTime && endTime && profesorId !== null

  // Mapeo de días para mostrar nombres completos en Tooltip
  const dayNames = {
    L: "Lunes",
    M: "Martes",
    X: "Miércoles",
    J: "Jueves",
    V: "Viernes",
    S: "Sábado",
    D: "Domingo",
  }

  if (!isOpen) return null

  return (
    <Dialog
      open={isOpen}
      onClose={onClose}
      fullWidth
      maxWidth="sm"
      PaperProps={{
        sx: {
          borderRadius: "12px",
          boxShadow: "0 4px 30px rgba(0,0,0,0.2)",
          overflow: "hidden", // Prevent content overflow issues
        },
      }}
    >
      <DialogTitle
        sx={{
          bgcolor: "#0455a2",
          color: "white",
          fontWeight: 600,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          p: 2, // Consistent padding
        }}
      >
        {/* Add Icon and consistent title structure */}
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <CalendarIcon />
          Agregar Programación
        </Box>
        <IconButton onClick={onClose} sx={{ color: "white" }}>
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      {/* Adjust padding for DialogContent */}
      <DialogContent sx={{ p: 3 }}>
        <form onSubmit={handleSubmit}>
          {/* Add margin-top to the main Grid container */}
          <Grid container spacing={3} sx={{ mt: 1 }}> {/* Increase spacing for better layout */}
            {/* Profesor Select - No major changes needed here, assuming it's okay */}
            <Grid item xs={12}>
              <FormControl fullWidth> {/* Removed margin="normal" */}
                <InputLabel id="profesor-label">Profesor</InputLabel>
                <Select
                  labelId="profesor-label"
                  value={profesorId?.toString() || ""}
                  onChange={handleProfesorChange}
                  label="Profesor"
                  required
                  // Remove the unsupported startAdornment prop
                  // startAdornment={
                  //   <InputAdornment position="start">
                  //     <PersonIcon />
                  //   </InputAdornment>
                  // }
                  // Add renderValue to display icon and text
                  renderValue={(selected) => {
                    if (!selected) {
                      // Optionally return a placeholder or just the icon if nothing is selected
                      return (
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, color: 'text.secondary' }}>
                           <PersonIcon fontSize="small" />
                           {/* You could add placeholder text here if needed */}
                        </Box>
                      );
                    }
                    const selectedProfesor = profesores.find(p => p.id.toString() === selected);
                    return (
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <PersonIcon fontSize="small" />
                        {selectedProfesor ? `${selectedProfesor.nombre} ${selectedProfesor.apellidos}` : ''}
                      </Box>
                    );
                  }}
                >
                  {/* Add a placeholder MenuItem if needed, especially if required */}
                  {/* <MenuItem value="" disabled>
                    <em>Seleccionar Profesor</em>
                  </MenuItem> */}
                  {profesores.map((profesor) => (
                    <MenuItem key={profesor.id} value={profesor.id.toString()}>
                      <Box sx={{ display: "flex", alignItems: "center" }}>
                        <Box
                          sx={{
                            width: 12,
                            height: 12,
                            borderRadius: "50%",
                            bgcolor: profesor.color || "#ccc", // Use a default color
                            mr: 1,
                          }}
                        />
                        {profesor.nombre} {profesor.apellidos} {/* Show full name */}
                        {profesor.especialidad && ` - ${profesor.especialidad}`} {/* Show especialidad */}
                      </Box>
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            {/* Day Selection Chips */}
            <Grid item xs={12}>
              <Typography variant="subtitle1" fontWeight={500} gutterBottom>
                Seleccionar días
              </Typography>
              {/* Center the chips */}
              <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1, mb: 2, justifyContent: "center" }}>
                {Object.entries(dayNames).map(([key, name]) => ( // Use dayNames for tooltips
                  <Tooltip title={name} key={key}>
                    <Chip
                      label={key}
                      onClick={() => handleDayChange(key)}
                      color={days.includes(key) ? "primary" : "default"}
                      variant={days.includes(key) ? "filled" : "outlined"}
                      sx={{
                        fontWeight: 600,
                        minWidth: "40px", // Make slightly larger
                        height: "40px",
                        borderRadius: "50%", // Circular chips
                        cursor: "pointer",
                        transition: "all 0.2s ease",
                        "&:hover": {
                          transform: "scale(1.05)",
                          boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
                        },
                      }}
                    />
                  </Tooltip>
                ))}
              </Box>
            </Grid>

            {/* Quick Options - Wrap in Paper for visual grouping */}
            <Grid item xs={12}>
               <Paper elevation={0} sx={{ p: 2, border: '1px solid #e0e0e0', borderRadius: '8px', bgcolor: 'rgba(4, 85, 162, 0.02)' }}>
                <Typography variant="subtitle1" fontWeight={500} gutterBottom>
                  Opciones rápidas
                </Typography>
                <Grid container spacing={0}> {/* Reduced spacing inside paper */}
                  {/* Checkbox options */}
                  <Grid item xs={12} sm={6}>
                    <FormControlLabel
                      control={
                        <Checkbox checked={selectedOption === "all"} onChange={() => handleOptionChange("all")} color="primary"/>
                      }
                      label="Todos los días"
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <FormControlLabel
                      control={
                        <Checkbox
                          checked={selectedOption === "weekend"}
                          onChange={() => handleOptionChange("weekend")}
                          color="primary"
                        />
                      }
                      label="Sábado y domingo"
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <FormControlLabel
                      control={
                        <Checkbox
                          checked={selectedOption === "weekdays"}
                          onChange={() => handleOptionChange("weekdays")}
                          color="primary"
                        />
                      }
                      label="Lunes a viernes"
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <FormControlLabel
                      control={
                        <Checkbox
                          checked={selectedOption === "mondayToSaturday"}
                          onChange={() => handleOptionChange("mondayToSaturday")}
                          color="primary"
                        />
                      }
                      label="Lunes a sábado"
                    />
                  </Grid>
                </Grid>
               </Paper>
            </Grid>

            {/* Time Inputs */}
            <Grid item xs={12} sm={6}>
              <TextField
                label="Hora de Inicio"
                type="time"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                fullWidth
                required
                InputLabelProps={{
                  shrink: true,
                }}
                inputProps={{
                  step: 300, // 5 min
                }}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <TimeIcon />
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                label="Hora de Fin"
                type="time"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                fullWidth
                required
                InputLabelProps={{
                  shrink: true,
                }}
                inputProps={{
                  step: 300, // 5 min
                }}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <TimeIcon />
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>
          </Grid>
        </form>
      </DialogContent>

      {/* Consistent styling for DialogActions */}
      <DialogActions sx={{ p: 2, borderTop: '1px solid #e0e0e0' }}>
        <Button
          onClick={onClose}
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
          disabled={!isFormValid}
          sx={{
            borderRadius: "8px",
            textTransform: "none",
            fontWeight: 500,
            bgcolor: "#0455a2",
            "&:hover": {
              bgcolor: "#033b70",
            },
          }}
        >
          Agregar Programación
        </Button>
      </DialogActions>
    </Dialog>
  )
}
