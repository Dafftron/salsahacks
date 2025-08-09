// 🎬 COMPONENTE CONSTRUCTOR DE SECUENCIAS - SALSAHACKS V2.0

import React, { useState, useEffect, useCallback } from 'react'
import { 
  Plus, 
  Trash2, 
  Play, 
  Save, 
  Edit, 
  X, 
  ChevronDown, 
  ChevronUp,
  Heart, 
  Music,
  Shuffle,
  GripVertical
} from 'lucide-react'
import { useSequenceBuilderContext } from '../../contexts/SequenceBuilderContext'
import { createSequence, getSequencesByStyle, deleteSequence, subscribeToSequencesByStyle } from '../../services/firebase/sequences'
import { getVideos, toggleVideoLike } from '../../services/firebase/firestore'
import { useAuth } from '../../contexts/AuthContext'
import { useTheme } from '../../contexts/ThemeContext'
import { useCategories } from '../../hooks/useCategories'
import { useDragAndDrop } from '../../hooks/useDragAndDrop'
import Toast from '../common/Toast'
import ConfirmModal from '../common/ConfirmModal'
import VideoPlayer from '../video/VideoPlayer.jsx'
import SequenceTimeline from './SequenceTimeline.jsx'
import SequenceVideoPlayer from './SequenceVideoPlayer.jsx'
import BPMController from './BPMController'
import VideoDownloadModal from '../video/VideoDownloadModal'
import { processVideoSequence, createSequencePreview } from '../../services/video/videoProcessor'

