import { useState } from 'react'
import { useFetch } from '../../hooks/useFetch'
import { useMutation } from '../../hooks/useMutation'
import { Star, MapPin, User, Search, Clock, X, Calendar as CalendarIcon, Dog, Phone } from 'lucide-react'
import { walkersService } from '../../services/walkers'
import { petsService } from '../../services/pets'
import { walkRequestsService } from '../../services/walkRequests'
import { CABA_NEIGHBORHOODS, AVAILABLE_HOURS } from '../../utils/constants'
import toast from 'react-hot-toast'

const BuscarPaseadores = () => {
  const [selectedNeighborhood, setSelectedNeighborhood] = useState('')
  const [searchName, setSearchName] = useState('')
  const [searchTerm, setSearchTerm] = useState('')
  const [showRequestModal, setShowRequestModal] = useState(false)
  const [selectedWalker, setSelectedWalker] = useState(null)
  const [selectedPet, setSelectedPet] = useState('')
  const [selectedDate, setSelectedDate] = useState('')
  const [selectedHour, setSelectedHour] = useState('')
  const [notes, setNotes] = useState('')
  const [showProfileModal, setShowProfileModal] = useState(false)
  const [selectedWalkerProfile, setSelectedWalkerProfile] = useState(null)

  // Buscar paseadores cuando hay nombre o barrio
  const { data: walkersData, isLoading } = useFetch(
    ['walkers-search', searchTerm, selectedNeighborhood],
    () => walkersService.searchWalkers({ 
      name: searchTerm, 
      neighborhood: selectedNeighborhood || undefined 
    }),
    { enabled: !!searchTerm || !!selectedNeighborhood }
  )

  // Obtener mascotas del usuario
  const { data: petsData } = useFetch(
    ['pets'],
    petsService.getPets
  )

  // Mutación para crear solicitud
  const createRequestMutation = useMutation(
    walkRequestsService.createWalkRequest,
    {
      onSuccess: () => {
        toast.success('Solicitud enviada exitosamente')
        setShowRequestModal(false)
        resetForm()
      },
      onError: (error) => {
        toast.error(error.response?.data?.error || 'Error al enviar la solicitud')
      }
    }
  )

  const handleSearch = () => {
    setSearchTerm(searchName)
  }

  const handleClearSearch = () => {
    setSearchName('')
    setSearchTerm('')
  }

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSearch()
    }
  }

  const openRequestModal = (walker) => {
    setSelectedWalker(walker)
    setShowRequestModal(true)
    // Establecer fecha mínima como hoy
    const today = new Date().toISOString().split('T')[0]
    setSelectedDate(today)
  }

  const openProfileModal = (walker) => {
    setSelectedWalkerProfile(walker)
    setShowProfileModal(true)
  }

  const closeProfileModal = () => {
    setSelectedWalkerProfile(null)
    setShowProfileModal(false)
  }

  const handleRequestFromProfile = () => {
    setShowProfileModal(false)
    openRequestModal(selectedWalkerProfile)
  }

  const resetForm = () => {
    setSelectedPet('')
    setSelectedDate('')
    setSelectedHour('')
    setNotes('')
    setSelectedWalker(null)
  }

  const handleSubmitRequest = (e) => {
    e.preventDefault()

    if (!selectedPet || !selectedDate || !selectedHour) {
      toast.error('Por favor completa todos los campos requeridos')
      return
    }

    // Combinar fecha y hora
    const scheduledAt = new Date(`${selectedDate}T${selectedHour}:00`)

    createRequestMutation.mutate({
      walkerId: selectedWalker._id,
      petId: selectedPet,
      scheduledAt: scheduledAt.toISOString(),
      durationMin: 60, // Duración fija de 1 hora
      notes: notes || undefined
    })
  }

  const walkers = walkersData?.walkers || []
  const pets = petsData?.pets || []
  const hasFilters = !!searchTerm || !!selectedNeighborhood

  return (
    <div className="px-4 py-6 sm:px-0">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Buscar Paseadores</h1>

      {/* Search Filters */}
      <div className="card p-6 mb-6">
        <h2 className="text-lg font-semibold mb-4">Filtros de búsqueda</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Buscar por nombre
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                value={searchName}
                onChange={(e) => setSearchName(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Nombre del paseador..."
                className="input pl-10"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Barrio (opcional)
            </label>
            <select
              value={selectedNeighborhood}
              onChange={(e) => setSelectedNeighborhood(e.target.value)}
              className="input"
            >
              <option value="">Todos los barrios</option>
              {CABA_NEIGHBORHOODS.map((neighborhood) => (
                <option key={neighborhood} value={neighborhood}>
                  {neighborhood}
                </option>
              ))}
            </select>
          </div>
        </div>
        
        <div className="mt-4 flex items-center gap-2">
          <button
            onClick={handleSearch}
            className="btn-primary"
            disabled={!searchName.trim() && !selectedNeighborhood}
          >
            Buscar
          </button>
          {hasFilters && (
            <button
              onClick={handleClearSearch}
              className="btn-outline"
            >
              Limpiar filtros
            </button>
          )}
        </div>

        {hasFilters && (
          <div className="mt-4 bg-primary-50 border border-primary-200 rounded-lg px-4 py-2">
            <p className="text-sm text-primary-700">
              {searchTerm && selectedNeighborhood && (
                <>Buscando "{searchTerm}" en {selectedNeighborhood}</>
              )}
              {searchTerm && !selectedNeighborhood && (
                <>Buscando "{searchTerm}" en todos los barrios</>
              )}
              {!searchTerm && selectedNeighborhood && (
                <>Mostrando paseadores de {selectedNeighborhood}</>
              )}
            </p>
          </div>
        )}
      </div>

      {/* Results */}
      {!hasFilters ? (
        <div className="text-center py-12">
          <Search className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Busca paseadores</h3>
          <p className="text-gray-500">Ingresa un nombre o selecciona un barrio para comenzar</p>
        </div>
      ) : isLoading ? (
        <div className="flex justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
        </div>
      ) : walkers.length > 0 ? (
        <>
          <div className="mb-4 text-sm text-gray-600">
            Mostrando {walkers.length} {walkers.length === 1 ? 'paseador' : 'paseadores'}
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {walkers.map((walker) => (
            <div key={walker._id} className="card p-6">
              <div className="flex items-center mb-4">
                {walker.avatarUrl ? (
                  <img
                    src={`${import.meta.env.VITE_API_BASE?.replace('/api/v1', '') || 'http://localhost:4000'}${walker.avatarUrl}`}
                    alt={walker.name}
                    className="w-12 h-12 rounded-full object-cover mr-4"
                  />
                ) : (
                  <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center mr-4">
                    <User className="h-6 w-6 text-gray-500" />
                  </div>
                )}
                <div>
                  <h3 className="font-semibold text-gray-900">{walker.name}</h3>
                  <div className="flex items-center text-sm text-gray-500">
                    <Star className="h-4 w-4 text-yellow-400 mr-1" />
                    <span>{walker.averageRating || 'Sin reseñas'}</span>
                    <span className="mx-1">•</span>
                    <span>{walker.totalReviews || 0} reseñas</span>
                  </div>
                </div>
              </div>

              <div className="space-y-2 mb-4">
                <div className="flex items-center text-sm text-gray-600">
                  <MapPin className="h-4 w-4 mr-2" />
                  <span>{walker.neighborhood}</span>
                </div>
                <p className="text-sm text-gray-600">
                  <strong>Experiencia:</strong> {walker.experienceYears} años
                </p>
              </div>

              {walker.bio && (
                <p className="text-sm text-gray-600 mb-4 line-clamp-3">{walker.bio}</p>
              )}

              {walker.availableHours && walker.availableHours.length > 0 && (
                <div className="mb-4">
                  <div className="flex items-center text-sm font-medium text-gray-700 mb-2">
                    <Clock className="h-4 w-4 mr-1" />
                    Horarios disponibles
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {walker.availableHours.slice(0, 6).map((hour) => (
                      <span
                        key={hour}
                        className="inline-block px-2 py-1 bg-primary-50 text-primary-700 text-xs rounded"
                      >
                        {hour}
                      </span>
                    ))}
                    {walker.availableHours.length > 6 && (
                      <span className="inline-block px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded">
                        +{walker.availableHours.length - 6} más
                      </span>
                    )}
                  </div>
                </div>
              )}

              <div className="flex space-x-2">
                <button 
                  onClick={() => openProfileModal(walker)}
                  className="btn-primary flex-1"
                >
                  Ver Perfil
                </button>
                <button 
                  onClick={() => openRequestModal(walker)}
                  className="btn-outline flex-1"
                >
                  Solicitar Paseo
                </button>
              </div>
            </div>
          ))}
          </div>
        </>
      ) : (
        <div className="text-center py-12">
          <User className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            No se encontraron paseadores
          </h3>
          <p className="text-gray-500">
            Intenta con otros criterios de búsqueda
          </p>
          <button
            onClick={handleClearSearch}
            className="mt-4 btn-outline"
          >
            Limpiar filtros
          </button>
        </div>
      )}

      {/* Modal de Solicitud de Paseo */}
      {showRequestModal && selectedWalker && (() => {
        // Calcular horarios disponibles dentro del modal
        const availableHoursForWalker = selectedWalker.availableHours && selectedWalker.availableHours.length > 0
          ? selectedWalker.availableHours
          : AVAILABLE_HOURS

        return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
              <h2 className="text-xl font-bold text-gray-900">Solicitar Paseo</h2>
              <button
                onClick={() => {
                  setShowRequestModal(false)
                  resetForm()
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            <form onSubmit={handleSubmitRequest} className="p-6 space-y-6">
              {/* Info del paseador */}
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="flex items-center">
                  {selectedWalker.avatarUrl ? (
                    <img
                      src={`${import.meta.env.VITE_API_BASE?.replace('/api/v1', '') || 'http://localhost:4000'}${selectedWalker.avatarUrl}`}
                      alt={selectedWalker.name}
                      className="w-16 h-16 rounded-full object-cover mr-4"
                    />
                  ) : (
                    <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mr-4">
                      <User className="h-8 w-8 text-gray-500" />
                    </div>
                  )}
                  <div>
                    <h3 className="font-semibold text-gray-900">{selectedWalker.name}</h3>
                    <p className="text-sm text-gray-500">{selectedWalker.neighborhood}</p>
                    <div className="flex items-center text-sm text-gray-500 mt-1">
                      <Star className="h-4 w-4 text-yellow-400 mr-1" />
                      <span>{selectedWalker.averageRating || 'Sin reseñas'}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Seleccionar mascota */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Dog className="inline h-5 w-5 mr-1" />
                  Selecciona tu mascota *
                </label>
                {pets.length > 0 ? (
                  <select
                    value={selectedPet}
                    onChange={(e) => setSelectedPet(e.target.value)}
                    className="input"
                    required
                  >
                    <option value="">Elige una mascota</option>
                    {pets.map((pet) => (
                      <option key={pet._id} value={pet._id}>
                        {pet.name} - {pet.breed} ({pet.weightKg}kg)
                      </option>
                    ))}
                  </select>
                ) : (
                  <div className="text-sm text-amber-600 bg-amber-50 border border-amber-200 rounded-lg p-3">
                    No tienes mascotas registradas. Por favor agrega una mascota primero.
                  </div>
                )}
              </div>

              {/* Seleccionar fecha */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <CalendarIcon className="inline h-5 w-5 mr-1" />
                  Fecha del paseo *
                </label>
                <input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  min={new Date().toISOString().split('T')[0]}
                  className="input"
                  required
                />
              </div>

              {/* Seleccionar horario */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Clock className="inline h-5 w-5 mr-1" />
                  Horario (duración: 1 hora) *
                </label>
                <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                  {availableHoursForWalker.map((hour) => (
                    <button
                      key={hour}
                      type="button"
                      onClick={() => setSelectedHour(hour)}
                      className={`
                        py-2 px-3 rounded-lg text-sm font-medium transition-all
                        ${selectedHour === hour
                          ? 'bg-primary-600 text-white shadow-md'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }
                      `}
                    >
                      {hour}
                    </button>
                  ))}
                </div>
                {selectedHour && (
                  <p className="mt-2 text-sm text-primary-600">
                    Paseo de {selectedHour} a {parseInt(selectedHour.split(':')[0]) + 1}:{selectedHour.split(':')[1]}
                  </p>
                )}
              </div>

              {/* Notas opcionales */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Notas adicionales (opcional)
                </label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows="3"
                  className="input"
                  placeholder="Ej: Mi perro ama los parques y correr..."
                  maxLength={500}
                />
                <p className="mt-1 text-xs text-gray-500">
                  {notes.length}/500 caracteres
                </p>
              </div>

              {/* Resumen */}
              {selectedPet && selectedDate && selectedHour && (
                <div className="bg-primary-50 border border-primary-200 rounded-lg p-4">
                  <h3 className="text-sm font-semibold text-primary-900 mb-2">
                    Resumen de la solicitud
                  </h3>
                  <div className="space-y-1 text-sm text-primary-700">
                    <p>• Paseador: {selectedWalker.name}</p>
                    <p>• Mascota: {pets.find(p => p._id === selectedPet)?.name}</p>
                    <p>• Fecha: {new Date(selectedDate).toLocaleDateString('es-AR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
                    <p>• Horario: {selectedHour} - {parseInt(selectedHour.split(':')[0]) + 1}:{selectedHour.split(':')[1]} (1 hora)</p>
                  </div>
                </div>
              )}

              {/* Botones */}
              <div className="flex space-x-3 pt-4 border-t">
                <button
                  type="submit"
                  disabled={!selectedPet || !selectedDate || !selectedHour || createRequestMutation.isLoading || pets.length === 0}
                  className="btn-primary flex-1"
                >
                  {createRequestMutation.isLoading ? 'Enviando...' : 'Enviar Solicitud'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowRequestModal(false)
                    resetForm()
                  }}
                  className="btn-outline"
                >
                  Cancelar
                </button>
              </div>
            </form>
          </div>
        </div>
        )
      })()}

      {/* Modal de Perfil del Paseador */}
      {showProfileModal && selectedWalkerProfile && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
              <h2 className="text-xl font-bold text-gray-900">Perfil del Paseador</h2>
              <button
                onClick={closeProfileModal}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            <div className="p-6 space-y-6">
              {/* Header con foto y nombre */}
              <div className="flex items-start space-x-6">
                {selectedWalkerProfile.avatarUrl ? (
                  <img
                    src={`${import.meta.env.VITE_API_BASE?.replace('/api/v1', '') || 'http://localhost:4000'}${selectedWalkerProfile.avatarUrl}`}
                    alt={selectedWalkerProfile.name}
                    className="w-32 h-32 rounded-full object-cover border-4 border-primary-100"
                  />
                ) : (
                  <div className="w-32 h-32 bg-gray-200 rounded-full flex items-center justify-center border-4 border-primary-100">
                    <User className="h-16 w-16 text-gray-500" />
                  </div>
                )}
                <div className="flex-1">
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">
                    {selectedWalkerProfile.name}
                  </h3>
                  <div className="flex items-center text-lg mb-3">
                    <Star className="h-5 w-5 text-yellow-400 mr-1 fill-current" />
                    <span className="font-semibold text-gray-900">
                      {selectedWalkerProfile.averageRating || 'Sin calificación'}
                    </span>
                    <span className="text-gray-500 ml-2">
                      ({selectedWalkerProfile.totalReviews || 0} {selectedWalkerProfile.totalReviews === 1 ? 'reseña' : 'reseñas'})
                    </span>
                  </div>
                  <div className="flex items-center text-gray-600 mb-2">
                    <MapPin className="h-5 w-5 mr-2" />
                    <span className="font-medium">{selectedWalkerProfile.neighborhood}</span>
                  </div>
                  <div className="flex items-center text-gray-600">
                    <Clock className="h-5 w-5 mr-2" />
                    <span>{selectedWalkerProfile.experienceYears} años de experiencia</span>
                  </div>
                </div>
              </div>

              {/* Sobre mí */}
              {selectedWalkerProfile.bio && (
                <div className="bg-gray-50 rounded-lg p-4">
                  <h4 className="font-semibold text-gray-900 mb-2 flex items-center">
                    <User className="h-5 w-5 mr-2 text-primary-600" />
                    Sobre mí
                  </h4>
                  <p className="text-gray-700 leading-relaxed">{selectedWalkerProfile.bio}</p>
                </div>
              )}

              {/* Horarios disponibles */}
              {selectedWalkerProfile.availableHours && selectedWalkerProfile.availableHours.length > 0 && (
                <div className="bg-primary-50 rounded-lg p-4">
                  <h4 className="font-semibold text-gray-900 mb-3 flex items-center">
                    <Clock className="h-5 w-5 mr-2 text-primary-600" />
                    Horarios Disponibles (Paseos de 1 hora)
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {selectedWalkerProfile.availableHours.map((hour) => (
                      <span
                        key={hour}
                        className="inline-block px-3 py-2 bg-primary-600 text-white text-sm font-medium rounded-lg"
                      >
                        {hour}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Información de contacto */}
              <div className="bg-secondary-50 rounded-lg p-4">
                <h4 className="font-semibold text-gray-900 mb-3 flex items-center">
                  <Phone className="h-5 w-5 mr-2 text-secondary-600" />
                  Información de Contacto
                </h4>
                <div className="space-y-2 text-gray-700">
                  <div className="flex items-center">
                    <MapPin className="h-4 w-4 mr-2 text-gray-500" />
                    <span><strong>Barrio de servicio:</strong> {selectedWalkerProfile.neighborhood}</span>
                  </div>
                  {selectedWalkerProfile.phone && (
                    <div className="flex items-center">
                      <Phone className="h-4 w-4 mr-2 text-gray-500" />
                      <span><strong>Teléfono:</strong> {selectedWalkerProfile.phone}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Estadísticas */}
              <div className="grid grid-cols-3 gap-4">
                <div className="bg-white border border-gray-200 rounded-lg p-4 text-center">
                  <div className="text-3xl font-bold text-primary-600">
                    {selectedWalkerProfile.experienceYears}
                  </div>
                  <div className="text-sm text-gray-600 mt-1">Años de experiencia</div>
                </div>
                <div className="bg-white border border-gray-200 rounded-lg p-4 text-center">
                  <div className="text-3xl font-bold text-yellow-500">
                    {selectedWalkerProfile.averageRating || '0'}
                  </div>
                  <div className="text-sm text-gray-600 mt-1">Calificación</div>
                </div>
                <div className="bg-white border border-gray-200 rounded-lg p-4 text-center">
                  <div className="text-3xl font-bold text-secondary-600">
                    {selectedWalkerProfile.totalReviews || '0'}
                  </div>
                  <div className="text-sm text-gray-600 mt-1">Reseñas</div>
                </div>
              </div>

              {/* Reseñas recientes - Placeholder */}
              {selectedWalkerProfile.totalReviews > 0 && (
                <div className="border-t pt-4">
                  <h4 className="font-semibold text-gray-900 mb-3 flex items-center">
                    <Star className="h-5 w-5 mr-2 text-yellow-400" />
                    Reseñas de Clientes
                  </h4>
                  <div className="bg-gray-50 rounded-lg p-4 text-center text-gray-500">
                    <p>Las reseñas aparecerán aquí</p>
                  </div>
                </div>
              )}
            </div>

            {/* Botones de acción */}
            <div className="sticky bottom-0 bg-white border-t border-gray-200 px-6 py-4 flex space-x-3">
              <button
                onClick={handleRequestFromProfile}
                className="btn-primary flex-1"
              >
                Solicitar Paseo
              </button>
              <button
                onClick={closeProfileModal}
                className="btn-outline"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default BuscarPaseadores
