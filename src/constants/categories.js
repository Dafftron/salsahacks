// 🏷️ SISTEMA DE CATEGORÍAS HARDCODEADAS - SALSAHACKS V2.0

import { 
  Music, 
  Heart, 
  Zap, 
  Star, 
  Sun,
  GraduationCap,
  Calendar,
  Home
} from 'lucide-react'

// 🎵 ESTILOS DE BAILE (HARDCODEADOS - NO ELIMINABLES)
export const DANCE_STYLES = [
  {
    id: 'salsa',
    name: 'SALSA',
    icon: Music,
    color: 'pink',
    gradient: 'from-orange-500 to-pink-500',
    bgColor: 'bg-pink-500',
    textColor: 'text-pink-500',
    hasNotification: true,
    notificationCount: 3,
    description: 'Ritmo caribeño con pasos complejos'
  },
  {
    id: 'bachata',
    name: 'BACHATA',
    icon: Heart,
    color: 'red',
    gradient: 'from-red-500 to-pink-500',
    bgColor: 'bg-red-500',
    textColor: 'text-red-500',
    hasNotification: false,
    description: 'Baile romántico dominicano'
  },
  {
    id: 'kizomba',
    name: 'KIZOMBA',
    icon: Zap,
    color: 'yellow',
    gradient: 'from-yellow-500 to-orange-500',
    bgColor: 'bg-yellow-500',
    textColor: 'text-yellow-500',
    hasNotification: false,
    description: 'Baile africano sensual'
  },
  {
    id: 'zouk',
    name: 'ZOUK',
    icon: Star,
    color: 'purple',
    gradient: 'from-purple-500 to-pink-500',
    bgColor: 'bg-purple-500',
    textColor: 'text-purple-500',
    hasNotification: false,
    description: 'Baile brasileño fluido'
  },
  {
    id: 'merengue',
    name: 'MERENGUE',
    icon: Sun,
    color: 'orange',
    gradient: 'from-orange-500 to-yellow-500',
    bgColor: 'bg-orange-500',
    textColor: 'text-orange-500',
    hasNotification: false,
    description: 'Ritmo dominicano alegre'
  }
]

// 📊 NIVELES DE DIFICULTAD (HARDCODEADOS - NO ELIMINABLES)
export const DIFFICULTY_LEVELS = [
  {
    id: 'beginner',
    name: 'PRINCIPIANTE',
    color: 'green',
    bgColor: 'bg-green-500',
    textColor: 'text-green-500',
    description: 'Para personas que empiezan',
    duration: '5-15 minutos',
    icon: '🟢'
  },
  {
    id: 'intermediate',
    name: 'INTERMEDIO',
    color: 'yellow',
    bgColor: 'bg-yellow-500',
    textColor: 'text-yellow-500',
    description: 'Para bailarines con experiencia básica',
    duration: '10-25 minutos',
    icon: '🟡'
  },
  {
    id: 'advanced',
    name: 'AVANZADO',
    color: 'red',
    bgColor: 'bg-red-500',
    textColor: 'text-red-500',
    description: 'Para bailarines experimentados',
    duration: '15-45 minutos',
    icon: '🔴'
  },
  {
    id: 'expert',
    name: 'EXPERTO',
    color: 'purple',
    bgColor: 'bg-purple-500',
    textColor: 'text-purple-500',
    description: 'Para profesionales y competidores',
    duration: '20-60 minutos',
    icon: '🟣'
  }
]

// 🏷️ CATEGORÍAS PRINCIPALES (HARDCODEADAS - NO ELIMINABLES)
export const MAIN_CATEGORIES = [
  {
    id: 'figuras',
    name: 'FIGURAS',
    icon: Music,
    color: 'pink',
    bgColor: 'bg-pink-500',
    textColor: 'text-pink-500',
    description: 'Videos de figuras y pasos de baile específicos',
    subcategories: ['Básicas', 'Intermedias', 'Avanzadas']
  },
  {
    id: 'escuela',
    name: 'ESCUELA',
    icon: GraduationCap,
    color: 'blue',
    bgColor: 'bg-blue-500',
    textColor: 'text-blue-500',
    description: 'Cursos y tutoriales estructurados',
    subcategories: ['Cursos', 'Tutoriales']
  },
  {
    id: 'eventos',
    name: 'EVENTOS',
    icon: Calendar,
    color: 'green',
    bgColor: 'bg-green-500',
    textColor: 'text-green-500',
    description: 'Eventos, competiciones y encuentros',
    subcategories: ['Competiciones', 'Encuentros']
  }
]

