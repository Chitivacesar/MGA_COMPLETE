"use client"

import { useState, useEffect } from "react"
import { Box, Paper, Tabs, Tab, FormControl, Select, MenuItem, InputLabel } from "@mui/material"
import { GenericList } from "../../../shared/components/GenericList"
import { DetailModal } from "../../../shared/components/DetailModal"
import * as XLSX from "xlsx"
import { StatusButton } from "../../../shared/components/StatusButton"
import moment from "moment"

const Asistencia = () => {
  const [tabValue, setTabValue] = useState(0)
  const [selectedProfesor, setSelectedProfesor] = useState("")
  const [selectedClase, setSelectedClase] = useState("")
  const [selectedBeneficiario, setSelectedBeneficiario] = useState("Juan Perez")
  const [detailModalOpen, setDetailModalOpen] = useState(false)
  const [selectedAsistencia, setSelectedAsistencia] = useState(null)

  // Mock data - Replace with your actual data structure
  const profesores = [
    { id: 1, nombre: "Carlos Rodriguez", clases: ["Guitarra", "Bajo"] },
    { id: 2, nombre: "Ana Martinez", clases: ["Piano", "Teclado"] },
    { id: 3, nombre: "Luis Torres", clases: ["Bateria", "Percusion"] },
    { id: 4, nombre: "Maria Sanchez", clases: ["Violin", "Viola"] },
    { id: 5, nombre: "Jose Ramirez", clases: ["Saxofon", "Flauta"] },
  ]

  const beneficiarios = [
    { id: 1, nombre: "Juan Perez", clases: ["Guitarra", "Piano"] },
    { id: 2, nombre: "Maria Gonzalez", clases: ["Piano"] },
    { id: 3, nombre: "Pedro Lopez", clases: ["Bateria", "Bajo"] },
    { id: 4, nombre: "Ana Garcia", clases: ["Violin", "Piano"] },
    { id: 5, nombre: "Carlos Mendez", clases: ["Saxofon"] },
    { id: 6, nombre: "Laura Torres", clases: ["Guitarra", "Bajo"] },
  ]

  const [asistencias, setAsistencias] = useState([
    // Clases de guitarra con Carlos Rodriguez
    {
      id: "a001",
      nombreBeneficiario: "Juan",
      apellidoBeneficiario: "Perez",
      nombreProfesor: "Carlos Rodriguez",
      clase: "Guitarra",
      fecha: "2024-01-20",
      hora: "09:00",
      estado: "asistio",
    },
    {
      id: "a002",
      nombreBeneficiario: "Laura",
      apellidoBeneficiario: "Torres",
      nombreProfesor: "Carlos Rodriguez",
      clase: "Guitarra",
      fecha: "2024-01-20",
      hora: "10:30",
      estado: "asistio",
    },
    {
      id: "a003",
      nombreBeneficiario: "Pedro",
      apellidoBeneficiario: "Lopez",
      nombreProfesor: "Carlos Rodriguez",
      clase: "Bajo",
      fecha: "2024-01-20",
      hora: "11:30",
      estado: "falto",
    },
    // Clases de piano con Ana Martinez
    {
      id: "a004",
      nombreBeneficiario: "Maria",
      apellidoBeneficiario: "Gonzalez",
      nombreProfesor: "Ana Martinez",
      clase: "Piano",
      fecha: "2024-01-21",
      hora: "09:00",
      estado: "asistio",
    },
    {
      id: "a005",
      nombreBeneficiario: "Juan",
      apellidoBeneficiario: "Perez",
      nombreProfesor: "Ana Martinez",
      clase: "Piano",
      fecha: "2024-01-21",
      hora: "10:00",
      estado: "asistio",
    },
    {
      id: "a006",
      nombreBeneficiario: "Ana",
      apellidoBeneficiario: "Garcia",
      nombreProfesor: "Ana Martinez",
      clase: "Piano",
      fecha: "2024-01-21",
      hora: "11:00",
      estado: "falto",
    },
    // Clases de batería con Luis Torres
    {
      id: "a007",
      nombreBeneficiario: "Pedro",
      apellidoBeneficiario: "Lopez",
      nombreProfesor: "Luis Torres",
      clase: "Bateria",
      fecha: "2024-01-22",
      hora: "14:00",
      estado: "asistio",
    },
    {
      id: "a008",
      nombreBeneficiario: "Carlos",
      apellidoBeneficiario: "Mendez",
      nombreProfesor: "Luis Torres",
      clase: "Bateria",
      fecha: "2024-01-22",
      hora: "15:00",
      estado: "asistio",
    },
    // Clases de violín con Maria Sanchez
    {
      id: "a009",
      nombreBeneficiario: "Ana",
      apellidoBeneficiario: "Garcia",
      nombreProfesor: "Maria Sanchez",
      clase: "Violin",
      fecha: "2024-01-23",
      hora: "09:00",
      estado: "asistio",
    },
    {
      id: "a010",
      nombreBeneficiario: "Laura",
      apellidoBeneficiario: "Torres",
      nombreProfesor: "Maria Sanchez",
      clase: "Viola",
      fecha: "2024-01-23",
      hora: "10:00",
      estado: "falto",
    },
    // Clases de saxofón con Jose Ramirez
    {
      id: "a011",
      nombreBeneficiario: "Carlos",
      apellidoBeneficiario: "Mendez",
      nombreProfesor: "Jose Ramirez",
      clase: "Saxofon",
      fecha: "2024-01-24",
      hora: "14:00",
      estado: "asistio",
    },
    {
      id: "a012",
      nombreBeneficiario: "Maria",
      apellidoBeneficiario: "Gonzalez",
      nombreProfesor: "Jose Ramirez",
      clase: "Flauta",
      fecha: "2024-01-24",
      hora: "15:00",
      estado: "asistio",
    },
    // Añadiendo más estados para demostrar todos los tipos
    {
      id: "a013",
      nombreBeneficiario: "Juan",
      apellidoBeneficiario: "Perez",
      nombreProfesor: "Carlos Rodriguez",
      clase: "Guitarra",
      fecha: "2024-01-25",
      hora: "09:00",
      estado: "excusa",
    },
    {
      id: "a014",
      nombreBeneficiario: "Maria",
      apellidoBeneficiario: "Gonzalez",
      nombreProfesor: "Ana Martinez",
      clase: "Piano",
      fecha: "2024-01-25",
      hora: "10:00",
      estado: "pospuesta",
    },
  ])

  // Función para renderizar el estado con el componente StatusButton
  const renderEstado = (value) => {
    return <StatusButton status={value} />
  }

  // Filtered data based on selections
  const getFilteredData = () => {
    switch (tabValue) {
      case 0: // Por Profesor
        return selectedProfesor && selectedClase
          ? asistencias.filter((a) => a.nombreProfesor === selectedProfesor && a.clase === selectedClase)
          : []
      case 1: // Por Beneficiario
        return selectedBeneficiario
          ? asistencias.filter((a) => `${a.nombreBeneficiario} ${a.apellidoBeneficiario}` === selectedBeneficiario)
          : []
      case 2: // Por Clase
        return selectedClase ? asistencias.filter((a) => a.clase === selectedClase) : []
      default:
        return []
    }
  }

  // Columns for each view with proper capitalization and status rendering
  const asistenciaColumns = [
    { id: "nombreBeneficiario", label: "Beneficiario" },
    { id: "fecha", label: "Fecha" },
    { id: "hora", label: "Hora" },
    {
      id: "estado",
      label: "Estado",
      render: renderEstado,
      filterOptions: [
        { value: "asistio", label: "Asistió" },
        { value: "falto", label: "Faltó" },
        { value: "excusa", label: "Con Excusa" },
        { value: "pospuesta", label: "Pospuesta" },
      ],
    },
  ]

  const BeneficiarioColumns = [
    { id: "clase", label: "Clase" },
    { id: "nombreProfesor", label: "Profesor" },
    { id: "fecha", label: "Fecha" },
    { id: "hora", label: "Hora" },
    {
      id: "estado",
      label: "Estado",
      render: renderEstado,
      filterOptions: [
        { value: "asistio", label: "Asistió" },
        { value: "falto", label: "Faltó" },
        { value: "excusa", label: "Con Excusa" },
        { value: "pospuesta", label: "Pospuesta" },
      ],
    },
  ]

  const claseColumns = [
    { id: "nombreBeneficiario", label: "Beneficiario" },
    { id: "apellidoBeneficiario", label: "Apellido" },
    { id: "fecha", label: "Fecha" },
    { id: "hora", label: "Hora" },
    {
      id: "estado",
      label: "Estado",
      render: renderEstado,
      filterOptions: [
        { value: "asistio", label: "Asistió" },
        { value: "falto", label: "Faltó" },
        { value: "excusa", label: "Con Excusa" },
        { value: "pospuesta", label: "Pospuesta" },
      ],
    },
  ]

  // Función para exportar a Excel
  const handleExportExcel = () => {
    const filteredData = getFilteredData()
    const dataToExport = filteredData.map((item) => ({
      ...item,
      fecha: moment(item.fecha).format("DD/MM/YYYY"),
      hora: moment(item.hora, "HH:mm").format("HH:mm"),
      estado: getEstadoLabel(item.estado),
    }))

    const workbook = XLSX.utils.book_new()
    const worksheet = XLSX.utils.json_to_sheet(dataToExport)

    // Set column widths
    const wscols = [
      { wch: 15 }, // ID
      { wch: 20 }, // Nombre
      { wch: 20 }, // Apellido
      { wch: 20 }, // Profesor/Clase
      { wch: 15 }, // Fecha
      { wch: 10 }, // Hora
      { wch: 15 }, // Estado
    ]
    worksheet["!cols"] = wscols

    const fileName =
      tabValue === 0
        ? "Asistencias_por_Profesor"
        : tabValue === 1
          ? "Asistencias_por_Beneficiario"
          : "Asistencias_por_Clase"

    XLSX.utils.book_append_sheet(workbook, worksheet, "Asistencias")
    XLSX.writeFile(workbook, `${fileName}.xlsx`)
  }

  // Función para obtener la etiqueta legible del estado
  const getEstadoLabel = (estado) => {
    switch (estado) {
      case "asistio":
        return "Asistió"
      case "falto":
        return "Faltó"
      case "excusa":
        return "Con Excusa"
      case "pospuesta":
        return "Pospuesta"
      default:
        return estado
    }
  }

  // Función para ver detalles de una asistencia
  const handleViewAsistencia = (asistencia) => {
    setSelectedAsistencia(asistencia)
    setDetailModalOpen(true)
  }

  // Campos para el modal de detalles
  const detailFields = [
    { id: "nombreBeneficiario", label: "Nombre del Beneficiario" },
    { id: "apellidoBeneficiario", label: "Apellido del Beneficiario" },
    { id: "nombreProfesor", label: "Profesor" },
    { id: "clase", label: "Clase" },
    { id: "fecha", label: "Fecha" },
    { id: "hora", label: "Hora" },
    {
      id: "estado",
      label: "Estado",
      render: renderEstado,
    },
  ]

  // Efecto para resetear selecciones al cambiar de tab
  useEffect(() => {
    setSelectedProfesor("")
    setSelectedClase("")
    setSelectedBeneficiario("")
  }, [tabValue])

  return (
    <Box sx={{ height: "calc(100vh - 64px)", display: "flex", flexDirection: "column", gap: 2 }}>
      <Paper sx={{ p: 2 }}>
        <Tabs 
          value={tabValue} 
          onChange={(e, newValue) => setTabValue(newValue)}
          sx={{
            '& .MuiTab-root': {
              textTransform: 'capitalize'
            }
          }}
        >
          <Tab label="Por profesor" />
          <Tab label="Por Beneficiario" />
          <Tab label="Por clase" />
        </Tabs>
      </Paper>

      <Paper sx={{ p: 2 }}>
        {tabValue === 0 && (
          <Box sx={{ display: "flex", gap: 2 }}>
            <FormControl fullWidth>
              <InputLabel>Profesor</InputLabel>
              <Select
                value={selectedProfesor}
                label="Profesor"
                onChange={(e) => {
                  setSelectedProfesor(e.target.value)
                  setSelectedClase("")
                }}
              >
                {profesores.map((prof) => (
                  <MenuItem key={prof.id} value={prof.nombre}>
                    {prof.nombre}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            {selectedProfesor && (
              <FormControl fullWidth>
                <InputLabel>Clase</InputLabel>
                <Select value={selectedClase} label="Clase" onChange={(e) => setSelectedClase(e.target.value)}>
                  {profesores
                    .find((p) => p.nombre === selectedProfesor)
                    ?.clases.map((clase) => (
                      <MenuItem key={clase} value={clase}>
                        {clase}
                      </MenuItem>
                    ))}
                </Select>
              </FormControl>
            )}
          </Box>
        )}

        {tabValue === 1 && (
          <FormControl fullWidth>
            <InputLabel>Beneficiario</InputLabel>
            <Select
              value={selectedBeneficiario}
              label="Beneficiario"
              onChange={(e) => setSelectedBeneficiario(e.target.value)}
            >
              {beneficiarios.map((est) => (
                <MenuItem key={est.id} value={`${est.nombre}`}>
                  {est.nombre}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        )}

        {tabValue === 2 && (
          <FormControl fullWidth>
            <InputLabel>Clase</InputLabel>
            <Select value={selectedClase} label="Clase" onChange={(e) => setSelectedClase(e.target.value)}>
              {Array.from(new Set(asistencias.map((a) => a.clase))).map((clase) => (
                <MenuItem key={clase} value={clase}>
                  {clase}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        )}
      </Paper>

      <GenericList
        data={getFilteredData()}
        columns={tabValue === 0 ? asistenciaColumns : tabValue === 1 ? BeneficiarioColumns : claseColumns}
        onView={handleViewAsistencia}
        title={
          tabValue === 0
            ? "Asistencia por Profesor"
            : tabValue === 1
              ? "Asistencia por Beneficiario"
              : "Asistencia por Clase"
        }
        customFilters={{
          estado: {
            options: [
              { value: "all", label: "Todos" },
              { value: "asistio", label: "Asistió" },
              { value: "falto", label: "Faltó" },
              { value: "excusa", label: "Con Excusa" },
              { value: "pospuesta", label: "Pospuesta" },
            ],
          },
        }}
      />

      {/* Modal de detalles */}
      <DetailModal
        title="Detalle de Asistencia"
        data={selectedAsistencia}
        fields={detailFields}
        open={detailModalOpen}
        onClose={() => setDetailModalOpen(false)}
      />
    </Box>
  )
}

export default Asistencia
