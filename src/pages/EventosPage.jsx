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
  MapPin,
  Clock,
  Users
} from 'lucide-react'

const EventosPage = () => {
  const [selectedStyle, setSelectedStyle] = useState('SALSA')
  const [activeTab, setActiveTab] = useState('eventos')

  const styles = [
    { name: 'SALSA', icon: Music, hasNotification: true },
    { name: 'BACHATA', icon: Heart },
    { name: 'KIZOMBA', icon: Zap },
    { name: 'ZOUK', icon: Star },
    { name: 'MERENGUE', icon: Sun }
  ]

  const eventos = [
    {
      id: 1,
      title: 'Festival de Salsa Madrid 2024',
      description: 'El evento más grande de salsa en la capital española',
      organizer: 'Salsa Madrid Events',
      date: '15-17 Marzo 2024',
      location: 'Madrid',
      attendees: 450,
      type: 'Festival',
      thumbnail: 'https://via.placeholder.com/300x200/1a1a1a/ffffff?text=FESTIVAL+SALSA+MADRID',
      tags: ['Festival', 'Madrid', 'Internacional', 'Workshops']
    },
    {
      id: 2,
      title: 'Competición Nacional de Salsa',
      description: 'Competición amateur y profesional de salsa',
      organizer: 'Federación Española de Baile',
      date: '22 Abril 2024',
      location: 'Barcelona',
      attendees: 200,
      type: 'Competición',
      thumbnail: 'https://via.placeholder.com/300x200/1a1a1a/ffffff?text=COMPETICIÓN+NACIONAL',
      tags: ['Competición', 'Barcelona', 'Nacional', 'Amateur']
    }
  ]

  const tagColors = {
    'Festival': 'bg-purple-500',
    'Madrid': 'bg-red-500',
    'Internacional': 'bg-blue-500',
    'Workshops': 'bg-green-500',
    'Competición': 'bg-orange-500',
    'Barcelona': 'bg-red-500',
    'Nacional': 'bg-blue-500',
    'Amateur': 'bg-green-500'
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-6 py-8">
        {/* Title */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-2">
            <span className="text-pink-500">EVENTOS</span>
            <span className="text-pink-600"> - SALSA</span>
          </h1>
          <p className="text-gray-600 text-lg">Eventos, competiciones y encuentros de salsa</p>
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
              placeholder="Buscar eventos en salsa..."
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent transition-all duration-200"
            />
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
          <button className="flex items-center justify-center space-x-2 px-6 py-3 bg-gradient-to-r from-orange-500 to-pink-500 text-white rounded-lg font-medium shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105">
            <Upload className="h-5 w-5" />
            <span>CREAR NUEVO EVENTO</span>
          </button>
          <button className="flex items-center justify-center space-x-2 px-6 py-3 bg-pink-500 text-white rounded-lg font-medium shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105">
            <Plus className="h-5 w-5" />
            <span>CALENDARIO DE EVENTOS</span>
          </button>
        </div>

        {/* Gallery Tabs */}
        <div className="flex justify-center gap-4 mb-8">
          <button
            onClick={() => setActiveTab('eventos')}
            className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
              activeTab === 'eventos'
                ? 'bg-gradient-to-r from-orange-500 to-pink-500 text-white shadow-lg transform scale-105'
                : 'bg-white text-gray-700 border border-gray-200 hover:bg-gray-50'
            }`}
          >
            <Calendar className="h-4 w-4" />
            <span>GALERÍA DE EVENTOS (2)</span>
          </button>
          <button
            onClick={() => setActiveTab('competiciones')}
            className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
              activeTab === 'competiciones'
                ? 'bg-gradient-to-r from-orange-500 to-pink-500 text-white shadow-lg transform scale-105'
                : 'bg-white text-gray-700 border border-gray-200 hover:bg-gray-50'
            }`}
          >
            <Star className="h-4 w-4" />
            <span>GALERÍA DE COMPETICIONES (0)</span>
          </button>
        </div>

        {/* Events Grid */}
        <div className="mb-8">
          <h2 className="text-2xl font-semibold text-gray-800 mb-6">Eventos de salsa (2)</h2>
          <div className="grid md:grid-cols-2 gap-6">
            {eventos.map((evento) => (
              <div key={evento.id} className="bg-white rounded-lg shadow-md overflow-hidden border border-gray-100 hover:shadow-lg transition-all duration-200 transform hover:scale-[1.02]">
                                 <div className="relative group">
                   <div className="w-full h-48 bg-gradient-to-br from-gray-100 to-gray-200 relative overflow-hidden flex items-center justify-center">
                     {evento.thumbnailUrl && evento.thumbnailUrl !== 'https://via.placeholder.com/300x200/1a1a1a/ffffff?text=EVENTO' ? (
                       <img
                         src={evento.thumbnailUrl}
                         alt={evento.title}
                         className="w-full h-full object-cover"
                         loading="lazy"
                         onError={(e) => {
                           e.target.style.display = 'none';
                           e.target.nextSibling.style.display = 'flex';
                         }}
                       />
                     ) : null}
                     <div className={`flex flex-col items-center justify-center text-gray-500 ${evento.thumbnailUrl && evento.thumbnailUrl !== 'https://via.placeholder.com/300x200/1a1a1a/ffffff?text=EVENTO' ? 'hidden' : 'flex'}`}>
                       <svg className="w-12 h-12 mb-2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                         <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                       </svg>
                       <span className="text-sm font-medium">{evento.title}</span>
                     </div>
                   </div>
                  <div className="absolute top-2 right-2 bg-pink-500 text-white px-2 py-1 rounded text-sm font-medium">
                    {evento.type}
                  </div>
                </div>
                
                <div className="p-4">
                  <h3 className="font-semibold text-gray-800 mb-2 text-lg">{evento.title}</h3>
                  <p className="text-gray-600 text-sm mb-3">{evento.description}</p>
                  
                  <div className="flex flex-wrap gap-2 mb-4">
                    {evento.tags.map((tag) => (
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
                      <span className="font-medium">{evento.attendees} asistentes</span>
                    </span>
                    <span className="flex items-center space-x-1">
                      <Clock className="h-4 w-4" />
                      <span className="font-medium">{evento.date}</span>
                    </span>
                  </div>
                  
                  <div className="flex items-center justify-between text-sm text-gray-500 mb-3">
                    <span className="flex items-center space-x-1">
                      <MapPin className="h-4 w-4" />
                      <span className="font-medium">{evento.location}</span>
                    </span>
                    <span className="font-medium">Organiza: {evento.organizer}</span>
                  </div>
                  
                  <button className="w-full bg-pink-500 text-white py-2 px-4 rounded-lg font-medium hover:bg-pink-600 transition-colors duration-200">
                    Inscribirse al Evento
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

export default EventosPage 