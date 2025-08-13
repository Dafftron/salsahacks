import React, { lazy, Suspense, useState, useEffect } from 'react'
import { Maximize2, Minimize2, Upload, Search, Filter, ChevronDown, ChevronUp, Star, Heart, X, EyeOff, Download, Play, Edit, Trash2, BookOpen, CheckCircle } from 'lucide-react'
import { useCategories } from '../hooks/useCategories'
import { useAuth } from '../contexts/AuthContext'
import { useCardSize } from '../contexts/CardSizeContext'
import VideoGridRenderer from '../components/gallery/VideoGridRenderer'
import CardSizeSelector from '../components/common/CardSizeSelector'
import CompactCardActions from '../components/common/CompactCardActions'
import ConfirmModal from '../components/common/ConfirmModal'
import Toast from '../components/common/Toast'
import { subscribeToVideosByStyle, subscribeToPageVideos, updateVideoDocument, deleteVideoDocument, toggleVideoLike, checkUserLikedVideo, checkUserFavorite, toggleUserHiddenVideo, checkUserHiddenVideo, checkUserStudy, checkUserStudyCompleted, toggleUserStudy, setUserStudyCompleted } from '../services/firebase/firestore'
import { ref, getDownloadURL } from 'firebase/storage'
import { storage } from '../services/firebase/config'
import { deleteVideo } from '../services/firebase/storage'

const VideoUploadModal = lazy(() => import('../components/video/VideoUploadModal'))
const VideoEditModal = lazy(() => import('../components/video/VideoEditModal'))
const SequenceVideoPlayer = lazy(() => import('../components/sequence/SequenceVideoPlayer'))

