"use client"
import { Dialog, DialogActions, Button, Typography, Box, IconButton, DialogContent } from "@mui/material"
import { Close as CloseIcon } from "@mui/icons-material"

export function DeleteModal({ open, onClose, onConfirm, itemName }) {
  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
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
          bgcolor: "#ef4444",
          color: "white",
          p: 2,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <Typography variant="h6" sx={{ fontWeight: 600 }}>
          Confirmar Eliminación
        </Typography>
        <IconButton onClick={onClose} sx={{ color: "white" }}>
          <CloseIcon />
        </IconButton>
      </Box>

      <DialogContent
        sx={{
          p: 3,
          maxHeight: "70vh",
          overflow: "auto",
          scrollbarWidth: "none", // Firefox
          "&::-webkit-scrollbar": {
            display: "none", // Chrome, Safari, Edge
          },
          msOverflowStyle: "none", // IE
        }}
      >
        <Typography variant="body1" sx={{ mb: 3 }}>
          ¿Está seguro que desea eliminar {itemName}? Esta acción no se puede deshacer.
        </Typography>
      </DialogContent>

      <DialogActions sx={{ p: 2, bgcolor: "#f9f9f9", justifyContent: "flex-end", gap: 1 }}>
        <Button
          onClick={onClose}
          variant="outlined"
          sx={{
            borderRadius: "8px",
            textTransform: "none",
            fontWeight: 500,
            px: 3,
            borderColor: "rgba(0, 0, 0, 0.12)",
          }}
        >
          Cancelar
        </Button>
        <Button
          onClick={onConfirm}
          variant="contained"
          disableElevation
          sx={{
            backgroundColor: "#ef4444",
            borderRadius: "8px",
            textTransform: "none",
            fontWeight: 500,
            px: 3,
            "&:hover": {
              backgroundColor: "#dc2626",
            },
          }}
        >
          Eliminar
        </Button>
      </DialogActions>
    </Dialog>
  )
}
