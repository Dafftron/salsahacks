# 🏷️ SISTEMA DE CATEGORÍAS - SALSAHACKS V2.0

## 🎯 GESTIÓN DE CATEGORÍAS HARDCODEADAS

---

## 📋 ÍNDICE
1. [Categorías Principales](#categorías-principales)
2. [Estilos de Baile](#estilos-de-baile)
3. [Niveles de Dificultad](#niveles-de-dificultad)
4. [Etiquetas Específicas](#etiquetas-específicas)
5. [Gestión y Configuración](#gestión-y-configuración)
6. [Implementación Técnica](#implementación-técnica)

---

## 🏷️ CATEGORÍAS PRINCIPALES

### **💃 FIGURAS**
**Descripción:** Videos de figuras y pasos de baile específicos
**Icono:** `Music` (dos notas musicales)
**Color:** Rosa (#FF6B35)

#### **Subcategorías:**
- **Básicas**
  - Pasos básicos
  - Figuras simples
  - Ritmo fundamental
  - Postura y técnica

- **Intermedias**
  - Combinaciones
  - Giros simples
  - Cambios de dirección
  - Sincronización

- **Avanzadas**
  - Giros complejos
  - Acrobacias
  - Combinaciones avanzadas
  - Improvisación

### **🎓 ESCUELA**
**Descripción:** Cursos y tutoriales estructurados
**Icono:** `GraduationCap` (birrete)
**Color:** Azul (#3B82F6)

#### **Subcategorías:**
- **Cursos**
  - Fundamentos
  - Técnica avanzada
  - Especialización
  - Certificaciones

- **Tutoriales**
  - Paso a paso
  - Técnicas específicas
  - Consejos de expertos
  - Material de práctica

### **📅 EVENTOS**
**Descripción:** Eventos, competiciones y encuentros
**Icono:** `Calendar` (calendario)
**Color:** Verde (#10B981)

#### **Subcategorías:**
- **Competiciones**
  - Nacionales
  - Internacionales
  - Amateur
  - Profesional

- **Encuentros**
  - Sociales
  - Workshops
  - Festivales
  - Congresos

---

## 🎵 ESTILOS DE BAILE

### **SALSA** ✅ **IMPLEMENTADO**
- **Icono:** `Music` (dos notas musicales)
- **Color:** Rosa (#FF6B35)
- **Gradiente:** Naranja-rosa
- **Notificación:** Sí (punto rosa)

### **BACHATA**
- **Icono:** `Heart` (corazón)
- **Color:** Rojo (#EF4444)
- **Gradiente:** Rojo-rosa
- **Notificación:** No

### **KIZOMBA**
- **Icono:** `Zap` (rayo)
- **Color:** Amarillo (#F59E0B)
- **Gradiente:** Amarillo-naranja
- **Notificación:** No

### **ZOUK**
- **Icono:** `Star` (estrella)
- **Color:** Púrpura (#8B5CF6)
- **Gradiente:** Púrpura-rosa
- **Notificación:** No

### **MERENGUE**
- **Icono:** `Sun` (sol)
- **Color:** Naranja (#F97316)
- **Gradiente:** Naranja-amarillo
- **Notificación:** No

---

## 📊 NIVELES DE DIFICULTAD

### **🟢 PRINCIPIANTE**
- **Color:** Verde (#10B981)
- **Descripción:** Para personas que empiezan
- **Contenido:** Pasos básicos, explicaciones detalladas
- **Duración:** 5-15 minutos por video

### **🟡 INTERMEDIO**
- **Color:** Amarillo (#F59E0B)
- **Descripción:** Para bailarines con experiencia básica
- **Contenido:** Combinaciones, técnicas intermedias
- **Duración:** 10-25 minutos por video

### **🔴 AVANZADO**
- **Color:** Rojo (#EF4444)
- **Descripción:** Para bailarines experimentados
- **Contenido:** Técnicas complejas, acrobacias
- **Duración:** 15-45 minutos por video

### **🟣 EXPERTO**
- **Color:** Púrpura (#8B5CF6)
- **Descripción:** Para profesionales y competidores
- **Contenido:** Técnicas de competición, improvisación
- **Duración:** 20-60 minutos por video

---

## 🏷️ ETIQUETAS ESPECÍFICAS

### **🎯 TÉCNICAS**
- **Derecha** - Azul (#3B82F6)
- **Izquierda** - Azul (#3B82F6)
- **Giro** - Azul (#3B82F6)
- **Ritmo** - Naranja (#F97316)
- **Técnica** - Naranja (#F97316)
- **Postura** - Verde (#10B981)
- **Timing** - Verde (#10B981)

### **🌍 ESTILOS REGIONALES**
- **Cubano** - Púrpura (#8B5CF6)
- **LA Style** - Púrpura (#8B5CF6)
- **NY Style** - Púrpura (#8B5CF6)
- **Puertorriqueño** - Púrpura (#8B5CF6)
- **Colombiano** - Púrpura (#8B5CF6)

### **👥 INSTRUCTORES**
- **Carlos Rodríguez** - Verde (#10B981)
- **María González** - Verde (#10B981)
- **Juan Pérez** - Verde (#10B981)
- **Ana López** - Verde (#10B981)
- **Luis Martínez** - Verde (#10B981)

### **📍 UBICACIONES**
- **Madrid** - Rojo (#EF4444)
- **Barcelona** - Rojo (#EF4444)
- **Valencia** - Rojo (#EF4444)
- **Sevilla** - Rojo (#EF4444)
- **Bilbao** - Rojo (#EF4444)

---

## ⚙️ GESTIÓN Y CONFIGURACIÓN

### **🔒 CATEGORÍAS HARDCODEADAS**
Las siguientes categorías **NO SE PUEDEN ELIMINAR**:
- Estilos de baile (SALSA, BACHATA, KIZOMBA, ZOUK, MERENGUE)
- Niveles de dificultad (PRINCIPIANTE, INTERMEDIO, AVANZADO, EXPERTO)
- Categorías principales (FIGURAS, ESCUELA, EVENTOS)

### **➕ CATEGORÍAS DINÁMICAS**
Las siguientes categorías **SÍ SE PUEDEN MODIFICAR**:
- Etiquetas específicas
- Instructores
- Ubicaciones
- Eventos específicos

### **🎨 CONFIGURACIÓN DE COLORES**
```javascript
const categoryColors = {
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
  
  // Etiquetas
  'Derecha': 'bg-blue-500',
  'Izquierda': 'bg-blue-500',
  'Giro': 'bg-blue-500',
  'Ritmo': 'bg-orange-500',
  'Técnica': 'bg-orange-500',
  'Postura': 'bg-green-500',
  'Timing': 'bg-green-500',
  'Cubano': 'bg-purple-500',
  'LA Style': 'bg-purple-500',
  'NY Style': 'bg-purple-500',
  'Puertorriqueño': 'bg-purple-500',
  'Colombiano': 'bg-purple-500'
}
```

---

## 🔧 IMPLEMENTACIÓN TÉCNICA

### **📁 ESTRUCTURA DE ARCHIVOS**
```
src/
├── constants/
│   ├── categories.js          # Definición de categorías
│   ├── styles.js             # Estilos de baile
│   ├── levels.js             # Niveles de dificultad
│   └── tags.js               # Etiquetas específicas
├── components/
│   ├── categories/
│   │   ├── CategoryFilter.jsx    # Filtro de categorías
│   │   ├── StyleFilter.jsx       # Filtro de estilos
│   │   ├── LevelFilter.jsx       # Filtro de niveles
│   │   └── TagFilter.jsx         # Filtro de etiquetas
│   └── common/
│       ├── CategoryBadge.jsx     # Badge de categoría
│       └── TagBadge.jsx          # Badge de etiqueta
├── hooks/
│   └── useCategories.js      # Hook para gestión de categorías
└── services/
    └── categoryService.js    # Servicio de categorías
```

### **🎯 COMPONENTE PRINCIPAL**
```javascript
// src/constants/categories.js
export const DANCE_STYLES = [
  {
    id: 'salsa',
    name: 'SALSA',
    icon: 'Music',
    color: 'pink',
    gradient: 'from-orange-500 to-pink-500',
    hasNotification: true
  },
  {
    id: 'bachata',
    name: 'BACHATA',
    icon: 'Heart',
    color: 'red',
    gradient: 'from-red-500 to-pink-500',
    hasNotification: false
  },
  // ... más estilos
]

export const DIFFICULTY_LEVELS = [
  {
    id: 'beginner',
    name: 'PRINCIPIANTE',
    color: 'green',
    description: 'Para personas que empiezan'
  },
  // ... más niveles
]

export const TAGS = [
  {
    id: 'derecha',
    name: 'Derecha',
    color: 'blue',
    category: 'technique'
  },
  // ... más etiquetas
]
```

### **🔍 SISTEMA DE FILTRADO**
```javascript
// src/hooks/useCategories.js
export const useCategories = () => {
  const [selectedStyle, setSelectedStyle] = useState('SALSA')
  const [selectedLevel, setSelectedLevel] = useState(null)
  const [selectedTags, setSelectedTags] = useState([])
  
  const filterVideos = (videos) => {
    return videos.filter(video => {
      const styleMatch = !selectedStyle || video.style === selectedStyle
      const levelMatch = !selectedLevel || video.level === selectedLevel
      const tagsMatch = selectedTags.length === 0 || 
        selectedTags.some(tag => video.tags.includes(tag))
      
      return styleMatch && levelMatch && tagsMatch
    })
  }
  
  return {
    selectedStyle,
    setSelectedStyle,
    selectedLevel,
    setSelectedLevel,
    selectedTags,
    setSelectedTags,
    filterVideos
  }
}
```

---

## 📊 ESTADÍSTICAS POR CATEGORÍA

### **📈 MÉTRICAS A SEGUIR**
- **Videos por categoría**
- **Videos por estilo**
- **Videos por nivel**
- **Etiquetas más populares**
- **Instructores más activos**
- **Ubicaciones con más contenido**

### **📋 REPORTES**
- **Reporte semanal** de contenido nuevo
- **Reporte mensual** de estadísticas
- **Reporte trimestral** de tendencias
- **Reporte anual** de crecimiento

---

## 🎯 PRÓXIMOS PASOS

### **🔥 PRIORIDAD ALTA**
1. **Implementar sistema de categorías** en todas las páginas
2. **Crear filtros avanzados** con múltiples criterios
3. **Sistema de búsqueda** por categorías
4. **Gestión de etiquetas** dinámicas

### **📋 PRIORIDAD MEDIA**
1. **Estadísticas por categoría** en dashboard
2. **Sistema de recomendaciones** basado en categorías
3. **Exportación/importación** de categorías
4. **API para gestión** de categorías

### **📈 PRIORIDAD BAJA**
1. **Analytics avanzados** por categoría
2. **Sistema de trending** por categorías
3. **Personalización** basada en categorías
4. **Machine learning** para categorización automática

---

**📝 Este sistema de categorías garantiza consistencia y facilita la gestión de contenido en toda la aplicación.**
**🔄 Última actualización:** [Fecha actual]
**🎯 Versión:** SalsaHacks V2.0 