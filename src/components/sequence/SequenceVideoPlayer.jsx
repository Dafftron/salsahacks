import React, { useState, useRef, useEffect } from 'react'
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
  Download,
  Settings
} from 'lucide-react'
import { useAuth } from '../../contexts/AuthContext'

const SequenceVideoPlayer = ({ 
  videos, 
  className = '',
  showControls = true,
  autoplay = false,
  loop = false,
  muted = false
}) => {
  const { userProfile } = useAuth()
  const isSuperAdmin = userProfile?.role === 'super_admin'
  const [currentVideoIndex, setCurrentVideoIndex] = useState(0)
  const [isPlaying, setIsPlaying] = useState(false)
  const [isMuted, setIsMuted] = useState(muted)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [showControlsUI, setShowControlsUI] = useState(showControls)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [playbackRate, setPlaybackRate] = useState(1)
  const [volume, setVolume] = useState(1)
  const [showVolumeSlider, setShowVolumeSlider] = useState(false)
  const [volumeSliderTimeout, setVolumeSliderTimeout] = useState(null)
  const [isLoopEnabled, setIsLoopEnabled] = useState(false)
  const [loopStart, setLoopStart] = useState(0)
  const [loopEnd, setLoopEnd] = useState(0)
  const [isLoopSegmentMode, setIsLoopSegmentMode] = useState(false)
  const [hasPointA, setHasPointA] = useState(false)
  const [hasPointB, setHasPointB] = useState(false)
  const [savedPointA, setSavedPointA] = useState(0)
  const [savedPointB, setSavedPointB] = useState(0)
  const [controlsTimeout, setControlsTimeout] = useState(null)
  const [showSpeedMenu, setShowSpeedMenu] = useState(false)
  const [manualPlaybackSpeed, setManualPlaybackSpeed] = useState(1)
  const [useManualSpeed, setUseManualSpeed] = useState(true)
  
  const videoRef = useRef(null)
  const containerRef = useRef(null)
  
  const currentVideo = videos[currentVideoIndex]
  
  // Velocidades disponibles
  const availableSpeeds = [0.25, 0.5, 0.75, 1, 1.25, 1.5, 2]

  // Velocidad fija en 1x
  useEffect(() => {
    setPlaybackRate(1)
    if (videoRef.current) {
      videoRef.current.playbackRate = 1
    }
  }, [currentVideoIndex])



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

  // Auto-hide controls
  useEffect(() => {
    if (showControls && isPlaying) {
      if (controlsTimeout) {
        clearTimeout(controlsTimeout)
      }
      const timeout = setTimeout(() => {
        setShowControlsUI(false)
      }, 4000)
      setControlsTimeout(timeout)
    }
    return () => {
      if (controlsTimeout) {
        clearTimeout(controlsTimeout)
      }
    }
  }, [isPlaying, showControls])

  // Cleanup timeouts al desmontar
  useEffect(() => {
    return () => {
      if (controlsTimeout) clearTimeout(controlsTimeout)
      if (volumeSliderTimeout) clearTimeout(volumeSliderTimeout)
    }
  }, [])

  // Cerrar menús al hacer clic fuera
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (showSpeedMenu) {
        setShowSpeedMenu(false)
      }
    }

    document.addEventListener('click', handleClickOutside)
    return () => document.removeEventListener('click', handleClickOutside)
  }, [showSpeedMenu])

  // Función helper para activar controles
  const activateControls = () => {
    setShowControlsUI(true)
    if (controlsTimeout) {
      clearTimeout(controlsTimeout)
    }
  }

  // Handle video end
  const handleVideoEnd = () => {
    if (isLoopEnabled && !isLoopSegmentMode) {
      // Loop completo
      if (videoRef.current) {
        videoRef.current.currentTime = 0
        videoRef.current.play()
      }
    } else if (isLoopSegmentMode && hasPointA && hasPointB) {
      // Loop de segmento
      if (videoRef.current) {
        videoRef.current.currentTime = loopStart
        videoRef.current.play()
      }
    } else {
      // No cambiar automáticamente al siguiente video
      // Solo pausar el video actual
      setIsPlaying(false)
    }
  }
  
  // Handle time update
  const handleTimeUpdate = () => {
    if (videoRef.current) {
      setCurrentTime(videoRef.current.currentTime)
    }
  }
  
  // Handle loaded metadata
  const handleLoadedMetadata = () => {
    if (videoRef.current) {
      setDuration(videoRef.current.duration)
      // Aplicar velocidad manual
      videoRef.current.playbackRate = manualPlaybackSpeed
      setPlaybackRate(manualPlaybackSpeed)
    }
  }
  
  // Toggle play/pause
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
  
  // Navigate to previous video
  const goToPreviousVideo = () => {
    if (currentVideoIndex > 0) {
      setCurrentVideoIndex(prev => prev - 1)
      setCurrentTime(0)
      if (videoRef.current) {
        videoRef.current.currentTime = 0
      }
    }
  }
  
  // Navigate to next video
  const goToNextVideo = () => {
    if (currentVideoIndex < videos.length - 1) {
      setCurrentVideoIndex(prev => prev + 1)
      setCurrentTime(0)
      if (videoRef.current) {
        videoRef.current.currentTime = 0
      }
    }
  }

  // Skip function
  const skip = (seconds) => {
    if (videoRef.current) {
      const newTime = Math.max(0, Math.min(duration, currentTime + seconds))
      videoRef.current.currentTime = newTime
      setCurrentTime(newTime)
    }
  }
  
  // Toggle mute
  const toggleMute = () => {
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
  
  // Toggle fullscreen
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
  
  // Handle progress bar click
  const handleProgressClick = (e) => {
    if (videoRef.current) {
      const rect = e.currentTarget.getBoundingClientRect()
      const clickX = e.clientX - rect.left
      const percentage = clickX / rect.width
      const newTime = percentage * duration
      videoRef.current.currentTime = newTime
      setCurrentTime(newTime)
    }
  }

  const setLoopPoint = (type) => {
    if (type === 'start') {
      if (hasPointA) {
        // Si ya existe el punto A, lo quitamos
        setHasPointA(false)
        setLoopStart(0)
        // Punto A eliminado
      } else {
        // Establecer punto A
        setHasPointA(true)
        setLoopStart(currentTime)
        setSavedPointA(currentTime)
                  // Punto A establecido
      }
    } else {
      if (hasPointB) {
        // Si ya existe el punto B, lo quitamos
        setHasPointB(false)
        setLoopEnd(0)
                  // Punto B eliminado
      } else {
        // Establecer punto B
        setHasPointB(true)
        setLoopEnd(currentTime)
        setSavedPointB(currentTime)
                  // Punto B establecido
      }
    }
  }

  const formatTime = (time) => {
    const minutes = Math.floor(time / 60)
    const seconds = Math.floor(time % 60)
    return `${minutes}:${seconds.toString().padStart(2, '0')}`
  }

  const handleSpeedChange = (speed) => {
    setManualPlaybackSpeed(speed)
    if (videoRef.current) {
      videoRef.current.playbackRate = speed
      setPlaybackRate(speed)
    }
    setShowSpeedMenu(false)
  }

  const getSpeedLabel = (speed) => {
    if (speed === 1) return 'Normal'
    return `${speed}x`
  }

  // Función para descargar video
  const downloadVideo = async () => {
    try {
      if (currentVideo.videoUrl && (currentVideo.videoUrl.includes('firebase') || currentVideo.videoUrl.includes('googleapis'))) {
        
        const response = await fetch(currentVideo.videoUrl)
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`)
        }
        
        const blob = await response.blob()
        
        const blobUrl = URL.createObjectURL(blob)
        
        const link = document.createElement('a')
        link.href = blobUrl
        link.download = currentVideo.title || 'video.mp4'
        link.style.display = 'none'
        
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
        
        setTimeout(() => {
          URL.revokeObjectURL(blobUrl)
        }, 1000)
        
        // Descarga completada exitosamente
      } else {
        const link = document.createElement('a')
        link.href = currentVideo.videoUrl
        link.download = currentVideo.title || 'video.mp4'
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
  
  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyPress = (e) => {
      if (e.target.tagName === 'INPUT') return
      
      switch (e.code) {
        case 'Space':
          e.preventDefault()
          togglePlay()
          break
        case 'KeyF':
          e.preventDefault()
          toggleFullscreen()
          break
        case 'KeyM':
          e.preventDefault()
          toggleMute()
          break
        case 'ArrowLeft':
          e.preventDefault()
          if (e.ctrlKey || e.metaKey) {
            goToPreviousVideo()
          } else {
            skip(-10)
          }
          break
        case 'ArrowRight':
          e.preventDefault()
          if (e.ctrlKey || e.metaKey) {
            goToNextVideo()
          } else {
            skip(10)
          }
          break
        case 'KeyA':
          e.preventDefault()
          setLoopPoint('start')
          break
        case 'KeyB':
          e.preventDefault()
          setLoopPoint('end')
          break
        case 'KeyL':
          e.preventDefault()
          setIsLoopEnabled(!isLoopEnabled)
          break
        case 'KeyS': {
          e.preventDefault()
          // Ciclar entre velocidades
          const currentIndex = availableSpeeds.indexOf(manualPlaybackSpeed)
          const nextIndex = (currentIndex + 1) % availableSpeeds.length
          handleSpeedChange(availableSpeeds[nextIndex])
          break
        }
      }
    }
    
    document.addEventListener('keydown', handleKeyPress)
    return () => document.removeEventListener('keydown', handleKeyPress)
  }, [currentTime, duration, currentVideoIndex, isLoopEnabled, manualPlaybackSpeed])
  
  if (!currentVideo) {
    return (
      <div className={`bg-black rounded-lg flex items-center justify-center ${className}`}>
        <div className="text-white text-center">
          <p>No hay videos en la secuencia</p>
        </div>
      </div>
    )
  }
  
  return (
    <div 
      ref={containerRef}
      className={`relative bg-black rounded-lg overflow-hidden ${className}`}
      onMouseEnter={activateControls}
      onMouseLeave={() => {
        if (isPlaying) {
          const timeout = setTimeout(() => {
            setShowControlsUI(false)
          }, 4000)
          setControlsTimeout(timeout)
        }
      }}
      onTouchStart={activateControls}
      onTouchMove={activateControls}
    >
      {/* Video Element */}
      <video
        ref={videoRef}
        src={currentVideo.videoUrl}
        className="w-full h-full object-contain cursor-pointer"
        onEnded={handleVideoEnd}
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={handleLoadedMetadata}
        onPlay={() => setIsPlaying(true)}
        onPause={() => setIsPlaying(false)}
        muted={isMuted}
        autoPlay={autoplay}
        loop={false} // We handle looping manually
        onClick={activateControls}
      />
      
             {/* Video Info Overlay */}
       <div className="absolute top-2 left-2 bg-black bg-opacity-75 text-white px-3 py-2 rounded-lg text-sm">
         <div className="flex items-center space-x-2">
           <span className="font-medium">
             {currentVideoIndex + 1} / {videos.length}
           </span>
           <span className="text-gray-300">|</span>
           <span className="max-w-xs truncate">{currentVideo.title}</span>
           {playbackRate !== 1 && (
             <>
               <span className="text-gray-300">|</span>
               <span className="text-blue-400 font-medium">
                 {playbackRate.toFixed(2)}x
               </span>
             </>
           )}
         </div>
         {videos.length > 1 && (
           <div className="text-xs text-gray-400 mt-1">
             Usa Ctrl+←/→ para cambiar de video
           </div>
         )}
       </div>
      
      {/* Controls Overlay */}
      {showControlsUI && (
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent flex flex-col justify-end">
          {/* Controles superiores */}
          <div className="absolute top-0 left-0 right-0 p-4 flex justify-end items-center">
            <div className="flex items-center space-x-2">
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
              {/* Botón de video anterior */}
              <button
                onClick={goToPreviousVideo}
                disabled={currentVideoIndex === 0}
                className={`p-2 rounded-full transition-colors z-10 ${
                  currentVideoIndex === 0 
                    ? 'bg-gray-600 text-gray-400 cursor-not-allowed' 
                    : 'bg-black/60 text-white hover:bg-black/80'
                }`}
                title="Video anterior (Ctrl+←)"
              >
                <div className="flex items-center space-x-1">
                  <div className="w-3 h-3 rounded-full border-2 border-current flex items-center justify-center">
                    <SkipBack className="w-1.5 h-1.5" />
                  </div>
                  <span className="text-xs font-medium">Anterior</span>
                </div>
              </button>

              {/* Botón de retroceder 10s */}
              <button
                onClick={() => skip(-10)}
                className="p-3 rounded-full bg-black/60 text-white hover:bg-black/80 transition-colors z-10 hidden md:flex items-center justify-center"
                title="Retroceder 10s (←)"
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
                className="p-4 rounded-full bg-white/20 text-white hover:bg-white/30 transition-colors z-10"
                title="Play/Pause (Espacio)"
              >
                {isPlaying ? <Pause className="w-8 h-8" /> : <Play className="w-8 h-8" />}
              </button>

              {/* Botón de adelantar 10s */}
              <button
                onClick={() => skip(10)}
                className="p-3 rounded-full bg-black/60 text-white hover:bg-black/80 transition-colors z-10 hidden md:flex items-center justify-center"
                title="Adelantar 10s (→)"
              >
                <div className="flex items-center space-x-1">
                  <span className="text-sm font-medium">10</span>
                  <div className="w-6 h-6 rounded-full border-2 border-white flex items-center justify-center">
                    <SkipForward className="w-3 h-3" />
                  </div>
                </div>
              </button>

              {/* Botón de siguiente video */}
              <button
                onClick={goToNextVideo}
                disabled={currentVideoIndex === videos.length - 1}
                className={`p-2 rounded-full transition-colors z-10 ${
                  currentVideoIndex === videos.length - 1 
                    ? 'bg-gray-600 text-gray-400 cursor-not-allowed' 
                    : 'bg-black/60 text-white hover:bg-black/80'
                }`}
                title="Siguiente video (Ctrl+→)"
              >
                <div className="flex items-center space-x-1">
                  <span className="text-xs font-medium">Siguiente</span>
                  <div className="w-3 h-3 rounded-full border-2 border-current flex items-center justify-center">
                    <SkipForward className="w-1.5 h-1.5" />
                  </div>
                </div>
              </button>
            </div>
          </div>

          {/* Controles inferiores */}
          <div className="absolute bottom-0 left-0 right-0 p-4">
            {/* Controles de volumen, bucle, A-B y velocidades */}
            <div className="flex justify-end mb-2 space-x-2">
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
                    setHasPointA(false)
                    setHasPointB(false)
                    setLoopStart(0)
                    setLoopEnd(0)
                  } else {
                    if (savedPointA > 0) {
                      setHasPointA(true)
                      setLoopStart(savedPointA)
                    }
                    if (savedPointB > 0) {
                      setHasPointB(true)
                      setLoopEnd(savedPointB)
                    }
                  }
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

              {/* Botón de velocidades */}
              <div className="relative">
                <button
                  onClick={() => setShowSpeedMenu(!showSpeedMenu)}
                  className="p-2 rounded-full bg-white/20 text-white hover:bg-white/30 transition-colors z-10"
                  title="Velocidad de reproducción"
                >
                                     <div className="flex items-center justify-center w-4 h-4 text-[10px] font-bold leading-none">
                     {manualPlaybackSpeed === 1 ? '1x' : `${manualPlaybackSpeed}x`}
                   </div>
                </button>
                
                                 {showSpeedMenu && (
                   <div className="absolute bottom-full right-0 mb-2 bg-black/90 rounded-lg p-2 z-20 min-w-[80px]">
                     {availableSpeeds.map((speed) => (
                       <button
                         key={speed}
                         onClick={() => handleSpeedChange(speed)}
                         className={`w-full text-left px-3 py-1 rounded text-xs transition-colors ${
                           manualPlaybackSpeed === speed 
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

              {/* Botón de descarga (solo Super Admin) */}
              {isSuperAdmin && (
                <button
                  onClick={downloadVideo}
                  className="p-2 rounded-full bg-white/20 text-white hover:bg-white/30 transition-colors z-10"
                  title="Descargar video"
                >
                  <Download className="w-4 h-4" />
                </button>
              )}

              {/* Controles de volumen */}
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
                onClick={handleProgressClick}
              >
                <div
                  className="h-full bg-blue-500 rounded-full"
                  style={{ width: `${(currentTime / duration) * 100}%` }}
                />
                
                {/* Marcadores de bucle A-B */}
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
                {playbackRate !== 1 && (
                  <span className="text-blue-400 font-medium">
                    {playbackRate.toFixed(2)}x
                  </span>
                )}
                
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

            {/* Indicador de progreso de la secuencia */}
            {videos.length > 1 && (
              <div className="mt-2">
                <div className="flex items-center justify-between text-xs text-gray-300 mb-1">
                  <span>Progreso de la secuencia</span>
                  <span>{currentVideoIndex + 1} de {videos.length}</span>
                </div>
                <div className="w-full h-1 bg-gray-600 rounded-full">
                  <div 
                    className="h-full bg-blue-500 rounded-full transition-all duration-300"
                    style={{ width: `${((currentVideoIndex + 1) / videos.length) * 100}%` }}
                  />
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

export default SequenceVideoPlayer
