"use client"

import type React from "react"

import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Upload, X } from "lucide-react"
import Image from "next/image"
import { useState } from "react"

interface InitialUploadProps {
  onSubmit: (prompt: string, objectDescription: string, image: string | null) => void
  isLoading: boolean
  selectedImage: string | null
  isDragging: boolean
  initialFileInputRef: React.RefObject<HTMLInputElement>
  handleDragOver: (e: React.DragEvent) => void
  handleDragLeave: (e: React.DragEvent) => void
  handleDrop: (e: React.DragEvent) => void
  handleImageSelect: (e: React.ChangeEvent<HTMLInputElement>) => void
  removeSelectedImage: () => void
}

export function InitialUpload({
  onSubmit,
  isLoading,
  selectedImage,
  isDragging,
  initialFileInputRef,
  handleDragOver,
  handleDragLeave,
  handleDrop,
  handleImageSelect,
  removeSelectedImage,
}: InitialUploadProps) {
  const [initialPrompt, setInitialPrompt] = useState("")
  const [objectDescription, setObjectDescription] = useState("")

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedImage || !initialPrompt.trim()) return

    onSubmit(initialPrompt, objectDescription, selectedImage)
    setInitialPrompt("")
    setObjectDescription("")
  }

  return (
    <main className="flex-1 container px-4 py-8 flex items-center justify-center overflow-auto">
      <div className="w-full max-w-3xl">
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold text-green-700 mb-2">Start a Conversation with Greenly</h2>
          <p className="text-gray-600">Upload an image and provide an initial prompt to begin</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div
            className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
              isDragging
                ? "border-green-500 bg-green-50"
                : selectedImage
                  ? "border-green-400"
                  : "border-gray-300 hover:border-green-300"
            }`}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={() => initialFileInputRef.current?.click()}
          >
            <input
              type="file"
              accept="image/*"
              onChange={handleImageSelect}
              className="hidden"
              ref={initialFileInputRef}
            />

            {selectedImage ? (
              <div className="relative inline-block">
                <Image
                  src={selectedImage || "/placeholder.svg"}
                  alt="Selected image"
                  width={400}
                  height={300}
                  className="max-h-[300px] w-auto mx-auto rounded-md object-contain"
                  style={{ height: "300px" }} // Fixed height for consistency
                />
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation()
                    removeSelectedImage()
                  }}
                  className="absolute -top-3 -right-3 bg-red-500 text-white rounded-full p-1.5 shadow-md hover:bg-red-600"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div
                className="py-12"
                style={{ height: "300px", display: "flex", flexDirection: "column", justifyContent: "center" }}
              >
                <Upload className="w-12 h-12 mx-auto text-gray-400 mb-4" />
                <p className="text-gray-500 mb-2">Drag and drop an image here, or click to select</p>
                <p className="text-sm text-gray-400">Supports JPG, PNG, GIF</p>
              </div>
            )}
          </div>

          <div>
            <label htmlFor="objectDescription" className="block text-sm font-medium text-gray-700 mb-2">
              What object is this? <span className="text-gray-400 text-xs">(optional)</span>
            </label>
            <Textarea
              id="objectDescription"
              value={objectDescription}
              onChange={(e) => setObjectDescription(e.target.value)}
              placeholder="Describe the main object in this image..."
              className="w-full min-h-[80px] max-h-[120px] border-green-200 focus-visible:ring-green-500"
            />
          </div>

          <div>
            <label htmlFor="initialPrompt" className="block text-sm font-medium text-gray-700 mb-2">
              Initial Prompt
            </label>
            <Textarea
              id="initialPrompt"
              value={initialPrompt}
              onChange={(e) => setInitialPrompt(e.target.value)}
              placeholder="Describe what you'd like to know about this image..."
              className="w-full border-green-200 focus-visible:ring-green-500"
              style={{ height: "120px", minHeight: "120px", maxHeight: "120px" }} // Match proportional height
            />
          </div>

          <Button
            type="submit"
            disabled={isLoading || !selectedImage || !initialPrompt.trim()}
            className="w-full bg-green-600 hover:bg-green-700 text-white py-3 text-lg"
          >
            {isLoading ? (
              <div className="flex items-center justify-center">
                <div className="w-5 h-5 border-t-2 border-r-2 border-white rounded-full animate-spin mr-2"></div>
                Processing...
              </div>
            ) : (
              "Start Conversation"
            )}
          </Button>
        </form>
      </div>
    </main>
  )
}
