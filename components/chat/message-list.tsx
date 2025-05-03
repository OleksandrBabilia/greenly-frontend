"use client"

import type React from "react"

import type { Message } from "@/types"
import Image from "next/image"
import { format } from "date-fns"
import { Leaf } from "lucide-react"
import { useState } from "react"

interface MessageListProps {
  messages: Message[]
  isLoading: boolean
  messagesEndRef: React.RefObject<HTMLDivElement>
}

// Update the MessageList component to handle image responses properly
export function MessageList({ messages, isLoading, messagesEndRef }: MessageListProps) {
  const [hoveredImageIndex, setHoveredImageIndex] = useState<number | null>(null)

  const handleGreenIt = (imageUrl: string) => {
    console.log("Green It! clicked for image:", imageUrl)
    alert("Green It! feature would process this image to make it more eco-friendly.")
  }

  // Helper function to determine if an image is base64 or a URL
  const isBase64Image = (src: string) => {
    return src.startsWith("data:") || src.startsWith("blob:")
  }

  // Helper function to render an image with proper handling for different formats
  const renderImage = (src: string, alt: string, index: number, isResponse = false) => {
    return (
      <div
        className={`${isResponse ? "mt-3" : "mb-3"} relative`}
        onMouseEnter={() => isResponse && setHoveredImageIndex(index)}
        onMouseLeave={() => isResponse && setHoveredImageIndex(null)}
      >
        <Image
          src={src || "/placeholder.svg"}
          alt={alt}
          width={300}
          height={200}
          className="rounded-md max-w-full object-contain"
          style={{ maxHeight: "300px" }}
        />

        {/* Green It! button that appears on hover for response images */}
        {isResponse && hoveredImageIndex === index && (
          <button
            onClick={() => handleGreenIt(src)}
            className="absolute bottom-3 right-3 bg-green-600 hover:bg-green-700 text-white px-3 py-2 rounded-md flex items-center gap-1.5 shadow-lg transition-all"
          >
            <Leaf className="w-4 h-4" />
            Green It!
          </button>
        )}
      </div>
    )
  }

  return (
    <div className="max-w-3xl mx-auto space-y-4 mb-24">
      {messages.map((message, index) => (
        <div key={index} className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}>
          <div
            className={`max-w-[80%] rounded-lg p-4 ${
              message.role === "user" ? "bg-green-600 text-white" : "bg-green-50 border border-green-100 text-gray-800"
            }`}
          >
            {/* User uploaded image */}
            {message.image && renderImage(message.image, "User uploaded image", index)}

            {/* Message content */}
            {message.content}

            {/* Display timestamp if available */}
            {message.timestamp && (
              <div className={`text-xs mt-2 ${message.role === "user" ? "text-green-100" : "text-gray-400"}`}>
                {format(new Date(message.timestamp), "MMM d, h:mm a")}
              </div>
            )}

            {/* AI-generated image with hover effect and Green It! button */}
            {message.responseImage && renderImage(message.responseImage, "AI generated image", index, true)}
          </div>
        </div>
      ))}

      {isLoading && (
        <div className="flex justify-start">
          <div className="max-w-[80%] rounded-lg p-4 bg-green-50 border border-green-100">
            <div className="flex space-x-2">
              <div className="w-2 h-2 bg-green-400 rounded-full animate-bounce"></div>
              <div
                className="w-2 h-2 bg-green-400 rounded-full animate-bounce"
                style={{ animationDelay: "0.2s" }}
              ></div>
              <div
                className="w-2 h-2 bg-green-400 rounded-full animate-bounce"
                style={{ animationDelay: "0.4s" }}
              ></div>
            </div>
          </div>
        </div>
      )}

      <div ref={messagesEndRef} />
    </div>
  )
}
