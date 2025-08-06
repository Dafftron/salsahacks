import React, { useState, useRef, useEffect } from 'react'
import { Play, Pause, Volume2, VolumeX, Maximize, Minimize, SkipBack, SkipForward } from 'lucide-react'

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
  const [currentVideoIndex, setCurrentVideoIndex] = useState(0)
  const [currentTime, setCurrentTime] = useState(0)
  const [totalDuration, setTotalDuration] = useState(0)
  
  const videoRef = useRef(null)
  const containerRef = useRef(null)
  const controlsTimeoutRef = useRef(null)
  
  // Calcular duración total
  useEffect(() => {
    if (videos.length > 0) {
      const total = videos.reduce((sum, video) => sum + (video.duration || 0), 0)
      setTotalDuration(total)
    }
  }, [videos])
  
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
  
  // Handle time update
  const handleTimeUpdate = () => {
    if (videoRef.current) {
      setCurrentTime(videoRef.current.currentTime)
    }
  }
  
  // Handle video end - reproducir siguiente automáticamente
  const handleVideoEnd = () => {
    if (currentVideoIndex < videos.length - 1) {
      // Play next video automáticamente
      setCurrentVideoIndex(prev => prev + 1)
      setCurrentTime(0)
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
      setCurrentTime(0)
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
  
  // Navegar al video anterior
  const goToPreviousVideo = () => {
    if (currentVideoIndex > 0) {
      setCurrentVideoIndex(prev => prev - 1)
      setCurrentTime(0)
    }
  }
  
  // Navegar al siguiente video
  const goToNextVideo = () => {
    if (currentVideoIndex < videos.length - 1) {
      setCurrentVideoIndex(prev => prev + 1)
      setCurrentTime(0)
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
            videoRef.current.currentTime = newTime
          }
          break
        case 'ArrowRight':
          e.preventDefault()
          if (videoRef.current) {
            const newTime = Math.min(videoRef.current.duration, currentTime + 10)
            videoRef.current.currentTime = newTime
          }
          break
        case 'KeyA':
          e.preventDefault()
          goToPreviousVideo()
          break
        case 'KeyD':
          e.preventDefault()
          goToNextVideo()
          break
      }
    }
    
    document.addEventListener('keydown', handleKeyPress)
    return () => document.removeEventListener('keydown', handleKeyPress)
  }, [currentTime, currentVideoIndex])
  
  // Formatear tiempo
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60)
    const secs = Math.floor(seconds % 60)
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }
  
  // Obtener tiempo global actual
  const getCurrentGlobalTime = () => {
    let globalTime = 0
    for (let i = 0; i < currentVideoIndex; i++) {
      globalTime += videos[i].duration || 0
    }
    return globalTime + currentTime
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
  const currentGlobalTime = getCurrentGlobalTime()
  
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
      {/* Video Element */}
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
      
      {/* Progress Bar Simple */}
      <div className="absolute bottom-16 left-0 right-0 px-4">
        <div className="w-full h-2 bg-gray-800 rounded-full relative">
          {/* Progress Fill */}
          <div 
            className="h-full bg-blue-500 rounded-full transition-all duration-300"
            style={{
              width: `${(currentGlobalTime / totalDuration) * 100}%`
            }}
          />
          
          {/* Progress Text */}
          <div className="absolute -top-6 left-0 right-0 flex justify-between text-white text-xs">
            <div>{formatTime(currentGlobalTime)}</div>
            <div>{formatTime(totalDuration)}</div>
          </div>
        </div>
      </div>
      
      {/* Controls Overlay */}
      {showControlsUI && (
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent flex flex-col justify-end">
          {/* Controls */}
          <div className="px-4 pb-4 flex items-center justify-between">
            <div className="flex items-center space-x-4">
              {/* Previous Video */}
              <button
                onClick={goToPreviousVideo}
                disabled={currentVideoIndex === 0}
                className={`text-white hover:text-gray-300 transition-colors ${currentVideoIndex === 0 ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                <SkipBack className="h-5 w-5" />
              </button>
              
              {/* Play/Pause */}
              <button
                onClick={togglePlay}
                className="text-white hover:text-gray-300 transition-colors"
              >
                {isPlaying ? <Pause className="h-6 w-6" /> : <Play className="h-6 w-6" />}
              </button>
              
              {/* Next Video */}
              <button
                onClick={goToNextVideo}
                disabled={currentVideoIndex === videos.length - 1}
                className={`text-white hover:text-gray-300 transition-colors ${currentVideoIndex === videos.length - 1 ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                <SkipForward className="h-5 w-5" />
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
                {formatTime(currentTime)} / {formatTime(currentVideo.duration || 0)} | {formatTime(currentGlobalTime)} / {formatTime(totalDuration)}
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
