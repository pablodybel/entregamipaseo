import { useFetch } from '../../hooks/useFetch'
import { Users, Dog, UserCheck } from 'lucide-react'
import { adminService } from '../../services/admin'
import { Link } from 'react-router-dom'

const DashboardAdmin = () => {
  const { data: stats, isLoading } = useFetch(
    ['admin-dashboard-stats'],
    () => adminService.getDashboardStats()
  )

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  const statCards = [
    {
      title: 'Total Usuarios',
      value: stats?.users?.total || 0,
      icon: Users,
      color: 'bg-blue-500',
      subtitle: `${stats?.users?.owners || 0} dueños, ${stats?.users?.walkers || 0} paseadores`,
      link: '/admin/usuarios'
    },
    {
      title: 'Dueños de Mascotas',
      value: stats?.users?.owners || 0,
      icon: UserCheck,
      color: 'bg-purple-500',
      subtitle: `${stats?.platform?.totalPets || 0} mascotas registradas`,
      link: '/admin/usuarios?role=OWNER'
    },
    {
      title: 'Paseadores',
      value: stats?.users?.walkers || 0,
      icon: Dog,
      color: 'bg-green-500',
      subtitle: 'Paseadores activos',
      link: '/admin/usuarios?role=WALKER'
    }
  ]

  return (
    <div className="px-4 py-6 sm:px-0">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Dashboard de Administración</h1>
        <p className="text-gray-600 mt-2">Gestión de usuarios y paseadores</p>
      </div>

      {/* Estadísticas Principales */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        {statCards.map((stat, index) => (
          <Link key={index} to={stat.link} className="card p-6 hover:shadow-lg transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 mb-1">{stat.title}</p>
                <p className="text-3xl font-bold text-gray-900">{stat.value}</p>
                <p className="text-sm text-gray-500 mt-1">{stat.subtitle}</p>
              </div>
              <div className={`${stat.color} p-3 rounded-lg`}>
                <stat.icon className="h-8 w-8 text-white" />
              </div>
            </div>
          </Link>
        ))}
      </div>

      {/* Accesos Rápidos */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Usuarios Registrados</h2>
          <p className="text-gray-600 mb-4">
            Gestiona todos los usuarios registrados y sus mascotas.
          </p>
          <Link
            to="/admin/usuarios"
            className="inline-flex items-center px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
          >
            <Users className="h-5 w-5 mr-2" />
            Ver Usuarios
          </Link>
        </div>

        <div className="card p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Paseadores</h2>
          <p className="text-gray-600 mb-4">
            Administra los paseadores registrados. 
          </p>
          <Link
            to="/admin/usuarios?role=WALKER"
            className="inline-flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
          >
            <Dog className="h-5 w-5 mr-2" />
            Ver Paseadores
          </Link>
        </div>
      </div>
    </div>
  )
}

export default DashboardAdmin




