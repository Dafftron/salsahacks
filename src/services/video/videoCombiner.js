import { FFmpeg } from '@ffmpeg/ffmpeg'
import { fetchFile, toBlobURL } from '@ffmpeg/util'

class VideoCombiner {
  constructor() {
    this.ffmpeg = new FFmpeg()
    this.isLoaded = false
  }

  async load() {
    if (this.isLoaded) return

    try {
      console.log('Cargando FFmpeg.wasm...')
      
      // Cargar FFmpeg con archivos CDN más estables
      await this.ffmpeg.load({
        coreURL: 'https://unpkg.com/@ffmpeg/core@0.12.6/dist/umd/ffmpeg-core.js',
        wasmURL: 'https://unpkg.com/@ffmpeg/core@0.12.6/dist/umd/ffmpeg-core.wasm',
      })
      
      this.isLoaded = true
      console.log('FFmpeg.wasm cargado correctamente')
    } catch (error) {
      console.error('Error cargando FFmpeg:', error)
      throw new Error('No se pudo cargar FFmpeg.wasm')
    }
  }

  // Método principal que usa FFmpeg.wasm para mantener calidad original
  async combineVideos(videos, onProgress) {
    try {
      if (!this.isLoaded) {
        await this.load()
      }

      console.log('Iniciando combinación con FFmpeg.wasm...')
      
      if (onProgress) {
        onProgress({
          stage: 'init',
          current: 0,
          total: 100,
          message: 'Iniciando FFmpeg.wasm...'
        })
      }

      // Descargar todos los videos
      const videoFiles = []
      
      for (let i = 0; i < videos.length; i++) {
        const video = videos[i]
        console.log(`Descargando video ${i + 1}/${videos.length}: ${video.title}`)
        
        if (onProgress) {
          onProgress({
            stage: 'download',
            current: ((i + 1) / videos.length) * 30,
            total: 100,
            message: `Descargando: ${video.title}`
          })
        }

        try {
          // Usar Firebase SDK para obtener URL de descarga
          const { ref, getDownloadURL } = await import('firebase/storage')
          const { storage } = await import('../firebase/config')
          
          const videoRef = ref(storage, video.videoPath)
          const downloadURL = await getDownloadURL(videoRef)
          
          console.log(`URL de descarga obtenida para ${video.title}:`, downloadURL)

          // Descargar video para FFmpeg
          const response = await fetch(downloadURL)
          if (!response.ok) {
            throw new Error(`Error descargando video: ${response.statusText}`)
          }
          
          const videoBlob = await response.blob()
          const videoBuffer = await videoBlob.arrayBuffer()
          
          // Escribir archivo en FFmpeg
          const fileName = `input_${i}.mp4`
          await this.ffmpeg.writeFile(fileName, new Uint8Array(videoBuffer))
          videoFiles.push(fileName)
          
          console.log(`Video ${i + 1} descargado y escrito: ${fileName}`)
          
        } catch (error) {
          console.error(`Error con video ${video.title}:`, error)
          throw new Error(`Error procesando video ${video.title}: ${error.message}`)
        }
      }

      // Crear archivo de lista para concatenación
      const fileList = videoFiles.map(file => `file '${file}'`).join('\n')
      await this.ffmpeg.writeFile('filelist.txt', fileList)
      
      console.log('Archivo de lista creado:', fileList)

      if (onProgress) {
        onProgress({
          stage: 'combine',
          current: 30,
          total: 100,
          message: 'Combinando videos con FFmpeg...'
        })
      }

      // Ejecutar comando FFmpeg para combinar con configuración ligera
      console.log('Ejecutando comando FFmpeg...')
      await this.ffmpeg.exec([
        '-f', 'concat',
        '-safe', '0',
        '-i', 'filelist.txt',
        '-c', 'copy', // Copiar sin recodificar (más rápido)
        'output.mp4'
      ])

      if (onProgress) {
        onProgress({
          stage: 'finalize',
          current: 90,
          total: 100,
          message: 'Finalizando archivo...'
        })
      }

      // Leer el archivo combinado
      const data = await this.ffmpeg.readFile('output.mp4')
      
      // Limpiar archivos temporales
      await this.cleanup(videoFiles)

      if (onProgress) {
        onProgress({
          stage: 'complete',
          current: 100,
          total: 100,
          message: '¡Combinación completada!'
        })
      }

      console.log('Combinación completada, archivo creado')
      return new Blob([data], { type: 'video/mp4' })

    } catch (error) {
      console.error('Error combinando videos:', error)
      // Intentar limpiar en caso de error
      try {
        await this.cleanup(videos.map((_, i) => `input_${i}.mp4`))
      } catch (cleanupError) {
        console.warn('Error limpiando archivos:', cleanupError)
      }
      throw new Error(`Error combinando videos: ${error.message}`)
    }
  }

