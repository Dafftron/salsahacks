import { useState, useEffect } from 'react'

export const useImageOrientation = (imageSrc) => {
  const [orientation, setOrientation] = useState('horizontal') // 'horizontal' o 'vertical'
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (!imageSrc) {
      setOrientation('horizontal')
      setIsLoading(false)
      return
    }

    const img = new Image()
    
    img.onload = () => {
      const width = img.naturalWidth
      const height = img.naturalHeight
      
      if (width && height) {
        const isVertical = height > width
        setOrientation(isVertical ? 'vertical' : 'horizontal')
        console.log(`Orientación de imagen: ${isVertical ? 'vertical' : 'horizontal'} (${width}x${height})`)
      } else {
        setOrientation('horizontal')
      }
      setIsLoading(false)
    }

    img.onerror = () => {
      console.warn('Error cargando imagen para detectar orientación:', imageSrc)
      setOrientation('horizontal')
      setIsLoading(false)
    }

    img.src = imageSrc

    return () => {
      img.onload = null
      img.onerror = null
    }
  }, [imageSrc])

  return { orientation, isLoading }
} 