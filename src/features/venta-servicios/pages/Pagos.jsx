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
    id: 'venta', // CAMBIO: De 'ventas' a 'venta' para coincidir con el modelo
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
    id: 'descripcion', // CAMBIO: De 'comprobante' a 'descripcion'
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

  // Columnas actualizadas para mostrar la información correcta
  const columns = [
    { 
      id: 'beneficiario', 
      label: 'Beneficiario',
      render: (value, row) => {
        console.log('=== DEBUG BENEFICIARIO COLUMN ===');
        console.log('Full row data:', JSON.stringify(row, null, 2));
        console.log('row.venta exists:', !!row.venta);
        console.log('row.venta?.beneficiario exists:', !!row.venta?.beneficiario);
        
        // Revisar diferentes posibles estructuras
        let beneficiario = null;
        
        // Opción 1: row.venta.beneficiario (como esperamos)
        if (row.venta?.beneficiario) {
          beneficiario = row.venta.beneficiario;
          console.log('Found beneficiario in row.venta.beneficiario:', beneficiario);
        }
        // Opción 2: Directamente en row.beneficiario
        else if (row.beneficiario) {
          beneficiario = row.beneficiario;
          console.log('Found beneficiario in row.beneficiario:', beneficiario);
        }
        // Opción 3: En row.venta pero sin populate
        else if (row.venta && typeof row.venta === 'string') {
          console.log('Venta is just an ID string:', row.venta);
          return 'Venta no poblada';
        }
        
        if (beneficiario) {
          const nombre = beneficiario.nombre || '';
          const apellido = beneficiario.apellido || '';
          const nombreCompleto = `${nombre} ${apellido}`.trim();
          console.log('Final beneficiario name:', nombreCompleto);
          return nombreCompleto || 'Sin nombre';
        }
        
        console.log('No beneficiario found, returning No disponible');
        return 'No disponible';
      }
    },
    { 
      id: 'valor_total', 
      label: 'Valor Total', 
      render: (value) => `$${value ? value.toLocaleString() : '0'}` 
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
          'cancelado': '⚫ Cancelado'
        };
        return estados[value] || value || 'No disponible';
      }
    }
  ];

  // Campos de detalle actualizados
  const detailFields = [
    { 
      id: 'historial', 
      render: (value, data) => {
        console.log('=== RENDERING DETAIL ===');
        console.log('Data received:', JSON.stringify(data, null, 2));
        
        // Extraer información del beneficiario - CORREGIDO
        const beneficiario = data.venta?.beneficiario;
        const beneficiarioNombre = beneficiario ? 
          `${beneficiario.nombre || ''} ${beneficiario.apellido || ''}`.trim() : 'No disponible';
        
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
            
            {/* Información del beneficiario - CORREGIDO */}
            <Grid container spacing={2} sx={{ mb: 3 }}>
              <Grid item xs={12}>
                <Box sx={{ p: 2, backgroundColor: '#f9f9f9', borderRadius: '8px' }}>
                  <Typography variant="subtitle2" sx={{ color: '#666', mb: 1 }}>Beneficiario:</Typography>
                  <Typography variant="body1" sx={{ fontWeight: 500 }}>{beneficiarioNombre}</Typography>
                  
                  {/* CORREGIDO: Usar campos correctos del beneficiario */}
                  {beneficiario?.telefono && (
                    <Typography variant="body2" sx={{ color: '#666', mt: 1 }}>
                      Teléfono: {beneficiario.telefono}
                    </Typography>
                  )}
                  {beneficiario?.tipo_de_documento && beneficiario?.numero_de_documento && (
                    <Typography variant="body2" sx={{ color: '#666' }}>
                      Documento: {beneficiario.tipo_de_documento} {beneficiario.numero_de_documento}
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
            
            {/* Información de la venta - CORREGIDO */}
            {data.venta && (
              <Grid container spacing={2} sx={{ mb: 3 }}>
                <Grid item xs={12}>
                  <Box sx={{ p: 2, backgroundColor: '#e3f2fd', borderRadius: '8px' }}>
                    <Typography variant="subtitle2" sx={{ color: '#666', mb: 1 }}>Información de la Venta:</Typography>
                    <Typography variant="body2" sx={{ color: '#666' }}>
                      ID: {data.venta._id}
                    </Typography>
                    {data.venta.codigoVenta && (
                      <Typography variant="body2" sx={{ color: '#666' }}>
                        Código: {data.venta.codigoVenta}
                      </Typography>
                    )}
                    <Typography variant="body2" sx={{ color: '#666' }}>
                      Tipo: {data.venta.tipo || 'No disponible'}
                    </Typography>
                    <Typography variant="body2" sx={{ color: '#666' }}>
                      Estado: {data.venta.estado || 'No disponible'}
                    </Typography>
                    {data.venta.fechaInicio && (
                      <Typography variant="body2" sx={{ color: '#666' }}>
                        Fecha Inicio: {new Date(data.venta.fechaInicio).toLocaleDateString('es-CO')}
                      </Typography>
                    )}
                    {data.venta.fechaFin && (
                      <Typography variant="body2" sx={{ color: '#666' }}>
                        Fecha Fin: {new Date(data.venta.fechaFin).toLocaleDateString('es-CO')}
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
                    Valor Total: ${data.valor_total ? data.valor_total.toLocaleString() : '0'}
                  </Typography>
                </Box>
              </Grid>
            </Grid>
          </Box>
        );
      }
    }
  ];

  const handleExportExcel = () => {
    try {
      console.log('=== EXPORTING TO EXCEL ===');
      console.log('Payments data:', payments);
      
      const workbook = XLSX.utils.book_new();

      // Preparar los datos para Excel - CORREGIDO
      const worksheetData = [
        ['Beneficiario', 'Documento', 'Teléfono', 'Valor Total', 'Fecha Pago', 'Método Pago', 'Estado', 'Descripción', 'Número Transacción'],
        ...payments.map(payment => {
          const beneficiario = payment.venta?.beneficiario;
          const beneficiarioNombre = beneficiario ? 
            `${beneficiario.nombre || ''} ${beneficiario.apellido || ''}`.trim() : 'No disponible';
          
          const documento = beneficiario?.tipo_de_documento && beneficiario?.numero_de_documento 
            ? `${beneficiario.tipo_de_documento} ${beneficiario.numero_de_documento}` 
            : 'No disponible';
          
          return [
            beneficiarioNombre,
            documento,
            beneficiario?.telefono || 'No disponible',
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

  // Fetch pagos from API
  const fetchPagos = async () => {
    try {
      console.log('=== FETCHING PAGOS ===');
      const response = await axios.get('http://localhost:3000/api/pagos');
      
      console.log('=== API RESPONSE DETAILED ===');
      console.log('Status:', response.status);
      console.log('Full response:', JSON.stringify(response.data, null, 2));
      
      // Verificar si la respuesta tiene el formato correcto
      let pagosList = [];
      if (response.data) {
        if (response.data.success && Array.isArray(response.data.data)) {
          pagosList = response.data.data;
        } else if (Array.isArray(response.data)) {
          pagosList = response.data;
        }
      }
      
      console.log('=== PROCESSED PAYMENTS LIST ===');
      console.log('Payments count:', pagosList.length);
      pagosList.forEach((payment, index) => {
        console.log(`Payment ${index}:`, JSON.stringify(payment, null, 2));
        console.log(`Payment ${index} venta:`, payment.venta);
        console.log(`Payment ${index} venta type:`, typeof payment.venta);
        if (payment.venta && typeof payment.venta === 'object') {
          console.log(`Payment ${index} venta.beneficiario:`, payment.venta.beneficiario);
        }
      });
      
      setPayments(pagosList);
      
    } catch (error) {
      console.error('=== FETCH ERROR ===');
      console.error('Error:', error);
      setPayments([]);
      setAlert({
        open: true,
        message: `Error al cargar los pagos: ${error.message}`
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
    
    const beneficiario = payment.venta?.beneficiario;
    const beneficiarioNombre = beneficiario ? 
      `${beneficiario.nombre || ''} ${beneficiario.apellido || ''}`.trim() : 'este pago';
    
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
        venta: formData.venta.trim(),
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