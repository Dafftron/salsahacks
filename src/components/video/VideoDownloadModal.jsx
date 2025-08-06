import React, { useState, useEffect } from 'react'
import { X, Download, AlertCircle, CheckCircle, Loader } from 'lucide-react'
import VideoCombiner from '../../services/video/videoCombiner'

const VideoDownloadModal = ({ 
  isOpen, 
  onClose, 
  videos, 
  sequenceName = 'Secuencia' 
}) => {
  const [progress, setProgress] = useState(null)
  const [isProcessing, setIsProcessing] = useState(false)
  const [error, setError] = useState(null)
  const [downloadUrl, setDownloadUrl] = useState(null)
  const [quality, setQuality] = useState('fast') // 'fast' o 'professional'

  const videoCombiner = new VideoCombiner()

  useEffect(() => {
    if (isOpen) {
      setProgress(null)
      setError(null)
      setDownloadUrl(null)
      setIsProcessing(false)
    }
  }, [isOpen])

  const handleDownload = async () => {
    if (!videos || videos.length === 0) {
      setError('No hay videos para combinar')
      return
    }

    setIsProcessing(true)
    setError(null)
    setProgress({
      stage: 'init',
      current: 0,
      total: 100,
      message: 'Iniciando FFmpeg.wasm...'
    })

    try {
      console.log('Iniciando combinación con FFmpeg.wasm...')
      const combinedBlob = await videoCombiner.combineVideos(videos, setProgress)

      // Crear URL para descarga
      const url = URL.createObjectURL(combinedBlob)
      setDownloadUrl(url)

      setProgress({
        stage: 'complete',
        current: 100,
        total: 100,
        message: '¡Videos combinados exitosamente!'
      })

    } catch (error) {
      console.error('Error en descarga:', error)
      setError(`Error combinando videos: ${error.message}`)
      setProgress(null)
    } finally {
      setIsProcessing(false)
    }
  }

  const handleDownloadFile = () => {
    if (downloadUrl) {
      const link = document.createElement('a')
      link.href = downloadUrl
      link.download = `${sequenceName}.webm`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
    }
  }

  const getProgressColor = () => {
    if (error) return 'text-red-500'
    if (progress?.stage === 'complete') return 'text-green-500'
    return 'text-blue-500'
  }

  const getProgressIcon = () => {
    if (error) return <AlertCircle className="h-5 w-5" />
    if (progress?.stage === 'complete') return <CheckCircle className="h-5 w-5" />
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
        return 'Inicializando FFmpeg.wasm...'
      case 'download':
        return 'Descargando videos...'
      case 'combine':
        return 'Combinando videos con FFmpeg...'
      case 'finalize':
        return 'Finalizando archivo...'
      case 'complete':
        return '¡Proceso completado!'
      default:
        return 'Preparando...'
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-gray-800">
            Descargar Secuencia
          </h2>
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
          <div className="bg-gray-50 rounded-lg p-3">
            <p className="text-sm text-gray-600">
              <strong>{videos?.length || 0} videos</strong> serán combinados en uno solo
            </p>
            <p className="text-xs text-gray-500 mt-1">
              Duración total: {videos?.reduce((sum, v) => sum + (v.duration || 0), 0).toFixed(1)}s
              {videos?.some(v => !v.duration) && ' (calculando...)'}
            </p>
            <p className="text-xs text-blue-600 mt-1">
              Formato: WebM (calidad optimizada con MediaRecorder)
            </p>
          </div>

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
                <CheckCircle className="h-5 w-5 text-green-500" />
                <span className="text-sm text-green-700">
                  ¡Videos combinados exitosamente!
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex space-x-3 mt-6">
          {!isProcessing && !downloadUrl && (
            <button
              onClick={handleDownload}
              className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center space-x-2"
            >
              <Download className="h-4 w-4" />
              <span>Combinar Videos</span>
            </button>
          )}

          {downloadUrl && (
            <button
              onClick={handleDownloadFile}
              className="flex-1 bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 transition-colors flex items-center justify-center space-x-2"
            >
              <Download className="h-4 w-4" />
              <span>Descargar WebM</span>
            </button>
          )}

          <button
            onClick={onClose}
            className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            disabled={isProcessing}
          >
            {downloadUrl ? 'Cerrar' : 'Cancelar'}
          </button>
        </div>
      </div>
    </div>
  )
}

export default VideoDownloadModal
