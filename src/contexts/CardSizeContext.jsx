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
  const [videoCardSize, setVideoCardSize] = useState('large') // small, medium, large, extra-large
  const [sequenceCardSize, setSequenceCardSize] = useState('large') // small, medium, large, extra-large

  // Configuraciones de tamaños para videos
  const videoSizeConfig = {
    small: {
      grid: 'md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6',
      gridFullWidth: 'md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-8 2xl:grid-cols-10',
      aspect: 'aspect-video',
      imageObject: 'object-cover', // Consistente con las demás
      titleSize: 'text-xs',
      descriptionLines: 1,
      showStats: false,
      showTags: true,
      compact: true,
      maxTags: 2
    },
    medium: {
      grid: 'md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5',
      gridFullWidth: 'md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 2xl:grid-cols-7',
      aspect: 'aspect-video',
      imageObject: 'object-cover', // Llenar el área en video
      titleSize: 'text-sm',
      descriptionLines: 1,
      showStats: false,
      showTags: true,
      compact: true,
      maxTags: 3
    },
    large: {
      grid: 'md:grid-cols-2 lg:grid-cols-3',
      gridFullWidth: 'md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5',
      aspect: 'aspect-video',
      imageObject: 'object-cover', // Llenar el área en video
      titleSize: 'text-xl',
      descriptionLines: 3,
      showStats: true,
      showTags: true,
      compact: false,
      maxTags: 5
    },
    'extra-large': {
      grid: 'md:grid-cols-1 lg:grid-cols-2',
      gridFullWidth: 'md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4',
      aspect: 'aspect-video',
      imageObject: 'object-cover', // Llenar el área en video
      titleSize: 'text-2xl',
      descriptionLines: 4,
      showStats: true,
      showTags: true,
      compact: false,
      maxTags: 8
    }
  }

  // Configuraciones de tamaños para secuencias (igual que videos)
  const sequenceSizeConfig = {
    small: {
      grid: 'md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6',
      gridFullWidth: 'md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-8 2xl:grid-cols-10',
      aspect: 'aspect-video',
      imageObject: 'object-cover', // Consistente con las demás
      titleSize: 'text-xs',
      descriptionLines: 0, // Sin descripción, solo iconos
      showStats: true,
      showTags: false,
      showIcons: true, // Mostrar iconos en lugar de descripción
      compact: true
    },
    medium: {
      grid: 'md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5',
      gridFullWidth: 'md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 2xl:grid-cols-7',
      aspect: 'aspect-video',
      imageObject: 'object-cover', // Llenar el área en video
      titleSize: 'text-sm',
      descriptionLines: 0, // Sin descripción, solo iconos
      showStats: true,
      showTags: false,
      showIcons: true, // Mostrar iconos en lugar de descripción
      compact: true
    },
    large: {
      grid: 'md:grid-cols-2 lg:grid-cols-3',
      gridFullWidth: 'md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5',
      aspect: 'aspect-video',
      imageObject: 'object-cover', // Llenar el área en video
      titleSize: 'text-lg',
      descriptionLines: 2,
      showStats: true,
      showTags: true,
      showIcons: false, // En grande mostrar descripción
      compact: false
    },
    'extra-large': {
      grid: 'md:grid-cols-1 lg:grid-cols-2',
      gridFullWidth: 'md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4',
      aspect: 'aspect-video',
      imageObject: 'object-cover', // Llenar el área en video
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
    getVideoConfig: (isFullWidth = false) => {
      const config = videoSizeConfig[videoCardSize]
      return {
        ...config,
        grid: isFullWidth ? config.gridFullWidth : config.grid
      }
    },
    getSequenceConfig: (isFullWidth = false) => {
      const config = sequenceSizeConfig[sequenceCardSize]
      return {
        ...config,
        grid: isFullWidth ? config.gridFullWidth : config.grid
      }
    },
    
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

