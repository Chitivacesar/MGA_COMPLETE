import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { GenericList } from '../../../shared/components/GenericList';
import { DetailModal } from '../../../shared/components/DetailModal';
import { FormModal } from '../../../shared/components/FormModal';
import { StatusButton } from '../../../shared/components/StatusButton';
import { Snackbar, Alert } from '@mui/material';

// Configuración de la API - Corrección del error de process.env
const API_BASE_URL = (typeof process !== 'undefined' && process.env?.REACT_APP_API_URL) || 'http://localhost:3000';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000, // 10 segundos de timeout
});

// Función para buscar clientes (para el selector de clienteId)
const buscarClientes = async () => {
  try {
    // Obtener beneficiarios
    const beneficiariosResponse = await apiClient.get('/api/beneficiarios');
    const beneficiarios = beneficiariosResponse.data;
    
    // Obtener usuarios_has_rol para obtener correos
    const usuariosHasRolResponse = await apiClient.get('/api/usuarios_has_rol');
    const usuariosHasRol = usuariosHasRolResponse.data;
    
    // Filtrar beneficiarios que son clientes (clienteId === _id O clienteId === 'cliente')
    const clientesFiltrados = beneficiarios.filter(beneficiario =>
      beneficiario.clienteId === beneficiario._id || beneficiario.clienteId === 'cliente'
    );
    
    // Mapear los datos incluyendo el correo desde usuario_has_rol
    const clientesFormateados = clientesFiltrados.map(cliente => {
      // Buscar el usuario_has_rol correspondiente
      const usuarioHasRol = usuariosHasRol.find(u => u._id === cliente.usuario_has_rolId);
      const correo = usuarioHasRol?.usuarioId?.correo || '';
      
      return {
        _id: cliente._id,
        id: cliente._id,
        nombre: cliente.nombre,
        apellido: cliente.apellido,
        tipo_de_documento: cliente.tipo_de_documento,
        tipoDocumento: cliente.tipo_de_documento,
        numero_de_documento: cliente.numero_de_documento,
        numeroDocumento: cliente.numero_de_documento,
        fechaNacimiento: cliente.fechaDeNacimiento,
        direccion: cliente.direccion,
        telefono: cliente.telefono,
        correo: correo,
        estado: cliente.estado !== undefined ? cliente.estado : true
      };
    });
    
    return clientesFormateados;
  } catch (error) {
    console.error('Error al buscar clientes:', error);
    return [];
  }
};

