// Servicio para procesamiento de video usando FFmpeg.wasm
import { FFmpeg } from '@ffmpeg/ffmpeg'
import { fetchFile } from '@ffmpeg/util'

let ffmpeg = null

// Inicializar FFmpeg
export const initFFmpeg = async () => {
  if (ffmpeg && ffmpeg.FS) {
    console.log('✅ FFmpeg ya inicializado, reutilizando instancia')
    return ffmpeg
  }
  
  console.log('🎬 Inicializando FFmpeg...')
  ffmpeg = new FFmpeg()
  
  try {
    await ffmpeg.load()
    console.log('✅ FFmpeg inicializado correctamente')
    return ffmpeg
  } catch (error) {
    console.error('❌ Error al inicializar FFmpeg:', error)
    ffmpeg = null
    throw new Error('No se pudo inicializar FFmpeg')
  }
}

// Ajustar velocidad de un video
export const adjustVideoSpeed = async (videoFile, speedFactor, outputName = 'output.mp4') => {
  try {
    console.log(`🎬 Ajustando velocidad del video: factor ${speedFactor}`)
    
    const ffmpegInstance = await initFFmpeg()
    
    // Verificar que FFmpeg esté correctamente inicializado
    if (!ffmpegInstance || !ffmpegInstance.FS) {
      throw new Error('FFmpeg no está correctamente inicializado')
    }
    
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
    
    // Verificar que FFmpeg esté correctamente inicializado
    if (!ffmpegInstance || !ffmpegInstance.FS) {
      throw new Error('FFmpeg no está correctamente inicializado')
    }
    
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

// Procesar secuencia completa
export const processVideoSequence = async (videos) => {
  try {
    console.log(`🎬 Procesando secuencia de ${videos.length} videos...`)
    
    const ffmpegInstance = await initFFmpeg()
    const processedVideos = []
    
    // Procesar cada video individualmente
    for (let i = 0; i < videos.length; i++) {
      const video = videos[i]
      
      console.log(`🎬 Procesando video ${i + 1}/${videos.length}: ${video.title}`)
        
        // Descargar video desde Firebase Storage si no tiene file
        let videoBlob
        if (video.file) {
          videoBlob = video.file
        } else if (video.videoUrl) {
          console.log(`📥 Descargando video ${i + 1}/${videos.length} desde URL: ${video.videoUrl}`)
          
          try {
            // Intentar descarga directa primero
            const response = await fetch(video.videoUrl, {
              mode: 'cors',
              credentials: 'omit'
            })
            
            if (!response.ok) {
              throw new Error(`HTTP ${response.status}: ${response.statusText}`)
            }
            
            videoBlob = await response.blob()
            console.log(`✅ Video descargado exitosamente: ${videoBlob.size} bytes`)
          } catch (fetchError) {
            console.warn(`⚠️ Error en fetch directo: ${fetchError.message}`)
            
            // Si falla, intentar con Firebase Storage SDK
            try {
              const { getStorage, ref, getDownloadURL } = await import('firebase/storage')
              const storage = getStorage()
              
              // Si videoUrl es una URL completa, extraer la ruta
              let storagePath = video.videoUrl
              if (video.videoUrl.includes('firebasestorage.googleapis.com')) {
                // Extraer la ruta del bucket de la URL
                const urlParts = video.videoUrl.split('/o/')
                if (urlParts.length > 1) {
                  storagePath = decodeURIComponent(urlParts[1].split('?')[0])
                }
              }
              
              const videoRef = ref(storage, storagePath)
              const downloadURL = await getDownloadURL(videoRef)
              
              const response = await fetch(downloadURL)
              if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`)
              }
              
              videoBlob = await response.blob()
              console.log(`✅ Video descargado via Firebase SDK: ${videoBlob.size} bytes`)
            } catch (storageError) {
              throw new Error(`Error descargando video ${i + 1} (${video.title}): ${storageError.message}`)
            }
          }
        } else {
          throw new Error(`Video ${i + 1} (${video.title}) no tiene archivo ni URL asociada`)
        }
        
        // Ajustar velocidad del video
       const result = await adjustVideoSpeed(videoBlob, speedFactor, `adjusted${i}.mp4`)
       
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

// Crear preview de secuencia
export const createSequencePreview = async (videos) => {
  try {
    console.log(`🎬 Creando preview de secuencia con ${videos.length} videos...`)
    
    const ffmpegInstance = await initFFmpeg()
    const processedVideos = []
    
    // Procesar cada video de forma optimizada
    for (let i = 0; i < videos.length; i++) {
      const video = videos[i]
      
      // Descargar video desde Firebase Storage si no tiene file
      let videoBlob
      if (video.file) {
        videoBlob = video.file
        console.log(`✅ Video ${i + 1}/${videos.length}: ${video.title} (archivo local)`)
      } else if (video.videoUrl) {
        console.log(`📥 Descargando video ${i + 1}/${videos.length} desde URL...`)
        
        try {
          // Intentar descarga directa primero
          const response = await fetch(video.videoUrl, {
            mode: 'cors',
            credentials: 'omit',
            headers: {
              'Accept': 'video/*,*/*;q=0.9',
              'Cache-Control': 'no-cache'
            }
          })
          
          if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`)
          }
          
          videoBlob = await response.blob()
          console.log(`✅ Video ${i + 1}/${videos.length}: ${video.title} descargado (${videoBlob.size} bytes)`)
        } catch (fetchError) {
          console.warn(`⚠️ Error en fetch directo: ${fetchError.message}`)
          
          // Si falla, intentar con Firebase Storage SDK
          try {
            const { getStorage, ref, getDownloadURL } = await import('firebase/storage')
            const storage = getStorage()
            
            // Si videoUrl es una URL completa, extraer la ruta
            let storagePath = video.videoUrl
            if (video.videoUrl.includes('firebasestorage.googleapis.com')) {
              // Extraer la ruta del bucket de la URL
              const urlParts = video.videoUrl.split('/o/')
              if (urlParts.length > 1) {
                storagePath = decodeURIComponent(urlParts[1].split('?')[0])
              }
            }
            
            const videoRef = ref(storage, storagePath)
            const downloadURL = await getDownloadURL(videoRef)
            
            const response = await fetch(downloadURL)
            if (!response.ok) {
              throw new Error(`HTTP ${response.status}: ${response.statusText}`)
            }
            
            videoBlob = await response.blob()
            console.log(`✅ Video ${i + 1}/${videos.length}: ${video.title} descargado via Firebase (${videoBlob.size} bytes)`)
          } catch (storageError) {
            throw new Error(`Error descargando video ${i + 1} (${video.title}): ${storageError.message}`)
          }
        }
      } else {
        throw new Error(`Video ${i + 1} (${video.title}) no tiene archivo ni URL asociada`)
      }
      
      // Usar video original sin procesamiento
      console.log(`🎬 Usando video ${i + 1}/${videos.length}: ${video.title} (sin procesamiento)`)
      processedVideos.push(videoBlob)
    }
    
         // Concatenar videos
     console.log('🎬 Concatenando videos para preview...')
     
     // Escribir videos procesados
     for (let i = 0; i < processedVideos.length; i++) {
       const videoData = processedVideos[i]
       // Si es un blob, convertirlo a Uint8Array, si ya es Uint8Array, usarlo directamente
       const dataToWrite = videoData instanceof Blob ? await fetchFile(videoData) : videoData
       ffmpegInstance.FS('writeFile', `preview${i}.mp4`, dataToWrite)
       console.log(`📝 Video ${i + 1}/${processedVideos.length} escrito al sistema de archivos`)
     }
     
     // Crear archivo de lista
     const fileList = processedVideos.map((_, i) => `file preview${i}.mp4`).join('\n')
     ffmpegInstance.FS('writeFile', 'filelist.txt', fileList)
     console.log('📋 Lista de archivos creada')
     
     // Concatenar (optimizado para velocidad)
     console.log('🔗 Iniciando concatenación...')
     await ffmpegInstance.run(
       '-f', 'concat',
       '-safe', '0',
       '-i', 'filelist.txt',
       '-c', 'copy',
       '-avoid_negative_ts', 'make_zero',
       'sequence_preview.mp4'
     )
     console.log('✅ Concatenación completada')
    
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

// Convertir video a diferentes formatos y resoluciones
export const convertVideoFormat = async (videoFile, format = 'mp4', resolution = '720p') => {
  try {
    console.log(`🎬 Convirtiendo video a formato ${format} con resolución ${resolution}...`)
    
    const ffmpegInstance = await initFFmpeg()
    
    // Escribir archivo de entrada
    ffmpegInstance.FS('writeFile', 'input.mp4', await fetchFile(videoFile))
    
    // Configurar resolución y calidad
    let resolutionSettings = []
    let qualitySettings = []
    
    // Configurar resolución
    switch (resolution) {
      case '360p':
        resolutionSettings = ['-vf', 'scale=-1:360']
        qualitySettings = ['-crf', '28', '-preset', 'ultrafast']
        break
      case '480p':
        resolutionSettings = ['-vf', 'scale=-1:480']
        qualitySettings = ['-crf', '25', '-preset', 'fast']
        break
      case '720p':
        resolutionSettings = ['-vf', 'scale=-1:720']
        qualitySettings = ['-crf', '23', '-preset', 'fast']
        break
      case '1080p':
        resolutionSettings = ['-vf', 'scale=-1:1080']
        qualitySettings = ['-crf', '20', '-preset', 'medium']
        break
      case '4k':
        resolutionSettings = ['-vf', 'scale=-1:2160']
        qualitySettings = ['-crf', '18', '-preset', 'medium']
        break
      default:
        resolutionSettings = ['-vf', 'scale=-1:720']
        qualitySettings = ['-crf', '23', '-preset', 'fast']
    }
    
    // Convertir formato
    await ffmpegInstance.run(
      '-i', 'input.mp4',
      ...resolutionSettings,
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

// Descarga directa de secuencia sin FFmpeg (más rápida)
export const downloadSequenceDirect = async (sequence) => {
  try {
    console.log(`📥 Descarga directa de secuencia: ${sequence.name}`)
    
    if (!sequence.videos || sequence.videos.length === 0) {
      throw new Error('La secuencia no tiene videos')
    }
    
    // Si solo hay un video, descargarlo directamente
    if (sequence.videos.length === 1) {
      const video = sequence.videos[0]
      if (video.file) {
        return {
          success: true,
          data: video.file,
          format: 'mp4',
          error: null
        }
      } else if (video.videoUrl) {
        const response = await fetch(video.videoUrl)
        if (!response.ok) throw new Error('Error descargando video')
        const blob = await response.blob()
        return {
          success: true,
          data: blob,
          format: 'mp4',
          error: null
        }
      }
    }
    
         // Para múltiples videos, crear un archivo ZIP con todos los videos
     const JSZip = await import('jszip')
     const zip = new JSZip.default()
     
     // Obtener nombre base de la secuencia (limpio para nombres de archivo)
     const sequenceName = (sequence.name || sequence.title || 'secuencia')
       .replace(/[^a-zA-Z0-9\s]/g, '') // Remover caracteres especiales
       .replace(/\s+/g, '_') // Reemplazar espacios con guiones bajos
       .toLowerCase()
     
     for (let i = 0; i < sequence.videos.length; i++) {
       const video = sequence.videos[i]
       let videoBlob
       
       if (video.file) {
         videoBlob = video.file
       } else if (video.videoUrl) {
         const response = await fetch(video.videoUrl)
         if (!response.ok) throw new Error(`Error descargando video ${i + 1}`)
         videoBlob = await response.blob()
       } else {
         throw new Error(`Video ${i + 1} no tiene archivo ni URL`)
       }
       
       // Nombrar archivo con formato: secuencia_1.mp4, secuencia_2.mp4, etc.
       const fileName = `${sequenceName}_${i + 1}.mp4`
       zip.file(fileName, videoBlob)
       console.log(`📁 Agregando al ZIP: ${fileName}`)
     }
    
    const zipBlob = await zip.generateAsync({ type: 'blob' })
    return {
      success: true,
      data: zipBlob,
      format: 'zip',
      error: null
    }
  } catch (error) {
    console.error('❌ Error en descarga directa:', error)
    return {
      success: false,
      data: null,
      format: null,
      error: error.message
    }
  }
}

// Generar video final de secuencia para descarga
export const generateSequenceVideo = async (sequence, format = 'mp4', resolution = '720p') => {
  try {
    console.log(`🎬 Generando video de secuencia: ${sequence.name}`)
    console.log(`📹 Formato: ${format}, Resolución: ${resolution}`)
    
    if (!sequence.videos || sequence.videos.length === 0) {
      throw new Error('La secuencia no tiene videos')
    }
    
    console.log('🚀 Usando descarga directa (sin FFmpeg)')
    return await downloadSequenceDirect(sequence)
    
    // Intentar inicializar FFmpeg con timeout
    console.log('🎬 Intentando inicializar FFmpeg...')
    const ffmpegPromise = initFFmpeg()
    const timeoutPromise = new Promise((_, reject) => 
      setTimeout(() => reject(new Error('Timeout inicializando FFmpeg')), 10000)
    )
    
    try {
      await Promise.race([ffmpegPromise, timeoutPromise])
    } catch (error) {
      console.warn('⚠️ FFmpeg no pudo inicializarse, usando descarga directa')
      return await downloadSequenceDirect(sequence)
    }
    
    // Generar el video combinado con FFmpeg
    const result = await createSequencePreview(sequence.videos)
    
    if (!result.success) {
      throw new Error(`Error generando video: ${result.error}`)
    }
    
    // Si se requiere un formato específico o resolución diferente, convertir
    if (format !== 'mp4' || resolution !== '720p') {
      console.log(`🔄 Convirtiendo a formato ${format} con resolución ${resolution}...`)
      const convertResult = await convertVideoFormat(
        new Blob([result.data], { type: 'video/mp4' }), 
        format, 
        resolution
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