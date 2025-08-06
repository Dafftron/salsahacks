// Servicio para procesamiento de video usando FFmpeg.wasm
import { FFmpeg } from '@ffmpeg/ffmpeg'
import { fetchFile } from '@ffmpeg/util'

let ffmpeg = null

// Inicializar FFmpeg
export const initFFmpeg = async () => {
  if (ffmpeg) return ffmpeg
  
  console.log('🎬 Inicializando FFmpeg...')
  ffmpeg = new FFmpeg()
  
  await ffmpeg.load()
  console.log('✅ FFmpeg inicializado correctamente')
  return ffmpeg
}

// Ajustar velocidad de un video
export const adjustVideoSpeed = async (videoFile, speedFactor, outputName = 'output.mp4') => {
  try {
    console.log(`🎬 Ajustando velocidad del video: factor ${speedFactor}`)
    
    const ffmpegInstance = await initFFmpeg()
    
    // Escribir archivo de entrada
    ffmpegInstance.FS('writeFile', 'input.mp4', await fetchFile(videoFile))
    
    // Intentar primero con audio, si falla, procesar solo video
    try {
      // Ajustar velocidad manteniendo pitch del audio
      await ffmpegInstance.run(
        '-i', 'input.mp4',
        '-filter:v', `setpts=${1/speedFactor}*PTS`,
        '-filter:a', `atempo=${speedFactor}`,
        '-c:v', 'libx264',
        '-c:a', 'aac',
        '-preset', 'fast',
        outputName
      )
    } catch (audioError) {
      console.log('⚠️ Error con audio, procesando solo video:', audioError.message)
      
      // Procesar solo video sin audio
      await ffmpegInstance.run(
        '-i', 'input.mp4',
        '-filter:v', `setpts=${1/speedFactor}*PTS`,
        '-c:v', 'libx264',
        '-an', // Sin audio
        '-preset', 'fast',
        outputName
      )
    }
    
    // Leer archivo de salida
    const data = ffmpegInstance.FS('readFile', outputName)
    
    // Limpiar archivos temporales
    try {
      ffmpegInstance.FS('unlink', 'input.mp4')
      ffmpegInstance.FS('unlink', outputName)
    } catch (e) {
      console.warn('⚠️ No se pudieron limpiar archivos temporales')
    }
    
    console.log('✅ Velocidad ajustada correctamente')
    
    return {
      success: true,
      data: data,
      error: null
    }
  } catch (error) {
    console.error('❌ Error al ajustar velocidad:', error)
    return {
      success: false,
      data: null,
      error: error.message
    }
  }
}

// Concatenar múltiples videos
export const concatenateVideos = async (videoFiles, outputName = 'concatenated.mp4') => {
  try {
    console.log(`🎬 Concatenando ${videoFiles.length} videos...`)
    
    const ffmpegInstance = await initFFmpeg()
    
    // Escribir archivos de entrada
    for (let i = 0; i < videoFiles.length; i++) {
      const fileName = `input${i}.mp4`
      ffmpegInstance.FS('writeFile', fileName, await fetchFile(videoFiles[i]))
    }
    
    // Crear archivo de lista para concatenación
    const fileList = videoFiles.map((_, i) => `file input${i}.mp4`).join('\n')
    ffmpegInstance.FS('writeFile', 'filelist.txt', fileList)
    
    // Concatenar videos
    await ffmpegInstance.run(
      '-f', 'concat',
      '-safe', '0',
      '-i', 'filelist.txt',
      '-c', 'copy',
      outputName
    )
    
    // Leer archivo de salida
    const data = ffmpegInstance.FS('readFile', outputName)
    
    // Limpiar archivos temporales
    for (let i = 0; i < videoFiles.length; i++) {
      ffmpegInstance.FS('unlink', `input${i}.mp4`)
    }
    ffmpegInstance.FS('unlink', 'filelist.txt')
    ffmpegInstance.FS('unlink', outputName)
    
    console.log('✅ Videos concatenados correctamente')
    
    return {
      success: true,
      data: data,
      error: null
    }
  } catch (error) {
    console.error('❌ Error al concatenar videos:', error)
    return {
      success: false,
      data: null,
      error: error.message
    }
  }
}

