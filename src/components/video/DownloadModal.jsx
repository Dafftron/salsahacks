import React, { useState } from 'react'
import { X, Download, Video, Settings, Check } from 'lucide-react'
import { convertVideoFormat } from '../../services/video/videoProcessor'

const DownloadModal = ({ isOpen, onClose, video, onDownloadComplete }) => {
  const [format, setFormat] = useState('mp4')
  const [quality, setQuality] = useState('medium')
  const [isProcessing, setIsProcessing] = useState(false)
  const [progress, setProgress] = useState(0)
  
  // Opciones de formato
  const formatOptions = [
    { value: 'mp4', label: 'MP4', description: 'Formato estándar, compatible con todo' },
    { value: 'avi', label: 'AVI', description: 'Formato clásico, buena calidad' },
    { value: 'mov', label: 'MOV', description: 'Formato Apple, alta calidad' },
    { value: 'webm', label: 'WebM', description: 'Formato web, archivos pequeños' }
  ]
  
  // Opciones de calidad
  const qualityOptions = [
    { value: 'low', label: 'Baja', description: 'Archivo pequeño, calidad reducida' },
    { value: 'medium', label: 'Media', description: 'Balance entre calidad y tamaño' },
    { value: 'high', label: 'Alta', description: 'Alta calidad, archivo más grande' }
  ]
  
  // Obtener descripción del formato
  const getFormatDescription = (formatValue) => {
    const option = formatOptions.find(opt => opt.value === formatValue)
    return option ? option.description : ''
  }
  
  // Obtener descripción de la calidad
  const getQualityDescription = (qualityValue) => {
    const option = qualityOptions.find(opt => opt.value === qualityValue)
    return option ? option.description : ''
  }
  
  // Manejar descarga
  const handleDownload = async () => {
    if (!video || !video.file) {
      console.error('No hay video para descargar')
      return
    }
    
    setIsProcessing(true)
    setProgress(0)
    
    try {
      console.log(`🎬 Iniciando conversión: ${format}, calidad: ${quality}`)
      
      // Simular progreso
      const progressInterval = setInterval(() => {
        setProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval)
            return 90
          }
          return prev + 10
        })
      }, 500)
      
      // Convertir video
      const result = await convertVideoFormat(video.file, format, quality)
      
      clearInterval(progressInterval)
      setProgress(100)
      
      if (result.success) {
        // Crear blob y descargar
        const blob = new Blob([result.data], { type: `video/${format}` })
        const url = URL.createObjectURL(blob)
        
        const a = document.createElement('a')
        a.href = url
        a.download = `${video.title}_${quality}.${format}`
        document.body.appendChild(a)
        a.click()
        document.body.removeChild(a)
        
        URL.revokeObjectURL(url)
        
        console.log('✅ Video descargado correctamente')
        onDownloadComplete && onDownloadComplete()
        onClose()
      } else {
        throw new Error(result.error)
      }
    } catch (error) {
      console.error('❌ Error al descargar video:', error)
      alert(`Error al procesar video: ${error.message}`)
    } finally {
      setIsProcessing(false)
      setProgress(0)
    }
  }
  
  // Descarga directa (sin conversión)
  const handleDirectDownload = () => {
    if (!video || !video.file) {
      console.error('No hay video para descargar')
      return
    }
    
    const url = URL.createObjectURL(video.file)
    const a = document.createElement('a')
    a.href = url
    a.download = video.title || 'video'
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
    
    onClose()
  }
  
  if (!isOpen) return null
  
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center space-x-2">
            <Download className="h-5 w-5 text-blue-600" />
            <h2 className="text-lg font-semibold text-gray-800">Descargar Video</h2>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        
        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Video Info */}
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="flex items-center space-x-3">
              <Video className="h-8 w-8 text-gray-400" />
              <div className="flex-1 min-w-0">
                <h3 className="font-medium text-gray-800 truncate">
                  {video?.title || 'Video sin título'}
                </h3>
                <p className="text-sm text-gray-500">
                  {video?.fileSize ? `${(video.fileSize / (1024 * 1024)).toFixed(2)} MB` : 'Tamaño desconocido'}
                </p>
                {video?.bpm && (
                  <p className="text-sm text-purple-600">
                    BPM: {video.bpm}
                  </p>
                )}
              </div>
            </div>
          </div>
          
          {/* Format Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Formato de salida
            </label>
            <div className="space-y-2">
              {formatOptions.map(option => (
                <label
                  key={option.value}
                  className={`flex items-center p-3 border rounded-lg cursor-pointer transition-colors ${
                    format === option.value
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <input
                    type="radio"
                    name="format"
                    value={option.value}
                    checked={format === option.value}
                    onChange={(e) => setFormat(e.target.value)}
                    className="sr-only"
                  />
                  <div className="flex items-center space-x-3">
                    <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                      format === option.value
                        ? 'border-blue-500 bg-blue-500'
                        : 'border-gray-300'
                    }`}>
                      {format === option.value && (
                        <div className="w-2 h-2 rounded-full bg-white"></div>
                      )}
                    </div>
                    <div>
                      <div className="font-medium text-gray-800">{option.label}</div>
                      <div className="text-sm text-gray-500">{option.description}</div>
                    </div>
                  </div>
                </label>
              ))}
            </div>
          </div>
          
          {/* Quality Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Calidad
            </label>
            <div className="space-y-2">
              {qualityOptions.map(option => (
                <label
                  key={option.value}
                  className={`flex items-center p-3 border rounded-lg cursor-pointer transition-colors ${
                    quality === option.value
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <input
                    type="radio"
                    name="quality"
                    value={option.value}
                    checked={quality === option.value}
                    onChange={(e) => setQuality(e.target.value)}
                    className="sr-only"
                  />
                  <div className="flex items-center space-x-3">
                    <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                      quality === option.value
                        ? 'border-blue-500 bg-blue-500'
                        : 'border-gray-300'
                    }`}>
                      {quality === option.value && (
                        <div className="w-2 h-2 rounded-full bg-white"></div>
                      )}
                    </div>
                    <div>
                      <div className="font-medium text-gray-800">{option.label}</div>
                      <div className="text-sm text-gray-500">{option.description}</div>
                    </div>
                  </div>
                </label>
              ))}
            </div>
          </div>
          
          {/* Progress Bar */}
          {isProcessing && (
            <div className="space-y-2">
              <div className="flex justify-between text-sm text-gray-600">
                <span>Procesando video...</span>
                <span>{progress}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${progress}%` }}
                ></div>
              </div>
            </div>
          )}
        </div>
        
        {/* Footer */}
        <div className="flex items-center justify-between p-6 border-t border-gray-200">
          <button
            onClick={handleDirectDownload}
            disabled={isProcessing}
            className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800 transition-colors"
          >
            Descargar original
          </button>
          
          <div className="flex space-x-3">
            <button
              onClick={onClose}
              disabled={isProcessing}
              className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800 transition-colors"
            >
              Cancelar
            </button>
            <button
              onClick={handleDownload}
              disabled={isProcessing}
              className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                isProcessing
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  : 'bg-blue-600 text-white hover:bg-blue-700'
              }`}
            >
              {isProcessing ? 'Procesando...' : 'Descargar'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default DownloadModal 