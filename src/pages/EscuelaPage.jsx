import { useState } from 'react'
import { BookOpen, Play, Clock, Users, Star } from 'lucide-react'

const EscuelaPage = () => {
  const [selectedStyle, setSelectedStyle] = useState('SALSA')

  const styles = ['SALSA', 'BACHATA', 'KIZOMBA', 'ZOUK', 'MERENGUE']

  const courses = [
    {
      id: 1,
      title: 'Fundamentos de Salsa Cubana',
      description: 'Aprende los pasos básicos y la técnica fundamental',
      instructor: 'Carlos Rodríguez',
      duration: '8 semanas',
      students: 156,
      rating: 4.7,
      level: 'Principiante',
      thumbnail: 'https://via.placeholder.com/300x200',
      progress: 0
    },
    {
      id: 2,
      title: 'Salsa Avanzada - Técnicas de Giro',
      description: 'Domina las técnicas de giro y combinaciones complejas',
      instructor: 'María González',
      duration: '6 semanas',
      students: 89,
      rating: 4.9,
      level: 'Avanzado',
      thumbnail: 'https://via.placeholder.com/300x200',
      progress: 25
    }
  ]

  return (
    <div className="max-w-6xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-salsa-primary mb-2">ESCUELA - SALSA</h1>
        <p className="text-gray-600">Cursos y tutoriales estructurados para aprender salsa</p>
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

      {/* Courses Grid */}
      <div className="mb-8">
        <h2 className="text-2xl font-semibold text-gray-800 mb-6">Cursos Disponibles</h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {courses.map((course) => (
            <div key={course.id} className="card overflow-hidden">
              <div className="relative">
                <img
                  src={course.thumbnail}
                  alt={course.title}
                  className="w-full h-48 object-cover"
                />
                <div className="absolute top-2 right-2 bg-salsa-primary text-white px-2 py-1 rounded text-sm font-medium">
                  {course.level}
                </div>
                <button className="absolute top-2 left-2 p-2 bg-white bg-opacity-90 rounded-full hover:bg-opacity-100">
                  <Play className="h-4 w-4 text-salsa-primary" />
                </button>
              </div>
              
              <div className="p-4">
                <h3 className="font-semibold text-gray-800 mb-2">{course.title}</h3>
                <p className="text-gray-600 text-sm mb-3">{course.description}</p>
                
                <div className="flex items-center justify-between text-sm text-gray-500 mb-3">
                  <span className="flex items-center space-x-1">
                    <Users className="h-4 w-4" />
                    <span>{course.students} estudiantes</span>
                  </span>
                  <span className="flex items-center space-x-1">
                    <Clock className="h-4 w-4" />
                    <span>{course.duration}</span>
                  </span>
                </div>
                
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm text-gray-600">Instructor: {course.instructor}</span>
                  <div className="flex items-center space-x-1">
                    <Star className="h-4 w-4 text-yellow-500" />
                    <span className="text-sm font-medium">{course.rating}</span>
                  </div>
                </div>
                
                {course.progress > 0 && (
                  <div className="mb-3">
                    <div className="flex justify-between text-sm text-gray-600 mb-1">
                      <span>Progreso</span>
                      <span>{course.progress}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-salsa-primary h-2 rounded-full transition-all duration-300"
                        style={{ width: `${course.progress}%` }}
                      ></div>
                    </div>
                  </div>
                )}
                
                <button className="w-full btn-primary">
                  {course.progress > 0 ? 'Continuar Curso' : 'Empezar Curso'}
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default EscuelaPage 