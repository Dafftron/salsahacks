import React from 'react'
import { useImageOrientation } from '../../hooks/useImageOrientation'

const SmartThumbnail = ({ 
  src, 
  alt, 
  className = '', 
  fallbackSrc = 'https://via.placeholder.com/300x200/1a1a1a/ffffff?text=VIDEO',
  showResolution = false,
  resolution = 'HD'
}) => {
  const { orientation, isLoading } = useImageOrientation(src || fallbackSrc)

  // Determinar las clases de aspect ratio basadas en la orientación
  const getAspectClasses = () => {
    if (isLoading) {
      return 'aspect-video' // Default mientras carga
    }
    
    return orientation === 'vertical' ? 'aspect-[9/16]' : 'aspect-video'
  }

  return (
    <div className={`relative ${getAspectClasses()} video-thumbnail-container ${className}`}>
      <img
        src={src || fallbackSrc}
        alt={alt}
        className="w-full h-full object-cover"
        loading="lazy"
      />
      
      {/* Indicador de resolución */}
      {showResolution && (
        <div className="absolute bottom-2 left-2 bg-black bg-opacity-75 text-white px-2 py-1 rounded text-sm font-medium">
          {resolution && resolution !== 'Unknown' ? resolution : 'HD'}
        </div>
      )}
    </div>
  )
}

export default SmartThumbnail 