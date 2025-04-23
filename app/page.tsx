"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { Send, Trash2, ImageIcon, X, Upload } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { ThemeProvider } from "@/components/theme-provider"
import Image from "next/image"

type Message = {
  role: "user" | "assistant"
  content: string
  image?: string // Base64 encoded image
}

export default function ChatPage() {
  // State to track if we're in initial upload mode or chat mode
  const [isInitialMode, setIsInitialMode] = useState(true)

  const [messages, setMessages] = useState<Message[]>([
    { role: "assistant", content: "Hello! I'm Greenly, your eco-friendly AI assistant. How can I help you today?" },
  ])
  const [input, setInput] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [selectedImage, setSelectedImage] = useState<string | null>(null)
  const [initialPrompt, setInitialPrompt] = useState("")
  const [isDragging, setIsDragging] = useState(false)
  // Add a new state variable for the object description after the initialPrompt state
  const [objectDescription, setObjectDescription] = useState("")

  const messagesEndRef = useRef<HTMLDivElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const initialFileInputRef = useRef<HTMLInputElement>(null)

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0]
      const reader = new FileReader()

      reader.onload = (event) => {
        if (event.target?.result) {
          setSelectedImage(event.target.result as string)
        }
      }

      reader.readAsDataURL(file)
    }
  }

  const handleInitialImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0]
      const reader = new FileReader()

      reader.onload = (event) => {
        if (event.target?.result) {
          setSelectedImage(event.target.result as string)
        }
      }

      reader.readAsDataURL(file)
    }
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0]
      const reader = new FileReader()

      reader.onload = (event) => {
        if (event.target?.result) {
          setSelectedImage(event.target.result as string)
        }
      }

      reader.readAsDataURL(file)
    }
  }

  const removeSelectedImage = () => {
    setSelectedImage(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
    if (initialFileInputRef.current) {
      initialFileInputRef.current.value = ""
    }
  }

  const handleInitialSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedImage || !initialPrompt.trim()) return

    setIsLoading(true)

    // Add user message with initial image and prompt
    // Update the handleInitialSubmit function to include the object description in the user message
    // Find this section in the handleInitialSubmit function:
    // And replace it with:
    const userMessage: Message = {
      role: "user",
      content: objectDescription ? `${initialPrompt}\n\nObject in image: ${objectDescription}` : initialPrompt,
      image: selectedImage,
    }

    try {
      // In a real implementation, this would call your custom LLM API
      // For now, we'll simulate a response
      setTimeout(() => {
        // Add the user message to chat history
        setMessages((prev) => [...prev, userMessage])

        // Add AI response
        const aiResponse: Message = {
          role: "assistant",
          content: `Thank you for sharing this image. I can see what you've uploaded. ${initialPrompt.includes("?") ? "Let me answer your question." : "What would you like to know about it?"} This is a simulated response from Greenly. In a real implementation, this would connect to your custom multi-modal LLM API that can analyze images.`,
        }

        setMessages((prev) => [...prev, aiResponse])
        setIsLoading(false)

        // Switch to chat mode
        setIsInitialMode(false)

        // Reset states
        setInitialPrompt("")
        setSelectedImage(null)
      }, 1500)

      // Example of how you might use the AI SDK with a real implementation:
      // const response = await fetch('/api/chat', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({
      //     messages: [...messages, userMessage],
      //     image: selectedImage
      //   }),
      // });
      // const data = await response.json();
      // setMessages(prev => [...prev, { role: 'assistant', content: data.text }]);
      // setIsInitialMode(false);
    } catch (error) {
      console.error("Error:", error)
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: "Sorry, I encountered an error. Please try again." },
      ])
      setIsLoading(false)
    }
  }

  const handleChatSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim() && !selectedImage) return

    // Add user message
    const userMessage: Message = {
      role: "user",
      content: input,
      ...(selectedImage && { image: selectedImage }),
    }

    setMessages((prev) => [...prev, userMessage])
    setInput("")
    setSelectedImage(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
    setIsLoading(true)

    try {
      // In a real implementation, this would call your custom LLM API
      // For now, we'll simulate a response
      setTimeout(() => {
        let responseContent = `Thank you for your message.`

        if (userMessage.image) {
          responseContent += ` I can see the new image you've shared. This is a simulated response from Greenly. In a real implementation, this would connect to your custom multi-modal LLM API that can analyze images.`
        } else {
          responseContent += ` This is a simulated response from Greenly. In a real implementation, this would connect to your custom LLM API.`
        }

        const aiResponse: Message = {
          role: "assistant",
          content: responseContent,
        }

        setMessages((prev) => [...prev, aiResponse])
        setIsLoading(false)
      }, 1000)
    } catch (error) {
      console.error("Error:", error)
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: "Sorry, I encountered an error. Please try again." },
      ])
      setIsLoading(false)
    }
  }

  const clearChat = () => {
    setMessages([
      { role: "assistant", content: "Hello! I'm Greenly, your eco-friendly AI assistant. How can I help you today?" },
    ])
    setIsInitialMode(true)
    setSelectedImage(null)
    setInitialPrompt("")
    // Also update the clearChat function to reset the objectDescription state:
    setObjectDescription("")
    setInput("")
  }

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  // Initial Upload Mode UI
  if (isInitialMode) {
    return (
      <ThemeProvider attribute="class" defaultTheme="light">
        <div className="flex flex-col min-h-screen bg-white">
          <header className="sticky top-0 z-10 border-b border-green-100 bg-white">
            <div className="container flex items-center justify-between h-16 px-4">
              <div className="flex items-center">
                <div className="w-8 h-8 mr-2 bg-green-500 rounded-full"></div>
                <h1 className="text-xl font-bold text-green-700">Greenly</h1>
              </div>
            </div>
          </header>

          <main className="flex-1 container px-4 py-8 flex items-center justify-center">
            <div className="w-full max-w-3xl">
              <div className="text-center mb-8">
                <h2 className="text-2xl font-bold text-green-700 mb-2">Start a Conversation with Greenly</h2>
                <p className="text-gray-600">Upload an image and provide an initial prompt to begin</p>
              </div>

              <form onSubmit={handleInitialSubmit} className="space-y-6">
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
                    onChange={handleInitialImageSelect}
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
                        className="max-h-[400px] w-auto mx-auto rounded-md object-contain"
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
                    <div className="py-12">
                      <Upload className="w-12 h-12 mx-auto text-gray-400 mb-4" />
                      <p className="text-gray-500 mb-2">Drag and drop an image here, or click to select</p>
                      <p className="text-sm text-gray-400">Supports JPG, PNG, GIF</p>
                    </div>
                  )}
                </div>

                {/* Find the Initial Upload Mode UI form section with the Textarea for initialPrompt */}
                {/* Add this new input field between the image upload area and the initial prompt: */}
                <div>
                  <label htmlFor="objectDescription" className="block text-sm font-medium text-gray-700 mb-2">
                    What object is this? <span className="text-gray-400 text-xs">(optional)</span>
                  </label>
                  <Textarea
                    id="objectDescription"
                    value={objectDescription}
                    onChange={(e) => setObjectDescription(e.target.value)}
                    placeholder="Describe the main object in this image..."
                    className="w-full min-h-[60px] border-green-200 focus-visible:ring-green-500"
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
                    className="w-full min-h-[100px] border-green-200 focus-visible:ring-green-500"
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
        </div>
      </ThemeProvider>
    )
  }

  // Chat Mode UI
  return (
    <ThemeProvider attribute="class" defaultTheme="light">
      <div className="flex flex-col min-h-screen bg-white">
        <header className="sticky top-0 z-10 border-b border-green-100 bg-white">
          <div className="container flex items-center justify-between h-16 px-4">
            <div className="flex items-center">
              <div className="w-8 h-8 mr-2 bg-green-500 rounded-full"></div>
              <h1 className="text-xl font-bold text-green-700">Greenly</h1>
            </div>
            <Button
              variant="outline"
              size="icon"
              onClick={clearChat}
              className="text-green-600 border-green-200 hover:bg-green-50 hover:text-green-700"
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>
        </header>

        <main className="flex-1 container px-4 py-6 overflow-auto">
          <div className="max-w-3xl mx-auto space-y-4 mb-24">
            {messages.map((message, index) => (
              <div key={index} className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}>
                <div
                  className={`max-w-[80%] rounded-lg p-4 ${
                    message.role === "user"
                      ? "bg-green-600 text-white"
                      : "bg-green-50 border border-green-100 text-gray-800"
                  }`}
                >
                  {message.image && (
                    <div className="mb-3">
                      <Image
                        src={message.image || "/placeholder.svg"}
                        alt="User uploaded image"
                        width={300}
                        height={200}
                        className="rounded-md max-w-full object-contain"
                        style={{ maxHeight: "300px" }}
                      />
                    </div>
                  )}
                  {message.content}
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
        </main>

        <footer className="sticky bottom-0 border-t border-green-100 bg-white py-4">
          <div className="container px-4">
            <div className="max-w-3xl mx-auto">
              {selectedImage && (
                <div className="mb-2 relative inline-block">
                  <Image
                    src={selectedImage || "/placeholder.svg"}
                    alt="Selected image preview"
                    width={100}
                    height={100}
                    className="rounded-md object-cover"
                    style={{ maxHeight: "100px" }}
                  />
                  <button
                    onClick={removeSelectedImage}
                    className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              )}
              <form onSubmit={handleChatSubmit} className="flex items-end gap-2">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageSelect}
                  className="hidden"
                  ref={fileInputRef}
                />
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  onClick={() => fileInputRef.current?.click()}
                  className="text-green-600 border-green-200 hover:bg-green-50"
                >
                  <ImageIcon className="w-4 h-4" />
                </Button>
                <Textarea
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Type your message here..."
                  className="flex-1 min-h-[60px] max-h-[200px] border-green-200 focus-visible:ring-green-500"
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault()
                      handleChatSubmit(e)
                    }
                  }}
                />
                <Button
                  type="submit"
                  disabled={isLoading || (!input.trim() && !selectedImage)}
                  className="bg-green-600 hover:bg-green-700 text-white"
                >
                  <Send className="w-4 h-4" />
                </Button>
              </form>
            </div>
          </div>
        </footer>
      </div>
    </ThemeProvider>
  )
}
