import { NextResponse } from "next/server"
import { getCachedChat, setCachedChat, invalidateChatCache } from "@/lib/redis-cache"

export async function DELETE(req: Request, { params }: { params: { chatId: string } }) {
  try {
    const chatId = params.chatId

    if (!chatId) {
      return NextResponse.json({ error: "Chat ID is required" }, { status: 400 })
    }

    console.log(`Deleting chat with ID: ${chatId}`)

    // In a real implementation, you would call your backend API to delete the chat
    // const backendResponse = await fetch(`${process.env.BACKEND_API_URL}/chats/${chatId}`, {
    //   method: "DELETE",
    // });
    // if (!backendResponse.ok) {
    //   throw new Error(`Backend API returned ${backendResponse.status}`);
    // }

    // Invalidate the cache for this chat
    await invalidateChatCache(chatId)

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error deleting chat:", error)
    return NextResponse.json(
      {
        error: "Failed to delete chat",
      },
      { status: 500 },
    )
  }
}

export async function PUT(req: Request, { params }: { params: { chatId: string } }) {
  try {
    const chatId = params.chatId
    const chatData = await req.json()

    if (!chatId || !chatData) {
      return NextResponse.json({ error: "Chat ID and data are required" }, { status: 400 })
    }

    console.log(`Updating chat with ID: ${chatId}`)

    // In a real implementation, you would call your backend API to update the chat
    // const backendResponse = await fetch(`${process.env.BACKEND_API_URL}/chats/${chatId}`, {
    //   method: "PUT",
    //   headers: { "Content-Type": "application/json" },
    //   body: JSON.stringify(chatData),
    // });
    // if (!backendResponse.ok) {
    //   throw new Error(`Backend API returned ${backendResponse.status}`);
    // }

    // Update the cache with the new chat data
    await setCachedChat(chatId, chatData)

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error updating chat:", error)
    return NextResponse.json(
      {
        error: "Failed to update chat",
      },
      { status: 500 },
    )
  }
}

export async function GET(req: Request, { params }: { params: { chatId: string } }) {
  try {
    const chatId = params.chatId

    if (!chatId) {
      return NextResponse.json({ error: "Chat ID is required" }, { status: 400 })
    }

    console.log(`Fetching chat with ID: ${chatId}`)

    // Try to get from cache first
    const cachedChat = await getCachedChat(chatId)

    if (cachedChat) {
      console.log("Cache hit: Returning cached chat")
      return NextResponse.json(cachedChat)
    }

    console.log("Cache miss: Fetching chat from backend")

    // If not in cache, fetch from your backend API
    // In a real implementation, you would call your backend API here
    // const backendResponse = await fetch(`${process.env.BACKEND_API_URL}/chats/${chatId}`);
    // if (!backendResponse.ok) {
    //   throw new Error(`Backend API returned ${backendResponse.status}`);
    // }
    // const chatData = await backendResponse.json();

    // For demo purposes, we'll simulate a backend response
    // In a real app, you would use the actual backend response
    const mockChatData = {
      id: chatId,
      title: "Mock Chat",
      createdAt: new Date().toISOString(),
      messages: [
        {
          role: "assistant",
          content: "Hello! I'm Greenly, your eco-friendly AI assistant. How can I help you today?",
          timestamp: new Date().toISOString(),
        },
      ],
    }

    // Cache the result for future requests
    await setCachedChat(chatId, mockChatData)

    return NextResponse.json(mockChatData)
  } catch (error) {
    console.error("Error fetching chat:", error)
    return NextResponse.json(
      {
        error: "Failed to fetch chat",
      },
      { status: 500 },
    )
  }
}