  // Método para combinar blobs de video con calidad optimizada
  async combineVideoBlobs(videoBlobs) {
    return new Promise((resolve, reject) => {
      try {
        // Crear un canvas para combinar los videos
        const canvas = document.createElement('canvas')
        const ctx = canvas.getContext('2d')
        
        // Configurar canvas con resolución alta
        canvas.width = 1920
        canvas.height = 1080
        
        // Crear MediaRecorder con máxima calidad y FPS alto
        const stream = canvas.captureStream(60) // 60 FPS para suavidad
        const mediaRecorder = new MediaRecorder(stream, {
          mimeType: 'video/webm;codecs=vp9',
          videoBitsPerSecond: 25000000 // 25 Mbps para máxima calidad
        })
        
        const chunks = []
        
        mediaRecorder.ondataavailable = (event) => {
          if (event.data.size > 0) {
            chunks.push(event.data)
          }
        }
        
        mediaRecorder.onstop = () => {
          const combinedBlob = new Blob(chunks, { type: 'video/webm' })
          resolve(combinedBlob)
        }
        
        mediaRecorder.onerror = (error) => {
          reject(error)
        }
        
        // Iniciar grabación
        mediaRecorder.start()
        
        // Procesar cada video
        let currentVideoIndex = 0
        
        const processNextVideo = () => {
          if (currentVideoIndex >= videoBlobs.length) {
            mediaRecorder.stop()
            return
          }
          
          const videoBlob = videoBlobs[currentVideoIndex]
          const videoUrl = URL.createObjectURL(videoBlob)
          const video = document.createElement('video')
          
          video.onloadedmetadata = () => {
            video.currentTime = 0
            video.muted = false
            video.volume = 1.0
            video.play()
          }
          
          video.ontimeupdate = () => {
            // Dibujar el frame actual en el canvas con máxima calidad
            ctx.imageSmoothingEnabled = true
            ctx.imageSmoothingQuality = 'high'
            
            // Limpiar canvas antes de dibujar
            ctx.clearRect(0, 0, canvas.width, canvas.height)
            
            // Calcular dimensiones para mantener proporción
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
            
            // Dibujar video centrado y escalado
            ctx.drawImage(video, offsetX, offsetY, drawWidth, drawHeight)
          }
          
          // Usar requestAnimationFrame para máxima suavidad
          video.onplay = () => {
            const renderFrame = () => {
              if (!video.paused && !video.ended) {
                ctx.imageSmoothingEnabled = true
                ctx.imageSmoothingQuality = 'high'
                
                // Limpiar canvas antes de dibujar
                ctx.clearRect(0, 0, canvas.width, canvas.height)
                
                // Calcular dimensiones para mantener proporción
                const videoAspect = video.videoWidth / video.videoHeight
                const canvasAspect = canvas.width / canvas.height
                
                let drawWidth, drawHeight, offsetX, offsetY
                
                if (videoAspect > canvasAspect) {
                  drawWidth = canvas.width
                  drawHeight = canvas.width / videoAspect
                  offsetX = 0
                  offsetY = (canvas.height - drawHeight) / 2
                } else {
                  drawHeight = canvas.height
                  drawWidth = canvas.height * videoAspect
                  offsetX = (canvas.width - drawWidth) / 2
                  offsetY = 0
                }
                
                // Dibujar video centrado y escalado
                ctx.drawImage(video, offsetX, offsetY, drawWidth, drawHeight)
                
                // Continuar renderizando
                requestAnimationFrame(renderFrame)
              }
            }
            
            // Iniciar renderizado suave
            requestAnimationFrame(renderFrame)
          }
          
          video.onended = () => {
            URL.revokeObjectURL(videoUrl)
            currentVideoIndex++
            setTimeout(processNextVideo, 100) // Pausa para transición suave
          }
          
          video.src = videoUrl
        }
        
        processNextVideo()
        
      } catch (error) {
        reject(error)
      }
    })
  }

  // Método simple (igual que el principal)
  async combineVideosSimple(videos, onProgress) {
    return this.combineVideos(videos, onProgress)
  }

  // Limpiar archivos temporales
  async cleanup(videoFiles) {
    try {
      console.log('Limpiando archivos temporales...')
      
      // Eliminar archivos de video
      for (const file of videoFiles) {
        await this.ffmpeg.deleteFile(file)
      }
      
      // Eliminar archivos del sistema
      await this.ffmpeg.deleteFile('filelist.txt')
      await this.ffmpeg.deleteFile('output.mp4')
      
      console.log('Archivos temporales eliminados')
    } catch (error) {
      console.warn('Error limpiando archivos temporales:', error)
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
        duration: null // No podemos obtener duración sin procesar el video
      }
    } catch (error) {
      console.error('Error obteniendo información del video:', error)
      return null
    }
  }
}

export default VideoCombiner
