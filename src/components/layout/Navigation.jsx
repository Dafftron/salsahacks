import { Link, useLocation } from 'react-router-dom'
import { useState } from 'react'
import { useTheme } from '../../contexts/ThemeContext'
import { useAuth } from '../../contexts/AuthContext'
import { Music, Sun, Moon, User, Bell, Heart, Search, Shield, Menu, Inbox } from 'lucide-react'
import { ROLE_LABELS, ROLE_COLORS, ROLES } from '../../constants/roles'

const Navigation = () => {
  const location = useLocation()
  const { theme, changeTheme } = useTheme()
  const { user, userProfile, isAuthenticated, logout, hasPermission, getUserUsername, getUserPhoto } = useAuth()
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false)

  const navItems = [
    { path: '/', label: 'Inicio' },
    ...(user ? [
      { path: '/figuras', label: 'Figuras' },
      { path: '/escuela', label: 'Escuela' },
      { path: '/eventos', label: 'Eventos' },
      { path: '/musica', label: 'Música' },
      { path: '/estudios', label: 'Estudios' },
      { path: '/categorias', label: 'Categorías' },
      { path: '/inbox', label: 'Inbox' },
      ...(userProfile?.role === ROLES.SUPER_ADMIN ? [{ path: '/notas', label: 'Notas' }] : [])
    ] : [])
  ]

  // Agregar enlace de administración si el usuario tiene permisos
  if (hasPermission('MANAGE_USERS')) {
    navItems.push({ path: '/admin', label: 'Admin' })
  }

  const toggleTheme = () => {
    const themes = ['light', 'dark', 'gray']
    const currentIndex = themes.indexOf(theme)
    const nextIndex = (currentIndex + 1) % themes.length
    changeTheme(themes[nextIndex])
  }

  return (
    <nav className="shadow-lg" style={{ backgroundColor: 'var(--bg-primary)', borderBottom: '2px solid var(--border-primary)' }}>
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2">
            <Music className="h-8 w-8" style={{ color: 'var(--salsa-primary)' }} />
            <span className="text-2xl font-bold" style={{ color: 'var(--salsa-primary)' }}>SalsaHacks</span>
          </Link>

          {/* Navigation Links - Desktop */}
          <div className="hidden md:flex space-x-8">
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`px-3 py-2 rounded-md text-sm font-medium transition-colors`}
                style={
                  location.pathname === item.path
                    ? { color: 'var(--salsa-dark)', backgroundColor: 'var(--bg-secondary)' }
                    : { color: 'var(--text-secondary)' }
                }
              >
                {item.label}
              </Link>
            ))}
          </div>

          {/* Mobile menu toggle */}
          <button
            className="md:hidden p-2 transition-colors"
            style={{ color: 'var(--text-secondary)' }}
            onClick={() => setIsMobileNavOpen((prev) => !prev)}
            aria-label={isMobileNavOpen ? 'Cerrar navegación' : 'Abrir navegación'}
          >
            <Menu className="h-6 w-6" />
          </button>

          {/* Right Side Icons */}
          <div className="flex items-center space-x-4">
            {/* Search eliminado */}

            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              className="p-2 transition-colors"
              style={{ color: 'var(--text-secondary)' }}
              title={`Tema: ${theme}`}
            >
              {theme === 'dark' ? (
                <Sun className="h-5 w-5" />
              ) : theme === 'light' ? (
                <Moon className="h-5 w-5" />
              ) : theme === 'gray' ? (
                <Sun className="h-5 w-5" />
              ) : (
                <Moon className="h-5 w-5" />
              )}
            </button>

            {/* Inbox con badge */}
            <Link to="/inbox" className="p-2 transition-colors relative" style={{ color: 'var(--text-secondary)' }}>
              <Inbox className="h-5 w-5" />
              {/* badge dinámico usando window event */}
              {typeof window !== 'undefined' && window.__salsahacks__?.unreadInboxCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-pink-600 text-white text-[10px] leading-none rounded-full h-4 min-w-4 px-1 flex items-center justify-center">
                  {Math.min(window.__salsahacks__.unreadInboxCount, 9)}
                </span>
              )}
            </Link>

            {/* Favorites */}
            <button className="p-2 transition-colors" style={{ color: 'var(--text-secondary)' }}>
              <Heart className="h-5 w-5" />
            </button>

            {/* User Profile */}
            {isAuthenticated ? (
              <div className="relative group">
                <button className="flex items-center space-x-3 p-2 transition-colors rounded-lg" style={{ color: 'var(--text-secondary)', backgroundColor: 'transparent' }}>
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
                    <span className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>
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
                <div className="absolute right-0 mt-2 w-56 rounded-lg shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50" style={{ backgroundColor: 'var(--bg-primary)', border: '1px solid var(--border-primary)' }}>
                  <div className="py-2">
                    {/* User Info in Dropdown */}
                    <div className="px-4 py-3" style={{ borderBottom: '1px solid var(--border-primary)' }}>
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
                          <p className="text-sm font-medium truncate" style={{ color: 'var(--text-primary)' }}>
                            {userProfile?.displayName || user?.displayName || 'Usuario'}
                          </p>
                          <p className="text-xs truncate" style={{ color: 'var(--text-secondary)' }}>{getUserUsername()}</p>
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
                      className="block px-4 py-2 text-sm transition-colors"
                      style={{ color: 'var(--text-secondary)' }}
                    >
                      Mi Perfil
                    </Link>
                    <Link
                      to="/settings"
                      className="block px-4 py-2 text-sm transition-colors"
                      style={{ color: 'var(--text-secondary)' }}
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
                      className="block w-full text-left px-4 py-2 text-sm transition-colors"
                      style={{ color: '#DC2626', backgroundColor: 'transparent' }}
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

      {/* Navigation Links - Mobile */}
      {isMobileNavOpen && (
        <div className="md:hidden" style={{ borderTop: '1px solid var(--border-primary)' }}>
          <div className="container mx-auto px-4 py-3">
            <div className="flex space-x-4 overflow-x-auto">
              {navItems.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setIsMobileNavOpen(false)}
                  className={`whitespace-nowrap px-3 py-2 rounded-md text-sm font-medium transition-colors`}
                  style={
                    location.pathname === item.path
                      ? { color: 'var(--salsa-dark)', backgroundColor: 'var(--bg-secondary)' }
                      : { color: 'var(--text-secondary)' }
                  }
                >
                  {item.label}
                </Link>
              ))}
            </div>
          </div>
        </div>
      )}
    </nav>
  )
}

export default Navigation 