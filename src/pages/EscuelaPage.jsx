import { useState, useEffect } from 'react'
import { 
  Search, 
  Upload, 
  Plus, 
  Video, 
  Heart, 
  Settings, 
  Music, 
  GraduationCap, 
  Calendar, 
  Home, 
  Bell, 
  Sun, 
  User,
  Zap,
  Star,
  BookOpen,
  Clock,
  Users,
  Filter,
  Grid,
  List,
  Download,
  Play,
  Edit,
  Trash2
} from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import { useTheme } from '../contexts/ThemeContext'
import { useCategories } from '../hooks/useCategories'
import { getVideos, toggleVideoLike } from '../services/firebase/firestore'
import { createSequence, getSequencesByStyle, deleteSequence } from '../services/firebase/sequences'
import { useSequenceBuilderContext } from '../contexts/SequenceBuilderContext'
import VideoUploadModal from '../components/video/VideoUploadModal'
import VideoPlayer from '../components/video/VideoPlayer'
import SequenceBuilder from '../components/sequence/SequenceBuilder'
import SequenceGallery from '../components/sequence/SequenceGallery'
import Toast from '../components/common/Toast'
import ConfirmModal from '../components/common/ConfirmModal'
import CategoryChips from '../components/common/CategoryChips'

const EscuelaPage = () => {
  const { user } = useAuth()
  const { isDark } = useTheme()
  const [selectedStyle, setSelectedStyle] = useState('salsa')
  const [activeTab, setActiveTab] = useState('videos')
  const [videos, setVideos] = useState([])
  const [sequences, setSequences] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategories, setSelectedCategories] = useState([])
  const [viewMode, setViewMode] = useState('grid')
  const [showUploadModal, setShowUploadModal] = useState(false)
  const [showBuilder, setShowBuilder] = useState(false)
  const [selectedVideo, setSelectedVideo] = useState(null)
  const [showVideoModal, setShowVideoModal] = useState(false)
  const [toasts, setToasts] = useState([])
  const [confirmModal, setConfirmModal] = useState({ isOpen: false, type: null })

  // Usar el hook de categorías
  const { categoriesList, getColorClasses } = useCategories('escuela', selectedStyle)

  // Contexto del constructor de secuencias
  const {
    clearSequence,
    setSequenceName,
    setSequenceDescription
  } = useSequenceBuilderContext()

  const styles = [
    { name: 'salsa', icon: Music, hasNotification: true },
    { name: 'bachata', icon: Heart },
    { name: 'kizomba', icon: Zap },
    { name: 'zouk', icon: Star },
    { name: 'merengue', icon: Sun }
  ]

  // Cargar videos al cambiar el estilo
  useEffect(() => {
    loadVideos()
  }, [selectedStyle])

  // Cargar secuencias al cambiar el estilo
  useEffect(() => {
    loadSequences()
  }, [selectedStyle])

  const loadVideos = async () => {
    try {
      setLoading(true)
      const videosData = await getVideos(selectedStyle, 'escuela')
      setVideos(videosData)
    } catch (error) {
      console.error('Error cargando videos:', error)
      setError('Error cargando videos')
    } finally {
      setLoading(false)
    }
  }

  const loadSequences = async () => {
    try {
      const sequencesData = await getSequencesByStyle(selectedStyle, 'escuela')
      setSequences(sequencesData)
    } catch (error) {
      console.error('Error cargando secuencias:', error)
    }
  }

  const handleVideoUpload = async (videoData) => {
    try {
      // Recargar videos después de subir
      await loadVideos()
      addToast('Video subido exitosamente', 'success')
      setShowUploadModal(false)
    } catch (error) {
      console.error('Error subiendo video:', error)
      addToast('Error subiendo video', 'error')
    }
  }

  const handleSaveSequence = async (sequenceData) => {
    try {
      await createSequence(sequenceData)
      await loadSequences()
      addToast('Secuencia guardada exitosamente', 'success')
      setShowBuilder(false)
    } catch (error) {
      console.error('Error guardando secuencia:', error)
      addToast('Error guardando secuencia', 'error')
    }
  }

  const handleDeleteSequence = async (sequenceId) => {
    try {
      await deleteSequence(sequenceId)
      await loadSequences()
      addToast('Secuencia eliminada exitosamente', 'success')
    } catch (error) {
      console.error('Error eliminando secuencia:', error)
      addToast('Error eliminando secuencia', 'error')
    }
  }

  const handleVideoLike = async (video) => {
    if (!user) {
      addToast('Debes iniciar sesión para dar like', 'error')
      return
    }

    try {
      const result = await toggleVideoLike(video.id, user.uid)
      if (result.success) {
        // Actualizar el video en el estado local
        setVideos(prevVideos => 
          prevVideos.map(v => 
            v.id === video.id 
              ? { ...v, userLiked: result.userLiked, likes: result.newLikes }
              : v
          )
        )
        addToast(`Has ${result.userLiked ? 'dado like a' : 'quitado like de'} "${video.title}"`, 'success')
      }
    } catch (error) {
      console.error('Error al manejar like:', error)
      addToast('Error al actualizar like', 'error')
    }
  }

  const handlePlayVideo = (video) => {
    setSelectedVideo(video)
    setShowVideoModal(true)
  }

  const addToast = (message, type = 'success') => {
    const id = Date.now()
    setToasts(prev => [...prev, { id, message, type }])
  }

  const removeToast = (id) => {
    setToasts(prev => prev.filter(toast => toast.id !== id))
  }

  const handleToggleBuilder = () => {
    if (showBuilder) {
      clearSequence()
      setSequenceName('')
      setSequenceDescription('')
    }
    setShowBuilder(!showBuilder)
  }

  // Filtrar videos
  const filteredVideos = videos.filter(video => {
    const matchesSearch = video.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         video.description?.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesCategories = selectedCategories.length === 0 || 
      selectedCategories.some(category => {
        const [categoryKey, tag] = category.split(':')
        return video.tags?.[categoryKey]?.includes(tag)
      })
    
    return matchesSearch && matchesCategories
  })

  // Obtener tags ordenados para un video
  const getOrderedTags = (video) => {
    if (!video.tags || Object.keys(video.tags).length === 0) {
      return []
    }
    
    const orderedTags = []
    
    categoriesList.forEach(category => {
      const categoryTags = video.tags[category.key]
      if (Array.isArray(categoryTags)) {
        categoryTags.forEach(tag => {
          orderedTags.push({
            tag,
            categoryKey: category.key,
            color: category.color
          })
        })
      }
    })
    
    return orderedTags
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-6 py-8">
        {/* Title */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-2">
            <span className="text-pink-500">ESCUELA</span>
            <span className="text-pink-600"> - SALSA</span>
          </h1>
          <p className="text-gray-600 text-lg">Cursos y tutoriales estructurados para aprender salsa</p>
        </div>

        {/* Style Filters */}
        <div className="flex flex-wrap justify-center gap-3 mb-8">
          {styles.map((style) => (
            <button
              key={style.name}
              onClick={() => setSelectedStyle(style.name)}
              className={`relative flex items-center space-x-2 px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
                selectedStyle === style.name
                  ? 'bg-gradient-to-r from-orange-500 to-pink-500 text-white shadow-lg transform scale-105'
                  : 'bg-white text-gray-700 border border-gray-200 hover:bg-gray-50 hover:border-gray-300'
              }`}
            >
              <style.icon className="h-4 w-4" />
              <span>{style.name.toUpperCase()}</span>
              {style.hasNotification && (
                <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full"></div>
              )}
            </button>
          ))}
        </div>

        {/* Tabs */}
        <div className="flex justify-center mb-8">
          <div className="flex bg-gray-100 rounded-lg p-1">
            <button
              onClick={() => setActiveTab('videos')}
              className={`px-6 py-2 rounded-md font-medium transition-colors ${
                activeTab === 'videos'
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <Video className="inline-block w-4 h-4 mr-2" />
              Videos
            </button>
            <button
              onClick={() => setActiveTab('secuencias')}
              className={`px-6 py-2 rounded-md font-medium transition-colors ${
                activeTab === 'secuencias'
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <BookOpen className="inline-block w-4 h-4 mr-2" />
              Secuencias
            </button>
          </div>
        </div>

        {/* Videos Tab */}
        {activeTab === 'videos' && (
          <div>
            {/* Controls */}
            <div className="flex flex-col md:flex-row gap-4 mb-6">
              {/* Search */}
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="text"
                    placeholder="Buscar videos..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>

              {/* Categories Filter */}
              <div className="flex-1">
                <CategoryChips
                  categories={categoriesList}
                  selectedCategories={selectedCategories}
                  onCategoryToggle={(category) => {
                    setSelectedCategories(prev => 
                      prev.includes(category)
                        ? prev.filter(c => c !== category)
                        : [...prev, category]
                    )
                  }}
                />
              </div>

              {/* View Mode */}
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-2 rounded-lg transition-colors ${
                    viewMode === 'grid'
                      ? 'bg-blue-500 text-white'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  <Grid className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-2 rounded-lg transition-colors ${
                    viewMode === 'list'
                      ? 'bg-blue-500 text-white'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  <List className="w-4 h-4" />
                </button>
              </div>

              {/* Upload Button */}
              {user && (
                <button
                  onClick={() => setShowUploadModal(true)}
                  className="flex items-center space-x-2 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors"
                >
                  <Upload className="w-4 h-4" />
                  <span>Subir Video</span>
                </button>
              )}
            </div>

            {/* Constructor Button */}
            <div className="mb-6">
              <button
                onClick={handleToggleBuilder}
                className="flex items-center space-x-2 px-4 py-2 bg-purple-500 hover:bg-purple-600 text-white rounded-lg transition-colors"
              >
                <Plus className="w-4 h-4" />
                <span>{showBuilder ? 'Ocultar Constructor' : 'Constructor de Secuencias'}</span>
              </button>
            </div>

            {/* Constructor de Secuencias */}
            {showBuilder && (
              <SequenceBuilder
                isOpen={showBuilder}
                onClose={handleToggleBuilder}
                videos={videos}
                onSaveSequence={handleSaveSequence}
                style={selectedStyle}
                isIntegrated={true}
                onToggleBuilder={handleToggleBuilder}
              />
            )}

            {/* Videos Grid/List */}
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                <span className="ml-3 text-gray-600">Cargando videos...</span>
              </div>
            ) : error ? (
              <div className="text-center py-12 text-red-600">
                <span>{error}</span>
              </div>
            ) : filteredVideos.length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                <Video className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>No se encontraron videos</p>
                <p className="text-sm">Intenta ajustar los filtros o subir un nuevo video</p>
              </div>
            ) : (
              <div className={viewMode === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6' : 'space-y-4'}>
                {filteredVideos.map((video) => (
                  <div
                    key={video.id}
                    className={`bg-white rounded-lg shadow-md overflow-hidden border border-gray-100 hover:shadow-lg transition-all duration-200 ${
                      viewMode === 'list' ? 'flex' : ''
                    }`}
                  >
                    {/* Thumbnail */}
                    <div className={`relative group ${viewMode === 'list' ? 'w-48 flex-shrink-0' : ''}`}>
                      <div className="w-full aspect-video bg-gradient-to-br from-gray-100 to-gray-200 relative overflow-hidden flex items-center justify-center">
                        {video.thumbnailUrl && video.thumbnailUrl !== 'https://via.placeholder.com/400x225/1a1a1a/ffffff?text=VIDEO' ? (
                          <img
                            src={video.thumbnailUrl}
                            alt={video.title}
                            className="w-full h-full object-cover"
                            loading="lazy"
                            onError={(e) => {
                              e.target.style.display = 'none';
                              e.target.nextSibling.style.display = 'flex';
                            }}
                          />
                        ) : null}
                        <div className={`flex flex-col items-center justify-center text-gray-500 ${video.thumbnailUrl && video.thumbnailUrl !== 'https://via.placeholder.com/400x225/1a1a1a/ffffff?text=VIDEO' ? 'hidden' : 'flex'}`}>
                          <svg className="w-12 h-12 mb-2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                          </svg>
                          <span className="text-sm font-medium">{video.title}</span>
                        </div>
                        
                        {/* Play Button */}
                        <button
                          onClick={() => handlePlayVideo(video)}
                          className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                        >
                          <svg className="w-12 h-12 text-white" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M8 5v14l11-7z"/>
                          </svg>
                        </button>
                      </div>
                    </div>
                    
                    {/* Content */}
                    <div className={`p-4 ${viewMode === 'list' ? 'flex-1' : ''}`}>
                      {/* Title and Rating */}
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="font-semibold text-gray-800 text-lg truncate">{video.title}</h3>
                        <div className="flex items-center space-x-1">
                          {[1, 2, 3, 4, 5].map(star => {
                            const isFilled = (video.rating || 0) >= star
                            return (
                              <svg 
                                key={star}
                                className={`h-4 w-4 ${isFilled ? 'text-yellow-400 fill-current' : 'text-gray-300'}`} 
                                fill="currentColor" 
                                viewBox="0 0 24 24"
                              >
                                <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                              </svg>
                            )
                          })}
                          <span className="text-xs font-medium text-gray-500 ml-1">({video.rating || 0})</span>
                        </div>
                      </div>

                      {/* Description */}
                      <p className="text-gray-600 text-sm mb-3 line-clamp-2">{video.description || 'Sin descripción'}</p>
                      
                      {/* Tags */}
                      <div className="flex flex-wrap gap-2 mb-3">
                        {(() => {
                          const orderedTags = getOrderedTags(video)
                          if (orderedTags.length > 0) {
                            return orderedTags.slice(0, 3).map(({ tag, categoryKey, color }) => (
                              <span
                                key={`${categoryKey}-${tag}`}
                                className={`px-2 py-1 rounded-full text-xs font-medium ${getColorClasses(color)}`}
                              >
                                {tag}
                              </span>
                            ))
                          } else {
                            return <span className="text-gray-400 text-sm">Sin etiquetas</span>
                          }
                        })()}
                        {getOrderedTags(video).length > 3 && (
                          <span className="text-xs text-gray-500">+{getOrderedTags(video).length - 3} más</span>
                        )}
                      </div>
                      
                      {/* Stats */}
                      <div className="flex items-center justify-between text-sm text-gray-500 pt-2 border-t border-gray-100">
                        <div className="flex items-center space-x-2">
                          <span className="font-medium">
                            {(video.fileSize / (1024 * 1024)).toFixed(2)} MB
                          </span>
                          <span className="text-gray-400">•</span>
                          <span className="text-gray-600">
                            {video.resolution && video.resolution !== 'Unknown' ? 
                              video.resolution : 
                              'HD'
                            }
                          </span>
                          <span className="text-gray-400">•</span>
                          <div className="flex items-center space-x-1">
                            <Music className="h-3 w-3 text-purple-500" />
                            <span className="font-medium text-purple-600">{video.bpm || 'N/A'} BPM</span>
                          </div>
                        </div>
                        <button 
                          onClick={() => handleVideoLike(video)}
                          className={`flex items-center space-x-1 transition-colors duration-200 p-1 rounded hover:bg-red-50 ${
                            video.userLiked ? 'text-red-500' : 'text-gray-400 hover:text-red-500'
                          }`}
                          title={video.userLiked ? 'Quitar like' : 'Dar like'}
                        >
                          <Heart className={`h-4 w-4 ${video.userLiked ? 'fill-current' : ''}`} />
                          <span className="font-medium">{video.likes || 0}</span>
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Secuencias Tab */}
        {activeTab === 'secuencias' && (
          <SequenceGallery
            sequences={sequences}
            onDeleteSequence={handleDeleteSequence}
            style={selectedStyle}
            category="escuela"
          />
        )}
      </div>

      {/* Modals */}
      {showUploadModal && (
        <VideoUploadModal
          isOpen={showUploadModal}
          onClose={() => setShowUploadModal(false)}
          onUpload={handleVideoUpload}
          style={selectedStyle}
          category="escuela"
        />
      )}

      {/* Video Player Modal */}
      {showVideoModal && selectedVideo && (
        <div
          className="fixed inset-0 bg-black bg-opacity-95 flex items-center justify-center z-50 p-4"
          onClick={() => setShowVideoModal(false)}
        >
          <div
            className="bg-black rounded-lg overflow-hidden w-full max-w-6xl max-h-[95vh] flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-gray-700 bg-gray-900">
              <h3 className="text-xl font-semibold text-white">{selectedVideo.title}</h3>
              <button 
                onClick={() => setShowVideoModal(false)}
                className="text-gray-400 hover:text-white text-2xl font-bold p-2 hover:bg-gray-800 rounded transition-colors"
              >
                &times;
              </button>
            </div>
            
            {/* Video Player */}
            <div className="flex-1 bg-black flex items-center justify-center p-4">
              <div className="w-full h-full flex items-center justify-center">
                <VideoPlayer
                  src={selectedVideo.videoUrl}
                  className="max-w-full max-h-full object-contain"
                  showControls={true}
                  autoplay={false}
                  loop={false}
                  muted={false}
                  videoTitle={selectedVideo.title}
                  size="fullscreen"
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Toasts */}
      {toasts.map(toast => (
        <Toast
          key={toast.id}
          message={toast.message}
          type={toast.type}
          onClose={() => removeToast(toast.id)}
        />
      ))}
    </div>
  )
}

export default EscuelaPage 