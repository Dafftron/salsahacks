import { Link, useLocation } from 'react-router-dom'
import { useTheme } from '../../contexts/ThemeContext'
import { useAuth } from '../../contexts/AuthContext'
import { Music, Sun, Moon, User, Bell, Heart, Search, Shield } from 'lucide-react'
import { ROLE_LABELS, ROLE_COLORS } from '../../constants/roles'

const Navigation = () => {
  const location = useLocation()
  const { theme, changeTheme } = useTheme()
  const { user, userProfile, isAuthenticated, logout, hasPermission, getUserUsername, getUserPhoto } = useAuth()

  const navItems = [
    { path: '/', label: 'Inicio' },
    { path: '/figuras', label: 'Figuras' },
    { path: '/escuela', label: 'Escuela' },
    { path: '/eventos', label: 'Eventos' },
    { path: '/categorias', label: 'Categorías' },
    { path: '/notas', label: 'Notas' }
  ]

  // Agregar enlace de administración si el usuario tiene permisos
  if (hasPermission('MANAGE_USERS')) {
    navItems.push({ path: '/admin', label: 'Admin' })
  }

  const toggleTheme = () => {
    const themes = ['light', 'dark', 'salsa']
    const currentIndex = themes.indexOf(theme)
    const nextIndex = (currentIndex + 1) % themes.length
    changeTheme(themes[nextIndex])
  }

  return (
    <nav className="bg-white shadow-lg border-b-2 border-salsa-primary">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2">
            <Music className="h-8 w-8 text-salsa-primary" />
            <span className="text-2xl font-bold text-salsa-primary">SalsaHacks</span>
          </Link>

          {/* Navigation Links */}
          <div className="hidden md:flex space-x-8">
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  location.pathname === item.path
                    ? 'text-salsa-primary bg-salsa-light'
                    : 'text-gray-700 hover:text-salsa-primary hover:bg-salsa-light'
                }`}
              >
                {item.label}
              </Link>
            ))}
          </div>

          {/* Right Side Icons */}
          <div className="flex items-center space-x-4">
            {/* Search */}
            <button className="p-2 text-gray-600 hover:text-salsa-primary transition-colors">
              <Search className="h-5 w-5" />
            </button>

            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              className="p-2 text-gray-600 hover:text-salsa-primary transition-colors"
            >
              {theme === 'dark' ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
            </button>

            {/* Notifications */}
            <button className="p-2 text-gray-600 hover:text-salsa-primary transition-colors relative">
              <Bell className="h-5 w-5" />
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-4 w-4 flex items-center justify-center">
                3
              </span>
            </button>

            {/* Favorites */}
            <button className="p-2 text-gray-600 hover:text-salsa-primary transition-colors">
              <Heart className="h-5 w-5" />
            </button>

            {/* User Profile */}
            {isAuthenticated ? (
              <div className="relative group">
                <button className="flex items-center space-x-3 p-2 text-gray-600 hover:text-salsa-primary transition-colors rounded-lg hover:bg-gray-100">
                  {/* Profile Photo */}
                  <div className="w-8 h-8 bg-gradient-to-r from-pink-500 to-orange-500 rounded-full flex items-center justify-center">
                    {getUserPhoto() ? (
                      <img 
                        src={getUserPhoto()} 
                        alt="Foto de perfil" 
                        className="w-8 h-8 rounded-full object-cover"
                      />
                    ) : (
                      <User className="h-4 w-4 text-white" />
                    )}
                  </div>
                  
                  {/* User Info */}
                  <div className="flex flex-col items-start">
                    <span className="text-sm font-medium text-gray-700">
                      {getUserUsername()}
                    </span>
                    {userProfile?.role && (
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${ROLE_COLORS[userProfile.role] || 'bg-gray-500 text-white'}`}>
                        <Shield className="h-3 w-3 mr-1" />
                        {ROLE_LABELS[userProfile.role] || userProfile.role}
                      </span>
                    )}
                  </div>
                </button>
                
                {/* Dropdown Menu */}
                <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg border border-gray-200 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                  <div className="py-2">
                    {/* User Info in Dropdown */}
                    <div className="px-4 py-3 border-b border-gray-100">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-gradient-to-r from-pink-500 to-orange-500 rounded-full flex items-center justify-center">
                          {getUserPhoto() ? (
                            <img 
                              src={getUserPhoto()} 
                              alt="Foto de perfil" 
                              className="w-10 h-10 rounded-full object-cover"
                            />
                          ) : (
                            <User className="h-5 w-5 text-white" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900 truncate">
                            {userProfile?.displayName || user?.displayName || 'Usuario'}
                          </p>
                          <p className="text-xs text-gray-500 truncate">{getUserUsername()}</p>
                          {userProfile?.role && (
                            <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium mt-1 ${ROLE_COLORS[userProfile.role] || 'bg-gray-500 text-white'}`}>
                              <Shield className="h-3 w-3 mr-1" />
                              {ROLE_LABELS[userProfile.role] || userProfile.role}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    
                    <Link
                      to="/profile"
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                    >
                      Mi Perfil
                    </Link>
                    <Link
                      to="/settings"
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                    >
                      Configuración
                    </Link>
                    <button
                      onClick={async () => {
                        try {
                          await logout()
                        } catch (error) {
                          console.error('Error al cerrar sesión:', error)
                        }
                      }}
                      className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
                    >
                      Cerrar Sesión
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <Link
                to="/auth"
                className="px-4 py-2 bg-gradient-to-r from-pink-500 to-orange-500 text-white rounded-lg hover:from-pink-600 hover:to-orange-600 transition-all duration-200 font-medium"
              >
                Iniciar Sesión
              </Link>
            )}
          </div>
        </div>
      </div>
    </nav>
  )
}

export default Navigation 