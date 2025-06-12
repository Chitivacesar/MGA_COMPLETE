import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { GenericList } from '../../../shared/components/GenericList';
import { DetailModal } from '../../../shared/components/DetailModal';
import { FormModal } from '../../../shared/components/FormModal';
import { StatusButton } from '../../../shared/components/StatusButton';

const Clientes = () => {
  const [clientes, setClientes] = useState([]);
  const [selectedCliente, setSelectedCliente] = useState(null);
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [formModalOpen, setFormModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    fetchClientes();
  }, []);

  const fetchClientes = async () => {
    try {
      // Obtener beneficiarios
      const beneficiariosResponse = await axios.get('http://localhost:3001/api/beneficiarios');
      const beneficiarios = beneficiariosResponse.data;
      
      // Obtener usuarios_has_rol
      const usuariosHasRolResponse = await axios.get('http://localhost:3001/api/usuarios_has_rol');
      const usuariosHasRol = usuariosHasRolResponse.data;

      // Filtrar beneficiarios que son clientes (clienteId === _id)
      const clientesFiltrados = beneficiarios.filter(beneficiario => 
        beneficiario.clienteId === beneficiario._id
      );

      // Mapear los datos incluyendo el correo desde usuario_has_rol
      const clientesFormateados = clientesFiltrados.map(cliente => {
        // Buscar el usuario_has_rol correspondiente
        const usuarioHasRol = usuariosHasRol.find(u => u._id === cliente.usuario_has_rolId);
        const correo = usuarioHasRol?.usuarioId?.correo || '';

        return {
          id: cliente._id,
          nombre: cliente.nombre,
          apellido: cliente.apellido,
          tipoDocumento: cliente.tipo_de_documento,
          numeroDocumento: cliente.numero_de_documento,
          fechaNacimiento: cliente.fechaDeNacimiento,
          direccion: cliente.direccion,
          telefono: cliente.telefono,
          correo: correo,
          estado: cliente.estado !== undefined ? cliente.estado : true // Usar el estado del beneficiario si existe
        };
      });

      setClientes(clientesFormateados);
    } catch (error) {
      console.error('Error al obtener los clientes:', error);
    }
  };

  const handleCreate = () => {
    setIsEditing(false);
    setSelectedCliente(null);
    setFormModalOpen(true);
  };

  const handleEdit = (cliente) => {
    setIsEditing(true);
    setSelectedCliente(cliente);
    setFormModalOpen(true);
  };

  const handleSubmit = async (formData) => {
    try {
      // Primero crear o actualizar el usuario
      const usuarioData = {
        correo: formData.correo,
        contrasena: 'default123', // Contraseña por defecto para nuevos usuarios
        rol: 'usuario',
        estado: true
      };

      let usuarioId;
      if (isEditing) {
        // Obtener el usuario_has_rol actual
        const usuarioHasRolResponse = await axios.get(`http://localhost:3001/api/usuarios_has_rol/${selectedCliente.usuario_has_rolId}`);
        usuarioId = usuarioHasRolResponse.data.usuarioId._id;
        // Actualizar usuario existente
        await axios.put(`http://localhost:3001/api/usuarios/${usuarioId}`, usuarioData);
      } else {
        // Crear nuevo usuario
        const usuarioResponse = await axios.post('http://localhost:3001/api/usuarios', usuarioData);
        usuarioId = usuarioResponse.data._id;

        // Crear usuario_has_rol
        const usuarioHasRolData = {
          usuarioId: usuarioId,
          rolId: '68405b59e6b8f374e31cc748' // ID del rol por defecto
        };
        const usuarioHasRolResponse = await axios.post('http://localhost:3001/api/usuarios_has_rol', usuarioHasRolData);
        var usuario_has_rolId = usuarioHasRolResponse.data._id;
      }

      // Preparar datos del beneficiario
      const beneficiarioData = {
        nombre: formData.nombre,
        apellido: formData.apellido,
        tipo_de_documento: formData.tipoDocumento,
        numero_de_documento: formData.numeroDocumento,
        telefono: formData.telefono,
        direccion: formData.direccion,
        fechaDeNacimiento: formData.fechaNacimiento,
        fechaRegistro: new Date().toISOString(),
        usuario_has_rolId: isEditing ? selectedCliente.usuario_has_rolId : usuario_has_rolId
      };

      if (isEditing) {
        await axios.put(`http://localhost:3001/api/beneficiarios/${selectedCliente.id}`, beneficiarioData);
      } else {
        const response = await axios.post('http://localhost:3001/api/beneficiarios', beneficiarioData);
        // Asignar el mismo _id como clienteId
        await axios.put(`http://localhost:3001/api/beneficiarios/${response.data._id}`, {
          ...response.data,
          clienteId: response.data._id
        });
      }

      fetchClientes(); // Recargar la lista de clientes
      handleCloseForm();
    } catch (error) {
      console.error('Error al guardar el cliente:', error);
    }
  };

  const handleDelete = async (cliente) => {
    const confirmDelete = window.confirm(`¿Está seguro de eliminar el cliente ${cliente.nombre}?`);
    if (confirmDelete) {
      try {
        await axios.delete(`http://localhost:3001/api/beneficiarios/${cliente.id}`);
        fetchClientes(); // Recargar la lista de clientes
      } catch (error) {
        console.error('Error al eliminar el cliente:', error);
      }
    }
  };

  const handleView = (cliente) => {
    setSelectedCliente(cliente);
    setDetailModalOpen(true);
  };

  const handleCloseDetail = () => {
    setDetailModalOpen(false);
    setSelectedCliente(null);
  };

  const handleCloseForm = () => {
    setFormModalOpen(false);
    setSelectedCliente(null);
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

  const handleToggleStatus = async (clienteId) => {
    try {
      const cliente = clientes.find(c => c.id === clienteId);
      if (!cliente) return;

      const updatedStatus = !cliente.estado;
      
      await axios.put(`http://localhost:3001/api/beneficiarios/${clienteId}`, {
        ...cliente,
        estado: updatedStatus
      });

      fetchClientes(); // Recargar la lista de clientes
    } catch (error) {
      console.error('Error al actualizar el estado del cliente:', error);
    }
  };

  const columns = [
    { id: 'nombre', label: 'Nombre' },
    { id: 'apellido', label: 'Apellido' },
    { id: 'tipoDocumento', label: 'Tipo Documento' },
    { id: 'numeroDocumento', label: 'N° Documento' },
    { id: 'fechaNacimiento', label: 'Fecha Nacimiento' },
    { id: 'direccion', label: 'Dirección' },
    { id: 'telefono', label: 'Teléfono' },
    { id: 'correo', label: 'Correo' },
    { id: 'estado', label: 'Estado', render: (value, row) => (
      <StatusButton
        active={value}
        onClick={() => handleToggleStatus(row?.id)}
      />
    )},
  ];

  const detailFields = [
    { id: 'nombre', label: 'Nombre' },
    { id: 'apellido', label: 'Apellido' },
    { id: 'tipoDocumento', label: 'Tipo de Documento' },
    { id: 'numeroDocumento', label: 'Número de Documento' },
    { id: 'fechaNacimiento', label: 'Fecha de Nacimiento' },
    { id: 'direccion', label: 'Dirección' },
    { id: 'telefono', label: 'Teléfono' },
    { id: 'correo', label: 'Correo Electrónico' },
    { id: 'estado', label: 'Estado', render: (value, row) => (
      <StatusButton
        active={value}
        onClick={() => handleToggleStatus(row?.id)}
      />
    )},
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
    { id: 'acudiente', label: 'Beneficiario', type: 'text', required: true },
    { id: 'estado', label: 'Estado', type: 'switch', defaultValue: true }
  ];
  
  // Actualizar la edad cuando cambia la fecha de nacimiento
  useEffect(() => {
    if (selectedCliente && selectedCliente.fechaNacimiento) {
      const edadCalculada = calcularEdad(selectedCliente.fechaNacimiento);
      setSelectedCliente(prev => ({ ...prev, age: edadCalculada }));
    }
  }, [selectedCliente?.fechaNacimiento]);

  return (
    <>
      <GenericList
        data={clientes}
        columns={columns}
        onEdit={handleEdit}
        onDelete={handleDelete}
        onView={handleView}
        title="Gestión de Clientes"
      />
      
      <DetailModal
        title={`Detalle del Cliente: ${selectedCliente?.nombre}`}
        data={selectedCliente}
        fields={detailFields}
        open={detailModalOpen}
        onClose={handleCloseDetail}
      />

      <FormModal
        title={isEditing ? 'Editar Cliente' : 'Crear Nuevo Cliente'}
        fields={formFields}
        initialData={selectedCliente}
        open={formModalOpen}
        onClose={handleCloseForm}
        onSubmit={handleSubmit}
      />
    </>
  );
};

export default Clientes;