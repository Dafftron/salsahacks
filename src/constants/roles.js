// Configuración de roles y permisos del sistema
export const ROLES = {
  SUPER_ADMIN: 'super_admin',
  MAESE: 'maese',
  USER: 'user',
  POLLITO: 'pollito'
}

export const ROLE_LABELS = {
  [ROLES.SUPER_ADMIN]: 'Super Administrador',
  [ROLES.MAESE]: 'Maese',
  [ROLES.USER]: 'Soldado',
  [ROLES.POLLITO]: 'Pollito'
}

export const ROLE_COLORS = {
  [ROLES.SUPER_ADMIN]: 'bg-purple-600 text-white',
  [ROLES.MAESE]: 'bg-red-500 text-white',
  [ROLES.USER]: 'bg-green-500 text-white',
  [ROLES.POLLITO]: 'bg-yellow-400 text-gray-800'
}

// Orden de importancia (de menor a mayor)
export const ROLE_HIERARCHY = {
  [ROLES.POLLITO]: 1,    // Más pequeño
  [ROLES.USER]: 2,       // Segundo
  [ROLES.MAESE]: 3,      // Tercero
  [ROLES.SUPER_ADMIN]: 4 // Mayor
}

// Permisos por funcionalidad (simplificados por ahora)
export const PERMISSIONS = {
  // Gestión de usuarios
  MANAGE_USERS: [ROLES.SUPER_ADMIN, ROLES.MAESE],
  VIEW_USERS: [ROLES.SUPER_ADMIN, ROLES.MAESE],
  
  // Gestión de contenido
  CREATE_CONTENT: [ROLES.SUPER_ADMIN, ROLES.MAESE],
  EDIT_CONTENT: [ROLES.SUPER_ADMIN, ROLES.MAESE],
  DELETE_CONTENT: [ROLES.SUPER_ADMIN],
  PUBLISH_CONTENT: [ROLES.SUPER_ADMIN, ROLES.MAESE],
  
  // Gestión de eventos
  CREATE_EVENTS: [ROLES.SUPER_ADMIN, ROLES.MAESE],
  EDIT_EVENTS: [ROLES.SUPER_ADMIN, ROLES.MAESE],
  DELETE_EVENTS: [ROLES.SUPER_ADMIN],
  MANAGE_EVENTS: [ROLES.SUPER_ADMIN, ROLES.MAESE],
  
  // Gestión de figuras
  CREATE_FIGURES: [ROLES.SUPER_ADMIN, ROLES.MAESE],
  EDIT_FIGURES: [ROLES.SUPER_ADMIN, ROLES.MAESE],
  DELETE_FIGURES: [ROLES.SUPER_ADMIN],
  
  // Gestión de escuela
  CREATE_LESSONS: [ROLES.SUPER_ADMIN, ROLES.MAESE],
  EDIT_LESSONS: [ROLES.SUPER_ADMIN, ROLES.MAESE],
  DELETE_LESSONS: [ROLES.SUPER_ADMIN],
  
  // Acceso a contenido
  ACCESS_PREMIUM_CONTENT: [ROLES.SUPER_ADMIN, ROLES.MAESE, ROLES.USER],
  ACCESS_BASIC_CONTENT: [ROLES.SUPER_ADMIN, ROLES.MAESE, ROLES.USER, ROLES.POLLITO],
  ACCESS_PUBLIC_CONTENT: [ROLES.SUPER_ADMIN, ROLES.MAESE, ROLES.USER, ROLES.POLLITO],
  
  // Gestión del sistema
  MANAGE_SYSTEM: [ROLES.SUPER_ADMIN],
  VIEW_ANALYTICS: [ROLES.SUPER_ADMIN, ROLES.MAESE],
  MANAGE_CATEGORIES: [ROLES.SUPER_ADMIN, ROLES.MAESE],
  
  // Funcionalidades específicas
  UPLOAD_VIDEOS: [ROLES.SUPER_ADMIN, ROLES.MAESE],
  DOWNLOAD_VIDEOS: [ROLES.SUPER_ADMIN],
  UPLOAD_IMAGES: [ROLES.SUPER_ADMIN, ROLES.MAESE, ROLES.USER],
  COMMENT_CONTENT: [ROLES.SUPER_ADMIN, ROLES.MAESE, ROLES.USER],
  RATE_CONTENT: [ROLES.SUPER_ADMIN, ROLES.MAESE, ROLES.USER],
  
  // Notificaciones
  SEND_NOTIFICATIONS: [ROLES.SUPER_ADMIN, ROLES.MAESE],
  RECEIVE_NOTIFICATIONS: [ROLES.SUPER_ADMIN, ROLES.MAESE, ROLES.USER]
}

// Función para verificar permisos
export const hasPermission = (userRole, permission) => {
  if (!userRole || !PERMISSIONS[permission]) return false
  return PERMISSIONS[permission].includes(userRole)
}

// Función para obtener todos los permisos de un rol
export const getRolePermissions = (userRole) => {
  if (!userRole) return []
  
  return Object.keys(PERMISSIONS).filter(permission => 
    PERMISSIONS[permission].includes(userRole)
  )
}

// Niveles de acceso por página
export const PAGE_ACCESS = {
  '/': [ROLES.SUPER_ADMIN, ROLES.MAESE, ROLES.USER, ROLES.POLLITO],
  '/figuras': [ROLES.SUPER_ADMIN, ROLES.MAESE, ROLES.USER, ROLES.POLLITO],
  '/escuela': [ROLES.SUPER_ADMIN, ROLES.MAESE, ROLES.USER, ROLES.POLLITO],
  '/eventos': [ROLES.SUPER_ADMIN, ROLES.MAESE, ROLES.USER, ROLES.POLLITO],
  '/categorias': [ROLES.SUPER_ADMIN, ROLES.MAESE, ROLES.USER, ROLES.POLLITO],
  '/notas': [ROLES.SUPER_ADMIN],
  '/admin': [ROLES.SUPER_ADMIN, ROLES.MAESE],
  '/auth': [ROLES.SUPER_ADMIN, ROLES.MAESE, ROLES.USER, ROLES.POLLITO]
}

// Función para verificar acceso a página
export const hasPageAccess = (userRole, pagePath) => {
  if (!userRole || !PAGE_ACCESS[pagePath]) return false
  return PAGE_ACCESS[pagePath].includes(userRole)
}

// Configuración de roles por defecto
export const DEFAULT_ROLE = ROLES.USER

// Roles que pueden ser asignados por administradores
export const ASSIGNABLE_ROLES = {
  [ROLES.SUPER_ADMIN]: [ROLES.SUPER_ADMIN, ROLES.MAESE, ROLES.USER, ROLES.POLLITO],
  [ROLES.MAESE]: [ROLES.USER, ROLES.POLLITO]
} 