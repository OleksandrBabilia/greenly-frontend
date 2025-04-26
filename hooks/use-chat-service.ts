"use client"

import { useState } from "react"
import { v4 as uuidv4 } from "uuid"
import { format } from "date-fns"
import type { Chat, Message, ServerMessage } from "@/types"
import { useAuth } from "@/contexts/auth-context"

export function useChatService() {
  const { user, isAuthenticated } = useAuth()
  const [chats, setChats] = useState<Chat[]>([])
  const [activeChat, setActiveChat] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [isInitialMode, setIsInitialMode] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Fetch chat history from server
  const fetchChatHistory = async (chatId: string) => {
    // Only fetch chat history if user is authenticated
    if (!isAuthenticated) {
      // Add a welcome message for non-authenticated users
      addMessageToChat(chatId, {
        role: "assistant",
        content: "Hello! I'm Greenly, your eco-friendly AI assistant. Sign in to save your chat history.",
        timestamp: new Date(),
      })
      return
    }

    try {
      setIsLoading(true)
      setError(null)

      // Include user ID in the request
      const response = await fetch(`http://localhost:8080/chat/${chatId}?userId=${user?.id}`, {
        credentials: "include", // Include cookies for authentication
      })

      if (!response.ok) {
        throw new Error(`Failed to fetch chat history: ${response.status}`)
      }

      const data: ServerMessage[] = await response.json()

      // Convert server messages to our Message format
      const messages: Message[] = data.map((msg) => ({
        role: msg.role as "user" | "assistant",
        content: msg.content,
        timestamp: new Date(msg.timestamp),
      }))

      // If we have messages, update the chat
      if (messages.length > 0) {
        setChats((prev) =>
          prev.map((chat) => {
            if (chat.id === chatId) {
              return { ...chat, messages }
            }
            return chat
          }),
        )
      } else {
        // If no messages, add a welcome message
        addMessageToChat(chatId, {
          role: "assistant",
          content: "Hello! I'm Greenly, your eco-friendly AI assistant. How can I help you today?",
          timestamp: new Date(),
        })
      }
    } catch (error) {
      console.error("Error fetching chat history:", error)
      setError("Failed to load chat history")

      // Add a fallback welcome message if fetch fails
      addMessageToChat(chatId, {
        role: "assistant",
        content: "Hello! I'm Greenly, your eco-friendly AI assistant. How can I help you today?",
        timestamp: new Date(),
      })
    } finally {
      setIsLoading(false)
    }
  }

  // Create a new chat
  const createNewChat = () => {
    const newChatId = uuidv4()
    const newChat: Chat = {
      id: newChatId,
      title: `New Chat ${format(new Date(), "MMM d, h:mm a")}`,
      createdAt: new Date(),
      messages: [],
    }

    setChats((prev) => [...prev, newChat])
    setActiveChat(newChatId)
    setIsInitialMode(true)
    setError(null)

    // Fetch chat history (which will add a welcome message if none exists)
    fetchChatHistory(newChatId)

    return newChatId
  }

  // Switch to a different chat
  const switchChat = (chatId: string) => {
    setActiveChat(chatId)
    setIsInitialMode(false) // Always go to chat mode when switching to an existing chat
    setError(null)

    // Fetch chat history when switching to a chat
    fetchChatHistory(chatId)
  }

  // Delete a chat
  const deleteChat = (chatId: string) => {
    setChats((prev) => prev.filter((chat) => chat.id !== chatId))

    // If we're deleting the active chat, switch to another one or create a new one
    if (activeChat === chatId) {
      const remainingChats = chats.filter((chat) => chat.id !== chatId)
      if (remainingChats.length > 0) {
        setActiveChat(remainingChats[0].id)
      } else {
        createNewChat()
      }
    }
  }

  // Update chat title based on first user message
  const updateChatTitle = (chatId: string, message: Message) => {
    setChats((prev) =>
      prev.map((chat) => {
        if (chat.id === chatId) {
          // Extract a title from the message content (first 20 chars)
          const newTitle = message.content.split("\n")[0].substring(0, 20) + (message.content.length > 20 ? "..." : "")
          return { ...chat, title: newTitle }
        }
        return chat
      }),
    )
  }

  // Send message to server
  const sendMessageToServer = async (chatId: string, message: Message): Promise<Message | null> => {
    try {
      setError(null)

      // Prepare request body with optional user ID
      const requestBody: any = {
        chat_id: chatId,
        role: message.role,
        content: message.content,
        // Include image data if present
        ...(message.image && { image: message.image }),
      }

      // Add user ID if authenticated
      if (isAuthenticated && user) {
        requestBody.user_id = user.id
      }

      const response = await fetch("http://localhost:8080/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include", // Include cookies for authentication
        body: JSON.stringify(requestBody),
      })

      if (!response.ok) {
        throw new Error(`Failed to send message: ${response.status}`)
      }

      const data: ServerMessage = await response.json()

      // Convert server response to our Message format
      return {
        role: data.role as "user" | "assistant",
        content: data.content,
        timestamp: new Date(data.timestamp),
      }
    } catch (error) {
      console.error("Error sending message to server:", error)
      setError("Failed to send message")
      return null
    }
  }

  // Add a message to the current chat
  const addMessageToChat = (chatId: string, message: Message) => {
    setChats((prev) =>
      prev.map((chat) => {
        if (chat.id === chatId) {
          return { ...chat, messages: [...chat.messages, message] }
        }
        return chat
      }),
    )
  }

  // Get current active chat
  const getCurrentChat = (): Chat | undefined => {
    return chats.find((chat) => chat.id === activeChat)
  }

  // Get messages for current chat
  const getCurrentMessages = (): Message[] => {
    const chat = getCurrentChat()
    return chat ? chat.messages : []
  }

  return {
    chats,
    activeChat,
    isLoading,
    isInitialMode,
    setIsInitialMode,
    error,
    fetchChatHistory,
    createNewChat,
    switchChat,
    deleteChat,
    updateChatTitle,
    sendMessageToServer,
    addMessageToChat,
    getCurrentChat,
    getCurrentMessages,
  }
}
