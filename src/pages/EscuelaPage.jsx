import { useState } from 'react'
import { 
  Search, 
  Upload, 
  Plus, 
  Video, 
  Heart, 
  Settings, 
  Music, 
  GraduationCap, 
  Calendar, 
  Home, 
  Bell, 
  Sun, 
  User,
  Zap,
  Star,
  BookOpen,
  Clock,
  Users
} from 'lucide-react'
import SmartThumbnail from '../components/common/SmartThumbnail'

const EscuelaPage = () => {
  const [selectedStyle, setSelectedStyle] = useState('SALSA')
  const [activeTab, setActiveTab] = useState('cursos')

  const styles = [
    { name: 'SALSA', icon: Music, hasNotification: true },
    { name: 'BACHATA', icon: Heart },
    { name: 'KIZOMBA', icon: Zap },
    { name: 'ZOUK', icon: Star },
    { name: 'MERENGUE', icon: Sun }
  ]

  const cursos = [
    {
      id: 1,
      title: 'Fundamentos de Salsa Cubana',
      description: 'Aprende los pasos básicos y la técnica fundamental',
      instructor: 'Carlos Rodríguez',
      duration: '8 semanas',
      students: 156,
      level: 'Principiante',
      thumbnail: 'https://via.placeholder.com/300x200/1a1a1a/ffffff?text=CURSO+SALSA+CUBANA',
      progress: 0,
      tags: ['Básico', 'Cubano', 'Fundamentos', 'Principiante']
    },
    {
      id: 2,
      title: 'Salsa Avanzada - Técnicas de Giro',
      description: 'Domina las técnicas de giro y combinaciones complejas',
      instructor: 'María González',
      duration: '6 semanas',
      students: 89,
      level: 'Avanzado',
      thumbnail: 'https://via.placeholder.com/300x200/1a1a1a/ffffff?text=TÉCNICAS+DE+GIRO',
      progress: 25,
      tags: ['Avanzado', 'Giros', 'Técnica', 'LA Style']
    }
  ]

  const tagColors = {
    'Básico': 'bg-green-500',
    'Cubano': 'bg-purple-500',
    'Fundamentos': 'bg-blue-500',
    'Principiante': 'bg-green-500',
    'Avanzado': 'bg-red-500',
    'Giros': 'bg-blue-500',
    'Técnica': 'bg-orange-500',
    'LA Style': 'bg-purple-500'
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-6 py-8">
        {/* Title */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-2">
            <span className="text-pink-500">ESCUELA</span>
            <span className="text-pink-600"> - SALSA</span>
          </h1>
          <p className="text-gray-600 text-lg">Cursos y tutoriales estructurados para aprender salsa</p>
        </div>

        {/* Style Filters */}
        <div className="flex flex-wrap justify-center gap-3 mb-8">
          {styles.map((style) => (
            <button
              key={style.name}
              onClick={() => setSelectedStyle(style.name)}
              className={`relative flex items-center space-x-2 px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
                selectedStyle === style.name
                  ? 'bg-gradient-to-r from-orange-500 to-pink-500 text-white shadow-lg transform scale-105'
                  : 'bg-white text-gray-700 border border-gray-200 hover:bg-gray-50 hover:border-gray-300'
              }`}
            >
              <style.icon className="h-4 w-4" />
              <span>{style.name}</span>
              {style.hasNotification && (
                <div className="absolute -top-1 -right-1 w-3 h-3 bg-pink-500 rounded-full animate-pulse"></div>
              )}
            </button>
          ))}
        </div>

        {/* Search Bar */}
        <div className="max-w-2xl mx-auto mb-8">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
            <input
              type="text"
              placeholder="Buscar cursos en salsa..."
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent transition-all duration-200"
            />
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
          <button className="flex items-center justify-center space-x-2 px-6 py-3 bg-gradient-to-r from-orange-500 to-pink-500 text-white rounded-lg font-medium shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105">
            <Upload className="h-5 w-5" />
            <span>CREAR NUEVO CURSO</span>
          </button>
          <button className="flex items-center justify-center space-x-2 px-6 py-3 bg-pink-500 text-white rounded-lg font-medium shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105">
            <Plus className="h-5 w-5" />
            <span>GESTIÓN DE INSTRUCTORES</span>
          </button>
        </div>

        {/* Gallery Tabs */}
        <div className="flex justify-center gap-4 mb-8">
          <button
            onClick={() => setActiveTab('cursos')}
            className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
              activeTab === 'cursos'
                ? 'bg-gradient-to-r from-orange-500 to-pink-500 text-white shadow-lg transform scale-105'
                : 'bg-white text-gray-700 border border-gray-200 hover:bg-gray-50'
            }`}
          >
            <BookOpen className="h-4 w-4" />
            <span>GALERÍA DE CURSOS (2)</span>
          </button>
          <button
            onClick={() => setActiveTab('tutoriales')}
            className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
              activeTab === 'tutoriales'
                ? 'bg-gradient-to-r from-orange-500 to-pink-500 text-white shadow-lg transform scale-105'
                : 'bg-white text-gray-700 border border-gray-200 hover:bg-gray-50'
            }`}
          >
            <Video className="h-4 w-4" />
            <span>GALERÍA DE TUTORIALES (0)</span>
          </button>
        </div>

        {/* Courses Grid */}
        <div className="mb-8">
          <h2 className="text-2xl font-semibold text-gray-800 mb-6">Cursos de salsa (2)</h2>
          <div className="grid md:grid-cols-2 gap-6">
            {cursos.map((curso) => (
              <div key={curso.id} className="bg-white rounded-lg shadow-md overflow-hidden border border-gray-100 hover:shadow-lg transition-all duration-200 transform hover:scale-[1.02]">
                <div className="relative">
                  <SmartThumbnail
                    src={curso.thumbnail}
                    alt={curso.title}
                  />
                  <div className="absolute top-2 right-2 bg-pink-500 text-white px-2 py-1 rounded text-sm font-medium">
                    {curso.level}
                  </div>
                </div>
                
                <div className="p-4">
                  <h3 className="font-semibold text-gray-800 mb-2 text-lg">{curso.title}</h3>
                  <p className="text-gray-600 text-sm mb-3">{curso.description}</p>
                  
                  <div className="flex flex-wrap gap-2 mb-4">
                    {curso.tags.map((tag) => (
                      <span
                        key={tag}
                        className={`px-3 py-1 text-white text-xs rounded-full font-medium ${tagColors[tag] || 'bg-gray-500'}`}
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                  
                  <div className="flex items-center justify-between text-sm text-gray-500 mb-3">
                    <span className="flex items-center space-x-1">
                      <Users className="h-4 w-4" />
                      <span className="font-medium">{curso.students} estudiantes</span>
                    </span>
                    <span className="flex items-center space-x-1">
                      <Clock className="h-4 w-4" />
                      <span className="font-medium">{curso.duration}</span>
                    </span>
                  </div>
                  
                  <div className="flex items-center justify-between text-sm text-gray-500 mb-3">
                    <span className="font-medium">Instructor: {curso.instructor}</span>
                  </div>
                  
                  {curso.progress > 0 && (
                    <div className="mb-3">
                      <div className="flex justify-between text-sm text-gray-600 mb-1">
                        <span>Progreso</span>
                        <span>{curso.progress}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-pink-500 h-2 rounded-full transition-all duration-300"
                          style={{ width: `${curso.progress}%` }}
                        ></div>
                      </div>
                    </div>
                  )}
                  
                  <button className="w-full bg-pink-500 text-white py-2 px-4 rounded-lg font-medium hover:bg-pink-600 transition-colors duration-200">
                    {curso.progress > 0 ? 'Continuar Curso' : 'Empezar Curso'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

export default EscuelaPage 