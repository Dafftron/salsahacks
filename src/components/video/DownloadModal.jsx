import React, { useState } from 'react'
import { X, Download, Video, Settings, Check } from 'lucide-react'
import { convertVideoFormat, generateSequenceVideo } from '../../services/video/videoProcessor'

const DownloadModal = ({ isOpen, onClose, video, onDownloadComplete }) => {
  const [format, setFormat] = useState('mp4')
  const [resolution, setResolution] = useState('720p')
  const [isProcessing, setIsProcessing] = useState(false)
  const [progress, setProgress] = useState(0)
  
  // Opciones de formato
  const formatOptions = [
    { value: 'mp4', label: 'MP4', description: 'Formato estándar, compatible con todo' },
    { value: 'avi', label: 'AVI', description: 'Formato clásico, buena calidad' },
    { value: 'mov', label: 'MOV', description: 'Formato Apple, alta calidad' },
    { value: 'webm', label: 'WebM', description: 'Formato web, archivos pequeños' }
  ]
  
  // Opciones de resolución
  const resolutionOptions = [
    { value: '360p', label: '360p', description: 'Calidad baja, archivo pequeño' },
    { value: '480p', label: '480p', description: 'Calidad estándar, balance' },
    { value: '720p', label: '720p', description: 'HD, buena calidad' },
    { value: '1080p', label: '1080p', description: 'Full HD, alta calidad' },
    { value: '4k', label: '4K', description: 'Ultra HD, máxima calidad' }
  ]
  
  // Obtener descripción del formato
  const getFormatDescription = (formatValue) => {
    const option = formatOptions.find(opt => opt.value === formatValue)
    return option ? option.description : ''
  }
  
  // Obtener descripción de la resolución
  const getResolutionDescription = (resolutionValue) => {
    const option = resolutionOptions.find(opt => opt.value === resolutionValue)
    return option ? option.description : ''
  }
  
  // Manejar descarga
  const handleDownload = async () => {
    if (!video) {
      console.error('No hay video para descargar')
      return
    }
    
    setIsProcessing(true)
    setProgress(0)
    
         try {
       // Iniciando descarga
      
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
      
      let result
      
      try {
        // Verificar si es una secuencia o un video individual
        if (video.videos && Array.isArray(video.videos)) {
          // Es una secuencia
          // Procesando secuencia
          result = await generateSequenceVideo(video, format, resolution)
        } else if (video.file) {
          // Es un video individual
                      // Procesando video individual
          result = await convertVideoFormat(video.file, format, resolution)
        } else {
          throw new Error('Formato de video no válido')
        }
        
        // Limpiar intervalo y establecer progreso al 100%
        clearInterval(progressInterval)
        setProgress(100)
        
        // Pequeña pausa para mostrar el 100%
        await new Promise(resolve => setTimeout(resolve, 200))
      } catch (error) {
        clearInterval(progressInterval)
        throw error
      }
      
                          if (result.success) {
          // Crear blob y descargar
          const mimeType = result.format === 'zip' ? 'application/zip' : `video/${result.format || format}`
          const blob = new Blob([result.data], { type: mimeType })
          
          try {
            const dirHandle = await selectDownloadFolder()
            
            if (dirHandle) {
              // Usar File System Access API
              const extension = result.format === 'zip' ? 'zip' : (result.format || format)
              const fileName = `${video.title || video.name}_${resolution}.${extension}`
              const fileHandle = await dirHandle.getFileHandle(fileName, { create: true })
              const writable = await fileHandle.createWritable()
              await writable.write(blob)
              await writable.close()
              // Archivo guardado exitosamente
            } else {
              // Descarga normal
              const url = URL.createObjectURL(blob)
              const a = document.createElement('a')
              a.href = url
              const extension = result.format === 'zip' ? 'zip' : (result.format || format)
              a.download = `${video.title || video.name}_${resolution}.${extension}`
              document.body.appendChild(a)
              a.click()
              document.body.removeChild(a)
              URL.revokeObjectURL(url)
              // Archivo descargado exitosamente
            }
            
            onDownloadComplete && onDownloadComplete()
            onClose()
          } catch (error) {
            console.error('Error al guardar archivo:', error)
            throw new Error('Error al guardar el archivo')
          }
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
  
  // Función para elegir carpeta de descarga
  const selectDownloadFolder = async () => {
    try {
      // Verificar si la API de File System Access está disponible
      if ('showDirectoryPicker' in window) {
        const dirHandle = await window.showDirectoryPicker()
        return dirHandle
      } else {
        // Fallback: usar descarga normal
        // API de File System Access no disponible, usando descarga normal
        return null
      }
    } catch (error) {
              // Usuario canceló la selección de carpeta o error
      return null
    }
  }

  // Descarga directa (sin conversión)
  const handleDirectDownload = async () => {
    if (!video || !video.file) {
      console.error('No hay video para descargar')
      return
    }
    
    try {
      const dirHandle = await selectDownloadFolder()
      
      if (dirHandle) {
        // Usar File System Access API
        const fileName = `${video.title || video.name}.mp4`
        const fileHandle = await dirHandle.getFileHandle(fileName, { create: true })
        const writable = await fileHandle.createWritable()
        await writable.write(video.file)
        await writable.close()
                    // Archivo guardado exitosamente
      } else {
        // Descarga normal
        const url = URL.createObjectURL(video.file)
        const a = document.createElement('a')
        a.href = url
        a.download = video.title || 'video'
        document.body.appendChild(a)
        a.click()
        document.body.removeChild(a)
        URL.revokeObjectURL(url)
      }
      
      onClose()
    } catch (error) {
      console.error('Error en descarga directa:', error)
      alert('Error al descargar el archivo')
    }
  }
  
  if (!isOpen) return null
  
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center space-x-2">
            <Download className="h-5 w-5 text-blue-600" />
            <h2 className="text-lg font-semibold text-gray-800">
              {video?.videos ? 'Descargar Secuencia' : 'Descargar Video'}
            </h2>
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
          {/* Video/Sequence Info */}
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="flex items-center space-x-3">
              <Video className="h-8 w-8 text-gray-400" />
              <div className="flex-1 min-w-0">
                <h3 className="font-medium text-gray-800 truncate">
                  {video?.title || video?.name || 'Sin título'}
                </h3>
                {video?.videos ? (
                  // Información de secuencia
                  <div className="space-y-1">
                    <p className="text-sm text-gray-500">
                      {video.videos.length} videos • Duración aproximada: {Math.floor(video.videos.length * 30 / 60)}:{(video.videos.length * 30 % 60).toString().padStart(2, '0')}
                    </p>
                    {video.useBPMControl && video.targetBPM && (
                      <p className="text-sm text-purple-600">
                        BPM ajustado: {video.targetBPM}
                      </p>
                    )}
                    {video.description && (
                      <p className="text-sm text-gray-600">
                        {video.description}
                      </p>
                    )}
                  </div>
                ) : (
                  // Información de video individual
                  <div className="space-y-1">
                    <p className="text-sm text-gray-500">
                      {video?.fileSize ? `${(video.fileSize / (1024 * 1024)).toFixed(2)} MB` : 'Tamaño desconocido'}
                    </p>
                    {video?.bpm && (
                      <p className="text-sm text-purple-600">
                        BPM: {video.bpm}
                      </p>
                    )}
                  </div>
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
          
                     {/* Resolution Selection */}
           <div>
             <label className="block text-sm font-medium text-gray-700 mb-3">
               Resolución
             </label>
             <div className="space-y-2">
               {resolutionOptions.map(option => (
                 <label
                   key={option.value}
                   className={`flex items-center p-3 border rounded-lg cursor-pointer transition-colors ${
                     resolution === option.value
                       ? 'border-blue-500 bg-blue-50'
                       : 'border-gray-200 hover:border-gray-300'
                   }`}
                 >
                   <input
                     type="radio"
                     name="resolution"
                     value={option.value}
                     checked={resolution === option.value}
                     onChange={(e) => setResolution(e.target.value)}
                     className="sr-only"
                   />
                   <div className="flex items-center space-x-3">
                     <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                       resolution === option.value
                         ? 'border-blue-500 bg-blue-500'
                         : 'border-gray-300'
                     }`}>
                       {resolution === option.value && (
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