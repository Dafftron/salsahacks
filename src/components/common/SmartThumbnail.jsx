// 🖼️ COMPONENTE SMART THUMBNAIL - SALSAHACKS V2.0

import React, { useState, useEffect } from 'react'
import { Image, Play } from 'lucide-react'

const SmartThumbnail = ({ 
  src, 
  alt, 
  className = '', 
  fallbackSrc = '/placeholder-video.svg',
  showPlayIcon = false,
  forceAspectRatio = null, // 'vertical' | 'horizontal' | null (auto-detect)
  ...props 
}) => {
  const [imageError, setImageError] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [imageOrientation, setImageOrientation] = useState(null) // 'vertical' | 'horizontal'

  const handleImageLoad = (event) => {
    setIsLoading(false)
    setImageError(false)
    
    // Detectar orientación de la imagen
    const img = event.target
    if (img.naturalWidth && img.naturalHeight) {
      const aspectRatio = img.naturalWidth / img.naturalHeight
      const orientation = aspectRatio < 1 ? 'vertical' : 'horizontal'
      setImageOrientation(orientation)
    }
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

  // Determinar el aspect ratio a usar
  const getAspectRatioClass = () => {
    if (forceAspectRatio) {
      return forceAspectRatio === 'vertical' ? 'aspect-[9/16]' : 'aspect-video'
    }
    
    if (imageOrientation) {
      return imageOrientation === 'vertical' ? 'aspect-[9/16]' : 'aspect-video'
    }
    
    // Por defecto, usar aspect-video (16:9) para thumbnails
    return 'aspect-video'
  }

  return (
    <div className={`relative ${getAspectRatioClass()} ${className}`} {...props}>
      {/* Estado de carga */}
      {isLoading && (
        <div className="absolute inset-0 bg-gradient-to-br from-gray-100 to-gray-200 animate-pulse flex items-center justify-center">
          <div className="w-6 h-6 border-2 border-gray-300 border-t-blue-500 rounded-full animate-spin"></div>
        </div>
      )}

      {/* Imagen con mejor resolución */}
      <img
        src={imageSrc}
        alt={alt}
        className={`w-full h-full object-cover transition-all duration-300 ${
          isLoading ? 'opacity-0' : 'opacity-100'
        } hover:scale-105`}
        onLoad={handleImageLoad}
        onError={handleImageError}
        loading="lazy"
        decoding="async"
      />

      {/* Icono de reproducción (opcional) */}
      {showPlayIcon && !isLoading && (
        <div className="absolute inset-0 bg-black bg-opacity-20 flex items-center justify-center group-hover:bg-opacity-30 transition-all duration-200">
          <div className="w-12 h-12 bg-white bg-opacity-90 rounded-full flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-200">
            <Play className="w-6 h-6 text-gray-800 fill-current ml-1" />
          </div>
        </div>
      )}

      {/* Fallback cuando no hay imagen */}
      {(imageError || shouldShowFallback) && !isLoading && (
        <div className="absolute inset-0 bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
          <div className="text-center">
            <Image className="w-12 h-12 text-gray-400 mx-auto mb-3" />
            <p className="text-sm text-gray-500 font-medium">Sin miniatura</p>
            {showPlayIcon && (
              <div className="mt-3 w-8 h-8 bg-white bg-opacity-90 rounded-full flex items-center justify-center mx-auto shadow-sm">
                <Play className="w-4 h-4 text-gray-600 fill-current ml-0.5" />
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

export default SmartThumbnail 