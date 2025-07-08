import React, { useState } from 'react';
import { GenericList } from '../../../shared/components/GenericList';
import { DetailModal } from '../../../shared/components/DetailModal';
import { StatusButton } from '../../../shared/components/StatusButton';
import { useVentaCursos } from '../context/VentaCursosContext';
import { useAlertVentas } from '../context/AlertVentasContext';
import VentaCursosFormNew from '../components/VentaCursosFormNew';
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, TextField, IconButton } from '@mui/material';
import { Cancel as CancelIcon, Close as CloseIcon } from '@mui/icons-material';

const VentaCursos = () => {
  const { ventas, loading, error, formatVentaParaTabla, refreshVentas, anularVenta, deleteVenta } = useVentaCursos();
  const { showSuccess, showError } = useAlertVentas();

  const [selectedCurso, setSelectedCurso] = useState(null);
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [formModalOpen, setFormModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [formValues, setFormValues] = useState({});
  const [anularModalOpen, setAnularModalOpen] = useState(false);
  const [motivoAnulacion, setMotivoAnulacion] = useState('');

  const handleCreate = () => {
    setIsEditing(false);
    setSelectedCurso(null);
    setFormValues({});
    setFormModalOpen(true);
  };

  const handleEdit = (curso) => {
    setIsEditing(true);
    setSelectedCurso(curso);
    setFormModalOpen(true);
  };

  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [ventaToDelete, setVentaToDelete] = useState(null);

  const handleDelete = (curso) => {
    const ventaOriginal = ventas.find(v => v.codigoVenta === curso.id);
    if (!ventaOriginal) return;
    setVentaToDelete(ventaOriginal);
    setDeleteModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    try {
      const success = await deleteVenta(ventaToDelete._id);
      if (success) {
        showSuccess('Venta eliminada exitosamente');
        setDeleteModalOpen(false);
        setVentaToDelete(null);
      }
    } catch (error) {
      showError('Error al eliminar la venta: ' + error.message);
    }
  };

  const handleCloseDelete = () => {
    setDeleteModalOpen(false);
    setVentaToDelete(null);
  };

  const handleView = (curso) => {
    // Buscar la venta original que corresponde al curso formateado
    const ventaOriginal = ventas.find(v => v.codigoVenta === curso.id);
    setSelectedCurso(ventaOriginal);
    setDetailModalOpen(true);
  };

  const handleCloseDetail = () => {
    setDetailModalOpen(false);
    setSelectedCurso(null);
  };

  const handleCloseForm = () => {
    setFormModalOpen(false);
    setSelectedCurso(null);
    setIsEditing(false);
    setFormValues({});
  };

  const handleSubmit = async (formData) => {
    try {
      await refreshVentas();
      showSuccess('Venta creada exitosamente');
      handleCloseForm();
    } catch (error) {
      showError('Error al crear la venta: ' + error.message);
    }
  };

  const handleAnular = (curso) => {
    const ventaOriginal = ventas.find(v => v.codigoVenta === curso.id);
    setSelectedCurso(ventaOriginal);
    setAnularModalOpen(true);
  };

  const handleConfirmAnular = async () => {
    if (!motivoAnulacion.trim()) {
      showError('El motivo de anulación es obligatorio');
      return;
    }

    try {
      const success = await anularVenta(selectedCurso._id, motivoAnulacion);
      if (success) {
        showSuccess('Venta anulada exitosamente');
        setAnularModalOpen(false);
        setMotivoAnulacion('');
        setSelectedCurso(null);
      }
    } catch (error) {
      showError('Error al anular la venta: ' + error.message);
    }
  };

  const handleCloseAnular = () => {
    setAnularModalOpen(false);
    setMotivoAnulacion('');
    setSelectedCurso(null);
  };

  const columns = [
    { id: 'id', label: 'ID' },
    { id: 'beneficiario', label: 'Beneficiario' },
    { id: 'cliente', label: 'Cliente' },
    { id: 'curso', label: 'Curso' },
    { id: 'ciclo', label: 'Ciclo' },
    { id: 'clases', label: 'Clases' },
    { id: 'valorTotal', label: 'Valor Total', render: (value) => `$${value.toLocaleString()}` },
    { 
      id: 'estado', 
      label: 'Estado',
      render: (value, row) => {
        const isVencida = (fechaFin) => {
          const fechaFinDate = new Date(fechaFin);
          const fechaActual = new Date();
          return fechaActual > fechaFinDate;
        };

        let estado = value;
        const venta = ventas.find(v => v.codigoVenta === row.id);
        
        if (venta && estado === 'vigente' && isVencida(venta.fechaFin)) {
          estado = 'vencida';
        }

        return (
          <StatusButton 
            status={estado}
          />
        );
      }
    }
  ];

  const detailFields = [
    { id: '_id', label: 'ID Interno' },
    { id: 'consecutivo', label: 'Consecutivo' },
    { id: 'codigoVenta', label: 'Código de Venta' },
    { 
      id: 'beneficiarioId', 
      label: 'Beneficiario', 
      render: (value) => value && value.nombre && value.apellido ? `${value.nombre} ${value.apellido}` : 'No especificado'
    },
    { 
      id: 'cursoId', 
      label: 'Curso', 
      render: (value) => value && value.nombre ? value.nombre : 'No especificado'
    },
    { id: 'numero_de_clases', label: 'Número de Clases' },
    { id: 'ciclo', label: 'Ciclo' },
    { id: 'tipo', label: 'Tipo' },
    { 
      id: 'fechaInicio', 
      label: 'Fecha de Inicio', 
      render: (value) => value ? new Date(value).toLocaleDateString() : 'No especificado'
    },
    { 
      id: 'fechaFin', 
      label: 'Fecha de Fin', 
      render: (value) => value ? new Date(value).toLocaleDateString() : 'No especificado'
    },
    { 
      id: 'estado', 
      label: 'Estado', 
      render: (value) => {
        const isVencida = (fechaFin) => {
          const fechaFinDate = new Date(fechaFin);
          const fechaActual = new Date();
          return fechaActual > fechaFinDate;
        };

        let estado = value;
        const venta = ventas.find(v => v.codigoVenta === selectedCurso?.id);
        
        if (venta && estado === 'vigente' && isVencida(venta.fechaFin)) {
          estado = 'vencida';
        }

        return (
          <StatusButton 
            status={estado}
          />
        );
      }
    },
    {
      id: 'motivoAnulacion',
      label: 'Motivo de Anulación',
      render: (value, row) => value || 'No especificado',
      condition: (row) => row.estado?.toLowerCase() === 'anulada'
    },
    { 
      id: 'valor_total', 
      label: 'Valor Total', 
      render: (value) => value ? `$${value.toLocaleString()}` : '$0'
    },
    { 
      id: 'createdAt', 
      label: 'Fecha de Creación', 
      render: (value) => value ? new Date(value).toLocaleDateString() : 'No especificado'
    },
    { 
      id: 'updatedAt', 
      label: 'Última Actualización', 
      render: (value) => value ? new Date(value).toLocaleDateString() : 'No especificado'
    }
  ];

  if (loading) return <div>Cargando...</div>;
  if (error) return <div>Error: {error}</div>;

  console.log('Ventas recibidas en el componente:', ventas);
  const ventasFormateadas = ventas.map(formatVentaParaTabla);
  console.log('Ventas formateadas para la tabla:', ventasFormateadas);

  // Filtrar solo las ventas cuyo ID empieza por "CU"
  const ventasCursosCU = ventasFormateadas.filter(v => v.id && v.id.startsWith('CU'));

  return (
    <>
      <GenericList
        data={ventasCursosCU}
        columns={columns}
        onView={handleView}
        onDelete={handleDelete}
        onCreate={handleCreate}
        onCancel={handleAnular}
        title="Venta de Cursos"
        showViewAction
        showDeleteAction
        showCreateButton
        moduleType="venta-cursos"
        actions={[
          { icon: <CloseIcon color="error" />, onClick: handleAnular, tooltip: 'Anular Venta' }
        ]}
      />
      
      <DetailModal
        title={`Detalle de la Venta: ${selectedCurso?.id || ''}`}
        data={selectedCurso}
        fields={detailFields}
        open={detailModalOpen}
        onClose={handleCloseDetail}
      />

      <VentaCursosFormNew
        open={formModalOpen}
        onClose={handleCloseForm}
        onSubmit={handleSubmit}
      />

      <Dialog open={anularModalOpen} onClose={handleCloseAnular}>
        <DialogTitle>Anular Venta</DialogTitle>
        <DialogContent>
          <p>¿Está seguro que desea anular esta venta?</p>
          <TextField
            autoFocus
            margin="dense"
            label="Motivo de Anulación"
            type="text"
            fullWidth
            required
            value={motivoAnulacion}
            onChange={(e) => setMotivoAnulacion(e.target.value)}
            error={!motivoAnulacion.trim()}
            helperText={!motivoAnulacion.trim() ? 'El motivo es obligatorio' : ''}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseAnular}>Cancelar</Button>
          <Button onClick={handleConfirmAnular} color="error" variant="contained">
            Anular Venta
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={deleteModalOpen} onClose={handleCloseDelete}>
        <DialogTitle>Eliminar Venta</DialogTitle>
        <DialogContent>
          <p>¿Está seguro que desea eliminar esta venta? No podrá recuperarla, esto puede afectar el consecutivo.</p>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDelete}>Cancelar</Button>
          <Button onClick={handleConfirmDelete} color="error" variant="contained">
            Eliminar Venta
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default VentaCursos;