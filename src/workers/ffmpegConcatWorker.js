// Web Worker local para concatenación de MP4 usando FFmpeg.wasm con assets locales
// Cargamos FFmpeg desde /public/ffmpeg para evitar dependencias de CDN

import { FFmpeg } from '@ffmpeg/ffmpeg'
import { toBlobURL } from '@ffmpeg/util'

let ffmpeg = null

self.onmessage = async (e) => {
  const { command, videoBuffers } = e.data || {}

  try {
    if (command === 'init') {
      ffmpeg = new FFmpeg()
      await ffmpeg.load({
        coreURL: await toBlobURL('/ffmpeg/ffmpeg-core.js', 'text/javascript'),
        wasmURL: await toBlobURL('/ffmpeg/ffmpeg-core.wasm', 'application/wasm')
      })
      self.postMessage({ type: 'progress', message: 'FFmpeg cargado correctamente' })
      self.postMessage({ type: 'ready' })
      return
    }

    if (command === 'combine') {
      if (!ffmpeg) {
        throw new Error('FFmpeg no inicializado')
      }

      // Escribir archivos de video
      for (let i = 0; i < videoBuffers.length; i++) {
        const buffer = videoBuffers[i]
        const fileName = `video_${i}.mp4`
        await ffmpeg.writeFile(fileName, new Uint8Array(buffer))
        self.postMessage({
          type: 'progress',
          message: `Video ${i + 1}/${videoBuffers.length} preparado`,
          current: 60 + (i / videoBuffers.length) * 20
        })
      }

      // Crear lista y concatenar sin recodificar
      const fileList = Array.from({ length: videoBuffers.length }, (_, i) => `file 'video_${i}.mp4'`).join('\n')
      await ffmpeg.writeFile('filelist.txt', fileList)

      self.postMessage({ type: 'progress', message: 'Combinando videos...', current: 85 })

      await ffmpeg.exec([
        '-f', 'concat',
        '-safe', '0',
        '-i', 'filelist.txt',
        '-c', 'copy',
        '-movflags', '+faststart',
        'output.mp4'
      ])

      const outputData = await ffmpeg.readFile('output.mp4')

      // Limpiar
      for (let i = 0; i < videoBuffers.length; i++) {
        await ffmpeg.deleteFile(`video_${i}.mp4`)
      }
      await ffmpeg.deleteFile('filelist.txt')
      await ffmpeg.deleteFile('output.mp4')

      self.postMessage({ type: 'complete', data: outputData.buffer, message: 'Combinación completada' })
      return
    }
  } catch (error) {
    self.postMessage({ type: 'error', error: error.message || String(error) })
  }
}


