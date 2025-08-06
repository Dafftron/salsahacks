// 🖼️ COMPONENTE SMART THUMBNAIL - SALSAHACKS V2.0

import React, { useState } from 'react'
import { Image, Play } from 'lucide-react'

const SmartThumbnail = ({ 
  src, 
  alt, 
  className = '', 
  fallbackSrc = '/placeholder-video.svg',
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

  // Si no hay src o es una URL placeholder, mostrar fallback directamente
  const shouldShowFallback = !src || 
    src === null ||
    src === undefined ||
    src === 'https://via.placeholder.com/400x225/1a1a1a/ffffff?text=VIDEO' ||
    src === 'https://via.placeholder.com/300x200/1a1a1a/ffffff?text=EVENTO'
  
  const imageSrc = shouldShowFallback || imageError ? fallbackSrc : src

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
      {(imageError || shouldShowFallback) && !isLoading && (
        <div className="absolute inset-0 bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
          <div className="text-center">
            <Image className="w-8 h-8 text-gray-400 mx-auto mb-2" />
            <p className="text-xs text-gray-500 font-medium">Sin miniatura</p>
            {showPlayIcon && (
              <div className="mt-2 w-6 h-6 bg-white bg-opacity-90 rounded-full flex items-center justify-center mx-auto">
                <Play className="w-3 h-3 text-gray-600 fill-current" />
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

export default SmartThumbnail 