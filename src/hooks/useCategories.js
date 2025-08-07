// 🎯 HOOK PARA GESTIÓN DE CATEGORÍAS - SALSAHACKS V2.0

import { useState, useMemo } from 'react'

// Estructura jerárquica de categorías (copiada de CategoriesPage.jsx)
const categoryStructure = {
  figuras: {
    name: 'FIGURAS',
    icon: 'Music',
    styles: {
      salsa: {
        name: 'SALSA',
        icon: 'Music',
        color: 'salsa',
        categories: {
          estilo: {
            name: 'ESTILO',
            color: 'pink',
            tags: ['Salsa', 'Salsa en línea On1', 'Salsa cubana', 'Estilo LA', 'Estilo NY', 'Estilo show']
          },
          subestilo: {
            name: 'SUBESTILO/TÉCNICA',
            color: 'orange',
            tags: ['Pasitos libres', 'Parejas', 'Footwork On1', 'Footwork On2', 'Shines', 'Fusionado con afro', 'Body movement']
          },
          tipo: {
            name: 'TIPO DE FIGURA',
            color: 'green',
            tags: ['Cross Body Lead', 'Copa', 'Sombrero', 'Dile que no', 'Setenta', 'Vacilala', 'Enchufla']
          },
          manos: {
            name: 'MANOS/TÉCNICA DE AGARRE',
            color: 'blue',
            tags: ['Una mano', 'Dos manos paralelas', 'Cruzadas', 'Entrelazadas', 'Cambio de manos', 'Manos abiertas', 'Sin contacto']
          }
        }
      },
      bachata: {
        name: 'BACHATA',
        icon: 'Heart',
        color: 'bachata',
        categories: {
          estilo: {
            name: 'ESTILO',
            color: 'red',
            tags: ['Bachata dominicana', 'Bachata moderna', 'Bachata sensual', 'Bachata urbana']
          },
          subestilo: {
            name: 'SUBESTILO/TÉCNICA',
            color: 'orange',
            tags: ['Body rolls', 'Hip movement', 'Footwork básico', 'Turns']
          },
          tipo: {
            name: 'TIPO DE FIGURA',
            color: 'green',
            tags: ['Dile que no', 'Setenta', 'Vacilala', 'Sombrero', 'Copa']
          },
          manos: {
            name: 'MANOS/TÉCNICA DE AGARRE',
            color: 'blue',
            tags: ['Una mano', 'Dos manos', 'Cruzadas', 'Entrelazadas']
          }
        }
      },
      kizomba: {
        name: 'KIZOMBA',
        icon: 'Zap',
        color: 'yellow',
        categories: {
          estilo: {
            name: 'ESTILO',
            color: 'yellow',
            tags: ['Kizomba tradicional', 'Kizomba urbana', 'Tarraxinha', 'Semba']
          },
          subestilo: {
            name: 'SUBESTILO/TÉCNICA',
            color: 'orange',
            tags: ['Body movement', 'Hip rolls', 'Footwork', 'Turns']
          },
          tipo: {
            name: 'TIPO DE FIGURA',
            color: 'green',
            tags: ['Saída', 'Volta', 'Tarraxinha', 'Semba step']
          },
          manos: {
            name: 'MANOS/TÉCNICA DE AGARRE',
            color: 'blue',
            tags: ['Una mano', 'Dos manos', 'Cruzadas', 'Sin contacto']
          }
        }
      },
             zouk: {
         name: 'ZOUK',
         icon: 'Star',
         color: 'zouk',
        categories: {
          estilo: {
            name: 'ESTILO',
            color: 'purple',
            tags: ['Zouk brasileño', 'Zouk flow', 'Zouk neofusion', 'Zouk tradicional']
          },
          subestilo: {
            name: 'SUBESTILO/TÉCNICA',
            color: 'orange',
            tags: ['Body rolls', 'Head movement', 'Footwork', 'Turns']
          },
          tipo: {
            name: 'TIPO DE FIGURA',
            color: 'green',
            tags: ['Lateral', 'Tranca', 'Pião', 'Balanço']
          },
          manos: {
            name: 'MANOS/TÉCNICA DE AGARRE',
            color: 'blue',
            tags: ['Una mano', 'Dos manos', 'Cruzadas', 'Entrelazadas']
          }
        }
      },
      merengue: {
        name: 'MERENGUE',
        icon: 'Sun',
        color: 'merengue',
        categories: {
          estilo: {
            name: 'ESTILO',
            color: 'orange',
            tags: ['Merengue dominicano', 'Merengue tradicional', 'Merengue moderno']
          },
          subestilo: {
            name: 'SUBESTILO/TÉCNICA',
            color: 'orange',
            tags: ['Hip movement', 'Footwork básico', 'Turns simples']
          },
          tipo: {
            name: 'TIPO DE FIGURA',
            color: 'green',
            tags: ['Giros simples', 'Cambios de dirección', 'Pasos básicos']
          },
          manos: {
            name: 'MANOS/TÉCNICA DE AGARRE',
            color: 'blue',
            tags: ['Una mano', 'Dos manos', 'Sin contacto']
          }
        }
      }
    }
  },
  escuela: {
    name: 'ESCUELA',
    icon: 'GraduationCap',
    styles: {
      salsa: {
        name: 'SALSA',
        icon: 'Music',
        color: 'pink',
        categories: {
          nivel: {
            name: 'NIVEL',
            color: 'green',
            tags: ['Principiante', 'Intermedio', 'Avanzado', 'Experto']
          },
          tipo: {
            name: 'TIPO DE CURSO',
            color: 'blue',
            tags: ['Básico', 'Técnica', 'Coreografía', 'Ritmo', 'Musicalidad']
          },
          duracion: {
            name: 'DURACIÓN',
            color: 'orange',
            tags: ['5-15 min', '10-25 min', '15-45 min', '20-60 min']
          },
          instructor: {
            name: 'INSTRUCTOR',
            color: 'purple',
            tags: ['Carlos Rodríguez', 'María González', 'Juan Pérez', 'Ana López']
          }
        }
      }
    }
  },
  eventos: {
    name: 'EVENTOS',
    icon: 'Calendar',
    styles: {
      salsa: {
        name: 'SALSA',
        icon: 'Music',
        color: 'pink',
        categories: {
          tipo: {
            name: 'TIPO DE EVENTO',
            color: 'blue',
            tags: ['Congreso', 'Festival', 'Workshop', 'Social', 'Competencia']
          },
          ubicacion: {
            name: 'UBICACIÓN',
            color: 'green',
            tags: ['Madrid', 'Barcelona', 'Valencia', 'Sevilla', 'Bilbao']
          },
          duracion: {
            name: 'DURACIÓN',
            color: 'orange',
            tags: ['1 día', '2 días', '3 días', '1 semana', 'Fines de semana']
          },
          organizador: {
            name: 'ORGANIZADOR',
            color: 'purple',
            tags: ['SalsaHacks', 'Dance Studio', 'Eventos Salsa', 'Congresos Pro']
          }
        }
      }
    }
  }
}

