import { Navigate, useLocation } from 'react-router-dom' /*Importa las funciones Navigate y useLocation de react-router-dom*/
import { useAuth } from '../context/AuthContext' /*Importa el contexto de autenticación*/

const ProtectedRoute = ({ children, allowedRoles = [] }) => { /*Componente que protege las rutas, verifica si el usuario está autenticado y tiene los roles permitidos*/  /*children: Componentes hijos que se renderizarán dentro de la ruta protegida, allowedRoles: roles permitidos para acceder a la ruta*/
  const { isAuthenticated, user, loading } = useAuth() /*Obtiene el estado de autenticación, el usuario y el estado de carga del contexto de autenticación*/
  const location = useLocation() /*da la ubicación actual de la ruta*/ /*useLocation: devuelve la ubicación actual de la ruta*/

  if (loading) { /*Si el usuario está cargando, muestra un spinner*/
    return ( /*muestra spinner mientras el usuario está cargando*/
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  if (!isAuthenticated) { /*Si el usuario no está autenticado, redirige al login*/ 
    // Si la ruta es de admin, redirigir al login de admin
    const isAdminRoute = location.pathname.startsWith('/admin') /*Si la ruta comienza con /admin, es una ruta de admin*/
    const loginPath = isAdminRoute ? '/admin/login' : '/login' /*Si es una ruta de admin, redirige al login de admin, si no, redirige al login*/
    return <Navigate to={loginPath} state={{ from: location }} replace /> /*Redirige al login*/
  }

  if (allowedRoles.length > 0 && !allowedRoles.includes(user?.role)) { /*Si el usuario no tiene los roles permitidos, redirige a la página de no autorizado*/
    return <Navigate to="/unauthorized" replace /> /*Redirige a la página de no autorizado*/    /*replace: Reemplaza la ruta actual por la nueva*/  
  }

    return children /*Si el usuario está autenticado y tiene los roles permitidos, renderiza los componentes hijos*/  /*children: Componentes hijos que se renderizarán dentro de la ruta protegida*/ 
}

export default ProtectedRoute

/* proteccion para el frontend,sin esto cualquier usuario no logueado podria acceder, ojo igual hay que colocar el middleware para el backend */