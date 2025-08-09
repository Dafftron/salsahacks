import React, { useState, useEffect, lazy, Suspense } from 'react'
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
  createSequence,
  getSequencesByStyle,
  deleteSequence,
  subscribeToSequencesByStyle,
  updateSequence
} from '../services/firebase/sequences'
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

// Componente de carga para lazy loading
const LoadingSpinner = () => (
  <div className="flex items-center justify-center py-8">
    <Loader className="w-6 h-6 animate-spin text-blue-500" />
    <span className="ml-2 text-gray-600">Cargando...</span>
  </div>
)

const EscuelaPage = () => {
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
  const [activeCategoryChips, setActiveCategoryChips] = useState([])
  const [sortBy, setSortBy] = useState('none')
  const [showFavorites, setShowFavorites] = useState(false)
  
  // Estados para secuencias
  const [sequences, setSequences] = useState([])
  const [sequencesLoading, setSequencesLoading] = useState(true)
  
  const { user } = useAuth()
  const { getVideoConfig, getSequenceConfig } = useCardSize()
  
  // Usar el contexto de constructor de secuencias
  const {
    addVideoToSequence,
    removeVideoFromSequence,
    sequence,
    sequenceName,
    clearSequence,
    isBuilderOpen,
    toggleBuilder,
    showAllVideos,
    toggleShowAllVideos,
    getFilteredVideos,
    isVideoInSequence,
    isVideoCompatible,
    checkCompatibility,
    loadSequence
  } = useSequenceBuilderContext()

  // Estado local para el estilo seleccionado - CAMBIO PARA ESCUELA
  const [selectedStyle, setSelectedStyle] = useState('escuela')
  
  // Usar el sistema de categorías con estilo dinámico - CAMBIO PARA ESCUELA
  const { 
    availableStyles,
    getGradientClasses,
    categoriesList, 
    getColorClasses
  } = useCategories('escuela', selectedStyle)
  
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

  // Función para añadir video al constructor
  const handleAddVideoToSequence = (video) => {
    addVideoToSequence(video)
    if (!isBuilderOpen) {
      toggleBuilder()
    }
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
    })
    
    // Cleanup al desmontar o cambiar estilo
    return () => {
      unsubscribe()
    }
  }, [selectedStyle])

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

  // Sincronización en tiempo real para secuencias
  useEffect(() => {
    if (!selectedStyle) {
      return
    }
    
    setSequencesLoading(true)
    
    try {
      // Suscribirse a cambios en tiempo real para las secuencias del estilo seleccionado
      const unsubscribe = subscribeToSequencesByStyle(selectedStyle, (sequencesData) => {
        setSequences(sequencesData)
        setSequencesLoading(false)
      })
      
      // Cleanup al desmontar o cambiar estilo
      return () => {
        unsubscribe()
      }
    } catch (error) {
      console.error('❌ Error al suscribirse a secuencias:', error)
      setSequencesLoading(false)
    }
  }, [selectedStyle])

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

  // Función para manejar likes
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

  // Funciones para manejar secuencias
  const handleSaveSequence = async (sequenceData) => {
    try {
      const sequenceWithStyle = {
        ...sequenceData,
        style: selectedStyle
      }
      
      // Verificar si es una edición o una nueva secuencia
      if (sequenceData.id) {
        // Es una edición - actualizar secuencia existente
        const result = await updateSequence(sequenceData.id, sequenceWithStyle)
        addToast('✅ Secuencia actualizada exitosamente')
      } else {
        // Es una nueva secuencia - crear nueva
        const result = await createSequence(sequenceWithStyle)
        addToast('✅ Secuencia guardada exitosamente. Ve a "GALERÍA DE SECUENCIAS" para verla.')
      }
    } catch (error) {
      console.error('❌ Error al guardar secuencia:', error)
      addToast('Error al guardar la secuencia', 'error')
      throw error
    }
  }

  // Handlers para el reproductor de videos
  const handlePlayVideo = (video) => {
    setSelectedVideo(video)
    setShowVideoPlayer(true)
  }

  const handleCloseVideoPlayer = () => {
    setSelectedVideo(null)
    setShowVideoPlayer(false)
  }

  // Handlers para el reproductor de secuencias
  const handlePlaySequence = (sequence) => {
    setSelectedSequence(sequence)
    setShowSequencePlayer(true)
  }

  const handleCloseSequencePlayer = () => {
    setSelectedSequence(null)
    setShowSequencePlayer(false)
  }

  // Función para eliminar video
  const handleDeleteVideo = async (video) => {
    try {
      await deleteVideoDocument(video.id, user?.uid)
      await deleteVideo(video.filePath)
      addToast(`"${video.title}" eliminado exitosamente`, 'success')
    } catch (error) {
      console.error('Error al eliminar video:', error)
      addToast('Error al eliminar el video', 'error')
    }
  }

  // Funciones para modal de eliminar
  const openDeleteModal = (video) => {
    setDeleteModal({ isOpen: true, video })
  }

  const closeDeleteModal = () => {
    setDeleteModal({ isOpen: false, video: null })
  }

  // Funciones de filtrado y búsqueda
  const handleTagFilter = (tag) => {
    setSelectedTags(prev => {
      const newTags = prev.includes(tag) 
        ? prev.filter(t => t !== tag)
        : [...prev, tag]
      return newTags
    })
  }

  const clearFilters = () => {
    setSelectedTags([])
    setSearchTerm('')
    setActiveCategoryChips([])
    setShowFavorites(false)
    setSortBy('none')
  }

  const handleCategoryChipFilter = (categoryKey) => {
    setActiveCategoryChips(prev => {
      if (prev.includes(categoryKey)) {
        return prev.filter(chip => chip !== categoryKey)
      }
      return [...prev, categoryKey]
    })
  }

  const handleSortChange = (newSortBy) => {
    setSortBy(newSortBy)
  }

  const handleShowFavorites = () => {
    setShowFavorites(prev => !prev)
  }

  // Función para verificar si un video tiene tags de una categoría específica
  const hasCategoryTags = (video, categoryKey) => {
    if (!video.tags || !video.tags[categoryKey]) return false
    return Array.isArray(video.tags[categoryKey]) && video.tags[categoryKey].length > 0
  }

  // Función de ordenamiento
  const sortVideos = (videos) => {
    if (sortBy === 'none') return videos
    
    return [...videos].sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return (a.title || '').localeCompare(b.title || '')
        case 'name-desc':
          return (b.title || '').localeCompare(a.title || '')
        case 'rating':
          return (a.rating || 0) - (b.rating || 0)
        case 'rating-desc':
          return (b.rating || 0) - (a.rating || 0)
        case 'likes':
          return (a.likes || 0) - (b.likes || 0)
        case 'likes-desc':
          return (b.likes || 0) - (a.likes || 0)
        default:
          return 0
      }
    })
  }

  // Función para obtener tags ordenados según el orden de categorías
  const getOrderedTags = (video) => {
    if (!video.tags || Object.keys(video.tags).length === 0) {
      return []
    }

    // Crear array de tags ordenados según el orden de categoriesList
    const orderedTags = []
    
    categoriesList.forEach(category => {
      if (video.tags[category.key] && Array.isArray(video.tags[category.key])) {
        video.tags[category.key].forEach(tag => {
          orderedTags.push({
            tag,
            category: category.key,
            categoryName: category.name,
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
      if (video.tagsIniciales[category.key] && Array.isArray(video.tagsIniciales[category.key])) {
        video.tagsIniciales[category.key].forEach(tag => {
          orderedTags.push({
            tag,
            category: category.key,
            categoryName: category.name,
            color: category.color
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
      if (video.tagsFinales[category.key] && Array.isArray(video.tagsFinales[category.key])) {
        video.tagsFinales[category.key].forEach(tag => {
          orderedTags.push({
            tag,
            category: category.key,
            categoryName: category.name,
            color: category.color
          })
        })
      }
    })

    return orderedTags
  }

  // Función para normalizar texto
  const normalizeText = (text) => {
    return text.toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9\s]/g, '')
  }

  // Función de búsqueda avanzada
  const advancedSearch = (video, searchTerms) => {
    if (searchTerms.length === 0) return true
    
    const normalizedTitle = normalizeText(video.title || '')
    const normalizedDescription = normalizeText(video.description || '')
    const normalizedTags = (video.tags ? Object.values(video.tags).flat() : []).map(normalizeText)
    const normalizedTagsIniciales = (video.tagsIniciales ? Object.values(video.tagsIniciales).flat() : []).map(normalizeText)
    const normalizedTagsFinales = (video.tagsFinales ? Object.values(video.tagsFinales).flat() : []).map(normalizeText)
    
    return searchTerms.every(term => {
      const normalizedTerm = normalizeText(term)
      return normalizedTitle.includes(normalizedTerm) ||
             normalizedDescription.includes(normalizedTerm) ||
             normalizedTags.some(tag => tag.includes(normalizedTerm)) ||
             normalizedTagsIniciales.some(tag => tag.includes(normalizedTerm)) ||
             normalizedTagsFinales.some(tag => tag.includes(normalizedTerm))
    })
  }

  // Aplicar filtros y búsqueda
  const filteredVideos = videos.filter(video => {
    // Filtro por búsqueda
    const searchTerms = searchTerm.trim().split(/\s+/).filter(term => term.length > 0)
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

  // Aplicar ordenamiento
  const sortedAndFilteredVideos = sortVideos(filteredVideos)

  // Función para descargar video
  const downloadVideo = async (video) => {
    try {
      const response = await fetch(video.videoUrl)
      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.style.display = 'none'
      a.href = url
      a.download = `${video.title}.mp4`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
      addToast(`Descargando "${video.title}"...`, 'success')
    } catch (error) {
      console.error('Error al descargar video:', error)
      addToast('Error al descargar el video', 'error')
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Main Content */}
      <div className={`${isFullWidth ? 'w-full px-0' : 'max-w-6xl mx-auto px-6'} py-8`}>
        {/* Title */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-2">
            <span className="text-pink-500">ESCUELA</span>
            <span className={`bg-gradient-to-r ${getGradientClasses(selectedStyle)} bg-clip-text text-transparent`}> - {selectedStyle.toUpperCase()}</span>
          </h1>
          <p className="text-gray-600 text-lg">Galería de videos de escuela de {selectedStyle.toLowerCase()}</p>
        </div>

        {/* Style Selector */}
        <div className="flex flex-wrap justify-center gap-3 mb-8">
          {availableStyles.map((style) => {
            const IconComponent = iconMap[style.icon] || Music
            const isSelected = selectedStyle === style.key
            const gradientClass = getGradientClasses(style.color)
            
            return (
              <button
                key={style.name}
                onClick={() => setSelectedStyle(style.key)}
                className={`relative flex items-center space-x-2 px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
                  isSelected
                    ? `bg-gradient-to-r ${gradientClass} text-white shadow-lg transform scale-105 ring-2 ring-white ring-opacity-20`
                    : `bg-white text-gray-700 border-2 border-transparent hover:border-gray-200 hover:shadow-md`
                }`}
              >
                <IconComponent className="h-5 w-5" />
                <span className="text-sm uppercase font-bold">{style.name}</span>
                {isSelected && (
                  <div className="absolute inset-0 bg-gradient-to-r from-white/10 to-transparent rounded-lg pointer-events-none"></div>
                )}
              </button>
            )
          })}
        </div>

        {/* Search and Filters */}
        <div className="mb-6 space-y-4">
          {/* Search Bar */}
          <div className="flex items-center justify-center">
            <div className="relative max-w-md w-full">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <input
                type="text"
                placeholder="Buscar por título, descripción o tags..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* Filters Toggle */}
          <div className="flex justify-center">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center space-x-2 px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors duration-200"
            >
              <Filter className="h-4 w-4" />
              <span>Filtros avanzados</span>
              {showFilters ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
            </button>
          </div>

          {/* Advanced Filters */}
          {showFilters && (
            <div className="bg-gray-50 rounded-lg p-4 space-y-4">
              {/* Category Filter */}
              <div>
                <h3 className="text-sm font-medium text-gray-700 mb-2">Filtrar por categorías:</h3>
                <div className="flex flex-wrap gap-2">
                  {categoriesList.map((category) => (
                    <button
                      key={category.key}
                      onClick={() => handleCategoryChipFilter(category.key)}
                      className={`px-3 py-1 rounded-full text-xs font-medium transition-colors duration-200 ${
                        activeCategoryChips.includes(category.key)
                          ? `${getColorClasses(category.color)} text-white`
                          : `${getColorClasses(category.color)} hover:bg-opacity-80`
                      }`}
                    >
                      {category.name}
                    </button>
                  ))}
                </div>
              </div>

              {/* Tag Filter */}
              <CategoryChips
                videos={videos}
                selectedTags={selectedTags}
                onTagFilter={handleTagFilter}
                categoriesList={categoriesList}
                getColorClasses={getColorClasses}
              />

              {/* Clear Filters */}
              <div className="flex justify-center">
                <button
                  onClick={clearFilters}
                  className="text-sm text-gray-600 hover:text-gray-800 underline"
                >
                  Limpiar todos los filtros
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Action Buttons - Main Level */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center mb-6">
          <button 
            onClick={() => setIsUploadModalOpen(true)}
            className={`flex items-center justify-center space-x-2 px-6 py-3 bg-gradient-to-r ${getGradientClasses(selectedStyle)} text-white rounded-lg font-medium shadow-lg hover:shadow-xl transition-colors duration-200`}
          >
            <Upload className="h-5 w-5" />
            <span>SUBIR VIDEO(S) A {selectedStyle.toUpperCase()}</span>
          </button>
          <button 
            onClick={toggleBuilder}
            className={`flex items-center justify-center space-x-2 px-6 py-3 rounded-lg font-medium shadow-lg hover:shadow-xl transition-colors duration-200 ${
              isBuilderOpen 
                ? 'bg-gradient-to-r from-red-500 to-pink-500 text-white' 
                : `bg-gradient-to-r ${getGradientClasses(selectedStyle)} hover:opacity-90 text-white`
            }`}
          >
            <Shuffle className="h-5 w-5" />
            <span>{isBuilderOpen ? 'OCULTAR SECUENCIA' : 'CREAR SECUENCIA'}</span>
          </button>
        </div>

        {/* Sequence Builder - Collapsible */}
        {isBuilderOpen && (
          <Suspense fallback={<LoadingSpinner />}>
            <SequenceBuilder
              isOpen={true}
              videos={videos}
              onSaveSequence={handleSaveSequence}
              onToggleShowAll={toggleShowAllVideos}
              showAllVideos={showAllVideos}
              style={selectedStyle}
              onToggleBuilder={toggleBuilder}
            />
          </Suspense>
        )}

        {/* Gallery Tabs */}
        <div className="flex justify-center gap-4 mb-6">
          <button
            onClick={() => setActiveTab('videos')}
            className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-medium transition-colors duration-200 ${
              activeTab === 'videos'
                ? `bg-gradient-to-r ${getGradientClasses(selectedStyle)} text-white shadow-lg`
                : 'bg-white text-gray-700 border border-gray-200 hover:bg-gray-50'
            }`}
          >
            <Music className="h-6 w-6" />
            <span>CLASES DE {selectedStyle.toUpperCase()}</span>
          </button>
          <button
            onClick={() => setActiveTab('secuencias')}
            className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-medium transition-colors duration-200 ${
              activeTab === 'secuencias'
                ? `bg-gradient-to-r ${getGradientClasses(selectedStyle)} text-white shadow-lg`
                : 'bg-white text-gray-700 border border-gray-200 hover:bg-gray-50'
            }`}
          >
            <Plus className="h-6 w-6" />
            <span>SECUENCIAS DE {selectedStyle.toUpperCase()} ({sequences.length})</span>
          </button>
        </div>

      </div>

      {/* Toast notifications */}
      <div className="fixed bottom-4 right-4 space-y-2 z-50">
        {toasts.map(toast => (
          <Toast
            key={toast.id}
            message={toast.message}
            type={toast.type}
            onClose={() => removeToast(toast.id)}
          />
        ))}
      </div>
    </div>
  )
}

export default EscuelaPage
