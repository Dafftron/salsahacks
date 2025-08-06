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
  const [videoElements, setVideoElements] = useState([])
  
  const containerRef = useRef(null)
  const timelineRef = useRef(null)
  const controlsTimeoutRef = useRef(null)
  
  // Calcular duración total y tiempos de inicio de cada video
  useEffect(() => {
    if (videos.length > 0) {
      let total = 0
      const startTimes = [0]
      
      videos.forEach((video, index) => {
        if (index < videos.length - 1) {
          total += video.duration || 0
          startTimes.push(total)
        }
      })
      
      // Añadir la duración del último video
      if (videos.length > 0) {
        total += videos[videos.length - 1].duration || 0
      }
      
      setTotalDuration(total)
      setVideoStartTimes(startTimes)
    }
  }, [videos])
  
  // Crear elementos de video combinados
  useEffect(() => {
    if (videos.length > 0) {
      const elements = videos.map((video, index) => {
        const videoElement = document.createElement('video')
        videoElement.src = video.videoUrl
        videoElement.muted = true
        videoElement.preload = 'metadata'
        return videoElement
      })
      setVideoElements(elements)
    }
  }, [videos])
  
  // Determinar qué video está reproduciéndose basado en el tiempo actual
  useEffect(() => {
    if (videoStartTimes.length > 0) {
      for (let i = videoStartTimes.length - 1; i >= 0; i--) {
        if (currentTime >= videoStartTimes[i]) {
          if (i !== currentVideoIndex) {
            setCurrentVideoIndex(i)
          }
          break
        }
      }
    }
  }, [currentTime, videoStartTimes, currentVideoIndex])
  
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
  
  // Simular reproducción de video combinado
  useEffect(() => {
    let interval
    if (isPlaying && totalDuration > 0) {
      interval = setInterval(() => {
        setCurrentTime(prev => {
          const newTime = prev + 0.1
          if (newTime >= totalDuration) {
            setIsPlaying(false)
            return 0
          }
          return newTime
        })
      }, 100)
    }
    return () => clearInterval(interval)
  }, [isPlaying, totalDuration])
  
  // Toggle play/pause
  const togglePlay = () => {
    setIsPlaying(!isPlaying)
  }
  
  // Toggle mute
  const toggleMute = () => {
    setIsMuted(!isMuted)
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
          const newTimeLeft = Math.max(0, currentTime - 10)
          setCurrentTime(newTimeLeft)
          break
        case 'ArrowRight':
          e.preventDefault()
          const newTimeRight = Math.min(totalDuration, currentTime + 10)
          setCurrentTime(newTimeRight)
          break
      }
    }
    
    document.addEventListener('keydown', handleKeyPress)
    return () => document.removeEventListener('keydown', handleKeyPress)
  }, [currentTime, totalDuration])
  
  // Formatear tiempo
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60)
    const secs = Math.floor(seconds % 60)
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }
  
  // Obtener el video actual basado en el tiempo
  const getCurrentVideo = () => {
    if (videos.length === 0) return null
    
    for (let i = videoStartTimes.length - 1; i >= 0; i--) {
      if (currentTime >= videoStartTimes[i]) {
        return videos[i]
      }
    }
    return videos[0]
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
  
  const currentVideo = getCurrentVideo()
  
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
      {/* Video Element - Mostrar el video actual */}
      <video
        src={currentVideo?.videoUrl}
        className="w-full h-full object-contain"
        muted={isMuted}
        autoPlay={false}
        loop={false}
        style={{
          objectPosition: 'center',
          objectFit: 'contain'
        }}
      />
      
      {/* Video Info Overlay */}
      <div className="absolute top-2 left-2 bg-black bg-opacity-75 text-white px-2 py-1 rounded text-sm">
        {formatTime(currentTime)} / {formatTime(totalDuration)}
      </div>
      
      {/* Timeline mejorado estilo CapCut */}
      <div className="absolute bottom-16 left-0 right-0 px-4">
        <div 
          ref={timelineRef}
          className="w-full h-12 bg-gray-800 rounded-lg cursor-pointer relative"
          onClick={handleTimelineClick}
        >
          {/* Video clips con mejor visualización */}
          <div className="absolute inset-0 flex">
            {videos.map((video, index) => {
              const startTime = videoStartTimes[index] || 0
              const endTime = index < videos.length - 1 ? videoStartTimes[index + 1] : totalDuration
              const width = ((endTime - startTime) / totalDuration) * 100
              const left = (startTime / totalDuration) * 100
              
              return (
                <div
                  key={video.id}
                  className="absolute h-full bg-gradient-to-r from-teal-500 to-teal-600 border-r border-teal-700"
                  style={{
                    left: `${left}%`,
                    width: `${width}%`
                  }}
                >
                  {/* Thumbnail del video */}
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-full h-full bg-gray-700 flex items-center justify-center">
                      <span className="text-white text-xs font-medium px-1 text-center">
                        {video.title}
                      </span>
                    </div>
                  </div>
                  
                  {/* Indicador de tiempo */}
                  <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-50 text-white text-xs px-1 py-0.5">
                    {formatTime(startTime)} - {formatTime(endTime)}
                  </div>
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
