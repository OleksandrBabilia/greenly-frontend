"use client"

import type React from "react"

import type { Message } from "@/types"
import Image from "next/image"
import { format } from "date-fns"
import { Download, Leaf, Split, Edit2, Share2, CheckSquare } from "lucide-react"
import { useState } from "react"
import { ImageComparison } from "@/components/image/image-comparison"
import { GreenItModal } from "@/components/image/green-it-modal"
import { ImageEditor } from "@/components/image/image-editor"
import { ImageShareModal } from "@/components/image/image-share-modal"
import { Button } from "@/components/ui/button"
import { sendGreenItRequest, downloadImage } from "@/services/image-service"
import { useAuth } from "@/contexts/auth-context"
import { useToast } from "@/hooks/use-toast"
import { useSelection } from "@/contexts/selection-context"

// Update the MessageListProps interface to include activeChat
interface MessageListProps {
  messages: Message[]
  isLoading: boolean
  messagesEndRef: React.RefObject<HTMLDivElement>
  onAddMessage: (message: Message) => void
  activeChat: string | null // Add this line to get the current chat ID
}

// Update the function signature to include activeChat
export function MessageList({ messages, isLoading, messagesEndRef, onAddMessage, activeChat }: MessageListProps) {
  const { user } = useAuth()
  const { toast } = useToast()
  const { isSelectionMode, toggleItemSelection, isItemSelected } = useSelection()
  const [hoveredImageIndex, setHoveredImageIndex] = useState<number | null>(null)
  const [comparisonImages, setComparisonImages] = useState<{ original: string; processed: string } | null>(null)
  // Update the greenItModal state type to include chatId
  const [greenItModal, setGreenItModal] = useState<{
    isOpen: boolean
    originalImage: string | null
    currentImage: string
    chatId?: string
    imageName?: string
  } | null>(null)
  const [editorState, setEditorState] = useState<{
    isOpen: boolean
    imageUrl: string
    messageIndex: number
  } | null>(null)
  // Add state for the share modal
  const [shareState, setShareState] = useState<{
    isOpen: boolean
    imageUrl: string
    imageName?: string
  } | null>(null)

  // Find the original image for a response image
  const findOriginalImage = (currentIndex: number): string | null => {
    // Look backwards from the current message to find the most recent user message with an image
    for (let i = currentIndex - 1; i >= 0; i--) {
      if (messages[i].role === "user" && messages[i].image) {
        return messages[i].image || null
      }
    }
    return null
  }

  // Open image comparison modal
  const openComparison = (responseImage: string, index: number) => {
    const originalImage = findOriginalImage(index)
    if (originalImage) {
      setComparisonImages({
        original: originalImage,
        processed: responseImage,
      })
    } else {
      toast({
        title: "No original image found",
        description: "There's no original image to compare with.",
        variant: "destructive",
      })
    }
  }

  // Update the openGreenItModal function to include chatId
  const openGreenItModal = (currentImage: string, index: number, imageName?: string) => {
    const originalImage = findOriginalImage(index)

    setGreenItModal({
      isOpen: true,
      originalImage,
      currentImage,
      chatId: activeChat || undefined, // Store the active chat ID
      imageName,
    })
  }

  // Open image editor
  const openImageEditor = (imageUrl: string, index: number) => {
    setEditorState({
      isOpen: true,
      imageUrl,
      messageIndex: index,
    })
  }

  // Open image share modal
  const openShareModal = (imageUrl: string, imageName?: string) => {
    setShareState({
      isOpen: true,
      imageUrl,
      imageName,
    })
  }

  // Handle edited image save
  const handleSaveEditedImage = (editedImageUrl: string) => {
    if (!editorState) return

    // Add a new assistant message with the edited image
    onAddMessage({
      role: "assistant",
      content: "Here's your edited image:",
      timestamp: new Date(),
      image: editedImageUrl,
    })

    toast({
      title: "Image edited",
      description: "Your edited image has been saved.",
    })

    setEditorState(null)
  }

  // Update the handleGreenItSubmit function to pass chatId
  const handleGreenItSubmit = async (positivePrompt: string, negativePrompt: string) => {
    if (!greenItModal) return

    try {
      const result = await sendGreenItRequest(
        greenItModal.originalImage,
        greenItModal.currentImage,
        positivePrompt,
        negativePrompt,
        greenItModal.chatId, // Pass the chat ID to the request
        greenItModal.imageName,
        user?.id,
      )

      if (result.success && result.processedImage) {
        // Add a new assistant message with the processed image
        onAddMessage({
          role: "assistant",
          content: `Here's your eco-friendly image based on your prompts:\n\nWhat you wanted: ${positivePrompt}\n\nWhat you wanted to avoid: ${negativePrompt}`,
          timestamp: new Date(),
          image: result.processedImage, // Use image field, not responseImage
          image_name: result.processedImageName, // Store the processed image name
        })

        toast({
          title: "Success!",
          description: "Your eco-friendly image has been created.",
        })
      } else {
        throw new Error(result.error || "Failed to process image")
      }
    } catch (error) {
      console.error("Green It processing failed:", error)
      toast({
        title: "Processing failed",
        description: error instanceof Error ? error.message : "Failed to create eco-friendly image",
        variant: "destructive",
      })
      throw error // Re-throw to handle in the modal
    }
  }

  // Handle image download
  const handleDownloadImage = (imageUrl: string, imageName?: string, prefix = "") => {
    // If we have an image name, use it; otherwise, generate a name with timestamp
    if (imageName) {
      downloadImage(imageUrl, imageName)
    } else {
      const timestamp = format(new Date(), "yyyyMMdd-HHmmss")
      downloadImage(imageUrl, `greenly-${prefix}-${timestamp}.png`)
    }

    toast({
      title: "Image downloaded",
      description: "The image has been saved to your device.",
    })
  }

  // Handle item selection for report
  const handleItemSelection = (message: Message, index: number) => {
    if (!isSelectionMode) return

    const itemId = `message-${index}`
    const isImage = !!message.image

    toggleItemSelection({
      id: itemId,
      type: isImage ? "image" : "message",
      content: message.content,
      image: message.image,
      timestamp: message.timestamp || new Date(),
    })
  }

  // Helper function to render an image with proper handling for different formats
  const renderImage = (src: string, alt: string, index: number, isAssistantImage = false, imageName?: string) => {
    // Check if this response has a corresponding original image for comparison
    const hasOriginalForComparison = isAssistantImage && findOriginalImage(index) !== null
    const itemId = `image-${index}`
    const isSelected = isItemSelected(itemId)

    return (
      <div
        className={`${isAssistantImage ? "mt-3" : "mb-3"} relative group ${
          isSelectionMode ? "cursor-pointer" : ""
        } ${isSelected ? "ring-2 ring-green-500 ring-offset-2" : ""}`}
        onClick={() => {
          if (isSelectionMode) {
            toggleItemSelection({
              id: itemId,
              type: "image",
              content: "",
              image: src,
              timestamp: new Date(),
            })
          }
        }}
      >
        <Image
          src={src || "/placeholder.svg"}
          alt={alt}
          width={300}
          height={200}
          className={`rounded-md w-full object-contain ${isSelectionMode ? "transition-opacity" : ""}`}
          style={{ height: "200px", maxWidth: "300px" }} // Fixed consistent height
        />

        {/* Selection indicator */}
        {isSelectionMode && (
          <div
            className={`absolute top-2 left-2 w-6 h-6 rounded-full flex items-center justify-center ${
              isSelected ? "bg-green-500 text-white" : "bg-white text-gray-400 border border-gray-300"
            }`}
          >
            <CheckSquare className="w-4 h-4" />
          </div>
        )}

        {/* Action buttons - smaller icon buttons in the corner */}
        {isAssistantImage && !isSelectionMode && (
          <div className="absolute top-2 right-2 flex gap-1">
            {/* Edit button */}
            <Button
              onClick={() => openImageEditor(src, index)}
              className="bg-purple-600/80 hover:bg-purple-700 text-white rounded-full w-7 h-7 p-0 flex items-center justify-center shadow-md"
              size="icon"
              title="Edit Image"
            >
              <Edit2 className="w-3.5 h-3.5" />
            </Button>

            {/* Share button */}
            <Button
              onClick={() => openShareModal(src, imageName)}
              className="bg-blue-500/80 hover:bg-blue-600 text-white rounded-full w-7 h-7 p-0 flex items-center justify-center shadow-md"
              size="icon"
              title="Share Image"
            >
              <Share2 className="w-3.5 h-3.5" />
            </Button>

            {/* Download button */}
            <Button
              onClick={() => handleDownloadImage(src, imageName, isAssistantImage ? "processed" : "original")}
              className="bg-gray-600/80 hover:bg-gray-700 text-white rounded-full w-7 h-7 p-0 flex items-center justify-center shadow-md"
              size="icon"
              title="Download"
            >
              <Download className="w-3.5 h-3.5" />
            </Button>

            {/* Compare button - only show if there's an original image to compare with */}
            {hasOriginalForComparison && (
              <Button
                onClick={() => openComparison(src, index)}
                className="bg-blue-600/80 hover:bg-blue-700 text-white rounded-full w-7 h-7 p-0 flex items-center justify-center shadow-md"
                size="icon"
                title="Compare"
              >
                <Split className="w-3.5 h-3.5" />
              </Button>
            )}

            {/* Green It button */}
            <Button
              onClick={() => openGreenItModal(src, index, imageName)}
              className="bg-green-600/80 hover:bg-green-700 text-white rounded-full w-7 h-7 p-0 flex items-center justify-center shadow-md"
              size="icon"
              title="Green It!"
            >
              <Leaf className="w-3.5 h-3.5" />
            </Button>
          </div>
        )}
      </div>
    )
  }

  return (
    <>
      <div className="max-w-3xl mx-auto space-y-4 mb-24">
        {messages.map((message, index) => {
          const messageId = `message-${index}`
          const isSelected = isItemSelected(messageId)

          return (
            <div key={index} className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}>
              <div
                className={`max-w-[80%] rounded-lg p-4 ${
                  message.role === "user"
                    ? "bg-green-600 text-white"
                    : "bg-green-50 border border-green-100 text-gray-800"
                } ${isSelectionMode ? "cursor-pointer" : ""} ${isSelected ? "ring-2 ring-green-500" : ""}`}
                onClick={() => handleItemSelection(message, index)}
              >
                {/* Selection indicator */}
                {isSelectionMode && (
                  <div
                    className={`float-right ml-2 w-6 h-6 rounded-full flex items-center justify-center ${
                      isSelected
                        ? "bg-green-500 text-white"
                        : message.role === "user"
                          ? "bg-white/20 text-white"
                          : "bg-white text-gray-400 border border-gray-300"
                    }`}
                  >
                    <CheckSquare className="w-4 h-4" />
                  </div>
                )}

                {/* User uploaded image with consistent sizing */}
                {message.role === "user" && message.image && (
                  <div className="mb-3 relative">
                    <Image
                      src={message.image || "/placeholder.svg"}
                      alt="User uploaded image"
                      width={300}
                      height={200}
                      className="rounded-md w-full object-contain"
                      style={{ height: "200px", maxWidth: "300px" }}
                    />
                  </div>
                )}

                {/* Message content with consistent spacing */}
                <div className={message.image ? "mt-3" : ""}>{message.content}</div>

                {/* Display timestamp if available */}
                {message.timestamp && (
                  <div className={`text-xs mt-2 ${message.role === "user" ? "text-green-100" : "text-gray-400"}`}>
                    {format(new Date(message.timestamp), "MMM d, h:mm a")}
                  </div>
                )}

                {/* AI-generated image with action buttons */}
                {message.role === "assistant" &&
                  message.image &&
                  renderImage(message.image, "AI generated image", index, true, message.image_name)}
              </div>
            </div>
          )
        })}

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

      {/* Image comparison modal */}
      {comparisonImages && (
        <ImageComparison
          originalImage={comparisonImages.original}
          processedImage={comparisonImages.processed}
          onClose={() => setComparisonImages(null)}
        />
      )}

      {/* Green It modal */}
      {greenItModal && (
        <GreenItModal
          isOpen={greenItModal.isOpen}
          onClose={() => setGreenItModal(null)}
          originalImage={greenItModal.originalImage}
          currentImage={greenItModal.currentImage}
          imageName={greenItModal.imageName}
          onSubmit={handleGreenItSubmit}
        />
      )}

      {/* Image Editor modal */}
      {editorState && (
        <ImageEditor
          isOpen={editorState.isOpen}
          onClose={() => setEditorState(null)}
          imageUrl={editorState.imageUrl}
          onSave={handleSaveEditedImage}
        />
      )}

      {/* Image Share modal */}
      {shareState && (
        <ImageShareModal
          isOpen={shareState.isOpen}
          onClose={() => setShareState(null)}
          imageUrl={shareState.imageUrl}
          imageName={shareState.imageName}
        />
      )}
    </>
  )
}
