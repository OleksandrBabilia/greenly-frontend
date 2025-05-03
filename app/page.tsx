"use client"

import type React from "react"

import { useEffect, useRef } from "react"
import { useState } from "react"
import { useChatService } from "@/hooks/use-chat-service"
import { useImageHandler } from "@/hooks/use-image-handler"
import { Sidebar } from "@/components/ui/sidebar"
import { ChatHeader } from "@/components/chat/header"
import { MessageList } from "@/components/chat/message-list"
import { ChatInput } from "@/components/chat/chat-input"
import { InitialUpload } from "@/components/chat/initial-upload"
import { ErrorBanner } from "@/components/chat/error-banner"
import { useAuth } from "@/contexts/auth-context"
// Update the imports to include ChatHeaderImage
import { ChatHeaderImage } from "@/components/chat/chat-header-image"

export default function ChatPage() {
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const { isAuthenticated } = useAuth()

  const {
    chats,
    activeChat,
    isLoading,
    isLoadingChats,
    isInitialMode,
    setIsInitialMode,
    error,
    createNewChat,
    switchChat,
    deleteChat,
    updateChatTitle,
    sendMessageToServer,
    addMessageToChat,
    getCurrentChat,
    getCurrentMessages,
    refreshUserChats,
  } = useChatService()

  const {
    selectedImage,
    isDragging,
    fileInputRef,
    initialFileInputRef,
    handleImageSelect,
    handleDragOver,
    handleDragLeave,
    handleDrop,
    removeSelectedImage,
    resetImageInputs,
  } = useImageHandler()

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [chats, activeChat])

  // Update the handleInitialSubmit function to store the main image
  const handleInitialSubmit = async (prompt: string, objectDescription: string, image: string | null) => {
    if (!image || !prompt.trim()) return

    // Create a new chat with the main image and object name
    const chatId = createNewChat(image, objectDescription)

    // Add user message with initial image and prompt
    const userMessage = {
      role: "user" as const,
      content: objectDescription ? `${prompt}\n\nObject in image: ${objectDescription}` : prompt,
      image,
      timestamp: new Date(),
      objectName: objectDescription || "", // Store object name directly
    }

    // Add message to local state first for immediate feedback
    addMessageToChat(chatId, userMessage)

    // Update chat title based on first message
    updateChatTitle(chatId, userMessage)

    try {
      // Send message to server
      const serverResponse = await sendMessageToServer(chatId, userMessage)

      if (!serverResponse) {
        throw new Error("Failed to get response from server")
      }

      // Add AI response from server
      addMessageToChat(chatId, {
        ...serverResponse,
        // If the server doesn't provide these, we can add them client-side
        ...(Math.random() > 0.5 &&
          !serverResponse.responseImage && {
            responseImage:
              "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjMwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iNDAwIiBoZWlnaHQ9IjMwMCIgZmlsbD0iI2YwZjlmMCIvPjxjaXJjbGUgY3g9IjIwMCIgY3k9IjE1MCIgcj0iODAiIGZpbGw9IiM0YWRlODAiLz48cGF0aCBkPSJNMTYwIDEyMEMyMDAgODAgMjQwIDEyMCAyNDAgMTIwQzI0MCAxMjAgMjgwIDE2MCAyNDAgMjAwQzIwMCAyNDAgMTYwIDIwMCAxNjAgMjAwQzE2MCAyMDAgMTIwIDE2MCAxNjAgMTIwWiIgZmlsbD0iIzIyYzU1ZSIvPjxwYXRoIGQ9Ik0yMDAgNzBMMjEwIDkwTDIzMCA5MEwyMTUgMTA1TDIyMCAxMjVMMjAwIDExNUwxODAgMTI1TDE4NSAxMDVMMTcwIDkwTDE5MCA5MFoiIGZpbGw9IiMxNmEzNGEiLz48L3N2Zz4=",
          }),
      })

      // Refresh user chats if authenticated
      if (isAuthenticated) {
        refreshUserChats()
      }

      // Switch to chat mode
      setIsInitialMode(false)
      resetImageInputs()
    } catch (error) {
      console.error("Error:", error)

      // Add fallback error message if server request fails
      addMessageToChat(chatId, {
        role: "assistant",
        content: "Sorry, I encountered an error. Please try again.",
        timestamp: new Date(),
      })
    }
  }

  // Update the handleChatSubmit function to handle unauthenticated users
  const handleChatSubmit = async (content: string, image: string | null) => {
    if ((!content.trim() && !image) || !activeChat) return

    // Extract object name if it's in the content
    let objectName = ""
    if (content.includes("Object in image:")) {
      const objectMatch = content.match(/Object in image:\s*(.+)$/m)
      if (objectMatch && objectMatch[1]) {
        objectName = objectMatch[1].trim()
      }
    }

    // Add user message
    const userMessage = {
      role: "user" as const,
      content,
      ...(image && { image }),
      timestamp: new Date(),
      ...(objectName && { objectName }),
    }

    // Add message to local state first for immediate feedback
    addMessageToChat(activeChat, userMessage)
    resetImageInputs()

    try {
      // Send message to server
      const serverResponse = await sendMessageToServer(activeChat, userMessage)

      if (!serverResponse) {
        throw new Error("Failed to get response from server")
      }

      // Add AI response from server
      addMessageToChat(activeChat, {
        ...serverResponse,
        // If the server doesn't provide these, we can add them client-side
        ...(Math.random() > 0.5 && {
          responseImage:
            "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjMwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iNDAwIiBoZWlnaHQ9IjMwMCIgZmlsbD0iI2YwZjlmMCIvPjxjaXJjbGUgY3g9IjIwMCIgY3k9IjE1MCIgcj0iODAiIGZpbGw9IiM0YWRlODAiLz48cGF0aCBkPSJNMTYwIDEyMEMyMDAgODAgMjQwIDEyMCAyNDAgMTIwQzI0MCAxMjAgMjgwIDE2MCAyNDAgMjAwQzIwMCAyNDAgMTYwIDIwMCAxNjAgMjAwQzE2MCAyMDAgMTIwIDE2MCAxNjAgMTIwWiIgZmlsbD0iIzIyYzU1ZSIvPjxwYXRoIGQ9Ik0yMDAgNzBMMjEwIDkwTDIzMCA5MEwyMTUgMTA1TDIyMCAxMjVMMjAwIDExNUwxODAgMTI1TDE4NSAxMDVMMTcwIDkwTDE5MCA5MFoiIGZpbGw9IiMxNmEzNGEiLz48L3N2Zz4=",
        }),
      })

      // Refresh user chats if authenticated
      if (isAuthenticated) {
        refreshUserChats()
      }
    } catch (error) {
      console.error("Error:", error)

      // Add fallback error message if server request fails
      addMessageToChat(activeChat, {
        role: "assistant",
        content: "Sorry, I encountered an error. Please try again.",
        timestamp: new Date(),
      })
    }
  }

  // Handle chat deletion with event stopping
  const handleDeleteChat = (chatId: string, e: React.MouseEvent) => {
    e.stopPropagation() // Prevent triggering the switchChat
    deleteChat(chatId)
  }

  // Update the JSX to include the ChatHeaderImage component
  return (
    <div className="flex h-screen bg-white">
      {/* Sidebar */}
      <Sidebar
        chats={chats}
        activeChat={activeChat}
        sidebarOpen={sidebarOpen}
        setSidebarOpen={setSidebarOpen}
        createNewChat={createNewChat}
        switchChat={switchChat}
        deleteChat={handleDeleteChat}
        isLoading={isLoadingChats}
      />

      {/* Main Content */}
      <div className="flex-1 flex flex-col h-full overflow-hidden">
        {/* Header */}
        <ChatHeader
          title={getCurrentChat()?.title || "New Chat"}
          isInitialMode={isInitialMode}
          setSidebarOpen={setSidebarOpen}
          createNewChat={() => createNewChat()}
        />

        {/* Error Banner */}
        <ErrorBanner error={error} />

        {/* Content Area */}
        {isInitialMode ? (
          <InitialUpload
            onSubmit={handleInitialSubmit}
            isLoading={isLoading}
            selectedImage={selectedImage}
            isDragging={isDragging}
            initialFileInputRef={initialFileInputRef}
            handleDragOver={handleDragOver}
            handleDragLeave={handleDragLeave}
            handleDrop={handleDrop}
            handleImageSelect={handleImageSelect}
            removeSelectedImage={removeSelectedImage}
          />
        ) : (
          <>
            {/* Main Image Header */}
            <ChatHeaderImage mainImage={getCurrentChat()?.mainImage} objectName={getCurrentChat()?.objectName} />

            {/* Chat Messages */}
            <main className="flex-1 container px-4 py-6 overflow-auto">
              <MessageList messages={getCurrentMessages()} isLoading={isLoading} messagesEndRef={messagesEndRef} />
            </main>

            {/* Chat Input */}
            <ChatInput
              onSubmit={handleChatSubmit}
              isLoading={isLoading}
              selectedImage={selectedImage}
              removeSelectedImage={removeSelectedImage}
              fileInputRef={fileInputRef}
              handleImageSelect={handleImageSelect}
            />
          </>
        )}
      </div>
    </div>
  )
}
