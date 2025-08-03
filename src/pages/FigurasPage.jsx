import { useState, useEffect } from 'react'
import { 
  Search, 
  Upload, 
  Plus, 
  Heart, 
  Music,
  Trash2,
  Filter,
  X,
  ChevronDown,
  ChevronUp,
  Star,
  Zap,
  Edit
} from 'lucide-react'
import { useCategories } from '../hooks/useCategories'
import CategoryBadge from '../components/common/CategoryBadge'
import VideoUploadModal from '../components/video/VideoUploadModal'
import VideoEditModal from '../components/video/VideoEditModal'
import VideoPlayer from '../components/video/VideoPlayer'
import ConfirmModal from '../components/common/ConfirmModal'
import Toast from '../components/common/Toast'

import { 
  getVideos, 
  deleteVideoDocument, 
  subscribeToVideosByStyle,
  deleteAllVideos,
  updateVideoThumbnailPaths,
  diagnoseVideos
} from '../services/firebase/firestore'
import { 
  deleteVideo, 
  deleteAllVideoFiles, 
  cleanupOrphanedFiles 
} from '../services/firebase/storage'
import { useAuth } from '../contexts/AuthContext'

const FigurasPage = () => {
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false)
  const [editModal, setEditModal] = useState({ isOpen: false, video: null })
  const [videos, setVideos] = useState([])
  const [loading, setLoading] = useState(true)
  const [toasts, setToasts] = useState([])
  const [deleteModal, setDeleteModal] = useState({ isOpen: false, video: null })
  const [selectedTags, setSelectedTags] = useState([])
  const [searchTerm, setSearchTerm] = useState('')
  const [showFilters, setShowFilters] = useState(false)
  const [activeTab, setActiveTab] = useState('videos')
  const [syncStatus, setSyncStatus] = useState('idle') // idle, syncing, error
  const [cleanupModal, setCleanupModal] = useState({ isOpen: false, type: null })
  const { user } = useAuth()
  
  // Usar el nuevo sistema de categorías
  const { 
    selectedStyle, 
    setSelectedStyle, 
    availableStyles,
    categoriesList,
    getColorClasses,
    getGradientClasses
  } = useCategories('figuras', 'salsa')

  // Función auxiliar para filtrar videos por estilo
  const filterVideosByStyle = (videos, style) => {
    return videos.filter(video => 
      video.style === style || video.tags?.estilo?.includes(style)
    )
  }

  // Mapeo de iconos para los estilos
  const iconMap = {
    Music: Music,
    Heart: Heart,
    Star: Star,
    Zap: Zap
  }

  // Sincronización en tiempo real con Firebase
  useEffect(() => {
    console.log('🔄 Iniciando sincronización en tiempo real para:', selectedStyle)
    setSyncStatus('syncing')
    
    // Suscribirse a cambios en tiempo real para el estilo seleccionado
    const unsubscribe = subscribeToVideosByStyle(selectedStyle, (videosData) => {
      console.log(`🔄 Actualización en tiempo real recibida: ${videosData.length} videos para ${selectedStyle}`)
      setVideos(videosData)
      setLoading(false)
      setSyncStatus('idle')
    })
    
    // Cleanup al desmontar o cambiar estilo
    return () => {
      console.log('🔄 Desuscribiendo de sincronización en tiempo real')
      unsubscribe()
    }
  }, [selectedStyle])



  // Función para actualizar la lista de videos después de subir uno nuevo
  const handleVideoUploaded = async (video) => {
    console.log('Video subido:', video)
    addToast(`${video.title} subido exitosamente`, 'success')
    // La sincronización en tiempo real se encargará de actualizar la lista automáticamente
  }

  // Función para abrir modal de edición
  const openEditModal = (video) => {
    setEditModal({ isOpen: true, video })
  }

  // Función para cerrar modal de edición
  const closeEditModal = () => {
    setEditModal({ isOpen: false, video: null })
  }

  // Función para manejar video actualizado
  const handleVideoUpdated = (updatedVideo) => {
    setVideos(prev => prev.map(v => v.id === updatedVideo.id ? updatedVideo : v))
    addToast(`${updatedVideo.title} actualizado exitosamente`, 'success')
  }

  // Función para añadir notificaciones
  const addToast = (message, type = 'success') => {
    const id = Date.now()
    setToasts(prev => [...prev, { id, message, type }])
  }

  // Función para eliminar notificaciones
  const removeToast = (id) => {
    setToasts(prev => prev.filter(toast => toast.id !== id))
  }

  // Función para eliminar video
  const handleDeleteVideo = async (video) => {
    try {
      console.log('🗑️ Iniciando eliminación de video:', video)
      console.log('📁 Video path:', video.videoPath)
      console.log('🖼️ Thumbnail path:', video.thumbnailPath)
      
      // Eliminar de Firebase Storage
      const storageResult = await deleteVideo(video.videoPath, video.thumbnailPath)
      console.log('📦 Resultado eliminación Storage:', storageResult)
      
      // Si hay error al eliminar archivos, intentar solo eliminar el video
      if (!storageResult.success) {
        console.log('⚠️ Error eliminando archivos, intentando solo eliminar video...')
        
        // Intentar eliminar solo el video si el thumbnail falló
        if (storageResult.error && storageResult.error.includes('thumbnails')) {
          const videoOnlyResult = await deleteVideo(video.videoPath, null)
          if (!videoOnlyResult.success) {
            addToast(`Error al eliminar archivos: ${storageResult.error}`, 'error')
            return
          }
        } else {
          addToast(`Error al eliminar archivos: ${storageResult.error}`, 'error')
          return
        }
      }

      // Eliminar de Firestore
      const firestoreResult = await deleteVideoDocument(video.id)
      console.log('🔥 Resultado eliminación Firestore:', firestoreResult)
      
      if (!firestoreResult.success) {
        addToast(`Error al eliminar metadatos: ${firestoreResult.error}`, 'error')
        return
      }

      // Actualizar lista local
      setVideos(prev => prev.filter(v => v.id !== video.id))
      addToast(`${video.title} eliminado correctamente`, 'success')
    } catch (error) {
      console.error('❌ Error deleting video:', error)
      addToast('Error inesperado al eliminar video', 'error')
    }
  }

  // Función para abrir modal de eliminación
  const openDeleteModal = (video) => {
    console.log('🔘 Botón eliminar clickeado para video:', video)
    setDeleteModal({ isOpen: true, video })
  }

  // Función para cerrar modal de eliminación
  const closeDeleteModal = () => {
    setDeleteModal({ isOpen: false, video: null })
  }

  // Funciones de limpieza y sincronización
  const handleCleanupData = async (type) => {
    try {
      setSyncStatus('syncing')
      addToast('Iniciando limpieza de datos...', 'info')
      
      if (type === 'update') {
        // Actualizar rutas de thumbnails existentes
        const result = await updateVideoThumbnailPaths()
        if (result.success) {
          addToast(`✅ ${result.updatedCount} videos actualizados`, 'success')
        } else {
          addToast(`❌ Error: ${result.error}`, 'error')
        }
      } else if (type === 'cleanup') {
        // Limpiar archivos huérfanos
        const videosData = await getVideos()
        const result = await cleanupOrphanedFiles(videosData)
        if (result.success) {
          addToast(`🧹 ${result.orphanedVideosDeleted} videos y ${result.orphanedThumbnailsDeleted} thumbnails huérfanos eliminados`, 'success')
        } else {
          addToast(`❌ Error: ${result.error}`, 'error')
        }
      } else if (type === 'delete-all') {
        // Eliminar todos los videos (confirmar primero)
        const confirmed = window.confirm('¿Estás seguro de que quieres eliminar TODOS los videos? Esta acción no se puede deshacer.')
        if (!confirmed) {
          setSyncStatus('idle')
          return
        }
        
        // Eliminar de Firestore
        const firestoreResult = await deleteAllVideos()
        if (!firestoreResult.success) {
          addToast(`❌ Error eliminando documentos: ${firestoreResult.error}`, 'error')
          setSyncStatus('idle')
          return
        }
        
        // Eliminar archivos de Storage
        const storageResult = await deleteAllVideoFiles()
        if (!storageResult.success) {
          addToast(`❌ Error eliminando archivos: ${storageResult.error}`, 'error')
          setSyncStatus('idle')
          return
        }
        
        addToast(`🗑️ ${firestoreResult.deletedCount} videos eliminados completamente`, 'success')
      }
      
      setSyncStatus('idle')
      setCleanupModal({ isOpen: false, type: null })
    } catch (error) {
      console.error('Error en limpieza:', error)
      addToast(`❌ Error inesperado: ${error.message}`, 'error')
      setSyncStatus('idle')
    }
  }

  const openCleanupModal = (type) => {
    setCleanupModal({ isOpen: true, type })
  }

  const closeCleanupModal = () => {
    setCleanupModal({ isOpen: false, type: null })
  }

  // Función para ejecutar diagnóstico de videos
  const handleDiagnoseVideos = async () => {
    try {
      addToast('Ejecutando diagnóstico de videos...', 'info')
      const result = await diagnoseVideos()
      
      if (result.success) {
        console.log('🔍 Resultado del diagnóstico:', result)
        
        let message = `Diagnóstico: ${result.totalVideos} videos total, ${result.salsaVideos} de salsa`
        if (result.fig003Found) {
          message += ` ✅ Fig003 encontrado`
        } else {
          message += ` ❌ Fig003 NO encontrado`
        }
        
        addToast(message, 'success')
      } else {
        addToast(`Error en diagnóstico: ${result.error}`, 'error')
      }
    } catch (error) {
      console.error('Error ejecutando diagnóstico:', error)
      addToast('Error al ejecutar diagnóstico', 'error')
    }
  }

  // Función para manejar filtros por tags
  const handleTagFilter = (tag) => {
    setSelectedTags(prev => {
      const isSelected = prev.includes(tag)
      if (isSelected) {
        return prev.filter(t => t !== tag)
      } else {
        return [...prev, tag]
      }
    })
  }

  // Función para limpiar filtros
  const clearFilters = () => {
    setSelectedTags([])
    setSearchTerm('')
  }

  // Función para obtener tags ordenados según el orden de categorías
  const getOrderedTags = (video) => {
    if (!video.tags || Object.keys(video.tags).length === 0) {
      return []
    }

    // Crear array de tags ordenados según el orden de categoriesList
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

  // Función para obtener tags iniciales ordenados
  const getOrderedTagsIniciales = (video) => {
    if (!video.tagsIniciales || Object.keys(video.tagsIniciales).length === 0) {
      return []
    }

    const orderedTags = []
    
    categoriesList.forEach(category => {
      const categoryTags = video.tagsIniciales[category.key]
      if (Array.isArray(categoryTags)) {
        categoryTags.forEach(tag => {
          orderedTags.push({
            tag,
            categoryKey: category.key,
            color: category.color,
            type: 'inicial'
          })
        })
      }
    })

    return orderedTags
  }

  // Función para obtener tags finales ordenados
  const getOrderedTagsFinales = (video) => {
    if (!video.tagsFinales || Object.keys(video.tagsFinales).length === 0) {
      return []
    }

    const orderedTags = []
    
    categoriesList.forEach(category => {
      const categoryTags = video.tagsFinales[category.key]
      if (Array.isArray(categoryTags)) {
        categoryTags.forEach(tag => {
          orderedTags.push({
            tag,
            categoryKey: category.key,
            color: category.color,
            type: 'final'
          })
        })
      }
    })

    return orderedTags
  }

  // Función para normalizar texto (eliminar tildes y convertir a minúsculas)
  const normalizeText = (text) => {
    return text
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '') // Eliminar diacríticos (tildes)
      .trim()
  }

  // Función de búsqueda avanzada
  const advancedSearch = (video, searchTerms) => {
    if (!searchTerms || searchTerms.length === 0) return true

    // Normalizar el texto del video
    const normalizedTitle = normalizeText(video.title || '')
    const normalizedDescription = normalizeText(video.description || '')
    
    // Normalizar tags del video
    const normalizedTags = []
    if (video.tags) {
      Object.values(video.tags).forEach(categoryTags => {
        if (Array.isArray(categoryTags)) {
          categoryTags.forEach(tag => {
            normalizedTags.push(normalizeText(tag))
          })
        }
      })
    }

    // Verificar que TODAS las palabras de búsqueda estén presentes
    return searchTerms.every(searchWord => {
      const normalizedSearchWord = normalizeText(searchWord)
      
      // Buscar en título
      if (normalizedTitle.includes(normalizedSearchWord)) return true
      
      // Buscar en descripción
      if (normalizedDescription.includes(normalizedSearchWord)) return true
      
      // Buscar en tags
      if (normalizedTags.some(tag => tag.includes(normalizedSearchWord))) return true
      
      return false
    })
  }

  // Filtrar videos basado en tags seleccionados y búsqueda avanzada
  const filteredVideos = videos.filter(video => {
    // Dividir términos de búsqueda por espacios y filtrar vacíos
    const searchTerms = searchTerm
      .split(' ')
      .map(term => term.trim())
      .filter(term => term.length > 0)

    // Filtro por búsqueda avanzada
    const searchMatch = advancedSearch(video, searchTerms)

    // Filtro por tags - EXCLUYENTE (todos los tags seleccionados deben estar presentes)
    const tagsMatch = selectedTags.length === 0 || 
      selectedTags.every(tag => {
        // Buscar en todas las categorías de tags del video
        if (video.tags) {
          return Object.values(video.tags).some(categoryTags => 
            Array.isArray(categoryTags) && categoryTags.includes(tag)
          )
        }
        return false
      })

    return searchMatch && tagsMatch
  })

  return (
    <div className="min-h-screen bg-white">
      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-6 py-8">
        {/* Title */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-2">
            <span className="text-pink-500">FIGURAS</span>
            <span className="text-pink-600"> - {selectedStyle.toUpperCase()}</span>
          </h1>
          <p className="text-gray-600 text-lg">Galería de videos de figuras de {selectedStyle.toLowerCase()}</p>
        </div>

        {/* Style Filters */}
        <div className="flex flex-wrap justify-center gap-3 mb-8">
          {availableStyles.map((style) => {
            const IconComponent = iconMap[style.icon]
                                      const isSelected = selectedStyle === style.key
             // Usar el mismo degradado del botón de upload para SALSA
             const gradientClass = style.key === 'salsa' 
               ? 'from-orange-500 to-pink-500' 
               : getGradientClasses(style.color)
            
            return (
                             <button
                 key={style.name}
                 onClick={() => setSelectedStyle(style.key)}
                 className={`relative flex items-center space-x-2 px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
                   isSelected
                     ? `bg-gradient-to-r ${gradientClass} text-white shadow-lg transform scale-105`
                     : 'bg-white text-gray-700 border border-gray-200 hover:bg-gray-50 hover:border-gray-300'
                 }`}
               >
                {IconComponent && <IconComponent className="h-4 w-4" />}
                <span>{style.name}</span>
              </button>
            )
          })}
        </div>

        {/* Search Bar */}
        <div className="max-w-2xl mx-auto mb-8">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
            <input
              type="text"
              placeholder={`Buscar en ${selectedStyle.toLowerCase()}... (múltiples palabras, sin tildes)`}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent transition-all duration-200"
            />
          </div>
          
          {/* Search Status Indicator */}
          {searchTerm.trim() && (
            <div className="mt-3 text-center">
              <div className="inline-flex items-center space-x-2 px-4 py-2 bg-blue-50 border border-blue-200 rounded-lg">
                <Search className="h-4 w-4 text-blue-500" />
                <span className="text-sm text-blue-700">
                  Buscando: <span className="font-medium">"{searchTerm}"</span>
                </span>
                <span className="text-xs text-blue-600 bg-blue-100 px-2 py-1 rounded">
                  {filteredVideos.length} resultado{filteredVideos.length !== 1 ? 's' : ''}
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Tag Filters - Collapsible */}
        {categoriesList.length > 0 && (
          <div className="mb-8">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center justify-center space-x-2 mx-auto px-6 py-3 bg-gradient-to-r from-gray-100 to-gray-200 text-gray-700 rounded-lg font-medium shadow-md hover:shadow-lg transition-all duration-200 transform hover:scale-105"
            >
              <Filter className="h-5 w-5" />
              <span>Filtros por Categorías - {selectedStyle}</span>
              {showFilters ? (
                <ChevronUp className="h-5 w-5" />
              ) : (
                <ChevronDown className="h-5 w-5" />
              )}
            </button>
            
            {/* Collapsible Content */}
            <div className={`mt-4 transition-all duration-300 ease-in-out overflow-hidden ${
              showFilters ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
            }`}>
              <div className="space-y-4 bg-gray-50 rounded-lg p-6 border border-gray-200">
                {categoriesList.map((category) => (
                  <div key={category.key} className="space-y-2">
                    <h4 className="font-medium text-gray-700 text-center">{category.name}</h4>
                    <div className="flex flex-wrap justify-center gap-2">
                      {category.tags.map(tag => (
                        <button
                          key={tag}
                          onClick={() => handleTagFilter(tag)}
                          className={`px-3 py-1 rounded-full text-sm font-medium transition-all duration-200 ${
                            selectedTags.includes(tag)
                              ? 'bg-gradient-to-r from-pink-500 to-orange-500 text-white shadow-lg'
                              : `${getColorClasses(category.color)} hover:bg-opacity-80`
                          }`}
                        >
                          {tag}
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}



        {/* Action Buttons - Main Level */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center mb-6">
          <button 
            onClick={() => setIsUploadModalOpen(true)}
            className="flex items-center justify-center space-x-2 px-6 py-3 bg-gradient-to-r from-orange-500 to-pink-500 text-white rounded-lg font-medium shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105"
          >
            <Upload className="h-5 w-5" />
            <span>SUBIR VIDEO(S) A {selectedStyle.toUpperCase()}</span>
          </button>
          <button className="flex items-center justify-center space-x-2 px-6 py-3 bg-green-500 text-white rounded-lg font-medium shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105">
            <Plus className="h-5 w-5" />
            <span>CREAR SECUENCIA</span>
          </button>
        </div>

        {/* Sync Status and Cleanup Controls */}
        <div className="mb-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            {/* Sync Status */}
            <div className="flex items-center space-x-2">
              <div className={`w-3 h-3 rounded-full ${
                syncStatus === 'idle' ? 'bg-green-500' : 
                syncStatus === 'syncing' ? 'bg-yellow-500 animate-pulse' : 
                'bg-red-500'
              }`}></div>
              <span className="text-sm text-gray-600">
                {syncStatus === 'idle' ? '✅ Sincronizado con Firebase' : 
                 syncStatus === 'syncing' ? '🔄 Sincronizando...' : 
                 '❌ Error de sincronización'}
              </span>
            </div>
            
            {/* Cleanup Buttons */}
            <div className="flex flex-wrap gap-2">
              <button
                onClick={handleDiagnoseVideos}
                disabled={syncStatus === 'syncing'}
                className="px-3 py-1 text-xs bg-purple-500 text-white rounded hover:bg-purple-600 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                🔍 Diagnóstico
              </button>
              <button
                onClick={() => openCleanupModal('update')}
                disabled={syncStatus === 'syncing'}
                className="px-3 py-1 text-xs bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                🔧 Actualizar Rutas
              </button>
              <button
                onClick={() => openCleanupModal('cleanup')}
                disabled={syncStatus === 'syncing'}
                className="px-3 py-1 text-xs bg-yellow-500 text-white rounded hover:bg-yellow-600 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                🧹 Limpiar Huérfanos
              </button>
              <button
                onClick={() => openCleanupModal('delete-all')}
                disabled={syncStatus === 'syncing'}
                className="px-3 py-1 text-xs bg-red-500 text-white rounded hover:bg-red-600 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                🗑️ Eliminar Todo
              </button>
            </div>
          </div>
        </div>

        {/* Gallery Tabs */}
        <div className="flex justify-center gap-4 mb-8">
          <button
            onClick={() => setActiveTab('videos')}
            className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
              activeTab === 'videos'
                ? 'bg-gradient-to-r from-orange-500 to-pink-500 text-white shadow-lg transform scale-105'
                : 'bg-white text-gray-700 border border-gray-200 hover:bg-gray-50'
            }`}
          >
            <Music className="h-4 w-4" />
                            <span>GALERÍA DE VIDEOS</span>
          </button>
          <button
            onClick={() => setActiveTab('secuencias')}
            className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
              activeTab === 'secuencias'
                ? 'bg-gradient-to-r from-orange-500 to-pink-500 text-white shadow-lg transform scale-105'
                : 'bg-white text-gray-700 border border-gray-200 hover:bg-gray-50'
            }`}
          >
            <Plus className="h-4 w-4" />
            <span>GALERÍA DE SECUENCIAS (0)</span>
          </button>
        </div>



        {/* Videos Grid */}
        {activeTab === 'videos' && (
          <div className="mb-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-semibold text-gray-800">
                Videos de {selectedStyle.toLowerCase()} ({filteredVideos.length})
              </h2>
              {selectedTags.length > 0 && (
                <button
                  onClick={clearFilters}
                  className="text-sm text-gray-500 hover:text-gray-700 transition-colors duration-200"
                >
                  Limpiar filtros <X className="h-4 w-4 ml-1" />
                </button>
              )}
            </div>
          
          {loading ? (
            <div className="flex justify-center items-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-500"></div>
              <span className="ml-3 text-gray-600">Cargando videos...</span>
            </div>
          ) : videos.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500 text-lg">No hay videos de {selectedStyle.toLowerCase()} aún</p>
              <p className="text-gray-400 text-sm mt-2">Sube tu primer video de {selectedStyle.toLowerCase()} usando el botón de arriba</p>
            </div>
                     ) : (
             <div className="grid md:grid-cols-2 gap-6">
               {filteredVideos.map((video) => (
                <div key={video.id} className="bg-white rounded-lg shadow-md overflow-hidden border border-gray-100 hover:shadow-lg transition-all duration-200 transform hover:scale-[1.02]">
                  <div className="relative group">
                    <img
                      src={video.thumbnailUrl || 'https://via.placeholder.com/300x200/1a1a1a/ffffff?text=VIDEO'}
                      alt={video.title}
                      className="w-full h-48 object-cover"
                    />
                    <div className="absolute bottom-2 left-2 bg-black bg-opacity-75 text-white px-2 py-1 rounded text-sm font-medium">
                      4K
                    </div>
                    
                    {/* Botón de reproducción */}
                    <button
                      onClick={() => {
                        // Abrir modal de reproducción
                        const modal = document.createElement('div')
                        modal.className = 'fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50'
                        
                        const closeModal = () => {
                          document.body.removeChild(modal)
                        }
                        
                        modal.onclick = closeModal
                        
                        const videoContainer = document.createElement('div')
                        videoContainer.className = 'bg-white rounded-lg p-4 max-w-4xl w-full mx-4'
                        videoContainer.onclick = (e) => e.stopPropagation()
                        
                        const header = document.createElement('div')
                        header.className = 'flex items-center justify-between mb-4'
                        header.innerHTML = `
                          <h3 class="text-lg font-semibold text-gray-900">${video.title}</h3>
                          <button class="text-gray-400 hover:text-gray-600">
                            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
                            </svg>
                          </button>
                        `
                        header.querySelector('button').onclick = closeModal
                        
                        // Crear el VideoPlayer
                        const videoPlayerContainer = document.createElement('div')
                        videoPlayerContainer.id = 'video-player-container'
                        
                        videoContainer.appendChild(header)
                        videoContainer.appendChild(videoPlayerContainer)
                        modal.appendChild(videoContainer)
                        document.body.appendChild(modal)
                        
                        // Renderizar el VideoPlayer usando React
                        const { createRoot } = require('react-dom/client')
                        const root = createRoot(videoPlayerContainer)
                        root.render(React.createElement(VideoPlayer, {
                          src: video.videoUrl,
                          size: 'large',
                          loop: true,
                          showControls: true,
                          autoplay: true,
                          muted: false
                        }))
                      }}
                      className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                    >
                      <svg className="w-12 h-12 text-white" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M8 5v14l11-7z"/>
                      </svg>
                    </button>
                  </div>
                  
                  <div className="p-4">
                    <h3 className="font-semibold text-gray-800 mb-2 text-lg">{video.title}</h3>
                    <p className="text-gray-600 text-sm mb-3">{video.description || 'Sin descripción'}</p>
                    
                                         {/* Tags Normales */}
                     <div className="flex flex-wrap gap-2 mb-3">
                       {(() => {
                         const orderedTags = getOrderedTags(video)
                         if (orderedTags.length > 0) {
                           return orderedTags.map(({ tag, categoryKey, color }) => (
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
                     </div>

                     {/* Tags Iniciales */}
                     {(() => {
                       const tagsIniciales = getOrderedTagsIniciales(video)
                       if (tagsIniciales.length > 0) {
                         return (
                           <div className="mb-3">
                             <div className="flex items-center space-x-2 mb-2">
                               <span className="text-xs font-medium text-blue-600 uppercase tracking-wide">Iniciales:</span>
                             </div>
                             <div className="flex flex-wrap gap-2">
                               {tagsIniciales.map(({ tag, categoryKey, color }) => (
                                 <span
                                   key={`inicial-${categoryKey}-${tag}`}
                                   className="px-2 py-1 rounded-full text-xs font-medium bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-sm"
                                 >
                                   {tag}
                                 </span>
                               ))}
                             </div>
                           </div>
                         )
                       }
                       return null
                     })()}

                     {/* Tags Finales */}
                     {(() => {
                       const tagsFinales = getOrderedTagsFinales(video)
                       if (tagsFinales.length > 0) {
                         return (
                           <div className="mb-3">
                             <div className="flex items-center space-x-2 mb-2">
                               <span className="text-xs font-medium text-green-600 uppercase tracking-wide">Finales:</span>
                             </div>
                             <div className="flex flex-wrap gap-2">
                               {tagsFinales.map(({ tag, categoryKey, color }) => (
                                 <span
                                   key={`final-${categoryKey}-${tag}`}
                                   className="px-2 py-1 rounded-full text-xs font-medium bg-gradient-to-r from-green-500 to-teal-500 text-white shadow-sm"
                                 >
                                   {tag}
                                 </span>
                               ))}
                             </div>
                           </div>
                         )
                       }
                       return null
                     })()}
                    
                                         <div className="flex items-center justify-between text-sm text-gray-500">
                       <span className="font-medium">
                         {(video.fileSize / (1024 * 1024)).toFixed(2)} MB
                       </span>
                                               <div className="flex items-center space-x-4">
                          <div className="flex items-center space-x-1">
                            <Heart className="h-4 w-4 text-red-500 fill-current" />
                            <span className="font-medium">{video.likes || 0}</span>
                          </div>
                          <button className="text-gray-400 hover:text-red-500 transition-colors duration-200">
                            <Heart className="h-4 w-4" />
                          </button>
                          <button 
                            onClick={() => openEditModal(video)}
                            className="text-gray-400 hover:text-blue-500 transition-colors duration-200 p-1 rounded hover:bg-blue-50"
                            title="Editar video"
                          >
                            <Edit className="h-4 w-4" />
                          </button>
                          <button 
                            onClick={() => openDeleteModal(video)}
                            className="text-gray-400 hover:text-red-500 transition-colors duration-200 p-1 rounded hover:bg-red-50"
                            title="Eliminar video"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                     </div>
                  </div>
                </div>
              ))}
                         </div>
           )}
         </div>
        )}

        {/* Secuencias Grid */}
        {activeTab === 'secuencias' && (
          <div className="mb-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-semibold text-gray-800">
                Secuencias de {selectedStyle.toLowerCase()} (0)
              </h2>
            </div>
            
            <div className="text-center py-12">
              <p className="text-gray-500 text-lg">No hay secuencias creadas aún</p>
              <p className="text-gray-400 text-sm mt-2">Crea tu primera secuencia usando el botón "CREAR SECUENCIA"</p>
            </div>
          </div>
        )}


      </div>

                           {/* Video Upload Modal */}
                <VideoUploadModal
           isOpen={isUploadModalOpen}
           onClose={() => setIsUploadModalOpen(false)}
           onVideoUploaded={handleVideoUploaded}
           page="figuras"
           style={selectedStyle}
         />

        {/* Video Edit Modal */}
        <VideoEditModal
          isOpen={editModal.isOpen}
          onClose={closeEditModal}
          video={editModal.video}
          onVideoUpdated={handleVideoUpdated}
          page="figuras"
          style={selectedStyle}
        />

       {/* Cleanup Confirmation Modal */}
       <ConfirmModal
         isOpen={cleanupModal.isOpen}
         onClose={closeCleanupModal}
         onConfirm={() => handleCleanupData(cleanupModal.type)}
         title={
           cleanupModal.type === 'update' ? 'Actualizar Rutas de Thumbnails' :
           cleanupModal.type === 'cleanup' ? 'Limpiar Archivos Huérfanos' :
           'Eliminar Todos los Videos'
         }
         message={
           cleanupModal.type === 'update' ? 
           '¿Actualizar las rutas de thumbnails de videos existentes? Esto corregirá problemas de eliminación.' :
           cleanupModal.type === 'cleanup' ? 
           '¿Limpiar archivos huérfanos? Esto eliminará archivos que no tienen documento en Firestore.' :
           '¿Eliminar TODOS los videos de Firebase y Storage? Esta acción es IRREVERSIBLE y eliminará todos los datos.'
         }
         confirmText={
           cleanupModal.type === 'update' ? 'Actualizar' :
           cleanupModal.type === 'cleanup' ? 'Limpiar' :
           'Eliminar Todo'
         }
         cancelText="Cancelar"
       />

       {/* Confirm Delete Modal */}
       <ConfirmModal
         isOpen={deleteModal.isOpen}
         onClose={closeDeleteModal}
         onConfirm={() => handleDeleteVideo(deleteModal.video)}
         title="🗑️ Eliminar Video"
         message={`¿Estás seguro de que quieres eliminar el video "${deleteModal.video?.title}"?

Esta acción eliminará permanentemente:
• El archivo de video de Firebase Storage
• El thumbnail del video
• Los metadatos de Firestore

Esta acción NO se puede deshacer.`}
         confirmText="Sí, Eliminar"
         cancelText="Cancelar"
         type="danger"
       />

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

export default FigurasPage 