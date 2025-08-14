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
  CheckCircle,
  BookOpen,
  Shuffle,
  Eye,
  EyeOff,
  Loader,
  Share2
} from 'lucide-react'
import { useCategories } from '../hooks/useCategories'
import CategoryBadge from '../components/common/CategoryBadge'
import ConfirmModal from '../components/common/ConfirmModal'
import Toast from '../components/common/Toast'
import CardSizeSelector from '../components/common/CardSizeSelector'
import CategoryChips from '../components/common/CategoryChips'
import { useSequenceBuilderContext } from '../contexts/SequenceBuilderContext'
import { ref, getDownloadURL } from 'firebase/storage'
import { storage } from '../services/firebase/config'

// Lazy loading de componentes pesados
const VideoUploadModal = lazy(() => import('../components/video/VideoUploadModal'))
const VideoEditModal = lazy(() => import('../components/video/VideoEditModal'))
const DownloadModal = lazy(() => import('../components/video/DownloadModal'))
const SequenceBuilder = lazy(() => import('../components/sequence/SequenceBuilder'))
const SequenceGallery = lazy(() => import('../components/sequence/SequenceGallery'))
const SequenceVideoPlayer = lazy(() => import('../components/sequence/SequenceVideoPlayer'))
import ShareVideoModal from '../components/common/ShareVideoModal'

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
  checkUserFavorite,
  toggleUserHiddenVideo,
  checkUserHiddenVideo
} from '../services/firebase/firestore'
import { useLocation } from 'react-router-dom'
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
  const [editSequenceModal, setEditSequenceModal] = useState({ isOpen: false, sequence: null })
  const [downloadSequenceModal, setDownloadSequenceModal] = useState({ isOpen: false, sequence: null })
  const [migrationModal, setMigrationModal] = useState({ isOpen: false })
  const [isFullWidth, setIsFullWidth] = useState(false) // Modo ancho completo
  const [shareState, setShareState] = useState({ isOpen: false, video: null })
  
  // Estados para reproductor de video individual
  const [selectedVideo, setSelectedVideo] = useState(null)
  const [showVideoPlayer, setShowVideoPlayer] = useState(false)
  
  // Estados para reproductor de secuencias
  const [selectedSequence, setSelectedSequence] = useState(null)
  const [showSequencePlayer, setShowSequencePlayer] = useState(false)
  const [lastWatched, setLastWatched] = useState(null)
  const location = useLocation()
  
  // Estados para el sistema de chips y filtros
  const [activeCategoryChips, setActiveCategoryChips] = useState([])
  // Nuevo modelo de ordenamiento: clave + dirección (tri-estado por botón)
  const [sortKey, setSortKey] = useState('none') // 'none' | 'name' | 'rating' | 'likes'
  const [sortDir, setSortDir] = useState('asc')  // 'asc' | 'desc'
  const [showFavorites, setShowFavorites] = useState(false)
  const [showHiddenVideos, setShowHiddenVideos] = useState(false)
  
  // Estados para secuencias
  const [sequences, setSequences] = useState([])
  const [sequencesLoading, setSequencesLoading] = useState(true)
  
  const { user, userProfile } = useAuth()
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
  } = useCategories('figuras', selectedStyle)
  
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
      setVideos(prev => videosData.map(v => {
        const prevItem = prev.find(p => p.id === v.id)
        return prevItem ? { ...v, userLiked: prevItem.userLiked, isFavorite: prevItem.isFavorite, isInStudy: prevItem.isInStudy, isCompleted: prevItem.isCompleted } : v
      }))
      setLoading(false)
      setSyncStatus('idle')
    })
    
    // Cleanup al desmontar o cambiar estilo
    return () => {
      unsubscribe()
    }
  }, [selectedStyle])

  // Verificar estado de likes/favoritos/estudios cuando se cargan videos
  useEffect(() => {
    if (videos.length > 0 && user) {
      const checkUserLikesAndFavorites = async () => {
        const updatedVideos = await Promise.all(
          videos.map(async (video) => {
            try {
              const { checkUserStudy, checkUserStudyCompleted } = await import('../services/firebase/firestore')
              const [likeResult, favoriteResult, studyResult, completedResult, hiddenResult] = await Promise.all([
                checkUserLikedVideo(video.id, user.uid),
                checkUserFavorite(video.id, user.uid),
                checkUserStudy(video.id, user.uid),
                checkUserStudyCompleted(video.id, user.uid),
                checkUserHiddenVideo(video.id, user.uid)
              ])
              return { 
                ...video, 
                userLiked: likeResult.userLiked,
                isFavorite: favoriteResult.isFavorite,
                isInStudy: studyResult.isInStudy,
                isCompleted: completedResult.isCompleted,
                userHidden: hiddenResult.isHidden
              }
            } catch (error) {
              console.error('Error al verificar estados de video:', video.id, error)
              return { ...video, userLiked: false, isFavorite: false, isInStudy: false, isCompleted: false, userHidden: false }
            }
          })
        )
        
        setVideos(updatedVideos)
      }
      
      checkUserLikesAndFavorites()
    }
  }, [videos.length, user])

  // Acciones de estudio
  const handleToggleStudy = async (video) => {
    try {
      const { toggleUserStudy } = await import('../services/firebase/firestore')
      const result = await toggleUserStudy(video.id, user.uid, 'figuras')
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
      const { setUserStudyCompleted } = await import('../services/firebase/firestore')
      const result = await setUserStudyCompleted(video.id, user.uid, !video.isCompleted)
      if (result.success) {
        setVideos(prev => prev.map(v => v.id === video.id ? { ...v, isCompleted: result.isCompleted } : v))
        addToast(result.isCompleted ? 'Marcado como completado' : 'Marcado como pendiente', 'success')
      }
    } catch (e) {
      addToast('Error al actualizar completado', 'error')
    }
  }

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

  // Función para manejar videos ocultos
  const handleToggleHiddenVideo = async (video) => {
    if (!user) {
      addToast('Debes iniciar sesión para ocultar videos', 'error')
      return
    }

    try {
      const result = await toggleUserHiddenVideo(video.id, user.uid)
      if (result?.success) {
        setVideos(prev => prev.map(v => v.id === video.id ? { ...v, userHidden: result.isHidden } : v))
        addToast(result.isHidden ? 'Video ocultado' : 'Video mostrado', 'success')
      } else {
        addToast('Error al ocultar/mostrar video', 'error')
      }
    } catch (error) {
      console.error('Error al toggle video oculto:', error)
      addToast('Error al ocultar/mostrar video', 'error')
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
    // Verificar permisos de descarga
    if (!user || !userProfile) {
      addToast('❌ Debes iniciar sesión para descargar secuencias', 'error')
      return
    }

    // Solo Super Admin puede descargar
    if (userProfile.role !== 'super_admin') {
      addToast('❌ Solo Super Admin puede descargar secuencias', 'error')
      return
    }

    setDownloadSequenceModal({ isOpen: true, sequence })
  }

  const handleCloseDownloadSequence = () => {
    setDownloadSequenceModal({ isOpen: false, sequence: null })
  }
  
  // Función para reproducir video individual
  const handlePlayVideo = async (video) => {
    setSelectedVideo(video)
    setShowVideoPlayer(true)
    addToast(`🎬 Reproduciendo: ${video.title}`, 'info')
    try {
      if (user?.uid) {
        const { setUserLastWatched } = await import('../services/firebase/firestore')
        await setUserLastWatched(user.uid, video, 'figuras')
      }
    } catch (_) {}
  }
  
  // Función para cerrar el reproductor
  const handleCloseVideoPlayer = () => {
    setShowVideoPlayer(false)
    setSelectedVideo(null)
  }
  
  // Función para cerrar el reproductor de secuencias
  const handleCloseSequencePlayer = () => {
    setShowSequencePlayer(false)
    setSelectedSequence(null)
  }

  // Cargar último visto del usuario
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

  // Reanudar reproducción si viene ?play=id
  useEffect(() => {
    const params = new URLSearchParams(location.search)
    const playId = params.get('play')
    if (playId && Array.isArray(videos) && videos.length > 0) {
      const v = videos.find(x => x.id === playId)
      if (v) {
        handlePlayVideo(v)
      }
    }
  }, [location.search, videos])

  const isRecentLastWatched = (lw) => {
    try {
      if (!lw?.watchedAt) return false
      const toMs = (t) => (t?.toMillis ? t.toMillis() : (t instanceof Date ? t.getTime() : new Date(t).getTime()))
      const watched = toMs(lw.watchedAt)
      const fourMonthsMs = 4 * 30 * 24 * 60 * 60 * 1000
      return Date.now() - watched <= fourMonthsMs
    } catch { return false }
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

  // Funciones para el sistema de chips y filtros
  const handleCategoryChipFilter = (chips) => {
    setActiveCategoryChips(chips)
  }

  // Dejado por compat: no usar; el nuevo modelo usa sortKey/sortDir
  const handleSortChange = () => {}

  const handleShowFavorites = (show) => {
    setShowFavorites(show)
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

  // Función para ordenar videos
  const sortVideos = (videosToSort) => {
    if (sortKey === 'none') return videosToSort

    const sorted = [...videosToSort]
    const dir = sortDir === 'asc' ? 1 : -1
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

  // Filtro por videos ocultos por usuario
  const hiddenFiltered = showHiddenVideos 
    ? baseCompatibilityFiltered.filter(v => v.userHidden)
    : baseCompatibilityFiltered.filter(v => !v.userHidden)

  // Aplicar ordenamiento final
  const filteredVideos = sortVideos(hiddenFiltered)

  // Función para descargar video usando el sistema optimizado
  const downloadVideo = async (video) => {
    // Verificar permisos de descarga
    if (!user || !userProfile) {
      addToast('❌ Debes iniciar sesión para descargar videos', 'error')
      return
    }

    // Solo Super Admin puede descargar
    if (userProfile.role !== 'super_admin') {
      addToast('❌ Solo Super Admin puede descargar videos', 'error')
      return
    }

    try {
      // Usar el sistema de descarga optimizado (imports estáticos)
      
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

  return (
    <div className="min-h-screen bg-white">
      {/* Main Content */}
      <div className={`${isFullWidth ? 'w-full px-0' : 'max-w-6xl mx-auto px-6'} py-8`}>
        {/* Title */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-2">
            <span className="text-pink-500">FIGURAS</span>
            <span className={`bg-gradient-to-r ${getGradientClasses(selectedStyle)} bg-clip-text text-transparent`}> - {selectedStyle.toUpperCase()}</span>
          </h1>
          <p className="text-gray-600 text-lg">Galería de videos de figuras de {selectedStyle.toLowerCase()}</p>
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
          {(userProfile?.role === 'maese' || userProfile?.role === 'super_admin') && (
            <button 
              onClick={() => setIsUploadModalOpen(true)}
              className={`flex items-center justify-center space-x-2 px-6 py-3 bg-gradient-to-r ${getGradientClasses(selectedStyle)} text-white rounded-lg font-medium shadow-lg hover:shadow-xl transition-colors duration-200`}
            >
              <Upload className="h-5 w-5" />
              <span>SUBIR VIDEO(S) A {selectedStyle.toUpperCase()}</span>
            </button>
          )}
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
            <span>GALERÍA DE VIDEOS</span>
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
            <span>GALERÍA DE SECUENCIAS ({sequences.length})</span>
          </button>
        </div>

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

          {/* Favoritos filtro */}
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

          {/* Videos Ocultos (filtro) */}
          {user && (
            <button
              onClick={() => setShowHiddenVideos(prev => !prev)}
              className={`flex items-center space-x-1 px-3 py-1.5 rounded-md text-sm font-medium transition-all duration-200 ${
                showHiddenVideos
                  ? `bg-gradient-to-r ${getGradientClasses(selectedStyle)} text-white shadow-md`
                  : 'bg-white text-gray-700 border border-gray-200 hover:bg-gray-50'
              }`}
            >
              <EyeOff className="h-3 w-3" />
              <span>{showHiddenVideos ? 'Ocultar Videos Ocultos' : 'Mostrar Videos Ocultos'}</span>
            </button>
          )}

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

          {(activeCategoryChips.length > 0 || sortKey !== 'none' || showFavorites || showHiddenVideos) && (
            <button
              onClick={() => {
                setActiveCategoryChips([])
                setSortKey('none'); setSortDir('asc')
                setShowFavorites(false)
                setShowHiddenVideos(false)
              }}
              className="flex items-center space-x-1 px-3 py-1.5 rounded-md text-sm font-medium bg-gray-100 text-gray-600 hover:bg-gray-200 hover:text-gray-800 transition-colors duration-200"
            >
              <X className="h-3 w-3" />
              <span>Limpiar filtros</span>
            </button>
          )}
        </div>



        {/* Videos Grid */}
        {activeTab === 'videos' && (
          <div className="mb-8">
            <div className="flex flex-wrap items-center justify-between gap-2 mb-6">
              <div>
                <h2 className="text-2xl font-semibold text-gray-800">
                  Videos de {selectedStyle.toLowerCase()} ({filteredVideos.length})
                </h2>
                {(activeCategoryChips.length > 0 || sortKey !== 'none' || showFavorites) && (
                  <p className="text-sm text-gray-600 mt-1">
                    {activeCategoryChips.length > 0 && `Filtrado por: ${activeCategoryChips.join(', ')} `}
                    {sortKey !== 'none' && `• Ordenado por: ${sortKey} ${sortDir === 'asc' ? '↑' : '↓'} `}
                    {showFavorites && '• Solo favoritos'}
                  </p>
                )}
              </div>
              <div className="flex flex-wrap items-center gap-4">
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
                  {isFullWidth ? (
                    <Minimize2 className="h-4 w-4" />
                  ) : (
                    <Maximize2 className="h-4 w-4" />
                  )}
                  <span className="hidden sm:inline">
                    {isFullWidth ? "Compacto" : "Ancho completo"}
                  </span>
                </button>
                
                {/* Botón para mostrar todos los videos vs solo compatibles */}
                {isBuilderOpen && (
                  <button
                    onClick={toggleShowAllVideos}
                    className={`flex items-center space-x-2 px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
                      showAllVideos 
                        ? 'bg-blue-100 text-blue-800' 
                        : 'bg-green-100 text-green-800'
                    }`}
                    title={showAllVideos ? 'Mostrar solo videos compatibles' : 'Mostrar todos los videos'}
                  >
                    {showAllVideos ? (
                      <>
                        <EyeOff className="h-4 w-4" />
                        <span>Ocultar Incompatibles</span>
                      </>
                    ) : (
                      <>
                        <Eye className="h-4 w-4" />
                        <span>Mostrar Todos</span>
                      </>
                    )}
                  </button>
                )}
                

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
                <div 
                  key={video.id} 
                  className={`bg-white rounded-lg shadow-md overflow-hidden border hover:shadow-lg transition-all duration-200 transform hover:scale-[1.02] ${
                    video.isCompleted
                      ? 'border-2 border-green-500 ring-2 ring-green-300'
                      : isBuilderOpen && !isVideoCompatible(video)
                        ? 'border-red-200 opacity-75'
                        : 'border-gray-100'
                  }`}
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
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                        </svg>
                        <span className="text-sm font-medium">{video.title}</span>
                      </div>
                      <div className="absolute bottom-2 left-2 bg-black bg-opacity-75 text-white px-2 py-1 rounded text-sm font-medium">
                        {video.resolution && video.resolution !== 'Unknown' ? video.resolution : 'HD'}
                      </div>
                      
                      {/* Indicador de compatibilidad */}
                      {isBuilderOpen && (
                        <div className={`absolute top-2 right-2 p-1 rounded-full text-xs font-bold ${
                          isVideoCompatible(video)
                            ? 'bg-green-500 text-white' 
                            : 'bg-red-500 text-white'
                        }`}>
                          {isVideoCompatible(video) ? '✅' : '❌'}
                        </div>
                      )}
                      {lastWatched && isRecentLastWatched(lastWatched) && lastWatched.id === video.id && (
                        <div className="absolute top-2 left-2 bg-pink-600 text-white px-2 py-1 rounded text-xs font-medium shadow">
                          Visto recientemente
                        </div>
                      )}
                    </div>
                    
                     {/* Botón de reproducción */}
                     <button
                       onClick={async () => {
                         handlePlayVideo(video);
                         return;
                         try {
                           if (user?.uid) {
                             const { setUserLastWatched } = await import('../services/firebase/firestore')
                             await setUserLastWatched(user.uid, video, 'figuras')
                             setLastWatched({
                               id: video?.id,
                               title: video?.title || video?.originalTitle || 'Video',
                               thumbnailUrl: video?.thumbnailUrl || null,
                               page: 'figuras',
                               watchedAt: new Date()
                             })
                           }
                         } catch (_) {}
                         try {
                           // Abrir modal de reproducción
                           const modal = document.createElement('div')
                           modal.className = 'fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50'
                           
                           const videoContainer = document.createElement('div')
                           videoContainer.className = 'bg-white rounded-lg p-6 max-w-5xl w-full mx-4 max-h-[95vh] overflow-y-auto'
                           videoContainer.onclick = (e) => e.stopPropagation()
                           
                           const header = document.createElement('div')
                           header.className = 'flex items-center justify-between mb-4'
                           header.innerHTML = `
                             <h3 class="text-xl font-semibold text-gray-900">${video.title}</h3>
                             <button class="text-gray-400 hover:text-gray-600 transition-colors">
                               <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                 <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
                               </svg>
                             </button>
                           `
                           
                           // Crear el VideoPlayer
                           const videoPlayerContainer = document.createElement('div')
                           videoPlayerContainer.id = 'video-player-container'
                           videoPlayerContainer.className = 'w-full flex justify-center mb-6'
                           
                           // Crear contenedor para información del video
                           const videoInfoContainer = document.createElement('div')
                           videoInfoContainer.className = 'w-full max-w-3xl mx-auto'
                           
                           // Descripción
                           const description = document.createElement('div')
                           description.className = 'mb-4'
                           description.innerHTML = `
                             <p class="text-gray-600 text-sm">${video.description || 'Sin descripción'}</p>
                           `
                           
                                                       // Stats del video
                            const stats = document.createElement('div')
                            stats.className = 'flex items-center justify-between mb-4 p-3 bg-gray-50 rounded-lg'
                            stats.innerHTML = `
                              <div class="flex items-center space-x-4 text-sm text-gray-600">
                                <span class="font-medium">${(video.fileSize / (1024 * 1024)).toFixed(2)} MB</span>
                                <span class="text-gray-400">•</span>
                                <span class="font-medium">${video.resolution && video.resolution !== 'Unknown' ? video.resolution : 'HD'}</span>
                                <span class="text-gray-400">•</span>
                                <span class="font-medium">${video.duration ? Math.floor(video.duration / 60) + ':' + String(Math.floor(video.duration % 60)).padStart(2, '0') : 'N/A'}</span>
                              </div>
                              <div class="flex items-center space-x-2">
                                <div class="flex items-center space-x-1">
                                  <div class="flex items-center space-x-1" title="Puntuación: ${video.rating || 0}/5">
                                    ${[1, 2, 3, 4, 5].map(star => {
                                      const isFilled = (video.rating || 0) >= star
                                      return `<svg class="w-4 h-4 ${isFilled ? 'text-yellow-400 fill-current' : 'text-gray-300'}" fill="currentColor" viewBox="0 0 24 24">
                                        <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                                      </svg>`
                                    }).join('')}
                                    <span class="text-sm font-medium text-gray-600">${video.rating || 0}</span>
                                  </div>
                                </div>
                                <button class="flex items-center space-x-1 ${video.userLiked ? 'text-red-500' : 'text-gray-400 hover:text-red-500'} transition-colors duration-200 p-2 rounded hover:bg-red-50" title="${video.userLiked ? 'Quitar like' : 'Dar like'}">
                                  <svg class="w-5 h-5 ${video.userLiked ? 'fill-current' : ''}" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"></path>
                                  </svg>
                                  <span class="text-sm font-medium">${video.likes || 0}</span>
                                </button>
                                <button class="text-gray-400 hover:text-green-500 transition-colors duration-200 p-2 rounded hover:bg-green-50" title="Descargar video">
                                  <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
                                  </svg>
                                </button>
                                <button class="text-gray-400 hover:text-blue-500 transition-colors duration-200 p-2 rounded hover:bg-blue-50" title="Editar video">
                                  <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path>
                                  </svg>
                                </button>
                              </div>
                            `
                           
                           // Tags normales
                           const tagsContainer = document.createElement('div')
                           tagsContainer.className = 'mb-4'
                           const orderedTags = getOrderedTags(video)
                           if (orderedTags.length > 0) {
                             const tagsHTML = orderedTags.map(({ tag, categoryKey, color }) => {
                               const colorClasses = getColorClasses(color)
                               return `<span class="inline-block px-3 py-1 rounded-full text-sm font-medium ${colorClasses} mr-2 mb-2">${tag}</span>`
                             }).join('')
                             tagsContainer.innerHTML = `
                               <h4 class="text-sm font-medium text-gray-700 mb-2">Etiquetas:</h4>
                               <div class="flex flex-wrap">${tagsHTML}</div>
                             `
                           } else {
                             tagsContainer.innerHTML = `
                               <h4 class="text-sm font-medium text-gray-700 mb-2">Etiquetas:</h4>
                               <span class="text-gray-400 text-sm">Sin etiquetas</span>
                             `
                           }
                           
                           // Tags iniciales
                           const tagsInicialesContainer = document.createElement('div')
                           tagsInicialesContainer.className = 'mb-4'
                           const tagsIniciales = getOrderedTagsIniciales(video)
                           if (tagsIniciales.length > 0) {
                             const tagsHTML = tagsIniciales.map(({ tag }) => 
                               `<span class="inline-block px-3 py-1 rounded-full text-sm font-medium bg-gradient-to-r from-blue-500 to-purple-500 text-white mr-2 mb-2">${tag}</span>`
                             ).join('')
                             tagsInicialesContainer.innerHTML = `
                               <h4 class="text-sm font-medium text-blue-600 uppercase tracking-wide mb-2">Etiquetas Iniciales:</h4>
                               <div class="flex flex-wrap">${tagsHTML}</div>
                             `
                           }
                           
                           // Tags finales
                           const tagsFinalesContainer = document.createElement('div')
                           tagsFinalesContainer.className = 'mb-4'
                           const tagsFinales = getOrderedTagsFinales(video)
                           if (tagsFinales.length > 0) {
                             const tagsHTML = tagsFinales.map(({ tag }) => 
                               `<span class="inline-block px-3 py-1 rounded-full text-sm font-medium bg-gradient-to-r from-green-500 to-teal-500 text-white mr-2 mb-2">${tag}</span>`
                             ).join('')
                             tagsFinalesContainer.innerHTML = `
                               <h4 class="text-sm font-medium text-green-600 uppercase tracking-wide mb-2">Etiquetas Finales:</h4>
                               <div class="flex flex-wrap">${tagsHTML}</div>
                             `
                           }
                           
                           // Contenedor de comentarios (modo Instagram sencillo)
                           const commentsContainer = document.createElement('div')
                           commentsContainer.className = 'mt-4'
                           
                           // Ensamblar todo
                           videoInfoContainer.appendChild(description)
                           videoInfoContainer.appendChild(stats)
                           videoInfoContainer.appendChild(tagsContainer)
                           if (tagsIniciales.length > 0) {
                             videoInfoContainer.appendChild(tagsInicialesContainer)
                           }
                           if (tagsFinales.length > 0) {
                             videoInfoContainer.appendChild(tagsFinalesContainer)
                           }
                           
                           videoContainer.appendChild(header)
                           videoContainer.appendChild(videoPlayerContainer)
                           videoContainer.appendChild(videoInfoContainer)
                           videoContainer.appendChild(commentsContainer)
                           modal.appendChild(videoContainer)
                           document.body.appendChild(modal)
                           
                           // Renderizar el VideoPlayer usando React
                           const { createRoot } = await import('react-dom/client')
                           const root = createRoot(videoPlayerContainer)
                           root.render(React.createElement(VideoPlayer, {
                             src: video.videoUrl,
                             size: 'large',
                             loop: true,
                             initialShowControls: true,
                             autoplay: true,
                             muted: false,
                             className: 'w-full max-w-3xl',
                             resolutions: ['auto', '4k', '1080p', '720p', '480p', '360p'],
                             currentResolution: 'auto',
                             videoTitle: video.title || 'video',
                             onResolutionChange: (resolution) => {
                               // Aquí se implementaría la lógica para cambiar la resolución del video
                             }
                           }))
                           
                           // Guardar referencia del root para limpieza
                           modal._root = root
                           
                           const closeModal = () => {
                             if (modal._root) {
                               modal._root.unmount()
                             }
                             if (document.body.contains(modal)) {
                               document.body.removeChild(modal)
                             }
                           }
                           
                           header.querySelector('button').onclick = closeModal
                           modal.onclick = (e) => {
                             if (e.target === modal) {
                               closeModal()
                             }
                           }
                           
                           // Añadir funcionalidad al botón de descarga (solo para maestros)
                           const downloadButton = stats.querySelector('button[title="Descargar video"]')
                           if (downloadButton && (userProfile?.role === 'maese' || userProfile?.role === 'super_admin')) {
                             downloadButton.onclick = () => {
                               downloadVideo(video)
                             }
                           } else if (downloadButton) {
                             // Ocultar botón para usuarios sin permisos
                             downloadButton.style.display = 'none'
                           }
                           
                           // Añadir funcionalidad al botón de editar
                           stats.querySelector('button[title="Editar video"]').onclick = () => {
                             closeModal()
                             openEditModal(video)
                           }
                           
                                                       // Añadir funcionalidad al sistema de rating
                            const ratingContainer = stats.querySelector('div[title*="Puntuación"]')
                            const stars = ratingContainer.querySelectorAll('svg')
                            const ratingText = ratingContainer.querySelector('span')
                            
                            stars.forEach((star, index) => {
                              const starValue = index + 1
                              
                              // Hover effect
                              star.addEventListener('mouseenter', () => {
                                stars.forEach((s, i) => {
                                  if (i <= index) {
                                    s.classList.add('text-yellow-400', 'fill-current')
                                    s.classList.remove('text-gray-300')
                                  }
                                })
                              })
                              
                              star.addEventListener('mouseleave', () => {
                                stars.forEach((s, i) => {
                                  const currentRating = video.rating || 0
                                  if (i < currentRating) {
                                    s.classList.add('text-yellow-400', 'fill-current')
                                    s.classList.remove('text-gray-300')
                                  } else {
                                    s.classList.remove('text-yellow-400', 'fill-current')
                                    s.classList.add('text-gray-300')
                                  }
                                })
                              })
                              
                              // Click to rate
                              star.addEventListener('click', async () => {
                                try {
                                  const currentRating = video.rating || 0
                                  // Si la estrella clickeada ya está marcada, quitar todas las estrellas (rating = 0)
                                  // Si no está marcada, asignar el valor de la estrella
                                  const newRating = currentRating >= starValue ? 0 : starValue
                                  
                                  // Actualizar en Firestore
                                  await updateVideoDocument(video.id, { rating: newRating })
                                  
                                  // Actualizar estado local
                                  video.rating = newRating
                                  
                                  // Actualizar visual
                                  stars.forEach((s, i) => {
                                    if (i < newRating) {
                                      s.classList.add('text-yellow-400', 'fill-current')
                                      s.classList.remove('text-gray-300')
                                    } else {
                                      s.classList.remove('text-yellow-400', 'fill-current')
                                      s.classList.add('text-gray-300')
                                    }
                                  })
                                  
                                  ratingText.textContent = newRating
                                  ratingContainer.title = `Puntuación: ${newRating}/5`
                                  
                                  // Video puntuado exitosamente
                                } catch (error) {
                                  console.error('Error al actualizar puntuación:', error)
                                }
                              })
                            })
                            
                            // Añadir funcionalidad al botón de likes
                            const likeButton = stats.querySelector('button[title*="like"]')
                            likeButton.onclick = async () => {
                              if (!user) {
                                alert('Debes iniciar sesión para dar like')
                                return
                              }
                              
                              try {
                                const result = await toggleVideoLike(video.id, user.uid)
                                
                                if (result.success) {
                                  // Actualizar el video en el estado local
                                  video.likes = result.likes
                                  video.likedBy = result.likedBy
                                  video.userLiked = result.userLiked
                                  
                                  // Actualizar el estado global de videos
                                  setVideos(prevVideos => 
                                    prevVideos.map(v => 
                                      v.id === video.id 
                                        ? { 
                                            ...v, 
                                            likes: result.likes, 
                                            likedBy: result.likedBy,
                                            userLiked: result.userLiked 
                                          }
                                        : v
                                    )
                                  )
                                  
                                  // Cambiar el estado visual del botón
                                  const icon = likeButton.querySelector('svg')
                                  const button = likeButton
                                  const likesText = likeButton.querySelector('span')
                                  
                                  if (result.userLiked) {
                                    icon.classList.add('fill-current', 'text-red-500')
                                    icon.classList.remove('text-gray-400')
                                    button.classList.add('text-red-500')
                                    button.classList.remove('text-gray-400')
                                    button.title = 'Quitar like'
                                  } else {
                                    icon.classList.remove('fill-current', 'text-red-500')
                                    icon.classList.add('text-gray-400')
                                    button.classList.remove('text-red-500')
                                    button.classList.add('text-gray-400')
                                    button.title = 'Dar like'
                                  }
                                  
                                  // Actualizar el contador
                                  likesText.textContent = result.likes
                                  
                                  const action = result.userLiked ? 'dado like a' : 'quitado like de'
                                } else {
                                  console.error('Error al actualizar like')
                                }
                              } catch (error) {
                                console.error('Error al actualizar like:', error)
                              }
                            }
                         } catch (error) {
                           console.error('Error al abrir modal de video:', error)
                         }
                       }}
                      className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                    >
                      <svg className="w-12 h-12 text-white" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M8 5v14l11-7z"/>
                      </svg>
                    </button>
                  </div>
                  
                                     <div className={`${getVideoConfig(isFullWidth).compact ? 'p-2' : 'p-4'}`}>
                                             <div className={`flex flex-wrap items-center justify-between gap-1 ${getVideoConfig(isFullWidth).compact ? 'mb-1' : 'mb-2'}`}>
                         <h3 className={`font-semibold text-gray-800 ${getVideoConfig(isFullWidth).titleSize}`}>{video.title}</h3>
                        <div className="flex flex-wrap items-center gap-1">
                         {[1, 2, 3, 4, 5].map(star => {
                           const isFilled = (video.rating || 0) >= star
                             return (
                              <svg 
                               key={star}
                               className={`${getVideoConfig(isFullWidth).compact ? 'h-3 w-3' : 'h-4 w-4'} shrink-0 ${isFilled ? 'text-yellow-400 fill-current' : 'text-gray-300'} cursor-pointer`} 
                               fill="currentColor" 
                               viewBox="0 0 24 24"
                               onClick={async () => {
                                 try {
                                   const currentRating = video.rating || 0
                                   // Si la estrella clickeada ya está marcada, quitar todas las estrellas (rating = 0)
                                   // Si no está marcada, asignar el valor de la estrella
                                   const newRating = currentRating >= star ? 0 : star
                                   await updateVideoDocument(video.id, { rating: newRating })
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
                          <span className={`${getVideoConfig(isFullWidth).compact ? 'text-xs' : 'text-xs'} font-medium text-gray-500`}>({video.rating || 0})</span>
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
                     {/* Tags Iniciales */}
                                           {getVideoConfig(isFullWidth).showTags && (() => {
                        const tagsIniciales = getOrderedTagsIniciales(video)
                        if (tagsIniciales.length > 0) {
                          return (
                            <div className="mb-3">
                              <div className="flex flex-wrap items-center gap-2 mb-2">
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
                                           {getVideoConfig(isFullWidth).showTags && (() => {
                        const tagsFinales = getOrderedTagsFinales(video)
                        if (tagsFinales.length > 0) {
                          return (
                            <div className="mb-3">
                              <div className="flex flex-wrap items-center gap-2 mb-2">
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
                    
                    {/* Barra de acciones compactas (como antes) */}
                    <div className="flex flex-wrap items-center justify-between gap-2 text-sm text-gray-500">
                        <div className="flex items-center gap-2">
                        <span className="font-medium">{(video.fileSize / (1024 * 1024)).toFixed(2)} MB</span>
                      </div>
                      <div className="flex flex-wrap items-center gap-2">
                        <button 
                          onClick={() => handlePlayVideo(video)}
                          className="text-gray-400 hover:text-blue-500 transition-colors duration-200 p-1 rounded hover:bg-blue-50"
                          title="Reproducir video"
                        >
                          <Play className="h-4 w-4" />
                        </button>
                        <button 
                          onClick={() => handleVideoLike(video)}
                          className={`flex items-center space-x-1 transition-colors duration-200 p-1 rounded hover:bg-red-50 ${video.userLiked ? 'text-red-500' : 'text-gray-400 hover:text-red-500'}`}
                          title={video.userLiked ? 'Quitar like' : 'Dar like'}
                        >
                          <Heart className={`h-4 w-4 ${video.userLiked ? 'fill-current' : ''}`} />
                          <span className="font-medium">{video.likes || 0}</span>
                        </button>
                        <button
                          onClick={() => handleToggleStudy(video)}
                          className={`transition-colors duration-200 p-1 rounded ${video.isInStudy ? 'text-blue-600 bg-blue-50 ring-2 ring-blue-300' : 'text-gray-400 hover:text-blue-600 hover:bg-blue-50'}`}
                          title={video.isInStudy ? 'Quitar de estudios' : 'Añadir a estudios'}
                        >
                          <BookOpen className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleToggleCompleted(video)}
                          className={`transition-colors duration-200 p-1 rounded ${video.isCompleted ? 'text-green-600 bg-green-50 ring-2 ring-green-300' : 'text-gray-400 hover:text-green-600 hover:bg-green-50'}`}
                          title={video.isCompleted ? 'Marcar como pendiente' : 'Marcar como completado'}
                        >
                          <CheckCircle className="h-4 w-4" />
                        </button>
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
                            onClick={() => {
                              downloadVideo(video)
                            }}
                            className="text-gray-400 hover:text-green-500 transition-colors duration-200 p-1 rounded hover:bg-green-50"
                            title="Descargar video"
                          >
                            <Download className="h-4 w-4" />
                          </button>
                        )}
                        {/* Añadir a secuencia (con compatibilidad) */}
                        <button
                          onClick={() => handleAddVideoToSequence(video)}
                          disabled={isVideoInSequence(video)}
                          className={`transition-colors duration-200 p-1 rounded ${
                            isVideoInSequence(video)
                              ? 'text-gray-300 cursor-not-allowed'
                              : isBuilderOpen && !isVideoCompatible(video)
                              ? 'text-red-400 hover:text-red-500 hover:bg-red-50'
                              : 'text-gray-400 hover:text-purple-500 hover:bg-purple-50'
                          }`}
                          title={
                            isVideoInSequence(video)
                              ? 'Ya en secuencia'
                              : isBuilderOpen && !isVideoCompatible(video)
                              ? 'Añadir forzadamente (incompatible)'
                              : 'Añadir a secuencia'
                          }
                        >
                          <Plus className="h-4 w-4" />
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
                        <button
                          onClick={() => setShareState({ isOpen: true, video })}
                          className="text-gray-400 hover:text-pink-600 transition-colors duration-200 p-1 rounded hover:bg-pink-50"
                          title="Reenviar a usuario"
                        >
                          <Share2 className="h-4 w-4" />
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
            <div className="flex flex-wrap items-center justify-between gap-2 mb-6">
              <h2 className="text-2xl font-semibold text-gray-800">
                Secuencias de {selectedStyle.toLowerCase()} ({sequences.length})
              </h2>
              <div className="flex flex-wrap items-center gap-4">
                {/* Selector de tamaño de cards */}
                <CardSizeSelector type="sequence" styleColor={selectedStyle} />
                
                {/* Botón de modo ancho completo */}
                <button
                  onClick={() => setIsFullWidth(!isFullWidth)}
                  className={`flex items-center space-x-2 px-3 py-2 rounded-lg font-medium transition-colors duration-200 ${
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
            
            {sequencesLoading ? (
              <div className="flex justify-center items-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-500"></div>
                <span className="ml-3 text-gray-600">Cargando secuencias...</span>
              </div>
            ) : (
              <Suspense fallback={<LoadingSpinner />}>
                <SequenceGallery
                  sequences={(userProfile?.role === 'super_admin') ? sequences : sequences.filter(seq => !(Array.isArray(seq?.tags?.tipo) && seq.tags.tipo.includes('oculto')))}
                  onDeleteSequence={handleDeleteSequence}
                  onPlaySequence={handlePlaySequence}
                  onEditSequence={handleEditSequence}
                  onDownloadSequence={handleDownloadSequence}
                  isFullWidth={isFullWidth}
                  style={selectedStyle}
                />
              </Suspense>
            )}
          </div>
        )}

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
                onClick={handleUpdateAllResolutions}
                disabled={syncStatus === 'syncing'}
                className="px-3 py-1 text-xs bg-green-500 text-white rounded hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                📐 Actualizar Resoluciones
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
                onClick={() => openCleanupModal('cleanup-tags')}
                disabled={syncStatus === 'syncing'}
                className="px-3 py-1 text-xs bg-orange-500 text-white rounded hover:bg-orange-600 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                🏷️ Limpiar Tags
              </button>
              <button
                onClick={handleMigrateVideos}
                disabled={syncStatus === 'syncing'}
                className="px-3 py-1 text-xs bg-indigo-500 text-white rounded hover:bg-indigo-600 disabled:opacity-50 disabled:cursor-not-allowed"
                title="Mover físicamente videos existentes a estructura organizada (videos/page/style/)"
              >
                📁 Migrar Videos REAL
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

      </div>

                           {/* Video Upload Modal */}
                <Suspense fallback={<LoadingSpinner />}>
                  <VideoUploadModal
           isOpen={isUploadModalOpen}
           onClose={() => setIsUploadModalOpen(false)}
           onVideoUploaded={handleVideoUploaded}
           page="figuras"
           style={selectedStyle}
         />
                </Suspense>

        <ShareVideoModal
          isOpen={shareState.isOpen}
          onClose={() => setShareState({ isOpen: false, video: null })}
          video={shareState.video}
          page="figuras"
          currentUser={user}
          onShared={() => addToast('Enviado ✅', 'success')}
        />

        {/* Video Edit Modal */}
        <Suspense fallback={<LoadingSpinner />}>
          <VideoEditModal
          isOpen={editModal.isOpen}
          onClose={closeEditModal}
          video={editModal.video}
          onVideoUpdated={handleVideoUpdated}
          page="figuras"
          style={selectedStyle}
        />
        </Suspense>



       {/* Cleanup Confirmation Modal */}
       <Suspense fallback={<LoadingSpinner />}>
         <ConfirmModal
         isOpen={cleanupModal.isOpen}
         onClose={closeCleanupModal}
         onConfirm={() => handleCleanupData(cleanupModal.type)}
         title={
           cleanupModal.type === 'update' ? 'Actualizar Rutas de Thumbnails' :
           cleanupModal.type === 'cleanup' ? 'Limpiar Archivos Huérfanos' :
           cleanupModal.type === 'cleanup-tags' ? 'Limpiar Tags Duplicados' :
           'Eliminar Todos los Videos'
         }
         message={
           cleanupModal.type === 'update' ? 
           '¿Actualizar las rutas de thumbnails de videos existentes? Esto corregirá problemas de eliminación.' :
           cleanupModal.type === 'cleanup' ? 
           '¿Limpiar archivos huérfanos? Esto eliminará archivos que no tienen documento en Firestore.' :
           cleanupModal.type === 'cleanup-tags' ? 
           '¿Limpiar tags duplicados? Esto eliminará etiquetas repetidas en todos los videos manteniendo solo una instancia de cada tag.' :
           '¿Eliminar TODOS los videos de Firebase y Storage? Esta acción es IRREVERSIBLE y eliminará todos los datos.'
         }
         confirmText={
           cleanupModal.type === 'update' ? 'Actualizar' :
           cleanupModal.type === 'cleanup' ? 'Limpiar' :
           cleanupModal.type === 'cleanup-tags' ? 'Limpiar Tags' :
           'Eliminar Todo'
         }
         cancelText="Cancelar"
       />
       </Suspense>

       {/* Confirm Edit Sequence Modal */}
       <Suspense fallback={<LoadingSpinner />}>
         <ConfirmModal
         isOpen={editSequenceModal.isOpen}
         onClose={handleCancelEditSequence}
         onConfirm={handleConfirmEditSequence}
         title="🎬 Cargar Secuencia"
         message={`¿Deseas cargar la secuencia "${editSequenceModal.sequence?.name}"?

Esto reemplazará la secuencia actual en construcción y perderás todos los cambios no guardados.

¿Estás seguro de que quieres continuar?`}
         confirmText="Sí, Cargar"
         cancelText="Cancelar"
         type="warning"
       />
       </Suspense>

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

       {/* Video Player Modal */}
       {showVideoPlayer && selectedVideo && (
          <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
            <div className="relative w-full max-w-3xl h-auto max-h-[90vh] bg-white rounded-lg overflow-hidden flex flex-col">
             {/* Header */}
             <div className="flex items-center justify-between p-4 bg-gray-50 border-b flex-shrink-0">
               <h3 className="text-lg font-semibold text-gray-800">
                 🎬 {selectedVideo.title}
               </h3>
               <button
                 onClick={handleCloseVideoPlayer}
                 className="text-gray-500 hover:text-gray-700 transition-colors"
               >
                 <X className="h-6 w-6" />
               </button>
             </div>
             
              {/* Video Player */}
              <div className="flex-1 min-h-0 p-4 overflow-y-auto">
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
               {/* Acciones e información del video (unificado con Escuela) */}
               <div className="mt-4">
                 <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                   <div className="flex flex-wrap items-center gap-1">
                     {[1, 2, 3, 4, 5].map(star => {
                       const isFilled = (selectedVideo?.rating || 0) >= star
                       return (
                         <svg
                           key={star}
                            className={`h-4 w-4 shrink-0 ${isFilled ? 'text-yellow-400 fill-current' : 'text-gray-300'} cursor-pointer`}
                           fill="currentColor"
                           viewBox="0 0 24 24"
                           onClick={async () => {
                             try {
                               const currentRating = selectedVideo?.rating || 0
                               const newRating = currentRating >= star ? 0 : star
                               await updateVideoDocument(selectedVideo.id, { rating: newRating }, 'figuras')
                               setVideos(prev => prev.map(v => v.id === selectedVideo.id ? { ...v, rating: newRating } : v))
                               setSelectedVideo(prev => ({ ...prev, rating: newRating }))
                             } catch (_) {}
                           }}
                         >
                           <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                         </svg>
                       )
                     })}
                      <span className="text-xs font-medium text-gray-500">({selectedVideo?.rating || 0})</span>
                   </div>
                   <div className="text-xs text-gray-500">{((selectedVideo?.fileSize || 0) / (1024 * 1024)).toFixed(2)} MB</div>
                 </div>

                 {/* Botonera de acciones */}
                 <div className="flex flex-wrap items-center justify-end gap-2">
                   <button
                     onClick={() => {
                       setSelectedVideo(prev => ({ ...prev, userLiked: !prev?.userLiked, likes: (prev?.likes || 0) + (prev?.userLiked ? -1 : 1) }))
                       handleVideoLike(selectedVideo)
                     }}
                     className={`flex items-center space-x-1 transition-colors duration-200 p-1 rounded hover:bg-red-50 ${selectedVideo?.userLiked ? 'text-red-500' : 'text-gray-400 hover:text-red-500'}`}
                     title={selectedVideo?.userLiked ? 'Quitar like' : 'Dar like'}
                   >
                     <Heart className={`h-4 w-4 ${selectedVideo?.userLiked ? 'fill-current' : ''}`} />
                     <span className="font-medium">{selectedVideo?.likes || 0}</span>
                   </button>
                   <button
                     onClick={() => {
                       handleToggleStudy(selectedVideo)
                       setSelectedVideo(prev => ({ ...prev, isInStudy: !prev?.isInStudy }))
                     }}
                     className={`transition-colors duration-200 p-1 rounded ${selectedVideo?.isInStudy ? 'text-blue-600 bg-blue-50 ring-2 ring-blue-300' : 'text-gray-400 hover:text-blue-600 hover:bg-blue-50'}`}
                     title={selectedVideo?.isInStudy ? 'Quitar de estudios' : 'Añadir a estudios'}
                   >
                     <BookOpen className="h-4 w-4" />
                   </button>
                   <button
                     onClick={() => {
                       handleToggleCompleted(selectedVideo)
                       setSelectedVideo(prev => ({ ...prev, isCompleted: !prev?.isCompleted }))
                     }}
                     className={`transition-colors duration-200 p-1 rounded ${selectedVideo?.isCompleted ? 'text-green-600 bg-green-50 ring-2 ring-green-300' : 'text-gray-400 hover:text-green-600 hover:bg-green-50'}`}
                     title={selectedVideo?.isCompleted ? 'Marcar como pendiente' : 'Marcar como completado'}
                   >
                     <CheckCircle className="h-4 w-4" />
                   </button>
                   {user && (
                     <button
                       onClick={() => {
                         // no requiere page: ocultos van por perfil de usuario
                         toggleUserHiddenVideo(selectedVideo.id, user.uid).then((result) => {
                           if (result?.success) {
                             setSelectedVideo(prev => ({ ...prev, userHidden: result.isHidden }))
                             setVideos(prev => prev.map(v => v.id === selectedVideo.id ? { ...v, userHidden: result.isHidden } : v))
                           }
                         })
                       }}
                       className={`transition-colors duration-200 p-1 rounded ${selectedVideo?.userHidden ? 'text-orange-600 bg-orange-50 ring-2 ring-orange-300' : 'text-gray-400 hover:text-orange-600 hover:bg-orange-50'}`}
                       title={selectedVideo?.userHidden ? 'Mostrar video' : 'Ocultar video'}
                     >
                       <EyeOff className="h-4 w-4" />
                     </button>
                   )}
                   {(userProfile?.role === 'super_admin') && (
                     <button
                       onClick={() => downloadVideo(selectedVideo)}
                       className="text-gray-400 hover:text-green-500 transition-colors duration-200 p-1 rounded hover:bg-green-50"
                       title="Descargar video"
                     >
                       <Download className="h-4 w-4" />
                     </button>
                   )}
                   {/* Añadir a secuencia (con compatibilidad) */}
                   <button
                     onClick={() => handleAddVideoToSequence(selectedVideo)}
                     disabled={isVideoInSequence(selectedVideo)}
                     className={`transition-colors duration-200 p-1 rounded ${
                       isVideoInSequence(selectedVideo)
                         ? 'text-gray-300 cursor-not-allowed'
                         : isBuilderOpen && !isVideoCompatible(selectedVideo)
                         ? 'text-red-400 hover:text-red-500 hover:bg-red-50'
                         : 'text-gray-400 hover:text-purple-500 hover:bg-purple-50'
                     }`}
                     title={
                       isVideoInSequence(selectedVideo)
                         ? 'Ya en secuencia'
                         : isBuilderOpen && !isVideoCompatible(selectedVideo)
                         ? 'Añadir forzadamente (incompatible)'
                         : 'Añadir a secuencia'
                     }
                   >
                     <Plus className="h-4 w-4" />
                   </button>
                   <button
                     onClick={() => openEditModal(selectedVideo)}
                     className="text-gray-400 hover:text-blue-500 transition-colors duration-200 p-1 rounded hover:bg-blue-50"
                     title="Editar video"
                   >
                     <Edit className="h-4 w-4" />
                   </button>
                   <button
                     onClick={() => openDeleteModal(selectedVideo)}
                     className="text-gray-400 hover:text-red-500 transition-colors duration-200 p-1 rounded hover:bg-red-50"
                     title="Eliminar video"
                   >
                     <Trash2 className="h-4 w-4" />
                   </button>
                  <button
                    onClick={() => setShareState({ isOpen: true, video: selectedVideo })}
                    className="text-gray-400 hover:text-pink-600 transition-colors duration-200 p-1 rounded hover:bg-pink-50"
                    title="Reenviar a usuario"
                  >
                    <Share2 className="h-4 w-4" />
                  </button>
                 </div>

                 {/* Tags generales */}
                 <div className="mt-3">
                   {(() => {
                     const orderedTags = getOrderedTags(selectedVideo || {})
                     if (orderedTags.length > 0) {
                       return (
                         <>
                           <div className="flex flex-wrap items-center gap-2 mb-2">
                             <span className="text-xs font-medium text-gray-600 uppercase tracking-wide">Tags:</span>
                           </div>
                           <div className="flex flex-wrap gap-2">
                             {orderedTags.map(({ tag, categoryKey, color }) => (
                               <span key={`modal-tag-${categoryKey}-${tag}`} className={`px-2 py-1 rounded-full text-xs font-medium ${getColorClasses(color)}`}>{tag}</span>
                             ))}
                           </div>
                         </>
                       )
                     }
                     return null
                   })()}
                 </div>

                 {/* Tags iniciales */}
                 <div className="mt-2">
                   {(() => {
                     const iniciales = getOrderedTagsIniciales(selectedVideo || {})
                     if (iniciales.length > 0) {
                       return (
                         <>
                           <div className="flex flex-wrap items-center gap-2 mb-2">
                             <span className="text-xs font-medium text-blue-600 uppercase tracking-wide">Iniciales:</span>
                           </div>
                           <div className="flex flex-wrap gap-2">
                             {iniciales.map(({ tag, categoryKey }) => (
                               <span key={`modal-initial-${categoryKey}-${tag}`} className="px-2 py-1 rounded-full text-xs font-medium bg-gradient-to-r from-blue-500 to-purple-500 text-white">{tag}</span>
                             ))}
                           </div>
                         </>
                       )
                     }
                     return null
                   })()}
                 </div>

                 {/* Tags finales */}
                 <div className="mt-2">
                   {(() => {
                     const finales = getOrderedTagsFinales(selectedVideo || {})
                     if (finales.length > 0) {
                       return (
                         <>
                           <div className="flex flex-wrap items-center gap-2 mb-2">
                             <span className="text-xs font-medium text-green-600 uppercase tracking-wide">Finales:</span>
                           </div>
                           <div className="flex flex-wrap gap-2">
                             {finales.map(({ tag, categoryKey }) => (
                               <span key={`modal-final-${categoryKey}-${tag}`} className="px-2 py-1 rounded-full text-xs font-medium bg-gradient-to-r from-green-500 to-teal-500 text-white">{tag}</span>
                             ))}
                           </div>
                         </>
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

       {/* Sequence Player Modal */}
       {showSequencePlayer && selectedSequence && (
         <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
           <div className="relative w-full max-w-3xl h-auto max-h-[85vh] bg-white rounded-lg overflow-hidden flex flex-col">
             {/* Header */}
             <div className="flex items-center justify-between p-4 bg-gray-50 border-b flex-shrink-0">
               <h3 className="text-lg font-semibold text-gray-800">
                 🎬 Secuencia: {selectedSequence.name}
               </h3>
               <button
                 onClick={handleCloseSequencePlayer}
                 className="text-gray-500 hover:text-gray-700 transition-colors"
               >
                 <X className="h-6 w-6" />
               </button>
             </div>
             
             {/* Sequence Player */}
             <div className="flex-1 min-h-0 p-4">
               <div className="w-full h-full max-h-[65vh] flex items-center justify-center">
                 <div className="w-full max-w-md">
                   <Suspense fallback={<LoadingSpinner />}>
                     <SequenceVideoPlayer
                       videos={selectedSequence.videos}
                       className="w-full h-full"
                       showControls={true}
                       autoplay={true}
                       loop={false}
                       muted={false}
                     />
                   </Suspense>
                 </div>
               </div>
               </div>
           </div>
         </div>
       )}

       {/* Download Sequence Modal */}
       <Suspense fallback={<LoadingSpinner />}>
         <DownloadModal
         isOpen={downloadSequenceModal.isOpen}
         onClose={handleCloseDownloadSequence}
         video={downloadSequenceModal.sequence ? {
           ...downloadSequenceModal.sequence,
           title: downloadSequenceModal.sequence.name,
           file: null // El archivo se generará dinámicamente
         } : null}
         onDownloadComplete={() => {
           addToast('Secuencia descargada correctamente', 'success')
           handleCloseDownloadSequence()
         }}
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

export default FigurasPage 