class VideoCombiner {
  constructor() {
    this.isLoaded = true
    this.maxConcurrentDownloads = 3
    this.retryAttempts = 3
  }

  async load() {
    return Promise.resolve()
  }

  // Método alternativo usando FFmpeg.wasm directamente para máxima compatibilidad
  async combineVideosWithFFmpeg(videos, onProgress) {
    try {
      console.log('🚀 Iniciando combinación con FFmpeg.wasm...')
      
      if (onProgress) {
        onProgress({
          stage: 'init',
          current: 0,
          total: 100,
          message: 'Inicializando FFmpeg para máxima compatibilidad...'
        })
      }

      if (!videos || videos.length === 0) {
        throw new Error('No hay videos para procesar')
      }

      // Descargar videos
      const videoBlobs = await this.downloadVideosWithConcurrency(videos, onProgress)

      if (onProgress) {
        onProgress({
          stage: 'ffmpeg',
          current: 70,
          total: 100,
          message: 'Combinando videos con FFmpeg...'
        })
      }

      // Usar FFmpeg.wasm para combinar directamente
      const combinedBlob = await this.combineVideosWithFFmpegDirect(videoBlobs, onProgress)
        
        if (onProgress) {
          onProgress({
          stage: 'complete',
          current: 100,
            total: 100,
          message: '¡Combinación completada con FFmpeg!'
        })
      }

      console.log('✅ Combinación completada con FFmpeg, archivo MP4 creado')
      return combinedBlob

    } catch (error) {
      console.error('❌ Error combinando videos con FFmpeg:', error)
      throw new Error(`Error combinando videos: ${error.message}`)
    }
  }

  // Método para combinar videos directamente con FFmpeg.wasm
  async combineVideosWithFFmpegDirect(videoBlobs, onProgress) {
    try {
      console.log('🔄 Combinando videos con FFmpeg.wasm...')
      
      // Importar FFmpeg dinámicamente
      const { FFmpeg } = await import('@ffmpeg/ffmpeg')
      const { toBlobURL } = await import('@ffmpeg/util')
      
      const ffmpeg = new FFmpeg()
      
      // Cargar FFmpeg
      await ffmpeg.load({
        coreURL: await toBlobURL('/ffmpeg/ffmpeg-core.js', 'text/javascript'),
        wasmURL: await toBlobURL('/ffmpeg/ffmpeg-core.wasm', 'application/wasm')
      })
      
      // Escribir archivos de video
      const videoFiles = []
      for (let i = 0; i < videoBlobs.length; i++) {
        const videoData = await videoBlobs[i].arrayBuffer()
        const fileName = `video_${i}.mp4`
        await ffmpeg.writeFile(fileName, new Uint8Array(videoData))
        videoFiles.push(fileName)
        
        if (onProgress) {
          onProgress({
            stage: 'ffmpeg',
            current: 70 + ((i + 1) / videoBlobs.length) * 20,
            total: 100,
            message: `Preparando video ${i + 1}/${videoBlobs.length}`
          })
        }
      }
      
      // Crear archivo de lista para concatenación
      const fileList = videoFiles.map(file => `file '${file}'`).join('\n')
      await ffmpeg.writeFile('filelist.txt', fileList)
      
      // Combinar videos usando concat demuxer con metadatos básicos
      const ffmpegArgs = [
        '-f', 'concat',
        '-safe', '0',
        '-i', 'filelist.txt',
        '-c', 'copy',                    // Copiar sin recodificar
        '-movflags', '+faststart',       // Optimización para streaming
        '-metadata', 'title=Secuencia Combinada',
        '-metadata', 'artist=SalsaHacks',
        'output.mp4'
      ]
      
      console.log('Ejecutando FFmpeg con args:', ffmpegArgs.join(' '))
      await ffmpeg.exec(ffmpegArgs)
      
      // Leer archivo MP4 resultante
      const mp4Data = await ffmpeg.readFile('output.mp4')
      
      // Limpiar archivos temporales
      await this.cleanupFFmpegFiles(ffmpeg, videoFiles)
      
      // Crear blob MP4
      const mp4Blob = new Blob([mp4Data], { type: 'video/mp4' })
      
      console.log(`✅ Combinación FFmpeg completada: ${(mp4Blob.size / 1024 / 1024).toFixed(2)} MB`)
      return mp4Blob
      
    } catch (error) {
      console.error('❌ Error en combinación FFmpeg:', error)
      throw new Error(`Error en combinación FFmpeg: ${error.message || 'Error desconocido'}`)
    }
  }

