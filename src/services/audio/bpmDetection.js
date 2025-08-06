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
    return Math.max(60, Math.min(200, bpm)) // Limitar entre 60-200 BPM
  }
  
  // BPM por defecto si no se detecta
  return 120
}

// Función para detectar picos de energía
const detectPeaks = (data, sampleRate) => {
  const peaks = []
  const threshold = 0.1
  const minDistance = sampleRate * 0.1 // Mínimo 0.1 segundos entre picos
  
  for (let i = 1; i < data.length - 1; i++) {
    if (data[i] > threshold && data[i] > data[i - 1] && data[i] > data[i + 1]) {
      if (peaks.length === 0 || i - peaks[peaks.length - 1] > minDistance) {
        peaks.push(i)
      }
    }
  }
  
  return peaks
}

export const validateBPM = (bpm) => {
  // Validar que el BPM esté en un rango razonable (60-200 BPM)
  if (bpm < 60 || bpm > 200) {
    console.warn(`⚠️ BPM fuera de rango: ${bpm}`)
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