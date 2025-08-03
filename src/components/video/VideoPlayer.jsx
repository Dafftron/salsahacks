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
  Minus
} from 'lucide-react'

const VideoPlayer = ({ 
  src, 
  size = 'medium', 
  loop = false, 
  loopSegment = null, // { start: number, end: number }
  showControls: initialShowControls = true, 
  autoplay = false, 
  muted = true,
  onTimeUpdate = null,
  onEnded = null,
  className = ''
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
  const [isVertical, setIsVertical] = useState(false)
  const [showControls, setShowControls] = useState(initialShowControls)
  const [controlsTimeout, setControlsTimeout] = useState(null)

  // Detectar orientación del video
  useEffect(() => {
    if (videoRef.current) {
      const video = videoRef.current
      const checkOrientation = () => {
        if (video.videoWidth && video.videoHeight) {
          setIsVertical(video.videoWidth < video.videoHeight)
        }
      }
      
      video.addEventListener('loadedmetadata', checkOrientation)
      return () => video.removeEventListener('loadedmetadata', checkOrientation)
    }
  }, [src])

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
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [currentTime, isLoopEnabled])

  // Auto-hide controles
  useEffect(() => {
    if (showControls && isPlaying) {
      const timeout = setTimeout(() => {
        setShowControls(false)
      }, 3000)
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

  // Inicializar volumen cuando el video se carga
  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.volume = volume
      videoRef.current.muted = isMuted
    }
  }, [volume, isMuted])

  // Mostrar controles al hacer clic en el video
  const handleVideoClick = () => {
    setShowControls(true)
    if (controlsTimeout) {
      clearTimeout(controlsTimeout)
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
      if (autoplay) {
        videoRef.current.play()
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

  const getSizeClasses = () => {
    switch (size) {
      case 'small':
        return 'max-w-xs'
      case 'medium':
        return 'max-w-md'
      case 'large':
        return 'max-w-2xl'
      case 'fullscreen':
        return 'w-full h-full'
      default:
        return 'max-w-md'
    }
  }

  return (
    <div 
      ref={containerRef}
      className={`relative bg-black rounded-lg overflow-hidden ${getSizeClasses()} ${className} ${
        isVertical ? 'aspect-[9/16]' : 'aspect-video'
      }`}
      onMouseMove={() => {
        setShowControls(true)
        if (controlsTimeout) {
          clearTimeout(controlsTimeout)
        }
      }}
      onMouseLeave={() => {
        if (isPlaying) {
          const timeout = setTimeout(() => {
            setShowControls(false)
          }, 3000)
          setControlsTimeout(timeout)
        }
      }}
      onClick={handleVideoClick}
    >
      <video
        ref={videoRef}
        src={src}
        className="w-full h-full object-contain cursor-pointer"
        muted={isMuted}
        loop={isLoopEnabled && !isLoopSegmentMode}
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={handleLoadedMetadata}
        onEnded={handleEnded}
        onPlay={() => setIsPlaying(true)}
        onPause={() => setIsPlaying(false)}
        onClick={handleVideoClick}
      />

      {/* Overlay de controles */}
      {showControls && (
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent">
          {/* Controles superiores */}
          <div className="absolute top-0 left-0 right-0 p-4 flex justify-between items-center">
            <div className="flex items-center space-x-2">
              {/* Botón de bucle */}
              <button
                onClick={() => setIsLoopEnabled(!isLoopEnabled)}
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
                 className={`p-2 rounded-full transition-colors z-10 ${
                   isLoopSegmentMode ? 'bg-green-500 text-white' : 'bg-white/20 text-white hover:bg-white/30'
                 }`}
                 title="Segmento A-B"
               >
                 <div className="flex items-center justify-center w-4 h-4 text-[10px] font-bold leading-none">
                   A-B
                 </div>
               </button>
            </div>

                         <div className="flex items-center space-x-2">
               {/* Botón de pantalla completa */}
               <button
                 onClick={toggleFullscreen}
                 className="p-2 rounded-full bg-white/20 text-white hover:bg-white/30 transition-colors z-10"
               >
                 {isFullscreen ? <Minimize className="w-4 h-4" /> : <Maximize className="w-4 h-4" />}
               </button>
             </div>
          </div>

          {/* Controles centrales */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => skip(-10)}
                className="p-3 rounded-full bg-white/20 text-white hover:bg-white/30 transition-colors z-10"
              >
                <SkipBack className="w-6 h-6" />
              </button>

              <button
                onClick={togglePlay}
                className="p-4 rounded-full bg-white/20 text-white hover:bg-white/30 transition-colors z-10"
              >
                {isPlaying ? <Pause className="w-8 h-8" /> : <Play className="w-8 h-8" />}
              </button>

              <button
                onClick={() => skip(10)}
                className="p-3 rounded-full bg-white/20 text-white hover:bg-white/30 transition-colors z-10"
              >
                <SkipForward className="w-6 h-6" />
              </button>
            </div>
          </div>

                     {/* Controles inferiores */}
           <div className="absolute bottom-0 left-0 right-0 p-4">
             {/* Controles de volumen - por encima de la barra de progreso */}
             <div className="flex justify-end mb-2">
               <div className="relative">
                 <button
                   onClick={toggleMute}
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
                   >
                     <div className="flex flex-col items-center space-y-2">
                       <input
                         type="range"
                         min="0"
                         max="1"
                         step="0.01"
                         value={volume}
                         onChange={handleVolumeChange}
                         className="w-20 h-2 bg-gray-600 rounded-lg appearance-none cursor-pointer slider"
                         style={{
                           background: `linear-gradient(to right, #3b82f6 0%, #3b82f6 ${volume * 100}%, #4b5563 ${volume * 100}%, #4b5563 100%)`
                         }}
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
                 
                 {isLoopSegmentMode && (
                   <div className="flex items-center space-x-2">
                     <button
                       onClick={() => setLoopPoint('start')}
                       className={`px-2 py-1 rounded text-xs transition-colors ${
                         hasPointA ? 'bg-green-500 text-white' : 'bg-gray-600 text-gray-300 hover:bg-gray-500'
                       }`}
                     >
                       A: {hasPointA ? formatTime(loopStart) : '--:--'}
                     </button>
                     <button
                       onClick={() => setLoopPoint('end')}
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

      {/* Overlay de información de orientación */}
      {isVertical && (
        <div className="absolute top-2 right-2 bg-black/60 text-white text-xs px-2 py-1 rounded">
          Vertical
        </div>
      )}
    </div>
  )
}

export default VideoPlayer 