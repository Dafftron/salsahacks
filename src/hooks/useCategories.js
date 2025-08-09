// 🎯 HOOK PARA GESTIÓN DE CATEGORÍAS - SALSAHACKS V2.0

import { useState, useMemo, useEffect } from 'react'

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
        color: 'kizomba',
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
            color: 'green',
            tags: ['Competición', 'Encuentro', 'Congreso', 'Workshop', 'Fiesta']
          },
          ubicacion: {
            name: 'UBICACIÓN',
            color: 'blue',
            tags: ['Madrid', 'Barcelona', 'Valencia', 'Sevilla', 'Bilbao']
          },
          nivel: {
            name: 'NIVEL',
            color: 'orange',
            tags: ['Todos los niveles', 'Intermedio-Avanzado', 'Solo avanzado']
          },
          fecha: {
            name: 'FECHA',
            color: 'purple',
            tags: ['Este mes', 'Próximo mes', 'Este trimestre', 'Este año']
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
          color: 'salsa',
          categories: {
            estilo: {
              name: 'ESTILO',
              color: 'purple',
              tags: ['Salsa', 'Salsa en línea On1', 'Salsa cubana', 'Estilo LA', 'Estilo NY', 'Estilo show']
            },
            subestilo: {
              name: 'SUBESTILO/TÉCNICA',
              color: 'pink',
              tags: ['Pasitos libres', 'Parejas', 'Footwork On1', 'Footwork On2', 'Shines', 'Fusionado con afro', 'Body movement']
            },
            nivel: {
              name: 'NIVEL',
              color: 'green',
              tags: ['Principiante', 'Intermedio', 'Avanzado', 'Experto', 'Todos los niveles']
            },
            modalidad: {
              name: 'MODALIDAD',
              color: 'blue',
              tags: ['Curso completo', 'Tutorial', 'Masterclass', 'Workshop', 'Clase grupal', 'Clase individual']
            }
          }
        },
        'pasitos-libres': {
          name: 'PASITOS LIBRES',
          icon: 'Star',
          color: 'yellow',
          categories: {
            estilo: {
              name: 'ESTILO',
              color: 'yellow',
              tags: ['Pasitos libres', 'Freestyle', 'Shines', 'Footwork', 'Solo dancing']
            },
            nivel: {
              name: 'NIVEL',
              color: 'green',
              tags: ['Principiante', 'Intermedio', 'Avanzado', 'Experto']
            },
            técnica: {
              name: 'TÉCNICA',
              color: 'orange',
              tags: ['Pasos básicos', 'Combinaciones', 'Transiciones', 'Body movement', 'Ritmo', 'Timing']
            }
          }
        },
        'salsa-cubana': {
          name: 'SALSA CUBANA',
          icon: 'Music',
          color: 'red',
          categories: {
            estilo: {
              name: 'ESTILO',
              color: 'red',
              tags: ['Salsa cubana', 'Casino', 'Rueda de casino', 'Son', 'Mambo']
            },
            nivel: {
              name: 'NIVEL',
              color: 'green',
              tags: ['Principiante', 'Intermedio', 'Avanzado', 'Experto']
            },
            tipo: {
              name: 'TIPO DE FIGURA',
              color: 'purple',
              tags: ['Dile que no', 'Guapea', 'Enchufla', 'Vacunala', 'Setenta', 'Ochenta', 'Prima']
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
              tags: ['Bachata tradicional', 'Bachata moderna', 'Bachata sensual', 'Bachata dominicana', 'Bachata urbana']
            },
            nivel: {
              name: 'NIVEL',
              color: 'green',
              tags: ['Principiante', 'Intermedio', 'Avanzado', 'Experto']
            },
            técnica: {
              name: 'TÉCNICA',
              color: 'pink',
              tags: ['Paso básico', 'Giros', 'Dips', 'Body waves', 'Isolaciones', 'Footwork']
            }
          }
        },
        kizomba: {
          name: 'KIZOMBA',
          icon: 'Zap',
          color: 'kizomba',
          categories: {
            estilo: {
              name: 'ESTILO',
              color: 'yellow',
              tags: ['Kizomba tradicional', 'Urban kiz', 'Kizomba fusion', 'Tarraxinha', 'Ghetto zouk']
            },
            nivel: {
              name: 'NIVEL',
              color: 'green',
              tags: ['Principiante', 'Intermedio', 'Avanzado', 'Experto']
            },
            técnica: {
              name: 'TÉCNICA',
              color: 'orange',
              tags: ['Abrazo', 'Conexión', 'Ginga', 'Saídas', 'Passadas', 'Caminhada']
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
              tags: ['Zouk brasileño', 'Lambazouk', 'Neo zouk', 'Zouk flow', 'Soulzouk']
            },
            nivel: {
              name: 'NIVEL',
              color: 'green',
              tags: ['Principiante', 'Intermedio', 'Avanzado', 'Experto']
            },
            técnica: {
              name: 'TÉCNICA',
              color: 'blue',
              tags: ['Elastico', 'Cambre', 'Head movement', 'Body roll', 'Fluidez', 'Conexión']
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
              tags: ['Merengue dominicano', 'Merengue venezolano', 'Merengue mambo', 'Merengue típico']
            },
            nivel: {
              name: 'NIVEL',
              color: 'green',
              tags: ['Principiante', 'Intermedio', 'Avanzado', 'Experto']
            },
            técnica: {
              name: 'TÉCNICA',
              color: 'yellow',
              tags: ['Paso básico', 'Marcha', 'Giros', 'Vueltas', 'Figuras clásicas']
            }
          }
        }
      }
    }
  }
}

