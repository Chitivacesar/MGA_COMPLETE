"use client"
import { Dialog, Button, Typography, Box, IconButton, Chip, Paper, DialogContent } from "@mui/material"
import { Close as CloseIcon } from "@mui/icons-material"

export const DetailModal2 = ({ open, onClose, title, data, fields, customContent }) => {
  const renderPermissionWithPrivileges = (permission) => {
    const [module, submodule] = permission.split("-")
    const displayName = submodule
      ? `${module.charAt(0).toUpperCase() + module.slice(1)} - ${submodule.charAt(0).toUpperCase() + submodule.slice(1)}`
      : module.charAt(0).toUpperCase() + module.slice(1)

    return (
      <Box key={permission} sx={{ mb: 2, p: 1.5, pl: 2, bgcolor: "background.paper", borderRadius: 1 }}>
        <Typography variant="subtitle2" sx={{ fontWeight: 500, mb: 1 }}>
          {displayName}
        </Typography>
        <Box sx={{ display: "flex", gap: 0.5, flexWrap: "wrap", pl: 1 }}>
          {data?.privileges?.map((priv) => (
            <Chip
              key={`${permission}-${priv.id}`}
              label={priv.nombre_privilegio}
              size="small"
              color="primary"
              variant="outlined"
            />
          ))}
        </Box>
      </Box>
    )
  }

  // Si hay contenido personalizado, renderizarlo
  if (customContent) {
    return (
      <Dialog
        open={open}
        onClose={onClose}
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: "12px",
            boxShadow: "0 4px 20px rgba(0, 0, 0, 0.08)",
            overflow: "hidden",
          },
        }}
      >
        <Box
          sx={{
            bgcolor: "#0455a2",
            color: "white",
            p: 2,
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <Typography variant="h6" sx={{ fontWeight: 600 }}>
            {title}
          </Typography>
          <IconButton onClick={onClose} sx={{ color: "white" }}>
            <CloseIcon />
          </IconButton>
        </Box>

        <DialogContent
          sx={{
            p: 0,
            maxHeight: "70vh",
            overflow: "auto",
            scrollbarWidth: "none",
            "&::-webkit-scrollbar": {
              display: "none",
            },
            msOverflowStyle: "none",
          }}
        >
          {customContent}
        </DialogContent>

        <Box sx={{ p: 2, display: "flex", justifyContent: "flex-end", bgcolor: "#f9f9f9" }}>
          <Button
            onClick={onClose}
            variant="contained"
            disableElevation
            sx={{
              backgroundColor: "#0455a2",
              borderRadius: "8px",
              textTransform: "none",
              fontWeight: 500,
              px: 3,
              "&:hover": {
                backgroundColor: "#033b70",
              },
            }}
          >
            Cerrar
          </Button>
        </Box>
      </Dialog>
    )
  }

  // Si no hay datos, no renderizar nada
  if (!data) return null

  // Renderizar el modal estándar con campos
  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: "8px",
          boxShadow: "0 4px 20px rgba(0, 0, 0, 0.08)",
          overflow: "hidden",
          width: "60%",
          height: "70%",
          maxHeight: "70vh"
        },
      }}
    >
      <Box
        sx={{
          bgcolor: "#0455a2",
          color: "white",
          p: 1,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <Typography variant="subtitle1" sx={{ fontWeight: 600, fontSize: '0.9rem' }}>
          {title}
        </Typography>
        <IconButton onClick={onClose} sx={{ color: "white", padding: 0.5 }}>
          <CloseIcon fontSize="small" />
        </IconButton>
      </Box>

      <DialogContent sx={{ p: 0.5 }}>
        <Box sx={{ 
          display: 'grid', 
          gridTemplateColumns: '1fr', 
          gap: 0.25,
          '& .MuiTypography-root': {
            fontSize: '0.75rem'
          }
        }}>
          <Paper elevation={0} sx={{ p: 0.5, border: "1px solid #e0e0e0", borderRadius: "8px", bgcolor: "#f8f9fa" }}>
            {fields?.map((field) => (
              <Box
                key={field.id}
                sx={{
                  display: "flex",
                  borderBottom: "1px solid rgba(224, 224, 224, 0.5)",
                  py: 0.5,
                  "&:last-child": {
                    borderBottom: "none",
                  },
                }}
              >
                <Box sx={{ width: "30%", pr: 0.5, color: "text.secondary", fontWeight: 500 }}>
                  {field.label}
                </Box>
                <Box sx={{ flex: 1 }}>
                  {field.id === "viewPermissions" && data[field.id] ? (
                    <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
                      {data[field.id].map((permission) => (
                        <Box 
                          key={permission} 
                          sx={{ 
                            p: 1.5, 
                            bgcolor: 'background.paper', 
                            borderRadius: 1,
                            border: '1px solid rgba(0, 0, 0, 0.12)'
                          }}
                        >
                          <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 500 }}>
                            {permission.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' - ')}
                          </Typography>
                          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5, pl: 2 }}>
                            {['Ver', 'Crear', 'Editar', 'Eliminar', 'Descargar'].map((privilegio) => (
                              <Box 
                                key={`${permission}-${privilegio}`}
                                sx={{ 
                                  display: 'flex',
                                  alignItems: 'center',
                                  gap: 1
                                }}
                              >
                                {data.privileges?.some(p => p.nombre_privilegio === privilegio) ? (
                                  <Typography 
                                    variant="body2" 
                                    sx={{ 
                                      color: 'primary.main',
                                      display: 'flex',
                                      alignItems: 'center',
                                      gap: 1
                                    }}
                                  >
                                    ✓ {privilegio}
                                  </Typography>
                                ) : (
                                  <Typography 
                                    variant="body2" 
                                    sx={{ 
                                      color: 'error.main',
                                      display: 'flex',
                                      alignItems: 'center',
                                      gap: 1
                                    }}
                                  >
                                    ✗ {privilegio}
                                  </Typography>
                                )}
                              </Box>
                            ))}
                          </Box>
                        </Box>
                      ))}
                    </Box>
                  ) : field.render ? (
                    typeof field.render === 'function' ? field.render(data[field.id], data) : field.render
                  ) : (
                    data[field.id] || "—"
                  )}
                </Box>
              </Box>
            ))}
          </Paper>
        </Box>
      </DialogContent>

      <Box sx={{ p: 2, display: "flex", justifyContent: "flex-end", bgcolor: "#f9f9f9" }}>
        <Button
          onClick={onClose}
          variant="contained"
          disableElevation
          size="small"
          sx={{
            backgroundColor: "#0455a2",
            borderRadius: "8px",
            textTransform: "none",
            fontWeight: 500,
            px: 2,
            py: 0.5,
            "&:hover": {
              backgroundColor: "#033b70",
            },
          }}
        >
          Cerrar
        </Button>
      </Box>
    </Dialog>
  )
}