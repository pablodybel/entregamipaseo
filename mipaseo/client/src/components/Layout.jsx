import { Outlet, Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { Menu, X } from 'lucide-react'
import { useState } from 'react'

const Layout = () => {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const handleLogout = async () => { /*Función que maneja el proceso de cerrar sesión, logout()*/ 
    const isAdmin = user?.role === 'ADMIN'
    await logout()
    navigate(isAdmin ? '/admin/login' : '/login') /*Redirige  a la página de login*/
  }

  const ownerNavigation = [ /*Navegación para el rol de dueño*/
    { name: 'Inicio', href: '/dashboard' },
    { name: 'Mascotas', href: '/mascotas' },
    { name: 'Buscar Paseadores', href: '/paseadores' },
    { name: 'Solicitudes', href: '/mis-solicitudes' },
    
  ]

  const walkerNavigation = [ /*Navegación para el rol de paseador*/
    { name: 'Inicio', href: '/dashboard' },
    { name: 'Solicitudes', href: '/solicitudes' },
    { name: 'Perfil', href: '/perfil' },
    { name: 'Reseñas', href: '/mis-resenas' }
  ]

  const adminNavigation = [ /*Navegación para el rol de administrador */ 
    { name: 'Inicio', href: '/admin/dashboard' },
    { name: 'Dueños', href: '/admin/usuarios?role=OWNER' },
    { name: 'Paseadores', href: '/admin/usuarios?role=WALKER' }
  ]

  // Determina la navegación según el rol
  let navigation
  if (user?.role === 'ADMIN') {
    navigation = adminNavigation
  } else if (user?.role === 'OWNER') {
    navigation = ownerNavigation
  } else {
    navigation = walkerNavigation
  } 

  return ( /*Renderiza el layout principal, incluyendo el header, el contenido y el footer*/ 
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12">
          <div className="flex justify-between items-center h-20">
            {/* Logo */}
            <div className="flex items-center">
              <Link to="/dashboard" className="flex items-center space-x-3 group">
                <div className="rounded-xl transition-all">
                  <img src="/logoperro.svg" alt="MiPaseo" className="h-10 w-10" />
                </div>
                <span className="logo-mipaseo text-2xl">
                  <span className="mi">Mi</span><span className="paseo">Paseo</span>
                </span>
              </Link>
            </div>

            {/* vista de escritorio */}
            <nav className="hidden md:flex items-center space-x-2">
              {navigation.map((item) => {
                return (
                  <Link
                    key={item.name}
                    to={item.href}
                    className="inline-flex items-center px-6 py-3 text-base font-medium text-gray-700 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-all duration-200"
                  >
                    {item.name}
                  </Link>
                )
              })}
            </nav>

            {/* User Menu */}
            <div className="flex items-center space-x-4">
              {/* User Info */}
              <div className="hidden md:flex items-center space-x-3 bg-white px-5 py-3 rounded-lg border-gray-200">
                <div className="text-right">
                  <p className="text-sm font-semibold text-gray-900">{user?.name}</p>
                  <p className="text-xs text-gray-600">
                    {user?.role === 'ADMIN' ? 'Administrador' : user?.role === 'OWNER' ? 'Dueño' : 'Paseador'}
                  </p>
                </div>
                {user?.avatarUrl ? ( /*Si tiene una imagen de perfil, la muestra*/
                  <img
                    className="h-10 w-10 rounded-full object-cover border-2 border-gray-200"
                    src={`${import.meta.env.VITE_API_BASE?.replace('/api/v1', '') || 'http://localhost:4000'}${user.avatarUrl}`}
                    alt={user.name}
                  />
                ) : ( /*Si no tiene una imagen de perfil, muestra la inicial del nombre*/
                  <div className="h-10 w-10 rounded-full bg-primary-500 flex items-center justify-center text-white font-semibold text-base">
                    {user?.name?.charAt(0).toUpperCase()}
                  </div>
                )}
              </div>

              {/* Botón de cerrar sesión */}
              <button
                onClick={handleLogout}
                className="hidden md:inline-flex items-center px-5 py-3 text-base font-medium text-gray-700 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all duration-200"
              >
                Salir
              </button>

              {/* Botón de menú móvil */}
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="md:hidden inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100"
              >
                {mobileMenuOpen ? (
                  <X className="h-6 w-6" />
                ) : (
                  <Menu className="h-6 w-6" />
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Menú móvil */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-gray-200 bg-white">
            <div className="pt-3 pb-4 space-y-1 px-4">
              {navigation.map((item) => {
                return (
                  <Link
                    key={item.name}
                    to={item.href}
                    className="block px-4 py-3 text-base font-medium text-gray-700 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-all"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    {item.name}
                  </Link>
                )
              })}
              <button
                onClick={handleLogout}
                className="block w-full text-left px-4 py-3 text-base font-medium text-gray-700 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
              >
                Cerrar Sesión
              </button>
            </div>
            <div className="pt-4 pb-3 border-t border-gray-200">
              <div className="flex items-center px-4">
                {user?.avatarUrl && (
                  <img
                    className="h-10 w-10 rounded-full object-cover"
                    src={`${import.meta.env.VITE_API_BASE?.replace('/api/v1', '') || 'http://localhost:4000'}${user.avatarUrl}`}
                    alt={user.name}
                  />
                )}
                <div className="ml-3">
                  <div className="text-base font-medium text-gray-800">{user?.name}</div>
                  <div className="text-sm font-medium text-gray-500 capitalize">
                    {user?.role === 'ADMIN' ? 'Administrador' : user?.role === 'OWNER' ? 'Dueño' : 'Paseador'}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </header>

      {/* Contenido principal */}
      <main className="flex-1 max-w-7xl mx-auto py-8 sm:px-6 lg:px-8 w-full">
        <Outlet /> {/*Renderiza el componente hijo actual*/}
      </main>
      
      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 mt-auto">
        <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <p className="text-sm text-gray-600">
              © 2025 <span className="logo-mipaseo text-sm">
                <span className="mi">Mi</span><span className="paseo">Paseo</span>
              </span>. Conectando mascotas felices con paseadores confiables.
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}

export default Layout