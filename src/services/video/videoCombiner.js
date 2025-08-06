class VideoCombiner {
  constructor() {
    this.isLoaded = true // No necesitamos cargar nada
  }

  async load() {
    // No necesitamos cargar nada
    return Promise.resolve()
  }

  // Método principal que descarga videos individuales de la secuencia
  async combineVideos(videos, onProgress) {
    try {
      console.log('Iniciando descarga de secuencia...')
      
      if (onProgress) {
        onProgress({
          stage: 'init',
          current: 0,
          total: 100,
          message: 'Iniciando descarga de secuencia...'
        })
      }

      // Descargar todos los videos de la secuencia
      for (let i = 0; i < videos.length; i++) {
        const video = videos[i]
        console.log(`Descargando video ${i + 1}/${videos.length}: ${video.title}`)
        
        if (onProgress) {
          onProgress({
            stage: 'download',
            current: ((i + 1) / videos.length) * 100,
            total: 100,
            message: `Descargando: ${video.title}`
          })
        }

        try {
          // Usar Firebase SDK para obtener URL de descarga (igual que descarga individual)
          const { ref, getDownloadURL } = await import('firebase/storage')
          const { storage } = await import('../firebase/config')
          
          const videoRef = ref(storage, video.videoPath)
          const downloadURL = await getDownloadURL(videoRef)
          
          console.log(`URL de descarga obtenida para ${video.title}:`, downloadURL)

          // Crear enlace de descarga directo (igual que descarga individual)
          const link = document.createElement('a')
          link.href = downloadURL
          link.download = `${video.title}_secuencia_${i + 1}.mp4`
          link.target = '_blank'
          link.rel = 'noopener noreferrer'

          // Agregar al DOM y hacer clic
          document.body.appendChild(link)
          link.click()
          document.body.removeChild(link)
          
          console.log(`Video ${i + 1} descargado: ${video.title}`)
          
          // Pequeña pausa entre descargas
          await new Promise(resolve => setTimeout(resolve, 500))
          
        } catch (error) {
          console.error(`Error con video ${video.title}:`, error)
          throw new Error(`Error procesando video ${video.title}: ${error.message}`)
        }
      }

      if (onProgress) {
        onProgress({
          stage: 'complete',
          current: 100,
          total: 100,
          message: '¡Secuencia descargada!'
        })
      }

      console.log('Descarga de secuencia completada')
      return new Blob(['Secuencia descargada'], { type: 'text/plain' })

    } catch (error) {
      console.error('Error descargando secuencia:', error)
      throw new Error(`Error descargando secuencia: ${error.message}`)
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
