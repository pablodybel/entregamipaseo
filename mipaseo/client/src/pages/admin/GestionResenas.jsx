import { useState } from 'react'
import { useFetch } from '../../hooks/useFetch'
import { useMutation } from '../../hooks/useMutation'
import { Star, Trash2, User } from 'lucide-react'
import { adminService } from '../../services/admin'
import toast from 'react-hot-toast'

const GestionResenas = () => {
  const [filters, setFilters] = useState({
    minRating: undefined,
    maxRating: undefined,
    page: 1,
    limit: 20
  })
  const [selectedReview, setSelectedReview] = useState(null)

  const { data, isLoading, refetch } = useFetch(
    ['admin-reviews', JSON.stringify(filters)],
    () => adminService.getReviews(filters)
  )

  const deleteMutation = useMutation(
    (reviewId) => adminService.deleteReview(reviewId),
    {
      onSuccess: () => {
        refetch()
        toast.success('Reseña eliminada exitosamente')
        setSelectedReview(null)
      },
      onError: () => {
        toast.error('Error al eliminar la reseña')
      }
    }
  )

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value, page: 1 }))
  }

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

  return (
    <div className="px-4 py-6 sm:px-0">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Gestión de Reseñas</h1>
        <p className="text-gray-600 mt-2">Modera las reseñas de la plataforma</p>
      </div>

      {/* Filtros */}
      <div className="card p-6 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Rating Mínimo
            </label>
            <select
              className="input"
              value={filters.minRating || ''}
              onChange={(e) => handleFilterChange('minRating', e.target.value || undefined)}
            >
              <option value="">Todos</option>
              <option value="1">1 estrella</option>
              <option value="2">2 estrellas</option>
              <option value="3">3 estrellas</option>
              <option value="4">4 estrellas</option>
              <option value="5">5 estrellas</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Rating Máximo
            </label>
            <select
              className="input"
              value={filters.maxRating || ''}
              onChange={(e) => handleFilterChange('maxRating', e.target.value || undefined)}
            >
              <option value="">Todos</option>
              <option value="1">1 estrella</option>
              <option value="2">2 estrellas</option>
              <option value="3">3 estrellas</option>
              <option value="4">4 estrellas</option>
              <option value="5">5 estrellas</option>
            </select>
          </div>
          <div className="flex items-end">
            <button
              onClick={() => setFilters({
                minRating: undefined,
                maxRating: undefined,
                page: 1,
                limit: 20
              })}
              className="btn-secondary w-full"
            >
              Limpiar Filtros
            </button>
          </div>
        </div>
      </div>

      {/* Resultados */}
      {isLoading ? (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
        </div>
      ) : (
        <>
          <div className="space-y-4">
            {data?.reviews?.map((review) => (
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
                      <p className="text-sm text-gray-600">{review.ownerId?.email}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setSelectedReview(review)}
                    className="text-red-600 hover:text-red-900"
                  >
                    <Trash2 className="h-5 w-5" />
                  </button>
                </div>

                <div className="mb-3">
                  {renderStars(review.rating)}
                </div>

                <p className="text-gray-700 mb-4">{review.comment}</p>

                <div className="flex items-center justify-between text-sm text-gray-500 pt-4 border-t">
                  <div>
                    <span className="font-medium">Paseador:</span> {review.walkerId?.name}
                  </div>
                  <div>
                    {new Date(review.createdAt).toLocaleDateString('es-AR', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Paginación */}
          {data?.pagination && (
            <div className="card p-4 mt-6">
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="text-sm text-gray-700">
                  Mostrando <span className="font-semibold">{data.reviews.length}</span> de{' '}
                  <span className="font-semibold">{data.pagination.total}</span> reseñas
                </div>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => handleFilterChange('page', 1)}
                    disabled={filters.page === 1}
                    className="px-3 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Primera
                  </button>
                  <button
                    onClick={() => handleFilterChange('page', filters.page - 1)}
                    disabled={filters.page === 1}
                    className="px-3 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Anterior
                  </button>
                  <span className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg">
                    Página {filters.page} de {data.pagination.pages}
                  </span>
                  <button
                    onClick={() => handleFilterChange('page', filters.page + 1)}
                    disabled={filters.page === data.pagination.pages}
                    className="px-3 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Siguiente
                  </button>
                  <button
                    onClick={() => handleFilterChange('page', data.pagination.pages)}
                    disabled={filters.page === data.pagination.pages}
                    className="px-3 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Última
                  </button>
                </div>
              </div>
            </div>
          )}
        </>
      )}

      {/* Modal de Confirmación */}
      {selectedReview && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-6">
            <h3 className="text-xl font-bold text-gray-900 mb-4">
              Eliminar Reseña
            </h3>
            <p className="text-gray-600 mb-4">
              ¿Estás seguro de que deseas eliminar esta reseña? Esta acción no se puede deshacer.
            </p>
            <div className="bg-gray-50 p-4 rounded-lg mb-4">
              <div className="mb-2">{renderStars(selectedReview.rating)}</div>
              <p className="text-sm text-gray-700">{selectedReview.comment}</p>
              <p className="text-xs text-gray-500 mt-2">
                Por {selectedReview.ownerId?.name} para {selectedReview.walkerId?.name}
              </p>
            </div>
            <div className="flex space-x-3">
              <button
                onClick={() => setSelectedReview(null)}
                className="flex-1 btn-secondary"
              >
                Cancelar
              </button>
              <button
                onClick={() => deleteMutation.mutate(selectedReview._id)}
                disabled={deleteMutation.isLoading}
                className="flex-1 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 disabled:opacity-50"
              >
                {deleteMutation.isLoading ? 'Eliminando...' : 'Eliminar'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default GestionResenas