  // Método alternativo con recodificación ligera para metadatos de seeking correctos
  async combineVideosWithSeekingSupport(videoBlobs, onProgress) {
    try {
      console.log('🔄 Combinando videos con soporte de seeking...')
      
      // Importar FFmpeg dinámicamente
      const { FFmpeg } = await import('@ffmpeg/ffmpeg')
      const { toBlobURL } = await import('@ffmpeg/util')
      
      const ffmpeg = new FFmpeg()
      
      // Cargar FFmpeg
      await ffmpeg.load({
        coreURL: await toBlobURL('/ffmpeg/ffmpeg-core.js', 'text/javascript'),
        wasmURL: await toBlobURL('/ffmpeg/ffmpeg-core.wasm', 'application/wasm')
      })
      
      // Escribir archivos de video
      const videoFiles = []
      for (let i = 0; i < videoBlobs.length; i++) {
        const videoData = await videoBlobs[i].arrayBuffer()
        const fileName = `video_${i}.mp4`
        await ffmpeg.writeFile(fileName, new Uint8Array(videoData))
        videoFiles.push(fileName)
        
        if (onProgress) {
          onProgress({
            stage: 'ffmpeg',
            current: 70 + ((i + 1) / videoBlobs.length) * 20,
            total: 100,
            message: `Preparando video ${i + 1}/${videoBlobs.length}`
          })
        }
      }
      
      // Crear archivo de lista para concatenación
      const fileList = videoFiles.map(file => `file '${file}'`).join('\n')
      await ffmpeg.writeFile('filelist.txt', fileList)
      
      // Combinar videos con recodificación ligera para metadatos de seeking correctos
      const ffmpegArgs = [
        '-f', 'concat',
        '-safe', '0',
        '-i', 'filelist.txt',
        '-c:v', 'libx264',              // Recodificar video con H.264
        '-preset', 'ultrafast',          // Preset rápido para velocidad
        '-crf', '23',                   // Calidad buena pero no máxima
        '-c:a', 'aac',                  // Recodificar audio con AAC
        '-b:a', '128k',                 // Bitrate de audio moderado
        '-movflags', '+faststart',      // Metadatos básicos
        '-metadata', 'title=Secuencia Combinada',
        '-metadata', 'artist=SalsaHacks',
        '-g', '30',                     // GOP size para mejor seeking
        '-keyint_min', '30',            // Keyframe mínimo
        'output.mp4'
      ]
      
      console.log('Ejecutando FFmpeg con args:', ffmpegArgs.join(' '))
      await ffmpeg.exec(ffmpegArgs)
      
      // Leer archivo MP4 resultante
      const mp4Data = await ffmpeg.readFile('output.mp4')
      
      // Limpiar archivos temporales
      await this.cleanupFFmpegFiles(ffmpeg, videoFiles)
      
      // Crear blob MP4
      const mp4Blob = new Blob([mp4Data], { type: 'video/mp4' })
      
      console.log(`✅ Combinación con seeking completada: ${(mp4Blob.size / 1024 / 1024).toFixed(2)} MB`)
      return mp4Blob
      
    } catch (error) {
      console.error('❌ Error en combinación con seeking:', error)
      throw new Error(`Error en combinación con seeking: ${error.message || 'Error desconocido'}`)
    }
  }

