"use client"
import { Dialog, DialogActions, Button, Typography, Box, IconButton } from "@mui/material"
import { Close as CloseIcon } from "@mui/icons-material"

export const ConfirmationDialog = ({ open, onClose, onConfirm, title, content }) => {
  return (
    <Dialog
      open={open}
      onClose={onClose}
      PaperProps={{
        sx: {
          borderRadius: "16px",
          boxShadow: "0 4px 20px rgba(0, 0, 0, 0.08)",
          maxWidth: "500px",
          width: "100%",
          p: 3,
        },
      }}
    >
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 1 }}>
        <Typography variant="h6" sx={{ fontWeight: 600, fontSize: "1.25rem" }}>
          {title}
        </Typography>
        <IconButton
          onClick={onClose}
          aria-label="close"
          sx={{
            color: "text.secondary",
            p: 1,
            "&:hover": {
              backgroundColor: "rgba(0, 0, 0, 0.04)",
            },
          }}
        >
          <CloseIcon fontSize="small" />
        </IconButton>
      </Box>

      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        {content}
      </Typography>

      <DialogActions sx={{ p: 0, justifyContent: "flex-end", gap: 1 }}>
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
            backgroundColor: "#4f46e5",
            borderRadius: "8px",
            textTransform: "none",
            fontWeight: 500,
            px: 3,
            "&:hover": {
              backgroundColor: "#4338ca",
            },
          }}
        >
          Confirmar
        </Button>
      </DialogActions>
    </Dialog>
  )
}

