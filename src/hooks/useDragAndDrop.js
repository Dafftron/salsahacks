// 🎬 HOOK PARA DRAG AND DROP - SALSAHACKS V2.0

import { useState, useCallback } from 'react'

export const useDragAndDrop = (onReorder) => {
  const [draggedIndex, setDraggedIndex] = useState(null)
  const [dragOverIndex, setDragOverIndex] = useState(null)

  const handleDragStart = useCallback((index) => {
    setDraggedIndex(index)
  }, [])

  const handleDragOver = useCallback((e, index) => {
    e.preventDefault()
    setDragOverIndex(index)
  }, [])

  const handleDragEnter = useCallback((e, index) => {
    e.preventDefault()
    setDragOverIndex(index)
  }, [])

  const handleDragLeave = useCallback((e) => {
    e.preventDefault()
    setDragOverIndex(null)
  }, [])

  const handleDrop = useCallback((e, dropIndex) => {
    e.preventDefault()
    
    if (draggedIndex !== null && draggedIndex !== dropIndex) {
      onReorder(draggedIndex, dropIndex)
    }
    
    setDraggedIndex(null)
    setDragOverIndex(null)
  }, [draggedIndex, onReorder])

  const handleDragEnd = useCallback(() => {
    setDraggedIndex(null)
    setDragOverIndex(null)
  }, [])

  const getDragStyles = useCallback((index) => {
    const styles = {
      cursor: 'grab',
      transition: 'all 0.2s ease',
      transform: 'scale(1)',
      opacity: 1
    }

    if (draggedIndex === index) {
      styles.cursor = 'grabbing'
      styles.transform = 'scale(1.05) rotate(2deg)'
      styles.opacity = 0.7
      styles.zIndex = 1000
    }

    if (dragOverIndex === index && draggedIndex !== index) {
      styles.transform = 'scale(1.02)'
      styles.borderLeft = '4px solid #3b82f6'
      styles.backgroundColor = '#f0f9ff'
    }

    return styles
  }, [draggedIndex, dragOverIndex])

  return {
    draggedIndex,
    dragOverIndex,
    handleDragStart,
    handleDragOver,
    handleDragEnter,
    handleDragLeave,
    handleDrop,
    handleDragEnd,
    getDragStyles
  }
} 