"use client"

import type React from "react"

import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { ImageIcon, Send, X } from "lucide-react"
import Image from "next/image"
import { useState } from "react"

interface ChatInputProps {
  onSubmit: (content: string, image: string | null) => void
  isLoading: boolean
  selectedImage: string | null
  removeSelectedImage: () => void
  fileInputRef: React.RefObject<HTMLInputElement>
  handleImageSelect: (e: React.ChangeEvent<HTMLInputElement>) => void
}

export function ChatInput({
  onSubmit,
  isLoading,
  selectedImage,
  removeSelectedImage,
  fileInputRef,
  handleImageSelect,
}: ChatInputProps) {
  const [input, setInput] = useState("")

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim() && !selectedImage) return

    onSubmit(input, selectedImage)
    setInput("")
  }

  return (
    <footer className="sticky bottom-0 border-t border-green-100 bg-white py-4">
      <div className="container px-4">
        <div className="max-w-3xl mx-auto">
          <form onSubmit={handleSubmit} className="flex items-end gap-2">
            <input type="file" accept="image/*" onChange={handleImageSelect} className="hidden" ref={fileInputRef} />
            <Button
              type="button"
              variant="outline"
              size="icon"
              onClick={() => fileInputRef.current?.click()}
              className="text-green-600 border-green-200 hover:bg-green-50 flex-shrink-0"
            >
              <ImageIcon className="w-4 h-4" />
            </Button>

            <div className="flex-1 flex gap-2">
              {selectedImage && (
                <div className="relative flex-shrink-0">
                  <Image
                    src={selectedImage || "/placeholder.svg"}
                    alt="Selected image preview"
                    width={100}
                    height={100}
                    className="rounded-md object-cover"
                    style={{ width: "100px", height: "100px" }}
                  />
                  <button
                    onClick={removeSelectedImage}
                    className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              )}

              <Textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Type your message here..."
                className={`border-green-200 focus-visible:ring-green-500 resize-none ${
                  selectedImage
                    ? "min-h-[100px] max-h-[100px]" // Exact match to image height
                    : "min-h-[60px] max-h-[200px]"
                }`}
                style={selectedImage ? { height: "100px" } : undefined}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault()
                    handleSubmit(e)
                  }
                }}
              />
            </div>

            <Button
              type="submit"
              disabled={isLoading || (!input.trim() && !selectedImage)}
              className="bg-green-600 hover:bg-green-700 text-white flex-shrink-0"
            >
              <Send className="w-4 h-4" />
            </Button>
          </form>
        </div>
      </div>
    </footer>
  )
}
