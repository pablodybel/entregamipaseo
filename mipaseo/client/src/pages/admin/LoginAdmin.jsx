import { useState, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { Mail, Lock, Eye, EyeOff, Shield } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'

const LoginAdmin = () => {
  const [showPassword, setShowPassword] = useState(false)
  const { login, loading, isAuthenticated, user } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  const from = location.state?.from?.pathname || '/admin/dashboard'

  // Si el usuario ya está autenticado como admin, redirigir al dashboard
  useEffect(() => {
    if (!loading && isAuthenticated && user?.role === 'ADMIN') {
      navigate(from, { replace: true })
    }
  }, [loading, isAuthenticated, user, navigate, from])

  const {
    register,
    handleSubmit,
    formState: { errors },
    setError
  } = useForm()

  const onSubmit = async (data) => {
    const result = await login(data, 'admin')

    if (result.success) {
      // Si el login es exitoso con tipo 'admin', el usuario ya fue validado como ADMIN en AuthContext
      navigate(from, { replace: true })
    } else {
      setError('root', { message: result.error })
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        {/* Header */}
        <div className="text-center">
          <div className="flex justify-center">
            <div className="rounded-2xl">
              <img src="/logoperro.svg" alt="MiPaseo" className="h-20 w-20" />
            </div>
          </div>
          <div className="mt-6 flex items-center justify-center gap-3">
            <Shield className="h-8 w-8 text-yellow-400" />
            <h2 className="text-4xl font-bold text-white">
              <span className="logo-mipaseo text-4xl">
                <span className="mi text-white">Mi</span><span className="paseo text-yellow-400">Paseo</span>
              </span>
            </h2>
            <Shield className="h-8 w-8 text-yellow-400" />
          </div>
          <p className="mt-3 text-base text-gray-300">
            Panel de Administración
          </p>
          <p className="mt-2 text-sm text-gray-400">
            Acceso exclusivo para administradores
          </p>
        </div>

        {/* Form */}
        <form className="mt-8 space-y-6 bg-gray-800 p-8 rounded-xl shadow-2xl border border-gray-700" onSubmit={handleSubmit(onSubmit)}>
          <div className="space-y-4">
            {/* Email */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-300">
                Correo electrónico
              </label>
              <div className="mt-1 relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  {...register('email', {
                    required: 'El correo es requerido',
                    pattern: {
                      value: /^\S+@\S+$/i,
                      message: 'Formato de correo inválido'
                    }
                  })}
                  type="email"
                  className="input pl-10 bg-gray-700 text-white border-gray-600 focus:border-yellow-400 focus:ring-yellow-400"
                  placeholder="admin@mipaseo.com"
                />
              </div>
              {errors.email && (
                <p className="mt-1 text-sm text-red-400">{errors.email.message}</p>
              )}
            </div>

            {/* Password */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-300">
                Contraseña
              </label>
              <div className="mt-1 relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  {...register('password', {
                    required: 'La contraseña es requerida'
                  })}
                  type={showPassword ? 'text' : 'password'}
                  className="input pl-10 pr-10 bg-gray-700 text-white border-gray-600 focus:border-yellow-400 focus:ring-yellow-400"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5 text-gray-400" />
                  ) : (
                    <Eye className="h-5 w-5 text-gray-400" />
                  )}
                </button>
              </div>
              {errors.password && (
                <p className="mt-1 text-sm text-red-400">{errors.password.message}</p>
              )}
            </div>
          </div>

          {/* Error message */}
          {errors.root && (
            <div className="bg-red-900/50 border border-red-700 rounded-md p-4">
              <p className="text-sm text-red-300">{errors.root.message}</p>
            </div>
          )}

          {/* Submit button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-yellow-500 text-gray-900 font-semibold py-3 px-6 rounded-lg shadow-md hover:bg-yellow-600 hover:shadow-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <div className="flex items-center justify-center">
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-gray-900 mr-2"></div>
                Iniciando sesión...
              </div>
            ) : (
              <div className="flex items-center justify-center gap-2">
                <Shield className="h-5 w-5" />
                Acceder como Administrador
              </div>
            )}
          </button>
        </form>
      </div>
    </div>
  )
}

export default LoginAdmin

