import { useAuth } from '../context/AuthContext'
import { useFetch } from '../hooks/useFetch'
import { Dog, Calendar, Star, Users, Plus, Clock, User } from 'lucide-react'
import { Link, Navigate } from 'react-router-dom'
import { petsService } from '../services/pets'
import { walkRequestsService } from '../services/walkRequests'
import { reviewsService } from '../services/reviews'
import { walkersService } from '../services/walkers'

const Dashboard = () => {
  const { user } = useAuth()

  // Redirigir admins a su dashboard específico
  if (user?.role === 'ADMIN') {
    return <Navigate to="/admin/dashboard" replace />
  }

  const { data: pets } = useFetch(
    ['pets'],
    petsService.getPets,
    { enabled: user?.role === 'OWNER' }
  )

  const { data: walkRequests } = useFetch(
    ['walkRequests', 'pending'],
    () => walkRequestsService.getMyWalkRequests('PENDING'),
    { refetchInterval: 30000 }
  )

  const { data: acceptedWalkRequests } = useFetch(
    ['walkRequests', 'accepted'],
    () => walkRequestsService.getMyWalkRequests('ACCEPTED'),
    { refetchInterval: 30000 }
  )

  // Obtener estadísticas de reseñas para paseadores
  const { data: walkerStats } = useFetch(
    ['walkerStats', user?._id],
    () => reviewsService.getWalkerStats(user._id),
    { enabled: user?.role === 'WALKER' }
  )

  // Obtener conteo de paseadores activos (para dueños)
  const { data: walkersCount } = useFetch(
    ['activeWalkersCount'],
    () => walkersService.getActiveWalkersCount(),
    { enabled: user?.role === 'OWNER' }
  )

  if (user?.role === 'OWNER') {
    return (
      <div className="px-4 py-6 sm:px-0">
        {/* Header */}
        <div className="mb-8 bg-primary-600 rounded-xl p-8 text-white shadow-md">
          <h1 className="text-3xl font-bold">
            ¡Hola, {user.name}!
          </h1>
          <p className="text-white/95 mt-2 text-lg">
            Gestiona tus mascotas y encuentra los mejores paseadores
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="card p-6 hover:shadow-lg transition-shadow border-l-4 border-primary-500">
            <div className="flex items-center">
              <div className="p-3 bg-primary-100 rounded-lg">
                <Dog className="h-6 w-6 text-primary-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Mis Mascotas</p>
                <p className="text-2xl font-bold text-primary-600">
                  {pets?.pets?.length || 0}
                </p>
              </div>
            </div>
          </div>

          <div className="card p-6 hover:shadow-lg transition-shadow border-l-4 border-yellow-500">
            <div className="flex items-center">
              <div className="p-3 bg-yellow-100 rounded-lg">
                <Clock className="h-6 w-6 text-yellow-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Solicitudes Pendientes</p>
                <p className="text-2xl font-bold text-gray-900">
                  {walkRequests?.walkRequests?.length || 0}
                </p>
              </div>
            </div>
          </div>

          <div className="card p-6 hover:shadow-lg transition-shadow border-l-4 border-secondary-500">
            <div className="flex items-center">
              <div className="p-3 bg-secondary-100 rounded-lg">
                <Calendar className="h-6 w-6 text-secondary-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Paseos Programados</p>
                <p className="text-2xl font-bold text-gray-900">
                  {acceptedWalkRequests?.walkRequests?.length || 0}
                </p>
              </div>
            </div>
          </div>

          <div className="card p-6 hover:shadow-lg transition-shadow border-l-4 border-primary-400">
            <div className="flex items-center">
              <div className="p-3 bg-primary-100 rounded-lg">
                <Users className="h-6 w-6 text-primary-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Paseadores Activos</p>
                <p className="text-2xl font-bold text-gray-900">
                  {walkersCount?.count || 0}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Quick Actions */}
          <div className="card p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Acciones Rápidas</h3>
            <div className="space-y-3">
              <Link
                to="/mascotas"
                className="flex items-center p-4 bg-primary-50 rounded-lg hover:bg-primary-100 hover:shadow-md transition-all border border-primary-200"
              >
                <Plus className="h-5 w-5 text-primary-600 mr-3" />
                <span className="font-semibold text-gray-800">Agregar Nueva Mascota</span>
              </Link>
              <Link
                to="/paseadores"
                className="flex items-center p-4 bg-secondary-50 rounded-lg hover:bg-secondary-100 hover:shadow-md transition-all border border-secondary-200"
              >
                <Users className="h-5 w-5 text-secondary-600 mr-3" />
                <span className="font-semibold text-gray-800">Buscar Paseadores</span>
              </Link>
              <Link
                to="/mis-solicitudes"
                className="flex items-center p-4 bg-gray-50 rounded-lg hover:bg-gray-100 hover:shadow-md transition-all border border-gray-200"
              >
                <Calendar className="h-5 w-5 text-primary-600 mr-3" />
                <span className="font-semibold text-gray-800">Ver Mis Solicitudes</span>
              </Link>
            </div>
          </div>

          {/* Recent Pets */}
          <div className="card p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Mis Mascotas</h3>
              <Link to="/mascotas" className="text-sm text-primary-600 hover:text-primary-700">
                Ver todas
              </Link>
            </div>
            {pets?.pets?.length > 0 ? (
              <div className="space-y-3">
                {pets.pets.slice(0, 3).map((pet) => (
                  <div key={pet._id} className="flex items-center p-3 bg-gray-50 rounded-lg">
                    {pet.photoUrl && (
                      <img
                        src={`${import.meta.env.VITE_API_BASE?.replace('/api/v1', '') || 'http://localhost:4000'}${pet.photoUrl}`}
                        alt={pet.name}
                        className="h-10 w-10 rounded-full object-cover mr-3"
                      />
                    )}
                    <div>
                      <p className="font-medium text-gray-900">{pet.name}</p>
                      <p className="text-sm text-gray-500">{pet.breed} • {pet.age} años</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-4">
                <Dog className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                <p className="text-gray-500">No tienes mascotas registradas</p>
                <Link to="/mascotas" className="text-primary-600 hover:text-primary-700 text-sm">
                  Agregar tu primera mascota
                </Link>
              </div>
            )}
          </div>
        </div>

        {/* Recent Walk Requests */}
        {(walkRequests?.walkRequests?.length > 0 || acceptedWalkRequests?.walkRequests?.length > 0) && (
          <div className="card p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Solicitudes Recientes</h3>
              <Link to="/mis-solicitudes" className="text-sm text-primary-600 hover:text-primary-700">
                Ver todas
              </Link>
            </div>
            <div className="space-y-3">
              {walkRequests?.walkRequests?.slice(0, 3).map((request) => (
                <div key={request._id} className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg">
                  <div className="flex items-center">
                    <Calendar className="h-5 w-5 text-yellow-600 mr-3" />
                    <div>
                      <p className="font-medium text-gray-900">
                        Paseo para {request.petId?.name}
                      </p>
                      <p className="text-sm text-gray-500">
                        Con {request.walkerId?.name} • {request.durationMin} min
                      </p>
                    </div>
                  </div>
                  <span className="badge badge-warning">Pendiente</span>
                </div>
              ))}
              {acceptedWalkRequests?.walkRequests?.slice(0, 3).map((request) => (
                <div key={request._id} className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                  <div className="flex items-center">
                    <Calendar className="h-5 w-5 text-green-600 mr-3" />
                    <div>
                      <p className="font-medium text-gray-900">
                        Paseo para {request.petId?.name}
                      </p>
                      <p className="text-sm text-gray-500">
                        Con {request.walkerId?.name} • {new Date(request.scheduledAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <span className="badge badge-success">Confirmado</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    )
  }

  // Walker Dashboard
  return (
    <div className="px-4 py-6 sm:px-0">
      {/* Header */}
      <div className="mb-8 bg-secondary-600 rounded-xl p-8 text-white shadow-md">
        <h1 className="text-3xl font-bold">
          ¡Hola, {user.name}!
        </h1>
        <p className="text-white/95 mt-2 text-lg">
          Gestiona tus solicitudes de paseo y perfil profesional
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="card p-6 hover:shadow-lg transition-shadow border-l-4 border-yellow-500">
          <div className="flex items-center">
            <div className="p-3 bg-yellow-100 rounded-lg">
              <Clock className="h-6 w-6 text-yellow-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Solicitudes Pendientes</p>
              <p className="text-2xl font-bold text-gray-900">
                {walkRequests?.walkRequests?.length || 0}
              </p>
            </div>
          </div>
        </div>

        <div className="card p-6 hover:shadow-lg transition-shadow border-l-4 border-secondary-500">
          <div className="flex items-center">
            <div className="p-3 bg-secondary-100 rounded-lg">
              <Calendar className="h-6 w-6 text-secondary-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Paseos Programados</p>
              <p className="text-2xl font-bold text-gray-900">
                {acceptedWalkRequests?.walkRequests?.length || 0}
              </p>
            </div>
          </div>
        </div>

        <div className="card p-6 hover:shadow-lg transition-shadow border-l-4 border-primary-500">
          <div className="flex items-center">
            <div className="p-3 bg-primary-100 rounded-lg">
              <Star className="h-6 w-6 text-primary-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Rating Promedio</p>
              <p className="text-2xl font-bold text-primary-600">
                {walkerStats?.averageRating ? walkerStats.averageRating.toFixed(1) : '0.0'}
              </p>
              {walkerStats?.totalReviews > 0 && (
                <p className="text-xs text-gray-500 mt-1">
                  {walkerStats.totalReviews} {walkerStats.totalReviews === 1 ? 'reseña' : 'reseñas'}
                </p>
              )}
            </div>
          </div>
        </div>

        <div className="card p-6 hover:shadow-lg transition-shadow border-l-4 border-secondary-400">
          <div className="flex items-center">
            <div className="p-3 bg-secondary-100 rounded-lg">
              <Dog className="h-6 w-6 text-secondary-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Paseos Completados</p>
              <p className="text-2xl font-bold text-gray-900">42</p>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <div className="card p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Acciones Rápidas</h3>
          <div className="space-y-3">
            <Link
              to="/solicitudes"
              className="flex items-center p-4 bg-secondary-50 rounded-lg hover:bg-secondary-100 hover:shadow-md transition-all border border-secondary-200"
            >
              <Calendar className="h-5 w-5 text-secondary-600 mr-3" />
              <span className="font-semibold text-gray-800">Ver Solicitudes de Paseo</span>
            </Link>
            <Link
              to="/perfil"
              className="flex items-center p-4 bg-primary-50 rounded-lg hover:bg-primary-100 hover:shadow-md transition-all border border-primary-200"
            >
              <User className="h-5 w-5 text-primary-600 mr-3" />
              <span className="font-semibold text-gray-800">Actualizar Mi Perfil</span>
            </Link>
            <Link
              to="/mis-resenas"
              className="flex items-center p-4 bg-gray-50 rounded-lg hover:bg-gray-100 hover:shadow-md transition-all border border-gray-200"
            >
              <Star className="h-5 w-5 text-primary-600 mr-3" />
              <span className="font-semibold text-gray-800">Ver Mis Reseñas</span>
            </Link>
          </div>
        </div>

        {/* Pending Requests */}
        <div className="card p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Solicitudes Pendientes</h3>
            <Link to="/solicitudes" className="text-sm text-primary-600 hover:text-primary-700">
              Ver todas
            </Link>
          </div>
          {walkRequests?.walkRequests?.length > 0 ? (
            <div className="space-y-3">
              {walkRequests.walkRequests.slice(0, 3).map((request) => (
                <div key={request._id} className="p-3 bg-yellow-50 rounded-lg">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-gray-900">
                        {request.petId?.name} ({request.petId?.breed})
                      </p>
                      <p className="text-sm text-gray-500">
                        {request.ownerId?.name} • {request.durationMin} min
                      </p>
                      <p className="text-xs text-gray-400">
                        {new Date(request.scheduledAt).toLocaleDateString()}
                      </p>
                    </div>
                    <span className="badge badge-warning">Pendiente</span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-4">
              <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-3" />
              <p className="text-gray-500">No tienes solicitudes pendientes</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default Dashboard