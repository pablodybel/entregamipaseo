import { useState } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { Mail, Lock, Eye, EyeOff } from 'lucide-react'
import { useAuth } from '../context/AuthContext'

const Login = () => {
  const [showPassword, setShowPassword] = useState(false)
  const { login, loading } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  const from = location.state?.from?.pathname || '/dashboard'

  const {
    register,
    handleSubmit,
    formState: { errors },
    setError
  } = useForm()

  const onSubmit = async (data) => {
    const result = await login(data)

    if (result.success) {
      navigate(from, { replace: true })
    } else {
      setError('root', { message: result.error })
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        {/* Header */}
        <div className="text-center">
          <div className="flex justify-center">
            <div className="rounded-2xl">
              <img src="/logoperro.svg" alt="MiPaseo" className="h-20 w-20" />
            </div>
          </div>
          <h2 className="mt-6 text-4xl font-bold">
            <span className="logo-mipaseo text-4xl">
              <span className="mi">Mi</span><span className="paseo">Paseo</span>
            </span>
          </h2>
          <p className="mt-3 text-base text-gray-600">
            ¿No tienes cuenta?{' '}
            <Link
              to="/register"
              className="font-semibold text-primary-600 hover:text-primary-700 transition-colors"
            >
              Regístrate aquí
            </Link>
          </p>
        </div>

        {/* Form */}
        <form className="mt-8 space-y-6 bg-white p-8 rounded-xl shadow-lg border border-gray-200" onSubmit={handleSubmit(onSubmit)}>
          <div className="space-y-4">
            {/* Email */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
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
                  className="input pl-10"
                  placeholder="tu@email.com"
                />
              </div>
              {errors.email && (
                <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>
              )}
            </div>

            {/* Password */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
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
                  className="input pl-10 pr-10"
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
                <p className="mt-1 text-sm text-red-600">{errors.password.message}</p>
              )}
            </div>
          </div>

          {/* Forgot password */}
          <h5 className="text-sm text-gray-600 text-center">¿Olvidaste tu contraseña?</h5>

          {/* Error message */}
          {errors.root && (
            <div className="bg-red-50 border border-red-200 rounded-md p-4">
              <p className="text-sm text-red-600">{errors.root.message}</p>
            </div>
          )}

          {/* Submit button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-primary-600 text-white font-semibold py-3 px-6 rounded-lg shadow-md hover:bg-primary-700 hover:shadow-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <div className="flex items-center justify-center">
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                Iniciando sesión...
              </div>
            ) : (
              'Iniciar sesión'
            )}
          </button>

          {/* Demo credentials */}
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-5 mt-4">
            <h4 className="text-sm font-semibold text-gray-800 mb-3 flex items-center gap-2">
              <span className="w-2 h-2 bg-secondary-500 rounded-full animate-pulse"></span>
              Credenciales de prueba:
            </h4>
            <div className="text-xs text-gray-700 space-y-2">
              <div className="bg-white rounded-lg p-3 border border-gray-200">
                <p className="font-semibold text-primary-600">Dueño de mascota</p>
                <p className="text-gray-700 mt-1 font-medium">ana.garcia@email.com</p>
                <p className="text-gray-500">password123</p>
              </div>
              <div className="bg-white rounded-lg p-3 border border-gray-200">
                <p className="font-semibold text-secondary-600">Paseador</p>
                <p className="text-gray-700 mt-1 font-medium">pedro.martinez@email.com</p>
                <p className="text-gray-500">password123</p>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  )
}

export default Login