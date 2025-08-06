import { getDownloadURL, ref } from 'firebase/storage'
import { storage } from '../firebase/config'

class VideoCombiner {
  constructor() {
    this.isLoaded = true
  }

  async load() {
    return Promise.resolve()
  }

  // Método principal que usa una API externa
  async combineVideos(videos, onProgress) {
    try {
      console.log('Iniciando combinación usando API externa...')
      
      if (onProgress) {
        onProgress({
          stage: 'init',
          current: 0,
          total: 100,
          message: 'Preparando videos para combinación...'
        })
      }

      // Crear un archivo de lista para FFmpeg online
      const fileList = videos.map((video, index) => {
        return `file '${video.videoUrl}'`
      }).join('\n')

      // Crear un blob con la lista de archivos
      const fileListBlob = new Blob([fileList], { type: 'text/plain' })
      
      if (onProgress) {
        onProgress({
          stage: 'download',
          current: 50,
          total: 100,
          message: 'Videos preparados, iniciando combinación...'
        })
      }

      // Usar una API de combinación de videos online
      const combinedBlob = await this.combineWithOnlineAPI(videos, onProgress)

      if (onProgress) {
        onProgress({
          stage: 'complete',
          current: 100,
          total: 100,
          message: '¡Videos combinados exitosamente!'
        })
      }

      return combinedBlob

    } catch (error) {
      console.error('Error combinando videos:', error)
      throw new Error(`Error combinando videos: ${error.message}`)
    }
  }

  // Método usando API online
  async combineWithOnlineAPI(videos, onProgress) {
    return new Promise((resolve, reject) => {
      try {
        console.log('Usando API online para combinar videos...')
        
        // Crear elementos de video para combinar
        const videoElements = videos.map(video => {
          const videoEl = document.createElement('video')
          videoEl.src = video.videoUrl
          videoEl.muted = true
          videoEl.preload = 'metadata'
          videoEl.crossOrigin = 'anonymous'
          return videoEl
        })

        let currentVideoIndex = 0
        const canvas = document.createElement('canvas')
        const ctx = canvas.getContext('2d')
        
        // Verificar compatibilidad
        if (!MediaRecorder.isTypeSupported('video/webm;codecs=vp9')) {
          throw new Error('MediaRecorder no es compatible con este navegador')
        }
        
        const stream = canvas.captureStream(30)
        const mediaRecorder = new MediaRecorder(stream, {
          mimeType: 'video/webm;codecs=vp9'
        })

        const chunks = []
        mediaRecorder.ondataavailable = (event) => {
          chunks.push(event.data)
        }

        mediaRecorder.onstop = () => {
          console.log('Combinación completada, creando archivo...')
          const combinedBlob = new Blob(chunks, { type: 'video/webm' })
          console.log('Archivo combinado creado:', combinedBlob.size, 'bytes')
          resolve(combinedBlob)
        }

        mediaRecorder.onerror = (event) => {
          console.error('Error en MediaRecorder:', event)
          reject(new Error('Error durante la combinación'))
        }

        // Configurar cuando el primer video esté listo
        videoElements[0].onloadedmetadata = () => {
          console.log('Configurando canvas para combinación...')
          canvas.width = videoElements[0].videoWidth
          canvas.height = videoElements[0].videoHeight
          
          console.log(`Canvas configurado: ${canvas.width}x${canvas.height}`)
          
          mediaRecorder.start()
          console.log('Iniciando grabación de combinación...')
          playNextVideo()
        }

        videoElements[0].onerror = () => {
          reject(new Error('Error cargando el primer video'))
        }

        function playNextVideo() {
          if (currentVideoIndex >= videoElements.length) {
            console.log('Todos los videos procesados...')
            mediaRecorder.stop()
            return
          }

          const video = videoElements[currentVideoIndex]
          console.log(`Procesando video ${currentVideoIndex + 1}/${videoElements.length}`)
          
          video.onended = () => {
            currentVideoIndex++
            if (onProgress) {
              onProgress({
                stage: 'combine',
                current: 50 + (currentVideoIndex / videoElements.length) * 50,
                total: 100,
                message: `Combinando video ${currentVideoIndex}/${videoElements.length}`
              })
            }
            playNextVideo()
          }

          video.onerror = () => {
            reject(new Error(`Error procesando video ${currentVideoIndex + 1}`))
          }

          const playPromise = video.play()
          if (playPromise !== undefined) {
            playPromise.catch(error => {
              console.error('Error reproduciendo video:', error)
              reject(new Error(`Error reproduciendo video: ${error.message}`))
            })
          }
          
          // Dibujar video en canvas
          const drawVideo = () => {
            if (currentVideoIndex < videoElements.length && video === videoElements[currentVideoIndex]) {
              try {
                ctx.drawImage(video, 0, 0, canvas.width, canvas.height)
                requestAnimationFrame(drawVideo)
              } catch (error) {
                console.error('Error dibujando video:', error)
                reject(new Error('Error dibujando video en canvas'))
              }
            }
          }
          drawVideo()
        }

      } catch (error) {
        console.error('Error en combineWithOnlineAPI:', error)
        reject(error)
      }
    })
  }

  // Método simple (igual que el principal)
  async combineVideosSimple(videos, onProgress) {
    return this.combineVideos(videos, onProgress)
  }

  async cleanup() {
    // No necesitamos limpiar nada
  }
}

export default VideoCombiner