export const useCategories = (page = 'figuras', style = 'salsa') => {
  const [selectedPage, setSelectedPage] = useState(page)
  const [selectedStyle, setSelectedStyle] = useState(style)

  // Actualizar el estilo cuando cambie el parámetro
  useEffect(() => {
    setSelectedStyle(style)
  }, [style])

  // Actualizar la página cuando cambie el parámetro
  useEffect(() => {
    setSelectedPage(page)
  }, [page])

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
    // Crear clave específica para page-style
    const specificKey = `${selectedPage}-${color}`
    
    const colorMap = {
      // Colores específicos por página y estilo
      'escuela-salsa': 'bg-purple-100 text-purple-800 border-purple-200',  // Morado SOLO para escuela
      'figuras-salsa': 'bg-orange-100 text-orange-800 border-orange-200',  // Naranja para figuras (original)
      'eventos-salsa': 'bg-orange-100 text-orange-800 border-orange-200',  // Naranja para eventos (original)
      
      // Colores específicos de estilos de baile (genéricos)
      salsa: 'bg-orange-100 text-orange-800 border-orange-200',  // Naranja (original)
      bachata: 'bg-emerald-100 text-emerald-800 border-emerald-200',
      merengue: 'bg-cyan-100 text-cyan-800 border-cyan-200',
      zouk: 'bg-violet-100 text-violet-800 border-violet-200',
      kizomba: 'bg-amber-100 text-amber-800 border-amber-200',
     
     // Colores genéricos para categorías
     pink: 'bg-pink-100 text-pink-800 border-pink-200',
     red: 'bg-red-100 text-red-800 border-red-200',
     orange: 'bg-orange-100 text-orange-800 border-orange-200',
     yellow: 'bg-yellow-100 text-yellow-800 border-yellow-200',
     green: 'bg-green-100 text-green-800 border-green-200',
     blue: 'bg-blue-100 text-blue-800 border-blue-200',
     purple: 'bg-purple-100 text-purple-800 border-purple-200'
   }
   
   // Primero intentar la clave específica, luego la genérica
   return colorMap[specificKey] || colorMap[color] || 'bg-gray-100 text-gray-800 border-gray-200'
 }

    // Función para obtener gradientes de categorías
  const getGradientClasses = (color) => {
    // Crear clave específica para page-style
    const specificKey = `${selectedPage}-${color}`
    
    const gradientMap = {
      // Gradientes específicos por página y estilo
      'escuela-salsa': 'from-purple-500 to-pink-500',  // Morado a rosa SOLO para escuela
      'figuras-salsa': 'from-orange-400 to-pink-500',  // Colores originales para figuras
      'eventos-salsa': 'from-orange-400 to-pink-500',  // Colores originales para eventos
      
      // Gradientes específicos de estilos de baile (genéricos)
      salsa: 'from-orange-400 to-pink-500',      // Naranja suave a rosa (original)
      bachata: 'from-emerald-400 to-teal-600',   // Verde esmeralda suave a verde azulado intenso
      merengue: 'from-cyan-400 to-blue-600',     // Cian suave a azul intenso
      zouk: 'from-violet-400 to-indigo-600',     // Violeta suave a índigo intenso
      kizomba: 'from-amber-400 to-orange-600',   // Ámbar suave a naranja intenso
     
     // Gradientes genéricos para categorías
     pink: 'from-pink-500 to-rose-500',
     red: 'from-red-500 to-pink-500',
     orange: 'from-orange-500 to-red-500',
     yellow: 'from-yellow-500 to-orange-500',
     green: 'from-green-500 to-emerald-500',
     blue: 'from-blue-500 to-cyan-500',
     purple: 'from-purple-500 to-pink-500'
   }
   
   // Primero intentar la clave específica, luego la genérica
   return gradientMap[specificKey] || gradientMap[color] || 'from-gray-500 to-gray-600'
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