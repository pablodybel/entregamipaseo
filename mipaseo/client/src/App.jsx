import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from './context/AuthContext'
import ProtectedRoute from './components/ProtectedRoute'
import Layout from './components/Layout'
import PublicLayout from './components/PublicLayout'
import Home from './pages/Home'
import Login from './pages/Login'
import LoginAdmin from './pages/admin/LoginAdmin'
import Register from './pages/Register'
import Dashboard from './pages/Dashboard'

// Owner pages
import MisMascotas from './pages/owner/MisMascotas'
import BuscarPaseadores from './pages/owner/BuscarPaseadores'
import MisSolicitudes from './pages/owner/MisSolicitudes'
import ResenasPendientes from './pages/owner/ResenasPendientes'

// Walker pages
import Solicitudes from './pages/walker/Solicitudes'
import MiPerfil from './pages/walker/MiPerfil'
import MisResenas from './pages/walker/MisResenas'

// Admin pages
import DashboardAdmin from './pages/admin/DashboardAdmin'
import GestionUsuarios from './pages/admin/GestionUsuarios'
import DetalleUsuario from './pages/admin/DetalleUsuario'

const App = () => {
  const { loading } = useAuth()

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  return (
    <Routes>
      {/* Public routes with PublicLayout */}
      <Route path="/" element={<PublicLayout />}>
        <Route index element={<Home />} />
        <Route path="login" element={<Login />} />
        <Route path="register" element={<Register />} />
      </Route>

      {/* Admin login (separate route without PublicLayout) */}
      <Route path="/admin/login" element={<LoginAdmin />} />

      {/* Protected routes */}
      <Route
        element={
          <ProtectedRoute>
            <Layout />
          </ProtectedRoute>
        }
      >
        <Route path="dashboard" element={<Dashboard />} />

        {/* Owner routes */}
        <Route
          path="mascotas"
          element={
            <ProtectedRoute allowedRoles={['OWNER']}>
              <MisMascotas />
            </ProtectedRoute>
          }
        />
        <Route
          path="paseadores"
          element={
            <ProtectedRoute allowedRoles={['OWNER']}>
              <BuscarPaseadores />
            </ProtectedRoute>
          }
        />
        <Route
          path="mis-solicitudes"
          element={
            <ProtectedRoute allowedRoles={['OWNER']}>
              <MisSolicitudes />
            </ProtectedRoute>
          }
        />
        <Route
          path="resenas-pendientes"
          element={
            <ProtectedRoute allowedRoles={['OWNER']}>
              <ResenasPendientes />
            </ProtectedRoute>
          }
        />

        {/* Walker routes */}
        <Route
          path="solicitudes"
          element={
            <ProtectedRoute allowedRoles={['WALKER']}>
              <Solicitudes />
            </ProtectedRoute>
          }
        />
        <Route
          path="perfil"
          element={
            <ProtectedRoute allowedRoles={['WALKER']}>
              <MiPerfil />
            </ProtectedRoute>
          }
        />
        <Route
          path="mis-resenas"
          element={
            <ProtectedRoute allowedRoles={['WALKER']}>
              <MisResenas />
            </ProtectedRoute>
          }
        />

        {/* Admin routes */}
        <Route
          path="admin/dashboard"
          element={
            <ProtectedRoute allowedRoles={['ADMIN']}>
              <DashboardAdmin />
            </ProtectedRoute>
          }
        />
        <Route
          path="admin/usuarios"
          element={
            <ProtectedRoute allowedRoles={['ADMIN']}>
              <GestionUsuarios />
            </ProtectedRoute>
          }
        />
        <Route
          path="admin/usuarios/:id"
          element={
            <ProtectedRoute allowedRoles={['ADMIN']}>
              <DetalleUsuario />
            </ProtectedRoute>
          }
        />
      </Route>

      {/* Unauthorized page */}
      <Route
        path="/unauthorized"
        element={
          <div className="min-h-screen flex items-center justify-center">
            <div className="text-center">
              <h1 className="text-2xl font-bold text-gray-900 mb-4">
                No tienes permisos para acceder a esta página
              </h1>
              <Navigate to="/dashboard" />
            </div>
          </div>
        }
      />

      {/* 404 */}
      <Route
        path="*"
        element={
          <div className="min-h-screen flex items-center justify-center">
            <div className="text-center">
              <h1 className="text-2xl font-bold text-gray-900 mb-4">
                Página no encontrada
              </h1>
              <Navigate to="/" />
            </div>
          </div>
        }
      />
    </Routes>
  )
}

export default App
