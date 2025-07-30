import { useState } from 'react'
import { 
  Search, 
  CheckCircle, 
  Clock, 
  GitBranch, 
  Calendar,
  FileText,
  Star,
  Settings,
  Database,
  AlertCircle,
  PlayCircle,
  Music,
  Video,
  Users,
  Home,
  BookOpen
} from 'lucide-react'

const NotasPage = () => {
  const [activeTab, setActiveTab] = useState('commits')
  const [selectedCategory, setSelectedCategory] = useState('TODAS')

  const categories = [
    { name: 'TODAS', icon: FileText, count: 25 },
    { name: 'PÁGINAS', icon: Home, count: 12 },
    { name: 'SISTEMAS', icon: Settings, count: 8 },
    { name: 'CONTENIDO', icon: Video, count: 5 }
  ]

  const commits = [
    {
      id: 1,
      hash: '83eeffb',
      date: '2025-01-27',
      title: 'Commit #007 - Corrección de Navegación Duplicada',
      description: 'Eliminación de headers duplicados en EscuelaPage y EventosPage',
      files: ['EscuelaPage.jsx', 'EventosPage.jsx', 'NOTAS_COMMITS.md'],
      notes: 'Interfaz más limpia y consistente, navegación global unificada',
      status: 'Completado',
      category: 'PÁGINAS'
    },
    {
      id: 2,
      hash: 'b3b80a8',
      date: '2025-01-27',
      title: 'Commit #006 - Unificación de Estructura',
      description: 'Conversión de EscuelaPage y EventosPage a estructura de FigurasPage',
      files: ['EscuelaPage.jsx', 'EventosPage.jsx', 'SISTEMA_CATEGORIAS.md'],
      notes: 'Estructura unificada, contenido específico por página',
      status: 'Completado',
      category: 'PÁGINAS'
    },
    {
      id: 3,
      hash: 'a1b2c3d',
      date: '2025-01-27',
      title: 'Commit #005 - Perfeccionamiento de FigurasPage',
      description: 'Ajustes finos para perfeccionar la página de Figuras',
      files: ['FigurasPage.jsx', 'NOTAS_COMMITS.md'],
      notes: 'Transiciones suaves, animaciones, efectos visuales pulidos',
      status: 'Completado',
      category: 'PÁGINAS'
    }
  ]

  const cosasHechas = [
    {
      id: 1,
      title: 'Configuración inicial del proyecto',
      description: 'React + Vite + Tailwind CSS configurado',
      category: 'SISTEMAS',
      date: '2025-01-27',
      priority: 'Alta',
      status: 'Completado'
    },
    {
      id: 2,
      title: 'Página de Figuras diseñada',
      description: 'Diseño completo basado en imagen de referencia',
      category: 'PÁGINAS',
      date: '2025-01-27',
      priority: 'Alta',
      status: 'Completado'
    },
    {
      id: 3,
      title: 'Sistema de navegación unificado',
      description: 'Header global consistente en todas las páginas',
      category: 'PÁGINAS',
      date: '2025-01-27',
      priority: 'Media',
      status: 'Completado'
    },
    {
      id: 4,
      title: 'Documentación del proyecto',
      description: 'NOTAS_COMMITS.md y SISTEMA_CATEGORIAS.md creados',
      category: 'SISTEMAS',
      date: '2025-01-27',
      priority: 'Alta',
      status: 'Completado'
    },
    {
      id: 5,
      title: 'Páginas Escuela y Eventos',
      description: 'Estructura unificada con contenido específico',
      category: 'PÁGINAS',
      date: '2025-01-27',
      priority: 'Media',
      status: 'Completado'
    }
  ]

  const cosasEnProceso = [
    {
      id: 1,
      title: 'Sistema de categorías hardcodeadas',
      description: 'Implementar gestión de categorías no eliminables',
      category: 'SISTEMAS',
      priority: 'Alta',
      progress: 75,
      status: 'En Progreso'
    },
    {
      id: 2,
      title: 'Configuración de Firebase',
      description: 'Firestore y Authentication configurados',
      category: 'SISTEMAS',
      priority: 'Alta',
      progress: 30,
      status: 'En Progreso'
    }
  ]

  const cosasFuturas = [
    // SISTEMAS
    {
      id: 1,
      title: 'Sistema de autenticación',
      description: 'Login/registro de usuarios con Firebase Auth',
      category: 'SISTEMAS',
      priority: 'Alta',
      estimatedTime: '4 días',
      status: 'Futuro'
    },
    {
      id: 2,
      title: 'Base de datos Firestore',
      description: 'Configuración completa de la base de datos',
      category: 'SISTEMAS',
      priority: 'Alta',
      estimatedTime: '3 días',
      status: 'Futuro'
    },
    {
      id: 3,
      title: 'Sistema de recomendaciones',
      description: 'Algoritmo para recomendar videos y contenido',
      category: 'SISTEMAS',
      priority: 'Baja',
      estimatedTime: '5 días',
      status: 'Futuro'
    },
    {
      id: 4,
      title: 'Analytics y estadísticas',
      description: 'Métricas de uso y comportamiento de usuarios',
      category: 'SISTEMAS',
      priority: 'Baja',
      estimatedTime: '3 días',
      status: 'Futuro'
    },
    
    // PÁGINAS
    {
      id: 5,
      title: 'HomePage - Dashboard principal',
      description: 'Página de inicio con estadísticas y videos destacados',
      category: 'PÁGINAS',
      priority: 'Media',
      estimatedTime: '3 días',
      status: 'Futuro'
    },
    {
      id: 6,
      title: 'CategoriesPage - Gestión de categorías',
      description: 'Página para gestionar categorías y etiquetas',
      category: 'PÁGINAS',
      priority: 'Media',
      estimatedTime: '2 días',
      status: 'Futuro'
    },
    {
      id: 7,
      title: 'AdminPage - Panel de administración',
      description: 'Dashboard para gestión de contenido y usuarios',
      category: 'PÁGINAS',
      priority: 'Media',
      estimatedTime: '4 días',
      status: 'Futuro'
    },
    {
      id: 8,
      title: 'Perfil de usuario',
      description: 'Página de perfil personal con historial y favoritos',
      category: 'PÁGINAS',
      priority: 'Baja',
      estimatedTime: '2 días',
      status: 'Futuro'
    },
    {
      id: 9,
      title: 'Página de video individual',
      description: 'Página detallada para ver y comentar videos',
      category: 'PÁGINAS',
      priority: 'Alta',
      estimatedTime: '3 días',
      status: 'Futuro'
    },
    {
      id: 10,
      title: 'Página de búsqueda avanzada',
      description: 'Búsqueda con filtros por categorías y estilos',
      category: 'PÁGINAS',
      priority: 'Media',
      estimatedTime: '2 días',
      status: 'Futuro'
    },
    
    // CONTENIDO
    {
      id: 11,
      title: 'Sistema de gestión de videos',
      description: 'Upload, reproducción y gestión de metadatos',
      category: 'CONTENIDO',
      priority: 'Alta',
      estimatedTime: '5 días',
      status: 'Futuro'
    },
    {
      id: 12,
      title: 'Constructor de secuencias',
      description: 'Herramienta para crear secuencias de baile',
      category: 'CONTENIDO',
      priority: 'Media',
      estimatedTime: '4 días',
      status: 'Futuro'
    },
    {
      id: 13,
      title: 'Sistema de comentarios',
      description: 'Comentarios en videos y sistema de ratings',
      category: 'CONTENIDO',
      priority: 'Baja',
      estimatedTime: '3 días',
      status: 'Futuro'
    },
    {
      id: 14,
      title: 'Sistema de favoritos',
      description: 'Guardar videos favoritos y crear playlists',
      category: 'CONTENIDO',
      priority: 'Baja',
      estimatedTime: '2 días',
      status: 'Futuro'
    },
    {
      id: 15,
      title: 'Notificaciones',
      description: 'Sistema de notificaciones para nuevos videos y eventos',
      category: 'CONTENIDO',
      priority: 'Baja',
      estimatedTime: '2 días',
      status: 'Futuro'
    },
    
    // FUNCIONALIDADES AVANZADAS
    {
      id: 16,
      title: 'Modo offline',
      description: 'Descargar videos para ver sin conexión',
      category: 'SISTEMAS',
      priority: 'Baja',
      estimatedTime: '4 días',
      status: 'Futuro'
    },
    {
      id: 17,
      title: 'Integración con redes sociales',
      description: 'Compartir videos en Facebook, Instagram, etc.',
      category: 'CONTENIDO',
      priority: 'Baja',
      estimatedTime: '3 días',
      status: 'Futuro'
    },
    {
      id: 18,
      title: 'Sistema de certificaciones',
      description: 'Certificados de cursos completados',
      category: 'CONTENIDO',
      priority: 'Baja',
      estimatedTime: '3 días',
      status: 'Futuro'
    },
    {
      id: 19,
      title: 'Calendario de eventos',
      description: 'Calendario interactivo para eventos de salsa',
      category: 'PÁGINAS',
      priority: 'Media',
      estimatedTime: '3 días',
      status: 'Futuro'
    },
    {
      id: 20,
      title: 'Sistema de mensajería',
      description: 'Chat entre usuarios e instructores',
      category: 'SISTEMAS',
      priority: 'Baja',
      estimatedTime: '5 días',
      status: 'Futuro'
    }
  ]

  const getStatusColor = (status) => {
    switch (status) {
      case 'Completado': return 'bg-green-500'
      case 'En Progreso': return 'bg-blue-500'
      case 'Futuro': return 'bg-gray-500'
      case 'Pendiente': return 'bg-yellow-500'
      default: return 'bg-gray-500'
    }
  }

  const getStatusIcon = (status) => {
    switch (status) {
      case 'Completado': return <CheckCircle className="h-5 w-5 text-green-500" />
      case 'En Progreso': return <PlayCircle className="h-5 w-5 text-blue-500" />
      case 'Futuro': return <Clock className="h-5 w-5 text-gray-500" />
      case 'Pendiente': return <AlertCircle className="h-5 w-5 text-yellow-500" />
      default: return <Clock className="h-5 w-5 text-gray-500" />
    }
  }

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'Alta': return 'bg-red-500'
      case 'Media': return 'bg-yellow-500'
      case 'Baja': return 'bg-green-500'
      default: return 'bg-gray-500'
    }
  }

  const getCategoryColor = (category) => {
    switch (category) {
      case 'PÁGINAS': return 'bg-blue-500'
      case 'SISTEMAS': return 'bg-purple-500'
      case 'CONTENIDO': return 'bg-pink-500'
      default: return 'bg-gray-500'
    }
  }

  const getCategoryIcon = (category) => {
    switch (category) {
      case 'PÁGINAS': return <Home className="h-4 w-4" />
      case 'SISTEMAS': return <Settings className="h-4 w-4" />
      case 'CONTENIDO': return <Video className="h-4 w-4" />
      default: return <FileText className="h-4 w-4" />
    }
  }

  const getStatusBorderColor = (status) => {
    switch (status) {
      case 'Completado': return 'border-l-green-500'
      case 'En Progreso': return 'border-l-blue-500'
      case 'Futuro': return 'border-l-gray-500'
      case 'Pendiente': return 'border-l-yellow-500'
      default: return 'border-l-gray-500'
    }
  }

  const filteredItems = () => {
    let items = []
    
    if (activeTab === 'commits') {
      items = commits
    } else if (activeTab === 'hechas') {
      items = cosasHechas
    } else if (activeTab === 'proceso') {
      items = cosasEnProceso
    } else if (activeTab === 'futuras') {
      items = cosasFuturas
    }
    
    if (selectedCategory !== 'TODAS') {
      items = items.filter(item => item.category === selectedCategory)
    }
    
    return items
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-6 py-8">
        {/* Title */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-2">
            <span className="text-pink-500">NOTAS DE DESARROLLO</span>
          </h1>
          <p className="text-gray-600 text-lg">Seguimiento de commits y control de hitos del proyecto</p>
        </div>

        {/* Category Filters */}
        <div className="flex flex-wrap justify-center gap-3 mb-8">
          {categories.map((category) => (
            <button
              key={category.name}
              onClick={() => setSelectedCategory(category.name)}
              className={`relative flex items-center space-x-2 px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
                selectedCategory === category.name
                  ? 'bg-gradient-to-r from-orange-500 to-pink-500 text-white shadow-lg transform scale-105'
                  : 'bg-white text-gray-700 border border-gray-200 hover:bg-gray-50 hover:border-gray-300'
              }`}
            >
              <category.icon className="h-4 w-4" />
              <span>{category.name}</span>
              <span className="bg-white bg-opacity-20 px-2 py-1 rounded text-xs">
                {category.count}
              </span>
            </button>
          ))}
        </div>

        {/* Search Bar */}
        <div className="max-w-2xl mx-auto mb-8">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
            <input
              type="text"
              placeholder="Buscar en notas..."
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent transition-all duration-200"
            />
          </div>
        </div>

        {/* Content Tabs */}
        <div className="flex justify-center gap-4 mb-8">
          <button
            onClick={() => setActiveTab('commits')}
            className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
              activeTab === 'commits'
                ? 'bg-gradient-to-r from-orange-500 to-pink-500 text-white shadow-lg transform scale-105'
                : 'bg-white text-gray-700 border border-gray-200 hover:bg-gray-50'
            }`}
          >
            <GitBranch className="h-4 w-4" />
            <span>COMMITS ({commits.length})</span>
          </button>
          <button
            onClick={() => setActiveTab('hechas')}
            className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
              activeTab === 'hechas'
                ? 'bg-gradient-to-r from-green-500 to-green-600 text-white shadow-lg transform scale-105'
                : 'bg-white text-gray-700 border border-gray-200 hover:bg-gray-50'
            }`}
          >
            <CheckCircle className="h-4 w-4" />
            <span>HECHO ({cosasHechas.length})</span>
          </button>
          <button
            onClick={() => setActiveTab('proceso')}
            className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
              activeTab === 'proceso'
                ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-lg transform scale-105'
                : 'bg-white text-gray-700 border border-gray-200 hover:bg-gray-50'
            }`}
          >
            <PlayCircle className="h-4 w-4" />
            <span>EN PROCESO ({cosasEnProceso.length})</span>
          </button>
          <button
            onClick={() => setActiveTab('futuras')}
            className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
              activeTab === 'futuras'
                ? 'bg-gradient-to-r from-gray-500 to-gray-600 text-white shadow-lg transform scale-105'
                : 'bg-white text-gray-700 border border-gray-200 hover:bg-gray-50'
            }`}
          >
            <Clock className="h-4 w-4" />
            <span>FUTURO ({cosasFuturas.length})</span>
          </button>
        </div>

        {/* Content Grid */}
        <div className="mb-8">
          <h2 className="text-2xl font-semibold text-gray-800 mb-6">
            {activeTab === 'commits' && 'Historial de Commits'}
            {activeTab === 'hechas' && 'Tareas Completadas'}
            {activeTab === 'proceso' && 'Tareas en Progreso'}
            {activeTab === 'futuras' && 'Tareas Futuras'}
          </h2>
          
          <div className="grid gap-6">
            {filteredItems().map((item) => (
              <div key={item.id} className={`bg-white rounded-lg shadow-md overflow-hidden border border-gray-100 hover:shadow-lg transition-all duration-200 transform hover:scale-[1.02] border-l-4 ${getStatusBorderColor(item.status)}`}>
                <div className="p-6">
                  {/* Header */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      {activeTab === 'commits' && (
                        <div className="flex items-center space-x-2">
                          <GitBranch className="h-5 w-5 text-pink-500" />
                          <span className="font-mono text-sm text-gray-600">{item.hash}</span>
                        </div>
                      )}
                      {activeTab !== 'commits' && getStatusIcon(item.status)}
                      <div>
                        <h3 className="font-semibold text-gray-800 text-lg">{item.title}</h3>
                        {activeTab === 'commits' && (
                          <p className="text-sm text-gray-500">{item.date}</p>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <span className={`px-3 py-1 text-white text-xs rounded-full font-medium ${getCategoryColor(item.category)}`}>
                        {item.category}
                      </span>
                      <span className={`px-3 py-1 text-white text-xs rounded-full font-medium ${getStatusColor(item.status)}`}>
                        {item.status}
                      </span>
                      {item.priority && (
                        <span className={`px-3 py-1 text-white text-xs rounded-full font-medium ${getPriorityColor(item.priority)}`}>
                          {item.priority}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Description */}
                  <p className="text-gray-600 mb-4">{item.description}</p>

                  {/* Progress Bar for En Proceso */}
                  {activeTab === 'proceso' && item.progress && (
                    <div className="mb-4">
                      <div className="flex justify-between text-sm text-gray-600 mb-1">
                        <span>Progreso</span>
                        <span>{item.progress}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                          style={{ width: `${item.progress}%` }}
                        ></div>
                      </div>
                    </div>
                  )}

                  {/* Files (for commits) */}
                  {activeTab === 'commits' && item.files && (
                    <div className="mb-4">
                      <p className="text-sm font-medium text-gray-700 mb-2">Archivos modificados:</p>
                      <div className="flex flex-wrap gap-2">
                        {item.files.map((file, index) => (
                          <span key={index} className="px-3 py-1 bg-pink-100 text-pink-700 text-xs rounded-full font-medium">
                            {file}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Notes */}
                  {item.notes && (
                    <div className="mb-4">
                      <p className="text-sm font-medium text-gray-700 mb-2">Notas:</p>
                      <p className="text-sm text-gray-600">{item.notes}</p>
                    </div>
                  )}

                  {/* Additional info for futuras */}
                  {activeTab === 'futuras' && item.estimatedTime && (
                    <div className="flex items-center space-x-4 text-sm text-gray-500">
                      <span className="flex items-center space-x-1">
                        <Clock className="h-4 w-4" />
                        <span>Tiempo estimado: {item.estimatedTime}</span>
                      </span>
                    </div>
                  )}

                  {/* Additional info for hechas */}
                  {activeTab === 'hechas' && item.date && (
                    <div className="flex items-center space-x-4 text-sm text-gray-500">
                      <span className="flex items-center space-x-1">
                        <Calendar className="h-4 w-4" />
                        <span>Completado: {item.date}</span>
                      </span>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

export default NotasPage 