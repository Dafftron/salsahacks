// 🚀 UTILIDADES DE OPTIMIZACIÓN DE BUNDLE - SALSAHACKS V2.0

// Función para precargar componentes críticos
export const preloadCriticalComponents = () => {
  // Precargar componentes que se usan frecuentemente
  const criticalComponents = [
    () => import('../components/common/Toast'),
    () => import('../components/common/ConfirmModal'),
    () => import('../components/video/VideoPlayer')
  ]
  
  // Precargar en segundo plano
  criticalComponents.forEach(importFn => {
    importFn().catch(() => {
      // Ignorar errores de precarga
    })
  })
}

// Función para cargar componentes bajo demanda
export const loadComponentOnDemand = (importFn, fallback = null) => {
  return React.lazy(() => 
    importFn().catch(() => {
      // Fallback si el componente falla al cargar
      if (fallback) {
        return fallback
      }
      throw new Error('Componente no disponible')
    })
  )
}

// Función para optimizar imports de Firebase
export const optimizeFirebaseImports = () => {
  // Cache para imports de Firebase
  const firebaseCache = new Map()
  
  return {
    getAuth: async () => {
      if (!firebaseCache.has('auth')) {
        const { getAuth } = await import('firebase/auth')
        firebaseCache.set('auth', getAuth)
      }
      return firebaseCache.get('auth')
    },
    
    getFirestore: async () => {
      if (!firebaseCache.has('firestore')) {
        const { getFirestore } = await import('firebase/firestore')
        firebaseCache.set('firestore', getFirestore)
      }
      return firebaseCache.get('firestore')
    },
    
    getStorage: async () => {
      if (!firebaseCache.has('storage')) {
        const { getStorage } = await import('firebase/storage')
        firebaseCache.set('storage', getStorage)
      }
      return firebaseCache.get('storage')
    }
  }
}

// Función para optimizar carga de iconos
export const optimizeIconImports = () => {
  // Cache para iconos de Lucide
  const iconCache = new Map()
  
  return {
    getIcon: async (iconName) => {
      if (!iconCache.has(iconName)) {
        try {
          const { [iconName]: IconComponent } = await import('lucide-react')
          iconCache.set(iconName, IconComponent)
        } catch (error) {
          console.warn(`Icono ${iconName} no encontrado`)
          return null
        }
      }
      return iconCache.get(iconName)
    }
  }
}

// Función para optimizar carga de servicios
export const optimizeServiceImports = () => {
  const serviceCache = new Map()
  
  return {
    getVideoService: async () => {
      if (!serviceCache.has('video')) {
        const VideoCombiner = await import('../services/video/videoCombiner')
        serviceCache.set('video', VideoCombiner.default)
      }
      return serviceCache.get('video')
    },
    
    getFirebaseService: async (serviceName) => {
      if (!serviceCache.has(serviceName)) {
        const service = await import(`../services/firebase/${serviceName}`)
        serviceCache.set(serviceName, service)
      }
      return serviceCache.get(serviceName)
    }
  }
}

// Función para monitorear el rendimiento del bundle
export const monitorBundlePerformance = () => {
  if (typeof window !== 'undefined' && window.performance) {
    const observer = new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        if (entry.entryType === 'navigation') {
          console.log('🚀 Bundle Performance:', {
            loadTime: entry.loadEventEnd - entry.loadEventStart,
            domContentLoaded: entry.domContentLoadedEventEnd - entry.domContentLoadedEventStart,
            firstPaint: entry.firstPaint,
            firstContentfulPaint: entry.firstContentfulPaint
          })
        }
      }
    })
    
    observer.observe({ entryTypes: ['navigation', 'paint'] })
  }
}

// Función para optimizar imágenes
export const optimizeImageLoading = () => {
  // Intersection Observer para lazy loading de imágenes
  if (typeof window !== 'undefined' && 'IntersectionObserver' in window) {
    const imageObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const img = entry.target
          img.src = img.dataset.src
          img.classList.remove('lazy')
          imageObserver.unobserve(img)
        }
      })
    })
    
    // Observar imágenes con clase 'lazy'
    document.querySelectorAll('img[data-src]').forEach(img => {
      imageObserver.observe(img)
    })
  }
}

// Función para limpiar recursos no utilizados
export const cleanupUnusedResources = () => {
  // Limpiar URLs de objetos creados
  const cleanupObjectURLs = () => {
    // Esta función se puede llamar periódicamente para limpiar URLs no utilizadas
    if (typeof window !== 'undefined' && window.URL && window.URL.revokeObjectURL) {
      // En una implementación real, mantendrías un registro de URLs creadas
      // y las limpiarías cuando ya no se necesiten
    }
  }
  
  return { cleanupObjectURLs }
}

// Configuración de optimizaciones
export const bundleOptimizationConfig = {
  // Precargar componentes críticos al inicio
  preloadCritical: true,
  
  // Usar cache para imports
  useCache: true,
  
  // Monitorear rendimiento
  monitorPerformance: true,
  
  // Optimizar carga de imágenes
  optimizeImages: true,
  
  // Limpiar recursos automáticamente
  autoCleanup: true
}

// Función principal de inicialización de optimizaciones
export const initializeBundleOptimizations = (config = bundleOptimizationConfig) => {
  if (config.preloadCritical) {
    preloadCriticalComponents()
  }
  
  if (config.monitorPerformance) {
    monitorBundlePerformance()
  }
  
  if (config.optimizeImages) {
    // Ejecutar después de que el DOM esté listo
    if (typeof window !== 'undefined') {
      if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', optimizeImageLoading)
      } else {
        optimizeImageLoading()
      }
    }
  }
  
  return {
    firebase: optimizeFirebaseImports(),
    icons: optimizeIconImports(),
    services: optimizeServiceImports(),
    cleanup: cleanupUnusedResources()
  }
}

export default {
  preloadCriticalComponents,
  loadComponentOnDemand,
  optimizeFirebaseImports,
  optimizeIconImports,
  optimizeServiceImports,
  monitorBundlePerformance,
  optimizeImageLoading,
  cleanupUnusedResources,
  initializeBundleOptimizations
}
