"use client"

import type React from "react"

import { useEffect, useRef } from "react"
import { ThemeProvider } from "@/components/theme-provider"
import { useState } from "react"
import { useChatService } from "@/hooks/use-chat-service"
import { useImageHandler } from "@/hooks/use-image-handler"
import { Sidebar } from "@/components/ui/sidebar"
import { ChatHeader } from "@/components/chat/header"
import { MessageList } from "@/components/chat/message-list"
import { ChatInput } from "@/components/chat/chat-input"
import { InitialUpload } from "@/components/chat/initial-upload"
import { ErrorBanner } from "@/components/chat/error-banner"

export default function ChatPage() {
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const {
    chats,
    activeChat,
    isLoading,
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

  // Initialize with a new chat when the component mounts
  useEffect(() => {
    createNewChat()
  }, [])

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [chats, activeChat])

  // Handle initial upload submission
  const handleInitialSubmit = async (prompt: string, objectDescription: string, image: string | null) => {
    if (!image || !prompt.trim() || !activeChat) return

    // Add user message with initial image and prompt
    const userMessage = {
      role: "user" as const,
      content: objectDescription ? `${prompt}\n\nObject in image: ${objectDescription}` : prompt,
      image,
      timestamp: new Date(),
    }

    // Add message to local state first for immediate feedback
    addMessageToChat(activeChat, userMessage)

    // Update chat title based on first message
    updateChatTitle(activeChat, userMessage)

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

      // Switch to chat mode
      setIsInitialMode(false)
      resetImageInputs()
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

  // Handle chat message submission
  const handleChatSubmit = async (content: string, image: string | null) => {
    if ((!content.trim() && !image) || !activeChat) return

    // Add user message
    const userMessage = {
      role: "user" as const,
      content,
      ...(image && { image }),
      timestamp: new Date(),
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

  return (
    <ThemeProvider attribute="class" defaultTheme="light">
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
        />

        {/* Main Content */}
        <div className="flex-1 flex flex-col h-full overflow-hidden">
          {/* Header */}
          <ChatHeader
            title={getCurrentChat()?.title || "New Chat"}
            isInitialMode={isInitialMode}
            setSidebarOpen={setSidebarOpen}
            createNewChat={createNewChat}
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
    </ThemeProvider>
  )
}
