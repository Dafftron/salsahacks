// Configuración de roles y permisos del sistema
export const ROLES = {
  ADMIN: 'admin',
  INSTRUCTOR: 'instructor', 
  PREMIUM: 'premium',
  USER: 'user',
  GUEST: 'guest'
}

export const ROLE_LABELS = {
  [ROLES.ADMIN]: 'Administrador',
  [ROLES.INSTRUCTOR]: 'Instructor',
  [ROLES.PREMIUM]: 'Usuario Premium',
  [ROLES.USER]: 'Usuario',
  [ROLES.GUEST]: 'Invitado'
}

export const ROLE_COLORS = {
  [ROLES.ADMIN]: 'bg-red-500 text-white',
  [ROLES.INSTRUCTOR]: 'bg-blue-500 text-white',
  [ROLES.PREMIUM]: 'bg-purple-500 text-white',
  [ROLES.USER]: 'bg-green-500 text-white',
  [ROLES.GUEST]: 'bg-gray-500 text-white'
}

// Permisos por funcionalidad
export const PERMISSIONS = {
  // Gestión de usuarios
  MANAGE_USERS: [ROLES.ADMIN],
  VIEW_USERS: [ROLES.ADMIN, ROLES.INSTRUCTOR],
  
  // Gestión de contenido
  CREATE_CONTENT: [ROLES.ADMIN, ROLES.INSTRUCTOR],
  EDIT_CONTENT: [ROLES.ADMIN, ROLES.INSTRUCTOR],
  DELETE_CONTENT: [ROLES.ADMIN],
  PUBLISH_CONTENT: [ROLES.ADMIN, ROLES.INSTRUCTOR],
  
  // Gestión de eventos
  CREATE_EVENTS: [ROLES.ADMIN, ROLES.INSTRUCTOR],
  EDIT_EVENTS: [ROLES.ADMIN, ROLES.INSTRUCTOR],
  DELETE_EVENTS: [ROLES.ADMIN],
  MANAGE_EVENTS: [ROLES.ADMIN, ROLES.INSTRUCTOR],
  
  // Gestión de figuras
  CREATE_FIGURES: [ROLES.ADMIN, ROLES.INSTRUCTOR],
  EDIT_FIGURES: [ROLES.ADMIN, ROLES.INSTRUCTOR],
  DELETE_FIGURES: [ROLES.ADMIN],
  
  // Gestión de escuela
  CREATE_LESSONS: [ROLES.ADMIN, ROLES.INSTRUCTOR],
  EDIT_LESSONS: [ROLES.ADMIN, ROLES.INSTRUCTOR],
  DELETE_LESSONS: [ROLES.ADMIN],
  
  // Acceso a contenido
  ACCESS_PREMIUM_CONTENT: [ROLES.ADMIN, ROLES.INSTRUCTOR, ROLES.PREMIUM],
  ACCESS_BASIC_CONTENT: [ROLES.ADMIN, ROLES.INSTRUCTOR, ROLES.PREMIUM, ROLES.USER],
  ACCESS_PUBLIC_CONTENT: [ROLES.ADMIN, ROLES.INSTRUCTOR, ROLES.PREMIUM, ROLES.USER, ROLES.GUEST],
  
  // Gestión del sistema
  MANAGE_SYSTEM: [ROLES.ADMIN],
  VIEW_ANALYTICS: [ROLES.ADMIN, ROLES.INSTRUCTOR],
  MANAGE_CATEGORIES: [ROLES.ADMIN, ROLES.INSTRUCTOR],
  
  // Funcionalidades específicas
  UPLOAD_VIDEOS: [ROLES.ADMIN, ROLES.INSTRUCTOR],
  UPLOAD_IMAGES: [ROLES.ADMIN, ROLES.INSTRUCTOR, ROLES.PREMIUM],
  COMMENT_CONTENT: [ROLES.ADMIN, ROLES.INSTRUCTOR, ROLES.PREMIUM, ROLES.USER],
  RATE_CONTENT: [ROLES.ADMIN, ROLES.INSTRUCTOR, ROLES.PREMIUM, ROLES.USER],
  
  // Notificaciones
  SEND_NOTIFICATIONS: [ROLES.ADMIN, ROLES.INSTRUCTOR],
  RECEIVE_NOTIFICATIONS: [ROLES.ADMIN, ROLES.INSTRUCTOR, ROLES.PREMIUM, ROLES.USER]
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
  '/': [ROLES.ADMIN, ROLES.INSTRUCTOR, ROLES.PREMIUM, ROLES.USER, ROLES.GUEST],
  '/figuras': [ROLES.ADMIN, ROLES.INSTRUCTOR, ROLES.PREMIUM, ROLES.USER, ROLES.GUEST],
  '/escuela': [ROLES.ADMIN, ROLES.INSTRUCTOR, ROLES.PREMIUM, ROLES.USER, ROLES.GUEST],
  '/eventos': [ROLES.ADMIN, ROLES.INSTRUCTOR, ROLES.PREMIUM, ROLES.USER, ROLES.GUEST],
  '/categorias': [ROLES.ADMIN, ROLES.INSTRUCTOR, ROLES.PREMIUM, ROLES.USER, ROLES.GUEST],
  '/notas': [ROLES.ADMIN, ROLES.INSTRUCTOR, ROLES.PREMIUM, ROLES.USER],
  '/admin': [ROLES.ADMIN],
  '/auth': [ROLES.ADMIN, ROLES.INSTRUCTOR, ROLES.PREMIUM, ROLES.USER, ROLES.GUEST]
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
  [ROLES.ADMIN]: [ROLES.ADMIN, ROLES.INSTRUCTOR, ROLES.PREMIUM, ROLES.USER],
  [ROLES.INSTRUCTOR]: [ROLES.PREMIUM, ROLES.USER]
} 