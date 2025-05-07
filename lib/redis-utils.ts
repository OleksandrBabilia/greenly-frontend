import { v4 as uuidv4 } from "uuid"
import redis from "./redis"
import type { Chat, Message } from "@/types"

// Constants
const CHAT_PREFIX = "chat:"
const USER_CHATS_PREFIX = "user:"
const SHARED_IMAGE_PREFIX = "shared-image:"
const CHAT_TTL = 60 * 60 * 24 * 30 // 30 days in seconds

// Store a chat in Redis
export async function storeChat(chat: Chat): Promise<void> {
  const chatKey = `${CHAT_PREFIX}${chat.id}`

  // Store the chat metadata
  await redis.hset(chatKey, {
    id: chat.id,
    title: chat.title,
    createdAt: chat.createdAt.toISOString(),
    mainImage: chat.mainImage || "",
    objectName: chat.objectName || "",
  })

  // Store each message in the chat
  for (let i = 0; i < chat.messages.length; i++) {
    await storeMessage(chat.id, chat.messages[i], i)
  }

  // Set expiration time
  await redis.expire(chatKey, CHAT_TTL)
}

// Store a message in Redis
export async function storeMessage(chatId: string, message: Message, index: number): Promise<void> {
  const messageKey = `${CHAT_PREFIX}${chatId}:messages:${index}`

  await redis.hset(messageKey, {
    role: message.role,
    content: message.content,
    timestamp: message.timestamp?.toISOString() || new Date().toISOString(),
    image: message.image || "",
    responseImage: message.responseImage || "",
    objectName: message.objectName || "",
    image_name: message.image_name || "",
  })

  // Set expiration time
  await redis.expire(messageKey, CHAT_TTL)
}

// Get a chat from Redis
export async function getChat(chatId: string): Promise<Chat | null> {
  const chatKey = `${CHAT_PREFIX}${chatId}`

  // Get chat metadata
  const chatData = await redis.hgetall(chatKey)
  if (!chatData || !chatData.id) return null

  // Get all message keys for this chat
  const messageKeys = await redis.keys(`${CHAT_PREFIX}${chatId}:messages:*`)

  // Sort keys by index
  messageKeys.sort((a, b) => {
    const indexA = Number.parseInt(a.split(":").pop() || "0")
    const indexB = Number.parseInt(b.split(":").pop() || "0")
    return indexA - indexB
  })

  // Get all messages
  const messages: Message[] = []
  for (const key of messageKeys) {
    const messageData = await redis.hgetall(key)
    if (messageData) {
      messages.push({
        role: messageData.role as "user" | "assistant",
        content: messageData.content,
        timestamp: messageData.timestamp ? new Date(messageData.timestamp) : new Date(),
        ...(messageData.image && { image: messageData.image }),
        ...(messageData.responseImage && { responseImage: messageData.responseImage }),
        ...(messageData.objectName && { objectName: messageData.objectName }),
        ...(messageData.image_name && { image_name: messageData.image_name }),
      })
    }
  }

  return {
    id: chatData.id,
    title: chatData.title,
    createdAt: new Date(chatData.createdAt),
    messages,
    ...(chatData.mainImage && { mainImage: chatData.mainImage }),
    ...(chatData.objectName && { objectName: chatData.objectName }),
  }
}

// Associate a chat with a user
export async function addChatToUser(userId: string, chatId: string): Promise<void> {
  const userChatsKey = `${USER_CHATS_PREFIX}${userId}:chats`
  await redis.zadd(userChatsKey, { score: Date.now(), member: chatId })
}

// Get all chats for a user
export async function getUserChats(userId: string): Promise<string[]> {
  const userChatsKey = `${USER_CHATS_PREFIX}${userId}:chats`
  // Get chat IDs sorted by most recent first
  return await redis.zrange(userChatsKey, 0, -1, { rev: true })
}

// Store a shared image
export async function storeSharedImage(imageUrl: string, imageName?: string, userId?: string): Promise<string> {
  const shareId = uuidv4()
  const shareKey = `${SHARED_IMAGE_PREFIX}${shareId}`

  await redis.hset(shareKey, {
    id: shareId,
    url: imageUrl,
    name: imageName || `shared-image-${shareId}.png`,
    created_at: new Date().toISOString(),
    user_id: userId || "anonymous",
    metadata: JSON.stringify({
      width: 800, // Default values, in a real app you'd extract these from the image
      height: 600,
      format: "png",
    }),
  })

  // Set expiration for shared images (7 days)
  await redis.expire(shareKey, 60 * 60 * 24 * 7)

  return shareId
}

// Get a shared image
export async function getSharedImage(shareId: string): Promise<any | null> {
  const shareKey = `${SHARED_IMAGE_PREFIX}${shareId}`
  const imageData = await redis.hgetall(shareKey)

  if (!imageData || !imageData.id) return null

  return {
    ...imageData,
    metadata: JSON.parse(imageData.metadata || "{}"),
  }
}