  // Método específico para generar MP4 con seeking funcional en Windows
  async combineVideosWithWindowsSeeking(videoBlobs, onProgress, selectedResolution = '4k') {
    try {
      console.log(`🔄 Combinando videos con seeking específico para Windows en ${selectedResolution}...`)
      
      const dimensions = this.getResolutionDimensions(selectedResolution)
      
      // Importar FFmpeg dinámicamente
      const { FFmpeg } = await import('@ffmpeg/ffmpeg')
      const { toBlobURL } = await import('@ffmpeg/util')
      
      const ffmpeg = new FFmpeg()
      
      // Cargar FFmpeg
      await ffmpeg.load({
        coreURL: await toBlobURL('/ffmpeg/ffmpeg-core.js', 'text/javascript'),
        wasmURL: await toBlobURL('/ffmpeg/ffmpeg-core.wasm', 'application/wasm')
      })
      
      // Escribir archivos de video
      const videoFiles = []
      for (let i = 0; i < videoBlobs.length; i++) {
        const videoData = await videoBlobs[i].arrayBuffer()
        const fileName = `video_${i}.mp4`
        await ffmpeg.writeFile(fileName, new Uint8Array(videoData))
        videoFiles.push(fileName)
        
        if (onProgress) {
          onProgress({
            stage: 'ffmpeg',
            current: 70 + ((i + 1) / videoBlobs.length) * 20,
            total: 100,
            message: `Preparando video ${i + 1}/${videoBlobs.length}`
          })
        }
      }
      
      // Crear archivo de lista para concatenación
      const fileList = videoFiles.map(file => `file '${file}'`).join('\n')
      await ffmpeg.writeFile('filelist.txt', fileList)
      
      // Combinar videos con configuración específica para Windows seeking
      const ffmpegArgs = [
        '-f', 'concat',
        '-safe', '0',
        '-i', 'filelist.txt',
        '-c:v', 'libx264',              // Recodificar video con H.264
        '-preset', 'medium',             // Preset balanceado
        '-crf', '20',                   // Calidad alta
        '-c:a', 'aac',                  // Recodificar audio con AAC
        '-b:a', '160k',                 // Bitrate de audio
        '-movflags', '+faststart+write_colr+write_gama', // Metadatos completos
        '-metadata', 'title=Secuencia de Figuras de Baile',
        '-metadata', 'artist=SalsaHacks',
        '-metadata', 'comment=Video combinado con seeking funcional',
        '-metadata', 'handler_name=VideoHandler',
        '-metadata', 'major_brand=mp42',
        '-metadata', 'minor_version=0',
        '-metadata', 'compatible_brands=mp42isomavc1',
        '-metadata', 'creation_time=' + new Date().toISOString(),
        '-metadata', 'encoder=FFmpeg',
        '-g', '25',                     // GOP size para seeking suave
        '-keyint_min', '25',            // Keyframe mínimo
        '-sc_threshold', '0',           // Deshabilitar scene cut detection
        '-force_key_frames', 'expr:gte(t,n_forced*1)', // Forzar keyframes regulares
        '-profile:v', 'high',           // Perfil H.264 alto
        '-level', '4.1',                // Nivel de compatibilidad
        '-pix_fmt', 'yuv420p',          // Formato de píxeles estándar
        '-color_primaries', 'bt709',    // Espacio de color estándar
        '-color_trc', 'bt709',          // Curva de transferencia
        '-colorspace', 'bt709',         // Espacio de color
        '-color_range', 'tv',           // Rango de color
        '-vf', `scale=${dimensions.width}:${dimensions.height}:force_original_aspect_ratio=decrease,pad=${dimensions.width}:${dimensions.height}:(ow-iw)/2:(oh-ih)/2`, // Escalar a resolución seleccionada
        '-r', dimensions.fps.toString(), // FPS específico
        'output.mp4'
      ]
      
      console.log(`Ejecutando FFmpeg con configuración Windows seeking en ${selectedResolution}:`, ffmpegArgs.join(' '))
      await ffmpeg.exec(ffmpegArgs)
      
      // Leer archivo MP4 resultante
      const mp4Data = await ffmpeg.readFile('output.mp4')
      
      // Limpiar archivos temporales
      await this.cleanupFFmpegFiles(ffmpeg, videoFiles)
      
      // Crear blob MP4
      const mp4Blob = new Blob([mp4Data], { type: 'video/mp4' })
      
      console.log(`✅ Combinación Windows seeking completada en ${selectedResolution}: ${(mp4Blob.size / 1024 / 1024).toFixed(2)} MB`)
      return mp4Blob
          
        } catch (error) {
      console.error('❌ Error en combinación Windows seeking:', error)
      throw new Error(`Error en combinación Windows seeking: ${error.message || 'Error desconocido'}`)
    }
  }

