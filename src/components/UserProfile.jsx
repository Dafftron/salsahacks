import { useAuth } from '../contexts/AuthContext'
import { User, Mail, Calendar, LogOut, Settings } from 'lucide-react'

const UserProfile = () => {
  const { user, userProfile, logout } = useAuth()

  const handleLogout = async () => {
    try {
      await logout()
    } catch (error) {
      console.error('Error al cerrar sesión:', error)
    }
  }

  if (!user) {
    return null
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
      <div className="text-center mb-6">
        <div className="w-20 h-20 bg-gradient-to-r from-pink-500 to-orange-500 rounded-full flex items-center justify-center mx-auto mb-4">
          <User className="h-10 w-10 text-white" />
        </div>
        <h3 className="text-xl font-semibold text-gray-800">
          {userProfile?.displayName || user.displayName || 'Usuario'}
        </h3>
        <p className="text-gray-600">{user.email}</p>
      </div>

      <div className="space-y-4 mb-6">
        <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
          <Mail className="h-5 w-5 text-gray-500" />
          <div>
            <p className="text-sm font-medium text-gray-700">Email</p>
            <p className="text-sm text-gray-600">{user.email}</p>
          </div>
        </div>

        {userProfile?.createdAt && (
          <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
            <Calendar className="h-5 w-5 text-gray-500" />
            <div>
              <p className="text-sm font-medium text-gray-700">Miembro desde</p>
              <p className="text-sm text-gray-600">
                {new Date(userProfile.createdAt).toLocaleDateString('es-ES', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
              </p>
            </div>
          </div>
        )}

        {userProfile?.role && (
          <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
            <Settings className="h-5 w-5 text-gray-500" />
            <div>
              <p className="text-sm font-medium text-gray-700">Rol</p>
              <p className="text-sm text-gray-600 capitalize">{userProfile.role}</p>
            </div>
          </div>
        )}
      </div>

      <div className="space-y-3">
        <button className="w-full flex items-center justify-center space-x-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors">
          <Settings className="h-4 w-4" />
          <span>Configuración</span>
        </button>
        
        <button
          onClick={handleLogout}
          className="w-full flex items-center justify-center space-x-2 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
        >
          <LogOut className="h-4 w-4" />
          <span>Cerrar Sesión</span>
        </button>
      </div>
    </div>
  )
}

export default UserProfile 