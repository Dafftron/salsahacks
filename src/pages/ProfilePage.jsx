import { useState } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { User, Mail, Calendar, Shield, Crown, Settings, Save, Edit, X } from 'lucide-react'
import { ROLE_LABELS, ROLE_COLORS } from '../constants/roles'

const ProfilePage = () => {
  const { user, userProfile, updateUserProfile } = useAuth()
  const [isEditing, setIsEditing] = useState(false)
  const [formData, setFormData] = useState({
    displayName: userProfile?.displayName || '',
    bio: userProfile?.bio || '',
    location: userProfile?.location || '',
    phone: userProfile?.phone || ''
  })

  const handleSave = async () => {
    try {
      await updateUserProfile(formData)
      setIsEditing(false)
    } catch (error) {
      console.error('Error al actualizar perfil:', error)
    }
  }

  const handleCancel = () => {
    setFormData({
      displayName: userProfile?.displayName || '',
      bio: userProfile?.bio || '',
      location: userProfile?.location || '',
      phone: userProfile?.phone || ''
    })
    setIsEditing(false)
  }

  if (!user) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-800 mb-4">Perfil de Usuario</h1>
          <p className="text-gray-600">Debes iniciar sesión para ver tu perfil</p>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="bg-white rounded-lg shadow-md border border-gray-200">
        {/* Header */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex justify-between items-center">
            <h1 className="text-3xl font-bold text-gray-800">Mi Perfil</h1>
            <div className="flex space-x-2">
              {!isEditing ? (
                <button
                  onClick={() => setIsEditing(true)}
                  className="flex items-center space-x-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                >
                  <Edit className="h-4 w-4" />
                  <span>Editar</span>
                </button>
              ) : (
                <>
                  <button
                    onClick={handleSave}
                    className="flex items-center space-x-2 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
                  >
                    <Save className="h-4 w-4" />
                    <span>Guardar</span>
                  </button>
                  <button
                    onClick={handleCancel}
                    className="flex items-center space-x-2 px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
                  >
                    <X className="h-4 w-4" />
                    <span>Cancelar</span>
                  </button>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Profile Content */}
        <div className="p-6">
          <div className="grid md:grid-cols-3 gap-8">
            {/* Left Column - Avatar and Basic Info */}
            <div className="md:col-span-1">
              <div className="text-center">
                <div className="w-32 h-32 bg-gradient-to-r from-pink-500 to-orange-500 rounded-full flex items-center justify-center mx-auto mb-4">
                  <User className="h-16 w-16 text-white" />
                </div>
                
                {!isEditing ? (
                  <h2 className="text-2xl font-semibold text-gray-800 mb-2">
                    {userProfile?.displayName || user.displayName || 'Usuario'}
                  </h2>
                ) : (
                  <input
                    type="text"
                    value={formData.displayName}
                    onChange={(e) => setFormData({...formData, displayName: e.target.value})}
                    className="text-2xl font-semibold text-gray-800 mb-2 bg-transparent border-b border-gray-300 focus:border-blue-500 outline-none text-center"
                    placeholder="Tu nombre"
                  />
                )}
                
                <p className="text-gray-600 mb-4">{user.email}</p>
                
                {/* Role Badge */}
                {userProfile?.role && (
                  <div className="mb-4">
                    <span className={`inline-flex items-center px-4 py-2 rounded-full text-sm font-medium ${ROLE_COLORS[userProfile.role] || 'bg-gray-500 text-white'}`}>
                      <Shield className="h-4 w-4 mr-2" />
                      {ROLE_LABELS[userProfile.role] || userProfile.role}
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Right Column - Details */}
            <div className="md:col-span-2">
              <div className="space-y-6">
                {/* Basic Information */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                    <User className="h-5 w-5 mr-2" />
                    Información Básica
                  </h3>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                      <div className="flex items-center space-x-2 p-3 bg-gray-50 rounded-lg">
                        <Mail className="h-4 w-4 text-gray-500" />
                        <span className="text-gray-700">{user.email}</span>
                      </div>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Miembro desde</label>
                      <div className="flex items-center space-x-2 p-3 bg-gray-50 rounded-lg">
                        <Calendar className="h-4 w-4 text-gray-500" />
                        <span className="text-gray-700">
                          {userProfile?.createdAt 
                            ? new Date(userProfile.createdAt).toLocaleDateString('es-ES', {
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric'
                              })
                            : 'Fecha no disponible'
                          }
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Additional Information */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                    <Settings className="h-5 w-5 mr-2" />
                    Información Adicional
                  </h3>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Ubicación</label>
                      {!isEditing ? (
                        <div className="p-3 bg-gray-50 rounded-lg">
                          <span className="text-gray-700">
                            {userProfile?.location || 'No especificada'}
                          </span>
                        </div>
                      ) : (
                        <input
                          type="text"
                          value={formData.location}
                          onChange={(e) => setFormData({...formData, location: e.target.value})}
                          className="w-full p-3 border border-gray-300 rounded-lg focus:border-blue-500 outline-none"
                          placeholder="Tu ubicación"
                        />
                      )}
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Teléfono</label>
                      {!isEditing ? (
                        <div className="p-3 bg-gray-50 rounded-lg">
                          <span className="text-gray-700">
                            {userProfile?.phone || 'No especificado'}
                          </span>
                        </div>
                      ) : (
                        <input
                          type="tel"
                          value={formData.phone}
                          onChange={(e) => setFormData({...formData, phone: e.target.value})}
                          className="w-full p-3 border border-gray-300 rounded-lg focus:border-blue-500 outline-none"
                          placeholder="Tu teléfono"
                        />
                      )}
                    </div>
                  </div>
                  
                  <div className="mt-4">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Biografía</label>
                    {!isEditing ? (
                      <div className="p-3 bg-gray-50 rounded-lg min-h-[100px]">
                        <span className="text-gray-700">
                          {userProfile?.bio || 'No hay biografía disponible'}
                        </span>
                      </div>
                    ) : (
                      <textarea
                        value={formData.bio}
                        onChange={(e) => setFormData({...formData, bio: e.target.value})}
                        className="w-full p-3 border border-gray-300 rounded-lg focus:border-blue-500 outline-none min-h-[100px] resize-vertical"
                        placeholder="Cuéntanos sobre ti..."
                      />
                    )}
                  </div>
                </div>

                {/* Permissions */}
                {userProfile?.permissions && userProfile.permissions.length > 0 && (
                  <div>
                    <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                      <Crown className="h-5 w-5 mr-2" />
                      Mis Permisos
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {userProfile.permissions.map((permission, index) => (
                        <span key={index} className="px-3 py-1 bg-blue-100 text-blue-700 text-sm rounded-full font-medium">
                          {permission.replace(/_/g, ' ')}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ProfilePage 