import { useState, useMemo } from 'react'
import { useFetch } from '../../hooks/useFetch'
import { useMutation } from '../../hooks/useMutation'
import { Star, User, CheckCircle } from 'lucide-react'
import { walkRequestsService } from '../../services/walkRequests'
import toast from 'react-hot-toast'

const ResenasPendientes = () => {
  const [selectedWalker, setSelectedWalker] = useState(null)
  const [rating, setRating] = useState(0)
  const [hoverRating, setHoverRating] = useState(0)
  const [comment, setComment] = useState('')

  // Obtener todas las solicitudes completadas
  const { data: requests, isLoading, refetch } = useFetch(
    ['walkRequests'],
    () => walkRequestsService.getMyWalkRequests()
  )

  // Agrupar paseadores con paseos completados
  const walkersWithCompletedWalks = useMemo(() => {
    if (!requests?.walkRequests) return []

    const walkerMap = new Map()

    requests.walkRequests
      .filter(req => req.status === 'COMPLETED')
      .forEach(req => {
        const walkerId = req.walkerId?._id
        if (!walkerId) return

        if (!walkerMap.has(walkerId)) {
          walkerMap.set(walkerId, {
            walker: req.walkerId,
            completedWalks: 0,
            lastWalkDate: req.scheduledAt,
            hasReview: false // TODO: Verificar si ya tiene reseña
          })
        }

        const walkerData = walkerMap.get(walkerId)
        walkerData.completedWalks++
        
        // Actualizar última fecha
        if (new Date(req.scheduledAt) > new Date(walkerData.lastWalkDate)) {
          walkerData.lastWalkDate = req.scheduledAt
        }
      })

    return Array.from(walkerMap.values())
      .sort((a, b) => new Date(b.lastWalkDate) - new Date(a.lastWalkDate))
  }, [requests])

  const submitReview = useMutation(
    async (reviewData) => {
      // TODO: Implementar endpoint de reseñas
      console.log('Enviando reseña:', reviewData)
      return Promise.resolve()
    },
    {
      onSuccess: () => {
        toast.success('Reseña enviada exitosamente')
        setSelectedWalker(null)
        setRating(0)
        setComment('')
        refetch()
      },
      onError: () => {
        toast.error('Error al enviar la reseña')
      }
    }
  )

  const handleSubmitReview = (e) => {
    e.preventDefault()
    
    if (rating === 0) {
      toast.error('Por favor selecciona una calificación')
      return
    }

    submitReview.mutate({
      walkerId: selectedWalker.walker._id,
      rating,
      comment
    })
  }

  if (isLoading) {
    return <div className="flex justify-center py-8">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
    </div>
  }

  return (
    <div className="px-4 py-6 sm:px-0">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Calificar Paseadores</h1>

      {walkersWithCompletedWalks.length > 0 ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Lista de paseadores */}
          <div className="space-y-4">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Paseadores con los que has trabajado
            </h2>
            {walkersWithCompletedWalks.map((walkerData) => (
              <div 
                key={walkerData.walker._id} 
                className={`card p-6 cursor-pointer transition-all ${
                  selectedWalker?.walker._id === walkerData.walker._id 
                    ? 'ring-2 ring-primary-500' 
                    : 'hover:shadow-lg'
                }`}
                onClick={() => setSelectedWalker(walkerData)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    {walkerData.walker.avatarUrl ? (
                      <img
                        src={`${import.meta.env.VITE_API_BASE?.replace('/api/v1', '') || 'http://localhost:4000'}${walkerData.walker.avatarUrl}`}
                        alt={walkerData.walker.name}
                        className="w-12 h-12 rounded-full object-cover mr-4"
                      />
                    ) : (
                      <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center mr-4">
                        <User className="h-6 w-6 text-gray-500" />
                      </div>
                    )}
                    <div>
                      <h3 className="font-semibold text-gray-900">
                        {walkerData.walker.name}
                      </h3>
                      <p className="text-sm text-gray-500">
                        {walkerData.completedWalks} {walkerData.completedWalks === 1 ? 'paseo completado' : 'paseos completados'}
                      </p>
                      <p className="text-xs text-gray-400">
                        Último paseo: {new Date(walkerData.lastWalkDate).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  {walkerData.hasReview ? (
                    <CheckCircle className="h-6 w-6 text-green-500" />
                  ) : (
                    <div className="flex items-center text-amber-500">
                      <Star className="h-5 w-5 mr-1" />
                      <span className="text-sm font-medium">Calificar</span>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Formulario de reseña */}
          <div>
            {selectedWalker ? (
              <div className="card p-6 sticky top-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">
                  Calificar a {selectedWalker.walker.name}
                </h2>

                <form onSubmit={handleSubmitReview} className="space-y-6">
                  {/* Rating con estrellas */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Calificación general
                    </label>
                    <div className="flex items-center space-x-2">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          type="button"
                          onClick={() => setRating(star)}
                          onMouseEnter={() => setHoverRating(star)}
                          onMouseLeave={() => setHoverRating(0)}
                          className="focus:outline-none transition-transform hover:scale-110"
                        >
                          <Star
                            className={`h-10 w-10 ${
                              star <= (hoverRating || rating)
                                ? 'fill-yellow-400 text-yellow-400'
                                : 'text-gray-300'
                            }`}
                          />
                        </button>
                      ))}
                    </div>
                    {rating > 0 && (
                      <p className="mt-2 text-sm text-gray-600">
                        {rating === 1 && 'Muy malo'}
                        {rating === 2 && 'Malo'}
                        {rating === 3 && 'Regular'}
                        {rating === 4 && 'Bueno'}
                        {rating === 5 && 'Excelente'}
                      </p>
                    )}
                  </div>

                  {/* Comentario */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Comentario (opcional)
                    </label>
                    <textarea
                      value={comment}
                      onChange={(e) => setComment(e.target.value)}
                      rows="4"
                      className="input"
                      placeholder="Cuéntanos sobre tu experiencia con este paseador..."
                      maxLength={500}
                    />
                    <p className="mt-1 text-xs text-gray-500">
                      {comment.length}/500 caracteres
                    </p>
                  </div>

                  {/* Resumen */}
                  <div className="bg-gray-50 rounded-lg p-4">
                    <h3 className="text-sm font-semibold text-gray-900 mb-2">
                      Resumen de tu experiencia
                    </h3>
                    <div className="space-y-1 text-sm text-gray-600">
                      <p>
                        • {selectedWalker.completedWalks} {selectedWalker.completedWalks === 1 ? 'paseo realizado' : 'paseos realizados'}
                      </p>
                      <p>
                        • Último paseo: {new Date(selectedWalker.lastWalkDate).toLocaleDateString()}
                      </p>
                      <p>
                        • Barrio: {selectedWalker.walker.neighborhood}
                      </p>
                    </div>
                  </div>

                  {/* Botones */}
                  <div className="flex space-x-3">
                    <button
                      type="submit"
                      disabled={rating === 0 || submitReview.isLoading}
                      className="btn-primary flex-1"
                    >
                      {submitReview.isLoading ? 'Enviando...' : 'Enviar Reseña'}
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedWalker(null)
                        setRating(0)
                        setComment('')
                      }}
                      className="btn-outline"
                    >
                      Cancelar
                    </button>
                  </div>
                </form>
              </div>
            ) : (
              <div className="card p-12 text-center">
                <Star className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  Selecciona un paseador
                </h3>
                <p className="text-gray-500">
                  Elige un paseador de la lista para calificar tu experiencia
                </p>
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="card p-12 text-center">
          <Star className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            No hay paseadores para calificar
          </h3>
          <p className="text-gray-500">
            Completa algunos paseos para poder calificar a los paseadores
          </p>
        </div>
      )}
    </div>
  )
}

export default ResenasPendientes
