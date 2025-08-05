// 🎬 HOOK PARA CONSTRUCTOR DE SECUENCIAS - SALSAHACKS V2.0

import { useState, useCallback, useMemo } from 'react'

export const useSequenceBuilder = () => {
  const [sequence, setSequence] = useState([])
  const [sequenceName, setSequenceName] = useState('')
  const [sequenceDescription, setSequenceDescription] = useState('')
  const [isBuilderOpen, setIsBuilderOpen] = useState(false)
  const [showAllVideos, setShowAllVideos] = useState(false)

  // Función para verificar compatibilidad entre dos videos
  const checkCompatibility = useCallback((video1, video2) => {
    if (!video1 || !video2) return false
    
    const tagsFinales1 = video1.tags?.tagsFinales || []
    const tagsIniciales2 = video2.tags?.tagsIniciales || []
    
    // Verificar si hay al menos un tag final del primer video que coincida con un tag inicial del segundo
    return tagsFinales1.some(tagFinal => 
      tagsIniciales2.some(tagInicial => tagFinal === tagInicial)
    )
  }, [])

  // Función para obtener videos compatibles con el último video de la secuencia
  const getCompatibleVideos = useCallback((allVideos) => {
    if (sequence.length === 0) return allVideos
    
    const lastVideo = sequence[sequence.length - 1]
    return allVideos.filter(video => 
      !sequence.some(seqVideo => seqVideo.id === video.id) && // No incluir videos ya en la secuencia
      checkCompatibility(lastVideo, video)
    )
  }, [sequence, checkCompatibility])

  // Función para añadir un video a la secuencia
  const addVideoToSequence = useCallback((video) => {
    setSequence(prev => [...prev, video])
  }, [])

  // Función para eliminar un video de la secuencia
  const removeVideoFromSequence = useCallback((index) => {
    setSequence(prev => prev.filter((_, i) => i !== index))
  }, [])

  // Función para reordenar videos en la secuencia
  const reorderSequence = useCallback((fromIndex, toIndex) => {
    setSequence(prev => {
      const newSequence = [...prev]
      const [movedVideo] = newSequence.splice(fromIndex, 1)
      newSequence.splice(toIndex, 0, movedVideo)
      return newSequence
    })
  }, [])

  // Función para generar una secuencia aleatoria
  const generateRandomSequence = useCallback((allVideos, count = 5) => {
    if (allVideos.length === 0) return
    
    const randomSequence = []
    let availableVideos = [...allVideos]
    
    // Seleccionar el primer video aleatoriamente
    const firstVideoIndex = Math.floor(Math.random() * availableVideos.length)
    const firstVideo = availableVideos[firstVideoIndex]
    randomSequence.push(firstVideo)
    availableVideos.splice(firstVideoIndex, 1)
    
    // Construir el resto de la secuencia usando lógica de compatibilidad
    for (let i = 1; i < count && availableVideos.length > 0; i++) {
      const lastVideo = randomSequence[randomSequence.length - 1]
      const compatibleVideos = availableVideos.filter(video => 
        checkCompatibility(lastVideo, video)
      )
      
      if (compatibleVideos.length === 0) {
        // Si no hay videos compatibles, seleccionar uno aleatorio
        const randomIndex = Math.floor(Math.random() * availableVideos.length)
        randomSequence.push(availableVideos[randomIndex])
        availableVideos.splice(randomIndex, 1)
      } else {
        // Seleccionar un video compatible aleatorio
        const randomCompatibleIndex = Math.floor(Math.random() * compatibleVideos.length)
        const selectedVideo = compatibleVideos[randomCompatibleIndex]
        randomSequence.push(selectedVideo)
        availableVideos = availableVideos.filter(video => video.id !== selectedVideo.id)
      }
    }
    
    setSequence(randomSequence)
  }, [checkCompatibility])

  // Función para limpiar la secuencia
  const clearSequence = useCallback(() => {
    setSequence([])
    setSequenceName('')
    setSequenceDescription('')
  }, [])

  // Función para abrir el constructor
  const openBuilder = useCallback(() => {
    setIsBuilderOpen(true)
  }, [])

  // Función para cerrar el constructor
  const closeBuilder = useCallback(() => {
    setIsBuilderOpen(false)
    clearSequence()
  }, [clearSequence])

  // Función para alternar "mostrar todos los videos"
  const toggleShowAllVideos = useCallback(() => {
    setShowAllVideos(prev => !prev)
  }, [])

  // Memoizar videos filtrados según el estado actual
  const getFilteredVideos = useCallback((allVideos) => {
    if (showAllVideos) {
      return allVideos
    }
    return getCompatibleVideos(allVideos)
  }, [showAllVideos, getCompatibleVideos])

  // Verificar si un video es compatible con el último de la secuencia
  const isVideoCompatible = useCallback((video) => {
    if (sequence.length === 0) return true
    const lastVideo = sequence[sequence.length - 1]
    return checkCompatibility(lastVideo, video)
  }, [sequence, checkCompatibility])

  // Verificar si un video ya está en la secuencia
  const isVideoInSequence = useCallback((video) => {
    return sequence.some(seqVideo => seqVideo.id === video.id)
  }, [sequence])

  return {
    // Estados
    sequence,
    sequenceName,
    sequenceDescription,
    isBuilderOpen,
    showAllVideos,
    
    // Setters
    setSequenceName,
    setSequenceDescription,
    
    // Funciones principales
    addVideoToSequence,
    removeVideoFromSequence,
    reorderSequence,
    generateRandomSequence,
    clearSequence,
    openBuilder,
    closeBuilder,
    toggleShowAllVideos,
    
    // Funciones de utilidad
    checkCompatibility,
    getCompatibleVideos,
    getFilteredVideos,
    isVideoCompatible,
    isVideoInSequence
  }
} 