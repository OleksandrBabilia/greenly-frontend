"use client"

import type React from "react"

import { useState, useRef, useEffect, useCallback } from "react"
import Image from "next/image"
import { ChevronLeft, ChevronRight, MoveHorizontal, SplitSquareVertical } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

interface ImageComparisonProps {
  originalImage: string
  processedImage: string
  onClose: () => void
}

type ComparisonMode = "side-by-side" | "slider" | "toggle"

export function ImageComparison({ originalImage, processedImage, onClose }: ImageComparisonProps) {
  const [mode, setMode] = useState<ComparisonMode>("side-by-side")
  const [sliderPosition, setSliderPosition] = useState(50)
  const [showOriginal, setShowOriginal] = useState(true)
  const [isDragging, setIsDragging] = useState(false)
  const sliderContainerRef = useRef<HTMLDivElement>(null)

  // Handle slider movement with improved logic
  const updateSliderPosition = useCallback((clientX: number) => {
    if (!sliderContainerRef.current) return

    const containerRect = sliderContainerRef.current.getBoundingClientRect()
    const containerWidth = containerRect.width

    // Calculate position relative to the container
    const position = ((clientX - containerRect.left) / containerWidth) * 100

    // Clamp position between 0 and 100
    const clampedPosition = Math.max(0, Math.min(100, position))
    setSliderPosition(clampedPosition)
  }, [])

  // Mouse event handlers
  const handleMouseDown = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault()
      setIsDragging(true)
      updateSliderPosition(e.clientX)
    },
    [updateSliderPosition],
  )

  const handleMouseMove = useCallback(
    (e: MouseEvent) => {
      if (!isDragging) return
      e.preventDefault()
      updateSliderPosition(e.clientX)
    },
    [isDragging, updateSliderPosition],
  )

  const handleMouseUp = useCallback(() => {
    setIsDragging(false)
  }, [])

  // Touch event handlers
  const handleTouchStart = useCallback(
    (e: React.TouchEvent) => {
      e.preventDefault()
      setIsDragging(true)
      const touch = e.touches[0]
      updateSliderPosition(touch.clientX)
    },
    [updateSliderPosition],
  )

  const handleTouchMove = useCallback(
    (e: TouchEvent) => {
      if (!isDragging) return
      e.preventDefault()
      const touch = e.touches[0]
      updateSliderPosition(touch.clientX)
    },
    [isDragging, updateSliderPosition],
  )

  const handleTouchEnd = useCallback(() => {
    setIsDragging(false)
  }, [])

  // Set up global event listeners for dragging
  useEffect(() => {
    if (isDragging) {
      document.addEventListener("mousemove", handleMouseMove)
      document.addEventListener("mouseup", handleMouseUp)
      document.addEventListener("touchmove", handleTouchMove, { passive: false })
      document.addEventListener("touchend", handleTouchEnd)

      // Prevent text selection while dragging
      document.body.style.userSelect = "none"
      document.body.style.webkitUserSelect = "none"
    }

    return () => {
      document.removeEventListener("mousemove", handleMouseMove)
      document.removeEventListener("mouseup", handleMouseUp)
      document.removeEventListener("touchmove", handleTouchMove)
      document.removeEventListener("touchend", handleTouchEnd)

      // Restore text selection
      document.body.style.userSelect = ""
      document.body.style.webkitUserSelect = ""
    }
  }, [isDragging, handleMouseMove, handleMouseUp, handleTouchMove, handleTouchEnd])

  // Reset slider position when mode changes
  useEffect(() => {
    if (mode === "slider") {
      setSliderPosition(50)
    }
  }, [mode])

  return (
    <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="p-4 border-b flex items-center justify-between">
          <h3 className="font-medium text-lg">Image Comparison</h3>
          <div className="flex items-center gap-2">
            <Button
              variant={mode === "side-by-side" ? "default" : "outline"}
              size="sm"
              onClick={() => setMode("side-by-side")}
              className="flex items-center gap-1"
            >
              <SplitSquareVertical className="w-4 h-4" />
              <span className="hidden sm:inline">Side by Side</span>
            </Button>
            <Button
              variant={mode === "slider" ? "default" : "outline"}
              size="sm"
              onClick={() => setMode("slider")}
              className="flex items-center gap-1"
            >
              <MoveHorizontal className="w-4 h-4" />
              <span className="hidden sm:inline">Slider</span>
            </Button>
            <Button
              variant={mode === "toggle" ? "default" : "outline"}
              size="sm"
              onClick={() => setMode("toggle")}
              className="flex items-center gap-1"
            >
              <ChevronLeft className="w-4 h-4" />
              <ChevronRight className="w-4 h-4" />
              <span className="hidden sm:inline">Toggle</span>
            </Button>
            <Button variant="outline" size="sm" onClick={onClose}>
              Close
            </Button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-auto p-4">
          {mode === "side-by-side" && (
            <div className="flex flex-col md:flex-row gap-4 h-full">
              <div className="flex-1 flex flex-col items-center">
                <div className="bg-gray-100 p-1 rounded-md mb-2 text-sm font-medium">Original</div>
                <div className="relative w-full h-[300px] md:h-[500px]">
                  <Image
                    src={originalImage || "/placeholder.svg"}
                    alt="Original image"
                    fill
                    className="object-contain"
                  />
                </div>
              </div>
              <div className="flex-1 flex flex-col items-center">
                <div className="bg-green-100 p-1 rounded-md mb-2 text-sm font-medium text-green-800">Processed</div>
                <div className="relative w-full h-[300px] md:h-[500px]">
                  <Image
                    src={processedImage || "/placeholder.svg"}
                    alt="Processed image"
                    fill
                    className="object-contain"
                  />
                </div>
              </div>
            </div>
          )}

          {mode === "slider" && (
            <div
              className="relative h-[400px] md:h-[600px] cursor-ew-resize select-none overflow-hidden rounded-lg"
              ref={sliderContainerRef}
              onMouseDown={handleMouseDown}
              onTouchStart={handleTouchStart}
            >
              {/* Processed image (background) */}
              <div className="absolute inset-0">
                <Image
                  src={processedImage || "/placeholder.svg"}
                  alt="Processed image"
                  fill
                  className="object-contain pointer-events-none"
                  draggable={false}
                />
              </div>

              {/* Original image (foreground with clip) */}
              <div
                className="absolute inset-0 overflow-hidden"
                style={{
                  clipPath: `inset(0 ${100 - sliderPosition}% 0 0)`,
                }}
              >
                <Image
                  src={originalImage || "/placeholder.svg"}
                  alt="Original image"
                  fill
                  className="object-contain pointer-events-none"
                  draggable={false}
                />
              </div>

              {/* Slider handle */}
              <div
                className="absolute top-0 bottom-0 w-1 bg-white shadow-lg cursor-ew-resize z-10"
                style={{ left: `${sliderPosition}%`, transform: "translateX(-50%)" }}
              >
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-white shadow-lg flex items-center justify-center border-2 border-gray-200">
                  <MoveHorizontal className="w-4 h-4 text-gray-700" />
                </div>
              </div>

              {/* Labels */}
              <div className="absolute top-2 left-2 bg-gray-900/75 text-white p-1 px-2 rounded text-xs font-medium pointer-events-none">
                Original
              </div>
              <div className="absolute top-2 right-2 bg-green-600/75 text-white p-1 px-2 rounded text-xs font-medium pointer-events-none">
                Processed
              </div>

              {/* Position indicator */}
              <div className="absolute bottom-2 left-1/2 -translate-x-1/2 bg-black/50 text-white px-2 py-1 rounded text-xs font-medium pointer-events-none">
                {Math.round(sliderPosition)}%
              </div>
            </div>
          )}

          {mode === "toggle" && (
            <div className="relative h-[400px] md:h-[600px] flex flex-col">
              <div className="absolute inset-0">
                <Image
                  src={showOriginal ? originalImage : processedImage}
                  alt={showOriginal ? "Original image" : "Processed image"}
                  fill
                  className="object-contain"
                />
              </div>

              <div className="absolute top-2 left-1/2 -translate-x-1/2 bg-white rounded-full shadow-lg p-1 flex">
                <Button
                  variant={showOriginal ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setShowOriginal(true)}
                  className={cn(
                    "rounded-l-full rounded-r-none",
                    showOriginal ? "bg-gray-200 hover:bg-gray-300 text-gray-800" : "",
                  )}
                >
                  Original
                </Button>
                <Button
                  variant={!showOriginal ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setShowOriginal(false)}
                  className={cn(
                    "rounded-r-full rounded-l-none",
                    !showOriginal ? "bg-green-100 hover:bg-green-200 text-green-800" : "",
                  )}
                >
                  Processed
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
