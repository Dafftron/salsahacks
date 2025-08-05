// 🎬 COMPONENTE CONSTRUCTOR DE SECUENCIAS - SALSAHACKS V2.0

import React, { useState } from 'react'
import { 
  X, 
  Plus, 
  Trash2, 
  Save, 
  Shuffle, 
  Eye, 
  EyeOff,
  GripVertical,
  Play,
  Edit3,
  ChevronDown,
  ChevronUp
} from 'lucide-react'
import { useSequenceBuilderContext } from '../../contexts/SequenceBuilderContext'
import { useDragAndDrop } from '../../hooks/useDragAndDrop'
import ConfirmModal from '../common/ConfirmModal'
import Toast from '../common/Toast'
import SmartThumbnail from '../common/SmartThumbnail.jsx'

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

          {/* Secuencia actual */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold mb-4 text-gray-700">Secuencia Actual</h3>
            
            {sequence.length === 0 ? (
              <div className="text-center py-8 text-gray-500 bg-gray-50 rounded-lg">
                <Plus className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>No hay videos en la secuencia</p>
                <p className="text-sm">Selecciona videos de la galería para comenzar</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
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
                    className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg border hover:shadow-md transition-all"
                  >
                    <GripVertical className="w-5 h-5 text-gray-400 cursor-grab flex-shrink-0" />
                    <div className="flex-1 flex items-center space-x-3 min-w-0">
                      <div className="w-16 h-12 rounded overflow-hidden flex-shrink-0">
                        <SmartThumbnail
                          src={video.thumbnailUrl}
                          alt={video.title}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium text-gray-800 truncate text-sm">{video.title}</h4>
                        <p className="text-xs text-gray-500 truncate">{video.style}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2 flex-shrink-0">
                      <span className="text-sm text-gray-500 font-medium">#{index + 1}</span>
                      <button
                        onClick={() => removeVideoFromSequence(index)}
                        className="p-1 hover:bg-red-100 rounded text-red-500 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
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