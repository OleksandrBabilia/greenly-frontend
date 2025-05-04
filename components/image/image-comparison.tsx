"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
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
  const sliderContainerRef = useRef<HTMLDivElement>(null)

  // Handle slider movement
  const handleSliderMove = (e: React.MouseEvent | React.TouchEvent) => {
    if (!sliderContainerRef.current) return

    const containerRect = sliderContainerRef.current.getBoundingClientRect()
    const containerWidth = containerRect.width

    // Get clientX based on whether it's a mouse or touch event
    const clientX = "touches" in e ? e.touches[0].clientX : e.clientX

    // Calculate position relative to the container
    const position = ((clientX - containerRect.left) / containerWidth) * 100

    // Clamp position between 0 and 100
    const clampedPosition = Math.max(0, Math.min(100, position))
    setSliderPosition(clampedPosition)
  }

  // Set up event listeners for slider dragging
  useEffect(() => {
    if (mode !== "slider") return

    const handleMouseMove = (e: MouseEvent) => {
      e.preventDefault()
      handleSliderMove(e as unknown as React.MouseEvent)
    }

    const handleMouseUp = () => {
      document.removeEventListener("mousemove", handleMouseMove)
      document.removeEventListener("mouseup", handleMouseUp)
    }

    const handleTouchMove = (e: TouchEvent) => {
      handleSliderMove(e as unknown as React.TouchEvent)
    }

    const handleTouchEnd = () => {
      document.removeEventListener("touchmove", handleTouchMove)
      document.removeEventListener("touchend", handleTouchEnd)
    }

    const sliderContainer = sliderContainerRef.current
    if (sliderContainer) {
      sliderContainer.addEventListener("mousedown", (e) => {
        e.preventDefault()
        document.addEventListener("mousemove", handleMouseMove)
        document.addEventListener("mouseup", handleMouseUp)
      })

      sliderContainer.addEventListener("touchstart", () => {
        document.addEventListener("touchmove", handleTouchMove)
        document.addEventListener("touchend", handleTouchEnd)
      })
    }

    return () => {
      document.removeEventListener("mousemove", handleMouseMove)
      document.removeEventListener("mouseup", handleMouseUp)
      document.removeEventListener("touchmove", handleTouchMove)
      document.removeEventListener("touchend", handleTouchEnd)
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
            <div className="relative h-[400px] md:h-[600px]" ref={sliderContainerRef}>
              {/* Processed image (background) */}
              <div className="absolute inset-0">
                <Image
                  src={processedImage || "/placeholder.svg"}
                  alt="Processed image"
                  fill
                  className="object-contain"
                />
              </div>

              {/* Original image (foreground with clip) */}
              <div className="absolute inset-0 overflow-hidden" style={{ width: `${sliderPosition}%` }}>
                <div className="relative h-full w-full">
                  <Image
                    src={originalImage || "/placeholder.svg"}
                    alt="Original image"
                    fill
                    className="object-contain"
                  />
                </div>
              </div>

              {/* Slider handle */}
              <div
                className="absolute top-0 bottom-0 w-1 bg-white cursor-ew-resize"
                style={{ left: `${sliderPosition}%` }}
              >
                <div className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-8 h-8 rounded-full bg-white shadow-lg flex items-center justify-center">
                  <MoveHorizontal className="w-5 h-5 text-gray-700" />
                </div>
              </div>

              {/* Labels */}
              <div className="absolute top-2 left-2 bg-gray-100 p-1 px-2 rounded text-xs font-medium">Original</div>
              <div className="absolute top-2 right-2 bg-green-100 p-1 px-2 rounded text-xs font-medium text-green-800">
                Processed
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
