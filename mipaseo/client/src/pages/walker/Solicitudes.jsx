import { useState, useMemo, useEffect } from 'react'
import { useFetch } from '../../hooks/useFetch'
import { useMutation } from '../../hooks/useMutation'
import { useQueryClient } from '../../hooks/useQueryClient'
import { Calendar, Dog, CheckCircle, XCircle, MapPin, Phone, Clock, User, ChevronLeft, ChevronRight } from 'lucide-react'
import { walkRequestsService } from '../../services/walkRequests'
import toast from 'react-hot-toast'

const Solicitudes = () => {
  const [selectedDate, setSelectedDate] = useState(new Date())
  const [viewMode, setViewMode] = useState('month') // 'month' o 'day'
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage] = useState(5) // Número de solicitudes por página
  const queryClient = useQueryClient()

  // Cuando cambia el mes o el modo de vista, resetear a la página 1
  const monthKey = `${selectedDate.getMonth()}-${selectedDate.getFullYear()}-${viewMode}`

  // Obtener todas las solicitudes (sin paginación del backend) para poder filtrar por mes
  const { data: requests, isLoading, refetch } = useFetch(
    ['walkRequests', monthKey],
    () => walkRequestsService.getMyWalkRequests(null, 1, 1000) // Obtener muchas para tener todas las del mes
  )

  // Resetear página cuando cambia el mes o el modo de vista
  useEffect(() => {
    setCurrentPage(1)
  }, [monthKey])

  // Filtrar solicitudes por fecha seleccionada
  const allFilteredRequests = useMemo(() => {
    if (!requests?.walkRequests) return []
    
    if (viewMode === 'day') {
      return requests.walkRequests.filter(request => {
        const requestDate = new Date(request.scheduledAt)
        const selected = new Date(selectedDate)
        return requestDate.toDateString() === selected.toDateString()
      })
    } else {
      // Filtrar solo las del mes seleccionado
      return requests.walkRequests.filter(request => {
        const requestDate = new Date(request.scheduledAt)
        return requestDate.getMonth() === selectedDate.getMonth() &&
               requestDate.getFullYear() === selectedDate.getFullYear()
      })
    }
  }, [requests, selectedDate, viewMode])

  // Aplicar paginación en el frontend (solo para modo mes)
  const filteredRequests = useMemo(() => {
    if (viewMode === 'month') {
      const startIndex = (currentPage - 1) * itemsPerPage
      const endIndex = startIndex + itemsPerPage
      return allFilteredRequests.slice(startIndex, endIndex)
    }
    return allFilteredRequests
  }, [allFilteredRequests, currentPage, itemsPerPage, viewMode])

  // Calcular información de paginación para modo mes
  const totalItems = allFilteredRequests.length
  const totalPages = viewMode === 'month' ? Math.ceil(totalItems / itemsPerPage) : 1

  // Obtener días con solicitudes en el mes actual
  const daysWithRequests = useMemo(() => {
    if (!requests?.walkRequests) return new Set()
    
    const days = new Set()
    requests.walkRequests.forEach(request => {
      const date = new Date(request.scheduledAt)
      if (date.getMonth() === selectedDate.getMonth() &&
          date.getFullYear() === selectedDate.getFullYear()) {
        days.add(date.getDate())
      }
    })
    return days
  }, [requests, selectedDate])

  const acceptMutation = useMutation(
    ({ id, notes }) => walkRequestsService.acceptWalkRequest(id, notes),
    {
      onSuccess: () => {
        refetch()
        // Invalidar queries relacionadas para actualizar el badge en el Layout
        queryClient.invalidateQueries(['walkRequests', 'pending'])
        queryClient.invalidateQueries(['walkRequests', 'pending', 'count'])
        // Invalidar también las queries de los dueños para que vean el cambio
        queryClient.invalidateQueries(['walkRequests', 'accepted'])
        queryClient.invalidateQueries(['walkRequests', 'accepted', 'count'])
        toast.success('Solicitud aceptada')
      },
      onError: (error) => {
        toast.error(error.response?.data?.error || 'Error al aceptar la solicitud')
      }
    }
  )

  const rejectMutation = useMutation(
    ({ id, notes }) => walkRequestsService.rejectWalkRequest(id, notes),
    {
      onSuccess: () => {
        refetch()
        // Invalidar queries relacionadas para actualizar el badge en el Layout
        queryClient.invalidateQueries(['walkRequests', 'pending'])
        queryClient.invalidateQueries(['walkRequests', 'pending', 'count'])
        toast.success('Solicitud rechazada')
      },
      onError: (error) => {
        toast.error(error.response?.data?.error || 'Error al rechazar la solicitud')
      }
    }
  )

  const completeMutation = useMutation(
    ({ id, notes }) => walkRequestsService.completeWalkRequest(id, notes),
    {
      onSuccess: () => {
        refetch()
        toast.success('Paseo completado')
      },
      onError: (error) => {
        toast.error(error.response?.data?.error || 'Error al completar el paseo')
      }
    }
  )

  const getStatusBadge = (status) => {
    const badges = {
      PENDING: 'badge-warning',
      ACCEPTED: 'badge-success',
      REJECTED: 'badge-error',
      COMPLETED: 'badge-info',
      CANCELLED: 'badge-error'
    }
    return `badge ${badges[status] || 'badge-info'}`
  }

  const getStatusText = (status) => {
    const texts = {
      PENDING: 'Pendiente',
      ACCEPTED: 'Aceptada',
      REJECTED: 'Rechazada',
      COMPLETED: 'Completada',
      CANCELLED: 'Cancelada'
    }
    return texts[status] || status
  }

  const changeMonth = (increment) => {
    const newDate = new Date(selectedDate)
    newDate.setMonth(newDate.getMonth() + increment)
    setSelectedDate(newDate)
    setViewMode('month')
  }

  const selectDay = (day) => {
    const newDate = new Date(selectedDate)
    newDate.setDate(day)
    setSelectedDate(newDate)
    setViewMode('day')
  }

  const goToToday = () => {
    setSelectedDate(new Date())
    setViewMode('month')
  }

  const renderCalendar = () => {
    const year = selectedDate.getFullYear()
    const month = selectedDate.getMonth()
    const firstDay = new Date(year, month, 1).getDay()
    const daysInMonth = new Date(year, month + 1, 0).getDate()
    const today = new Date()

    const days = []
    const dayNames = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb']

    // Headers de días
    dayNames.forEach(name => {
      days.push(
        <div key={`header-${name}`} className="text-center text-xs font-semibold text-gray-600 py-2">
          {name}
        </div>
      )
    })

    // Días vacíos al inicio
    for (let i = 0; i < firstDay; i++) {
      days.push(<div key={`empty-${i}`} className="p-2"></div>)
    }

    // Días del mes
    for (let day = 1; day <= daysInMonth; day++) {
      const isToday = day === today.getDate() && 
                      month === today.getMonth() && 
                      year === today.getFullYear()
      const hasRequests = daysWithRequests.has(day)
      const isSelected = day === selectedDate.getDate() && viewMode === 'day'

      days.push(
        <button
          key={day}
          onClick={() => selectDay(day)}
          className={`
            p-2 text-sm rounded-lg transition-all relative
            ${isSelected ? 'bg-secondary-600 text-white font-bold' : ''}
            ${!isSelected && isToday ? 'bg-secondary-100 text-secondary-700 font-semibold' : ''}
            ${!isSelected && !isToday && hasRequests ? 'bg-green-50 text-green-700 hover:bg-green-100' : ''}
            ${!isSelected && !isToday && !hasRequests ? 'text-gray-700 hover:bg-gray-100' : ''}
          `}
        >
          {day}
          {hasRequests && !isSelected && (
            <span className="absolute bottom-1 left-1/2 transform -translate-x-1/2 w-1 h-1 bg-green-500 rounded-full"></span>
          )}
        </button>
      )
    }

    return days
  }

  if (isLoading) {
    return <div className="flex justify-center py-8">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
    </div>
  }

  const monthNames = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
                      'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre']

  return (
    <div className="px-4 py-6 sm:px-0">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Solicitudes de Paseo</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Calendario */}
        <div className="lg:col-span-1">
          <div className="card p-4">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900">
                {monthNames[selectedDate.getMonth()]} {selectedDate.getFullYear()}
              </h2>
              <div className="flex space-x-1">
                <button
                  onClick={() => changeMonth(-1)}
                  className="p-1 hover:bg-gray-100 rounded"
                >
                  <ChevronLeft className="h-5 w-5" />
                </button>
                <button
                  onClick={() => changeMonth(1)}
                  className="p-1 hover:bg-gray-100 rounded"
                >
                  <ChevronRight className="h-5 w-5" />
                </button>
              </div>
            </div>

            <div className="grid grid-cols-7 gap-1 mb-4">
              {renderCalendar()}
            </div>

            <div className="flex justify-between items-center text-xs text-gray-500 pt-3 border-t">
              <div className="flex items-center">
                <span className="w-2 h-2 bg-green-500 rounded-full mr-1"></span>
                Con solicitudes
              </div>
              <button
                onClick={goToToday}
                className="text-secondary-600 hover:text-secondary-700 font-medium"
              >
                Hoy
              </button>
            </div>
          </div>

          {/* Leyenda de estados */}
          <div className="card p-4 mt-4">
            <h3 className="text-sm font-semibold text-gray-900 mb-3">Estados</h3>
            <div className="space-y-2 text-xs">
              <div className="flex items-center">
                <span className="badge badge-warning mr-2">Pendiente</span>
                <span className="text-gray-600">Requiere acción</span>
              </div>
              <div className="flex items-center">
                <span className="badge badge-success mr-2">Aceptada</span>
                <span className="text-gray-600">Confirmado</span>
              </div>
              <div className="flex items-center">
                <span className="badge badge-info mr-2">Completada</span>
                <span className="text-gray-600">Realizado</span>
              </div>
            </div>
          </div>
        </div>

        {/* Lista de solicitudes */}
        <div className="lg:col-span-2">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold text-gray-900">
                {viewMode === 'day' 
                  ? `Solicitudes del ${selectedDate.getDate()} de ${monthNames[selectedDate.getMonth()]}`
                  : `Solicitudes de ${monthNames[selectedDate.getMonth()]}`
                }
              </h2>
              <p className="text-sm text-gray-500">
                {viewMode === 'month' 
                  ? `${totalItems} ${totalItems === 1 ? 'solicitud' : 'solicitudes'}`
                  : `${filteredRequests.length} ${filteredRequests.length === 1 ? 'solicitud' : 'solicitudes'}`
                }
              </p>
            </div>
            {viewMode === 'day' && (
              <button
                onClick={() => setViewMode('month')}
                className="text-sm text-secondary-600 hover:text-secondary-700 font-medium"
              >
                Ver todo el mes
              </button>
            )}
          </div>

          {filteredRequests.length > 0 ? (
            <>
              <div className="space-y-4">
                {filteredRequests.map((request) => (
                <div key={request._id} className="card p-6">
                  {/* Header con mascota y estado */}
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center">
                      {request.petId?.photoUrl ? (
                        <img
                          src={`${import.meta.env.VITE_API_BASE?.replace('/api/v1', '') || 'http://localhost:4000'}${request.petId.photoUrl}`}
                          alt={request.petId.name}
                          className="w-16 h-16 rounded-full object-cover mr-4"
                        />
                      ) : (
                        <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mr-4">
                          <Dog className="h-8 w-8 text-gray-500" />
                        </div>
                      )}
                      <div>
                        <h3 className="font-semibold text-gray-900 text-lg">
                          {request.petId?.name || 'Mascota'}
                        </h3>
                        <p className="text-sm text-gray-600">
                          {request.petId?.breed} • {request.petId?.weightKg} kg
                        </p>
                      </div>
                    </div>
                    <span className={getStatusBadge(request.status)}>
                      {getStatusText(request.status)}
                    </span>
                  </div>

                  {/* Información del dueño y dirección */}
                  <div className="bg-primary-50 border border-primary-200 rounded-lg p-4 mb-4">
                    <h4 className="font-semibold text-gray-900 mb-3 flex items-center">
                      <User className="h-5 w-5 mr-2 text-primary-600" />
                      Información del Dueño
                    </h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex items-start">
                        <User className="h-4 w-4 mr-2 text-gray-500 mt-0.5" />
                        <div>
                          <p className="font-medium text-gray-900">{request.ownerId?.name || 'No disponible'}</p>
                        </div>
                      </div>
                      <div className="flex items-start">
                        <MapPin className="h-4 w-4 mr-2 text-gray-500 mt-0.5 flex-shrink-0" />
                        <div>
                          <p className="text-gray-700">
                            <strong>Dirección de recogida:</strong><br />
                            {request.ownerId?.address || 'No especificada'}
                          </p>
                        </div>
                      </div>
                      {request.ownerId?.phone && (
                        <div className="flex items-center">
                          <Phone className="h-4 w-4 mr-2 text-gray-500" />
                          <p className="text-gray-700">
                            <strong>Teléfono:</strong> {request.ownerId.phone}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Detalles del paseo */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm mb-4">
                    <div>
                      <p className="text-gray-500 flex items-center mb-1">
                        <Calendar className="h-4 w-4 mr-1" />
                        Fecha
                      </p>
                      <p className="font-medium">
                        {new Date(request.scheduledAt).toLocaleDateString('es-AR', { 
                          day: '2-digit', 
                          month: '2-digit', 
                          year: 'numeric' 
                        })}
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-500 flex items-center mb-1">
                        <Clock className="h-4 w-4 mr-1" />
                        Hora
                      </p>
                      <p className="font-medium">
                        {new Date(request.scheduledAt).toLocaleTimeString('es-AR', {
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-500 mb-1">Duración</p>
                      <p className="font-medium">{request.durationMin} min</p>
                    </div>
                    <div>
                      <p className="text-gray-500 mb-1">Edad</p>
                      <p className="font-medium">{request.petId?.age || 0} años</p>
                    </div>
                  </div>

                  {/* Información de la mascota */}
                  {request.petId && (
                    <div className="bg-gray-50 rounded-lg p-4 mb-4">
                      <h4 className="font-semibold text-gray-900 mb-3 flex items-center">
                        <Dog className="h-5 w-5 mr-2 text-gray-600" />
                        Características de la Mascota
                      </h4>
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div className="space-y-2">
                          <div className="flex items-center">
                            <span className={`inline-block w-2 h-2 rounded-full mr-2 ${request.petId.preferences?.sociable ? 'bg-green-500' : 'bg-gray-300'}`}></span>
                            <p className="text-gray-700">
                              {request.petId.preferences?.sociable ? 'Sociable con otros perros' : 'No es sociable'}
                            </p>
                          </div>
                          <div className="flex items-center">
                            <span className={`inline-block w-2 h-2 rounded-full mr-2 ${request.petId.preferences?.needsMuzzle ? 'bg-amber-500' : 'bg-gray-300'}`}></span>
                            <p className="text-gray-700">
                              {request.petId.preferences?.needsMuzzle ? 'Requiere bozal' : 'No requiere bozal'}
                            </p>
                          </div>
                        </div>
                        <div className="space-y-2">
                          <div className="flex items-center">
                            <span className={`inline-block w-2 h-2 rounded-full mr-2 ${request.petId.preferences?.soloWalks ? 'bg-blue-500' : 'bg-gray-300'}`}></span>
                            <p className="text-gray-700">
                              {request.petId.preferences?.soloWalks ? 'Prefiere paseos en solitario' : 'Puede pasear con otros'}
                            </p>
                          </div>
                        </div>
                      </div>
                      {request.petId.routine?.specialCare && (
                        <div className="mt-3 pt-3 border-t border-gray-200">
                          <p className="text-sm text-gray-700">
                            <strong>Cuidados especiales:</strong> {request.petId.routine.specialCare}
                          </p>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Notas del dueño */}
                  {request.notes && (
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                      <p className="text-sm font-semibold text-blue-900 mb-1">Notas del dueño:</p>
                      <p className="text-sm text-blue-800">{request.notes}</p>
                    </div>
                  )}

                  {/* Notas del paseador (si ya hay) */}
                  {request.walkerNotes && (
                    <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
                      <p className="text-sm font-semibold text-green-900 mb-1">Tus notas:</p>
                      <p className="text-sm text-green-800">{request.walkerNotes}</p>
                    </div>
                  )}

                  {/* Botones de acción */}
                  <div className="flex flex-wrap gap-2 pt-4 border-t">
                    {request.status === 'PENDING' && (
                      <>
                        <button
                          onClick={() => acceptMutation.mutate({ id: request._id, notes: '' })}
                          className="btn-primary flex items-center"
                          disabled={acceptMutation.isLoading}
                        >
                          <CheckCircle className="h-4 w-4 mr-1" />
                          {acceptMutation.isLoading ? 'Aceptando...' : 'Aceptar'}
                        </button>
                        <button
                          onClick={() => rejectMutation.mutate({ id: request._id, notes: 'No disponible en este horario' })}
                          className="btn-outline text-red-600 border-red-300 hover:bg-red-50 flex items-center"
                          disabled={rejectMutation.isLoading}
                        >
                          <XCircle className="h-4 w-4 mr-1" />
                          {rejectMutation.isLoading ? 'Rechazando...' : 'Rechazar'}
                        </button>
                      </>
                    )}
                    {request.status === 'ACCEPTED' && (
                      <button
                        onClick={() => completeMutation.mutate({ id: request._id, notes: 'Paseo completado exitosamente' })}
                        className="btn-primary flex items-center"
                        disabled={completeMutation.isLoading}
                      >
                        <CheckCircle className="h-4 w-4 mr-1" />
                        {completeMutation.isLoading ? 'Completando...' : 'Marcar como Completado'}
                      </button>
                    )}
                    <button className="btn-outline">
                      Ver Detalles
                    </button>
                  </div>
                </div>
              ))}
              </div>

              {/* Paginación - Solo mostrar cuando está en modo mes */}
              {viewMode === 'month' && totalPages > 1 && (
                <div className="mt-6 flex items-center justify-between border-t border-gray-200 pt-4">
                  <div className="flex items-center text-sm text-gray-700">
                    <span>
                      Mostrando {((currentPage - 1) * itemsPerPage) + 1} a {Math.min(currentPage * itemsPerPage, totalItems)} de {totalItems} solicitudes
                    </span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                      disabled={currentPage === 1}
                      className="px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                    >
                      <ChevronLeft className="h-4 w-4 mr-1" />
                      Anterior
                    </button>
                    <div className="flex items-center space-x-1">
                      {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                        let pageNum
                        if (totalPages <= 5) {
                          pageNum = i + 1
                        } else if (currentPage <= 3) {
                          pageNum = i + 1
                        } else if (currentPage >= totalPages - 2) {
                          pageNum = totalPages - 4 + i
                        } else {
                          pageNum = currentPage - 2 + i
                        }
                        
                        return (
                          <button
                            key={pageNum}
                            onClick={() => setCurrentPage(pageNum)}
                            className={`px-3 py-2 text-sm font-medium rounded-lg ${
                              currentPage === pageNum
                                ? 'bg-secondary-600 text-white'
                                : 'text-gray-700 bg-white border border-gray-300 hover:bg-gray-50'
                            }`}
                          >
                            {pageNum}
                          </button>
                        )
                      })}
                    </div>
                    <button
                      onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                      disabled={currentPage === totalPages}
                      className="px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                    >
                      Siguiente
                      <ChevronRight className="h-4 w-4 ml-1" />
                    </button>
                  </div>
                </div>
              )}
            </>
          ) : (
            <div className="card p-12 text-center">
              <Calendar className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                No hay solicitudes {viewMode === 'day' ? 'este día' : 'este mes'}
              </h3>
              <p className="text-gray-500">
                {viewMode === 'day' 
                  ? 'Selecciona otro día en el calendario'
                  : 'Las nuevas solicitudes de paseo aparecerán aquí'
                }
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default Solicitudes
