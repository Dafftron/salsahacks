import React, { useState, useEffect, useMemo, useCallback, lazy, Suspense } from 'react'
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
  Edit,
  Download,
  Maximize2,
  Minimize2,
  Play,
  Shuffle,
  Eye,
  EyeOff,
  Loader
} from 'lucide-react'
import { useCategories } from '../hooks/useCategories'
import CategoryBadge from '../components/common/CategoryBadge'
import ConfirmModal from '../components/common/ConfirmModal'
import Toast from '../components/common/Toast'
import CardSizeSelector from '../components/common/CardSizeSelector'
import CompactCardActions from '../components/common/CompactCardActions'
import CategoryChips from '../components/common/CategoryChips'
import { useSequenceBuilderContext } from '../contexts/SequenceBuilderContext'

// Lazy loading de componentes pesados
const VideoUploadModal = lazy(() => import('../components/video/VideoUploadModal'))
const VideoEditModal = lazy(() => import('../components/video/VideoEditModal'))
const VideoPlayer = lazy(() => import('../components/video/VideoPlayer'))
const DownloadModal = lazy(() => import('../components/video/DownloadModal'))
const SequenceBuilder = lazy(() => import('../components/sequence/SequenceBuilder'))
const SequenceGallery = lazy(() => import('../components/sequence/SequenceGallery'))
const SequenceVideoPlayer = lazy(() => import('../components/sequence/SequenceVideoPlayer'))
const CommentsSection = lazy(() => import('../components/video/CommentsSection'))

import { 
  getVideos, 
  deleteVideoDocument, 
  subscribeToVideosByStyle,
  deleteAllVideos,
  updateVideoThumbnailPaths,
  diagnoseVideos,
  updateVideoDocument,
  cleanupDuplicateTags,
  toggleVideoLike,
  checkUserLikedVideo,
  checkUserFavorite
} from '../services/firebase/firestore'

import { 
  deleteVideo, 
  deleteAllVideoFiles, 
  cleanupOrphanedFiles,
  getFileURL,
  migrateVideosToOrganizedStructure
} from '../services/firebase/storage'
import { useAuth } from '../contexts/AuthContext'
import { useTheme } from '../contexts/ThemeContext'
import { useCardSize } from '../contexts/CardSizeContext'
import VideoGridRenderer from '../components/gallery/VideoGridRenderer'


// Componente de carga para lazy loading
const LoadingSpinner = () => (
  <div className="flex items-center justify-center py-8">
    <Loader className="w-6 h-6 animate-spin text-blue-500" />
    <span className="ml-2 text-gray-600">Cargando...</span>
  </div>
)

// Helper function para cargar localStorage de forma segura
const loadFilterPreference = (key, defaultValue) => {
  try {
    const saved = localStorage.getItem('escuela-filters')
    const parsed = saved ? JSON.parse(saved) : {}
    return parsed[key] ?? defaultValue
  } catch (error) {
    return defaultValue
  }
}

