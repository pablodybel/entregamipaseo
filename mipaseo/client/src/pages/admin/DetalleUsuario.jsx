import { useParams, Link, useNavigate } from 'react-router-dom'
import { useFetch } from '../../hooks/useFetch'
import { useMutation } from '../../hooks/useMutation'
import { ArrowLeft, User, Mail, Phone, MapPin, Calendar, Star, Dog, CheckCircle, Ban } from 'lucide-react'
import { adminService } from '../../services/admin'
import toast from 'react-hot-toast'

const DetalleUsuario = () => {
  const { id } = useParams()
  const navigate = useNavigate()

  const { data, isLoading, refetch } = useFetch(
    ['admin-user-detail', id],
    () => adminService.getUserById(id)
  )

  const toggleActiveMutation = useMutation(
    () => adminService.toggleUserActive(id),
    {
      onSuccess: () => {
        refetch()
        toast.success('Estado del usuario actualizado')
      },
      onError: () => {
        toast.error('Error al actualizar el usuario')
      }
    }
  )

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  const user = data?.user

  if (!user) {
    return (
      <div className="px-4 py-6 sm:px-0">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Usuario no encontrado</h2>
          <Link to="/admin/usuarios" className="btn-primary">
            Volver a Usuarios
          </Link>
        </div>
      </div>
    )
  }

  const getRoleBadge = (role) => {
    const badges = {
      OWNER: 'bg-blue-100 text-blue-800',
      WALKER: 'bg-green-100 text-green-800',
      ADMIN: 'bg-purple-100 text-purple-800'
    }
    const labels = {
      OWNER: 'Dueño',
      WALKER: 'Paseador',
      ADMIN: 'Admin'
    }
    return (
      <span className={`px-3 py-1 rounded-full text-sm font-medium ${badges[role]}`}>
        {labels[role]}
      </span>
    )
  }

  const getStatusBadge = (status) => {
    const badges = {
      PENDING: 'bg-yellow-100 text-yellow-800',
      ACCEPTED: 'bg-blue-100 text-blue-800',
      COMPLETED: 'bg-green-100 text-green-800',
      CANCELLED: 'bg-red-100 text-red-800',
      REJECTED: 'bg-gray-100 text-gray-800'
    }
    const labels = {
      PENDING: 'Pendiente',
      ACCEPTED: 'Aceptado',
      COMPLETED: 'Completado',
      CANCELLED: 'Cancelado',
      REJECTED: 'Rechazado'
    }
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${badges[status]}`}>
        {labels[status]}
      </span>
    )
  }

  const renderStars = (rating) => {
    return (
      <div className="flex">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`h-4 w-4 ${
              star <= rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'
            }`}
          />
        ))}
      </div>
    )
  }

  return (
    <div className="px-4 py-6 sm:px-0">
      {/* Header */}
      <div className="mb-6">
        <button
          onClick={() => navigate('/admin/usuarios')}
          className="flex items-center text-gray-600 hover:text-gray-900 mb-4"
        >
          <ArrowLeft className="h-5 w-5 mr-2" />
          Volver a Usuarios
        </button>
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold text-gray-900">Detalle de Usuario</h1>
          <button
            onClick={() => toggleActiveMutation.mutate()}
            disabled={toggleActiveMutation.isLoading}
            className={`flex items-center px-4 py-2 rounded-lg font-medium ${
              user.isActive
                ? 'bg-red-100 text-red-700 hover:bg-red-200'
                : 'bg-green-100 text-green-700 hover:bg-green-200'
            } disabled:opacity-50`}
          >
            {user.isActive ? (
              <>
                <Ban className="h-5 w-5 mr-2" />
                Suspender Usuario
              </>
            ) : (
              <>
                <CheckCircle className="h-5 w-5 mr-2" />
                Activar Usuario
              </>
            )}
          </button>
        </div>
      </div>

      {/* Información Principal */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        {/* Perfil */}
        <div className="lg:col-span-1">
          <div className="card p-6">
            <div className="text-center">
              {user.avatarUrl ? (
                <img
                  src={`${import.meta.env.VITE_API_BASE?.replace('/api/v1', '') || 'http://localhost:4000'}${user.avatarUrl}`}
                  alt={user.name}
                  className="w-32 h-32 rounded-full object-cover mx-auto mb-4"
                />
              ) : (
                <div className="w-32 h-32 rounded-full bg-gray-200 flex items-center justify-center mx-auto mb-4">
                  <User className="h-16 w-16 text-gray-500" />
                </div>
              )}
              <h2 className="text-2xl font-bold text-gray-900 mb-2">{user.name}</h2>
              <div className="flex items-center justify-center space-x-2 mb-4">
                {getRoleBadge(user.role)}
                {user.isActive ? (
                  <span className="px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
                    Activo
                  </span>
                ) : (
                  <span className="px-3 py-1 rounded-full text-sm font-medium bg-red-100 text-red-800">
                    Suspendido
                  </span>
                )}
              </div>
            </div>

            <div className="space-y-3 mt-6">
              <div className="flex items-center text-gray-700">
                <Mail className="h-5 w-5 mr-3 text-gray-400" />
                <span className="text-sm">{user.email}</span>
              </div>
              <div className="flex items-center text-gray-700">
                <Phone className="h-5 w-5 mr-3 text-gray-400" />
                <span className="text-sm">{user.phone}</span>
              </div>
              <div className="flex items-start text-gray-700">
                <MapPin className="h-5 w-5 mr-3 text-gray-400 mt-0.5" />
                <span className="text-sm">{user.address}</span>
              </div>
              <div className="flex items-center text-gray-700">
                <Calendar className="h-5 w-5 mr-3 text-gray-400" />
                <span className="text-sm">
                  Registrado: {new Date(user.createdAt).toLocaleDateString('es-AR')}
                </span>
              </div>
            </div>

            {/* Información específica del paseador */}
            {user.role === 'WALKER' && (
              <div className="mt-6 pt-6 border-t">
                <h3 className="font-semibold text-gray-900 mb-3">Información del Paseador</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Barrio:</span>
                    <span className="font-medium">{user.neighborhood}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Experiencia:</span>
                    <span className="font-medium">{user.experienceYears} años</span>
                  </div>
                </div>
                {user.bio && (
                  <div className="mt-4">
                    <p className="text-sm text-gray-600 font-medium mb-1">Biografía:</p>
                    <p className="text-sm text-gray-700">{user.bio}</p>
                  </div>
                )}
                {user.availableHours && user.availableHours.length > 0 && (
                  <div className="mt-4">
                    <p className="text-sm text-gray-600 font-medium mb-2">Horarios Disponibles:</p>
                    <div className="flex flex-wrap gap-2">
                      {user.availableHours.map((hour) => (
                        <span
                          key={hour}
                          className="px-2 py-1 bg-primary-50 text-primary-700 rounded text-xs font-medium"
                        >
                          {hour}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Contenido Principal */}
        <div className="lg:col-span-2 space-y-6">
          {/* Estadísticas para Paseadores */}
          {user.role === 'WALKER' && user.recentWalks && (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="card p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600">Total Paseos</p>
                      <p className="text-2xl font-bold text-gray-900">
                        {user.recentWalks.length}
                      </p>
                    </div>
                    <Calendar className="h-8 w-8 text-primary-600" />
                  </div>
                </div>
                <div className="card p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600">Rating Promedio</p>
                      <div className="flex items-center">
                        <p className="text-2xl font-bold text-gray-900 mr-2">
                          {user.recentReviews?.length > 0
                            ? (
                                user.recentReviews.reduce((sum, r) => sum + r.rating, 0) /
                                user.recentReviews.length
                              ).toFixed(1)
                            : '0.0'}
                        </p>
                        <Star className="h-5 w-5 text-yellow-400 fill-yellow-400" />
                      </div>
                    </div>
                    <Star className="h-8 w-8 text-yellow-400" />
                  </div>
                </div>
                <div className="card p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600">Total Reseñas</p>
                      <p className="text-2xl font-bold text-gray-900">
                        {user.recentReviews?.length || 0}
                      </p>
                    </div>
                    <Star className="h-8 w-8 text-secondary-600" />
                  </div>
                </div>
              </div>

              {/* Paseos Recientes */}
              <div className="card p-6">
                <h3 className="text-lg font-bold text-gray-900 mb-4">Paseos Recientes</h3>
                <div className="space-y-3">
                  {user.recentWalks.length > 0 ? (
                    user.recentWalks.map((walk) => (
                      <div
                        key={walk._id}
                        className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                      >
                        <div className="flex items-center space-x-3">
                          <Dog className="h-5 w-5 text-gray-500" />
                          <div>
                            <p className="font-medium text-gray-900">
                              {walk.petId?.name} - {walk.ownerId?.name}
                            </p>
                            <p className="text-sm text-gray-600">
                              {new Date(walk.scheduledAt).toLocaleDateString('es-AR')} •{' '}
                              {walk.durationMin} min
                            </p>
                          </div>
                        </div>
                        {getStatusBadge(walk.status)}
                      </div>
                    ))
                  ) : (
                    <p className="text-gray-500 text-center py-4">No hay paseos registrados</p>
                  )}
                </div>
              </div>

              {/* Reseñas Recientes */}
              {user.recentReviews && user.recentReviews.length > 0 && (
                <div className="card p-6">
                  <h3 className="text-lg font-bold text-gray-900 mb-4">Reseñas Recientes</h3>
                  <div className="space-y-4">
                    {user.recentReviews.map((review) => (
                      <div key={review._id} className="border-b border-gray-200 pb-4 last:border-0">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center space-x-2">
                            <User className="h-4 w-4 text-gray-400" />
                            <span className="font-medium text-gray-900">
                              {review.ownerId?.name}
                            </span>
                          </div>
                          {renderStars(review.rating)}
                        </div>
                        <p className="text-sm text-gray-700">{review.comment}</p>
                        <p className="text-xs text-gray-500 mt-1">
                          {new Date(review.createdAt).toLocaleDateString('es-AR')}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}

          {/* Estadísticas para Dueños */}
          {user.role === 'OWNER' && (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="card p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600">Total Mascotas</p>
                      <p className="text-2xl font-bold text-gray-900">
                        {user.pets?.length || 0}
                      </p>
                    </div>
                    <Dog className="h-8 w-8 text-pink-600" />
                  </div>
                </div>
                <div className="card p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600">Solicitudes de Paseo</p>
                      <p className="text-2xl font-bold text-gray-900">
                        {user.recentWalks?.length || 0}
                      </p>
                    </div>
                    <Calendar className="h-8 w-8 text-primary-600" />
                  </div>
                </div>
              </div>

              {/* Mascotas */}
              {user.pets && user.pets.length > 0 && (
                <div className="card p-6">
                  <h3 className="text-lg font-bold text-gray-900 mb-4">Mascotas</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {user.pets.map((pet) => (
                      <div key={pet._id} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                        {pet.photoUrl ? (
                          <img
                            src={`${import.meta.env.VITE_API_BASE?.replace('/api/v1', '') || 'http://localhost:4000'}${pet.photoUrl}`}
                            alt={pet.name}
                            className="w-16 h-16 rounded-full object-cover"
                          />
                        ) : (
                          <div className="w-16 h-16 rounded-full bg-gray-200 flex items-center justify-center">
                            <Dog className="h-8 w-8 text-gray-500" />
                          </div>
                        )}
                        <div>
                          <p className="font-medium text-gray-900">{pet.name}</p>
                          <p className="text-sm text-gray-600">
                            {pet.breed} • {pet.age} años
                          </p>
                          <p className="text-xs text-gray-500">{pet.weightKg} kg</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Solicitudes Recientes */}
              {user.recentWalks && user.recentWalks.length > 0 && (
                <div className="card p-6">
                  <h3 className="text-lg font-bold text-gray-900 mb-4">Solicitudes Recientes</h3>
                  <div className="space-y-3">
                    {user.recentWalks.map((walk) => (
                      <div
                        key={walk._id}
                        className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                      >
                        <div className="flex items-center space-x-3">
                          <Dog className="h-5 w-5 text-gray-500" />
                          <div>
                            <p className="font-medium text-gray-900">
                              {walk.petId?.name} con {walk.walkerId?.name}
                            </p>
                            <p className="text-sm text-gray-600">
                              {new Date(walk.scheduledAt).toLocaleDateString('es-AR')} •{' '}
                              {walk.durationMin} min
                            </p>
                          </div>
                        </div>
                        {getStatusBadge(walk.status)}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  )
}

export default DetalleUsuario




