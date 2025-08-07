// 🎴 CONTEXTO DE TAMAÑOS DE CARDS - SALSAHACKS V2.0

import React, { createContext, useContext, useState } from 'react'

const CardSizeContext = createContext()

export const useCardSize = () => {
  const context = useContext(CardSizeContext)
  if (!context) {
    throw new Error('useCardSize debe ser usado dentro de un CardSizeProvider')
  }
  return context
}

export const CardSizeProvider = ({ children }) => {
  // Estados para diferentes tipos de galerías
  const [videoCardSize, setVideoCardSize] = useState('medium') // small, medium, large, extra-large
  const [sequenceCardSize, setSequenceCardSize] = useState('medium') // small, medium, large, extra-large

  // Configuraciones de tamaños para videos
  const videoSizeConfig = {
    small: {
      grid: 'md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6',
      aspect: 'aspect-square',
      titleSize: 'text-xs',
      descriptionLines: 1,
      showStats: false,
      showTags: true,
      compact: true
    },
    medium: {
      grid: 'md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5',
      aspect: 'aspect-video',
      titleSize: 'text-sm',
      descriptionLines: 1,
      showStats: false,
      showTags: true,
      compact: true
    },
    large: {
      grid: 'md:grid-cols-2 lg:grid-cols-3',
      aspect: 'aspect-video',
      titleSize: 'text-xl',
      descriptionLines: 3,
      showStats: true,
      showTags: true,
      compact: false
    },
    'extra-large': {
      grid: 'md:grid-cols-1 lg:grid-cols-2',
      aspect: 'aspect-video',
      titleSize: 'text-2xl',
      descriptionLines: 4,
      showStats: true,
      showTags: true,
      compact: false
    }
  }

  // Configuraciones de tamaños para secuencias (igual que videos)
  const sequenceSizeConfig = {
    small: {
      grid: 'md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6',
      aspect: 'aspect-square',
      titleSize: 'text-xs',
      descriptionLines: 0, // Sin descripción, solo iconos
      showStats: true,
      showTags: false,
      showIcons: true, // Mostrar iconos en lugar de descripción
      compact: true
    },
    medium: {
      grid: 'md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5',
      aspect: 'aspect-video',
      titleSize: 'text-sm',
      descriptionLines: 0, // Sin descripción, solo iconos
      showStats: true,
      showTags: false,
      showIcons: true, // Mostrar iconos en lugar de descripción
      compact: true
    },
    large: {
      grid: 'md:grid-cols-2 lg:grid-cols-3',
      aspect: 'aspect-video',
      titleSize: 'text-lg',
      descriptionLines: 2,
      showStats: true,
      showTags: true,
      showIcons: false, // En grande mostrar descripción
      compact: false
    },
    'extra-large': {
      grid: 'md:grid-cols-1 lg:grid-cols-2',
      aspect: 'aspect-video',
      titleSize: 'text-xl',
      descriptionLines: 3,
      showStats: true,
      showTags: true,
      showIcons: false, // En extra grande mostrar descripción
      compact: false
    }
  }

  const value = {
    // Estados
    videoCardSize,
    sequenceCardSize,
    
    // Setters
    setVideoCardSize,
    setSequenceCardSize,
    
    // Configuraciones
    videoSizeConfig,
    sequenceSizeConfig,
    
    // Helpers
    getVideoConfig: () => videoSizeConfig[videoCardSize],
    getSequenceConfig: () => sequenceSizeConfig[sequenceCardSize],
    
    // Tamaños disponibles
    availableSizes: ['small', 'medium', 'large', 'extra-large'],
    
    // Labels para UI
    sizeLabels: {
      small: 'Pequeño',
      medium: 'Mediano', 
      large: 'Grande',
      'extra-large': 'Extra Grande'
    }
  }

  return (
    <CardSizeContext.Provider value={value}>
      {children}
    </CardSizeContext.Provider>
  )
}

