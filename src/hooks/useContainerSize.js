// 🎯 HOOK PARA DETECTAR TAMAÑO DE CONTENEDOR - SALSAHACKS V2.0

import { useState, useEffect, useRef, useCallback } from 'react'

export const useContainerSize = () => {
  const [size, setSize] = useState({ width: 0, height: 0 })
  const [isLoading, setIsLoading] = useState(true)
  const containerRef = useRef(null)
  const resizeObserverRef = useRef(null)
  
  const updateSize = useCallback(() => {
    if (containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect()
      const newSize = {
        width: rect.width,
        height: rect.height
      }
      
      // Solo actualizar si el tamaño cambió significativamente
      if (Math.abs(newSize.width - size.width) > 1 || 
          Math.abs(newSize.height - size.height) > 1) {
        setSize(newSize)
      }
      
      if (isLoading && newSize.width > 0) {
        setIsLoading(false)
      }
    }
  }, [size.width, size.height, isLoading])
  
  useEffect(() => {
    // Crear ResizeObserver para detectar cambios de tamaño
    if (typeof window !== 'undefined' && window.ResizeObserver) {
      resizeObserverRef.current = new ResizeObserver((entries) => {
        for (const entry of entries) {
          const { width, height } = entry.contentRect
          setSize({ width, height })
          
          if (isLoading && width > 0) {
            setIsLoading(false)
          }
        }
      })
      
      if (containerRef.current) {
        resizeObserverRef.current.observe(containerRef.current)
      }
    } else {
      // Fallback para navegadores sin ResizeObserver
      updateSize()
      window.addEventListener('resize', updateSize)
    }
    
    return () => {
      if (resizeObserverRef.current) {
        resizeObserverRef.current.disconnect()
      }
      if (typeof window !== 'undefined') {
        window.removeEventListener('resize', updateSize)
      }
    }
  }, [updateSize, isLoading])
  
  // Actualizar tamaño inicial cuando se asigna la ref
  useEffect(() => {
    if (containerRef.current) {
      updateSize()
    }
  }, [updateSize])
  
  return {
    containerRef,
    width: size.width,
    height: size.height,
    isLoading
  }
}
