import { getDownloadURL, ref } from 'firebase/storage'
import { storage } from '../firebase/config'

class VideoCombiner {
  constructor() {
    this.isLoaded = true // Siempre disponible
  }

  async load() {
    // No necesitamos cargar nada
    return Promise.resolve()
  }

  // Método principal que usa MediaRecorder
  async combineVideos(videos, onProgress) {
    try {
      // Obtener URLs directas de Firebase Storage
      const videoUrls = []
      
      for (let i = 0; i < videos.length; i++) {
        const video = videos[i]
        console.log(`Obteniendo URL para video ${i + 1}/${videos.length}: ${video.title}`)
        
        let videoUrl
        if (video.videoUrl && video.videoUrl.startsWith('https://firebasestorage.googleapis.com')) {
          // Si ya es una URL directa de Firebase, usarla
          videoUrl = video.videoUrl
        } else if (video.videoPath) {
          // Si tenemos la ruta, obtener la URL usando Firebase SDK
          const storageRef = ref(storage, video.videoPath)
          videoUrl = await getDownloadURL(storageRef)
        } else {
          throw new Error(`No se puede obtener URL para video ${video.title}`)
        }
        
        videoUrls.push(videoUrl)
        
        if (onProgress) {
          onProgress({
            stage: 'download',
            current: i + 1,
            total: videos.length,
            message: `Obteniendo URL: ${video.title}`
          })
        }
      }

      // Combinar usando MediaRecorder con URLs directas
      if (onProgress) {
        onProgress({
          stage: 'combine',
          current: 0,
          total: 100,
          message: 'Combinando videos...'
        })
      }

      const combinedBlob = await this.combineWithMediaRecorder(videoUrls, onProgress)

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

  // Método simple (igual que el principal ahora)
  async combineVideosSimple(videos, onProgress) {
    return this.combineVideos(videos, onProgress)
  }

  async combineWithMediaRecorder(videoUrls, onProgress) {
    return new Promise((resolve, reject) => {
      try {
        console.log('Iniciando combinación con MediaRecorder usando URLs directas...')
        
        // Crear elementos de video directamente desde las URLs de Firebase
        const videoElements = videoUrls.map(url => {
          const video = document.createElement('video')
          video.src = url
          video.muted = true
          video.preload = 'metadata'
          video.crossOrigin = 'anonymous'
          return video
        })

        let currentVideoIndex = 0
        const canvas = document.createElement('canvas')
        const ctx = canvas.getContext('2d')
        
        // Verificar si MediaRecorder es compatible
        if (!MediaRecorder.isTypeSupported('video/webm;codecs=vp9')) {
          throw new Error('MediaRecorder no es compatible con este navegador')
        }
        
        const stream = canvas.captureStream(30) // 30 FPS
        const mediaRecorder = new MediaRecorder(stream, {
          mimeType: 'video/webm;codecs=vp9'
        })

        const chunks = []
        mediaRecorder.ondataavailable = (event) => {
          chunks.push(event.data)
        }

        mediaRecorder.onstop = () => {
          console.log('MediaRecorder detenido, creando blob...')
          
          const combinedBlob = new Blob(chunks, { type: 'video/webm' })
          console.log('Blob combinado creado:', combinedBlob.size, 'bytes')
          resolve(combinedBlob)
        }

        mediaRecorder.onerror = (event) => {
          console.error('Error en MediaRecorder:', event)
          reject(new Error('Error durante la grabación'))
        }

        // Configurar canvas cuando el primer video esté listo
        videoElements[0].onloadedmetadata = () => {
          console.log('Primer video cargado, configurando canvas...')
          canvas.width = videoElements[0].videoWidth
          canvas.height = videoElements[0].videoHeight
          
          console.log(`Canvas configurado: ${canvas.width}x${canvas.height}`)
          
          // Iniciar grabación
          mediaRecorder.start()
          console.log('MediaRecorder iniciado')
          playNextVideo()
        }

        videoElements[0].onerror = () => {
          reject(new Error('Error cargando el primer video'))
        }

        function playNextVideo() {
          if (currentVideoIndex >= videoElements.length) {
            console.log('Todos los videos procesados, deteniendo grabación...')
            mediaRecorder.stop()
            return
          }

          const video = videoElements[currentVideoIndex]
          console.log(`Reproduciendo video ${currentVideoIndex + 1}/${videoElements.length}`)
          
          video.onended = () => {
            currentVideoIndex++
            if (onProgress) {
              onProgress({
                stage: 'combine',
                current: (currentVideoIndex / videoElements.length) * 100,
                total: 100,
                message: `Procesando video ${currentVideoIndex}/${videoElements.length}`
              })
            }
            playNextVideo()
          }

          video.onerror = () => {
            reject(new Error(`Error reproduciendo video ${currentVideoIndex + 1}`))
          }

          // Intentar reproducir el video
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
