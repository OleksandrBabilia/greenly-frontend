import { NextResponse } from "next/server"
import { getCachedUserChats, setCachedUserChats } from "@/lib/redis-cache"

export async function GET(req: Request, { params }: { params: { userId: string } }) {
  try {
    const userId = params.userId

    if (!userId) {
      return NextResponse.json({ error: "User ID is required" }, { status: 400 })
    }

    console.log(`Fetching chats for user: ${userId}`)

    // Try to get from cache first
    const cachedUserChats = await getCachedUserChats(userId)

    if (cachedUserChats) {
      console.log("Cache hit: Returning cached user chats")
      return NextResponse.json(cachedUserChats)
    }

    console.log("Cache miss: Fetching user chats from backend")

    // If not in cache, fetch from your backend API
    // In a real implementation, you would call your backend API here
    // const backendResponse = await fetch(`${process.env.BACKEND_API_URL}/users/${userId}/chats`);
    // if (!backendResponse.ok) {
    //   throw new Error(`Backend API returned ${backendResponse.status}`);
    // }
    // const chatIds = await backendResponse.json();

    // For demo purposes, we'll simulate a backend response
    // In a real app, you would use the actual backend response
    const mockChatIds = [`chat-${Date.now()}-1`, `chat-${Date.now()}-2`, `chat-${Date.now()}-3`]

    // Cache the result for future requests
    await setCachedUserChats(userId, mockChatIds)

    return NextResponse.json(mockChatIds)
  } catch (error) {
    console.error("Error fetching user chats:", error)
    return NextResponse.json(
      {
        error: "Failed to fetch user chats",
      },
      { status: 500 },
    )
  }
}
