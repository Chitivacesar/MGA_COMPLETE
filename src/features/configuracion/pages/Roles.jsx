import { useState, useEffect } from 'react';
import axios from 'axios';
import { GenericList2 } from "../../../shared/components/genericlist2";
import { DetailModal } from '../../../shared/components/DetailModal';
import { StatusButton } from '../../../shared/components/StatusButton';
import { FormModal } from '../../../shared/components/formModal2';
import { SuccessAlert } from '../../../shared/components/SuccessAlert';

const Roles = () => {
  // Estados
  const [roles, setRoles] = useState([]);
  const [selectedRol, setSelectedRol] = useState(null);
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [formModalOpen, setFormModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [permisos, setPermisos] = useState([]); // Los módulos disponibles
  const [privilegios, setPrivilegios] = useState([]); // Las acciones disponibles
  const [rolPermisoPrivilegio, setRolPermisoPrivilegio] = useState([]); // Relaciones completas
  const [alert, setAlert] = useState({
    open: false,
    message: ''
  });

  // Función para obtener las relaciones rol-permiso-privilegio
  const fetchRolPermisoPrivilegio = async () => {
    try {
      const response = await axios.get('http://localhost:3000/api/rol-permiso-privilegios?populate=rolId,permisoId,privilegioId');
      console.log('Relaciones rol-permiso-privilegio cargadas:', response.data);
      setRolPermisoPrivilegio(response.data);
    } catch (error) {
      console.error('Error al cargar relaciones rol-permiso-privilegio:', error);
    }
  };

  // Función para transformar permisos del formulario a IDs de permisos y privilegios
  const transformPermisosToIds = (permisosFormulario, permisosDisponibles, privilegiosDisponibles) => {
    console.log('=== TRANSFORMANDO PERMISOS ===');
    console.log('Permisos del formulario:', permisosFormulario);
    
    const permisosIds = [];
    const privilegiosIds = [];
    
    // Verificar que permisosFormulario sea un array
    if (!Array.isArray(permisosFormulario)) {
      console.error('permisosFormulario no es un array:', permisosFormulario);
      return { permisosIds: [], privilegiosIds: [] };
    }
    
    // Filtrar módulos con permisos seleccionados
    const permisosSeleccionados = permisosFormulario.filter(permiso => 
      permiso.ver || permiso.crear || permiso.editar || permiso.eliminar || permiso.descargar
    );
    
    permisosSeleccionados.forEach(permisoForm => {
      // Buscar el ID del módulo
      const permisoModulo = permisosDisponibles.find(p => 
        p.permiso === permisoForm.modulo || p.nombre === permisoForm.modulo
      );
      
      if (permisoModulo?._id) {
        permisosIds.push(permisoModulo._id);
        
        // Agregar IDs de privilegios seleccionados
        if (permisoForm.ver) {
          const privilegioVer = privilegiosDisponibles.find(p => 
            p.nombre_privilegio === 'Ver' || p.nombre === 'Ver'
          );
          if (privilegioVer?._id) privilegiosIds.push(privilegioVer._id);
        }
        
        if (permisoForm.crear) {
          const privilegioCrear = privilegiosDisponibles.find(p => 
            p.nombre_privilegio === 'Crear' || p.nombre === 'Crear'
          );
          if (privilegioCrear?._id) privilegiosIds.push(privilegioCrear._id);
        }
        
        if (permisoForm.editar) {
          const privilegioEditar = privilegiosDisponibles.find(p => 
            p.nombre_privilegio === 'Editar' || p.nombre === 'Editar'
          );
          if (privilegioEditar?._id) privilegiosIds.push(privilegioEditar._id);
        }
        
        if (permisoForm.eliminar) {
          const privilegioEliminar = privilegiosDisponibles.find(p => 
            p.nombre_privilegio === 'Eliminar' || p.nombre === 'Eliminar'
          );
          if (privilegioEliminar?._id) privilegiosIds.push(privilegioEliminar._id);
        }
        
        if (permisoForm.descargar) {
          const privilegioDescargar = privilegiosDisponibles.find(p => 
            p.nombre_privilegio === 'Descargar' || p.nombre === 'Descargar'
          );
          if (privilegioDescargar?._id) privilegiosIds.push(privilegioDescargar._id);
        }
      }
    });
    
    // Eliminar duplicados
    const permisosUnicos = [...new Set(permisosIds)];
    const privilegiosUnicos = [...new Set(privilegiosIds)];
    
    return { 
      permisosIds: permisosUnicos,
      privilegiosIds: privilegiosUnicos
    };
  };

  // Función para obtener permisos y privilegios de un rol específico usando las relaciones
  const getPermisosPrivilegiosDelRol = (rolId) => {
    // Filtrar relaciones por rol
    const relacionesDelRol = rolPermisoPrivilegio.filter(relacion => 
      relacion.rolId?._id === rolId || relacion.rolId === rolId
    );

    // Agrupar privilegios por permiso
    const permisosConPrivilegios = {};
    
    relacionesDelRol.forEach(relacion => {
      const permisoId = relacion.permisoId?._id || relacion.permisoId;
      const privilegio = relacion.privilegioId;
      
      if (!permisosConPrivilegios[permisoId]) {
        // Buscar el permiso completo en la lista de permisos
        const permisoCompleto = permisos.find(p => p._id === permisoId);
        permisosConPrivilegios[permisoId] = {
          permiso: permisoCompleto,
          privilegios: []
        };
      }
      
      if (privilegio) {
        permisosConPrivilegios[permisoId].privilegios.push(privilegio);
      }
    });

    return Object.values(permisosConPrivilegios);
  };

  // Función para obtener los roles
  const fetchRoles = async () => {
    try {
      const response = await axios.get('http://localhost:3000/api/roles?populate=permisos,privilegios');
      console.log('Roles cargados:', response.data);
      setRoles(response.data);
    } catch (error) {
      console.error('Error al cargar roles:', error);
      setAlert({
        open: true,
        message: 'Error al cargar los roles'
      });
    }
  };

  // Función para obtener permisos (módulos)
  const fetchPermisos = async () => {
    try {
      const response = await axios.get('http://localhost:3000/api/permisos');
      console.log('Permisos (módulos) cargados:', response.data);
      setPermisos(response.data);
    } catch (error) {
      console.error('Error al cargar permisos:', error);
    }
  };

  // Función para obtener privilegios (acciones)
  const fetchPrivilegios = async () => {
    try {
      const response = await axios.get('http://localhost:3000/api/privilegios');
      console.log('Privilegios (acciones) cargados:', response.data);
      setPrivilegios(response.data);
    } catch (error) {
      console.error('Error al cargar privilegios:', error);
    }
  };

  useEffect(() => {
    fetchRoles();
    fetchPermisos();
    fetchPrivilegios();
    fetchRolPermisoPrivilegio();
  }, []);

  // Función para cambiar el estado
  const handleToggleStatus = async (rolId) => {
    try {
      const rol = roles.find(r => r._id === rolId);
      if (!rol) return;

      const nuevoEstado = !rol.estado;
      
      // Actualizar en el frontend primero
      setRoles(prevRoles => prevRoles.map(r => 
        r._id === rolId ? { ...r, estado: nuevoEstado } : r
      ));

      // Preparar datos para actualización
      const updateData = {
        nombre: rol.nombre,
        descripcion: rol.descripcion,
        estado: nuevoEstado,
        permisos: rol.permisos?.map(p => p._id) || [],      // IDs de módulos
        privilegios: rol.privilegios?.map(p => p._id) || [] // IDs de acciones
      };

      // Actualizar en la API
      await axios.put(`http://localhost:3000/api/roles/${rolId}`, updateData);

      setAlert({
        open: true,
        message: 'Estado actualizado correctamente'
      });
    } catch (error) {
      // Revertir cambios en caso de error
      fetchRoles();
      
      console.error('Error al actualizar estado del rol:', error);
      setAlert({
        open: true,
        message: 'Error al actualizar el estado'
      });
    }
  };

  // Función para eliminar un rol
  const handleDelete = async (rol) => {
    const confirmDelete = window.confirm(`¿Está seguro de eliminar el rol ${rol.nombre}?`);
    if (confirmDelete) {
      try {
        await axios.delete(`http://localhost:3000/api/roles/${rol._id}`);
        await fetchRoles();
        setAlert({
          open: true,
          message: 'Rol eliminado correctamente'
        });
      } catch (error) {
        console.error('Error al eliminar rol:', error);
        setAlert({
          open: true,
          message: 'Error al eliminar el rol'
        });
      }
    }
  };

  // Función para manejar el envío del formulario
  const handleSubmit = async (formData) => {
    try {
      console.log('=== INICIANDO ENVÍO DE FORMULARIO ===');
      console.log('Datos del formulario recibidos:', JSON.stringify(formData, null, 2));
      
      // Validar que los datos existan
      if (!formData) {
        setAlert({
          open: true,
          message: 'No se recibieron datos del formulario'
        });
        return;
      }

      // Extraer y limpiar los datos
      const nombre = formData.nombre?.toString().trim();
      const descripcion = formData.descripcion?.toString().trim();
      
      // Validaciones
      if (!nombre || nombre.length < 3) {
        setAlert({
          open: true,
          message: 'El nombre es obligatorio y debe tener al menos 3 caracteres'
        });
        return;
      }

      if (!descripcion || descripcion.length < 10) {
        setAlert({
          open: true,
          message: 'La descripción es obligatoria y debe tener al menos 10 caracteres'
        });
        return;
      }

      // Validar estructura de permisos
      if (!formData.permisos) {
        setAlert({
          open: true,
          message: 'Error: No se encontraron datos de permisos'
        });
        return;
      }

      // Convertir permisos a array si es necesario
      let permisosArray = [];
      if (Array.isArray(formData.permisos)) {
        permisosArray = formData.permisos;
      } else if (typeof formData.permisos === 'object') {
        permisosArray = Object.values(formData.permisos);
      } else {
        setAlert({
          open: true,
          message: 'Error en la estructura de permisos'
        });
        return;
      }

      console.log('Permisos como array:', permisosArray);

      // Verificar que tenemos permisos y privilegios disponibles
      if (!permisos || permisos.length === 0) {
        setAlert({
          open: true,
          message: 'Error: No se han cargado los permisos disponibles'
        });
        return;
      }

      if (!privilegios || privilegios.length === 0) {
        setAlert({
          open: true,
          message: 'Error: No se han cargado los privilegios disponibles'
        });
        return;
      }

      // Transformar permisos a IDs de privilegios
      const { permisosIds, privilegiosIds } = transformPermisosToIds(
        permisosArray,
        permisos,
        privilegios
      );

      if (permisosIds.length === 0 || privilegiosIds.length === 0) {
        setAlert({
          open: true,
          message: 'Debe seleccionar al menos un permiso con sus privilegios'
        });
        return;
      }

      // Preparar datos para envío
      const dataToSend = {
        nombre: nombre,
        descripcion: descripcion,
        estado: formData.estado !== undefined ? Boolean(formData.estado) : true,
        permisos: permisosIds,
        privilegios: privilegiosIds
      };

      console.log('Datos preparados para envío:', JSON.stringify(dataToSend, null, 2));

      // Configurar headers
      const config = {
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        timeout: 10000
      };

      let response;
      if (isEditing && selectedRol?._id) {
        console.log('Actualizando rol existente...');
        response = await axios.put(
          `http://localhost:3000/api/roles/${selectedRol._id}`, 
          dataToSend,
          config
        );
        setAlert({
          open: true,
          message: 'Rol actualizado correctamente'
        });
      } else {
        console.log('Creando nuevo rol...');
        response = await axios.post(
          'http://localhost:3000/api/roles', 
          dataToSend,
          config
        );
        setAlert({
          open: true,
          message: 'Rol creado correctamente'
        });
      }

      console.log('Respuesta del servidor:', response.data);
      console.log('=== ENVÍO EXITOSO ===');
      
      // Actualizar la lista y cerrar modal
      await fetchRoles();
      await fetchRolPermisoPrivilegio(); // Actualizar también las relaciones
      handleCloseForm();

    } catch (error) {
      console.error('=== ERROR AL ENVIAR DATOS ===');
      console.error('Error completo:', error);
      
      let errorMessage = 'Error al guardar el rol';
      
      if (error.code === 'ECONNABORTED') {
        errorMessage = 'Tiempo de espera agotado. Verifique la conexión con el servidor.';
      } else if (error.response) {
        console.error('Status:', error.response.status);
        console.error('Datos del error:', error.response.data);
        
        // Mostrar más detalles del error de validación
        if (error.response.status === 400) {
          if (error.response.data?.message) {
            errorMessage = `Error de validación: ${error.response.data.message}`;
          } else if (error.response.data?.details) {
            errorMessage = error.response.data.details;
          } else if (error.response.data?.errors) {
            // Si hay errores de validación específicos
            const errores = Object.values(error.response.data.errors).join(', ');
            errorMessage = `Errores de validación: ${errores}`;
          } else {
            errorMessage = 'Datos inválidos. Verifique la información ingresada.';
          }
        } else if (error.response.status === 409) {
          errorMessage = 'Ya existe un rol con ese nombre.';
        } else if (error.response.status === 500) {
          errorMessage = 'Error interno del servidor.';
        } else {
          errorMessage = `Error del servidor: ${error.response.status}`;
        }
      } else if (error.request) {
        errorMessage = 'No se pudo conectar con el servidor. Verifique que esté ejecutándose.';
      } else {
        errorMessage = `Error de configuración: ${error.message}`;
      }
      
      console.error('=== FIN ERROR ===');
      
      setAlert({
        open: true,
        message: errorMessage
      });
    }
  };

  // Funciones auxiliares para manejar modales
  const handleEdit = (rol) => {
    setIsEditing(true);
    setSelectedRol(rol);
    setFormModalOpen(true);
  };

  const handleView = (rol) => {
    setSelectedRol(rol);
    setDetailModalOpen(true);
  };

  const handleCloseDetail = () => {
    setDetailModalOpen(false);
    setSelectedRol(null);
  };

  const handleCloseForm = () => {
    setFormModalOpen(false);
    setSelectedRol(null);
    setIsEditing(false);
  };

  const handleCloseAlert = () => {
    setAlert({
      ...alert,
      open: false
    });
  };

  // Definición de columnas para la tabla
  const columns = [
    { id: 'nombre', label: 'Nombre del Rol' },
    { id: 'descripcion', label: 'Descripción' },
    { 
      id: 'estado', 
      label: 'Estado',
      render: (value, row) => (
        <StatusButton 
          active={value === true}
          onClick={() => handleToggleStatus(row._id)}
        />
      )
    }
  ];

  // Campos para el modal de detalles
  const detailFields = [
    { id: 'nombre', label: 'Nombre del Rol' },
    { id: 'descripcion', label: 'Descripción' },
    { id: 'estado', label: 'Estado', render: (value) => <StatusButton active={value === true} /> },
    { 
      id: 'permisos_privilegios', 
      label: 'Permisos y Privilegios',
      render: (value, data) => {
        if (!data._id) return 'No hay permisos asignados';
        
        const permisosPrivilegios = getPermisosPrivilegiosDelRol(data._id);
        
        if (permisosPrivilegios.length === 0) {
          return 'No hay permisos asignados';
        }
        
        return (
          <div style={{ maxHeight: '300px', overflowY: 'auto' }}>
            {permisosPrivilegios.map((item, index) => (
              <div key={index} style={{ marginBottom: '15px', padding: '10px', border: '1px solid #e0e0e0', borderRadius: '5px' }}>
                <strong style={{ color: '#2c3e50', fontSize: '14px' }}>
                  {item.permiso?.permiso || item.permiso?.nombre || 'Permiso sin nombre'}
                </strong>
                <div style={{ marginTop: '5px', paddingLeft: '10px' }}>
                  {item.privilegios.map((privilegio, privIndex) => (
                    <span 
                      key={privIndex}
                      style={{ 
                        display: 'inline-block',
                        backgroundColor: '#3498db',
                        color: 'white',
                        padding: '2px 8px',
                        borderRadius: '12px',
                        fontSize: '12px',
                        marginRight: '5px',
                        marginBottom: '3px'
                      }}
                    >
                      {privilegio.nombre_privilegio || privilegio.nombre}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        );
      }
    }
  ];

  // Campos para el formulario
  const formFields = [
    { 
      id: 'nombre', 
      label: 'Nombre del Rol', 
      type: 'text',
      required: true,
      disabled: isEditing,
      minLength: 3,
      maxLength: 50,
      placeholder: 'Ej: Administrador, Usuario, Editor'
    },
    { 
      id: 'descripcion', 
      label: 'Descripción', 
      type: 'text',
      required: true,
      minLength: 10,
      maxLength: 200,
      placeholder: 'Ej: Rol con acceso completo al sistema de administración'
    },
    { 
      id: 'permisos',
      label: 'Permisos',
      type: 'table',
      required: true,
      columns: [
        { id: 'modulo', label: 'Módulo' },
        { id: 'ver', label: 'Ver', type: 'checkbox' },
        { id: 'crear', label: 'Crear', type: 'checkbox' },
        { id: 'editar', label: 'Editar', type: 'checkbox' },
        { id: 'eliminar', label: 'Eliminar', type: 'checkbox' },
        { id: 'descargar', label: 'Descargar', type: 'checkbox' }
      ],
      // Usar los permisos (módulos) para generar las filas
      rows: permisos.length > 0 ? permisos.map(permiso => ({
        modulo: permiso.permiso || permiso.nombre,
        ver: false,
        crear: false,
        editar: false,
        eliminar: false,
        descargar: false
      })) : [],
      validate: (value) => {
        if (!value || !Object.values(value).some(row => 
          row.ver || row.crear || row.editar || row.eliminar || row.descargar
        )) {
          return 'Debe seleccionar al menos un permiso';
        }
        return null;
      }
    },
    { 
      id: 'estado', 
      label: 'Estado', 
      type: 'switch',
      defaultValue: true
    }
  ];

  return (
    <>
      <GenericList2
        data={roles}
        columns={columns}
        onEdit={handleEdit}
        onDelete={handleDelete}
        onView={handleView}
        title="Gestión de Roles"
      />
      
      <DetailModal
        title={`Detalle del Rol ${selectedRol?.nombre || ''}`}
        data={selectedRol}
        fields={detailFields}
        open={detailModalOpen}
        onClose={handleCloseDetail}
      />

      <FormModal
        title={isEditing ? 'Editar Rol' : 'Crear Nuevo Rol'}
        fields={formFields}
        initialData={selectedRol}
        open={formModalOpen}
        onClose={handleCloseForm}
        onSubmit={handleSubmit}
      />
      
      <SuccessAlert
        open={alert.open}
        message={alert.message}
        onClose={handleCloseAlert}
      />
    </>
  );
};

export default Roles;