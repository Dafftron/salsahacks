import { useMemo } from 'react'
import { 
  Music, 
  Heart, 
  Zap, 
  Star, 
  Sun,
  GraduationCap,
  Calendar
} from 'lucide-react'

export const useCategories = (page, selectedStyle) => {
  // Estructura jerárquica de categorías por pestaña y estilo
  const categoryStructure = {
    figuras: {
      name: 'FIGURAS',
      icon: Music,
      styles: {
        salsa: {
          name: 'SALSA',
          icon: Music,
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
          icon: Heart,
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
          icon: Zap,
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
          icon: Star,
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
          icon: Sun,
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
      icon: GraduationCap,
      styles: {
        salsa: {
          name: 'SALSA',
          icon: Music,
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
          icon: Star,
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
          icon: Music,
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
          icon: Heart,
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
          icon: Zap,
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
          icon: Star,
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
          icon: Sun,
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
    },
    eventos: {
      name: 'EVENTOS',
      icon: Calendar,
      styles: {
        salsa: {
          name: 'SALSA',
          icon: Music,
          color: 'salsa',
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
    }
  }

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
      blue: 'bg-blue-500 text-white'
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
      
      // Gradientes específicos para escuela (morado a rosa)
      'escuela-salsa': 'from-purple-400 to-pink-500',
      'escuela-pasitos-libres': 'from-purple-400 to-pink-500',
      'escuela-salsa-cubana': 'from-purple-400 to-pink-500',
      'escuela-bachata': 'from-purple-400 to-pink-500',
      'escuela-kizomba': 'from-purple-400 to-pink-500',
      'escuela-zouk': 'from-purple-400 to-pink-500',
      'escuela-merengue': 'from-purple-400 to-pink-500',
      
      // Gradientes para eventos
      'eventos-salsa': 'from-green-400 to-blue-500',
      
      // Fallback por color genérico
      salsa: 'from-orange-400 to-pink-500',
      bachata: 'from-emerald-400 to-teal-600',
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
    getColorClasses,
    getGradientClasses: (styleColorOrKey) => getGradientClasses(styleColorOrKey || selectedStyle),
    currentPage,
    currentStyle
  }
}
