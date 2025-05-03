// Define types for our chat data structure
export type Message = {
  role: "user" | "assistant"
  content: string
  image?: string // Base64 encoded image from user
  responseImage?: string // Base64 encoded image from AI response
  timestamp?: Date
  objectName?: string // Name of the object in the image
}

// Define server response type
export type ServerMessage = {
  chat_id: string
  role: string
  content: string
  timestamp: string
  object_name?: string // Name of the object in the image
  image?: string // Image response from the backend in bytes format
}

export type Chat = {
  id: string
  title: string
  createdAt: Date
  messages: Message[]
  mainImage?: string // Store the main image for the chat
  objectName?: string // Store the object name for the main image
}
