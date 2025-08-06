// 🎴 SELECTOR DE TAMAÑOS DE CARDS - SALSAHACKS V2.0

import React from 'react'
import { Grid, Grid3X3, Grid4, Square } from 'lucide-react'
import { useCardSize } from '../../contexts/CardSizeContext'

const CardSizeSelector = ({ type = 'video' }) => {
  const {
    videoCardSize,
    sequenceCardSize,
    setVideoCardSize,
    setSequenceCardSize,
    availableSizes,
    sizeLabels
  } = useCardSize()

  const currentSize = type === 'video' ? videoCardSize : sequenceCardSize
  const setSize = type === 'video' ? setVideoCardSize : setSequenceCardSize

  // Iconos para cada tamaño
  const sizeIcons = {
    small: <Grid4 className="h-4 w-4" />,
    medium: <Grid3X3 className="h-4 w-4" />,
    large: <Grid className="h-4 w-4" />,
    'extra-large': <Square className="h-4 w-4" />
  }

  // Colores para cada tamaño
  const sizeColors = {
    small: 'from-gray-400 to-gray-500',
    medium: 'from-blue-400 to-blue-500',
    large: 'from-purple-400 to-purple-500',
    'extra-large': 'from-pink-400 to-pink-500'
  }

  return (
    <div className="flex items-center space-x-2">
      <span className="text-sm font-medium text-gray-700 mr-2">
        Tamaño:
      </span>
      <div className="flex bg-gray-100 rounded-lg p-1">
        {availableSizes.map((size) => (
          <button
            key={size}
            onClick={() => setSize(size)}
            className={`flex items-center space-x-1 px-3 py-2 rounded-md text-sm font-medium transition-all duration-200 ${
              currentSize === size
                ? `bg-gradient-to-r ${sizeColors[size]} text-white shadow-lg transform scale-105`
                : 'text-gray-600 hover:text-gray-800 hover:bg-white'
            }`}
            title={`${sizeLabels[size]} - ${size} cards`}
          >
            {sizeIcons[size]}
            <span className="hidden sm:inline">{sizeLabels[size]}</span>
          </button>
        ))}
      </div>
    </div>
  )
}

export default CardSizeSelector

