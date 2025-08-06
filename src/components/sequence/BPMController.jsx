import React, { useState, useEffect } from 'react'
import { Music, Play, Pause, RotateCcw } from 'lucide-react'

const BPMController = ({ 
  sequence, 
  onBPMChange, 
  currentBPM, 
  onProcessSequence,
  isProcessing = false 
}) => {
  const [processingStep, setProcessingStep] = useState('')
  const [localBPM, setLocalBPM] = useState(currentBPM || 120)
  const [isPreviewMode, setIsPreviewMode] = useState(false)
  
  // BPM presets con saltos de 5 (ahora hasta 300)
  const bpmPresets = Array.from({length: 49}, (_, i) => 60 + i * 5) // 60, 65, 70... 300
  
  // Efecto para sincronizar BPM local con prop
  useEffect(() => {
    setLocalBPM(currentBPM || 120)
  }, [currentBPM])
  
  // Obtener BPM base (del primer video)
  const baseBPM = sequence.length > 0 ? sequence[0].bpm : 120
  
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
  
  // Obtener color del slider basado en BPM
  const getSliderColor = (bpm) => {
    if (bpm < 80) return '#3b82f6' // blue
    if (bpm < 120) return '#10b981' // green
    if (bpm < 160) return '#f59e0b' // orange
    if (bpm < 200) return '#ef4444' // red
    return '#8b5cf6' // purple
  }
  
  // Manejar cambio de BPM
  const handleBPMChange = (newBPM) => {
    setLocalBPM(newBPM)
    onBPMChange(newBPM)
  }
  
  // Reset a BPM original
  const handleResetBPM = () => {
    handleBPMChange(baseBPM)
  }
  
  // Procesar secuencia
  const handleProcessSequence = () => {
    setProcessingStep('Iniciando procesamiento...')
    onProcessSequence(localBPM)
  }
  
  return (
    <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2">
          <Music className="h-5 w-5 text-purple-600" />
          <h3 className="text-lg font-semibold text-gray-800">Control de BPM</h3>
        </div>
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setIsPreviewMode(!isPreviewMode)}
            className={`p-2 rounded-lg transition-colors ${
              isPreviewMode 
                ? 'bg-purple-100 text-purple-600' 
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
            title={isPreviewMode ? 'Desactivar preview' : 'Activar preview'}
          >
            {isPreviewMode ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
          </button>
        </div>
      </div>
      
      {/* BPM Slider */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-gray-600">BPM Global</span>
          <button
            onClick={handleResetBPM}
            className="flex items-center space-x-1 text-sm text-gray-500 hover:text-gray-700 transition-colors"
            title="Reset a BPM original"
          >
            <RotateCcw className="h-3 w-3" />
            <span>Reset</span>
          </button>
        </div>
        
        <div className="text-center mb-4">
          <span className={`text-3xl font-bold ${getBPMColor(localBPM)}`}>
            {localBPM}
          </span>
          <span className="text-sm text-gray-500 ml-2">BPM</span>
        </div>
        
        <div className="text-center mb-4">
          <span className="text-sm text-gray-600">
            {getBPMDescription(localBPM)}
          </span>
          {baseBPM !== localBPM && (
            <span className="text-xs text-gray-400 ml-2">
              (Original: {baseBPM} BPM)
            </span>
          )}
        </div>
        
        {/* Solo el slider sin números */}
        <div className="px-2">
          <input
            type="range"
            min="60"
            max="300"
            step="5"
            value={localBPM}
            onChange={(e) => handleBPMChange(parseInt(e.target.value))}
            className="w-full h-3 rounded-lg appearance-none cursor-pointer slider"
            style={{
              '--slider-value': `${((localBPM - 60) / (300 - 60)) * 100}%`,
              background: `linear-gradient(to right, ${getSliderColor(localBPM)} 0%, ${getSliderColor(localBPM)} ${((localBPM - 60) / (300 - 60)) * 100}%, #e5e7eb ${((localBPM - 60) / (300 - 60)) * 100}%, #e5e7eb 100%)`
            }}
          />
        </div>
      </div>
      
      {/* Video List */}
      <div className="mb-6">
        <div className="text-sm font-medium text-gray-600 mb-3">
          Videos en secuencia ({sequence.length}):
        </div>
        <div className="space-y-2 max-h-40 overflow-y-auto">
          {sequence.map((video, index) => {
            const speedFactor = localBPM / video.bpm
            const speedChange = ((speedFactor - 1) * 100).toFixed(1)
            
            return (
              <div key={video.id} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium text-gray-800 truncate">
                    {index + 1}. {video.title}
                  </div>
                  <div className="text-xs text-gray-500">
                    Original: {video.bpm} BPM
                  </div>
                </div>
                <div className="text-right">
                  <div className={`text-sm font-medium ${
                    speedFactor > 1 ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {speedFactor > 1 ? '+' : ''}{speedChange}%
                  </div>
                  <div className="text-xs text-gray-500">
                    {speedFactor.toFixed(2)}x
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>
      
      {/* Process Button */}
      <button
        onClick={handleProcessSequence}
        disabled={isProcessing || sequence.length === 0}
        className={`w-full py-3 px-4 rounded-lg font-medium transition-colors ${
          isProcessing || sequence.length === 0
            ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
            : 'bg-purple-600 text-white hover:bg-purple-700'
        }`}
      >
        {isProcessing ? (
          <div className="flex flex-col items-center justify-center space-y-2">
            <div className="flex items-center space-x-2">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              <span>Procesando secuencia...</span>
            </div>
            {processingStep && (
              <div className="text-xs text-purple-100 text-center">
                {processingStep}
              </div>
            )}
          </div>
        ) : (
          <span>Generar Video con BPM {localBPM}</span>
        )}
      </button>
      
      {/* Info */}
      <div className="mt-4 text-xs text-gray-500 text-center">
        <p>El video generado tendrá todos los movimientos a la misma velocidad</p>
        <p>Los videos se ajustarán automáticamente al BPM seleccionado</p>
      </div>
    </div>
  )
}

export default BPMController 