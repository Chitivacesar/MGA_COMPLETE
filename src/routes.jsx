import { createBrowserRouter } from 'react-router-dom';
import { lazy } from 'react';
import App from './App';
import ProtectedRoute from './shared/components/ProtectedRoute';
import PublicRoute from './shared/components/PublicRoute';
import ForgotPassword from './features/auth/pages/ForgotPassword';
import AccountSettings from './features/auth/Pages/AccountSettings';

// Carga perezosa de componentes de ruta
const Dashboard = lazy(() => import('./features/dashboard/pages/Dashboard'));
const Auth = lazy(() => import('./features/auth/pages/Auth'));
const Home = lazy(() => import('./Home'));

// Rutas de configuración
const Roles = lazy(() => import('./features/configuracion/pages/Roles'));
const Usuarios = lazy(() => import('./features/configuracion/pages/Usuarios'));

// Rutas de servicios musicales
const Profesores = lazy(() => import('./features/servicios-musicales/pages/Profesores'));
const ProgramacionProfesores = lazy(() => import('./features/servicios-musicales/pages/ProgramacionProfesores'));
const CursosMatriculas = lazy(() => import('./features/servicios-musicales/pages/CursosMatriculas'));
const Aulas = lazy(() => import('./features/servicios-musicales/pages/Aulas'));
const Clases = lazy(() => import('./features/servicios-musicales/pages/Clases'));
const ProgramacionClases = lazy(() => import('./features/servicios-musicales/pages/ProgramacionClases'));

// Rutas de venta de servicios
const Clientes = lazy(() => import('./features/venta-servicios/pages/Clientes'));
const Beneficiarios = lazy(() => import('./features/venta-servicios/pages/Beneficiarios'));
const VentaMatriculas = lazy(() => import('./features/venta-servicios/pages/VentaMatriculas'));
const VentaCursos = lazy(() => import('./features/venta-servicios/pages/VentaCursos'));
const Pagos = lazy(() => import('./features/venta-servicios/pages/Pagos'));
const Asistencia = lazy(() => import('./features/venta-servicios/pages/Asistencia'));

export const router = createBrowserRouter([
  {
    path: '/',
    element: <App />,
    children: [
      {
        index: true,
        element: (
          <PublicRoute>
            <Home />
          </PublicRoute>
        )
      },
      {
        path: 'auth',
        element: (
          <PublicRoute>
            <Auth />
          </PublicRoute>
        )
      },
      {
        path: 'forgot-password',
        element: (
          <PublicRoute>
            <ForgotPassword />
          </PublicRoute>
        )
      },
      {
        path: 'dashboard',
        element: (
          <ProtectedRoute requiredPermissions={['dashboard']}>
            <Dashboard />
          </ProtectedRoute>
        )
      },
      {
        path: 'mi-perfil',
        element: (
          <ProtectedRoute>
            <AccountSettings />
          </ProtectedRoute>
        )
      },
      // Rutas de configuración
      {
        path: 'configuracion',
        children: [
          {
            path: 'roles',
            element: (
              <ProtectedRoute requiredPermissions={['configuracion-roles']}>
                <Roles />
              </ProtectedRoute>
            )
          },
          {
            path: 'usuarios',
            element: (
              <ProtectedRoute requiredPermissions={['configuracion-usuarios']}>
                <Usuarios />
              </ProtectedRoute>
            )
          }
        ]
      },
      // Rutas de servicios musicales
      {
        path: 'servicios-musicales',
        children: [
          {
            path: 'profesores',
            element: (
              <ProtectedRoute requiredPermissions={['servicios-musicales-profesores']}>
                <Profesores />
              </ProtectedRoute>
            )
          },
          {
            path: 'programacion-profesores',
            element: (
              <ProtectedRoute requiredPermissions={['servicios-musicales-programacion-profesores']}>
                <ProgramacionProfesores />
              </ProtectedRoute>
            )
          },
          {
            path: 'programacion-clases',
            element: (
              <ProtectedRoute requiredPermissions={['servicios-musicales-programacion-clases']}>
                <ProgramacionClases />
              </ProtectedRoute>
            )
          },
          {
            path: 'cursos-matriculas',
            element: (
              <ProtectedRoute requiredPermissions={['servicios-musicales-cursos-matriculas']}>
                <CursosMatriculas />
              </ProtectedRoute>
            )
          },
          {
            path: 'aulas',
            element: (
              <ProtectedRoute requiredPermissions={['servicios-musicales-aulas']}>
                <Aulas />
              </ProtectedRoute>
            )
          },
          {
            path: 'clases',
            element: (
              <ProtectedRoute requiredPermissions={['servicios-musicales-clases']}>
                <Clases />
              </ProtectedRoute>
            )
          }
        ]
      },
      // Rutas de venta de servicios
      {
        path: 'venta-servicios',
        children: [
          {
            path: 'clientes',
            element: (
              <ProtectedRoute requiredPermissions={['venta-servicios-clientes']}>
                <Clientes />
              </ProtectedRoute>
            )
          },
          {
            path: 'beneficiarios',
            element: (
              <ProtectedRoute requiredPermissions={['venta-servicios-estudiantes']}>
                <Beneficiarios />
              </ProtectedRoute>
            )
          },
          {
            path: 'venta-matriculas',
            element: (
              <ProtectedRoute requiredPermissions={['venta-servicios-venta-matriculas']}>
                <VentaMatriculas />
              </ProtectedRoute>
            )
          },
          {
            path: 'venta-cursos',
            element: (
              <ProtectedRoute requiredPermissions={['venta-servicios-venta-cursos']}>
                <VentaCursos />
              </ProtectedRoute>
            )
          },
          {
            path: 'pagos',
            element: (
              <ProtectedRoute requiredPermissions={['venta-servicios-pagos']}>
                <Pagos />
              </ProtectedRoute>
            )
          },
          {
            path: 'asistencia',
            element: (
              <ProtectedRoute requiredPermissions={['venta-servicios-asistencia']}>
                <Asistencia />
              </ProtectedRoute>
            )
          }
        ]
      }
    ]
  }
]);

export default router;