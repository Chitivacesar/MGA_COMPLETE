import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { GenericList } from '../../../shared/components/GenericList';
import { DetailModal } from '../../../shared/components/DetailModal';
import { FormModal } from '../../../shared/components/FormModal';
import { StatusButton } from '../../../shared/components/StatusButton';

// Configuración de la API - Corrección del error de process.env
const API_BASE_URL = (typeof process !== 'undefined' && process.env?.REACT_APP_API_URL) || 'http://localhost:3000';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000, // 10 segundos de timeout
});

const Beneficiarios = () => {
  const [beneficiarios, setBeneficiarios] = useState([]);
  const [selectedBeneficiario, setSelectedBeneficiario] = useState(null);
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [formModalOpen, setFormModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchBeneficiarios();
  }, []);

  const fetchBeneficiarios = async () => {
    setLoading(true);
    setError(null);
    
    try {
      console.log('Intentando obtener beneficiarios desde:', `${API_BASE_URL}/api/beneficiarios`);
      
      // Obtener beneficiarios
      const beneficiariosResponse = await apiClient.get('/api/beneficiarios');
      console.log('Respuesta beneficiarios:', beneficiariosResponse.data);
      
      const beneficiarios = beneficiariosResponse.data;
      
      // Intentar obtener usuarios_has_rol (opcional)
      let usuariosHasRol = [];
      try {
        const usuariosHasRolResponse = await apiClient.get('/api/usuarios_has_rol');
        usuariosHasRol = usuariosHasRolResponse.data;
        console.log('Respuesta usuarios_has_rol:', usuariosHasRol);
      } catch (usuariosError) {
        console.warn('No se pudieron obtener usuarios_has_rol:', usuariosError.message);
        // Continuar sin esta información
      }

      // Filtrar beneficiarios según las reglas:
      // 1. Si clienteId === _id, NO es un beneficiario (es un cliente)
      // 2. Si clienteId === 'cliente', NO es un beneficiario (es un cliente)
      // 3. Si clienteId es diferente a _id y diferente a 'cliente', ES un beneficiario
      const beneficiariosFiltrados = beneficiarios.filter(beneficiario => 
        beneficiario.clienteId !== beneficiario._id &&
        beneficiario.clienteId !== 'cliente' || beneficiario.clienteId === beneficiario._id
      );

      console.log('Total beneficiarios:', beneficiarios.length);
      console.log('Beneficiarios filtrados:', beneficiariosFiltrados.length);
      console.log('Datos filtrados:', beneficiariosFiltrados);

      // Mapear los datos incluyendo el correo desde usuario_has_rol
      const beneficiariosFormateados = beneficiariosFiltrados.map(beneficiario => {
        // Buscar el usuario_has_rol correspondiente
        const usuarioHasRol = usuariosHasRol.find(u => u._id === beneficiario.usuario_has_rolId);
        const correo = usuarioHasRol?.usuarioId?.correo || beneficiario.correo || '';

        return {
          id: beneficiario._id,
          nombre: beneficiario.nombre || '',
          apellido: beneficiario.apellido || '',
          tipoDocumento: beneficiario.tipo_de_documento || beneficiario.tipoDocumento || '',
          numeroDocumento: beneficiario.numero_de_documento || beneficiario.numeroDocumento || '',
          fechaNacimiento: beneficiario.fechaDeNacimiento || beneficiario.fechaNacimiento || '',
          direccion: beneficiario.direccion || '',
          telefono: beneficiario.telefono || '',
          correo: correo,
          estado: beneficiario.estado !== undefined ? beneficiario.estado : true
        };
      });

      setBeneficiarios(beneficiariosFormateados);
      
    } catch (error) {
      console.error('Error al obtener los beneficiarios:', error);
      
      let errorMessage = 'Error desconocido';
      
      if (error.code === 'ECONNREFUSED') {
        errorMessage = 'No se puede conectar al servidor. Verifica que esté corriendo en el puerto correcto.';
      } else if (error.response) {
        // Error de respuesta del servidor
        errorMessage = `Error del servidor: ${error.response.status} - ${error.response.statusText}`;
        console.error('Detalles del error:', error.response.data);
      } else if (error.request) {
        // Error de red
        errorMessage = 'Error de red. Verifica tu conexión a internet y que el servidor esté disponible.';
      } else {
        errorMessage = error.message;
      }
      
      setError(errorMessage);
      
      // Datos de prueba en caso de error (solo en desarrollo)
      const isDevelopment = window.location.hostname === 'localhost' || 
                           window.location.hostname === '127.0.0.1' ||
                           window.location.hostname === '';
                           
      if (isDevelopment) {
        console.log('Cargando datos de prueba...');
        setBeneficiarios([
          {
            id: '1',
            nombre: 'Juan',
            apellido: 'Pérez',
            tipoDocumento: 'CC',
            numeroDocumento: '12345678',
            fechaNacimiento: '1990-01-01',
            direccion: 'Calle 123',
            telefono: '3001234567',
            correo: 'juan@example.com',
            estado: true
          }
        ]);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (beneficiario) => {
    setIsEditing(true);
    setSelectedBeneficiario(beneficiario);
    setFormModalOpen(true);
  };

  const handleDelete = async (beneficiario) => {
    const confirmDelete = window.confirm(`¿Está seguro de eliminar al beneficiario ${beneficiario.nombre}?`);
    if (confirmDelete) {
      try {
        setLoading(true);
        await apiClient.delete(`/api/beneficiarios/${beneficiario.id}`);
        await fetchBeneficiarios(); // Recargar la lista de beneficiarios
      } catch (error) {
        console.error('Error al eliminar el beneficiario:', error);
        alert('Error al eliminar el beneficiario. Inténtalo de nuevo.');
      } finally {
        setLoading(false);
      }
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

  const handleSubmit = async (formData) => {
    try {
      setLoading(true);
      
      const beneficiarioData = {
        nombre: formData.nombre,
        apellido: formData.apellido,
        tipo_de_documento: formData.tipoDocumento,
        numero_de_documento: formData.numeroDocumento,
        telefono: formData.telefono,
        direccion: formData.direccion,
        fechaDeNacimiento: formData.fechaNacimiento,
        correo: formData.correo, // Incluir correo
        fechaRegistro: new Date().toISOString(),
        estado: formData.estado !== undefined ? formData.estado : true
      };

      if (isEditing && selectedBeneficiario) {
        await apiClient.put(`/api/beneficiarios/${selectedBeneficiario.id}`, beneficiarioData);
      } else {
        await apiClient.post('/api/beneficiarios', beneficiarioData);
      }

      await fetchBeneficiarios(); // Recargar la lista de beneficiarios
      handleCloseForm();
      
    } catch (error) {
      console.error('Error al guardar el beneficiario:', error);
      
      let errorMessage = 'Error al guardar el beneficiario';
      if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      }
      
      alert(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleStatus = async (beneficiarioId) => {
    try {
      setLoading(true);
      
      const beneficiario = beneficiarios.find(b => b.id === beneficiarioId);
      if (!beneficiario) {
        console.error('Beneficiario no encontrado');
        return;
      }

      const updatedStatus = !beneficiario.estado;
      
      // Preparar datos para actualización
      const updateData = {
        nombre: beneficiario.nombre,
        apellido: beneficiario.apellido,
        tipo_de_documento: beneficiario.tipoDocumento,
        numero_de_documento: beneficiario.numeroDocumento,
        telefono: beneficiario.telefono,
        direccion: beneficiario.direccion,
        fechaDeNacimiento: beneficiario.fechaNacimiento,
        correo: beneficiario.correo,
        estado: updatedStatus
      };

      await apiClient.put(`/api/beneficiarios/${beneficiarioId}`, updateData);
      await fetchBeneficiarios(); // Recargar la lista de beneficiarios
      
    } catch (error) {
      console.error('Error al actualizar el estado del beneficiario:', error);
      alert('Error al actualizar el estado del beneficiario');
    } finally {
      setLoading(false);
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
    { 
      id: 'estado', 
      label: 'Estado',
      render: (value, row) => (
        <StatusButton 
          active={value} 
          onClick={() => handleToggleStatus(row?.id)}
          disabled={loading}
        />
      )
    }
  ];

  const detailFields = [
    { id: 'nombre', label: 'Nombre' },
    { id: 'apellido', label: 'Apellido' },
    { id: 'tipoDocumento', label: 'Tipo de Documento' },
    { id: 'numeroDocumento', label: 'Número de Documento' },
    { 
      id: 'fechaNacimiento', 
      label: 'Fecha de Nacimiento',
      render: (value) => {
        if (!value) return '';
        const fecha = new Date(value).toLocaleDateString('es-ES');
        const edad = calcularEdad(value);
        return `${fecha} (${edad} años)`;
      }
    },
    { id: 'direccion', label: 'Dirección' },
    { id: 'telefono', label: 'Teléfono' },
    { id: 'correo', label: 'Correo Electrónico' },
    { 
      id: 'estado', 
      label: 'Estado', 
      render: (value, row) => (
        <StatusButton 
          active={value} 
          onClick={() => handleToggleStatus(row?.id)}
          disabled={loading}
        />
      )
    }
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
    { id: 'estado', label: 'Estado', type: 'switch', defaultValue: true }
  ];

  // Mostrar error si existe
  if (error && beneficiarios.length === 0) {
    return (
      <div style={{ padding: '20px', textAlign: 'center' }}>
        <h2>Error al cargar beneficiarios</h2>
        <p style={{ color: 'red', marginBottom: '20px' }}>{error}</p>
        <button 
          onClick={fetchBeneficiarios}
          style={{
            padding: '10px 20px',
            backgroundColor: '#007bff',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer'
          }}
          disabled={loading}
        >
          {loading ? 'Cargando...' : 'Reintentar'}
        </button>
        <div style={{ marginTop: '20px', fontSize: '14px', color: '#666' }}>
          <p>Posibles soluciones:</p>
          <ul style={{ textAlign: 'left', display: 'inline-block' }}>
            <li>Verifica que el servidor backend esté corriendo</li>
            <li>Confirma que la URL de la API sea correcta: {API_BASE_URL}</li>
            <li>Revisa que las rutas /api/beneficiarios estén configuradas</li>
          </ul>
        </div>
      </div>
    );
  }

  return (
    <>
      {error && (
        <div style={{ 
          padding: '10px', 
          backgroundColor: '#f8d7da', 
          color: '#721c24', 
          border: '1px solid #f5c6cb',
          borderRadius: '4px',
          marginBottom: '20px'
        }}>
          <strong>Advertencia:</strong> {error}
          <button 
            onClick={() => setError(null)}
            style={{ 
              float: 'right', 
              background: 'none', 
              border: 'none', 
              fontSize: '16px', 
              cursor: 'pointer' 
            }}
          >
            ×
          </button>
        </div>
      )}

      <GenericList
        data={beneficiarios}
        columns={columns}
        onEdit={handleEdit}
        onDelete={handleDelete}
        onView={handleView}
        title="Gestión de Beneficiarios"
        loading={loading}
      />
      
      <DetailModal
        title={`Detalle del Beneficiario: ${selectedBeneficiario?.nombre || ''}`}
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
        loading={loading}
      />
    </>
  );
};

export default Beneficiarios;