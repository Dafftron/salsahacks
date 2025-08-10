// 🎴 ACCIONES COMPACTAS PARA CARDS - SALSAHACKS V2.0

import React from 'react'
import { Heart, Edit, Trash2, Plus, Download, Play } from 'lucide-react'

const CompactCardActions = ({ 
  video, 
  onLike, 
  onEdit, 
  onDelete, 
  onAddToSequence, 
  onDownload, 
  onPlay,
  isVideoInSequence,
  isBuilderOpen,
  isVideoCompatible,
  type = 'video' // 'video' o 'sequence'
}) => {
  if (type === 'video') {
    return (
      <div className="flex items-center justify-center space-x-1 mt-2">
        {/* Botón de reproducción */}
        <button
          onClick={onPlay}
          className="p-1 text-gray-400 hover:text-blue-500 transition-colors rounded"
          title="Reproducir"
        >
          <Play className="h-3 w-3" />
        </button>
        
        {/* Botón de like */}
        <button
          onClick={onLike}
          className={`p-1 transition-colors rounded ${
            video.userLiked ? 'text-red-500' : 'text-gray-400 hover:text-red-500'
          }`}
          title={video.userLiked ? 'Quitar like' : 'Dar like'}
        >
          <Heart className={`h-3 w-3 ${video.userLiked ? 'fill-current' : ''}`} />
        </button>
        
        {/* Botón de añadir a secuencia */}
        <button
          onClick={onAddToSequence}
          disabled={isVideoInSequence}
          className={`p-1 transition-colors rounded ${
            isVideoInSequence
              ? 'text-gray-300 cursor-not-allowed'
              : isBuilderOpen && !isVideoCompatible
              ? 'text-red-400 hover:text-red-500'
              : 'text-gray-400 hover:text-purple-500'
          }`}
          title={
            isVideoInSequence 
              ? 'Ya en secuencia' 
              : isBuilderOpen && !isVideoCompatible
              ? 'Añadir forzadamente'
              : 'Añadir a secuencia'
          }
        >
          <Plus className="h-3 w-3" />
        </button>
        
        {/* Botón de descargar (solo si se proporciona onDownload) */}
        {onDownload && (
          <button
            onClick={onDownload}
            className="p-1 text-gray-400 hover:text-green-500 transition-colors rounded"
            title="Descargar"
          >
            <Download className="h-3 w-3" />
          </button>
        )}
        
        {/* Botón de editar */}
        <button
          onClick={onEdit}
          className="p-1 text-gray-400 hover:text-blue-500 transition-colors rounded"
          title="Editar"
        >
          <Edit className="h-3 w-3" />
        </button>
        
        {/* Botón de eliminar */}
        <button
          onClick={onDelete}
          className="p-1 text-gray-400 hover:text-red-500 transition-colors rounded"
          title="Eliminar"
        >
          <Trash2 className="h-3 w-3" />
        </button>
      </div>
    )
  }

  // Para secuencias
  return (
    <div className="flex items-center justify-center space-x-1 mt-2">
      {/* Botón de reproducción */}
      <button
        onClick={onPlay}
        className="p-1 text-gray-400 hover:text-blue-500 transition-colors rounded"
        title="Reproducir secuencia"
      >
        <Play className="h-3 w-3" />
      </button>
      
      {/* Botón de descargar */}
      <button
        onClick={onDownload}
        className="p-1 text-gray-400 hover:text-green-500 transition-colors rounded"
        title="Descargar secuencia"
      >
        <Download className="h-3 w-3" />
      </button>
      
      {/* Botón de editar */}
      <button
        onClick={onEdit}
        className="p-1 text-gray-400 hover:text-blue-500 transition-colors rounded"
        title="Editar secuencia"
      >
        <Edit className="h-3 w-3" />
      </button>
      
      {/* Botón de eliminar */}
      <button
        onClick={onDelete}
        className="p-1 text-gray-400 hover:text-red-500 transition-colors rounded"
        title="Eliminar secuencia"
      >
        <Trash2 className="h-3 w-3" />
      </button>
    </div>
  )
}

export default CompactCardActions
