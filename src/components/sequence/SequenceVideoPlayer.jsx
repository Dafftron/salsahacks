import React, { useState, useRef, useEffect } from 'react'
import { Play, Pause, Volume2, VolumeX, RotateCcw, RotateCw, Maximize, Minimize, SkipBack, SkipForward } from 'lucide-react'

const SequenceVideoPlayer = ({ 
  videos, 
  currentBPM = null,
  className = '',
  showControls = true,
  autoplay = false,
  loop = false,
  muted = false
}) => {
  const [currentVideoIndex, setCurrentVideoIndex] = useState(0)
  const [isPlaying, setIsPlaying] = useState(false)
  const [isMuted, setIsMuted] = useState(muted)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [showControlsUI, setShowControlsUI] = useState(showControls)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [playbackRate, setPlaybackRate] = useState(1)
  
  const videoRef = useRef(null)
  const containerRef = useRef(null)
  const controlsTimeoutRef = useRef(null)
  
  const currentVideo = videos[currentVideoIndex]
  
  // Calcular velocidad de reproducción basada en BPM
  useEffect(() => {
    if (currentBPM && currentVideo?.bpm) {
      const targetBPM = currentBPM
      const videoBPM = currentVideo.bpm
      const newPlaybackRate = targetBPM / videoBPM
      
      console.log(`🎵 Ajustando velocidad: ${videoBPM} BPM → ${targetBPM} BPM = ${newPlaybackRate.toFixed(2)}x`)
      setPlaybackRate(newPlaybackRate)
      
      if (videoRef.current) {
        videoRef.current.playbackRate = newPlaybackRate
      }
    } else {
      setPlaybackRate(1)
      if (videoRef.current) {
        videoRef.current.playbackRate = 1
      }
    }
  }, [currentBPM, currentVideo?.bpm, currentVideoIndex])
  
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
  
  // Handle video end
  const handleVideoEnd = () => {
    if (currentVideoIndex < videos.length - 1) {
      // Play next video
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
      // Aplicar velocidad de reproducción
      if (currentBPM && currentVideo?.bpm) {
        const targetBPM = currentBPM
        const videoBPM = currentVideo.bpm
        const newPlaybackRate = targetBPM / videoBPM
        videoRef.current.playbackRate = newPlaybackRate
        setPlaybackRate(newPlaybackRate)
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
          } else if (videoRef.current) {
            videoRef.current.currentTime = Math.max(0, currentTime - 10)
          }
          break
        case 'ArrowRight':
          e.preventDefault()
          if (e.ctrlKey || e.metaKey) {
            goToNextVideo()
          } else if (videoRef.current) {
            videoRef.current.currentTime = Math.min(duration, currentTime + 10)
          }
          break
      }
    }
    
    document.addEventListener('keydown', handleKeyPress)
    return () => document.removeEventListener('keydown', handleKeyPress)
  }, [currentTime, duration, currentVideoIndex])
  
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
        src={currentVideo.videoUrl}
        className="w-full h-full object-contain"
        onEnded={handleVideoEnd}
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={handleLoadedMetadata}
        onPlay={() => setIsPlaying(true)}
        onPause={() => setIsPlaying(false)}
        muted={isMuted}
        autoPlay={autoplay}
        loop={false} // We handle looping manually
      />
      
      {/* Video Info Overlay */}
      <div className="absolute top-2 left-2 bg-black bg-opacity-75 text-white px-2 py-1 rounded text-sm">
        {currentVideoIndex + 1} / {videos.length} - {currentVideo.title}
        {playbackRate !== 1 && (
          <span className="ml-2 text-yellow-400">
            {playbackRate > 1 ? '⏩' : '⏪'} {playbackRate.toFixed(2)}x
          </span>
        )}
      </div>
      
      {/* Controls Overlay */}
      {showControlsUI && (
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent flex flex-col justify-end">
          {/* Progress Bar */}
          <div className="px-4 pb-2">
            <div 
              className="w-full h-1 bg-gray-600 rounded-full cursor-pointer relative"
              onClick={handleProgressClick}
            >
              <div 
                className="h-full bg-red-500 rounded-full transition-all duration-100"
                style={{ width: `${(currentTime / duration) * 100}%` }}
              />
            </div>
          </div>
          
          {/* Controls */}
          <div className="px-4 pb-4 flex items-center justify-between">
            <div className="flex items-center space-x-4">
              {/* Previous Video */}
              <button
                onClick={goToPreviousVideo}
                disabled={currentVideoIndex === 0}
                className={`text-white hover:text-gray-300 transition-colors ${currentVideoIndex === 0 ? 'opacity-50 cursor-not-allowed' : ''}`}
                title="Video anterior (Ctrl+←)"
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
                title="Siguiente video (Ctrl+→)"
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
                {Math.floor(currentTime)}s / {Math.floor(duration)}s
              </span>
            </div>
            
            <div className="flex items-center space-x-4">
              {/* BPM Info */}
              {currentBPM && (
                <div className="flex items-center space-x-2">
                  <span className="text-white text-sm bg-purple-600 px-2 py-1 rounded">
                    {currentBPM} BPM
                  </span>
                  {playbackRate !== 1 && (
                    <span className="text-white text-sm bg-yellow-600 px-2 py-1 rounded">
                      {playbackRate > 1 ? '⏩' : '⏪'} {playbackRate.toFixed(2)}x
                    </span>
                  )}
                </div>
              )}
              
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

export default SequenceVideoPlayer
