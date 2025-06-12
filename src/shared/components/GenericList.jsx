"use client"

import { useState, useContext } from "react"
import { ThemeContext } from "../contexts/ThemeContext"
import {
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Button,
  Box,
  Typography,
  InputBase,
  Stack,
  Select,
  MenuItem,
  FormControl,
  Avatar,
  Tooltip,
  Menu,
  ListItemIcon,
} from "@mui/material"
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  Visibility as ViewIcon,
  Search as SearchIcon,
  NavigateBefore as PreviousIcon,
  NavigateNext as NextIcon,
  KeyboardArrowDown as ArrowDownIcon,
  FileDownload as FileDownloadIcon,
  CheckCircle as CheckCircleIcon,
  FilterAlt as FilterAltIcon,
  Cancel as CancelIcon, // Import Cancel icon
} from "@mui/icons-material"
import * as XLSX from "xlsx"

export const GenericList = ({
  data,
  columns,
  onEdit,
  onDelete,
  onCancel,
  onCreate,
  onView,
  title,
  pagination,
  customFilters = {}, // New prop for custom filters
}) => {
  const [page, setPage] = useState(0)
  const [rowsPerPage, setRowsPerPage] = useState(5)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all") // 'all', 'active', 'inactive'
  const [statusColumnMenuAnchor, setStatusColumnMenuAnchor] = useState(null)

  // State for custom filters
  const [columnFilters, setColumnFilters] = useState({})
  const [columnMenuAnchors, setColumnMenuAnchors] = useState({})

  const handleColumnClick = (columnId, event) => {
    setColumnMenuAnchors({
      ...columnMenuAnchors,
      [columnId]: event.currentTarget,
    })
  }

  const handleColumnMenuClose = (columnId) => {
    setColumnMenuAnchors({
      ...columnMenuAnchors,
      [columnId]: null,
    })
  }

  const handleFilterChange = (columnId, value) => {
    setColumnFilters({
      ...columnFilters,
      [columnId]: value,
    })
    handleColumnMenuClose(columnId)
  }

  // Legacy status filter handlers (for backward compatibility)
  const handleStatusColumnClick = (event) => {
    setStatusColumnMenuAnchor(event.currentTarget)
  }

  const handleStatusMenuClose = () => {
    setStatusColumnMenuAnchor(null)
  }

  const handleStatusFilterChange = (value) => {
    setStatusFilter(value)
    handleStatusMenuClose()
  }

  const { darkMode } = useContext(ThemeContext)

  // Función para exportar datos a Excel
  const exportToExcel = () => {
    // Crear una copia de los datos filtrados
    const dataToExport = filteredData.map((row) => {
      const newRow = {}
      // Usar las etiquetas de las columnas como nombres de columna en Excel
      columns.forEach((column) => {
        // Si hay una función de renderizado personalizada, usar el valor original
        newRow[column.label] = row[column.id]
      })
      return newRow
    })

    // Crear una nueva hoja de cálculo
    const worksheet = XLSX.utils.json_to_sheet(dataToExport)

    // Crear un nuevo libro
    const workbook = XLSX.utils.book_new()

    // Añadir la hoja al libro
    XLSX.utils.book_append_sheet(workbook, worksheet, "Datos")

    // Generar el archivo y descargarlo
    XLSX.writeFile(workbook, `${title || "Datos"}.xlsx`)
  }

  const handleChangePage = (event, newPage) => {
    setPage(newPage)
  }

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(Number.parseInt(event.target.value, 10))
    setPage(0)
  }

  // Filter data based on search term, status, and custom filters
  const filteredData = data.filter((row) => {
    // Search term filter
    const matchesSearch =
      !searchTerm || columns.some((column) => String(row[column.id]).toLowerCase().includes(searchTerm.toLowerCase()))

    // Status filter (legacy)
    let matchesStatus = true
    if (statusFilter !== "all") {
      if (typeof row.estado === "boolean") {
        matchesStatus =
          (statusFilter === "active" && row.estado === true) || (statusFilter === "inactive" && row.estado === false)
      } else if (typeof row.estado === "string") {
        // Handle string status values
        matchesStatus = statusFilter === row.estado
      }
    }

    // Custom column filters
    let matchesCustomFilters = true
    Object.keys(columnFilters).forEach((columnId) => {
      const filterValue = columnFilters[columnId]
      if (filterValue && filterValue !== "all") {
        matchesCustomFilters = matchesCustomFilters && row[columnId] === filterValue
      }
    })

    return matchesSearch && matchesStatus && matchesCustomFilters
  })

  const paginatedData = filteredData.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)

  // Calculate total pages
  const totalPages = Math.ceil(filteredData.length / rowsPerPage)
  const pageNumbers = []
  for (let i = 0; i < totalPages; i++) {
    pageNumbers.push(i)
  }

  return (
    <Box
      sx={{
        p: 2,
        height: "auto",
        width: "100%",
        backgroundColor: darkMode ? "#1e1e1e" : "#ffffff",
        color: darkMode ? "#ffffff" : "#333333",
        borderRadius: 2,
        boxShadow: "none",
        fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
        display: "flex",
        flexDirection: "column",
        alignItems: "center", // Center the entire component horizontally
      }}
    >
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 2,
          width: "100%", // Ensure full width
        }}
      >
        <Typography
          variant="h6"
          component="h2"
          sx={{
            fontSize: "1rem",
            fontWeight: "600",
            color: darkMode ? "#ffffff" : "#333",
            fontFamily: '"Inter", sans-serif',
          }}
        >
          {title}
        </Typography>
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 2,
          }}
        >
          <Box sx={{ display: "flex", gap: 2 }}>
            <Paper
              component="form"
              sx={{
                p: "2px 8px",
                display: "flex",
                alignItems: "center",
                width: 240,
                border: darkMode ? "1px solid rgba(255, 255, 255, 0.12)" : "1px solid #e0e0e0",
                borderRadius: 2,
                boxShadow: "none",
                backgroundColor: darkMode ? "#2d2d2d" : "#ffffff",
              }}
            >
              <SearchIcon sx={{ color: darkMode ? "#aaaaaa" : "#9e9e9e", fontSize: "1.2rem" }} />
              <InputBase
                sx={{
                  ml: 1,
                  flex: 1,
                  fontFamily: '"Inter", sans-serif',
                  fontSize: "0.875rem",
                  color: darkMode ? "#ffffff" : "inherit",
                }}
                placeholder="Buscar..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </Paper>
          </Box>
          <Tooltip title="Exportar a Excel">
            <IconButton
              onClick={exportToExcel}
              sx={{
                color: "#217346", // Color verde de Excel
                backgroundColor: darkMode ? "rgba(33, 115, 70, 0.1)" : "rgba(33, 115, 70, 0.05)",
                "&:hover": {
                  backgroundColor: darkMode ? "rgba(33, 115, 70, 0.2)" : "rgba(33, 115, 70, 0.1)",
                },
                borderRadius: 1,
                padding: "8px",
              }}
            >
              <FileDownloadIcon />
            </IconButton>
          </Tooltip>

          {onCreate && (
            <Button
              variant="contained"
              onClick={onCreate}
              sx={{
                backgroundColor: "#0455a2",
                color: "white",
                textTransform: "none",
                fontFamily: '"Inter", sans-serif',
                fontSize: "0.875rem",
                fontWeight: 500,
                px: 2,
                py: 0.75,
                borderRadius: 1,
                "&:hover": {
                  backgroundColor: "#034089",
                },
              }}
            >
              Crear Nuevo
            </Button>
          )}
        </Box>
      </Box>

      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          mb: 2,
          width: "100%", // Ensure full width
          justifyContent: "flex-start", // Align to the start
        }}
      >
        <Typography
          variant="body2"
          sx={{
            mr: 1,
            color: "#666",
            fontFamily: '"Inter", sans-serif',
            fontSize: "0.875rem",
          }}
        >
          Mostrar
        </Typography>
        <FormControl size="small">
          <Select
            value={rowsPerPage}
            onChange={handleChangeRowsPerPage}
            IconComponent={ArrowDownIcon}
            sx={{
              minWidth: 60,
              height: 32,
              fontFamily: '"Inter", sans-serif',
              fontSize: "0.875rem",
              "& .MuiSelect-select": {
                py: 0.5,
                pl: 1.5,
              },
              "& .MuiOutlinedInput-notchedOutline": {
                borderColor: "#e0e0e0",
              },
            }}
          >
            <MenuItem value={5}>5</MenuItem>
            <MenuItem value={10}>10</MenuItem>
            <MenuItem value={25}>25</MenuItem>
            <MenuItem value={50}>50</MenuItem>
          </Select>
        </FormControl>
        <Typography
          variant="body2"
          sx={{
            ml: 1,
            color: "#666",
            fontFamily: '"Inter", sans-serif',
            fontSize: "0.875rem",
          }}
        >
          Registros
        </Typography>
      </Box>

      <TableContainer
        sx={{
          boxShadow: "none",
          border: "none",
          maxHeight: "none",
          overflow: "auto",
          width: "100%",
          "&::-webkit-scrollbar": {
            height: "8px",
          },
          "&::-webkit-scrollbar-thumb": {
            backgroundColor: darkMode ? "rgba(255, 255, 255, 0.2)" : "rgba(0, 0, 0, 0.2)",
            borderRadius: "4px",
          },
        }}
      >
        <Table>
          <TableHead>
            <TableRow>
              {columns.map((column) => (
                <TableCell
                  key={column.id}
                  align="center" // Center align all header cells
                  onClick={
                    column.filterOptions
                      ? (e) => handleColumnClick(column.id, e)
                      : column.id === "estado"
                        ? handleStatusColumnClick
                        : undefined
                  }
                  sx={{
                    fontWeight: "600",
                    backgroundColor: darkMode ? "#2d2d2d" : "white",
                    color: darkMode ? "#ffffff" : "#333",
                    borderBottom: darkMode ? "1px solid rgba(255, 255, 255, 0.1)" : "1px solid #e0e0e0",
                    py: 1.5,
                    fontFamily: '"Inter", sans-serif',
                    fontSize: "0.875rem",
                    cursor: column.filterOptions || column.id === "estado" ? "pointer" : "default",
                    whiteSpace: "nowrap",
                  }}
                >
                  <Box sx={{ display: "inline-flex", alignItems: "center", justifyContent: "center" }}>
                    {column.label}
                    {(column.filterOptions || column.id === "estado") && (
                      <FilterAltIcon
                        fontSize="small"
                        sx={{
                          fontSize: "0.875rem",
                          color:
                            (columnFilters[column.id] && columnFilters[column.id] !== "all") ||
                            (column.id === "estado" && statusFilter !== "all")
                              ? "#4285f4"
                              : "inherit",
                          opacity:
                            (columnFilters[column.id] && columnFilters[column.id] !== "all") ||
                            (column.id === "estado" && statusFilter !== "all")
                              ? 1
                              : 0.5,
                          ml: 0.5,
                        }}
                      />
                    )}
                  </Box>
                </TableCell>
              ))}
              {(onEdit || onDelete || onCancel || onView) && (
                <TableCell
                  align="center"
                  sx={{
                    fontWeight: "600",
                    backgroundColor: darkMode ? "#2d2d2d" : "white",
                    color: darkMode ? "#ffffff" : "#333",
                    borderBottom: darkMode ? "1px solid rgba(255, 255, 255, 0.1)" : "1px solid #e0e0e0",
                    py: 1.5,
                    fontFamily: '"Inter", sans-serif',
                    fontSize: "0.875rem",
                  }}
                >
                  Acciones
                </TableCell>
              )}
            </TableRow>
          </TableHead>
          <TableBody>
            {paginatedData.map((row) => (
              <TableRow
                key={row.id}
                hover
                sx={{
                  borderBottom: darkMode ? "1px solid rgba(255, 255, 255, 0.1)" : "1px solid #e0e0e0",
                  "&:hover": {
                    backgroundColor: "#7c9427 !important",
                  },
                }}
              >
                {columns.map((column, index) => (
                  <TableCell
                    key={`${row.id}-${column.id}`}
                    align="center" // Center align all data cells
                    sx={{
                      color:
                        column.id === "office" || column.id === "location"
                          ? darkMode
                            ? "#90caf9"
                            : "#3366ff"
                          : darkMode
                            ? "#ffffff"
                            : "#333",
                      borderBottom: "none",
                      py: 1.5,
                      fontFamily: '"Inter", sans-serif',
                      fontSize: "0.875rem",
                      fontWeight: column.id === "office" || column.id === "location" ? "500" : "400",
                      maxWidth: "250px",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {index === 0 && row.avatar ? (
                      <Box sx={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 1.5 }}>
                        <Avatar src={row.avatar} alt={row[column.id]} sx={{ width: 36, height: 36 }} />
                        {column.render ? column.render(row[column.id], row) : row[column.id]}
                      </Box>
                    ) : column.render ? (
                      column.render(row[column.id], row)
                    ) : (
                      row[column.id]
                    )}
                  </TableCell>
                ))}
                {(onEdit || onDelete || onCancel || onView) && (
                  <TableCell
                    align="center" // Center align actions cell
                    sx={{
                      color: "#333",
                      borderBottom: "none",
                      py: 1.5,
                    }}
                  >
                    <Box sx={{ display: "flex", justifyContent: "center", gap: 1 }}>
                      {onView && (
                        <IconButton
                          onClick={() => onView(row)}
                          size="small"
                          sx={{
                            color: "#2196f3",
                            padding: "4px",
                          }}
                        >
                          <ViewIcon fontSize="small" />
                        </IconButton>
                      )}
                      {onEdit && (
                        <IconButton
                          onClick={() => onEdit(row)}
                          size="small"
                          sx={{
                            color: "#0455a2",
                            padding: "4px",
                          }}
                        >
                          <EditIcon fontSize="small" />
                        </IconButton>
                      )}
                      {onDelete && (
                        <IconButton
                          onClick={() => onDelete(row)}
                          size="small"
                          sx={{
                            color: "#f44336",
                            padding: "4px",
                          }}
                        >
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      )}
                      {onCancel && (
                        <IconButton
                          onClick={() => onCancel(row)}
                          size="small"
                          sx={{
                            color: "#f44336",
                            padding: "4px",
                          }}
                        >
                          <CancelIcon fontSize="small" />
                        </IconButton>
                      )}
                    </Box>
                  </TableCell>
                )}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Menú desplegable para filtrar por estado (legacy) */}
      <Menu
        anchorEl={statusColumnMenuAnchor}
        open={Boolean(statusColumnMenuAnchor)}
        onClose={handleStatusMenuClose}
        anchorOrigin={{
          vertical: "bottom",
          horizontal: "left",
        }}
        transformOrigin={{
          vertical: "top",
          horizontal: "left",
        }}
        PaperProps={{
          sx: {
            mt: 0.5,
            boxShadow: "0px 5px 15px rgba(0, 0, 0, 0.15)",
            borderRadius: 1,
            minWidth: 180,
          },
        }}
      >
        <Typography
          variant="subtitle2"
          sx={{
            px: 2,
            py: 1,
            fontWeight: 600,
            color: darkMode ? "#ffffff" : "#333",
            borderBottom: "1px solid #eaeaea",
            textAlign: "center", // Center align menu title
          }}
        >
          Filtrar por Estado
        </Typography>
        <MenuItem
          onClick={() => handleStatusFilterChange("all")}
          sx={{
            py: 1,
            display: "flex",
            alignItems: "center",
            justifyContent: "center", // Center align menu items
            gap: 1,
          }}
        >
          <ListItemIcon sx={{ minWidth: "auto" }}>
            {statusFilter === "all" && <CheckCircleIcon fontSize="small" sx={{ color: "#4285f4" }} />}
          </ListItemIcon>
          <Typography variant="body2">Todos</Typography>
        </MenuItem>
        <MenuItem
          onClick={() => handleStatusFilterChange("active")}
          sx={{
            py: 1,
            display: "flex",
            alignItems: "center",
            justifyContent: "center", // Center align menu items
            gap: 1,
          }}
        >
          <ListItemIcon sx={{ minWidth: "auto" }}>
            {statusFilter === "active" && <CheckCircleIcon fontSize="small" sx={{ color: "#4285f4" }} />}
          </ListItemIcon>
          <Typography variant="body2">Activos</Typography>
        </MenuItem>
        <MenuItem
          onClick={() => handleStatusFilterChange("inactive")}
          sx={{
            py: 1,
            display: "flex",
            alignItems: "center",
            justifyContent: "center", // Center align menu items
            gap: 1,
          }}
        >
          <ListItemIcon sx={{ minWidth: "auto" }}>
            {statusFilter === "inactive" && <CheckCircleIcon fontSize="small" sx={{ color: "#4285f4" }} />}
          </ListItemIcon>
          <Typography variant="body2">Inactivos</Typography>
        </MenuItem>
      </Menu>

      {/* Dynamic filter menus for columns with filterOptions */}
      {columns
        .filter((col) => col.filterOptions)
        .map((column) => (
          <Menu
            key={`filter-menu-${column.id}`}
            anchorEl={columnMenuAnchors[column.id]}
            open={Boolean(columnMenuAnchors[column.id])}
            onClose={() => handleColumnMenuClose(column.id)}
            anchorOrigin={{
              vertical: "bottom",
              horizontal: "left",
            }}
            transformOrigin={{
              vertical: "top",
              horizontal: "left",
            }}
            PaperProps={{
              sx: {
                mt: 0.5,
                boxShadow: "0px 5px 15px rgba(0, 0, 0, 0.15)",
                borderRadius: 1,
                minWidth: 180,
              },
            }}
          >
            <Typography
              variant="subtitle2"
              sx={{
                px: 2,
                py: 1,
                fontWeight: 600,
                color: darkMode ? "#ffffff" : "#333",
                borderBottom: "1px solid #eaeaea",
                textAlign: "center",
              }}
            >
              {`Filtrar por ${column.label}`}
            </Typography>
            <MenuItem
              key={`filter-option-${column.id}-all`}
              onClick={() => handleFilterChange(column.id, "all")}
              sx={{
                py: 1,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 1,
              }}
            >
              <ListItemIcon sx={{ minWidth: "auto" }}>
                {(!columnFilters[column.id] || columnFilters[column.id] === "all") && (
                  <CheckCircleIcon fontSize="small" sx={{ color: "#4285f4" }} />
                )}
              </ListItemIcon>
              <Typography variant="body2">Todos</Typography>
            </MenuItem>
            {column.filterOptions.map((option) => (
              <MenuItem
                key={`filter-option-${column.id}-${option.value}`}
                onClick={() => handleFilterChange(column.id, option.value)}
                sx={{
                  py: 1,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 1,
                }}
              >
                <ListItemIcon sx={{ minWidth: "auto" }}>
                  {columnFilters[column.id] === option.value && (
                    <CheckCircleIcon fontSize="small" sx={{ color: "#4285f4" }} />
                  )}
                </ListItemIcon>
                <Typography variant="body2">{option.label}</Typography>
              </MenuItem>
            ))}
          </Menu>
        ))}

      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mt: 2,
          px: 1,
          width: "100%", // Ensure full width
        }}
      >
        <Typography
          variant="body2"
          sx={{
            color: darkMode ? "#aaaaaa" : "#666",
            fontFamily: '"Inter", sans-serif',
            fontSize: "0.875rem",
          }}
        >
          {`Mostrando ${page * rowsPerPage + 1} a ${Math.min((page + 1) * rowsPerPage, filteredData.length)} de ${filteredData.length} registros`}
        </Typography>

        <Stack direction="row" spacing={0.5} sx={{ justifyContent: "center" }}>
          <Button
            disabled={page === 0}
            onClick={() => handleChangePage(null, page - 1)}
            sx={{
              minWidth: "36px",
              height: "36px",
              color: page === 0 ? "#bdbdbd" : "#666",
              border: "1px solid #e0e0e0",
              borderRadius: "4px",
              textTransform: "none",
              fontFamily: '"Inter", sans-serif',
              "&:hover": {
                backgroundColor: "rgba(0, 0, 0, 0.04)",
              },
            }}
          >
            <PreviousIcon fontSize="small" />
          </Button>

          {pageNumbers.length <= 5 ? (
            pageNumbers.map((pageNum) => (
              <Button
                key={pageNum}
                variant={page === pageNum ? "contained" : "outlined"}
                onClick={() => handleChangePage(null, pageNum)}
                sx={{
                  minWidth: "36px",
                  height: "36px",
                  backgroundColor: page === pageNum ? "#3366ff" : "transparent",
                  color: page === pageNum ? "white" : "#666",
                  border: page === pageNum ? "none" : "1px solid #e0e0e0",
                  fontFamily: '"Inter", sans-serif',
                  "&:hover": {
                    backgroundColor: page === pageNum ? "#3366ff" : "rgba(0, 0, 0, 0.04)",
                  },
                }}
              >
                {pageNum + 1}
              </Button>
            ))
          ) : (
            <>
              {page > 1 && (
                <Button
                  variant="outlined"
                  onClick={() => handleChangePage(null, 0)}
                  sx={{
                    minWidth: "40px",
                    height: "36px",
                    color: "#666",
                    border: "1px solid #e0e0e0",
                    fontFamily: '"Inter", sans-serif',
                  }}
                >
                  1
                </Button>
              )}

              {page > 2 && <Typography sx={{ alignSelf: "center", color: "#666" }}>...</Typography>}

              {page > 0 && (
                <Button
                  variant="outlined"
                  onClick={() => handleChangePage(null, page - 1)}
                  sx={{
                    minWidth: "40px",
                    height: "36px",
                    color: "#666",
                    border: "1px solid #e0e0e0",
                    fontFamily: '"Inter", sans-serif',
                  }}
                >
                  {page}
                </Button>
              )}

              <Button
                variant="contained"
                sx={{
                  minWidth: "40px",
                  height: "36px",
                  backgroundColor: "#4285f4",
                  color: "white",
                  fontFamily: '"Inter", sans-serif',
                }}
              >
                {page + 1}
              </Button>

              {page < totalPages - 1 && (
                <Button
                  variant="outlined"
                  onClick={() => handleChangePage(null, page + 1)}
                  sx={{
                    minWidth: "40px",
                    height: "36px",
                    color: "#666",
                    border: "1px solid #e0e0e0",
                    fontFamily: '"Inter", sans-serif',
                  }}
                >
                  {page + 2}
                </Button>
              )}

              {page < totalPages - 3 && <Typography sx={{ alignSelf: "center", color: "#666" }}>...</Typography>}

              {page < totalPages - 2 && (
                <Button
                  variant="outlined"
                  onClick={() => handleChangePage(null, totalPages - 1)}
                  sx={{
                    minWidth: "40px",
                    height: "36px",
                    color: "#666",
                    border: "1px solid #e0e0e0",
                    fontFamily: '"Inter", sans-serif',
                  }}
                >
                  {totalPages}
                </Button>
              )}
            </>
          )}

          <Button
            disabled={page >= totalPages - 1}
            onClick={() => handleChangePage(null, page + 1)}
            sx={{
              minWidth: "36px",
              height: "36px",
              color: page >= totalPages - 1 ? "#bdbdbd" : "#666",
              border: "1px solid #e0e0e0",
              borderRadius: "4px",
              textTransform: "none",
              fontFamily: '"Inter", sans-serif',
              "&:hover": {
                backgroundColor: "rgba(0, 0, 0, 0.04)",
              },
            }}
          >
            <NextIcon fontSize="small" />
          </Button>
        </Stack>
      </Box>
    </Box>
  )
}