const EventosPage = () => {
  const { user, userProfile } = useAuth()
  const [selectedStyle, setSelectedStyle] = useState('talleres')
  const { availableStyles, getGradientClasses, categoriesList, getColorClasses } = useCategories('eventos', selectedStyle)
  const { getVideoConfig } = useCardSize()

  const [videos, setVideos] = useState([])
  const [loading, setLoading] = useState(true)
  const [isFullWidth, setIsFullWidth] = useState(false)
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false)
  const [toasts, setToasts] = useState([])
  const [selectedTags, setSelectedTags] = useState([])
  const [editModal, setEditModal] = useState({ isOpen: false, video: null })
  const [deleteModal, setDeleteModal] = useState({ isOpen: false, video: null })
  const [selectedVideo, setSelectedVideo] = useState(null)
  const [showVideoPlayer, setShowVideoPlayer] = useState(false)
  
  // Estado UI adicional (alineado con EscuelaPage)
  const loadFilterPreference = (key, defaultValue) => {
    try {
      const saved = localStorage.getItem('eventos-filters')
      const parsed = saved ? JSON.parse(saved) : {}
      return parsed[key] ?? defaultValue
    } catch (error) {
      return defaultValue
    }
  }

  const [searchTerm, setSearchTerm] = useState(() => loadFilterPreference('searchTerm', ''))
  const [showFilters, setShowFilters] = useState(() => loadFilterPreference('showFilters', false))
  const [activeCategoryChips, setActiveCategoryChips] = useState(() => loadFilterPreference('activeCategoryChips', []))
  const [sortKey, setSortKey] = useState(() => loadFilterPreference('sortKey', 'none'))
  const [sortDir, setSortDir] = useState(() => loadFilterPreference('sortDir', 'asc'))
  const [showFavorites, setShowFavorites] = useState(() => loadFilterPreference('showFavorites', false))
  const [showHiddenVideos, setShowHiddenVideos] = useState(() => loadFilterPreference('showHiddenVideos', false))
  const [selectedTab, setSelectedTab] = useState(() => loadFilterPreference('selectedTab', 'talleres')) // 'talleres' | 'congresos'

  const addToast = (message, type = 'success') => setToasts(prev => [...prev, { id: Date.now(), message, type }])

  // Suscripción por página (trae todos los eventos) y filtramos por pestaña/tags en cliente
  useEffect(() => {
    setLoading(true)
    const unsubscribe = subscribeToPageVideos('eventos', (list) => {
      setVideos(list)
      setLoading(false)
    })
    return () => unsubscribe && unsubscribe()
  }, [])

  // Mantener selectedStyle sincronizado con la pestaña para subidas/edición
  useEffect(() => {
    if (selectedTab) {
      setSelectedStyle(selectedTab)
    }
  }, [selectedTab])

  // Asegurar que el estilo seleccionado sea válido para eventos
  useEffect(() => {
    const validKeys = (availableStyles || []).map(s => s.key)
    if (!validKeys.includes(selectedStyle)) {
      const fallback = validKeys[0] || 'talleres'
      setSelectedStyle(fallback)
    }
  }, [availableStyles, selectedStyle])

  // Guardar preferencias de filtros
  useEffect(() => {
    try {
      const filters = {
        selectedStyle,
        selectedTags,
        searchTerm,
        showFilters,
        activeCategoryChips,
        sortKey,
        sortDir,
        showFavorites,
        showHiddenVideos,
        selectedTab,
      }
      localStorage.setItem('eventos-filters', JSON.stringify(filters))
    } catch (_) {}
  }, [selectedStyle, selectedTags, searchTerm, showFilters, activeCategoryChips, sortKey, sortDir, showFavorites, showHiddenVideos, selectedTab])

  const handleTagFilter = (tag) => {
    setSelectedTags(prev => prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag])
  }

  const clearFilters = () => setSelectedTags([])

  // Utilidades de búsqueda/filtrado/orden
  const normalizeText = (text) => {
    return (text || '')
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .trim()
  }

  const advancedSearch = (video, searchWords) => {
    if (!searchWords || searchWords.length === 0) return true
    const normalizedTitle = normalizeText(video.title)
    const normalizedDescription = normalizeText(video.description)
    const normalizedTags = []
    if (video.tags) {
      Object.values(video.tags).forEach(categoryTags => {
        if (Array.isArray(categoryTags)) {
          categoryTags.forEach(tag => normalizedTags.push(normalizeText(tag)))
        }
      })
    }
    return searchWords.every(word => {
      const w = normalizeText(word)
      if (normalizedTitle.includes(w)) return true
      if (normalizedDescription.includes(w)) return true
      if (normalizedTags.some(t => t.includes(w))) return true
      return false
    })
  }

  const hasCategoryTags = (video, categoryKey) => {
    if (!video.tags) return false
    const category = categoriesList.find(cat => cat.key === categoryKey)
    if (!category) return false
    const categoryTags = video.tags[categoryKey]
    return Array.isArray(categoryTags) && categoryTags.length > 0
  }

  // Ordenar tags según el orden de categorías
  const getOrderedTags = (video) => {
    if (!video.tags || Object.keys(video.tags).length === 0) {
      return []
    }
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

  const handleCategoryTitleClick = (categoryKey) => {
    setActiveCategoryChips(prev => prev.includes(categoryKey) ? prev.filter(k => k !== categoryKey) : [...prev, categoryKey])
  }

  const sortVideos = (videosToSort) => {
    if (sortKey === 'none') return videosToSort
    const dir = sortDir === 'asc' ? 1 : -1
    const sorted = [...videosToSort]
    switch (sortKey) {
      case 'name':
        return sorted.sort((a, b) => dir * (a.title || '').localeCompare(b.title || ''))
      case 'rating':
        return sorted.sort((a, b) => dir * ((a.rating || 0) - (b.rating || 0)))
      case 'likes':
        return sorted.sort((a, b) => dir * ((a.likes || 0) - (b.likes || 0)))
      default:
        return videosToSort
    }
  }

  // Anotar estados por usuario (like/favorite/hidden/estudio/completado)
  useEffect(() => {
    if (videos.length > 0 && user) {
      const checkStates = async () => {
        const updated = await Promise.all(videos.map(async video => {
          try {
            const [likeResult, favoriteResult, hiddenResult, studyResult, completedResult] = await Promise.all([
              checkUserLikedVideo(video.id, user.uid),
              checkUserFavorite(video.id, user.uid),
              checkUserHiddenVideo(video.id, user.uid),
              checkUserStudy(video.id, user.uid),
              checkUserStudyCompleted(video.id, user.uid),
            ])
            return { ...video, userLiked: likeResult.userLiked, isFavorite: favoriteResult.isFavorite, userHidden: hiddenResult.isHidden, isInStudy: studyResult.isInStudy, isCompleted: completedResult.isCompleted }
          } catch (e) {
            return { ...video, userLiked: false, isFavorite: false, userHidden: false, isInStudy: false, isCompleted: false }
          }
        }))
        setVideos(updated)
      }
      checkStates()
    }
  }, [videos.length, user])

  // Acciones
  const handleVideoLike = async (video) => {
    if (!user) { addToast('Debes iniciar sesión para dar like', 'error'); return }
    try {
      const result = await toggleVideoLike(video.id, user.uid, 'eventos')
      if (result.success) {
        setVideos(prev => prev.map(v => v.id === video.id ? { ...v, likes: result.likes, likedBy: result.likedBy, userLiked: result.userLiked, isFavorite: result.isFavorite } : v))
        addToast(result.userLiked ? 'Has dado like' : 'Like quitado', 'success')
      } else {
        addToast('Error al actualizar like', 'error')
      }
    } catch (e) {
      addToast('Error al actualizar like', 'error')
    }
  }

  const handleToggleHiddenVideo = async (video) => {
    if (!user) { addToast('Debes iniciar sesión', 'error'); return }
    try {
      const result = await toggleUserHiddenVideo(video.id, user.uid)
      if (result.success) {
        setVideos(prev => prev.map(v => v.id === video.id ? { ...v, userHidden: result.isHidden } : v))
        addToast(result.isHidden ? 'Video ocultado' : 'Video mostrado', 'success')
      } else {
        addToast('Error al ocultar/mostrar', 'error')
      }
    } catch (e) {
      addToast('Error al ocultar/mostrar', 'error')
    }
  }

  const downloadVideo = async (video) => {
    if (!user || !userProfile) { addToast('❌ Debes iniciar sesión para descargar', 'error'); return }
    if (userProfile.role !== 'super_admin') { addToast('❌ Solo Super Admin puede descargar', 'error'); return }
    try {
      addToast(`Iniciando descarga de ${video.title}...`, 'info')
      const videoRef = ref(storage, video.videoPath)
      const downloadURL = await getDownloadURL(videoRef)
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 30000)
      const response = await fetch(downloadURL, { signal: controller.signal })
      clearTimeout(timeoutId)
      if (!response.ok) throw new Error(`HTTP ${response.status}`)
      const blob = await response.blob()
      if (blob.size === 0) throw new Error('Archivo vacío')
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `${video.title || 'video'}.mp4`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      URL.revokeObjectURL(url)
      addToast('✅ Descarga completada', 'success')
    } catch (error) {
      addToast('❌ Error al descargar', 'error')
    }
  }

  // Estudio
  const handleToggleStudy = async (video) => {
    try {
      if (!user) { addToast('Debes iniciar sesión', 'error'); return }
      const result = await toggleUserStudy(video.id, user.uid, 'eventos')
      if (result.success) {
        setVideos(prev => prev.map(v => v.id === video.id ? { ...v, isInStudy: result.isInStudy } : v))
        addToast(result.isInStudy ? 'Añadido a estudios' : 'Quitado de estudios', 'success')
      }
    } catch (e) {
      addToast('Error al actualizar estudios', 'error')
    }
  }

  const handleToggleCompleted = async (video) => {
    try {
      if (!user) { addToast('Debes iniciar sesión', 'error'); return }
      const result = await setUserStudyCompleted(video.id, user.uid, !video.isCompleted)
      if (result.success) {
        setVideos(prev => prev.map(v => v.id === video.id ? { ...v, isCompleted: result.isCompleted } : v))
        addToast(result.isCompleted ? 'Marcado como completado' : 'Marcado como pendiente', 'success')
      }
    } catch (e) {
      addToast('Error al actualizar completado', 'error')
    }
  }

  // Editar
  const openEditModal = (video) => setEditModal({ isOpen: true, video })
  const closeEditModal = () => setEditModal({ isOpen: false, video: null })
  const handleVideoUpdated = (updatedVideo) => {
    setVideos(prev => prev.map(v => v.id === updatedVideo.id ? updatedVideo : v))
    addToast(`${updatedVideo.title} actualizado`, 'success')
  }

  // Eliminar
  const openDeleteModal = (video) => setDeleteModal({ isOpen: true, video })
  const closeDeleteModal = () => setDeleteModal({ isOpen: false, video: null })
  const handleDeleteVideo = async (video) => {
    try {
      const storageResult = await deleteVideo(video.videoPath, video.thumbnailPath)
      if (!storageResult.success) {
        if (storageResult.error && String(storageResult.error).includes('thumbnails')) {
          const videoOnly = await deleteVideo(video.videoPath, null)
          if (!videoOnly.success) { addToast(`Error al eliminar archivos: ${storageResult.error}`, 'error'); return }
        } else {
          addToast(`Error al eliminar archivos: ${storageResult.error}`, 'error'); return
        }
      }
      const firestoreResult = await deleteVideoDocument(video.id, 'eventos')
      if (!firestoreResult.success) { addToast(`Error al eliminar metadatos: ${firestoreResult.error}`, 'error'); return }
      setVideos(prev => prev.filter(v => v.id !== video.id))
      addToast(`${video.title} eliminado correctamente`, 'success')
      setDeleteModal({ isOpen: false, video: null })
    } catch (e) {
      addToast('Error inesperado al eliminar video', 'error')
    }
  }

  // Reproducir
  const handlePlayVideo = (video) => { setSelectedVideo(video); setShowVideoPlayer(true) }

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-6xl mx-auto px-6 py-8">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold mb-2">
          <span className="text-pink-500">EVENTOS</span>
          <span className={`bg-gradient-to-r ${getGradientClasses(selectedStyle)} bg-clip-text text-transparent`}> - {selectedStyle.toUpperCase()}</span>
        </h1>
          <p className="text-gray-600 text-lg">Galería de videos de talleres y congresos</p>
      </div>

      <div className="flex flex-wrap justify-center gap-3 mb-8">
        {availableStyles.map(style => (
          <button
            key={style.key}
            onClick={() => setSelectedStyle(style.key)}
            className={`relative flex items-center space-x-2 px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
              selectedStyle === style.key
                ? `bg-gradient-to-r ${getGradientClasses(style.color)} text-white shadow-lg transform scale-105`
                : 'bg-white text-gray-700 border border-gray-200 hover:bg-gray-50 hover:border-gray-300'
            }`}
          >
            <span>{style.name}</span>
          </button>
        ))}
      </div>

        {/* Barra de búsqueda */}
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

        {/* Filtros avanzados (colapsable) */}
        {categoriesList.length > 0 && (
          <div className="mb-8">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center justify-center space-x-2 mx-auto px-6 py-3 bg-gradient-to-r from-gray-100 to-gray-200 text-gray-700 rounded-lg font-medium shadow-md hover:shadow-lg transition-all duration-200 transform hover:scale-105"
            >
              <Filter className="h-5 w-5" />
              <span>Filtros Avanzados por Tags - {selectedStyle}</span>
              {showFilters ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
            </button>
            <div className={`mt-4 transition-all duration-300 ease-in-out overflow-hidden ${showFilters ? 'max-h-screen opacity-100' : 'max-h-0 opacity-0'}`}>
              <div className="space-y-4 bg-gray-50 rounded-lg p-6 border border-gray-200 max-h-96 overflow-y-auto">
                {categoriesList.map((category) => (
                  <div key={category.key} className="space-y-2">
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
                {(activeCategoryChips.length > 0 || selectedTags.length > 0) && (
                  <div className="text-center">
                    <button onClick={clearFilters} className="text-sm text-gray-600 hover:text-gray-800 underline">Limpiar filtros</button>
                  </div>
                )}
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

        {/* Botones de orden y filtros de favoritos/ocultos */}
        <div className="flex flex-wrap justify-center gap-2 mb-6">
          <button
            onClick={() => {
              if (sortKey !== 'name') { setSortKey('name'); setSortDir('asc') }
              else if (sortDir === 'asc') { setSortDir('desc') }
              else { setSortKey('none') }
            }}
            className={`flex items-center space-x-1 px-3 py-1.5 rounded-md text-sm font-medium transition-all duration-200 ${
              sortKey === 'name' ? `bg-gradient-to-r ${getGradientClasses(selectedStyle)} text-white shadow-md` : 'bg-white text-gray-700 border border-gray-200 hover:bg-gray-50'
            }`}
          >
            <span>{sortKey === 'name' ? (sortDir === 'asc' ? 'A-Z' : 'Z-A') : 'A-Z'}</span>
          </button>

          <button
            onClick={() => {
              if (sortKey !== 'rating') { setSortKey('rating'); setSortDir('desc') }
              else if (sortDir === 'desc') { setSortDir('asc') }
              else { setSortKey('none') }
            }}
            className={`flex items-center space-x-1 px-3 py-1.5 rounded-md text-sm font-medium transition-all duration-200 ${
              sortKey === 'rating' ? `bg-gradient-to-r ${getGradientClasses(selectedStyle)} text-white shadow-md` : 'bg-white text-gray-700 border border-gray-200 hover:bg-gray-50'
            }`}
          >
            <Star className="h-3 w-3" />
            <span>{sortKey === 'rating' ? (sortDir === 'desc' ? 'Puntuación ↓' : 'Puntuación ↑') : 'Puntuación'}</span>
          </button>

          {/* Favoritos (filtro) */}
          <button
            onClick={() => setShowFavorites(prev => !prev)}
            className={`flex items-center space-x-1 px-3 py-1.5 rounded-md text-sm font-medium transition-all duration-200 ${
              showFavorites ? `bg-gradient-to-r ${getGradientClasses(selectedStyle)} text-white shadow-md` : 'bg-white text-gray-700 border border-gray-200 hover:bg-gray-50'
            }`}
          >
            <Heart className="h-3 w-3" />
            <span>{showFavorites ? 'Ocultar Favoritos' : 'Mostrar Favoritos'}</span>
          </button>

          {/* Videos Ocultos (filtro) */}
          {user && (
            <button
              onClick={() => setShowHiddenVideos(prev => !prev)}
              className={`flex items-center space-x-1 px-3 py-1.5 rounded-md text-sm font-medium transition-all duration-200 ${
                showHiddenVideos ? `bg-gradient-to-r ${getGradientClasses(selectedStyle)} text-white shadow-md` : 'bg-white text-gray-700 border border-gray-200 hover:bg-gray-50'
              }`}
            >
              <EyeOff className="h-3 w-3" />
              <span>{showHiddenVideos ? 'Ocultar Ocultos' : 'Mostrar Ocultos'}</span>
            </button>
          )}

          {(activeCategoryChips.length > 0 || sortKey !== 'none' || showFavorites || showHiddenVideos || selectedTags.length > 0 || searchTerm) && (
            <button
              onClick={() => { setSelectedTags([]); setSearchTerm(''); setActiveCategoryChips([]); setSortKey('none'); setSortDir('asc'); setShowFavorites(false); setShowHiddenVideos(false) }}
              className="flex items-center space-x-1 px-3 py-1.5 rounded-md text-sm font-medium bg-gray-100 text-gray-600 hover:bg-gray-200 hover:text-gray-800 transition-colors duration-200"
              title="Limpiar filtros"
            >
              <X className="h-3 w-3" />
              <span>Limpiar</span>
            </button>
          )}
        </div>

        {/* Pestañas: Talleres / Congresos */}
        <div className="flex justify-center gap-2 mb-6">
          {['talleres', 'congresos'].map(tab => (
            <button
              key={tab}
              onClick={() => setSelectedTab(tab)}
              className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
                selectedTab === tab ? `bg-gradient-to-r ${getGradientClasses(selectedStyle)} text-white shadow-lg` : 'bg-white text-gray-700 border border-gray-200 hover:bg-gray-50'
              }`}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
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
      {loading ? (
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-500"></div>
          <span className="ml-3 text-gray-600">Cargando videos...</span>
        </div>
      ) : (
          (() => {
            const searchWords = searchTerm.split(' ').map(w => w.trim()).filter(Boolean)
            const talleresTokens = ['workshop', 'intensivo', 'masterclass', 'clase abierta']
            const congresoTokens = ['congreso', 'festival', 'encuentro', 'competición', 'competicion', 'fiesta']

            const base = videos.filter(video => {
              const tipoArr = Array.isArray(video?.tags?.tipo) ? video.tags.tipo : []
              const tipoLower = tipoArr.map(t => normalizeText(String(t)))
              const styleLower = normalizeText(video?.style)
              const eventTypeLower = normalizeText(video?.eventType)

              const matchTalleres = styleLower === 'talleres' || tipoLower.some(t => talleresTokens.includes(t)) || eventTypeLower === 'taller'
              const matchCongresos = styleLower === 'congresos' || tipoLower.some(t => congresoTokens.includes(t)) || eventTypeLower === 'congreso'
              const tabMatch = selectedTab === 'talleres' ? matchTalleres : matchCongresos

              const searchMatch = advancedSearch(video, searchWords)
              const tagsMatch = selectedTags.length === 0 || (
                video.tags && selectedTags.every(tag => Object.values(video.tags).some(arr => Array.isArray(arr) && arr.includes(tag)))
              )
              const categoryMatch = activeCategoryChips.length === 0 || activeCategoryChips.some(chip => hasCategoryTags(video, chip))
              const favoritesMatch = !showFavorites || video.isFavorite
              const hiddenMatch = showHiddenVideos ? video.userHidden : !video.userHidden
              return tabMatch && searchMatch && tagsMatch && categoryMatch && favoritesMatch && hiddenMatch
            })

            const filtered = sortVideos(base)

            const titleMap = { talleres: 'Talleres', congresos: 'Congresos' }

            return (
              <>
                {/* Header con contador y controles como en Escuela */}
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-semibold text-gray-800">
                    {titleMap[selectedTab] || 'Eventos'} ({filtered.length})
                  </h2>
                  <div className="flex items-center space-x-4">
                    <CardSizeSelector type="video" styleColor={selectedStyle} />
                    <button
                      onClick={() => setIsFullWidth(!isFullWidth)}
                      className={`flex items-center space-x-2 px-3 py-2 rounded-lg font-medium transition-all duration-200 ${
                        isFullWidth
                          ? `bg-gradient-to-r ${getGradientClasses(selectedStyle)} text-white shadow-lg`
                          : 'bg-white text-gray-700 border border-gray-200 hover:bg-gray-50 hover:border-gray-300'
                      }`}
                      title={isFullWidth ? 'Modo compacto' : 'Modo ancho completo'}
                    >
                      {isFullWidth ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
                      <span className="hidden sm:inline">{isFullWidth ? 'Compacto' : 'Ancho'}</span>
                    </button>
                  </div>
                </div>

                {filtered.length === 0 ? (
                  <div className="text-center py-12">
                    <p className="text-gray-500 text-lg">No hay videos en {selectedTab} aún</p>
                    <p className="text-gray-400 text-sm mt-2">Ajusta los filtros o sube tu primer video en {selectedTab}</p>
                  </div>
                ) : (
                  <div className={`grid gap-6 ${getVideoConfig(isFullWidth).grid}`}>
                    {filtered.map((video) => (
                      <div
                        key={video.id}
                        className="bg-white rounded-lg shadow-md overflow-hidden border hover:shadow-lg transition-all duration-200 transform hover:scale-[1.02] border-gray-100"
                      >
                        <div className={`w-full ${getVideoConfig(isFullWidth).aspect} ${getVideoConfig(isFullWidth).thumbnailSize} bg-gradient-to-br from-gray-100 to-gray-200 relative overflow-hidden flex items-center justify-center`}>
                          {video.thumbnailUrl ? (
                            <img
                              src={video.thumbnailUrl}
                              alt={video.title}
                              className={`w-full h-full ${getVideoConfig(isFullWidth).imageObject || 'object-cover'}`}
                              loading="lazy"
                              onError={(e) => {
                                e.currentTarget.style.display = 'none'
                                const fallback = e.currentTarget.nextSibling
                                if (fallback) fallback.style.display = 'flex'
                              }}
                            />
                          ) : null}
                          <div className={`flex flex-col items-center justify-center text-gray-500 ${video.thumbnailUrl ? 'hidden' : 'flex'}`}>
                            <svg className="w-12 h-12 mb-2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 002 2v8a2 2 0 002 2z" />
                            </svg>
                            <span className="text-sm font-medium">{video.title}</span>
                          </div>
                          <div className="absolute bottom-2 left-2 bg-black bg-opacity-75 text-white px-2 py-1 rounded text-sm font-medium">
                            {video.resolution && video.resolution !== 'Unknown' ? video.resolution : 'HD'}
                          </div>
                          {/* Botón Play visual */}
                          <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-0 hover:bg-opacity-30 transition-all duration-200 group">
                            <div className="w-16 h-16 rounded-full bg-white bg-opacity-90 flex items-center justify-center transform scale-0 group-hover:scale-100 transition-transform duration-200">
                              <Play className="w-8 h-8 text-gray-800 ml-1" />
                            </div>
                          </div>
                        </div>

                        <div className={`${getVideoConfig(isFullWidth).compact ? 'p-2' : 'p-4'}`}>
                          <div className={`flex items-center justify-between ${getVideoConfig(isFullWidth).compact ? 'mb-1' : 'mb-2'}`}>
                            <h3 className={`font-semibold text-gray-800 ${getVideoConfig(isFullWidth).titleSize}`}>{video.title}</h3>
                            {/* Rating */}
                            <div className="flex items-center space-x-1">
                              {[1,2,3,4,5].map(star => {
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
                                        await updateVideoDocument(video.id, { rating: newRating }, 'eventos')
                                        video.rating = newRating
                                      } catch (e) {}
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

                          {/* Tags como en Escuela (ordenados por categoría) */}
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

                          {/* Acciones compactas como en Escuela */}
                          {getVideoConfig(isFullWidth).compact ? (
                            <CompactCardActions
                              video={video}
                              onLike={() => handleVideoLike(video)}
                              onEdit={() => openEditModal(video)}
                              onDelete={() => openDeleteModal(video)}
                              onDownload={userProfile?.role === 'super_admin' ? () => downloadVideo(video) : undefined}
                              onPlay={() => handlePlayVideo(video)}
                              onToggleStudy={user ? () => handleToggleStudy(video) : undefined}
                              onToggleCompleted={user ? () => handleToggleCompleted(video) : undefined}
                              isInStudy={video.isInStudy}
                              isCompleted={video.isCompleted}
                              type="video"
                            />
                          ) : (
                            <div className="flex items-center justify-between text-sm text-gray-500">
                              <span className="font-medium">{(video.fileSize / (1024 * 1024)).toFixed(2)} MB</span>
                              <div className="flex items-center space-x-2">
                                <button
                                  onClick={() => handleVideoLike(video)}
                                  className={`flex items-center space-x-1 transition-colors duration-200 p-1 rounded hover:bg-red-50 ${video.userLiked ? 'text-red-500' : 'text-gray-400 hover:text-red-500'}`}
                                  title={video.userLiked ? 'Quitar like' : 'Dar like'}
                                >
                                  <svg className={`h-4 w-4 ${video.userLiked ? 'fill-current' : ''}`} viewBox="0 0 24 24"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 6 4 4 6.5 4c1.74 0 3.41 1 4.22 2.44C11.09 5 12.76 4 14.5 4 17 4 19 6 19 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/></svg>
                                  <span className="font-medium">{video.likes || 0}</span>
                                </button>
                                {user && (
                                  <button
                                    onClick={() => handleToggleStudy(video)}
                                    className={`transition-colors duration-200 p-1 rounded ${video.isInStudy ? 'text-blue-600 bg-blue-50 ring-2 ring-blue-300' : 'text-gray-400 hover:text-blue-600 hover:bg-blue-50'}`}
                                    title={video.isInStudy ? 'Quitar de estudios' : 'Añadir a estudios'}
                                  >
                                    <BookOpen className="h-4 w-4" />
                                  </button>
                                )}
                                {user && (
                                  <button
                                    onClick={() => handleToggleCompleted(video)}
                                    className={`transition-colors duration-200 p-1 rounded ${video.isCompleted ? 'text-green-600 bg-green-50 ring-2 ring-green-300' : 'text-gray-400 hover:text-green-600 hover:bg-green-50'}`}
                                    title={video.isCompleted ? 'Marcar como pendiente' : 'Marcar como completado'}
                                  >
                                    <CheckCircle className="h-4 w-4" />
                                  </button>
                                )}
                                {user && (
                                  <button
                                    onClick={() => handleToggleHiddenVideo(video)}
                                    className={`transition-colors duration-200 p-1 rounded ${video.userHidden ? 'text-orange-600 bg-orange-50 ring-2 ring-orange-300' : 'text-gray-400 hover:text-orange-600 hover:bg-orange-50'}`}
                                    title={video.userHidden ? 'Mostrar video' : 'Ocultar video'}
                                  >
                                    <EyeOff className="h-4 w-4" />
                                  </button>
                                )}
                                {(userProfile?.role === 'super_admin') && (
                                  <button
                                    onClick={() => downloadVideo(video)}
                                    className="text-gray-400 hover:text-green-500 transition-colors duration-200 p-1 rounded hover:bg-green-50"
                                    title="Descargar video"
                                  >
                                    <Download className="h-4 w-4" />
                                  </button>
                                )}
                                {(userProfile?.role === 'maese' || userProfile?.role === 'super_admin') && (
                                  <button
                                    onClick={() => openEditModal(video)}
                                    className="text-gray-400 hover:text-blue-500 transition-colors duration-200 p-1 rounded hover:bg-blue-50"
                                    title="Editar video"
                                  >
                                    <Edit className="h-4 w-4" />
                                  </button>
                                )}
                                {(userProfile?.role === 'maese' || userProfile?.role === 'super_admin') && (
                                  <button
                                    onClick={() => openDeleteModal(video)}
                                    className="text-gray-400 hover:text-red-500 transition-colors duration-200 p-1 rounded hover:bg-red-50"
                                    title="Eliminar video"
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </button>
                                )}
                              </div>
                            </div>
                          )}
              </div>
                      </div>
                    ))}
            </div>
          )}
              </>
            )
          })()
      )}
      </div>

      <Suspense fallback={null}>
        {showVideoPlayer && selectedVideo && (
          <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
            <div className="relative w-full max-w-3xl h-auto max-h-[90vh] bg-white rounded-lg overflow-hidden flex flex-col">
              <div className="flex items-center justify-between p-4 bg-gray-50 border-b flex-shrink-0">
                <h3 className="text-lg font-semibold text-gray-800">🎬 {selectedVideo.title}</h3>
                <button onClick={() => { setShowVideoPlayer(false); setSelectedVideo(null) }} className="text-gray-500 hover:text-gray-700 transition-colors">
                  <X className="h-6 w-6" />
                </button>
              </div>
              <div className="flex-1 min-h-0 p-4 overflow-y-auto">
                <div className="w-full h-full max-h-[65vh] flex items-center justify-center">
                  <div className="w-full max-w-md">
                    <SequenceVideoPlayer videos={[selectedVideo]} className="w-full h-full" showControls={true} autoplay={true} loop={false} muted={false} />
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        <VideoEditModal
          isOpen={editModal.isOpen}
          onClose={closeEditModal}
          video={editModal.video}
          onVideoUpdated={handleVideoUpdated}
          page="eventos"
          style={selectedStyle}
        />

        <ConfirmModal
          isOpen={deleteModal.isOpen}
          onClose={closeDeleteModal}
          onConfirm={() => handleDeleteVideo(deleteModal.video)}
          title="🗑️ Eliminar Video"
          message={`¿Eliminar definitivamente "${deleteModal.video?.title}"? Esta acción eliminará el archivo y metadatos y no se puede deshacer.`}
          confirmText="Sí, Eliminar"
          cancelText="Cancelar"
          type="danger"
        />
        {isUploadModalOpen && (
          <VideoUploadModal
            isOpen={isUploadModalOpen}
            onClose={() => setIsUploadModalOpen(false)}
            onVideoUploaded={() => addToast('Video subido', 'success')}
            page="eventos"
            style={selectedStyle}
          />
        )}
      </Suspense>

      <div className="fixed bottom-4 right-4 space-y-2 z-50">
        {toasts.map(t => (
          <Toast key={t.id} message={t.message} type={t.type} onClose={() => setToasts(prev => prev.filter(x => x.id !== t.id))} />
        ))}
      </div>
    </div>
  )
}

export default EventosPage