// Procesar secuencia completa con ajuste de BPM
export const processVideoSequence = async (videos, targetBPM) => {
  try {
    console.log(`🎬 Procesando secuencia de ${videos.length} videos a ${targetBPM} BPM...`)
    
    const ffmpegInstance = await initFFmpeg()
    const processedVideos = []
    
    // Procesar cada video individualmente
    for (let i = 0; i < videos.length; i++) {
      const video = videos[i]
      const speedFactor = targetBPM / video.bpm
      
      console.log(`🎬 Procesando video ${i + 1}/${videos.length}: ${video.title} (BPM: ${video.bpm} → ${targetBPM}, factor: ${speedFactor.toFixed(2)}x)`)
      
      // Verificar que el archivo existe
      if (!video.file) {
        throw new Error(`Video ${i + 1} (${video.title}) no tiene archivo asociado`)
      }
      
      // Ajustar velocidad del video
      const result = await adjustVideoSpeed(video.file, speedFactor, `adjusted${i}.mp4`)
      
      if (!result.success) {
        throw new Error(`Error al procesar video ${i + 1} (${video.title}): ${result.error}`)
      }
      
      processedVideos.push(result.data)
      console.log(`✅ Video ${i + 1} procesado correctamente`)
    }
    
    // Concatenar todos los videos ajustados
    console.log('🎬 Concatenando videos procesados...')
    
    // Escribir videos procesados
    for (let i = 0; i < processedVideos.length; i++) {
      ffmpegInstance.FS('writeFile', `processed${i}.mp4`, processedVideos[i])
    }
    
    // Crear archivo de lista
    const fileList = processedVideos.map((_, i) => `file processed${i}.mp4`).join('\n')
    ffmpegInstance.FS('writeFile', 'filelist.txt', fileList)
    
    // Concatenar
    await ffmpegInstance.run(
      '-f', 'concat',
      '-safe', '0',
      '-i', 'filelist.txt',
      '-c', 'copy',
      'final_sequence.mp4'
    )
    
    // Leer resultado final
    const finalData = ffmpegInstance.FS('readFile', 'final_sequence.mp4')
    
    // Limpiar archivos temporales
    for (let i = 0; i < processedVideos.length; i++) {
      try {
        ffmpegInstance.FS('unlink', `processed${i}.mp4`)
      } catch (e) {
        console.warn(`⚠️ No se pudo limpiar archivo temporal processed${i}.mp4`)
      }
    }
    try {
      ffmpegInstance.FS('unlink', 'filelist.txt')
      ffmpegInstance.FS('unlink', 'final_sequence.mp4')
    } catch (e) {
      console.warn('⚠️ No se pudieron limpiar algunos archivos temporales')
    }
    
    console.log('✅ Secuencia procesada correctamente')
    
    return {
      success: true,
      data: finalData,
      error: null
    }
  } catch (error) {
    console.error('❌ Error al procesar secuencia:', error)
    return {
      success: false,
      data: null,
      error: error.message
    }
  }
}

// Crear preview de secuencia (con o sin ajuste de BPM)
export const createSequencePreview = async (videos, useBPMControl = false, targetBPM = null) => {
  try {
    console.log(`🎬 Creando preview de secuencia con ${videos.length} videos...`)
    console.log(`🎬 Control BPM: ${useBPMControl ? 'Activado' : 'Desactivado'}`)
    if (useBPMControl && targetBPM) {
      console.log(`🎬 BPM objetivo: ${targetBPM}`)
    }
    
    const ffmpegInstance = await initFFmpeg()
    const processedVideos = []
    
    // Procesar cada video según el estado del control BPM
    for (let i = 0; i < videos.length; i++) {
      const video = videos[i]
      
      // Verificar que el archivo existe
      if (!video.file) {
        throw new Error(`Video ${i + 1} (${video.title}) no tiene archivo asociado`)
      }
      
      if (useBPMControl && targetBPM && video.bpm) {
        // Ajustar velocidad según BPM
        const speedFactor = targetBPM / video.bpm
        console.log(`🎬 Procesando video ${i + 1}/${videos.length}: ${video.title} (BPM: ${video.bpm} → ${targetBPM}, factor: ${speedFactor.toFixed(2)}x)`)
        
        const result = await adjustVideoSpeed(video.file, speedFactor, `preview${i}.mp4`)
        if (!result.success) {
          throw new Error(`Error al procesar video ${i + 1} (${video.title}): ${result.error}`)
        }
        processedVideos.push(result.data)
      } else {
        // Usar video original sin ajuste
        console.log(`🎬 Usando video ${i + 1}/${videos.length}: ${video.title} (BPM original: ${video.bpm})`)
        processedVideos.push(await fetchFile(video.file))
      }
    }
    
    // Concatenar videos
    console.log('🎬 Concatenando videos para preview...')
    
    // Escribir videos procesados
    for (let i = 0; i < processedVideos.length; i++) {
      ffmpegInstance.FS('writeFile', `preview${i}.mp4`, processedVideos[i])
    }
    
    // Crear archivo de lista
    const fileList = processedVideos.map((_, i) => `file preview${i}.mp4`).join('\n')
    ffmpegInstance.FS('writeFile', 'filelist.txt', fileList)
    
    // Concatenar
    await ffmpegInstance.run(
      '-f', 'concat',
      '-safe', '0',
      '-i', 'filelist.txt',
      '-c', 'copy',
      'sequence_preview.mp4'
    )
    
    // Leer resultado final
    const finalData = ffmpegInstance.FS('readFile', 'sequence_preview.mp4')
    
    // Limpiar archivos temporales
    for (let i = 0; i < processedVideos.length; i++) {
      try {
        ffmpegInstance.FS('unlink', `preview${i}.mp4`)
      } catch (e) {
        console.warn(`⚠️ No se pudo limpiar archivo temporal preview${i}.mp4`)
      }
    }
    try {
      ffmpegInstance.FS('unlink', 'filelist.txt')
      ffmpegInstance.FS('unlink', 'sequence_preview.mp4')
    } catch (e) {
      console.warn('⚠️ No se pudieron limpiar algunos archivos temporales')
    }
    
    console.log('✅ Preview de secuencia creado correctamente')
    
    return {
      success: true,
      data: finalData,
      error: null
    }
  } catch (error) {
    console.error('❌ Error al crear preview de secuencia:', error)
    return {
      success: false,
      data: null,
      error: error.message
    }
  }
}

