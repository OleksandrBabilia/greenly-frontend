"use client"

import type React from "react"
import { createContext, useContext, useState, useEffect } from "react"
import { convertToNipIo } from "@/utils/nip-io"
import { getApiUrl } from "@/utils/api-config"

export type User = {
  id: string
  name: string
  email: string
  image?: string
}

type AuthContextType = {
  user: User | null
  isLoading: boolean
  isAuthenticated: boolean
  login: (user: User) => void
  logout: () => void
  fetchUserChats: () => Promise<any[]>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  // Check authentication status on mount
  useEffect(() => {
    const checkSession = async () => {
      try {
        const res = await fetch("/api/auth/session")
        const data = await res.json()

        if (data.isAuthenticated && data.user) {
          setUser(data.user)
        } else {
          setUser(null)
        }
      } catch (error) {
        console.error("Failed to check session:", error)
        setUser(null)
      } finally {
        setIsLoading(false)
      }
    }

    checkSession()
  }, [])

  // Handle authentication from URL params (after OAuth redirect)
  useEffect(() => {
    const handleAuthRedirect = async () => {
      const urlParams = new URLSearchParams(window.location.search)
      const authError = urlParams.get("auth_error")

      if (authError) {
        console.error("Authentication error:", authError)
        // Clean up URL
        window.history.replaceState({}, document.title, window.location.pathname)
      }

      // Check if we just got authenticated (cookie would be set)
      const isNewlyAuthenticated = document.cookie.includes("greenly_authenticated=true")

      if (isNewlyAuthenticated) {
        // Refresh session data
        try {
          const res = await fetch("/api/auth/session")
          const data = await res.json()

          if (data.isAuthenticated && data.user) {
            setUser(data.user)
          }
        } catch (error) {
          console.error("Failed to get user data after authentication:", error)
        }

        // Redirect to the original page if stored
        const redirectPath = localStorage.getItem("greenly_auth_redirect")
        if (redirectPath) {
          localStorage.removeItem("greenly_auth_redirect")
          window.history.replaceState({}, document.title, redirectPath)
        }
      }
    }

    handleAuthRedirect()
  }, [])

  const login = (userData: User) => {
    setUser(userData)
  }

  const logout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" })
      setUser(null)
    } catch (error) {
      console.error("Logout failed:", error)
    }
  }

  // Fetch all chats for the authenticated user
  const fetchUserChats = async () => {
    if (!user) return []

    try {
      // Use nip.io for IP addresses
      const userChatsUrl = convertToNipIo(getApiUrl(`user/${user.id}`))

      const response = await fetch(userChatsUrl, {
        credentials: "include", // Include cookies for authentication
      })

      if (!response.ok) {
        throw new Error(`Failed to fetch user chats: ${response.status}`)
      }

      const data = await response.json()
      return data
    } catch (error) {
      console.error("Error fetching user chats:", error)
      return []
    }
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isAuthenticated: !!user,
        login,
        logout,
        fetchUserChats,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
