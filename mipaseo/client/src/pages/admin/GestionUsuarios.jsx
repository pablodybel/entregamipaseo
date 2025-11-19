import { useState, useEffect } from 'react'
import { useFetch } from '../../hooks/useFetch'
import { useMutation } from '../../hooks/useMutation'
import { useSearchParams } from 'react-router-dom'
import { Search, User, Dog, Ban, CheckCircle, Eye, Trash2 } from 'lucide-react'
import { adminService } from '../../services/admin'
import toast from 'react-hot-toast'
import { Link } from 'react-router-dom'

const GestionUsuarios = () => {
  const [searchParams, setSearchParams] = useSearchParams()
  
  // Leer parámetros de la URL
  const roleFromUrl = searchParams.get('role') || 'ALL'
  
  const [filters, setFilters] = useState({
    role: roleFromUrl,
    isActive: undefined,
    search: '',
    page: 1,
    limit: 20
  })

  // Actualizar filtros cuando cambien los parámetros de la URL
  useEffect(() => {
    const roleFromUrl = searchParams.get('role') || 'ALL'
    setFilters(prev => ({
      ...prev,
      role: roleFromUrl,
      page: 1 // Resetear página cuando cambia el filtro
    }))
  }, [searchParams])

  const { data, isLoading, refetch } = useFetch(
    ['admin-users', JSON.stringify(filters)],
    () => adminService.getUsers(filters)
  )

  const toggleActiveMutation = useMutation(
    (userId) => adminService.toggleUserActive(userId),
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

  const deleteUserMutation = useMutation(
    (userId) => adminService.deleteUser(userId),
    {
      onSuccess: () => {
        refetch()
        toast.success('Usuario eliminado exitosamente')
      },
      onError: (error) => {
        toast.error(error.response?.data?.error || 'Error al eliminar el usuario')
      }
    }
  )

  const handleDelete = (userId, userName) => {
    if (window.confirm(`¿Estás seguro de que deseas eliminar permanentemente a ${userName}? Esta acción no se puede deshacer.`)) {
      deleteUserMutation.mutate(userId)
    }
  }

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value, page: 1 }))
    
    // Actualizar URL cuando cambia el filtro de rol
    if (key === 'role') {
      const newSearchParams = new URLSearchParams(searchParams)
      if (value === 'ALL') {
        newSearchParams.delete('role')
      } else {
        newSearchParams.set('role', value)
      }
      setSearchParams(newSearchParams)
    }
  }

  const handleSearch = (e) => {
    e.preventDefault()
    setFilters(prev => ({ ...prev, page: 1 }))
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
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${badges[role]}`}>
        {labels[role]}
      </span>
    )
  }

  return (
    <div className="px-4 py-6 sm:px-0">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Gestión de Usuarios</h1>
        <p className="text-gray-600 mt-2">Administra todos los usuarios de la plataforma</p>
      </div>

      {/* Filtros */}
      <div className="card p-6 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Búsqueda */}
          <form onSubmit={handleSearch} className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Buscar
            </label>
            <div className="relative">
              <input
                type="text"
                className="input pl-10"
                placeholder="Nombre o email..."
                value={filters.search}
                onChange={(e) => handleFilterChange('search', e.target.value)}
              />
              <Search className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
            </div>
          </form>

          {/* Filtro por Rol */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Rol
            </label>
            <select
              className="input"
              value={filters.role}
              onChange={(e) => handleFilterChange('role', e.target.value)}
            >
              <option value="ALL">Todos</option>
              <option value="OWNER">Dueños</option>
              <option value="WALKER">Paseadores</option>
            </select>
          </div>

          {/* Filtro por Estado */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Estado
            </label>
            <select
              className="input"
              value={filters.isActive === undefined ? 'ALL' : filters.isActive}
              onChange={(e) => {
                const value = e.target.value === 'ALL' ? undefined : e.target.value === 'true'
                handleFilterChange('isActive', value)
              }}
            >
              <option value="ALL">Todos</option>
              <option value="true">Activos</option>
              <option value="false">Suspendidos</option>
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
          <div className="card overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Usuario
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Rol
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Contacto
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Información
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Estado
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Acciones
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {data?.users?.map((user) => (
                    <tr key={user._id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          {user.avatarUrl ? (
                            <img
                              src={`${import.meta.env.VITE_API_BASE?.replace('/api/v1', '') || 'http://localhost:4000'}${user.avatarUrl}`}
                              alt={user.name}
                              className="h-10 w-10 rounded-full object-cover"
                            />
                          ) : (
                            <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center">
                              <User className="h-6 w-6 text-gray-500" />
                            </div>
                          )}
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">{user.name}</div>
                            <div className="text-sm text-gray-500">{user.email}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {getRoleBadge(user.role)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{user.phone}</div>
                        <div className="text-sm text-gray-500">{user.neighborhood || 'N/A'}</div>
                      </td>
                      <td className="px-6 py-4">
                        {user.role === 'WALKER' && user.stats && (
                          <div className="text-sm">
                            <div className="text-gray-900 font-medium">
                              {user.stats.completedWalks} paseos completados
                            </div>
                            <div className="text-gray-500">
                              Rating: {user.stats.averageRating} ({user.stats.totalReviews} reseñas)
                            </div>
                          </div>
                        )}
                        {user.role === 'OWNER' && (
                          <div className="text-sm">
                            <div className="text-gray-900 font-medium mb-2">
                              {user.stats?.totalPets || 0} mascota{user.stats?.totalPets !== 1 ? 's' : ''}
                            </div>
                            {user.pets && user.pets.length > 0 && (
                              <div className="space-y-1">
                                {user.pets.map((pet) => (
                                  <div key={pet._id} className="flex items-center gap-2 text-gray-600">
                                    <Dog className="h-3 w-3" />
                                    <span className="text-xs">{pet.name} ({pet.breed})</span>
                                  </div>
                                ))}
                                {user.stats?.totalPets > user.pets.length && (
                                  <span className="text-xs text-gray-400">
                                    +{user.stats.totalPets - user.pets.length} más
                                  </span>
                                )}
                              </div>
                            )}
                            {(!user.pets || user.pets.length === 0) && (
                              <span className="text-xs text-gray-400">Sin mascotas registradas</span>
                            )}
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {user.isActive ? (
                          <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                            Activo
                          </span>
                        ) : (
                          <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-red-100 text-red-800">
                            Suspendido
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex justify-end space-x-2">
                          <Link
                            to={`/admin/usuarios/${user._id}`}
                            className="text-primary-600 hover:text-primary-900"
                            title="Ver detalles"
                          >
                            <Eye className="h-5 w-5" />
                          </Link>
                          <button
                            onClick={() => toggleActiveMutation.mutate(user._id)}
                            className={`${
                              user.isActive
                                ? 'text-yellow-600 hover:text-yellow-900'
                                : 'text-green-600 hover:text-green-900'
                            }`}
                            disabled={toggleActiveMutation.isLoading}
                            title={user.isActive ? 'Suspender usuario' : 'Activar usuario'}
                          >
                            {user.isActive ? (
                              <Ban className="h-5 w-5" />
                            ) : (
                              <CheckCircle className="h-5 w-5" />
                            )}
                          </button>
                          <button
                            onClick={() => handleDelete(user._id, user.name)}
                            className="text-red-600 hover:text-red-900"
                            disabled={deleteUserMutation.isLoading}
                            title="Eliminar usuario"
                          >
                            <Trash2 className="h-5 w-5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Paginación */}
          {data?.pagination && (
            <div className="card p-4 mt-6">
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="text-sm text-gray-700">
                  Mostrando <span className="font-semibold">{data.users.length}</span> de{' '}
                  <span className="font-semibold">{data.pagination.total}</span> usuarios
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
    </div>
  )
}

export default GestionUsuarios

