import { useState, useEffect } from 'react'
import { 
  Search, 
  Upload, 
  Plus, 
  Heart, 
  Music
} from 'lucide-react'
import { useCategories } from '../hooks/useCategories'
import CategoryBadge from '../components/common/CategoryBadge'
import VideoUploadModal from '../components/video/VideoUploadModal'
import FirebaseStorageStatus from '../components/FirebaseStorageStatus'
import { getVideos } from '../services/firebase/firestore'
import { useAuth } from '../contexts/AuthContext'

const FigurasPage = () => {
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false)
  const [videos, setVideos] = useState([])
  const [loading, setLoading] = useState(true)
  const { user } = useAuth()
  
  const { 
    selectedStyle, 
    setSelectedStyle, 
    DANCE_STYLES,
    getColorForCategory 
  } = useCategories()

  // Cargar videos desde Firestore
  useEffect(() => {
    const loadVideos = async () => {
      try {
        setLoading(true)
        const videosData = await getVideos()
        setVideos(videosData)
      } catch (error) {
        console.error('Error cargando videos:', error)
      } finally {
        setLoading(false)
      }
    }

    loadVideos()
  }, [])

  // Función para actualizar la lista de videos después de subir uno nuevo
  const handleVideoUploaded = async (video) => {
    console.log('Video subido:', video)
    // Recargar la lista de videos
    try {
      const videosData = await getVideos()
      setVideos(videosData)
    } catch (error) {
      console.error('Error recargando videos:', error)
    }
  }

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

        {/* Firebase Storage Status */}
        <FirebaseStorageStatus />

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
          <button 
            onClick={() => setIsUploadModalOpen(true)}
            className="flex items-center justify-center space-x-2 px-6 py-3 bg-gradient-to-r from-orange-500 to-pink-500 text-white rounded-lg font-medium shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105"
          >
            <Upload className="h-5 w-5" />
            <span>SUBIR VIDEO(S) A SALSA</span>
          </button>
          <button className="flex items-center justify-center space-x-2 px-6 py-3 bg-blue-500 text-white rounded-lg font-medium shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105">
            <Music className="h-5 w-5" />
            <span>GALERÍA DE VIDEOS</span>
          </button>
          <button className="flex items-center justify-center space-x-2 px-6 py-3 bg-pink-500 text-white rounded-lg font-medium shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105">
            <Plus className="h-5 w-5" />
            <span>GALERÍA DE SECUENCIAS</span>
          </button>
        </div>



        {/* Videos Grid */}
        <div className="mb-8">
          <h2 className="text-2xl font-semibold text-gray-800 mb-6">
            Videos de salsa ({videos.length})
          </h2>
          
          {loading ? (
            <div className="flex justify-center items-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-500"></div>
              <span className="ml-3 text-gray-600">Cargando videos...</span>
            </div>
          ) : videos.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500 text-lg">No hay videos subidos aún</p>
              <p className="text-gray-400 text-sm mt-2">Sube tu primer video usando el botón de arriba</p>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 gap-6">
              {videos.map((video) => (
                <div key={video.id} className="bg-white rounded-lg shadow-md overflow-hidden border border-gray-100 hover:shadow-lg transition-all duration-200 transform hover:scale-[1.02]">
                  <div className="relative">
                    <img
                      src={video.thumbnailUrl || 'https://via.placeholder.com/300x200/1a1a1a/ffffff?text=VIDEO'}
                      alt={video.title}
                      className="w-full h-48 object-cover"
                    />
                    <div className="absolute bottom-2 left-2 bg-black bg-opacity-75 text-white px-2 py-1 rounded text-sm font-medium">
                      4K
                    </div>
                  </div>
                  
                  <div className="p-4">
                    <h3 className="font-semibold text-gray-800 mb-2 text-lg">{video.title}</h3>
                    <p className="text-gray-600 text-sm mb-3">{video.description || 'Sin descripción'}</p>
                    
                    <div className="flex flex-wrap gap-2 mb-4">
                      {video.tags && video.tags.normales && video.tags.normales.length > 0 ? (
                        video.tags.normales.map((tag) => (
                          <CategoryBadge
                            key={tag}
                            category={tag}
                            size="sm"
                          />
                        ))
                      ) : (
                        <span className="text-gray-400 text-sm">Sin etiquetas</span>
                      )}
                    </div>
                    
                    <div className="flex items-center justify-between text-sm text-gray-500">
                      <span className="font-medium">
                        {(video.fileSize / (1024 * 1024)).toFixed(2)} MB
                      </span>
                      <div className="flex items-center space-x-4">
                        <div className="flex items-center space-x-1">
                          <Heart className="h-4 w-4 text-red-500 fill-current" />
                          <span className="font-medium">0</span>
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
          )}
        </div>

        {/* Firebase Storage Status */}
        <div className="mb-8">
          <FirebaseStorageStatus />
        </div>
      </div>

      {/* Video Upload Modal */}
      <VideoUploadModal
        isOpen={isUploadModalOpen}
        onClose={() => setIsUploadModalOpen(false)}
        onVideoUploaded={handleVideoUploaded}
      />
    </div>
  )
}

export default FigurasPage 