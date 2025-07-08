import { useState, useEffect } from 'react';
import axios from 'axios';
import { GenericList } from '../../../shared/components/GenericList';
import { DetailModal } from '../../../shared/components/DetailModal';
import { FormModal } from '../../../shared/components/FormModal';
import { StatusButton } from '../../../shared/components/StatusButton';
import { PictureAsPdf as PdfIcon } from '@mui/icons-material';
import { Box, Typography, Grid } from '@mui/material';
import * as XLSX from 'xlsx';
import { SuccessAlert } from '../../../shared/components/SuccessAlert';

// Form fields configuration
const getFormFields = () => [
  { 
    id: 'ventas',  // Actualizado de 'venta' a 'ventas'
    label: 'ID de Venta *',
    type: 'text',
    required: true,
    placeholder: 'Ingrese el ID de la venta'
  },
  { 
    id: 'fechaPago',
    label: 'Fecha de Pago *', 
    type: 'date',
    required: true
  },
  {
    id: 'metodoPago',
    label: 'Método de Pago *',
    type: 'select',
    options: [
      { value: 'Tarjeta', label: 'Tarjeta' },
      { value: 'Transferencia', label: 'Transferencia' },
      { value: 'Efectivo', label: 'Efectivo' },
      { value: 'PSE', label: 'PSE' },
      { value: 'Nequi', label: 'Nequi' },
      { value: 'Daviplata', label: 'Daviplata' }
    ],
    required: true
  },
  { 
    id: 'valor_total',
    label: 'Valor Total *', 
    type: 'number',
    required: true,
    placeholder: 'Ingrese el valor total del pago'
  },
  { 
    id: 'descripcion',
    label: 'Descripción', 
    type: 'text',
    required: false,
    placeholder: 'Ingrese una descripción del pago (opcional)'
  },
  { 
    id: 'numeroTransaccion',
    label: 'Número de Transacción',
    type: 'text',
    required: false,
    placeholder: 'Ingrese el número de transacción (opcional)'
  },
  { 
    id: 'estado',
    label: 'Estado',
    type: 'select',
    options: [
      { value: 'pendiente', label: 'Pendiente' },
      { value: 'completado', label: 'Completado' },
      { value: 'fallido', label: 'Fallido' },
      { value: 'cancelado', label: 'Cancelado' }
    ],
    defaultValue: 'completado'
  }
];

// Función auxiliar CORREGIDA para obtener información del beneficiario
const getBeneficiarioInfo = (payment) => {
  console.log('=== getBeneficiarioInfo ===');
  console.log('Payment structure:', JSON.stringify(payment, null, 2));
  
  let beneficiario = null;
  
  // Actualizado para usar el campo correcto de la respuesta
  if (payment.ventas?.beneficiario && typeof payment.ventas.beneficiario === 'object') {
    const bene = payment.ventas.beneficiario;
    beneficiario = {
      nombre: bene.nombre || '',
      apellido: bene.apellido || '',
      documento: bene.numero_de_documento || 'No disponible',
      telefono: bene.telefono || 'No disponible'
    };
    console.log('Found beneficiario:', beneficiario);
  } else {
    console.log('No se encontró información del beneficiario en:', payment);
  }
  
  return beneficiario;
};

// Función para formatear nombre completo
const formatearNombreCompleto = (beneficiario) => {
  if (!beneficiario) return 'No disponible';
  
  let nombreCompleto = '';
  
  if (beneficiario.nombre) {
    nombreCompleto = beneficiario.nombre.trim();
    if (beneficiario.apellido && beneficiario.apellido.trim() !== '') {
      nombreCompleto += ` ${beneficiario.apellido.trim()}`;
    }
  }
  
  return nombreCompleto || 'Sin nombre';
};