// Convertir video a diferentes formatos
export const convertVideoFormat = async (videoFile, format = 'mp4', quality = 'medium') => {
  try {
    console.log(`🎬 Convirtiendo video a formato ${format} con calidad ${quality}...`)
    
    const ffmpegInstance = await initFFmpeg()
    
    // Escribir archivo de entrada
    ffmpegInstance.FS('writeFile', 'input.mp4', await fetchFile(videoFile))
    
    // Configurar calidad
    let qualitySettings = []
    switch (quality) {
      case 'low':
        qualitySettings = ['-crf', '28', '-preset', 'ultrafast']
        break
      case 'medium':
        qualitySettings = ['-crf', '23', '-preset', 'fast']
        break
      case 'high':
        qualitySettings = ['-crf', '18', '-preset', 'medium']
        break
      default:
        qualitySettings = ['-crf', '23', '-preset', 'fast']
    }
    
    // Convertir formato
    await ffmpegInstance.run(
      '-i', 'input.mp4',
      ...qualitySettings,
      `output.${format}`
    )
    
    // Leer archivo de salida
    const data = ffmpegInstance.FS('readFile', `output.${format}`)
    
    // Limpiar archivos temporales
    ffmpegInstance.FS('unlink', 'input.mp4')
    ffmpegInstance.FS('unlink', `output.${format}`)
    
    console.log('✅ Video convertido correctamente')
    
    return {
      success: true,
      data: data,
      format: format,
      error: null
    }
  } catch (error) {
    console.error('❌ Error al convertir video:', error)
    return {
      success: false,
      data: null,
      format: null,
      error: error.message
    }
  }
}

// Generar video final de secuencia para descarga
export const generateSequenceVideo = async (sequence, format = 'mp4', quality = 'medium') => {
  try {
    console.log(`🎬 Generando video de secuencia: ${sequence.name}`)
    console.log(`📹 Formato: ${format}, Calidad: ${quality}`)
    
    if (!sequence.videos || sequence.videos.length === 0) {
      throw new Error('La secuencia no tiene videos')
    }
    
    // Usar la configuración de BPM guardada en la secuencia
    const useBPMControl = sequence.useBPMControl || false
    const targetBPM = sequence.targetBPM || null
    
    console.log(`🎵 Configuración BPM: ${useBPMControl ? 'Activado' : 'Desactivado'}, BPM: ${targetBPM}`)
    
    // Generar el video combinado
    const result = await createSequencePreview(sequence.videos, useBPMControl, targetBPM)
    
    if (!result.success) {
      throw new Error(`Error generando video: ${result.error}`)
    }
    
    // Si se requiere un formato específico, convertir
    if (format !== 'mp4') {
      console.log(`🔄 Convirtiendo a formato ${format}...`)
      const convertResult = await convertVideoFormat(
        new Blob([result.data], { type: 'video/mp4' }), 
        format, 
        quality
      )
      
      if (!convertResult.success) {
        throw new Error(`Error convirtiendo formato: ${convertResult.error}`)
      }
      
      return {
        success: true,
        data: convertResult.data,
        format: format,
        error: null
      }
    }
    
    return {
      success: true,
      data: result.data,
      format: 'mp4',
      error: null
    }
  } catch (error) {
    console.error('❌ Error generando video de secuencia:', error)
    return {
      success: false,
      data: null,
      format: null,
      error: error.message
    }
  }
} 