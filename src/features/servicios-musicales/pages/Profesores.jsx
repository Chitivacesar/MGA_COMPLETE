import { useState } from 'react';
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

  // First, define all your constants
  const columns = [
    { id: 'nombres', label: 'Nombres' },
    { id: 'apellidos', label: 'Apellidos' },
    { id: 'tipoDocumento', label: 'Tipo de Documento' },
    { id: 'cc', label: 'Identificación' },
    { id: 'telefono', label: 'Teléfono' },
    { id: 'direccion', label: 'Dirección' },
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

  // Add after columns definition
  const detailFields = [
    { id: 'nombres', label: 'Nombres' },
    { id: 'apellidos', label: 'Apellidos' },
    { id: 'tipoDocumento', label: 'Tipo de Documento' },
    { id: 'cc', label: 'Número de Identificación' },
    { id: 'telefono', label: 'Teléfono' },
    { id: 'direccion', label: 'Dirección' },
    { id: 'especialidad', label: 'Especialidad' },
    { 
      id: 'programacion', 
      label: 'Programación', 
      render: (value) => (
        <Box>
          {value && value.length > 0 ? (
            value.map((prog, idx) => (
              <Chip 
                key={idx} 
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
    { id: 'estado', label: 'Estado', render: (value) => <StatusButton active={value} /> }
  ];

  // Then your state declarations
  // Update initial professors data
  const [professors, setProfessors] = useState([
    {
      id: '123456789',
      nombres: 'Juan Carlos',
      apellidos: 'Pérez Gómez',
      tipoDocumento: 'CC',
      cc: '123456789',
      telefono: '3001234567',
      direccion: 'Calle 123 #45-67',
      email: 'juan.perez@email.com',
      especialidad: ['Piano', 'Guitarra Acústica'],
      estado: true,
      programacion: [
        { dia: 'Lunes', horaInicio: '08:00', horaFin: '12:00' },
        { dia: 'Miércoles', horaInicio: '14:00', horaFin: '18:00' }
      ]
    },
    {
      id: '234567890',
      nombres: 'María José',
      apellidos: 'García López',
      tipoDocumento: 'CC',
      cc: '234567890',
      telefono: '3109876543',
      direccion: 'Carrera 45 #12-34',
      email: 'maria.garcia@email.com',
      especialidad: ['Violín'],
      estado: true,
      programacion: [
        { dia: 'Martes', horaInicio: '09:00', horaFin: '13:00' }
      ]
    },
    {
      id: '345678901',
      nombres: 'Carlos Alberto',
      apellidos: 'Martínez Ruiz',
      tipoDocumento: 'CC',
      cc: '345678901',
      telefono: '3201234567',
      direccion: 'Avenida 67 #89-12',
      email: 'carlos.martinez@email.com',
      especialidad: ['Batería', 'Bajo'],
      estado: true,
      programacion: [
        { dia: 'Jueves', horaInicio: '15:00', horaFin: '19:00' }
      ]
    },
    {
      id: '456789012',
      nombres: 'Ana María',
      apellidos: 'López Castro',
      tipoDocumento: 'CE',
      cc: '456789012',
      telefono: '3159876543',
      direccion: 'Calle 89 #23-45',
      email: 'ana.lopez@email.com',
      especialidad: ['Canto'],
      estado: false,
      programacion: [
        { dia: 'Viernes', horaInicio: '10:00', horaFin: '14:00' }
      ]
    },
    {
      id: '567890123',
      nombres: 'Luis Felipe',
      apellidos: 'Rodríguez Parra',
      tipoDocumento: 'CC',
      cc: '567890123',
      telefono: '3001234567',
      direccion: 'Carrera 12 #34-56',
      email: 'luis.rodriguez@email.com',
      especialidad: ['Saxofón', 'Flauta'],
      estado: true,
      programacion: [
        { dia: 'Sábado', horaInicio: '08:00', horaFin: '12:00' }
      ]
    },
    {
      id: '678901234',
      nombres: 'Patricia',
      apellidos: 'Sánchez Mora',
      tipoDocumento: 'PASS',
      cc: '678901234',
      telefono: '3187654321',
      direccion: 'Avenida 34 #56-78',
      email: 'patricia.sanchez@email.com',
      especialidad: ['Piano'],
      estado: true,
      programacion: [
        { dia: 'Lunes', horaInicio: '14:00', horaFin: '18:00' }
      ]
    },
    {
      id: '789012345',
      nombres: 'Roberto',
      apellidos: 'Díaz Vargas',
      tipoDocumento: 'CC',
      cc: '789012345',
      telefono: '3043216789',
      direccion: 'Calle 56 #78-90',
      email: 'roberto.diaz@email.com',
      especialidad: ['Guitarra Eléctrica', 'Bajo'],
      estado: true,
      programacion: [
        { dia: 'Miércoles', horaInicio: '16:00', horaFin: '20:00' }
      ]
    }
  ]);
  const [selectedProfessor, setSelectedProfessor] = useState(null);
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [formModalOpen, setFormModalOpen] = useState(false);
  const [scheduleModalOpen, setScheduleModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [tempProgramacion, setTempProgramacion] = useState([]);
  const [formData, setFormData] = useState({});

  const handleCreate = () => {
    setIsEditing(false);
    setSelectedProfessor(null);
    setTempProgramacion([]);
    setFormModalOpen(true);
  };

  const handleEdit = (professor) => {
    setIsEditing(true);
    setSelectedProfessor(professor);
    setTempProgramacion(professor.programacion || []);
    setFormModalOpen(true);
  };

  const handleDelete = (professor) => {
    const confirmDelete = window.confirm(`¿Está seguro de eliminar al profesor con Número de Identificación ${professor.cc}?`);
    if (confirmDelete) {
      setProfessors(prev => prev.filter(item => item.id !== professor.id));
    }
  };

  const handleView = (professor) => {
    setSelectedProfessor(professor);
    setDetailModalOpen(true);
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

  // Add tipoDocumento options
  const tiposDocumento = [
    "Cédula de Ciudadanía",
    "Cédula de Extranjería",
    "Pasaporte",
    "Tarjeta de Identidad"
  ];

  const formFields = [
    { 
      id: 'nombres',
      label: 'Nombres', 
      type: 'text',
      required: true
    },
    { 
      id: 'apellidos',
      label: 'Apellidos', 
      type: 'text',
      required: true
    },
    {
      id: 'tipoDocumento',
      label: 'Tipo de Documento',
      type: 'select',
      options: [
        { value: 'CC', label: 'Cédula de Ciudadanía' },
        { value: 'TI', label: 'Tarjeta de Identidad' },
        { value: 'PASS', label: 'Pasaporte' }
      ],
      required: true
    },
    { 
      id: 'cc', 
      label: 'Número de Identificación', 
      type: 'text',
      required: true,
      disabled: isEditing
    },
    { 
      id: 'telefono', 
      label: 'Teléfono', 
      type: 'text',
      required: true
    },
    { 
      id: 'direccion', 
      label: 'Dirección', 
      type: 'text',
      required: true
    },
    { 
      id: 'especialidad', 
      label: 'Especialidades', 
      type: 'multiSelect',
      options: especialidades.map(esp => ({
        value: esp,
        label: esp
      })),
      required: true
    },
    { 
      id: 'email', 
      label: 'Correo Electrónico', 
      type: 'email',
      required: true,
      disabled: isEditing
    },
    ...(!isEditing ? [
      { 
        id: 'password', 
        label: 'Contraseña', 
        type: 'password',
        required: true,
        maxLength: 10,
        validate: (value) => {
          if (value && value.length > 10) {
            return 'La contraseña no debe exceder 10 caracteres';
          }
          return undefined;
        },
        validateOnChange: true,
        onChange: (value, formValues, setFieldValue) => {
          if (formValues.confirmPassword) {
            setFieldValue('confirmPassword', '');
          }
        }
      },
      {
        id: 'confirmPassword',
        label: 'Confirmar Contraseña',
        type: 'password',
        required: true,
        validate: (value, formValues) => {
          if (!value) return 'Este campo es requerido';
          if (value !== formValues.password) {
            return 'Las contraseñas no coinciden';
          }
          return undefined;
        },
        validateOnChange: true
      }
    ] : []),
    { 
      id: 'estado', 
      label: 'Estado', 
      type: 'switch',
      defaultValue: true
    },
    {
      id: 'programacion',
      label: 'Programación',
      type: 'custom',
      render: (onChange, value, formValues) => (
        <Box sx={{ mt: 1 }}>
          <Box sx={{ mb: 1 }}>
            <Calendar programacion={tempProgramacion} />
          </Box>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mb: 1 }}>
            {tempProgramacion.map((prog, idx) => (
              <Chip 
                key={idx} 
                size="small"
                label={`${prog.dia}: ${prog.horaInicio} - ${prog.horaFin}`} 
                onDelete={() => {
                  const newProgramacion = [...tempProgramacion];
                  newProgramacion.splice(idx, 1);
                  setTempProgramacion(newProgramacion);
                }}
              />
            ))}
          </Box>
          <Button 
            variant="outlined" 
            fullWidth 
            onClick={() => handleOpenScheduleModal(formValues)}
          >
            Agregar Programación
          </Button>
        </Box>
      )
    }
  ];

  // Add this state near your other state declarations
  const [alert, setAlert] = useState({
    open: false,
    message: ''
  });
  
  // Update handleSubmit
  const handleSubmit = (formData) => {
    const professorData = {
      ...formData,
      id: formData.cc,
      programacion: tempProgramacion,
      especialidad: Array.isArray(formData.especialidad) ? 
        formData.especialidad : [formData.especialidad]
    };

    if (isEditing) {
      setProfessors(prev => prev.map(item => 
        item.id === selectedProfessor.id ? professorData : item
      ));
      setAlert({
        open: true,
        message: 'Profesor editado correctamente'
      });
    } else {
      setProfessors(prev => [...prev, professorData]);
      setAlert({
        open: true,
        message: 'Profesor creado correctamente'
      });
    }
    handleCloseForm();
  };

  // Add this handler
  const handleCloseAlert = () => {
    setAlert({
      ...alert,
      open: false
    });
  };

  // Add this function before the return statement
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
          doc.text(prof.nombres, 10, yPosition);
          doc.text(prof.apellidos, 50, yPosition);
          doc.text(prof.cc, 90, yPosition);
          doc.text(prof.telefono, 130, yPosition);
          doc.text(Array.isArray(prof.especialidad) ? prof.especialidad.join(', ') : prof.especialidad, 170, yPosition);
          yPosition += 10;
        });
        
        doc.save('profesores.pdf');
      }).catch(error => {
        console.error('Error generating PDF:', error);
      });
    };
  
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
        fields={formFields}
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