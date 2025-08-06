import React, { useState, useRef, useEffect } from 'react'
import { Play, Pause, Volume2, VolumeX, Maximize, Minimize } from 'lucide-react'

const SequenceTimeline = ({ 
  videos, 
  className = '',
  showControls = true,
  autoplay = false,
  loop = false,
  muted = false
}) => {
  const [isPlaying, setIsPlaying] = useState(false)
  const [isMuted, setIsMuted] = useState(muted)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [showControlsUI, setShowControlsUI] = useState(showControls)
  const [currentTime, setCurrentTime] = useState(0)
  const [totalDuration, setTotalDuration] = useState(0)
  const [currentVideoIndex, setCurrentVideoIndex] = useState(0)
  const [videoStartTimes, setVideoStartTimes] = useState([])
  const [videoDurations, setVideoDurations] = useState([])
  
  const videoRef = useRef(null)
  const containerRef = useRef(null)
  const timelineRef = useRef(null)
  const controlsTimeoutRef = useRef(null)
  
  // Calcular duración total y tiempos de inicio de cada video
  useEffect(() => {
    if (videos.length > 0) {
      let total = 0
      const startTimes = [0]
      const durations = []
      
      videos.forEach((video, index) => {
        const duration = video.duration || 0
        durations.push(duration)
        
        if (index < videos.length - 1) {
          total += duration
          startTimes.push(total)
        }
      })
      
      // Añadir la duración del último video
      if (videos.length > 0) {
        total += videos[videos.length - 1].duration || 0
      }
      
      setTotalDuration(total)
      setVideoStartTimes(startTimes)
      setVideoDurations(durations)
    }
  }, [videos])
  
  // Determinar qué video está reproduciéndose basado en el tiempo actual
  useEffect(() => {
    if (videoStartTimes.length > 0) {
      for (let i = videoStartTimes.length - 1; i >= 0; i--) {
        if (currentTime >= videoStartTimes[i]) {
          if (i !== currentVideoIndex) {
            setCurrentVideoIndex(i)
            // Cambiar el video que se está reproduciendo
            if (videoRef.current) {
              const videoTime = currentTime - videoStartTimes[i]
              videoRef.current.src = videos[i].videoUrl
              videoRef.current.currentTime = videoTime
            }
          }
          break
        }
      }
    }
  }, [currentTime, videoStartTimes, currentVideoIndex, videos])
  
  // Auto-hide controls
  useEffect(() => {
    if (showControls && isPlaying) {
      if (controlsTimeoutRef.current) {
        clearTimeout(controlsTimeoutRef.current)
      }
      controlsTimeoutRef.current = setTimeout(() => {
        setShowControlsUI(false)
      }, 4000)
    }
    return () => {
      if (controlsTimeoutRef.current) {
        clearTimeout(controlsTimeoutRef.current)
      }
    }
  }, [isPlaying, showControls])
  
  // Handle time update del video actual
  const handleTimeUpdate = () => {
    if (videoRef.current) {
      const videoTime = videoRef.current.currentTime
      const globalTime = videoStartTimes[currentVideoIndex] + videoTime
      setCurrentTime(globalTime)
    }
  }
  
  // Handle video end
  const handleVideoEnd = () => {
    if (currentVideoIndex < videos.length - 1) {
      // Play next video
      setCurrentVideoIndex(prev => prev + 1)
      setCurrentTime(videoStartTimes[currentVideoIndex + 1])
    } else if (loop) {
      // Loop back to first video
      setCurrentVideoIndex(0)
      setCurrentTime(0)
    } else {
      // Stop at last video
      setIsPlaying(false)
    }
  }
  
  // Handle loaded metadata
  const handleLoadedMetadata = () => {
    if (videoRef.current) {
      // Aplicar el tiempo correcto al video actual
      const videoStartTime = videoStartTimes[currentVideoIndex] || 0
      const videoTime = currentTime - videoStartTime
      if (videoTime > 0) {
        videoRef.current.currentTime = videoTime
      }
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
  
  // Toggle mute
  const toggleMute = () => {
    if (videoRef.current) {
      videoRef.current.muted = !isMuted
      setIsMuted(!isMuted)
    }
  }
  
  // Toggle fullscreen
  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      containerRef.current?.requestFullscreen()
      setIsFullscreen(true)
    } else {
      document.exitFullscreen()
      setIsFullscreen(false)
    }
  }
  
  // Handle timeline click
  const handleTimelineClick = (e) => {
    if (timelineRef.current) {
      const rect = timelineRef.current.getBoundingClientRect()
      const clickX = e.clientX - rect.left
      const percentage = clickX / rect.width
      const newTime = percentage * totalDuration
      
      setCurrentTime(newTime)
      
      // Encontrar el video correspondiente y establecer su tiempo
      for (let i = videoStartTimes.length - 1; i >= 0; i--) {
        if (newTime >= videoStartTimes[i]) {
          setCurrentVideoIndex(i)
          if (videoRef.current) {
            const videoTime = newTime - videoStartTimes[i]
            videoRef.current.src = videos[i].videoUrl
            videoRef.current.currentTime = videoTime
          }
          break
        }
      }
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
          if (videoRef.current) {
            const newTime = Math.max(0, currentTime - 10)
            setCurrentTime(newTime)
            // Ajustar el video actual
            for (let i = videoStartTimes.length - 1; i >= 0; i--) {
              if (newTime >= videoStartTimes[i]) {
                setCurrentVideoIndex(i)
                const videoTime = newTime - videoStartTimes[i]
                videoRef.current.currentTime = videoTime
                break
              }
            }
          }
          break
        case 'ArrowRight':
          e.preventDefault()
          if (videoRef.current) {
            const newTime = Math.min(totalDuration, currentTime + 10)
            setCurrentTime(newTime)
            // Ajustar el video actual
            for (let i = videoStartTimes.length - 1; i >= 0; i--) {
              if (newTime >= videoStartTimes[i]) {
                setCurrentVideoIndex(i)
                const videoTime = newTime - videoStartTimes[i]
                videoRef.current.currentTime = videoTime
                break
              }
            }
          }
          break
      }
    }
    
    document.addEventListener('keydown', handleKeyPress)
    return () => document.removeEventListener('keydown', handleKeyPress)
  }, [currentTime, totalDuration, videoStartTimes])
  
  // Formatear tiempo
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60)
    const secs = Math.floor(seconds % 60)
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }
  
  if (videos.length === 0) {
    return (
      <div className={`bg-black rounded-lg flex items-center justify-center ${className}`}>
        <div className="text-white text-center">
          <p>No hay videos en la secuencia</p>
        </div>
      </div>
    )
  }
  
  const currentVideo = videos[currentVideoIndex]
  
  return (
    <div 
      ref={containerRef}
      className={`relative bg-black rounded-lg overflow-hidden ${className}`}
      onMouseEnter={() => setShowControlsUI(true)}
      onMouseLeave={() => {
        if (isPlaying) {
          setShowControlsUI(false)
        }
      }}
    >
      {/* Video Element - Reproducción real */}
      <video
        ref={videoRef}
        src={currentVideo?.videoUrl}
        className="w-full h-full object-contain"
        onEnded={handleVideoEnd}
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={handleLoadedMetadata}
        onPlay={() => setIsPlaying(true)}
        onPause={() => setIsPlaying(false)}
        muted={isMuted}
        autoPlay={autoplay}
        loop={false}
      />
      
      {/* Video Info Overlay */}
      <div className="absolute top-2 left-2 bg-black bg-opacity-75 text-white px-2 py-1 rounded text-sm">
        {currentVideoIndex + 1} / {videos.length} - {currentVideo?.title}
      </div>
      
      {/* Timeline mejorado estilo CapCut */}
      <div className="absolute bottom-16 left-0 right-0 px-4">
        <div 
          ref={timelineRef}
          className="w-full h-16 bg-gray-800 rounded-lg cursor-pointer relative"
          onClick={handleTimelineClick}
        >
          {/* Video clips con thumbnails */}
          <div className="absolute inset-0 flex">
            {videos.map((video, index) => {
              const startTime = videoStartTimes[index] || 0
              const endTime = index < videos.length - 1 ? videoStartTimes[index + 1] : totalDuration
              const width = ((endTime - startTime) / totalDuration) * 100
              const left = (startTime / totalDuration) * 100
              
              return (
                <div
                  key={video.id}
                  className="absolute h-full border-r border-gray-600 relative"
                  style={{
                    left: `${left}%`,
                    width: `${width}%`
                  }}
                >
                  {/* Thumbnail del video */}
                  <div className="absolute inset-0 bg-gradient-to-br from-teal-500 to-teal-600">
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="w-full h-full bg-gray-700 flex items-center justify-center relative">
                        {/* Intentar mostrar thumbnail real */}
                        {video.thumbnailUrl && (
                          <img 
                            src={video.thumbnailUrl} 
                            alt={video.title}
                            className="w-full h-full object-cover opacity-75"
                            onError={(e) => {
                              e.target.style.display = 'none'
                              e.target.nextSibling.style.display = 'flex'
                            }}
                          />
                        )}
                        <div className="absolute inset-0 flex items-center justify-center text-white text-xs font-medium px-1 text-center bg-black bg-opacity-50">
                          {video.title}
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  {/* Indicador de tiempo */}
                  <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-75 text-white text-xs px-1 py-0.5">
                    {formatTime(startTime)} - {formatTime(endTime)}
                  </div>
                  
                  {/* Separador entre clips */}
                  {index < videos.length - 1 && (
                    <div className="absolute right-0 top-0 bottom-0 w-1 bg-white z-5"></div>
                  )}
                </div>
              )
            })}
          </div>
          
          {/* Playhead mejorado */}
          <div 
            className="absolute top-0 bottom-0 w-1 bg-white z-10 shadow-lg"
            style={{
              left: `${(currentTime / totalDuration) * 100}%`
            }}
          >
            <div className="absolute -top-2 -left-2 w-5 h-5 bg-white rounded-full shadow-lg flex items-center justify-center">
              <div className="w-2 h-2 bg-gray-800 rounded-full"></div>
            </div>
          </div>
          
          {/* Marcadores de tiempo */}
          <div className="absolute -top-6 left-0 right-0 flex justify-between text-white text-xs">
            {videos.map((video, index) => {
              const startTime = videoStartTimes[index] || 0
              const left = (startTime / totalDuration) * 100
              return (
                <div
                  key={video.id}
                  className="absolute transform -translate-x-1/2"
                  style={{ left: `${left}%` }}
                >
                  {formatTime(startTime)}
                </div>
              )
            })}
            <div className="absolute right-0 transform translate-x-1/2">
              {formatTime(totalDuration)}
            </div>
          </div>
        </div>
      </div>
      
      {/* Controls Overlay */}
      {showControlsUI && (
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent flex flex-col justify-end">
          {/* Controls */}
          <div className="px-4 pb-4 flex items-center justify-between">
            <div className="flex items-center space-x-4">
              {/* Play/Pause */}
              <button
                onClick={togglePlay}
                className="text-white hover:text-gray-300 transition-colors"
              >
                {isPlaying ? <Pause className="h-6 w-6" /> : <Play className="h-6 w-6" />}
              </button>
              
              {/* Mute */}
              <button
                onClick={toggleMute}
                className="text-white hover:text-gray-300 transition-colors"
              >
                {isMuted ? <VolumeX className="h-5 w-5" /> : <Volume2 className="h-5 w-5" />}
              </button>
              
              {/* Time Display */}
              <span className="text-white text-sm">
                {formatTime(currentTime)} / {formatTime(totalDuration)}
              </span>
            </div>
            
            <div className="flex items-center space-x-4">
              {/* Fullscreen */}
              <button
                onClick={toggleFullscreen}
                className="text-white hover:text-gray-300 transition-colors"
              >
                {isFullscreen ? <Minimize className="h-5 w-5" /> : <Maximize className="h-5 w-5" />}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default SequenceTimeline
