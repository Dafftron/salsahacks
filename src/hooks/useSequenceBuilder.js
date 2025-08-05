// 🎬 HOOK PARA CONSTRUCTOR DE SECUENCIAS - SALSAHACKS V2.0

import { useState, useCallback } from 'react'

export const useSequenceBuilder = () => {
  const [sequence, setSequence] = useState([])
  const [sequenceDescription, setSequenceDescription] = useState('')

  // Función para añadir un video a la secuencia
  const addToSequence = useCallback((video) => {
    setSequence(prev => [...prev, video])
  }, [])

  // Función para eliminar un video de la secuencia
  const removeFromSequence = useCallback((index) => {
    setSequence(prev => prev.filter((_, i) => i !== index))
  }, [])

  // Función para mover un video en la secuencia (drag & drop)
  const moveVideoInSequence = useCallback((fromIndex, toIndex) => {
    setSequence(prev => {
      const newSequence = [...prev]
      const [movedVideo] = newSequence.splice(fromIndex, 1)
      newSequence.splice(toIndex, 0, movedVideo)
      return newSequence
    })
  }, [])

  // Función para limpiar la secuencia
  const clearSequence = useCallback(() => {
    setSequence([])
    setSequenceDescription('')
  }, [])

  // Función para actualizar la descripción
  const updateSequenceDescription = useCallback((description) => {
    setSequenceDescription(description)
  }, [])

  return {
    // Estados
    sequence,
    sequenceDescription,
    
    // Funciones principales
    addToSequence,
    removeFromSequence,
    moveVideoInSequence,
    clearSequence,
    updateSequenceDescription
  }
} 