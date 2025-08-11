import React from 'react'
import VirtualizedVideoGrid from './VirtualizedVideoGrid'
import { useContainerSize } from '../../hooks/useContainerSize'

const VideoGridRenderer = ({
  videos,
  threshold = 150,
  cardWidth = 320,
  cardHeight = 400,
  gap = 24,
  renderCard
}) => {
  const { containerRef, width, height } = useContainerSize()
  const useVirtualization = videos.length > threshold

  return (
    <div ref={containerRef} className="w-full">
      {useVirtualization ? (
        <VirtualizedVideoGrid
          videos={videos}
          containerWidth={Math.max(300, width || 0)}
          containerHeight={Math.max(400, height || 700)}
          cardWidth={cardWidth}
          cardHeight={cardHeight}
          gap={gap}
          renderCard={renderCard}
        />
      ) : (
        <div
          className="grid gap-6"
          style={{
            gridTemplateColumns: `repeat(auto-fill, minmax(${cardWidth}px, 1fr))`
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
      )}
    </div>
  )
}

export default VideoGridRenderer


