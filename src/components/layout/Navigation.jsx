import { Link, useLocation } from 'react-router-dom'
import { useTheme } from '../../contexts/ThemeContext'
import { useAuth } from '../../contexts/AuthContext'
import { Music, Sun, Moon, User, Bell, Heart, Search } from 'lucide-react'

const Navigation = () => {
  const location = useLocation()
  const { theme, changeTheme } = useTheme()
  const { user, isAuthenticated } = useAuth()

  const navItems = [
    { path: '/', label: 'Inicio' },
    { path: '/figuras', label: 'Figuras' },
    { path: '/escuela', label: 'Escuela' },
    { path: '/eventos', label: 'Eventos' },
    { path: '/categorias', label: 'Categorías' },
    { path: '/notas', label: 'Notas' }
  ]

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
              <div className="flex items-center space-x-2">
                <span className="text-sm font-medium text-gray-700">
                  {user?.displayName || user?.email || 'Usuario'}
                </span>
                <button className="p-2 text-gray-600 hover:text-salsa-primary transition-colors">
                  <User className="h-5 w-5" />
                </button>
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