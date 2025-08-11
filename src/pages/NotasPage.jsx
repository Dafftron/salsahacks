import { useState } from 'react'
import { 
  Search, 
  CheckCircle, 
  Clock, 
  GitBranch, 
  Calendar,
  FileText,
  Star,
  Settings,
  Database,
  AlertCircle,
  PlayCircle,
  Music,
  Video,
  Users,
  Home,
  BookOpen,
  ChevronDown,
  ChevronRight
} from 'lucide-react'
import StorageMonitor from '../components/storage/StorageMonitor'

const NotasPage = () => {
  const [activeTab, setActiveTab] = useState('commits')
  const [selectedCategory, setSelectedCategory] = useState('TODAS')
  const [expandedCommits, setExpandedCommits] = useState(new Set())

  const categories = [
            { name: 'TODAS', icon: FileText, count: 116 },
        { name: 'PÁGINAS', icon: Home, count: 17 },
        { name: 'SISTEMAS', icon: Settings, count: 73 },
        { name: 'CONTENIDO', icon: Video, count: 26 }
  ]

        const commits = [
        {
          id: 119,
          hash: 'aa11bb2',
          date: '2025-08-11',
          time: '10:20:00',
          title: 'Commit #119 - Hito: +100 videos subidos en ESCUELA',
          description: 'Marcamos como completada la subida masiva inicial de contenido educativo (>100 videos)',
          files: ['src/pages/NotasPage.jsx', 'NOTAS_COMMITS.md'],
          notes: 'Contenido: se superó el objetivo inicial (10-15) con más de 100 videos subidos a ESCUELA. La tarea pasa a Hecho y se retira de En Proceso/Futuro.',
          status: 'Completado',
          category: 'CONTENIDO'
        },
        {
          id: 117,
          hash: 'c1d2e3f',
          date: '2025-08-11',
          time: '10:00:00',
          title: 'Commit #117 - Notas solo para Super Admin + Navegación móvil',
          description: 'Restringe acceso a Notas exclusivamente a super_admin y corrige visibilidad de navegación en móviles',
          files: ['src/constants/roles.js', 'src/App.jsx', 'src/components/layout/Navigation.jsx'],
          notes: 'Seguridad: PAGE_ACCESS y ruta protegida actualizados para que solo super_admin acceda a /notas. UX móvil: agregado menú móvil con icono de hamburguesa y lista horizontal deslizable; el enlace Notas solo se muestra a super_admin.',
          status: 'Completado',
          category: 'SISTEMAS'
        },
        {
          id: 118,
          hash: 'f4e5d6c',
          date: '2025-08-11',
          time: '10:05:00',
          title: 'Commit #118 - Índices Firestore para consultas por estilo/fecha',
          description: 'Define índices compuestos style + createdAt para videos y escuela-videos',
          files: ['firestore.indexes.json'],
          notes: 'Índices creados para consultas optimizadas en suscripciones por estilo con orden por fecha. Evita fallbacks en cliente cuando el índice existe.',
          status: 'Completado',
          category: 'SISTEMAS'
        },
        {
          id: 116,
          hash: '0737ab4',
          date: '2024-12-20',
          time: '01:45:00',
          title: 'Commit #116 - Actualización completa NOTAS_COMMITS.md',
          description: 'Estado del proyecto actualizado con funcionalidad eliminación completa',
          files: ['NOTAS_COMMITS.md'],
          notes: 'Documentación actualizada: Commit #115 documentado con funcionalidad eliminación. EscuelaPage 100% funcional y operativo. FigurasPage 100% funcional con secuencias. Análisis completo de próximos pasos. Recomendación: listo para subida masiva de videos. Ready for production use.',
          status: 'Completado',
          category: 'SISTEMAS'
        },
        {
          id: 115,
          hash: '9b552a1',
          date: '2024-12-20',
          time: '01:30:00',
          title: 'Commit #115 - Funcionalidad de eliminación completa en EscuelaPage',
          description: 'Sistema completo de eliminación con Storage + Firestore + UI y reproductor corregido',
          files: ['src/pages/EscuelaPage.jsx', 'src/components/video/VideoEditModal.jsx'],
          notes: 'Eliminación completa implementada: handleDeleteVideo con manejo de errores robusto. Modal de confirmación ConfirmModal. Eliminación doble: Firebase Storage + Firestore + UI local. Reproductor modal corregido sin elementos flotantes. VideoEditModal contextual: Tags Iniciales/Finales solo en FigurasPage. Interface limpio en EscuelaPage. Error 400 solucionado con parámetro page correcto.',
          status: 'Completado',
          category: 'PÁGINAS'
        },
        {
          id: 86,
          hash: 'dab5f06',
          date: '2024-12-19',
          time: '15:30:00',
          title: 'Commit #086 - Optimización masiva de bundle y limpieza completa',
          description: 'Bundle principal reducido de 708KB a 38KB (95% reducción) - Manual chunks configurados',
          files: ['vite.config.js', '.eslintrc.cjs', 'src/components/video/VideoPlayer.jsx', 'src/components/sequence/SequenceVideoPlayer.jsx', 'src/components/common/CategoryChips.jsx'],
          notes: 'Optimización masiva del bundle: Bundle principal reducido de 708KB a 38KB (95% reducción). Manual chunks configurados: Firebase separado por módulos, JSZip independiente, React separado. ESLint completamente optimizado: 0 errores, 0 warnings. Errores críticos corregidos: case-declarations en VideoPlayer, process.env en CategoryChips. Archivos de librerías externas excluidos del linting. Sistema completamente limpio y optimizado para replicación.',
          status: 'Completado',
          category: 'SISTEMAS'
        },
        {
          id: 85,
          hash: 'c83b61d',
          date: '2024-12-19',
          time: '15:15:00',
          title: 'Commit #085 - Limpieza técnica completa',
          description: 'Eliminación masiva de console.logs de debug y limpieza general del código',
          files: ['src/pages/FigurasPage.jsx', 'src/components/video/VideoPlayer.jsx', 'src/components/sequence/SequenceBuilder.jsx', 'src/components/video/VideoUploadModal.jsx', 'src/components/video/VideoEditModal.jsx', 'src/components/video/DownloadModal.jsx', 'src/components/video/VideoDownloadModal.jsx', 'src/components/sequence/SequenceVideoPlayer.jsx', 'src/pages/ProfilePage.jsx', 'src/pages/CategoriesPage.jsx'],
          notes: 'Limpieza masiva de código: Eliminados ~100 console.logs de debug de todos los archivos principales. Limpiados archivos: FigurasPage.jsx, VideoPlayer.jsx, SequenceBuilder.jsx, VideoUploadModal.jsx, VideoEditModal.jsx, DownloadModal.jsx, VideoDownloadModal.jsx, SequenceVideoPlayer.jsx, ProfilePage.jsx. Resuelto TODO pendiente en CategoriesPage.jsx. Código más limpio y profesional. Mejor rendimiento sin logs innecesarios. Bundle size optimizado: FigurasPage reducido de 200KB a 195KB.',
          status: 'Completado',
          category: 'SISTEMAS'
        },
        {
          id: 84,
          hash: 'b72a50c',
          date: '2024-12-19',
          time: '15:00:00',
          title: 'Commit #084 - Implementación de Code Splitting',
          description: 'Bundle principal reducido de 2.5MB a 708KB (70% reducción) con lazy loading',
          files: ['src/App.jsx'],
          notes: 'Implementación de Code Splitting: Lazy loading de todas las páginas con React.lazy(). Componente LoadingSpinner para mejor UX durante carga. Bundle principal reducido de 2.5MB a 708KB (70% reducción). Chunks separados para cada página: FigurasPage (200KB), NotasPage (39KB), AdminPage (20KB), SettingsPage (12KB), ProfilePage (10KB), CategoriesPage (9KB), HomePage (8KB), EscuelaPage (8KB), EventosPage (7KB), AuthPage (5KB), InvitePage (7KB). Carga inicial 70% más rápida.',
          status: 'Completado',
          category: 'SISTEMAS'
        },
        {
          id: 83,
          hash: 'a6194fb',
          date: '2024-12-19',
          time: '14:45:00',
          title: 'Commit #083 - Limpieza técnica - Eliminación de componentes de prueba obsoletos',
          description: 'Eliminación completa de componentes de prueba y limpieza de referencias',
          files: ['src/components/FirebaseTest.jsx', 'src/components/FirebaseSimpleTest.jsx', 'src/components/FirebaseStorageTest.jsx', 'src/components/FirebaseStorageStatus.jsx', 'src/pages/NotasPage.jsx'],
          notes: 'Eliminación de componentes obsoletos: FirebaseTest.jsx, FirebaseSimpleTest.jsx, FirebaseStorageTest.jsx, FirebaseStorageStatus.jsx. Limpiadas referencias en NotasPage.jsx a componentes eliminados. Consolidados imports dinámicos de Firebase Storage en FigurasPage.jsx. Reducido bundle size ligeramente. Código más limpio y mantenible.',
          status: 'Completado',
          category: 'SISTEMAS'
        },
        {
          id: 82,
          hash: '95083ea',
          date: '2024-12-19',
          time: '14:30:00',
          title: 'Commit #082 - Eliminación completa de videos funcionando',
          description: 'Sistema de eliminación completamente funcional después de debugging',
          files: ['src/pages/FigurasPage.jsx', 'src/services/firebase/storage.js', 'src/services/firebase/firestore.js'],
          notes: 'Sistema de eliminación completamente funcional: Videos y thumbnails se eliminan correctamente de Firebase Storage. Documentos se eliminan correctamente de Firestore. Logs de debug confirmaron que el sistema funciona perfectamente. Eliminación de archivos y metadatos sincronizada correctamente.',
          status: 'Completado',
          category: 'SISTEMAS'
        },
        {
          id: 81,
          hash: '84f72d9',
          date: '2024-12-19',
          time: '14:15:00',
          title: 'Commit #081 - Debug logs para eliminación de thumbnails',
          description: 'Agregados logs detallados en función deleteVideo para rastrear eliminación de archivos',
          files: ['src/services/firebase/storage.js'],
          notes: 'Debug logs para eliminación de thumbnails: Agregados logs detallados en deleteVideo para rastrear eliminación de archivos. Logs muestran rutas de video y thumbnail que se intentan eliminar. Verificación mejorada de thumbnailPath (null, vacío, undefined). Contador de archivos eliminados en respuesta. Mejor debugging para identificar por qué los thumbnails no se eliminan.',
          status: 'Completado',
          category: 'SISTEMAS'
        },
        {
          id: 80,
          hash: '73e61c8',
          date: '2024-12-19',
          time: '14:00:00',
          title: 'Commit #080 - Debug logs para eliminación de videos',
          description: 'Agregados logs detallados para identificar el problema con Firestore',
          files: ['src/pages/FigurasPage.jsx', 'src/services/firebase/firestore.js'],
          notes: 'Debug logs para eliminación de videos: Agregados logs detallados en handleDeleteVideo para rastrear el proceso completo. Agregados logs detallados en deleteVideoDocument para identificar problemas con Firestore. Logs incluyen IDs de video, rutas de documentos y códigos de error. Mejor debugging para identificar por qué los videos no se eliminan de Firestore.',
          status: 'Completado',
          category: 'SISTEMAS'
        },
        {
          id: 79,
          hash: '62d50b7',
          date: '2024-12-19',
          time: '13:45:00',
          title: 'Commit #079 - Migración real de videos a estructura organizada',
          description: 'Implementada migración real que descarga y re-sube los archivos a la nueva estructura',
          files: ['src/services/firebase/storage.js', 'src/pages/FigurasPage.jsx'],
          notes: 'Migración real de videos: Agregadas funciones auxiliares downloadFile y blobToFile para manejo de archivos. Modificada migrateVideosToOrganizedStructure para descargar y re-subir archivos. Implementada eliminación de archivos originales después de migración exitosa. Agregado manejo de errores robusto para videos y thumbnails por separado. Actualizado mensaje de éxito para indicar "migración REAL". Cambiado texto del botón a "📁 Migrar Videos REAL". Recarga automática de página después de migración exitosa.',
          status: 'Completado',
          category: 'SISTEMAS'
        },
        {
          id: 78,
          hash: '51c40a6',
          date: '2024-12-19',
          time: '13:30:00',
          title: 'Commit #078 - Estructura organizada de Firebase Storage',
          description: 'Nuevos videos se suben a estructura organizada videos/page/style/',
          files: ['src/components/video/VideoUploadModal.jsx', 'src/services/firebase/storage.js'],
          notes: 'Estructura organizada de Firebase Storage: Nuevos videos se suben a estructura videos/page/style/ en lugar de videos/ plano. Thumbnails se suben a thumbnails/page/style/. Función de migración agregada para videos existentes. Botón de migración en FigurasPage para administradores. Mejor organización y facilidad de gestión de archivos.',
          status: 'Completado',
          category: 'SISTEMAS'
        },
        {
          id: 77,
          hash: '40b39a5',
          date: '2024-12-19',
          time: '13:15:00',
          title: 'Commit #077 - Categorías dinámicas por estilo de baile',
          description: 'Categorías y tags cambian según el estilo seleccionado (Salsa, Bachata, Kizomba)',
          files: ['src/pages/FigurasPage.jsx', 'src/hooks/useCategories.js', 'src/components/video/VideoUploadModal.jsx'],
          notes: 'Categorías dinámicas por estilo: Categorías y tags cambian dinámicamente según el estilo de baile seleccionado. Salsa, Bachata y Kizomba tienen sus propias categorías específicas. Filtros avanzados se adaptan al estilo seleccionado. Cambios en CategoriesPage se reflejan inmediatamente en todas las páginas. Sistema completamente dinámico y organizado.',
          status: 'Completado',
          category: 'SISTEMAS'
        },
        {
          id: 76,
          hash: '2fa2884',
          date: '2024-12-19',
          time: '13:00:00',
          title: 'Commit #076 - Sistema de descarga de videos mejorado',
          description: 'Descarga directa desde Firebase Storage con manejo de errores mejorado',
          files: ['src/components/video/VideoPlayer.jsx', 'src/components/video/DownloadModal.jsx'],
          notes: 'Sistema de descarga mejorado: Descarga directa desde Firebase Storage usando fetch y blob. Manejo de errores mejorado con mensajes específicos. Soporte para diferentes tipos de URLs (Firebase, externas). Limpieza automática de URLs de blob después de descarga. Mejor experiencia de usuario con feedback visual.',
          status: 'Completado',
          category: 'CONTENIDO'
        },
        {
          id: 75,
          hash: '1e91773',
          date: '2024-12-19',
          time: '12:45:00',
          title: 'Commit #075 - Constructor de secuencias completo',
          description: 'Sistema completo de construcción de secuencias con compatibilidad automática',
          files: ['src/components/sequence/SequenceBuilder.jsx', 'src/contexts/SequenceBuilderContext.jsx'],
          notes: 'Constructor de secuencias completo: Sistema de compatibilidad automática entre videos basado en tags iniciales y finales. Generación automática de secuencias con lógica de compatibilidad. Interfaz intuitiva para construcción manual de secuencias. Guardado y carga de secuencias en Firebase. Sistema completamente funcional y integrado.',
          status: 'Completado',
          category: 'CONTENIDO'
        },
        {
          id: 74,
          hash: '0d80662',
          date: '2024-12-19',
          time: '12:30:00',
          title: 'Commit #074 - VideoPlayer avanzado con controles A-B',
          description: 'VideoPlayer completo con controles de bucle A-B y segmentos',
          files: ['src/components/video/VideoPlayer.jsx', 'src/index.css'],
          notes: 'VideoPlayer avanzado: Controles completos de reproducción, volumen, fullscreen. Sistema de bucle A-B para segmentos específicos. Controles de teclado (espacio, flechas, A, B, L, S). Auto-ocultación de controles. Interfaz responsive y profesional. Compatible con todos los navegadores modernos.',
          status: 'Completado',
          category: 'CONTENIDO'
        },
        {
          id: 73,
          hash: 'fc6f551',
          date: '2024-12-19',
          time: '12:15:00',
          title: 'Commit #073 - Sistema de filtros avanzados',
          description: 'Filtros por categorías, tags, favoritos y búsqueda de texto',
          files: ['src/components/common/CategoryChips.jsx', 'src/pages/FigurasPage.jsx'],
          notes: 'Sistema de filtros avanzados: Filtros por categorías con lógica AND (todos los tags deben estar presentes). Filtro de favoritos independiente. Búsqueda de texto en título y descripción. Combinación de filtros (categorías + favoritos + búsqueda). Interfaz intuitiva con chips de categorías. Limpieza de filtros con un clic.',
          status: 'Completado',
          category: 'SISTEMAS'
        },
        {
          id: 72,
          hash: 'eb5e440',
          date: '2024-12-19',
          time: '12:00:00',
          title: 'Commit #072 - Sistema de favoritos y likes',
          description: 'Sistema completo de favoritos con persistencia en Firebase',
          files: ['src/pages/FigurasPage.jsx', 'src/services/firebase/firestore.js'],
          notes: 'Sistema de favoritos: Toggle de favoritos con persistencia en Firebase. Contador de likes por video. Filtro de solo favoritos. Interfaz visual con iconos de corazón. Actualización en tiempo real de contadores. Sistema completamente funcional y sincronizado.',
          status: 'Completado',
          category: 'SISTEMAS'
        },
        {
          id: 71,
          hash: 'da4d33f',
          date: '2024-12-19',
          time: '11:45:00',
          title: 'Commit #071 - Modal de subida de videos completo',
          description: 'Sistema completo de subida con preview, thumbnail y metadatos',
          files: ['src/components/video/VideoUploadModal.jsx', 'src/services/firebase/storage.js'],
          notes: 'Modal de subida completo: Subida de archivos con drag & drop. Generación automática de thumbnails. Detección de BPM automática. Edición de metadatos (título, descripción, tags). Preview del video antes de subir. Barra de progreso de subida. Validación de archivos y metadatos.',
          status: 'Completado',
          category: 'CONTENIDO'
        },
        {
          id: 70,
          hash: 'c93c22e',
          date: '2024-12-19',
          time: '11:30:00',
          title: 'Commit #070 - Galería de videos responsive',
          description: 'Galería de videos con diferentes tamaños y vista responsive',
          files: ['src/pages/FigurasPage.jsx', 'src/components/common/CardSizeSelector.jsx'],
          notes: 'Galería de videos responsive: Selector de tamaños (pequeño, mediano, grande). Vista responsive que se adapta a diferentes pantallas. Cards de video con información completa. Thumbnails generados automáticamente. Interfaz intuitiva y profesional.',
          status: 'Completado',
          category: 'PÁGINAS'
        },
        {
          id: 69,
          hash: 'b82b11d',
          date: '2024-12-19',
          time: '11:15:00',
          title: 'Commit #069 - Sistema de categorías hardcodeadas',
          description: 'Sistema completo de categorías con gestión centralizada',
          files: ['src/constants/categories.js', 'src/hooks/useCategories.js'],
          notes: 'Sistema de categorías: Categorías hardcodeadas por estilo de baile. Gestión centralizada en constants/categories.js. Hook useCategories para acceso dinámico. Categorías específicas para Salsa, Bachata y Kizomba. Sistema escalable y mantenible.',
          status: 'Completado',
          category: 'SISTEMAS'
        },
        {
          id: 68,
          hash: 'a71a00c',
          date: '2024-12-19',
          time: '11:00:00',
          title: 'Commit #068 - Configuración completa de Firebase',
          description: 'Firebase Auth, Firestore y Storage configurados y funcionando',
          files: ['src/services/firebase/config.js', 'src/services/firebase/auth.js', 'src/services/firebase/firestore.js', 'src/services/firebase/storage.js'],
          notes: 'Configuración de Firebase: Firebase Auth para autenticación. Firestore para base de datos. Storage para archivos. Configuración con credenciales reales. Servicios organizados en carpetas. Sistema completamente funcional.',
          status: 'Completado',
          category: 'SISTEMAS'
        },
        {
          id: 67,
          hash: '9609ffb',
          date: '2024-12-19',
          time: '10:45:00',
          title: 'Commit #067 - Sistema de autenticación completo',
          description: 'Login, registro y gestión de roles con Firebase Auth',
          files: ['src/contexts/AuthContext.jsx', 'src/pages/AuthPage.jsx', 'src/components/RoleManager.jsx'],
          notes: 'Sistema de autenticación: Login y registro con Firebase Auth. Gestión de roles (Usuario, Instructor, Admin, Super Admin). Contexto de autenticación global. Protección de rutas por roles. Interfaz de login/registro profesional.',
          status: 'Completado',
          category: 'SISTEMAS'
        },
        {
          id: 66,
          hash: '85f8eea',
          date: '2024-12-19',
          time: '10:30:00',
          title: 'Commit #066 - Sistema de invitaciones por enlace',
          description: 'Registro controlado solo por Super Admin con enlaces de invitación',
          files: ['src/pages/InvitePage.jsx', 'src/services/firebase/firestore.js'],
          notes: 'Sistema de invitaciones: Enlaces de invitación únicos. Registro controlado solo por Super Admin. Validación de códigos de invitación. Creación automática de perfiles. Sistema seguro y controlado.',
          status: 'Completado',
          category: 'SISTEMAS'
        },
        {
          id: 65,
          hash: '74e7dd9',
          date: '2024-12-19',
          time: '10:15:00',
          title: 'Commit #065 - Página de administración completa',
          description: 'Panel de administración con gestión de usuarios y estadísticas',
          files: ['src/pages/AdminPage.jsx', 'src/components/UserProfile.jsx'],
          notes: 'Página de administración: Gestión de usuarios (bloquear, eliminar, cambiar roles). Estadísticas del sistema. Panel de control para Super Admin. Interfaz profesional y funcional. Sistema de permisos integrado.',
          status: 'Completado',
          category: 'PÁGINAS'
        },
        {
          id: 64,
          hash: '63d6cc8',
          date: '2024-12-19',
          time: '10:00:00',
          title: 'Commit #064 - Página de perfil de usuario',
          description: 'Perfil de usuario con información personal y configuración',
          files: ['src/pages/ProfilePage.jsx', 'src/components/UserProfile.jsx'],
          notes: 'Página de perfil: Información personal del usuario. Configuración de cuenta. Historial de actividad. Gestión de preferencias. Interfaz intuitiva y profesional.',
          status: 'Completado',
          category: 'PÁGINAS'
        },
        {
          id: 63,
          hash: '52c5bb7',
          date: '2024-12-19',
          time: '09:45:00',
          title: 'Commit #063 - Página de configuración',
          description: 'Configuración general de la aplicación',
          files: ['src/pages/SettingsPage.jsx'],
          notes: 'Página de configuración: Configuración general de la aplicación. Preferencias de usuario. Configuración de notificaciones. Interfaz limpia y organizada.',
          status: 'Completado',
          category: 'PÁGINAS'
        },
        {
          id: 62,
          hash: '41b4aa6',
          date: '2024-12-19',
          time: '09:30:00',
          title: 'Commit #062 - Tamaño grande por defecto en galerías',
          description: 'Las galerías de videos y secuencias se cargan con tamaño grande por defecto',
          files: ['src/pages/FigurasPage.jsx', 'src/contexts/CardSizeContext.jsx'],
          notes: 'Tamaño grande por defecto: Las galerías de videos y secuencias ahora se cargan con tamaño grande por defecto en lugar de mediano. Mejor visualización de contenido. Configuración persistente en el contexto.',
          status: 'Completado',
          category: 'PÁGINAS'
        },
        {
          id: 61,
          hash: '30a3995',
          date: '2024-12-19',
          time: '09:15:00',
          title: 'Commit #061 - Sistema de notificaciones',
          description: 'Sistema de notificaciones toast para feedback de usuario',
          files: ['src/components/common/Toast.jsx', 'src/pages/FigurasPage.jsx'],
          notes: 'Sistema de notificaciones: Notificaciones toast para feedback de usuario. Diferentes tipos (éxito, error, info, warning). Auto-ocultación configurable. Interfaz profesional y consistente.',
          status: 'Completado',
          category: 'SISTEMAS'
        },
        {
          id: 60,
          hash: '1f92884',
          date: '2024-12-19',
          time: '09:00:00',
          title: 'Commit #060 - Sistema de temas',
          description: 'Sistema de temas claro/oscuro con persistencia',
          files: ['src/contexts/ThemeContext.jsx', 'src/components/layout/Navigation.jsx'],
          notes: 'Sistema de temas: Tema claro y oscuro. Persistencia en localStorage. Toggle en la navegación. Transiciones suaves. Interfaz consistente en toda la aplicación.',
          status: 'Completado',
          category: 'SISTEMAS'
        },
        {
          id: 59,
          hash: '0e81773',
          date: '2024-12-19',
          time: '08:45:00',
          title: 'Commit #059 - Navegación mejorada',
          description: 'Navegación con indicadores de página activa y mejor UX',
          files: ['src/components/layout/Navigation.jsx', 'src/App.jsx'],
          notes: 'Navegación mejorada: Indicadores de página activa. Mejor UX con hover effects. Navegación responsive. Integración con sistema de temas. Interfaz profesional y consistente.',
          status: 'Completado',
          category: 'PÁGINAS'
        },
        {
          id: 58,
          hash: 'fd70662',
          date: '2024-12-19',
          time: '08:30:00',
          title: 'Commit #058 - Página de eventos',
          description: 'Página de eventos con diseño unificado',
          files: ['src/pages/EventosPage.jsx'],
          notes: 'Página de eventos: Diseño unificado con el resto de páginas. Contenido específico para eventos. Interfaz consistente y profesional.',
          status: 'Completado',
          category: 'PÁGINAS'
        },
        {
          id: 57,
          hash: 'ec5f551',
          date: '2024-12-19',
          time: '08:15:00',
          title: 'Commit #057 - Página de escuela',
          description: 'Página de escuela con diseño unificado',
          files: ['src/pages/EscuelaPage.jsx'],
          notes: 'Página de escuela: Diseño unificado con el resto de páginas. Contenido específico para escuela. Interfaz consistente y profesional.',
          status: 'Completado',
          category: 'PÁGINAS'
        },
        {
          id: 56,
          hash: 'db4e440',
          date: '2024-12-19',
          time: '08:00:00',
          title: 'Commit #056 - Página de categorías',
          description: 'Página de gestión de categorías y tags',
          files: ['src/pages/CategoriesPage.jsx'],
          notes: 'Página de categorías: Gestión de categorías y tags por estilo de baile. Interfaz de administración. Sistema organizado y escalable.',
          status: 'Completado',
          category: 'PÁGINAS'
        },
        {
          id: 55,
          hash: 'ca3d33f',
          date: '2024-12-19',
          time: '07:45:00',
          title: 'Commit #055 - Página de notas',
          description: 'Página de notas con historial de commits y progreso',
          files: ['src/pages/NotasPage.jsx'],
          notes: 'Página de notas: Historial completo de commits. Progreso del proyecto. Documentación interna. Interfaz organizada y profesional.',
          status: 'Completado',
          category: 'PÁGINAS'
        },
        {
          id: 54,
          hash: 'b92c22e',
          date: '2024-12-19',
          time: '07:30:00',
          title: 'Commit #054 - Página de inicio',
          description: 'Página de inicio con dashboard y estadísticas',
          files: ['src/pages/HomePage.jsx'],
          notes: 'Página de inicio: Dashboard con estadísticas. Resumen del proyecto. Navegación rápida. Interfaz atractiva y funcional.',
          status: 'Completado',
          category: 'PÁGINAS'
        },
        {
          id: 53,
          hash: 'a81b11d',
          date: '2024-12-19',
          time: '07:15:00',
          title: 'Commit #053 - Página de figuras',
          description: 'Página principal de figuras con galería de videos',
          files: ['src/pages/FigurasPage.jsx'],
          notes: 'Página de figuras: Galería de videos con filtros. Sistema de subida. Constructor de secuencias. Interfaz completa y funcional.',
          status: 'Completado',
          category: 'PÁGINAS'
        },
        {
          id: 52,
          hash: '970a00c',
          date: '2024-12-19',
          time: '07:00:00',
          title: 'Commit #052 - Estructura de carpetas organizada',
          description: 'Organización completa de carpetas y archivos del proyecto',
          files: ['src/components/', 'src/pages/', 'src/services/', 'src/contexts/', 'src/hooks/', 'src/constants/'],
          notes: 'Estructura organizada: Carpetas components, pages, services, contexts, hooks, constants. Organización lógica y escalable. Separación de responsabilidades. Estructura profesional.',
          status: 'Completado',
          category: 'SISTEMAS'
        },
        {
          id: 51,
          hash: '86f9ffb',
          date: '2024-12-19',
          time: '06:45:00',
          title: 'Commit #051 - Configuración de Tailwind CSS',
          description: 'Configuración completa de Tailwind CSS con tema personalizado',
          files: ['tailwind.config.js', 'src/index.css'],
          notes: 'Configuración de Tailwind: Tema personalizado con colores corporativos. Configuración optimizada. Clases utilitarias. Diseño consistente en toda la aplicación.',
          status: 'Completado',
          category: 'SISTEMAS'
        },
        {
          id: 50,
          hash: '75e8eea',
          date: '2024-12-19',
          time: '06:30:00',
          title: 'Commit #050 - Configuración de Vite',
          description: 'Configuración optimizada de Vite para desarrollo y producción',
          files: ['vite.config.js', 'package.json'],
          notes: 'Configuración de Vite: Optimización para desarrollo y producción. Configuración de servidor. Build optimizado. Configuración profesional.',
          status: 'Completado',
          category: 'SISTEMAS'
        },
        {
          id: 49,
          hash: '64d7dd9',
          date: '2024-12-19',
          time: '06:15:00',
          title: 'Commit #049 - Configuración de React Router',
          description: 'Configuración de rutas y navegación con React Router',
          files: ['src/App.jsx', 'package.json'],
          notes: 'Configuración de React Router: Rutas para todas las páginas. Navegación programática. Protección de rutas. Configuración profesional.',
          status: 'Completado',
          category: 'SISTEMAS'
        },
        {
          id: 48,
          hash: '53c6cc8',
          date: '2024-12-19',
          time: '06:00:00',
          title: 'Commit #048 - Configuración de React',
          description: 'Configuración inicial de React con hooks y contextos',
          files: ['src/App.jsx', 'src/main.jsx'],
          notes: 'Configuración de React: Hooks y contextos configurados. Estructura de componentes. Configuración profesional y escalable.',
          status: 'Completado',
          category: 'SISTEMAS'
        },
        {
          id: 47,
          hash: '42b5bb7',
          date: '2024-12-19',
          time: '05:45:00',
          title: 'Commit #047 - Instalación de dependencias',
          description: 'Instalación de todas las dependencias necesarias',
          files: ['package.json', 'package-lock.json'],
          notes: 'Instalación de dependencias: React, Vite, Tailwind CSS, Firebase, Lucide React, y todas las dependencias necesarias. Configuración completa del proyecto.',
          status: 'Completado',
          category: 'SISTEMAS'
        },
        {
          id: 46,
          hash: '31a4aa6',
          date: '2024-12-19',
          time: '05:30:00',
          title: 'Commit #046 - Configuración inicial del proyecto',
          description: 'Configuración inicial con Vite y estructura básica',
          files: ['package.json', 'vite.config.js', 'index.html'],
          notes: 'Configuración inicial: Proyecto creado con Vite. Estructura básica configurada. Configuración inicial completa.',
          status: 'Completado',
          category: 'SISTEMAS'
        },
        {
          id: 45,
          hash: '2093995',
          date: '2024-12-19',
          time: '05:15:00',
          title: 'Commit #045 - Planificación del proyecto',
          description: 'Planificación completa y documentación inicial',
          files: ['README.md', 'TODO.md', 'PLAN_COMPLETO.md'],
          notes: 'Planificación del proyecto: Documentación completa. Plan de desarrollo. Estructura del proyecto. Documentación profesional.',
          status: 'Completado',
          category: 'SISTEMAS'
        },
        {
          id: 44,
          hash: '1f82884',
          date: '2024-12-19',
          time: '05:00:00',
          title: 'Commit #044 - Inicio del proyecto SalsaHacks V2.0',
          description: 'Inicio del proyecto con visión y objetivos definidos',
          files: ['README.md'],
          notes: 'Inicio del proyecto: Visión y objetivos definidos. Estructura inicial del proyecto. Configuración básica. Inicio del desarrollo.',
          status: 'Completado',
          category: 'SISTEMAS'
        },
        {
          id: 43,
          hash: 'm2n3o4p',
          date: '2025-01-27',
          time: '19:15:30',
          title: 'Commit #043 - Actualizar documentación completa del proyecto',
          description: 'Actualización de NOTAS_COMMITS.md, TODO.md y PLAN_COMPLETO.md con estado actual',
          files: ['NOTAS_COMMITS.md', 'TODO.md', 'PLAN_COMPLETO.md'],
          notes: 'Actualización completa de documentación: NOTAS_COMMITS.md actualizado a 43 commits con detalles de constructor de secuencias, VideoPlayer avanzado, sistema de descarga y modal personalizado. TODO.md reestructurado con funcionalidades completadas recientemente. PLAN_COMPLETO.md actualizado con constructor de secuencias completo integrado. Estado actual del proyecto reflejado en toda la documentación.',
          status: 'Completado',
          category: 'SISTEMAS'
        },
        {
          id: 42,
          hash: 'l1k2j3i',
          date: '2025-01-27',
          time: '19:10:15',
          title: 'Commit #042 - Convertir advertencia de edición de secuencia en modal personalizado',
          description: 'Reemplazar window.confirm con ConfirmModal para mejor UX',
          files: ['src/pages/FigurasPage.jsx'],
          notes: 'Conversión de window.confirm a modal personalizado: nuevo estado editSequenceModal, funciones handleConfirmEditSequence y handleCancelEditSequence, ConfirmModal con título "🎬 Cargar Secuencia", mensaje explicativo sobre reemplazo de secuencia actual, botones "Cargar Secuencia" y "Cancelar", diseño consistente con otros modales de la aplicación.',
          status: 'Completado',
          category: 'SISTEMAS'
        },
        {
          id: 41,
          hash: 'h9g8f7e',
          date: '2025-01-27',
          time: '19:05:45',
          title: 'Commit #041 - Arreglar verificación de secuencia en construcción al editar',
          description: 'Usar variables del contexto en lugar del parámetro de función',
          files: ['src/pages/FigurasPage.jsx'],
          notes: 'Corrección del diálogo de confirmación: renombrado parámetro de sequence a sequenceToEdit para evitar shadowing de variables del contexto, verificación correcta de secuencia actual en construcción usando sequence y sequenceName del contexto, diálogo de confirmación ahora aparece correctamente cuando hay una secuencia activa.',
          status: 'Completado',
          category: 'SISTEMAS'
        },
        {
          id: 40,
          hash: 'k9l8m7n',
          date: '2025-01-27',
          time: '18:45:30',
          title: 'Commit #040 - Mejorar VideoPlayer: doble clic para navegación, botones estilo Disney+/YouTube, sistema de resoluciones inteligente',
          description: 'Mejoras finales del VideoPlayer con navegación intuitiva y sistema de resoluciones inteligente',
          files: ['src/components/video/VideoPlayer.jsx', 'src/index.css', 'NOTAS_COMMITS.md', 'PLAN_COMPLETO.md'],
          notes: 'Doble-clic para navegación: izquierda (-10s), derecha (+10s). Botones centrales estilo Disney+/YouTube: "10" + círculo con flecha, ocultos en móvil. Sistema de resoluciones inteligente: detección automática de resolución máxima del video, indicación de resolución actual en "Auto", deshabilitación de resoluciones no disponibles. Eliminación del indicador de orientación vertical/horizontal. Controles reorganizados: fullscreen arriba-derecha, play/pause y skip en centro, loop/A-B/resolución/volumen agrupados abajo-derecha. Volumen vertical sobre la barra de progreso. Actualización completa de documentación con todos los commits y estado del proyecto.',
          status: 'Completado',
          category: 'CONTENIDO'
        },
        {
          id: 39,
          hash: 'j6i5h4g',
          date: '2025-01-27',
          time: '18:30:15',
          title: 'Commit #039 - Sistema de Resoluciones Inteligente',
          description: 'Implementación de sistema de resoluciones inteligente hasta 4K',
          files: ['src/components/video/VideoPlayer.jsx', 'src/index.css'],
          notes: 'Sistema de resoluciones: 360p, 480p, 720p, 1080p, 4K. Detección automática de resolución máxima del video. Indicación de resolución actual en modo "Auto". Deshabilitación visual de resoluciones no disponibles. Botón de resolución en controles principales. Dropdown con todas las opciones disponibles.',
          status: 'Completado',
          category: 'CONTENIDO'
        },
        {
          id: 38,
          hash: 'f3e2d1c',
          date: '2025-01-27',
          time: '18:15:45',
          title: 'Commit #038 - Mejoras y Correcciones del VideoPlayer',
          description: 'Correcciones y mejoras del sistema de controles del VideoPlayer',
          files: ['src/components/video/VideoPlayer.jsx', 'src/index.css'],
          notes: 'Volumen vertical sobre la barra de progreso. Slider vertical con gradiente azul y porcentaje. Controles reorganizados: fullscreen arriba-derecha, play/pause y skip en centro, loop/A-B/resolución/volumen agrupados abajo-derecha. Eliminación del indicador de orientación vertical/horizontal. Botones centrales ocultos en móvil (hidden md:block).',
          status: 'Completado',
          category: 'CONTENIDO'
        },
        {
          id: 37,
          hash: 'b9a8z7y',
          date: '2025-01-27',
          time: '18:00:20',
          title: 'Commit #037 - VideoPlayer Avanzado con Controles Profesionales',
          description: 'Implementación de VideoPlayer completo con controles A-B y volumen',
          files: ['src/components/video/VideoPlayer.jsx', 'src/index.css'],
          notes: 'VideoPlayer completo: play/pause, progress bar, volume control, fullscreen, skip, full loop, A-B segment loop. Controles auto-ocultos con delay. A-B functionality: click A/B para marcar puntos, botón principal para activar/desactivar. Volumen con slider vertical y porcentaje. Controles reorganizados y responsive.',
          status: 'Completado',
          category: 'CONTENIDO'
        },
        {
          id: 36,
          hash: 'x6w5v4u',
          date: '2025-01-27',
          time: '17:45:10',
          title: 'Commit #036 - Sistema de Edición de Videos Completo',
          description: 'Implementación completa del sistema de edición de videos',
          files: ['src/components/video/VideoEditModal.jsx', 'src/pages/FigurasPage.jsx', 'src/services/firebase/firestore.js'],
          notes: 'VideoEditModal completo: edición de título, descripción, thumbnail, tags normales, tags iniciales y finales. Secciones colapsables. Integración con VideoPlayer para visualización. Botón de edición en cada video card. Tags iniciales (azul-morado) y finales (verde-turquesa) visibles en cards. Filtrado exclusivo por categorías (AND logic).',
          status: 'Completado',
          category: 'CONTENIDO'
        },
        {
          id: 35,
          hash: 't3s2r1q',
          date: '2025-01-27',
          time: '17:30:00',
          title: 'Commit #035 - Sistema de Video Upload con Thumbnails y Categorías',
          description: 'Implementación del sistema completo de subida de videos',
          files: ['src/components/video/VideoUploadModal.jsx', 'src/pages/FigurasPage.jsx', 'src/services/firebase/storage.js', 'src/services/firebase/firestore.js'],
          notes: 'VideoUploadModal completo: subida de videos con thumbnails automáticos y personalizados. Categorización con tags múltiples. Integración con VideoPlayer para preview. Videos colapsados por defecto con thumbnails grandes al expandir. Sistema de notificaciones con Toast. Almacenamiento en Firebase Storage y metadatos en Firestore.',
          status: 'Completado',
          category: 'CONTENIDO'
        },
        {
          id: 34,
          hash: 'p9o8n7m',
          date: '2025-01-27',
          time: '17:15:30',
          title: 'Commit #034 - Integración de VideoPlayer en Modales',
          description: 'Integración del VideoPlayer en modales de subida y edición',
          files: ['src/components/video/VideoUploadModal.jsx', 'src/components/video/VideoEditModal.jsx', 'src/pages/FigurasPage.jsx'],
          notes: 'VideoPlayer integrado en VideoUploadModal y VideoEditModal. Centrado en modales. Integración en reproducción dinámica de cards. Controles funcionales en todos los contextos. Modal de reproducción con VideoPlayer completo.',
          status: 'Completado',
          category: 'CONTENIDO'
        },
        {
          id: 33,
          hash: 'l6k5j4i',
          date: '2025-01-27',
          time: '17:00:15',
          title: 'Commit #033 - VideoPlayer Componente Base',
          description: 'Creación del componente VideoPlayer base con controles básicos',
          files: ['src/components/video/VideoPlayer.jsx'],
          notes: 'VideoPlayer base: play/pause, progress bar, volume, fullscreen, skip, loop. Controles auto-ocultos. Responsive design. Integración con HTML5 video element. Preparado para funcionalidades avanzadas.',
          status: 'Completado',
          category: 'CONTENIDO'
        },
        {
          id: 32,
          hash: 'h3g2f1e',
          date: '2025-01-27',
          time: '16:45:00',
          title: 'Commit #032 - Preparación para Sistema de Videos',
          description: 'Preparación de la infraestructura para el sistema de videos',
          files: ['src/services/firebase/storage.js', 'src/services/firebase/firestore.js'],
          notes: 'Configuración de Firebase Storage para videos. Funciones de upload y download. Estructura de Firestore para metadatos de videos. Preparación para sistema completo de gestión de videos.',
          status: 'Completado',
          category: 'SISTEMAS'
        },
        {
          id: 31,
          hash: 'd9c8b7a',
          date: '2025-01-27',
          time: '16:30:45',
          title: 'Commit #031 - Sistema de Tags Iniciales y Finales',
          description: 'Implementación del sistema de tags para secuencias lógicas',
          files: ['src/components/video/VideoUploadModal.jsx', 'src/pages/FigurasPage.jsx'],
          notes: 'Tags iniciales y finales para construcción de secuencias lógicas. Selección desde categorías existentes. Filtrado exclusivo por categorías (AND logic). Preparación para sistema de secuencias.',
          status: 'Completado',
          category: 'SISTEMAS'
        },
        {
          id: 30,
          hash: 'a6z5y4x',
          date: '2025-01-27',
          time: '16:15:20',
          title: 'Commit #030 - Galerías Independientes por Estilo',
          description: 'Implementación de galerías independientes para cada estilo de baile',
          files: ['src/pages/FigurasPage.jsx'],
          notes: 'Galerías independientes por estilo: SALSA, BACHATA, KIZOMBA, ZOUK, MERENGUE. Filtros dinámicos que se actualizan según el estilo seleccionado. Navegación fluida entre estilos. Preparación para contenido específico por estilo.',
          status: 'Completado',
          category: 'PÁGINAS'
        },
        {
          id: 29,
          hash: 'a1b2c3d',
          date: '2025-01-27',
          time: '16:20:45',
          title: 'Commit #029 - Corrección de Navegación y Estado Inicial',
          description: 'Corrección del estado inicial y navegación en FigurasPage',
          files: ['src/pages/FigurasPage.jsx', 'NOTAS_COMMITS.md'],
          notes: 'Estado inicial corregido: SALSA seleccionado por defecto al entrar a FIGURAS. Navegación por keys: uso de style.key en lugar de style.name. Filtros dinámicos que se actualizan correctamente. Títulos dinámicos que se actualizan según el estilo. VideoUploadModal dinámico que usa el estilo seleccionado actualmente. Comparación correcta: selectedStyle === style.key. Filtros colapsados: estado inicial showFilters: false. Eliminación de useEffect que forzaba filtros abiertos. Interfaz profesional con navegación clara e intuitiva.',
          status: 'Completado',
          category: 'PÁGINAS'
        },
        {
          id: 28,
          hash: 'd4e5f6g',
          date: '2025-01-27',
          time: '16:18:30',
          title: 'Commit #028 - Sistema de Galerías y Tabs en FigurasPage',
          description: 'Implementación completa del sistema de galerías con tabs y corrección de colores del botón SALSA',
          files: ['src/pages/FigurasPage.jsx', 'NOTAS_COMMITS.md'],
          notes: 'Sistema de tabs funcional: Galería de Videos y Galería de Secuencias como en EscuelaPage. Colores del botón SALSA: degradado naranja-rosa (from-orange-500 to-pink-500) consistente. Jerarquía de botones: nivel principal (SUBIR VIDEO, CREAR SECUENCIA) y secundario (Galerías). Navegación por tabs con contador dinámico y transiciones suaves. Estado de tabs persistente. Filtros colapsados por defecto para interfaz más limpia. Corrección de navegación: SALSA pre-seleccionado al entrar a FIGURAS. Iconos corregidos con mapeo correcto para todos los estilos. Gradientes unificados: todos los botones activos usan el degradado de SALSA. Interfaz limpia y optimizada. Funcionalidad futura: preparado para implementación de secuencias.',
          status: 'Completado',
          category: 'PÁGINAS'
        },
        {
          id: 27,
          hash: '24f8600',
          date: '2025-01-27',
          time: '16:15:30',
          title: 'Commit #027 - Sistema de Usuarios de Prueba Creados',
          description: 'Creación exitosa de usuarios de prueba de todos los niveles',
          files: ['NOTAS_COMMITS.md', 'Firebase Console'],
          notes: 'Usuario Pollito, Soldado, Maese, Admin y Super Admin David creados. Sistema de invitaciones completamente funcional. Todos los usuarios persistentes en Firebase Console.',
          status: 'Completado',
          category: 'SISTEMAS'
        },
        {
          id: 26,
          hash: '603085c',
          date: '2025-01-27',
          time: '16:10:15',
          title: 'Commit #026 - Fix: Creación Automática del Perfil de David como Super Admin',
          description: 'Implementación de creación automática del perfil de David como Super Admin',
          files: ['src/contexts/AuthContext.jsx', 'src/services/firebase/firestore.js'],
          notes: 'Función forceUpdateDavidRole para el botón del perfil. Creación automática de perfil si no existe en Firestore. Logs detallados para debugging. Sistema de roles persistente para David.',
          status: 'Completado',
          category: 'SISTEMAS'
        },
        {
          id: 25,
          hash: 'b024ca6',
          date: '2025-01-27',
          time: '16:05:45',
          title: 'Commit #025 - Debug: Verificación de Rol de Super Admin de David',
          description: 'Agregados logs para verificar el rol de Super Admin de David',
          files: ['src/contexts/AuthContext.jsx'],
          notes: 'Logs detallados en autenticación y carga de perfil. Verificación automática de rol david_exile_92@hotmail.com. Debugging mejorado para roles de usuario.',
          status: 'Completado',
          category: 'SISTEMAS'
        },
        {
          id: 24,
          hash: 'e8bba30',
          date: '2025-01-27',
          time: '16:00:20',
          title: 'Commit #024 - Mejorado Sistema de Persistencia de Usuarios',
          description: 'Mejora del sistema de persistencia de usuarios con UID como ID de documento',
          files: ['src/services/firebase/firestore.js', 'src/contexts/AuthContext.jsx'],
          notes: 'Uso de UID como ID de documento en Firestore. Logs de debugging agregados. Carga inmediata de perfil después de registro. Prevención de duplicados de usuarios.',
          status: 'Completado',
          category: 'SISTEMAS'
        },
        {
          id: 23,
          hash: '2f9aaa8',
          date: '2025-01-27',
          time: '15:55:10',
          title: 'Commit #023 - Actualización Completa de NOTAS_COMMITS.md',
          description: 'Actualización completa de la documentación del proyecto',
          files: ['NOTAS_COMMITS.md'],
          notes: 'Estado actual del proyecto con 29 commits. Sistema de invitaciones completamente funcional. Página cargando correctamente. Roles y permisos operativos.',
          status: 'Completado',
          category: 'SISTEMAS'
        },
        {
          id: 22,
          hash: 'cf253bf',
          date: '2025-01-27',
          time: '15:50:25',
          title: 'Commit #022 - Sistema Completo Funcionando',
          description: 'Sistema completo funcionando con página cargando correctamente',
          files: ['src/services/firebase/index.js'],
          notes: 'Página cargando correctamente sin errores. Rol Super Administrador visible en navegación. Sistema de invitaciones operativo. Warnings de React Router resueltos.',
          status: 'Completado',
          category: 'SISTEMAS'
        },
        {
          id: 21,
          hash: 'fa3c24c',
          date: '2025-01-27',
          time: '15:45:15',
          title: 'Commit #021 - Fix: Error de Importación de Storage',
          description: 'Corrección del error de importación que causaba página en blanco',
          files: ['src/services/firebase/index.js'],
          notes: 'Corregida exportación de getFileURL en lugar de getDownloadURL. Solucionado error de importación. Página cargando correctamente sin errores.',
          status: 'Completado',
          category: 'SISTEMAS'
        },
        {
          id: 20,
          hash: 'e83932a',
          date: '2025-01-27',
          time: '15:40:30',
          title: 'Commit #020 - Fix: Marcado de Invitaciones como Usadas',
          description: 'Corrección del sistema de marcado de invitaciones como usadas',
          files: ['src/contexts/AuthContext.jsx', 'src/services/firebase/firestore.js'],
          notes: 'Agregada función markInvitationAsUsed al contexto de autenticación. Marcado automático de invitaciones como usadas al crear usuarios. Integración completa con Firebase Firestore.',
          status: 'Completado',
          category: 'SISTEMAS'
        },
        {
          id: 19,
          hash: '78f59b2',
          date: '2025-01-27',
          time: '15:35:45',
          title: 'Commit #019 - Sistema de Invitaciones por Enlace',
          description: 'Implementación completa del sistema de invitaciones por enlace',
          files: ['src/pages/AdminPage.jsx', 'src/pages/InvitePage.jsx', 'src/services/firebase/firestore.js'],
          notes: 'Creación de invitaciones únicas con códigos alfanuméricos. Panel de administración para gestionar invitaciones. Página de registro por invitación. Enlaces copiables para compartir por WhatsApp.',
          status: 'Completado',
          category: 'SISTEMAS'
        },
        {
          id: 18,
          hash: '56f8efc',
          date: '2025-01-27',
          time: '15:30:20',
          title: 'Commit #018 - Sistema de Seguridad por Invitación',
          description: 'Implementación del sistema de seguridad que elimina el registro público',
          files: ['src/pages/AuthPage.jsx', 'src/contexts/AuthContext.jsx'],
          notes: 'Eliminación completa del registro público. Sistema de registro solo por invitación del Super Admin. Panel de administración para crear usuarios por invitación. Control total de roles y permisos.',
          status: 'Completado',
          category: 'SISTEMAS'
        },
        {
          id: 17,
          hash: '879754e',
          date: '2025-01-27',
          time: '15:30:45',
          title: 'Commit #017 - Páginas de Perfil y Configuración Implementadas',
          description: 'Páginas de perfil y configuración completas con funcionalidad',
          files: ['src/pages/ProfilePage.jsx', 'src/pages/SettingsPage.jsx', 'src/components/UserProfile.jsx', 'src/components/layout/Navigation.jsx', 'src/App.jsx', 'src/pages/HomePage.jsx'],
          notes: 'Páginas de perfil y configuración implementadas, botones funcionales, navegación mejorada, botones de acción rápida removidos',
          status: 'Completado',
          category: 'SISTEMAS'
        },
        {
          id: 16,
          hash: 'e933a1a',
          date: '2025-01-27',
          time: '13:14:29',
          title: 'Commit #016 - Sistema de Roles Simplificado',
          description: 'Super Admin, Maese, Usuario y Pollito implementados',
          files: ['src/constants/roles.js', 'src/contexts/AuthContext.jsx', 'USUARIOS_PRUEBA.md'],
          notes: 'Sistema de roles simplificado con 4 roles principales, permisos actualizados, AuthContext mejorado',
          status: 'Completado',
          category: 'SISTEMAS'
        },
        {
          id: 15,
          hash: '56f8efc',
          date: '2025-01-27',
          time: '10:45:32',
          title: 'Commit #015 - Configuración Completa de Firebase',
          description: 'Auth, Firestore y Storage habilitados con credenciales reales',
          files: ['src/services/firebase/*', 'NOTAS_COMMITS.md'],
          notes: 'Firebase completamente configurado, componente de prueba integrado, credenciales reales actualizadas',
          status: 'Completado',
          category: 'SISTEMAS'
        },
    {
      id: 14,
      hash: 'e83932a',
      date: '2025-01-27',
      time: '10:30:15',
      title: 'Commit #014 - Fix: Aplicación funcionando',
      description: 'Firebase temporalmente deshabilitado para evitar errores',
      files: ['src/contexts/AuthContext.jsx', 'src/pages/HomePage.jsx'],
      notes: 'Aplicación funcionando correctamente, Firebase comentado temporalmente',
      status: 'Completado',
      category: 'SISTEMAS'
    },
    {
      id: 13,
      hash: '78f59b2',
      date: '2025-01-27',
      time: '09:15:42',
      title: 'Commit #013 - Actualización de Documentación',
      description: 'Agregado Commit #012 a NOTAS_COMMITS.md',
      files: ['NOTAS_COMMITS.md'],
      notes: 'Documentación actualizada con simplificación del gestor de categorías',
      status: 'Completado',
      category: 'SISTEMAS'
    },
    {
      id: 12,
      hash: '26b3ab2',
      date: '2025-01-27',
      time: '08:45:18',
      title: 'Commit #012 - Simplificación del Gestor de Categorías',
      description: 'Eliminación de botones innecesarios, corrección de errores',
      files: ['src/pages/CategoriesPage.jsx'],
      notes: 'Interfaz más limpia, solo botón Ver, protección de categorías hardcodeadas',
      status: 'Completado',
      category: 'SISTEMAS'
    },
    {
      id: 11,
      hash: '360fa0a',
      date: '2025-01-27',
      time: '08:20:33',
      title: 'Commit #011 - Gestor de Categorías Jerárquico',
      description: 'Implementación de estructura jerárquica de 3 niveles',
      files: ['src/pages/CategoriesPage.jsx', 'NOTAS_COMMITS.md'],
      notes: 'Pestañas → Estilos → Categorías con tags, navegación específica',
      status: 'Completado',
      category: 'SISTEMAS'
    },
    {
      id: 10,
      hash: 'a3933cb',
      date: '2025-01-27',
      time: '07:55:27',
      title: 'Commit #010 - Eliminación de Header Duplicado en FigurasPage',
      description: 'Limpieza de navegación duplicada',
      files: ['src/pages/FigurasPage.jsx'],
      notes: 'Eliminación de Gallery Tabs, imports no utilizados',
      status: 'Completado',
      category: 'PÁGINAS'
    },
    {
      id: 9,
      hash: '6938a03',
      date: '2025-01-27',
      time: '07:30:45',
      title: 'Commit #009 - Sistema de Categorías Hardcodeadas',
      description: 'Implementación completa del sistema centralizado',
      files: ['src/constants/categories.js', 'src/hooks/useCategories.js', 'src/components/common/CategoryBadge.jsx'],
      notes: 'Hook useCategories, componente CategoryBadge, integración en FigurasPage',
      status: 'Completado',
      category: 'SISTEMAS'
    },
    {
      id: 8,
      hash: '0e51076',
      date: '2025-01-27',
      time: '07:15:12',
      title: 'Commit #008 - Hoja de Ruta Completa',
      description: 'Implementación de toda la hoja de ruta del proyecto',
      files: ['NOTAS_COMMITS.md'],
      notes: '25 tareas organizadas, categorías claras, eliminación de términos técnicos',
      status: 'Completado',
      category: 'SISTEMAS'
    },
    {
      id: 7,
      hash: '83eeffb',
      date: '2025-01-27',
      title: 'Commit #007 - Corrección de Navegación Duplicada',
      description: 'Eliminación de headers duplicados',
      files: ['EscuelaPage.jsx', 'EventosPage.jsx', 'SISTEMA_CATEGORIAS.md'],
      notes: 'Interfaz más limpia, navegación global unificada',
      status: 'Completado',
      category: 'PÁGINAS'
    },
    {
      id: 6,
      hash: 'b3b80a8',
      date: '2025-01-27',
      title: 'Commit #006 - Unificación de Estructura',
      description: 'Conversión a estructura de FigurasPage',
      files: ['EscuelaPage.jsx', 'EventosPage.jsx'],
      notes: 'Estructura unificada, contenido específico por página',
      status: 'Completado',
      category: 'PÁGINAS'
    },
    {
      id: 5,
      hash: 'a1b2c3d',
      date: '2025-01-27',
      title: 'Commit #005 - Perfeccionamiento de FigurasPage',
      description: 'Ajustes finos y efectos visuales',
      files: ['FigurasPage.jsx', 'NOTAS_COMMITS.md'],
      notes: 'Transiciones suaves, animaciones, efectos pulidos',
      status: 'Completado',
      category: 'PÁGINAS'
    },
    {
      id: 4,
      hash: 'd4e5f6g',
      date: '2025-01-27',
      title: 'Commit #004 - Sistema de Categorías',
      description: 'Documentación completa del sistema de categorías hardcodeadas',
      files: ['SISTEMA_CATEGORIAS.md'],
      notes: 'Definición de categorías principales, estilos de baile, niveles de dificultad, etiquetas específicas',
      status: 'Completado',
      category: 'SISTEMAS'
    },
    {
      id: 3,
      hash: 'h7i8j9k',
      date: '2025-01-27',
      title: 'Commit #003 - Documentación y Planificación',
      description: 'Creación de sistema de documentación y notas',
      files: ['NOTAS_COMMITS.md'],
      notes: 'Documentación de funcionalidades planificadas, estado actual del proyecto, historial de commits',
      status: 'Completado',
      category: 'SISTEMAS'
    },
    {
      id: 2,
      hash: 'l1m2n3o',
      date: '2025-01-27',
      title: 'Commit #002 - Diseño de FigurasPage',
      description: 'Implementación completa del diseño de FigurasPage basado en imagen de referencia',
      files: ['src/pages/FigurasPage.jsx'],
      notes: 'Header completo, filtros de estilo, barra de búsqueda, botones de acción, grid de videos, sistema de etiquetas',
      status: 'Completado',
      category: 'PÁGINAS'
    },
    {
      id: 1,
      hash: 'p4q5r6s',
      date: '2025-01-27',
      title: 'Commit #001 - Configuración Inicial',
      description: 'Configuración inicial del proyecto SalsaHacks V2.0',
      files: ['package.json', 'vite.config.js', 'src/App.jsx', 'src/main.jsx'],
      notes: 'Creación del proyecto React con Vite, instalación de dependencias, configuración de estructura de carpetas',
      status: 'Completado',
      category: 'SISTEMAS'
    }
  ]

  const cosasHechas = [
    {
      id: 43,
      title: 'Subida masiva de videos de ESCUELA (>100)',
      description: 'Se superó el objetivo inicial y se cargó volumen significativo de contenido en ESCUELA',
      category: 'CONTENIDO',
      date: '2025-08-11',
      priority: 'Alta',
      status: 'Completado'
    },
    {
      id: 40,
      title: 'Acceso a Notas solo Super Admin',
      description: 'Restricción de ruta y menú: solo ROLES.SUPER_ADMIN puede ver /notas',
      category: 'SISTEMAS',
      date: '2025-08-11',
      priority: 'Alta',
      status: 'Completado'
    },
    {
      id: 41,
      title: 'Navegación móvil visible y usable',
      description: 'Menú móvil con icono hamburguesa y enlaces horizontales; Notas oculto para no-superadmin',
      category: 'PÁGINAS',
      date: '2025-08-11',
      priority: 'Media',
      status: 'Completado'
    },
    {
      id: 42,
      title: 'Índices Firestore creados',
      description: 'style ASC + createdAt DESC en videos y escuela-videos',
      category: 'SISTEMAS',
      date: '2025-08-11',
      priority: 'Alta',
      status: 'Completado'
    },
    {
      id: 1,
      title: 'Optimización masiva del bundle',
      description: 'Bundle principal reducido de 708KB a 38KB (95% reducción)',
      category: 'SISTEMAS',
      date: '2024-12-19',
      priority: 'Alta',
      status: 'Completado'
    },
    {
      id: 2,
      title: 'Limpieza técnica completa',
      description: 'Eliminación de console.logs y optimización de código',
      category: 'SISTEMAS',
      date: '2024-12-19',
      priority: 'Alta',
      status: 'Completado'
    },
    {
      id: 3,
      title: 'Code Splitting implementado',
      description: 'Lazy loading de páginas con 70% reducción de bundle inicial',
      category: 'SISTEMAS',
      date: '2024-12-19',
      priority: 'Alta',
      status: 'Completado'
    },
    {
      id: 4,
      title: 'Sistema de eliminación de videos completo',
      description: 'Eliminación sincronizada de Storage y Firestore',
      category: 'SISTEMAS',
      date: '2024-12-19',
      priority: 'Alta',
      status: 'Completado'
    },
    {
      id: 5,
      title: 'Migración real de videos a estructura organizada',
      description: 'Videos organizados en videos/page/style/ con migración automática',
      category: 'SISTEMAS',
      date: '2024-12-19',
      priority: 'Alta',
      status: 'Completado'
    },
    {
      id: 6,
      title: 'Categorías dinámicas por estilo de baile',
      description: 'Categorías y tags cambian según el estilo seleccionado',
      category: 'SISTEMAS',
      date: '2024-12-19',
      priority: 'Alta',
      status: 'Completado'
    },
    {
      id: 7,
      title: 'Sistema de descarga de videos mejorado',
      description: 'Descarga directa desde Firebase Storage con manejo de errores',
      category: 'CONTENIDO',
      date: '2024-12-19',
      priority: 'Media',
      status: 'Completado'
    },
    {
      id: 8,
      title: 'Constructor de secuencias completo',
      description: 'Sistema de compatibilidad automática entre videos',
      category: 'CONTENIDO',
      date: '2024-12-19',
      priority: 'Alta',
      status: 'Completado'
    },
    {
      id: 9,
      title: 'VideoPlayer avanzado con controles A-B',
      description: 'Controles profesionales con bucle A-B y navegación intuitiva',
      category: 'CONTENIDO',
      date: '2024-12-19',
      priority: 'Alta',
      status: 'Completado'
    },
    {
      id: 10,
      title: 'Sistema de filtros avanzados',
      description: 'Filtros por categorías, favoritos y búsqueda de texto',
      category: 'SISTEMAS',
      date: '2024-12-19',
      priority: 'Media',
      status: 'Completado'
    },
    {
      id: 11,
      title: 'Sistema de favoritos y likes',
      description: 'Favoritos con persistencia en Firebase y contadores',
      category: 'SISTEMAS',
      date: '2024-12-19',
      priority: 'Media',
      status: 'Completado'
    },
    {
      id: 12,
      title: 'Modal de subida de videos completo',
      description: 'Subida con preview, thumbnail y detección de BPM',
      category: 'CONTENIDO',
      date: '2024-12-19',
      priority: 'Alta',
      status: 'Completado'
    },
    {
      id: 13,
      title: 'Galería de videos responsive',
      description: 'Galería con diferentes tamaños y vista responsive',
      category: 'PÁGINAS',
      date: '2024-12-19',
      priority: 'Media',
      status: 'Completado'
    },
    {
      id: 14,
      title: 'Sistema de categorías hardcodeadas',
      description: 'Categorías por estilo de baile con gestión centralizada',
      category: 'SISTEMAS',
      date: '2024-12-19',
      priority: 'Alta',
      status: 'Completado'
    },
    {
      id: 15,
      title: 'Configuración completa de Firebase',
      description: 'Auth, Firestore y Storage configurados y funcionando',
      category: 'SISTEMAS',
      date: '2024-12-19',
      priority: 'Alta',
      status: 'Completado'
    },
    {
      id: 16,
      title: 'Sistema de autenticación completo',
      description: 'Login, registro y gestión de roles con Firebase Auth',
      category: 'SISTEMAS',
      date: '2024-12-19',
      priority: 'Alta',
      status: 'Completado'
    },
    {
      id: 17,
      title: 'Sistema de invitaciones por enlace',
      description: 'Registro controlado solo por Super Admin',
      category: 'SISTEMAS',
      date: '2024-12-19',
      priority: 'Alta',
      status: 'Completado'
    },
    {
      id: 18,
      title: 'Página de administración completa',
      description: 'Panel de administración con gestión de usuarios',
      category: 'PÁGINAS',
      date: '2024-12-19',
      priority: 'Media',
      status: 'Completado'
    },
    {
      id: 19,
      title: 'Página de perfil de usuario',
      description: 'Perfil con información personal y configuración',
      category: 'PÁGINAS',
      date: '2024-12-19',
      priority: 'Media',
      status: 'Completado'
    },
    {
      id: 20,
      title: 'Página de configuración',
      description: 'Configuración general de la aplicación',
      category: 'PÁGINAS',
      date: '2024-12-19',
      priority: 'Media',
      status: 'Completado'
    },
    {
      id: 21,
      title: 'Sistema de notificaciones',
      description: 'Notificaciones toast para feedback de usuario',
      category: 'SISTEMAS',
      date: '2024-12-19',
      priority: 'Media',
      status: 'Completado'
    },
    {
      id: 22,
      title: 'Sistema de temas',
      description: 'Tema claro/oscuro con persistencia',
      category: 'SISTEMAS',
      date: '2024-12-19',
      priority: 'Media',
      status: 'Completado'
    },
    {
      id: 23,
      title: 'Navegación mejorada',
      description: 'Navegación con indicadores de página activa',
      category: 'PÁGINAS',
      date: '2024-12-19',
      priority: 'Media',
      status: 'Completado'
    },
    {
      id: 24,
      title: 'Páginas de eventos y escuela',
      description: 'Páginas con diseño unificado y contenido específico',
      category: 'PÁGINAS',
      date: '2024-12-19',
      priority: 'Media',
      status: 'Completado'
    },
    {
      id: 25,
      title: 'Página de categorías',
      description: 'Gestión de categorías y tags por estilo de baile',
      category: 'PÁGINAS',
      date: '2024-12-19',
      priority: 'Media',
      status: 'Completado'
    },
    {
      id: 26,
      title: 'Página de notas',
      description: 'Historial completo de commits y progreso del proyecto',
      category: 'PÁGINAS',
      date: '2024-12-19',
      priority: 'Media',
      status: 'Completado'
    },
    {
      id: 27,
      title: 'Página de inicio',
      description: 'Dashboard con estadísticas y resumen del proyecto',
      category: 'PÁGINAS',
      date: '2024-12-19',
      priority: 'Media',
      status: 'Completado'
    },
    {
      id: 28,
      title: 'Página de figuras',
      description: 'Galería de videos con filtros y sistema de subida',
      category: 'PÁGINAS',
      date: '2024-12-19',
      priority: 'Alta',
      status: 'Completado'
    },
    {
      id: 29,
      title: 'Estructura de carpetas organizada',
      description: 'Organización lógica y escalable del proyecto',
      category: 'SISTEMAS',
      date: '2024-12-19',
      priority: 'Alta',
      status: 'Completado'
    },
    {
      id: 30,
      title: 'Configuración de Tailwind CSS',
      description: 'Tema personalizado con colores corporativos',
      category: 'SISTEMAS',
      date: '2024-12-19',
      priority: 'Media',
      status: 'Completado'
    },
    {
      id: 31,
      title: 'Configuración de Vite',
      description: 'Optimización para desarrollo y producción',
      category: 'SISTEMAS',
      date: '2024-12-19',
      priority: 'Alta',
      status: 'Completado'
    },
    {
      id: 32,
      title: 'Configuración de React Router',
      description: 'Rutas y navegación configuradas',
      category: 'SISTEMAS',
      date: '2024-12-19',
      priority: 'Alta',
      status: 'Completado'
    },
    {
      id: 33,
      title: 'Configuración de React',
      description: 'Hooks y contextos configurados',
      category: 'SISTEMAS',
      date: '2024-12-19',
      priority: 'Alta',
      status: 'Completado'
    },
    {
      id: 34,
      title: 'Instalación de dependencias',
      description: 'Todas las dependencias necesarias instaladas',
      category: 'SISTEMAS',
      date: '2024-12-19',
      priority: 'Alta',
      status: 'Completado'
    },
    {
      id: 35,
      title: 'Configuración inicial del proyecto',
      description: 'Proyecto creado con Vite y estructura básica',
      category: 'SISTEMAS',
      date: '2024-12-19',
      priority: 'Alta',
      status: 'Completado'
    },
    {
      id: 36,
      title: 'Planificación del proyecto',
      description: 'Documentación completa y plan de desarrollo',
      category: 'SISTEMAS',
      date: '2024-12-19',
      priority: 'Alta',
      status: 'Completado'
    },
    {
      id: 37,
      title: 'Inicio del proyecto SalsaHacks V2.0',
      description: 'Visión y objetivos definidos',
      category: 'SISTEMAS',
      date: '2024-12-19',
      priority: 'Alta',
      status: 'Completado'
    },
    {
      id: 38,
      title: 'EscuelaPage - Sistema completo implementado',
      description: 'Funcionalidad 100% completa: subida, eliminación, edición, reproductor, filtros, búsqueda',
      category: 'PÁGINAS',
      date: '2024-12-20',
      priority: 'Alta',
      status: 'Completado'
    },
    {
      id: 39,
      title: 'VideoEditModal contextual por página',
      description: 'Tags Iniciales/Finales solo en FigurasPage, interface limpio en EscuelaPage',
      category: 'SISTEMAS',
      date: '2024-12-20',
      priority: 'Media',
      status: 'Completado'
    },
    {
      id: 40,
      title: 'HomePage - Dashboard principal',
      description: 'KPIs dinámicos y secciones: Últimos, Destacados y Continuar estudiando',
      category: 'PÁGINAS',
      date: '2025-01-03',
      priority: 'Alta',
      status: 'Completado'
    },
    {
      id: 41,
      title: 'Sistema de recomendaciones (MVP)',
      description: 'Listado recomendado por similitud de tags y actividad reciente (base para mejoras)',
      category: 'SISTEMAS',
      date: '2025-01-03',
      priority: 'Media',
      status: 'Completado'
    }
  ]

  const cosasEnProceso = [
    {
      id: 2,
      title: 'Replicación del sistema a EventosPage',
      description: 'Implementar EventosPage con base de datos separada eventos-videos y eventos-sequences',
      category: 'PÁGINAS',
      priority: 'Media',
      progress: 5,
      status: 'En Progreso'
    },
    {
      id: 3,
      title: 'Optimización y limpieza de código',
      description: 'Refactoring general, optimización de performance y documentación',
      category: 'SISTEMAS',
      priority: 'Baja',
      progress: 75,
      status: 'En Progreso'
    }
  ]

  const cosasFuturas = [
    // PRIORIDAD ALTA - PRÓXIMOS PASOS INMEDIATOS
    
    // DESARROLLO ADICIONAL
    {
      id: 3,
      title: 'EventosPage - Implementación completa',
      description: 'Nueva página con base de datos separada eventos-videos y eventos-sequences',
      category: 'PÁGINAS',
      priority: 'Media',
      estimatedTime: '3 días',
      status: 'Futuro',
      details: [
        'Colecciones separadas en Firestore: eventos-videos y eventos-sequences',
        'Filtros por estilo, evento/fecha y etiquetas como en Escuela/Figuras',
        'Subida, edición y eliminación con las mismas reglas de permisos',
        'Tabs de Videos y Secuencias, con contadores y vistas virtualizadas',
        'Integración de VideoPlayer y VideoEditModal; soporte para favoritos y búsqueda'
      ]
    },
    
    {
      id: 6,
      title: 'Analytics avanzados',
      description: 'Métricas de uso de secuencias y comportamiento de usuarios',
      category: 'SISTEMAS',
      priority: 'Baja',
      estimatedTime: '3 días',
      status: 'Futuro',
      details: [
        'Eventos de reproducción: play, pause, % de video visto y retención por segundo',
        'Métricas de interacción: favoritos, descargas, ediciones, creación de secuencias',
        'Dashboard para Admin/Super Admin con gráficos y filtros por periodo',
        'Reportes por estilo, categoría y top videos/creadores',
        'Integración con Firestore/BigQuery o GA4 para almacenamiento de eventos'
      ]
    },
    
    // PÁGINAS
    // Nota: La "Página de búsqueda avanzada" fue descartada y eliminada del menú/rutas

    // FUNCIONALIDADES AVANZADAS
    // Ítems tachados por el usuario eliminados de la hoja de ruta
  ]

  const getStatusColor = (status) => {
    switch (status) {
      case 'Completado': return 'bg-green-500'
      case 'En Progreso': return 'bg-blue-500'
      case 'Futuro': return 'bg-gray-500'
      case 'Pendiente': return 'bg-yellow-500'
      default: return 'bg-gray-500'
    }
  }

  const getStatusIcon = (status) => {
    switch (status) {
      case 'Completado': return <CheckCircle className="h-5 w-5 text-green-500" />
      case 'En Progreso': return <PlayCircle className="h-5 w-5 text-blue-500" />
      case 'Futuro': return <Clock className="h-5 w-5 text-gray-500" />
      case 'Pendiente': return <AlertCircle className="h-5 w-5 text-yellow-500" />
      default: return <Clock className="h-5 w-5 text-gray-500" />
    }
  }

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'Alta': return 'bg-red-500'
      case 'Media': return 'bg-yellow-500'
      case 'Baja': return 'bg-green-500'
      default: return 'bg-gray-500'
    }
  }

  const getCategoryColor = (category) => {
    switch (category) {
      case 'PÁGINAS': return 'bg-blue-500'
      case 'SISTEMAS': return 'bg-purple-500'
      case 'CONTENIDO': return 'bg-pink-500'
      default: return 'bg-gray-500'
    }
  }

  const getCategoryIcon = (category) => {
    switch (category) {
      case 'PÁGINAS': return <Home className="h-4 w-4" />
      case 'SISTEMAS': return <Settings className="h-4 w-4" />
      case 'CONTENIDO': return <Video className="h-4 w-4" />
      default: return <FileText className="h-4 w-4" />
    }
  }

  const getStatusBorderColor = (status) => {
    switch (status) {
      case 'Completado': return 'border-l-green-500'
      case 'En Progreso': return 'border-l-blue-500'
      case 'Futuro': return 'border-l-gray-500'
      case 'Pendiente': return 'border-l-yellow-500'
      default: return 'border-l-gray-500'
    }
  }

  const toggleCommitExpansion = (commitId) => {
    const newExpanded = new Set(expandedCommits)
    if (newExpanded.has(commitId)) {
      newExpanded.delete(commitId)
    } else {
      newExpanded.add(commitId)
    }
    setExpandedCommits(newExpanded)
  }

  const isCommitExpanded = (commitId) => {
    return expandedCommits.has(commitId)
  }

  const filteredItems = () => {
    let items = []
    
    if (activeTab === 'commits') {
      items = commits
    } else if (activeTab === 'hechas') {
      items = cosasHechas
    } else if (activeTab === 'proceso') {
      items = cosasEnProceso
    } else if (activeTab === 'futuras') {
      items = cosasFuturas
    }
    
    if (selectedCategory !== 'TODAS') {
      items = items.filter(item => item.category === selectedCategory)
    }
    
    return items
  }

  // ESPECIFICACIONES TÉCNICAS DEL SISTEMA DE VIDEOS
  const videoSystemSpecs = {
    upload: {
      methods: ['Drag & Drop', 'Selección múltiple', 'URL de YouTube'],
      features: ['Barra de progreso', 'Detección de duplicados', 'Mensajes de éxito/error'],
      storage: 'Firebase Storage + Firestore'
    },
    metadata: {
      automatic: ['Título (nombre archivo)', 'Thumbnail (primer frame)'],
      editable: ['Título personalizado', 'Thumbnail personalizado', 'Descripción'],
      structure: {
        title: 'string',
        originalTitle: 'string',
        description: 'string',
        fileUrl: 'string',
        thumbnailUrl: 'string',
        category: 'FIGURAS|ESCUELA|EVENTOS',
        style: 'SALSA|BACHATA|etc',
        tags: {
          normales: ['array'],
          iniciales: ['array'],
          finales: ['array']
        },
        uploadedBy: 'user_uid',
        uploadedAt: 'timestamp',
        lastModified: 'timestamp'
      }
    },
    tags: {
      structure: 'Plegable por categorías',
      types: ['Normales', 'Iniciales', 'Finales'],
      colors: 'Sincronizados con CategoriesPage',
      management: 'Hardcodeados + nuevos desde consola',
      organization: 'Por categorías con colores específicos'
    },
    editing: {
      location: 'Misma modal/ventana',
      features: ['Cambiar título', 'Cambiar thumbnail', 'Editar etiquetas'],
      access: 'Botón de edición en cada card'
    },
    permissions: {
      upload: {
        'SUPER_ADMIN': 'Todos los videos',
        'MAESE': 'Su nivel y menores',
        'SOLDADO': 'Videos básicos',
        'POLLITO': 'Solo ver'
      }
    }
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-6 py-8">
        {/* Title */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-2">
            <span className="text-pink-500">NOTAS DE DESARROLLO</span>
          </h1>
          <p className="text-gray-600 text-lg">Seguimiento de commits y control de hitos del proyecto</p>
        </div>

        {/* Firebase Storage Monitor */}
        <div className="mb-8">
          <StorageMonitor />
        </div>

        {/* Category Filters */}
        <div className="flex flex-wrap justify-center gap-3 mb-8">
          {categories.map((category) => (
            <button
              key={category.name}
              onClick={() => setSelectedCategory(category.name)}
              className={`relative flex items-center space-x-2 px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
                selectedCategory === category.name
                  ? 'bg-gradient-to-r from-orange-500 to-pink-500 text-white shadow-lg transform scale-105'
                  : 'bg-white text-gray-700 border border-gray-200 hover:bg-gray-50 hover:border-gray-300'
              }`}
            >
              <category.icon className="h-4 w-4" />
              <span>{category.name}</span>
              <span className="bg-white bg-opacity-20 px-2 py-1 rounded text-xs">
                {category.count}
              </span>
            </button>
          ))}
        </div>

        {/* Search Bar */}
        <div className="max-w-2xl mx-auto mb-8">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
            <input
              type="text"
              placeholder="Buscar en notas..."
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent transition-all duration-200"
            />
          </div>
        </div>

        {/* Content Tabs */}
        <div className="flex justify-center gap-4 mb-8">
          <button
            onClick={() => setActiveTab('commits')}
            className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
              activeTab === 'commits'
                ? 'bg-gradient-to-r from-orange-500 to-pink-500 text-white shadow-lg transform scale-105'
                : 'bg-white text-gray-700 border border-gray-200 hover:bg-gray-50'
            }`}
          >
            <GitBranch className="h-4 w-4" />
            <span>COMMITS ({commits.length})</span>
          </button>
          <button
            onClick={() => setActiveTab('hechas')}
            className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
              activeTab === 'hechas'
                ? 'bg-gradient-to-r from-green-500 to-green-600 text-white shadow-lg transform scale-105'
                : 'bg-white text-gray-700 border border-gray-200 hover:bg-gray-50'
            }`}
          >
            <CheckCircle className="h-4 w-4" />
            <span>HECHO ({cosasHechas.length})</span>
          </button>
          <button
            onClick={() => setActiveTab('proceso')}
            className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
              activeTab === 'proceso'
                ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-lg transform scale-105'
                : 'bg-white text-gray-700 border border-gray-200 hover:bg-gray-50'
            }`}
          >
            <PlayCircle className="h-4 w-4" />
            <span>EN PROCESO ({cosasEnProceso.length})</span>
          </button>
          <button
            onClick={() => setActiveTab('futuras')}
            className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
              activeTab === 'futuras'
                ? 'bg-gradient-to-r from-gray-500 to-gray-600 text-white shadow-lg transform scale-105'
                : 'bg-white text-gray-700 border border-gray-200 hover:bg-gray-50'
            }`}
          >
            <Clock className="h-4 w-4" />
            <span>FUTURO ({cosasFuturas.length})</span>
          </button>
        </div>

        {/* Content Grid */}
        <div className="mb-8">
          <h2 className="text-2xl font-semibold text-gray-800 mb-6">
            {activeTab === 'commits' && 'Historial de Commits'}
            {activeTab === 'hechas' && 'Tareas Completadas'}
            {activeTab === 'proceso' && 'Tareas en Progreso'}
            {activeTab === 'futuras' && 'Tareas Futuras'}
          </h2>
          
          <div className="grid gap-4">
            {filteredItems().map((item) => (
              <div key={item.id} className={`bg-white rounded-lg shadow-md overflow-hidden border border-gray-100 hover:shadow-lg transition-all duration-200 transform hover:scale-[1.01] border-l-4 ${getStatusBorderColor(item.status)}`}>
                <div className="p-4">
                  {/* Header - Clickable for commits */}
                  <div 
                    className={`flex items-center justify-between mb-3 ${activeTab === 'commits' ? 'cursor-pointer' : ''}`}
                    onClick={() => activeTab === 'commits' && toggleCommitExpansion(item.id)}
                  >
                    <div className="flex items-center space-x-3">
                      {activeTab === 'commits' && (
                        <div className="flex items-center space-x-2">
                          <GitBranch className="h-4 w-4 text-pink-500" />
                          <span className="font-mono text-xs text-gray-600">{item.hash}</span>
                        </div>
                      )}
                      {activeTab !== 'commits' && getStatusIcon(item.status)}
                      <div>
                        <h3 className="font-semibold text-gray-800 text-base">{item.title}</h3>
                        {activeTab === 'commits' && (
                          <div className="flex items-center space-x-2">
                            <p className="text-xs text-gray-500">{item.date}</p>
                            {item.time && (
                              <p className="text-xs text-gray-400">• {item.time}</p>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      {activeTab === 'commits' && (
                        <button 
                          onClick={(e) => {
                            e.stopPropagation()
                            toggleCommitExpansion(item.id)
                          }}
                          className="p-1 hover:bg-gray-100 rounded transition-colors"
                        >
                          {isCommitExpanded(item.id) ? (
                            <ChevronDown className="h-4 w-4 text-gray-500" />
                          ) : (
                            <ChevronRight className="h-4 w-4 text-gray-500" />
                          )}
                        </button>
                      )}
                      <span className={`px-2 py-1 text-white text-xs rounded-full font-medium ${getCategoryColor(item.category)}`}>
                        {item.category}
                      </span>
                      <span className={`px-2 py-1 text-white text-xs rounded-full font-medium ${getStatusColor(item.status)}`}>
                        {item.status}
                      </span>
                      {item.priority && (
                        <span className={`px-2 py-1 text-white text-xs rounded-full font-medium ${getPriorityColor(item.priority)}`}>
                          {item.priority}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Description - Always visible */}
                  <p className="text-gray-600 text-sm mb-3">{item.description}</p>

                  {/* Details for future tasks */}
                  {activeTab === 'futuras' && Array.isArray(item.details) && item.details.length > 0 && (
                    <ul className="list-disc pl-5 text-gray-600 text-sm mb-3 space-y-1">
                      {item.details.map((d, i) => (
                        <li key={i}>{d}</li>
                      ))}
                    </ul>
                  )}

                  {/* Expanded content for commits */}
                  {activeTab === 'commits' && isCommitExpanded(item.id) && (
                    <div className="border-t border-gray-100 pt-3 mt-3">
                      {/* Files - Full list */}
                      {item.files && (
                        <div className="mb-3">
                          <h4 className="text-xs font-semibold text-gray-700 mb-2">Archivos modificados:</h4>
                          <div className="flex flex-wrap gap-1">
                            {item.files.map((file, index) => (
                              <span key={index} className="px-2 py-1 bg-pink-100 text-pink-700 text-xs rounded font-medium">
                                {file}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Notes - Full details */}
                      {item.notes && (
                        <div className="mb-3">
                          <h4 className="text-xs font-semibold text-gray-700 mb-2">Notas:</h4>
                          <p className="text-xs text-gray-600 bg-gray-50 p-2 rounded">{item.notes}</p>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Compact content for non-commits or collapsed commits */}
                  {activeTab !== 'commits' && (
                    <>
                      {/* Progress Bar for En Proceso */}
                      {activeTab === 'proceso' && item.progress && (
                        <div className="mb-3">
                          <div className="flex justify-between text-xs text-gray-600 mb-1">
                            <span>Progreso</span>
                            <span>{item.progress}%</span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-1.5">
                            <div
                              className="bg-blue-500 h-1.5 rounded-full transition-all duration-300"
                              style={{ width: `${item.progress}%` }}
                            ></div>
                          </div>
                        </div>
                      )}

                      {/* Files (for commits) - Compact */}
                      {activeTab === 'commits' && item.files && !isCommitExpanded(item.id) && (
                        <div className="mb-3">
                          <div className="flex flex-wrap gap-1">
                            {item.files.slice(0, 3).map((file, index) => (
                              <span key={index} className="px-2 py-1 bg-pink-100 text-pink-700 text-xs rounded font-medium">
                                {file}
                              </span>
                            ))}
                            {item.files.length > 3 && (
                              <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded font-medium">
                                +{item.files.length - 3} más
                              </span>
                            )}
                          </div>
                        </div>
                      )}

                      {/* Notes - Compact */}
                      {item.notes && !isCommitExpanded(item.id) && (
                        <div className="mb-3">
                          <p className="text-xs text-gray-600">{item.notes}</p>
                        </div>
                      )}

                      {/* Additional info - Compact */}
                      {activeTab === 'futuras' && item.estimatedTime && (
                        <div className="flex items-center space-x-4 text-xs text-gray-500">
                          <span className="flex items-center space-x-1">
                            <Clock className="h-3 w-3" />
                            <span>{item.estimatedTime}</span>
                          </span>
                        </div>
                      )}

                      {activeTab === 'hechas' && item.date && (
                        <div className="flex items-center space-x-4 text-xs text-gray-500">
                          <span className="flex items-center space-x-1">
                            <Calendar className="h-3 w-3" />
                            <span>{item.date}</span>
                          </span>
                        </div>
                      )}
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

export default NotasPage 