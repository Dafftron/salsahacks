# 🎯 SALSAHACKS - Plataforma de Videos de Baile

## 📋 Resumen del Proyecto

**SalsaHacks** es una aplicación web para gestión de videos de salsa con:
- ✅ Gestión de videos (subida, edición, reproducción)
- ✅ Sistema de categorías y etiquetas
- ✅ Autenticación de usuarios
- ✅ Panel de administración
- ✅ Sistema de recomendaciones
- ✅ Gestión de usuarios
- ✅ Temas personalizables
- ✅ Firebase como backend

## 🏗️ Arquitectura

### Estructura Jerárquica
```
Pestaña → Estilo → Categoría → Tag
```

### Páginas Principales
- **Notas** - Control de hitos y progreso
- **Categorías** - Centro de control de categorías y tags
- **Figuras** - Galería de videos con filtros avanzados
- **Escuela** - Cursos y tutoriales
- **Eventos** - Calendario de eventos

## 🎨 Sistema de Colores

### Normas de Diseño
- **Modo claro:** NO textos blancos en ninguna parte
- **Modo oscuro:** Textos en blancos o grises claros
- **Colores principales:** Naranja, rosa, amarillo (paleta salsa)

## 🚀 Scripts

- `start` - Lanzar aplicación
- `leviosa` - Git add, commit, push automático

## 📦 Tecnologías

- React + Vite
- Firebase (Auth, Firestore, Storage)
- Tailwind CSS
- Framer Motion

## 🔄 Plan de Desarrollo

### Fase 1: Fundación
- Configuración inicial
- Sistema de autenticación
- Base de datos

### Fase 2: Arquitectura Base
- Página base de contenido
- Componentes comunes
- Sistema de temas

### Fase 3: Páginas Específicas
- Figuras (con un solo estilo: Salsa)
- Escuela
- Eventos

### Fase 4: Gestión de Videos
- Sistema de subida
- Categorías y etiquetas

### Fase 5: Funcionalidades Avanzadas
- Panel de administración
- Sistema de recomendaciones

### Fase 6: Optimización y Deploy
- Performance
- Testing
- Deploy

## 📝 Notas del Desarrollo

- Desarrollo incremental: un estilo primero, luego replicar
- Componentes reutilizables
- Estructura modular
- Persistencia inmediata con Firebase
- Sistema de usuarios con roles
- Favoritos y ratings de 5 estrellas
- Filtros avanzados por categorías y tags 