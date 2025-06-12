"use client"

import { Chip } from "@mui/material"
import {
  CheckCircle,
  Cancel,
  PlayArrow,
  PauseCircle,
  Pending,
  Stop,
  EventBusy,
  EventAvailable,
  EventNote,
  Update,
} from "@mui/icons-material"

const statusConfig = {
  // Estados de asistencia
  asistio: { icon: <EventAvailable />, label: "Asistió", color: "success" },
  falto: { icon: <EventBusy />, label: "Faltó", color: "error" },
  excusa: { icon: <EventNote />, label: "Con Excusa", color: "warning" },
  pospuesta: { icon: <Update />, label: "Pospuesta", color: "info" },

  // Estados de clases
  no_iniciada: { icon: <Pending />, label: "No Iniciada", color: "warning" },
  en_ejecucion: { icon: <PlayArrow />, label: "En Ejecución", color: "success" },
  ejecutada: { icon: <CheckCircle />, label: "Ejecutada", color: "info" },
  cancelada: { icon: <Cancel />, label: "Cancelada", color: "error" },

  // Estados adicionales
  pendiente: { icon: <Pending />, label: "Pendiente", color: "warning" },
  pausada: { icon: <PauseCircle />, label: "Pausada", color: "secondary" },
  suspendida: { icon: <Stop />, label: "Suspendida", color: "default" },

  // Estados por defecto
  activo: { icon: <CheckCircle />, label: "Activo", color: "success" },
  inactivo: { icon: <Cancel />, label: "Inactivo", color: "error" },

  // Estados de matrícula
  cancelado: { icon: <Cancel />, label: "Cancelado", color: "error" },
  activo: { icon: <CheckCircle />, label: "Activo", color: "success" }, // First definition
  por_terminar: { icon: <Pending />, label: "Por Terminar", color: "warning" },
  vencida: { icon: <Stop />, label: "Vencida", color: "default" },
  // Estados de cursos
  pagado: { icon: <CheckCircle />, label: "Pagado", color: "success" },
  no_pagado: { icon: <Cancel />, label: "No Pagado", color: "error" },
}

export const StatusButton = ({ status, onAction, actionLabel, active }) => {
  // Si recibe la prop 'active', usar la configuración original
  if (active !== undefined) {
    return (
      <Chip
        icon={active ? <CheckCircle /> : <Cancel />}
        label={active ? "Activo" : "Inactivo"}
        color={active ? "success" : "error"}
        variant="outlined"
        size="small"
      />
    )
  }

  // Para los nuevos estados
  if (typeof status === "boolean") {
    status = status ? "activo" : "inactivo"
  }

  const config = statusConfig[status] || statusConfig.inactivo

  return (
    <Chip
      icon={config.icon}
      label={config.label}
      color={config.color}
      variant="outlined"
      size="small"
      onClick={onAction}
    />
  )
}
