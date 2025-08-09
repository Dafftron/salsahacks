// 🎴 SELECTOR DE TAMAÑOS DE CARDS - SALSAHACKS V2.0

import React from 'react'
import { Grid, Grid3X3, Square, LayoutGrid } from 'lucide-react'
import { useCardSize } from '../../contexts/CardSizeContext'

const CardSizeSelector = ({ type = 'video', styleColor = 'salsa' }) => {
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
    small: <LayoutGrid className="h-4 w-4" />,
    medium: <Grid3X3 className="h-4 w-4" />,
    large: <Grid className="h-4 w-4" />,
    'extra-large': <Square className="h-4 w-4" />
  }

  // Función para obtener gradientes por estilo
  const getStyleGradient = (style) => {
    const gradientMap = {
      salsa: 'from-orange-400 to-pink-500',
      bachata: 'from-emerald-400 to-teal-600',
      merengue: 'from-cyan-400 to-blue-600',
      zouk: 'from-violet-400 to-indigo-600',
      kizomba: 'from-amber-400 to-orange-600'
    }
    return gradientMap[style] || 'from-orange-400 to-pink-500'
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
            className={`flex items-center justify-center px-2 py-2 rounded-md text-sm font-medium transition-colors duration-200 ${
              currentSize === size
                ? `bg-gradient-to-r ${getStyleGradient(styleColor)} text-white shadow-lg`
                : 'text-gray-600 hover:text-gray-800 hover:bg-white'
            }`}
            title={`${sizeLabels[size]} - ${size} cards`}
          >
            {sizeIcons[size]}
          </button>
        ))}
      </div>
    </div>
  )
}

export default CardSizeSelector

