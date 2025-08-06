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
      // Cargar FFmpeg
      await this.ffmpeg.load({
        coreURL: await toBlobURL(`/ffmpeg/ffmpeg-core.js`, 'text/javascript'),
        wasmURL: await toBlobURL(`/ffmpeg/ffmpeg-core.wasm`, 'application/wasm'),
      })
      this.isLoaded = true
      console.log('FFmpeg cargado correctamente')
    } catch (error) {
      console.error('Error cargando FFmpeg:', error)
      throw new Error('No se pudo cargar FFmpeg')
    }
  }

  async combineVideos(videos, onProgress) {
    if (!this.isLoaded) {
      await this.load()
    }

    try {
      // Crear archivo de lista para FFmpeg
      const fileList = videos.map((video, index) => {
        return `file 'input_${index}.mp4'`
      }).join('\n')

      // Escribir archivo de lista
      await this.ffmpeg.writeFile('filelist.txt', fileList)

      // Descargar y escribir cada video
      for (let i = 0; i < videos.length; i++) {
        const video = videos[i]
        console.log(`Descargando video ${i + 1}/${videos.length}: ${video.title}`)
        
        // Descargar video desde Firebase
        const response = await fetch(video.videoUrl)
        if (!response.ok) {
          throw new Error(`Error descargando video ${video.title}: ${response.statusText}`)
        }
        
        const videoBlob = await response.blob()
        const videoBuffer = await videoBlob.arrayBuffer()
        
        // Escribir video en FFmpeg
        await this.ffmpeg.writeFile(`input_${i}.mp4`, new Uint8Array(videoBuffer))
        
        // Reportar progreso
        if (onProgress) {
          onProgress({
            stage: 'download',
            current: i + 1,
            total: videos.length,
            message: `Descargando: ${video.title}`
          })
        }
      }

      // Ejecutar comando FFmpeg para combinar videos
      console.log('Combinando videos...')
      if (onProgress) {
        onProgress({
          stage: 'combine',
          current: 0,
          total: 100,
          message: 'Combinando videos...'
        })
      }

      await this.ffmpeg.exec([
        '-f', 'concat',
        '-safe', '0',
        '-i', 'filelist.txt',
        '-c', 'copy',
        'output.mp4'
      ])

      // Leer el archivo combinado
      const data = await this.ffmpeg.readFile('output.mp4')
      
      // Limpiar archivos temporales
      await this.cleanup(videos.length)

      if (onProgress) {
        onProgress({
          stage: 'complete',
          current: 100,
          total: 100,
          message: '¡Videos combinados exitosamente!'
        })
      }

      return new Blob([data], { type: 'video/mp4' })

    } catch (error) {
      console.error('Error combinando videos:', error)
      await this.cleanup(videos.length)
      throw new Error(`Error combinando videos: ${error.message}`)
    }
  }

  async cleanup(videoCount) {
    try {
      // Eliminar archivos temporales
      for (let i = 0; i < videoCount; i++) {
        await this.ffmpeg.deleteFile(`input_${i}.mp4`)
      }
      await this.ffmpeg.deleteFile('filelist.txt')
      await this.ffmpeg.deleteFile('output.mp4')
    } catch (error) {
      console.warn('Error limpiando archivos temporales:', error)
    }
  }

  // Método alternativo más simple para videos pequeños
  async combineVideosSimple(videos, onProgress) {
    if (!this.isLoaded) {
      await this.load()
    }

    try {
      // Descargar todos los videos primero
      const videoBlobs = []
      
      for (let i = 0; i < videos.length; i++) {
        const video = videos[i]
        console.log(`Descargando video ${i + 1}/${videos.length}: ${video.title}`)
        
        const response = await fetch(video.videoUrl)
        if (!response.ok) {
          throw new Error(`Error descargando video ${video.title}`)
        }
        
        const blob = await response.blob()
        videoBlobs.push(blob)
        
        if (onProgress) {
          onProgress({
            stage: 'download',
            current: i + 1,
            total: videos.length,
            message: `Descargando: ${video.title}`
          })
        }
      }

      // Crear un video combinado usando MediaRecorder (método alternativo)
      return await this.combineWithMediaRecorder(videoBlobs, onProgress)

    } catch (error) {
      console.error('Error en método simple:', error)
      throw error
    }
  }

  async combineWithMediaRecorder(videoBlobs, onProgress) {
    return new Promise((resolve, reject) => {
      try {
        // Crear URLs para los videos
        const videoUrls = videoBlobs.map(blob => URL.createObjectURL(blob))
        
        // Crear elementos de video
        const videoElements = videoUrls.map(url => {
          const video = document.createElement('video')
          video.src = url
          video.muted = true
          video.preload = 'metadata'
          return video
        })

        let currentVideoIndex = 0
        const canvas = document.createElement('canvas')
        const ctx = canvas.getContext('2d')
        const stream = canvas.captureStream(30) // 30 FPS
        const mediaRecorder = new MediaRecorder(stream, {
          mimeType: 'video/webm;codecs=vp9'
        })

        const chunks = []
        mediaRecorder.ondataavailable = (event) => {
          chunks.push(event.data)
        }

        mediaRecorder.onstop = () => {
          // Limpiar URLs
          videoUrls.forEach(url => URL.revokeObjectURL(url))
          
          const combinedBlob = new Blob(chunks, { type: 'video/webm' })
          resolve(combinedBlob)
        }

        // Configurar canvas
        videoElements[0].onloadedmetadata = () => {
          canvas.width = videoElements[0].videoWidth
          canvas.height = videoElements[0].videoHeight
          
          // Iniciar grabación
          mediaRecorder.start()
          playNextVideo()
        }

        function playNextVideo() {
          if (currentVideoIndex >= videoElements.length) {
            mediaRecorder.stop()
            return
          }

          const video = videoElements[currentVideoIndex]
          
          video.onended = () => {
            currentVideoIndex++
            if (onProgress) {
              onProgress({
                stage: 'combine',
                current: currentVideoIndex,
                total: videoElements.length,
                message: `Procesando video ${currentVideoIndex}/${videoElements.length}`
              })
            }
            playNextVideo()
          }

          video.play()
          
          // Dibujar video en canvas
          const drawVideo = () => {
            if (currentVideoIndex < videoElements.length && video === videoElements[currentVideoIndex]) {
              ctx.drawImage(video, 0, 0, canvas.width, canvas.height)
              requestAnimationFrame(drawVideo)
            }
          }
          drawVideo()
        }

      } catch (error) {
        reject(error)
      }
    })
  }
}

export default VideoCombiner
