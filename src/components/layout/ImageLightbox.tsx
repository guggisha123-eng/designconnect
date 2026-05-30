'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, ChevronLeft, ChevronRight, ZoomIn, ZoomOut } from 'lucide-react'

interface ImageLightboxProps {
  images: string[]
  initialIndex?: number
  isOpen: boolean
  onClose: () => void
  alt?: string
}

export default function ImageLightbox({
  images,
  initialIndex = 0,
  isOpen,
  onClose,
  alt = 'Image',
}: ImageLightboxProps) {
  const [currentIndex, setCurrentIndex] = useState(initialIndex)
  const [isZoomed, setIsZoomed] = useState(false)
  const [zoomLevel, setZoomLevel] = useState(1)
  const [panOffset, setPanOffset] = useState({ x: 0, y: 0 })
  const [isDragging, setIsDragging] = useState(false)
  const dragStart = useRef({ x: 0, y: 0 })
  const panStart = useRef({ x: 0, y: 0 })
  const containerRef = useRef<HTMLDivElement>(null)
  const touchStartX = useRef(0)
  const touchStartY = useRef(0)
  const touchStartTime = useRef(0)

  const handleZoomIn = useCallback(() => {
    setZoomLevel((prev) => {
      if (prev < 4) {
        const newLevel = Math.min(prev + 0.5, 4)
        setIsZoomed(newLevel > 1)
        return newLevel
      }
      return prev
    })
  }, [])

  const handleZoomOut = useCallback(() => {
    setZoomLevel((prev) => {
      if (prev > 1) {
        const newLevel = Math.max(prev - 0.5, 1)
        if (newLevel <= 1) {
          setIsZoomed(false)
          setPanOffset({ x: 0, y: 0 })
        }
        return newLevel
      }
      return prev
    })
  }, [])

  // Keyboard navigation
  useEffect(() => {
    if (!isOpen) return

    const handleKeyDown = (e: KeyboardEvent) => {
      switch (e.key) {
        case 'Escape':
          onClose()
          break
        case 'ArrowLeft':
          if (!isZoomed) {
            setCurrentIndex((prev) => (prev > 0 ? prev - 1 : images.length - 1))
          }
          break
        case 'ArrowRight':
          if (!isZoomed) {
            setCurrentIndex((prev) => (prev < images.length - 1 ? prev + 1 : 0))
          }
          break
        case '+':
        case '=':
          handleZoomIn()
          break
        case '-':
          handleZoomOut()
          break
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, isZoomed, images.length, onClose, handleZoomIn, handleZoomOut])

  // Prevent body scroll when lightbox is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => {
      document.body.style.overflow = ''
    }
  }, [isOpen])

  const handleDoubleClick = useCallback(() => {
    if (isZoomed) {
      setIsZoomed(false)
      setZoomLevel(1)
      setPanOffset({ x: 0, y: 0 })
    } else {
      setIsZoomed(true)
      setZoomLevel(2)
    }
  }, [isZoomed])

  const goToPrev = useCallback(() => {
    if (!isZoomed) {
      setCurrentIndex((prev) => (prev > 0 ? prev - 1 : images.length - 1))
    }
  }, [isZoomed, images.length])

  const goToNext = useCallback(() => {
    if (!isZoomed) {
      setCurrentIndex((prev) => (prev < images.length - 1 ? prev + 1 : 0))
    }
  }, [isZoomed, images.length])

  const handleBackdropClick = useCallback(
    (e: React.MouseEvent) => {
      if (e.target === e.currentTarget) {
        onClose()
      }
    },
    [onClose]
  )

  // Mouse pan for zoomed images
  const handleMouseDown = useCallback(
    (e: React.MouseEvent) => {
      if (!isZoomed) return
      e.preventDefault()
      setIsDragging(true)
      dragStart.current = { x: e.clientX, y: e.clientY }
      panStart.current = { ...panOffset }
    },
    [isZoomed, panOffset]
  )

  const handleMouseMove = useCallback(
    (e: React.MouseEvent) => {
      if (!isDragging) return
      const dx = e.clientX - dragStart.current.x
      const dy = e.clientY - dragStart.current.y
      setPanOffset({
        x: panStart.current.x + dx,
        y: panStart.current.y + dy,
      })
    },
    [isDragging]
  )

  const handleMouseUp = useCallback(() => {
    setIsDragging(false)
  }, [])

  // Touch swipe for navigation
  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX
    touchStartY.current = e.touches[0].clientY
    touchStartTime.current = Date.now()
  }, [])

  const handleTouchEnd = useCallback(
    (e: React.TouchEvent) => {
      if (isZoomed) return
      const deltaX = e.changedTouches[0].clientX - touchStartX.current
      const deltaY = e.changedTouches[0].clientY - touchStartY.current
      const elapsed = Date.now() - touchStartTime.current

      // Only trigger on horizontal swipes that are fast enough and long enough
      if (Math.abs(deltaX) > 50 && Math.abs(deltaX) > Math.abs(deltaY) * 1.5 && elapsed < 500) {
        if (deltaX > 0) {
          goToPrev()
        } else {
          goToNext()
        }
      }
    },
    [isZoomed, goToPrev, goToNext]
  )

  // Wheel zoom
  const handleWheel = useCallback(
    (e: React.WheelEvent) => {
      if (e.deltaY < 0) {
        handleZoomIn()
      } else {
        handleZoomOut()
      }
    },
    [handleZoomIn, handleZoomOut]
  )

  if (images.length === 0) return null

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          ref={containerRef}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-md"
          onClick={handleBackdropClick}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
          onWheel={handleWheel}
        >
          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 z-10 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
            aria-label="Close lightbox"
          >
            <X className="w-6 h-6" />
          </button>

          {/* Zoom controls */}
          <div className="absolute top-4 right-16 z-10 flex items-center gap-1">
            <button
              onClick={handleZoomOut}
              disabled={zoomLevel <= 1}
              className="p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
              aria-label="Zoom out"
            >
              <ZoomOut className="w-5 h-5" />
            </button>
            <span className="text-white/60 text-xs min-w-[3rem] text-center tabular-nums">
              {Math.round(zoomLevel * 100)}%
            </span>
            <button
              onClick={handleZoomIn}
              disabled={zoomLevel >= 4}
              className="p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
              aria-label="Zoom in"
            >
              <ZoomIn className="w-5 h-5" />
            </button>
          </div>

          {/* Navigation arrows */}
          {images.length > 1 && !isZoomed && (
            <>
              <button
                onClick={goToPrev}
                className="absolute left-4 top-1/2 -translate-y-1/2 z-10 p-3 rounded-full bg-white/10 hover:bg-white/25 text-white transition-all hover:scale-110"
                aria-label="Previous image"
              >
                <ChevronLeft className="w-6 h-6" />
              </button>
              <button
                onClick={goToNext}
                className="absolute right-4 top-1/2 -translate-y-1/2 z-10 p-3 rounded-full bg-white/10 hover:bg-white/25 text-white transition-all hover:scale-110"
                aria-label="Next image"
              >
                <ChevronRight className="w-6 h-6" />
              </button>
            </>
          )}

          {/* Main image */}
          <motion.div
            className="relative max-w-[90vw] max-h-[80vh] flex items-center justify-center select-none"
            style={{
              cursor: isZoomed ? (isDragging ? 'grabbing' : 'grab') : 'zoom-in',
            }}
            onMouseDown={handleMouseDown}
            onTouchStart={handleTouchStart}
            onTouchEnd={handleTouchEnd}
            onDoubleClick={handleDoubleClick}
          >
            <AnimatePresence mode="wait">
              <motion.img
                key={currentIndex}
                src={images[currentIndex]}
                alt={`${alt} - ${currentIndex + 1}`}
                initial={{ opacity: 0, scale: 0.92 }}
                animate={{
                  opacity: 1,
                  scale: zoomLevel,
                  x: panOffset.x,
                  y: panOffset.y,
                }}
                exit={{ opacity: 0, scale: 0.92 }}
                transition={{
                  opacity: { duration: 0.2 },
                  scale: { type: 'spring', stiffness: 300, damping: 30 },
                  x: { type: 'tween', duration: isDragging ? 0 : 0.15 },
                  y: { type: 'tween', duration: isDragging ? 0 : 0.15 },
                }}
                className="max-w-full max-h-[80vh] object-contain rounded-lg pointer-events-none"
                draggable={false}
              />
            </AnimatePresence>
          </motion.div>

          {/* Image counter */}
          {images.length > 1 && (
            <div className="absolute bottom-24 sm:bottom-28 left-1/2 -translate-x-1/2 z-10">
              <span className="text-white/70 text-sm font-medium tabular-nums bg-black/30 px-3 py-1 rounded-full">
                {currentIndex + 1} / {images.length}
              </span>
            </div>
          )}

          {/* Thumbnail strip */}
          {images.length > 1 && (
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-10 max-w-[90vw]">
              <div className="flex items-center gap-2 overflow-x-auto px-2 py-2 rounded-xl bg-black/30 backdrop-blur-sm scrollbar-thin">
                {images.map((img, i) => (
                  <motion.button
                    key={i}
                    onClick={() => {
                      setCurrentIndex(i)
                      setIsZoomed(false)
                      setZoomLevel(1)
                      setPanOffset({ x: 0, y: 0 })
                    }}
                    className={`relative flex-shrink-0 w-14 h-10 rounded-md overflow-hidden transition-all ${
                      i === currentIndex
                        ? 'ring-2 ring-[#fb8000] ring-offset-1 ring-offset-black/30 scale-110'
                        : 'opacity-50 hover:opacity-80'
                    }`}
                    whileHover={{ scale: i === currentIndex ? 1.1 : 1.05 }}
                    layout
                  >
                    <img
                      src={img}
                      alt={`Thumbnail ${i + 1}`}
                      className="w-full h-full object-cover"
                    />
                    {i === currentIndex && (
                      <motion.div
                        layoutId="activeThumbnail"
                        className="absolute inset-0 border-2 border-[#fb8000] rounded-md"
                        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                      />
                    )}
                  </motion.button>
                ))}
              </div>
            </div>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  )
}
