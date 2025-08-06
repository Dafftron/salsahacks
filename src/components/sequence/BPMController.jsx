import React from 'react'
import { Music, Play, Pause, Download } from 'lucide-react'

const BPMController = ({ 
  sequence, 
  onProcessSequence,
  isProcessing = false
}) => {
  // Calcular estadísticas de BPM
  const bpmStats = () => {
    const videosWithBPM = sequence.filter(video => video.bpm)
    if (videosWithBPM.length === 0) return null
    
    const bpmValues = videosWithBPM.map(video => video.bpm)
    const averageBPM = bpmValues.reduce((sum, bpm) => sum + bpm, 0) / bpmValues.length
    const minBPM = Math.min(...bpmValues)
    const maxBPM = Math.max(...bpmValues)
    
    return {
      average: Math.round(averageBPM),
      min: minBPM,
      max: maxBPM,
      count: videosWithBPM.length,
      total: sequence.length
    }
  }
  
  const stats = bpmStats()
  
  // Obtener descripción del BPM
  const getBPMDescription = (bpm) => {
    if (bpm < 60) return 'Muy lento'
    if (bpm < 80) return 'Lento'
    if (bpm < 100) return 'Moderado'
    if (bpm < 120) return 'Medio'
    if (bpm < 140) return 'Rápido'
    if (bpm < 160) return 'Muy rápido'
    if (bpm < 200) return 'Extremadamente rápido'
    return 'Hiper rápido'
  }
  
  // Obtener color del BPM
  const getBPMColor = (bpm) => {
    if (bpm < 80) return 'text-blue-600'
    if (bpm < 120) return 'text-green-600'
    if (bpm < 160) return 'text-orange-600'
    if (bpm < 200) return 'text-red-600'
    return 'text-purple-600'
  }
  
  return (
    <div className="bg-white rounded-lg shadow-md p-4 border border-gray-200">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2">
          <Music className="h-5 w-5 text-purple-600" />
          <h3 className="text-lg font-semibold text-gray-800">Información de BPM</h3>
        </div>
        
        {/* Botón de descarga */}
        <button
          onClick={onProcessSequence}
          disabled={isProcessing || sequence.length === 0}
          className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
            isProcessing || sequence.length === 0
              ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
              : 'bg-gradient-to-r from-purple-500 to-pink-500 text-white hover:from-purple-600 hover:to-pink-600 shadow-lg transform hover:scale-105'
          }`}
        >
          {isProcessing ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              <span>Procesando...</span>
            </>
          ) : (
            <>
              <Download className="h-4 w-4" />
              <span>Descargar Secuencia</span>
            </>
          )}
        </button>
      </div>
      
      {/* Información de BPM */}
      {stats ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* BPM Promedio */}
          <div className="bg-gradient-to-br from-purple-50 to-pink-50 p-4 rounded-lg border border-purple-200">
            <div className="flex items-center space-x-2 mb-2">
              <Music className="h-4 w-4 text-purple-600" />
              <span className="text-sm font-medium text-gray-600">BPM Promedio</span>
            </div>
            <div className={`text-2xl font-bold ${getBPMColor(stats.average)}`}>
              {stats.average}
            </div>
            <div className="text-sm text-gray-500">
              {getBPMDescription(stats.average)}
            </div>
          </div>
          
          {/* Rango de BPM */}
          <div className="bg-gradient-to-br from-blue-50 to-cyan-50 p-4 rounded-lg border border-blue-200">
            <div className="flex items-center space-x-2 mb-2">
              <Music className="h-4 w-4 text-blue-600" />
              <span className="text-sm font-medium text-gray-600">Rango BPM</span>
            </div>
            <div className="text-lg font-bold text-blue-600">
              {stats.min} - {stats.max}
            </div>
            <div className="text-sm text-gray-500">
              {stats.max - stats.min} BPM de diferencia
            </div>
          </div>
          
          {/* Videos con BPM */}
          <div className="bg-gradient-to-br from-green-50 to-emerald-50 p-4 rounded-lg border border-green-200">
            <div className="flex items-center space-x-2 mb-2">
              <Music className="h-4 w-4 text-green-600" />
              <span className="text-sm font-medium text-gray-600">Videos con BPM</span>
            </div>
            <div className="text-lg font-bold text-green-600">
              {stats.count} / {stats.total}
            </div>
            <div className="text-sm text-gray-500">
              {Math.round((stats.count / stats.total) * 100)}% con BPM detectado
            </div>
          </div>
        </div>
      ) : (
        <div className="text-center py-8 text-gray-500">
          <Music className="w-12 h-12 mx-auto mb-4 opacity-50" />
          <p>No hay videos con BPM detectado</p>
          <p className="text-sm">Los videos se combinarán a velocidad normal</p>
        </div>
      )}
      
      {/* Mensaje informativo */}
      <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
        <div className="flex items-center space-x-2 text-blue-800">
          <Music className="h-4 w-4" />
          <span className="text-sm font-medium">
            Los videos se combinarán manteniendo su velocidad original. Cada video conservará su BPM natural.
          </span>
        </div>
      </div>
    </div>
  )
}

export default BPMController 