// 🎯 ETIQUETAS TÉCNICAS (HARDCODEADAS - NO ELIMINABLES)
export const TECHNICAL_TAGS = [
  {
    id: 'derecha',
    name: 'Derecha',
    color: 'blue',
    bgColor: 'bg-blue-500',
    category: 'technique',
    description: 'Técnicas con la derecha'
  },
  {
    id: 'izquierda',
    name: 'Izquierda',
    color: 'blue',
    bgColor: 'bg-blue-500',
    category: 'technique',
    description: 'Técnicas con la izquierda'
  },
  {
    id: 'giro',
    name: 'Giro',
    color: 'blue',
    bgColor: 'bg-blue-500',
    category: 'technique',
    description: 'Técnicas de giro'
  },
  {
    id: 'ritmo',
    name: 'Ritmo',
    color: 'orange',
    bgColor: 'bg-orange-500',
    category: 'rhythm',
    description: 'Trabajo de ritmo'
  },
  {
    id: 'tecnica',
    name: 'Técnica',
    color: 'orange',
    bgColor: 'bg-orange-500',
    category: 'technique',
    description: 'Técnica de baile'
  },
  {
    id: 'postura',
    name: 'Postura',
    color: 'green',
    bgColor: 'bg-green-500',
    category: 'posture',
    description: 'Postura y posición'
  },
  {
    id: 'timing',
    name: 'Timing',
    color: 'green',
    bgColor: 'bg-green-500',
    category: 'rhythm',
    description: 'Timing y sincronización'
  }
]

// 🌍 ESTILOS REGIONALES (HARDCODEADOS - NO ELIMINABLES)
export const REGIONAL_STYLES = [
  {
    id: 'cubano',
    name: 'Cubano',
    color: 'purple',
    bgColor: 'bg-purple-500',
    description: 'Estilo cubano de salsa'
  },
  {
    id: 'la-style',
    name: 'LA Style',
    color: 'purple',
    bgColor: 'bg-purple-500',
    description: 'Estilo Los Angeles'
  },
  {
    id: 'ny-style',
    name: 'NY Style',
    color: 'purple',
    bgColor: 'bg-purple-500',
    description: 'Estilo Nueva York'
  },
  {
    id: 'puertorriqueno',
    name: 'Puertorriqueño',
    color: 'purple',
    bgColor: 'bg-purple-500',
    description: 'Estilo puertorriqueño'
  },
  {
    id: 'colombiano',
    name: 'Colombiano',
    color: 'purple',
    bgColor: 'bg-purple-500',
    description: 'Estilo colombiano'
  }
]

// 👥 INSTRUCTORES (DINÁMICOS - SE PUEDEN MODIFICAR)
export const INSTRUCTORS = [
  {
    id: 'carlos-rodriguez',
    name: 'Carlos Rodríguez',
    color: 'green',
    bgColor: 'bg-green-500',
    specialty: 'Salsa Cubana',
    experience: '15 años',
    location: 'Madrid'
  },
  {
    id: 'maria-gonzalez',
    name: 'María González',
    color: 'green',
    bgColor: 'bg-green-500',
    specialty: 'Bachata',
    experience: '12 años',
    location: 'Barcelona'
  },
  {
    id: 'juan-perez',
    name: 'Juan Pérez',
    color: 'green',
    bgColor: 'bg-green-500',
    specialty: 'Kizomba',
    experience: '8 años',
    location: 'Valencia'
  },
  {
    id: 'ana-lopez',
    name: 'Ana López',
    color: 'green',
    bgColor: 'bg-green-500',
    specialty: 'Zouk',
    experience: '10 años',
    location: 'Sevilla'
  },
  {
    id: 'luis-martinez',
    name: 'Luis Martínez',
    color: 'green',
    bgColor: 'bg-green-500',
    specialty: 'Salsa LA Style',
    experience: '18 años',
    location: 'Bilbao'
  }
]

