// 🖼️ COMPONENTE SMART THUMBNAIL - SALSAHACKS V2.0

import React, { useState } from 'react'
import { Image, Play } from 'lucide-react'

const SmartThumbnail = ({ 
  src, 
  alt, 
  className = '', 
  fallbackSrc = '/placeholder-video.jpg',
  showPlayIcon = false,
  ...props 
}) => {
  const [imageError, setImageError] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  const handleImageLoad = () => {
    setIsLoading(false)
    setImageError(false)
  }

  const handleImageError = () => {
    setIsLoading(false)
    setImageError(true)
  }

  const imageSrc = imageError ? fallbackSrc : src

  return (
    <div className={`relative ${className}`} {...props}>
      {/* Estado de carga */}
      {isLoading && (
        <div className="absolute inset-0 bg-gray-200 animate-pulse flex items-center justify-center">
          <div className="w-6 h-6 border-2 border-gray-300 border-t-blue-500 rounded-full animate-spin"></div>
        </div>
      )}

      {/* Imagen */}
      <img
        src={imageSrc}
        alt={alt}
        className={`w-full h-full object-cover transition-opacity duration-200 ${
          isLoading ? 'opacity-0' : 'opacity-100'
        }`}
        onLoad={handleImageLoad}
        onError={handleImageError}
      />

      {/* Icono de reproducción (opcional) */}
      {showPlayIcon && !isLoading && (
        <div className="absolute inset-0 bg-black bg-opacity-20 flex items-center justify-center">
          <div className="w-8 h-8 bg-white bg-opacity-90 rounded-full flex items-center justify-center">
            <Play className="w-4 h-4 text-gray-800 fill-current" />
          </div>
        </div>
      )}

      {/* Fallback cuando no hay imagen */}
      {imageError && !isLoading && (
        <div className="absolute inset-0 bg-gray-100 flex items-center justify-center">
          <div className="text-center">
            <Image className="w-8 h-8 text-gray-400 mx-auto mb-2" />
            <p className="text-xs text-gray-500">Sin miniatura</p>
          </div>
        </div>
      )}
    </div>
  )
}

export default SmartThumbnail 