  // Método para limpiar archivos de FFmpeg
  async cleanupFFmpegFiles(ffmpeg, videoFiles) {
    try {
      console.log('🧹 Limpiando archivos temporales de FFmpeg...')
      
      // Eliminar archivos de video
      for (const file of videoFiles) {
        await ffmpeg.deleteFile(file)
      }
      
      // Eliminar archivos del sistema
      await ffmpeg.deleteFile('filelist.txt')
      await ffmpeg.deleteFile('output.mp4')
      
      console.log('✅ Archivos temporales eliminados')
    } catch (error) {
      console.warn('⚠️ Error limpiando archivos temporales:', error)
    }
  }

  // Método principal optimizado con máxima calidad
  async combineVideos(videos, onProgress, selectedResolution = '4k') {
    try {
      console.log('🚀 Iniciando combinación con máxima calidad...')
      
      if (onProgress) {
        onProgress({
          stage: 'init',
          current: 0,
          total: 100,
          message: 'Inicializando sistema de alta calidad...'
        })
      }

      if (!videos || videos.length === 0) {
        throw new Error('No hay videos para procesar')
      }

      // Descargar videos primero
      const videoBlobs = await this.downloadVideosWithConcurrency(videos, onProgress)

      // Intentar primero con método específico para Windows seeking
      try {
        console.log('🔄 Intentando combinación con seeking específico para Windows...')
        return await this.combineVideosWithWindowsSeeking(videoBlobs, onProgress, selectedResolution)
      } catch (windowsError) {
        console.warn('⚠️ Windows seeking falló, intentando FFmpeg básico:', windowsError)
        
        // Fallback con FFmpeg básico
        try {
          console.log('🔄 Intentando combinación con FFmpeg...')
          return await this.combineVideosWithFFmpegDirect(videoBlobs, onProgress, selectedResolution)
        } catch (ffmpegError) {
          console.warn('⚠️ FFmpeg falló, intentando con recodificación para seeking:', ffmpegError)
          
          // Fallback con recodificación para seeking
          if (onProgress) {
            onProgress({
              stage: 'ffmpeg',
              current: 70,
              total: 100,
              message: 'Combinando videos con soporte de seeking...'
            })
          }

          try {
            const combinedBlob = await this.combineVideosWithSeekingSupport(videoBlobs, onProgress, selectedResolution)

            if (onProgress) {
              onProgress({
                stage: 'complete',
                current: 100,
                total: 100,
                message: '¡Combinación completada con soporte de seeking!'
              })
            }

            console.log('✅ Combinación completada, archivo MP4 con seeking creado')
            return combinedBlob
          } catch (seekingError) {
            console.warn('⚠️ Seeking también falló, usando MediaRecorder como último recurso:', seekingError)
            
            // Último fallback: MediaRecorder
      if (onProgress) {
        onProgress({
          stage: 'combine',
                current: 70,
          total: 100,
                message: 'Combinando videos con MediaRecorder...'
        })
      }

            const combinedBlob = await this.combineVideoBlobsHighQuality(videoBlobs, onProgress, selectedResolution)

      if (onProgress) {
        onProgress({
          stage: 'complete',
          current: 100,
          total: 100,
                message: '¡Combinación completada con MediaRecorder!'
        })
      }

            console.log('✅ Combinación completada con MediaRecorder')
      return combinedBlob
          }
        }
      }

    } catch (error) {
      console.error('❌ Error combinando videos:', error)
      throw new Error(`Error combinando videos: ${error.message || 'Error desconocido'}`)
    }
  }