// 📍 UBICACIONES (DINÁMICAS - SE PUEDEN MODIFICAR)
export const LOCATIONS = [
  {
    id: 'madrid',
    name: 'Madrid',
    color: 'red',
    bgColor: 'bg-red-500',
    country: 'España',
    videosCount: 45
  },
  {
    id: 'barcelona',
    name: 'Barcelona',
    color: 'red',
    bgColor: 'bg-red-500',
    country: 'España',
    videosCount: 38
  },
  {
    id: 'valencia',
    name: 'Valencia',
    color: 'red',
    bgColor: 'bg-red-500',
    country: 'España',
    videosCount: 22
  },
  {
    id: 'sevilla',
    name: 'Sevilla',
    color: 'red',
    bgColor: 'bg-red-500',
    country: 'España',
    videosCount: 15
  },
  {
    id: 'bilbao',
    name: 'Bilbao',
    color: 'red',
    bgColor: 'bg-red-500',
    country: 'España',
    videosCount: 12
  }
]

// 🎨 CONFIGURACIÓN DE COLORES
export const CATEGORY_COLORS = {
  // Estilos de baile
  'SALSA': 'bg-gradient-to-r from-orange-500 to-pink-500',
  'BACHATA': 'bg-gradient-to-r from-red-500 to-pink-500',
  'KIZOMBA': 'bg-gradient-to-r from-yellow-500 to-orange-500',
  'ZOUK': 'bg-gradient-to-r from-purple-500 to-pink-500',
  'MERENGUE': 'bg-gradient-to-r from-orange-500 to-yellow-500',
  
  // Niveles
  'PRINCIPIANTE': 'bg-green-500',
  'INTERMEDIO': 'bg-yellow-500',
  'AVANZADO': 'bg-red-500',
  'EXPERTO': 'bg-purple-500',
  
  // Etiquetas técnicas
  'Derecha': 'bg-blue-500',
  'Izquierda': 'bg-blue-500',
  'Giro': 'bg-blue-500',
  'Ritmo': 'bg-orange-500',
  'Técnica': 'bg-orange-500',
  'Postura': 'bg-green-500',
  'Timing': 'bg-green-500',
  
  // Estilos regionales
  'Cubano': 'bg-purple-500',
  'LA Style': 'bg-purple-500',
  'NY Style': 'bg-purple-500',
  'Puertorriqueño': 'bg-purple-500',
  'Colombiano': 'bg-purple-500'
}

// 🔍 FUNCIONES DE UTILIDAD
export const getCategoryColor = (categoryName) => {
  return CATEGORY_COLORS[categoryName] || 'bg-gray-500'
}

export const getCategoryIcon = (categoryName) => {
  const style = DANCE_STYLES.find(s => s.name === categoryName)
  return style ? style.icon : Home
}

export const isHardcodedCategory = (categoryName) => {
  const allHardcoded = [
    ...DANCE_STYLES.map(s => s.name),
    ...DIFFICULTY_LEVELS.map(l => l.name),
    ...MAIN_CATEGORIES.map(c => c.name),
    ...TECHNICAL_TAGS.map(t => t.name),
    ...REGIONAL_STYLES.map(r => r.name)
  ]
  return allHardcoded.includes(categoryName)
}

export const getAllCategories = () => {
  return {
    styles: DANCE_STYLES,
    levels: DIFFICULTY_LEVELS,
    mainCategories: MAIN_CATEGORIES,
    technicalTags: TECHNICAL_TAGS,
    regionalStyles: REGIONAL_STYLES,
    instructors: INSTRUCTORS,
    locations: LOCATIONS
  }
} 