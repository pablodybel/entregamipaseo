import { useState, useMemo } from 'react'
import { useFetch } from '../../hooks/useFetch'
import { Calendar, Clock, ChevronLeft, ChevronRight, Star } from 'lucide-react'
import { walkRequestsService } from '../../services/walkRequests'

const MisSolicitudes = () => {
  const [selectedDate, setSelectedDate] = useState(new Date())
  const [viewMode, setViewMode] = useState('month') // 'month' o 'day'

  const { data: requests, isLoading } = useFetch(
    ['walkRequests'],
    () => walkRequestsService.getMyWalkRequests()
  )

  // Filtrar solicitudes por fecha seleccionada
  const filteredRequests = useMemo(() => {
    if (!requests?.walkRequests) return []
    
    return requests.walkRequests.filter(request => {
      const requestDate = new Date(request.scheduledAt)
      const selected = new Date(selectedDate)
      
      if (viewMode === 'day') {
        return requestDate.toDateString() === selected.toDateString()
      } else {
        return requestDate.getMonth() === selected.getMonth() &&
               requestDate.getFullYear() === selected.getFullYear()
      }
    })
  }, [requests, selectedDate, viewMode])

  // Obtener días con paseos en el mes actual
  const daysWithWalks = useMemo(() => {
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
      const hasWalks = daysWithWalks.has(day)
      const isSelected = day === selectedDate.getDate() && viewMode === 'day'

      days.push(
        <button
          key={day}
          onClick={() => selectDay(day)}
          className={`
            p-2 text-sm rounded-lg transition-all relative
            ${isSelected ? 'bg-primary-600 text-white font-bold' : ''}
            ${!isSelected && isToday ? 'bg-primary-100 text-primary-700 font-semibold' : ''}
            ${!isSelected && !isToday && hasWalks ? 'bg-green-50 text-green-700 hover:bg-green-100' : ''}
            ${!isSelected && !isToday && !hasWalks ? 'text-gray-700 hover:bg-gray-100' : ''}
          `}
        >
          {day}
          {hasWalks && !isSelected && (
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
                Con paseos
              </div>
              <button
                onClick={goToToday}
                className="text-primary-600 hover:text-primary-700 font-medium"
              >
                Hoy
              </button>
            </div>
          </div>

          {/* Leyenda */}
          <div className="card p-4 mt-4">
            <h3 className="text-sm font-semibold text-gray-900 mb-3">Estados</h3>
            <div className="space-y-2 text-xs">
              <div className="flex items-center">
                <span className="badge badge-warning mr-2">Pendiente</span>
                <span className="text-gray-600">Esperando respuesta</span>
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
                  ? `Paseos del ${selectedDate.getDate()} de ${monthNames[selectedDate.getMonth()]}`
                  : `Paseos de ${monthNames[selectedDate.getMonth()]}`
                }
              </h2>
              <p className="text-sm text-gray-500">
                {filteredRequests.length} {filteredRequests.length === 1 ? 'paseo' : 'paseos'}
              </p>
            </div>
            {viewMode === 'day' && (
              <button
                onClick={() => setViewMode('month')}
                className="text-sm text-primary-600 hover:text-primary-700 font-medium"
              >
                Ver todo el mes
              </button>
            )}
          </div>

          {filteredRequests.length > 0 ? (
            <div className="space-y-4">
              {filteredRequests.map((request) => (
                <div key={request._id} className="card p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center">
                      <Calendar className="h-5 w-5 text-gray-400 mr-3" />
                      <div>
                        <h3 className="font-semibold text-gray-900">
                          Paseo para {request.petId?.name}
                        </h3>
                        <p className="text-sm text-gray-500">
                          Paseador: {request.walkerId?.name}
                        </p>
                      </div>
                    </div>
                    <span className={getStatusBadge(request.status)}>
                      {getStatusText(request.status)}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div>
                      <p className="text-gray-500">Fecha programada</p>
                      <p className="font-medium">
                        {new Date(request.scheduledAt).toLocaleDateString()}
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-500">Hora</p>
                      <p className="font-medium">
                        {new Date(request.scheduledAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-500">Duración</p>
                      <p className="font-medium">{request.durationMin} min</p>
                    </div>
                    <div>
                      <p className="text-gray-500">Creada</p>
                      <p className="font-medium">
                        {new Date(request.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>

                  {request.notes && (
                    <div className="mt-4">
                      <p className="text-sm text-gray-500">Notas:</p>
                      <p className="text-sm">{request.notes}</p>
                    </div>
                  )}

                  {request.walkerNotes && (
                    <div className="mt-4">
                      <p className="text-sm text-gray-500">Notas del paseador:</p>
                      <p className="text-sm">{request.walkerNotes}</p>
                    </div>
                  )}

                  {request.status === 'PENDING' && (
                    <div className="mt-4">
                      <button className="btn-outline text-red-600">
                        Cancelar
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="card p-12 text-center">
              <Calendar className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                No hay paseos {viewMode === 'day' ? 'este día' : 'este mes'}
              </h3>
              <p className="text-gray-500">
                {viewMode === 'day' 
                  ? 'Selecciona otro día en el calendario'
                  : 'Busca paseadores y solicita tu primer paseo'
                }
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default MisSolicitudes
