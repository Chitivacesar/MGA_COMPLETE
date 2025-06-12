import React, { useState, useEffect } from 'react';
import { GenericList } from '../../../shared/components/GenericList';
import { DetailModal } from '../../../shared/components/DetailModal';
import { FormModal } from '../../../shared/components/FormModal';
import { StatusButton } from '../../../shared/components/StatusButton';

const Beneficiarios = () => {
  const [beneficiarios, setBeneficiarios] = useState([
    { id: 1, nombre: 'Juan', apellido: 'Pérez', tipoDocumento: 'CC', numeroDocumento: '1234567890', fechaNacimiento: '2003-05-15', age: 20, direccion: 'Calle 123', telefono: '123456789', correo: 'juan.perez@email.com', acudiente: 'María López', estado: true },
    { id: 2, nombre: 'Ana', apellido: 'Gómez', tipoDocumento: 'TI', numeroDocumento: '0987654321', fechaNacimiento: '2001-08-20', age: 22, direccion: 'Avenida 456', telefono: '987654321', correo: 'ana.gomez@email.com', acudiente: 'Carlos Sánchez', estado: false },
    // Add more beneficiarios as needed
  ]);

  const [selectedBeneficiario, setSelectedBeneficiario] = useState(null);
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [formModalOpen, setFormModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  const handleCreate = () => {
    setIsEditing(false);
    setSelectedBeneficiario(null);
    setFormModalOpen(true);
  };

  const handleEdit = (beneficiario) => {
    setIsEditing(true);
    setSelectedBeneficiario(beneficiario);
    setFormModalOpen(true);
  };

  const handleDelete = (beneficiario) => {
    const confirmDelete = window.confirm(`¿Está seguro de eliminar al beneficiario ${beneficiario.nombre}?`);
    if (confirmDelete) {
      setBeneficiarios(prev => prev.filter(item => item.id !== beneficiario.id));
    }
  };

  const handleView = (beneficiario) => {
    setSelectedBeneficiario(beneficiario);
    setDetailModalOpen(true);
  };

  const handleCloseDetail = () => {
    setDetailModalOpen(false);
    setSelectedBeneficiario(null);
  };

  const handleCloseForm = () => {
    setFormModalOpen(false);
    setSelectedBeneficiario(null);
    setIsEditing(false);
  };

  const calcularEdad = (fechaNacimiento) => {
    if (!fechaNacimiento) return 0;
    const fechaNac = new Date(fechaNacimiento);
    const hoy = new Date();
    let edad = hoy.getFullYear() - fechaNac.getFullYear();
    const mes = hoy.getMonth() - fechaNac.getMonth();
    
    if (mes < 0 || (mes === 0 && hoy.getDate() < fechaNac.getDate())) {
      edad--;
    }
    
    return edad;
  };

  const handleSubmit = (formData) => {
    // Calcular la edad basada en la fecha de nacimiento
    const edadCalculada = calcularEdad(formData.fechaNacimiento);
    const datosCompletos = { ...formData, age: edadCalculada };
    
    if (isEditing) {
      setBeneficiarios(prev => prev.map(item => 
        item.id === selectedBeneficiario.id ? { ...datosCompletos, id: item.id } : item
      ));
    } else {
      const newId = Math.max(...beneficiarios.map(e => e.id), 0) + 1;
      setBeneficiarios(prev => [...prev, { ...datosCompletos, id: newId }]);
    }
    handleCloseForm();
  };

  const handleToggleStatus = (beneficiarioId) => {
    setBeneficiarios(prev => prev.map(item => 
      item.id === beneficiarioId ? { ...item, estado: !item.estado } : item
    ));
  };

  const columns = [
    { id: 'nombre', label: 'Nombre' },
    { id: 'apellido', label: 'Apellido' },
    { id: 'tipoDocumento', label: 'Tipo Documento' },
    { id: 'numeroDocumento', label: 'N° Documento' },
    { id: 'fechaNacimiento', label: 'Fecha Nacimiento' },
    { id: 'age', label: 'Edad' },
    { id: 'direccion', label: 'Dirección' },
    { id: 'telefono', label: 'Teléfono' },
    // Columnas de correo y acudiente ocultas en la tabla principal
    // Se mostrarán solo en la vista de detalles
    { 
      id: 'estado', 
      label: 'Estado',
      render: (value, row) => (
        <StatusButton 
          active={value} 
          onClick={() => handleToggleStatus(row.id)}
        />
      )
    }
  ];

  const detailFields = [
    { id: 'nombre', label: 'Nombre' },
    { id: 'apellido', label: 'Apellido' },
    { id: 'tipoDocumento', label: 'Tipo Documento' },
    { id: 'numeroDocumento', label: 'N° Documento' },
    { id: 'fechaNacimiento', label: 'Fecha Nacimiento' },
    { id: 'age', label: 'Edad' },
    { id: 'direccion', label: 'Dirección' },
    { id: 'telefono', label: 'Teléfono' },
    { id: 'correo', label: 'Correo Electrónico' },
    { id: 'acudiente', label: 'Acudiente' },
    { id: 'estado', label: 'Estado', render: (value) => <StatusButton active={value} /> }
  ];

  const formFields = [
    { id: 'nombre', label: 'Nombre', type: 'text', required: true },
    { id: 'apellido', label: 'Apellido', type: 'text', required: true },
    { 
      id: 'tipoDocumento', 
      label: 'Tipo Documento', 
      type: 'select', 
      options: [
        { value: 'CC', label: 'Cédula de Ciudadanía (CC)' },
        { value: 'TI', label: 'Tarjeta de Identidad (TI)' },
        { value: 'CE', label: 'Cédula de Extranjería (CE)' },
        { value: 'PA', label: 'Pasaporte (PA)' },
        { value: 'RC', label: 'Registro Civil (RC)' },
        { value: 'NIT', label: 'NIT' }
      ],
      required: true 
    },
    { id: 'numeroDocumento', label: 'N° Documento', type: 'text', required: true },
    { id: 'fechaNacimiento', label: 'Fecha de Nacimiento', type: 'date', required: true },
    { id: 'direccion', label: 'Dirección', type: 'text', required: true },
    { id: 'telefono', label: 'Teléfono', type: 'text', required: true },
    { id: 'correo', label: 'Correo Electrónico', type: 'email', required: true },
    { id: 'acudiente', label: 'Acudiente', type: 'text', required: true },
    { id: 'estado', label: 'Estado', type: 'switch', defaultValue: true }
  ];
  
  // Actualizar la edad cuando cambia la fecha de nacimiento
  useEffect(() => {
    if (selectedBeneficiario && selectedBeneficiario.fechaNacimiento) {
      const edadCalculada = calcularEdad(selectedBeneficiario.fechaNacimiento);
      setSelectedBeneficiario(prev => ({ ...prev, age: edadCalculada }));
    }
  }, [selectedBeneficiario?.fechaNacimiento]);

  return (
    <>
      <GenericList
        data={beneficiarios}
        columns={columns}
        onEdit={handleEdit}
        onDelete={handleDelete}
        onView={handleView}
        title="Gestión de Beneficiarios"
      />
      
      <DetailModal
        title={`Detalle del Beneficiario: ${selectedBeneficiario?.nombre}`}
        data={selectedBeneficiario}
        fields={detailFields}
        open={detailModalOpen}
        onClose={handleCloseDetail}
      />

      <FormModal
        title={isEditing ? 'Editar Beneficiario' : 'Crear Nuevo Beneficiario'}
        fields={formFields}
        initialData={selectedBeneficiario}
        open={formModalOpen}
        onClose={handleCloseForm}
        onSubmit={handleSubmit}
      />
    </>
  );
};

export default Beneficiarios;