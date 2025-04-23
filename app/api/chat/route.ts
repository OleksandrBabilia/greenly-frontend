import { streamText } from "ai"
import { openai } from "@ai-sdk/openai"

export async function POST(req: Request) {
  try {
    const { messages, image } = await req.json()

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

    const result = streamText({
      model: openai("gpt-4o"), // Replace with your custom model
      system: "You are Greenly, an eco-friendly AI assistant focused on sustainability and environmental topics.",
      messages: formattedMessages,
    })

    return result.toDataStreamResponse()
  } catch (error) {
    console.error("Error in chat API:", error)
    return new Response(JSON.stringify({ error: "Failed to process chat request" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    })
  }
}
