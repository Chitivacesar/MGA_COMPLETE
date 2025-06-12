import React, { useState, useEffect } from 'react';
import { 
  Dialog, 
  DialogActions, 
  Button, 
  Typography, 
  Box,
  IconButton,
  Table,
  TableBody,
  TableRow,
  TableCell,
  TableHead,
  Checkbox,
  FormControlLabel,
  Switch
} from '@mui/material';
import { Close as CloseIcon } from '@mui/icons-material';

export const RolePrivilegeAssignment = ({ 
  open, 
  onClose, 
  role,
  allPrivileges,
  onSave
}) => {
  const [selectedPrivileges, setSelectedPrivileges] = useState([]);
  const [selectAll, setSelectAll] = useState(false);

  useEffect(() => {
    if (role && role.privileges) {
      setSelectedPrivileges(role.privileges.map(priv => priv.id));
      setSelectAll(role.privileges.length === allPrivileges.length);
    } else {
      setSelectedPrivileges([]);
      setSelectAll(false);
    }
  }, [role, allPrivileges, open]);

  const handleTogglePrivilege = (privilegeId) => {
    setSelectedPrivileges(prev => {
      if (prev.includes(privilegeId)) {
        const newSelected = prev.filter(id => id !== privilegeId);
        setSelectAll(false);
        return newSelected;
      } else {
        const newSelected = [...prev, privilegeId];
        setSelectAll(newSelected.length === allPrivileges.length);
        return newSelected;
      }
    });
  };

  const handleToggleAll = () => {
    if (selectAll) {
      setSelectedPrivileges([]);
    } else {
      setSelectedPrivileges(allPrivileges.map(priv => priv.id));
    }
    setSelectAll(!selectAll);
  };

  const handleSave = () => {
    onSave({
      roleId: role.id,
      privilegeIds: selectedPrivileges
    });
    onClose();
  };

  return (
    <Dialog 
      open={open} 
      onClose={onClose} 
      maxWidth="sm" 
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: '12px',
          boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)',
          p: 2
        }
      }}
    >
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 0.5 }}>
        <Typography variant="h6" sx={{ fontWeight: 600, fontSize: '1.125rem' }}>
          Asignar Privilegios a {role?.nombre}
        </Typography>
        <IconButton 
          onClick={onClose} 
          aria-label="close"
          sx={{ 
            color: 'text.secondary',
            p: 0.5,
            '&:hover': { 
              backgroundColor: 'rgba(0, 0, 0, 0.04)' 
            } 
          }}
        >
          <CloseIcon fontSize="small" />
        </IconButton>
      </Box>
      
      <Typography variant="body2" color="text.secondary" sx={{ mb: 1.5 }}>
        Seleccione los privilegios que desea asignar al rol.
      </Typography>
      
      <Box sx={{ mb: 2 }}>
        <FormControlLabel
          control={
            <Switch
              checked={selectAll}
              onChange={handleToggleAll}
              color="primary"
            />
          }
          label="Seleccionar todos"
        />
      </Box>
      
      <Table size="small" sx={{ mb: 2 }}>
        <TableHead>
          <TableRow>
            <TableCell sx={{ fontWeight: 600 }}>Asignar</TableCell>
            <TableCell sx={{ fontWeight: 600 }}>Nombre del Privilegio</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {allPrivileges.map((privilege) => (
            <TableRow key={privilege.id}>
              <TableCell padding="checkbox">
                <Checkbox
                  checked={selectedPrivileges.includes(privilege.id)}
                  onChange={() => handleTogglePrivilege(privilege.id)}
                />
              </TableCell>
              <TableCell>{privilege.nombre_privilegio}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      
      <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
        <Button 
          onClick={onClose}
          variant="outlined"
          sx={{ 
            borderRadius: '8px',
            textTransform: 'none',
            fontWeight: 500,
            px: 3,
            borderColor: 'rgba(0, 0, 0, 0.12)'
          }}
        >
          Cancelar
        </Button>
        <Button 
          onClick={handleSave} 
          variant="contained" 
          disableElevation
          sx={{ 
            backgroundColor: '#4f46e5',
            borderRadius: '8px',
            textTransform: 'none',
            fontWeight: 500,
            px: 3,
            '&:hover': {
              backgroundColor: '#4338ca',
            }
          }}
        >
          Guardar
        </Button>
      </Box>
    </Dialog>
  );
};
