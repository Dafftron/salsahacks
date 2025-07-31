import { useState, useRef } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { User, Mail, Calendar, Shield, Crown, Settings, Save, Edit, X, Camera, Upload, Zap } from 'lucide-react'
import { ROLE_LABELS, ROLE_COLORS, ROLES } from '../constants/roles'

const ProfilePage = () => {
  const { user, userProfile, updateUserProfile, getUserUsername, getUserPhoto } = useAuth()
  const [isEditing, setIsEditing] = useState(false)
  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false)
  const fileInputRef = useRef(null)
  const [formData, setFormData] = useState({
    displayName: userProfile?.displayName || '',
    bio: userProfile?.bio || '',
    location: userProfile?.location || '',
    phone: userProfile?.phone || '',
    photoURL: userProfile?.photoURL || '',
    username: userProfile?.username || ''
  })

  const handlePhotoUpload = async (event) => {
    const file = event.target.files[0]
    if (!file) return

    // Validar tipo de archivo
    if (!file.type.startsWith('image/')) {
      alert('Por favor selecciona una imagen válida')
      return
    }

    // Validar tamaño (máximo 5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert('La imagen debe ser menor a 5MB')
      return
    }

    setIsUploadingPhoto(true)
    try {
      // Aquí normalmente subirías la imagen a Firebase Storage
      // Por ahora simulamos la subida
      const reader = new FileReader()
      reader.onload = (e) => {
        setFormData({ ...formData, photoURL: e.target.result })
        setIsUploadingPhoto(false)
      }
      reader.readAsDataURL(file)
    } catch (error) {
      console.error('Error al subir foto:', error)
      setIsUploadingPhoto(false)
    }
  }

  const handleSave = async () => {
    try {
      const result = await updateUserProfile(formData)
      if (result.success) {
        setIsEditing(false)
      } else {
        alert('Error al actualizar perfil: ' + result.error)
      }
    } catch (error) {
      console.error('Error al actualizar perfil:', error)
      alert('Error al actualizar perfil')
    }
  }

  const handleCancel = () => {
    setFormData({
      displayName: userProfile?.displayName || '',
      bio: userProfile?.bio || '',
      location: userProfile?.location || '',
      phone: userProfile?.phone || '',
      photoURL: userProfile?.photoURL || '',
      username: userProfile?.username || ''
    })
    setIsEditing(false)
  }

  // Función para actualizar el rol de David a Super Admin
  const updateToSuperAdmin = async () => {
    try {
      console.log('Actualizando rol a Super Admin...')
      console.log('Rol actual:', userProfile?.role)
      console.log('Email:', user.email)
      
      const result = await updateUserProfile({
        ...userProfile,
        role: ROLES.SUPER_ADMIN,
        permissions: ['MANAGE_USERS', 'MANAGE_SYSTEM', 'ACCESS_PREMIUM_CONTENT', 'UPLOAD_VIDEOS', 'DELETE_CONTENT']
      })
      
      if (result.success) {
        alert('¡Rol actualizado a Super Administrador! Recargando página...')
        setTimeout(() => {
          window.location.reload()
        }, 1000)
      } else {
        alert('Error al actualizar rol: ' + result.error)
      }
    } catch (error) {
      console.error('Error al actualizar rol:', error)
      alert('Error al actualizar rol: ' + error.message)
    }
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
              {/* Información de debug para David */}
              {user.email === 'david_exile_92@hotmail.com' && (
                <div className="text-xs text-gray-500 mr-4">
                  <p>Email: {user.email}</p>
                  <p>Rol actual: {userProfile?.role || 'No definido'}</p>
                  <p>Es Super Admin: {userProfile?.role === ROLES.SUPER_ADMIN ? 'SÍ' : 'NO'}</p>
                </div>
              )}
              
              {/* Botón temporal para David */}
              {user.email === 'david_exile_92@hotmail.com' && userProfile?.role !== ROLES.SUPER_ADMIN && (
                <button
                  onClick={updateToSuperAdmin}
                  className="flex items-center space-x-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                >
                  <Zap className="h-4 w-4" />
                  <span>Actualizar a Super Admin</span>
                </button>
              )}
              
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
                {/* Profile Photo */}
                <div className="relative inline-block mb-4">
                  <div className="w-32 h-32 bg-gradient-to-r from-pink-500 to-orange-500 rounded-full flex items-center justify-center mx-auto overflow-hidden">
                    {getUserPhoto() ? (
                      <img 
                        src={getUserPhoto()} 
                        alt="Foto de perfil" 
                        className="w-32 h-32 object-cover"
                      />
                    ) : (
                      <User className="h-16 w-16 text-white" />
                    )}
                  </div>
                  
                  {/* Photo Upload Button */}
                  {isEditing && (
                    <div className="absolute bottom-0 right-0">
                      <button
                        onClick={() => fileInputRef.current?.click()}
                        disabled={isUploadingPhoto}
                        className="w-10 h-10 bg-blue-500 text-white rounded-full flex items-center justify-center hover:bg-blue-600 transition-colors shadow-lg"
                      >
                        {isUploadingPhoto ? (
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        ) : (
                          <Camera className="h-4 w-4" />
                        )}
                      </button>
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        onChange={handlePhotoUpload}
                        className="hidden"
                      />
                    </div>
                  )}
                </div>
                
                {/* Display Name */}
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

                {/* Username Section */}
                <div className="mb-4">
                  <h3 className="text-sm font-medium text-gray-700 mb-2">Nombre de usuario</h3>
                  {!isEditing ? (
                    <div className="p-3 bg-gray-50 rounded-lg">
                      <span className="text-gray-700 font-medium">
                        {getUserUsername()}
                      </span>
                    </div>
                  ) : (
                    <input
                      type="text"
                      value={formData.username}
                      onChange={(e) => setFormData({...formData, username: e.target.value})}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:border-blue-500 outline-none text-center"
                      placeholder="nombreusuario"
                      pattern="[a-zA-Z0-9_]+"
                      title="Solo letras, números y guiones bajos"
                    />
                  )}
                </div>
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