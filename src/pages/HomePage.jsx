import { Link } from 'react-router-dom'
import { Music, Video, BookOpen, Calendar, Tag, FileText } from 'lucide-react'
import FirebaseTest from '../components/FirebaseTest'

const HomePage = () => {
  const features = [
    {
      icon: <Video className="h-8 w-8" />,
      title: 'Figuras',
      description: 'Galería de videos de figuras de salsa con filtros avanzados',
      path: '/figuras',
      color: 'text-blue-600'
    },
    {
      icon: <BookOpen className="h-8 w-8" />,
      title: 'Escuela',
      description: 'Cursos y tutoriales estructurados para aprender salsa',
      path: '/escuela',
      color: 'text-green-600'
    },
    {
      icon: <Calendar className="h-8 w-8" />,
      title: 'Eventos',
      description: 'Calendario de eventos, talleres y fiestas de salsa',
      path: '/eventos',
      color: 'text-purple-600'
    },
    {
      icon: <Tag className="h-8 w-8" />,
      title: 'Categorías',
      description: 'Centro de control de categorías y etiquetas',
      path: '/categorias',
      color: 'text-orange-600'
    },
    {
      icon: <FileText className="h-8 w-8" />,
      title: 'Notas',
      description: 'Seguimiento de commits y control de hitos',
      path: '/notas',
      color: 'text-red-600'
    }
  ]

  return (
    <div className="max-w-6xl mx-auto">
      {/* Hero Section */}
      <div className="text-center mb-16">
        <div className="flex justify-center mb-6">
          <Music className="h-20 w-20 text-salsa-primary" />
        </div>
        <h1 className="text-5xl font-bold text-salsa-primary mb-4">
          ¡Bienvenido a SalsaHacks!
        </h1>
        <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
          La plataforma definitiva para aprender, practicar y compartir el arte del baile de salsa.
          Descubre figuras, mejora tu técnica y conecta con la comunidad.
        </p>
        <div className="flex justify-center space-x-4">
          <Link to="/figuras" className="btn-primary">
            Explorar Figuras
          </Link>
          <Link to="/escuela" className="btn-secondary">
            Empezar a Aprender
          </Link>
        </div>
      </div>

      {/* Features Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
        {features.map((feature) => (
          <Link
            key={feature.path}
            to={feature.path}
            className="card p-6 hover:scale-105 transition-transform duration-300"
          >
            <div className={`${feature.color} mb-4`}>
              {feature.icon}
            </div>
            <h3 className="text-xl font-semibold text-gray-800 mb-2">
              {feature.title}
            </h3>
            <p className="text-gray-600">
              {feature.description}
            </p>
          </Link>
        ))}
      </div>

      {/* Stats Section */}
      <div className="bg-salsa-light rounded-2xl p-8 mb-16">
        <h2 className="text-3xl font-bold text-salsa-primary mb-8 text-center">
          Estadísticas de la Plataforma
        </h2>
        <div className="grid md:grid-cols-4 gap-8 text-center">
          <div>
            <div className="text-3xl font-bold text-salsa-primary mb-2">150+</div>
            <div className="text-gray-600">Videos de Figuras</div>
          </div>
          <div>
            <div className="text-3xl font-bold text-salsa-primary mb-2">25+</div>
            <div className="text-gray-600">Cursos Disponibles</div>
          </div>
          <div>
            <div className="text-3xl font-bold text-salsa-primary mb-2">50+</div>
            <div className="text-gray-600">Eventos Próximos</div>
          </div>
          <div>
            <div className="text-3xl font-bold text-salsa-primary mb-2">1000+</div>
            <div className="text-gray-600">Usuarios Activos</div>
          </div>
        </div>
      </div>

      {/* Firebase Test Section */}
      <div className="mb-16">
        <FirebaseTest />
      </div>

      {/* Quick Actions */}
      <div className="text-center">
        <h2 className="text-3xl font-bold text-gray-800 mb-8">
          Acciones Rápidas
        </h2>
        <div className="flex flex-wrap justify-center gap-4">
          <button className="btn-accent">
            Subir Video
          </button>
          <button className="btn-primary">
            Crear Secuencia
          </button>
          <button className="btn-secondary">
            Ver Favoritos
          </button>
        </div>
      </div>
    </div>
  )
}

export default HomePage 