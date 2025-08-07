import React, { useState } from 'react'
import {
  Filter,
  X,
  Star,
  Heart,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  Zap
} from 'lucide-react'
import { useCategories } from '../../hooks/useCategories'

const CategoryChips = ({
  videos,
  onFilterChange,
  onSortChange,
  onShowFavorites,
  selectedStyle,
  activeChips = [],
  sortBy = 'none',
  showFavorites = false
}) => {

  // Obtener categorías dinámicamente del hook useCategories
  const { categoriesList, getColorClasses, getGradientClasses } = useCategories('figuras', selectedStyle)

  // Opciones de ordenamiento
  const sortOptions = [
    { key: 'none', name: 'Sin ordenar', icon: ArrowUpDown },
    { key: 'name-asc', name: 'A-Z', icon: ArrowUp },
    { key: 'name-desc', name: 'Z-A', icon: ArrowDown },
    { key: 'rating-high', name: 'Estrellas ↑', icon: Star },
    { key: 'rating-low', name: 'Estrellas ↓', icon: Star },
    { key: 'favorites', name: 'Favoritos', icon: Heart }
  ]

  // Manejar clic en chip de categoría
  const handleChipClick = (categoryKey) => {
    const newActiveChips = activeChips.includes(categoryKey) 
      ? activeChips.filter(chip => chip !== categoryKey)
      : [...activeChips, categoryKey]
    onFilterChange(newActiveChips)
  }

  // Manejar cambio de ordenamiento
  const handleSortChange = (sortKey) => {
    onSortChange(sortKey)
  }

  // Manejar toggle de favoritos
  const handleFavoritesToggle = () => {
    onShowFavorites(!showFavorites)
  }

  // Limpiar todos los filtros
  const clearAllFilters = () => {
    onFilterChange([])
    onSortChange('none')
    onShowFavorites(false)
  }

  // Obtener color del chip
  const getChipColor = (category) => {
    return getColorClasses(category.color)
  }

  // Obtener color del chip activo
  const getActiveChipColor = (category) => {
    const gradient = getGradientClasses(category.color)
    return `bg-gradient-to-r ${gradient} text-white border-transparent`
  }

  // Obtener icono para la categoría
  const getCategoryIcon = (categoryKey) => {
    const iconMap = {
      estilo: '🎨',
      subestilo: '⚡',
      tipo: '📁',
      manos: '🤝',
      nivel: '📊',
      duracion: '⏱️',
      instructor: '👤',
      ubicacion: '📍',
      organizador: '🏢'
    }
    return iconMap[categoryKey] || '📋'
  }

    // Contar videos por categoría
  const getVideosInCategory = (categoryKey) => {
    return videos.filter(video => {
      if (!video.tags) return false
      const categoryTags = video.tags[categoryKey]
      return categoryTags && Array.isArray(categoryTags) && categoryTags.length > 0
    }).length
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-6">
      {/* Header con título y contador */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Filter className="h-5 w-5 text-gray-600" />
          <h3 className="text-lg font-semibold text-gray-800">
            Filtros y Ordenamiento
          </h3>
        </div>
        <div className="text-sm text-gray-500">
          {videos.length} videos disponibles
        </div>
      </div>

      {/* Chips de Categorías */}
      <div className="mb-4">
        <h4 className="text-sm font-medium text-gray-700 mb-3">
          Categorías ({categoriesList.length})
        </h4>
        <div className="flex flex-wrap gap-2">
          {categoriesList.map((category) => {
            const isActive = activeChips.includes(category.key)
            const videoCount = getVideosInCategory(category.key)

            return (
              <button
                key={category.key}
                onClick={() => handleChipClick(category.key)}
                className={`
                  px-3 py-2 rounded-full text-sm font-medium transition-all duration-200
                  flex items-center gap-2 border-2
                  ${isActive
                    ? getActiveChipColor(category)
                    : `${getChipColor(category)} hover:shadow-md hover:scale-105`
                  }
                `}
              >
                <span className="text-xs">{getCategoryIcon(category.key)}</span>
                <span>{category.name}</span>
                <span className={`
                  px-1.5 py-0.5 rounded-full text-xs font-bold
                  ${isActive
                    ? 'bg-white/20 text-white'
                    : 'bg-gray-200 text-gray-600'
                  }
                `}>
                  {videoCount}
                </span>
              </button>
            )
          })}
        </div>
      </div>

      {/* Controles de Ordenamiento */}
      <div className="mb-4">
        <h4 className="text-sm font-medium text-gray-700 mb-3">
          Ordenamiento
        </h4>
        <div className="flex flex-wrap gap-2">
          {sortOptions.map((option) => (
            <button
              key={option.key}
              onClick={() => handleSortChange(option.key)}
              className={`
                px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200
                flex items-center gap-2 border
                ${sortBy === option.key
                  ? 'bg-blue-500 text-white border-blue-500 shadow-md'
                  : 'bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100 hover:border-gray-300'
                }
              `}
            >
              <option.icon className="h-4 w-4" />
              <span>{option.name}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Filtro de Favoritos */}
      <div className="mb-4">
        <button
          onClick={handleFavoritesToggle}
          className={`
            px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200
            flex items-center gap-2 border
            ${showFavorites
              ? 'bg-red-500 text-white border-red-500 shadow-md'
              : 'bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100 hover:border-gray-300'
            }
          `}
        >
          <Heart className={`h-4 w-4 ${showFavorites ? 'fill-current' : ''}`} />
          <span>{showFavorites ? 'Ocultar Favoritos' : 'Mostrar Solo Favoritos'}</span>
        </button>
      </div>

      {/* Indicadores de Filtros Activos */}
      {(activeChips.length > 0 || sortBy !== 'none' || showFavorites) && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Zap className="h-4 w-4 text-blue-600" />
              <span className="text-sm font-medium text-blue-800">
                Filtros Activos:
              </span>
            </div>
            <button
              onClick={clearAllFilters}
              className="text-sm text-blue-600 hover:text-blue-800 transition-colors duration-200 flex items-center gap-1"
            >
              <X className="h-3 w-3" />
              Limpiar
            </button>
          </div>

          <div className="mt-2 flex flex-wrap gap-2">
            {activeChips.map(chipKey => {
              const category = categoriesList.find(cat => cat.key === chipKey)
              return (
                <span
                  key={chipKey}
                  className={`px-2 py-1 rounded text-xs font-medium ${getActiveChipColor(category)}`}
                >
                  {category?.name || chipKey}
                </span>
              )
            })}
            {sortBy !== 'none' && (
              <span className="px-2 py-1 rounded text-xs font-medium bg-blue-500 text-white">
                {sortOptions.find(opt => opt.key === sortBy)?.name}
              </span>
            )}
            {showFavorites && (
              <span className="px-2 py-1 rounded text-xs font-medium bg-red-500 text-white">
                Solo Favoritos
              </span>
            )}
          </div>
        </div>
      )}

      {/* Debug Section - Solo en desarrollo */}
      {process.env.NODE_ENV === 'development' && (
        <div className="mt-4 p-3 bg-gray-100 rounded-lg text-xs">
          <div className="font-medium text-gray-700 mb-2">🔧 Debug Info:</div>
          <div className="space-y-1 text-gray-600">
            <div>Active Chips: {activeChips.join(', ') || 'ninguno'}</div>
            <div>Sort By: {sortBy}</div>
            <div>Show Favorites: {showFavorites ? 'Sí' : 'No'}</div>
            <div>Total Videos: {videos.length}</div>
            <div>Categories Available: {categoriesList.map(cat => cat.key).join(', ')}</div>
          </div>
        </div>
      )}
    </div>
  )
}

export default CategoryChips
