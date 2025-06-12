import React, { useState, useEffect } from 'react';
import { GenericList } from '../../../shared/components/GenericList';
import { DetailModal } from '../../../shared/components/DetailModal';
import { FormModal } from '../../../shared/components/FormModal';
import { StatusButton } from '../../../shared/components/StatusButton';

const VentaCursos = () => {
  // Datos para los selectores
  const clientes = [
    { id: 'C001', nombre: 'Juan Pérez' },
    { id: 'C002', nombre: 'María Gómez' },
    { id: 'C003', nombre: 'Pedro López' },
    { id: 'C004', nombre: 'Laura Martínez' }
  ];

  const beneficiarios = [
    { id: 'E001', nombre: 'Camilo Guilizzoni' },
    { id: 'E002', nombre: 'Carlos Rodríguez' },
    { id: 'E003', nombre: 'Ana Pérez' },
    { id: 'E004', nombre: 'Diego Martínez' }
  ];

  // Datos de cursos con sus valores por hora
  const cursosDisponibles = [
    { id: 'GC001', nombre: 'Guitarra Clásica Nivel 1', valorHora: 250000 },
    { id: 'PI002', nombre: 'Piano Intermedio', valorHora: 300000 },
    { id: 'VI003', nombre: 'Violín Avanzado', valorHora: 350000 },
    { id: 'CA004', nombre: 'Canto Básico', valorHora: 200000 }
  ];

  const ciclos = [
    { id: '4', nombre: '4' },
    { id: '8', nombre: '8' },
    { id: '12', nombre: '12' }
  ];

  const [cursos, setCursos] = useState([
    { 
      id: 'M001',
      cliente: 'Juan Pérez',
      beneficiario: 'Camilo Guilizzoni',
      curso: 'Guitarra Clásica Nivel 1',
      ciclo: '4',
      clases: 4,
      valor: 250000,
      valorTotal: 1000000,
      pagado: true
    },
    { 
      id: 'M002',
      cliente: 'María Gómez',
      beneficiario: 'Carlos Rodríguez',
      curso: 'Piano Intermedio',
      ciclo: '8',
      clases: 8,
      valor: 300000,
      valorTotal: 2400000,
      pagado: false
    },
    { 
      id: 'M003',
      cliente: 'Pedro López',
      beneficiario: 'Ana Pérez',
      curso: 'Violín Avanzado',
      ciclo: '12',
      clases: 12,
      valor: 350000,
      valorTotal: 4200000,
      pagado: true
    },
    { 
      id: 'M004',
      cliente: 'Laura Martínez',
      beneficiario: 'Diego Martínez',
      curso: 'Canto Básico',
      ciclo: '4',
      clases: 4,
      valor: 200000,
      valorTotal: 800000,
      pagado: false
    }
  ]);

  const [selectedCurso, setSelectedCurso] = useState(null);
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [formModalOpen, setFormModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [formValues, setFormValues] = useState({});

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

  const handleDelete = (curso) => {
    const confirmDelete = window.confirm(`¿Está seguro de eliminar el curso de ${curso.curso}?`);
    if (confirmDelete) {
      setCursos(prev => prev.filter(item => item.id !== curso.id));
    }
  };

  const handleView = (curso) => {
    setSelectedCurso(curso);
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

  const handleSubmit = (formData) => {
    if (isEditing) {
      setCursos(prev => prev.map(item => {
        if (item.id === selectedCurso.id) {
          const newPagado = formData.pagado;
          return {
            ...item,
            pagado: newPagado
          };
        }
        return item;
      }));
    } else {
      const newId = `M${String(Math.floor(Math.random() * 1000)).padStart(3, '0')}`;      
      formData.clases = parseInt(formData.clases);
      const valorTotal = formData.valor * formData.clases;
      setCursos(prev => [...prev, { ...formData, id: newId, valorTotal }]);
    }
    handleCloseForm();
  };

  const handleToggleStatus = (cursoId) => {
    setCursos(prev => prev.map(item => {
      if (item.id === cursoId) {
        const newPagado = !item.pagado;
        return { 
          ...item, 
          pagado: newPagado
        };
      }
      return item;
    }));
  };

  const columns = [
    { id: 'id', label: 'ID' },
    { id: 'cliente', label: 'Cliente' },
    { id: 'beneficiario', label: 'Beneficiario' },
    { id: 'curso', label: 'Curso' },
    { id: 'ciclo', label: 'Ciclo' },
    { id: 'clases', label: 'Clases' },
    { id: 'valorTotal', label: 'Valor Total', render: (value) => `$${value.toLocaleString()}` },
    { 
      id: 'pagado', 
      label: 'Estado de Pago',
      render: (value, row) => (
        <StatusButton 
          active={value} 
          activeText="PAGADO"
          inactiveText="DEBE"
          onClick={() => handleToggleStatus(row.id)}
          color={value ? 'success' : 'error'}
        />
      )
    }
  ];

  const detailFields = [
    { id: 'cliente', label: 'Cliente' },
    { id: 'beneficiario', label: 'Beneficiario' },
    { id: 'curso', label: 'Curso' },
    { id: 'ciclo', label: 'Ciclo' },
    { id: 'clases', label: 'Número de Clases' },
    { id: 'valor', label: 'Valor por Hora', render: (value) => `$${value.toLocaleString()}` },
    { id: 'valorTotal', label: 'Valor Total', render: (value) => `$${value.toLocaleString()}` },
    { id: 'pagado', label: 'Estado de Pago', render: (value) => <StatusButton active={value} activeText="PAGADO" inactiveText="DEBE" color={value ? 'success' : 'error'} /> }
  ];

  // Función para manejar el cambio de curso seleccionado
  const handleCursoChange = (cursoNombre, formData, setFieldValue) => {
    const cursoSeleccionado = cursosDisponibles.find(c => c.nombre === cursoNombre);
    if (cursoSeleccionado) {
      setFieldValue('valor', cursoSeleccionado.valorHora);
      
      // Calcular valor total si ya hay clases definidas
      if (formData.clases) {
        const valorTotal = cursoSeleccionado.valorHora * parseInt(formData.clases);
        setFieldValue('valorTotal', valorTotal);
      }
    }
  };

  // Función para manejar el cambio en el número de clases
  const handleClasesChange = (clasesValue, formData, setFieldValue) => {
    if (formData.valor && clasesValue) {
      const valorTotal = parseInt(formData.valor) * parseInt(clasesValue);
      setFieldValue('valorTotal', valorTotal);
    }
  };

  const formFields = [
    { 
      id: 'cliente', 
      label: 'Cliente', 
      type: 'select', 
      required: true,
      options: clientes.map(c => ({ value: c.nombre, label: c.nombre }))
    },
    { 
      id: 'beneficiario', 
      label: 'Beneficiario', 
      type: 'select', 
      required: true,
      options: beneficiarios.map(e => ({ value: e.nombre, label: e.nombre }))
    },
    { 
      id: 'curso', 
      label: 'Curso', 
      type: 'select', 
      required: true,
      options: cursosDisponibles.map(c => ({ value: c.nombre, label: c.nombre })),
      onChange: handleCursoChange
    },
    { 
      id: 'ciclo', 
      label: 'Ciclo', 
      type: 'select', 
      required: true,
      options: ciclos.map(c => ({ value: c.id, label: c.id }))
    },
    { 
      id: 'clases', 
      label: 'Número de Clases', 
      type: 'number', 
      required: true,
      onChange: handleClasesChange
    },
    { 
      id: 'valor', 
      label: 'Valor por Hora', 
      type: 'number', 
      required: true,
      disabled: true
    },
    { 
      id: 'valorTotal', 
      label: 'Valor Total', 
      type: 'number', 
      required: true,
      disabled: true
    },
    { id: 'pagado', label: 'Estado de Pago', type: 'switch', defaultValue: false }
  ];

  return (
    <>
      <GenericList
        data={cursos}
        columns={columns}
        onEdit={handleEdit}
        onDelete={handleDelete}
        onView={handleView}
        onCreate={handleCreate}
        title="Venta de Cursos"
      />
      
      <DetailModal
        title={`Detalle del Curso: ${selectedCurso?.curso}`}
        data={selectedCurso}
        fields={detailFields}
        open={detailModalOpen}
        onClose={handleCloseDetail}
      />

      <FormModal
        title={isEditing ? 'Editar Estado de Pago' : 'Crear Nuevo Curso'}
        fields={isEditing ? [{ id: 'pagado', label: 'Estado de Pago', type: 'switch', defaultValue: false }] : formFields}
        initialData={selectedCurso}
        open={formModalOpen}
        onClose={handleCloseForm}
        onSubmit={handleSubmit}
      />
    </>
  );
};

export default VentaCursos;