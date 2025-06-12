"use client"

import { useState } from "react"
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Typography,
  Grid,
  TextField,
  MenuItem,
  Alert,
} from "@mui/material"

export const ProgramacionModal = ({ open, onClose, onSubmit, initialData, profesores, aulas, estudiantes, clasesDisponibles, capacidadClases }) => {
  const [formData, setFormData] = useState({
    clase: initialData?.clase || "",
    profesor: initialData?.profesor || "",
    aula: initialData?.aula || "",
    estudiante: initialData?.estudiante || "",
    hora: initialData?.hora || "",
    dia: initialData?.dia || "",
  })

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleSubmit = () => {
    if (!formData.clase || !formData.profesor || !formData.aula || !formData.estudiante || !formData.hora || !formData.dia) {
      alert("Por favor, complete todos los campos obligatorios.")
      return
    }

    onSubmit(formData)
    onClose()
  }

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle sx={{ bgcolor: "#0455a2", color: "white", fontWeight: "bold" }}>
        {initialData ? "Editar Programación" : "Nueva Programación"}
      </DialogTitle>
      <DialogContent sx={{ mt: 2 }}>
        <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
          <Typography variant="subtitle1" sx={{ fontWeight: "bold" }}>
            Horario Seleccionado: {formData.dia} {formData.hora}
          </Typography>

          <TextField
            select
            label="Clase/Materia *"
            name="clase"
            value={formData.clase}
            onChange={handleInputChange}
            fullWidth
            required
          >
            {clasesDisponibles.map((clase) => (
              <MenuItem key={clase} value={clase}>
                {clase} (max. {capacidadClases[clase] || "N/A"} estudiantes)
              </MenuItem>
            ))}
          </TextField>

          <TextField
            select
            label="Profesor *"
            name="profesor"
            value={formData.profesor}
            onChange={handleInputChange}
            fullWidth
            required
          >
            {profesores.map((profesor) => (
              <MenuItem key={profesor.id} value={profesor.nombre}>
                {profesor.nombre}
              </MenuItem>
            ))}
          </TextField>

          <TextField
            select
            label="Aula *"
            name="aula"
            value={formData.aula}
            onChange={handleInputChange}
            fullWidth
            required
          >
            {aulas.map((aula) => (
              <MenuItem key={aula.id} value={aula.nombre}>
                {aula.nombre}
              </MenuItem>
            ))}
          </TextField>

          <TextField
            select
            label="Estudiante *"
            name="estudiante"
            value={formData.estudiante}
            onChange={handleInputChange}
            fullWidth
            required
          >
            {estudiantes.map((estudiante) => (
              <MenuItem key={estudiante.id} value={estudiante.nombre}>
                {estudiante.nombre}
              </MenuItem>
            ))}
          </TextField>

          <Alert severity="info" sx={{ mt: 2 }}>
            Capacidad: {capacidadClases[formData.clase] || "N/A"} estudiantes
          </Alert>
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} variant="outlined" color="error">
          Cancelar
        </Button>
        <Button onClick={handleSubmit} variant="contained" sx={{ bgcolor: "#0455a2", "&:hover": { bgcolor: "#033b7a" } }}>
          Guardar
        </Button>
      </DialogActions>
    </Dialog>
  )
}
