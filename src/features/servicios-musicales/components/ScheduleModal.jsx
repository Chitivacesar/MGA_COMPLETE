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
  Paper,
} from "@mui/material"
import { Close as CloseIcon, AccessTime as TimeIcon, CalendarMonth as CalendarIcon } from "@mui/icons-material"

export const ScheduleModal = ({
  isOpen,
  onClose,
  onSubmit,
  profesores = [],
  defaultProfesorId = "",
  defaultDays = [],
  defaultStartTime = "",
  defaultEndTime = "",
  defaultEstado = "activo",
  isEditing = false,
}) => {
  const [formData, setFormData] = useState({
    profesorId: "",
    days: [],
    startTime: "",
    endTime: "",
    estado: "activo",
    motivo: "",
  })

  const [selectedOption, setSelectedOption] = useState("")

  // Reemplazar la función validateAndNormalizeDays con esta versión más simple y directa:

  const validateAndNormalizeDays = (days) => {
    console.log("=== INICIO validateAndNormalizeDays ===")
    console.log("Días recibidos:", days)
    console.log("Tipo de datos recibidos:", typeof days)
    console.log("Es array:", Array.isArray(days))
    console.log("Longitud del array:", days?.length)

    // Definir exactamente los caracteres que MongoDB acepta
    const validDaysMap = new Map([
      ["L", "L"],
      ["M", "M"],
      ["X", "X"],
      ["J", "J"],
      ["V", "V"],
      ["S", "S"],
      ["D", "D"],
    ])

    console.log("Mapa de días válidos:", Array.from(validDaysMap.keys()))

    // Procesar cada día
    const normalizedDays = days
      .map((day, index) => {
        console.log(`--- Procesando día ${index} ---`)
        console.log(`Valor original: "${day}"`)
        console.log(`Tipo: ${typeof day}`)
        console.log(`Longitud: ${day?.length}`)
        console.log(`Código de carácter: ${day?.charCodeAt ? day.charCodeAt(0) : "N/A"}`)

        // Convertir a string y limpiar
        const cleanDay = String(day).trim().toUpperCase()
        console.log(`Después de limpiar: "${cleanDay}"`)
        console.log(`Longitud después de limpiar: ${cleanDay.length}`)

        // Verificar que sea exactamente un carácter válido
        if (cleanDay.length === 1 && validDaysMap.has(cleanDay)) {
          const result = validDaysMap.get(cleanDay)
          console.log(`✅ Día válido: "${cleanDay}" -> "${result}"`)
          return result
        } else {
          console.log(`❌ Día inválido: "${cleanDay}"`)
          console.log(`  - Longitud correcta: ${cleanDay.length === 1}`)
          console.log(`  - Está en mapa: ${validDaysMap.has(cleanDay)}`)
          return null
        }
      })
      .filter((day) => {
        const isValid = day !== null
        if (!isValid) {
          console.log(`Filtrando día nulo`)
        }
        return isValid
      })

    // Remover duplicados
    const uniqueDays = [...new Set(normalizedDays)]

    console.log("=== RESULTADO validateAndNormalizeDays ===")
    console.log("Días normalizados (con duplicados):", normalizedDays)
    console.log("Días únicos finales:", uniqueDays)
    console.log("Cantidad final:", uniqueDays.length)
    console.log("Validación detallada de resultado:")
    uniqueDays.forEach((day, index) => {
      console.log(`  [${index}]: "${day}" (código: ${day.charCodeAt(0)})`)
    })

    if (uniqueDays.length < days.length) {
      console.warn("⚠️ Se perdieron días durante el procesamiento:")
      console.warn("Días originales:", days)
      console.warn("Días finales:", uniqueDays)
    }

    console.log("=== FIN validateAndNormalizeDays ===")
    return uniqueDays
  }

  // Initialize form when modal opens
  useEffect(() => {
    if (isOpen) {
      const normalizedDefaultDays = validateAndNormalizeDays(defaultDays || [])

      setFormData({
        profesorId: defaultProfesorId || "",
        days: normalizedDefaultDays,
        startTime: defaultStartTime || "",
        endTime: defaultEndTime || "",
        estado: isEditing ? defaultEstado : "activo",
        motivo: "",
      })
      setSelectedOption("")
    }
  }, [isOpen])

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }))
  }

  const handleDayChange = (day) => {
    const normalizedDay = validateAndNormalizeDays([day])[0]
    if (!normalizedDay) return

    const newDays = formData.days.includes(normalizedDay)
      ? formData.days.filter((d) => d !== normalizedDay)
      : [...formData.days, normalizedDay]

    const validatedDays = validateAndNormalizeDays(newDays)
    handleInputChange("days", validatedDays)
    setSelectedOption("") // Reset selected option when manually changing days
  }

  // También reemplazar la creación de días en handleOptionChange:

  const handleOptionChange = (option) => {
    console.log("=== INICIO handleOptionChange ===")
    console.log("Opción seleccionada:", option)

    setSelectedOption(option)
    let newDays = []

    switch (option) {
      case "all":
        newDays = ["L", "M", "X", "J", "V", "S", "D"]
        break
      case "weekend":
        newDays = ["S", "D"]
        break
      case "weekdays":
        newDays = ["L", "M", "X", "J", "V"]
        break
      case "mondayToSaturday":
        newDays = ["L", "M", "X", "J", "V", "S"]
        break
      default:
        newDays = []
    }

    console.log("Días creados inicialmente:", newDays)
    console.log("Cantidad de días creados:", newDays.length)
    console.log("Análisis de cada día creado:")
    newDays.forEach((day, index) => {
      console.log(`  [${index}]: "${day}" (código: ${day.charCodeAt(0)})`)
    })

    // Validar y normalizar los días antes de asignar
    console.log("Enviando a validateAndNormalizeDays...")
    const validatedDays = validateAndNormalizeDays(newDays)

    console.log("Días después de validación:", validatedDays)
    console.log("Cantidad después de validación:", validatedDays.length)

    if (validatedDays.length !== newDays.length) {
      console.warn("⚠️ ALERTA: Se perdieron días durante la validación!")
      console.warn("Días originales:", newDays)
      console.warn("Días validados:", validatedDays)
      console.warn(
        "Días perdidos:",
        newDays.filter((d) => !validatedDays.includes(d)),
      )
    }

    handleInputChange("days", validatedDays)
    console.log("=== FIN handleOptionChange ===")
  }

  const handleSubmit = () => {
    if (isFormValid) {
      // Validación final antes de enviar
      const finalValidatedDays = validateAndNormalizeDays(formData.days)

      console.log("=== VALIDACIÓN FINAL ===")
      console.log("Días antes de validación:", formData.days)
      console.log("Días después de validación:", finalValidatedDays)
      console.log("Cada día validado:")
      finalValidatedDays.forEach((day, index) => {
        console.log(`  ${index}: "${day}" (código: ${day.charCodeAt(0)}, longitud: ${day.length})`)
      })

      onSubmit({
        profesorId: formData.profesorId,
        days: finalValidatedDays,
        startTime: formData.startTime,
        endTime: formData.endTime,
        estado: formData.estado,
        motivo: formData.estado === "cancelado" ? formData.motivo : "",
      })
      onClose()
    }
  }

  const isFormValid = formData.days.length > 0 && formData.startTime && formData.endTime && formData.profesorId

  const dayNames = {
    L: "Lunes",
    M: "Martes",
    X: "Miércoles",
    J: "Jueves",
    V: "Viernes",
    S: "Sábado",
    D: "Domingo",
  }

  // Y cambiar validDays a un array simple:

  const validDays = ["L", "M", "X", "J", "V", "S", "D"]

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
          overflow: "hidden",
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
          p: 2,
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <CalendarIcon />
          {isEditing ? "Editar Programación" : "Agregar Programación"}
        </Box>
        <IconButton onClick={onClose} sx={{ color: "white" }}>
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent sx={{ p: 3 }}>
        <Grid container spacing={3} sx={{ mt: 1 }}>
          {/* Selector de Profesor */}
          <Grid item xs={12}>
            <FormControl fullWidth>
              <InputLabel>Profesor</InputLabel>
              <Select
                value={formData.profesorId}
                onChange={(e) => handleInputChange("profesorId", e.target.value)}
                label="Profesor"
                required
              >
                <MenuItem value="">
                  <em>Seleccionar Profesor</em>
                </MenuItem>
                {profesores.map((profesor) => (
                  <MenuItem key={profesor.id} value={profesor.id}>
                    <Box sx={{ display: "flex", alignItems: "center" }}>
                      <Box
                        sx={{
                          width: 12,
                          height: 12,
                          borderRadius: "50%",
                          bgcolor: profesor.color || "#ccc",
                          mr: 1,
                        }}
                      />
                      {profesor.nombre}
                      {profesor.especialidad && ` - ${profesor.especialidad}`}
                    </Box>
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          {/* Estado (solo en edición) */}
          {isEditing && (
            <Grid item xs={12}>
              <FormControl fullWidth>
                <InputLabel>Estado</InputLabel>
                <Select
                  value={formData.estado}
                  onChange={(e) => handleInputChange("estado", e.target.value)}
                  label="Estado"
                >
                  <MenuItem value="activo">Activo</MenuItem>
                  <MenuItem value="cancelado">Cancelado</MenuItem>
                </Select>
              </FormControl>
            </Grid>
          )}

          {/* Motivo de cancelación */}
          {isEditing && formData.estado === "cancelado" && (
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Motivo de cancelación"
                value={formData.motivo}
                onChange={(e) => handleInputChange("motivo", e.target.value)}
                multiline
                rows={2}
              />
            </Grid>
          )}

          {/* Selección de días */}
          <Grid item xs={12}>
            <Typography variant="subtitle1" sx={{ mb: 1, fontWeight: 500 }}>
              Seleccionar días
            </Typography>
            <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1, mb: 2 }}>
              {validDays.map((day) => (
                <Chip
                  key={day}
                  label={day}
                  onClick={() => handleDayChange(day)}
                  color={formData.days.includes(day) ? "primary" : "default"}
                  variant={formData.days.includes(day) ? "filled" : "outlined"}
                  sx={{
                    borderRadius: "50%",
                    width: 36,
                    height: 36,
                    fontSize: "0.875rem",
                    cursor: "pointer",
                  }}
                />
              ))}
            </Box>

            {/* Mostrar días seleccionados en español */}
            {formData.days.length > 0 && (
              <Box sx={{ mb: 2 }}>
                <Typography variant="body2" color="text.secondary">
                  Días seleccionados: {formData.days.map((d) => dayNames[d]).join(", ")}
                </Typography>
              </Box>
            )}

            {/* Opciones rápidas */}
            <Paper sx={{ p: 2, bgcolor: "#f8f9fa", mb: 2 }}>
              <Typography variant="subtitle2" sx={{ mb: 1 }}>
                Opciones rápidas
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={6}>
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={selectedOption === "all"}
                        onChange={() => handleOptionChange(selectedOption === "all" ? "" : "all")}
                        size="small"
                      />
                    }
                    label="Todos los días"
                  />
                </Grid>
                <Grid item xs={6}>
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={selectedOption === "weekend"}
                        onChange={() => handleOptionChange(selectedOption === "weekend" ? "" : "weekend")}
                        size="small"
                      />
                    }
                    label="Sábado y domingo"
                  />
                </Grid>
                <Grid item xs={6}>
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={selectedOption === "weekdays"}
                        onChange={() => handleOptionChange(selectedOption === "weekdays" ? "" : "weekdays")}
                        size="small"
                      />
                    }
                    label="Lunes a viernes"
                  />
                </Grid>
                <Grid item xs={6}>
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={selectedOption === "mondayToSaturday"}
                        onChange={() =>
                          handleOptionChange(selectedOption === "mondayToSaturday" ? "" : "mondayToSaturday")
                        }
                        size="small"
                      />
                    }
                    label="Lunes a sábado"
                  />
                </Grid>
              </Grid>
            </Paper>
          </Grid>

          {/* Horarios */}
          <Grid item xs={12} sm={6}>
            <TextField
              label="Hora de Inicio"
              type="time"
              value={formData.startTime}
              onChange={(e) => handleInputChange("startTime", e.target.value)}
              fullWidth
              required
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <TimeIcon fontSize="small" />
                  </InputAdornment>
                ),
              }}
            />
          </Grid>

          <Grid item xs={12} sm={6}>
            <TextField
              label="Hora de Fin"
              type="time"
              value={formData.endTime}
              onChange={(e) => handleInputChange("endTime", e.target.value)}
              fullWidth
              required
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <TimeIcon fontSize="small" />
                  </InputAdornment>
                ),
              }}
            />
          </Grid>
        </Grid>
      </DialogContent>

      <DialogActions sx={{ p: 2, bgcolor: "#f9f9f9", justifyContent: "flex-end", gap: 1 }}>
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
          onClick={handleSubmit}
          variant="contained"
          disableElevation
          disabled={!isFormValid}
          sx={{
            backgroundColor: "#0455a2",
            borderRadius: "8px",
            textTransform: "none",
            fontWeight: 500,
            px: 3,
            "&:hover": {
              backgroundColor: "#033b70",
            },
          }}
        >
          {isEditing ? "Guardar Cambios" : "Agregar Programación"}
        </Button>
      </DialogActions>
    </Dialog>
  )
}