  // Método para descargar videos con límite de concurrencia
  async downloadVideosWithConcurrency(videos, onProgress) {
    const videoBlobs = []
    const totalVideos = videos.length
    
    for (let i = 0; i < videos.length; i += this.maxConcurrentDownloads) {
      const batch = videos.slice(i, i + this.maxConcurrentDownloads)
      
      const batchPromises = batch.map(async (video, batchIndex) => {
        const videoIndex = i + batchIndex
        return this.downloadVideoWithRetry(video, videoIndex, totalVideos, onProgress)
      })
      
      const batchResults = await Promise.allSettled(batchPromises)
      
      batchResults.forEach((result, batchIndex) => {
        if (result.status === 'fulfilled') {
          videoBlobs[i + batchIndex] = result.value
        } else {
          console.error(`Error descargando video ${i + batchIndex}:`, result.reason)
          throw new Error(`Error descargando video: ${result.reason.message}`)
        }
      })
    }
    
    return videoBlobs.filter(blob => blob !== undefined)
  }

  // Método para descargar un video con reintentos
  async downloadVideoWithRetry(video, index, total, onProgress) {
    let lastError
    
    for (let attempt = 1; attempt <= this.retryAttempts; attempt++) {
      try {
        console.log(`📥 Descargando video ${index + 1}/${total}: ${video.title} (intento ${attempt})`)
        
        if (onProgress) {
          onProgress({
            stage: 'download',
            current: ((index + 1) / total) * 60,
            total: 100,
            message: `Descargando: ${video.title} (${index + 1}/${total})`
          })
        }

        const { ref, getDownloadURL } = await import('firebase/storage')
        const { storage } = await import('../firebase/config')
        
        const videoRef = ref(storage, video.videoPath)
        const downloadURL = await getDownloadURL(videoRef)
        
        const controller = new AbortController()
        const timeoutId = setTimeout(() => controller.abort(), 30000)
        
        const response = await fetch(downloadURL, {
          signal: controller.signal
        })
        
        clearTimeout(timeoutId)
        
        if (!response.ok) {
          throw new Error(`Error HTTP: ${response.status} ${response.statusText}`)
        }
        
        const videoBlob = await response.blob()
        
        if (videoBlob.size === 0) {
          throw new Error('Archivo de video vacío')
        }
        
        console.log(`✅ Video ${index + 1} descargado: ${video.title} (${(videoBlob.size / 1024 / 1024).toFixed(2)} MB)`)
        return videoBlob

    } catch (error) {
        lastError = error
        console.warn(`⚠️ Intento ${attempt} falló para ${video.title}:`, error.message)
        
        if (attempt < this.retryAttempts) {
          await new Promise(resolve => setTimeout(resolve, 1000 * attempt))
        }
      }
    }
    
    throw new Error(`Error descargando video ${video.title} después de ${this.retryAttempts} intentos: ${lastError.message}`)
  }

