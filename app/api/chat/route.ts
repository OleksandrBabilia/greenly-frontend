import { streamText } from "ai"
import { openai } from "@ai-sdk/openai"
import { getCachedChat, setCachedChat, invalidateChatCache, invalidateUserChatsCache } from "@/lib/redis-cache"

export async function POST(req: Request) {
  try {
    const { messages, image, chat_id, user_id, object_name, chat_history } = await req.json()

    console.log(`Processing chat request${user_id ? ` for user: ${user_id}` : " (anonymous)"}`)
    console.log(`Object name: ${object_name || "Not provided"}`)

    // This is a placeholder for your custom LLM integration
    // In a real implementation, you would replace this with your custom model
    // and handle the image data appropriately

    // For multi-modal models, you would need to format the messages to include the image
    // This is an example of how you might do it with OpenAI's GPT-4o
    const formattedMessages = messages.map((message: any) => {
      if (message.image) {
        // Format with image content for multi-modal models
        return {
          role: message.role,
          content: [
            { type: "text", text: message.content },
            { type: "image_url", image_url: { url: message.image } },
          ],
        }
      }
      return message
    })

    // Include chat history if provided
    if (chat_history && Array.isArray(chat_history) && chat_history.length > 0) {
      console.log(`Including chat history with ${chat_history.length} messages`)
    }

    // In a real implementation, you might generate images here based on the conversation
    // and include them in the response
    const result = streamText({
      model: openai("gpt-4o"), // Replace with your custom model
      system:
        "You are Greenly, an eco-friendly AI assistant focused on sustainability and environmental topics. You can generate and analyze images.",
      messages: formattedMessages,
    })

    // Create a response object to collect the full text
    let responseText = ""

    // Process the stream to collect the full text
    result.onTextContent((content) => {
      responseText = content
    })

    // Wait for the stream to complete
    const response = await result.toDataStreamResponse()

    // If we have a user ID and chat ID, invalidate the chat cache
    // since the chat has been updated
    if (user_id && chat_id) {
      // Invalidate the chat cache
      await invalidateChatCache(chat_id)

      // Invalidate the user's chat list cache
      await invalidateUserChatsCache(user_id)
    }

    return response
  } catch (error) {
    console.error("Error in chat API:", error)
    return new Response(JSON.stringify({ error: "Failed to process chat request" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    })
  }
}

export async function GET(req: Request) {
  try {
    // Extract chat ID from the URL
    const url = new URL(req.url)
    const chatId = url.pathname.split("/").pop()

    if (!chatId) {
      return new Response(JSON.stringify({ error: "Chat ID is required" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      })
    }

    console.log(`Fetching chat with ID: ${chatId}`)

    // Try to get from cache first
    const cachedChat = await getCachedChat(chatId)

    if (cachedChat) {
      console.log("Cache hit: Returning cached chat")
      return new Response(JSON.stringify(cachedChat), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      })
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

    return new Response(JSON.stringify(mockChatData), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    })
  } catch (error) {
    console.error("Error fetching chat:", error)
    return new Response(JSON.stringify({ error: "Failed to fetch chat" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    })
  }
}
