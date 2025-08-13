import { useMemo } from 'react'
import { categoryStructure } from '../constants/categoryStructure'

export const useCategories = (page, selectedStyle) => {

  // Obtener página y estilos disponibles
  const currentPage = categoryStructure[page]
  const currentStyle = currentPage?.styles[selectedStyle]

  // Calcular estilos disponibles para la página actual
  const availableStyles = useMemo(() => {
    if (!currentPage) return []
    
    return Object.entries(currentPage.styles).map(([key, style]) => ({
      key,
      name: style.name,
      icon: style.icon,
      color: style.color
    }))
  }, [currentPage])

  // Calcular lista de categorías para el estilo actual
  const categoriesList = useMemo(() => {
    if (!currentStyle) return []
    
    return Object.entries(currentStyle.categories).map(([key, category]) => ({
      key,
      name: category.name,
      color: category.color,
      tags: category.tags
    }))
  }, [currentStyle])

  // Función para obtener clases de color
  const getColorClasses = (color) => {
    const colorMap = {
      // Colores específicos de estilos de baile
      salsa: 'bg-orange-500 text-white',
      bachata: 'bg-emerald-500 text-white',
      rumba: 'bg-rose-500 text-white',
      afro: 'bg-amber-600 text-white',
      merengue: 'bg-cyan-500 text-white',
      zouk: 'bg-violet-500 text-white',
      kizomba: 'bg-amber-500 text-white',
      
      // Colores genéricos para categorías
      pink: 'bg-pink-500 text-white',
      red: 'bg-red-500 text-white',
      yellow: 'bg-yellow-500 text-white',
      purple: 'bg-purple-500 text-white',
      orange: 'bg-orange-500 text-white',
      green: 'bg-green-500 text-white',
      blue: 'bg-blue-500 text-white',
      indigo: 'bg-indigo-500 text-white'
    }
    return colorMap[color] || 'bg-gray-500 text-white'
  }

  // Función para obtener clases de gradiente
  const getGradientClasses = (styleColor) => {
    const gradientMap = {
      // Gradientes específicos para cada página-estilo
      'figuras-salsa': 'from-orange-400 to-pink-500',
      'figuras-bachata': 'from-emerald-400 to-teal-600',
      'figuras-merengue': 'from-cyan-400 to-blue-600',
      'figuras-zouk': 'from-violet-400 to-indigo-600',
      'figuras-kizomba': 'from-amber-400 to-orange-600',
      
      // Gradientes específicos para escuela con sus colores característicos
      'escuela-salsa': 'from-purple-500 to-pink-500',
      'escuela-pasitos-libres': 'from-yellow-400 to-orange-500',
      'escuela-salsa-cubana': 'from-red-500 to-pink-500', 
      'escuela-bachata': 'from-emerald-400 to-teal-600',
      'escuela-kizomba': 'from-amber-400 to-orange-600',
      'escuela-zouk': 'from-violet-400 to-indigo-600',
      'escuela-merengue': 'from-cyan-400 to-blue-600',
      
      // Fallback directo para escuela-salsa
      'escuela-salsa': 'from-purple-500 to-pink-500',
      
      // Gradientes para eventos
      'eventos-talleres': 'from-amber-400 to-rose-500',
      'eventos-congresos': 'from-emerald-400 to-cyan-500',
      
      // Fallback por color genérico
      salsa: 'from-orange-400 to-pink-500',
      bachata: 'from-emerald-400 to-teal-600',
      rumba: 'from-rose-400 to-red-600',
      afro: 'from-amber-500 to-red-600',
      merengue: 'from-cyan-400 to-blue-600',
      zouk: 'from-violet-400 to-indigo-600',
      kizomba: 'from-amber-400 to-orange-600'
    }
    
    // Intentar obtener gradiente específico página-estilo
    const specificKey = `${page}-${selectedStyle}`
    if (gradientMap[specificKey]) {
      return gradientMap[specificKey]
    }
    
    // Fallback al color del estilo
    return gradientMap[styleColor] || 'from-gray-500 to-gray-600'
  }

  return {
    availableStyles,
    categoriesList,
    currentCategories: currentStyle?.categories,
    getColorClasses,
    getGradientClasses: (styleColorOrKey) => getGradientClasses(styleColorOrKey || selectedStyle),
    currentPage,
    currentStyle
  }
}
