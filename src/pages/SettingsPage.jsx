import { useState } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { useTheme } from '../contexts/ThemeContext'
import { Settings, User, Bell, Shield, Palette, Lock, Save, Eye, EyeOff } from 'lucide-react'

const SettingsPage = () => {
  const { user, userProfile, updateUserProfile } = useAuth()
  const { theme, changeTheme } = useTheme()
  const [activeTab, setActiveTab] = useState('profile')
  const [showPassword, setShowPassword] = useState(false)
  const [formData, setFormData] = useState({
    displayName: userProfile?.displayName || '',
    bio: userProfile?.bio || '',
    location: userProfile?.location || '',
    phone: userProfile?.phone || ''
  })
  const [notifications, setNotifications] = useState({
    email: true,
    push: true,
    events: true,
    updates: false
  })

  const handleSaveProfile = async () => {
    try {
      await updateUserProfile(formData)
      alert('Perfil actualizado correctamente')
    } catch (error) {
      console.error('Error al actualizar perfil:', error)
      alert('Error al actualizar el perfil')
    }
  }

  const handleSaveNotifications = () => {
    // Aquí se guardarían las preferencias de notificaciones
    alert('Preferencias de notificaciones guardadas')
  }

  const tabs = [
    { id: 'profile', label: 'Perfil', icon: User },
    { id: 'notifications', label: 'Notificaciones', icon: Bell },
    { id: 'appearance', label: 'Apariencia', icon: Palette },
    { id: 'security', label: 'Seguridad', icon: Lock }
  ]

  if (!user) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-800 mb-4">Configuración</h1>
          <p className="text-gray-600">Debes iniciar sesión para acceder a la configuración</p>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="bg-white rounded-lg shadow-md border border-gray-200">
        {/* Header */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <Settings className="h-8 w-8 text-salsa-primary" />
            <h1 className="text-3xl font-bold text-gray-800">Configuración</h1>
          </div>
        </div>

        <div className="flex">
          {/* Sidebar */}
          <div className="w-64 border-r border-gray-200">
            <nav className="p-4">
              {tabs.map((tab) => {
                const Icon = tab.icon
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg mb-2 transition-colors ${
                      activeTab === tab.id
                        ? 'bg-salsa-primary text-white'
                        : 'text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    <Icon className="h-5 w-5" />
                    <span>{tab.label}</span>
                  </button>
                )
              })}
            </nav>
          </div>

          {/* Content */}
          <div className="flex-1 p-6">
            {/* Profile Tab */}
            {activeTab === 'profile' && (
              <div>
                <h2 className="text-2xl font-semibold text-gray-800 mb-6">Información del Perfil</h2>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Nombre de usuario</label>
                    <input
                      type="text"
                      value={formData.displayName}
                      onChange={(e) => setFormData({...formData, displayName: e.target.value})}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:border-blue-500 outline-none"
                      placeholder="Tu nombre de usuario"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Biografía</label>
                    <textarea
                      value={formData.bio}
                      onChange={(e) => setFormData({...formData, bio: e.target.value})}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:border-blue-500 outline-none min-h-[100px] resize-vertical"
                      placeholder="Cuéntanos sobre ti..."
                    />
                  </div>
                  
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Ubicación</label>
                      <input
                        type="text"
                        value={formData.location}
                        onChange={(e) => setFormData({...formData, location: e.target.value})}
                        className="w-full p-3 border border-gray-300 rounded-lg focus:border-blue-500 outline-none"
                        placeholder="Tu ubicación"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Teléfono</label>
                      <input
                        type="tel"
                        value={formData.phone}
                        onChange={(e) => setFormData({...formData, phone: e.target.value})}
                        className="w-full p-3 border border-gray-300 rounded-lg focus:border-blue-500 outline-none"
                        placeholder="Tu teléfono"
                      />
                    </div>
                  </div>
                  
                  <button
                    onClick={handleSaveProfile}
                    className="flex items-center space-x-2 px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                  >
                    <Save className="h-4 w-4" />
                    <span>Guardar Cambios</span>
                  </button>
                </div>
              </div>
            )}

            {/* Notifications Tab */}
            {activeTab === 'notifications' && (
              <div>
                <h2 className="text-2xl font-semibold text-gray-800 mb-6">Preferencias de Notificaciones</h2>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                    <div>
                      <h3 className="font-medium text-gray-800">Notificaciones por email</h3>
                      <p className="text-sm text-gray-600">Recibe actualizaciones importantes por email</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={notifications.email}
                        onChange={(e) => setNotifications({...notifications, email: e.target.checked})}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                    </label>
                  </div>
                  
                  <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                    <div>
                      <h3 className="font-medium text-gray-800">Notificaciones push</h3>
                      <p className="text-sm text-gray-600">Recibe notificaciones en tiempo real</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={notifications.push}
                        onChange={(e) => setNotifications({...notifications, push: e.target.checked})}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                    </label>
                  </div>
                  
                  <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                    <div>
                      <h3 className="font-medium text-gray-800">Eventos y talleres</h3>
                      <p className="text-sm text-gray-600">Notificaciones sobre nuevos eventos</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={notifications.events}
                        onChange={(e) => setNotifications({...notifications, events: e.target.checked})}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                    </label>
                  </div>
                  
                  <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                    <div>
                      <h3 className="font-medium text-gray-800">Actualizaciones del sistema</h3>
                      <p className="text-sm text-gray-600">Notificaciones sobre nuevas funcionalidades</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={notifications.updates}
                        onChange={(e) => setNotifications({...notifications, updates: e.target.checked})}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                    </label>
                  </div>
                  
                  <button
                    onClick={handleSaveNotifications}
                    className="flex items-center space-x-2 px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                  >
                    <Save className="h-4 w-4" />
                    <span>Guardar Preferencias</span>
                  </button>
                </div>
              </div>
            )}

            {/* Appearance Tab */}
            {activeTab === 'appearance' && (
              <div>
                <h2 className="text-2xl font-semibold text-gray-800 mb-6">Apariencia</h2>
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-medium text-gray-800 mb-4">Tema de la aplicación</h3>
                    <div className="grid md:grid-cols-3 gap-4">
                      {['light', 'dark', 'salsa'].map((themeOption) => (
                        <button
                          key={themeOption}
                          onClick={() => changeTheme(themeOption)}
                          className={`p-4 border-2 rounded-lg transition-colors ${
                            theme === themeOption
                              ? 'border-salsa-primary bg-salsa-light'
                              : 'border-gray-200 hover:border-gray-300'
                          }`}
                        >
                          <div className="text-center">
                            <div className={`w-8 h-8 rounded-full mx-auto mb-2 ${
                              themeOption === 'light' ? 'bg-gray-200' :
                              themeOption === 'dark' ? 'bg-gray-800' :
                              'bg-gradient-to-r from-pink-500 to-orange-500'
                            }`}></div>
                            <span className="font-medium capitalize">{themeOption}</span>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                  
                  <div>
                    <h3 className="text-lg font-medium text-gray-800 mb-4">Tamaño de fuente</h3>
                    <div className="flex items-center space-x-4">
                      <button className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">Pequeño</button>
                      <button className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">Mediano</button>
                      <button className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">Grande</button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Security Tab */}
            {activeTab === 'security' && (
              <div>
                <h2 className="text-2xl font-semibold text-gray-800 mb-6">Seguridad</h2>
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-medium text-gray-800 mb-4">Cambiar contraseña</h3>
                    <div className="space-y-4 max-w-md">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Contraseña actual</label>
                        <div className="relative">
                          <input
                            type={showPassword ? "text" : "password"}
                            className="w-full p-3 border border-gray-300 rounded-lg focus:border-blue-500 outline-none pr-10"
                            placeholder="Tu contraseña actual"
                          />
                          <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute inset-y-0 right-0 pr-3 flex items-center"
                          >
                            {showPassword ? <EyeOff className="h-5 w-5 text-gray-400" /> : <Eye className="h-5 w-5 text-gray-400" />}
                          </button>
                        </div>
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Nueva contraseña</label>
                        <input
                          type="password"
                          className="w-full p-3 border border-gray-300 rounded-lg focus:border-blue-500 outline-none"
                          placeholder="Nueva contraseña"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Confirmar nueva contraseña</label>
                        <input
                          type="password"
                          className="w-full p-3 border border-gray-300 rounded-lg focus:border-blue-500 outline-none"
                          placeholder="Confirmar nueva contraseña"
                        />
                      </div>
                      
                      <button className="flex items-center space-x-2 px-6 py-3 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors">
                        <Lock className="h-4 w-4" />
                        <span>Cambiar Contraseña</span>
                      </button>
                    </div>
                  </div>
                  
                  <div>
                    <h3 className="text-lg font-medium text-gray-800 mb-4">Sesiones activas</h3>
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <p className="text-sm text-gray-600">No hay sesiones activas para mostrar</p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default SettingsPage 