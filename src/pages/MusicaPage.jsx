import React, { useState, useEffect, lazy, Suspense } from 'react'
import { useLocation } from 'react-router-dom'
import { 
  Search,
  Upload,
  Heart,
  Music,
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
  CheckCircle,
  BookOpen,
  EyeOff,
  Loader,
  Share2
} from 'lucide-react'
import CardSizeSelector from '../components/common/CardSizeSelector'
import ConfirmModal from '../components/common/ConfirmModal'
import Toast from '../components/common/Toast'
import { useCardSize } from '../contexts/CardSizeContext'
import { useAuth } from '../contexts/AuthContext'
import { useCategories } from '../hooks/useCategories'
import VideoGridRenderer from '../components/gallery/VideoGridRenderer'
import ShareVideoModal from '../components/common/ShareVideoModal'
import { ref, getDownloadURL } from 'firebase/storage'
import { storage } from '../services/firebase/config'
import { 
  subscribeToVideosByStyle,
  deleteVideoDocument,
  updateVideoDocument,
  toggleVideoLike,
  checkUserLikedVideo,
  checkUserFavorite,
  toggleUserHiddenVideo,
  checkUserHiddenVideo
} from '../services/firebase/firestore'
import { deleteVideo } from '../services/firebase/storage'

const VideoUploadModal = lazy(() => import('../components/video/VideoUploadModal'))
const VideoEditModal = lazy(() => import('../components/video/VideoEditModal'))
const SequenceVideoPlayer = lazy(() => import('../components/sequence/SequenceVideoPlayer'))

const LoadingSpinner = () => (
  <div className="flex items-center justify-center py-8">
    <Loader className="w-6 h-6 animate-spin text-blue-500" />
    <span className="ml-2 text-gray-600">Cargando...</span>
  </div>
)

const loadFilterPreference = (key, defaultValue) => {
  try {
    const saved = localStorage.getItem('musica-filters')
    const parsed = saved ? JSON.parse(saved) : {}
    return parsed[key] ?? defaultValue
  } catch (error) {
    return defaultValue
  }
}