const Pagos = () => {
  const [payments, setPayments] = useState([]);
  const [selectedPayment, setSelectedPayment] = useState(null);
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [formModalOpen, setFormModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [alert, setAlert] = useState({
    open: false,
    message: ''
  });

  const handleView = (payment) => {
    console.log('=== VIEWING PAYMENT ===');
    console.log('Payment data:', JSON.stringify(payment, null, 2));
    setSelectedPayment(payment);
    setDetailModalOpen(true);
  };

  const handleCloseDetail = () => {
    setDetailModalOpen(false);
    setSelectedPayment(null);
  };

  // Columnas actualizadas con la función corregida
  const columns = [
    { 
      id: 'beneficiario', 
      label: 'Beneficiario',
      render: (value, row) => {
        const beneficiario = getBeneficiarioInfo(row);
        return formatearNombreCompleto(beneficiario);
      }
    },
    { 
      id: 'valor_total', 
      label: 'Valor Total', 
      render: (value, row) => `$${(row.ventas?.valor_total || 0).toLocaleString('es-CO')}` 
    },
    { 
      id: 'fechaPago', 
      label: 'Fecha Pago',
      render: (value) => {
        if (!value) return 'No disponible';
        const date = new Date(value);
        return date.toLocaleDateString('es-CO');
      }
    },
    { id: 'metodoPago', label: 'Método' },
    { 
      id: 'estado', 
      label: 'Estado',
      render: (value) => {
        const estados = {
          'pendiente': '🟡 Pendiente',
          'completado': '🟢 Completado',
          'fallido': '🔴 Fallido',
          'cancelado': '⚫ Cancelado',
          'pagado': '🟢 Pagado',
          'anulado': '⚫ Anulado'
        };
        return estados[value] || value || 'No disponible';
      }
    }
  ];

  // Campos de detalle actualizados para la nueva estructura
  const detailFields = [
    { 
      id: 'historial', 
      render: (value, data) => {
        console.log('=== RENDERING DETAIL ===');
        console.log('Data received:', JSON.stringify(data, null, 2));
        
        // ACTUALIZADO: Usar la función auxiliar corregida
        const beneficiario = getBeneficiarioInfo(data);
        const beneficiarioNombre = formatearNombreCompleto(beneficiario);
        
        return (
          <Box sx={{ 
            width: '100%',
            display: 'flex',
            flexDirection: 'column',
            padding: 0,
            margin: 0
          }}>
            {/* Título */}
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <Typography 
                  variant="h5" 
                  sx={{ 
                    textAlign: 'center',
                    mb: 3,
                    color: '#0455a2',
                    fontWeight: 500
                  }}
                >
                  Detalle del Pago
                </Typography>
              </Grid>
            </Grid>
            
            {/* Información del beneficiario - ACTUALIZADO */}
            <Grid container spacing={2} sx={{ mb: 3 }}>
              <Grid item xs={12}>
                <Box sx={{ p: 2, backgroundColor: '#f9f9f9', borderRadius: '8px' }}>
                  <Typography variant="subtitle2" sx={{ color: '#666', mb: 1 }}>Beneficiario:</Typography>
                  <Typography variant="body1" sx={{ fontWeight: 500 }}>{beneficiarioNombre}</Typography>
                  
                  {/* ACTUALIZADO: Usar campos correctos según el modelo */}
                  {beneficiario?.telefono && (
                    <Typography variant="body2" sx={{ color: '#666', mt: 1 }}>
                      Teléfono: {beneficiario.telefono}
                    </Typography>
                  )}
                  {beneficiario?.email && (
                    <Typography variant="body2" sx={{ color: '#666' }}>
                      Email: {beneficiario.email}
                    </Typography>
                  )}
                  {beneficiario?.documento && (
                    <Typography variant="body2" sx={{ color: '#666' }}>
                      Documento: {beneficiario.documento}
                    </Typography>
                  )}
                  {/* Campos adicionales del modelo corregido */}
                  {beneficiario?.tipo_de_documento && (
                    <Typography variant="body2" sx={{ color: '#666' }}>
                      Tipo de Documento: {beneficiario.tipo_de_documento}
                    </Typography>
                  )}
                  {beneficiario?.direccion && (
                    <Typography variant="body2" sx={{ color: '#666' }}>
                      Dirección: {beneficiario.direccion}
                    </Typography>
                  )}
                  {beneficiario?.fechaDeNacimiento && (
                    <Typography variant="body2" sx={{ color: '#666' }}>
                      Fecha de Nacimiento: {new Date(beneficiario.fechaDeNacimiento).toLocaleDateString('es-CO')}
                    </Typography>
                  )}
                </Box>
              </Grid>
            </Grid>
            
            {/* Información básica del pago */}
            <Grid container spacing={2} sx={{ mb: 3 }}>
              <Grid item xs={4}>
                <Box sx={{ p: 2, backgroundColor: '#f9f9f9', borderRadius: '8px' }}>
                  <Typography variant="subtitle2" sx={{ color: '#666', mb: 1 }}>Fecha:</Typography>
                  <Typography variant="body1" sx={{ fontWeight: 500 }}>
                    {data.fechaPago ? new Date(data.fechaPago).toLocaleDateString('es-CO') : 'No disponible'}
                  </Typography>
                </Box>
              </Grid>
              <Grid item xs={4}>
                <Box sx={{ p: 2, backgroundColor: '#f9f9f9', borderRadius: '8px' }}>
                  <Typography variant="subtitle2" sx={{ color: '#666', mb: 1 }}>Método:</Typography>
                  <Typography variant="body1" sx={{ fontWeight: 500 }}>{data.metodoPago || 'No disponible'}</Typography>
                </Box>
              </Grid>
              <Grid item xs={4}>
                <Box sx={{ p: 2, backgroundColor: '#f9f9f9', borderRadius: '8px' }}>
                  <Typography variant="subtitle2" sx={{ color: '#666', mb: 1 }}>Estado:</Typography>
                  <Typography variant="body1" sx={{ fontWeight: 500 }}>
                    {data.estado ? data.estado.charAt(0).toUpperCase() + data.estado.slice(1) : 'No disponible'}
                  </Typography>
                </Box>
              </Grid>
            </Grid>
            
            {/* Información adicional */}
            {(data.descripcion || data.numeroTransaccion) && (
              <Grid container spacing={2} sx={{ mb: 3 }}>
                {data.descripcion && (
                  <Grid item xs={12}>
                    <Box sx={{ p: 2, backgroundColor: '#f9f9f9', borderRadius: '8px' }}>
                      <Typography variant="subtitle2" sx={{ color: '#666', mb: 1 }}>Descripción:</Typography>
                      <Typography variant="body1" sx={{ fontWeight: 500 }}>{data.descripcion}</Typography>
                    </Box>
                  </Grid>
                )}
                {data.numeroTransaccion && (
                  <Grid item xs={12}>
                    <Box sx={{ p: 2, backgroundColor: '#f9f9f9', borderRadius: '8px' }}>
                      <Typography variant="subtitle2" sx={{ color: '#666', mb: 1 }}>Número de Transacción:</Typography>
                      <Typography variant="body1" sx={{ fontWeight: 500 }}>{data.numeroTransaccion}</Typography>
                    </Box>
                  </Grid>
                )}
              </Grid>
            )}
            
            {/* Información de la venta - ACTUALIZADO */}
            {data.ventas && (
              <Grid container spacing={2} sx={{ mb: 3 }}>
                <Grid item xs={12}>
                  <Box sx={{ p: 2, backgroundColor: '#e3f2fd', borderRadius: '8px' }}>
                    <Typography variant="subtitle2" sx={{ color: '#666', mb: 1 }}>Información de la Venta:</Typography>
                    <Typography variant="body2" sx={{ color: '#666' }}>
                      ID: {data.ventas._id || 'No disponible'}
                    </Typography>
                    {data.ventas.codigoVenta && (
                      <Typography variant="body2" sx={{ color: '#666' }}>
                        Código: {data.ventas.codigoVenta}
                      </Typography>
                    )}
                    {data.ventas.tipo && (
                      <Typography variant="body2" sx={{ color: '#666' }}>
                        Tipo: {data.ventas.tipo}
                      </Typography>
                    )}
                    {data.ventas.estado && (
                      <Typography variant="body2" sx={{ color: '#666' }}>
                        Estado: {data.ventas.estado}
                      </Typography>
                    )}
                    {data.ventas.valor_total && (
                      <Typography variant="body2" sx={{ color: '#666' }}>
                        Valor Venta: ${data.ventas.valor_total.toLocaleString()}
                      </Typography>
                    )}
                    {data.ventas.fechaInicio && (
                      <Typography variant="body2" sx={{ color: '#666' }}>
                        Fecha Inicio: {new Date(data.ventas.fechaInicio).toLocaleDateString('es-CO')}
                      </Typography>
                    )}
                    {data.ventas.fechaFin && (
                      <Typography variant="body2" sx={{ color: '#666' }}>
                        Fecha Fin: {new Date(data.ventas.fechaFin).toLocaleDateString('es-CO')}
                      </Typography>
                    )}
                    {data.ventas.numero_de_clases && (
                      <Typography variant="body2" sx={{ color: '#666' }}>
                        Número de Clases: {data.ventas.numero_de_clases}
                      </Typography>
                    )}
                    {data.ventas.ciclo && (
                      <Typography variant="body2" sx={{ color: '#666' }}>
                        Ciclo: {data.ventas.ciclo}
                      </Typography>
                    )}
                  </Box>
                </Grid>
              </Grid>
            )}
            
            {/* Valor total */}
            <Grid container sx={{ mt: 3 }}>
              <Grid item xs={12}>
                <Box sx={{ 
                  p: 2,
                  borderTop: '1px solid #eee',
                  display: 'flex',
                  justifyContent: 'flex-start'
                }}>
                  <Typography variant="h6" sx={{ color: '#0455a2' }}>
                    Valor Total: ${data.ventas?.valor_total ? data.ventas.valor_total.toLocaleString() : '0'}
                  </Typography>
                </Box>
              </Grid>
            </Grid>
          </Box>
        );
      }
    }
  ];

  // Función para exportar Excel CORREGIDA
  const handleExportExcel = () => {
    try {
      console.log('=== EXPORTING TO EXCEL CORREGIDO ===');
      
      const workbook = XLSX.utils.book_new();

      // Preparar los datos para Excel - CORREGIDO
      const worksheetData = [
        ['Beneficiario', 'Documento', 'Tipo Documento', 'Teléfono', 'Email', 'Valor Total', 'Fecha Pago', 'Método Pago', 'Estado', 'Descripción', 'Número Transacción'],
        ...payments.map(payment => {
          const beneficiario = getBeneficiarioInfo(payment);
          const nombreCompleto = formatearNombreCompleto(beneficiario);
          
          return [
            nombreCompleto,
            beneficiario?.documento || 'No disponible',
            beneficiario?.tipo_de_documento || 'No disponible',
            beneficiario?.telefono || 'No disponible',
            beneficiario?.email || 'No disponible',
            payment.valor_total || 0,
            payment.fechaPago ? new Date(payment.fechaPago).toLocaleDateString('es-CO') : 'No disponible',
            payment.metodoPago || 'No disponible',
            payment.estado || 'No disponible',
            payment.descripcion || '',
            payment.numeroTransaccion || ''
          ];
        })
      ];

      const worksheet = XLSX.utils.aoa_to_sheet(worksheetData);
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Pagos');
      XLSX.writeFile(workbook, 'pagos.xlsx');
      
      setAlert({
        open: true,
        message: 'Archivo Excel exportado correctamente'
      });
    } catch (error) {
      console.error('Error exporting to Excel:', error);
      setAlert({
        open: true,
        message: 'Error al exportar archivo Excel'
      });
    }
  };

  const fetchPagos = async () => {
    try {
      console.log('=== FETCHING PAGOS ===');
      const response = await axios.get('http://localhost:3000/api/pagos');
      console.log('API Response:', response.data);
      
      if (response.data && response.data.success) {
        const pagosFormateados = response.data.data.map(pago => ({
          ...pago,
          valor_total: pago.ventas?.valor_total || 0, // Usar el valor_total de la venta
          valorTotal: pago.ventas?.valor_total || 0,
          porcentajePagado: pago.ventas?.valor_total ? (pago.valor_total / pago.ventas.valor_total) * 100 : 0
        }));
        
        setPayments(pagosFormateados);
        console.log('Payments formateados:', pagosFormateados);
      }
    } catch (error) {
      console.error('Error fetching pagos:', error);
      setAlert({
        open: true,
        message: 'Error al cargar los pagos'
      });
    }
  };

  useEffect(() => {
    console.log('=== COMPONENT MOUNTED ===');
    fetchPagos();
  }, []);

  const handleEdit = (payment) => {
    console.log('=== EDITING PAYMENT ===');
    console.log('Payment to edit:', JSON.stringify(payment, null, 2));
    
    setIsEditing(true);
    setSelectedPayment(payment);
    setFormModalOpen(true);
  };

  const handleDelete = async (payment) => {
    console.log('=== DELETING PAYMENT ===');
    console.log('Payment to delete:', JSON.stringify(payment, null, 2));
    
    const beneficiario = getBeneficiarioInfo(payment);
    const beneficiarioNombre = formatearNombreCompleto(beneficiario);
    
    const confirmDelete = window.confirm(`¿Está seguro de eliminar el pago de ${beneficiarioNombre}?`);
    if (confirmDelete) {
      try {
        await axios.delete(`http://localhost:3000/api/pagos/${payment._id}`);
        await fetchPagos();
        setAlert({
          open: true,
          message: 'Pago eliminado correctamente'
        });
      } catch (error) {
        console.error('Error deleting payment:', error);
        setAlert({
          open: true,
          message: error.response?.data?.message || 'Error al eliminar el pago'
        });
      }
    }
  };

  const handleSubmit = async (formData) => {
    try {
      console.log('=== FORM SUBMIT ===');
      console.log('isEditing:', isEditing);
      console.log('formData:', JSON.stringify(formData, null, 2));

      // Validar campos requeridos
      const requiredFields = ['venta', 'fechaPago', 'metodoPago', 'valor_total'];
      const missingFields = requiredFields.filter(field => {
        const value = formData[field];
        return !value || value.toString().trim() === '';
      });

      if (missingFields.length > 0) {
        setAlert({
          open: true,
          message: `Los campos ${missingFields.join(', ')} son obligatorios`
        });
        return;
      }

      // Preparar datos según el modelo del backend
      const pagoData = {
        ventas: formData.ventas.trim(),  // Actualizado de 'venta' a 'ventas'
        fechaPago: formData.fechaPago,
        metodoPago: formData.metodoPago,
        valor_total: parseFloat(formData.valor_total) || 0,
        estado: formData.estado || 'completado',
        descripcion: (formData.descripcion || '').trim(),
        numeroTransaccion: (formData.numeroTransaccion || '').trim()
      };

      console.log('Prepared payment data:', JSON.stringify(pagoData, null, 2));

      const config = {
        headers: { 'Content-Type': 'application/json' },
        timeout: 10000
      };

      if (isEditing) {
        const url = `http://localhost:3000/api/pagos/${selectedPayment._id}`;
        console.log(`Making PUT request to: ${url}`);
        await axios.put(url, pagoData, config);
        setAlert({
          open: true,
          message: 'Pago actualizado correctamente'
        });
      } else {
        const url = 'http://localhost:3000/api/pagos';
        console.log(`Making POST request to: ${url}`);
        await axios.post(url, pagoData, config);
        setAlert({
          open: true,
          message: 'Pago creado correctamente'
        });
      }

      await fetchPagos();
      handleCloseForm();

    } catch (error) {
      console.error('=== SUBMIT ERROR ===');
      console.error('Error:', error);
      
      let errorMessage = 'Error al guardar el pago';
      if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      setAlert({
        open: true,
        message: errorMessage
      });
    }
  };

  const handleToggleStatus = async (paymentId) => {
    try {
      console.log('=== TOGGLING STATUS ===');
      console.log('Payment ID:', paymentId);
      
      const payment = payments.find(p => p._id === paymentId);
      if (!payment) {
        console.error('Payment not found for ID:', paymentId);
        return;
      }

      // Determinar el siguiente estado
      const estadosOrden = ['pendiente', 'completado', 'fallido', 'cancelado'];
      const currentIndex = estadosOrden.indexOf(payment.estado);
      const nextIndex = (currentIndex + 1) % estadosOrden.length;
      const nuevoEstado = estadosOrden[nextIndex];
      
      console.log('Current status:', payment.estado);
      console.log('New status:', nuevoEstado);
      
      const url = `http://localhost:3000/api/pagos/${paymentId}`;
      const data = { estado: nuevoEstado };
      
      await axios.put(url, data);

      // Actualizar en el frontend
      setPayments(prevPayments => prevPayments.map(p => 
        p._id === paymentId ? { ...p, estado: nuevoEstado } : p
      ));

      setAlert({
        open: true,
        message: 'Estado actualizado correctamente'
      });
    } catch (error) {
      console.error('Error updating payment status:', error);
      setAlert({
        open: true,
        message: error.response?.data?.message || 'Error al actualizar el estado'
      });
    }
  };

  const handleCloseForm = () => {
    setFormModalOpen(false);
    setSelectedPayment(null);
    setIsEditing(false);
  };

  const handleCloseAlert = () => {
    setAlert({ ...alert, open: false });
  };

  console.log('=== RENDER ===');
  console.log('Payments count:', payments.length);

  return (
    <>
      <GenericList
        data={payments}
        columns={columns}
        rowKey="_id" // Asegurarse de que esta prop esté presente
        onView={handleView}
        onEdit={handleEdit}
        onDelete={handleDelete}
        onExportPdf={handleExportExcel}
        title="Gestión de Pagos"
      />
      
      <DetailModal
        title={`Detalle del Pago: ${selectedPayment?._id || 'N/A'}`}
        data={selectedPayment}
        fields={detailFields}
        open={detailModalOpen}
        onClose={handleCloseDetail}
        maxWidth="md"
        fullWidth
      />

      <FormModal
        title={isEditing ? 'Editar Pago' : 'Crear Nuevo Pago'}
        fields={getFormFields()}
        initialData={selectedPayment}
        open={formModalOpen}
        onClose={handleCloseForm}
        onSubmit={handleSubmit}
        maxWidth="md"
        fullWidth={true}
      />
      
      <SuccessAlert
        open={alert.open}
        message={alert.message}
        onClose={handleCloseAlert}
      />
    </>
  );
};

export default Pagos;