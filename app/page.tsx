"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { Send, Trash2, ImageIcon, X } from "lucide-react"
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
  const [messages, setMessages] = useState<Message[]>([
    { role: "assistant", content: "Hello! I'm Greenly, your eco-friendly AI assistant. How can I help you today?" },
  ])
  const [input, setInput] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [selectedImage, setSelectedImage] = useState<string | null>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

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

  const removeSelectedImage = () => {
    setSelectedImage(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
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
          responseContent += ` I can see the image you've shared. This is a simulated response from Greenly. In a real implementation, this would connect to your custom multi-modal LLM API that can analyze images.`
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
  }

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

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
              <form onSubmit={handleSubmit} className="flex items-end gap-2">
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
                      handleSubmit(e)
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
