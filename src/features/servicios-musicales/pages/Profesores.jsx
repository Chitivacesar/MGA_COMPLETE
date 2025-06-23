import { useState, useEffect } from 'react';
import axios from 'axios';
import { GenericList } from '../../../shared/components/GenericList';
import { DetailModal } from '../../../shared/components/DetailModal';
import { FormModal } from '../../../shared/components/FormModal';
import { StatusButton } from '../../../shared/components/StatusButton';
import { SuccessAlert } from '../../../shared/components/SuccessAlert';
import { PictureAsPdf as PdfIcon } from '@mui/icons-material';
import { createProfessorUser } from '../../../shared/services/professorService';
import { Box, Chip, Select, MenuItem, Checkbox, ListItemText, Button } from '@mui/material';
import { Calendar } from '../components/Calendar';
import { ScheduleModal } from '../components/ScheduleModal';

const Profesores = () => {
  // Define especialidades at the beginning
  const especialidades = [
    "Guitarra Acústica",
    "Guitarra Eléctrica",
    "Piano",
    "Batería",
    "Bajo",
    "Violín",
    "Flauta",
    "Saxofón",
    "Trompeta",
    "Canto"
  ];

  // State declarations
  const [professors, setProfessors] = useState([]);
  const [selectedProfessor, setSelectedProfessor] = useState(null);
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [formModalOpen, setFormModalOpen] = useState(false);
  const [scheduleModalOpen, setScheduleModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [tempProgramacion, setTempProgramacion] = useState([]);
  const [formData, setFormData] = useState({});
  const [alert, setAlert] = useState({
    open: false,
    message: ''
  });

  // Define columns with unique keys
  const columns = [
    { id: 'nombres', label: 'Nombres' },
    { id: 'apellidos', label: 'Apellidos' },
    { id: 'tipoDocumento', label: 'Tipo de Documento' },
    { id: 'identificacion', label: 'Número de Identificación' },
    { id: 'telefono', label: 'Teléfono' },
    { id: 'correo', label: 'Correo' },
    { 
      id: 'estado', 
      label: 'Estado',
      render: (value, row) => (
        <StatusButton 
          key={`status-${row._id}`}
          active={value === 'Activo'} 
          onClick={() => handleToggleStatus(row._id)}
        />
      )
    }
  ];

  // Detail fields configuration
  const detailFields = [
    { id: 'nombres', label: 'Nombres' },
    { id: 'apellidos', label: 'Apellidos' },
    { id: 'tipoDocumento', label: 'Tipo de Documento' },
    { id: 'identificacion', label: 'Número de Identificación' },
    { id: 'telefono', label: 'Teléfono' },
    { id: 'direccion', label: 'Dirección' },
    { id: 'correo', label: 'Correo Electrónico' },
    { 
      id: 'especialidades', 
      label: 'Especialidades',
      render: (value) => (
        <Box>
          {value && value.length > 0 ? (
            value.map((esp, idx) => (
              <Chip 
                key={`detail-especialidad-${idx}`}
                label={esp} 
                sx={{ m: 0.5 }} 
                size="small"
                color="primary"
                variant="outlined"
              />
            ))
          ) : (
            <span>No hay especialidades asignadas</span>
          )}
        </Box>
      )
    },
    { 
      id: 'programacion', 
      label: 'Programación', 
      render: (value) => (
        <Box>
          {value && value.length > 0 ? (
            value.map((prog, idx) => (
              <Chip 
                key={`detail-schedule-${idx}`}
                label={`${prog.dia}: ${prog.horaInicio} - ${prog.horaFin}`} 
                sx={{ m: 0.5 }} 
              />
            ))
          ) : (
            <span>No hay programación asignada</span>
          )}
        </Box>
      )
    },
    { id: 'estado', label: 'Estado', render: (value) => <StatusButton active={value === 'Activo'} /> }
  ];

  // Fetch professors from API with better error handling
  const fetchProfessors = async () => {
    try {
      console.log('Fetching professors...');
      const response = await axios.get('http://localhost:3000/api/profesores');
      console.log('Professors fetched:', response.data);
      setProfessors(response.data);
    } catch (error) {
      console.error('Error fetching professors:', error);
      console.error('Fetch error response:', error.response?.data);
      setAlert({
        open: true,
        message: 'Error al cargar los profesores'
      });
    }
  };

  // Load professors on component mount
  useEffect(() => {
    fetchProfessors();
  }, []);

  const handleCreate = () => {
    setIsEditing(false);
    setSelectedProfessor(null);
    setTempProgramacion([]);
    setFormData({});
    setFormModalOpen(true);
  };

  const handleEdit = (professor) => {
    setIsEditing(true);
    
    // Preparar datos para edición
    const professorForEdit = {
        ...professor,
        // Asegurar que especialidades sea array
        especialidades: Array.isArray(professor.especialidades) 
            ? professor.especialidades 
            : (professor.especialidades ? [professor.especialidades] : []),
        // Convertir estado a boolean para el switch
        estado: professor.estado === 'Activo'
    };
    
    setSelectedProfessor(professorForEdit);
    setTempProgramacion(professor.programacion || []);
    setFormModalOpen(true);
  };

  const handleView = (professor) => {
    setSelectedProfessor(professor);
    setDetailModalOpen(true);
  };

  const handleDelete = async (professor) => {
    const confirmDelete = window.confirm(`¿Está seguro de eliminar al profesor ${professor.nombres} ${professor.apellidos}?`);
    if (confirmDelete) {
      try {
        await axios.delete(`http://localhost:3000/api/profesores/${professor._id}`);
        await fetchProfessors();
        setAlert({
          open: true,
          message: 'Profesor eliminado correctamente'
        });
      } catch (error) {
        console.error('Error deleting professor:', error);
        const errorMessage = error.response?.data?.message || error.response?.data?.details || 'Error al eliminar el profesor';
        setAlert({
          open: true,
          message: errorMessage
        });
      }
    }
  };

  const handleSubmit = async (formData) => {
    try {
      console.log('=== DEBUG HANDLESUBMIT ===');
      console.log('isEditing:', isEditing);
      console.log('formData:', formData);
      console.log('tempProgramacion:', tempProgramacion);
      console.log('========================');

      // Validar campos requeridos básicos
      const requiredFields = ['nombres', 'apellidos', 'tipoDocumento', 'identificacion', 'telefono', 'correo', 'especialidades'];
      const missingFields = requiredFields.filter(field => {
        if (field === 'especialidades') {
          return !formData[field] || (Array.isArray(formData[field]) && formData[field].length === 0);
        }
        return !formData[field] || formData[field].toString().trim() === '';
      });

      if (missingFields.length > 0) {
        setAlert({
          open: true,
          message: `Los campos ${missingFields.join(', ')} son obligatorios`
        });
        return;
      }

      // Validar formato de correo electrónico
      const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
      if (!emailRegex.test(formData.correo)) {
        setAlert({
          open: true,
          message: 'El formato del correo electrónico no es válido'
        });
        return;
      }

      // Preparar datos del profesor según el modelo
      const professorData = {
        nombres: formData.nombres.trim(),
        apellidos: formData.apellidos.trim(),
        tipoDocumento: formData.tipoDocumento,
        identificacion: formData.identificacion.toString().trim(),
        telefono: formData.telefono.trim(),
        correo: formData.correo.trim().toLowerCase(),
        estado: formData.estado ? 'Activo' : 'Inactivo',
        // Asegurar que especialidades sea array
        especialidades: Array.isArray(formData.especialidades) 
          ? formData.especialidades 
          : [formData.especialidades]
      };

      // Agregar dirección solo si se proporciona (es opcional según el modelo)
      if (formData.direccion && formData.direccion.trim()) {
        professorData.direccion = formData.direccion.trim();
      }

      // Agregar programación si existe
      if (tempProgramacion?.length > 0) {
        professorData.programacion = tempProgramacion;
      }

      // Para nuevos profesores, validar y agregar contraseñas
      if (!isEditing) {
        if (!formData.contraseña || !formData.confirmacionContraseña) {
          setAlert({
            open: true,
            message: 'Las contraseñas son obligatorias para nuevos profesores'
          });
          return;
        }

        // Validar longitud mínima de contraseña (según modelo: mínimo 6)
        if (formData.contraseña.length < 6) {
          setAlert({
            open: true,
            message: 'La contraseña debe tener al menos 6 caracteres'
          });
          return;
        }

        if (formData.contraseña !== formData.confirmacionContraseña) {
          setAlert({
            open: true,
            message: 'Las contraseñas no coinciden'
          });
          return;
        }

        professorData.contraseña = formData.contraseña;
        professorData.confirmacionContraseña = formData.confirmacionContraseña;
      }

      console.log('Datos finales a enviar:', professorData);

      // Realizar petición HTTP
      const config = {
        headers: { 'Content-Type': 'application/json' },
        timeout: 30000  // Aumentar a 30 segundos
      };

      if (isEditing) {
        await axios.put(
          `http://localhost:3000/api/profesores/${selectedProfessor._id}`,
          professorData,
          config
        );
        
        setAlert({
          open: true,
          message: 'Profesor actualizado correctamente'
        });
      } else {
        try {
          // Crear el profesor
          const professorResponse = await axios.post(
            'http://localhost:3000/api/profesores',
            professorData,
            config
          );
          
          console.log('Profesor creado:', professorResponse.data);
          
          // Crear el usuario con los mismos datos
          const usuarioData = {
            correo: professorData.correo,
            contrasena: professorData.contraseña,
            confirmacionContrasena: professorData.confirmacionContraseña,
            nombre: professorData.nombres,
            apellido: professorData.apellidos,
            documento: professorData.identificacion,
            estado: professorData.estado === 'Activo'
          };
          
          console.log('Datos de usuario a crear:', usuarioData);
          
          const usuarioResponse = await axios.post(
            'http://localhost:3000/api/usuarios',
            usuarioData,
            config
          );
          
          console.log('Usuario creado:', usuarioResponse.data);
          
          // Obtener el ID del rol de profesor (asumiendo que existe)
          const rolesResponse = await axios.get('http://localhost:3000/api/roles');
          const profesorRol = rolesResponse.data.find(rol => rol.nombre.toLowerCase() === 'profesor');
          
          if (!profesorRol) {
            console.error('No se encontró el rol de profesor');
            throw new Error('No se encontró el rol de profesor');
          }
          
          console.log('Rol de profesor encontrado:', profesorRol);
          
          // Crear la relación usuario_has_rol
          const usuarioHasRolData = {
            usuarioId: usuarioResponse.data._id,
            rolId: profesorRol._id
          };
          
          console.log('Datos de usuario_has_rol a crear:', usuarioHasRolData);
          
          const usuarioHasRolResponse = await axios.post(
            'http://localhost:3000/api/usuarios_has_rol',
            usuarioHasRolData,
            config
          );
          
          console.log('Relación usuario_has_rol creada:', usuarioHasRolResponse.data);
          
          setAlert({
            open: true,
            message: 'Profesor creado correctamente y asignado al rol de profesor'
          });
        } catch (error) {
          console.error('Error en el proceso de creación:', error);
          console.error('Detalles del error:', error.response?.data);
          throw error; // Re-lanzar el error para que sea manejado por el catch exterior
        }
      }

      // Recargar lista y cerrar modal
      await fetchProfessors();
      handleCloseForm();

    } catch (error) {
      console.error('Error saving professor:', error);
      console.error('Error response:', error.response?.data);
      
      // Manejo mejorado de errores
      let errorMessage = 'Error al guardar el profesor';
      
      if (error.response?.data) {
        const errorData = error.response.data;
        if (errorData.details) {
          errorMessage = errorData.details;
        } else if (errorData.message) {
          errorMessage = errorData.message;
        } else if (errorData.error) {
          errorMessage = errorData.error;
        } else if (typeof errorData === 'string') {
          errorMessage = errorData;
        }
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      setAlert({
        open: true,
        message: errorMessage
      });
    }
  };

  const handleToggleStatus = async (professorId) => {
    try {
      const professor = professors.find(p => p._id === professorId);
      if (!professor) return;

      const nuevoEstado = professor.estado === 'Activo' ? 'Inactivo' : 'Activo';
      
      // Actualizar en la API usando el endpoint PATCH para cambiar estado
      await axios.patch(`http://localhost:3000/api/profesores/${professorId}/estado`, { 
        estado: nuevoEstado 
      });

      // Luego actualizar en el frontend
      setProfessors(prevProfessors => prevProfessors.map(p => 
        p._id === professorId ? { ...p, estado: nuevoEstado } : p
      ));

      setAlert({
        open: true,
        message: 'Estado actualizado correctamente'
      });
    } catch (error) {
      console.error('Error updating professor status:', error);
      const errorMessage = error.response?.data?.message || error.response?.data?.details || 'Error al actualizar el estado';
      setAlert({
        open: true,
        message: errorMessage
      });
    }
  };

  const handleCloseDetail = () => {
    setDetailModalOpen(false);
    setSelectedProfessor(null);
  };

  const handleCloseForm = () => {
    setFormModalOpen(false);
    setSelectedProfessor(null);
    setIsEditing(false);
    setTempProgramacion([]);
    setFormData({});
  };

  const handleOpenScheduleModal = (data) => {
    setFormData(data);
    setScheduleModalOpen(true);
  };

  const handleCloseScheduleModal = () => {
    setScheduleModalOpen(false);
  };

  const handleAddSchedule = (schedule) => {
    setTempProgramacion(prev => [...prev, schedule]);
    setScheduleModalOpen(false);
  };

  const handleCloseAlert = () => {
    setAlert({
      ...alert,
      open: false
    });
  };

  const handleExportPdf = () => {
    import('jspdf').then(({ jsPDF }) => {
      const doc = new jsPDF();
      doc.text('Lista de Profesores', 10, 10);
      
      // Add table headers
      doc.setFontSize(12);
      doc.text('Nombres', 10, 20);
      doc.text('Apellidos', 50, 20);
      doc.text('N° ID', 90, 20);
      doc.text('Teléfono', 130, 20);
      doc.text('Especialidad', 170, 20);
      
      // Add table rows
      let yPosition = 30;
      professors.forEach((prof) => {
        doc.text(prof.nombres || '', 10, yPosition);
        doc.text(prof.apellidos || '', 50, yPosition);
        doc.text(prof.identificacion || '', 90, yPosition);
        doc.text(prof.telefono || '', 130, yPosition);
        // Manejar especialidades como array
        const especialidadesText = Array.isArray(prof.especialidades) 
          ? prof.especialidades.join(', ') 
          : (prof.especialidades || '');
        doc.text(especialidadesText, 170, yPosition);
        yPosition += 10;
      });
      
      doc.save('profesores.pdf');
    }).catch(error => {
      console.error('Error generating PDF:', error);
    });
  };

  // Form fields configuration - Función dinámica
  const getFormFields = () => [
    { 
      id: 'nombres',
      label: 'Nombres *',
      type: 'text',
      required: true,
      placeholder: 'Ingrese los nombres'
    },
    { 
      id: 'apellidos',
      label: 'Apellidos *', 
      type: 'text',
      required: true,
      placeholder: 'Ingrese los apellidos'
    },
    {
      id: 'tipoDocumento',
      label: 'Tipo de Documento *',
      type: 'select',
      options: [
        { value: 'CC', label: 'Cédula de Ciudadanía' },
        { value: 'CE', label: 'Cédula de Extranjería' },
        { value: 'TI', label: 'Tarjeta de Identidad' },
        { value: 'PP', label: 'Pasaporte' },
        { value: 'RC', label: 'Registro Civil' },
        { value: 'NIT', label: 'NIT' },
        { value: 'PEP', label: 'PEP' },
        { value: 'DNI', label: 'DNI' }
      ],
      required: true,
      defaultValue: 'CC'
    },
    { 
      id: 'identificacion',
      label: 'Número de Identificación *', 
      type: 'text',
      required: true,
      placeholder: 'Ingrese el número de identificación'
    },
    { 
      id: 'telefono', 
      label: 'Teléfono *', 
      type: 'text',
      required: true,
      placeholder: 'Ingrese el número de teléfono'
    },
    { 
      id: 'direccion', 
      label: 'Dirección', 
      type: 'text',
      required: false,
      placeholder: 'Ingrese la dirección completa (opcional)'
    },
    { 
      id: 'correo',
      label: 'Correo Electrónico *',
      type: 'email',
      required: true,
      placeholder: 'ejemplo@correo.com'
    },
    { 
      id: 'especialidades',
      label: 'Especialidades *',
      type: 'multiSelect',
      options: especialidades.map(esp => ({
        value: esp,
        label: esp
      })),
      required: true
    },
    ...(!isEditing ? [
      { 
        id: 'contraseña',
        label: 'Contraseña *',
        type: 'password',
        required: true,
        placeholder: 'Mínimo 6 caracteres',
        validate: (value) => {
          if (!value) return 'La contraseña es requerida';
          if (value.length < 6) return 'La contraseña debe tener al menos 6 caracteres';
          return undefined;
        }
      },
      {
        id: 'confirmacionContraseña',
        label: 'Confirmar Contraseña *',
        type: 'password',
        required: true,
        placeholder: 'Repita la contraseña',
        validate: (value, formValues) => {
          if (!value) return 'La confirmación de contraseña es requerida';
          if (value !== formValues.contraseña) return 'Las contraseñas no coinciden';
          return undefined;
        }
      }
    ] : []),
    { 
      id: 'estado',
      label: 'Estado',
      type: 'switch',
      defaultValue: true,
      helperText: 'Activo permite al profesor iniciar sesión'
    },
    {
      id: 'programacion',
      label: 'Programación de Horarios',
      type: 'custom',
      render: (onChange, value, formValues) => (
        <Box sx={{ mt: 1 }}>
          <Box sx={{ mb: 2 }}>
            <Calendar programacion={tempProgramacion} />
          </Box>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mb: 2 }}>
            {tempProgramacion.map((prog, idx) => (
              <Chip 
                key={`form-schedule-${idx}`}
                size="small"
                label={`${prog.dia}: ${prog.horaInicio} - ${prog.horaFin}`} 
                onDelete={() => {
                  const newProgramacion = [...tempProgramacion];
                  newProgramacion.splice(idx, 1);
                  setTempProgramacion(newProgramacion);
                }}
                color="primary"
                variant="outlined"
              />
            ))}
          </Box>
          <Button 
            variant="outlined" 
            fullWidth 
            onClick={() => handleOpenScheduleModal(formValues)}
            color="primary"
          >
            Agregar Horario
          </Button>
        </Box>
      )
    }
  ];
  
  return (
    <>
      <GenericList
        data={professors}
        columns={columns}
        onEdit={handleEdit}
        onDelete={handleDelete}
        onCreate={handleCreate}
        onView={handleView}
        onExportPdf={handleExportPdf}
        title="Gestión de Profesores"
      />
      
      <DetailModal
        title={`Detalle del Profesor ${selectedProfessor?.nombres} ${selectedProfessor?.apellidos}`}
        data={selectedProfessor}
        fields={detailFields}
        open={detailModalOpen}
        onClose={handleCloseDetail}
      />

      <FormModal
        title={isEditing ? 'Editar Profesor' : 'Crear Nuevo Profesor'}
        fields={getFormFields()}
        initialData={selectedProfessor}
        open={formModalOpen}
        onClose={handleCloseForm}
        onSubmit={handleSubmit}
        maxWidth="md"
        fullWidth={true}
        contentProps={{
          sx: { 
            maxHeight: '80vh',
            overflowY: 'auto'
          }
        }}
      />

      <ScheduleModal
        open={scheduleModalOpen}
        onClose={handleCloseScheduleModal}
        onSubmit={handleAddSchedule}
      />
      
      <SuccessAlert
        open={alert.open}
        message={alert.message}
        onClose={handleCloseAlert}
      />
    </>
  );
};

export default Profesores;