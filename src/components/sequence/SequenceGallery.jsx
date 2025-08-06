// 🎬 COMPONENTE GALERÍA DE SECUENCIAS - SALSAHACKS V2.0

import React, { useState } from 'react'
import { 
  Play, 
  Edit3, 
  Trash2, 
  Download, 
  Clock,
  Users,
  Calendar,
  Tag
} from 'lucide-react'
import ConfirmModal from '../common/ConfirmModal'
import Toast from '../common/Toast'
import SmartThumbnail from '../common/SmartThumbnail.jsx'
import { useCategories } from '../../hooks/useCategories'

const SequenceGallery = ({ 
  sequences, 
  onDeleteSequence, 
  onPlaySequence,
  onEditSequence 
}) => {
  const [toasts, setToasts] = useState([])
  const [deleteModal, setDeleteModal] = useState({ isOpen: false, sequence: null })
  
  // Usar el hook de categorías para obtener getColorClasses
  const { getColorClasses } = useCategories('figuras', 'salsa')

  const addToast = (message, type = 'success') => {
    const id = Date.now()
    setToasts(prev => [...prev, { id, message, type }])
  }

  const removeToast = (id) => {
    setToasts(prev => prev.filter(toast => toast.id !== id))
  }

  const handleDeleteClick = (sequence) => {
    setDeleteModal({ isOpen: true, sequence })
  }

  const handleConfirmDelete = async () => {
    try {
      await onDeleteSequence(deleteModal.sequence.id)
      addToast('Secuencia eliminada exitosamente')
    } catch (error) {
      addToast('Error al eliminar la secuencia', 'error')
    }
    setDeleteModal({ isOpen: false, sequence: null })
  }

  const handlePlaySequence = (sequence) => {
    try {
      onPlaySequence(sequence)
      addToast('Reproduciendo secuencia')
    } catch (error) {
      addToast('Error al reproducir la secuencia', 'error')
    }
  }

  const formatDate = (dateString) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const getTotalDuration = (videos) => {
    // Calcular duración total aproximada (asumiendo 30 segundos por video)
    const totalSeconds = videos.length * 30
    const minutes = Math.floor(totalSeconds / 60)
    const seconds = totalSeconds % 60
    return `${minutes}:${seconds.toString().padStart(2, '0')}`
  }

  const getOrderedSequenceTags = (sequence) => {
    if (!sequence.tags || Object.keys(sequence.tags).length === 0) {
      return []
    }
    
    const orderedTags = []
    const categoriesList = [
      { key: 'dificultad', color: 'red' },
      { key: 'estilo', color: 'blue' },
      { key: 'nivel', color: 'green' },
      { key: 'figura', color: 'purple' },
      { key: 'posicion', color: 'orange' },
      { key: 'transicion', color: 'teal' }
    ]
    
    categoriesList.forEach(category => {
      const categoryTags = sequence.tags[category.key]
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

  if (sequences.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <Play className="w-8 h-8 text-gray-400" />
        </div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">No hay secuencias guardadas</h3>
        <p className="text-gray-500 mb-4">Crea tu primera secuencia usando el constructor de secuencias</p>
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 max-w-md mx-auto">
          <h4 className="font-medium text-blue-900 mb-2">¿Cómo crear una secuencia?</h4>
          <ol className="text-sm text-blue-800 space-y-1 text-left">
            <li>1. Haz clic en "CREAR SECUENCIA"</li>
            <li>2. Añade videos con el botón "+" de la galería</li>
            <li>3. Escribe un nombre para la secuencia</li>
            <li>4. Haz clic en "Guardar Secuencia"</li>
            <li>5. ¡Listo! Aparecerá aquí automáticamente</li>
          </ol>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Grid de secuencias */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {sequences.map((sequence) => (
          <div
            key={sequence.id}
            className="bg-white rounded-lg border hover:shadow-lg transition-shadow duration-200"
          >
            {/* Header con información básica */}
            <div className="p-4 border-b">
              <div className="flex items-start justify-between mb-2">
                <h3 className="font-semibold text-gray-900 text-lg truncate">
                  {sequence.name}
                </h3>
                <div className="flex items-center space-x-1">
                  <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs font-medium">
                    {sequence.videos.length} videos
                  </span>
                </div>
              </div>
              
              {sequence.description && (
                <p className="text-gray-600 text-sm line-clamp-2 mb-3">
                  {sequence.description}
                </p>
              )}

              {/* Tags de la secuencia */}
              {(() => {
                const orderedTags = getOrderedSequenceTags(sequence)
                if (orderedTags.length > 0) {
                  return (
                    <div className="mb-3">
                      <div className="flex flex-wrap gap-1">
                        {orderedTags.slice(0, 4).map(({ tag, categoryKey, color }) => (
                          <span
                            key={`${categoryKey}-${tag}`}
                            className={`px-2 py-1 rounded-full text-xs font-medium ${getColorClasses(color)}`}
                          >
                            {tag}
                          </span>
                        ))}
                        {orderedTags.length > 4 && (
                          <span className="px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-600">
                            +{orderedTags.length - 4}
                          </span>
                        )}
                      </div>
                    </div>
                  )
                }
                return null
              })()}
              
              <div className="flex items-center justify-between text-xs text-gray-500">
                <div className="flex items-center space-x-1">
                  <Clock className="w-3 h-3" />
                  <span>{getTotalDuration(sequence.videos)}</span>
                </div>
                <div className="flex items-center space-x-1">
                  <Calendar className="w-3 h-3" />
                  <span>{formatDate(sequence.createdAt)}</span>
                </div>
              </div>
            </div>

            {/* Preview de videos */}
            <div className="p-4">
              <div className="grid grid-cols-4 gap-2 mb-4">
                {sequence.videos.slice(0, 4).map((video, index) => (
                  <div key={video.id} className="relative">
                    <div className="aspect-video rounded overflow-hidden">
                      <SmartThumbnail
                        src={video.thumbnailUrl}
                        alt={video.title}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    {index === 3 && sequence.videos.length > 4 && (
                      <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                        <span className="text-white text-xs font-bold">
                          +{sequence.videos.length - 4}
                        </span>
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {/* Botones de acción */}
              <div className="flex space-x-2">
                <button
                  onClick={() => handlePlaySequence(sequence)}
                  className="flex-1 flex items-center justify-center space-x-1 px-3 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg text-sm font-medium transition-colors"
                >
                  <Play className="w-4 h-4" />
                  <span>Reproducir</span>
                </button>
                
                <button
                  onClick={() => onEditSequence(sequence)}
                  className="px-3 py-2 border border-gray-300 hover:bg-gray-50 rounded-lg transition-colors"
                >
                  <Edit3 className="w-4 h-4 text-gray-600" />
                </button>
                
                <button
                  onClick={() => handleDeleteClick(sequence)}
                  className="px-3 py-2 border border-gray-300 hover:bg-red-50 hover:border-red-300 rounded-lg transition-colors"
                >
                  <Trash2 className="w-4 h-4 text-gray-600 hover:text-red-600" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Modal de confirmación de eliminación */}
      <ConfirmModal
        isOpen={deleteModal.isOpen}
        onClose={() => setDeleteModal({ isOpen: false, sequence: null })}
        onConfirm={handleConfirmDelete}
        title="¿Eliminar secuencia?"
        message={`¿Estás seguro de que quieres eliminar la secuencia "${deleteModal.sequence?.name}"? Esta acción no se puede deshacer.`}
        confirmText="Eliminar"
        cancelText="Cancelar"
        confirmClassName="bg-red-500 hover:bg-red-600"
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

export default SequenceGallery 