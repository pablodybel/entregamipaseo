import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { User, MapPin, Phone, Mail, Clock } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import { CABA_NEIGHBORHOODS, AVAILABLE_HOURS } from '../../utils/constants'
import api from '../../services/api'
import toast from 'react-hot-toast'

const MiPerfil = () => {
  const { user, updateUser } = useAuth()
  const [isEditing, setIsEditing] = useState(false)
  const [loading, setLoading] = useState(false)
  const [selectedPhoto, setSelectedPhoto] = useState(null)
  const [selectedHours, setSelectedHours] = useState(user?.availableHours || [])

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset
  } = useForm({
    defaultValues: {
      name: user?.name || '',
      phone: user?.phone || '',
      address: user?.address || '',
      experienceYears: user?.experienceYears || 0,
      bio: user?.bio || '',
      neighborhood: user?.neighborhood || ''
    }
  })

  const toggleHour = (hour) => {
    if (!isEditing) return
    
    setSelectedHours(prev => {
      if (prev.includes(hour)) {
        return prev.filter(h => h !== hour)
      } else {
        return [...prev, hour].sort()
      }
    })
  }

  const onSubmit = async (data) => {
    try {
      setLoading(true)
      
      const formData = new FormData()
      Object.keys(data).forEach(key => {
        formData.append(key, data[key])
      })
      
      // Agregar horarios seleccionados
      formData.append('availableHours', JSON.stringify(selectedHours))
      
      if (selectedPhoto) {
        formData.append('avatar', selectedPhoto)
      }

      const response = await api.patch('/users/me', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      })
      updateUser(response.data.user)
      toast.success('Perfil actualizado exitosamente')
      setIsEditing(false)
      setSelectedPhoto(null)
    } catch (error) {
      toast.error(error.response?.data?.error || 'Error al actualizar el perfil')
    } finally {
      setLoading(false)
    }
  }

  const handleCancel = () => {
    reset()
    setIsEditing(false)
    setSelectedPhoto(null)
    setSelectedHours(user?.availableHours || [])
  }

  const handlePhotoChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      setSelectedPhoto(file)
    }
  }

  return (
    <div className="px-4 py-6 sm:px-0">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Mi Perfil</h1>
        {!isEditing && (
          <button
            onClick={() => setIsEditing(true)}
            className="btn-primary"
          >
            Editar Perfil
          </button>
        )}
      </div>

      <div className="card p-6">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Avatar Section */}
          <div className="flex items-center space-x-4 pb-6 border-b">
            <div className="relative">
              {(selectedPhoto || user?.avatarUrl) ? (
                <img
                  src={selectedPhoto ? URL.createObjectURL(selectedPhoto) : `${import.meta.env.VITE_API_BASE?.replace('/api/v1', '') || 'http://localhost:4000'}${user.avatarUrl}`}
                  alt={user.name}
                  className="w-20 h-20 rounded-full object-cover"
                />
              ) : (
                <div className="w-20 h-20 bg-primary-500 rounded-full flex items-center justify-center">
                  <User className="h-10 w-10 text-white" />
                </div>
              )}
              {isEditing && (
                <label className="absolute bottom-0 right-0 bg-primary-600 rounded-full p-2 cursor-pointer hover:bg-primary-700 transition-colors shadow-lg">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handlePhotoChange}
                    className="hidden"
                  />
                  <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </label>
              )}
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">{user?.name}</h3>
              <p className="text-sm text-gray-500">{user?.email}</p>
              {isEditing && (
                <p className="text-xs text-gray-400 mt-1">Haz clic en el ícono para cambiar la foto</p>
              )}
            </div>
          </div>

          {/* Personal Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900">Información Personal</h3>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Nombre completo
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <User className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  {...register('name', {
                    required: 'El nombre es requerido',
                    minLength: { value: 2, message: 'Mínimo 2 caracteres' }
                  })}
                  disabled={!isEditing}
                  className="input pl-10"
                />
              </div>
              {errors.name && (
                <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Correo electrónico
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  value={user?.email}
                  disabled
                  className="input pl-10 bg-gray-50"
                />
              </div>
              <p className="mt-1 text-xs text-gray-500">El correo no puede ser modificado</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Teléfono
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Phone className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  {...register('phone', {
                    required: 'El teléfono es requerido'
                  })}
                  disabled={!isEditing}
                  className="input pl-10"
                />
              </div>
              {errors.phone && (
                <p className="mt-1 text-sm text-red-600">{errors.phone.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Dirección
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <MapPin className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  {...register('address', {
                    required: 'La dirección es requerida'
                  })}
                  disabled={!isEditing}
                  className="input pl-10"
                />
              </div>
              {errors.address && (
                <p className="mt-1 text-sm text-red-600">{errors.address.message}</p>
              )}
            </div>
          </div>

          {/* Professional Information */}
          <div className="space-y-4 pt-6 border-t">
            <h3 className="text-lg font-semibold text-gray-900">Información Profesional</h3>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Barrio donde presta servicio
              </label>
              <select
                {...register('neighborhood', {
                  required: 'El barrio es requerido'
                })}
                disabled={!isEditing}
                className="input"
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

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Años de experiencia
              </label>
              <input
                {...register('experienceYears', {
                  required: 'La experiencia es requerida',
                  min: { value: 0, message: 'Mínimo 0 años' },
                  max: { value: 50, message: 'Máximo 50 años' },
                  valueAsNumber: true
                })}
                type="number"
                disabled={!isEditing}
                className="input"
              />
              {errors.experienceYears && (
                <p className="mt-1 text-sm text-red-600">{errors.experienceYears.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Biografía
              </label>
              <textarea
                {...register('bio', {
                  required: 'La biografía es requerida',
                  maxLength: { value: 500, message: 'Máximo 500 caracteres' }
                })}
                rows="4"
                disabled={!isEditing}
                className="input"
                placeholder="Cuéntanos sobre tu experiencia con mascotas..."
              />
              {errors.bio && (
                <p className="mt-1 text-sm text-red-600">{errors.bio.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                <Clock className="inline h-5 w-5 mr-2 text-gray-600" />
                Horarios disponibles (paseos de 1 hora)
              </label>
              <p className="text-sm text-gray-500 mb-3">
                Selecciona los horarios en los que puedes realizar paseos. Cada paseo tiene una duración de 1 hora.
              </p>
              <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-2">
                {AVAILABLE_HOURS.map((hour) => (
                  <button
                    key={hour}
                    type="button"
                    onClick={() => toggleHour(hour)}
                    disabled={!isEditing}
                    className={`
                      py-2 px-3 rounded-lg text-sm font-medium transition-all duration-200
                      ${selectedHours.includes(hour)
                        ? 'bg-primary-600 text-white shadow-md hover:bg-primary-700'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }
                      ${!isEditing ? 'cursor-default opacity-75' : 'cursor-pointer'}
                      disabled:opacity-50
                    `}
                  >
                    {hour}
                  </button>
                ))}
              </div>
              {selectedHours.length > 0 && (
                <p className="mt-3 text-sm text-primary-600">
                  {selectedHours.length} {selectedHours.length === 1 ? 'horario seleccionado' : 'horarios seleccionados'}
                </p>
              )}
              {isEditing && selectedHours.length === 0 && (
                <p className="mt-3 text-sm text-amber-600">
                  Selecciona al menos un horario disponible
                </p>
              )}
            </div>
          </div>

          {/* Action Buttons */}
          {isEditing && (
            <div className="flex space-x-3 pt-6 border-t">
              <button
                type="submit"
                disabled={loading}
                className="btn-primary flex-1"
              >
                {loading ? (
                  <div className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                    Guardando...
                  </div>
                ) : (
                  'Guardar Cambios'
                )}
              </button>
              <button
                type="button"
                onClick={handleCancel}
                disabled={loading}
                className="btn-outline flex-1"
              >
                Cancelar
              </button>
            </div>
          )}
        </form>
      </div>
    </div>
  )
}

export default MiPerfil