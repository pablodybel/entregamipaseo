import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { Mail, Lock, Eye, EyeOff, User, Phone, MapPin, Dog } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { CABA_NEIGHBORHOODS } from '../utils/constants'

const Register = () => {
  const [showPassword, setShowPassword] = useState(false)
  const [role, setRole] = useState('OWNER')
  const { register: registerUser, loading } = useAuth()
  const navigate = useNavigate()

  const {
    register,
    handleSubmit,
    formState: { errors },
    setError,
    watch
  } = useForm({
    defaultValues: {
      role: 'OWNER'
    }
  })

  const watchedRole = watch('role')

  const onSubmit = async (data) => {
    const result = await registerUser(data)

    if (result.success) {
      // Redirigir al login después del registro exitoso
      navigate('/login')
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
            ¿Ya tienes cuenta?{' '}
            <Link
              to="/login"
              className="font-semibold text-primary-600 hover:text-primary-700 transition-colors"
            >
              Inicia sesión
            </Link>
          </p>
        </div>

        {/* Form */}
        <form className="mt-8 space-y-6 bg-white p-8 rounded-xl shadow-lg border border-gray-200" onSubmit={handleSubmit(onSubmit)}>
          <div className="space-y-4">
            {/* Role Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                ¿Cómo quieres usar MiPaseo?
              </label>
              <div className="grid grid-cols-2 gap-3">
                <label className="relative">
                  <input
                    {...register('role')}
                    type="radio"
                    value="OWNER"
                    className="sr-only"
                  />
                  <div className={`p-4 border-2 rounded-lg cursor-pointer transition-all duration-200 ${
                    watchedRole === 'OWNER'
                      ? 'border-primary-500 bg-primary-50 shadow-md'
                      : 'border-gray-200 hover:border-primary-300 hover:bg-gray-50'
                  }`}>
                    <div className="text-center">
                      <Dog className={`h-7 w-7 mx-auto mb-2 ${watchedRole === 'OWNER' ? 'text-primary-600' : 'text-gray-500'}`} />
                      <div className="text-sm font-semibold">Dueño</div>
                      <div className="text-xs text-gray-500">Busco paseadores</div>
                    </div>
                  </div>
                </label>
                <label className="relative">
                  <input
                    {...register('role')}
                    type="radio"
                    value="WALKER"
                    className="sr-only"
                  />
                  <div className={`p-4 border-2 rounded-lg cursor-pointer transition-all duration-200 ${
                    watchedRole === 'WALKER'
                      ? 'border-secondary-500 bg-secondary-50 shadow-md'
                      : 'border-gray-200 hover:border-secondary-300 hover:bg-gray-50'
                  }`}>
                    <div className="text-center">
                      <User className={`h-7 w-7 mx-auto mb-2 ${watchedRole === 'WALKER' ? 'text-secondary-600' : 'text-gray-500'}`} />
                      <div className="text-sm font-semibold">Paseador</div>
                      <div className="text-xs text-gray-500">Paseo mascotas</div>
                    </div>
                  </div>
                </label>
              </div>
            </div>

            {/* Name */}
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                Nombre completo
              </label>
              <div className="mt-1 relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <User className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  {...register('name', {
                    required: 'El nombre es requerido',
                    minLength: {
                      value: 2,
                      message: 'El nombre debe tener al menos 2 caracteres'
                    }
                  })}
                  type="text"
                  className="input pl-10"
                  placeholder="Tu nombre completo"
                />
              </div>
              {errors.name && (
                <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>
              )}
            </div>

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

            {/* Phone */}
            <div>
              <label htmlFor="phone" className="block text-sm font-medium text-gray-700">
                Teléfono
              </label>
              <div className="mt-1 relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Phone className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  {...register('phone', {
                    required: 'El teléfono es requerido'
                  })}
                  type="tel"
                  className="input pl-10"
                  placeholder="+54 11 1234 5678"
                />
              </div>
              {errors.phone && (
                <p className="mt-1 text-sm text-red-600">{errors.phone.message}</p>
              )}
            </div>

            {/* Address */}
            <div>
              <label htmlFor="address" className="block text-sm font-medium text-gray-700">
                Dirección
              </label>
              <div className="mt-1 relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <MapPin className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  {...register('address', {
                    required: 'La dirección es requerida'
                  })}
                  type="text"
                  className="input pl-10"
                  placeholder="Calle, número, ciudad"
                />
              </div>
              {errors.address && (
                <p className="mt-1 text-sm text-red-600">{errors.address.message}</p>
              )}
            </div>

            {/* Walker specific fields */}
            {watchedRole === 'WALKER' && (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Años de experiencia
                  </label>
                  <input
                    {...register('experienceYears', {
                      required: 'La experiencia es requerida',
                      min: { value: 0, message: 'Mínimo 0 años' },
                      max: { value: 50, message: 'Máximo 50 años' }
                    })}
                    type="number"
                    className="input mt-1"
                    placeholder="3"
                  />
                  {errors.experienceYears && (
                    <p className="mt-1 text-sm text-red-600">{errors.experienceYears.message}</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Descripción
                  </label>
                  <textarea
                    {...register('bio', {
                      required: 'La descripción es requerida',
                      maxLength: {
                        value: 500,
                        message: 'Máximo 500 caracteres'
                      }
                    })}
                    rows="3"
                    className="input mt-1"
                    placeholder="Cuéntanos sobre tu experiencia con mascotas..."
                  />
                  {errors.bio && (
                    <p className="mt-1 text-sm text-red-600">{errors.bio.message}</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Barrio donde prestará servicio
                  </label>
                  <select
                    {...register('neighborhood', {
                      required: 'El barrio es requerido'
                    })}
                    className="input mt-1"
                  >
                    <option value="">Selecciona tu barrio</option>
                    {CABA_NEIGHBORHOODS.map((neighborhood) => (
                      <option key={neighborhood} value={neighborhood}>
                        {neighborhood}
                      </option>
                    ))}
                  </select>
                  {errors.neighborhood && (
                    <p className="mt-1 text-sm text-red-600">{errors.neighborhood.message}</p>
                  )}
                </div>
              </>
            )}

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
                    required: 'La contraseña es requerida',
                    minLength: {
                      value: 6,
                      message: 'La contraseña debe tener al menos 6 caracteres'
                    }
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
                Creando cuenta...
              </div>
            ) : (
              'Crear cuenta'
            )}
          </button>
        </form>
      </div>
    </div>
  )
}

export default Register