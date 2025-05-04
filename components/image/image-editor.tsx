"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Slider } from "@/components/ui/slider"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import {
  Crop,
  RotateCcw,
  RotateCw,
  Save,
  X,
  Undo,
  Redo,
  Sliders,
  FlipHorizontal,
  FlipVertical,
  Maximize2,
} from "lucide-react"

interface ImageEditorProps {
  isOpen: boolean
  onClose: () => void
  imageUrl: string
  onSave: (editedImageUrl: string) => void
}

type FilterSettings = {
  brightness: number
  contrast: number
  saturation: number
  hue: number
  blur: number
  grayscale: number
  sepia: number
}

type CropArea = {
  x: number
  y: number
  width: number
  height: number
}

export function ImageEditor({ isOpen, onClose, imageUrl, onSave }: ImageEditorProps) {
  const [activeTab, setActiveTab] = useState("crop")
  const [rotation, setRotation] = useState(0)
  const [flipHorizontal, setFlipHorizontal] = useState(false)
  const [flipVertical, setFlipVertical] = useState(false)
  const [filters, setFilters] = useState<FilterSettings>({
    brightness: 100,
    contrast: 100,
    saturation: 100,
    hue: 0,
    blur: 0,
    grayscale: 0,
    sepia: 0,
  })

  const [history, setHistory] = useState<
    Array<{ rotation: number; flipHorizontal: boolean; flipVertical: boolean; filters: FilterSettings }>
  >([])
  const [historyIndex, setHistoryIndex] = useState(-1)
  const [isCropping, setIsCropping] = useState(false)
  const [cropStart, setCropStart] = useState({ x: 0, y: 0 })
  const [cropArea, setCropArea] = useState<CropArea | null>(null)
  const [originalImageDimensions, setOriginalImageDimensions] = useState({ width: 0, height: 0 })

  const imageRef = useRef<HTMLImageElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  // Load the image and get its dimensions
  useEffect(() => {
    if (isOpen) {
      const img = new window.Image()
      img.crossOrigin = "anonymous"
      img.onload = () => {
        setOriginalImageDimensions({ width: img.width, height: img.height })
      }
      img.src = imageUrl
    }
  }, [isOpen, imageUrl])

  // Add current state to history when making changes
  const addToHistory = () => {
    const newState = { rotation, flipHorizontal, flipVertical, filters: { ...filters } }
    const newHistory = history.slice(0, historyIndex + 1)
    newHistory.push(newState)
    setHistory(newHistory)
    setHistoryIndex(newHistory.length - 1)
  }

  // Undo/Redo functions
  const undo = () => {
    if (historyIndex > 0) {
      const prevState = history[historyIndex - 1]
      setRotation(prevState.rotation)
      setFlipHorizontal(prevState.flipHorizontal)
      setFlipVertical(prevState.flipVertical)
      setFilters(prevState.filters)
      setHistoryIndex(historyIndex - 1)
    }
  }

  const redo = () => {
    if (historyIndex < history.length - 1) {
      const nextState = history[historyIndex + 1]
      setRotation(nextState.rotation)
      setFlipHorizontal(nextState.flipHorizontal)
      setFlipVertical(nextState.flipVertical)
      setFilters(nextState.filters)
      setHistoryIndex(historyIndex + 1)
    }
  }

  // Reset all edits
  const resetEdits = () => {
    setRotation(0)
    setFlipHorizontal(false)
    setFlipVertical(false)
    setFilters({
      brightness: 100,
      contrast: 100,
      saturation: 100,
      hue: 0,
      blur: 0,
      grayscale: 0,
      sepia: 0,
    })
    setCropArea(null)
    addToHistory()
  }

  // Handle rotation
  const handleRotate = (direction: "clockwise" | "counterclockwise") => {
    const newRotation = direction === "clockwise" ? rotation + 90 : rotation - 90
    setRotation(newRotation % 360)
    addToHistory()
  }

  // Handle flip
  const handleFlip = (direction: "horizontal" | "vertical") => {
    if (direction === "horizontal") {
      setFlipHorizontal(!flipHorizontal)
    } else {
      setFlipVertical(!flipVertical)
    }
    addToHistory()
  }

  // Handle filter changes
  const handleFilterChange = (filter: keyof FilterSettings, value: number) => {
    setFilters((prev) => ({ ...prev, [filter]: value }))
  }

  // Apply filter changes to history after slider release
  const handleFilterChangeComplete = () => {
    addToHistory()
  }

  // Handle crop start
  const handleCropStart = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!containerRef.current || activeTab !== "crop") return

    const rect = containerRef.current.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top

    setCropStart({ x, y })
    setIsCropping(true)
    setCropArea(null)
  }

  // Handle crop move
  const handleCropMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isCropping || !containerRef.current) return

    const rect = containerRef.current.getBoundingClientRect()
    const currentX = e.clientX - rect.left
    const currentY = e.clientY - rect.top

    const width = Math.abs(currentX - cropStart.x)
    const height = Math.abs(currentY - cropStart.y)
    const x = Math.min(cropStart.x, currentX)
    const y = Math.min(cropStart.y, currentY)

    setCropArea({ x, y, width, height })
  }

  // Handle crop end
  const handleCropEnd = () => {
    setIsCropping(false)
    if (cropArea && cropArea.width > 10 && cropArea.height > 10) {
      // Keep the crop area
    } else {
      setCropArea(null)
    }
  }

  // Apply crop
  const applyCrop = () => {
    if (!cropArea || !imageRef.current || !canvasRef.current) return

    const canvas = canvasRef.current
    const ctx = canvas.getContext("2d")
    if (!ctx) return

    const img = imageRef.current
    const imgRect = img.getBoundingClientRect()

    // Calculate the scale between displayed image and original dimensions
    const scaleX = originalImageDimensions.width / imgRect.width
    const scaleY = originalImageDimensions.height / imgRect.height

    // Calculate crop dimensions in the original image coordinates
    const cropX = cropArea.x * scaleX
    const cropY = cropArea.y * scaleY
    const cropWidth = cropArea.width * scaleX
    const cropHeight = cropArea.height * scaleY

    // Set canvas dimensions to the crop size
    canvas.width = cropWidth
    canvas.height = cropHeight

    // Create a temporary image to draw from
    const tempImg = new window.Image()
    tempImg.crossOrigin = "anonymous"
    tempImg.onload = () => {
      ctx.drawImage(tempImg, cropX, cropY, cropWidth, cropHeight, 0, 0, cropWidth, cropHeight)

      // Get the cropped image as data URL
      const croppedImageUrl = canvas.toDataURL("image/png")

      // Update the image URL
      onSave(croppedImageUrl)
      onClose()
    }
    tempImg.src = imageUrl
  }

  // Save the edited image
  const saveImage = () => {
    if (!imageRef.current || !canvasRef.current) return

    const canvas = canvasRef.current
    const ctx = canvas.getContext("2d")
    if (!ctx) return

    // Set canvas dimensions to match the original image
    canvas.width = originalImageDimensions.width
    canvas.height = originalImageDimensions.height

    // Create a temporary image to apply transformations
    const tempImg = new window.Image()
    tempImg.crossOrigin = "anonymous"
    tempImg.onload = () => {
      // Clear canvas
      ctx.clearRect(0, 0, canvas.width, canvas.height)

      // Save context state
      ctx.save()

      // Move to center of canvas
      ctx.translate(canvas.width / 2, canvas.height / 2)

      // Apply rotation
      ctx.rotate((rotation * Math.PI) / 180)

      // Apply flips
      ctx.scale(flipHorizontal ? -1 : 1, flipVertical ? -1 : 1)

      // Draw the image centered
      ctx.drawImage(
        tempImg,
        -originalImageDimensions.width / 2,
        -originalImageDimensions.height / 2,
        originalImageDimensions.width,
        originalImageDimensions.height,
      )

      // Restore context state
      ctx.restore()

      // Apply filters
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)

      // This would be where we'd apply pixel-level filters if needed
      // For now, we'll use CSS filters in the UI

      ctx.putImageData(imageData, 0, 0)

      // Get the edited image as data URL
      const editedImageUrl = canvas.toDataURL("image/png")

      // Save the edited image
      onSave(editedImageUrl)
      onClose()
    }
    tempImg.src = imageUrl
  }

  // Initialize history when first opening
  useEffect(() => {
    if (isOpen && history.length === 0) {
      addToHistory()
    }
  }, [isOpen])

  // Generate CSS filter string
  const filterString = `
    brightness(${filters.brightness}%) 
    contrast(${filters.contrast}%) 
    saturate(${filters.saturation}%) 
    hue-rotate(${filters.hue}deg) 
    blur(${filters.blur}px) 
    grayscale(${filters.grayscale}%) 
    sepia(${filters.sepia}%)
  `

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-4xl w-full max-h-[90vh] flex flex-col">
        <DialogHeader className="flex flex-row items-center justify-between">
          <DialogTitle>Image Editor</DialogTitle>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="icon" onClick={undo} disabled={historyIndex <= 0} title="Undo">
              <Undo className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              onClick={redo}
              disabled={historyIndex >= history.length - 1}
              title="Redo"
            >
              <Redo className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="icon" onClick={resetEdits} title="Reset All">
              <RotateCcw className="h-4 w-4" />
            </Button>
            <Button variant="default" size="sm" onClick={saveImage} className="bg-green-600 hover:bg-green-700">
              <Save className="h-4 w-4 mr-2" />
              Save
            </Button>
          </div>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col">
          <TabsList className="grid grid-cols-3">
            <TabsTrigger value="crop" className="flex items-center gap-2">
              <Crop className="h-4 w-4" />
              <span>Crop & Transform</span>
            </TabsTrigger>
            <TabsTrigger value="filters" className="flex items-center gap-2">
              <Sliders className="h-4 w-4" />
              <span>Filters</span>
            </TabsTrigger>
            <TabsTrigger value="preview" className="flex items-center gap-2">
              <Maximize2 className="h-4 w-4" />
              <span>Preview</span>
            </TabsTrigger>
          </TabsList>

          <div className="flex-1 overflow-hidden flex flex-col">
            {/* Image Preview Area */}
            <div
              className="relative flex-1 overflow-hidden bg-gray-100 flex items-center justify-center"
              ref={containerRef}
              onMouseDown={activeTab === "crop" ? handleCropStart : undefined}
              onMouseMove={activeTab === "crop" ? handleCropMove : undefined}
              onMouseUp={activeTab === "crop" ? handleCropEnd : undefined}
              onMouseLeave={activeTab === "crop" ? handleCropEnd : undefined}
            >
              <div
                className="relative"
                style={{
                  transform: `rotate(${rotation}deg) scale(${flipHorizontal ? -1 : 1}, ${flipVertical ? -1 : 1})`,
                }}
              >
                <img
                  ref={imageRef}
                  src={imageUrl || "/placeholder.svg"}
                  alt="Image being edited"
                  className="max-h-[60vh] max-w-full object-contain"
                  style={{ filter: filterString }}
                  crossOrigin="anonymous"
                />
              </div>

              {/* Crop overlay */}
              {activeTab === "crop" && cropArea && (
                <div
                  className="absolute border-2 border-white bg-black bg-opacity-30 pointer-events-none"
                  style={{
                    left: `${cropArea.x}px`,
                    top: `${cropArea.y}px`,
                    width: `${cropArea.width}px`,
                    height: `${cropArea.height}px`,
                  }}
                />
              )}
            </div>

            {/* Tab Content */}
            <TabsContent value="crop" className="m-0 p-4 border-t">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h3 className="text-sm font-medium mb-2">Rotation</h3>
                  <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm" onClick={() => handleRotate("counterclockwise")}>
                      <RotateCcw className="h-4 w-4 mr-2" />
                      Rotate Left
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => handleRotate("clockwise")}>
                      <RotateCw className="h-4 w-4 mr-2" />
                      Rotate Right
                    </Button>
                  </div>
                </div>
                <div>
                  <h3 className="text-sm font-medium mb-2">Flip</h3>
                  <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm" onClick={() => handleFlip("horizontal")}>
                      <FlipHorizontal className="h-4 w-4 mr-2" />
                      Flip Horizontal
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => handleFlip("vertical")}>
                      <FlipVertical className="h-4 w-4 mr-2" />
                      Flip Vertical
                    </Button>
                  </div>
                </div>
              </div>

              {cropArea && (
                <div className="mt-4">
                  <Button variant="default" size="sm" onClick={applyCrop} className="bg-green-600 hover:bg-green-700">
                    <Crop className="h-4 w-4 mr-2" />
                    Apply Crop
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => setCropArea(null)} className="ml-2">
                    <X className="h-4 w-4 mr-2" />
                    Cancel Crop
                  </Button>
                </div>
              )}

              {!cropArea && activeTab === "crop" && (
                <p className="text-sm text-gray-500 mt-4">Click and drag on the image to create a crop selection.</p>
              )}
            </TabsContent>

            <TabsContent value="filters" className="m-0 p-4 border-t">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <div className="mb-4">
                    <div className="flex justify-between mb-1">
                      <label className="text-sm font-medium">Brightness: {filters.brightness}%</label>
                    </div>
                    <Slider
                      min={0}
                      max={200}
                      step={1}
                      value={[filters.brightness]}
                      onValueChange={(value) => handleFilterChange("brightness", value[0])}
                      onValueCommit={() => handleFilterChangeComplete()}
                      className="w-full"
                    />
                  </div>

                  <div className="mb-4">
                    <div className="flex justify-between mb-1">
                      <label className="text-sm font-medium">Contrast: {filters.contrast}%</label>
                    </div>
                    <Slider
                      min={0}
                      max={200}
                      step={1}
                      value={[filters.contrast]}
                      onValueChange={(value) => handleFilterChange("contrast", value[0])}
                      onValueCommit={() => handleFilterChangeComplete()}
                      className="w-full"
                    />
                  </div>

                  <div className="mb-4">
                    <div className="flex justify-between mb-1">
                      <label className="text-sm font-medium">Saturation: {filters.saturation}%</label>
                    </div>
                    <Slider
                      min={0}
                      max={200}
                      step={1}
                      value={[filters.saturation]}
                      onValueChange={(value) => handleFilterChange("saturation", value[0])}
                      onValueCommit={() => handleFilterChangeComplete()}
                      className="w-full"
                    />
                  </div>

                  <div className="mb-4">
                    <div className="flex justify-between mb-1">
                      <label className="text-sm font-medium">Hue Rotate: {filters.hue}°</label>
                    </div>
                    <Slider
                      min={0}
                      max={360}
                      step={1}
                      value={[filters.hue]}
                      onValueChange={(value) => handleFilterChange("hue", value[0])}
                      onValueCommit={() => handleFilterChangeComplete()}
                      className="w-full"
                    />
                  </div>
                </div>

                <div>
                  <div className="mb-4">
                    <div className="flex justify-between mb-1">
                      <label className="text-sm font-medium">Blur: {filters.blur}px</label>
                    </div>
                    <Slider
                      min={0}
                      max={10}
                      step={0.1}
                      value={[filters.blur]}
                      onValueChange={(value) => handleFilterChange("blur", value[0])}
                      onValueCommit={() => handleFilterChangeComplete()}
                      className="w-full"
                    />
                  </div>

                  <div className="mb-4">
                    <div className="flex justify-between mb-1">
                      <label className="text-sm font-medium">Grayscale: {filters.grayscale}%</label>
                    </div>
                    <Slider
                      min={0}
                      max={100}
                      step={1}
                      value={[filters.grayscale]}
                      onValueChange={(value) => handleFilterChange("grayscale", value[0])}
                      onValueCommit={() => handleFilterChangeComplete()}
                      className="w-full"
                    />
                  </div>

                  <div className="mb-4">
                    <div className="flex justify-between mb-1">
                      <label className="text-sm font-medium">Sepia: {filters.sepia}%</label>
                    </div>
                    <Slider
                      min={0}
                      max={100}
                      step={1}
                      value={[filters.sepia]}
                      onValueChange={(value) => handleFilterChange("sepia", value[0])}
                      onValueCommit={() => handleFilterChangeComplete()}
                      className="w-full"
                    />
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="preview" className="m-0 p-4 border-t">
              <div className="flex justify-center">
                <div className="bg-gray-800 p-4 rounded-lg">
                  <div
                    className="relative"
                    style={{
                      transform: `rotate(${rotation}deg) scale(${flipHorizontal ? -1 : 1}, ${flipVertical ? -1 : 1})`,
                    }}
                  >
                    <img
                      src={imageUrl || "/placeholder.svg"}
                      alt="Preview of edited image"
                      className="max-h-[60vh] max-w-full object-contain"
                      style={{ filter: filterString }}
                      crossOrigin="anonymous"
                    />
                  </div>
                </div>
              </div>
            </TabsContent>
          </div>
        </Tabs>

        {/* Hidden canvas for image processing */}
        <canvas ref={canvasRef} style={{ display: "none" }} />
      </DialogContent>
    </Dialog>
  )
}
