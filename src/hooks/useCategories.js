// 🎯 HOOK PARA GESTIÓN DE CATEGORÍAS - SALSAHACKS V2.0

import { useState, useMemo } from 'react'
import { 
  DANCE_STYLES, 
  DIFFICULTY_LEVELS, 
  MAIN_CATEGORIES,
  TECHNICAL_TAGS,
  REGIONAL_STYLES,
  INSTRUCTORS,
  LOCATIONS,
  getCategoryColor,
  isHardcodedCategory
} from '../constants/categories'

export const useCategories = () => {
  // 🎵 Estados para filtros
  const [selectedStyle, setSelectedStyle] = useState('SALSA')
  const [selectedLevel, setSelectedLevel] = useState(null)
  const [selectedMainCategory, setSelectedMainCategory] = useState(null)
  const [selectedTags, setSelectedTags] = useState([])
  const [selectedRegionalStyle, setSelectedRegionalStyle] = useState(null)
  const [selectedInstructor, setSelectedInstructor] = useState(null)
  const [selectedLocation, setSelectedLocation] = useState(null)
  const [searchTerm, setSearchTerm] = useState('')

  // 🔍 Función de filtrado principal
  const filterContent = (content) => {
    return content.filter(item => {
      // Filtro por estilo de baile
      const styleMatch = !selectedStyle || item.style === selectedStyle
      
      // Filtro por nivel de dificultad
      const levelMatch = !selectedLevel || item.level === selectedLevel
      
      // Filtro por categoría principal
      const categoryMatch = !selectedMainCategory || item.mainCategory === selectedMainCategory
      
      // Filtro por etiquetas técnicas
      const tagsMatch = selectedTags.length === 0 || 
        selectedTags.some(tag => item.tags && item.tags.includes(tag))
      
      // Filtro por estilo regional
      const regionalMatch = !selectedRegionalStyle || 
        (item.regionalStyle && item.regionalStyle === selectedRegionalStyle)
      
      // Filtro por instructor
      const instructorMatch = !selectedInstructor || 
        (item.instructor && item.instructor === selectedInstructor)
      
      // Filtro por ubicación
      const locationMatch = !selectedLocation || 
        (item.location && item.location === selectedLocation)
      
      // Filtro por búsqueda
      const searchMatch = !searchTerm || 
        (item.title && item.title.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (item.description && item.description.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (item.tags && item.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase())))
      
      return styleMatch && levelMatch && categoryMatch && tagsMatch && 
             regionalMatch && instructorMatch && locationMatch && searchMatch
    })
  }

  // 📊 Estadísticas de filtros activos
  const activeFiltersCount = useMemo(() => {
    let count = 0
    if (selectedLevel) count++
    if (selectedMainCategory) count++
    if (selectedTags.length > 0) count++
    if (selectedRegionalStyle) count++
    if (selectedInstructor) count++
    if (selectedLocation) count++
    if (searchTerm) count++
    return count
  }, [selectedLevel, selectedMainCategory, selectedTags, selectedRegionalStyle, selectedInstructor, selectedLocation, searchTerm])

  // 🧹 Función para limpiar todos los filtros
  const clearAllFilters = () => {
    setSelectedLevel(null)
    setSelectedMainCategory(null)
    setSelectedTags([])
    setSelectedRegionalStyle(null)
    setSelectedInstructor(null)
    setSelectedLocation(null)
    setSearchTerm('')
  }

  // 🏷️ Función para agregar etiqueta
  const addTag = (tag) => {
    if (!selectedTags.includes(tag)) {
      setSelectedTags([...selectedTags, tag])
    }
  }

  // 🗑️ Función para remover etiqueta
  const removeTag = (tagToRemove) => {
    setSelectedTags(selectedTags.filter(tag => tag !== tagToRemove))
  }

  // 🎨 Función para obtener color de categoría
  const getColorForCategory = (categoryName) => {
    return getCategoryColor(categoryName)
  }

  // 🔒 Función para verificar si una categoría es hardcodeada
  const isCategoryHardcoded = (categoryName) => {
    return isHardcodedCategory(categoryName)
  }

  // 📈 Estadísticas de contenido por categoría
  const getContentStats = (content) => {
    const stats = {
      byStyle: {},
      byLevel: {},
      byCategory: {},
      byInstructor: {},
      byLocation: {},
      total: content.length
    }

    content.forEach(item => {
      // Estadísticas por estilo
      if (item.style) {
        stats.byStyle[item.style] = (stats.byStyle[item.style] || 0) + 1
      }
      
      // Estadísticas por nivel
      if (item.level) {
        stats.byLevel[item.level] = (stats.byLevel[item.level] || 0) + 1
      }
      
      // Estadísticas por categoría principal
      if (item.mainCategory) {
        stats.byCategory[item.mainCategory] = (stats.byCategory[item.mainCategory] || 0) + 1
      }
      
      // Estadísticas por instructor
      if (item.instructor) {
        stats.byInstructor[item.instructor] = (stats.byInstructor[item.instructor] || 0) + 1
      }
      
      // Estadísticas por ubicación
      if (item.location) {
        stats.byLocation[item.location] = (stats.byLocation[item.location] || 0) + 1
      }
    })

    return stats
  }

  // 🎯 Función para obtener categorías disponibles basadas en contenido
  const getAvailableCategories = (content) => {
    const available = {
      styles: new Set(),
      levels: new Set(),
      categories: new Set(),
      tags: new Set(),
      regionalStyles: new Set(),
      instructors: new Set(),
      locations: new Set()
    }

    content.forEach(item => {
      if (item.style) available.styles.add(item.style)
      if (item.level) available.levels.add(item.level)
      if (item.mainCategory) available.categories.add(item.mainCategory)
      if (item.tags) item.tags.forEach(tag => available.tags.add(tag))
      if (item.regionalStyle) available.regionalStyles.add(item.regionalStyle)
      if (item.instructor) available.instructors.add(item.instructor)
      if (item.location) available.locations.add(item.location)
    })

    return {
      styles: Array.from(available.styles),
      levels: Array.from(available.levels),
      categories: Array.from(available.categories),
      tags: Array.from(available.tags),
      regionalStyles: Array.from(available.regionalStyles),
      instructors: Array.from(available.instructors),
      locations: Array.from(available.locations)
    }
  }

  // 🔄 Función para resetear filtros a valores por defecto
  const resetToDefaults = () => {
    setSelectedStyle('SALSA')
    setSelectedLevel(null)
    setSelectedMainCategory(null)
    setSelectedTags([])
    setSelectedRegionalStyle(null)
    setSelectedInstructor(null)
    setSelectedLocation(null)
    setSearchTerm('')
  }

  return {
    // Estados
    selectedStyle,
    setSelectedStyle,
    selectedLevel,
    setSelectedLevel,
    selectedMainCategory,
    setSelectedMainCategory,
    selectedTags,
    setSelectedTags,
    selectedRegionalStyle,
    setSelectedRegionalStyle,
    selectedInstructor,
    setSelectedInstructor,
    selectedLocation,
    setSelectedLocation,
    searchTerm,
    setSearchTerm,
    
    // Funciones
    filterContent,
    clearAllFilters,
    addTag,
    removeTag,
    getColorForCategory,
    isCategoryHardcoded,
    getContentStats,
    getAvailableCategories,
    resetToDefaults,
    
    // Computed values
    activeFiltersCount,
    
    // Constantes disponibles
    DANCE_STYLES,
    DIFFICULTY_LEVELS,
    MAIN_CATEGORIES,
    TECHNICAL_TAGS,
    REGIONAL_STYLES,
    INSTRUCTORS,
    LOCATIONS
  }
} 