// 🎬 COMPONENTE CONSTRUCTOR DE SECUENCIAS - SALSAHACKS V2.0

import React, { useState, useRef, useEffect } from 'react'
import { X, Plus, Trash2, Save, Play, Shuffle, Eye, EyeOff } from 'lucide-react'
import { useSequenceBuilder } from '../../hooks/useSequenceBuilder'
import { useAuth } from '../../contexts/AuthContext'
import { useCategories } from '../../hooks/useCategories'
import { createSequence } from '../../services/firebase/sequences'
import { addToast } from '../../components/common/Toast'
import ConfirmModal from '../common/ConfirmModal'
import SmartThumbnail from '../common/SmartThumbnail'

const SequenceBuilder = ({
  onSaveSequence,
  onClose,
  style = 'salsa',
  isIntegrated = false
}) => {
  const {
    sequence,
    sequenceDescription,
    addToSequence,
    removeFromSequence,
    clearSequence,
    updateSequenceDescription,
    moveVideoInSequence
  } = useSequenceBuilder()

  const { user } = useAuth()
  const { categories } = useCategories()
  const [confirmModal, setConfirmModal] = useState({ isOpen: false, type: null })
  const [isDragging, setIsDragging] = useState(false)
  const dragItem = useRef(null)
  const dragOverItem = useRef(null)

  const handleSaveSequence = async () => {
    if (!user) {
      addToast('Debes iniciar sesión para guardar secuencias', 'error')
      return
    }

    if (sequence.length === 0) {
      addToast('La secuencia debe tener al menos un video', 'error')
      return
    }

    if (!sequenceDescription.trim()) {
      addToast('Debes agregar una descripción a la secuencia', 'error')
      return
    }

    try {
      await createSequence({
        userId: user.uid,
        title: sequenceDescription,
        description: sequenceDescription,
        videos: sequence,
        style: style,
        createdAt: new Date().toISOString()
      })
      
      addToast('Secuencia guardada exitosamente')
      clearSequence()
      if (!isIntegrated && onClose) {
        onClose()
      }
    } catch (error) {
      addToast('Error al guardar la secuencia', 'error')
      console.error('Error saving sequence:', error)
    }
  }

  const handleCancel = () => {
    if (sequence.length > 0 || sequenceDescription.trim()) {
      setConfirmModal({ isOpen: true, type: 'cancel' })
    } else {
      if (!isIntegrated && onClose) {
        onClose()
      }
    }
  }

  const handleConfirmAction = () => {
    if (confirmModal.type === 'cancel') {
      clearSequence()
      if (!isIntegrated && onClose) {
        onClose()
      }
    } else if (confirmModal.type === 'clear') {
      clearSequence()
    }
    setConfirmModal({ isOpen: false, type: null })
  }

  const handleDragStart = (e, index) => {
    dragItem.current = index
    setIsDragging(true)
  }

  const handleDragOver = (e) => {
    e.preventDefault()
  }

  const handleDragEnter = (e, index) => {
    dragOverItem.current = index
  }

  const handleDrop = (e) => {
    e.preventDefault()
    setIsDragging(false)
    
    if (dragItem.current !== null && dragOverItem.current !== null) {
      moveVideoInSequence(dragItem.current, dragOverItem.current)
    }
    
    dragItem.current = null
    dragOverItem.current = null
  }

  // Solo renderizar en modo integrado
  if (!isIntegrated) return null

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">Creador de Secuencias</h3>
        <div className="flex items-center space-x-2">
          <button
            onClick={handleSaveSequence}
            disabled={sequence.length === 0 || !sequenceDescription.trim()}
            className="flex items-center space-x-2 px-4 py-2 bg-green-500 hover:bg-green-600 disabled:bg-gray-300 text-white rounded-lg transition-colors"
          >
            <Save className="w-4 h-4" />
            <span>Guardar</span>
          </button>
          {onClose && (
            <button
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 hover:bg-gray-50 rounded-lg transition-colors"
            >
              Cerrar
            </button>
          )}
        </div>
      </div>

      {/* Descripción de la secuencia */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Descripción de la secuencia
        </label>
        <textarea
          value={sequenceDescription}
          onChange={(e) => updateSequenceDescription(e.target.value)}
          placeholder="Describe tu secuencia..."
          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
          rows={3}
        />
      </div>

      {/* Lista de videos en la secuencia */}
      <div className="mb-4">
        <div className="flex items-center justify-between mb-2">
          <h4 className="text-md font-medium text-gray-900">
            Videos en la secuencia ({sequence.length})
          </h4>
          {sequence.length > 0 && (
            <button
              onClick={() => setConfirmModal({ isOpen: true, type: 'clear' })}
              className="flex items-center space-x-1 text-red-500 hover:text-red-700 text-sm"
            >
              <Trash2 className="w-4 h-4" />
              <span>Limpiar</span>
            </button>
          )}
        </div>

        {sequence.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <Shuffle className="w-12 h-12 mx-auto mb-2 text-gray-300" />
            <p>No hay videos en la secuencia</p>
            <p className="text-sm">Añade videos desde la galería principal usando el botón con icono de shuffle</p>
          </div>
        ) : (
          <div className="space-y-2">
            {sequence.map((video, index) => (
              <div
                key={`${video.id}-${index}`}
                draggable
                onDragStart={(e) => handleDragStart(e, index)}
                onDragOver={handleDragOver}
                onDragEnter={(e) => handleDragEnter(e, index)}
                onDrop={handleDrop}
                className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg border cursor-move hover:bg-gray-100 transition-colors"
              >
                <div className="flex-shrink-0 w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center text-purple-600 font-medium text-sm">
                  {index + 1}
                </div>
                <div className="flex-shrink-0 w-16 h-12 bg-gray-200 rounded overflow-hidden">
                  <SmartThumbnail video={video} className="w-full h-full object-cover" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">
                    {video.title || video.name || 'Sin título'}
                  </p>
                  <p className="text-xs text-gray-500">
                    {video.style} • {video.category}
                  </p>
                </div>
                <button
                  onClick={() => removeFromSequence(index)}
                  className="flex-shrink-0 p-1 text-red-500 hover:text-red-700 hover:bg-red-50 rounded transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Confirm Modal */}
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
            : '¿Estás seguro de que quieres limpiar la secuencia? Se eliminarán todos los videos.'
        }
        confirmText="Confirmar"
        cancelText="Cancelar"
        confirmColor="red"
      />
    </div>
  )
}

export default SequenceBuilder 