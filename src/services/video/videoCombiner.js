class VideoCombiner {
  constructor() {
    this.isLoaded = true // No necesitamos cargar nada
  }

  async load() {
    // No necesitamos cargar nada
    return Promise.resolve()
  }

  // Método principal que usa MediaRecorder API
  async combineVideos(videos, onProgress) {
    try {
      console.log('Iniciando combinación con MediaRecorder...')
      
      if (onProgress) {
        onProgress({
          stage: 'init',
          current: 0,
          total: 100,
          message: 'Iniciando MediaRecorder...'
        })
      }

      // Descargar todos los videos
      const videoBlobs = []
      
      for (let i = 0; i < videos.length; i++) {
        const video = videos[i]
        console.log(`Descargando video ${i + 1}/${videos.length}: ${video.title}`)
        
        if (onProgress) {
          onProgress({
            stage: 'download',
            current: ((i + 1) / videos.length) * 50,
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

          // Descargar video usando XMLHttpRequest para evitar CORS
          const videoBlob = await new Promise((resolve, reject) => {
            const xhr = new XMLHttpRequest()
            xhr.open('GET', downloadURL, true)
            xhr.responseType = 'blob'
            
            xhr.onload = function() {
              if (xhr.status === 200 || xhr.status === 206) {
                resolve(xhr.response)
              } else {
                reject(new Error(`Error descargando: ${xhr.status}`))
              }
            }
            
            xhr.onerror = function() {
              reject(new Error('Error de red al descargar'))
            }
            
            xhr.send()
          })
          videoBlobs.push(videoBlob)
          
          console.log(`Video ${i + 1} descargado: ${video.title}`)
          
        } catch (error) {
          console.error(`Error con video ${video.title}:`, error)
          throw new Error(`Error procesando video ${video.title}: ${error.message}`)
        }
      }

      if (onProgress) {
        onProgress({
          stage: 'combine',
          current: 50,
          total: 100,
          message: 'Combinando videos...'
        })
      }

      // Crear un video combinado usando MediaRecorder
      const combinedBlob = await this.combineVideoBlobs(videoBlobs)

      if (onProgress) {
        onProgress({
          stage: 'complete',
          current: 100,
          total: 100,
          message: '¡Videos combinados exitosamente!'
        })
      }

      console.log('Combinación completada, archivo creado')
      return combinedBlob

    } catch (error) {
      console.error('Error combinando videos:', error)
      throw new Error(`Error combinando videos: ${error.message}`)
    }
  }

  // Método para combinar blobs de video
  async combineVideoBlobs(videoBlobs) {
    return new Promise((resolve, reject) => {
      try {
        // Crear un canvas para combinar los videos
        const canvas = document.createElement('canvas')
        const ctx = canvas.getContext('2d')
        
        // Configurar canvas
        canvas.width = 1280
        canvas.height = 720
        
        // Crear MediaRecorder
        const stream = canvas.captureStream(30) // 30 FPS
        const mediaRecorder = new MediaRecorder(stream, {
          mimeType: 'video/webm;codecs=vp9'
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
            video.play()
          }
          
          video.ontimeupdate = () => {
            // Dibujar el frame actual en el canvas
            ctx.drawImage(video, 0, 0, canvas.width, canvas.height)
          }
          
          video.onended = () => {
            URL.revokeObjectURL(videoUrl)
            currentVideoIndex++
            setTimeout(processNextVideo, 100) // Pequeña pausa entre videos
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
