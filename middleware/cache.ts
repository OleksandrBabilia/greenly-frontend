import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { getFromCache, setInCache } from "@/lib/redis-cache"

// Cache configuration
const CACHE_ENABLED = true
const DEFAULT_CACHE_TTL = 60 * 5 // 5 minutes
const CACHE_CONTROL_HEADER = "x-cache-control"
const CACHE_TTL_HEADER = "x-cache-ttl"
const CACHE_KEY_PREFIX = "api-cache:"

// Routes that should be cached
const CACHEABLE_ROUTES = ["/api/user/*/chats", "/api/chat/*", "/api/image/share"]

// Helper to check if a route should be cached
function isCacheableRoute(path: string): boolean {
  return CACHEABLE_ROUTES.some((route) => {
    const pattern = route.replace(/\*/g, ".*")
    return new RegExp(`^${pattern}$`).test(path)
  })
}

// Generate a cache key from the request
function generateCacheKey(request: NextRequest): string {
  const url = new URL(request.url)
  return `${CACHE_KEY_PREFIX}${request.method}:${url.pathname}:${url.search}`
}

// Cache middleware
export async function withCache(request: NextRequest, handler: () => Promise<NextResponse>) {
  // Skip caching if disabled or method is not GET
  if (!CACHE_ENABLED || request.method !== "GET") {
    return handler()
  }

  // Skip caching if route is not cacheable
  const url = new URL(request.url)
  if (!isCacheableRoute(url.pathname)) {
    return handler()
  }

  // Generate cache key
  const cacheKey = generateCacheKey(request)

  // Check if we have a cached response
  const cachedResponse = await getFromCache<string>(cacheKey)
  if (cachedResponse) {
    // Return cached response
    const response = new NextResponse(cachedResponse.body, {
      status: cachedResponse.status,
      headers: {
        ...cachedResponse.headers,
        "x-cache": "HIT",
      },
    })
    return response
  }

  // No cache hit, execute handler
  const response = await handler()

  // Get cache TTL from headers or use default
  const cacheControl = request.headers.get(CACHE_CONTROL_HEADER) || "public"
  const cacheTtl = Number.parseInt(request.headers.get(CACHE_TTL_HEADER) || `${DEFAULT_CACHE_TTL}`, 10)

  // Skip caching if cache-control is set to no-cache or private
  if (cacheControl === "no-cache" || cacheControl === "private") {
    return response
  }

  // Cache the response
  const responseToCache = {
    body: await response.text(),
    status: response.status,
    headers: Object.fromEntries(response.headers.entries()),
  }

  await setInCache(cacheKey, responseToCache, cacheTtl)

  // Return a new response since we consumed the original
  return new NextResponse(responseToCache.body, {
    status: responseToCache.status,
    headers: {
      ...responseToCache.headers,
      "x-cache": "MISS",
    },
  })
}

// Example usage in an API route:
// export async function GET(req: NextRequest) {
//   return withCache(req, async () => {
//     // Your API logic here
//     return NextResponse.json({ data: "example" })
//   })
// }
