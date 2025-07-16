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
  Autocomplete,
  InputAdornment,
} from "@mui/material"
import { useAlertVentas } from '../context/AlertVentasContext'
import axios from 'axios';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { es } from 'date-fns/locale';
import { addMonths } from 'date-fns';

const VentaCursosFormNew = ({ open, onClose, onSubmit }) => {
  const { showError, showSuccess } = useAlertVentas();
  // Estados para el formulario
  const [formData, setFormData] = useState({
    beneficiarioId: null,
    cursoId: null,
    numero_de_clases: '',
    ciclo: 1,
    tipo: 'curso',
    fechaInicio: null,
    fechaFin: null,
    estado: 'vigente',
    valor_total: 0,
    motivoAnulacion: null
  });

  // Estados para datos relacionados
  const [beneficiarios, setBeneficiarios] = useState([]);
  const [cursos, setCursos] = useState([]);
  const [clienteInfo, setClienteInfo] = useState(null);
  const [valorPorHora, setValorPorHora] = useState(0);
  const [alert, setAlert] = useState({ show: false, message: '', severity: 'error' });

  // Cargar beneficiarios filtrados

  const loadBeneficiarios = async (searchText = '') => {
    try {
      const response = await axios.get(`http://localhost:3000/api/beneficiarios?search=${searchText}`);
      const filteredBeneficiarios = response.data.filter(beneficiario => 
        beneficiario.clienteId && !beneficiario.clienteId.toLowerCase().includes('cliente')
      );
      setBeneficiarios(filteredBeneficiarios);
    } catch (error) {
      console.error('Error al cargar beneficiarios:', error);
      showError('Error al cargar beneficiarios');
    }
  };

  // Cargar cursos
  const loadCursos = async (searchText) => {
    try {
      const response = await axios.get(`http://localhost:3000/api/cursos?search=${searchText}`);
      setCursos(response.data);
    } catch (error) {
      console.error('Error al cargar cursos:', error);
      showError('Error al cargar cursos');
    }
  };

  // Cargar información del cliente
  const loadClienteInfo = async (beneficiarioId) => {
    try {
      const response = await axios.get(`http://localhost:3000/api/beneficiarios/${beneficiarioId}`);
      setClienteInfo(response.data);
    } catch (error) {
      console.error('Error al cargar información del cliente:', error);
    }
  };

  // Efecto para cargar datos iniciales
  useEffect(() => {
    if (open) {
      loadBeneficiarios();
      loadCursos('');
    }
  }, [open]);

  // Efecto para limpiar el formulario cuando se cierra el diálogo
  useEffect(() => {
    if (!open) {
      setFormData({
        beneficiarioId: null,
        cursoId: null,
        numero_de_clases: '',
        ciclo: 1,
        tipo: 'curso',
        fechaInicio: null,
        fechaFin: null,
        estado: 'vigente',
        valor_total: 0,
        motivoAnulacion: null
      });
      setBeneficiarios([]);
      setCursos([]);
      setClienteInfo(null);
      setValorPorHora(0);
    }
  }, [open]);

  // Manejar cambio de beneficiario
  const handleBeneficiarioChange = (event, newValue) => {
    if (newValue) {
      setFormData(prev => ({ ...prev, beneficiarioId: newValue._id }));
      loadClienteInfo(newValue.clienteId);
    } else {
      setFormData(prev => ({ ...prev, beneficiarioId: null }));
      setClienteInfo(null);
    }
  };

  // Manejar cambio de curso
  const handleCursoChange = (event, newValue) => {
    if (newValue) {
      setFormData(prev => ({ ...prev, cursoId: newValue._id }));
      setValorPorHora(newValue.valor_por_hora || 0);
      calcularValorTotal(formData.numero_de_clases, newValue.valor_por_hora);
    } else {
      setFormData(prev => ({ ...prev, cursoId: null }));
      setValorPorHora(0);
      calcularValorTotal(formData.numero_de_clases, 0);
    }
  };

  // Manejar cambio de número de clases
  const handleNumeroClasesChange = (event) => {
    const value = event.target.value;
    if (value === '' || (Number(value) >= 1 && Number(value) <= 720)) {
      setFormData(prev => ({ ...prev, numero_de_clases: value }));
      calcularValorTotal(value, valorPorHora);
    }
  };

  // Calcular valor total
  const calcularValorTotal = (numClases, valorHora) => {
    const total = Number(numClases) * Number(valorHora);
    setFormData(prev => ({ ...prev, valor_total: total }));
  };

  // Manejar cambio de fecha de inicio
  const handleFechaInicioChange = (newValue) => {
    setFormData(prev => ({
      ...prev,
      fechaInicio: newValue,
      fechaFin: addMonths(newValue, 1)
    }));
  };

  // Validar formulario con reglas de negocio
  const validateForm = () => {
    if (!formData.beneficiarioId) {
      showError('Debe seleccionar un beneficiario');
      return false;
    }
    if (!formData.cursoId) {
      showError('Debe seleccionar un curso');
      return false;
    }
    if (!formData.numero_de_clases || formData.numero_de_clases < 1 || formData.numero_de_clases > 720) {
      showError('Debe ingresar un número válido de clases (1-720)');
      return false;
    }
    if (!formData.fechaInicio) {
      showError('Debe seleccionar una fecha de inicio');
      return false;
    }
    return true;
  };

  // Manejar envío del formulario
  const handleSubmit = async () => {
    if (!validateForm()) return;

    // Generar datos para enviar al backend
    const dataToSend = {
      ...formData,
      codigoVenta: formData.codigoVenta && formData.codigoVenta.trim() !== '' ? formData.codigoVenta : `AUTO-${Date.now()}`,
      consecutivo: formData.consecutivo && formData.consecutivo.trim() !== '' ? Number(formData.consecutivo) : Date.now(), // Convertir a número
      valor_total: formData.numero_de_clases * valorPorHora, // Cálculo automático
      fechaFin: addMonths(formData.fechaInicio, 1) // Fecha fin calculada automáticamente
    };

    console.log('Datos enviados al servidor:', dataToSend);

    try {
      const response = await axios.post('http://localhost:3000/api/ventas', dataToSend);
      console.log('Respuesta del servidor:', response.data);
      showSuccess('Venta creada exitosamente');
      onSubmit(response.data);
      onClose();
    } catch (error) {
      console.error('Error al crear la venta:', error);
      if (error.response) {
        console.error('Detalles del error:', error.response.data);
      }
      showError('Error al crear la venta: ' + error.message);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>Crear Venta de Curso</DialogTitle>
      <DialogContent>
        <Box sx={{ mt: 2 }}>
          {alert.show && (
            <Alert severity={alert.severity} sx={{ mb: 2 }}>
              {alert.message}
            </Alert>
          )}
          <Grid container spacing={2}>
            <Grid item xs={12} md={6}>
              <Autocomplete
                options={beneficiarios}
                getOptionLabel={(option) => `${option.nombre} ${option.apellido}`}
                onChange={handleBeneficiarioChange}
                onInputChange={(event, value) => loadBeneficiarios(value)}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="Nombre Beneficiario"
                    size="small"
                    fullWidth
                  />
                )}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                label="Nombre Cliente"
                value={clienteInfo ? `${clienteInfo.nombre} ${clienteInfo.apellido}` : ''}
                size="small"
                fullWidth
                disabled
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <Autocomplete
                options={cursos}
                getOptionLabel={(option) => option.nombre}
                onChange={handleCursoChange}
                onInputChange={(event, value) => loadCursos(value)}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="Curso"
                    size="small"
                    fullWidth
                  />
                )}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                label="Valor por Hora"
                value={valorPorHora}
                size="small"
                fullWidth
                disabled
                InputProps={{
                  startAdornment: <InputAdornment position="start">$</InputAdornment>,
                }}
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <FormControl fullWidth size="small">
                <InputLabel>Ciclo</InputLabel>
                <Select
                  value={formData.ciclo}
                  label="Ciclo"
                  onChange={(e) => setFormData(prev => ({ ...prev, ciclo: e.target.value }))}
                >
                  {[...Array(50)].map((_, i) => (
                    <MenuItem key={i + 1} value={i + 1}>{i + 1}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={4}>
              <TextField
                label="Número de Clases"
                value={formData.numero_de_clases}
                onChange={handleNumeroClasesChange}
                type="number"
                inputProps={{ min: 1, max: 720 }}
                size="small"
                fullWidth
                helperText="Máximo 720 clases (horas máximas por mes)"
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <TextField
                label="Valor Total"
                value={formData.valor_total}
                size="small"
                fullWidth
                disabled
                InputProps={{
                  startAdornment: <InputAdornment position="start">$</InputAdornment>,
                }}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={es}>
                <DatePicker
                  label="Fecha Inicio"
                  value={formData.fechaInicio}
                  onChange={handleFechaInicioChange}
                  renderInput={(params) => (
                    <TextField {...params} size="small" fullWidth />
                  )}
                />
              </LocalizationProvider>
            </Grid>
            <Grid item xs={12} md={6}>
              <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={es}>
                <DatePicker
                  label="Fecha Fin"
                  value={formData.fechaFin}
                  disabled
                  renderInput={(params) => (
                    <TextField {...params} size="small" fullWidth />
                  )}
                />
              </LocalizationProvider>
            </Grid>
          </Grid>
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancelar</Button>
        <Button onClick={handleSubmit} variant="contained" color="primary">
          Crear Venta
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default VentaCursosFormNew;