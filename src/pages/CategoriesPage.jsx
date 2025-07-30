import { useState } from 'react'
import { 
  Plus, 
  Tag, 
  Edit, 
  Trash2, 
  Eye, 
  Music, 
  Heart, 
  Zap, 
  Star, 
  Sun,
  GraduationCap,
  Calendar,
  Lock,
  Settings
} from 'lucide-react'

const CategoriesPage = () => {
  const [selectedPage, setSelectedPage] = useState('figuras')
  const [selectedStyle, setSelectedStyle] = useState('salsa')
  const [isAdmin, setIsAdmin] = useState(true) // TODO: Conectar con sistema de autenticación

  // Estructura jerárquica de categorías por pestaña y estilo
  const categoryStructure = {
    figuras: {
      name: 'FIGURAS',
      icon: Music,
      styles: {
        salsa: {
          name: 'SALSA',
          icon: Music,
          color: 'pink',
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
          color: 'red',
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
          icon: Star,
          color: 'purple',
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
          color: 'orange',
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
      icon: Calendar,
      styles: {
        salsa: {
          name: 'SALSA',
          icon: Music,
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
    }
  }

  const getColorClasses = (color) => {
    const colorMap = {
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

  const getGradientClasses = (color) => {
    const gradientMap = {
      pink: 'bg-gradient-to-r from-orange-500 to-pink-500',
      red: 'bg-gradient-to-r from-red-500 to-pink-500',
      yellow: 'bg-gradient-to-r from-yellow-500 to-orange-500',
      purple: 'bg-gradient-to-r from-purple-500 to-pink-500',
      orange: 'bg-gradient-to-r from-orange-500 to-yellow-500'
    }
    return gradientMap[color] || 'bg-gradient-to-r from-gray-500 to-gray-600'
  }

  const currentPage = categoryStructure[selectedPage]
  const currentStyle = currentPage?.styles[selectedStyle]

  return (
    <div className="max-w-7xl mx-auto px-6 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-pink-500 mb-2">Gestión de Categorías y Tags</h1>
        <p className="text-gray-600">Gestiona categorías, etiquetas y estilos de baile</p>
      </div>

      {/* Pestañas Principales */}
      <div className="flex flex-wrap justify-center gap-3 mb-8">
        {Object.entries(categoryStructure).map(([key, page]) => (
          <button
            key={key}
            onClick={() => {
              setSelectedPage(key)
              // Reset al primer estilo disponible
              const firstStyle = Object.keys(page.styles)[0]
              setSelectedStyle(firstStyle)
            }}
            className={`relative flex items-center space-x-2 px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
              selectedPage === key
                ? 'bg-gradient-to-r from-orange-500 to-pink-500 text-white shadow-lg transform scale-105'
                : 'bg-white text-gray-700 border border-gray-200 hover:bg-gray-50 hover:border-gray-300'
            }`}
          >
            <page.icon className="h-4 w-4" />
            <span>{page.name}</span>
          </button>
        ))}
      </div>

      {/* Estilos */}
      {currentPage && (
        <div className="flex flex-wrap justify-center gap-3 mb-8">
          {Object.entries(currentPage.styles).map(([key, style]) => (
            <button
              key={key}
              onClick={() => setSelectedStyle(key)}
              className={`relative flex items-center space-x-2 px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
                selectedStyle === key
                  ? `${getGradientClasses(style.color)} text-white shadow-lg transform scale-105`
                  : 'bg-white text-gray-700 border border-gray-200 hover:bg-gray-50 hover:border-gray-300'
              }`}
            >
              <style.icon className="h-4 w-4" />
              <span>{style.name}</span>
            </button>
          ))}
        </div>
      )}

      {/* Categorías y Tags */}
      {currentStyle && (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-semibold text-gray-800">
              Categorías de {currentStyle.name} en {currentPage.name}
            </h2>
            {isAdmin && (
              <button className="flex items-center space-x-2 px-4 py-2 bg-green-500 text-white rounded-lg font-medium shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105">
                <Plus className="h-4 w-4" />
                <span>+ NUEVA CATEGORÍA</span>
              </button>
            )}
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {Object.entries(currentStyle.categories).map(([key, category]) => (
              <div key={key} className="bg-white rounded-lg shadow-md overflow-hidden border border-gray-100 hover:shadow-lg transition-all duration-200">
                <div className="p-6">
                  {/* Header de categoría */}
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      <div className={`w-4 h-4 rounded-full ${getColorClasses(category.color)}`}></div>
                      <h3 className="text-lg font-semibold text-gray-800">{category.name}</h3>
                      <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full font-medium">
                        {category.tags.length} tags
                      </span>
                    </div>
                    <div className="flex space-x-2">
                      <button className="p-1 text-gray-400 hover:text-blue-500 transition-colors">
                        <Eye className="h-4 w-4" />
                      </button>
                      {isAdmin && (
                        <>
                          <button className="p-1 text-gray-400 hover:text-orange-500 transition-colors">
                            <Edit className="h-4 w-4" />
                          </button>
                          <button className="p-1 text-gray-400 hover:text-red-500 transition-colors">
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Tags */}
                  <div className="flex flex-wrap gap-2">
                    {category.tags.map((tag, index) => (
                      <div
                        key={index}
                        className={`relative flex items-center space-x-1 px-3 py-1 rounded-full text-sm font-medium ${getColorClasses(category.color)}`}
                      >
                        {/* Icono de candado para tags hardcodeados */}
                        {index < 3 && (
                          <Lock className="h-3 w-3" />
                        )}
                        <span>{tag}</span>
                        {isAdmin && index >= 3 && (
                          <button className="ml-1 hover:bg-white hover:bg-opacity-20 rounded-full p-0.5 transition-colors">
                            <Trash2 className="h-3 w-3" />
                          </button>
                        )}
                      </div>
                    ))}
                  </div>

                  {/* Botón para agregar tag (solo admin) */}
                  {isAdmin && (
                    <div className="mt-4 pt-4 border-t border-gray-100">
                      <button className="flex items-center space-x-2 text-sm text-gray-500 hover:text-green-500 transition-colors">
                        <Plus className="h-3 w-3" />
                        <span>Agregar tag</span>
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Mensaje cuando no hay estilos */}
      {!currentPage && (
        <div className="text-center py-12">
          <Settings className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-600 mb-2">No hay estilos configurados</h3>
          <p className="text-gray-500">Selecciona una pestaña para ver los estilos disponibles</p>
        </div>
      )}
    </div>
  )
}

export default CategoriesPage 