"use client"

import type React from "react"

import { useEffect, useRef, useState } from "react"
import { useChatService } from "@/hooks/use-chat-service"
import { useImageHandler } from "@/hooks/use-image-handler"
import { Sidebar } from "@/components/ui/sidebar"
import { ChatHeader } from "@/components/chat/header"
import { MessageList } from "@/components/chat/message-list"
import { ChatInput } from "@/components/chat/chat-input"
import { InitialUpload } from "@/components/chat/initial-upload"
import { ErrorBanner } from "@/components/chat/error-banner"
import { useAuth } from "@/contexts/auth-context"
import { ChatHeaderImage } from "@/components/chat/chat-header-image"
import { Toaster } from "@/components/ui/toaster"
import { SelectionProvider, useSelection } from "@/contexts/selection-context"
import { SelectionToolbar } from "@/components/report/selection-toolbar"
import { ResourceModal } from "@/components/report/resource-modal"
import { PdfReport } from "@/components/report/pdf-report"
import { getPricingSchema } from "@/services/report-service"
import { Button } from "@/components/ui/button"
import { CheckSquare } from "lucide-react"

function ChatPage() {
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const { isAuthenticated, user } = useAuth()
  const [resourceModalOpen, setResourceModalOpen] = useState(false)
  // Update the reportState type to include simplePricing
  const [reportState, setReportState] = useState<{
    isOpen: boolean
    pricingSchema: any
    resourceName: string
    resourceDescription: string
    simplePricing?: string
  } | null>(null)
  const [isGeneratingReport, setIsGeneratingReport] = useState(false)

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

  const { isSelectionMode, toggleSelectionMode, selectedItems } = useSelection()

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

  // Handle generate report button click
  const handleGenerateReport = () => {
    if (selectedItems.length === 0) return
    setResourceModalOpen(true)
  }

  // Handle resource modal submit
  const handleResourceSubmit = async (resourceName: string, resourceDescription: string) => {
    try {
      setIsGeneratingReport(true)

      // Get the original image from the current chat
      const currentChat = getCurrentChat()
      const originalImage = currentChat?.mainImage || selectedItems.find((item) => item.image)?.image || ""

      // Get pricing schema from server
      const pricingResponse = await getPricingSchema({
        originalImage,
        resourceName,
        resourceDescription,
        userId: user?.id,
      })

      // Ensure we have a valid pricing schema, even if the request fails
      const pricingSchema = pricingResponse.success
        ? pricingResponse.pricingSchema
        : {
            basePrice: 299.99,
            additionalCosts: [
              {
                name: "Default service",
                price: 49.99,
                description: "Standard service fee",
              },
            ],
            totalPrice: 349.98,
            currency: "USD",
            notes: "This is a default pricing schema as we couldn't fetch the actual data.",
            estimatedTimeframe: "2-3 weeks",
          }

      // Open the PDF report
      setReportState({
        isOpen: true,
        pricingSchema,
        resourceName,
        resourceDescription,
        simplePricing: pricingResponse.simplePricing,
      })
    } catch (error) {
      console.error("Error generating report:", error)
    } finally {
      setIsGeneratingReport(false)
    }
  }

  // Toggle selection mode
  const handleToggleSelectionMode = () => {
    toggleSelectionMode()
  }

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
        >
          {!isInitialMode && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleToggleSelectionMode}
              className={`ml-2 ${isSelectionMode ? "bg-green-50 text-green-700 border-green-200" : ""}`}
            >
              <CheckSquare className="w-4 h-4 mr-2" />
              {isSelectionMode ? "Cancel Selection" : "Select Items"}
            </Button>
          )}
        </ChatHeader>

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
              <MessageList
                messages={getCurrentMessages()}
                isLoading={isLoading}
                messagesEndRef={messagesEndRef}
                onAddMessage={(message) => activeChat && addMessageToChat(activeChat, message)}
                activeChat={activeChat} // Pass the active chat ID
              />
            </main>

            {/* Selection Toolbar */}
            <SelectionToolbar onGenerateReport={handleGenerateReport} />

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

      {/* Resource Modal */}
      {resourceModalOpen && (
        <ResourceModal
          isOpen={resourceModalOpen}
          onClose={() => setResourceModalOpen(false)}
          onSubmit={handleResourceSubmit}
        />
      )}

      {/* PDF Report */}
      {reportState && (
        <PdfReport
          selectedItems={selectedItems}
          pricingSchema={reportState.pricingSchema}
          resourceName={reportState.resourceName}
          resourceDescription={reportState.resourceDescription}
          simplePricing={reportState.simplePricing}
          onClose={() => setReportState(null)}
        />
      )}

      {/* Toast notifications */}
      <Toaster />
    </div>
  )
}

export default function Page() {
  return (
    <SelectionProvider>
      <ChatPage />
    </SelectionProvider>
  )
}
