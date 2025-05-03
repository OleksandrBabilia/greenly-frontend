// Configuration for API endpoints and other sensitive data
// This centralizes all environment variable access

// API Base URL
export const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8080"

// Auth endpoints
export const GOOGLE_CLIENT_ID = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID 
export const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET 

// API endpoints
export const getApiUrl = (path: string): string => {
  return `${API_BASE_URL}${path.startsWith("/") ? path : `/${path}`}`
}

// Google OAuth URLs
export const GOOGLE_AUTH_URL = "https://accounts.google.com/o/oauth2/v2/auth"
export const GOOGLE_TOKEN_URL = "https://oauth2.googleapis.com/token"
export const GOOGLE_USERINFO_URL = "https://www.googleapis.com/oauth2/v3/userinfo"

// Cookie names
export const ACCESS_TOKEN_COOKIE = "greenly_access_token"
export const REFRESH_TOKEN_COOKIE = "greenly_refresh_token"
export const AUTH_STATE_COOKIE = "greenly_authenticated"
export const REDIRECT_COOKIE = "greenly_auth_redirect"

// Auth configuration
export const AUTH_COOKIE_MAX_AGE = 3600 // 1 hour
export const REFRESH_COOKIE_MAX_AGE = 30 * 24 * 60 * 60 // 30 days
