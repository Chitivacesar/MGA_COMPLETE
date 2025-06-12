import { Suspense } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Navigation from './shared/components/Navigation';
import { NavigationBar } from './shared/components/NavigationBar';
import { AuthProvider, useAuth } from './features/auth/context/AuthContext';
import { ThemeProvider } from "./shared/contexts/ThemeContext";
import { AlertProvider } from "./shared/contexts/AlertContext";

const AppContent = () => {
  const { user } = useAuth();
  const location = useLocation();
  const isHomePage = location.pathname === '/';

  // Si estamos en la página de inicio y no hay usuario logueado, mostrar solo el contenido
  if (isHomePage && !user) {
    return (
      <div style={{ display: 'flex', minHeight: '100vh' }}>
        <main style={{ 
          flexGrow: 1, 
          padding: 0,
          width: '100%',
          boxSizing: 'border-box',
          overflowY: 'auto'
        }}>
          <Suspense fallback={<div>Cargando...</div>}>
            <Outlet />
          </Suspense>
        </main>
      </div>
    );
  }

  // Mostrar el diseño completo con navegación
  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      <Navigation />
      <div style={{ 
        display: 'flex', 
        flexDirection: 'column',
        width: '100%'
      }}>
        <NavigationBar />
        <main style={{ 
          flexGrow: 1, 
          padding: '2rem',
          width: 'calc(100% - 320px)',
          marginLeft: '280px',
          marginRight: '200px',
          position: 'fixed',
          boxSizing: 'border-box',
          top: '64px', // Altura del NavigationBar
          bottom: 0,
          overflowY: 'auto',
          msOverflowStyle: 'none',
          scrollbarWidth: 'none'
        }}>
          <Suspense fallback={<div>Cargando...</div>}>
            <Outlet />
          </Suspense>
        </main>
      </div>
    </div>
  );
};

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <AlertProvider>
          <AppContent />
          <style>
            {`
              main::-webkit-scrollbar {
                display: none;
              }
            `}
          </style>
        </AlertProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;