const SequenceBuilder = ({ 
  isOpen, 
  onClose, 
  videos, 
  onSaveSequence,
  onToggleShowAll,
  showAllVideos,
  style = 'salsa',
  isIntegrated = false,
  onToggleBuilder
}) => {
  // Usar el hook de categorías para obtener categoriesList y getColorClasses
  const { categoriesList, getColorClasses } = useCategories('figuras', style)
  const { user } = useAuth()
  
  // Estados para procesamiento

  
  // Estados para reproducción de video individual
  const [selectedVideo, setSelectedVideo] = useState(null)
  const [showVideoModal, setShowVideoModal] = useState(false)
  
  // Estados para preview en tiempo real
  const [isCreatingPreview, setIsCreatingPreview] = useState(false)
  const [previewVideoUrl, setPreviewVideoUrl] = useState(null)
  const [previewError, setPreviewError] = useState(null)
  const [lastPreviewData, setLastPreviewData] = useState(null) // Para cache

  // Estados para tags de secuencia
  const [sequenceTags, setSequenceTags] = useState({})
  const [isTagsSectionCollapsed, setIsTagsSectionCollapsed] = useState(true)

  // Estados para modal de descarga
  const [showDownloadModal, setShowDownloadModal] = useState(false)

  // Estado para BPM actual
  const [currentBPM, setCurrentBPM] = useState(null)

  // Funciones auxiliares para tags (actualizadas para usar categoriesList)
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

  const {
    sequence,
    sequenceName,
    sequenceDescription,
    editingSequenceId, // Obtener el ID de la secuencia que se está editando
    addVideoToSequence,
    removeVideoFromSequence,
    reorderSequence,
    generateRandomSequence,
    clearSequence,
    setSequenceName,
    setSequenceDescription,
    isVideoCompatible,
    isVideoInSequence,
    toggleBuilder,
    checkCompatibility
  } = useSequenceBuilderContext()

  // Calcular BPM promedio de la secuencia
  useEffect(() => {
    const videosWithBPM = sequence.filter(video => video.bpm)
    if (videosWithBPM.length > 0) {
      const bpmValues = videosWithBPM.map(video => video.bpm)
      const averageBPM = bpmValues.reduce((sum, bpm) => sum + bpm, 0) / bpmValues.length
      setCurrentBPM(Math.round(averageBPM))
    } else {
      setCurrentBPM(null)
    }
  }, [sequence])

  // Generar tags automáticamente cuando cambie la secuencia
  useEffect(() => {
    if (sequence.length > 0) {
      const autoTags = generateSequenceTagsFromVideos()
      if (Object.keys(autoTags).length > 0) {
        setSequenceTags(autoTags)
        console.log('🏷️ Tags actualizados automáticamente:', autoTags)
      }
    } else {
      // Si no hay videos, limpiar tags
      setSequenceTags({})
    }
  }, [sequence, generateSequenceTagsFromVideos])

  const {
    handleDragStart,
    handleDragOver,
    handleDragEnter,
    handleDragLeave,
    handleDrop,
    handleDragEnd,
    getDragStyles
  } = useDragAndDrop(reorderSequence)

  const [toasts, setToasts] = useState([])
  const [confirmModal, setConfirmModal] = useState({ isOpen: false, type: null })
  const [randomCount, setRandomCount] = useState(5) // Estado para el número de videos aleatorios

  const addToast = (message, type = 'success') => {
    const id = Date.now()
    setToasts(prev => [...prev, { id, message, type }])
  }

  // Función para generar tags automáticamente desde los videos de la secuencia
  const generateSequenceTagsFromVideos = useCallback(() => {
    if (sequence.length === 0) return {}
    
    console.log('🏷️ Generando tags automáticamente desde', sequence.length, 'videos')
    
    const combinedTags = {}
    
    // Recorrer todos los videos de la secuencia
    sequence.forEach((video, index) => {
      if (video.tags && typeof video.tags === 'object') {
        console.log(`📹 Video ${index + 1} (${video.title}):`, video.tags)
        
        // Para cada categoría de tags del video
        Object.keys(video.tags).forEach(categoryKey => {
          const videoTags = video.tags[categoryKey]
          
          if (Array.isArray(videoTags) && videoTags.length > 0) {
            // Si la categoría no existe en combinedTags, crearla
            if (!combinedTags[categoryKey]) {
              combinedTags[categoryKey] = []
            }
            
            // Añadir tags únicos (evitar duplicados)
            videoTags.forEach(tag => {
              if (!combinedTags[categoryKey].includes(tag)) {
                combinedTags[categoryKey].push(tag)
              }
            })
          }
        })
      }
    })
    
    console.log('🎯 Tags combinados generados:', combinedTags)
    return combinedTags
  }, [sequence])



  const removeToast = (id) => {
    setToasts(prev => prev.filter(toast => toast.id !== id))
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
        addToast(`Has ${result.userLiked ? 'dado like a' : 'quitado like de'} "${video.title}"`, 'success')
      } else {
        addToast('Error al actualizar like', 'error')
      }
    } catch (error) {
      console.error('Error al manejar like:', error)
      addToast('Error al actualizar like', 'error')
    }
  }

  const handleGenerateRandom = () => {
    const videosNeeded = randomCount - sequence.length
    
    if (videosNeeded <= 0) {
      addToast('La secuencia ya tiene suficientes videos', 'info')
      return
    }
    
    // Verificar cuántos videos compatibles hay disponibles
    if (sequence.length > 0) {
      const lastVideo = sequence[sequence.length - 1]
      const compatibleVideos = videos.filter(video => 
        !sequence.some(seqVideo => seqVideo.id === video.id) && // No incluir ya añadidos
        checkCompatibility(lastVideo, video)
      )
      
      if (compatibleVideos.length === 0) {
        addToast('No hay videos compatibles disponibles para continuar la secuencia', 'warning')
        return
      }
      
      if (compatibleVideos.length < videosNeeded) {
        addToast(`Solo hay ${compatibleVideos.length} videos compatibles disponibles de los ${videosNeeded} necesarios`, 'info')
        // Completar con los disponibles
        generateRandomSequence(videos, sequence.length + compatibleVideos.length)
        addToast(`Secuencia completada con ${compatibleVideos.length} videos adicionales`)
        return
      }
    }
    
    // Generar la secuencia completa
    generateRandomSequence(videos, randomCount)
    addToast(`Secuencia completada hasta ${randomCount} videos`)
  }

  const handleSaveSequence = async () => {
    console.log('💾 Intentando guardar secuencia...')
    console.log('📝 Nombre:', sequenceName)
    console.log('📋 Videos en secuencia:', sequence.length)
    console.log('🎨 Estilo:', style)
    console.log('🔄 Editando secuencia ID:', editingSequenceId)
    
    if (!sequenceName.trim()) {
      addToast('Por favor, añade un nombre a la secuencia', 'error')
      return
    }

    if (sequence.length === 0) {
      addToast('La secuencia debe tener al menos un video', 'error')
      return
    }

    try {
      // Generar thumbnail de la secuencia
      const thumbnailUrl = await generateSequenceThumbnail()
      
      // Los tags ya están generados automáticamente en sequenceTags
      console.log('🏷️ Tags automáticos para guardar:', sequenceTags)
      
      const sequenceData = {
        name: sequenceName,
        description: sequenceDescription,
        videos: sequence,
        style: style,
        tags: sequenceTags, // Usar tags automáticos generados en tiempo real
        thumbnailUrl: thumbnailUrl, // Agregar thumbnail
        resolution: sequence.length > 0 ? sequence[0].resolution : 'HD', // Usar resolución del primer video
        createdAt: new Date().toISOString()
      }
      
      // Si estamos editando una secuencia existente, incluir el ID
      if (editingSequenceId) {
        sequenceData.id = editingSequenceId
      }
      await onSaveSequence(sequenceData)
      
      const message = editingSequenceId 
        ? '✅ Secuencia actualizada exitosamente'
        : '✅ Secuencia guardada exitosamente. Ve a "GALERÍA DE SECUENCIAS" para verla.'
      
      addToast(message)
      clearSequence()
      if (onToggleBuilder) {
        onToggleBuilder()
      }
    } catch (error) {
      console.error('❌ Error al guardar secuencia:', error)
      addToast('Error al guardar la secuencia', 'error')
    }
  }

  const handleCancel = () => {
    if (sequence.length > 0 || sequenceName.trim() || sequenceDescription.trim()) {
      setConfirmModal({ isOpen: true, type: 'cancel' })
    } else {
      if (onToggleBuilder) {
        onToggleBuilder()
      }
    }
  }

  const handleClearSequence = () => {
    setConfirmModal({ isOpen: true, type: 'clear' })
  }

  const handleConfirmAction = () => {
    if (confirmModal.type === 'cancel') {
      clearSequence()
      if (onToggleBuilder) {
        onToggleBuilder()
      }
    } else if (confirmModal.type === 'clear') {
      clearSequence()
    }
    setConfirmModal({ isOpen: false, type: null })
  }
  
  // Efecto para generar preview en tiempo real cuando cambie la secuencia
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      generateRealtimePreview()
    }, 500) // Debounce de 500ms para evitar demasiadas regeneraciones

    return () => clearTimeout(timeoutId)
  }, [sequence]) // Se ejecuta cuando cambia la secuencia

  // Cleanup de URLs cuando se desmonte el componente
  useEffect(() => {
    return () => {
      if (previewVideoUrl) {
        URL.revokeObjectURL(previewVideoUrl)
      }
    }
  }, [previewVideoUrl])
  
  // Función para obtener resoluciones disponibles basadas en la resolución del video
  const getAvailableResolutions = (video) => {
    if (!video || !video.resolution) {
      return ['auto', '360p', '480p', '720p', '1080p']
    }
    
    const resolution = video.resolution.toLowerCase()
    const resolutions = ['auto']
    
    // Agregar resoluciones hasta la máxima disponible
    if (resolution.includes('4k') || resolution.includes('2160p')) {
      resolutions.push('360p', '480p', '720p', '1080p', '4k')
    } else if (resolution.includes('1080p') || resolution.includes('1920')) {
      resolutions.push('360p', '480p', '720p', '1080p')
    } else if (resolution.includes('720p') || resolution.includes('1280')) {
      resolutions.push('360p', '480p', '720p')
    } else if (resolution.includes('480p') || resolution.includes('854')) {
      resolutions.push('360p', '480p')
    } else {
      resolutions.push('360p')
    }
    
    return resolutions
  }

  // Función para reproducir video individual
  const handlePlayVideo = (video) => {
    console.log('🎬 Reproduciendo video individual:', video.title)
    setSelectedVideo(video)
    setShowVideoModal(true)
    addToast(`🎬 Reproduciendo: ${video.title}`, 'info')
  }

  // Función para generar preview en tiempo real
  const generateRealtimePreview = async () => {
    if (!sequence || sequence.length === 0) {
      setPreviewVideoUrl(null)
      setPreviewError(null)
      return
    }
    
    // Crear clave de cache para verificar si necesitamos regenerar
    const previewKey = JSON.stringify({
      videos: sequence.map(v => v.id),
      sequenceLength: sequence.length
    })
    
    // Si ya tenemos el mismo preview, no regenerar
    if (lastPreviewData === previewKey && previewVideoUrl) {
      return
    }
    
    setIsCreatingPreview(true)
    setPreviewError(null)
    
    try {
      console.log('🎬 Generando preview en tiempo real...')
      
      // Verificar que todos los videos tengan URLs válidas
      const validVideos = sequence.filter(video => video.videoUrl)
      
      if (validVideos.length === 0) {
        throw new Error('No hay videos válidos en la secuencia')
      }
      
      // Para el preview en tiempo real, usaremos el SequenceTimeline
      // que muestra los videos en una línea de tiempo como CapCut
      setPreviewVideoUrl('sequence-timeline') // Marcador especial para indicar que usamos el timeline
      setLastPreviewData(previewKey)
      
      console.log('✅ Preview en tiempo real generado (modo timeline)')
      
    } catch (error) {
      console.error('❌ Error al generar preview en tiempo real:', error)
      setPreviewError(error.message)
    } finally {
      setIsCreatingPreview(false)
    }
  }



  // Funciones para manejar tags de secuencia
  const handleTagToggle = (categoryKey, tag) => {
    setSequenceTags(prevTags => {
      const currentTags = prevTags[categoryKey] || []
      const isSelected = currentTags.includes(tag)
      
      if (isSelected) {
        // Remover tag
        const newTags = currentTags.filter(t => t !== tag)
        if (newTags.length === 0) {
          const { [categoryKey]: removed, ...rest } = prevTags
          return rest
        } else {
          return { ...prevTags, [categoryKey]: newTags }
        }
      } else {
        // Agregar tag
        return { ...prevTags, [categoryKey]: [...currentTags, tag] }
      }
    })
  }

  const isTagSelected = (categoryKey, tag) => {
    return sequenceTags[categoryKey]?.includes(tag) || false
  }

  const getOrderedSequenceTags = () => {
    const orderedTags = []
    
    categoriesList.forEach(category => {
      const categoryTags = sequenceTags[category.key]
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

  // Función para generar thumbnail de la secuencia
  const generateSequenceThumbnail = async () => {
    if (sequence.length === 0) return null
    
    try {
      // Usar el primer video como base para el thumbnail
      const firstVideo = sequence[0]
      
      // Si el primer video tiene thumbnail, usarlo como base
      if (firstVideo.thumbnailUrl) {
        return firstVideo.thumbnailUrl
      }
      
      // Si no, generar un thumbnail del video
      const { getStorage, ref, getDownloadURL } = await import('firebase/storage')
      const storage = getStorage()
      const videoRef = ref(storage, firstVideo.videoUrl)
      const downloadURL = await getDownloadURL(videoRef)
      
      // Por ahora, usar la URL del video como thumbnail
      // En el futuro, se podría generar un thumbnail real del video
      return downloadURL
    } catch (error) {
      console.error('Error al generar thumbnail:', error)
      return null
    }
  }

  // Si no está abierto, no renderizar
  if (!isOpen) return null

  return (
    <>
      <div className="bg-white rounded-lg border border-gray-200 shadow-sm mb-6">
        {/* Header del constructor */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <div className="flex items-center space-x-4">
            <h2 className="text-xl font-bold text-gray-800">Constructor de Secuencias</h2>
            <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium">
              {sequence.length} videos
            </span>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={onToggleBuilder}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Contenido del constructor */}
        <div className="p-4">
          {/* Controles superiores */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            {/* Nombre y descripción */}
            <div className="md:col-span-2 space-y-3">
              <div className="space-y-1">
                <input
                  type="text"
                  placeholder="Nombre de la secuencia..."
                  value={sequenceName}
                  onChange={(e) => setSequenceName(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                {!sequenceName.trim() && sequence.length > 0 && (
                  <p className="text-xs text-orange-600">
                    ⚠️ Añade un nombre para poder guardar la secuencia
                  </p>
                )}
              </div>
              <textarea
                placeholder="Descripción (opcional)..."
                value={sequenceDescription}
                onChange={(e) => setSequenceDescription(e.target.value)}
                rows="2"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
              />
            </div>

            {/* Botones de acción */}
            <div className="flex flex-col space-y-3">
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700 text-center">
                  Número de videos:
                </label>
                <input
                  type="number"
                  value={randomCount}
                  onChange={(e) => setRandomCount(Math.max(1, parseInt(e.target.value) || 5))}
                  min="1"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-center text-sm"
                  placeholder="5"
                />
                {sequence.length > 0 && (
                  <div className="text-xs text-gray-500 text-center">
                    {(() => {
                      const lastVideo = sequence[sequence.length - 1]
                      const compatibleVideos = videos.filter(video => 
                        !sequence.some(seqVideo => seqVideo.id === video.id) &&
                        checkCompatibility(lastVideo, video)
                      )
                      const videosNeeded = randomCount - sequence.length
                      return `${compatibleVideos.length} compatibles disponibles (necesitas ${videosNeeded})`
                    })()}
                  </div>
                )}
              </div>
              <button
                onClick={handleGenerateRandom}
                className="flex items-center justify-center space-x-2 px-4 py-2 bg-purple-500 hover:bg-purple-600 text-white rounded-lg transition-colors"
              >
                <Shuffle className="w-4 h-4" />
                <span>Completar hasta {randomCount}</span>
              </button>
              <button
                onClick={handleClearSequence}
                className="flex items-center justify-center space-x-2 px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors"
              >
                <Trash2 className="w-4 h-4" />
                <span>Limpiar</span>
              </button>
            </div>
          </div>

          {/* Preview en tiempo real */}
          <div className="mb-6">
            <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
              <h3 className="text-lg font-semibold text-gray-800 mb-3 flex items-center">
                <Play className="h-5 w-5 text-blue-600 mr-2" />
                Preview en Tiempo Real
              </h3>
              
              {isCreatingPreview && (
                <div className="flex items-center justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mr-3"></div>
                  <span className="text-gray-600">Generando preview...</span>
                </div>
              )}
              
              {previewError && (
                <div className="flex items-center justify-center py-8 text-red-600">
                  <span>❌ Error: {previewError}</span>
                </div>
              )}
              
              {!isCreatingPreview && !previewError && previewVideoUrl && (
                <div className="space-y-4">
                  {/* Video Player Principal */}
                  {previewVideoUrl === 'sequence-timeline' ? (
                    <SequenceVideoPlayer
                      videos={sequence}
                      currentBPM={currentBPM}
                      className="w-full h-96"
                      showControls={true}
                      autoplay={false}
                      loop={false}
                      muted={false}
                    />
                  ) : (
                    <div className="bg-black rounded-lg overflow-hidden">
                      <VideoPlayer
                        src={previewVideoUrl}
                        className="w-full h-96 object-contain"
                        showControls={true}
                        autoplay={false}
                        loop={false}
                        muted={false}
                        size="medium"
                        videoTitle="Preview de Secuencia"
                      />
                    </div>
                  )}
                  

                </div>
              )}
              
              {!isCreatingPreview && !previewError && sequence.length === 0 && (
                <div className="flex items-center justify-center py-8 text-gray-500">
                  <span>Añade videos a la secuencia para ver el preview</span>
                </div>
              )}
            </div>
          </div>
          


          {/* Secuencia actual */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-700">Secuencia Actual ({sequence.length} videos)</h3>
              
              {/* Botón de descarga prominente */}

            </div>
            
            {sequence.length === 0 ? (
              <div className="text-center py-8 text-gray-500 bg-gray-50 rounded-lg">
                <Plus className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>No hay videos en la secuencia</p>
                <p className="text-sm">Selecciona videos de la galería para comenzar</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {sequence.map((video, index) => (
                  <div
                    key={`${video.id}-${index}`}
                    draggable
                    onDragStart={() => handleDragStart(index)}
                    onDragOver={(e) => handleDragOver(e, index)}
                    onDragEnter={(e) => handleDragEnter(e, index)}
                    onDragLeave={handleDragLeave}
                    onDrop={(e) => handleDrop(e, index)}
                    onDragEnd={handleDragEnd}
                    style={getDragStyles(index)}
                    className="bg-white rounded-lg shadow-md overflow-hidden border border-gray-100 hover:shadow-lg transition-all duration-200 transform hover:scale-[1.02] relative"
                  >
                    {/* Header con número de orden y botón eliminar */}
                    <div className="absolute top-2 left-2 z-10 flex items-center space-x-2">
                      <div className="bg-purple-500 text-white px-2 py-1 rounded-full text-sm font-bold shadow-lg">
                        #{index + 1}
                      </div>
                      <button
                        onClick={() => removeVideoFromSequence(index)}
                        className="bg-red-500 text-white p-1 rounded-full hover:bg-red-600 transition-colors shadow-lg"
                        title="Eliminar de la secuencia"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>

                    {/* Grip handle para arrastrar */}
                    <div className="absolute top-2 right-2 z-10">
                      <GripVertical className="w-5 h-5 text-gray-400 cursor-grab hover:text-gray-600 transition-colors" />
                    </div>

                    {/* Thumbnail */}
                    <div className="relative group">
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
                        <div className="absolute bottom-2 left-2 bg-black bg-opacity-75 text-white px-2 py-1 rounded text-sm font-medium">
                          {video.resolution && video.resolution !== 'Unknown' ? video.resolution : 'HD'}
                        </div>
                        
                        {/* Botón de play */}
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
                    
                    {/* Contenido del card */}
                    <div className="p-4">
                      {/* Título y rating */}
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

                      {/* Descripción */}
                      <p className="text-gray-600 text-sm mb-3 line-clamp-2">{video.description || 'Sin descripción'}</p>
                      
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
                      
                      {/* Stats del video */}
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

          {/* Tags de Secuencia */}
          <div className="mb-6">
            <div className="bg-white rounded-lg shadow-md p-4 border border-gray-200">
              {/* Header con toggle */}
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center space-x-2">
                  <svg className="h-5 w-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                  </svg>
                  <h3 className="text-lg font-semibold text-gray-800">Tags de Secuencia</h3>
                </div>
                <button
                  onClick={() => setIsTagsSectionCollapsed(!isTagsSectionCollapsed)}
                  className="p-1 text-gray-500 hover:text-gray-700 transition-colors"
                  title={isTagsSectionCollapsed ? "Expandir tags" : "Colapsar tags"}
                >
                  <svg 
                    className={`w-4 h-4 transform transition-transform ${isTagsSectionCollapsed ? 'rotate-90' : ''}`}
                    fill="none" 
                    stroke="currentColor" 
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </div>

              {/* Información de tags automáticos */}
              <div className="mb-3">
                <div className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-green-50 to-blue-50 border border-green-200 rounded-lg">
                  <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span className="text-sm text-green-700 font-medium">
                    {sequence.length > 0 
                      ? `Tags generándose automáticamente desde ${sequence.length} video${sequence.length !== 1 ? 's' : ''}`
                      : 'Los tags se generarán automáticamente al añadir videos'
                    }
                  </span>
                </div>
              </div>

              {/* Tags seleccionados */}
              {(() => {
                const orderedTags = getOrderedSequenceTags()
                if (orderedTags.length > 0) {
                  return (
                    <div className="mb-3">
                      <div className="flex flex-wrap gap-2">
                        {orderedTags.map(({ tag, categoryKey, color }) => (
                          <span
                            key={`${categoryKey}-${tag}`}
                            className={`px-3 py-1 rounded-full text-sm font-medium ${getColorClasses(color)} flex items-center space-x-1`}
                          >
                            <span>{tag}</span>
                            <button
                              onClick={() => handleTagToggle(categoryKey, tag)}
                              className="ml-1 hover:bg-black hover:bg-opacity-20 rounded-full p-0.5"
                            >
                              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                              </svg>
                            </button>
                          </span>
                        ))}
                      </div>
                    </div>
                  )
                }
                return null
              })()}

              {/* Categorías de tags - Sección colapsable */}
              <div className={`overflow-hidden transition-all duration-300 ease-in-out ${
                isTagsSectionCollapsed ? 'max-h-0 opacity-0' : 'max-h-96 opacity-100'
              }`}>
                <div className="space-y-4">
                  {categoriesList.map(category => (
                    <div key={category.key} className="border-t border-gray-100 pt-3">
                      <h4 className="text-sm font-medium text-gray-700 mb-2 flex items-center space-x-2">
                        <span className={`w-3 h-3 rounded-full ${getColorClasses(category.color).replace('text-', 'bg-')}`}></span>
                        <span>{category.name}</span>
                      </h4>
                      <div className="flex flex-wrap gap-2">
                        {category.tags.map(tag => (
                          <button
                            key={tag}
                            onClick={() => handleTagToggle(category.key, tag)}
                            className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                              isTagSelected(category.key, tag)
                                ? getColorClasses(category.color)
                                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
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
          </div>

          {/* Botones de guardar/cancelar */}
          <div className="flex space-x-3 pt-4 border-t">
            <button
              onClick={handleSaveSequence}
              disabled={sequence.length === 0 || !sequenceName.trim()}
              className="flex-1 flex items-center justify-center space-x-2 px-4 py-2 bg-blue-500 hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed text-white rounded-lg transition-colors"
            >
              <Save className="w-4 h-4" />
              <span>{editingSequenceId ? 'Actualizar Secuencia' : 'Guardar Secuencia'}</span>
            </button>
            <button
              onClick={handleCancel}
              className="px-6 py-2 border border-gray-300 hover:bg-gray-50 rounded-lg transition-colors"
            >
              Cancelar
            </button>
          </div>
        </div>
      </div>

      {/* Modal de video individual */}
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
                  resolutions={getAvailableResolutions(selectedVideo)}
                  currentResolution="auto"
                  videoTitle={selectedVideo.title}
                  size="fullscreen"
                />
              </div>
            </div>
          </div>
        </div>
      )}



      {/* Modales */}
      <ConfirmModal
        isOpen={confirmModal.isOpen}
        onClose={() => setConfirmModal({ isOpen: false, type: null })}
        onConfirm={handleConfirmAction}
        title={
          confirmModal.type === 'cancel' 
            ? '¿Cancelar secuencia?' 
            : '¿Limpiar secuencia?'
        }
        message={
          confirmModal.type === 'cancel'
            ? '¿Estás seguro de que quieres cancelar? Se perderán todos los cambios.'
            : '¿Estás seguro de que quieres limpiar la secuencia actual?'
        }
        confirmText="Confirmar"
        cancelText="Cancelar"
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

      {/* Modal de descarga */}
      <VideoDownloadModal
        isOpen={showDownloadModal}
        onClose={() => setShowDownloadModal(false)}
        videos={sequence}
        sequenceName={sequenceName || 'Secuencia'}
      />
    </>
  )
}

export default SequenceBuilder 