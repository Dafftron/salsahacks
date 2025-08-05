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
  Edit3
} from 'lucide-react'
import { useSequenceBuilder } from '../../hooks/useSequenceBuilder'
import { useDragAndDrop } from '../../hooks/useDragAndDrop'
import ConfirmModal from '../common/ConfirmModal'
import Toast from '../common/Toast'
import SmartThumbnail from '../common/SmartThumbnail'

const SequenceBuilder = ({ 
  isOpen, 
  onClose, 
  videos, 
  onSaveSequence,
  onToggleShowAll,
  showAllVideos 
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
    getFilteredVideos
  } = useSequenceBuilder()

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

  const addToast = (message, type = 'success') => {
    const id = Date.now()
    setToasts(prev => [...prev, { id, message, type }])
  }

  const removeToast = (id) => {
    setToasts(prev => prev.filter(toast => toast.id !== id))
  }

  const handleSaveSequence = async () => {
    if (!sequenceName.trim()) {
      addToast('Por favor, añade un nombre a la secuencia', 'error')
      return
    }

    if (sequence.length === 0) {
      addToast('La secuencia debe tener al menos un video', 'error')
      return
    }

    try {
      await onSaveSequence({
        name: sequenceName,
        description: sequenceDescription,
        videos: sequence,
        createdAt: new Date().toISOString()
      })
      
      addToast('Secuencia guardada exitosamente')
      clearSequence()
      onClose()
    } catch (error) {
      addToast('Error al guardar la secuencia', 'error')
    }
  }

  const handleCancel = () => {
    if (sequence.length > 0 || sequenceName.trim() || sequenceDescription.trim()) {
      setConfirmModal({ isOpen: true, type: 'cancel' })
    } else {
      onClose()
    }
  }

  const handleClearSequence = () => {
    setConfirmModal({ isOpen: true, type: 'clear' })
  }

  const handleConfirmAction = () => {
    if (confirmModal.type === 'cancel') {
      clearSequence()
      onClose()
    } else if (confirmModal.type === 'clear') {
      clearSequence()
    }
    setConfirmModal({ isOpen: false, type: null })
  }

  const filteredVideos = getFilteredVideos(videos)

  const getVideoButtonState = (video) => {
    if (isVideoInSequence(video)) {
      return {
        text: 'Ya en Secuencia',
        icon: null,
        className: 'bg-gray-400 text-white cursor-not-allowed',
        disabled: true
      }
    }

    if (isVideoCompatible(video)) {
      return {
        text: 'Añadir',
        icon: Plus,
        className: 'bg-green-500 hover:bg-green-600 text-white',
        disabled: false
      }
    }

    return {
      text: 'Añadir Forzado',
      icon: Plus,
      className: 'bg-red-500 hover:bg-red-600 text-white',
      disabled: false
    }
  }

  const getCompatibilityIndicator = (video) => {
    if (sequence.length === 0) return null

    const isCompatible = isVideoCompatible(video)
    const isInSequence = isVideoInSequence(video)

    if (isInSequence) return null

    return (
      <div className={`absolute top-2 right-2 p-1 rounded-full text-xs font-bold ${
        isCompatible 
          ? 'bg-green-500 text-white' 
          : 'bg-red-500 text-white'
      }`}>
        {isCompatible ? '✅' : '❌'}
      </div>
    )
  }

  const getVideoCardStyle = (video) => {
    if (!showAllVideos) return {}
    
    const isCompatible = isVideoCompatible(video)
    const isInSequence = isVideoInSequence(video)

    if (isInSequence) return {}

    return {
      opacity: isCompatible ? 1 : 0.6,
      filter: isCompatible ? 'none' : 'grayscale(30%)',
      border: isCompatible ? '2px solid transparent' : '2px solid #ef4444'
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-7xl h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <div className="flex items-center space-x-4">
            <h2 className="text-2xl font-bold text-gray-800">Constructor de Secuencias</h2>
            <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium">
              {sequence.length} videos
            </span>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="flex-1 flex overflow-hidden">
          {/* Panel izquierdo - Constructor de secuencia */}
          <div className="w-1/2 border-r p-6 flex flex-col">
            {/* Controles superiores */}
            <div className="space-y-4 mb-6">
              {/* Nombre y descripción */}
              <div className="space-y-3">
                <input
                  type="text"
                  placeholder="Nombre de la secuencia..."
                  value={sequenceName}
                  onChange={(e) => setSequenceName(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <textarea
                  placeholder="Descripción (opcional)..."
                  value={sequenceDescription}
                  onChange={(e) => setSequenceDescription(e.target.value)}
                  rows="2"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                />
              </div>

              {/* Botones de acción */}
              <div className="flex space-x-2">
                <button
                  onClick={() => generateRandomSequence(videos, 5)}
                  className="flex items-center space-x-2 px-4 py-2 bg-purple-500 hover:bg-purple-600 text-white rounded-lg transition-colors"
                >
                  <Shuffle className="w-4 h-4" />
                  <span>Generar Aleatoria (5)</span>
                </button>
                <button
                  onClick={handleClearSequence}
                  className="flex items-center space-x-2 px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                  <span>Limpiar</span>
                </button>
              </div>
            </div>

            {/* Secuencia actual */}
            <div className="flex-1 overflow-y-auto">
              <h3 className="text-lg font-semibold mb-4 text-gray-700">Secuencia Actual</h3>
              
              {sequence.length === 0 ? (
                <div className="text-center py-12 text-gray-500">
                  <Plus className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>No hay videos en la secuencia</p>
                  <p className="text-sm">Selecciona videos de la galería para comenzar</p>
                </div>
              ) : (
                <div className="space-y-3">
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
                      <GripVertical className="w-5 h-5 text-gray-400 cursor-grab" />
                      <div className="flex-1 flex items-center space-x-3">
                        <div className="w-16 h-12 rounded overflow-hidden flex-shrink-0">
                          <SmartThumbnail
                            src={video.thumbnailURL}
                            alt={video.title}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="font-medium text-gray-800 truncate">{video.title}</h4>
                          <p className="text-sm text-gray-500 truncate">{video.style}</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
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

          {/* Panel derecho - Galería de videos */}
          <div className="w-1/2 p-6 flex flex-col">
            {/* Header de la galería */}
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-700">
                Galería de Videos
                <span className="ml-2 text-sm text-gray-500">
                  ({filteredVideos.length} videos)
                </span>
              </h3>
              <button
                onClick={onToggleShowAll}
                className={`flex items-center space-x-2 px-3 py-1 rounded-lg transition-colors ${
                  showAllVideos 
                    ? 'bg-blue-100 text-blue-800' 
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {showAllVideos ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                <span>{showAllVideos ? 'Ocultar Incompatibles' : 'Mostrar Todos'}</span>
              </button>
            </div>

            {/* Grid de videos */}
            <div className="flex-1 overflow-y-auto">
              <div className="grid grid-cols-2 gap-4">
                {filteredVideos.map((video) => {
                  const buttonState = getVideoButtonState(video)
                  
                  return (
                    <div
                      key={video.id}
                      className="relative bg-white rounded-lg border hover:shadow-md transition-all"
                      style={getVideoCardStyle(video)}
                    >
                      {getCompatibilityIndicator(video)}
                      
                      <div className="aspect-video rounded-t-lg overflow-hidden">
                        <SmartThumbnail
                          src={video.thumbnailURL}
                          alt={video.title}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      
                      <div className="p-3">
                        <h4 className="font-medium text-gray-800 text-sm mb-1 truncate">
                          {video.title}
                        </h4>
                        <p className="text-xs text-gray-500 mb-2">{video.style}</p>
                        
                        <button
                          onClick={() => addVideoToSequence(video)}
                          disabled={buttonState.disabled}
                          className={`w-full flex items-center justify-center space-x-1 px-3 py-1 rounded text-sm font-medium transition-colors ${buttonState.className}`}
                        >
                          {buttonState.icon && <buttonState.icon className="w-3 h-3" />}
                          <span>{buttonState.text}</span>
                        </button>
                      </div>
                    </div>
                  )
                })}
              </div>
              
              {filteredVideos.length === 0 && (
                <div className="text-center py-12 text-gray-500">
                  <p>No hay videos disponibles</p>
                </div>
              )}
            </div>
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
    </div>
  )
}

export default SequenceBuilder 