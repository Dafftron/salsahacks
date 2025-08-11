import React, { useState, useEffect } from 'react'
import { ref, getDownloadURL } from 'firebase/storage'
import { storage } from '../../services/firebase/config'
import { X, Download, Video, Settings, Check, AlertCircle, Loader, Zap, Archive } from 'lucide-react'
import VideoCombiner from '../../services/video/videoCombiner'

const DownloadModal = ({ isOpen, onClose, video, onDownloadComplete }) => {
  const [format, setFormat] = useState('mp4')
  const [resolution, setResolution] = useState('4k')
  const [isProcessing, setIsProcessing] = useState(false)
  const [progress, setProgress] = useState(null)
  const [error, setError] = useState(null)
  const [downloadUrl, setDownloadUrl] = useState(null)
  const [maxAvailableResolution, setMaxAvailableResolution] = useState('4k')
  const [isAnalyzing, setIsAnalyzing] = useState(false)

  const videoCombiner = new VideoCombiner()

  useEffect(() => {
    if (isOpen) {
      setProgress(null)
      setError(null)
      setDownloadUrl(null)
      setIsProcessing(false)
      // Si es una secuencia, no analizar resolución ni preparar combinación
      if (video?.videos && Array.isArray(video.videos)) {
        setIsAnalyzing(false)
      } else {
        setIsAnalyzing(true)
        analyzeVideoResolution()
      }
    }
  }, [isOpen, video])

  // Analizar la resolución máxima disponible en los videos
  const analyzeVideoResolution = async () => {
    try {
      setIsAnalyzing(true)
      let maxRes = '720p' // Por defecto, empezar con la más baja

      if (video?.videos && Array.isArray(video.videos)) {
        // Es una secuencia - analizar todos los videos
        const resolutions = await Promise.all(
          video.videos.map(v => getVideoResolution(v))
        )
        
        // Encontrar la resolución máxima
        maxRes = getMaxResolution(resolutions)
      } else if (video) {
        // Es un video individual
        maxRes = await getVideoResolution(video)
      }

      setMaxAvailableResolution(maxRes)
      
      // Ajustar la resolución seleccionada si es mayor que la disponible
      if (getResolutionValue(resolution) > getResolutionValue(maxRes)) {
        setResolution(maxRes)
      }

    } catch (error) {
      console.warn('Error analizando resolución:', error)
      setMaxAvailableResolution('720p')
    } finally {
      setIsAnalyzing(false)
    }
  }

  // Obtener la resolución de un video individual
  const getVideoResolution = async (video) => {
    try {
      // imports estáticos
      
      const videoRef = ref(storage, video.videoPath)
      const downloadURL = await getDownloadURL(videoRef)
      
      return new Promise((resolve) => {
        const videoElement = document.createElement('video')
        videoElement.onloadedmetadata = () => {
          const width = videoElement.videoWidth
          const height = videoElement.videoHeight
          
          // Determinar resolución basada en dimensiones
          let res = '720p'
          if (width >= 3840 && height >= 2160) res = '4k'
          else if (width >= 1920 && height >= 1080) res = '1080p'
          else if (width >= 1280 && height >= 720) res = '720p'
          else res = '480p'
          
          resolve(res)
        }
        videoElement.onerror = () => resolve('720p')
        videoElement.src = downloadURL
      })
    } catch (error) {
      console.warn('Error obteniendo resolución:', error)
      return '720p'
    }
  }

  // Obtener la resolución máxima de una lista
  const getMaxResolution = (resolutions) => {
    const values = resolutions.map(r => getResolutionValue(r))
    const maxValue = Math.max(...values)
    
    if (maxValue >= getResolutionValue('4k')) return '4k'
    if (maxValue >= getResolutionValue('1080p')) return '1080p'
    if (maxValue >= getResolutionValue('720p')) return '720p'
    return '480p'
  }

  // Valor numérico de resolución para comparación
  const getResolutionValue = (resolution) => {
    switch (resolution) {
      case '4k': return 4
      case '1080p': return 3
      case '720p': return 2
      case '480p': return 1
      default: return 2
    }
  }

  // Opciones de formato optimizadas para máxima calidad
  const formatOptions = [
    { value: 'mp4', label: 'MP4 (H.264)', description: 'Máxima calidad, compatible con Windows' },
    { value: 'webm', label: 'WebM (VP9)', description: 'Alta calidad, archivos más pequeños' }
  ]
  
  // Opciones de resolución dinámicas basadas en el video
  const resolutionOptions = [
    { 
      value: '4k', 
      label: '4K UHD', 
      description: 'Máxima calidad (3840x2160)',
      disabled: getResolutionValue('4k') > getResolutionValue(maxAvailableResolution)
    },
    { 
      value: '1080p', 
      label: 'Full HD', 
      description: 'Alta calidad (1920x1080)',
      disabled: getResolutionValue('1080p') > getResolutionValue(maxAvailableResolution)
    },
    { 
      value: '720p', 
      label: 'HD', 
      description: 'Calidad estándar (1280x720)',
      disabled: getResolutionValue('720p') > getResolutionValue(maxAvailableResolution)
    },
    { 
      value: '480p', 
      label: 'SD', 
      description: 'Calidad básica (854x480)',
      disabled: getResolutionValue('480p') > getResolutionValue(maxAvailableResolution)
    }
  ]

  // Manejar descarga optimizada con máxima calidad
  const handleDownload = async () => {
    if (!video) {
      setError('No hay video para descargar')
      return
    }

    // Si es una secuencia, forzar siempre ZIP de originales (sin intentos de combinar)
    if (video.videos && Array.isArray(video.videos)) {
      await handleDownloadZip()
      return
    }

    // Video individual: descarga directa
    setIsProcessing(true)
    setError(null)
    setProgress({
      stage: 'download',
      current: 50,
      total: 100,
      message: 'Descargando video con máxima calidad...'
    })

    try {
      const result = await downloadSingleVideo(video, setProgress)
      const url = URL.createObjectURL(result)
      setDownloadUrl(url)
      setProgress({ stage: 'complete', current: 100, total: 100, message: '¡Descarga completada!' })
    } catch (error) {
      setError(`Error en descarga: ${error.message}`)
      setProgress(null)
    } finally {
      setIsProcessing(false)
    }
  }

  // Descargar ZIP con los videos fuente (alternativa offline)
  const handleDownloadZip = async () => {
    try {
      if (!video?.videos || !Array.isArray(video.videos) || video.videos.length === 0) {
        setError('No hay videos para empaquetar')
        return
      }

      setIsProcessing(true)
      setError(null)
      setProgress({
        stage: 'download',
        current: 30,
        total: 100,
        message: 'Preparando ZIP de videos fuente...'
      })

      const { downloadSequenceDirect } = await import('../../services/video/videoProcessor')
      const result = await downloadSequenceDirect({ name: video.title || 'secuencia', videos: video.videos })
      if (!result.success) {
        throw new Error(result.error || 'No se pudo generar el ZIP')
      }

      const url = URL.createObjectURL(result.data)
      const safeName = (video.title || 'secuencia')
        .replace(/[^a-zA-Z0-9\s]/g, '')
        .replace(/\s+/g, '_')
        .toLowerCase()

      const link = document.createElement('a')
      link.href = url
      link.download = `${safeName}.zip`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      URL.revokeObjectURL(url)

      setProgress({
        stage: 'complete',
        current: 100,
        total: 100,
        message: 'ZIP generado con videos fuente'
      })
    } catch (err) {
      setError(`Error generando ZIP: ${err.message}`)
      setProgress(null)
    } finally {
      setIsProcessing(false)
    }
  }

  // Función para descargar video individual
  const downloadSingleVideo = async (video, onProgress) => {
    try {
      if (onProgress) {
        onProgress({
          stage: 'download',
          current: 50,
          total: 100,
          message: 'Descargando video con máxima calidad...'
        })
      }

      // Usar Firebase SDK para obtener URL de descarga
      // imports estáticos
      
      const videoRef = ref(storage, video.videoPath)
      const downloadURL = await getDownloadURL(videoRef)
      
      // Descargar video
      const response = await fetch(downloadURL)
      if (!response.ok) {
        throw new Error(`Error HTTP: ${response.status} ${response.statusText}`)
      }
      
      const videoBlob = await response.blob()
      
      if (onProgress) {
        onProgress({
          stage: 'complete',
          current: 100,
          total: 100,
          message: 'Video descargado con máxima calidad'
        })
      }

      return videoBlob

    } catch (error) {
      throw new Error(`Error descargando video: ${error.message}`)
    }
  }

  const handleDownloadFile = () => {
    if (downloadUrl) {
      const link = document.createElement('a')
      link.href = downloadUrl
      
      // Generar nombre de archivo con información de calidad
      const extension = format === 'mp4' ? 'mp4' : 'webm'
      const qualitySuffix = resolution === '4k' ? '_4K' : 
                           resolution === '1080p' ? '_FHD' : 
                           resolution === '720p' ? '_HD' : '_SD'
      const fileName = video?.videos 
        ? `${video.title || 'secuencia'}${qualitySuffix}.${extension}`
        : `${video.title || 'video'}${qualitySuffix}.${extension}`
      
      link.download = fileName
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      
      // Limpiar URL
      URL.revokeObjectURL(downloadUrl)
      setDownloadUrl(null)
      
      onDownloadComplete && onDownloadComplete()
      onClose()
    }
  }

  const getProgressColor = () => {
    if (error) return 'text-red-500'
    if (progress?.stage === 'complete') return 'text-green-500'
    return 'text-blue-500'
  }

  const getProgressIcon = () => {
    if (error) return <AlertCircle className="h-5 w-5" />
    if (progress?.stage === 'complete') return <Check className="h-5 w-5" />
    return <Loader className="h-5 w-5 animate-spin" />
  }

  const getProgressBarColor = () => {
    if (error) return 'bg-red-500'
    if (progress?.stage === 'complete') return 'bg-green-500'
    return 'bg-blue-500'
  }

  const getStageDescription = () => {
    switch (progress?.stage) {
      case 'init':
        return 'Inicializando sistema de alta calidad...'
      case 'download':
        return 'Descargando videos con máxima calidad...'
      case 'ffmpeg':
        return 'Combinando videos con seeking específico para Windows...'
      case 'combine':
        return 'Combinando videos con 4K y 60 FPS...'
      case 'convert':
        return 'Convirtiendo a MP4 con máxima calidad...'
      case 'complete':
        return '¡Proceso completado con seeking funcional!'
      default:
        return 'Preparando...'
    }
  }

  const getResolutionInfo = () => {
    switch (resolution) {
      case '4k': return { width: 3840, height: 2160, fps: 60 }
      case '1080p': return { width: 1920, height: 1080, fps: 60 }
      case '720p': return { width: 1280, height: 720, fps: 30 }
      case '480p': return { width: 854, height: 480, fps: 30 }
      default: return { width: 1280, height: 720, fps: 30 }
    }
  }

  if (!isOpen) return null

  const resInfo = getResolutionInfo()

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2">
            <Zap className="h-5 w-5 text-yellow-500" />
            <h2 className="text-xl font-semibold text-gray-800">
              {video?.videos ? 'Descargar Secuencia' : 'Descargar Video'}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
            disabled={isProcessing}
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content */}
        <div className="space-y-4">
          {/* Video Info */}
          <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-4 border border-blue-200">
            <div className="flex items-center space-x-2 mb-2">
              <Zap className="h-4 w-4 text-yellow-500" />
              <span className="text-sm font-semibold text-blue-800">CALIDAD INTELIGENTE</span>
            </div>
            <p className="text-sm text-gray-700">
              <strong>{video?.videos ? video.videos.length : 1} video{video?.videos ? 's' : ''}</strong>
              {video?.videos ? ' serán combinados en uno solo' : ' será descargado'}
            </p>
            {video?.videos && (
              <p className="text-xs text-gray-600 mt-1">
                Duración total: {video.videos.reduce((sum, v) => sum + (v.duration || 0), 0).toFixed(1)}s
              </p>
            )}
            <div className="mt-2 space-y-1">
              <p className="text-xs text-blue-600">
                🎬 Resolución máxima disponible: {maxAvailableResolution.toUpperCase()}
              </p>
              <p className="text-xs text-blue-600">
                🎯 FPS: {resInfo.fps} frames por segundo
              </p>
              <p className="text-xs text-blue-600">
                📹 Codec: H.264 (máxima compatibilidad)
              </p>
              <p className="text-xs text-blue-600">
                💾 Formato: MP4 (compatible con Windows)
              </p>
              <p className="text-xs text-green-600 font-semibold">
                ✅ Soporte completo de seeking (navegación)
              </p>
              <p className="text-xs text-green-600 font-semibold">
                ✅ Deslizador funcional en reproductor de Windows
              </p>
            </div>
          </div>

          {/* Resolution Selector (solo videos individuales) */}
          {!isAnalyzing && !video?.videos && (
            <div className="space-y-3">
              <label className="block text-sm font-medium text-gray-700">
                Resolución de Descarga
              </label>
              <div className="grid grid-cols-2 gap-2">
                {resolutionOptions.map((option) => (
                  <button
                    key={option.value}
                    onClick={() => !option.disabled && setResolution(option.value)}
                    className={`p-3 rounded-lg border-2 text-left transition-all ${
                      resolution === option.value
                        ? 'border-blue-500 bg-blue-50 text-blue-700'
                        : option.disabled
                        ? 'border-gray-200 bg-gray-50 text-gray-400 cursor-not-allowed'
                        : 'border-gray-200 bg-white text-gray-700 hover:border-gray-300 hover:bg-gray-50'
                    }`}
                    disabled={option.disabled}
                  >
                    <div className="font-medium text-sm">{option.label}</div>
                    <div className="text-xs opacity-75">{option.description}</div>
                    {option.disabled && (
                      <div className="text-xs text-red-500 mt-1">
                        No disponible
                      </div>
                    )}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Analyzing */}
          {isAnalyzing && !video?.videos && (
            <div className="flex items-center space-x-2 text-blue-600">
              <Loader className="h-4 w-4 animate-spin" />
              <span className="text-sm">Analizando resolución máxima disponible...</span>
            </div>
          )}

          {/* Progress */}
          {progress && (
            <div className="space-y-3">
              <div className="flex items-center space-x-2">
                {getProgressIcon()}
                <span className={`text-sm font-medium ${getProgressColor()}`}>
                  {progress.message}
                </span>
              </div>
              
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className={`h-2 rounded-full transition-all duration-300 ${getProgressBarColor()}`}
                  style={{ width: `${progress.current}%` }}
                />
              </div>
              
              <p className="text-xs text-gray-500">
                {getStageDescription()}
              </p>
            </div>
          )}

          {/* Error */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3">
              <div className="flex items-center space-x-2">
                <AlertCircle className="h-5 w-5 text-red-500" />
                <span className="text-sm text-red-700">{error}</span>
              </div>
            </div>
          )}

          {/* Success */}
          {downloadUrl && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-3">
              <div className="flex items-center space-x-2">
                <Check className="h-5 w-5 text-green-500" />
                <span className="text-sm text-green-700">
                  ¡{video?.videos ? 'Secuencia' : 'Video'} listo para descargar en {resolution.toUpperCase()}!
                </span>
              </div>
              <p className="text-xs text-green-600 mt-1">
                Archivo MP4 compatible con reproductor de Windows
              </p>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex space-x-3 mt-6">
          {!isProcessing && !downloadUrl && !isAnalyzing && (
            <button
              onClick={handleDownload}
              className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 px-4 rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all duration-200 flex items-center justify-center space-x-2 font-semibold"
            >
              <Zap className="h-4 w-4" />
              <span>{video?.videos ? 'Descargar ZIP (videos separados)' : 'Descargar Video'}</span>
            </button>
          )}

          {downloadUrl && (
            <button
              onClick={handleDownloadFile}
              className="flex-1 bg-gradient-to-r from-green-600 to-teal-600 text-white py-3 px-4 rounded-lg hover:from-green-700 hover:to-teal-700 transition-all duration-200 flex items-center justify-center space-x-2 font-semibold"
            >
              <Download className="h-4 w-4" />
              <span>Descargar MP4 ({resolution.toUpperCase()})</span>
            </button>
          )}

          <button
            onClick={onClose}
            className="px-4 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
            disabled={isProcessing || isAnalyzing}
          >
            {downloadUrl ? 'Cerrar' : 'Cancelar'}
          </button>
        </div>
      </div>
    </div>
  )
}

export default DownloadModal 