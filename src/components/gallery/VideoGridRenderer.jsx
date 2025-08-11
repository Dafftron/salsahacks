import React from 'react'

const VideoGridRenderer = ({
  videos,
  cardWidth = 320,
  cardHeight = 400,
  gap = 24,
  renderCard
}) => {
  return (
    <div className="w-full">
      <div
        className="grid"
        style={{
          gridTemplateColumns: `repeat(auto-fill, minmax(${cardWidth}px, 1fr))`,
          gap
        }}
      >
        {videos.map((video, idx) => (
          <div key={video.id ?? video.videoPath ?? `video-${idx}`} style={{ height: cardHeight }}>
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


