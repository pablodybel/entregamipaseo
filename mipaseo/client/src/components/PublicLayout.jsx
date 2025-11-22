import { Link, useLocation, Outlet } from 'react-router-dom'
import { Menu, X } from 'lucide-react'
import { useState } from 'react'

const PublicLayout = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const location = useLocation()

  const isActive = (path) => location.pathname === path

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12">
          <div className="flex justify-between items-center h-20">
            {/* Logo */}
            <div className="flex items-center">
              <Link to="/" className="flex items-center space-x-3 group">
                <div className="rounded-xl transition-all">
                  <img src="/logoperro.svg" alt="MiPaseo" className="h-10 w-10" />
                </div>
                <span className="logo-mipaseo text-2xl">
                  <span className="mi">Mi</span><span className="paseo">Paseo</span>
                </span>
              </Link>
            </div>

            {/* Navegación desktop */}
            <nav className="hidden md:flex items-center space-x-6">
              <Link
                to="/"
                className={`px-4 py-2 text-base font-medium transition-colors rounded-lg ${
                  isActive('/')
                    ? 'text-primary-600 bg-primary-50'
                    : 'text-gray-700 hover:text-primary-600 hover:bg-primary-50'
                }`}
              >
                Inicio
              </Link>
              <Link
                to="/login"
                className={`px-4 py-2 text-base font-medium transition-colors rounded-lg ${
                  isActive('/login')
                    ? 'text-primary-600 bg-primary-50'
                    : 'text-gray-700 hover:text-primary-600 hover:bg-primary-50'
                }`}
              >
                Acceder
              </Link>
              <Link
                to="/register"
                className="btn-primary"
              >
                Registrarse
              </Link>
            </nav>

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

        {/* Menú móvil */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-gray-200 bg-white">
            <div className="pt-3 pb-4 space-y-1 px-4">
              <Link
                to="/"
                className={`block px-4 py-3 text-base font-medium rounded-lg transition-colors ${
                  isActive('/')
                    ? 'text-primary-600 bg-primary-50'
                    : 'text-gray-700 hover:text-primary-600 hover:bg-primary-50'
                }`}
                onClick={() => setMobileMenuOpen(false)}
              >
                Inicio
              </Link>
              <Link
                to="/login"
                className={`block px-4 py-3 text-base font-medium rounded-lg transition-colors ${
                  isActive('/login')
                    ? 'text-primary-600 bg-primary-50'
                    : 'text-gray-700 hover:text-primary-600 hover:bg-primary-50'
                }`}
                onClick={() => setMobileMenuOpen(false)}
              >
                Acceder
              </Link>
              <Link
                to="/register"
                className="block w-full text-center btn-primary mt-2"
                onClick={() => setMobileMenuOpen(false)}
              >
                Registrarse
              </Link>
            </div>
          </div>
        )}
      </header>

      {/* Contenido principal */}
      <main className="flex-1">
        <Outlet />
      </main>
      
      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 mt-auto">
        <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <img src="/logoperro.svg" alt="MiPaseo" className="h-8 w-8" />
                <span className="logo-mipaseo text-xl">
                  <span className="mi">Mi</span><span className="paseo">Paseo</span>
                </span>
              </div>
              <p className="text-sm text-gray-600">
                Conectando mascotas felices con paseadores confiables.
              </p>
            </div>
            <div>
              <h3 className="text-sm font-semibold text-gray-900 mb-4">Enlaces</h3>
              <ul className="space-y-2">
                <li>
                  <Link to="/" className="text-sm text-gray-600 hover:text-primary-600 transition-colors">
                    Inicio
                  </Link>
                </li>
                <li>
                  <Link to="/login" className="text-sm text-gray-600 hover:text-primary-600 transition-colors">
                    Acceder
                  </Link>
                </li>
                <li>
                  <Link to="/register" className="text-sm text-gray-600 hover:text-primary-600 transition-colors">
                    Registrarse
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="text-sm font-semibold text-gray-900 mb-4">Contacto</h3>
              <p className="text-sm text-gray-600">
                ¿Necesitas ayuda? Contáctanos y te responderemos lo antes posible.
              </p>
            </div>
          </div>
          <div className="mt-8 pt-8 border-t border-gray-200 text-center">
            <p className="text-sm text-gray-600">
              © 2025 <span className="logo-mipaseo text-sm">
                <span className="mi">Mi</span><span className="paseo">Paseo</span>
              </span>. Todos los derechos reservados.
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}

export default PublicLayout

