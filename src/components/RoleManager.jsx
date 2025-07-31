import { useState } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { ROLES, ROLE_LABELS, ROLE_COLORS, PERMISSIONS, hasPermission } from '../constants/roles'
import { Shield, Crown, Users, Settings, Check, X } from 'lucide-react'

const RoleManager = () => {
  const { userProfile, hasPermission: userHasPermission } = useAuth()
  const [selectedRole, setSelectedRole] = useState(ROLES.USER)

  // Solo administradores pueden acceder
  if (!userHasPermission('MANAGE_USERS')) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
        <div className="text-center">
          <Shield className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-800 mb-2">Acceso Denegado</h3>
          <p className="text-gray-600">No tienes permisos para gestionar roles de usuario</p>
        </div>
      </div>
    )
  }

  const getRolePermissions = (role) => {
    return Object.keys(PERMISSIONS).filter(permission => 
      PERMISSIONS[permission].includes(role)
    )
  }

  const getPermissionDescription = (permission) => {
    const descriptions = {
      MANAGE_USERS: 'Gestionar usuarios del sistema',
      VIEW_USERS: 'Ver lista de usuarios',
      CREATE_CONTENT: 'Crear contenido nuevo',
      EDIT_CONTENT: 'Editar contenido existente',
      DELETE_CONTENT: 'Eliminar contenido',
      PUBLISH_CONTENT: 'Publicar contenido',
      CREATE_EVENTS: 'Crear eventos',
      EDIT_EVENTS: 'Editar eventos',
      DELETE_EVENTS: 'Eliminar eventos',
      MANAGE_EVENTS: 'Gestionar eventos',
      CREATE_FIGURES: 'Crear figuras de baile',
      EDIT_FIGURES: 'Editar figuras',
      DELETE_FIGURES: 'Eliminar figuras',
      CREATE_LESSONS: 'Crear lecciones',
      EDIT_LESSONS: 'Editar lecciones',
      DELETE_LESSONS: 'Eliminar lecciones',
      ACCESS_PREMIUM_CONTENT: 'Acceso a contenido premium',
      ACCESS_BASIC_CONTENT: 'Acceso a contenido básico',
      ACCESS_PUBLIC_CONTENT: 'Acceso a contenido público',
      MANAGE_SYSTEM: 'Gestionar sistema',
      VIEW_ANALYTICS: 'Ver analíticas',
      MANAGE_CATEGORIES: 'Gestionar categorías',
      UPLOAD_VIDEOS: 'Subir videos',
      UPLOAD_IMAGES: 'Subir imágenes',
      COMMENT_CONTENT: 'Comentar contenido',
      RATE_CONTENT: 'Calificar contenido',
      SEND_NOTIFICATIONS: 'Enviar notificaciones',
      RECEIVE_NOTIFICATIONS: 'Recibir notificaciones'
    }
    return descriptions[permission] || permission.replace(/_/g, ' ')
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
      <div className="flex items-center space-x-3 mb-6">
        <Crown className="h-6 w-6 text-purple-500" />
        <h3 className="text-xl font-semibold text-gray-800">Gestión de Roles y Permisos</h3>
      </div>

      {/* Selector de roles */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-3">
          Seleccionar Rol para Ver Permisos:
        </label>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
          {Object.values(ROLES).map((role) => (
            <button
              key={role}
              onClick={() => setSelectedRole(role)}
              className={`p-3 rounded-lg border-2 transition-all ${
                selectedRole === role
                  ? 'border-purple-500 bg-purple-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <div className="text-center">
                <div className={`w-8 h-8 rounded-full mx-auto mb-2 flex items-center justify-center ${ROLE_COLORS[role]}`}>
                  <Shield className="h-4 w-4" />
                </div>
                <span className="text-xs font-medium text-gray-700">
                  {ROLE_LABELS[role]}
                </span>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Permisos del rol seleccionado */}
      <div className="mb-6">
        <h4 className="text-lg font-semibold text-gray-800 mb-4">
          Permisos del Rol: {ROLE_LABELS[selectedRole]}
        </h4>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {Object.keys(PERMISSIONS).map((permission) => {
            const hasThisPermission = PERMISSIONS[permission].includes(selectedRole)
            return (
              <div
                key={permission}
                className={`p-4 rounded-lg border ${
                  hasThisPermission
                    ? 'border-green-200 bg-green-50'
                    : 'border-gray-200 bg-gray-50'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-700">
                    {permission.replace(/_/g, ' ')}
                  </span>
                  {hasThisPermission ? (
                    <Check className="h-4 w-4 text-green-500" />
                  ) : (
                    <X className="h-4 w-4 text-gray-400" />
                  )}
                </div>
                <p className="text-xs text-gray-600">
                  {getPermissionDescription(permission)}
                </p>
              </div>
            )
          })}
        </div>
      </div>

      {/* Resumen de permisos */}
      <div className="bg-gray-50 rounded-lg p-4">
        <h5 className="text-sm font-semibold text-gray-700 mb-2">Resumen</h5>
        <div className="flex items-center space-x-4 text-sm text-gray-600">
          <span>Total de permisos: {Object.keys(PERMISSIONS).length}</span>
          <span>Permisos activos: {getRolePermissions(selectedRole).length}</span>
          <span>Permisos inactivos: {Object.keys(PERMISSIONS).length - getRolePermissions(selectedRole).length}</span>
        </div>
      </div>
    </div>
  )
}

export default RoleManager 