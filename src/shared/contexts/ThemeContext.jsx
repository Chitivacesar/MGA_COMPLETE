import { createContext, useState, useEffect } from "react";
import { ThemeProvider as MuiThemeProvider, createTheme } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";

export const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
  const [darkMode, setDarkMode] = useState(
    localStorage.getItem("darkMode") === "true" || false
  );

  useEffect(() => {
    localStorage.setItem("darkMode", darkMode);
  }, [darkMode]);

  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
  };

  const theme = createTheme({
    palette: {
      mode: darkMode ? "dark" : "light",
      primary: {
        main: "#0455a2",
      },
      secondary: {
        main: "#6c8221",
      },
      background: {
        default: darkMode ? "#121212" : "#f5f7fa",
        paper: darkMode ? "#1e1e1e" : "#ffffff",
      },
      text: {
        primary: darkMode ? "#ffffff" : "#333333",
        secondary: darkMode ? "#b0b0b0" : "#666666",
      },
    },
    components: {
      MuiDrawer: {
        styleOverrides: {
          paper: {
            backgroundColor: darkMode ? "#1e1e1e" : "#ffffff",
            color: darkMode ? "#ffffff" : "#333333",
          },
        },
      },
      MuiAppBar: {
        styleOverrides: {
          root: {
            backgroundColor: darkMode ? "#1e1e1e" : "#ffffff",
            color: darkMode ? "#ffffff" : "#333333",
            boxShadow: darkMode ? "0 1px 2px rgba(255,255,255,0.1)" : "0 1px 2px rgba(0,0,0,0.1)",
          },
        },
      },
      MuiList: {
        styleOverrides: {
          root: {
            backgroundColor: darkMode ? "#1e1e1e" : "#ffffff",
            color: darkMode ? "#ffffff" : "#333333",
          },
        },
      },
      MuiListItem: {
        styleOverrides: {
          root: {
            "&:hover": {
              backgroundColor: darkMode ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.04)",
            },
          },
        },
      },
      MuiTable: {
        styleOverrides: {
          root: {
            backgroundColor: darkMode ? "#1e1e1e" : "#ffffff",
          },
        },
      },
      MuiTableCell: {
        styleOverrides: {
          root: {
            borderColor: darkMode ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.1)",
          },
          head: {
            backgroundColor: darkMode ? "#2d2d2d" : "#f5f5f5",
          },
        },
      },
      MuiTableRow: {
        styleOverrides: {
          root: {
            "&:hover": {
              backgroundColor: darkMode ? "rgba(255,255,255,0.04)" : "rgba(0,0,0,0.02)",
            },
          },
        },
      },
      MuiPaper: {
        styleOverrides: {
          root: {
            backgroundColor: darkMode ? "#1e1e1e" : "#ffffff",
          },
        },
      },
    },
  });

  return (
    <ThemeContext.Provider value={{ darkMode, toggleDarkMode }}>
      <MuiThemeProvider theme={theme}>
        <CssBaseline />
        {children}
      </MuiThemeProvider>
    </ThemeContext.Provider>
  );
};