const Beneficiarios = () => {
  const [beneficiarios, setBeneficiarios] = useState([]);
  const [selectedBeneficiario, setSelectedBeneficiario] = useState(null);
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [formModalOpen, setFormModalOpen] = useState(false);
  const [createBeneficiarioModalOpen, setCreateBeneficiarioModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [clientes, setClientes] = useState([]);
  const [clientesFiltrados, setClientesFiltrados] = useState([]);
  const [clienteSearchTerm, setClienteSearchTerm] = useState('');
  const [clientesLoading, setClientesLoading] = useState(false);
  const [clientesError, setClientesError] = useState(null);
  const [formData, setFormData] = useState({
    nombre: '',
    apellido: '',
    tipo_de_documento: '',
    numero_de_documento: '',
    fechaDeNacimiento: '',
    direccion: '',
    telefono: '',
    correo: '',
    contrasena: '',
    clienteId: ''
  });
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [alertOpen, setAlertOpen] = useState(false);
  const [alertMessage, setAlertMessage] = useState('');
  const [alertSeverity, setAlertSeverity] = useState('success');

  useEffect(() => {
    fetchBeneficiarios();
  }, []);
  
  // Cargar clientes cuando se abre el modal de crear beneficiario
  useEffect(() => {
    if (createBeneficiarioModalOpen) {
      const loadClientes = async () => {
        try {
          setClientesLoading(true);
          setClientesError(null);
          const clientesData = await buscarClientes();
          setClientes(clientesData);
          setClientesFiltrados(clientesData);
        } catch (error) {
          console.error('Error al cargar clientes:', error);
          setClientesError('Error al cargar la lista de clientes');
        } finally {
          setClientesLoading(false);
        }
      };
      
      loadClientes();
    }
  }, [createBeneficiarioModalOpen]);

  // Filtrar clientes cuando cambia el término de búsqueda
  useEffect(() => {
    if (clienteSearchTerm && clienteSearchTerm.trim() !== '') {
      const filtrados = clientes.filter(cliente => 
        cliente.nombre.toLowerCase().includes(clienteSearchTerm.toLowerCase()) || 
        cliente.apellido.toLowerCase().includes(clienteSearchTerm.toLowerCase()) ||
        cliente.numero_de_documento.includes(clienteSearchTerm) ||
        cliente.numeroDocumento?.includes(clienteSearchTerm)
      );
      setClientesFiltrados(filtrados);
    } else {
      setClientesFiltrados(clientes);
    }
  }, [clienteSearchTerm, clientes]);

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
        await axios.delete(`http://localhost:3000/api/beneficiarios/${beneficiario.id}`);
        await fetchBeneficiarios(); // Recargar la lista de beneficiarios
      } catch (error) {
        console.error('Error al eliminar el beneficiario:', error);
        
        // Mostrar mensaje de error específico si el beneficiario está asociado a ventas
        if (error.response && error.response.status === 400) {
          // Asegurarse de que se muestra el mensaje correcto
          const errorMessage = 'No se puede eliminar el beneficiario porque está asociado a una venta de curso o matrícula';
          alert(errorMessage);
        } else {
          alert('Error al eliminar el beneficiario. Inténtalo de nuevo.');
        }
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
  
  // Funciones para el modal de creación de beneficiario
  const handleOpenCreateBeneficiarioModal = () => {
    // Resetear formData al abrir el modal
    setFormData({
      nombre: '',
      apellido: '',
      tipo_de_documento: '',
      numero_de_documento: '',
      fechaDeNacimiento: '',
      direccion: '',
      telefono: '',
      correo: '',
      contrasena: '',
      clienteId: ''
    });
    setConfirmPassword('');
    setPasswordError('');
    setCreateBeneficiarioModalOpen(true);
  };
  
  const handleCloseCreateBeneficiarioModal = () => {
    setCreateBeneficiarioModalOpen(false);
    setClienteSearchTerm('');
    // Resetear formData al cerrar el modal
    setFormData({
      nombre: '',
      apellido: '',
      tipo_de_documento: '',
      numero_de_documento: '',
      fechaDeNacimiento: '',
      direccion: '',
      telefono: '',
      correo: '',
      contrasena: '',
      clienteId: ''
    });
    setConfirmPassword('');
    setPasswordError('');
  };
  
  // Función para manejar la búsqueda de clientes
  const handleClienteSearch = (event) => {
    setClienteSearchTerm(event.target.value);
  };

  const handleFormChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Si se selecciona un cliente, auto-llenar la dirección
    if (field === 'clienteId') {
      const clienteSeleccionado = clientes.find(cliente => cliente._id === value);
      if (clienteSeleccionado && clienteSeleccionado.direccion) {
        setFormData(prev => ({ ...prev, direccion: clienteSeleccionado.direccion }));
      }
    }
  };

  const validatePassword = () => {
    if (!formData.contrasena) {
      setPasswordError('La contraseña es requerida');
      return false;
    }
    
    if (formData.contrasena.length < 8) {
      setPasswordError('La contraseña debe tener al menos 8 caracteres');
      return false;
    }
    
    // Verificar que contenga al menos una letra mayúscula, una minúscula y un número
    const hasUpperCase = /[A-Z]/.test(formData.contrasena);
    const hasLowerCase = /[a-z]/.test(formData.contrasena);
    const hasNumber = /[0-9]/.test(formData.contrasena);
    
    if (!hasUpperCase || !hasLowerCase || !hasNumber) {
      setPasswordError('La contraseña debe contener al menos una letra mayúscula, una minúscula y un número');
      return false;
    }
    
    if (formData.contrasena !== confirmPassword) {
      setPasswordError('Las contraseñas no coinciden');
      return false;
    }
    
    setPasswordError('');
    return true;
  };

  // Validación en tiempo real de la contraseña
  useEffect(() => {
    if (formData.contrasena) {
      // Verificar longitud mínima
      if (formData.contrasena.length < 8) {
        setPasswordError('La contraseña debe tener al menos 8 caracteres');
        return;
      }
      
      // Verificar que contenga al menos una letra mayúscula, una minúscula y un número
      const hasUpperCase = /[A-Z]/.test(formData.contrasena);
      const hasLowerCase = /[a-z]/.test(formData.contrasena);
      const hasNumber = /[0-9]/.test(formData.contrasena);
      
      if (!hasUpperCase || !hasLowerCase || !hasNumber) {
        setPasswordError('La contraseña debe contener al menos una letra mayúscula, una minúscula y un número');
        return;
      }
      
      // Verificar que las contraseñas coincidan (solo si ambas tienen valor)
      if (confirmPassword) {
        if (formData.contrasena !== confirmPassword) {
          setPasswordError('Las contraseñas no coinciden');
          return;
        }
      }
      
      // Si pasa todas las validaciones
      setPasswordError('');
    }
  }, [formData.contrasena, confirmPassword]);
  
  // Estado para mostrar requisitos de contraseña
  const [passwordRequirements, setPasswordRequirements] = useState({
    length: false,
    uppercase: false,
    lowercase: false,
    number: false
  });
  
  // Actualizar requisitos de contraseña en tiempo real
  useEffect(() => {
    if (formData.contrasena) {
      setPasswordRequirements({
        length: formData.contrasena.length >= 8,
        uppercase: /[A-Z]/.test(formData.contrasena),
        lowercase: /[a-z]/.test(formData.contrasena),
        number: /[0-9]/.test(formData.contrasena)
      });
    } else {
      setPasswordRequirements({
        length: false,
        uppercase: false,
        lowercase: false,
        number: false
      });
    }
  }, [formData.contrasena]);

  const validateEmail = (email) => {
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    return emailRegex.test(email);
  };

  const validateDocument = (documento) => {
    const documentRegex = /^[0-9]{6,15}$/;
    return documentRegex.test(documento);
  };

  const handlePasswordChange = (value) => {
    setFormData(prev => ({ ...prev, contrasena: value }));
    if (passwordError) {
      setPasswordError('');
    }
  };

  const handleConfirmPasswordChange = (value) => {
    setConfirmPassword(value);
    if (passwordError) {
      setPasswordError('');
    }
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
  
  // Función para crear un nuevo beneficiario con usuario y rol
  const handleCreateBeneficiario = async (submitFormData) => {
    try {
      // Validar contraseña antes de enviar
      if (!validatePassword()) {
        alert('Error: ' + passwordError);
        return;
      }

      setLoading(true);
      
      // Combinar datos del formulario
      const finalFormData = { ...formData, ...submitFormData };
      
      // Validar que el número de documento tenga el formato correcto (6-15 dígitos)
      const numeroDocumentoLimpio = finalFormData.numero_de_documento.toString().replace(/\D/g, '');
      if (numeroDocumentoLimpio.length < 6 || numeroDocumentoLimpio.length > 15) {
        alert('El número de documento debe tener entre 6 y 15 dígitos numéricos.');
        setLoading(false);
        return;
      }
      
      // Step 1: Crear Usuario
      console.log('Creando usuario...');
      const usuarioData = {
        nombre: finalFormData.nombre,
        apellido: finalFormData.apellido,
        correo: finalFormData.correo,
        contrasena: finalFormData.contrasena,
        tipo_de_documento: finalFormData.tipo_de_documento,
        documento: numeroDocumentoLimpio
      };
      
      const usuarioResponse = await apiClient.post('/api/usuarios', usuarioData);
      const usuarioId = usuarioResponse.data._id;
      console.log('Usuario creado con ID:', usuarioId);
      
      // Step 2: Obtener el ID del rol 'Beneficiario'
      console.log('Obteniendo roles...');
      const rolesResponse = await apiClient.get('/api/roles');
      console.log('Respuesta de roles completa:', rolesResponse.data);
      
      // Verificar la estructura de la respuesta
      let roles;
      if (rolesResponse.data && rolesResponse.data.roles) {
        // Si la respuesta tiene una estructura { roles: [...] }
        roles = rolesResponse.data.roles;
        console.log('Usando roles desde rolesResponse.data.roles');
      } else if (Array.isArray(rolesResponse.data)) {
        // Si la respuesta es directamente un array
        roles = rolesResponse.data;
        console.log('Usando roles directamente desde rolesResponse.data');
      } else {
        // Si la respuesta tiene otra estructura
        console.error('Estructura de respuesta de roles inesperada:', rolesResponse.data);
        throw new Error('Formato de respuesta de roles inesperado');
      }
      
      if (!Array.isArray(roles)) {
        console.error('La respuesta de roles no es un array:', roles);
        throw new Error('Formato de respuesta de roles inesperado');
      }
      
      console.log('Roles disponibles:', roles.map(r => ({ id: r._id, nombre: r.nombre })));
      const beneficiarioRol = roles.find(rol => rol.nombre === 'Beneficiario');
      if (!beneficiarioRol) {
        throw new Error('Rol "Beneficiario" no encontrado');
      }
      console.log('Rol de beneficiario encontrado:', beneficiarioRol);
      
      // Step 3: Crear UsuarioHasRol
      console.log('Creando relación usuario-rol...');
      const usuarioHasRolData = {
        usuarioId: usuarioId,
        rolId: beneficiarioRol._id
      };
      console.log('Datos para crear usuario_has_rol:', usuarioHasRolData);
      
      const usuarioHasRolResponse = await apiClient.post('/api/usuarios_has_rol', usuarioHasRolData);
      console.log('Respuesta de usuarios_has_rol completa:', usuarioHasRolResponse.data);
      
      // La respuesta es un array de relaciones
      if (!Array.isArray(usuarioHasRolResponse.data)) {
        console.error('La respuesta de usuarios_has_rol no es un array:', usuarioHasRolResponse.data);
        throw new Error('Formato de respuesta de usuarios_has_rol inesperado');
      }
      
      // Tomamos la primera relación del array (debería ser la que acabamos de crear)
      const nuevaRelacion = usuarioHasRolResponse.data[0];
      console.log('Primera relación encontrada:', nuevaRelacion);
      
      if (!nuevaRelacion || !nuevaRelacion._id) {
        throw new Error('No se pudo obtener el ID de la relación usuario-rol');
      }
      
      const usuario_has_rolId = nuevaRelacion._id;
      console.log('ID de la relación usuario-rol:', usuario_has_rolId);
      
      // Step 4: Crear Beneficiario
      console.log('Creando beneficiario...');
      const beneficiarioData = {
        nombre: finalFormData.nombre,
        apellido: finalFormData.apellido,
        tipo_de_documento: finalFormData.tipo_de_documento,
        numero_de_documento: numeroDocumentoLimpio,
        telefono: finalFormData.telefono,
        direccion: finalFormData.direccion,
        fechaDeNacimiento: finalFormData.fechaDeNacimiento,
        usuario_has_rolId: usuario_has_rolId,
        clienteId: finalFormData.clienteId // Valor seleccionado del cliente
      };
      
      console.log('Datos del beneficiario a crear:', beneficiarioData);
      await apiClient.post('/api/beneficiarios', beneficiarioData);
      
      // Limpiar formulario y cerrar modal
      setFormData({});
      setConfirmPassword('');
      setPasswordError('');
      setClienteSearchTerm('');
      await fetchBeneficiarios();
      handleCloseCreateBeneficiarioModal();
      
      // Mostrar mensaje de éxito con Snackbar
      setAlertMessage('Beneficiario creado exitosamente');
      setAlertSeverity('success');
      setAlertOpen(true);
      
    } catch (error) {
      console.error('Error al crear el beneficiario:', error);
      
      // Mostrar información detallada del error para depuración
      if (error.response) {
        // La solicitud fue realizada y el servidor respondió con un código de estado
        // que está fuera del rango 2xx
        console.error('Datos del error:', {
          data: error.response.data,
          status: error.response.status,
          headers: error.response.headers
        });
        setAlertMessage(`Error ${error.response.status}: ${error.response.data.message || 'Error al crear el beneficiario'}`);
        setAlertSeverity('error');
        setAlertOpen(true);
      } else if (error.request) {
        // La solicitud fue realizada pero no se recibió respuesta
        console.error('Error de solicitud:', error.request);
        setAlertMessage('No se recibió respuesta del servidor. Verifique su conexión.');
        setAlertSeverity('error');
        setAlertOpen(true);
      } else {
        // Algo ocurrió al configurar la solicitud que desencadenó un error
        console.error('Error de configuración:', error.message);
        console.error('Stack trace:', error.stack);
        setAlertMessage(`Error: ${error.message}`);
        setAlertSeverity('error');
        setAlertOpen(true);
      }
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

  // Función para manejar el cierre de la alerta
  const handleCloseAlert = (event, reason) => {
    if (reason === 'clickaway') {
      return;
    }
    setAlertOpen(false);
  };

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
        customActions={[
          {
            label: 'Crear Nuevo',
            onClick: handleOpenCreateBeneficiarioModal,
            icon: 'add',
            color: 'primary'
          }
        ]}
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
      
      {/* Modal para crear beneficiario completo (con usuario y rol) */}
      <FormModal
        title="Crear Beneficiario Completo"
        initialData={{
          ...formData,
          clienteSearch: clienteSearchTerm,
          confirmarContrasena: confirmPassword
        }}
        fields={[
          // Campo de búsqueda de cliente integrado
          { 
            id: 'clienteSearch', 
            label: 'Buscar Cliente', 
            type: 'text',
            placeholder: 'Buscar por nombre, apellido o documento',
            fullWidth: true,
            helperText: `${clientesFiltrados.length} cliente(s) encontrado(s)`,
            onChange: (value, formData, setFieldValue) => {
              setClienteSearchTerm(value);
              // Actualizar el campo en el formulario
              setFieldValue('clienteSearch', value);
              
              // Si el campo está vacío, limpiar la lista de resultados
              if (!value.trim()) {
                setClientesFiltrados([]);
                return;
              }
              
              // Filtrar clientes que coincidan con la búsqueda
              const searchTermLower = value.toLowerCase();
              const matches = clientes.filter(
                (cliente) =>
                  cliente.nombre.toLowerCase().includes(searchTermLower) ||
                  cliente.apellido.toLowerCase().includes(searchTermLower) ||
                  (cliente.numero_de_documento && cliente.numero_de_documento.includes(value))
              );
              
              setClientesFiltrados(matches);
              
              // Si solo hay un resultado, seleccionarlo automáticamente
              if (matches.length === 1) {
                const cliente = matches[0];
                setFormData(prev => ({ 
                  ...prev, 
                  clienteId: cliente._id,
                  direccion: cliente.direccion || prev.direccion
                }));
                setFieldValue('clienteId', cliente._id);
                if (cliente.direccion) {
                  setFieldValue('direccion', cliente.direccion);
                }
              }
            }
          },
          // Campo de nombre del cliente (antes selección de cliente)
          { 
            id: 'clienteId', 
            label: 'Nombre del Cliente', 
            type: 'select',
            required: true,
            options: clientesFiltrados.map(cliente => ({
              value: cliente._id || cliente.id,
              label: `${cliente.nombre} ${cliente.apellido} - ${cliente.tipo_de_documento || cliente.tipoDocumento} ${cliente.numero_de_documento || cliente.numeroDocumento}`
            })),
            helperText: clientesLoading ? 'Cargando clientes...' : 
                       clientesError ? clientesError : 
                       clientesFiltrados.length === 0 ? 'No hay clientes que coincidan con la búsqueda' : 'Seleccione el cliente',
            validation: (value) => {
              if (!value) {
                return 'Debe seleccionar un cliente';
              }
              return null;
            },
            onChange: (value, formData, setFieldValue) => {
              setFormData(prev => ({ ...prev, clienteId: value }));
              setFieldValue('clienteId', value);
              
              // Auto-llenar dirección del cliente seleccionado
              const clienteSeleccionado = clientes.find(cliente => cliente._id === value);
              if (clienteSeleccionado) {
                // Actualizar el campo de búsqueda con el nombre del cliente seleccionado
                const nombreCompleto = `${clienteSeleccionado.nombre} ${clienteSeleccionado.apellido}`;
                setClienteSearchTerm(nombreCompleto);
                setFieldValue('clienteSearch', nombreCompleto);
                
                // Auto-llenar dirección
                if (clienteSeleccionado.direccion) {
                  setFormData(prev => ({ ...prev, direccion: clienteSeleccionado.direccion }));
                  setFieldValue('direccion', clienteSeleccionado.direccion);
                }
              }
            }
          },
          // Datos del beneficiario
          { 
            id: 'nombre', 
            label: 'Nombre', 
            type: 'text', 
            required: true,
            validation: (value) => {
              if (!value || value.trim().length === 0) {
                return 'El nombre es requerido';
              }
              return null;
            },
            onChange: (value, formData, setFieldValue) => {
              setFormData(prev => ({ ...prev, nombre: value }));

              setFieldValue('nombre', value);
            }
          },
          { 
            id: 'apellido', 
            label: 'Apellido', 
            type: 'text', 
            required: true,
            validation: (value) => {
              if (!value || value.trim().length === 0) {
                return 'El apellido es requerido';
              }
              return null;
            },
            onChange: (value, formData, setFieldValue) => {
              setFormData(prev => ({ ...prev, apellido: value }));
              setFieldValue('apellido', value);
            }
          },
          { 
            id: 'tipo_de_documento', 
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
            required: true,
            onChange: (value, formData, setFieldValue) => {
              setFormData(prev => ({ ...prev, tipo_de_documento: value }));
              setFieldValue('tipo_de_documento', value);
            }
          },
          { 
            id: 'numero_de_documento', 
            label: 'N° Documento', 
            type: 'text', 
            required: true,
            validation: (value) => {
              if (!value || value.trim().length === 0) {
                return 'El número de documento es requerido';
              }
              if (!validateDocument(value.replace(/\D/g, ''))) {
                return 'Debe contener solo números, entre 6 y 15 dígitos';
              }
              return null;
            },
            helperText: 'Solo números, entre 6 y 15 dígitos',
            onChange: (value, formData, setFieldValue) => {
              setFormData(prev => ({ ...prev, numero_de_documento: value }));
              setFieldValue('numero_de_documento', value);
            }
          },
          { 
            id: 'fechaDeNacimiento', 
            label: 'Fecha de Nacimiento', 
            type: 'date', 
            required: true,
            onChange: (value, formData, setFieldValue) => {
              setFormData(prev => ({ ...prev, fechaDeNacimiento: value }));
              setFieldValue('fechaDeNacimiento', value);
            }
          },
          { 
            id: 'direccion', 
            label: 'Dirección', 
            type: 'text', 
            required: true,
            helperText: 'Se auto-completa con la dirección del cliente seleccionado',
            onChange: (value, formData, setFieldValue) => {
              setFormData(prev => ({ ...prev, direccion: value }));
              setFieldValue('direccion', value);
            }
          },
          { 
            id: 'telefono', 
            label: 'Teléfono', 
            type: 'text', 
            required: true,
            onChange: (value, formData, setFieldValue) => {
              setFormData(prev => ({ ...prev, telefono: value }));
              setFieldValue('telefono', value);
            }
          },
          
          // Datos de acceso
          { 
            id: 'correo', 
            label: 'Correo Electrónico', 
            type: 'email', 
            required: true,
            validation: (value) => {
              if (!value || value.trim().length === 0) {
                return 'El correo electrónico es requerido';
              }
              if (!validateEmail(value)) {
                return 'Debe ser un correo electrónico válido';
              }
              return null;
            },
            helperText: 'Formato: usuario@dominio.com',
            onChange: (value, formData, setFieldValue) => {
              setFormData(prev => ({ ...prev, correo: value }));
              setFieldValue('correo', value);
            }
          },
          { 
            id: 'contrasena', 
            label: 'Contraseña', 
            type: 'password', 
            required: true, 
            validation: (value) => {
              if (!value || value.length === 0) {
                return 'La contraseña es requerida';
              }
              if (value.length < 8) {
                return 'Debe tener al menos 8 caracteres';
              }
              
              // Verificar que contenga al menos una letra mayúscula, una minúscula y un número
              const hasUpperCase = /[A-Z]/.test(value);
              const hasLowerCase = /[a-z]/.test(value);
              const hasNumber = /[0-9]/.test(value);
              
              if (!hasUpperCase || !hasLowerCase || !hasNumber) {
                return 'La contraseña debe contener al menos una letra mayúscula, una minúscula y un número';
              }
              
              return null;
            },
            validateOnChange: true,
            helperText: (formData) => {
              // Solo mostrar los requisitos cuando el campo está enfocado y tiene contenido
              if (!formData.contrasena) return null;
              
              return (
                <>
                  <ul style={{ margin: '4px 0', paddingLeft: '20px', listStyleType: 'none' }}>
                    <li style={{ color: passwordRequirements.length ? 'green' : 'inherit' }}>
                      {passwordRequirements.length ? '✓' : '•'} Mínimo 8 caracteres
                    </li>
                    <li style={{ color: passwordRequirements.uppercase ? 'green' : 'inherit' }}>
                      {passwordRequirements.uppercase ? '✓' : '•'} Al menos una mayúscula
                    </li>
                    <li style={{ color: passwordRequirements.lowercase ? 'green' : 'inherit' }}>
                      {passwordRequirements.lowercase ? '✓' : '•'} Al menos una minúscula
                    </li>
                    <li style={{ color: passwordRequirements.number ? 'green' : 'inherit' }}>
                      {passwordRequirements.number ? '✓' : '•'} Al menos un número
                    </li>
                  </ul>
                </>
              );
            },
            onChange: (value, formData, setFieldValue) => {
              setFormData(prev => ({ ...prev, contrasena: value }));
              setFieldValue('contrasena', value);
              handlePasswordChange(value);
            }
          },
          { 
            id: 'confirmarContrasena', 
            label: 'Confirmar Contraseña', 
            type: 'password', 
            required: true, 
            placeholder: 'Confirme su contraseña',
            validation: (value, formData) => {
              if (!value || value.length === 0) {
                return 'Debe confirmar la contraseña';
              }
              
              // Primero verificamos si la contraseña original cumple con los requisitos
              const passwordValue = formData.contrasena || '';
              if (passwordValue.length < 8) {
                return 'La contraseña debe tener al menos 8 caracteres';
              }
              
              const hasUpperCase = /[A-Z]/.test(passwordValue);
              const hasLowerCase = /[a-z]/.test(passwordValue);
              const hasNumber = /[0-9]/.test(passwordValue);
              
              if (!hasUpperCase || !hasLowerCase || !hasNumber) {
                return 'La contraseña debe contener al menos una letra mayúscula, una minúscula y un número';
              }
              
              // Si la contraseña original es válida, verificamos que coincidan
              if (value !== passwordValue) {
                return 'Las contraseñas no coinciden';
              }
              
              return null;
            },
            validateOnChange: true,
            error: passwordError,
            helperText: (formData) => {
              // Solo mostrar mensaje cuando el campo tiene contenido
              if (!formData.confirmarContrasena) return null;
              
              return formData.confirmarContrasena && formData.contrasena === formData.confirmarContrasena ? 
                <span style={{ color: 'green' }}>✓ Las contraseñas coinciden</span> : 
                <span>{passwordError || 'Debe coincidir con la contraseña'}</span>;
            },
            onChange: (value, formData, setFieldValue) => {
              setFieldValue('confirmarContrasena', value);
              handleConfirmPasswordChange(value);
            }
          }
        ]}
        open={createBeneficiarioModalOpen}
        onClose={handleCloseCreateBeneficiarioModal}
        onSubmit={handleCreateBeneficiario}
        loading={loading || clientesLoading}
        maxWidth="md"
        submitButtonText="Crear Beneficiario"
      />
      {/* Snackbar para mostrar alertas */}
      <Snackbar 
        open={alertOpen} 
        autoHideDuration={6000} 
        onClose={handleCloseAlert}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert 
          onClose={handleCloseAlert} 
          severity={alertSeverity} 
          variant="filled"
          sx={{ 
            width: '100%',
            ...(alertSeverity === 'success' && {
              bgcolor: '#2e7d32',
              color: 'white',
              '& .MuiAlert-icon': {
                color: 'white'
              }
            })
          }}
        >
          {alertMessage}
        </Alert>
      </Snackbar>
    </>
  );
};

export default Beneficiarios;