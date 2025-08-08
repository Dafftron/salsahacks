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
  const [showVideoModal, setShowVideoModal] = useState(false)
  
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

  // Estado local para el estilo seleccionado
  const [selectedStyle, setSelectedStyle] = useState('salsa')
  
  // Usar el sistema de categorías con estilo dinámico
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





  const handleCategoryChipFilter = (chips) => {
    setActiveCategoryChips(chips)
  }

  // Funciones de ordenamiento y filtros
  const handleSortChange = (sortKey) => {
    setSortBy(sortKey)
  }

  const handleShowFavorites = (show) => {
    setShowFavorites(show)
  }

  const hasCategoryTags = (video, categoryKey) => {
    if (!video.tags || !video.tags[categoryKey]) return false
    return Array.isArray(video.tags[categoryKey]) && video.tags[categoryKey].length > 0
  }

  // Función de ordenamiento
  const sortVideos = (videosToSort) => {
    if (sortBy === 'none') return videosToSort
    
    return [...videosToSort].sort((a, b) => {
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

  const handleDeleteSequence = async (sequenceId) => {
    try {
      await deleteSequence(sequenceId)
      addToast('Secuencia eliminada exitosamente')
    } catch (error) {
      console.error('Error al eliminar secuencia:', error)
      addToast('Error al eliminar la secuencia', 'error')
      throw error
    }
  }

  const handlePlaySequence = (sequence) => {
    setSelectedSequence(sequence)
    setShowSequencePlayer(true)
    addToast(`🎬 Reproduciendo secuencia: ${sequence.name}`, 'info')
  }

  const handleEditSequence = (sequenceToEdit) => {
    // Verificar si hay una secuencia en construcción
    if (sequence.length > 0 || sequenceName.trim()) {
      // Abrir modal de confirmación
      setEditSequenceModal({ isOpen: true, sequence: sequenceToEdit })
    } else {
      // Cargar directamente la secuencia
      loadSequence(sequenceToEdit)
      addToast(`Secuencia "${sequenceToEdit.name}" cargada para edición`)
    }
  }

  const handleConfirmEditSequence = () => {
    const sequenceToEdit = editSequenceModal.sequence
    if (sequenceToEdit) {
      loadSequence(sequenceToEdit)
      addToast(`Secuencia "${sequenceToEdit.name}" cargada para edición`)
    }
    setEditSequenceModal({ isOpen: false, sequence: null })
  }

  const handleCancelEditSequence = () => {
    setEditSequenceModal({ isOpen: false, sequence: null })
  }

  const handleDownloadSequence = (sequence) => {
    setDownloadSequenceModal({ isOpen: true, sequence })
  }

  const handleCloseDownloadSequence = () => {
    setDownloadSequenceModal({ isOpen: false, sequence: null })
  }
  
  // Función para reproducir video individual
  const handlePlayVideo = (video) => {
    setSelectedVideo(video)
    setShowVideoModal(true)
    addToast(`🎬 Reproduciendo: ${video.title}`, 'info')
  }
  
  // Función para cerrar el reproductor
  const handleCloseVideoPlayer = () => {
    setShowVideoModal(false)
    setSelectedVideo(null)
  }
  
  // Función para cerrar el reproductor de secuencias
  const handleCloseSequencePlayer = () => {
    setShowSequencePlayer(false)
    setSelectedSequence(null)
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
      const firestoreResult = await deleteVideoDocument(video.id)
      
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



  // Funciones de filtrado
  const handleTagFilter = (tag) => {
    setSelectedTags(prev => 
      prev.includes(tag) 
        ? prev.filter(t => t !== tag)
        : [...prev, tag]
    )
  }

  const clearFilters = () => {
    setSelectedTags([])
    setSearchTerm('')
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
      } else if (type === 'cleanup-tags') {
        // Limpiar tags duplicados
        const result = await cleanupDuplicateTags()
        if (result.success) {
          addToast(`🏷️ ${result.updatedCount} videos actualizados con tags limpios`, 'success')
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
        let message = `Diagnóstico: ${result.totalVideos} videos total, ${result.salsaVideos} de salsa`
        if (result.fig003Found) {
          message += ` ✅ Fig003 encontrado`
        } else {
          message += ` ❌ Fig003 NO encontrado`
        }
        if (result.videosWithoutResolution > 0) {
          message += ` ⚠️ ${result.videosWithoutResolution} sin resolución`
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

  // Función para actualizar resoluciones de todos los videos
  const handleUpdateAllResolutions = async () => {
    try {
      addToast('🔄 Actualizando resoluciones de videos...', 'info')
      
      // Obtener todos los videos
      const allVideos = await getVideos()
      const videosToUpdate = allVideos.filter(video => 
        !video.resolution || video.resolution === 'Unknown'
      )
      
      if (videosToUpdate.length === 0) {
        addToast('✅ Todos los videos ya tienen resolución detectada', 'success')
        return
      }
      
      let updatedCount = 0
      
      for (const video of videosToUpdate) {
        try {
          // Detectar resolución del video
          const videoElement = document.createElement('video')
          videoElement.crossOrigin = 'anonymous'
          
          await new Promise((resolve, reject) => {
            videoElement.onloadedmetadata = () => {
              const videoWidth = videoElement.videoWidth
              const videoHeight = videoElement.videoHeight
              const maxDimension = Math.max(videoWidth, videoHeight)
              
              let resolution = 'Unknown'
              if (maxDimension >= 3840) resolution = '4K'
              else if (maxDimension >= 1920) resolution = '1080p'
              else if (maxDimension >= 1280) resolution = '720p'
              else if (maxDimension >= 854) resolution = '480p'
              else resolution = '360p'
              
              // Actualizar en Firestore con resolución y dimensiones
              updateVideoDocument(video.id, { 
                resolution,
                videoWidth,
                videoHeight
              })
              updatedCount++
              resolve()
            }
            
            videoElement.onerror = reject
            videoElement.src = video.videoUrl
          })
          
          // Limpiar el elemento de video
          videoElement.remove()
          
        } catch (error) {
          console.error(`Error actualizando resolución para video ${video.id}:`, error)
        }
      }
      
      addToast(`✅ Resoluciones actualizadas: ${updatedCount} videos`, 'success')
      
    } catch (error) {
      console.error('Error al actualizar resoluciones:', error)
      addToast('Error al actualizar resoluciones', 'error')
    }
  }

  // Función para migrar videos a estructura organizada
  const handleMigrateVideos = async () => {
    try {
      addToast('🔄 Iniciando migración REAL de videos a estructura organizada...', 'info')
      
      const result = await migrateVideosToOrganizedStructure(videos)
      
      if (result.success) {
        let message = `✅ Migración REAL completada: ${result.successfulMigrations} videos movidos físicamente`
        if (result.alreadyOrganized > 0) {
          message += `, ${result.alreadyOrganized} ya organizados`
        }
        if (result.failedMigrations > 0) {
          message += `, ${result.failedMigrations} fallidos`
        }
        
        addToast(message, 'success')
        
        // Recargar videos para reflejar los cambios
        window.location.reload()
      } else {
        addToast(`❌ Error en migración: ${result.error}`, 'error')
      }
    } catch (error) {
      console.error('Error ejecutando migración:', error)
      addToast('❌ Error al ejecutar migración', 'error')
    }
  }

  // Funciones de búsqueda
  const normalizeText = (text) => {
    return text.toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9\s]/g, '')
  }

  const advancedSearch = (video, searchTerms) => {
    if (searchTerms.length === 0) return true
    
    const normalizedTitle = normalizeText(video.title || '')
    const normalizedDescription = normalizeText(video.description || '')
    const normalizedTags = (video.tags ? Object.values(video.tags).flat() : []).map(normalizeText)
    
    return searchTerms.every(searchWord => {
      const normalizedSearchWord = normalizeText(searchWord)
      
      if (normalizedTitle.includes(normalizedSearchWord)) return true
      if (normalizedDescription.includes(normalizedSearchWord)) return true
      if (normalizedTags.some(tag => tag.includes(normalizedSearchWord))) return true
      
      return false
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

  // Aplicar filtro de compatibilidad sobre los videos ya filtrados
  const baseCompatibilityFiltered = getFilteredVideos(baseFilteredVideos)

  // Aplicar ordenamiento final
  const filteredVideos = sortVideos(baseCompatibilityFiltered)

  // Función para descargar video usando el sistema optimizado
  const downloadVideo = async (video) => {
    try {
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
      addToast(`❌ Error al descargar: ${error.message}`, 'error')
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
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row items-center justify-between py-6">
            <div className="text-center sm:text-left mb-4 sm:mb-0">
              <h1 className="text-3xl font-bold text-gray-900">
                ESCUELA - SALSA
              </h1>
              <p className="text-gray-600 mt-1">
                Galería de videos de escuela de salsa
              </p>
            </div>
            
            {/* Style Selector */}
            <div className="flex space-x-2">
              {availableStyles.map((style) => {
                const Icon = style.icon
                return (
                  <button
                    key={style.name}
                    onClick={() => setSelectedStyle(style.name)}
                    className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
                      selectedStyle === style.name
                        ? `bg-gradient-to-r ${getGradientClasses(style.name)} text-white shadow-lg transform scale-105`
                        : 'bg-white text-gray-700 border border-gray-200 hover:bg-gray-50'
                    }`}
                  >
                    <Icon className="h-5 w-5" />
                    <span className="capitalize">{style.name}</span>
                    {style.hasNotification && (
                      <span className="bg-red-500 text-white text-xs rounded-full px-2 py-1">
                        NEW
                      </span>
                    )}
                  </button>
                )
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
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
              showFilters ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
            }`}>
              <div className="space-y-4 bg-gray-50 rounded-lg p-6 border border-gray-200">
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
        <div className="flex flex-col sm:flex-row gap-4 justify-center mb-6">
          <button 
            onClick={() => setIsUploadModalOpen(true)}
            className={`flex items-center justify-center space-x-2 px-6 py-3 bg-gradient-to-r ${getGradientClasses(selectedStyle)} text-white rounded-lg font-medium shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105`}
          >
            <Upload className="h-5 w-5" />
            <span>SUBIR VIDEO(S) A {selectedStyle.toUpperCase()}</span>
          </button>
          <button 
            onClick={toggleBuilder}
            className={`flex items-center justify-center space-x-2 px-6 py-3 rounded-lg font-medium shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105 ${
              isBuilderOpen 
                ? 'bg-gradient-to-r from-red-500 to-pink-500 text-white' 
                : `bg-gradient-to-r ${getGradientClasses(selectedStyle)} hover:opacity-90 text-white`
            }`}
          >
            <Shuffle className="h-5 w-5" />
            <span>{isBuilderOpen ? 'OCULTAR SECUENCIA' : 'CREAR SECUENCIA'}</span>
          </button>
        </div>

        {/* Botones de ordenamiento y favoritos */}
        <div className="flex flex-wrap justify-center gap-3 mb-6">
          {/* Botón A-Z/Z-A combinado */}
          <button
            onClick={() => handleSortChange(sortBy === 'name' ? 'name-desc' : 'name')}
            className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
              sortBy === 'name' || sortBy === 'name-desc'
                ? `bg-gradient-to-r ${getGradientClasses(selectedStyle)} text-white shadow-lg`
                : 'bg-white text-gray-700 border border-gray-200 hover:bg-gray-50'
            }`}
          >
            <span>{sortBy === 'name' ? 'A-Z' : sortBy === 'name-desc' ? 'Z-A' : 'A-Z'}</span>
          </button>
          
          {/* Botón Puntuación */}
          <button
            onClick={() => handleSortChange(sortBy === 'rating' ? 'rating-desc' : 'rating')}
            className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
              sortBy === 'rating' || sortBy === 'rating-desc'
                ? `bg-gradient-to-r ${getGradientClasses(selectedStyle)} text-white shadow-lg`
                : 'bg-white text-gray-700 border border-gray-200 hover:bg-gray-50'
            }`}
          >
            <Star className="h-4 w-4" />
            <span>{sortBy === 'rating' ? 'Puntuación ↓' : sortBy === 'rating-desc' ? 'Puntuación ↑' : 'Puntuación'}</span>
          </button>
          
          {/* Botón Favoritos */}
          <button
            onClick={() => {
              if (!showFavorites) {
                setShowFavorites(true)
                setSortBy('likes')
              } else if (sortBy === 'likes') {
                setSortBy('likes-desc')
              } else if (sortBy === 'likes-desc') {
                setSortBy('likes')
              } else {
                setShowFavorites(false)
                setSortBy('none')
              }
            }}
            className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
              showFavorites
                ? `bg-gradient-to-r ${getGradientClasses(selectedStyle)} text-white shadow-lg`
                : 'bg-white text-gray-700 border border-gray-200 hover:bg-gray-50'
            }`}
          >
            <Heart className="h-4 w-4" />
            <span>
              {!showFavorites ? 'Mostrar Favoritos' : 
               sortBy === 'likes' ? 'Favoritos ↓' : 
               sortBy === 'likes-desc' ? 'Favoritos ↑' : 
               'Ocultar Favoritos'}
            </span>
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
        <div className="flex justify-center gap-4 mb-8">
          <button
            onClick={() => setActiveTab('videos')}
            className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
              activeTab === 'videos'
                ? `bg-gradient-to-r ${getGradientClasses(selectedStyle)} text-white shadow-lg transform scale-105`
                : 'bg-white text-gray-700 border border-gray-200 hover:bg-gray-50'
            }`}
          >
            <Music className="h-6 w-6" />
            <span>GALERÍA DE VIDEOS</span>
          </button>
          <button
            onClick={() => setActiveTab('secuencias')}
            className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
              activeTab === 'secuencias'
                ? `bg-gradient-to-r ${getGradientClasses(selectedStyle)} text-white shadow-lg transform scale-105`
                : 'bg-white text-gray-700 border border-gray-200 hover:bg-gray-50'
            }`}
          >
            <Plus className="h-6 w-6" />
            <span>GALERÍA DE SECUENCIAS ({sequences.length})</span>
          </button>
        </div>

        {/* Videos Grid */}
        {activeTab === 'videos' && (
          <div className="mb-8">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-2xl font-semibold text-gray-800">
                  Videos de {selectedStyle.toLowerCase()} ({filteredVideos.length})
                </h2>
                {(activeCategoryChips.length > 0 || sortBy !== 'none' || showFavorites) && (
                  <p className="text-sm text-gray-600 mt-1">
                    {activeCategoryChips.length > 0 && `Filtrado por: ${activeCategoryChips.join(', ')} `}
                    {sortBy !== 'none' && `• Ordenado por: ${sortBy} `}
                    {showFavorites && '• Solo favoritos'}
                  </p>
                )}
              </div>
              <div className="flex items-center space-x-4">
                {/* Selector de tamaño de cards */}
                <CardSizeSelector type="video" />
                
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
                  {isFullWidth ? (
                    <Minimize2 className="h-4 w-4" />
                  ) : (
                    <Maximize2 className="h-4 w-4" />
                  )}
                  <span className="hidden sm:inline">
                    {isFullWidth ? "Compacto" : "Ancho completo"}
                  </span>
                </button>
              </div>
            </div>

            {/* Videos Grid */}
            {filteredVideos.length === 0 ? (
              <div className="text-center py-12">
                <Music className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  No se encontraron videos
                </h3>
                <p className="text-gray-600">
                  {searchTerm ? 'Intenta con otros términos de búsqueda' : 'No hay videos disponibles'}
                </p>
              </div>
            ) : (
              <div className={`grid gap-6 ${getVideoConfig().grid}`}>
                {filteredVideos.map((video) => (
                  <div
                    key={video.id}
                    className={`bg-white rounded-lg shadow-md hover:shadow-lg transition-all duration-200 overflow-hidden ${getVideoConfig().maxWidth}`}
                  >
                    {/* Video Thumbnail */}
                    <div className="relative group">
                      <img
                        src={video.thumbnailURL || '/placeholder-video.jpg'}
                        alt={video.title}
                        className={`w-full object-cover transition-transform duration-200 group-hover:scale-105 ${getVideoConfig().aspect}`}
                      />
                      
                      {/* Overlay con controles */}
                      <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-all duration-200 flex items-center justify-center">
                        <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex space-x-2">
                          <button
                            onClick={() => handlePlayVideo(video)}
                            className="bg-white bg-opacity-90 text-gray-800 p-2 rounded-full hover:bg-opacity-100 transition-all duration-200"
                          >
                            <Play className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => downloadVideo(video)}
                            className="bg-white bg-opacity-90 text-gray-800 p-2 rounded-full hover:bg-opacity-100 transition-all duration-200"
                          >
                            <Download className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Video Info */}
                    <div className="p-4">
                      <h3 className={`font-semibold text-gray-900 mb-2 line-clamp-2 ${getVideoConfig().titleSize}`}>
                        {video.title}
                      </h3>
                      
                      {/* Tags */}
                      <div className="flex flex-wrap gap-1 mb-3">
                        {getOrderedTags(video).slice(0, getVideoConfig().maxTags).map((tagInfo, index) => (
                          <CategoryBadge
                            key={index}
                            tag={tagInfo.tag}
                            category={tagInfo.category}
                            colorClasses={tagInfo.color}
                            size={getVideoConfig().tagSize}
                          />
                        ))}
                        {getOrderedTags(video).length > getVideoConfig().maxTags && (
                          <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                            +{getOrderedTags(video).length - getVideoConfig().maxTags}
                          </span>
                        )}
                      </div>

                      {/* Actions */}
                      <CompactCardActions
                        video={video}
                        onPlay={() => handlePlayVideo(video)}
                        onEdit={() => openEditModal(video)}
                        onDelete={() => openDeleteModal(video)}
                        onDownload={() => downloadVideo(video)}
                        onLike={() => handleVideoLike(video)}
                        size={getVideoConfig().size}
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Sequences Gallery */}
        {activeTab === 'secuencias' && (
          <Suspense fallback={<LoadingSpinner />}>
            <SequenceGallery
              sequences={sequences}
              onPlaySequence={handlePlaySequence}
              onEditSequence={handleEditSequence}
              onDeleteSequence={handleDeleteSequence}
              onDownloadSequence={handleDownloadSequence}
              style={selectedStyle}
            />
          </Suspense>
        )}
      </div>

      {/* Modals */}
      <Suspense fallback={<LoadingSpinner />}>
        {/* Video Upload Modal */}
        {isUploadModalOpen && (
          <VideoUploadModal
            isOpen={isUploadModalOpen}
            onClose={() => setIsUploadModalOpen(false)}
            onVideoUploaded={handleVideoUploaded}
            style={selectedStyle}
            page="escuela"
          />
        )}

        {/* Video Edit Modal */}
        {editModal.isOpen && (
          <VideoEditModal
            isOpen={editModal.isOpen}
            onClose={closeEditModal}
            video={editModal.video}
            onVideoUpdated={handleVideoUpdated}
          />
        )}

        {/* Video Player Modal */}
        {showVideoModal && selectedVideo && (
          <VideoPlayer
            video={selectedVideo}
            onClose={handleCloseVideoPlayer}
            onDownload={() => downloadVideo(selectedVideo)}
          />
        )}

        {/* Sequence Video Player Modal */}
        {showSequencePlayer && selectedSequence && (
          <SequenceVideoPlayer
            sequence={selectedSequence}
            onClose={handleCloseSequencePlayer}
          />
        )}

        {/* Download Sequence Modal */}
        {downloadSequenceModal.isOpen && downloadSequenceModal.sequence && (
          <DownloadModal
            isOpen={downloadSequenceModal.isOpen}
            onClose={handleCloseDownloadSequence}
            videos={downloadSequenceModal.sequence.videos}
            sequenceName={downloadSequenceModal.sequence.name}
          />
        )}
      </Suspense>

      {/* Confirm Modal */}
      <ConfirmModal
        isOpen={deleteModal.isOpen}
        onClose={closeDeleteModal}
        onConfirm={() => handleDeleteVideo(deleteModal.video)}
        title="Eliminar Video"
        message={`¿Estás seguro de que quieres eliminar "${deleteModal.video?.title}"? Esta acción no se puede deshacer.`}
        confirmText="Eliminar"
        cancelText="Cancelar"
        confirmColor="red"
      />

      {/* Toast Notifications */}
      <div className="fixed top-4 right-4 z-50 space-y-2">
        {toasts.map((toast) => (
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