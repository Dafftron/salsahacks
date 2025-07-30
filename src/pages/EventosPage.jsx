import { useState } from 'react'
import { Calendar, MapPin, Clock, Users, Plus } from 'lucide-react'

const EventosPage = () => {
  const [selectedStyle, setSelectedStyle] = useState('SALSA')

  const styles = ['SALSA', 'BACHATA', 'KIZOMBA', 'ZOUK', 'MERENGUE']

  const events = [
    {
      id: 1,
      title: 'Festival de Salsa Cubana',
      description: 'El evento más grande de salsa cubana en Madrid',
      date: '2025-02-15',
      time: '20:00',
      location: 'Sala Caracol, Madrid',
      attendees: 150,
      maxAttendees: 200,
      price: '25€',
      type: 'Festival',
      thumbnail: 'https://via.placeholder.com/300x200'
    },
    {
      id: 2,
      title: 'Taller de Técnica Avanzada',
      description: 'Mejora tu técnica con los mejores instructores',
      date: '2025-02-20',
      time: '18:00',
      location: 'Academia de Baile, Barcelona',
      attendees: 25,
      maxAttendees: 30,
      price: '45€',
      type: 'Taller',
      thumbnail: 'https://via.placeholder.com/300x200'
    }
  ]

  return (
    <div className="max-w-6xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-salsa-primary mb-2">EVENTOS - SALSA</h1>
        <p className="text-gray-600">Calendario de eventos, talleres y fiestas de salsa</p>
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

      {/* Action Buttons */}
      <div className="mb-8">
        <div className="flex flex-col sm:flex-row gap-4">
          <button className="btn-primary flex items-center justify-center space-x-2">
            <Plus className="h-5 w-5" />
            <span>CREAR EVENTO</span>
          </button>
          <button className="btn-secondary flex items-center justify-center space-x-2">
            <Calendar className="h-5 w-5" />
            <span>VER CALENDARIO</span>
          </button>
        </div>
      </div>

      {/* Events Grid */}
      <div className="mb-8">
        <h2 className="text-2xl font-semibold text-gray-800 mb-6">Próximos Eventos</h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {events.map((event) => (
            <div key={event.id} className="card overflow-hidden">
              <div className="relative">
                <img
                  src={event.thumbnail}
                  alt={event.title}
                  className="w-full h-48 object-cover"
                />
                <div className="absolute top-2 right-2 bg-salsa-primary text-white px-2 py-1 rounded text-sm font-medium">
                  {event.type}
                </div>
                <div className="absolute top-2 left-2 bg-white bg-opacity-90 text-salsa-primary px-2 py-1 rounded text-sm font-medium">
                  {event.price}
                </div>
              </div>
              
              <div className="p-4">
                <h3 className="font-semibold text-gray-800 mb-2">{event.title}</h3>
                <p className="text-gray-600 text-sm mb-3">{event.description}</p>
                
                <div className="space-y-2 mb-4">
                  <div className="flex items-center space-x-2 text-sm text-gray-600">
                    <Calendar className="h-4 w-4" />
                    <span>{event.date} a las {event.time}</span>
                  </div>
                  <div className="flex items-center space-x-2 text-sm text-gray-600">
                    <MapPin className="h-4 w-4" />
                    <span>{event.location}</span>
                  </div>
                  <div className="flex items-center space-x-2 text-sm text-gray-600">
                    <Users className="h-4 w-4" />
                    <span>{event.attendees}/{event.maxAttendees} asistentes</span>
                  </div>
                </div>
                
                <div className="mb-3">
                  <div className="flex justify-between text-sm text-gray-600 mb-1">
                    <span>Capacidad</span>
                    <span>{Math.round((event.attendees / event.maxAttendees) * 100)}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-salsa-primary h-2 rounded-full transition-all duration-300"
                      style={{ width: `${(event.attendees / event.maxAttendees) * 100}%` }}
                    ></div>
                  </div>
                </div>
                
                <button className="w-full btn-primary">
                  Inscribirse
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default EventosPage 