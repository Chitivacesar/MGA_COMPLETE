"use client"

import { useState } from "react"
import { GenericList } from "../../../shared/components/GenericList"
import { DetailModal } from "../../../shared/components/DetailModal"
import { StatusButton } from "../../../shared/components/StatusButton"
import { Alert, Snackbar, Button, IconButton, Menu, MenuItem } from "@mui/material"
import VentaMatriculasForm from "../components/VentaMatriculasForm"
import { ConfirmationDialog } from "../../../shared/components/ConfirmationDialog"
import BlockIcon from "@mui/icons-material/Block"
import MoreVertIcon from "@mui/icons-material/MoreVert"

const VentaMatriculas = () => {
  const [cursos, setCursos] = useState([
    // Ejemplo de cursos, reemplaza con tus datos reales
    { id: 1, nombre: "Guitarra Básica", precio: 200000 },
    { id: 2, nombre: "Piano Intermedio", precio: 250000 },
    // ...
  ])

  // Estados para clientes, beneficiarios y matrículas
  const [clientes, setClientes] = useState([
    {
      id: 1,
      nombre: "Juan",
      apellido: "Pérez",
      tipoDocumento: "CC",
      numeroDocumento: "1234567890",
      fechaNacimiento: "1993-05-15",
      age: 30,
      direccion: "Calle 123",
      telefono: "123456789",
      correo: "juan.perez@email.com",
      acudiente: "María López",
      estado: true,
    },
    {
      id: 2,
      nombre: "María",
      apellido: "Gómez",
      tipoDocumento: "TI",
      numeroDocumento: "0987654321",
      fechaNacimiento: "1998-08-20",
      age: 25,
      direccion: "Avenida 456",
      telefono: "987654321",
      correo: "maria.gomez@email.com",
      acudiente: "Pedro Gómez",
      estado: false,
    },
  ])

  const [beneficiarios, setBeneficiarios] = useState([
    {
      id: 1,
      nombre: "Ana",
      apellido: "López",
      tipoDocumento: "TI",
      numeroDocumento: "1122334455",
      fechaNacimiento: "2003-05-15",
      age: 20,
      direccion: "Calle 123",
      telefono: "123456789",
      correo: "ana.lopez@email.com",
      acudiente: "Juan Pérez",
      estado: true,
    },
    {
      id: 2,
      nombre: "Carlos",
      apellido: "Sánchez",
      tipoDocumento: "TI",
      numeroDocumento: "5544332211",
      fechaNacimiento: "2001-08-20",
      age: 22,
      direccion: "Avenida 456",
      telefono: "987654321",
      correo: "carlos.sanchez@email.com",
      acudiente: "María Gómez",
      estado: true,
    },
  ])

  const [matriculas, setMatriculas] = useState([
    {
      id: 1,
      cliente: "Juan Pérez",
      beneficiario: "Ana López",
      fechaInicio: "2023-01-01",
      fechaFin: "2023-12-31",
      valor: 500000,
      descuento: 10,
      valorFinal: 450000,
      observaciones: "Matrícula anual",
      estado: "activo",  // Updated state
    },
    {
      id: 2,
      cliente: "María Gómez",
      beneficiario: "Carlos Sánchez",
      fechaInicio: "2023-02-01",
      fechaFin: "2023-11-30",
      valor: 450000,
      descuento: 0,
      valorFinal: 450000,
      observaciones: "Matrícula semestral",
      estado: "por_terminar",  // Updated state
    },
    // Add more matriculas with different states
    {
      id: 3,
      cliente: "Pedro Gómez",
      beneficiario: "Luis Martínez",
      fechaInicio: "2023-03-01",
      fechaFin: "2023-09-30",
      valor: 400000,
      descuento: 5,
      valorFinal: 380000,
      observaciones: "Matrícula trimestral",
      estado: "vencida",  // New state
    },
    {
      id: 4,
      cliente: "Ana Torres",
      beneficiario: "Laura Sánchez",
      fechaInicio: "2023-04-01",
      fechaFin: "2023-10-31",
      valor: 600000,
      descuento: 15,
      valorFinal: 510000,
      observaciones: "Matrícula semestral",
      estado: "cancelado",  // New state
    },
  ])

  // Estados para el formulario y modales
  const [selectedMatricula, setSelectedMatricula] = useState(null)
  const [detailModalOpen, setDetailModalOpen] = useState(false)
  const [formModalOpen, setFormModalOpen] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [alertMessage, setAlertMessage] = useState({ open: false, message: "", severity: "success" })
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [matriculaToDelete, setMatriculaToDelete] = useState(null)
  const [actionMenuAnchor, setActionMenuAnchor] = useState(null)
  const [matriculaAction, setMatriculaAction] = useState(null)
  const [confirmAction, setConfirmAction] = useState(null) // "cancelar" o "eliminar"

  // Manejadores para la tabla de matrículas
  const handleEdit = (matricula) => {
    setIsEditing(true)
    setSelectedMatricula(matricula)
    setFormModalOpen(true)
  }

  const handleDelete = (matricula) => {
    setMatriculaToDelete(matricula)
    setDeleteDialogOpen(true)
  }

  const confirmDeleteMatricula = () => {
    setMatriculas((prev) => prev.filter((item) => item.id !== matriculaToDelete.id))
    setAlertMessage({
      open: true,
      message: "Matrícula eliminada correctamente",
      severity: "success",
    })
    setDeleteDialogOpen(false)
    setMatriculaToDelete(null)
  }

  const handleCancelMatricula = (matricula) => {
    setMatriculas((prev) =>
      prev.map((item) =>
        item.id === matricula.id ? { ...item, estado: "cancelado" } : item,
      ),
    )
    setAlertMessage({
      open: true,
      message: "Matrícula cancelada correctamente",
      severity: "info",
    })
  }

  const handleView = (matricula) => {
    setSelectedMatricula(matricula)
    setDetailModalOpen(true)
  }

  const handleCloseDetail = () => {
    setDetailModalOpen(false)
    setSelectedMatricula(null)
  }

  const handleCloseForm = () => {
    setFormModalOpen(false)
    setSelectedMatricula(null)
    setIsEditing(false)
  }

  const handleCreate = () => {
    setIsEditing(false)
    setSelectedMatricula(null)
    setFormModalOpen(true)
  }

  const handleSubmit = (formData) => {
    if (isEditing) {
      setMatriculas((prev) =>
        prev.map((item) => (item.id === selectedMatricula.id ? { ...formData, id: item.id } : item)),
      )
      setAlertMessage({
        open: true,
        message: "Matrícula actualizada correctamente",
        severity: "success",
      })
    } else {
      const newId = Math.max(...matriculas.map((c) => c.id)) + 1
      setMatriculas((prev) => [...prev, { ...formData, id: newId }])
      setAlertMessage({
        open: true,
        message: "Matrícula creada correctamente",
        severity: "success",
      })
    }
    handleCloseForm()
  }

  // Definición de columnas y campos
  const columns = [
    { id: "id", label: "ID" },
    { id: "cliente", label: "Cliente" },
    { id: "beneficiario", label: "Beneficiario" },
    { id: "fechaInicio", label: "Fecha Inicio" },
    { id: "fechaFin", label: "Fecha Fin" },
    { id: "valorFinal", label: "Valor", render: (value) => `${value.toLocaleString()}` },
    {
      id: "estado",
      label: "Estado",
      render: (value) => <StatusButton status={value} />,
      filterOptions: [
        { value: "activo", label: "Activo" },
        { value: "por_terminar", label: "Por Terminar" },
        { value: "vencida", label: "Vencida" },
        { value: "cancelado", label: "Cancelado" },
      ],
    },
  ]

  const detailFields = [
    { id: "cliente", label: "Cliente" },
    { id: "beneficiario", label: "Beneficiario" },
    { id: "fechaInicio", label: "Fecha Inicio" },
    { id: "fechaFin", label: "Fecha Fin" },
    { id: "valor", label: "Valor Original", render: (value) => `${value.toLocaleString()}` },
    { id: "descuento", label: "Descuento", render: (value) => `${value}%` },
    { id: "valorFinal", label: "Valor Final", render: (value) => `${value.toLocaleString()}` },
    { id: "observaciones", label: "Observaciones" },
    {
      id: "estado",
      label: "Estado",
      render: (value) => <StatusButton status={value} />,
    },
  ]

  return (
    <>
      <GenericList
        data={matriculas}
        columns={columns}
        onEdit={handleEdit}
        onDelete={handleDelete}
        onCancel={(row) => {
          if (row.estado === "cancelado") return // No cancelar si ya está cancelado
          setConfirmAction("cancelar")
          setMatriculaToDelete(row)
          setDeleteDialogOpen(true)
        }}
        onView={handleView}
        onCreate={handleCreate}
        title="Gestión de Matrículas"
        customFilters={{
          estado: {
            options: [
              { value: "all", label: "Todos" },
              { value: "activo", label: "Activo" },
              { value: "por_terminar", label: "Por Terminar" },
              { value: "vencida", label: "Vencida" },
              { value: "cancelado", label: "Cancelado" },
            ],
          },
        }}
      />

      <DetailModal
        title={`Detalle de Matrícula: ${selectedMatricula?.id}`}
        data={selectedMatricula}
        fields={detailFields}
        open={detailModalOpen}
        onClose={handleCloseDetail}
      />

      <VentaMatriculasForm
        open={formModalOpen}
        onClose={handleCloseForm}
        onSubmit={handleSubmit}
        isEditing={isEditing}
        clientes={clientes}
        beneficiarios={beneficiarios}
        matriculas={matriculas}
        cursosDisponibles={cursos} // Asegúrate de pasar los cursos disponibles aquí
        setClientes={setClientes}
        setBeneficiarios={setBeneficiarios}
        initialData={selectedMatricula}
      />

      <ConfirmationDialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
        onConfirm={() => {
          if (confirmAction === "eliminar") {
            setMatriculas((prev) => prev.filter((item) => item.id !== matriculaToDelete.id))
            setAlertMessage({
              open: true,
              message: "Matrícula eliminada correctamente",
              severity: "success",
            })
          } else if (confirmAction === "cancelar") {
            setMatriculas((prev) =>
              prev.map((item) =>
                item.id === matriculaToDelete.id ? { ...item, estado: "cancelado" } : item
              )
            )
            setAlertMessage({
              open: true,
              message: "Matrícula cancelada correctamente",
              severity: "info",
            })
          }
          setDeleteDialogOpen(false)
          setMatriculaToDelete(null)
          setConfirmAction(null)
        }}
        title={confirmAction === "eliminar" ? "Eliminar Matrícula" : "Cancelar Matrícula"}
        content={
          confirmAction === "eliminar"
            ? `¿Está seguro de eliminar la matrícula de ${matriculaToDelete?.beneficiario || ""}?`
            : `¿Está seguro de cancelar la matrícula de ${matriculaToDelete?.beneficiario || ""}?`
        }
      />

      <Snackbar
        open={alertMessage.open}
        autoHideDuration={4000}
        onClose={() => setAlertMessage({ ...alertMessage, open: false })}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
      >
        <Alert severity={alertMessage.severity} onClose={() => setAlertMessage({ ...alertMessage, open: false })}>
          {alertMessage.message}
        </Alert>
      </Snackbar>
    </>
  )
}

export default VentaMatriculas
