import { useState } from 'react'
import { Search, Upload, Plus, Filter, Video, Heart, Star } from 'lucide-react'

const FigurasPage = () => {
  const [selectedStyle, setSelectedStyle] = useState('SALSA')

  const styles = ['SALSA', 'BACHATA', 'KIZOMBA', 'ZOUK', 'MERENGUE']

  const videos = [
    {
      id: 1,
      title: 'Giro Básico de Salsa',
      description: 'Aprende el giro básico paso a paso',
      thumbnail: 'https://via.placeholder.com/300x200',
      views: 1250,
      likes: 89,
      rating: 4.5,
      tags: ['Básico', 'Giro', 'Ritmo', 'Cubano'],
      duration: '3:45'
    },
    {
      id: 2,
      title: 'Secuencia Avanzada',
      description: 'Combinación compleja para bailarines experimentados',
      thumbnail: 'https://via.placeholder.com/300x200',
      views: 890,
      likes: 67,
      rating: 4.8,
      tags: ['Avanzado', 'Secuencia', 'Timing', 'LA Style'],
      duration: '5:20'
    }
  ]

  return (
    <div className="max-w-6xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-salsa-primary mb-2">FIGURAS - SALSA</h1>
        <p className="text-gray-600">Galería de videos de figuras de salsa</p>
      </div>

      {/* Style Selector */}
      <div className="mb-6">
        <div className="flex flex-wrap gap-2">
          {styles.map((style) => (
            <button
              key={style}
              onClick={() => setSelectedStyle(style)}
              className={`px-4 py-2 rounded-lg font-medium transition-all ${
                selectedStyle === style
                  ? 'salsa-gradient-primary text-white shadow-lg'
                  : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-200'
              }`}
            >
              {style}
            </button>
          ))}
        </div>
      </div>

      {/* Search and Filters */}
      <div className="mb-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
            <input
              type="text"
              placeholder="Buscar videos en salsa..."
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-salsa-primary focus:border-transparent"
            />
          </div>
          <button className="btn-primary flex items-center space-x-2">
            <Filter className="h-4 w-4" />
            <span>Filtros</span>
          </button>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="mb-8">
        <div className="flex flex-col sm:flex-row gap-4">
          <button className="btn-primary flex items-center justify-center space-x-2">
            <Upload className="h-5 w-5" />
            <span>SUBIR VIDEO A SALSA</span>
          </button>
          <button className="btn-secondary flex items-center justify-center space-x-2">
            <Plus className="h-5 w-5" />
            <span>CONSTRUCTOR DE SECUENCIAS</span>
          </button>
        </div>
        
        <div className="flex gap-4 mt-4">
          <button className="px-4 py-2 bg-orange-500 text-white rounded-lg font-medium">
            GALERÍA DE VIDEOS (2)
          </button>
          <button className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg font-medium">
            GALERÍA DE SECUENCIAS (0)
          </button>
        </div>
      </div>

      {/* Videos Grid */}
      <div className="mb-8">
        <h2 className="text-2xl font-semibold text-gray-800 mb-4">Videos de salsa (2)</h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {videos.map((video) => (
            <div key={video.id} className="card overflow-hidden">
              <div className="relative">
                <img
                  src={video.thumbnail}
                  alt={video.title}
                  className="w-full h-48 object-cover"
                />
                <div className="absolute top-2 right-2 bg-black bg-opacity-75 text-white px-2 py-1 rounded text-sm">
                  {video.duration}
                </div>
                <button className="absolute top-2 left-2 p-2 bg-white bg-opacity-90 rounded-full hover:bg-opacity-100">
                  <Heart className="h-4 w-4 text-gray-600" />
                </button>
              </div>
              
              <div className="p-4">
                <h3 className="font-semibold text-gray-800 mb-2">{video.title}</h3>
                <p className="text-gray-600 text-sm mb-3">{video.description}</p>
                
                <div className="flex flex-wrap gap-1 mb-3">
                  {video.tags.map((tag) => (
                    <span
                      key={tag}
                      className="px-2 py-1 bg-salsa-light text-salsa-dark text-xs rounded"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
                
                <div className="flex items-center justify-between text-sm text-gray-500">
                  <div className="flex items-center space-x-4">
                    <span className="flex items-center space-x-1">
                      <Video className="h-4 w-4" />
                      <span>{video.views}</span>
                    </span>
                    <span className="flex items-center space-x-1">
                      <Heart className="h-4 w-4" />
                      <span>{video.likes}</span>
                    </span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Star className="h-4 w-4 text-yellow-500" />
                    <span>{video.rating}</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default FigurasPage 