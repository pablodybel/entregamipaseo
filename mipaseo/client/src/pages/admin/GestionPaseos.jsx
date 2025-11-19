import { useState } from 'react'
import { useFetch } from '../../hooks/useFetch'
import { useMutation } from '../../hooks/useMutation'
import { Calendar, Dog, User, XCircle } from 'lucide-react'
import { adminService } from '../../services/admin'
import toast from 'react-hot-toast'

const GestionPaseos = () => {
  const [filters, setFilters] = useState({
    status: 'ALL',
    page: 1,
    limit: 20
  })
  const [cancelReason, setCancelReason] = useState('')
  const [selectedWalk, setSelectedWalk] = useState(null)

  const { data, isLoading, refetch } = useFetch(
    ['admin-walk-requests', JSON.stringify(filters)],
    () => adminService.getWalkRequests(filters)
  )

  const cancelMutation = useMutation(
    ({ walkRequestId, reason }) => 
      adminService.cancelWalkRequest(walkRequestId, reason),
    {
      onSuccess: () => {
        refetch()
        toast.success('Paseo cancelado exitosamente')
        setSelectedWalk(null)
        setCancelReason('')
      },
      onError: () => {
        toast.error('Error al cancelar el paseo')
      }
    }
  )

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value, page: 1 }))
  }

  const handleCancelWalk = () => {
    if (!cancelReason.trim()) {
      toast.error('Por favor ingresa una razón para cancelar')
      return
    }
    cancelMutation.mutate({ walkRequestId: selectedWalk._id, reason: cancelReason })
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

  return (
    <div className="px-4 py-6 sm:px-0">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Gestión de Paseos</h1>
        <p className="text-gray-600 mt-2">Administra todas las solicitudes de paseo</p>
      </div>

      {/* Filtros */}
      <div className="card p-6 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Estado
            </label>
            <select
              className="input"
              value={filters.status}
              onChange={(e) => handleFilterChange('status', e.target.value)}
            >
              <option value="ALL">Todos</option>
              <option value="PENDING">Pendientes</option>
              <option value="ACCEPTED">Aceptados</option>
              <option value="COMPLETED">Completados</option>
              <option value="CANCELLED">Cancelados</option>
              <option value="REJECTED">Rechazados</option>
            </select>
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
            {data?.walkRequests?.map((walk) => (
              <div key={walk._id} className="card p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center space-x-4">
                    {walk.petId?.photoUrl ? (
                      <img
                        src={`${import.meta.env.VITE_API_BASE?.replace('/api/v1', '') || 'http://localhost:4000'}${walk.petId.photoUrl}`}
                        alt={walk.petId.name}
                        className="w-16 h-16 rounded-full object-cover"
                      />
                    ) : (
                      <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center">
                        <Dog className="h-8 w-8 text-gray-500" />
                      </div>
                    )}
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">
                        {walk.petId?.name || 'Mascota'}
                      </h3>
                      <p className="text-sm text-gray-600">
                        {walk.petId?.breed} • {walk.durationMin} minutos
                      </p>
                    </div>
                  </div>
                  {getStatusBadge(walk.status)}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                  {/* Dueño */}
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <div className="flex items-center mb-2">
                      <User className="h-5 w-5 text-blue-600 mr-2" />
                      <span className="text-sm font-medium text-blue-900">Dueño</span>
                    </div>
                    <p className="text-sm font-semibold text-gray-900">{walk.ownerId?.name}</p>
                    <p className="text-xs text-gray-600">{walk.ownerId?.email}</p>
                    <p className="text-xs text-gray-600">{walk.ownerId?.phone}</p>
                  </div>

                  {/* Paseador */}
                  <div className="bg-green-50 p-4 rounded-lg">
                    <div className="flex items-center mb-2">
                      <User className="h-5 w-5 text-green-600 mr-2" />
                      <span className="text-sm font-medium text-green-900">Paseador</span>
                    </div>
                    <p className="text-sm font-semibold text-gray-900">{walk.walkerId?.name}</p>
                    <p className="text-xs text-gray-600">{walk.walkerId?.email}</p>
                    <p className="text-xs text-gray-600">{walk.walkerId?.phone}</p>
                  </div>

                  {/* Fecha y Hora */}
                  <div className="bg-purple-50 p-4 rounded-lg">
                    <div className="flex items-center mb-2">
                      <Calendar className="h-5 w-5 text-purple-600 mr-2" />
                      <span className="text-sm font-medium text-purple-900">Programado</span>
                    </div>
                    <p className="text-sm font-semibold text-gray-900">
                      {new Date(walk.scheduledAt).toLocaleDateString('es-AR')}
                    </p>
                    <p className="text-xs text-gray-600">
                      {new Date(walk.scheduledAt).toLocaleTimeString('es-AR', {
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </p>
                  </div>
                </div>

                {/* Notas */}
                {walk.notes && (
                  <div className="bg-gray-50 p-3 rounded-lg mb-4">
                    <p className="text-sm text-gray-700">
                      <strong>Notas del dueño:</strong> {walk.notes}
                    </p>
                  </div>
                )}

                {/* Acciones */}
                {(walk.status === 'PENDING' || walk.status === 'ACCEPTED') && (
                  <div className="flex justify-end">
                    <button
                      onClick={() => setSelectedWalk(walk)}
                      className="btn-secondary text-red-600 hover:bg-red-50"
                    >
                      <XCircle className="h-4 w-4 mr-2" />
                      Cancelar Paseo
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Paginación */}
          {data?.pagination && (
            <div className="card p-4 mt-6">
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="text-sm text-gray-700">
                  Mostrando <span className="font-semibold">{data.walkRequests.length}</span> de{' '}
                  <span className="font-semibold">{data.pagination.total}</span> paseos
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

      {/* Modal de Cancelación */}
      {selectedWalk && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-6">
            <h3 className="text-xl font-bold text-gray-900 mb-4">
              Cancelar Paseo
            </h3>
            <p className="text-gray-600 mb-4">
              ¿Estás seguro de que deseas cancelar el paseo de {selectedWalk.petId?.name}?
            </p>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Razón de cancelación
              </label>
              <textarea
                className="input"
                rows="3"
                placeholder="Explica por qué se cancela este paseo..."
                value={cancelReason}
                onChange={(e) => setCancelReason(e.target.value)}
              />
            </div>
            <div className="flex space-x-3">
              <button
                onClick={() => {
                  setSelectedWalk(null)
                  setCancelReason('')
                }}
                className="flex-1 btn-secondary"
              >
                Volver
              </button>
              <button
                onClick={handleCancelWalk}
                disabled={cancelMutation.isLoading}
                className="flex-1 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 disabled:opacity-50"
              >
                {cancelMutation.isLoading ? 'Cancelando...' : 'Confirmar Cancelación'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default GestionPaseos

