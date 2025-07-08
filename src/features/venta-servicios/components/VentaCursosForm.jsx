"use client"

import { useState, useEffect } from "react"
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Grid,
  Typography,
  Stepper,
  Step,
  StepLabel,
  Paper,
  Alert,
  IconButton,
  InputAdornment,
  CircularProgress,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Avatar,
} from "@mui/material"
import {
  Person as PersonIcon,
  School as SchoolIcon,
  EventNote as EventNoteIcon,
  ArrowForward as ArrowForwardIcon,
  Close as CloseIcon,
  CheckCircle as CheckCircleIcon,
  Search as SearchIcon,
} from "@mui/icons-material"

const VentaCursosForm = ({
  open,
  onClose,
  onSubmit,
  isEditing,
  clientes,
  beneficiarios,
  cursosDisponibles,
  setClientes,
  setBeneficiarios,
  initialData = null,
}) => {
  // Estados para los pasos del formulario
  const [activeStep, setActiveStep] = useState(0)
  const [transition, setTransition] = useState("slideLeft")
  const [alertMessage, setAlertMessage] = useState({ show: false, message: "", severity: "info" })

  // Estados para los datos del formulario
  const [clienteData, setClienteData] = useState({
    id: null,
    nombre: "",
    apellido: "",
    tipoDocumento: "CC",
    numeroDocumento: "",
    fechaNacimiento: "",
    age: "",
    direccion: "",
    telefono: "",
    correo: "",
    acudiente: "",
    estado: true,
  })

  const [beneficiarioData, setBeneficiarioData] = useState({
    id: null,
    nombre: "",
    apellido: "",
    tipo_de_documento: "TI",
    numero_de_documento: "",
    fechaNacimiento: "",
    age: "",
    direccion: "",
    telefono: "",
    correo: "",
    acudiente: "",
    estado: true,
  })

  const [cursoData, setCursoData] = useState({
    id: null,
    cliente: "",
    beneficiario: "",
    ciclo: "1",
    curso: "",
    clases: "",
    valor_curso: "",
    debe: "",
    estado: "debe",
  })

  // Estados para búsqueda y filtrado
  const [clienteSearchTerm, setClienteSearchTerm] = useState("")
  const [beneficiarioSearchTerm, setBeneficiarioSearchTerm] = useState("")
  const [cursoSearchTerm, setCursoSearchTerm] = useState("")
  const [filteredClientes, setFilteredClientes] = useState([])
  const [filteredBeneficiarios, setFilteredBeneficiarios] = useState([])
  const [filteredCursos, setFilteredCursos] = useState([])
  const [clienteLoading, setClienteLoading] = useState(false)
  const [beneficiarioLoading, setBeneficiarioLoading] = useState(false)
  const [clienteNotFound, setClienteNotFound] = useState(false)
  const [beneficiarioNotFound, setBeneficiarioNotFound] = useState(false)
  const [clienteCreated, setClienteCreated] = useState(false)
  const [beneficiarioCreated, setBeneficiarioCreated] = useState(false)
  const [showClienteResults, setShowClienteResults] = useState(false)
  const [showBeneficiarioResults, setShowBeneficiarioResults] = useState(false)
  const [showCursoResults, setShowCursoResults] = useState(false)

  // Estado para anulación
  const [anularDialogOpen, setAnularDialogOpen] = useState(false)
  const [motivoAnulacion, setMotivoAnulacion] = useState("")
  const [anulando, setAnulando] = useState(false)

  const tiposDocumento = [
    { value: "CC", label: "Cédula de Ciudadanía (CC)" },
    { value: "TI", label: "Tarjeta de Identidad (TI)" },
    { value: "CE", label: "Cédula de Extranjería (CE)" },
    { value: "PA", label: "Pasaporte (PA)" },
    { value: "RC", label: "Registro Civil (RC)" },
    { value: "NIT", label: "NIT" },
  ]

  // Función para capitalizar la primera letra
  const capitalizeFirstLetter = (string) => {
    if (!string) return ""
    return string.charAt(0).toUpperCase() + string.slice(1).toLowerCase()
  }

  // Inicializar datos si estamos editando
  useEffect(() => {
    if (isEditing && initialData) {
      // Buscar cliente y beneficiario completos
      const clienteCompleto = clientes.find((c) => `${c.nombre} ${c.apellido}` === initialData.cliente)
      const beneficiarioCompleto = beneficiarios.find((b) => `${b.nombre} ${b.apellido}` === initialData.beneficiario)

      // Establecer datos
      if (clienteCompleto) setClienteData(clienteCompleto)
      if (beneficiarioCompleto) setBeneficiarioData(beneficiarioCompleto)

      setCursoData({
        ...initialData,
        cliente: clienteCompleto ? `${clienteCompleto.nombre} ${clienteCompleto.apellido}` : initialData.cliente,
        beneficiario: beneficiarioCompleto
          ? `${beneficiarioCompleto.nombre} ${beneficiarioCompleto.apellido}`
          : initialData.beneficiario,
      })
    } else {
      resetFormData()
    }
  }, [isEditing, initialData, clientes, beneficiarios])

  // Resetear formulario
  const resetFormData = () => {
    setClienteData({
      id: null,
      nombre: "",
      apellido: "",
      tipoDocumento: "CC",
      numeroDocumento: "",
      fechaNacimiento: "",
      age: "",
      direccion: "",
      telefono: "",
      correo: "",
      acudiente: "",
      estado: true,
    })

    setBeneficiarioData({
      id: null,
      nombre: "",
      apellido: "",
      tipoDocumento: "TI",
      numeroDocumento: "",
      fechaNacimiento: "",
      age: "",
      direccion: "",
      telefono: "",
      correo: "",
      acudiente: "",
      estado: true,
    })

    setCursoData({
      id: null,
      cliente: "",
      beneficiario: "",
      ciclo: "1",
      curso: "",
      clases: "",
      valor_curso: "",
      debe: "",
      estado: "debe",
    })

    setClienteSearchTerm("")
    setBeneficiarioSearchTerm("")
    setCursoSearchTerm("")
    setFilteredClientes([])
    setFilteredBeneficiarios([])
    setFilteredCursos([])
    setClienteNotFound(false)
    setBeneficiarioNotFound(false)
    setClienteCreated(false)
    setBeneficiarioCreated(false)
    setShowClienteResults(false)
    setShowBeneficiarioResults(false)
    setShowCursoResults(false)
    setAlertMessage({ show: false, message: "", severity: "info" })
    setActiveStep(0)
  }

  // Manejadores para el formulario multi-paso
  const handleNext = () => {
    // Validar datos antes de avanzar
    if (activeStep === 0 && (!clienteData.nombre || !clienteData.apellido || !clienteData.numeroDocumento)) {
      setAlertMessage({
        show: true,
        message: "Por favor complete los datos del cliente",
        severity: "error",
      })
      return
    }

    if (activeStep === 1 && (!beneficiarioData.nombre || !beneficiarioData.apellido || !beneficiarioData.numeroDocumento)) {
      setAlertMessage({
        show: true,
        message: "Por favor complete los datos del beneficiario",
        severity: "error",
      })
      return
    }

    setAlertMessage({ show: false, message: "", severity: "info" })
    setTransition("slideLeft")
    setActiveStep((prev) => prev + 1)

    // Si avanzamos al paso de curso, actualizar datos
    if (activeStep === 1) {
      setCursoData((prev) => ({
        ...prev,
        cliente: `${clienteData.nombre} ${clienteData.apellido}`,
        beneficiario: `${beneficiarioData.nombre} ${beneficiarioData.apellido}`,
      }))
    }
  }

  const handleBack = () => {
    setTransition("slideRight")
    setActiveStep((prev) => prev - 1)
  }

  // Función para calcular edad
  const calculateAge = (birthDate) => {
    if (!birthDate) return ""
    const today = new Date()
    const birth = new Date(birthDate)
    let age = today.getFullYear() - birth.getFullYear()
    const monthDiff = today.getMonth() - birth.getMonth()

    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--
    }
    return age
  }

  // Filtrar clientes mientras se escribe
  const handleClienteSearch = (searchTerm) => {
    setClienteSearchTerm(searchTerm)
    setClienteCreated(false)
    setClienteLoading(true)

    if (searchTerm.trim() === "") {
      setFilteredClientes([])
      setClienteNotFound(false)
      setShowClienteResults(false)
      setClienteLoading(false)
      return
    }

    // Mostrar resultados después de un breve retraso para evitar demasiadas actualizaciones
    setTimeout(() => {
      const searchTermLower = (searchTerm || '').toLowerCase()
      const matches = clientes.filter(
        (cliente) =>
          cliente.nombre.toLowerCase().includes(searchTermLower) ||
          cliente.apellido.toLowerCase().includes(searchTermLower) ||
          cliente.numeroDocumento.includes(searchTerm),
      )

      setFilteredClientes(matches)
      setClienteNotFound(matches.length === 0)
      setShowClienteResults(true)
      setClienteLoading(false)
    }, 300)
  }

  // Filtrar beneficiarios mientras se escribe
  const handleBeneficiarioSearch = (searchTerm) => {
    setBeneficiarioSearchTerm(searchTerm)
    setBeneficiarioCreated(false)
    setBeneficiarioLoading(true)

    if (searchTerm.trim() === "") {
      setFilteredBeneficiarios([])
      setBeneficiarioNotFound(false)
      setShowBeneficiarioResults(false)
      setBeneficiarioLoading(false)
      return
    }

    // Mostrar resultados después de un breve retraso para evitar demasiadas actualizaciones
    setTimeout(() => {
      const searchTermLower = (searchTerm || '').toLowerCase()
      const matches = beneficiarios.filter(
        (beneficiario) =>
          beneficiario.nombre.toLowerCase().includes(searchTermLower) ||
          beneficiario.apellido.toLowerCase().includes(searchTermLower) ||
          (beneficiario.numero_de_documento && beneficiario.numero_de_documento.includes(searchTerm)),
      )

      setFilteredBeneficiarios(matches)
      setBeneficiarioNotFound(matches.length === 0)
      setShowBeneficiarioResults(true)
      setBeneficiarioLoading(false)
    }, 300)
  }

  // Filtrar cursos mientras se escribe
  const handleCursoSearch = (searchTerm) => {
    setCursoSearchTerm(searchTerm)

    if (searchTerm.trim() === "") {
      setFilteredCursos(cursosDisponibles)
      setShowCursoResults(true)
      return
    }

    const searchTermLower = searchTerm.toLowerCase()
    const matches = cursosDisponibles.filter(
      (curso) =>
        curso.nombre.toLowerCase().includes(searchTermLower) || curso.profesor.toLowerCase().includes(searchTermLower),
    )

    setFilteredCursos(matches)
    setShowCursoResults(true)
  }

  // Crear cliente nuevo
  const createNewCliente = () => {
    if (!clienteData.nombre || !clienteData.apellido || !clienteData.numeroDocumento) {
      setAlertMessage({
        show: true,
        message: "Complete los campos requeridos para crear el cliente",
        severity: "error",
      })
      return
    }

    const newId = Math.max(...clientes.map((c) => c.id)) + 1
    const newCliente = {
      ...clienteData,
      id: newId,
      age: calculateAge(clienteData.fechaNacimiento),
      estado: true,
    }

    setClientes((prev) => [...prev, newCliente])
    setClienteData(newCliente)
    setClienteNotFound(false)
    setClienteCreated(true)
    setShowClienteResults(false)

    setAlertMessage({
      show: true,
      message: "Cliente creado correctamente",
      severity: "success",
    })
  }

  // Crear beneficiario nuevo
  const createNewBeneficiario = () => {
    if (!beneficiarioData.nombre || !beneficiarioData.apellido || !beneficiarioData.numero_de_documento) {
      setAlertMessage({
        show: true,
        message: "Complete los campos requeridos para crear el beneficiario",
        severity: "error",
      })
      return
    }

    const newId = Math.max(...beneficiarios.map((b) => b.id)) + 1
    const newBeneficiario = {
      ...beneficiarioData,
      id: newId,
      age: calculateAge(beneficiarioData.fechaNacimiento),
      estado: true,
    }

    setBeneficiarios((prev) => [...prev, newBeneficiario])
    setBeneficiarioData(newBeneficiario)
    setBeneficiarioNotFound(false)
    setBeneficiarioCreated(true)
    setShowBeneficiarioResults(false)

    setAlertMessage({
      show: true,
      message: "Beneficiario creado correctamente",
      severity: "success",
    })
  }

  // Seleccionar cliente de la lista
  const handleSelectCliente = (cliente) => {
    setClienteData(cliente)
    setClienteSearchTerm("")
    setFilteredClientes([])
    setClienteNotFound(false)
    setShowClienteResults(false)
  }

  // Seleccionar beneficiario de la lista
  const handleSelectBeneficiario = (beneficiario) => {
    setBeneficiarioData(beneficiario)
    setBeneficiarioSearchTerm("")
    setFilteredBeneficiarios([])
    setBeneficiarioNotFound(false)
    setShowBeneficiarioResults(false)
  }

  // Seleccionar curso de la lista
  const handleSelectCurso = (curso) => {
    setCursoData((prev) => ({
      ...prev,
      curso: curso.nombre,
      clases: curso.numeroDeClases,
      valor_curso: curso.precio,
      debe: curso.precio, // Por defecto, debe el valor completo
    }))
    setCursoSearchTerm("")
    setShowCursoResults(false)

    // No need to advance since this is the last step
  }

  // Manejar envío del formulario
  const handleSubmit = () => {
    // Validar datos
    if (
      !clienteData.nombre ||
      !beneficiarioData.nombre ||
      !cursoData.curso ||
      !cursoData.clases ||
      !cursoData.valor_curso
    ) {
      setAlertMessage({
        show: true,
        message: "Por favor complete todos los campos requeridos",
        severity: "error",
      })
      return
    }

    // Preparar datos para guardar
    const clienteNombreCompleto = `${clienteData.nombre} ${clienteData.apellido}`
    const beneficiarioNombreCompleto = `${beneficiarioData.nombre} ${beneficiarioData.apellido}`

    const nuevoCurso = {
      cliente: clienteNombreCompleto,
      beneficiario: beneficiarioNombreCompleto,
      ciclo: cursoData.ciclo,
      curso: cursoData.curso,
      clases: Number.parseInt(cursoData.clases),
      valor_curso: Number.parseInt(cursoData.valor_curso),
      debe: Number.parseInt(cursoData.debe || 0),
      estado: cursoData.estado,
    }

    onSubmit(nuevoCurso)
  }

  // Actualizar debe al cambiar valor del curso
  useEffect(() => {
    if (cursoData.valor_curso) {
      setCursoData((prev) => ({
        ...prev,
        debe: prev.valor_curso,
      }))
    }
  }, [cursoData.valor_curso])

  // Actualizar edad al cambiar fecha de nacimiento
  useEffect(() => {
    if (clienteData.fechaNacimiento) {
      const edad = calculateAge(clienteData.fechaNacimiento)
      setClienteData((prev) => ({ ...prev, age: edad }))
    }
  }, [clienteData.fechaNacimiento])

  useEffect(() => {
    if (beneficiarioData.fechaNacimiento) {
      const edad = calculateAge(beneficiarioData.fechaNacimiento)
      setBeneficiarioData((prev) => ({ ...prev, age: edad }))
    }
  }, [beneficiarioData.fechaNacimiento])

  // Inicializar cursos filtrados
  useEffect(() => {
    setFilteredCursos(cursosDisponibles)
  }, [cursosDisponibles])

  // Función para anular venta
  const handleConfirmAnular = async () => {
    if (!motivoAnulacion.trim()) {
      setAlertMessage({ show: true, message: "Debe ingresar el motivo de anulación", severity: "error" })
      return
    }
    setAnulando(true)
    try {
      // Ahora usamos el endpoint PATCH /api/ventas/:id/anular
      const response = await fetch(`/api/ventas/${initialData?.id}/anular`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ motivoAnulacion }),
      })
      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.message || "Error al anular la venta")
      }
      setAlertMessage({ show: true, message: "Venta anulada correctamente", severity: "success" })
      setAnularDialogOpen(false)
      setMotivoAnulacion("")
      if (onClose) onClose()
    } catch (error) {
      setAlertMessage({ show: true, message: error.message, severity: "error" })
    } finally {
      setAnulando(false)
    }
  }

  // Renderizado del contenido del paso actual
  const renderStepContent = () => {
    const slideClass = transition === "slideLeft" ? "slide-left" : "slide-right"

    switch (activeStep) {
      case 0:
        return (
          <Box className={slideClass} sx={{ animation: `${slideClass} 0.3s forwards` }}>
            <Typography variant="h6" sx={{ mb: 2, color: "#0455a2", fontWeight: 500 }}>
              Datos del Cliente
            </Typography>

            <Paper elevation={0} sx={{ p: 2, mb: 3, border: "1px solid #e0e0e0", borderRadius: "8px" }}>
              <Grid container spacing={2} alignItems="center">
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Buscar cliente (nombre, apellido o documento)"
                    variant="outlined"
                    size="small"
                    value={clienteSearchTerm}
                    onChange={(e) => handleClienteSearch(e.target.value)}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <SearchIcon />
                        </InputAdornment>
                      ),
                      endAdornment: clienteLoading && (
                        <InputAdornment position="end">
                          <CircularProgress size={20} />
                        </InputAdornment>
                      ),
                    }}
                    autoFocus
                  />
                </Grid>
              </Grid>

              {showClienteResults && filteredClientes.length > 0 && (
                <Paper
                  elevation={3}
                  sx={{
                    mt: 1,
                    maxHeight: "200px",
                    overflow: "auto",
                    border: "1px solid #e0e0e0",
                    borderRadius: "4px",
                  }}
                >
                  <List dense>
                    {filteredClientes.map((cliente) => (
                      <ListItem
                        key={cliente.id}
                        button
                        onClick={() => handleSelectCliente(cliente)}
                        sx={{
                          "&:hover": {
                            bgcolor: "rgba(4, 85, 162, 0.08)",
                          },
                        }}
                      >
                        <ListItemAvatar>
                          <Avatar sx={{ bgcolor: "#0455a2" }}>
                            <PersonIcon />
                          </Avatar>
                        </ListItemAvatar>
                        <ListItemText
                          primary={`${cliente.nombre} ${cliente.apellido}`}
                          secondary={`${cliente.tipoDocumento}: ${cliente.numeroDocumento}`}
                        />
                      </ListItem>
                    ))}
                  </List>
                </Paper>
              )}

              {clienteNotFound && clienteSearchTerm !== "" && (
                <Alert
                  severity="info"
                  sx={{ mt: 2 }}
                  action={
                    <Button color="inherit" size="small" onClick={createNewCliente} disabled={clienteCreated}>
                      {clienteCreated ? "Creado" : "Crear Nuevo"}
                    </Button>
                  }
                >
                  Cliente no encontrado. Complete los datos y cree uno nuevo.
                </Alert>
              )}

              {clienteCreated && (
                <Alert severity="success" sx={{ mt: 2 }} icon={<CheckCircleIcon fontSize="inherit" />}>
                  Cliente creado correctamente
                </Alert>
              )}
            </Paper>

            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  required
                  label="Nombre"
                  value={clienteData.nombre}
                  onChange={(e) => setClienteData({ ...clienteData, nombre: capitalizeFirstLetter(e.target.value) })}
                  margin="normal"
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  required
                  label="Apellido"
                  value={clienteData.apellido}
                  onChange={(e) => setClienteData({ ...clienteData, apellido: capitalizeFirstLetter(e.target.value) })}
                  margin="normal"
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth margin="normal">
                  <InputLabel>Tipo Documento</InputLabel>
                  <Select
                    value={clienteData.tipoDocumento}
                    onChange={(e) => setClienteData({ ...clienteData, tipoDocumento: e.target.value })}
                    label="Tipo Documento"
                  >
                    {tiposDocumento.map((tipo) => (
                      <MenuItem key={tipo.value} value={tipo.value}>
                        {tipo.label}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  required
                  label="Número de Documento"
                  value={clienteData.numeroDocumento}
                  onChange={(e) => setClienteData({ ...clienteData, numeroDocumento: e.target.value })}
                  margin="normal"
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  type="date"
                  label="Fecha de Nacimiento"
                  value={clienteData.fechaNacimiento}
                  onChange={(e) => setClienteData({ ...clienteData, fechaNacimiento: e.target.value })}
                  margin="normal"
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Edad"
                  value={clienteData.age}
                  InputProps={{ readOnly: true }}
                  margin="normal"
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Dirección"
                  value={clienteData.direccion}
                  onChange={(e) => setClienteData({ ...clienteData, direccion: e.target.value })}
                  margin="normal"
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Teléfono"
                  value={clienteData.telefono}
                  onChange={(e) => setClienteData({ ...clienteData, telefono: e.target.value })}
                  margin="normal"
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Correo Electrónico"
                  type="email"
                  value={clienteData.correo}
                  onChange={(e) => setClienteData({ ...clienteData, correo: e.target.value })}
                  margin="normal"
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Acudiente"
                  value={clienteData.acudiente}
                  onChange={(e) => setClienteData({ ...clienteData, acudiente: e.target.value })}
                  margin="normal"
                />
              </Grid>
            </Grid>
          </Box>
        )

      case 1:
        return (
          <Box className={slideClass} sx={{ animation: `${slideClass} 0.3s forwards` }}>
            <Typography variant="h6" sx={{ mb: 2, color: "#0455a2", fontWeight: 500 }}>
              Datos del Beneficiario
            </Typography>

            <Paper elevation={0} sx={{ p: 2, mb: 3, border: "1px solid #e0e0e0", borderRadius: "8px" }}>
              <Grid container spacing={2} alignItems="center">
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Buscar beneficiario (nombre, apellido o documento)"
                    variant="outlined"
                    size="small"
                    value={beneficiarioSearchTerm}
                    onChange={(e) => handleBeneficiarioSearch(e.target.value)}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <SearchIcon />
                        </InputAdornment>
                      ),
                      endAdornment: beneficiarioLoading && (
                        <InputAdornment position="end">
                          <CircularProgress size={20} />
                        </InputAdornment>
                      ),
                    }}
                    autoFocus
                  />
                </Grid>
              </Grid>

              {showBeneficiarioResults && filteredBeneficiarios.length > 0 && (
                <Paper
                  elevation={3}
                  sx={{
                    mt: 1,
                    maxHeight: "200px",
                    overflow: "auto",
                    border: "1px solid #e0e0e0",
                    borderRadius: "4px",
                  }}
                >
                  <List dense>
                    {filteredBeneficiarios.map((beneficiario) => (
                <ListItem
                  key={beneficiario.id}
                  button
                  onClick={() => handleSelectBeneficiario(beneficiario)}
                  sx={{
                    "&:hover": {
                      bgcolor: "rgba(4, 85, 162, 0.08)",
                    },
                  }}
                >
                  <ListItemAvatar>
                    <Avatar sx={{ bgcolor: "#0455a2" }}>
                      <SchoolIcon />
                    </Avatar>
                  </ListItemAvatar>
                  <ListItemText
                    primary={`${beneficiario.nombre} ${beneficiario.apellido}`}
                    secondary={`${beneficiario.tipo_de_documento}: ${beneficiario.numero_de_documento}`}
                  />
                </ListItem>
                    ))}
                  </List>
                </Paper>
              )}

              {beneficiarioNotFound && beneficiarioSearchTerm !== "" && (
                <Alert
                  severity="info"
                  sx={{ mt: 2 }}
                  action={
                    <Button color="inherit" size="small" onClick={createNewBeneficiario} disabled={beneficiarioCreated}>
                      {beneficiarioCreated ? "Creado" : "Crear Nuevo"}
                    </Button>
                  }
                >
                  Beneficiario no encontrado. Complete los datos y cree uno nuevo.
                </Alert>
              )}

              {beneficiarioCreated && (
                <Alert severity="success" sx={{ mt: 2 }} icon={<CheckCircleIcon fontSize="inherit" />}>
                  Beneficiario creado correctamente
                </Alert>
              )}
            </Paper>

            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  required
                  label="Nombre"
                  value={beneficiarioData.nombre}
                  onChange={(e) =>
                    setBeneficiarioData({ ...beneficiarioData, nombre: capitalizeFirstLetter(e.target.value) })
                  }
                  margin="normal"
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  required
                  label="Apellido"
                  value={beneficiarioData.apellido}
                  onChange={(e) =>
                    setBeneficiarioData({ ...beneficiarioData, apellido: capitalizeFirstLetter(e.target.value) })
                  }
                  margin="normal"
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth margin="normal">
                  <InputLabel>Tipo Documento</InputLabel>
                  <Select
                  value={beneficiarioData.tipo_de_documento}
                  onChange={(e) => setBeneficiarioData({ ...beneficiarioData, tipo_de_documento: e.target.value })}
                    label="Tipo Documento"
                  >
                    {tiposDocumento.map((tipo) => (
                      <MenuItem key={tipo.value} value={tipo.value}>
                        {tipo.label}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  required
                  label="Número de Documento"
                  value={beneficiarioData.numero_de_documento}
                  onChange={(e) => setBeneficiarioData({ ...beneficiarioData, numero_de_documento: e.target.value })}
                  margin="normal"
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  type="date"
                  label="Fecha de Nacimiento"
                  value={beneficiarioData.fechaNacimiento}
                  onChange={(e) => setBeneficiarioData({ ...beneficiarioData, fechaNacimiento: e.target.value })}
                  margin="normal"
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Edad"
                  value={beneficiarioData.age}
                  InputProps={{ readOnly: true }}
                  margin="normal"
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Dirección"
                  value={beneficiarioData.direccion}
                  onChange={(e) => setBeneficiarioData({ ...beneficiarioData, direccion: e.target.value })}
                  margin="normal"
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Teléfono"
                  value={beneficiarioData.telefono}
                  onChange={(e) => setBeneficiarioData({ ...beneficiarioData, telefono: e.target.value })}
                  margin="normal"
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Correo Electrónico"
                  type="email"
                  value={beneficiarioData.correo}
                  onChange={(e) => setBeneficiarioData({ ...beneficiarioData, correo: e.target.value })}
                  margin="normal"
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Acudiente"
                  value={beneficiarioData.acudiente}
                  onChange={(e) => setBeneficiarioData({ ...beneficiarioData, acudiente: e.target.value })}
                  margin="normal"
                />
              </Grid>
            </Grid>
          </Box>
        )

      case 2:
        return (
          <Box className={slideClass} sx={{ animation: `${slideClass} 0.3s forwards` }}>
            <Typography variant="h6" sx={{ mb: 2, color: "#0455a2", fontWeight: 500 }}>
              Datos del Curso
            </Typography>

            <Paper elevation={0} sx={{ p: 2, mb: 3, border: "1px solid #e0e0e0", borderRadius: "8px" }}>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle2" color="textSecondary">
                    Cliente
                  </Typography>
                  <Typography variant="body1" sx={{ fontWeight: 500 }}>
                    {clienteData.nombre} {clienteData.apellido}
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle2" color="textSecondary">
                    Beneficiario
                  </Typography>
                  <Typography variant="body1" sx={{ fontWeight: 500 }}>
                    {beneficiarioData.nombre} {beneficiarioData.apellido}
                  </Typography>
                </Grid>
              </Grid>
            </Paper>

            <Grid container spacing={2}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Buscar curso"
                  variant="outlined"
                  size="small"
                  value={cursoSearchTerm}
                  onChange={(e) => handleCursoSearch(e.target.value)}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <SearchIcon />
                      </InputAdornment>
                    ),
                  }}
                  autoFocus
                  margin="normal"
                />
              </Grid>
            </Grid>

            {showCursoResults && filteredCursos.length > 0 && (
              <Paper
                elevation={3}
                sx={{
                  mt: 1,
                  mb: 3,
                  maxHeight: "200px",
                  overflow: "auto",
                  border: "1px solid #e0e0e0",
                  borderRadius: "4px",
                }}
              >
                <List dense>
                  {filteredCursos.map((curso) => (
                    <ListItem
                      key={curso.id}
                      button
                      onClick={() => handleSelectCurso(curso)}
                      sx={{
                        "&:hover": {
                          bgcolor: "rgba(4, 85, 162, 0.08)",
                        },
                        bgcolor: cursoData.curso === curso.nombre ? "rgba(4, 85, 162, 0.12)" : "transparent",
                      }}
                    >
                      <ListItemAvatar>
                        <Avatar sx={{ bgcolor: "#0455a2" }}>
                          <EventNoteIcon />
                        </Avatar>
                      </ListItemAvatar>
                      <ListItemText
                        primary={curso.nombre}
                        secondary={`Profesor: ${curso.profesor} - Precio: $${curso.precio.toLocaleString()}`}
                      />
                    </ListItem>
                  ))}
                </List>
              </Paper>
            )}

            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth margin="normal">
                  <InputLabel>Ciclo</InputLabel>
                  <Select
                    value={cursoData.ciclo}
                    onChange={(e) => setCursoData({ ...cursoData, ciclo: e.target.value })}
                    label="Ciclo"
                  >
                    {[...Array(50)].map((_, i) => (
                      <MenuItem key={i + 1} value={(i + 1).toString()}>
                        {i + 1}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Número de Clases"
                  type="number"
                  value={cursoData.clases}
                  onChange={(e) => setCursoData({ ...cursoData, clases: e.target.value })}
                  margin="normal"
                  required
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Valor del Curso"
                  type="number"
                  value={cursoData.valor_curso}
                  onChange={(e) => setCursoData({ ...cursoData, valor_curso: e.target.value })}
                  margin="normal"
                  required
                  InputProps={{
                    startAdornment: <InputAdornment position="start">$</InputAdornment>,
                  }}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Valor Pendiente"
                  type="number"
                  value={cursoData.debe}
                  onChange={(e) => setCursoData({ ...cursoData, debe: e.target.value })}
                  margin="normal"
                  InputProps={{
                    startAdornment: <InputAdornment position="start">$</InputAdornment>,
                  }}
                />
              </Grid>
              <Grid item xs={12}>
                <FormControl fullWidth margin="normal">
                  <InputLabel>Estado de Pago</InputLabel>
                  <Select
                    value={cursoData.estado}
                    onChange={(e) => setCursoData({ ...cursoData, estado: e.target.value })}
                    label="Estado de Pago"
                  >
                    <MenuItem value="debe">Debe</MenuItem>
                    <MenuItem value="pagado">Pagado</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
            </Grid>
          </Box>
        )
      default:
        return null
    }
  }

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle
        sx={{
          bgcolor: "#0455a2",
          color: "white",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        {isEditing ? "Editar Venta de Curso" : "Nueva Venta de Curso"}
        <IconButton onClick={onClose} sx={{ color: "white" }}>
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent sx={{ pt: 3, pb: 1, mt: 2 }}>
        <Stepper activeStep={activeStep} alternativeLabel sx={{ mb: 4 }}>
          <Step>
            <StepLabel
              icon={<PersonIcon color={activeStep >= 0 ? "primary" : "disabled"} />}
              StepIconProps={{
                completed: activeStep > 0,
                active: activeStep === 0,
              }}
            >
              Cliente
            </StepLabel>
          </Step>
          <Step>
            <StepLabel
              icon={<SchoolIcon color={activeStep >= 1 ? "primary" : "disabled"} />}
              StepIconProps={{
                completed: activeStep > 1,
                active: activeStep === 1,
              }}
            >
              Beneficiario
            </StepLabel>
          </Step>
          <Step>
            <StepLabel
              icon={<EventNoteIcon color={activeStep >= 2 ? "primary" : "disabled"} />}
              StepIconProps={{
                completed: activeStep > 2,
                active: activeStep === 2,
              }}
            >
              Curso
            </StepLabel>
          </Step>
        </Stepper>

        {alertMessage.show && (
          <Alert
            severity={alertMessage.severity}
            sx={{ mb: 2 }}
            onClose={() => setAlertMessage({ show: false, message: "", severity: "info" })}
          >
            {alertMessage.message}
          </Alert>
        )}

        <Box sx={{ minHeight: "400px", position: "relative", overflow: "hidden" }}>{renderStepContent()}</Box>
      </DialogContent>

      <DialogActions sx={{ p: 2, pt: 0 }}>
        <Button onClick={onClose} variant="outlined">
          Cancelar
        </Button>
        {/* Botón para anular venta solo en edición */}
        {isEditing && (
          <Button
            color="error"
            variant="outlined"
            onClick={() => setAnularDialogOpen(true)}
            disabled={anulando}
          >
            Anular venta
          </Button>
        )}

        {activeStep > 0 && (
          <Button
            onClick={handleBack}
            variant="outlined"
            startIcon={<ArrowForwardIcon sx={{ transform: "rotate(180deg)" }} />}
          >
            Anterior
          </Button>
        )}

        {activeStep < 2 ? (
          <Button onClick={handleNext} variant="contained" endIcon={<ArrowForwardIcon />} sx={{ bgcolor: "#0455a2" }}>
            Siguiente
          </Button>
        ) : (
          <Button onClick={handleSubmit} variant="contained" sx={{ bgcolor: "#0455a2" }}>
            {isEditing ? "Actualizar" : "Guardar"}
          </Button>
        )}
      </DialogActions>

      {/* Diálogo de anulación */}
      <Dialog open={anularDialogOpen} onClose={() => setAnularDialogOpen(false)}>
        <DialogTitle>Anular venta</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Motivo de anulación"
            type="text"
            fullWidth
            value={motivoAnulacion}
            onChange={e => setMotivoAnulacion(e.target.value)}
            disabled={anulando}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setAnularDialogOpen(false)} disabled={anulando}>Cancelar</Button>
          <Button onClick={handleConfirmAnular} color="error" disabled={anulando || !motivoAnulacion.trim()}>
            {anulando ? "Anulando..." : "Confirmar anulación"}
          </Button>
        </DialogActions>
      </Dialog>

      <style jsx global>{`
        @keyframes slide-left {
          from {
            opacity: 0;
            transform: translateX(50px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }
        
        @keyframes slide-right {
          from {
            opacity: 0;
            transform: translateX(-50px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }
      `}</style>
    </Dialog>
  )
}

export default VentaCursosForm