export const useCategories = (page = 'figuras', style = 'salsa') => {
  const [selectedPage, setSelectedPage] = useState(page)
  const [selectedStyle, setSelectedStyle] = useState(style)

  // Obtener categorías para la página y estilo actual
  const currentCategories = useMemo(() => {
    const pageData = categoryStructure[selectedPage]
    if (!pageData) return null

    const styleData = pageData.styles[selectedStyle]
    if (!styleData) return null

    return styleData.categories
  }, [selectedPage, selectedStyle])

  // Obtener todos los tags disponibles para la página y estilo actual
  const availableTags = useMemo(() => {
    if (!currentCategories) return []

    const allTags = []
    Object.entries(currentCategories).forEach(([categoryKey, categoryData]) => {
      categoryData.tags.forEach(tag => {
        allTags.push({
          tag,
          category: categoryKey,
          categoryName: categoryData.name,
          color: categoryData.color
        })
      })
    })

    return allTags
  }, [currentCategories])

  // Obtener categorías organizadas
  const categoriesList = useMemo(() => {
    if (!currentCategories) return []

    return Object.entries(currentCategories).map(([key, data]) => ({
      key,
      name: data.name,
      color: data.color,
      tags: data.tags
    }))
  }, [currentCategories])

  // Obtener estilos disponibles para la página actual
  const availableStyles = useMemo(() => {
    const pageData = categoryStructure[selectedPage]
    if (!pageData) return []

    return Object.entries(pageData.styles).map(([key, data]) => ({
      key,
      name: data.name,
      color: data.color,
      icon: data.icon
    }))
  }, [selectedPage])

  // Obtener páginas disponibles
  const availablePages = useMemo(() => {
    return Object.entries(categoryStructure).map(([key, data]) => ({
      key,
      name: data.name,
      icon: data.icon
    }))
  }, [])

  // Función para obtener colores de categorías
  const getColorClasses = (color) => {
    const colorMap = {
             // Colores específicos de estilos de baile
       salsa: 'bg-orange-100 text-orange-800 border-orange-200',
       bachata: 'bg-emerald-100 text-emerald-800 border-emerald-200',
       merengue: 'bg-cyan-100 text-cyan-800 border-cyan-200',
       zouk: 'bg-violet-100 text-violet-800 border-violet-200',
      
      // Colores genéricos para categorías
      pink: 'bg-pink-100 text-pink-800 border-pink-200',
      red: 'bg-red-100 text-red-800 border-red-200',
      orange: 'bg-orange-100 text-orange-800 border-orange-200',
      yellow: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      green: 'bg-green-100 text-green-800 border-green-200',
      blue: 'bg-blue-100 text-blue-800 border-blue-200',
      purple: 'bg-purple-100 text-purple-800 border-purple-200'
    }
    return colorMap[color] || 'bg-gray-100 text-gray-800 border-gray-200'
  }

  // Función para obtener gradientes de categorías
  const getGradientClasses = (color) => {
    const gradientMap = {
             // Gradientes específicos de estilos de baile
       salsa: 'from-orange-400 to-pink-500',      // Naranja suave a rosa
       bachata: 'from-emerald-400 to-teal-600',   // Verde esmeralda suave a verde azulado intenso
       merengue: 'from-cyan-400 to-blue-600',     // Cian suave a azul intenso
       zouk: 'from-violet-400 to-indigo-600',     // Violeta suave a índigo intenso
      
      // Gradientes genéricos para categorías
      pink: 'from-pink-500 to-rose-500',
      red: 'from-red-500 to-pink-500',
      orange: 'from-orange-500 to-red-500',
      yellow: 'from-yellow-500 to-orange-500',
      green: 'from-green-500 to-emerald-500',
      blue: 'from-blue-500 to-cyan-500',
      purple: 'from-purple-500 to-pink-500'
    }
    return gradientMap[color] || 'from-gray-500 to-gray-600'
  }

  return {
    // Estado
    selectedPage,
    selectedStyle,
    setSelectedPage,
    setSelectedStyle,

    // Datos
    currentCategories,
    availableTags,
    categoriesList,
    availableStyles,
    availablePages,
    categoryStructure,

    // Utilidades
    getColorClasses,
    getGradientClasses
  }
} 