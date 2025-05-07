import { Redis } from "@upstash/redis"

// Create Redis client using environment variables
const redis = new Redis({
  url: process.env.KV_REST_API_URL!,
  token: process.env.KV_REST_API_TOKEN!,
})

// Cache prefixes
const CHAT_CACHE_PREFIX = "cache:chat:"
const USER_CHATS_CACHE_PREFIX = "cache:user-chats:"
const SHARED_IMAGE_CACHE_PREFIX = "cache:shared-image:"

// Default cache expiration times (in seconds)
const DEFAULT_CACHE_TTL = 60 * 60 * 24 // 24 hours
const CHAT_CACHE_TTL = 60 * 60 * 24 // 24 hours
const USER_CHATS_CACHE_TTL = 60 * 60 // 1 hour
const SHARED_IMAGE_CACHE_TTL = 60 * 60 * 24 * 7 // 7 days

/**
 * Get data from cache
 * @param key Cache key
 * @returns Cached data or null if not found
 */
export async function getFromCache<T>(key: string): Promise<T | null> {
  try {
    const data = await redis.get(key)
    return data as T | null
  } catch (error) {
    console.error(`Error getting data from cache (${key}):`, error)
    return null
  }
}

/**
 * Set data in cache
 * @param key Cache key
 * @param data Data to cache
 * @param ttl Time to live in seconds (optional)
 */
export async function setInCache(key: string, data: any, ttl: number = DEFAULT_CACHE_TTL): Promise<void> {
  try {
    await redis.set(key, data, { ex: ttl })
  } catch (error) {
    console.error(`Error setting data in cache (${key}):`, error)
  }
}

/**
 * Delete data from cache
 * @param key Cache key
 */
export async function deleteFromCache(key: string): Promise<void> {
  try {
    await redis.del(key)
  } catch (error) {
    console.error(`Error deleting data from cache (${key}):`, error)
  }
}

/**
 * Delete multiple keys from cache
 * @param pattern Key pattern to match
 */
export async function deleteByPattern(pattern: string): Promise<void> {
  try {
    const keys = await redis.keys(pattern)
    if (keys.length > 0) {
      await redis.del(...keys)
    }
  } catch (error) {
    console.error(`Error deleting keys by pattern (${pattern}):`, error)
  }
}

// Chat-specific cache functions
export async function getCachedChat(chatId: string) {
  return getFromCache<any>(`${CHAT_CACHE_PREFIX}${chatId}`)
}

export async function setCachedChat(chatId: string, chatData: any) {
  return setInCache(`${CHAT_CACHE_PREFIX}${chatId}`, chatData, CHAT_CACHE_TTL)
}

export async function invalidateChatCache(chatId: string) {
  return deleteFromCache(`${CHAT_CACHE_PREFIX}${chatId}`)
}

// User chats cache functions
export async function getCachedUserChats(userId: string) {
  return getFromCache<string[]>(`${USER_CHATS_CACHE_PREFIX}${userId}`)
}

export async function setCachedUserChats(userId: string, chatIds: string[]) {
  return setInCache(`${USER_CHATS_CACHE_PREFIX}${userId}`, chatIds, USER_CHATS_CACHE_TTL)
}

export async function invalidateUserChatsCache(userId: string) {
  return deleteFromCache(`${USER_CHATS_CACHE_PREFIX}${userId}`)
}

// Shared image cache functions
export async function getCachedSharedImage(shareId: string) {
  return getFromCache<any>(`${SHARED_IMAGE_CACHE_PREFIX}${shareId}`)
}

export async function setCachedSharedImage(shareId: string, imageData: any) {
  return setInCache(`${SHARED_IMAGE_CACHE_PREFIX}${shareId}`, imageData, SHARED_IMAGE_CACHE_TTL)
}

export default redis
