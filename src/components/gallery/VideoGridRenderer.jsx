import React from 'react'

const VideoGridRenderer = ({
  videos,
  cardWidth = 320,
  cardHeight = 400,
  gap = 24,
  renderCard
}) => {
  // Ajuste responsivo: en pantallas pequeñas, permitir que la columna sea 100% y la altura se adapte
  const gridTemplate = `repeat(auto-fill, minmax(min(100%, ${cardWidth}px), 1fr))`

  return (
    <div className="w-full">
      <div
        className="grid"
        style={{
          gridTemplateColumns: gridTemplate,
          gap
        }}
      >
        {videos.map((video, idx) => (
          <div
            key={video.id ?? video.videoPath ?? `video-${idx}`}
            style={{
              height: typeof window !== 'undefined' && window.innerWidth < 480 ? 'auto' : cardHeight,
            }}
          >
            <div style={{ height: '100%', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
              {renderCard(video, idx)}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default VideoGridRenderer


