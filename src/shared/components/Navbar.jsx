"use client"

import { useState, useContext } from "react"
import { AppBar, Toolbar, IconButton, Box, Menu, MenuItem, Typography } from "@mui/material"
import {
  AccountCircle,
  Menu as MenuIcon,
  School as SchoolIcon,
  Person as PersonIcon,
  AdminPanelSettings as AdminIcon,
  ChevronLeft as ChevronLeftIcon,
  ChevronRight as ChevronRightIcon,
  Settings,
  Info,
  Logout,
  Notifications as NotificationsIcon,
  Brightness4 as DarkModeIcon,
  Brightness7 as LightModeIcon,
} from "@mui/icons-material"
import { Link } from "react-router-dom"
import { useAuth } from "../../features/auth/context/AuthContext"
import { ThemeContext } from "../contexts/ThemeContext"
import logoSinLetras from "../../assets/logoSinLetra.png" // Importar el nuevo logo

const Navbar = ({ onMenuClick, isDrawerCollapsed, toggleDrawerCollapse }) => {
  const [anchorEl, setAnchorEl] = useState(null)
  const { user, logout } = useAuth()
  const { darkMode, toggleDarkMode } = useContext(ThemeContext)

  const handleMenu = (event) => {
    setAnchorEl(event.currentTarget)
  }

  const handleClose = () => {
    setAnchorEl(null)
  }

  const handleLogout = () => {
    handleClose()
    logout()
    // Redirect to homepage after logout
    window.location.href = '/'
  }

  // Determinar qué icono mostrar según el rol del usuario
  const getRoleIcon = () => {
    if (!user || !user.role) return <AccountCircle sx={{ color: darkMode ? "#90caf9" : "#0455a2" }} />

    // Convertir a minúsculas y eliminar espacios para comparación más robusta
    const role = user.role.toLowerCase().trim();
    
    switch (role) {
      case "profesor":
      case "teacher":
      case "prof":
        return <SchoolIcon sx={{ color: darkMode ? "#90caf9" : "#0455a2" }} />
      case "estudiante":
      case "student":
      case "alumno":
        return <PersonIcon sx={{ color: darkMode ? "#90caf9" : "#0455a2" }} />
      case "administrador":
      case "admin":
        return <AdminIcon sx={{ color: darkMode ? "#90caf9" : "#0455a2" }} />
      default:
        return <AccountCircle sx={{ color: darkMode ? "#90caf9" : "#0455a2" }} />
    }
  }

  return (
    <AppBar
      position="fixed"
      sx={{
        zIndex: (theme) => theme.zIndex.drawer + 1,
        backgroundColor: darkMode ? "#121212" : "#ffffff",
        color: darkMode ? "#ffffff" : "#333",
        boxShadow: darkMode ? "0 1px 2px rgba(255, 255, 255, 0.1)" : "0 1px 2px rgba(0, 0, 0, 0.1)",
        transition: "background-color 0.3s ease, color 0.3s ease, box-shadow 0.3s ease",
      }}
    >
      <Toolbar>
        <IconButton
          color="inherit"
          aria-label="open drawer"
          edge="start"
          onClick={onMenuClick}
          sx={{
            marginRight: 2,
            display: { sm: "none" },
          }}
        >
          <MenuIcon />
        </IconButton>

        <Box sx={{ display: "flex", alignItems: "center" }}>
          <Box
            component="img"
            src={logoSinLetras || "/placeholder.svg?height=40&width=40"}
            alt="Logo"
            sx={{
              height: 40,
              width: "auto",
              maxWidth: 40,
              mr: 1,
              objectFit: "contain",
              borderRadius: "50%", // Make it fully rounded
              backgroundColor: "white", // Always white background for the logo
              padding: "4px", // Add some padding
              boxShadow: darkMode ? "0 0 8px rgba(255, 255, 255, 0.2)" : "none", // Add subtle glow in dark mode
            }}
          />
          <Typography variant="h6" component="div" sx={{ fontWeight: "bold" }}>
            TeAcuerdas
          </Typography>
        </Box>

        <Box sx={{ flexGrow: 1 }} />

        {/* Botón para colapsar/expandir el drawer */}
        <IconButton
          color="inherit"
          onClick={toggleDrawerCollapse}
          sx={{
            mr: 2,
            display: { xs: "none", sm: "flex" },
            backgroundColor: isDrawerCollapsed ? "rgba(0, 0, 0, 0.04)" : "transparent",
          }}
        >
          {isDrawerCollapsed ? <ChevronRightIcon /> : <ChevronLeftIcon />}
        </IconButton>

        {/* Dark Mode Toggle Button */}
        <IconButton 
          size="large" 
          aria-label="toggle dark mode" 
          color="inherit"
          onClick={toggleDarkMode}
          sx={{ ml: 1 }}
        >
          {darkMode ? 
            <LightModeIcon sx={{ color: "#0455a2" }} /> : 
            <DarkModeIcon sx={{ color: "#0455a2" }} />
          }
        </IconButton>

        <Box sx={{ ml: 2 }}>
          <IconButton
            size="large"
            aria-label="account of current user"
            aria-controls="menu-appbar"
            aria-haspopup="true"
            onClick={handleMenu}
            color="inherit"
          >
            {getRoleIcon()}
          </IconButton>
          <Menu
            id="menu-appbar"
            anchorEl={anchorEl}
            anchorOrigin={{
              vertical: "bottom",
              horizontal: "right",
            }}
            keepMounted
            transformOrigin={{
              vertical: "top",
              horizontal: "right",
            }}
            open={Boolean(anchorEl)}
            onClose={handleClose}
            PaperProps={{
              elevation: 1,
              sx: {
                width: 220,
                padding: "8px 0",
                borderRadius: "8px",
                mt: 1,
                backgroundColor: darkMode ? "#1e1e1e" : "#ffffff",
                color: darkMode ? "#ffffff" : "#333",
                boxShadow: "0 2px 10px rgba(0, 0, 0, 0.1)",
              },
            }}
          >
            <MenuItem
              component={Link}
              to="/mi-perfil"
              onClick={handleClose}
              sx={{
                px: 2,
                py: 1.5,
                fontSize: "0.875rem",
                color: darkMode ? "rgba(255, 255, 255, 0.9)" : "rgba(0, 0, 0, 0.7)",
                "&:hover": { backgroundColor: darkMode ? "rgba(255, 255, 255, 0.08)" : "rgba(0, 0, 0, 0.04)" },
              }}
            >
              <PersonIcon
                fontSize="small"
                sx={{
                  mr: 2,
                  color: darkMode ? "rgba(255, 255, 255, 0.6)" : "rgba(0, 0, 0, 0.5)",
                  fontSize: "1.2rem",
                }}
              />
              Mi Perfil
            </MenuItem>
            <Box
              sx={{
                borderTop: darkMode ? "1px solid rgba(255, 255, 255, 0.12)" : "1px solid rgba(0, 0, 0, 0.12)",
                my: 1,
              }}
            />
            <MenuItem
              onClick={handleLogout}
              sx={{
                px: 2,
                py: 1.5,
                fontSize: "0.875rem",
                color: darkMode ? "rgba(255, 255, 255, 0.9)" : "rgba(0, 0, 0, 0.7)",
                "&:hover": { backgroundColor: darkMode ? "rgba(255, 255, 255, 0.08)" : "rgba(0, 0, 0, 0.04)" },
              }}
            >
              <Logout
                fontSize="small"
                sx={{
                  mr: 2,
                  color: darkMode ? "rgba(255, 255, 255, 0.6)" : "rgba(0, 0, 0, 0.5)",
                  fontSize: "1.2rem",
                }}
              />
              Cerrar Sesión
            </MenuItem>
          </Menu>
        </Box>
      </Toolbar>
    </AppBar>
  )
}

export default Navbar

