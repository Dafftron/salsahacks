// 🎯 HOOK PARA DETECTAR TAMAÑO DE CONTENEDOR - SALSAHACKS V2.0

import { useState, useEffect, useRef, useCallback } from 'react'

export const useContainerSize = () => {
  const [size, setSize] = useState({ width: 0, height: 0 })
  const [isLoading, setIsLoading] = useState(true)
  const containerRef = useRef(null)
  const resizeObserverRef = useRef(null)
  
  const updateSize = useCallback(() => {
    if (!containerRef.current) return
    const rect = containerRef.current.getBoundingClientRect()
    const nextWidth = rect.width
    const nextHeight = rect.height

    setSize(prev => {
      const widthChanged = Math.abs(nextWidth - prev.width) > 1
      const heightChanged = Math.abs(nextHeight - prev.height) > 1
      if (!widthChanged && !heightChanged) {
        return prev
      }
      return { width: nextWidth, height: nextHeight }
    })

    if (isLoading && nextWidth > 0) {
      setIsLoading(false)
    }
  }, [isLoading])
  
  useEffect(() => {
    // Crear ResizeObserver para detectar cambios de tamaño (montaje una vez)
    const hasRO = typeof window !== 'undefined' && window.ResizeObserver
    if (hasRO) {
      const ro = new ResizeObserver((entries) => {
        for (const entry of entries) {
          const { width, height } = entry.contentRect
          setSize(prev => {
            const widthChanged = Math.abs(width - prev.width) > 1
            const heightChanged = Math.abs(height - prev.height) > 1
            if (!widthChanged && !heightChanged) return prev
            return { width, height }
          })
          if (isLoading && width > 0) {
            setIsLoading(false)
          }
        }
      })
      resizeObserverRef.current = ro
      if (containerRef.current) {
        ro.observe(containerRef.current)
      }
    } else {
      // Fallback para navegadores sin ResizeObserver
      updateSize()
      const handler = () => updateSize()
      window.addEventListener('resize', handler)
      resizeObserverRef.current = { disconnect: () => window.removeEventListener('resize', handler) }
    }
    
    return () => {
      if (resizeObserverRef.current) {
        resizeObserverRef.current.disconnect()
        resizeObserverRef.current = null
      }
    }
  }, [isLoading, updateSize])
  
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
