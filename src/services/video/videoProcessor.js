// Servicio para procesamiento de video usando FFmpeg.wasm
import { createFFmpeg, fetchFile } from '@ffmpeg/ffmpeg'

let ffmpeg = null

// Inicializar FFmpeg
export const initFFmpeg = async () => {
  if (ffmpeg) return ffmpeg
  
  console.log('🎬 Inicializando FFmpeg...')
  ffmpeg = createFFmpeg({ 
    log: true,
    corePath: 'https://unpkg.com/@ffmpeg/core@0.12.6/dist/ffmpeg-core.js'
  })
  
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
    
    // Leer archivo de salida
    const data = ffmpegInstance.FS('readFile', outputName)
    
    // Limpiar archivos temporales
    ffmpegInstance.FS('unlink', 'input.mp4')
    ffmpegInstance.FS('unlink', outputName)
    
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
      
      console.log(`🎬 Procesando video ${i + 1}/${videos.length}: ${video.title} (BPM: ${video.bpm} → ${targetBPM})`)
      
      // Ajustar velocidad del video
      const result = await adjustVideoSpeed(video.file, speedFactor, `adjusted${i}.mp4`)
      
      if (!result.success) {
        throw new Error(`Error al procesar video ${i + 1}: ${result.error}`)
      }
      
      processedVideos.push(result.data)
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
      ffmpegInstance.FS('unlink', `processed${i}.mp4`)
    }
    ffmpegInstance.FS('unlink', 'filelist.txt')
    ffmpegInstance.FS('unlink', 'final_sequence.mp4')
    
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