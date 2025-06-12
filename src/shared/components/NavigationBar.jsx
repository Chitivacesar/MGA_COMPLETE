import { AppBar, Toolbar, Typography, Avatar, IconButton, Box } from '@mui/material';
import { 
  AdminPanelSettings as AdminIcon,
  School as TeacherIcon,
  Person as StudentIcon,
  Person
} from '@mui/icons-material';
import { useAuth } from '../../features/auth/context/AuthContext';

export function NavigationBar() {
  const defaultUser = {
    name: 'Administrador',
    role: 'admin',
    avatar: null
  };

  const { user } = useAuth();
  const currentUser = user || defaultUser;

  const getRoleIcon = () => {
    switch (currentUser.role) {
      case 'admin':
        return <AdminIcon />;
      case 'teacher':
        return <TeacherIcon />;
      case 'student':
        return <StudentIcon />;
      default:
        return <Person />;
    }
  };

  const getPanelName = () => {
    switch (currentUser.role) {
      case 'admin':
        return 'Panel de Administración';
      case 'teacher':
        return 'Panel de Profesor';
      case 'student':
        return 'Panel de Estudiante';
      default:
        return 'Panel Principal';
    }
  };

  return (
    <AppBar 
      position="fixed" 
      sx={{ 
        backgroundColor: '#0455a2',
        width: 'calc(100% - 280px)',
        marginLeft: '280px',
        zIndex: 1100
      }}
    >
      <Toolbar>
        <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
          {getPanelName()}
        </Typography>
        
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Typography variant="body1">
            {currentUser.name}
          </Typography>
          <IconButton color="inherit">
            {getRoleIcon()}
          </IconButton>
        </Box>
      </Toolbar>
    </AppBar>
  );
}