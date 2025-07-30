import { useState } from 'react'
import { Plus, Tag, Edit, Trash2, Eye } from 'lucide-react'

const CategoriesPage = () => {
  const [activeTab, setActiveTab] = useState('categories')

  const categories = [
    {
      id: 1,
      name: 'Nivel',
      color: '#28A745',
      tags: ['Básico', 'Intermedio', 'Avanzado', 'Experto'],
      count: 4
    },
    {
      id: 2,
      name: 'Tipo de Figura',
      color: '#007BFF',
      tags: ['Derecha', 'Izquierda', 'Giro', 'Secuencia', 'Combinación'],
      count: 5
    },
    {
      id: 3,
      name: 'Técnica',
      color: '#FFC107',
      tags: ['Ritmo', 'Timing', 'Leading', 'Following', 'Postura'],
      count: 5
    },
    {
      id: 4,
      name: 'Estilo',
      color: '#6F42C1',
      tags: ['Cubano', 'LA Style', 'NY Style', 'Puertorriqueño'],
      count: 4
    }
  ]

  const styles = [
    { id: 1, name: 'Salsa', color: '#FF6B35', active: true },
    { id: 2, name: 'Bachata', color: '#E91E63', active: false },
    { id: 3, name: 'Kizomba', color: '#9C27B0', active: false },
    { id: 4, name: 'Zouk', color: '#3F51B5', active: false },
    { id: 5, name: 'Merengue', color: '#4CAF50', active: false }
  ]

  return (
    <div className="max-w-6xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-salsa-primary mb-2">Centro de Control de Categorías</h1>
        <p className="text-gray-600">Gestiona categorías, etiquetas y estilos de baile</p>
      </div>

      {/* Tabs */}
      <div className="flex space-x-1 mb-6 bg-gray-100 p-1 rounded-lg">
        <button
          onClick={() => setActiveTab('categories')}
          className={`flex items-center space-x-2 px-4 py-2 rounded-md transition-colors ${
            activeTab === 'categories'
              ? 'bg-white text-salsa-primary shadow-sm'
              : 'text-gray-600 hover:text-salsa-primary'
          }`}
        >
          <Tag className="h-4 w-4" />
          <span>Categorías</span>
        </button>
        <button
          onClick={() => setActiveTab('styles')}
          className={`flex items-center space-x-2 px-4 py-2 rounded-md transition-colors ${
            activeTab === 'styles'
              ? 'bg-white text-salsa-primary shadow-sm'
              : 'text-gray-600 hover:text-salsa-primary'
          }`}
        >
          <Tag className="h-4 w-4" />
          <span>Estilos</span>
        </button>
      </div>

      {/* Content */}
      {activeTab === 'categories' && (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-semibold text-gray-800">Categorías y Etiquetas</h2>
            <button className="btn-primary flex items-center space-x-2">
              <Plus className="h-4 w-4" />
              <span>Nueva Categoría</span>
            </button>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {categories.map((category) => (
              <div key={category.id} className="card p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <div
                      className="w-4 h-4 rounded-full"
                      style={{ backgroundColor: category.color }}
                    ></div>
                    <h3 className="text-lg font-semibold text-gray-800">{category.name}</h3>
                    <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">
                      {category.count} tags
                    </span>
                  </div>
                  <div className="flex space-x-2">
                    <button className="p-1 text-gray-400 hover:text-salsa-primary">
                      <Eye className="h-4 w-4" />
                    </button>
                    <button className="p-1 text-gray-400 hover:text-salsa-primary">
                      <Edit className="h-4 w-4" />
                    </button>
                    <button className="p-1 text-gray-400 hover:text-red-500">
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>

                <div className="flex flex-wrap gap-2">
                  {category.tags.map((tag) => (
                    <span
                      key={tag}
                      className="px-3 py-1 rounded-full text-sm"
                      style={{
                        backgroundColor: `${category.color}20`,
                        color: category.color,
                        border: `1px solid ${category.color}40`
                      }}
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'styles' && (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-semibold text-gray-800">Estilos de Baile</h2>
            <button className="btn-primary flex items-center space-x-2">
              <Plus className="h-4 w-4" />
              <span>Nuevo Estilo</span>
            </button>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {styles.map((style) => (
              <div key={style.id} className="card p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <div
                      className="w-4 h-4 rounded-full"
                      style={{ backgroundColor: style.color }}
                    ></div>
                    <h3 className="text-lg font-semibold text-gray-800">{style.name}</h3>
                  </div>
                  <div className="flex space-x-2">
                    <button className="p-1 text-gray-400 hover:text-salsa-primary">
                      <Edit className="h-4 w-4" />
                    </button>
                    <button className="p-1 text-gray-400 hover:text-red-500">
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                    style.active 
                      ? 'bg-green-100 text-green-600' 
                      : 'bg-gray-100 text-gray-600'
                  }`}>
                    {style.active ? 'Activo' : 'Inactivo'}
                  </span>
                  <button className="text-sm text-salsa-primary hover:underline">
                    Ver contenido
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

export default CategoriesPage 