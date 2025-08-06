import { getDownloadURL, ref } from 'firebase/storage'
import { storage } from '../firebase/config'

class VideoCombiner {
  constructor() {
    this.isLoaded = true
  }

  async load() {
    return Promise.resolve()
  }

  // Método principal que descarga videos primero
  async combineVideos(videos, onProgress) {
    try {
      console.log('Iniciando descarga de videos...')
      
      if (onProgress) {
        onProgress({
          stage: 'init',
          current: 0,
          total: 100,
          message: 'Iniciando descarga de videos...'
        })
      }

      // Descargar todos los videos como blobs locales
      const videoBlobs = []
      
      for (let i = 0; i < videos.length; i++) {
        const video = videos[i]
        console.log(`Descargando video ${i + 1}/${videos.length}: ${video.title}`)
        
        try {
          // Usar fetch con modo 'no-cors' para evitar CORS
          const response = await fetch(video.videoUrl, {
            mode: 'no-cors',
            cache: 'no-cache'
          })
          
          if (!response.ok && response.type !== 'opaque') {
            throw new Error(`Error descargando video: ${response.statusText}`)
          }
          
          const blob = await response.blob()
          videoBlobs.push(blob)
          
          if (onProgress) {
            onProgress({
              stage: 'download',
              current: ((i + 1) / videos.length) * 50,
              total: 100,
              message: `Descargando: ${video.title}`
            })
          }
        } catch (error) {
          console.error(`Error descargando ${video.title}:`, error)
          // Si falla fetch, intentar con XMLHttpRequest
          const blob = await this.downloadWithXHR(video.videoUrl)
          videoBlobs.push(blob)
          
          if (onProgress) {
            onProgress({
              stage: 'download',
              current: ((i + 1) / videos.length) * 50,
              total: 100,
              message: `Descargando: ${video.title}`
            })
          }
        }
      }

      // Combinar usando MediaRecorder
      if (onProgress) {
        onProgress({
          stage: 'combine',
          current: 50,
          total: 100,
          message: 'Combinando videos...'
        })
      }

      const combinedBlob = await this.combineWithMediaRecorder(videoBlobs, onProgress)

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

  // Método alternativo con XMLHttpRequest
  downloadWithXHR(url) {
    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest()
      xhr.open('GET', url, true)
      xhr.responseType = 'blob'
      
      xhr.onload = function() {
        if (xhr.status === 200 || xhr.status === 206) {
          resolve(xhr.response)
        } else {
          reject(new Error(`Error descargando: ${xhr.status}`))
        }
      }
      
      xhr.onerror = function() {
        reject(new Error('Error de red'))
      }
      
      xhr.send()
    })
  }

  // Método simple (igual que el principal)
  async combineVideosSimple(videos, onProgress) {
    return this.combineVideos(videos, onProgress)
  }

  async combineWithMediaRecorder(videoBlobs, onProgress) {
    return new Promise((resolve, reject) => {
      try {
        console.log('Iniciando combinación con MediaRecorder...')
        
        // Crear URLs locales para los blobs
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
          // Limpiar URLs locales
          videoUrls.forEach(url => URL.revokeObjectURL(url))
          
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
        console.error('Error en combineWithMediaRecorder:', error)
        reject(error)
      }
    })
  }

  async cleanup() {
    // No necesitamos limpiar nada
  }
}

export default VideoCombiner
