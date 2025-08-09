// 🎬 GALERÍA VIRTUALIZADA DE VIDEOS - SALSAHACKS V2.0
// Renderiza solo los videos visibles para optimizar rendimiento

import React, { useMemo, useCallback } from 'react'
import { FixedSizeGrid as Grid } from 'react-window'

const VirtualizedVideoGrid = ({ 
  videos, 
  containerWidth, 
  containerHeight = 600,
  cardWidth = 320,
  cardHeight = 400,
  gap = 24,
  renderCard 
}) => {
  
  // Calcular cuántas columnas caben en el ancho disponible
  const columnCount = useMemo(() => {
    const availableWidth = containerWidth - gap
    const totalCardWidth = cardWidth + gap
    return Math.max(1, Math.floor(availableWidth / totalCardWidth))
  }, [containerWidth, cardWidth, gap])
  
  // Calcular cuántas filas necesitamos
  const rowCount = useMemo(() => {
    return Math.ceil(videos.length / columnCount)
  }, [videos.length, columnCount])
  
  // Función para renderizar cada celda de la grilla
  const Cell = useCallback(({ columnIndex, rowIndex, style }) => {
    const videoIndex = rowIndex * columnCount + columnIndex
    const video = videos[videoIndex]
    
    // Si no hay video en esta posición, renderizar celda vacía
    if (!video) {
      return <div style={style} />
    }
    
    // Aplicar padding/gap a la celda
    const cellStyle = {
      ...style,
      left: style.left + gap / 2,
      top: style.top + gap / 2,
      width: style.width - gap,
      height: style.height - gap,
    }
    
    return (
      <div style={cellStyle}>
        {renderCard(video, videoIndex)}
      </div>
    )
  }, [videos, columnCount, gap, renderCard])
  
  // Si no hay videos, mostrar mensaje
  if (videos.length === 0) {
    return (
      <div 
        className="flex items-center justify-center text-gray-500"
        style={{ height: containerHeight }}
      >
        <div className="text-center">
          <p className="text-lg font-medium">No hay videos para mostrar</p>
          <p className="text-sm mt-2">Prueba ajustando los filtros</p>
        </div>
      </div>
    )
  }
  
  return (
    <div className="virtualized-grid-container">
      <Grid
        columnCount={columnCount}
        columnWidth={cardWidth + gap}
        height={containerHeight}
        rowCount={rowCount}
        rowHeight={cardHeight + gap}
        width={containerWidth}
        style={{
          // Centrar la grilla si hay espacio sobrante
          marginLeft: containerWidth > (columnCount * (cardWidth + gap)) 
            ? (containerWidth - (columnCount * (cardWidth + gap))) / 2 
            : 0
        }}
      >
        {Cell}
      </Grid>
      
      {/* Información de debug (solo en desarrollo) */}
      {process.env.NODE_ENV === 'development' && (
        <div className="mt-4 text-xs text-gray-400 flex gap-4">
          <span>Videos: {videos.length}</span>
          <span>Columnas: {columnCount}</span>
          <span>Filas: {rowCount}</span>
          <span>Renderizando: ~{Math.min(20, videos.length)} de {videos.length}</span>
        </div>
      )}
    </div>
  )
}

export default VirtualizedVideoGrid
