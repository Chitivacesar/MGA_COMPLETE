"use client"

import {
  Dialog,
  DialogActions,
  DialogContent,
  Button,
  TextField,
  Switch,
  FormControlLabel,
  Box,
  IconButton,
  Typography,
  Grid,
  Select,
  MenuItem,
  FormControl,
  FormHelperText,
  Checkbox,
  Radio,
  RadioGroup,
  ListItemText,
  Paper,
} from "@mui/material"
import { useState, useEffect } from "react"
import { Close as CloseIcon } from "@mui/icons-material"
import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow } from "@mui/material"

export const FormModal = ({  // Changed back to FormModal
  title,
  subtitle,
  fields,
  initialData,
  open,
  onClose,
  onSubmit,
  submitButtonText = "Guardar Cambios",
}) => {
  const [formData, setFormData] = useState({})
  const [errors, setErrors] = useState({})

  useEffect(() => {
    if (open) {
      if (initialData) {
        setFormData({ ...initialData })
      } else {
        const defaultData = {}
        fields.forEach((field) => {
          defaultData[field.id] = field.defaultValue || ""
        })
        setFormData(defaultData)
      }
      setErrors({})
    }
  }, [initialData, fields, open])

  // New function to validate a single field
  const validateField = (field, value) => {
    // Check required fields
    if (
      field.required &&
      (value === undefined || value === null || value === "")
    ) {
      return `${field.label} es requerido`
    }

    // Check custom validation
    if (field.validate && value !== undefined && value !== null) {
      const validationError = field.validate(value, formData)
      if (validationError) {
        return validationError
      }
    }

    // Check validator (for backward compatibility)
    if (field.validator && value !== undefined && value !== null) {
      const validationError = field.validator(value)
      if (validationError) {
        return validationError
      }
    }

    return null
  }

  const handleChange = (field, value) => {
    // First update the form data
    const updatedFormData = {
      ...formData,
      [field]: value,
    }
    
    setFormData(updatedFormData)

    // Find the field config from fields array
    const fieldConfig = fields.find(f => f.id === field)
    
    // If field has validateOnChange, validate it immediately
    if (fieldConfig && fieldConfig.validateOnChange) {
      const error = validateField(fieldConfig, value)
      setErrors(prev => ({
        ...prev,
        [field]: error
      }))
    } else if (errors[field]) {
      // Otherwise just clear any existing error
      setErrors(prev => ({
        ...prev,
        [field]: null,
      }))
    }
    
    // Handle any custom onChange logic for the field
    if (fieldConfig && fieldConfig.onChange) {
      fieldConfig.onChange(value, updatedFormData, (fieldId, fieldValue) => {
        setFormData(prev => ({
          ...prev,
          [fieldId]: fieldValue
        }))
      })
    }
  }

  const validateForm = () => {
    const newErrors = {}
    let isValid = true

    fields.forEach((field) => {
      const error = validateField(field, formData[field.id])
      if (error) {
        newErrors[field.id] = error
        isValid = false
      }
    })

    setErrors(newErrors)
    return isValid
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    if (validateForm()) {
      onSubmit(formData)
    }
  }

  const renderField = (field) => {
    switch (field.type) {
      case "switch":
        return (
          <Box key={field.id} sx={{ mb: 2 }}>
            <FormControlLabel
              control={
                <Switch
                  checked={!!formData[field.id]}
                  onChange={(e) => handleChange(field.id, e.target.checked)}
                  color="primary"
                />
              }
              label={field.label}
              sx={{
                width: "100%",
                ml: 0,
                "& .MuiFormControlLabel-label": {
                  flex: 1,
                  fontWeight: 500,
                },
              }}
            />
            {errors[field.id] && <FormHelperText error>{errors[field.id]}</FormHelperText>}
          </Box>
        )

      case "select":
        return (
          <Box key={field.id} sx={{ mb: 2 }}>
            <Typography variant="body2" sx={{ mb: 0.5, fontWeight: 500 }}>
              {field.label}
            </Typography>
            <FormControl fullWidth variant="outlined" error={!!errors[field.id]}>
              <Select
                value={formData[field.id] || ""}
                onChange={(e) => handleChange(field.id, e.target.value)}
                displayEmpty
                disabled={field.disabled}
                sx={{
                  borderRadius: "8px",
                  "& .MuiOutlinedInput-notchedOutline": {
                    borderColor: errors[field.id] ? "error.main" : "rgba(0, 0, 0, 0.23)",
                  },
                }}
              >
                <MenuItem value="" disabled>
                  <Typography color="text.secondary">Seleccionar {field.label}</Typography>
                </MenuItem>
                {field.options?.map((option) => (
                  <MenuItem key={option.value} value={option.value}>
                    {option.label}
                  </MenuItem>
                ))}
              </Select>
              {errors[field.id] && <FormHelperText>{errors[field.id]}</FormHelperText>}
            </FormControl>
          </Box>
        )

      case "multiSelect":
        return (
          <Box key={field.id} sx={{ mb: 2 }}>
            <Typography variant="body2" sx={{ mb: 0.5, fontWeight: 500 }}>
              {field.label}
            </Typography>
            <FormControl fullWidth variant="outlined" error={!!errors[field.id]}>
              <Select
                multiple
                value={Array.isArray(formData[field.id]) ? formData[field.id] : []}
                onChange={(e) => handleChange(field.id, e.target.value)}
                renderValue={(selected) => selected.join(", ")}
                disabled={field.disabled}
              >
                {field.options?.map((option) => (
                  <MenuItem key={option.value} value={option.value}>
                    <Checkbox
                      checked={Array.isArray(formData[field.id]) && formData[field.id].indexOf(option.value) > -1}
                    />
                    <ListItemText primary={option.label} />
                  </MenuItem>
                ))}
              </Select>
              {errors[field.id] && <FormHelperText>{errors[field.id]}</FormHelperText>}
            </FormControl>
          </Box>
        )

      case "checkbox":
        return (
          <Box key={field.id} sx={{ mb: 2 }}>
            <FormControlLabel
              control={
                <Checkbox
                  checked={!!formData[field.id]}
                  onChange={(e) => handleChange(field.id, e.target.checked)}
                  color="primary"
                  disabled={field.disabled}
                />
              }
              label={field.label}
              sx={{
                width: "100%",
                ml: 0,
                "& .MuiFormControlLabel-label": {
                  flex: 1,
                  fontWeight: 500,
                },
              }}
            />
            {errors[field.id] && <FormHelperText error>{errors[field.id]}</FormHelperText>}
          </Box>
        )

      case "checkbox-group":
        return (
          <Box key={field.id} sx={{ mb: 2 }}>
            <Typography variant="body2" sx={{ mb: 1, fontWeight: 500 }}>
              {field.label}
            </Typography>
            <Paper variant="outlined" sx={{ p: 2, borderRadius: 2 }}>
              <Grid container spacing={2}>
                {field.options?.map((option) => (
                  <Grid item xs={12} sm={6} key={option.value}>
                    <FormControlLabel
                      control={
                        <Checkbox
                          checked={Array.isArray(formData[field.id]) && formData[field.id].includes(option.value)}
                          onChange={(e) => {
                            const currentValues = Array.isArray(formData[field.id]) ? formData[field.id] : [];
                            const newValues = e.target.checked
                              ? [...currentValues, option.value]
                              : currentValues.filter((value) => value !== option.value);
                            handleChange(field.id, newValues);
                          }}
                        />
                      }
                      label={option.label}
                    />
                  </Grid>
                ))}
              </Grid>
            </Paper>
            {errors[field.id] && (
              <FormHelperText error>{errors[field.id]}</FormHelperText>
            )}
          </Box>
        );

      case "radio":
        return (
          <Box key={field.id} sx={{ mb: 2 }}>
            <Typography variant="body2" sx={{ mb: 0.5, fontWeight: 500 }}>
              {field.label}
            </Typography>
            <FormControl fullWidth error={!!errors[field.id]}>
              <RadioGroup value={formData[field.id] || ""} onChange={(e) => handleChange(field.id, e.target.value)}>
                {field.options?.map((option) => (
                  <FormControlLabel
                    key={option.value}
                    value={option.value}
                    control={<Radio color="primary" disabled={field.disabled} />}
                    label={option.label}
                  />
                ))}
              </RadioGroup>
              {errors[field.id] && <FormHelperText>{errors[field.id]}</FormHelperText>}
            </FormControl>
          </Box>
        )

      case "password":
        return (
          <Box key={field.id} sx={{ mb: 1 }}>
            <Typography variant="body2" sx={{ mb: 0.5, fontWeight: 500 }}>
              {field.label}
            </Typography>
            <TextField
              fullWidth
              size="small"
              type="password"
              value={formData[field.id] || ""}
              onChange={(e) => handleChange(field.id, e.target.value)}
              variant="outlined"
              placeholder={field.placeholder || ""}
              error={!!errors[field.id]}
              helperText={errors[field.id]}
              disabled={field.disabled}
              InputProps={{
                inputProps: {
                  maxLength: field.maxLength || undefined,
                },
                sx: {
                  borderRadius: "8px",
                },
              }}
            />
          </Box>
        )

      case "permissionsTable":
        return (
          <Box key={field.id}>
            <Typography sx={{ 
                mb: 0.5, 
                color: '#666', 
                fontSize: '0.75rem',
                textDecoration: 'none'
              }}>
                {field.section}
              </Typography>
            <TableContainer 
              component={Paper} 
              sx={{ 
                mt: 0.5,
                border: 'none',
                boxShadow: 'none',
                width: '100%',
                '& .MuiTable-root': {
                  tableLayout: 'fixed',
                  width: '100%'
                },
                '& .MuiTableCell-root': {
                  padding: '2px',
                  fontSize: '0.7rem',
                  height: '24px',
                  lineHeight: '1',
                  whiteSpace: 'nowrap'
                },
                '& .MuiTableCell-head': {
                  backgroundColor: '#f5f5f5'
                },
                '& .MuiCheckbox-root': {
                  padding: 0,
                  '& .MuiSvgIcon-root': {
                    fontSize: '16px'
                  }
                }
              }}
            >
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell sx={{ width: '40%' }}>Módulo</TableCell>
                    <TableCell align="center" sx={{ width: '12%' }}>Ver</TableCell>
                    <TableCell align="center" sx={{ width: '12%' }}>Crear</TableCell>
                    <TableCell align="center" sx={{ width: '12%' }}>Editar</TableCell>
                    <TableCell align="center" sx={{ width: '12%' }}>Eliminar</TableCell>
                    <TableCell align="center" sx={{ width: '12%' }}>Descargar</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {field.modules.map((module) => (
                    <TableRow key={module.id}>
                      <TableCell sx={{ 
                        whiteSpace: 'normal',
                        wordBreak: 'break-word'
                      }}>{module.label}</TableCell>
                      {['visualizar', 'crear', 'editar', 'eliminar', 'descargar'].map((action) => (
                        <TableCell key={`${module.id}-${action}`} align="center">
                          <Checkbox
                            size="small"
                            checked={formData[`${module.id}-${action}`] || false}
                            onChange={(e) => handleChange(`${module.id}-${action}`, e.target.checked)}
                          />
                        </TableCell>
                      ))}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Box>
        )

      case "table":
        return (
          <Box key={field.id} sx={{ mb: 2 }}>
            <Typography variant="body2" sx={{ mb: 1, fontWeight: 500 }}>
              {field.label}
            </Typography>
            <TableContainer component={Paper} variant="outlined">
              <Table size="small">
                <TableHead>
                  <TableRow>
                    {field.columns.map((column) => (
                      <TableCell key={column.id}>{column.label}</TableCell>
                    ))}
                  </TableRow>
                </TableHead>
                <TableBody>
                  {field.rows.map((row, rowIndex) => (
                    <TableRow key={rowIndex}>
                      {field.columns.map((column) => (
                        <TableCell key={column.id}>
                          {column.type === 'checkbox' ? (
                            <Checkbox
                              checked={formData[field.id]?.[rowIndex]?.[column.id] || false}
                              onChange={(e) => {
                                const newData = [...(formData[field.id] || field.rows)];
                                newData[rowIndex] = {
                                  ...newData[rowIndex],
                                  [column.id]: e.target.checked
                                };
                                handleChange(field.id, newData);
                              }}
                            />
                          ) : (
                            row[column.id]
                          )}
                        </TableCell>
                      ))}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
            {errors[field.id] && (
              <FormHelperText error>{errors[field.id]}</FormHelperText>
            )}
          </Box>
        );

      default:
        return (
          <Box key={field.id} sx={{ mb: 1 }}>
            <Typography variant="body2" sx={{ mb: 0.5, fontWeight: 500 }}>
              {field.label}
            </Typography>
            <TextField
              fullWidth
              size="small"
              type={field.type || "text"}
              value={formData[field.id] || ""}
              onChange={(e) => handleChange(field.id, e.target.value)}
              variant="outlined"
              placeholder={field.placeholder || ""}
              error={!!errors[field.id]}
              helperText={errors[field.id]}
              multiline={field.multiline}
              rows={field.rows || 1}
              disabled={field.disabled}
              InputProps={{
                inputProps: {
                  min: field.min,
                  max: field.max,
                  maxLength: field.maxLength || undefined,
                },
                sx: {
                  borderRadius: "8px",
                },
              }}
            />
          </Box>
        )
    }
  }

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"  // Changed from "md" to "sm" for a smaller width
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: "8px",
          maxHeight: '80vh',  // Changed from 90vh to 80vh
          '& .MuiDialogContent-root': {
            overflowX: 'hidden',
            padding: '12px',  // Reduced padding
            '& .MuiBox-root': { 
              marginBottom: '8px'  // Reduced margin between fields
            }
          }
        },
      }}
    >
      <Box
        sx={{
          bgcolor: "#0455a2",
          color: "white",
          p: 0.75,  // Reduced padding
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <Typography variant="h6" sx={{ fontWeight: 600, fontSize: '1rem' }}>
          {title}
        </Typography>
        <IconButton onClick={onClose} sx={{ color: "white", p: 0.5 }}>
          <CloseIcon />
        </IconButton>
      </Box>

      <form onSubmit={handleSubmit}>
        <DialogContent
          sx={{
            p: 1,
            '& .MuiBox-root': { mb: 0.75 },
            '& .MuiTypography-root': { 
              fontSize: '0.75rem',  // Reduced from 0.875rem
              color: '#555',
              mb: 0.25,            // Reduced from 0.5
              fontWeight: 500
            },
            '& .MuiFormControl-root': { 
              mb: 0.5,             // Reduced from 0.75
              '& .MuiInputBase-root': {
                minHeight: '28px',  // Slightly reduced height
                fontSize: '0.75rem' // Reduced from 0.875rem
              }
            },
            '& .MuiTextField-root': {
              '& .MuiInputBase-root': {
                height: '30px',     // Reduced from 32px
                fontSize: '0.75rem' // Reduced from 0.875rem
              }
            },
            '& .MuiSelect-select': {
              height: '30px !important',    // Reduced from 32px
              minHeight: '30px !important', // Reduced from 32px
              fontSize: '0.75rem',          // Reduced from 0.875rem
              padding: '2px 8px'            // Reduced padding
            },
            '& .MuiFormControlLabel-root': {
              marginLeft: 0,
              marginRight: 0,
              minHeight: '30px'    // Reduced from 32px
            },
            '& .MuiFormControlLabel-label': {
              fontSize: '0.75rem'  // Reduced from 0.875rem
            },
            '& .MuiFormHelperText-root': {
              marginTop: 0,
              fontSize: '0.7rem'
            }
          }}
        >
          {/* Changed from Grid with columns to a simple Box for single column layout */}
          <Box>
            {fields
              .filter(field => field.id !== 'programacion') // Remove programacion field
              .map((field) => renderField(field))}
          </Box>
        </DialogContent>

        <DialogActions sx={{ p: 1, bgcolor: "#f5f5f5", gap: 1 }}>
          <Button
            onClick={onClose}
            variant="outlined"
            size="small"
            sx={{ 
              borderRadius: "4px", 
              px: 2,
              py: 0.5,
              fontSize: '0.875rem',
              minHeight: '30px'
            }}
          >
            Cancelar
          </Button>
          <Button
            type="submit"
            variant="contained"
            size="small"
            sx={{ 
              borderRadius: "4px", 
              px: 2,
              py: 0.5,
              fontSize: '0.875rem',
              bgcolor: "#0455a2",
              minHeight: '30px'
            }}
          >
            {submitButtonText}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
}