  // Método para combinar videos con máxima calidad y generar MP4
  async combineVideoBlobsHighQuality(videoBlobs, onProgress, selectedResolution = '4k') {
    return new Promise((resolve, reject) => {
      try {
        // Crear canvas con resolución máxima
        const canvas = document.createElement('canvas')
        const ctx = canvas.getContext('2d')
        
        // Configurar canvas con resolución máxima (4K si es posible)
        canvas.width = 3840  // 4K UHD
        canvas.height = 2160 // 4K UHD
        
        // Intentar diferentes codecs para máxima compatibilidad
        const codecOptions = [
          'video/mp4;codecs=h264',
          'video/webm;codecs=h264',
          'video/webm;codecs=vp9',
          'video/webm;codecs=vp8'
        ]
        
        let selectedCodec = null
        for (const codec of codecOptions) {
          if (MediaRecorder.isTypeSupported(codec)) {
            selectedCodec = codec
            break
          }
        }
        
        if (!selectedCodec) {
          throw new Error('No se encontró un codec compatible')
        }
        
        console.log(`🎬 Usando codec: ${selectedCodec}`)
        
        // Crear MediaRecorder con máxima calidad
        const stream = canvas.captureStream(60) // 60 FPS para máxima suavidad
        const mediaRecorder = new MediaRecorder(stream, {
          mimeType: selectedCodec,
          videoBitsPerSecond: 50000000 // 50 Mbps para máxima calidad
        })
        
        const chunks = []
        let totalDuration = 0
        let currentVideoIndex = 0
        let frameCount = 0
        let startTime = Date.now()
        
        mediaRecorder.ondataavailable = (event) => {
          if (event.data.size > 0) {
            chunks.push(event.data)
          }
        }
        
        mediaRecorder.onstop = () => {
          try {
            // Crear blob con el tipo MIME correcto
            const mimeType = selectedCodec.includes('mp4') ? 'video/mp4' : 'video/webm'
            const combinedBlob = new Blob(chunks, { type: mimeType })
            
            console.log(`✅ Video combinado creado: ${(combinedBlob.size / 1024 / 1024).toFixed(2)} MB`)
            console.log(`⏱️ Duración total: ${totalDuration.toFixed(2)}s`)
            
            // Si es WebM, convertir a MP4 usando FFmpeg.wasm con metadatos correctos
            if (mimeType === 'video/webm') {
              this.convertWebmToMp4WithMetadata(combinedBlob, totalDuration).then(mp4Blob => {
                resolve(mp4Blob)
              }).catch(error => {
                console.warn('Error convirtiendo a MP4, usando WebM:', error)
                resolve(combinedBlob)
              })
            } else {
          resolve(combinedBlob)
            }
          } catch (error) {
            reject(error)
          }
        }
        
        mediaRecorder.onerror = (error) => {
          reject(new Error(`Error en MediaRecorder: ${error.message}`))
        }
        
        // Iniciar grabación con chunks pequeños para mejor manejo
        mediaRecorder.start(100) // Chunks cada 100ms
        
        // Procesar videos secuencialmente con máxima calidad
        const processNextVideo = () => {
          if (currentVideoIndex >= videoBlobs.length) {
            mediaRecorder.stop()
            return
          }
          
          const videoBlob = videoBlobs[currentVideoIndex]
          const videoUrl = URL.createObjectURL(videoBlob)
          const video = document.createElement('video')
          
          video.onloadedmetadata = () => {
            console.log(`📹 Video ${currentVideoIndex + 1}: ${video.duration.toFixed(2)}s`)
            totalDuration += video.duration
            video.currentTime = 0
            video.muted = false
            video.volume = 1.0
            video.play()
          }
          
          video.onplay = () => {
            const renderFrame = () => {
              if (!video.paused && !video.ended) {
                // Renderizar cada frame para máxima calidad
            ctx.imageSmoothingEnabled = true
            ctx.imageSmoothingQuality = 'high'
            
                // Limpiar canvas
            ctx.clearRect(0, 0, canvas.width, canvas.height)
            
                // Calcular dimensiones para mantener proporción y máxima calidad
            const videoAspect = video.videoWidth / video.videoHeight
            const canvasAspect = canvas.width / canvas.height
            
            let drawWidth, drawHeight, offsetX, offsetY
            
            if (videoAspect > canvasAspect) {
              // Video más ancho que canvas
              drawWidth = canvas.width
              drawHeight = canvas.width / videoAspect
              offsetX = 0
              offsetY = (canvas.height - drawHeight) / 2
            } else {
              // Video más alto que canvas
              drawHeight = canvas.height
              drawWidth = canvas.height * videoAspect
              offsetX = (canvas.width - drawWidth) / 2
              offsetY = 0
            }
            
                // Dibujar video con máxima calidad
                ctx.drawImage(video, offsetX, offsetY, drawWidth, drawHeight)
                
                frameCount++
                requestAnimationFrame(renderFrame)
              }
            }
            
            requestAnimationFrame(renderFrame)
          }
          
          video.onended = () => {
            URL.revokeObjectURL(videoUrl)
            currentVideoIndex++
            frameCount = 0
            
            if (onProgress) {
              onProgress({
                stage: 'combine',
                current: 70 + ((currentVideoIndex / videoBlobs.length) * 30),
                total: 100,
                message: `Procesando video ${currentVideoIndex}/${videoBlobs.length}`
              })
            }
            
            setTimeout(processNextVideo, 100) // Pausa mínima para transición
          }
          
          video.src = videoUrl
        }
        
        processNextVideo()
        
      } catch (error) {
        reject(error)
      }
    })
  }

