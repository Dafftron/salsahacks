import { useState, useRef, useEffect, useCallback } from 'react'
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
  Settings
} from 'lucide-react'

const VideoPlayer = ({ 
  src, 
  size = 'medium', 
  loop = false, 
  loopSegment = null, // { start: number, end: number }
  showControls = true, 
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
  const [volume, setVolume] = useState(muted ? 0 : 1)
  const [isMuted, setIsMuted] = useState(muted)
  const [showVolumeSlider, setShowVolumeSlider] = useState(false)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [isLoopEnabled, setIsLoopEnabled] = useState(loop)
  const [loopStart, setLoopStart] = useState(loopSegment?.start || 0)
  const [loopEnd, setLoopEnd] = useState(loopSegment?.end || 0)
  const [isLoopSegmentMode, setIsLoopSegmentMode] = useState(!!loopSegment)
  const [isVertical, setIsVertical] = useState(false)
  const [showControls, setShowControls] = useState(showControls)
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
    if (videoRef.current && isLoopSegmentMode && isPlaying) {
      const video = videoRef.current
      const checkLoopSegment = () => {
        if (video.currentTime >= loopEnd) {
          video.currentTime = loopStart
        }
      }
      
      video.addEventListener('timeupdate', checkLoopSegment)
      return () => video.removeEventListener('timeupdate', checkLoopSegment)
    }
  }, [isLoopSegmentMode, loopStart, loopEnd, isPlaying])

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

  const togglePlay = () => {
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
      videoRef.current.currentTime = 0
      videoRef.current.play()
    } else if (isLoopSegmentMode) {
      videoRef.current.currentTime = loopStart
      videoRef.current.play()
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
    }
  }

  const toggleMute = () => {
    if (videoRef.current) {
      videoRef.current.muted = !isMuted
      setIsMuted(!isMuted)
    }
  }

  const handleVolumeChange = (e) => {
    const newVolume = parseFloat(e.target.value)
    if (videoRef.current) {
      videoRef.current.volume = newVolume
      setVolume(newVolume)
      setIsMuted(newVolume === 0)
    }
  }

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen()
      setIsFullscreen(true)
    } else {
      document.exitFullscreen()
      setIsFullscreen(false)
    }
  }

  const setLoopPoint = (type) => {
    if (type === 'start') {
      setLoopStart(currentTime)
    } else {
      setLoopEnd(currentTime)
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
    >
      <video
        ref={videoRef}
        src={src}
        className="w-full h-full object-contain"
        muted={isMuted}
        loop={isLoopEnabled && !isLoopSegmentMode}
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={handleLoadedMetadata}
        onEnded={handleEnded}
        onPlay={() => setIsPlaying(true)}
        onPause={() => setIsPlaying(false)}
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
                className={`p-2 rounded-full transition-colors ${
                  isLoopEnabled ? 'bg-blue-500 text-white' : 'bg-white/20 text-white hover:bg-white/30'
                }`}
                title="Bucle"
              >
                <RotateCcw className="w-4 h-4" />
              </button>

              {/* Botón de segmento A-B */}
              <button
                onClick={() => setIsLoopSegmentMode(!isLoopSegmentMode)}
                className={`p-2 rounded-full transition-colors ${
                  isLoopSegmentMode ? 'bg-green-500 text-white' : 'bg-white/20 text-white hover:bg-white/30'
                }`}
                title="Segmento A-B"
              >
                <Settings className="w-4 h-4" />
              </button>
            </div>

            <div className="flex items-center space-x-2">
              {/* Controles de volumen */}
              <div className="relative group">
                <button
                  onClick={toggleMute}
                  className="p-2 rounded-full bg-white/20 text-white hover:bg-white/30 transition-colors"
                  onMouseEnter={() => setShowVolumeSlider(true)}
                >
                  {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                </button>
                
                {showVolumeSlider && (
                  <div 
                    className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 bg-black/80 rounded-lg p-2"
                    onMouseLeave={() => setShowVolumeSlider(false)}
                  >
                    <input
                      type="range"
                      min="0"
                      max="1"
                      step="0.1"
                      value={volume}
                      onChange={handleVolumeChange}
                      className="w-20 h-2 bg-gray-600 rounded-lg appearance-none cursor-pointer"
                    />
                  </div>
                )}
              </div>

              {/* Botón de pantalla completa */}
              <button
                onClick={toggleFullscreen}
                className="p-2 rounded-full bg-white/20 text-white hover:bg-white/30 transition-colors"
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
                className="p-3 rounded-full bg-white/20 text-white hover:bg-white/30 transition-colors"
              >
                <SkipBack className="w-6 h-6" />
              </button>

              <button
                onClick={togglePlay}
                className="p-4 rounded-full bg-white/20 text-white hover:bg-white/30 transition-colors"
              >
                {isPlaying ? <Pause className="w-8 h-8" /> : <Play className="w-8 h-8" />}
              </button>

              <button
                onClick={() => skip(10)}
                className="p-3 rounded-full bg-white/20 text-white hover:bg-white/30 transition-colors"
              >
                <SkipForward className="w-6 h-6" />
              </button>
            </div>
          </div>

          {/* Controles inferiores */}
          <div className="absolute bottom-0 left-0 right-0 p-4">
            {/* Barra de progreso */}
            <div className="relative mb-4">
              <div
                className="w-full h-2 bg-white/20 rounded-full cursor-pointer"
                onClick={handleSeek}
              >
                <div
                  className="h-full bg-blue-500 rounded-full relative"
                  style={{ width: `${(currentTime / duration) * 100}%` }}
                >
                  {/* Marcadores de bucle A-B */}
                  {isLoopSegmentMode && (
                    <>
                      <div
                        className="absolute top-0 w-1 h-full bg-green-500"
                        style={{ left: `${(loopStart / duration) * 100}%` }}
                      />
                      <div
                        className="absolute top-0 w-1 h-full bg-red-500"
                        style={{ left: `${(loopEnd / duration) * 100}%` }}
                      />
                    </>
                  )}
                </div>
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
                      className="px-2 py-1 bg-green-500 rounded text-xs"
                    >
                      A: {formatTime(loopStart)}
                    </button>
                    <button
                      onClick={() => setLoopPoint('end')}
                      className="px-2 py-1 bg-red-500 rounded text-xs"
                    >
                      B: {formatTime(loopEnd)}
                    </button>
                  </div>
                )}
              </div>

              <div className="text-xs opacity-75">
                {isLoopEnabled && (isLoopSegmentMode ? 'Bucle A-B' : 'Bucle completo')}
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