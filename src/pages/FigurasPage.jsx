import { 
  Search, 
  Upload, 
  Plus, 
  Heart, 
  Music
} from 'lucide-react'
import { useCategories } from '../hooks/useCategories'
import CategoryBadge from '../components/common/CategoryBadge'

const FigurasPage = () => {
  const { 
    selectedStyle, 
    setSelectedStyle, 
    DANCE_STYLES,
    getColorForCategory 
  } = useCategories()

  const videos = [
    {
      id: 1,
      title: 'Figura Básica Salsa - Derecha',
      description: 'Aprende la figura básica de derecha en salsa',
      thumbnail: 'https://via.placeholder.com/300x200/1a1a1a/ffffff?text=RICK+ASTLEY+NEVER+GONNA+GIVE+YOU+UP',
      views: 1250,
      likes: 89,
      tags: ['Derecha', 'Básico', 'Ritmo', 'Cubano'],
      quality: '4K'
    },
    {
      id: 2,
      title: 'Giro Completo Salsa',
      description: 'Técnica avanzada de giro completo',
      thumbnail: 'https://via.placeholder.com/300x200/1a1a1a/ffffff?text=RICK+ASTLEY+NEVER+GONNA+GIVE+YOU+UP',
      views: 890,
      likes: 67,
      tags: ['Giro', 'Avanzado', 'Técnica', 'LA Style'],
      quality: '4K'
    }
  ]

  // Los colores de etiquetas ahora vienen del sistema de categorías

  return (
    <div className="min-h-screen bg-white">
      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-6 py-8">
        {/* Title */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-2">
            <span className="text-pink-500">FIGURAS</span>
            <span className="text-pink-600"> - SALSA</span>
          </h1>
          <p className="text-gray-600 text-lg">Galería de videos de figuras de salsa</p>
        </div>

        {/* Style Filters */}
        <div className="flex flex-wrap justify-center gap-3 mb-8">
          {DANCE_STYLES.map((style) => (
            <button
              key={style.name}
              onClick={() => setSelectedStyle(style.name)}
              className={`relative flex items-center space-x-2 px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
                selectedStyle === style.name
                  ? `bg-gradient-to-r ${style.gradient} text-white shadow-lg transform scale-105`
                  : 'bg-white text-gray-700 border border-gray-200 hover:bg-gray-50 hover:border-gray-300'
              }`}
            >
              <style.icon className="h-4 w-4" />
              <span>{style.name}</span>
              {style.hasNotification && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-medium animate-pulse">
                  {style.notificationCount}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Search Bar */}
        <div className="max-w-2xl mx-auto mb-8">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
            <input
              type="text"
              placeholder="Buscar videos en salsa..."
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent transition-all duration-200"
            />
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
          <button className="flex items-center justify-center space-x-2 px-6 py-3 bg-gradient-to-r from-orange-500 to-pink-500 text-white rounded-lg font-medium shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105">
            <Upload className="h-5 w-5" />
            <span>SUBIR VIDEO(S) A SALSA</span>
          </button>
          <button className="flex items-center justify-center space-x-2 px-6 py-3 bg-pink-500 text-white rounded-lg font-medium shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105">
            <Plus className="h-5 w-5" />
            <span>CONSTRUCTOR DE SECUENCIAS</span>
          </button>
        </div>



        {/* Videos Grid */}
        <div className="mb-8">
          <h2 className="text-2xl font-semibold text-gray-800 mb-6">Videos de salsa (2)</h2>
          <div className="grid md:grid-cols-2 gap-6">
            {videos.map((video) => (
              <div key={video.id} className="bg-white rounded-lg shadow-md overflow-hidden border border-gray-100 hover:shadow-lg transition-all duration-200 transform hover:scale-[1.02]">
                <div className="relative">
                  <img
                    src={video.thumbnail}
                    alt={video.title}
                    className="w-full h-48 object-cover"
                  />
                  <div className="absolute bottom-2 left-2 bg-black bg-opacity-75 text-white px-2 py-1 rounded text-sm font-medium">
                    {video.quality}
                  </div>
                </div>
                
                <div className="p-4">
                  <h3 className="font-semibold text-gray-800 mb-2 text-lg">{video.title}</h3>
                  <p className="text-gray-600 text-sm mb-3">{video.description}</p>
                  
                  <div className="flex flex-wrap gap-2 mb-4">
                    {video.tags.map((tag) => (
                      <CategoryBadge
                        key={tag}
                        category={tag}
                        size="sm"
                      />
                    ))}
                  </div>
                  
                  <div className="flex items-center justify-between text-sm text-gray-500">
                    <span className="font-medium">{video.views} vistas</span>
                    <div className="flex items-center space-x-4">
                      <div className="flex items-center space-x-1">
                        <Heart className="h-4 w-4 text-red-500 fill-current" />
                        <span className="font-medium">{video.likes}</span>
                      </div>
                      <button className="text-gray-400 hover:text-red-500 transition-colors duration-200">
                        <Heart className="h-4 w-4" />
                      </button>
                      <button className="text-gray-400 hover:text-gray-600 transition-colors duration-200">
                        <Upload className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

export default FigurasPage 