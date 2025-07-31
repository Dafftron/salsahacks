import { useAuth } from '../contexts/AuthContext'
import { Link } from 'react-router-dom'
import { User, Mail, Calendar, LogOut, Settings, Shield, Crown, BookOpen, Star } from 'lucide-react'
import { ROLE_LABELS, ROLE_COLORS } from '../constants/roles'

const UserProfile = () => {
  const { user, userProfile, logout, hasPermission, getRolePermissions } = useAuth()

  const handleLogout = async () => {
    try {
      await logout()
    } catch (error) {
      console.error('Error al cerrar sesión:', error)
    }
  }

  if (!user) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
        <div className="text-center">
          <div className="w-20 h-20 bg-gray-300 rounded-full flex items-center justify-center mx-auto mb-4">
            <User className="h-10 w-10 text-gray-500" />
          </div>
          <h3 className="text-xl font-semibold text-gray-800 mb-2">No autenticado</h3>
          <p className="text-gray-600">Inicia sesión para ver tu perfil</p>
        </div>
      </div>
    )
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
        
        {/* Badge de rol */}
        {userProfile?.role && (
          <div className="mt-2">
            <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${ROLE_COLORS[userProfile.role] || 'bg-gray-500 text-white'}`}>
              <Shield className="h-3 w-3 mr-1" />
              {ROLE_LABELS[userProfile.role] || userProfile.role}
            </span>
          </div>
        )}
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
            <Shield className="h-5 w-5 text-gray-500" />
            <div>
              <p className="text-sm font-medium text-gray-700">Rol</p>
              <p className="text-sm text-gray-600 capitalize">{ROLE_LABELS[userProfile.role] || userProfile.role}</p>
            </div>
          </div>
        )}

        {/* Permisos del usuario */}
        {userProfile?.permissions && userProfile.permissions.length > 0 && (
          <div className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg">
            <Crown className="h-5 w-5 text-gray-500 mt-0.5" />
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-700 mb-2">Permisos principales</p>
              <div className="flex flex-wrap gap-1">
                {userProfile.permissions.slice(0, 3).map((permission, index) => (
                  <span key={index} className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded font-medium">
                    {permission.replace(/_/g, ' ')}
                  </span>
                ))}
                {userProfile.permissions.length > 3 && (
                  <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded font-medium">
                    +{userProfile.permissions.length - 3} más
                  </span>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="space-y-3">
        <Link to="/profile" className="w-full flex items-center justify-center space-x-2 px-4 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors">
          <User className="h-4 w-4" />
          <span>Mi Perfil</span>
        </Link>
        
        <Link to="/settings" className="w-full flex items-center justify-center space-x-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors">
          <Settings className="h-4 w-4" />
          <span>Configuración</span>
        </Link>
        
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