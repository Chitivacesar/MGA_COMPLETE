"use client"
import { useState, useEffect } from "react"
import {
  Dialog,
  Checkbox,
  FormControlLabel,
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
  Divider,
} from "@mui/material"
import {
  Person as PersonIcon,
  School as SchoolIcon,
  EventNote as EventNoteIcon,
  Close as CloseIcon,
  Search as SearchIcon,
  AttachMoney as AttachMoneyIcon,
} from "@mui/icons-material"

export const VentaMatriculasForm = ({
  open,
  onClose,
  onSubmit,
  isEditing,
  clientes,
  beneficiarios,
  matriculas,
  cursosDisponibles,
  setClientes,
  setBeneficiarios,
  initialData = null,
  ventasOriginales = [],
}) => {
  const [clienteEsBeneficiario, setClienteEsBeneficiario] = useState(false)
  const [activeStep, setActiveStep] = useState(0)
  const [transition, setTransition] = useState("slideLeft")
  const [alertMessage, setAlertMessage] = useState({ show: false, message: "", severity: "info" })

  // Definir los pasos del formulario - condicional para curso
  const getSteps = () => {
    const baseSteps = ["Datos del Cliente", "Datos del Beneficiario", "Datos de la Matrícula"]
    if (!isEditing) {
      baseSteps.push("Datos del Curso")
    }
    return baseSteps
  }

  const steps = getSteps()

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
    estado: true,
  })

  const [beneficiarioData, setBeneficiarioData] = useState({
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
    estado: true,
    password: "",
    confirmPassword: "",
  })

  const [matriculaData, setMatriculaData] = useState({
    id: null,
    cliente: "",
    beneficiario: "",
    fechaInicio: "",
    fechaFin: "",
    matriculaId: "",
    valor: "0",
    descuento: "0",
    valorFinal: "0",
    observaciones: "",
    estado: "vigente",
  })

  const [cursoData, setCursoData] = useState({
    id: null,
    curso: "",
    clases: "4",
    valorCurso: "",
    valorTotal: "",
    debe: "",
    estado: "debe",
  })

  // Estados para búsqueda y filtrado
  const [clienteSearchTerm, setClienteSearchTerm] = useState("")
  const [beneficiarioSearchTerm, setBeneficiarioSearchTerm] = useState("")
  const [filteredClientes, setFilteredClientes] = useState([])
  const [filteredBeneficiarios, setFilteredBeneficiarios] = useState([])
  const [clienteLoading, setClienteLoading] = useState(false)
  const [beneficiarioLoading, setBeneficiarioLoading] = useState(false)
  const [clienteNotFound, setClienteNotFound] = useState(false)
  const [beneficiarioNotFound, setBeneficiarioNotFound] = useState(false)
  const [clienteCreated, setClienteCreated] = useState(false)
  const [beneficiarioCreated, setBeneficiarioCreated] = useState(false)
  const [showClienteResults, setShowClienteResults] = useState(false)
  const [showBeneficiarioResults, setShowBeneficiarioResults] = useState(false)

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

  // Función para formatear fechas
  const formatDateInput = (date) => {
    if (!date) return ""
    if (/^\d{4}-\d{2}-\d{2}$/.test(date)) return date
    try {
      return new Date(date).toISOString().split("T")[0]
    } catch {
      return ""
    }
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

  // Efecto para manejar el checkbox de cliente es beneficiario
  useEffect(() => {
    if (!clienteEsBeneficiario) {
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
        estado: true,
        password: "",
        confirmPassword: "",
      })
    } else {
      setBeneficiarioData({
        ...clienteData,
        id: null,
        tipoDocumento: "TI",
        correo: "",
        password: "",
        confirmPassword: "",
      })
    }
  }, [clienteEsBeneficiario, clienteData])

  // Inicializar datos si estamos editando (CORREGIDO)
  useEffect(() => {
    if (open) {
      console.log("Modal abierto, isEditing:", isEditing, "initialData:", initialData)

      // SIEMPRE reiniciar primero cuando se abre el modal
      resetFormData()

      // Solo cargar datos si estamos editando Y tenemos initialData
      if (isEditing && initialData) {
        console.log("Cargando datos para edición:", initialData)

        // Verificar que tenemos los datos necesarios para edición
        if (!initialData || (!initialData.beneficiarioObj && !initialData._original)) {
          console.warn("No se encontraron datos del beneficiario para editar")
          return
        }

        // Mapear datos del beneficiario
        let beneficiario = initialData.beneficiarioObj
        if (!beneficiario && initialData._original) {
          // Buscar beneficiario usando el beneficiarioId de la venta original
          beneficiario = beneficiarios.find((b) => String(b._id) === String(initialData._original.beneficiarioId))
          console.log("Beneficiario encontrado por ID:", beneficiario)
        }

        if (beneficiario) {
          console.log("Beneficiario encontrado:", beneficiario)

          // Determinar la relación cliente-beneficiario basado en la lógica correcta
          const clienteIdStr = String(beneficiario.clienteId || "")
          const beneficiarioIdStr = String(beneficiario._id)

          console.log("ClienteId:", clienteIdStr, "BeneficiarioId:", beneficiarioIdStr)

          // Cliente es beneficiario si clienteId === _id del beneficiario
          const esClienteBeneficiario = clienteIdStr === beneficiarioIdStr

          console.log("Es cliente beneficiario:", esClienteBeneficiario)
          setClienteEsBeneficiario(esClienteBeneficiario)

          // Cargar datos del beneficiario
          const beneficiarioDataToSet = {
            id: beneficiario._id,
            nombre: beneficiario.nombre || "",
            apellido: beneficiario.apellido || "",
            tipoDocumento: beneficiario.tipo_de_documento || "TI",
            numeroDocumento: beneficiario.numero_de_documento || "",
            fechaNacimiento: formatDateInput(beneficiario.fechaDeNacimiento),
            age: calculateAge(beneficiario.fechaDeNacimiento),
            direccion: beneficiario.direccion || "",
            telefono: beneficiario.telefono || "",
            correo: beneficiario.correo || "",
            estado: beneficiario.estado !== undefined ? beneficiario.estado : true,
            password: "",
            confirmPassword: "",
          }

          console.log("Datos del beneficiario a cargar:", beneficiarioDataToSet)
          setBeneficiarioData(beneficiarioDataToSet)

          if (esClienteBeneficiario) {
            // Cliente es el mismo beneficiario
            const clienteDataToSet = {
              id: beneficiario._id,
              nombre: beneficiario.nombre || "",
              apellido: beneficiario.apellido || "",
              tipoDocumento: beneficiario.tipo_de_documento || "CC",
              numeroDocumento: beneficiario.numero_de_documento || "",
              fechaNacimiento: formatDateInput(beneficiario.fechaDeNacimiento),
              age: calculateAge(beneficiario.fechaDeNacimiento),
              direccion: beneficiario.direccion || "",
              telefono: beneficiario.telefono || "",
              estado: beneficiario.estado !== undefined ? beneficiario.estado : true,
            }
            console.log("Datos del cliente (mismo beneficiario) a cargar:", clienteDataToSet)
            setClienteData(clienteDataToSet)
          } else {
            // Buscar el cliente real por su ID
            const clienteReal = beneficiarios.find((b) => String(b._id) === clienteIdStr)
            if (clienteReal) {
              const clienteDataToSet = {
                id: clienteReal._id,
                nombre: clienteReal.nombre || "",
                apellido: clienteReal.apellido || "",
                tipoDocumento: clienteReal.tipo_de_documento || "CC",
                numeroDocumento: clienteReal.numero_de_documento || "",
                fechaNacimiento: formatDateInput(clienteReal.fechaDeNacimiento),
                age: calculateAge(clienteReal.fechaDeNacimiento),
                direccion: clienteReal.direccion || "",
                telefono: clienteReal.telefono || "",
                estado: clienteReal.estado !== undefined ? clienteReal.estado : true,
              }
              console.log("Datos del cliente real encontrado:", clienteDataToSet)
              setClienteData(clienteDataToSet)
            } else {
              // Si no se encuentra el cliente, usar datos del beneficiario como fallback
              console.warn("Cliente no encontrado, usando datos del beneficiario como fallback")
              const clienteDataFallback = {
                id: beneficiario._id,
                nombre: beneficiario.nombre || "",
                apellido: beneficiario.apellido || "",
                tipoDocumento: beneficiario.tipo_de_documento || "CC",
                numeroDocumento: beneficiario.numero_de_documento || "",
                fechaNacimiento: formatDateInput(beneficiario.fechaDeNacimiento),
                age: calculateAge(beneficiario.fechaDeNacimiento),
                direccion: beneficiario.direccion || "",
                telefono: beneficiario.telefono || "",
                estado: beneficiario.estado !== undefined ? beneficiario.estado : true,
              }
              console.log("Datos del cliente fallback:", clienteDataFallback)
              setClienteData(clienteDataFallback)
            }
          }

          // Mapear datos de la matrícula (CORREGIDO para usar _original)
          if (initialData && initialData._original) {
            const ventaOriginal = initialData._original
            const matriculaDataToSet = {
              id: ventaOriginal._id,
              cliente: initialData.cliente || "",
              beneficiario: initialData.beneficiario || "",
              fechaInicio: formatDateInput(ventaOriginal.fechaInicio),
              fechaFin: formatDateInput(ventaOriginal.fechaFin),
              matriculaId: ventaOriginal.matriculaId || "",
              valor: String(ventaOriginal.valor_total || 0),
              descuento: String(ventaOriginal.descuento || 0),
              valorFinal: String((ventaOriginal.valor_total || 0) - (ventaOriginal.descuento || 0)),
              observaciones: ventaOriginal.observaciones || "",
              estado: ventaOriginal.estado || "vigente",
            }
            console.log("Datos de la matrícula a cargar:", matriculaDataToSet)
            setMatriculaData(matriculaDataToSet)
          }
        } else {
          console.error("No se pudo encontrar el beneficiario para editar")
        }

        console.log("Datos cargados completamente para edición")
      } else {
        console.log("Modo creación - formulario reiniciado")
      }
    }
  }, [open, isEditing, initialData, beneficiarios])

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
      estado: true,
      password: "",
      confirmPassword: "",
    })

    setMatriculaData({
      id: null,
      cliente: "",
      beneficiario: "",
      fechaInicio: "",
      fechaFin: "",
      matriculaId: "",
      valor: "0",
      descuento: "0",
      valorFinal: "0",
      observaciones: "",
      estado: "vigente",
    })

    setCursoData({
      id: null,
      curso: "",
      clases: "4",
      valorCurso: "",
      valorTotal: "",
      debe: "",
      estado: "debe",
    })

    setClienteSearchTerm("")
    setBeneficiarioSearchTerm("")
    setFilteredClientes([])
    setFilteredBeneficiarios([])
    setClienteNotFound(false)
    setBeneficiarioNotFound(false)
    setClienteCreated(false)
    setBeneficiarioCreated(false)
    setShowClienteResults(false)
    setShowBeneficiarioResults(false)
    setAlertMessage({ show: false, message: "", severity: "info" })
    setActiveStep(0)
    setClienteEsBeneficiario(false)
  }

  // Manejadores para el formulario multi-paso
  const handleNext = () => {
    let isValid = true

    switch (activeStep) {
      case 0:
        if (!clienteData.nombre || !clienteData.tipoDocumento || !clienteData.numeroDocumento) {
          setAlertMessage({
            show: true,
            message: "Por favor complete todos los campos obligatorios del cliente",
            severity: "error",
          })
          isValid = false
        }
        break
      case 1:
        if (!beneficiarioData.nombre || !beneficiarioData.tipoDocumento || !beneficiarioData.numeroDocumento) {
          setAlertMessage({
            show: true,
            message: "Por favor complete todos los campos obligatorios del beneficiario",
            severity: "error",
          })
          isValid = false
        }
        if (!isEditing && !beneficiarioData.correo) {
          setAlertMessage({
            show: true,
            message: "Por favor ingrese un correo electrónico para el beneficiario",
            severity: "error",
          })
          isValid = false
        }
        if (!isEditing && !beneficiarioData.password) {
          setAlertMessage({
            show: true,
            message: "Por favor ingrese una contraseña para el beneficiario",
            severity: "error",
          })
          isValid = false
        }
        if (!isEditing && beneficiarioData.password !== beneficiarioData.confirmPassword) {
          setAlertMessage({
            show: true,
            message: "Las contraseñas no coinciden",
            severity: "error",
          })
          isValid = false
        }
        break
      case 2:
        if (!matriculaData.fechaInicio || !matriculaData.fechaFin || !matriculaData.matriculaId) {
          setAlertMessage({
            show: true,
            message: "Por favor complete todos los campos obligatorios de la matrícula",
            severity: "error",
          })
          isValid = false
        }
        break
    }

    if (isValid) {
      setActiveStep((prevStep) => prevStep + 1)
      setTransition("slideLeft")
      setAlertMessage({ show: false, message: "", severity: "info" })
    }

    // Si avanzamos al paso de matrícula, actualizar datos
    if (activeStep === 1 && isValid) {
      setMatriculaData((prev) => ({
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

    setTimeout(() => {
      const searchTermLower = searchTerm.toLowerCase()

      // Filtrar clientes que coincidan con la búsqueda
      let matches = clientes.filter(
        (cliente) =>
          cliente.nombre.toLowerCase().includes(searchTermLower) ||
          cliente.apellido.toLowerCase().includes(searchTermLower) ||
          cliente.numero_de_documento.includes(searchTerm),
      )

      // Filtrar clientes que NO tengan matrícula activa
      matches = matches.filter((cliente) => {
        const tieneMatriculaActiva = ventasOriginales.some((venta) => {
          if (venta._original.tipo !== "matricula" || venta._original.estado !== "vigente") {
            return false
          }

          const beneficiarioVenta = beneficiarios.find((b) => String(b._id) === String(venta._original.beneficiarioId))
          if (!beneficiarioVenta) return false

          const clienteIdStr = String(beneficiarioVenta.clienteId)
          const clienteIdActual = String(cliente._id)
          const beneficiarioIdStr = String(beneficiarioVenta._id)

          // Cliente es beneficiario (clienteId === _id del beneficiario)
          if (clienteIdStr === beneficiarioIdStr && clienteIdActual === beneficiarioIdStr) {
            return true
          }

          // Cliente es diferente del beneficiario
          if (clienteIdStr !== beneficiarioIdStr && clienteIdStr === clienteIdActual) {
            return true
          }

          return false
        })

        return !tieneMatriculaActiva
      })

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

    setTimeout(() => {
      const searchTermLower = searchTerm.toLowerCase()

      // Filtrar beneficiarios que coincidan con la búsqueda
      let matches = beneficiarios.filter(
        (beneficiario) =>
          beneficiario.nombre.toLowerCase().includes(searchTermLower) ||
          beneficiario.apellido.toLowerCase().includes(searchTermLower) ||
          beneficiario.numero_de_documento.includes(searchTerm),
      )

      // Filtrar beneficiarios que NO tengan matrícula activa
      matches = matches.filter((beneficiario) => {
        const tieneMatriculaActiva = ventasOriginales.some((venta) => {
          return (
            venta._original.tipo === "matricula" &&
            venta._original.estado === "vigente" &&
            String(venta._original.beneficiarioId) === String(beneficiario._id)
          )
        })

        return !tieneMatriculaActiva
      })

      setFilteredBeneficiarios(matches)
      setBeneficiarioNotFound(matches.length === 0)
      setShowBeneficiarioResults(true)
      setBeneficiarioLoading(false)
    }, 300)
  }

  // Seleccionar cliente de la lista
  const handleSelectCliente = (cliente) => {
    setClienteData({
      id: cliente._id || cliente.id || null,
      nombre: cliente.nombre || "",
      apellido: cliente.apellido || "",
      tipoDocumento: cliente.tipoDocumento || cliente.tipo_de_documento || "",
      numeroDocumento: cliente.numeroDocumento || cliente.numero_de_documento || "",
      fechaNacimiento: formatDateInput(
        cliente.fechaNacimiento || cliente.fecha_de_nacimiento || cliente.fechaDeNacimiento,
      ),
      age: calculateAge(cliente.fechaNacimiento || cliente.fecha_de_nacimiento || cliente.fechaDeNacimiento),
      direccion: cliente.direccion || "",
      telefono: cliente.telefono || "",
      estado: cliente.estado !== undefined ? cliente.estado : true,
    })
    setShowClienteResults(false)
    setClienteSearchTerm(`${cliente.nombre} ${cliente.apellido}`)
    setClienteCreated(true)
  }

  // Seleccionar beneficiario de la lista
  const handleSelectBeneficiario = (beneficiario) => {
    setBeneficiarioData({
      id: beneficiario._id || beneficiario.id || null,
      nombre: beneficiario.nombre || "",
      apellido: beneficiario.apellido || "",
      tipoDocumento: beneficiario.tipoDocumento || beneficiario.tipo_de_documento || "",
      numeroDocumento: beneficiario.numeroDocumento || beneficiario.numero_de_documento || "",
      fechaNacimiento: formatDateInput(
        beneficiario.fechaNacimiento || beneficiario.fecha_de_nacimiento || beneficiario.fechaDeNacimiento,
      ),
      age: calculateAge(
        beneficiario.fechaNacimiento || beneficiario.fecha_de_nacimiento || beneficiario.fechaDeNacimiento,
      ),
      direccion: beneficiario.direccion || "",
      telefono: beneficiario.telefono || "",
      correo: beneficiario.correo || beneficiario.email || "",
      estado: beneficiario.estado !== undefined ? beneficiario.estado : true,
      password: beneficiarioData.password,
      confirmPassword: beneficiarioData.confirmPassword,
    })
    setShowBeneficiarioResults(false)
    setBeneficiarioSearchTerm(`${beneficiario.nombre} ${beneficiario.apellido}`)
    setBeneficiarioCreated(true)
  }

  // Solo cursos activos
  const cursosActivos = cursosDisponibles.filter((c) => c.estado)

  // Calcular valor final con descuento
  useEffect(() => {
    if (matriculaData.valor) {
      const valor = Number.parseFloat(matriculaData.valor)
      const descuento = Number.parseFloat(matriculaData.descuento || 0)
      const valorFinal = valor - descuento
      setMatriculaData((prev) => ({
        ...prev,
        valorFinal: valorFinal >= 0 ? valorFinal.toString() : "0",
      }))
    }
  }, [matriculaData.valor, matriculaData.descuento])

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

  // Establecer fechas por defecto al llegar al paso de matrícula
  useEffect(() => {
    if (activeStep === 2 && !matriculaData.fechaInicio && !isEditing) {
      const hoy = new Date()
      const fechaInicio = hoy.toISOString().split("T")[0]
      const fechaFin = new Date(hoy.setFullYear(hoy.getFullYear() + 1)).toISOString().split("T")[0]
      setMatriculaData((prev) => ({
        ...prev,
        fechaInicio: fechaInicio,
        fechaFin: fechaFin,
      }))
    }
  }, [activeStep, isEditing])

  // Manejar envío del formulario (ACTUALIZADO con nueva lógica)
  const handleSubmit = () => {
    // Validar datos básicos
    if (!clienteData.nombre || !beneficiarioData.nombre || !matriculaData.fechaInicio || !matriculaData.fechaFin) {
      setAlertMessage({
        show: true,
        message: "Por favor complete todos los campos requeridos",
        severity: "error",
      })
      return
    }

    // Validar contraseñas y correo solo si no estamos editando
    if (!isEditing) {
      if (!beneficiarioData.correo) {
        setAlertMessage({
          show: true,
          message: "Por favor ingrese un correo electrónico",
          severity: "error",
        })
        return
      }
      if (!beneficiarioData.password || beneficiarioData.password !== beneficiarioData.confirmPassword) {
        setAlertMessage({
          show: true,
          message: "Por favor complete las contraseñas correctamente",
          severity: "error",
        })
        return
      }
    }

    // Usuario para beneficiario - usar campos correctos
    const usuarioBeneficiario = {
      nombre: beneficiarioData.nombre,
      apellido: beneficiarioData.apellido,
      email: beneficiarioData.correo,
      contrasena: beneficiarioData.password,
      documento: beneficiarioData.numeroDocumento,
      estado: true,
    }

    // Beneficiario
    const beneficiario = {
      id: beneficiarioData.id,
      nombre: beneficiarioData.nombre,
      apellido: beneficiarioData.apellido,
      tipoDocumento: beneficiarioData.tipoDocumento,
      numeroDocumento: beneficiarioData.numeroDocumento,
      telefono: beneficiarioData.telefono,
      direccion: beneficiarioData.direccion,
      fechaNacimiento: beneficiarioData.fechaNacimiento,
      correo: beneficiarioData.correo,
      estado: true,
    }

    // Cliente (si es diferente del beneficiario)
    const cliente = clienteEsBeneficiario
      ? null
      : {
          id: clienteData.id,
          nombre: clienteData.nombre,
          apellido: clienteData.apellido,
          tipoDocumento: clienteData.tipoDocumento,
          numeroDocumento: clienteData.numeroDocumento,
          telefono: clienteData.telefono,
          direccion: clienteData.direccion,
          fechaNacimiento: clienteData.fechaNacimiento,
          estado: true,
        }

    // Datos de matrícula
    const matricula = {
      id: matriculaData.id,
      cliente: `${clienteData.nombre} ${clienteData.apellido}`,
      beneficiario: `${beneficiarioData.nombre} ${beneficiarioData.apellido}`,
      fechaInicio: matriculaData.fechaInicio,
      fechaFin: matriculaData.fechaFin,
      matriculaId: matriculaData.matriculaId,
      valor: Number.parseFloat(matriculaData.valor),
      descuento: Number.parseFloat(matriculaData.descuento || 0),
      valorFinal: Number.parseFloat(matriculaData.valorFinal),
      observaciones: matriculaData.observaciones,
      estado: matriculaData.estado,
    }

    // Datos del curso (opcional y solo si no estamos editando)
    const curso =
      !isEditing && cursoData.curso
        ? {
            curso: cursoData.curso,
            clases: Number.parseInt(cursoData.clases),
            valorCurso: Number.parseFloat(cursoData.valorCurso || 0),
            valorTotal: Number.parseFloat(cursoData.valorTotal || 0),
          }
        : null

    // Envía todo al padre
    onSubmit({
      matricula,
      beneficiario,
      usuarioBeneficiario,
      cliente,
      clienteEsBeneficiario,
      curso,
      isEditing,
    })
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

            {!isEditing && (
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
                          key={cliente._id || cliente.id}
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
                            secondary={`${cliente.tipo_de_documento}: ${cliente.numero_de_documento}`}
                          />
                        </ListItem>
                      ))}
                    </List>
                  </Paper>
                )}
                {showClienteResults && filteredClientes.length === 0 && clienteSearchTerm.trim() !== "" && (
                  <Paper elevation={1} sx={{ mt: 1, p: 2, bgcolor: "#fff3cd", border: "1px solid #ffeaa7" }}>
                    <Typography variant="body2" color="text.secondary">
                      No se encontraron clientes disponibles. Los clientes con matrículas activas no se muestran.
                    </Typography>
                  </Paper>
                )}
              </Paper>
            )}

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
              <Grid item xs={12} sm={6}>
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
            </Grid>
          </Box>
        )

      case 1:
        return (
          <Box className={slideClass} sx={{ animation: `${slideClass} 0.3s forwards` }}>
            <Typography variant="h6" sx={{ mb: 2, color: "#0455a2", fontWeight: 500 }}>
              Datos del Beneficiario
            </Typography>

            {!clienteEsBeneficiario && !isEditing && (
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
                          key={beneficiario._id || beneficiario.id}
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
                {showBeneficiarioResults &&
                  filteredBeneficiarios.length === 0 &&
                  beneficiarioSearchTerm.trim() !== "" && (
                    <Paper elevation={1} sx={{ mt: 1, p: 2, bgcolor: "#fff3cd", border: "1px solid #ffeaa7" }}>
                      <Typography variant="body2" color="text.secondary">
                        No se encontraron beneficiarios disponibles. Los beneficiarios con matrículas activas no se
                        muestran.
                      </Typography>
                    </Paper>
                  )}
              </Paper>
            )}

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
                    value={beneficiarioData.tipoDocumento}
                    onChange={(e) => setBeneficiarioData({ ...beneficiarioData, tipoDocumento: e.target.value })}
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
                  value={beneficiarioData.numeroDocumento}
                  onChange={(e) => setBeneficiarioData({ ...beneficiarioData, numeroDocumento: e.target.value })}
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
              <Grid item xs={12} sm={6}>
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
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  required={!isEditing}
                  label="Correo Electrónico"
                  type="email"
                  value={beneficiarioData.correo}
                  onChange={(e) => setBeneficiarioData({ ...beneficiarioData, correo: e.target.value })}
                  margin="normal"
                />
              </Grid>

              {!isEditing && (
                <>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      required
                      type="password"
                      label="Contraseña"
                      value={beneficiarioData.password}
                      onChange={(e) => setBeneficiarioData({ ...beneficiarioData, password: e.target.value })}
                      margin="normal"
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      required
                      type="password"
                      label="Confirmar Contraseña"
                      value={beneficiarioData.confirmPassword}
                      onChange={(e) => setBeneficiarioData({ ...beneficiarioData, confirmPassword: e.target.value })}
                      margin="normal"
                      error={beneficiarioData.password !== beneficiarioData.confirmPassword}
                      helperText={
                        beneficiarioData.password !== beneficiarioData.confirmPassword
                          ? "Las contraseñas no coinciden"
                          : ""
                      }
                    />
                  </Grid>
                </>
              )}
            </Grid>
          </Box>
        )

      case 2:
        return (
          <Box className={slideClass} sx={{ animation: `${slideClass} 0.3s forwards` }}>
            <Typography variant="h6" sx={{ mb: 2, color: "#0455a2", fontWeight: 500 }}>
              Datos de la Matrícula
            </Typography>
            <Paper elevation={0} sx={{ p: 2, mb: 3, border: "1px solid #e0e0e0", borderRadius: "8px" }}>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle2" sx={{ color: "#0455a2" }}>
                    Cliente
                  </Typography>
                  <Typography>{matriculaData.cliente}</Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle2" sx={{ color: "#0455a2" }}>
                    Beneficiario
                  </Typography>
                  <Typography>{matriculaData.beneficiario}</Typography>
                </Grid>
              </Grid>
            </Paper>

            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  required
                  label="Fecha de Inicio"
                  type="date"
                  value={matriculaData.fechaInicio}
                  onChange={(e) => setMatriculaData({ ...matriculaData, fechaInicio: e.target.value })}
                  margin="normal"
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  required
                  label="Fecha de Fin"
                  type="date"
                  value={matriculaData.fechaFin}
                  onChange={(e) => setMatriculaData({ ...matriculaData, fechaFin: e.target.value })}
                  margin="normal"
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>

              <Grid item xs={12}>
                <Divider sx={{ my: 2 }}>Selección de Matrícula</Divider>
              </Grid>

              <Grid item xs={12}>
                <FormControl fullWidth margin="normal" required>
                  <InputLabel>Tipo de Matrícula</InputLabel>
                  <Select
                    value={matriculaData.matriculaId || ""}
                    onChange={(e) => {
                      const matriculaSeleccionada = matriculas.find((m) => m._id === e.target.value)
                      if (matriculaSeleccionada) {
                        const valorBase = matriculaSeleccionada.valorMatricula
                        const descuento = Number.parseFloat(matriculaData.descuento || 0)
                        const valorFinal = valorBase - descuento

                        setMatriculaData({
                          ...matriculaData,
                          matriculaId: e.target.value,
                          valor: valorBase.toString(),
                          valorFinal: valorFinal >= 0 ? valorFinal.toString() : "0",
                        })
                      }
                    }}
                    label="Tipo de Matrícula"
                  >
                    {matriculas
                      .filter((m) => m.estado)
                      .map((matricula) => (
                        <MenuItem key={matricula._id} value={matricula._id}>
                          {matricula.nombre} - ${matricula.valorMatricula?.toLocaleString() || 0}
                        </MenuItem>
                      ))}
                  </Select>
                </FormControl>
              </Grid>

              <Grid item xs={12}>
                <Divider sx={{ my: 2 }}>Información de Pago</Divider>
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Valor Base de la Matrícula"
                  type="number"
                  value={matriculaData.valor}
                  margin="normal"
                  InputProps={{
                    readOnly: true,
                    startAdornment: (
                      <InputAdornment position="start">
                        <AttachMoneyIcon />
                      </InputAdornment>
                    ),
                  }}
                  disabled
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Monto de Descuento"
                  type="number"
                  value={matriculaData.descuento}
                  onChange={(e) => {
                    const descuento = Number.parseFloat(e.target.value || 0)
                    const valorBase = Number.parseFloat(matriculaData.valor || 0)
                    const valorFinal = valorBase - descuento

                    setMatriculaData({
                      ...matriculaData,
                      descuento: e.target.value,
                      valorFinal: valorFinal >= 0 ? valorFinal.toString() : "0",
                    })
                  }}
                  margin="normal"
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <AttachMoneyIcon />
                      </InputAdornment>
                    ),
                    inputProps: { min: 0, max: matriculaData.valor },
                  }}
                />
              </Grid>

              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Total a Pagar"
                  type="number"
                  value={matriculaData.valorFinal}
                  margin="normal"
                  InputProps={{
                    readOnly: true,
                    startAdornment: (
                      <InputAdornment position="start">
                        <AttachMoneyIcon />
                      </InputAdornment>
                    ),
                  }}
                  sx={{
                    "& .MuiInputBase-input": {
                      fontWeight: 600,
                      fontSize: "1.1rem",
                    },
                  }}
                />
              </Grid>

              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Observaciones"
                  value={matriculaData.observaciones}
                  onChange={(e) => setMatriculaData({ ...matriculaData, observaciones: e.target.value })}
                  margin="normal"
                  multiline
                  minRows={2}
                />
              </Grid>
            </Grid>
          </Box>
        )

      case 3:
        // Solo mostrar si no estamos editando
        if (isEditing) return null

        return (
          <Box className={slideClass} sx={{ animation: `${slideClass} 0.3s forwards` }}>
            <Typography variant="h6" sx={{ mb: 2, color: "#0455a2", fontWeight: 500 }}>
              Información del Curso (Opcional)
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <FormControl fullWidth margin="normal">
                  <InputLabel id="curso-label">Curso</InputLabel>
                  <Select
                    labelId="curso-label"
                    value={cursoData.curso}
                    label="Curso"
                    onChange={(e) => {
                      const curso = cursosActivos.find((c) => c.nombre === e.target.value)
                      setCursoData((prev) => ({
                        ...prev,
                        curso: e.target.value,
                        clases: "4",
                        valorCurso: curso ? curso.valor_por_hora : "",
                        valorTotal: curso ? Number(curso.valor_por_hora) * 4 : "",
                      }))
                    }}
                  >
                    <MenuItem value="">Sin curso</MenuItem>
                    {cursosActivos.map((curso) => (
                      <MenuItem key={curso._id} value={curso.nombre}>
                        {curso.nombre}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>

              {cursoData.curso && (
                <>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Número de Clases"
                      type="number"
                      value={cursoData.clases}
                      margin="normal"
                      InputProps={{
                        inputProps: { min: 1 },
                      }}
                      onChange={(e) => {
                        const cursoSeleccionado = cursosActivos.find((c) => c.nombre === cursoData.curso)
                        const valorHora = cursoSeleccionado ? cursoSeleccionado.valor_por_hora : 0
                        const numClases = Number(e.target.value)
                        setCursoData((prev) => ({
                          ...prev,
                          clases: e.target.value,
                          valorTotal: valorHora * numClases,
                        }))
                      }}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Valor por Hora"
                      type="number"
                      value={cursosActivos.find((c) => c.nombre === cursoData.curso)?.valor_por_hora || ""}
                      margin="normal"
                      InputProps={{
                        readOnly: true,
                        startAdornment: (
                          <InputAdornment position="start">
                            <AttachMoneyIcon />
                          </InputAdornment>
                        ),
                      }}
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Valor Total del Curso"
                      type="number"
                      value={cursoData.valorTotal}
                      margin="normal"
                      InputProps={{
                        readOnly: true,
                        startAdornment: (
                          <InputAdornment position="start">
                            <AttachMoneyIcon />
                          </InputAdornment>
                        ),
                      }}
                    />
                  </Grid>
                </>
              )}
            </Grid>
          </Box>
        )

      default:
        return null
    }
  }

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: "12px",
          maxHeight: "90vh",
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
        }}
      >
        {isEditing ? "Editar Matrícula" : "Nueva Matrícula"}
        <IconButton onClick={onClose} sx={{ color: "white" }}>
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent sx={{ pt: 3, pb: 1, mt: 2, display: "flex", flexDirection: "column", gap: 2 }}>
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
              Matrícula
            </StepLabel>
          </Step>
          {!isEditing && (
            <Step>
              <StepLabel
                icon={<EventNoteIcon color={activeStep >= 3 ? "primary" : "disabled"} />}
                StepIconProps={{
                  completed: activeStep > 3,
                  active: activeStep === 3,
                }}
              >
                Curso
              </StepLabel>
            </Step>
          )}
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

        <Box sx={{ flexGrow: 1, overflow: "auto" }}>{renderStepContent()}</Box>
      </DialogContent>

      <DialogActions
        sx={{
          p: 2,
          bgcolor: "#f8f9fa",
          borderTop: "1px solid #e9ecef",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        {activeStep === 0 && !isEditing && (
          <FormControlLabel
            control={
              <Checkbox
                checked={clienteEsBeneficiario}
                onChange={(e) => {
                  setClienteEsBeneficiario(e.target.checked)
                  if (e.target.checked) {
                    setBeneficiarioData({
                      ...clienteData,
                      id: null,
                      tipoDocumento: "TI",
                      correo: "",
                      password: "",
                      confirmPassword: "",
                    })
                    handleNext()
                  }
                }}
                sx={{
                  color: "#0455a2",
                  "&.Mui-checked": {
                    color: "#0455a2",
                  },
                }}
              />
            }
            label="Cliente es beneficiario"
            sx={{
              "& .MuiFormControlLabel-label": {
                fontWeight: 500,
                color: "#0455a2",
              },
            }}
          />
        )}
        <Box sx={{ display: "flex", gap: 2, ml: "auto" }}>
          <Button
            onClick={onClose}
            variant="outlined"
            sx={{
              textTransform: "none",
              borderColor: "rgba(0, 0, 0, 0.12)",
              color: "text.secondary",
              "&:hover": {
                borderColor: "rgba(0, 0, 0, 0.24)",
              },
            }}
          >
            Cancelar
          </Button>
          {activeStep > 0 && (
            <Button
              onClick={handleBack}
              variant="outlined"
              sx={{
                textTransform: "none",
                borderColor: "#0455a2",
                color: "#0455a2",
                "&:hover": {
                  borderColor: "#033b70",
                },
              }}
            >
              Anterior
            </Button>
          )}
          <Button
            onClick={activeStep === steps.length - 1 ? handleSubmit : handleNext}
            variant="contained"
            sx={{
              textTransform: "none",
              bgcolor: "#0455a2",
              "&:hover": {
                bgcolor: "#033b70",
              },
            }}
          >
            {activeStep === steps.length - 1 ? "Guardar" : "Siguiente"}
          </Button>
        </Box>
      </DialogActions>

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

export default VentaMatriculasForm
