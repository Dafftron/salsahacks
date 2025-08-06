// Servicio para detección de BPM usando Web Audio API
// Implementación simplificada sin dependencias externas

export const extractBPMFromVideo = async (videoFile) => {
  try {
    console.log('🎵 Iniciando detección de BPM para:', videoFile.name)
    
    // Crear contexto de audio
    const audioContext = new (window.AudioContext || window.webkitAudioContext)()
    
    // Convertir video a ArrayBuffer
    const arrayBuffer = await videoFile.arrayBuffer()
    
    // Decodificar audio del video
    const audioBuffer = await audioContext.decodeAudioData(arrayBuffer)
    
    // Verificar si el video tiene audio significativo
    const hasAudio = checkAudioLevel(audioBuffer)
    if (!hasAudio) {
      console.log('🎵 Video sin audio significativo, usando BPM por defecto')
      return {
        success: false,
        bpm: null,
        originalBPM: null,
        error: 'Video sin audio significativo'
      }
    }
    
    console.log('🎵 Audio decodificado, detectando BPM...')
    
    // Detectar BPM usando análisis de frecuencia
    const bpm = await detectBPMFromAudioBuffer(audioBuffer)
    
    // Redondear a entero
    const roundedBPM = Math.round(bpm)
    
    console.log(`✅ BPM detectado: ${roundedBPM} para ${videoFile.name}`)
    
    return {
      success: true,
      bpm: roundedBPM,
      originalBPM: bpm,
      error: null
    }
  } catch (error) {
    console.error('❌ Error al detectar BPM:', error)
    return {
      success: false,
      bpm: null,
      originalBPM: null,
      error: error.message
    }
  }
}

// Función para verificar si el video tiene audio significativo
const checkAudioLevel = (audioBuffer) => {
  const channelData = audioBuffer.getChannelData(0)
  const sampleRate = audioBuffer.sampleRate
  
  // Analizar los primeros 5 segundos
  const analysisLength = Math.min(5 * sampleRate, channelData.length)
  const data = channelData.slice(0, analysisLength)
  
  // Calcular RMS (Root Mean Square) para medir el nivel de audio
  const rms = Math.sqrt(data.reduce((sum, sample) => sum + sample * sample, 0) / data.length)
  
  console.log(`🎵 Nivel de audio RMS: ${rms.toFixed(4)}`)
  
  // Considerar que hay audio si RMS > 0.01 (umbral muy bajo)
  return rms > 0.01
}

// Función para detectar BPM usando análisis de frecuencia
const detectBPMFromAudioBuffer = async (audioBuffer) => {
  const sampleRate = audioBuffer.sampleRate
  const channelData = audioBuffer.getChannelData(0) // Usar primer canal
  
  // Analizar los primeros 10 segundos para detectar ritmo
  const analysisLength = Math.min(10 * sampleRate, channelData.length)
  const data = channelData.slice(0, analysisLength)
  
  // Detectar picos de energía (beats)
  const peaks = detectPeaks(data, sampleRate)
  
  // Calcular intervalos entre picos
  const intervals = []
  for (let i = 1; i < peaks.length; i++) {
    intervals.push(peaks[i] - peaks[i - 1])
  }
  
  // Calcular BPM promedio
  if (intervals.length > 0) {
    const avgInterval = intervals.reduce((a, b) => a + b, 0) / intervals.length
    const bpm = (60 * sampleRate) / avgInterval
    
    console.log(`🎵 BPM calculado: ${bpm}, intervalos: ${intervals.length}, promedio: ${avgInterval}`)
    
    // Aplicar límites más realistas para salsa (80-180 BPM)
    const limitedBPM = Math.max(80, Math.min(180, bpm))
    
    if (bpm !== limitedBPM) {
      console.log(`🎵 BPM ajustado de ${bpm} a ${limitedBPM}`)
    }
    
    return limitedBPM
  }
  
  // BPM por defecto si no se detecta (BPM típico de salsa)
  console.log('🎵 No se detectaron intervalos, usando BPM por defecto: 120')
  return 120
}

// Función para detectar picos de energía
const detectPeaks = (data, sampleRate) => {
  const peaks = []
  
  // Calcular umbral dinámico basado en la energía promedio
  const energy = data.map(sample => sample * sample)
  const avgEnergy = energy.reduce((a, b) => a + b, 0) / energy.length
  const threshold = Math.max(0.05, Math.min(0.3, avgEnergy * 2)) // Umbral dinámico
  
  // Distancia mínima entre picos (0.3 segundos para evitar falsos positivos)
  const minDistance = sampleRate * 0.3
  
  console.log(`🎵 Detectando picos con umbral: ${threshold.toFixed(4)}, energía promedio: ${avgEnergy.toFixed(4)}`)
  
  for (let i = 1; i < data.length - 1; i++) {
    if (data[i] > threshold && data[i] > data[i - 1] && data[i] > data[i + 1]) {
      if (peaks.length === 0 || i - peaks[peaks.length - 1] > minDistance) {
        peaks.push(i)
      }
    }
  }
  
  console.log(`🎵 Picos detectados: ${peaks.length}`)
  return peaks
}

export const validateBPM = (bpm) => {
  // Validar que el BPM esté en un rango razonable para salsa (80-180 BPM)
  if (bpm < 80 || bpm > 180) {
    console.warn(`⚠️ BPM fuera de rango para salsa: ${bpm} (rango esperado: 80-180)`)
    return false
  }
  return true
}

export const getBPMDescription = (bpm) => {
  if (bpm < 60) return 'Muy lento'
  if (bpm < 80) return 'Lento'
  if (bpm < 100) return 'Moderado'
  if (bpm < 120) return 'Medio'
  if (bpm < 140) return 'Rápido'
  if (bpm < 160) return 'Muy rápido'
  return 'Extremadamente rápido'
} 