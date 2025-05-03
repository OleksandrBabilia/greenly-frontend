"use client"

import { useState, useEffect, useCallback, useRef } from "react"
import { v4 as uuidv4 } from "uuid"
import { format } from "date-fns"
import type { Chat, Message, ServerMessage } from "@/types"
import { useAuth } from "@/contexts/auth-context"
import { convertToNipIo } from "@/utils/nip-io"
import { getApiUrl } from "@/utils/api-config"

export function useChatService() {
  const { user, isAuthenticated, fetchUserChats } = useAuth()
  const [chats, setChats] = useState<Chat[]>([])
  const [activeChat, setActiveChat] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [isInitialMode, setIsInitialMode] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isLoadingChats, setIsLoadingChats] = useState(false)

  // Use a ref to track if we've already initialized a chat
  // This prevents infinite loops when creating a new chat
  const hasInitializedRef = useRef(false)

  // Use a ref to track if we've loaded user chats
  // This prevents multiple calls to loadUserChats
  const hasLoadedUserChatsRef = useRef(false)

  // Load all user chats when authenticated
  const loadUserChats = useCallback(async () => {
    // Prevent multiple calls to loadUserChats
    if (hasLoadedUserChatsRef.current) return

    if (!isAuthenticated || !user) {
      // Early return if user is not authenticated
      setIsLoadingChats(false)
      return
    }

    try {
      setIsLoadingChats(true)
      setError(null)
      hasLoadedUserChatsRef.current = true

      const messages = await fetchUserChats()

      if (!messages || messages.length === 0) {
        setIsLoadingChats(false)
        return
      }

      // Group messages by chat_id
      const chatMap = new Map<string, Message[]>()

      messages.forEach((msg: any) => {
        if (!chatMap.has(msg.chat_id)) {
          chatMap.set(msg.chat_id, [])
        }

        chatMap.get(msg.chat_id)?.push({
          role: msg.role as "user" | "assistant",
          content: msg.content,
          timestamp: new Date(msg.timestamp),
          ...(msg.image && { image: msg.image }),
          ...(msg.responseImage && { responseImage: msg.responseImage }),
          ...(msg.object_name && { objectName: msg.object_name }),
        })
      })

      // Create chat objects from the grouped messages
      const userChats: Chat[] = Array.from(chatMap.entries()).map(([chatId, messages]) => {
        // Sort messages by timestamp
        const sortedMessages = [...messages].sort(
          (a, b) => (a.timestamp?.getTime() || 0) - (b.timestamp?.getTime() || 0),
        )

        // Use the first user message as the chat title if available
        const firstUserMessage = sortedMessages.find((msg) => msg.role === "user")
        const title = firstUserMessage
          ? firstUserMessage.content.split("\n")[0].substring(0, 20) +
            (firstUserMessage.content.length > 20 ? "..." : "")
          : `Chat ${format(new Date(sortedMessages[0]?.timestamp || new Date()), "MMM d, h:mm a")}`

        return {
          id: chatId,
          title,
          createdAt: new Date(sortedMessages[0]?.timestamp || new Date()),
          messages: sortedMessages,
        }
      })

      // Sort chats by creation date (newest first)
      userChats.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())

      setChats(userChats)

      // Set the active chat to the most recent one if none is selected
      if (!activeChat && userChats.length > 0) {
        setActiveChat(userChats[0].id)
        setIsInitialMode(false)
      }
    } catch (error) {
      console.error("Error loading user chats:", error)
      setError("Failed to load your chat history")
    } finally {
      setIsLoadingChats(false)
    }
  }, [isAuthenticated, user, fetchUserChats, activeChat])

  // Load user chats when authentication state changes
  useEffect(() => {
    if (isAuthenticated) {
      // Reset the ref when auth state changes
      hasLoadedUserChatsRef.current = false
      loadUserChats()
    } else {
      // Clear chats when user logs out
      setChats([])
      setActiveChat(null)
      hasLoadedUserChatsRef.current = false
    }
  }, [isAuthenticated, loadUserChats])

  // Fetch chat history from server
  const fetchChatHistory = async (chatId: string) => {
    // Only fetch chat history if user is authenticated
    if (!isAuthenticated || !user) {
      // Add a welcome message for non-authenticated users
      addMessageToChat(chatId, {
        role: "assistant",
        content: "Hello! I'm Greenly, your eco-friendly AI assistant. Sign in to save your chat history.",
        timestamp: new Date(),
      })
      return
    }

    // If we already have this chat loaded, no need to fetch it again
    const existingChat = chats.find((chat) => chat.id === chatId)
    if (existingChat && existingChat.messages.length > 0) {
      return
    }

    try {
      setIsLoading(true)
      setError(null)

      // Use nip.io for IP addresses
      const chatUrl = convertToNipIo(getApiUrl(`chat/${chatId}?userId=${user.id}`))

      // Include user ID in the request
      const response = await fetch(chatUrl, {
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
        ...(msg.object_name && { objectName: msg.object_name }),
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
  const createNewChat = useCallback((mainImage?: string, objectName?: string) => {
    const newChatId = uuidv4()
    const newChat: Chat = {
      id: newChatId,
      title: `New Chat ${format(new Date(), "MMM d, h:mm a")}`,
      createdAt: new Date(),
      messages: [],
      mainImage,
      objectName,
    }

    setChats((prev) => [...prev, newChat])
    setActiveChat(newChatId)
    setIsInitialMode(true)
    setError(null)

    // Fetch chat history (which will add a welcome message if none exists)
    fetchChatHistory(newChatId)

    return newChatId
  }, [])

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

  // Format chat history for the LLM
  const formatChatHistory = (chatId: string): { role: string; content: string }[] => {
    const chat = chats.find((c) => c.id === chatId)
    if (!chat) return []

    // Return all messages in the chat formatted for the LLM
    return chat.messages.map((msg) => ({
      role: msg.role,
      content: msg.content,
    }))
  }

  // Send message to server
  const sendMessageToServer = async (chatId: string, message: Message): Promise<Message | null> => {
    try {
      setError(null)

      // For unauthenticated users, we'll still process the message locally but won't send to server
      if (!isAuthenticated || !user) {
        // Return a mock response for unauthenticated users
        return {
          role: "assistant",
          content:
            "I'm processing your request locally since you're not signed in. Your chat history won't be saved. Sign in to save your conversations and access more features.",
          timestamp: new Date(),
        }
      }

      // Get the current chat history for context
      const chatHistory = formatChatHistory(chatId)

      // Extract object name from message content if it exists
      let objectName = message.objectName || ""

      // If the message has an "Object in image:" section, extract it
      if (!objectName && message.content.includes("Object in image:")) {
        const objectMatch = message.content.match(/Object in image:\s*(.+)$/m)
        if (objectMatch && objectMatch[1]) {
          objectName = objectMatch[1].trim()
        }
      }

      // Prepare request body with optional user ID
      const requestBody: any = {
        chat_id: chatId,
        role: message.role,
        content: message.content,
        // Include image data if present
        ...(message.image && { image: message.image }),
        // Include object name if present
        ...(objectName && { object_name: objectName }),
        // Include chat history for context
        chat_history: chatHistory,
      }

      // Add user ID if authenticated
      if (isAuthenticated && user) {
        requestBody.user_id = user.id
      }

      // Use nip.io for IP addresses
      const chatUrl = convertToNipIo(getApiUrl("chat"))

      const response = await fetch(chatUrl, {
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
        ...(data.object_name && { objectName: data.object_name }),
        ...(data.image && { responseImage: data.image }), // Include image from response if present
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

  // Refresh user chats (can be called after sending a message)
  const refreshUserChats = () => {
    if (isAuthenticated) {
      // Reset the ref to allow loading chats again
      hasLoadedUserChatsRef.current = false
      loadUserChats()
    }
  }

  // Initialize with a new chat if needed
  useEffect(() => {
    // Only create a new chat if:
    // 1. We haven't initialized yet
    // 2. We're not loading chats
    // 3. We don't have any chats
    // 4. We're not in the process of loading user chats
    if (!hasInitializedRef.current && !isLoadingChats && chats.length === 0 && !hasLoadedUserChatsRef.current) {
      hasInitializedRef.current = true
      createNewChat()
    }
  }, [isLoadingChats, chats.length, createNewChat])

  return {
    chats,
    activeChat,
    isLoading,
    isLoadingChats,
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
    refreshUserChats,
  }
}
