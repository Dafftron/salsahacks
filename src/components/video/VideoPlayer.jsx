import { useState, useRef, useEffect } from 'react'
import { 
  Play, 
  Pause, 
  Volume2, 
  VolumeX, 
  RotateCcw, 
  RotateCw,
  Maximize,
  Minimize,
  SkipBack,
  SkipForward,
  Settings,
  Minus,
  Zap,
  Download
} from 'lucide-react'
import { getFileURL } from '../../services/firebase/storage'

const VideoPlayer = ({ 
  src, 
  size = 'medium', 
  loop = false, 
  loopSegment = null, // { start: number, end: number }
  showControls: initialShowControls = true, 
  autoplay = false, 
  muted = false,
  onTimeUpdate = null,
  onEnded = null,
  className = '',
  resolutions = null, // Array de resoluciones disponibles
  currentResolution = null, // Resolución actual seleccionada
  onResolutionChange = null, // Callback para cambio de resolución
  videoTitle = 'video' // Título del video para la descarga
}) => {
  const videoRef = useRef(null)
  const containerRef = useRef(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [volume, setVolume] = useState(1)
  const [isMuted, setIsMuted] = useState(muted)
  const [showVolumeSlider, setShowVolumeSlider] = useState(false)
  const [volumeSliderTimeout, setVolumeSliderTimeout] = useState(null)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [isLoopEnabled, setIsLoopEnabled] = useState(false)
  const [loopStart, setLoopStart] = useState(loopSegment?.start || 0)
  const [loopEnd, setLoopEnd] = useState(loopSegment?.end || 0)
  const [isLoopSegmentMode, setIsLoopSegmentMode] = useState(!!loopSegment)
  const [hasPointA, setHasPointA] = useState(false)
  const [hasPointB, setHasPointB] = useState(false)
  const [savedPointA, setSavedPointA] = useState(0)
  const [savedPointB, setSavedPointB] = useState(0)
  const [showControls, setShowControls] = useState(initialShowControls)
  const [controlsTimeout, setControlsTimeout] = useState(null)
  const [showResolutionMenu, setShowResolutionMenu] = useState(false)
  const [selectedResolution, setSelectedResolution] = useState(currentResolution || 'auto')
  const [videoMaxResolution, setVideoMaxResolution] = useState(null)
  const [currentAutoResolution, setCurrentAutoResolution] = useState(null)
  const [showSpeedMenu, setShowSpeedMenu] = useState(false)
  const [playbackSpeed, setPlaybackSpeed] = useState(1)
  const [videoOrientation, setVideoOrientation] = useState('horizontal') // 'horizontal' o 'vertical'

  // Velocidades disponibles
  const availableSpeeds = [0.25, 0.5, 0.75, 1, 1.25, 1.5, 2]

  // Manejar bucle de segmento
  useEffect(() => {
    if (videoRef.current && isLoopSegmentMode && isPlaying && hasPointA && hasPointB) {
      const video = videoRef.current
      const checkLoopSegment = () => {
        if (video.currentTime >= loopEnd) {
          video.currentTime = loopStart
        }
      }
      
      video.addEventListener('timeupdate', checkLoopSegment)
      return () => video.removeEventListener('timeupdate', checkLoopSegment)
    }
  }, [isLoopSegmentMode, loopStart, loopEnd, isPlaying, hasPointA, hasPointB])

  // Controles de teclado
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (!videoRef.current) return
      
      // No procesar eventos de teclado si el foco está en un campo de entrada
      const activeElement = document.activeElement
      if (activeElement && (
        activeElement.tagName === 'INPUT' || 
        activeElement.tagName === 'TEXTAREA' || 
        activeElement.contentEditable === 'true' ||
        activeElement.classList.contains('ql-editor') // Para editores de texto enriquecido
      )) {
        return
      }
      
      switch (e.code) {
        case 'Space':
          e.preventDefault()
          togglePlay()
          break
        case 'ArrowLeft':
          e.preventDefault()
          skip(-10)
          break
        case 'ArrowRight':
          e.preventDefault()
          skip(10)
          break
        case 'KeyA':
          e.preventDefault()
          setLoopStart(currentTime)
          break
        case 'KeyB':
          e.preventDefault()
          setLoopEnd(currentTime)
          break
        case 'KeyL':
          e.preventDefault()
          setIsLoopEnabled(!isLoopEnabled)
          break
        case 'KeyS':
          e.preventDefault()
          // Ciclar entre velocidades: 0.5x -> 1x -> 1.5x -> 2x -> 0.5x
          const currentIndex = availableSpeeds.indexOf(playbackSpeed)
          const nextIndex = (currentIndex + 1) % availableSpeeds.length
          handleSpeedChange(availableSpeeds[nextIndex])
          break
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [currentTime, isLoopEnabled, playbackSpeed])

  // Auto-hide controles
  useEffect(() => {
    if (showControls && isPlaying) {
      const timeout = setTimeout(() => {
        setShowControls(false)
      }, 4000) // Cambiado a 4 segundos
      setControlsTimeout(timeout)
      return () => clearTimeout(timeout)
    }
  }, [showControls, isPlaying])

  // Cleanup timeouts al desmontar
  useEffect(() => {
    return () => {
      if (controlsTimeout) clearTimeout(controlsTimeout)
      if (volumeSliderTimeout) clearTimeout(volumeSliderTimeout)
    }
  }, [])

  // Inicializar volumen y velocidad cuando el video se carga
  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.volume = volume
      videoRef.current.muted = isMuted
      videoRef.current.playbackRate = playbackSpeed
    }
  }, [volume, isMuted, playbackSpeed])

  // Detectar resolución actual cuando se selecciona Auto
  useEffect(() => {
    if (selectedResolution === 'auto' && videoMaxResolution) {
      setCurrentAutoResolution(videoMaxResolution)
    }
  }, [selectedResolution, videoMaxResolution])

  // Cerrar menús al hacer clic fuera
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (showResolutionMenu) {
        setShowResolutionMenu(false)
      }
      if (showSpeedMenu) {
        setShowSpeedMenu(false)
      }
    }

    document.addEventListener('click', handleClickOutside)
    return () => document.removeEventListener('click', handleClickOutside)
  }, [showResolutionMenu, showSpeedMenu])

  // Función helper para activar controles
  const activateControls = () => {
    setShowControls(true)
    if (controlsTimeout) {
      clearTimeout(controlsTimeout)
    }
  }

  // Mostrar controles al hacer clic en el video
  const handleVideoClick = () => {
    activateControls()
  }

  // Manejar doble clic para adelantar/retroceder
  const [lastClickTime, setLastClickTime] = useState(0)
  const [clickCount, setClickCount] = useState(0)

  const handleVideoDoubleClick = (e) => {
    const currentTime = Date.now()
    const timeDiff = currentTime - lastClickTime
    
    if (timeDiff < 300) { // Doble clic detectado
      const rect = e.currentTarget.getBoundingClientRect()
      const clickX = e.clientX - rect.left
      const videoWidth = rect.width
      
      // Si el clic es en la mitad izquierda, retroceder 10s
      // Si el clic es en la mitad derecha, adelantar 10s
      if (clickX < videoWidth / 2) {
        skip(-10)
      } else {
        skip(10)
      }
      
      setClickCount(0)
      setLastClickTime(0)
    } else {
      setClickCount(1)
      setLastClickTime(currentTime)
    }
  }

  const togglePlay = () => {
    console.log('Toggle play clicked!')
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause()
      } else {
        videoRef.current.play()
      }
      setIsPlaying(!isPlaying)
    }
  }

  const skip = (seconds) => {
    if (videoRef.current) {
      const newTime = Math.max(0, Math.min(duration, currentTime + seconds))
      videoRef.current.currentTime = newTime
      setCurrentTime(newTime)
    }
  }

  const handleTimeUpdate = () => {
    if (videoRef.current) {
      setCurrentTime(videoRef.current.currentTime)
      onTimeUpdate?.(videoRef.current.currentTime)
    }
  }

  const handleLoadedMetadata = () => {
    if (videoRef.current) {
      setDuration(videoRef.current.duration)
      
      // Detectar resolución máxima del video
      const video = videoRef.current
      const width = video.videoWidth
      const height = video.videoHeight
      
      if (width && height) {
        // Detectar orientación del video
        const isVertical = height > width
        setVideoOrientation(isVertical ? 'vertical' : 'horizontal')
        console.log(`Orientación del video: ${isVertical ? 'vertical' : 'horizontal'} (${width}x${height})`)
        console.log(`Aspect ratio: ${width}:${height} = ${(width/height).toFixed(2)}`)
        
        const maxDimension = Math.max(width, height)
        let maxRes = '480p'
        
        if (maxDimension >= 3840) maxRes = '4k'
        else if (maxDimension >= 1920) maxRes = '1080p'
        else if (maxDimension >= 1280) maxRes = '720p'
        else if (maxDimension >= 854) maxRes = '480p'
        else maxRes = '360p'
        
        setVideoMaxResolution(maxRes)
        console.log(`Resolución máxima del video: ${maxRes} (${width}x${height})`)
      }
      
      if (autoplay) {
        video.play()
        setIsPlaying(true)
      }
    }
  }

  const handleEnded = () => {
    if (isLoopEnabled && !isLoopSegmentMode) {
      if (videoRef.current) {
        videoRef.current.currentTime = 0
        videoRef.current.play()
      }
    } else if (isLoopSegmentMode) {
      if (videoRef.current) {
        videoRef.current.currentTime = loopStart
        videoRef.current.play()
      }
    } else {
      setIsPlaying(false)
    }
    onEnded?.()
  }

  const handleSeek = (e) => {
    if (videoRef.current) {
      const rect = e.currentTarget.getBoundingClientRect()
      const percent = (e.clientX - rect.left) / rect.width
      const newTime = percent * duration
      videoRef.current.currentTime = newTime
      setCurrentTime(newTime)
      
      // No actualizar los puntos A-B al hacer clic en la barra de progreso
      // Los puntos solo se actualizan cuando se hace clic en los botones A y B
    }
  }

  const toggleMute = () => {
    console.log('Toggle mute clicked!')
    if (videoRef.current) {
      const newMutedState = !isMuted
      videoRef.current.muted = newMutedState
      setIsMuted(newMutedState)
      
      if (newMutedState) {
        // Al mutear, guardar el volumen actual y ponerlo en 0
        videoRef.current.volume = 0
      } else {
        // Al desmutear, restaurar el volumen
        videoRef.current.volume = volume
      }
    }
  }

  const handleVolumeChange = (e) => {
    const newVolume = parseFloat(e.target.value)
    console.log('Volume changed to:', newVolume)
    
    if (videoRef.current) {
      videoRef.current.volume = newVolume
      setVolume(newVolume)
      
      // Si el volumen es 0, mutear. Si no, desmutear
      if (newVolume === 0) {
        videoRef.current.muted = true
        setIsMuted(true)
      } else {
        videoRef.current.muted = false
        setIsMuted(false)
      }
    }
  }

  const toggleFullscreen = () => {
    try {
      if (!document.fullscreenElement) {
        if (containerRef.current.requestFullscreen) {
          containerRef.current.requestFullscreen()
        } else if (containerRef.current.webkitRequestFullscreen) {
          containerRef.current.webkitRequestFullscreen()
        } else if (containerRef.current.msRequestFullscreen) {
          containerRef.current.msRequestFullscreen()
        }
        setIsFullscreen(true)
      } else {
        if (document.exitFullscreen) {
          document.exitFullscreen()
        } else if (document.webkitExitFullscreen) {
          document.webkitExitFullscreen()
        } else if (document.msExitFullscreen) {
          document.msExitFullscreen()
        }
        setIsFullscreen(false)
      }
    } catch (error) {
      console.error('Error toggling fullscreen:', error)
    }
  }

  const setLoopPoint = (type) => {
    if (type === 'start') {
      if (hasPointA) {
        // Si ya existe el punto A, lo quitamos
        setHasPointA(false)
        setLoopStart(0)
        console.log('Punto A eliminado')
      } else {
        // Establecer punto A
        setHasPointA(true)
        setLoopStart(currentTime)
        setSavedPointA(currentTime)
        console.log(`Punto A establecido en: ${formatTime(currentTime)}`)
      }
    } else {
      if (hasPointB) {
        // Si ya existe el punto B, lo quitamos
        setHasPointB(false)
        setLoopEnd(0)
        console.log('Punto B eliminado')
      } else {
        // Establecer punto B
        setHasPointB(true)
        setLoopEnd(currentTime)
        setSavedPointB(currentTime)
        console.log(`Punto B establecido en: ${formatTime(currentTime)}`)
      }
    }
  }

  const formatTime = (time) => {
    const minutes = Math.floor(time / 60)
    const seconds = Math.floor(time % 60)
    return `${minutes}:${seconds.toString().padStart(2, '0')}`
  }

  const handleResolutionChange = (resolution) => {
    setSelectedResolution(resolution)
    setShowResolutionMenu(false)
    
    // Si se selecciona Auto, simular la detección de resolución actual
    if (resolution === 'auto' && videoMaxResolution) {
      setCurrentAutoResolution(videoMaxResolution)
    } else if (resolution !== 'auto') {
      setCurrentAutoResolution(null)
    }
    
    onResolutionChange?.(resolution)
  }

  const handleSpeedChange = (speed) => {
    if (videoRef.current) {
      videoRef.current.playbackRate = speed
      setPlaybackSpeed(speed)
    }
    setShowSpeedMenu(false)
  }

  const getSpeedLabel = (speed) => {
    if (speed === 1) return 'Normal'
    return `${speed}x`
  }

  const getResolutionLabel = (resolution) => {
    switch (resolution) {
      case 'auto':
        return currentAutoResolution ? `Auto (${currentAutoResolution})` : 'Auto'
      case '4k':
        return '4K'
      case '1080p':
        return '1080p'
      case '720p':
        return '720p'
      case '480p':
        return '480p'
      case '360p':
        return '360p'
      default:
        return resolution
    }
  }

  const isResolutionAvailable = (resolution) => {
    if (!videoMaxResolution) return true // Si no sabemos la resolución máxima, mostrar todas
    
    const resolutionOrder = ['360p', '480p', '720p', '1080p', '4k']
    const maxIndex = resolutionOrder.indexOf(videoMaxResolution)
    const resIndex = resolutionOrder.indexOf(resolution)
    
    return resIndex <= maxIndex
  }

  const getSizeClasses = () => {
    let sizeClass = ''
    switch (size) {
      case 'small':
        sizeClass = 'max-w-xs'
        break
      case 'medium':
        sizeClass = 'max-w-md'
        break
      case 'large':
        sizeClass = 'max-w-2xl'
        break
      case 'fullscreen':
        return 'w-full h-full'
      default:
        sizeClass = 'max-w-md'
    }
    
    // Ajustar el aspect ratio según la orientación del video
    const aspectClass = videoOrientation === 'vertical' ? 'aspect-[9/16]' : 'aspect-video'
    
    return `${sizeClass} ${aspectClass}`
  }

  // Función para descargar video usando Firebase Storage
  const downloadVideo = async () => {
    try {
      console.log('Iniciando descarga de video:', videoTitle)
      
      // Si tenemos una URL de Firebase Storage, descargar directamente
      if (src && (src.includes('firebase') || src.includes('googleapis'))) {
        console.log('Detectada URL de Firebase Storage, descargando...')
        
        // Descargar el archivo como blob para evitar ventanas del navegador
        const response = await fetch(src)
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`)
        }
        
        const blob = await response.blob()
        console.log('Blob descargado:', blob.size, 'bytes')
        
        // Crear URL local del blob
        const blobUrl = URL.createObjectURL(blob)
        
        // Crear enlace de descarga
        const link = document.createElement('a')
        link.href = blobUrl
        link.download = videoTitle || 'video.mp4'
        link.style.display = 'none'
        
        // Agregar al DOM y hacer clic
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
        
        // Limpiar la URL del blob después de un momento
        setTimeout(() => {
          URL.revokeObjectURL(blobUrl)
        }, 1000)
        
        console.log('Descarga completada exitosamente')
      } else {
        // Para URLs que no son de Firebase, usar el método original
        console.log('Usando método de descarga directa para URL no-Firebase')
        const link = document.createElement('a')
        link.href = src
        link.download = videoTitle || 'video.mp4'
        link.style.display = 'none'
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
      }
    } catch (error) {
      console.error('Error en descarga:', error)
      alert(`Error al descargar el video: ${error.message}`)
    }
  }

  return (
    <div 
      ref={containerRef}
      className={`relative bg-black rounded-lg overflow-hidden video-player-container ${getSizeClasses()} ${className} ${videoOrientation === 'vertical' ? 'video-player-vertical' : ''}`}
      onMouseMove={activateControls}
      onMouseLeave={() => {
        if (isPlaying) {
          const timeout = setTimeout(() => {
            setShowControls(false)
          }, 4000)
          setControlsTimeout(timeout)
        }
      }}
      onTouchStart={activateControls}
      onTouchMove={activateControls}
      onClick={handleVideoClick}
      onDoubleClick={handleVideoDoubleClick}
    >
      <video
        ref={videoRef}
        src={src}
        className="w-full h-full object-cover cursor-pointer"
        muted={isMuted}
        loop={isLoopEnabled && !isLoopSegmentMode}
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={handleLoadedMetadata}
        onEnded={handleEnded}
        onPlay={() => setIsPlaying(true)}
        onPause={() => setIsPlaying(false)}
        onClick={handleVideoClick}
        onDoubleClick={handleVideoDoubleClick}
        onTouchStart={activateControls}
        onTouchMove={activateControls}
      />



      {/* Overlay de controles */}
      {showControls && (
        <div 
          className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"
          onMouseMove={activateControls}
          onTouchStart={activateControls}
          onTouchMove={activateControls}
        >
          {/* Controles superiores - solo pantalla completa */}
          <div className="absolute top-0 left-0 right-0 p-4 flex justify-end items-center">
            <div className="flex items-center space-x-2">
              {/* Botón de pantalla completa */}
              <button
                onClick={toggleFullscreen}
                onTouchStart={activateControls}
                className="p-2 rounded-full bg-white/20 text-white hover:bg-white/30 transition-colors z-10"
              >
                {isFullscreen ? <Minimize className="w-4 h-4" /> : <Maximize className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Controles centrales - solo play/pause para móviles */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="flex items-center space-x-4">
              {/* Botón de retroceder 10s - estilo Disney+/YouTube */}
              <button
                onClick={() => skip(-10)}
                onTouchStart={activateControls}
                className="p-3 rounded-full bg-black/60 text-white hover:bg-black/80 transition-colors z-10 hidden md:flex items-center justify-center"
              >
                <div className="flex items-center space-x-1">
                  <div className="w-6 h-6 rounded-full border-2 border-white flex items-center justify-center">
                    <SkipBack className="w-3 h-3" />
                  </div>
                  <span className="text-sm font-medium">10</span>
                </div>
              </button>

              <button
                onClick={togglePlay}
                onTouchStart={activateControls}
                className="p-4 rounded-full bg-white/20 text-white hover:bg-white/30 transition-colors z-10"
              >
                {isPlaying ? <Pause className="w-8 h-8" /> : <Play className="w-8 h-8" />}
              </button>

              {/* Botón de adelantar 10s - estilo Disney+/YouTube */}
              <button
                onClick={() => skip(10)}
                onTouchStart={activateControls}
                className="p-3 rounded-full bg-black/60 text-white hover:bg-black/80 transition-colors z-10 hidden md:flex items-center justify-center"
              >
                <div className="flex items-center space-x-1">
                  <span className="text-sm font-medium">10</span>
                  <div className="w-6 h-6 rounded-full border-2 border-white flex items-center justify-center">
                    <SkipForward className="w-3 h-3" />
                  </div>
                </div>
              </button>
            </div>
          </div>

          {/* Controles inferiores */}
          <div className="absolute bottom-0 left-0 right-0 p-4">
            {/* Controles de volumen, bucle, A-B y resoluciones - por encima de la barra de progreso */}
            <div className="flex justify-end mb-2 space-x-2">
              {/* Botón de bucle */}
              <button
                onClick={() => setIsLoopEnabled(!isLoopEnabled)}
                onTouchStart={activateControls}
                className={`p-2 rounded-full transition-colors z-10 ${
                  isLoopEnabled ? 'bg-blue-500 text-white' : 'bg-white/20 text-white hover:bg-white/30'
                }`}
                title="Bucle"
              >
                <RotateCcw className="w-4 h-4" />
              </button>

              {/* Botón de segmento A-B */}
              <button
                onClick={() => {
                  const newMode = !isLoopSegmentMode
                  setIsLoopSegmentMode(newMode)
                  if (!newMode) {
                    // Al desactivar, limpiar todos los puntos
                    setHasPointA(false)
                    setHasPointB(false)
                    setLoopStart(0)
                    setLoopEnd(0)
                  } else {
                    // Al reactivar, restaurar los puntos guardados si existen
                    if (savedPointA > 0) {
                      setHasPointA(true)
                      setLoopStart(savedPointA)
                    }
                    if (savedPointB > 0) {
                      setHasPointB(true)
                      setLoopEnd(savedPointB)
                    }
                  }
                  console.log(`Modo A-B ${newMode ? 'activado' : 'desactivado'}`)
                }}
                onTouchStart={activateControls}
                className={`p-2 rounded-full transition-colors z-10 ${
                  isLoopSegmentMode ? 'bg-green-500 text-white' : 'bg-white/20 text-white hover:bg-white/30'
                }`}
                title="Segmento A-B"
              >
                <div className="flex items-center justify-center w-4 h-4 text-[10px] font-bold leading-none">
                  A-B
                </div>
              </button>

              {/* Botón de resoluciones */}
              {resolutions && resolutions.length > 0 && (
                <div className="relative">
                  <button
                    onClick={() => setShowResolutionMenu(!showResolutionMenu)}
                    onTouchStart={activateControls}
                    className="p-2 rounded-full bg-white/20 text-white hover:bg-white/30 transition-colors z-10"
                    title="Resolución"
                  >
                    <div className="flex items-center justify-center w-4 h-4 text-[10px] font-bold leading-none">
                      {getResolutionLabel(selectedResolution)}
                    </div>
                  </button>
                  
                                                       {showResolutionMenu && (
                    <div 
                      className="absolute bottom-full right-0 mb-2 bg-black/90 rounded-lg p-2 z-20 min-w-[80px]"
                      onTouchStart={activateControls}
                      onTouchMove={activateControls}
                    >
                       {resolutions.map((resolution) => {
                         const isAvailable = isResolutionAvailable(resolution)
                         return (
                           <button
                             key={resolution}
                             onClick={() => isAvailable && handleResolutionChange(resolution)}
                             className={`w-full text-left px-3 py-1 rounded text-xs transition-colors ${
                               !isAvailable 
                                 ? 'text-gray-500 cursor-not-allowed opacity-50'
                                 : selectedResolution === resolution 
                                   ? 'bg-blue-500 text-white' 
                                   : 'text-white hover:bg-white/20'
                             }`}
                             disabled={!isAvailable}
                           >
                             {getResolutionLabel(resolution)}
                             {!isAvailable && (
                               <span className="ml-1 text-[10px] opacity-75">
                                 (no disponible)
                               </span>
                             )}
                           </button>
                         )
                       })}
                     </div>
                   )}
                </div>
              )}

              {/* Botón de velocidades */}
              <div className="relative">
                <button
                  onClick={() => setShowSpeedMenu(!showSpeedMenu)}
                  onTouchStart={activateControls}
                  className="p-2 rounded-full bg-white/20 text-white hover:bg-white/30 transition-colors z-10"
                  title="Velocidad de reproducción"
                >
                  <div className="flex items-center justify-center w-4 h-4 text-[10px] font-bold leading-none">
                    {playbackSpeed === 1 ? '1x' : `${playbackSpeed}x`}
                  </div>
                </button>
                
                {showSpeedMenu && (
                  <div 
                    className="absolute bottom-full right-0 mb-2 bg-black/90 rounded-lg p-2 z-20 min-w-[80px]"
                    onTouchStart={activateControls}
                    onTouchMove={activateControls}
                  >
                    {availableSpeeds.map((speed) => (
                      <button
                        key={speed}
                        onClick={() => handleSpeedChange(speed)}
                        className={`w-full text-left px-3 py-1 rounded text-xs transition-colors ${
                          playbackSpeed === speed 
                            ? 'bg-blue-500 text-white' 
                            : 'text-white hover:bg-white/20'
                        }`}
                      >
                        {getSpeedLabel(speed)}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Botón de descarga */}
              <button
                onClick={downloadVideo}
                onTouchStart={activateControls}
                className="p-2 rounded-full bg-white/20 text-white hover:bg-white/30 transition-colors z-10"
                title="Descargar video"
              >
                <Download className="w-4 h-4" />
              </button>

              {/* Controles de volumen */}
              <div className="relative">
                <button
                  onClick={toggleMute}
                  onTouchStart={activateControls}
                  className="p-2 rounded-full bg-white/20 text-white hover:bg-white/30 transition-colors z-10"
                  onMouseEnter={() => setShowVolumeSlider(true)}
                  onMouseLeave={() => {
                    const timeout = setTimeout(() => setShowVolumeSlider(false), 1000)
                    setVolumeSliderTimeout(timeout)
                  }}
                >
                  {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                </button>
                
                                 {showVolumeSlider && (
                   <div 
                     className="absolute bottom-full right-0 mb-2 bg-black/80 rounded-lg p-3 z-20"
                     onMouseEnter={() => {
                       if (volumeSliderTimeout) {
                         clearTimeout(volumeSliderTimeout)
                         setVolumeSliderTimeout(null)
                       }
                     }}
                     onMouseLeave={() => {
                       const timeout = setTimeout(() => setShowVolumeSlider(false), 1000)
                       setVolumeSliderTimeout(timeout)
                     }}
                     onTouchStart={activateControls}
                     onTouchMove={activateControls}
                   >
                    <div className="flex flex-col items-center space-y-2">
                                             <input
                         type="range"
                         min="0"
                         max="1"
                         step="0.01"
                         value={volume}
                         onChange={handleVolumeChange}
                         onTouchStart={activateControls}
                         onTouchMove={activateControls}
                         className="w-2 h-20 bg-gray-600 rounded-lg appearance-none cursor-pointer slider-vertical"
                         style={{
                           background: `linear-gradient(to top, #3b82f6 0%, #3b82f6 ${volume * 100}%, #4b5563 ${volume * 100}%, #4b5563 100%)`
                         }}
                         orient="vertical"
                       />
                      <span className="text-white text-xs">{Math.round(volume * 100)}%</span>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Barra de progreso */}
            <div className="relative mb-4">
              <div
                className="w-full h-2 bg-white/20 rounded-full cursor-pointer relative"
                onClick={handleSeek}
                onTouchStart={activateControls}
                onTouchMove={activateControls}
              >
                <div
                  className="h-full bg-blue-500 rounded-full"
                  style={{ width: `${(currentTime / duration) * 100}%` }}
                />
                
                {/* Marcadores de bucle A-B - fuera del progreso para que siempre sean visibles */}
                {isLoopSegmentMode && hasPointA && (
                  <div
                    className="absolute top-0 w-1 h-full bg-green-500 z-10"
                    style={{ left: `${(loopStart / duration) * 100}%` }}
                  />
                )}
                {isLoopSegmentMode && hasPointB && (
                  <div
                    className="absolute top-0 w-1 h-full bg-red-500 z-10"
                    style={{ left: `${(loopEnd / duration) * 100}%` }}
                  />
                )}
              </div>
            </div>

            {/* Información de tiempo y controles de bucle */}
            <div className="flex items-center justify-between text-white text-sm">
              <div className="flex items-center space-x-4">
                <span>{formatTime(currentTime)} / {formatTime(duration)}</span>
                {playbackSpeed !== 1 && (
                  <span className="text-blue-400 font-medium">
                    {playbackSpeed}x
                  </span>
                )}
                
                {isLoopSegmentMode && (
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => setLoopPoint('start')}
                      onTouchStart={activateControls}
                      className={`px-2 py-1 rounded text-xs transition-colors ${
                        hasPointA ? 'bg-green-500 text-white' : 'bg-gray-600 text-gray-300 hover:bg-gray-500'
                      }`}
                    >
                      A: {hasPointA ? formatTime(loopStart) : '--:--'}
                    </button>
                    <button
                      onClick={() => setLoopPoint('end')}
                      onTouchStart={activateControls}
                      className={`px-2 py-1 rounded text-xs transition-colors ${
                        hasPointB ? 'bg-red-500 text-white' : 'bg-gray-600 text-gray-300 hover:bg-gray-500'
                      }`}
                    >
                      B: {hasPointB ? formatTime(loopEnd) : '--:--'}
                    </button>
                  </div>
                )}
              </div>

              <div className="flex items-center space-x-2">
                <div className="text-xs opacity-75">
                  {isLoopEnabled && (isLoopSegmentMode && hasPointA && hasPointB ? 'Bucle A-B' : 'Bucle completo')}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default VideoPlayer 