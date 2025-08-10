import { LOCAL_CONFIG } from './local'

// Configuración de la aplicación
const config = {
  // URL base para producción - prioriza configuración local sobre variable de entorno
  PRODUCTION_URL: LOCAL_CONFIG.PRODUCTION_URL || import.meta.env.VITE_APP_PRODUCTION_URL,
  
  // Determinar si estamos en producción
  isProduction: import.meta.env.PROD,
  
  // Obtener la URL base correcta
  getBaseUrl: () => {
    if (import.meta.env.PROD) {
      return config.PRODUCTION_URL
    }
    return window.location.origin
  },
  
  // Obtener la URL completa para invitaciones
  getInvitationUrl: (invitationCode) => {
    return `${config.getBaseUrl()}/invite/${invitationCode}`
  }
}

export default config
