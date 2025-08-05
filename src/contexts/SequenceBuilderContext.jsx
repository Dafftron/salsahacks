// 🎬 CONTEXTO PARA CONSTRUCTOR DE SECUENCIAS - SALSAHACKS V2.0

import React, { createContext, useContext, useState, useCallback, useMemo } from 'react'

const SequenceBuilderContext = createContext()

export const useSequenceBuilderContext = () => {
  const context = useContext(SequenceBuilderContext)
  if (!context) {
    throw new Error('useSequenceBuilderContext debe usarse dentro de un SequenceBuilderProvider')
  }
  return context
}

export const SequenceBuilderProvider = ({ children }) => {
  const [sequence, setSequence] = useState([])
  const [sequenceName, setSequenceName] = useState('')
  const [sequenceDescription, setSequenceDescription] = useState('')
  const [isBuilderOpen, setIsBuilderOpen] = useState(false)
  const [showAllVideos, setShowAllVideos] = useState(false)

  // Función auxiliar para extraer todos los tags de un objeto de tags por categorías
  const extractAllTags = useCallback((tagsObj) => {
    if (!tagsObj) return []
    
    const allTags = []
    
    // Si es un array, devolverlo directamente
    if (Array.isArray(tagsObj)) {
      return tagsObj
    }
    
    // Si es un objeto con categorías, extraer todos los tags
    Object.values(tagsObj).forEach(categoryTags => {
      if (Array.isArray(categoryTags)) {
        allTags.push(...categoryTags)
      }
    })
    
    return allTags
  }, [])

  // Función para verificar compatibilidad entre dos videos
  const checkCompatibility = useCallback((video1, video2) => {
    if (!video1 || !video2) return false
    
    // Extraer todos los tags finales del primer video
    const tagsFinales1 = extractAllTags(video1.tagsFinales)
    
    // Extraer todos los tags iniciales del segundo video
    const tagsIniciales2 = extractAllTags(video2.tagsIniciales)
    
    console.log('🔍 Verificando compatibilidad:')
    console.log('Video 1:', video1.title, 'Tags Finales:', tagsFinales1)
    console.log('Video 2:', video2.title, 'Tags Iniciales:', tagsIniciales2)
    
    // Verificar si hay al menos un tag final del primer video que coincida con un tag inicial del segundo
    const isCompatible = tagsFinales1.some(tagFinal => 
      tagsIniciales2.some(tagInicial => {
        const match = tagFinal === tagInicial
        if (match) {
          console.log('✅ Match encontrado:', tagFinal, '=', tagInicial)
        }
        return match
      })
    )
    
    console.log('Resultado compatibilidad:', isCompatible)
    return isCompatible
  }, [extractAllTags])

  // Función para añadir un video a la secuencia (ahora permite repetidos)
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
    
    // Si ya hay videos en la secuencia, añadir a la existente
    const currentSequence = [...sequence]
    let availableVideos = [...allVideos]
    
    // Remover videos que ya están en la secuencia actual
    availableVideos = availableVideos.filter(video => 
      !currentSequence.some(seqVideo => seqVideo.id === video.id)
    )
    
    console.log('🎲 Generando secuencia aleatoria para completar', count, 'videos totales')
    console.log('📋 Videos actuales en secuencia:', currentSequence.length)
    console.log('📋 Videos disponibles:', availableVideos.length)
    
    // Si no hay secuencia actual, seleccionar el primer video aleatoriamente
    if (currentSequence.length === 0) {
      const firstVideoIndex = Math.floor(Math.random() * availableVideos.length)
      const firstVideo = availableVideos[firstVideoIndex]
      currentSequence.push(firstVideo)
      availableVideos.splice(firstVideoIndex, 1)
      console.log('🎯 Primer video seleccionado:', firstVideo.title)
    }
    
    // Calcular cuántos videos faltan para completar la secuencia
    const videosNeeded = count - currentSequence.length
    console.log(`🎯 Videos necesarios para completar: ${videosNeeded}`)
    
    // Construir el resto de la secuencia usando lógica de compatibilidad
    for (let i = 0; i < videosNeeded && availableVideos.length > 0; i++) {
      const lastVideo = currentSequence[currentSequence.length - 1]
      const compatibleVideos = availableVideos.filter(video => 
        checkCompatibility(lastVideo, video)
      )
      
      console.log(`📋 Paso ${i + 1}: ${compatibleVideos.length} videos compatibles disponibles`)
      
      if (compatibleVideos.length === 0) {
        console.log('⚠️ No hay videos compatibles, terminando secuencia')
        break
      } else {
        // Seleccionar un video compatible aleatorio
        const randomCompatibleIndex = Math.floor(Math.random() * compatibleVideos.length)
        const selectedVideo = compatibleVideos[randomCompatibleIndex]
        currentSequence.push(selectedVideo)
        availableVideos = availableVideos.filter(video => video.id !== selectedVideo.id)
        console.log(`✅ Añadido: ${selectedVideo.title}`)
      }
    }
    
    console.log(`🎉 Secuencia final: ${currentSequence.length} videos`)
    setSequence(currentSequence)
  }, [sequence, checkCompatibility])

  // Función para limpiar la secuencia
  const clearSequence = useCallback(() => {
    setSequence([])
    setSequenceName('')
    setSequenceDescription('')
  }, [])

  // Función para alternar el constructor
  const toggleBuilder = useCallback(() => {
    setIsBuilderOpen(prev => !prev)
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

  // Verificar si un video es compatible con el último de la secuencia
  const isVideoCompatible = useCallback((video) => {
    if (sequence.length === 0) return true
    const lastVideo = sequence[sequence.length - 1]
    return checkCompatibility(lastVideo, video)
  }, [sequence, checkCompatibility])

  // Función para obtener videos compatibles (para filtrado)
  const getCompatibleVideos = useCallback((allVideos) => {
    if (sequence.length === 0) {
      console.log('📋 Secuencia vacía, mostrando todos los videos')
      return allVideos
    }
    
    const lastVideo = sequence[sequence.length - 1]
    console.log('🎯 Buscando videos compatibles con:', lastVideo.title)
    
    const compatibleVideos = allVideos.filter(video => {
      const isCompatible = checkCompatibility(lastVideo, video)
      console.log(`${video.title}: ${isCompatible ? '✅ Compatible' : '❌ Incompatible'}`)
      return isCompatible
    })
    
    console.log(`📊 Videos compatibles encontrados: ${compatibleVideos.length}/${allVideos.length}`)
    return compatibleVideos
  }, [sequence, checkCompatibility])

  // Función para filtrar videos según el estado actual
  const getFilteredVideos = useCallback((allVideos) => {
    if (showAllVideos) {
      return allVideos
    }
    return getCompatibleVideos(allVideos)
  }, [showAllVideos, getCompatibleVideos])

  // Función para verificar si un video ya está en la secuencia (ahora siempre false para permitir repetidos)
  const isVideoInSequence = useCallback((video) => {
    // Comentado para permitir videos repetidos
    // return sequence.some(seqVideo => seqVideo.id === video.id)
    return false
  }, [sequence])

  const value = {
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
    toggleBuilder,
    toggleShowAllVideos,
    
    // Funciones de utilidad
    checkCompatibility,
    isVideoCompatible,
    isVideoInSequence,
    getCompatibleVideos,
    getFilteredVideos
  }

  return (
    <SequenceBuilderContext.Provider value={value}>
      {children}
    </SequenceBuilderContext.Provider>
  )
} 