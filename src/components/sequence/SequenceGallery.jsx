// 🎬 COMPONENTE GALERÍA DE SECUENCIAS - SALSAHACKS V2.0

import React, { useState } from 'react'
import { useAuth } from '../../contexts/AuthContext'
import { 
  Play, 
  Edit3, 
  Trash2, 
  Download, 
  Clock,
  Users,
  Calendar,
  Tag,
  Image
} from 'lucide-react'
import ConfirmModal from '../common/ConfirmModal'
import Toast from '../common/Toast'
import SmartThumbnail from '../common/SmartThumbnail.jsx'
import { useCategories } from '../../hooks/useCategories'
import { useCardSize } from '../../contexts/CardSizeContext'

const SequenceGallery = ({ 
  sequences, 
  onDeleteSequence, 
  onPlaySequence,
  onEditSequence,
  onEditThumbnail,
  onDownloadSequence,
  isFullWidth = false,
  style = 'salsa' // Añadir prop style para usar el estilo correcto
}) => {
  const { userProfile } = useAuth()
  const isSuperAdmin = userProfile?.role === 'super_admin'
  const [toasts, setToasts] = useState([])
  const [deleteModal, setDeleteModal] = useState({ isOpen: false, sequence: null })
  
  // Usar el hook de categorías para obtener categoriesList y getColorClasses
  const { categoriesList, getColorClasses } = useCategories('figuras', style)
  const { getSequenceConfig } = useCardSize()

  const addToast = (message, type = 'success') => {
    const id = (typeof crypto !== 'undefined' && crypto.randomUUID) ? crypto.randomUUID() : `${Date.now()}-${Math.random()}`
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

  const handleDownloadSequence = (sequence) => {
    try {
      if (!isSuperAdmin) {
        addToast('Solo Super Admin puede descargar', 'error')
        return
      }
      if (onDownloadSequence) {
        onDownloadSequence(sequence)
        addToast('Abriendo opciones de descarga')
      } else {
        addToast('Funcionalidad de descarga no disponible', 'warning')
      }
    } catch (error) {
      addToast('Error al abrir descarga', 'error')
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
    
    // Usar la lista dinámica de categorías del hook
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
      <div className={`grid gap-6 ${getSequenceConfig(isFullWidth).grid}`}>
        {sequences.map((sequence) => (
          <div
            key={sequence.id}
            className="bg-white rounded-lg shadow-md overflow-hidden border border-gray-100 hover:shadow-lg transition-all duration-200 transform hover:scale-[1.02]"
          >
            {/* Thumbnail */}
            <div className="relative group">
              <div className={`w-full ${getSequenceConfig(isFullWidth).aspect} ${getSequenceConfig(isFullWidth).thumbnailSize} bg-gradient-to-br from-gray-100 to-gray-200 relative overflow-hidden flex items-center justify-center`}>
                {sequence.thumbnailUrl ? (
                  <SmartThumbnail
                    src={sequence.thumbnailUrl}
                    alt={sequence.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="flex flex-col items-center justify-center text-gray-500">
                    <Play className="w-12 h-12 mb-2 text-gray-400" />
                    <span className="text-sm font-medium">{sequence.name}</span>
                  </div>
                )}
                
                {/* Badge de resolución */}
                <div className="absolute bottom-2 left-2 bg-black bg-opacity-75 text-white px-2 py-1 rounded text-sm font-medium">
                  {sequence.resolution && sequence.resolution !== 'Unknown' ? sequence.resolution : 'HD'}
                </div>
                
                {/* Botón de editar thumbnail */}
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    onEditThumbnail && onEditThumbnail(sequence)
                  }}
                  className="absolute top-2 right-2 bg-black bg-opacity-75 text-white p-1 rounded hover:bg-opacity-90 transition-colors"
                  title="Editar thumbnail"
                >
                  <Image className="w-3 h-3" />
                </button>
                
                {/* Botón de reproducción */}
                <button
                  onClick={() => handlePlaySequence(sequence)}
                  className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                >
                  <Play className="w-12 h-12 text-white" />
                </button>
              </div>
            </div>

            {/* Contenido del card */}
            <div className={`${getSequenceConfig(isFullWidth).compact ? 'p-2' : 'p-4'}`}>
              {/* Título y rating */}
              <div className={`flex flex-wrap items-center justify-between gap-1 ${getSequenceConfig(isFullWidth).compact ? 'mb-1' : 'mb-2'}`}>
                <h3 className={`font-semibold text-gray-800 ${getSequenceConfig(isFullWidth).titleSize}`}>{sequence.name}</h3>
                <div className="flex flex-wrap items-center gap-1">
                  <span className={`bg-blue-100 text-blue-800 px-2 py-1 rounded-full ${getSequenceConfig(isFullWidth).compact ? 'text-xs' : 'text-xs'} font-medium`}>
                    {sequence.videos.length} videos
                  </span>
                </div>
              </div>

              {/* Descripción o Iconos */}
              {getSequenceConfig(isFullWidth).showIcons ? (
                // Mostrar solo número de videos en tamaños pequeños y medianos
                <div className="flex items-center justify-center text-gray-500 mb-2">
                  <div className="flex flex-wrap items-center gap-1">
                    <Users className="w-3 h-3" />
                    <span className="text-xs font-medium">{sequence.videos.length} videos</span>
                  </div>
                </div>
              ) : (
                // Mostrar descripción en tamaños grandes
                <p className={`text-gray-600 text-sm ${getSequenceConfig(isFullWidth).compact ? 'mb-2' : 'mb-3'} ${getSequenceConfig(isFullWidth).descriptionLines === 1 ? 'line-clamp-1' : getSequenceConfig(isFullWidth).descriptionLines === 2 ? 'line-clamp-2' : getSequenceConfig(isFullWidth).descriptionLines === 3 ? 'line-clamp-3' : 'line-clamp-4'}`}>{sequence.description || 'Sin descripción'}</p>
              )}
              
              {/* Tags de la secuencia */}
              {getSequenceConfig(isFullWidth).showTags && (
                <div className="flex flex-wrap gap-2 mb-3">
                  {(() => {
                    const orderedTags = getOrderedSequenceTags(sequence)
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
              
              {/* Stats del video */}
              {getSequenceConfig(isFullWidth).showStats && (
                <div className="flex items-center justify-between text-sm text-gray-500 pt-2 border-t border-gray-100">
                  {/* Información de stats - solo en tamaños grandes */}
                  {!getSequenceConfig(isFullWidth).compact && (
                    <div className="flex items-center space-x-2">
                      <Users className="w-4 h-4" />
                      <span className="font-medium">
                        {sequence.videos.length} videos
                      </span>
                      <span className="text-gray-400">•</span>
                      <span className="text-gray-600">
                        {sequence.resolution && sequence.resolution !== 'Unknown' ? 
                          sequence.resolution : 
                          'HD'
                        }
                      </span>
                    </div>
                  )}
                  
                  {/* Botones de acción - siempre visibles */}
                  <div className={`flex items-center space-x-2 ${getSequenceConfig(isFullWidth).compact ? 'w-full justify-center' : ''}`}>
                    <button
                      onClick={() => handleDownloadSequence(sequence)}
                      disabled={!isSuperAdmin}
                      className={`p-1 rounded transition-colors duration-200 ${isSuperAdmin ? 'text-gray-400 hover:text-green-500 hover:bg-green-50' : 'text-gray-300 cursor-not-allowed'}`}
                      title="Descargar secuencia"
                    >
                      <Download className={`${getSequenceConfig(isFullWidth).compact ? 'h-3 w-3' : 'h-4 w-4'}`} />
                    </button>
                    <button
                      onClick={() => onEditSequence(sequence)}
                      className="text-gray-400 hover:text-blue-500 transition-colors duration-200 p-1 rounded hover:bg-blue-50"
                      title="Editar secuencia"
                    >
                      <Edit3 className={`${getSequenceConfig(isFullWidth).compact ? 'h-3 w-3' : 'h-4 w-4'}`} />
                    </button>
                    <button
                      onClick={() => handleDeleteClick(sequence)}
                      className="text-gray-400 hover:text-red-500 transition-colors duration-200 p-1 rounded hover:bg-red-50"
                      title="Eliminar secuencia"
                    >
                      <Trash2 className={`${getSequenceConfig(isFullWidth).compact ? 'h-3 w-3' : 'h-4 w-4'}`} />
                    </button>
                  </div>
                </div>
              )}
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