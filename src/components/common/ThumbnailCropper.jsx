import React, { useEffect, useRef, useState, forwardRef, useImperativeHandle } from 'react'

// Editor simple para recortar por paneo/zoom manteniendo relación de aspecto
// - Cubre el contenedor (tipo background-size: cover)
// - Permite arrastrar para panear y usar slider para zoom
// - Expuesta API getCroppedBlob() vía ref para obtener el recorte como Blob

const clamp = (value, min, max) => Math.min(Math.max(value, min), max)

const ThumbnailCropper = forwardRef(({ imageSrc, aspectRatio = 16 / 9, width = 360, height: forcedHeight = null }, ref) => {
  const containerRef = useRef(null)
  const imgRef = useRef(null)
  const [container, setContainer] = useState({ width: width, height: forcedHeight || Math.round(width / aspectRatio) })
  const [natural, setNatural] = useState({ width: 0, height: 0 })
  const [baseScale, setBaseScale] = useState(1)
  const [zoom, setZoom] = useState(1) // 1..5
  const [offset, setOffset] = useState({ x: 0, y: 0 })
  const dragRef = useRef({ dragging: false, startX: 0, startY: 0, startOffsetX: 0, startOffsetY: 0 })

  // Calcular dimensiones naturales y baseScale (cover)
  useEffect(() => {
    if (!imageSrc) return
    const img = new Image()
    img.onload = () => {
      const nat = { width: img.naturalWidth, height: img.naturalHeight }
      setNatural(nat)
      const cont = { width: container.width, height: container.height }
      // Partir SIEMPRE mostrando el frame completo (fit/contain)
      const scaleFit = Math.min(cont.width / nat.width, cont.height / nat.height)
      setBaseScale(scaleFit)
      setZoom(1)
      setOffset({ x: 0, y: 0 })
    }
    img.src = imageSrc
  }, [imageSrc, container.width, container.height])

  // Restricción de paneo para no dejar espacios vacíos
  const getDisplaySize = () => {
    const displayWidth = natural.width * baseScale * zoom
    const displayHeight = natural.height * baseScale * zoom
    return { displayWidth, displayHeight }
  }

  const clampOffset = (x, y) => {
    const { displayWidth, displayHeight } = getDisplaySize()
    const maxX = Math.max(0, (displayWidth - container.width) / 2)
    const maxY = Math.max(0, (displayHeight - container.height) / 2)
    return { x: clamp(x, -maxX, maxX), y: clamp(y, -maxY, maxY) }
  }

  const handlePointerDown = (e) => {
    e.preventDefault()
    dragRef.current = {
      dragging: true,
      startX: e.clientX || (e.touches && e.touches[0]?.clientX) || 0,
      startY: e.clientY || (e.touches && e.touches[0]?.clientY) || 0,
      startOffsetX: offset.x,
      startOffsetY: offset.y
    }
    window.addEventListener('pointermove', handlePointerMove)
    window.addEventListener('pointerup', handlePointerUp)
  }

  const handlePointerMove = (e) => {
    if (!dragRef.current.dragging) return
    const x = e.clientX
    const y = e.clientY
    const dx = x - dragRef.current.startX
    const dy = y - dragRef.current.startY
    const next = clampOffset(dragRef.current.startOffsetX + dx, dragRef.current.startOffsetY + dy)
    setOffset(next)
  }

  const handlePointerUp = () => {
    dragRef.current.dragging = false
    window.removeEventListener('pointermove', handlePointerMove)
    window.removeEventListener('pointerup', handlePointerUp)
  }

  const handleWheel = (e) => {
    e.preventDefault()
    const delta = e.deltaY > 0 ? -0.05 : 0.05
    const nextZoom = clamp(parseFloat((zoom + delta).toFixed(2)), 1, 5)
    setZoom(nextZoom)
    // Re-clamp offset al cambiar zoom
    setOffset((prev) => clampOffset(prev.x, prev.y))
  }

  // Exponer método para obtener blob recortado
  useImperativeHandle(ref, () => ({
    getCroppedBlob: (type = 'image/jpeg', quality = 0.95) => {
      return new Promise((resolve, reject) => {
        try {
          const img = new Image()
          img.crossOrigin = 'anonymous'
          img.onload = () => {
            const canvas = document.createElement('canvas')
            canvas.width = container.width
            canvas.height = container.height
            const ctx = canvas.getContext('2d')

            const { displayWidth, displayHeight } = getDisplaySize()
            const drawX = container.width / 2 - displayWidth / 2 + offset.x
            const drawY = container.height / 2 - displayHeight / 2 + offset.y
            ctx.drawImage(img, drawX, drawY, displayWidth, displayHeight)
            canvas.toBlob((blob) => {
              if (!blob) return reject(new Error('No se pudo generar el thumbnail'))
              resolve(blob)
            }, type, quality)
          }
          img.onerror = reject
          img.src = imageSrc
        } catch (err) {
          reject(err)
        }
      })
    },
    reset: () => {
      setZoom(1)
      setOffset({ x: 0, y: 0 })
    }
  }))

  const { displayWidth, displayHeight } = getDisplaySize()
  const drawX = container.width / 2 - displayWidth / 2 + offset.x
  const drawY = container.height / 2 - displayHeight / 2 + offset.y

  return (
    <div className="space-y-2">
      <div
        ref={containerRef}
        className="relative bg-black rounded overflow-hidden select-none"
        style={{ width: container.width, height: container.height, touchAction: 'none' }}
        onPointerDown={handlePointerDown}
        onWheel={handleWheel}
        role="img"
        aria-label="Editor de recorte de thumbnail"
      >
        {/* Área visible (marco 16:9) */}
        {imageSrc && (
          <img
            ref={imgRef}
            src={imageSrc}
            alt="thumbnail"
            draggable={false}
            style={{
              position: 'absolute',
              left: drawX,
              top: drawY,
              width: displayWidth,
              height: displayHeight,
              userSelect: 'none',
              pointerEvents: 'none'
            }}
          />
        )}
      </div>

      <div className="flex items-center gap-3">
        <input
          type="range"
          min={1}
          max={5}
          step={0.01}
          value={zoom}
          onChange={(e) => {
            const next = clamp(parseFloat(e.target.value), 1, 5)
            setZoom(next)
            setOffset((prev) => clampOffset(prev.x, prev.y))
          }}
          className="w-full"
        />
        <span className="text-xs text-gray-600 w-12 text-right">{Math.round(zoom * 100)}%</span>
      </div>
      <p className="text-xs text-gray-500">Arrastra para mover. Rueda o usa el slider para zoom. El recorte mantiene 16:9.</p>
    </div>
  )
})

export default ThumbnailCropper


