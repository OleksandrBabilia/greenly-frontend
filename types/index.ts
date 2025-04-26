// Define types for our chat data structure
export type Message = {
  role: "user" | "assistant"
  content: string
  image?: string // Base64 encoded image from user
  responseImage?: string // Base64 encoded image from AI response
  timestamp?: Date
}

// Define server response type
export type ServerMessage = {
  chat_id: string
  role: string
  content: string
  timestamp: string
}

export type Chat = {
  id: string
  title: string
  createdAt: Date
  messages: Message[]
}
