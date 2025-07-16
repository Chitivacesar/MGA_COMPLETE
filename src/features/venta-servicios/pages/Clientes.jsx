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
  const [formData, setFormData] = useState({});
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    fetchClientes();
  }, []);

  const fetchClientes = async () => {
    try {
      // Obtener beneficiarios
      const beneficiariosResponse = await axios.get('http://localhost:3000/api/beneficiarios');
      const beneficiarios = beneficiariosResponse.data;
      
      // Obtener usuarios_has_rol
      const usuariosHasRolResponse = await axios.get('http://localhost:3000/api/usuarios_has_rol');
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
          id: cliente._id,
          nombre: cliente.nombre,
          apellido: cliente.apellido,
          tipoDocumento: cliente.tipo_de_documento,
          numeroDocumento: cliente.numero_de_documento,
          fechaNacimiento: cliente.fechaDeNacimiento,
          direccion: cliente.direccion,
          telefono: cliente.telefono,
          correo: correo,
          esBeneficiario: cliente.esBeneficiario || false,
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
    // Mapear los campos del cliente a los IDs de los campos del formulario
    const clienteMapeado = {
      id: cliente.id,
      nombre: cliente.nombre,
      apellido: cliente.apellido,
      tipo_de_documento: cliente.tipoDocumento,
      numero_de_documento: cliente.numeroDocumento,
      fechaDeNacimiento: cliente.fechaNacimiento,
      direccion: cliente.direccion,
      telefono: cliente.telefono,
      correo: cliente.correo,
      esBeneficiario: cliente.esBeneficiario || false,
      estado: cliente.estado,
      // No incluimos contraseña ni confirmar_contraseña ya que son campos que se llenarán solo si se quieren cambiar
    };
    setSelectedCliente(clienteMapeado);
    setFormModalOpen(true);
  };

  const handleSubmit = async (formData) => {
    try {
      // Crear una copia de formData sin el campo confirmar_contrasena
      const { confirmar_contrasena, ...formDataSinConfirmacion } = formData;
      
      // Validar que el número de documento tenga el formato correcto (6-15 dígitos)
      const numeroDocumentoLimpio = formDataSinConfirmacion.numero_de_documento.toString().replace(/\D/g, '');
      if (numeroDocumentoLimpio.length < 6 || numeroDocumentoLimpio.length > 15) {
        alert('El número de documento debe tener entre 6 y 15 dígitos numéricos.');
        return;
      }
      
      // Asignar el valor limpio
      formDataSinConfirmacion.numero_de_documento = numeroDocumentoLimpio;
      
      if (isEditing) {
        // Lógica de edición
        try {
          // Actualizar el beneficiario
          await axios.put(`http://localhost:3000/api/beneficiarios/${selectedCliente.id}`, {
            nombre: formDataSinConfirmacion.nombre,
            apellido: formDataSinConfirmacion.apellido,
            tipo_de_documento: formDataSinConfirmacion.tipo_de_documento,
            numero_de_documento: formDataSinConfirmacion.numero_de_documento,
            fechaDeNacimiento: formDataSinConfirmacion.fechaDeNacimiento,
            direccion: formDataSinConfirmacion.direccion,
            telefono: formDataSinConfirmacion.telefono,
            esBeneficiario: formDataSinConfirmacion.esBeneficiario || false
          });
          
          // Primero necesitamos obtener el usuario_has_rol para conseguir el usuarioId
          const beneficiarioResponse = await axios.get(`http://localhost:3000/api/beneficiarios/${selectedCliente.id}`);
          const beneficiario = beneficiarioResponse.data;
          
          const usuarioHasRolResponse = await axios.get(`http://localhost:3000/api/usuarios_has_rol/${beneficiario.usuario_has_rolId}`);
          const usuarioHasRol = usuarioHasRolResponse.data;
          
          // Obtener los datos actuales del usuario
          const usuarioResponse = await axios.get(`http://localhost:3000/api/usuarios/${usuarioHasRol.usuarioId}`);
          const usuarioActual = usuarioResponse.data.usuario;
          
          // Preparar los datos de actualización manteniendo los valores existentes
          const usuarioUpdateData = {
            nombre: formDataSinConfirmacion.nombre,
            apellido: formDataSinConfirmacion.apellido,
            tipo_de_documento: formDataSinConfirmacion.tipo_de_documento,
            documento: numeroDocumentoLimpio, // Usar el valor ya validado y limpiado
            correo: formDataSinConfirmacion.correo,
            estado: usuarioActual.estado,
            rol: usuarioActual.rol // Mantener el rol existente
          };
          
          // Agregar contraseña solo si se proporcionó una nueva
          if (formDataSinConfirmacion.contrasena) {
            usuarioUpdateData.contrasena = formDataSinConfirmacion.contrasena;
          }
          
          // Actualizar el usuario con todos los datos necesarios
          await axios.put(`http://localhost:3000/api/usuarios/${usuarioHasRol.usuarioId}`, usuarioUpdateData);
        } catch (error) {
          console.error('Error al actualizar el cliente:', error);
          throw error; // Re-lanzar el error para que sea capturado por el catch exterior
        }
      } else {
        // Step 1: Create User
        const usuarioData = {
          nombre: formDataSinConfirmacion.nombre,
          apellido: formDataSinConfirmacion.apellido,
          correo: formDataSinConfirmacion.correo,
          contrasena: formDataSinConfirmacion.contrasena,
          tipo_de_documento: formDataSinConfirmacion.tipo_de_documento,
          documento: numeroDocumentoLimpio, // Usar el valor ya validado y limpiado
        };
        const usuarioResponse = await axios.post('http://localhost:3000/api/usuarios', usuarioData);
        const usuarioId = usuarioResponse.data._id;

        // Step 2: Get Role ID
        console.log('Obteniendo roles...');
        const rolesResponse = await axios.get('http://localhost:3000/api/roles');
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
        const clienteRol = roles.find(rol => rol.nombre === 'Cliente');
        if (!clienteRol) {
          throw new Error('Rol "Cliente" not found');
        }
        console.log('Rol de cliente encontrado:', clienteRol);

        // Step 3: Create UsuarioHasRol
        console.log('Creando relación usuario-rol...');
        const usuarioHasRolData = {
          usuarioId: usuarioId,
          rolId: clienteRol._id
        };
        console.log('Datos para crear usuario_has_rol:', usuarioHasRolData);
        
        const usuarioHasRolResponse = await axios.post('http://localhost:3000/api/usuarios_has_rol', usuarioHasRolData);
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

        // Step 4: Create Beneficiario
        // Asegurarse de que estamos enviando todos los campos requeridos
        const beneficiarioData = {
          nombre: formDataSinConfirmacion.nombre,
          apellido: formDataSinConfirmacion.apellido,
          tipo_de_documento: formDataSinConfirmacion.tipo_de_documento,
          numero_de_documento: numeroDocumentoLimpio,
          telefono: formDataSinConfirmacion.telefono,
          direccion: formDataSinConfirmacion.direccion,
          fechaDeNacimiento: formDataSinConfirmacion.fechaDeNacimiento,
          usuario_has_rolId: usuario_has_rolId,
          clienteId: 'cliente' // Default value
        };
        
        console.log('Datos del beneficiario a crear:', beneficiarioData);
        const beneficiarioResponse = await axios.post('http://localhost:3000/api/beneficiarios', beneficiarioData);
        const newBeneficiario = beneficiarioResponse.data;

        if (formDataSinConfirmacion.esBeneficiario) {
          await axios.put(`http://localhost:3000/api/beneficiarios/${newBeneficiario._id}`, {
            clienteId: newBeneficiario._id
          });
        }
      }

      fetchClientes();
      handleCloseForm();
    } catch (error) {
      console.error('Error al guardar el cliente:', error);
      
      // Mostrar información detallada del error para depuración
      if (error.response) {
        // La solicitud fue realizada y el servidor respondió con un código de estado
        // que está fuera del rango 2xx
        console.error('Datos del error:', {
          data: error.response.data,
          status: error.response.status,
          headers: error.response.headers
        });
        alert(`Error ${error.response.status}: ${error.response.data.message || 'Error al guardar el cliente'}`);
      } else if (error.request) {
        // La solicitud fue realizada pero no se recibió respuesta
        console.error('Error de solicitud:', error.request);
        alert('No se recibió respuesta del servidor. Verifique su conexión.');
      } else {
        // Algo ocurrió al configurar la solicitud que desencadenó un error
        console.error('Error de configuración:', error.message);
        console.error('Stack trace:', error.stack);
        alert(`Error: ${error.message}`);
      }
    }
  };

  const handleDelete = async (cliente) => {
    const confirmDelete = window.confirm(`¿Está seguro de eliminar el cliente ${cliente.nombre}?`);
    if (confirmDelete) {
      try {
        await axios.delete(`http://localhost:3000/api/beneficiarios/${cliente.id}`);
        fetchClientes();
      } catch (error) {
        console.error('Error al eliminar el cliente:', error);
        
        // Mostrar mensaje de error específico si el cliente está asociado a ventas
        if (error.response && error.response.status === 400) {
          // Asegurarse de que se muestra el mensaje correcto
          const errorMessage = 'No se puede eliminar el cliente porque está asociado a una venta de curso o matrícula';
          alert(errorMessage);
        } else {
          alert('Error al eliminar el cliente. Por favor, inténtelo de nuevo.');
        }
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

      await axios.put(`http://localhost:3000/api/beneficiarios/${clienteId}`, {
        ...cliente,
        estado: updatedStatus
      });

      fetchClientes();
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
    {
      id: 'estado',
      label: 'Estado',
      render: (value, row) => (
        <StatusButton
          active={value}
          onClick={() => handleToggleStatus(row?.id)}
        />
      )
    }
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
    {
      id: 'estado',
      label: 'Estado',
      render: (value, row) => (
        <StatusButton
          active={value}
          onClick={() => handleToggleStatus(row?.id)}
        />
      )
    }
  ];

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
        onCreate={handleCreate}
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
        open={formModalOpen}
        onClose={handleCloseForm}
        onSubmit={handleSubmit}
        initialData={selectedCliente}
        isEditing={isEditing}
        title={isEditing ? 'Editar Cliente' : 'Crear Nuevo Cliente'}
        fields={[
          { id: 'nombre', label: 'Nombre', type: 'text', required: true, section: 'datos_personales' },
          { id: 'apellido', label: 'Apellido', type: 'text', required: true, section: 'datos_personales' },
          { id: 'correo', label: 'Correo', type: 'email', required: true, section: 'datos_contacto' },
          { 
            id: 'contrasena', 
            label: 'Contraseña', 
            type: 'password', 
            required: !isEditing, 
            section: 'datos_contacto',
            validate: (value) => {
              if (!value) return null; // La validación de campo requerido ya se maneja automáticamente
              
              if (value.length < 8) {
                return 'La contraseña debe tener al menos 8 caracteres';
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
            validateOnChange: true
          },
          { 
            id: 'confirmar_contrasena', 
            label: 'Confirmar Contraseña', 
            type: 'password', 
            required: !isEditing, 
            section: 'datos_contacto',
            validate: (value, formData) => {
              if (!value) return null; // La validación de campo requerido ya se maneja automáticamente
              
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
            validateOnChange: true
          },
          { 
            id: 'tipo_de_documento', 
            label: 'Tipo de Documento', 
            type: 'select', 
            required: true, 
            section: 'datos_personales',
            options: [
              { value: 'TI', label: 'TI' },
              { value: 'CC', label: 'CC' },
              { value: 'CE', label: 'CE' },
              { value: 'PP', label: 'PP' },
              { value: 'NIT', label: 'NIT' }
            ]
          },
          { id: 'numero_de_documento', label: 'Número de Documento', type: 'text', required: true, section: 'datos_personales' },
          { id: 'telefono', label: 'Teléfono', type: 'text', required: true, section: 'datos_contacto' },
          { id: 'direccion', label: 'Dirección', type: 'text', required: true, section: 'datos_contacto' },
          { id: 'fechaDeNacimiento', label: 'Fecha de Nacimiento', type: 'date', required: true, section: 'datos_personales' },
          { id: 'esBeneficiario', label: '¿Es también beneficiario?', type: 'checkbox', section: 'datos_adicionales' }
        ]}
      />
    </>
  );
};

export default Clientes;