import { useState } from 'react'
import { Users, Video, BarChart3, Settings, Shield, Activity } from 'lucide-react'

const AdminPage = () => {
  const [activeTab, setActiveTab] = useState('dashboard')

  const stats = [
    { title: 'Usuarios Totales', value: '1,234', icon: Users, color: 'text-blue-600' },
    { title: 'Videos Subidos', value: '567', icon: Video, color: 'text-green-600' },
    { title: 'Eventos Activos', value: '23', icon: Activity, color: 'text-purple-600' },
    { title: 'Visitas Hoy', value: '2,891', icon: BarChart3, color: 'text-orange-600' }
  ]

  const recentUsers = [
    { id: 1, name: 'Ana García', email: 'ana@email.com', role: 'Usuario', status: 'Activo', date: '2025-01-27' },
    { id: 2, name: 'Carlos López', email: 'carlos@email.com', role: 'Admin', status: 'Activo', date: '2025-01-26' },
    { id: 3, name: 'María Rodríguez', email: 'maria@email.com', role: 'Usuario', status: 'Inactivo', date: '2025-01-25' }
  ]

  const recentVideos = [
    { id: 1, title: 'Giro Básico de Salsa', author: 'Ana García', views: 1250, status: 'Aprobado', date: '2025-01-27' },
    { id: 2, title: 'Secuencia Avanzada', author: 'Carlos López', views: 890, status: 'Pendiente', date: '2025-01-26' },
    { id: 3, title: 'Técnica de Leading', author: 'María Rodríguez', views: 567, status: 'Aprobado', date: '2025-01-25' }
  ]

  return (
    <div className="max-w-6xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-salsa-primary mb-2">Panel de Administración</h1>
        <p className="text-gray-600">Gestiona usuarios, contenido y configuración del sistema</p>
      </div>

      {/* Tabs */}
      <div className="flex space-x-1 mb-6 bg-gray-100 p-1 rounded-lg">
        <button
          onClick={() => setActiveTab('dashboard')}
          className={`flex items-center space-x-2 px-4 py-2 rounded-md transition-colors ${
            activeTab === 'dashboard'
              ? 'bg-white text-salsa-primary shadow-sm'
              : 'text-gray-600 hover:text-salsa-primary'
          }`}
        >
          <BarChart3 className="h-4 w-4" />
          <span>Dashboard</span>
        </button>
        <button
          onClick={() => setActiveTab('users')}
          className={`flex items-center space-x-2 px-4 py-2 rounded-md transition-colors ${
            activeTab === 'users'
              ? 'bg-white text-salsa-primary shadow-sm'
              : 'text-gray-600 hover:text-salsa-primary'
          }`}
        >
          <Users className="h-4 w-4" />
          <span>Usuarios</span>
        </button>
        <button
          onClick={() => setActiveTab('content')}
          className={`flex items-center space-x-2 px-4 py-2 rounded-md transition-colors ${
            activeTab === 'content'
              ? 'bg-white text-salsa-primary shadow-sm'
              : 'text-gray-600 hover:text-salsa-primary'
          }`}
        >
          <Video className="h-4 w-4" />
          <span>Contenido</span>
        </button>
        <button
          onClick={() => setActiveTab('settings')}
          className={`flex items-center space-x-2 px-4 py-2 rounded-md transition-colors ${
            activeTab === 'settings'
              ? 'bg-white text-salsa-primary shadow-sm'
              : 'text-gray-600 hover:text-salsa-primary'
          }`}
        >
          <Settings className="h-4 w-4" />
          <span>Configuración</span>
        </button>
      </div>

      {/* Content */}
      {activeTab === 'dashboard' && (
        <div className="space-y-6">
          {/* Stats Grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {stats.map((stat) => (
              <div key={stat.title} className="card p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">{stat.title}</p>
                    <p className="text-2xl font-bold text-gray-800">{stat.value}</p>
                  </div>
                  <div className={`${stat.color} p-3 rounded-lg bg-gray-100`}>
                    <stat.icon className="h-6 w-6" />
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Recent Activity */}
          <div className="grid md:grid-cols-2 gap-6">
            <div className="card p-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Usuarios Recientes</h3>
              <div className="space-y-3">
                {recentUsers.map((user) => (
                  <div key={user.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div>
                      <p className="font-medium text-gray-800">{user.name}</p>
                      <p className="text-sm text-gray-600">{user.email}</p>
                    </div>
                    <div className="text-right">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        user.status === 'Activo' ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'
                      }`}>
                        {user.status}
                      </span>
                      <p className="text-xs text-gray-500 mt-1">{user.date}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="card p-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Videos Recientes</h3>
              <div className="space-y-3">
                {recentVideos.map((video) => (
                  <div key={video.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div>
                      <p className="font-medium text-gray-800">{video.title}</p>
                      <p className="text-sm text-gray-600">por {video.author}</p>
                    </div>
                    <div className="text-right">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        video.status === 'Aprobado' ? 'bg-green-100 text-green-600' : 'bg-yellow-100 text-yellow-600'
                      }`}>
                        {video.status}
                      </span>
                      <p className="text-xs text-gray-500 mt-1">{video.views} vistas</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'users' && (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-semibold text-gray-800">Gestión de Usuarios</h2>
            <button className="btn-primary">Nuevo Usuario</button>
          </div>
          <div className="card p-6">
            <p className="text-gray-600">Aquí irá la tabla de usuarios con opciones de edición, eliminación y gestión de roles.</p>
          </div>
        </div>
      )}

      {activeTab === 'content' && (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-semibold text-gray-800">Gestión de Contenido</h2>
            <button className="btn-primary">Revisar Contenido</button>
          </div>
          <div className="card p-6">
            <p className="text-gray-600">Aquí irá la gestión de videos, aprobación de contenido y moderación.</p>
          </div>
        </div>
      )}

      {activeTab === 'settings' && (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-semibold text-gray-800">Configuración del Sistema</h2>
            <button className="btn-primary">Guardar Cambios</button>
          </div>
          <div className="card p-6">
            <p className="text-gray-600">Aquí irán las configuraciones del sistema, categorías, permisos y ajustes generales.</p>
          </div>
        </div>
      )}
    </div>
  )
}

export default AdminPage 