  // Método para convertir WebM a MP4 usando FFmpeg.wasm con metadatos correctos
  async convertWebmToMp4WithMetadata(webmBlob, duration) {
    try {
      console.log('🔄 Convirtiendo WebM a MP4 con metadatos...')
      
      // Importar FFmpeg dinámicamente
      const { FFmpeg } = await import('@ffmpeg/ffmpeg')
      const { toBlobURL } = await import('@ffmpeg/util')
      
      const ffmpeg = new FFmpeg()
      
      // Cargar FFmpeg
      await ffmpeg.load({
        coreURL: await toBlobURL('/ffmpeg/ffmpeg-core.js', 'text/javascript'),
        wasmURL: await toBlobURL('/ffmpeg/ffmpeg-core.wasm', 'application/wasm')
      })
      
      // Escribir archivo WebM
      const webmData = await webmBlob.arrayBuffer()
      await ffmpeg.writeFile('input.webm', new Uint8Array(webmData))
      
      // Convertir a MP4 con máxima calidad y metadatos correctos
      await ffmpeg.exec([
        '-i', 'input.webm',
        '-c:v', 'libx264',        // Codec H.264
        '-preset', 'slow',        // Máxima calidad
        '-crf', '18',             // Calidad constante (18 = muy alta calidad)
        '-c:a', 'aac',            // Codec de audio AAC
        '-b:a', '192k',           // Bitrate de audio
        '-movflags', '+faststart', // Optimización para streaming
        '-metadata', `duration=${duration}`, // Metadatos de duración
        '-metadata', 'title=Video Combinado', // Título del video
        '-metadata', 'artist=SalsaHacks', // Artista
        '-metadata', 'comment=Video combinado con máxima calidad', // Comentario
        '-map_metadata', '0',     // Copiar metadatos del input
        'output.mp4'
      ])
      
      // Leer archivo MP4
      const mp4Data = await ffmpeg.readFile('output.mp4')
      
      // Limpiar archivos
      await ffmpeg.deleteFile('input.webm')
      await ffmpeg.deleteFile('output.mp4')
      
      // Crear blob MP4
      const mp4Blob = new Blob([mp4Data], { type: 'video/mp4' })
      
      console.log(`✅ Conversión completada: ${(mp4Blob.size / 1024 / 1024).toFixed(2)} MB`)
      console.log(`⏱️ Duración en metadatos: ${duration.toFixed(2)}s`)
      return mp4Blob
      
    } catch (error) {
      console.error('❌ Error convirtiendo a MP4:', error)
      throw new Error(`Error en conversión: ${error.message}`)
    }
  }

  // Método simple (igual que el principal)
  async combineVideosSimple(videos, onProgress) {
    return this.combineVideos(videos, onProgress)
  }

  // Limpiar archivos temporales
  async cleanup(videoFiles) {
    try {
      console.log('🧹 Limpiando archivos temporales...')
      
      for (const file of videoFiles) {
        await this.ffmpeg.deleteFile(file)
      }
      
      await this.ffmpeg.deleteFile('filelist.txt')
      await this.ffmpeg.deleteFile('output.mp4')
      
      console.log('✅ Archivos temporales eliminados')
    } catch (error) {
      console.warn('⚠️ Error limpiando archivos temporales:', error)
    }
  }

  // Método para obtener información del video
  async getVideoInfo(videoUrl) {
    try {
      const response = await fetch(videoUrl)
      const blob = await response.blob()
      
      return {
        size: blob.size,
        type: blob.type,
        duration: null
      }
    } catch (error) {
      console.error('❌ Error obteniendo información del video:', error)
      return null
    }
  }

  // Obtener dimensiones basadas en la resolución seleccionada
  getResolutionDimensions(resolution) {
    switch (resolution) {
      case '4k': return { width: 3840, height: 2160, fps: 60 }
      case '1080p': return { width: 1920, height: 1080, fps: 60 }
      case '720p': return { width: 1280, height: 720, fps: 30 }
      case '480p': return { width: 854, height: 480, fps: 30 }
      default: return { width: 1920, height: 1080, fps: 60 }
    }
  }
}

export default VideoCombiner