const EscuelaPage = () => {
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false)
  const [editModal, setEditModal] = useState({ isOpen: false, video: null })
  const [videos, setVideos] = useState([])
  const [loading, setLoading] = useState(true)
  const [toasts, setToasts] = useState([])
  const [deleteModal, setDeleteModal] = useState({ isOpen: false, video: null })
  const [selectedTags, setSelectedTags] = useState(() => loadFilterPreference('selectedTags', []))
  const [searchTerm, setSearchTerm] = useState(() => loadFilterPreference('searchTerm', ''))
  const [showFilters, setShowFilters] = useState(() => loadFilterPreference('showFilters', false))
  const [activeTab, setActiveTab] = useState('videos')
  const [syncStatus, setSyncStatus] = useState('idle') // idle, syncing, error
  const [cleanupModal, setCleanupModal] = useState({ isOpen: false, type: null })
  const [editSequenceModal, setEditSequenceModal] = useState({ isOpen: false, sequence: null })
  const [downloadSequenceModal, setDownloadSequenceModal] = useState({ isOpen: false, sequence: null })
  const [migrationModal, setMigrationModal] = useState({ isOpen: false })
  const [isFullWidth, setIsFullWidth] = useState(false) // Modo ancho completo

  
  // Estados para reproductor de video individual
  const [selectedVideo, setSelectedVideo] = useState(null)
  const [showVideoPlayer, setShowVideoPlayer] = useState(false)
  
  // Estados para reproductor de secuencias
  const [selectedSequence, setSelectedSequence] = useState(null)
  const [showSequencePlayer, setShowSequencePlayer] = useState(false)
  
  // Estados para el sistema de chips y filtros
  const [activeCategoryChips, setActiveCategoryChips] = useState(() => loadFilterPreference('activeCategoryChips', []))
  const [sortKey, setSortKey] = useState(() => loadFilterPreference('sortKey', 'none'))
  const [sortDir, setSortDir] = useState(() => loadFilterPreference('sortDir', 'asc'))
  const [showFavorites, setShowFavorites] = useState(() => loadFilterPreference('showFavorites', false))
  

  
  const { user, userProfile } = useAuth()
  const { getVideoConfig, getSequenceConfig } = useCardSize()

  

  
  // Estado local para el estilo seleccionado (con carga lazy de localStorage)
  const [selectedStyle, setSelectedStyle] = useState(() => loadFilterPreference('selectedStyle', 'salsa'))
  
  // Usar el sistema de categorías con estilo dinámico
  const { 
    availableStyles,
    getGradientClasses,
    categoriesList, 
    getColorClasses
  } = useCategories('escuela', selectedStyle)

  // Función para guardar preferencias de filtros
  const saveFilterPreferences = (filters) => {
    try {
      localStorage.setItem('escuela-filters', JSON.stringify(filters))
    } catch (error) {
      console.warn('No se pudieron guardar las preferencias de filtros:', error)
    }
  }

  // Función para manejar click en título de categoría
  const handleCategoryTitleClick = (categoryKey) => {
    setActiveCategoryChips(prev => {
      // Si ya está activa, la removemos
      if (prev.includes(categoryKey)) {
        return prev.filter(chip => chip !== categoryKey)
      }
      // Si no está activa, la agregamos
      return [...prev, categoryKey]
    })
  }

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
    setSyncStatus('syncing')
    
    // Suscribirse a cambios en tiempo real para el estilo seleccionado
    const unsubscribe = subscribeToVideosByStyle(selectedStyle, (videosData) => {
      setVideos(videosData)
      setLoading(false)
      setSyncStatus('idle')
    }, 'escuela')
    
    // Cleanup al desmontar o cambiar estilo
    return () => {
      unsubscribe()
    }
  }, [selectedStyle])

  // Guardar preferencias de filtros automáticamente
  useEffect(() => {
    const filters = {
      selectedStyle,
      selectedTags,
      searchTerm,
      showFilters,
      activeCategoryChips,
      sortKey,
      sortDir,
      showFavorites
    }
    saveFilterPreferences(filters)
  }, [selectedStyle, selectedTags, searchTerm, showFilters, activeCategoryChips, sortKey, sortDir, showFavorites])

  // Verificar estado de likes del usuario cuando se cargan videos
  useEffect(() => {
    if (videos.length > 0 && user) {
      const checkUserLikesAndFavorites = async () => {
        const updatedVideos = await Promise.all(
          videos.map(async (video) => {
            try {
              const [likeResult, favoriteResult] = await Promise.all([
                checkUserLikedVideo(video.id, user.uid),
                checkUserFavorite(video.id, user.uid)
              ])
              return { 
                ...video, 
                userLiked: likeResult.userLiked,
                isFavorite: favoriteResult.isFavorite
              }
            } catch (error) {
              console.error('Error al verificar like/favorito para video:', video.id, error)
              return { ...video, userLiked: false, isFavorite: false }
            }
          })
        )
        
        setVideos(updatedVideos)
      }
      
      checkUserLikesAndFavorites()
    }
  }, [videos.length, user])





  // Función para actualizar la lista de videos después de subir uno nuevo
  const handleVideoUploaded = async (video) => {
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

  // Función para reproducir video
  const handlePlayVideo = (video) => {
    setSelectedVideo(video)
    setShowVideoPlayer(true)
  }

  // Función para descargar video
  const downloadVideo = async (video) => {
    // Verificar permisos de descarga
    if (!user || !userProfile) {
      addToast('❌ Debes iniciar sesión para descargar videos', 'error')
      return
    }

    // Solo maestros y super admin pueden descargar
    if (userProfile.role !== 'maese' && userProfile.role !== 'super_admin') {
      addToast('❌ Solo los maestros pueden descargar videos', 'error')
      return
    }

    try {
      addToast(`Iniciando descarga de ${video.title}...`, 'info')
      
      // Usar el sistema de descarga optimizado
      const { ref, getDownloadURL } = await import('firebase/storage')
      const { storage } = await import('../services/firebase/config')
      
      const videoRef = ref(storage, video.videoPath)
      const downloadURL = await getDownloadURL(videoRef)
      
      // Descargar video con timeout y mejor manejo de errores
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 30000) // 30 segundos timeout
      
      const response = await fetch(downloadURL, {
        signal: controller.signal
      })
      
      clearTimeout(timeoutId)
      
      if (!response.ok) {
        throw new Error(`Error HTTP: ${response.status} ${response.statusText}`)
      }
      
      const videoBlob = await response.blob()
      
      if (videoBlob.size === 0) {
        throw new Error('Archivo de video vacío')
      }
      
      // Crear enlace de descarga optimizado
      const url = URL.createObjectURL(videoBlob)
      const link = document.createElement('a')
      link.href = url
      link.download = `${video.title || 'video'}.mp4`
      link.target = '_blank'
      link.rel = 'noopener noreferrer'
      
      // Agregar al DOM y hacer clic
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      
      // Limpiar URL
      URL.revokeObjectURL(url)
      
      addToast('✅ Descarga completada exitosamente', 'success')
    } catch (error) {
      console.error('❌ Error en descarga:', error)
      
      if (error.name === 'AbortError') {
        addToast('❌ Descarga cancelada por timeout (30s)', 'error')
      } else {
        addToast(`❌ Error al descargar: ${error.message}`, 'error')
      }
    }
  }

  // Función para eliminar video
  const handleDeleteVideo = async (video) => {
    try {
      // Eliminar de Firebase Storage
      const storageResult = await deleteVideo(video.videoPath, video.thumbnailPath)
      
      // Si hay error al eliminar archivos, intentar solo eliminar el video
      if (!storageResult.success) {
        
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
      const firestoreResult = await deleteVideoDocument(video.id, 'escuela')
      
      if (!firestoreResult.success) {
        addToast(`Error al eliminar metadatos: ${firestoreResult.error}`, 'error')
        return
      }

      // Actualizar lista local
      setVideos(prev => {
        const newVideos = prev.filter(v => v.id !== video.id)
        return newVideos
      })
      
      addToast(`${video.title} eliminado correctamente`, 'success')
      
      // Cerrar modal de eliminación
      setDeleteModal({ isOpen: false, video: null })
    } catch (error) {
      console.error('❌ Error deleting video:', error)
      addToast('Error inesperado al eliminar video', 'error')
    }
  }

  // Función para abrir modal de eliminación
  const openDeleteModal = (video) => {
    setDeleteModal({ isOpen: true, video })
  }

  // Función para cerrar modal de eliminación
  const closeDeleteModal = () => {
    setDeleteModal({ isOpen: false, video: null })
  }

  // Función para manejar likes
  const handleVideoLike = async (video) => {
    if (!user) {
      addToast('Debes iniciar sesión para dar like', 'error')
      return
    }

    try {
      const result = await toggleVideoLike(video.id, user.uid, 'escuela')
      
      if (result.success) {
        // Actualizar el video en el estado local
        setVideos(prevVideos => 
          prevVideos.map(v => 
            v.id === video.id 
              ? { 
                  ...v, 
                  likes: result.likes, 
                  likedBy: result.likedBy,
                  userLiked: result.userLiked,
                  isFavorite: result.isFavorite
                }
              : v
          )
        )
        
        const action = result.userLiked ? 'dado like a' : 'quitado like de'
        const favoriteAction = result.isFavorite ? 'y agregado a favoritos' : 'y removido de favoritos'
        addToast(`Has ${action} "${video.title}" ${favoriteAction}`, 'success')
      } else {
        addToast('Error al actualizar like', 'error')
      }
    } catch (error) {
      console.error('Error al manejar like:', error)
      addToast('Error al actualizar like', 'error')
    }
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

  // Función para limpiar filtros de búsqueda y tags (mantiene el estilo actual)
  const clearFilters = () => {
    setSelectedTags([])
    setSearchTerm('')
    setActiveCategoryChips([])
    setSortKey('none'); setSortDir('asc')
    setShowFavorites(false)
    // NO cambiar el estilo seleccionado - mantener el estilo actual
  }

  // Función para resetear todas las preferencias de filtros
  const resetAllFilterPreferences = () => {
    setSelectedTags([])
    setSearchTerm('')
    setShowFilters(false)
    setActiveCategoryChips([])
    setSortKey('none'); setSortDir('asc')
    setShowFavorites(false)
    // NO cambiar el estilo seleccionado - mantener el estilo actual
    // setSelectedStyle('salsa') // Comentado para mantener el estilo actual
    
    // Limpiar localStorage
    try {
      localStorage.removeItem('escuela-filters')
    } catch (error) {
      console.warn('No se pudieron limpiar las preferencias:', error)
    }
  }

  // Funciones de ordenamiento y favoritos
  const handleSortChange = () => {}

  const handleShowFavorites = (show) => {
    setShowFavorites(show)
  }

  // Función para ordenar videos
  const sortVideos = (videosToSort) => {
    if (sortKey === 'none') return videosToSort
    const dir = sortDir === 'asc' ? 1 : -1
    const sorted = [...videosToSort]
    switch (sortKey) {
      case 'name':
        return sorted.sort((a, b) => dir * a.title.localeCompare(b.title))
      case 'rating':
        return sorted.sort((a, b) => dir * ((a.rating || 0) - (b.rating || 0)))
      case 'likes':
        return sorted.sort((a, b) => dir * ((a.likes || 0) - (b.likes || 0)))
      default:
        return videosToSort
    }
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

  // Función para verificar si un video tiene tags de categoría específica
  const hasCategoryTags = (video, categoryKey) => {
    if (!video.tags) return false
    
    // Buscar en las categorías dinámicas del hook useCategories
    const category = categoriesList.find(cat => cat.key === categoryKey)
    if (!category) return false
    
    // Verificar si el video tiene tags para esta categoría
    const categoryTags = video.tags[categoryKey]
    return categoryTags && Array.isArray(categoryTags) && categoryTags.length > 0
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

  // Filtrar videos basado en tags seleccionados y búsqueda avanzada
  const baseFilteredVideos = videos.filter(video => {
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

      // Filtro por chips de categorías
  const categoryMatch = activeCategoryChips.length === 0 || 
    activeCategoryChips.some(chip => hasCategoryTags(video, chip))

  // Filtro por favoritos
  const favoritesMatch = !showFavorites || video.isFavorite

  return searchMatch && tagsMatch && categoryMatch && favoritesMatch
  })

  // Aplicar ordenamiento final
  const filteredVideos = sortVideos(baseFilteredVideos)

  return (
    <div className="min-h-screen bg-white">
      {/* Main Content */}
      <div className={`${isFullWidth ? 'w-full px-0' : 'max-w-6xl mx-auto px-6'} py-8`}>
        {/* Title */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-2">
            <span className="text-purple-500">ESCUELA</span>
            <span className={`bg-gradient-to-r ${getGradientClasses(selectedStyle)} bg-clip-text text-transparent`}> - {selectedStyle.toUpperCase()}</span>
          </h1>
          <p className="text-gray-600 text-lg">Galería de videos de escuela de {selectedStyle.toLowerCase()}</p>
        </div>

        {/* Style Filters */}
        <div className="flex flex-wrap justify-center gap-3 mb-8">
          {availableStyles.map((style) => {
            const IconComponent = iconMap[style.icon]
            const isSelected = selectedStyle === style.key
            // Usar gradientes específicos para cada estilo
            const gradientClass = getGradientClasses(style.color)
            
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
        </div>

        {/* Tag Filters - Collapsible con títulos clickeables */}
        {categoriesList.length > 0 && (
          <div className="mb-8">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center justify-center space-x-2 mx-auto px-6 py-3 bg-gradient-to-r from-gray-100 to-gray-200 text-gray-700 rounded-lg font-medium shadow-md hover:shadow-lg transition-all duration-200 transform hover:scale-105"
            >
              <Filter className="h-5 w-5" />
              <span>Filtros Avanzados por Tags - {selectedStyle}</span>
              {showFilters ? (
                <ChevronUp className="h-5 w-5" />
              ) : (
                <ChevronDown className="h-5 w-5" />
              )}
            </button>
            
            {/* Collapsible Content */}
            <div className={`mt-4 transition-all duration-300 ease-in-out overflow-hidden ${
              showFilters ? 'max-h-screen opacity-100' : 'max-h-0 opacity-0'
            }`}>
              <div className="space-y-4 bg-gray-50 rounded-lg p-6 border border-gray-200 max-h-96 overflow-y-auto">
                {categoriesList.map((category) => (
                  <div key={category.key} className="space-y-2">
                    {/* Título clickeable de categoría */}
                    <button
                      onClick={() => handleCategoryTitleClick(category.key)}
                      className={`w-full text-center font-medium py-2 px-4 rounded-lg transition-all duration-200 transform hover:scale-105 ${
                        activeCategoryChips.includes(category.key)
                          ? `bg-gradient-to-r ${getGradientClasses(selectedStyle)} text-white shadow-lg`
                          : 'bg-white text-gray-700 border border-gray-200 hover:bg-gray-50 hover:border-gray-300'
                      }`}
                    >
                      <div className="flex items-center justify-center space-x-2">
                        <span>{category.name}</span>
                        {activeCategoryChips.includes(category.key) && (
                          <span className="text-xs bg-white bg-opacity-20 px-2 py-1 rounded">
                            ACTIVO
                          </span>
                        )}
                      </div>
                    </button>
                    
                    {/* Tags de la categoría */}
                    <div className="flex flex-wrap justify-center gap-2">
                      {category.tags.map(tag => (
                        <button
                          key={tag}
                          onClick={() => handleTagFilter(tag)}
                          className={`px-3 py-1 rounded-full text-sm font-medium transition-all duration-200 ${
                            selectedTags.includes(tag)
                              ? `bg-gradient-to-r ${getGradientClasses(selectedStyle)} text-white shadow-lg`
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
        {(userProfile?.role === 'maese' || userProfile?.role === 'super_admin') && (
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-6">
            <button 
              onClick={() => setIsUploadModalOpen(true)}
              className={`flex items-center justify-center space-x-2 px-6 py-3 bg-gradient-to-r ${getGradientClasses(selectedStyle)} text-white rounded-lg font-medium shadow-lg hover:shadow-xl transition-colors duration-200`}
            >
              <Upload className="h-5 w-5" />
              <span>SUBIR VIDEO(S) A {selectedStyle.toUpperCase()}</span>
            </button>
          </div>
        )}



        {/* Botones de ordenamiento y favoritos - Debajo de las pestañas */}
        <div className="flex flex-wrap justify-center gap-2 mb-6">
          {/* A-Z tri-estado */}
          <button
            onClick={() => {
              if (sortKey !== 'name') { setSortKey('name'); setSortDir('asc') }
              else if (sortDir === 'asc') { setSortDir('desc') }
              else { setSortKey('none') }
            }}
            className={`flex items-center space-x-1 px-3 py-1.5 rounded-md text-sm font-medium transition-all duration-200 ${
              sortKey === 'name'
                ? `bg-gradient-to-r ${getGradientClasses(selectedStyle)} text-white shadow-md`
                : 'bg-white text-gray-700 border border-gray-200 hover:bg-gray-50'
            }`}
          >
            <span>{sortKey === 'name' ? (sortDir === 'asc' ? 'A-Z' : 'Z-A') : 'A-Z'}</span>
          </button>
          
          {/* Puntuación tri-estado */}
          <button
            onClick={() => {
              if (sortKey !== 'rating') { setSortKey('rating'); setSortDir('desc') }
              else if (sortDir === 'desc') { setSortDir('asc') }
              else { setSortKey('none') }
            }}
            className={`flex items-center space-x-1 px-3 py-1.5 rounded-md text-sm font-medium transition-all duration-200 ${
              sortKey === 'rating'
                ? `bg-gradient-to-r ${getGradientClasses(selectedStyle)} text-white shadow-md`
                : 'bg-white text-gray-700 border border-gray-200 hover:bg-gray-50'
            }`}
          >
            <Star className="h-3 w-3" />
            <span>{sortKey === 'rating' ? (sortDir === 'desc' ? 'Puntuación ↓' : 'Puntuación ↑') : 'Puntuación'}</span>
          </button>
          
          {/* Favoritos (filtro) */}
          <button
            onClick={() => setShowFavorites(prev => !prev)}
            className={`flex items-center space-x-1 px-3 py-1.5 rounded-md text-sm font-medium transition-all duration-200 ${
              showFavorites
                ? `bg-gradient-to-r ${getGradientClasses(selectedStyle)} text-white shadow-md`
                : 'bg-white text-gray-700 border border-gray-200 hover:bg-gray-50'
            }`}
          >
            <Heart className="h-3 w-3" />
            <span>{showFavorites ? 'Ocultar Favoritos' : 'Mostrar Favoritos'}</span>
          </button>

          {/* Orden para favoritos */}
          {showFavorites && (
            <button
              onClick={() => {
                if (sortKey !== 'likes') { setSortKey('likes'); setSortDir('desc') }
                else if (sortDir === 'desc') { setSortDir('asc') }
                else { setSortKey('none') }
              }}
              className={`flex items-center space-x-1 px-3 py-1.5 rounded-md text-sm font-medium transition-all duration-200 ${
                sortKey === 'likes'
                  ? `bg-gradient-to-r ${getGradientClasses(selectedStyle)} text-white shadow-md`
                  : 'bg-white text-gray-700 border border-gray-200 hover:bg-gray-50'
              }`}
              title="Ordenar favoritos"
            >
              <Heart className="h-3 w-3" />
              <span>{sortKey === 'likes' ? (sortDir === 'desc' ? 'Fav ↓' : 'Fav ↑') : 'Orden fav'}</span>
            </button>
          )}

          {/* Botón Limpiar filtros */}
          {(activeCategoryChips.length > 0 || sortKey !== 'none' || showFavorites || selectedTags.length > 0 || searchTerm) && (
            <button
              onClick={clearFilters}
              className="flex items-center space-x-1 px-3 py-1.5 rounded-md text-sm font-medium bg-gray-100 text-gray-600 hover:bg-gray-200 hover:text-gray-800 transition-colors duration-200"
              title="Limpiar filtros de búsqueda, tags y ordenamiento"
            >
              <X className="h-3 w-3" />
              <span>Limpiar filtros</span>
            </button>
          )}
        </div>

        {/* Videos Grid */}
        <div className="mb-8">
            <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-semibold text-gray-800">
                Escuela de {selectedStyle.toLowerCase()} ({filteredVideos.length})
                </h2>
              <div className="flex items-center space-x-4">
                {/* Selector de tamaño de cards */}
                  <CardSizeSelector type="video" styleColor={selectedStyle} />
                
                {/* Botón de modo ancho completo */}
                <button
                  onClick={() => setIsFullWidth(!isFullWidth)}
                  className={`flex items-center space-x-2 px-3 py-2 rounded-lg font-medium transition-all duration-200 ${
                    isFullWidth
                      ? `bg-gradient-to-r ${getGradientClasses(selectedStyle)} text-white shadow-lg`
                      : 'bg-white text-gray-700 border border-gray-200 hover:bg-gray-50 hover:border-gray-300'
                  }`}
                  title={isFullWidth ? "Modo compacto" : "Modo ancho completo"}
                >
                  {isFullWidth ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
                  <span className="hidden sm:inline">
                    {isFullWidth ? "Compacto" : "Ancho"}
                  </span>
                </button>
              </div>
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
              <VideoGridRenderer
                videos={filteredVideos}
                threshold={150}
                cardWidth={
                  getVideoConfig(isFullWidth).compact ? 160 :
                  getVideoConfig(isFullWidth).titleSize === 'text-xs' ? 160 :
                  getVideoConfig(isFullWidth).titleSize === 'text-sm' ? 240 :
                  getVideoConfig(isFullWidth).titleSize === 'text-xl' ? 320 : 450
                }
                cardHeight={getVideoConfig(isFullWidth).compact ? 240 : 380}
                gap={24}
                renderCard={(video) => (
                  <div
                    key={video.id}
                    className="bg-white rounded-lg shadow-md overflow-hidden border hover:shadow-lg transition-all duration-200 transform hover:scale-[1.02] border-gray-100"
                  >
                    <div className="relative group">
                      <div className={`w-full ${getVideoConfig(isFullWidth).aspect} ${getVideoConfig(isFullWidth).thumbnailSize} bg-gradient-to-br from-gray-100 to-gray-200 relative overflow-hidden flex items-center justify-center`}>
                        {video.thumbnailUrl && video.thumbnailUrl !== 'https://via.placeholder.com/400x225/1a1a1a/ffffff?text=VIDEO' ? (
                          <img
                            src={video.thumbnailUrl}
                        alt={video.title}
                            className={`w-full h-full ${getVideoConfig(isFullWidth).imageObject || 'object-cover'}`}
                            loading="lazy"
                            onError={(e) => {
                              e.target.style.display = 'none';
                              e.target.nextSibling.style.display = 'flex';
                            }}
                          />
                        ) : null}
                        <div className={`flex flex-col items-center justify-center text-gray-500 ${video.thumbnailUrl && video.thumbnailUrl !== 'https://via.placeholder.com/400x225/1a1a1a/ffffff?text=VIDEO' ? 'hidden' : 'flex'}`}>
                          <svg className="w-12 h-12 mb-2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 002 2v8a2 2 0 002 2z" />
                          </svg>
                          <span className="text-sm font-medium">{video.title}</span>
                        </div>
                        <div className="absolute bottom-2 left-2 bg-black bg-opacity-75 text-white px-2 py-1 rounded text-sm font-medium">
                          {video.resolution && video.resolution !== 'Unknown' ? video.resolution : 'HD'}
                      </div>
                      
                        {/* Botón de play */}
                          <button
                          onClick={() => handlePlayVideo(video)}
                          className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-0 hover:bg-opacity-30 transition-all duration-200 group"
                        >
                          <div className="w-16 h-16 rounded-full bg-white bg-opacity-90 flex items-center justify-center transform scale-0 group-hover:scale-100 transition-transform duration-200">
                            <Play className="w-8 h-8 text-gray-800 ml-1" />
                          </div>
                          </button>
                      </div>
                      
                      {/* Contenido de la card */}
                      <div className={`${getVideoConfig(isFullWidth).compact ? 'p-2' : 'p-4'}`}>
                        <div className={`flex items-center justify-between ${getVideoConfig(isFullWidth).compact ? 'mb-1' : 'mb-2'}`}>
                          <h3 className={`font-semibold text-gray-800 ${getVideoConfig(isFullWidth).titleSize}`}>{video.title}</h3>
                          <div className="flex items-center space-x-1">
                            {[1, 2, 3, 4, 5].map(star => {
                              const isFilled = (video.rating || 0) >= star
                              return (
                                <svg 
                                  key={star}
                                  className={`${getVideoConfig(isFullWidth).compact ? 'h-3 w-3' : 'h-4 w-4'} ${isFilled ? 'text-yellow-400 fill-current' : 'text-gray-300'} cursor-pointer`} 
                                  fill="currentColor" 
                                  viewBox="0 0 24 24"
                                  onClick={async () => {
                                    try {
                                      const currentRating = video.rating || 0
                                      const newRating = currentRating >= star ? 0 : star
                                      await updateVideoDocument(video.id, { rating: newRating }, 'escuela')
                                      video.rating = newRating
                                    } catch (error) {
                                      console.error('Error updating rating:', error)
                                    }
                                  }}
                                >
                                  <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                                </svg>
                              )
                            })}
                            <span className={`${getVideoConfig(isFullWidth).compact ? 'text-xs' : 'text-xs'} font-medium text-gray-500 ml-1`}>({video.rating || 0})</span>
                        </div>
                      </div>
                        <p className={`text-gray-600 text-sm ${getVideoConfig(isFullWidth).compact ? 'mb-2' : 'mb-3'} ${getVideoConfig(isFullWidth).descriptionLines === 1 ? 'line-clamp-1' : getVideoConfig(isFullWidth).descriptionLines === 2 ? 'line-clamp-2' : getVideoConfig(isFullWidth).descriptionLines === 3 ? 'line-clamp-3' : 'line-clamp-4'}`}>{video.description || 'Sin descripción'}</p>
                        
                        {/* Tags Normales */}
                        {getVideoConfig(isFullWidth).showTags && (
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
                        )}
                        
                        {/* Información del video y acciones */}
                        {getVideoConfig(isFullWidth).compact ? (
                      <CompactCardActions
                        video={video}
                            onLike={() => handleVideoLike(video)}
                        onEdit={() => openEditModal(video)}
                        onDelete={() => openDeleteModal(video)}
                        onDownload={userProfile?.role === 'maese' || userProfile?.role === 'super_admin' ? () => downloadVideo(video) : undefined}
                            onPlay={() => handlePlayVideo(video)}
                            type="video"
                          />
                        ) : (
                          <div className="flex items-center justify-between text-sm text-gray-500">
            <div className="flex items-center space-x-2">
                              <span className="font-medium">
                                {(video.fileSize / (1024 * 1024)).toFixed(2)} MB
              </span>

            </div>
                            <div className="flex items-center space-x-2">
              <button
                                onClick={() => handlePlayVideo(video)}
                                className="text-gray-400 hover:text-blue-500 transition-colors duration-200 p-1 rounded hover:bg-blue-50"
                                title="Reproducir video"
                              >
                                <Play className="h-4 w-4" />
              </button>
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

              {(userProfile?.role === 'maese' || userProfile?.role === 'super_admin') && (
                <button
                  onClick={() => {
                    downloadVideo(video)
                  }}
                  className="text-gray-400 hover:text-green-500 transition-colors duration-200 p-1 rounded hover:bg-green-50"
                  title="Descargar video"
                >
                  <Download className="h-4 w-4" />
                </button>
              )}
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
                        )}
        </div>
                    </div>
                  </div>
                )}
              />
            )}
          </div>



      </div>

        {/* Video Upload Modal */}
      <Suspense fallback={<LoadingSpinner />}>
          <VideoUploadModal
            isOpen={isUploadModalOpen}
            onClose={() => setIsUploadModalOpen(false)}
            onVideoUploaded={handleVideoUploaded}
            page="escuela"
          style={selectedStyle}
          />
      </Suspense>

        {/* Video Edit Modal */}
      <Suspense fallback={<LoadingSpinner />}>
          <VideoEditModal
            isOpen={editModal.isOpen}
            onClose={closeEditModal}
            video={editModal.video}
            onVideoUpdated={handleVideoUpdated}
          page="escuela"
          style={selectedStyle}
        />
      </Suspense>

      {/* Video Player Modal */}
      {showVideoPlayer && selectedVideo && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
          <div className="relative w-full max-w-3xl h-auto max-h-[85vh] bg-white rounded-lg overflow-hidden flex flex-col">
            {/* Header */}
            <div className="flex items-center justify-between p-4 bg-gray-50 border-b flex-shrink-0">
              <h3 className="text-lg font-semibold text-gray-800">
                🎬 {selectedVideo.title}
              </h3>
              <button
                onClick={() => {
                  setShowVideoPlayer(false)
                  setSelectedVideo(null)
                }}
                className="text-gray-500 hover:text-gray-700 transition-colors"
              >
                <X className="h-6 w-6" />
              </button>
            </div>
            
            {/* Video Player */}
            <div className="flex-1 min-h-0 p-4">
              <div className="w-full h-full max-h-[65vh] flex items-center justify-center">
                <div className="w-full max-w-md">
                  <Suspense fallback={<LoadingSpinner />}>
                    <SequenceVideoPlayer
                      videos={[selectedVideo]}
                      className="w-full h-full"
                      showControls={true}
                      autoplay={true}
                      loop={false}
                      muted={false}
                    />
                  </Suspense>
                </div>
              </div>
              {/* Comments Section */}
              <div className="mt-4 border-t pt-3">
                <Suspense fallback={null}>
                  <CommentsSection videoId={selectedVideo.id} page="escuela" />
                </Suspense>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Confirm Delete Modal */}
      <Suspense fallback={<LoadingSpinner />}>
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
      </Suspense>

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
