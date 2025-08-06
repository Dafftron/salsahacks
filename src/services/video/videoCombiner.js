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
      
      // Cargar FFmpeg con archivos locales
      await this.ffmpeg.load({
        coreURL: await toBlobURL('/ffmpeg/ffmpeg-core.js', 'text/javascript'),
        wasmURL: await toBlobURL('/ffmpeg/ffmpeg-core.wasm', 'application/wasm'),
      })
      
      this.isLoaded = true
      console.log('FFmpeg.wasm cargado correctamente')
    } catch (error) {
      console.error('Error cargando FFmpeg:', error)
      throw new Error('No se pudo cargar FFmpeg.wasm')
    }
  }

  // Método principal que usa FFmpeg.wasm
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

          // Descargar video
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

      // Ejecutar comando FFmpeg para combinar
      console.log('Ejecutando comando FFmpeg...')
      await this.ffmpeg.exec([
        '-f', 'concat',
        '-safe', '0',
        '-i', 'filelist.txt',
        '-c', 'copy',
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
          message: '¡Videos combinados exitosamente!'
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
      if (!this.isLoaded) {
        await this.load()
      }

      // Descargar video
      const response = await fetch(videoUrl)
      const videoBlob = await response.blob()
      const videoBuffer = await videoBlob.arrayBuffer()
      
      // Escribir archivo temporal
      await this.ffmpeg.writeFile('temp_video.mp4', new Uint8Array(videoBuffer))
      
      // Obtener información
      await this.ffmpeg.exec([
        '-i', 'temp_video.mp4',
        '-f', 'null',
        '-'
      ])
      
      // Leer logs para obtener información
      const logs = await this.ffmpeg.readFile('temp_video.mp4')
      
      // Limpiar
      await this.ffmpeg.deleteFile('temp_video.mp4')
      
      return logs
    } catch (error) {
      console.error('Error obteniendo información del video:', error)
      return null
    }
  }
}

export default VideoCombiner
