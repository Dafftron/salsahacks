// 🎬 COMPONENTE CONSTRUCTOR DE SECUENCIAS - SALSAHACKS V2.0

import React, { useState, useEffect } from 'react'
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
import VideoPlayer from '../video/VideoPlayer'
import BPMController from './BPMController'
import { processVideoSequence } from '../../services/video/videoProcessor'

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
  
  // Estados para BPM
  const [currentBPM, setCurrentBPM] = useState(120)
  const [isProcessingSequence, setIsProcessingSequence] = useState(false)

  // Funciones auxiliares para tags (actualizadas para usar categoriesList)
  const getOrderedTags = (video) => {
    console.log('🏷️ getOrderedTags - video:', video.title, 'tags:', video.tags)
    
    if (!video.tags || Object.keys(video.tags).length === 0) {
      console.log('❌ No hay tags en el video')
      return []
    }
    
    const orderedTags = []
    
    categoriesList.forEach(category => {
      const categoryTags = video.tags[category.key]
      if (Array.isArray(categoryTags)) {
        console.log(`📋 Categoría ${category.key}:`, categoryTags)
        categoryTags.forEach(tag => {
          orderedTags.push({
            tag,
            categoryKey: category.key,
            color: category.color
          })
        })
      }
    })
    
    console.log('✅ Tags ordenados:', orderedTags)
    return orderedTags
  }

  const getOrderedTagsIniciales = (video) => {
    console.log('🏷️ getOrderedTagsIniciales - video:', video.title, 'tagsIniciales:', video.tagsIniciales)
    
    if (!video.tagsIniciales || Object.keys(video.tagsIniciales).length === 0) {
      console.log('❌ No hay tagsIniciales en el video')
      return []
    }
    
    const orderedTags = []
    
    categoriesList.forEach(category => {
      const categoryTags = video.tagsIniciales[category.key]
      if (Array.isArray(categoryTags)) {
        console.log(`📋 Categoría inicial ${category.key}:`, categoryTags)
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
    
    console.log('✅ Tags iniciales ordenados:', orderedTags)
    return orderedTags
  }

  const getOrderedTagsFinales = (video) => {
    console.log('🏷️ getOrderedTagsFinales - video:', video.title, 'tagsFinales:', video.tagsFinales)
    
    if (!video.tagsFinales || Object.keys(video.tagsFinales).length === 0) {
      console.log('❌ No hay tagsFinales en el video')
      return []
    }
    
    const orderedTags = []
    
    categoriesList.forEach(category => {
      const categoryTags = video.tagsFinales[category.key]
      if (Array.isArray(categoryTags)) {
        console.log(`📋 Categoría final ${category.key}:`, categoryTags)
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
    
    console.log('✅ Tags finales ordenados:', orderedTags)
    return orderedTags
  }

  const {
    sequence,
    sequenceName,
    sequenceDescription,
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
    
    if (!sequenceName.trim()) {
      addToast('Por favor, añade un nombre a la secuencia', 'error')
      return
    }

    if (sequence.length === 0) {
      addToast('La secuencia debe tener al menos un video', 'error')
      return
    }

    try {
      const sequenceData = {
        name: sequenceName,
        description: sequenceDescription,
        videos: sequence,
        style: style,
        createdAt: new Date().toISOString()
      }
      
      console.log('📦 Datos de secuencia a guardar:', sequenceData)
      await onSaveSequence(sequenceData)
      
      addToast('✅ Secuencia guardada exitosamente. Ve a "GALERÍA DE SECUENCIAS" para verla.')
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
  
  // Funciones para manejar BPM
  const handleBPMChange = (newBPM) => {
    setCurrentBPM(newBPM)
    console.log('🎵 BPM cambiado a:', newBPM)
  }
  
  const handleProcessSequence = async (targetBPM) => {
    if (!sequence || sequence.length === 0) {
      addToast('No hay videos en la secuencia para procesar', 'error')
      return
    }
    
    // Verificar que todos los videos tengan BPM
    const videosWithoutBPM = sequence.filter(video => !video.bpm)
    if (videosWithoutBPM.length > 0) {
      addToast(`${videosWithoutBPM.length} videos no tienen BPM detectado`, 'warning')
      return
    }
    
    setIsProcessingSequence(true)
    
    try {
      console.log('🎬 Iniciando procesamiento de secuencia con BPM:', targetBPM)
      
      // Preparar videos con archivos
      const videosWithFiles = sequence.map(video => ({
        ...video,
        file: video.file || null // Necesitamos el archivo original
      }))
      
      // Procesar secuencia
      const result = await processVideoSequence(videosWithFiles, targetBPM)
      
      if (result.success) {
        // Crear blob y descargar
        const blob = new Blob([result.data], { type: 'video/mp4' })
        const url = URL.createObjectURL(blob)
        
        const a = document.createElement('a')
        a.href = url
        a.download = `secuencia_${targetBPM}bpm.mp4`
        document.body.appendChild(a)
        a.click()
        document.body.removeChild(a)
        
        URL.revokeObjectURL(url)
        
        addToast(`Secuencia procesada y descargada con BPM ${targetBPM}`, 'success')
      } else {
        throw new Error(result.error)
      }
    } catch (error) {
      console.error('❌ Error al procesar secuencia:', error)
      addToast(`Error al procesar secuencia: ${error.message}`, 'error')
    } finally {
      setIsProcessingSequence(false)
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
          
          {/* Control de BPM */}
          {sequence.length > 0 && (
            <div className="mb-6">
              <BPMController
                sequence={sequence}
                onBPMChange={handleBPMChange}
                currentBPM={currentBPM}
                onProcessSequence={handleProcessSequence}
                isProcessing={isProcessingSequence}
              />
            </div>
          )}

          {/* Secuencia actual */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold mb-4 text-gray-700">Secuencia Actual ({sequence.length} videos)</h3>
            
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

          {/* Botones de guardar/cancelar */}
          <div className="flex space-x-3 pt-4 border-t">
            <button
              onClick={handleSaveSequence}
              disabled={sequence.length === 0 || !sequenceName.trim()}
              className="flex-1 flex items-center justify-center space-x-2 px-4 py-2 bg-blue-500 hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed text-white rounded-lg transition-colors"
            >
              <Save className="w-4 h-4" />
              <span>Guardar Secuencia</span>
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
    </>
  )
}

export default SequenceBuilder 