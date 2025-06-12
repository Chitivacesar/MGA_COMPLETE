"use client";

import { useState, useContext } from "react";
import { Link } from "react-router-dom";
import {
  Drawer,
  List,
  ListItemIcon,
  ListItemText,
  ListItemButton,
  Collapse,
  Box,
  useTheme,
  useMediaQuery,
  Tooltip,
  Toolbar,
  Typography,
} from "@mui/material";
import Navbar from "./Navbar";
import {
  ExpandLess,
  ExpandMore,
  Dashboard,
  Settings,
  MusicNote,
  ShoppingCart,
  People,
  Person,
  VpnKey,
  School,
  Schedule,
  Class,
  MeetingRoom,
  Payment,
  AssignmentTurnedIn,
} from "@mui/icons-material";
import { ThemeContext } from "../contexts/ThemeContext";
import { useAuth } from "../../features/auth/context/AuthContext";
import { useLocation } from "react-router-dom";

const Navigation = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const [mobileOpen, setMobileOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const { darkMode } = useContext(ThemeContext);
  const { user } = useAuth(); // Obtener el usuario autenticado
  const location = useLocation();

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const toggleDrawerCollapse = () => {
    setIsCollapsed(!isCollapsed);
  };

  const [openMenus, setOpenMenus] = useState({});

  const handleSubmenuClick = (key) => {
    if (isCollapsed) {
      setIsCollapsed(false);
      setTimeout(() => {
        setOpenMenus((prev) => ({
          ...prev,
          [key]: true,
        }));
      }, 300);
      return;
    }

    setOpenMenus((prev) => {
      if (prev[key]) {
        return {
          ...prev,
          [key]: false,
        };
      }

      const newState = {};
      Object.keys(prev).forEach((menuKey) => {
        newState[menuKey] = false;
      });

      return {
        ...newState,
        [key]: true,
      };
    });
  };

  // Definir los elementos del menú con permisos asociados
  const menuItems = [
    {
      label: "Dashboard",
      path: "/dashboard",
      icon: <Dashboard />,
      permission: "dashboard",
    },
    {
      label: "Servicios Musicales",
      icon: <MusicNote />,
      submenu: [
        {
          label: "Profesores",
          path: "/servicios-musicales/profesores",
          icon: <People />,
          permission: "servicios-musicales-profesores",
        },
        {
          label: "Programación de Profesores",
          path: "/servicios-musicales/programacion-profesores",
          icon: <Schedule />,
          permission: "servicios-musicales-programacion-profesores",
        },
        {
          label: "Programación de Clases",
          path: "/servicios-musicales/programacion-clases",
          icon: <Schedule />,
          permission: "servicios-musicales-programacion-clases",
        },
        {
          label: "Cursos/Matrículas",
          path: "/servicios-musicales/cursos-matriculas",
          icon: <School />,
          permission: "servicios-musicales-cursos-matriculas",
        },
        {
          label: "Aulas",
          path: "/servicios-musicales/aulas",
          icon: <MeetingRoom />,
          permission: "servicios-musicales-aulas",
        },
        {
          label: "Clases",
          path: "/servicios-musicales/clases",
          icon: <Class />,
          permission: "servicios-musicales-clases",
        },
      ],
    },
    {
      label: "Venta de Servicios",
      icon: <ShoppingCart />,
      submenu: [
        {
          label: "Clientes",
          path: "/venta-servicios/clientes",
          icon: <People />,
          permission: "venta-servicios-clientes",
        },
        {
          label: "Beneficiarios",
          path: "/venta-servicios/beneficiarios",
          icon: <School />,
          permission: "venta-servicios-beneficiarios",
        },
        {
          label: "Venta de Matrículas",
          path: "/venta-servicios/venta-matriculas",
          icon: <ShoppingCart />,
          permission: "venta-servicios-venta-matriculas",
        },
        {
          label: "Venta de Cursos",
          path: "/venta-servicios/venta-cursos",
          icon: <ShoppingCart />,
          permission: "venta-servicios-venta-cursos",
        },
        {
          label: "Pagos",
          path: "/venta-servicios/pagos",
          icon: <Payment />,
          permission: "venta-servicios-pagos",
        },
        {
          label: "Asistencia",
          path: "/venta-servicios/asistencia",
          icon: <AssignmentTurnedIn />,
          permission: "venta-servicios-asistencia",
        },
      ],
    },
    {
      label: "Configuración",
      icon: <Settings />,
      submenu: [
        {
          label: "Roles",
          path: "/configuracion/roles",
          icon: <VpnKey />,
          permission: "configuracion-roles",
        },
        {
          label: "Usuarios",
          path: "/configuracion/usuarios",
          icon: <Person />,
          permission: "configuracion-usuarios",
        },
      ],
    },
  ];

  // Filtrar los elementos del menú según los permisos del usuario
  const filterMenuItems = (items) => {
    return items
      .filter((item) => {
        if (item.permission) {
          return user?.permissions.includes(item.permission) || user?.permissions.includes("*");
        }
        return true;
      })
      .map((item) => {
        if (item.submenu) {
          const filteredSubmenu = filterMenuItems(item.submenu);
          if (filteredSubmenu.length > 0) {
            return { ...item, submenu: filteredSubmenu };
          }
          return null;
        }
        return item;
      })
      .filter(Boolean);
  };

  const filteredMenuItems = filterMenuItems(menuItems);

  const isActive = (path) => location.pathname === path;

  const renderMenuItem = (item) => {
    if (item.submenu) {
      return (
        <div key={item.label}>
          <Tooltip title={isCollapsed ? item.label : ""} placement="right" arrow>
            <ListItemButton
              onClick={() => handleSubmenuClick(item.label)}
              sx={{
                borderRadius: "8px",
                mb: 0.5,
                mx: 1,
                justifyContent: isCollapsed ? "center" : "flex-start",
                backgroundColor: isActive(item.path) ? "rgba(124, 148, 39, 0.1)" : "transparent",
                "&:hover": {
                  backgroundColor: "rgba(124, 148, 39, 0.2)",
                },
              }}
            >
              <ListItemIcon
                sx={{
                  minWidth: isCollapsed ? 0 : "40px",
                  color: "#0455a2",
                  mr: isCollapsed ? 0 : 2,
                }}
              >
                {item.icon}
              </ListItemIcon>
              {!isCollapsed && (
                <>
                  <ListItemText
                    primary={item.label}
                    primaryTypographyProps={{
                      fontSize: "0.875rem",
                      fontWeight: 500,
                      color: darkMode ? "#ffffff" : "#333",
                    }}
                  />
                  {openMenus[item.label] ? <ExpandLess /> : <ExpandMore />}
                </>
              )}
            </ListItemButton>
          </Tooltip>
          <Collapse in={openMenus[item.label]} timeout="auto" unmountOnExit>
            <List component="div" disablePadding>
              {item.submenu.map((subItem) => (
                <ListItemButton
                  key={subItem.path}
                  component={Link}
                  to={subItem.path}
                  sx={{
                    pl: 4,
                    py: 0.75,
                    borderRadius: "8px",
                    mx: 1,
                    mb: 0.5,
                    backgroundColor: isActive(subItem.path) ? "rgba(124, 148, 39, 0.1)" : "transparent",
                    "&:hover": {
                      backgroundColor: "rgba(124, 148, 39, 0.2)",
                    },
                  }}
                >
                  <ListItemIcon
                    sx={{
                      minWidth: "40px",
                      color: "#0455a2",
                    }}
                  >
                    {subItem.icon}
                  </ListItemIcon>
                  <ListItemText
                    primary={subItem.label}
                    primaryTypographyProps={{
                      fontSize: "0.875rem",
                      fontWeight: 400,
                      color: darkMode ? "#ffffff" : "#555",
                    }}
                  />
                </ListItemButton>
              ))}
            </List>
          </Collapse>
        </div>
      );
    }

    return (
      <Tooltip title={isCollapsed ? item.label : ""} placement="right" arrow key={item.path}>
        <ListItemButton
          component={Link}
          to={item.path}
          sx={{
            borderRadius: "8px",
            mb: 0.5,
            mx: 1,
            justifyContent: isCollapsed ? "center" : "flex-start",
            backgroundColor: isActive(item.path) ? "rgba(124, 148, 39, 0.1)" : "transparent",
            "&:hover": {
              backgroundColor: "rgba(124, 148, 39, 0.2)",
            },
          }}
        >
          <ListItemIcon
            sx={{
              minWidth: isCollapsed ? 0 : "40px",
              color: "#0455a2",
              mr: isCollapsed ? 0 : 2,
            }}
          >
            {item.icon}
          </ListItemIcon>
          {!isCollapsed && (
            <ListItemText
              primary={item.label}
              primaryTypographyProps={{
                fontSize: "0.875rem",
                fontWeight: 500,
                color: darkMode ? "#ffffff" : "#333",
              }}
            />
          )}
        </ListItemButton>
      </Tooltip>
    );
  };

  return (
    <Box sx={{ display: "flex" }}>
      <Navbar
        onMenuClick={handleDrawerToggle}
        isDrawerCollapsed={isCollapsed}
        toggleDrawerCollapse={toggleDrawerCollapse}
      />
      <Drawer
        variant={isMobile ? "temporary" : "permanent"}
        open={isMobile ? mobileOpen : true}
        onClose={handleDrawerToggle}
        sx={{
          "& .MuiDrawer-paper": {
            width: isCollapsed ? 70 : 250,
            transition: theme.transitions.create("width", {
              easing: theme.transitions.easing.sharp,
              duration: theme.transitions.duration.enteringScreen,
            }),
          },
        }}
      >
        <Toolbar />
        <List>{filteredMenuItems.map(renderMenuItem)}</List>
      </Drawer>
    </Box>
  );
};

export default Navigation;