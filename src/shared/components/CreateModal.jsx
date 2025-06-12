"use client"

import { useState, useEffect } from "react"
// Importar DialogContent
import {
  Dialog,
  DialogActions,
  Button,
  TextField,
  Typography,
  Box,
  IconButton,
  Grid,
  DialogContent,
} from "@mui/material"
import { Close as CloseIcon } from "@mui/icons-material"

export function CreateModal({ open, onClose, onConfirm, fields, title = "Crear Nuevo" }) {
  const [formData, setFormData] = useState({})
  const [errors, setErrors] = useState({})

  useEffect(() => {
    if (open) {
      // Reset form data when modal opens
      const initialData = {}
      fields.forEach((field) => {
        initialData[field.id] = field.defaultValue || ""
      })
      setFormData(initialData)
      setErrors({})
    }
  }, [open, fields])

  const handleChange = (field) => (event) => {
    const value = event.target.value
    setFormData((prev) => ({
      ...prev,
      [field.id]: value,
    }))

    // Clear error when field is edited
    if (errors[field.id]) {
      setErrors((prev) => ({
        ...prev,
        [field.id]: null,
      }))
    }
  }

  const validateForm = () => {
    const newErrors = {}
    let isValid = true

    fields.forEach((field) => {
      if (field.required && !formData[field.id]) {
        newErrors[field.id] = `${field.label} es requerido`
        isValid = false
      }

      if (field.validator && formData[field.id]) {
        const validationError = field.validator(formData[field.id])
        if (validationError) {
          newErrors[field.id] = validationError
          isValid = false
        }
      }
    })

    setErrors(newErrors)
    return isValid
  }

  const handleSubmit = () => {
    if (validateForm()) {
      onConfirm(formData)
    }
  }

  // Modificar el return para usar DialogContent
  return (
    <Dialog
      open={open}
      onClose={onClose}
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
          bgcolor: "#0455a2",
          color: "white",
          p: 2,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <Typography variant="h6" sx={{ fontWeight: 600 }}>
          {title}
        </Typography>
        <IconButton onClick={onClose} sx={{ color: "white" }}>
          <CloseIcon />
        </IconButton>
      </Box>

      <DialogContent
        sx={{
          p: 3,
          maxHeight: "70vh",
          overflow: "auto",
          scrollbarWidth: "none", // Firefox
          "&::-webkit-scrollbar": {
            display: "none", // Chrome, Safari, Edge
          },
          msOverflowStyle: "none", // IE
        }}
      >
        <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
          Complete los campos para crear un nuevo registro.
        </Typography>

        <Grid container spacing={2} sx={{ mb: 3 }}>
          {fields.map((field) => (
            <Grid item xs={12} sm={field.fullWidth ? 12 : 6} key={field.id}>
              <Typography variant="body2" sx={{ mb: 0.5, fontWeight: 500 }}>
                {field.label}
              </Typography>
              <TextField
                value={formData[field.id] || ""}
                onChange={handleChange(field)}
                fullWidth
                variant="outlined"
                placeholder={field.placeholder || ""}
                required={field.required}
                error={!!errors[field.id]}
                helperText={errors[field.id]}
                type={field.type || "text"}
                multiline={field.multiline}
                rows={field.rows || 1}
                InputProps={{
                  sx: {
                    borderRadius: "8px",
                  },
                }}
              />
            </Grid>
          ))}
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
          Guardar
        </Button>
      </DialogActions>
    </Dialog>
  )
}
