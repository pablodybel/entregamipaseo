import { useState } from 'react'
import { useFetch } from '../../hooks/useFetch'
import { Star, User, Calendar, Clock } from 'lucide-react'
import { reviewsService } from '../../services/reviews'
import { useAuth } from '../../context/AuthContext'

const MisResenas = () => {
  const { user } = useAuth()
  const [page, setPage] = useState(1)
  const limit = 10

  // Obtener reseñas del paseador autenticado
  const { data, isLoading } = useFetch(
    ['myReviews', page, limit],
    () => reviewsService.getMyReviews(page, limit)
  )

  // Obtener estadísticas del paseador
  const { data: stats } = useFetch(
    ['walkerStats', user?._id],
    () => reviewsService.getWalkerStats(user._id),
    { enabled: !!user?._id }
  )

  const renderStars = (rating) => {
    return (
      <div className="flex">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`h-5 w-5 ${
              star <= rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'
            }`}
          />
        ))}
      </div>
    )
  }

  if (isLoading) {
    return (
      <div className="px-4 py-6 sm:px-0">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">Mis Reseñas</h1>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
        </div>
      </div>
    )
  }

  const reviews = data?.reviews || []
  const pagination = data?.pagination

  return (
    <div className="px-4 py-6 sm:px-0">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Mis Reseñas</h1>

      {/* Estadísticas */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="card p-6">
            <div className="flex items-center">
              <div className="p-3 bg-primary-100 rounded-lg">
                <Star className="h-6 w-6 text-primary-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Rating Promedio</p>
                <p className="text-2xl font-bold text-primary-600">
                  {stats.averageRating ? stats.averageRating.toFixed(1) : '0.0'}
                </p>
              </div>
            </div>
          </div>

          <div className="card p-6">
            <div className="flex items-center">
              <div className="p-3 bg-secondary-100 rounded-lg">
                <User className="h-6 w-6 text-secondary-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total de Reseñas</p>
                <p className="text-2xl font-bold text-gray-900">
                  {stats.totalReviews || 0}
                </p>
              </div>
            </div>
          </div>

          <div className="card p-6">
            <div className="flex items-center">
              <div className="p-3 bg-green-100 rounded-lg">
                <Star className="h-6 w-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Calificación Promedio</p>
                <div className="flex items-center mt-1">
                  {renderStars(Math.round(stats.averageRating || 0))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Lista de Reseñas */}
      {reviews.length > 0 ? (
        <>
          <div className="space-y-4">
            {reviews.map((review) => (
              <div key={review._id} className="card p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center space-x-4">
                    {review.ownerId?.avatarUrl ? (
                      <img
                        src={`${import.meta.env.VITE_API_BASE?.replace('/api/v1', '') || 'http://localhost:4000'}${review.ownerId.avatarUrl}`}
                        alt={review.ownerId.name}
                        className="w-12 h-12 rounded-full object-cover"
                      />
                    ) : (
                      <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center">
                        <User className="h-6 w-6 text-gray-500" />
                      </div>
                    )}
                    <div>
                      <p className="font-semibold text-gray-900">{review.ownerId?.name}</p>
                      <p className="text-sm text-gray-600">Cliente</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="mb-2">{renderStars(review.rating)}</div>
                    <p className="text-xs text-gray-500">
                      {new Date(review.createdAt).toLocaleDateString('es-AR', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </p>
                  </div>
                </div>

                <p className="text-gray-700 mb-4">{review.comment}</p>

                {review.walkRequestId && (
                  <div className="flex items-center space-x-4 text-sm text-gray-500 pt-4 border-t">
                    {review.walkRequestId.petId && (
                      <div className="flex items-center">
                        <Calendar className="h-4 w-4 mr-2" />
                        <span>
                          Paseo para {review.walkRequestId.petId.name}
                        </span>
                      </div>
                    )}
                    {review.walkRequestId.durationMin && (
                      <div className="flex items-center">
                        <Clock className="h-4 w-4 mr-2" />
                        <span>{review.walkRequestId.durationMin} min</span>
                      </div>
                    )}
                    {review.walkRequestId.scheduledAt && (
                      <div>
                        {new Date(review.walkRequestId.scheduledAt).toLocaleDateString('es-AR')}
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Paginación */}
          {pagination && pagination.pages > 1 && (
            <div className="card p-4 mt-6">
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="text-sm text-gray-700">
                  Mostrando <span className="font-semibold">{reviews.length}</span> de{' '}
                  <span className="font-semibold">{pagination.total}</span> reseñas
                </div>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => setPage(1)}
                    disabled={page === 1}
                    className="px-3 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Primera
                  </button>
                  <button
                    onClick={() => setPage(page - 1)}
                    disabled={page === 1}
                    className="px-3 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Anterior
                  </button>
                  <span className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg">
                    Página {page} de {pagination.pages}
                  </span>
                  <button
                    onClick={() => setPage(page + 1)}
                    disabled={page === pagination.pages}
                    className="px-3 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Siguiente
                  </button>
                  <button
                    onClick={() => setPage(pagination.pages)}
                    disabled={page === pagination.pages}
                    className="px-3 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Última
                  </button>
                </div>
              </div>
            </div>
          )}
        </>
      ) : (
        <div className="card p-12 text-center">
          <Star className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No tienes reseñas aún</h3>
          <p className="text-gray-500">Las reseñas de tus clientes aparecerán aquí</p>
        </div>
      )}
    </div>
  )
}

export default MisResenas
