import React, { useState, useEffect } from 'react'
import { Music, Play, Pause, RotateCcw, Zap, ZapOff } from 'lucide-react'

const BPMController = ({ 
  sequence, 
  onBPMChange, 
  currentBPM, 
  onProcessSequence,
  isProcessing = false
}) => {
  const [localBPM, setLocalBPM] = useState(currentBPM || 120)
  const [isPreviewMode, setIsPreviewMode] = useState(false)
  const [isBPMControlEnabled, setIsBPMControlEnabled] = useState(false) // Nuevo estado para el toggle
  const [isBPMSectionCollapsed, setIsBPMSectionCollapsed] = useState(true) // Estado para colapsar sección
  
     // BPM presets con saltos de 5 (ahora hasta 220)
   const bpmPresets = Array.from({length: 33}, (_, i) => 60 + i * 5) // 60, 65, 70... 220
  
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
  
  // Manejar toggle de Control BPM
  const handleToggleBPMControl = () => {
    const newState = !isBPMControlEnabled
    setIsBPMControlEnabled(newState)
    
    if (!newState) {
      // Si se desactiva, resetear al BPM original y colapsar
      handleBPMChange(baseBPM)
      setIsBPMSectionCollapsed(true)
    } else {
      // Si se activa, expandir la sección
      setIsBPMSectionCollapsed(false)
    }
    
    // Notificar al componente padre sobre el cambio de estado
    onBPMChange(newState ? localBPM : null)
  }

  // Manejar cambio de BPM
  const handleBPMChange = (newBPM) => {
    setLocalBPM(newBPM)
    // Solo aplicar el cambio si el control BPM está habilitado
    if (isBPMControlEnabled) {
      onBPMChange(newBPM)
    }
  }
  
  // Reset a BPM original
  const handleResetBPM = () => {
    handleBPMChange(baseBPM)
  }


  

  
  return (
    <div className="bg-white rounded-lg shadow-md p-4 border border-gray-200">
      {/* Header compacto con toggle integrado */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center space-x-2">
          <Music className="h-5 w-5 text-purple-600" />
          <h3 className="text-lg font-semibold text-gray-800">Control de BPM</h3>
        </div>
        <div className="flex items-center space-x-2">
          <button
            onClick={handleToggleBPMControl}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
              isBPMControlEnabled ? 'bg-purple-600' : 'bg-gray-300'
            }`}
          >
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                isBPMControlEnabled ? 'translate-x-6' : 'translate-x-1'
              }`}
            />
          </button>
          {isBPMControlEnabled && (
            <button
              onClick={() => setIsBPMSectionCollapsed(!isBPMSectionCollapsed)}
              className="p-1 text-gray-500 hover:text-gray-700 transition-colors"
              title={isBPMSectionCollapsed ? "Expandir controles" : "Colapsar controles"}
            >
              <svg 
                className={`w-4 h-4 transform transition-transform ${isBPMSectionCollapsed ? 'rotate-90' : ''}`}
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          )}
        </div>
      </div>

      {/* Estado del control */}
      <div className="mb-3">
        <div className="flex items-center space-x-2 text-sm">
          {isBPMControlEnabled ? (
            <Zap className="h-4 w-4 text-purple-600" />
          ) : (
            <ZapOff className="h-4 w-4 text-gray-400" />
          )}
          <span className="text-gray-600">
            {isBPMControlEnabled 
              ? 'Activado - Todos los videos se ajustarán al BPM global'
              : 'Desactivado - Cada video mantiene su BPM original'
            }
          </span>
        </div>
      </div>
      
      {/* BPM Slider compacto - Solo cuando está activado */}
      {isBPMControlEnabled && (
        <div className={`overflow-hidden transition-all duration-300 ease-in-out ${
          isBPMSectionCollapsed ? 'max-h-0 opacity-0' : 'max-h-32 opacity-100'
        }`}>
          {/* BPM Display y Slider en línea */}
          <div className="flex items-center space-x-4 mb-3">
            <div className="flex items-center space-x-2">
              <span className={`text-2xl font-bold ${getBPMColor(localBPM)}`}>
                {localBPM}
              </span>
              <span className="text-sm text-gray-500">BPM</span>
            </div>
            
            <div className="flex-1">
                             <input
                 type="range"
                 min="60"
                 max="220"
                 step="5"
                 value={localBPM}
                 onChange={(e) => handleBPMChange(parseInt(e.target.value))}
                 className="w-full h-2 rounded-lg appearance-none cursor-pointer slider"
                 style={{
                   '--slider-value': `${((localBPM - 60) / (220 - 60)) * 100}%`,
                   background: `linear-gradient(to right, ${getSliderColor(localBPM)} 0%, ${getSliderColor(localBPM)} ${((localBPM - 60) / (220 - 60)) * 100}%, #e5e7eb ${((localBPM - 60) / (220 - 60)) * 100}%, #e5e7eb 100%)`
                 }}
               />
            </div>
            
            <button
              onClick={handleResetBPM}
              className="flex items-center space-x-1 text-sm text-gray-500 hover:text-gray-700 transition-colors"
              title="Reset a BPM original"
            >
              <RotateCcw className="h-3 w-3" />
              <span>Reset</span>
            </button>
          </div>
          
          {/* Descripción y resumen compacto */}
          <div className="flex items-center justify-between text-xs text-gray-500">
            <span>{getBPMDescription(localBPM)}</span>
            {baseBPM !== localBPM && (
              <span>(Original: {baseBPM} BPM)</span>
            )}
          </div>
          
          {/* Resumen de videos compacto */}
          <div className="mt-2 text-xs text-gray-600">
            <span className="font-medium">{sequence.length} videos</span>
            <span className="ml-2">
              {sequence.length > 0 && (
                <>
                  • Promedio: {Math.round(sequence.reduce((sum, v) => sum + v.bpm, 0) / sequence.length)} BPM
                  • Ajuste: {((localBPM / (sequence.reduce((sum, v) => sum + v.bpm, 0) / sequence.length)) - 1) * 100 > 0 ? '+' : ''}
                  {(((localBPM / (sequence.reduce((sum, v) => sum + v.bpm, 0) / sequence.length)) - 1) * 100).toFixed(1)}%
                </>
              )}
            </span>
          </div>
        </div>
      )}
      
      {/* Info compacto */}
      <div className="text-xs text-gray-500 text-center mt-2">
        <p>El video se generará automáticamente al guardar la secuencia</p>
      </div>
    </div>
  )
}

export default BPMController 