const MusicaPage = () => {
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
  const [isFullWidth, setIsFullWidth] = useState(false)

  const [selectedVideo, setSelectedVideo] = useState(null)
  const [showVideoPlayer, setShowVideoPlayer] = useState(false)
  const [shareState, setShareState] = useState({ isOpen: false, video: null })
  const [lastWatched, setLastWatched] = useState(null)
  const location = useLocation()

  const [activeCategoryChips, setActiveCategoryChips] = useState(() => loadFilterPreference('activeCategoryChips', []))
  const [sortKey, setSortKey] = useState(() => loadFilterPreference('sortKey', 'none'))
  const [sortDir, setSortDir] = useState(() => loadFilterPreference('sortDir', 'asc'))
  const [showFavorites, setShowFavorites] = useState(() => loadFilterPreference('showFavorites', false))
  const [showHiddenVideos, setShowHiddenVideos] = useState(() => loadFilterPreference('showHiddenVideos', false))

  const { user, userProfile } = useAuth()
  const { getVideoConfig } = useCardSize()

  // Estilo seleccionado
  const [selectedStyle, setSelectedStyle] = useState(() => loadFilterPreference('selectedStyle', 'salsa'))

  // Usar la estructura de categorías de la página MÚSICA
  const { availableStyles, getGradientClasses, categoriesList, getColorClasses } = useCategories('musica', selectedStyle)

  useEffect(() => {
    setLoading(true)
    const unsubscribe = subscribeToVideosByStyle(selectedStyle, (videosData) => {
      setVideos((prev) => videosData.map((v) => {
        const prevItem = prev.find((p) => p.id === v.id)
        return prevItem ? { ...v, userLiked: prevItem.userLiked, isFavorite: prevItem.isFavorite, isInStudy: prevItem.isInStudy, isCompleted: prevItem.isCompleted } : v
      }))
      setLoading(false)
    }, 'musica')
    return () => unsubscribe()
  }, [selectedStyle])

  useEffect(() => {
    const filters = {
      selectedStyle,
      selectedTags,
      searchTerm,
      showFilters,
      activeCategoryChips,
      sortKey,
      sortDir,
      showFavorites,
      showHiddenVideos
    }
    try { localStorage.setItem('musica-filters', JSON.stringify(filters)) } catch (_) {}
  }, [selectedStyle, selectedTags, searchTerm, showFilters, activeCategoryChips, sortKey, sortDir, showFavorites, showHiddenVideos])

  useEffect(() => {
    if (videos.length > 0 && user) {
      const checkUserStates = async () => {
        const updatedVideos = await Promise.all(videos.map(async (video) => {
          try {
            const { checkUserStudy, checkUserStudyCompleted } = await import('../services/firebase/firestore')
            const [likeResult, favoriteResult, studyResult, completedResult, hiddenResult] = await Promise.all([
              checkUserLikedVideo(video.id, user.uid),
              checkUserFavorite(video.id, user.uid),
              checkUserStudy(video.id, user.uid),
              checkUserStudyCompleted(video.id, user.uid),
              checkUserHiddenVideo(video.id, user.uid)
            ])
            return { ...video, userLiked: likeResult.userLiked, isFavorite: favoriteResult.isFavorite, isInStudy: studyResult.isInStudy, isCompleted: completedResult.isCompleted, userHidden: hiddenResult.isHidden }
          } catch (e) {
            return { ...video, userLiked: false, isFavorite: false, isInStudy: false, isCompleted: false, userHidden: false }
          }
        }))
        setVideos(updatedVideos)
      }
      checkUserStates()
    }
  }, [videos.length, user])

  // Reanudar con ?play=id (alineado con Escuela/Eventos)
  useEffect(() => {
    const params = new URLSearchParams(location.search)
    const playId = params.get('play')
    if (playId && Array.isArray(videos) && videos.length > 0) {
      const v = videos.find(x => x.id === playId)
      if (v) handlePlayVideo(v)
    }
  }, [location.search, videos])

  const addToast = (message, type = 'success') => {
    const id = (typeof crypto !== 'undefined' && crypto.randomUUID) ? crypto.randomUUID() : `${Date.now()}-${Math.random()}`
    setToasts(prev => [...prev, { id, message, type }])
  }
  const removeToast = (id) => setToasts(prev => prev.filter(t => t.id !== id))

  const handleCategoryTitleClick = (categoryKey) => {
    setActiveCategoryChips(prev => prev.includes(categoryKey) ? prev.filter(chip => chip !== categoryKey) : [...prev, categoryKey])
  }

  const handleTagFilter = (tag) => {
    setSelectedTags(prev => prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag])
  }

  const clearFilters = () => {
    setSelectedTags([])
    setSearchTerm('')
    setActiveCategoryChips([])
    setSortKey('none'); setSortDir('asc')
    setShowFavorites(false)
    setShowHiddenVideos(false)
  }

  const normalizeText = (text) => text.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').trim()
  const advancedSearch = (video, searchTerms) => {
    if (!searchTerms || searchTerms.length === 0) return true
    const normalizedTitle = normalizeText(video.title || '')
    const normalizedDescription = normalizeText(video.description || '')
    const normalizedTags = []
    if (video.tags) {
      Object.values(video.tags).forEach(arr => { if (Array.isArray(arr)) arr.forEach(t => normalizedTags.push(normalizeText(t))) })
    }
    return searchTerms.every(word => {
      const w = normalizeText(word)
      return normalizedTitle.includes(w) || normalizedDescription.includes(w) || normalizedTags.some(t => t.includes(w))
    })
  }

  const hasCategoryTags = (video, categoryKey) => {
    if (!video.tags) return false
    const category = categoriesList.find(cat => cat.key === categoryKey)
    if (!category) return false
    const categoryTags = video.tags[categoryKey]
    return categoryTags && Array.isArray(categoryTags) && categoryTags.length > 0
  }

  const getOrderedTags = (video) => {
    if (!video.tags || Object.keys(video.tags).length === 0) return []
    const orderedTags = []
    categoriesList.forEach(category => {
      const categoryTags = video.tags[category.key]
      if (Array.isArray(categoryTags)) {
        categoryTags.forEach(tag => {
          orderedTags.push({ tag, categoryKey: category.key, color: category.color })
        })
      }
    })
    return orderedTags
  }

  const baseFilteredVideos = videos.filter(video => {
    const isSuperAdmin = userProfile?.role === 'super_admin'
    const searchTerms = searchTerm.split(' ').map(t => t.trim()).filter(Boolean)
    const searchMatch = advancedSearch(video, searchTerms)
    const isHidden = Array.isArray(video?.tags?.tipo) && video.tags.tipo.includes('oculto')
    const visibilityMatch = isSuperAdmin || !isHidden
    const tagsMatch = selectedTags.length === 0 || selectedTags.every(tag => {
      if (video.tags) {
        return Object.values(video.tags).some(categoryTags => Array.isArray(categoryTags) && categoryTags.includes(tag))
      }
      return false
    })
    const categoryMatch = activeCategoryChips.length === 0 || activeCategoryChips.some(chip => hasCategoryTags(video, chip))
    const favoritesMatch = !showFavorites || video.isFavorite
    const hiddenVideosMatch = showHiddenVideos ? video.userHidden : !video.userHidden
    return searchMatch && tagsMatch && categoryMatch && favoritesMatch && visibilityMatch && hiddenVideosMatch
  })

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

  const filteredVideos = sortVideos(baseFilteredVideos)

  const iconMap = { Music, Heart, Star, Zap }

  const handleVideoUploaded = async (video) => { addToast(`${video.title} subido exitosamente`, 'success') }
  const openEditModal = (video) => setEditModal({ isOpen: true, video })
  const closeEditModal = () => setEditModal({ isOpen: false, video: null })
  const handleVideoUpdated = (updatedVideo) => { setVideos(prev => prev.map(v => v.id === updatedVideo.id ? updatedVideo : v)); addToast(`${updatedVideo.title} actualizado exitosamente`, 'success') }

  const handlePlayVideo = async (video) => {
    setSelectedVideo(video)
    setShowVideoPlayer(true)
    try {
      if (user?.uid) {
        const { setUserLastWatched } = await import('../services/firebase/firestore')
        await setUserLastWatched(user.uid, video, 'musica')
      }
    } catch (_) {}
  }

  const handleDeleteVideo = async (video) => {
    try {
      const storageResult = await deleteVideo(video.videoPath, video.thumbnailPath)
      if (!storageResult.success) {
        if (storageResult.error && storageResult.error.includes('thumbnails')) {
          const videoOnlyResult = await deleteVideo(video.videoPath, null)
          if (!videoOnlyResult.success) { addToast(`Error al eliminar archivos: ${storageResult.error}`, 'error'); return }
        } else { addToast(`Error al eliminar archivos: ${storageResult.error}`, 'error'); return }
      }
      const firestoreResult = await deleteVideoDocument(video.id, 'musica')
      if (!firestoreResult.success) { addToast(`Error al eliminar metadatos: ${firestoreResult.error}`, 'error'); return }
      setVideos(prev => prev.filter(v => v.id !== video.id))
      addToast(`${video.title} eliminado correctamente`, 'success')
      setDeleteModal({ isOpen: false, video: null })
    } catch (e) { addToast('Error inesperado al eliminar video', 'error') }
  }

  const handleVideoLike = async (video) => {
    if (!user) { addToast('Debes iniciar sesión para dar like', 'error'); return }
    try {
      const result = await toggleVideoLike(video.id, user.uid, 'musica')
      if (result.success) {
        setVideos(prev => prev.map(v => v.id === video.id ? { ...v, likes: result.likes, likedBy: result.likedBy, userLiked: result.userLiked, isFavorite: result.isFavorite } : v))
        const action = result.userLiked ? 'dado like a' : 'quitado like de'
        const favoriteAction = result.isFavorite ? 'y agregado a favoritos' : 'y removido de favoritos'
        addToast(`Has ${action} "${video.title}" ${favoriteAction}`, 'success')
      } else { addToast('Error al actualizar like', 'error') }
    } catch (_) { addToast('Error al actualizar like', 'error') }
  }

  const handleToggleStudy = async (video) => {
    try {
      const { toggleUserStudy } = await import('../services/firebase/firestore')
      const result = await toggleUserStudy(video.id, user.uid, 'musica')
      if (result.success) { setVideos(prev => prev.map(v => v.id === video.id ? { ...v, isInStudy: result.isInStudy } : v)); addToast(result.isInStudy ? 'Añadido a estudios' : 'Quitado de estudios', 'success') }
    } catch (_) { addToast('Error al actualizar estudios', 'error') }
  }

  const handleToggleCompleted = async (video) => {
    try {
      const { setUserStudyCompleted } = await import('../services/firebase/firestore')
      const result = await setUserStudyCompleted(video.id, user.uid, !video.isCompleted)
      if (result.success) { setVideos(prev => prev.map(v => v.id === video.id ? { ...v, isCompleted: result.isCompleted } : v)); addToast(result.isCompleted ? 'Marcado como completado' : 'Marcado como pendiente', 'success') }
    } catch (_) { addToast('Error al actualizar completado', 'error') }
  }

  const handleToggleHiddenVideo = async (video) => {
    if (!user) { addToast('Debes iniciar sesión para ocultar videos', 'error'); return }
    try {
      const result = await toggleUserHiddenVideo(video.id, user.uid)
      if (result.success) { setVideos(prev => prev.map(v => v.id === video.id ? { ...v, userHidden: result.isHidden } : v)); addToast(result.isHidden ? 'Video ocultado' : 'Video mostrado', 'success') }
      else { addToast('Error al ocultar/mostrar video', 'error') }
    } catch (_) { addToast('Error al ocultar/mostrar video', 'error') }
  }

  const openShareModal = (video) => setShareState({ isOpen: true, video })
  const closeShareModal = () => setShareState({ isOpen: false, video: null })

  // Indicador "Visto recientemente"
  const isRecentLastWatched = (lw) => {
    try {
      if (!lw?.watchedAt) return false
      const toMs = (t) => (t?.toMillis ? t.toMillis() : (t instanceof Date ? t.getTime() : new Date(t).getTime()))
      const watched = toMs(lw.watchedAt)
      const fourMonthsMs = 4 * 30 * 24 * 60 * 60 * 1000
      return Date.now() - watched <= fourMonthsMs
    } catch { return false }
  }

  useEffect(() => {
    let mounted = true
    const load = async () => {
      try {
        if (!user?.uid) { setLastWatched(null); return }
        const { getUserLastWatched } = await import('../services/firebase/firestore')
        const res = await getUserLastWatched(user.uid)
        if (mounted) setLastWatched(res.lastWatched || null)
      } catch (_) { if (mounted) setLastWatched(null) }
    }
    load()
    return () => { mounted = false }
  }, [user])

  return (
    <div className="min-h-screen bg-white">
      <div className={`${isFullWidth ? 'w-full px-0' : 'max-w-6xl mx-auto px-6'} py-8`}>
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-2">
            <span className="text-purple-500">MÚSICA</span>
            <span className={`bg-gradient-to-r ${getGradientClasses(selectedStyle)} bg-clip-text text-transparent`}> - {selectedStyle.toUpperCase()}</span>
          </h1>
          <p className="text-gray-600 text-lg">Galería de videos de música de {selectedStyle.toLowerCase()}</p>
        </div>

        <div className="flex flex-wrap justify-center gap-3 mb-8">
          {availableStyles.map((style) => {
            const IconComponent = iconMap[style.icon]
            const isSelected = selectedStyle === style.key
            const gradientClass = getGradientClasses(style.color)
            return (
              <button
                key={style.key}
                onClick={() => setSelectedStyle(style.key)}
                className={`relative flex items-center space-x-2 px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
                  isSelected ? `bg-gradient-to-r ${gradientClass} text-white shadow-lg transform scale-105` : 'bg-white text-gray-700 border border-gray-200 hover:bg-gray-50 hover:border-gray-300'
                }`}
              >
                {IconComponent && <IconComponent className="h-4 w-4" />}
                <span>{style.name}</span>
              </button>
            )
          })}
        </div>

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

        {categoriesList.length > 0 && (
          <div className="mb-8">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center justify-center space-x-2 mx-auto px-6 py-3 bg-gradient-to-r from-gray-100 to-gray-200 text-gray-700 rounded-lg font-medium shadow-md hover:shadow-lg transition-all duration-200 transform hover:scale-105"
            >
              <Filter className="h-5 w-5" />
              <span>Filtros Avanzados por Tags - {selectedStyle}</span>
              {showFilters ? (<ChevronUp className="h-5 w-5" />) : (<ChevronDown className="h-5 w-5" />)}
            </button>
            <div className={`mt-4 transition-all duration-300 ease-in-out overflow-hidden ${showFilters ? 'max-h-screen opacity-100' : 'max-h-0 opacity-0'}`}>
              <div className="space-y-4 bg-gray-50 rounded-lg p-6 border border-gray-200 max-h-96 overflow-y-auto">
                {categoriesList.map((category) => (
                  <div key={category.key} className="space-y-2">
                    <button
                      onClick={() => handleCategoryTitleClick(category.key)}
                      className={`w-full text-center font-medium py-2 px-4 rounded-lg transition-all duration-200 transform hover:scale-105 ${
                        activeCategoryChips.includes(category.key) ? `bg-gradient-to-r ${getGradientClasses(selectedStyle)} text-white shadow-lg` : 'bg-white text-gray-700 border border-gray-200 hover:bg-gray-50 hover:border-gray-300'
                      }`}
                    >
                      <div className="flex items-center justify-center space-x-2">
                        <span>{category.name}</span>
                        {activeCategoryChips.includes(category.key) && (
                          <span className="text-xs bg-white bg-opacity-20 px-2 py-1 rounded">ACTIVO</span>
                        )}
                      </div>
                    </button>
                    <div className="flex flex-wrap justify-center gap-2">
                      {category.tags
                        .filter(tag => {
                          const isSuperAdmin = userProfile?.role === 'super_admin'
                          return isSuperAdmin || tag !== 'oculto'
                        })
                        .map(tag => (
                        <button
                          key={`${category.key}:${tag}`}
                          onClick={() => handleTagFilter(tag)}
                          className={`px-3 py-1 rounded-full text-sm font-medium transition-all duration-200 ${
                            selectedTags.includes(tag) ? `bg-gradient-to-r ${getGradientClasses(selectedStyle)} text-white shadow-lg` : `${getColorClasses(category.color)} hover:bg-opacity-80`
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

        <div className="flex flex-wrap justify-center gap-2 mb-6">
          <button
            onClick={() => { if (sortKey !== 'name') { setSortKey('name'); setSortDir('asc') } else if (sortDir === 'asc') { setSortDir('desc') } else { setSortKey('none') } }}
            className={`flex items-center space-x-1 px-3 py-1.5 rounded-md text-sm font-medium transition-all duration-200 ${
              sortKey === 'name' ? `bg-gradient-to-r ${getGradientClasses(selectedStyle)} text-white shadow-md` : 'bg-white text-gray-700 border border-gray-200 hover:bg-gray-50'
            }`}
          >
            <span>{sortKey === 'name' ? (sortDir === 'asc' ? 'A-Z' : 'Z-A') : 'A-Z'}</span>
          </button>
          <button
            onClick={() => { if (sortKey !== 'rating') { setSortKey('rating'); setSortDir('desc') } else if (sortDir === 'desc') { setSortDir('asc') } else { setSortKey('none') } }}
            className={`flex items-center space-x-1 px-3 py-1.5 rounded-md text-sm font-medium transition-all duration-200 ${
              sortKey === 'rating' ? `bg-gradient-to-r ${getGradientClasses(selectedStyle)} text-white shadow-md` : 'bg-white text-gray-700 border border-gray-200 hover:bg-gray-50'
            }`}
          >
            <Star className="h-3 w-3" />
            <span>{sortKey === 'rating' ? (sortDir === 'desc' ? 'Puntuación ↓' : 'Puntuación ↑') : 'Puntuación'}</span>
          </button>
          <button
            onClick={() => setShowFavorites(prev => !prev)}
            className={`flex items-center space-x-1 px-3 py-1.5 rounded-md text-sm font-medium transition-all duration-200 ${
              showFavorites ? `bg-gradient-to-r ${getGradientClasses(selectedStyle)} text-white shadow-md` : 'bg-white text-gray-700 border border-gray-200 hover:bg-gray-50'
            }`}
          >
            <Heart className="h-3 w-3" />
            <span>{showFavorites ? 'Ocultar Favoritos' : 'Mostrar Favoritos'}</span>
          </button>
          {user && (
            <button
              onClick={() => setShowHiddenVideos(prev => !prev)}
              className={`flex items-center space-x-1 px-3 py-1.5 rounded-md text-sm font-medium transition-all duration-200 ${
                showHiddenVideos ? `bg-gradient-to-r ${getGradientClasses(selectedStyle)} text-white shadow-md` : 'bg-white text-gray-700 border border-gray-200 hover:bg-gray-50'
              }`}
            >
              <EyeOff className="h-3 w-3" />
              <span>{showHiddenVideos ? 'Ocultar Videos Ocultos' : 'Mostrar Videos Ocultos'}</span>
            </button>
          )}
          {(activeCategoryChips.length > 0 || sortKey !== 'none' || showFavorites || showHiddenVideos || selectedTags.length > 0 || searchTerm) && (
            <button
              onClick={clearFilters}
              className="flex items-center space-x-1 px-3 py-1.5 rounded-md text-sm font-medium bg-gray-100 text-gray-600 hover:bg-gray-200 hover:text-gray-800 transition-colors duration-200"
              title="Limpiar filtros"
            >
              <X className="h-3 w-3" />
              <span>Limpiar filtros</span>
            </button>
          )}
        </div>

        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-semibold text-gray-800">Música de {selectedStyle.toLowerCase()} ({filteredVideos.length})</h2>
            <div className="flex items-center space-x-4">
              <CardSizeSelector type="video" styleColor={selectedStyle} />
              <button
                onClick={() => setIsFullWidth(!isFullWidth)}
                className={`flex items-center space-x-2 px-3 py-2 rounded-lg font-medium transition-all duration-200 ${
                  isFullWidth ? `bg-gradient-to-r ${getGradientClasses(selectedStyle)} text-white shadow-lg` : 'bg-white text-gray-700 border border-gray-200 hover:bg-gray-50 hover:border-gray-300'
                }`}
                title={isFullWidth ? 'Modo compacto' : 'Modo ancho completo'}
              >
                {isFullWidth ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
                <span className="hidden sm:inline">{isFullWidth ? 'Compacto' : 'Ancho'}</span>
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
            <div className={`grid gap-6 ${getVideoConfig(isFullWidth).grid}`}>
              {filteredVideos.map((video) => (
                <div key={video.id} className={`bg-white rounded-lg shadow-md border hover:shadow-lg transition-all duration-200 transform hover:scale-[1.02] ${video.isCompleted ? 'border-2 border-green-500 ring-2 ring-green-300' : 'border-gray-100'}`}>
                  <div className="relative group">
                    <div className={`w-full ${getVideoConfig(isFullWidth).aspect} ${getVideoConfig(isFullWidth).thumbnailSize} bg-gradient-to-br from-gray-100 to-gray-200 relative overflow-hidden rounded-t-lg flex items-center justify-center`}>
                      {video.thumbnailUrl && video.thumbnailUrl !== 'https://via.placeholder.com/400x225/1a1a1a/ffffff?text=VIDEO' ? (
                        <img src={video.thumbnailUrl} alt={video.title} className={`w-full h-full ${getVideoConfig(isFullWidth).imageObject || 'object-cover'}`} loading="lazy" onError={(e) => { e.target.style.display = 'none'; e.target.nextSibling.style.display = 'flex' }} />
                      ) : null}
                      <div className={`flex flex-col items-center justify-center text-gray-500 ${video.thumbnailUrl && video.thumbnailUrl !== 'https://via.placeholder.com/400x225/1a1a1a/ffffff?text=VIDEO' ? 'hidden' : 'flex'}`}>
                        <svg className="w-12 h-12 mb-2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 002 2v8a2 2 0 002 2z" /></svg>
                        <span className="text-sm font-medium">{video.title}</span>
                      </div>
                      <div className="absolute bottom-2 left-2 bg-black bg-opacity-75 text-white px-2 py-1 rounded text-sm font-medium">{video.resolution && video.resolution !== 'Unknown' ? video.resolution : 'HD'}</div>
                      {lastWatched && isRecentLastWatched(lastWatched) && lastWatched.id === video.id && (
                        <div className="absolute top-2 left-2 bg-pink-600 text-white px-2 py-1 rounded text-xs font-medium shadow">
                          Visto recientemente
                        </div>
                      )}
                    </div>
                    <button onClick={() => handlePlayVideo(video)} className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-0 hover:bg-opacity-30 transition-all duration-200 group">
                      <div className="w-16 h-16 rounded-full bg-white bg-opacity-90 flex items-center justify-center transform scale-0 group-hover:scale-100 transition-transform duration-200"><Play className="w-8 h-8 text-gray-800 ml-1" /></div>
                    </button>
                  </div>
                  <div className={`${getVideoConfig(isFullWidth).compact ? 'p-2' : 'p-4'}`}>
                    <div className={`flex items-center justify-between ${getVideoConfig(isFullWidth).compact ? 'mb-1' : 'mb-2'}`}>
                      <h3 className={`font-semibold text-gray-800 ${getVideoConfig(isFullWidth).titleSize}`}>{video.title}</h3>
                      <div className="flex items-center space-x-1">
                        {[1,2,3,4,5].map(star => {
                          const isFilled = (video.rating || 0) >= star
                          return (
                            <svg key={star} className={`${getVideoConfig(isFullWidth).compact ? 'h-3 w-3' : 'h-4 w-4'} ${isFilled ? 'text-yellow-400 fill-current' : 'text-gray-300'} cursor-pointer`} fill="currentColor" viewBox="0 0 24 24" onClick={async () => { try { const currentRating = video.rating || 0; const newRating = currentRating >= star ? 0 : star; await updateVideoDocument(video.id, { rating: newRating }, 'musica'); video.rating = newRating } catch (_) {} }}>
                              <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                            </svg>
                          )
                        })}
                        <span className={`${getVideoConfig(isFullWidth).compact ? 'text-xs' : 'text-xs'} font-medium text-gray-500 ml-1`}>({video.rating || 0})</span>
                      </div>
                    </div>
                    <p className={`text-gray-600 text-sm ${getVideoConfig(isFullWidth).compact ? 'mb-2' : 'mb-3'} ${getVideoConfig(isFullWidth).descriptionLines === 1 ? 'line-clamp-1' : getVideoConfig(isFullWidth).descriptionLines === 2 ? 'line-clamp-2' : getVideoConfig(isFullWidth).descriptionLines === 3 ? 'line-clamp-3' : 'line-clamp-4'}`}>{video.description || 'Sin descripción'}</p>
                    {getVideoConfig(isFullWidth).showTags && (
                      <div className="flex flex-wrap gap-2 mb-3">
                        {(() => {
                          const orderedTags = getOrderedTags(video)
                          if (orderedTags.length > 0) {
                            return orderedTags.map(({ tag, categoryKey, color }) => (
                              <span key={`${categoryKey}-${tag}`} className={`px-2 py-1 rounded-full text-xs font-medium ${getColorClasses(color)}`}>{tag}</span>
                            ))
                          } else { return <span className="text-gray-400 text-sm">Sin etiquetas</span> }
                        })()}
                      </div>
                    )}
                    <div className="flex flex-wrap items-center justify-between gap-2 text-sm text-gray-500">
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{(video.fileSize / (1024 * 1024)).toFixed(2)} MB</span>
                      </div>
                      <div className="flex flex-wrap items-center gap-2 justify-end">
                        {/* Reproducir solo con el thumbnail */}
                        <button onClick={() => handleVideoLike(video)} className={`flex items-center space-x-1 transition-colors duration-200 p-1 rounded hover:bg-red-50 ${video.userLiked ? 'text-red-500' : 'text-gray-400 hover:text-red-500'}`} title={video.userLiked ? 'Quitar like' : 'Dar like'}>
                          <Heart className={`${getVideoConfig(isFullWidth).compact ? 'h-3 w-3' : 'h-4 w-4'} ${video.userLiked ? 'fill-current' : ''}`} />
                          <span className="font-medium">{video.likes || 0}</span>
                        </button>
                        <button onClick={() => handleToggleStudy(video)} className={`transition-colors duration-200 p-1 rounded ${video.isInStudy ? 'text-blue-600 bg-blue-50 ring-2 ring-blue-300' : 'text-gray-400 hover:text-blue-600 hover:bg-blue-50'}`} title={video.isInStudy ? 'Quitar de estudios' : 'Añadir a estudios'}><BookOpen className={`${getVideoConfig(isFullWidth).compact ? 'h-3 w-3' : 'h-4 w-4'}`} /></button>
                        <button onClick={() => handleToggleCompleted(video)} className={`transition-colors duration-200 p-1 rounded ${video.isCompleted ? 'text-green-600 bg-green-50 ring-2 ring-green-300' : 'text-gray-400 hover:text-green-600 hover:bg-green-50'}`} title={video.isCompleted ? 'Marcar como pendiente' : 'Marcar como completado'}><CheckCircle className={`${getVideoConfig(isFullWidth).compact ? 'h-3 w-3' : 'h-4 w-4'}`} /></button>
                        {user && (<button onClick={() => handleToggleHiddenVideo(video)} className={`transition-colors duration-200 p-1 rounded ${video.userHidden ? 'text-orange-600 bg-orange-50 ring-2 ring-orange-300' : 'text-gray-400 hover:text-orange-600 hover:bg-orange-50'}`} title={video.userHidden ? 'Mostrar video' : 'Ocultar video'}><EyeOff className={`${getVideoConfig(isFullWidth).compact ? 'h-3 w-3' : 'h-4 w-4'}`} /></button>)}
                        {(userProfile?.role === 'super_admin') && (
                          <button onClick={async () => {
                            try {
                              addToast(`Iniciando descarga de ${video.title}...`, 'info')
                              const videoRef = ref(storage, video.videoPath)
                              const downloadURL = await getDownloadURL(videoRef)
                              const controller = new AbortController()
                              const timeoutId = setTimeout(() => controller.abort(), 30000)
                              const response = await fetch(downloadURL, { signal: controller.signal })
                              clearTimeout(timeoutId)
                              if (!response.ok) throw new Error(`Error HTTP: ${response.status}`)
                              const blob = await response.blob()
                              const url = URL.createObjectURL(blob)
                              const link = document.createElement('a')
                              link.href = url
                              link.download = `${video.title || 'video'}.mp4`
                              document.body.appendChild(link)
                              link.click()
                              document.body.removeChild(link)
                              URL.revokeObjectURL(url)
                              addToast('✅ Descarga completada exitosamente', 'success')
                            } catch (e) { addToast('❌ Error al descargar', 'error') }
                          }} className="text-gray-400 hover:text-green-500 transition-colors duration-200 p-1 rounded hover:bg-green-50" title="Descargar video"><Download className={`${getVideoConfig(isFullWidth).compact ? 'h-3 w-3' : 'h-4 w-4'}`} /></button>
                        )}
                        <button onClick={() => openEditModal(video)} className="text-gray-400 hover:text-blue-500 transition-colors duration-200 p-1 rounded hover:bg-blue-50" title="Editar video"><Edit className={`${getVideoConfig(isFullWidth).compact ? 'h-3 w-3' : 'h-4 w-4'}`} /></button>
                        <button onClick={() => setDeleteModal({ isOpen: true, video })} className="text-gray-400 hover:text-red-500 transition-colors duration-200 p-1 rounded hover:bg-red-50" title="Eliminar video">
                          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6M1 7h22M8 7V5a2 2 0 012-2h4a2 2 0 012 2v2"/></svg>
                        </button>
                        <button onClick={() => openShareModal(video)} className="text-gray-400 hover:text-pink-600 transition-colors duration-200 p-1 rounded hover:bg-pink-50" title="Reenviar a usuario"><Share2 className={`${getVideoConfig(isFullWidth).compact ? 'h-3 w-3' : 'h-4 w-4'}`} /></button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <Suspense fallback={<LoadingSpinner />}>
        <VideoUploadModal isOpen={isUploadModalOpen} onClose={() => setIsUploadModalOpen(false)} onVideoUploaded={handleVideoUploaded} page="musica" style={selectedStyle} />
      </Suspense>
      <Suspense fallback={<LoadingSpinner />}>
        <VideoEditModal isOpen={editModal.isOpen} onClose={closeEditModal} video={editModal.video} onVideoUpdated={handleVideoUpdated} page="musica" style={selectedStyle} />
      </Suspense>

      {showVideoPlayer && selectedVideo && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
          <div className="relative w-full max-w-3xl h-auto max-h-[90vh] bg-white rounded-lg overflow-hidden flex flex-col">
            <div className="flex items-center justify-between p-4 bg-gray-50 border-b flex-shrink-0">
              <h3 className="text-lg font-semibold text-gray-800">🎬 {selectedVideo.title}</h3>
              <button onClick={() => { setShowVideoPlayer(false); setSelectedVideo(null) }} className="text-gray-500 hover:text-gray-700 transition-colors"><X className="h-6 w-6" /></button>
            </div>
            <div className="flex-1 min-h-0 p-4 overflow-y-auto">
              <div className="w-full h-full max-h-[65vh] flex items-center justify-center">
                <div className="w-full max-w-md">
                  <Suspense fallback={<LoadingSpinner />}>
                    <SequenceVideoPlayer videos={[selectedVideo]} className="w-full h-full" showControls={true} autoplay={true} loop={false} muted={false} />
                  </Suspense>
                </div>
              </div>
              {/* Acciones e información del video (como en cards) */}
              <div className="mt-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center space-x-1">
                    {[1,2,3,4,5].map(star => {
                      const isFilled = (selectedVideo?.rating || 0) >= star
                      return (
                        <svg key={star} className={`h-4 w-4 ${isFilled ? 'text-yellow-400 fill-current' : 'text-gray-300'} cursor-pointer`} fill="currentColor" viewBox="0 0 24 24" onClick={async () => {
                          try {
                            const currentRating = selectedVideo?.rating || 0
                            const newRating = currentRating >= star ? 0 : star
                            await updateVideoDocument(selectedVideo.id, { rating: newRating }, 'musica')
                            setVideos(prev => prev.map(v => v.id === selectedVideo.id ? { ...v, rating: newRating } : v))
                            setSelectedVideo(prev => ({ ...prev, rating: newRating }))
                          } catch (_) {}
                        }}>
                          <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                        </svg>
                      )
                    })}
                    <span className="text-xs font-medium text-gray-500 ml-1">({selectedVideo?.rating || 0})</span>
                  </div>
                  <div className="text-xs text-gray-500">{((selectedVideo?.fileSize || 0) / (1024 * 1024)).toFixed(2)} MB</div>
                </div>
                <div className="flex flex-wrap items-center justify-end gap-2">
                  <button onClick={() => { setSelectedVideo(p => ({ ...p, userLiked: !p?.userLiked, likes: (p?.likes || 0) + (p?.userLiked ? -1 : 1) })); handleVideoLike(selectedVideo) }} className={`flex items-center space-x-1 transition-colors duration-200 p-1 rounded hover:bg-red-50 ${selectedVideo?.userLiked ? 'text-red-500' : 'text-gray-400 hover:text-red-500'}`} title={selectedVideo?.userLiked ? 'Quitar like' : 'Dar like'}>
                    <Heart className={`h-4 w-4 ${selectedVideo?.userLiked ? 'fill-current' : ''}`} />
                    <span className="font-medium">{selectedVideo?.likes || 0}</span>
                  </button>
                  <button onClick={() => { handleToggleStudy(selectedVideo); setSelectedVideo(p => ({ ...p, isInStudy: !p?.isInStudy })) }} className={`transition-colors duration-200 p-1 rounded ${selectedVideo?.isInStudy ? 'text-blue-600 bg-blue-50 ring-2 ring-blue-300' : 'text-gray-400 hover:text-blue-600 hover:bg-blue-50'}`} title={selectedVideo?.isInStudy ? 'Quitar de estudios' : 'Añadir a estudios'}>
                    <BookOpen className="h-4 w-4" />
                  </button>
                  <button onClick={() => { handleToggleCompleted(selectedVideo); setSelectedVideo(p => ({ ...p, isCompleted: !p?.isCompleted })) }} className={`transition-colors duration-200 p-1 rounded ${selectedVideo?.isCompleted ? 'text-green-600 bg-green-50 ring-2 ring-green-300' : 'text-gray-400 hover:text-green-600 hover:bg-green-50'}`} title={selectedVideo?.isCompleted ? 'Marcar como pendiente' : 'Marcar como completado'}>
                    <CheckCircle className="h-4 w-4" />
                  </button>
                  {user && (
                    <button onClick={() => { toggleUserHiddenVideo(selectedVideo.id, user.uid).then((result) => { if (result?.success) { setSelectedVideo(p => ({ ...p, userHidden: result.isHidden })); setVideos(prev => prev.map(v => v.id === selectedVideo.id ? { ...v, userHidden: result.isHidden } : v)) } }) }} className={`transition-colors duration-200 p-1 rounded ${selectedVideo?.userHidden ? 'text-orange-600 bg-orange-50 ring-2 ring-orange-300' : 'text-gray-400 hover:text-orange-600 hover:bg-orange-50'}`} title={selectedVideo?.userHidden ? 'Mostrar video' : 'Ocultar video'}>
                      <EyeOff className="h-4 w-4" />
                    </button>
                  )}
                  {(userProfile?.role === 'super_admin') && (
                    <button onClick={() => downloadVideo(selectedVideo)} className="text-gray-400 hover:text-green-500 transition-colors duration-200 p-1 rounded hover:bg-green-50" title="Descargar video">
                      <Download className="h-4 w-4" />
                    </button>
                  )}
                  <button onClick={() => openEditModal(selectedVideo)} className="text-gray-400 hover:text-blue-500 transition-colors duration-200 p-1 rounded hover:bg-blue-50" title="Editar video">
                    <Edit className="h-4 w-4" />
                  </button>
                  <button onClick={() => setDeleteModal({ isOpen: true, video: selectedVideo })} className="text-gray-400 hover:text-red-500 transition-colors duration-200 p-1 rounded hover:bg-red-50" title="Eliminar video">
                    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6M1 7h22M8 7V5a2 2 0 012-2h4a2 2 0 012 2v2"/></svg>
                  </button>
                  <button onClick={() => setShareState({ isOpen: true, video: selectedVideo })} className="text-gray-400 hover:text-pink-600 transition-colors duration-200 p-1 rounded hover:bg-pink-50" title="Reenviar a usuario">
                    <Share2 className="h-4 w-4" />
                  </button>
                </div>
                {/* Tags coloreados como en las cards */}
                <div className="mt-3">
                  {(() => {
                    const orderedTags = getOrderedTags(selectedVideo || {})
                    if (orderedTags.length > 0) {
                      return (
                        <div className="flex flex-wrap gap-2">
                          {orderedTags.map(({ tag, categoryKey, color }) => (
                            <span key={`modal-m-tag-${categoryKey}-${tag}`} className={`px-2 py-1 rounded-full text-xs font-medium ${getColorClasses(color)}`}>{tag}</span>
                          ))}
                        </div>
                      )
                    }
                    return null
                  })()}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      <Suspense fallback={<LoadingSpinner />}>
        <ConfirmModal isOpen={deleteModal.isOpen} onClose={() => setDeleteModal({ isOpen: false, video: null })} onConfirm={() => handleDeleteVideo(deleteModal.video)} title="🗑️ Eliminar Video" message={`¿Estás seguro de que quieres eliminar el video "${deleteModal.video?.title}"?\n\nEsta acción eliminará permanentemente:\n• El archivo de video de Firebase Storage\n• El thumbnail del video\n• Los metadatos de Firestore\n\nEsta acción NO se puede deshacer.`} confirmText="Sí, Eliminar" cancelText="Cancelar" type="danger" />
      </Suspense>

      {toasts.map(toast => (
        <Toast key={toast.id} message={toast.message} type={toast.type} onClose={() => removeToast(toast.id)} />
      ))}

      <ShareVideoModal
        isOpen={shareState.isOpen}
        onClose={closeShareModal}
        video={shareState.video}
        page="musica"
        currentUser={user}
        onShared={() => addToast('Enviado ✅', 'success')}
      />
    </div>
  )
}

export default MusicaPage

