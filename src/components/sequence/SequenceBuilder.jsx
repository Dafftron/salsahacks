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
    toggleBuilder
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
        style: style,
        createdAt: new Date().toISOString()
      })
      
      addToast('Secuencia guardada exitosamente')
      clearSequence()
      if (onToggleBuilder) {
        onToggleBuilder()
      }
    } catch (error) {
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
            <div className="flex flex-col space-y-2">
              <button
                onClick={() => generateRandomSequence(videos, 5)}
                className="flex items-center justify-center space-x-2 px-4 py-2 bg-purple-500 hover:bg-purple-600 text-white rounded-lg transition-colors"
              >
                <Shuffle className="w-4 h-4" />
                <span>Generar Aleatoria (5)</span>
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