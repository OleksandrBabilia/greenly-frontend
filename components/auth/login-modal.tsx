"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Loader2 } from "lucide-react"
import { useAuth } from "@/contexts/auth-context"
import Image from "next/image"
import { GOOGLE_AUTH_URL, GOOGLE_CLIENT_ID } from "@/utils/api-config"

interface LoginModalProps {
  isOpen: boolean
  onClose: () => void
}

export function LoginModal({ isOpen, onClose }: LoginModalProps) {
  const { login } = useAuth()
  const [isLoading, setIsLoading] = useState(false)
  const [redirectUri, setRedirectUri] = useState("")

  useEffect(() => {
    // Get the current origin and convert it to use nip.io if it's an IP address
    const origin = window.location.origin
    const ipRegex = /^http:\/\/(\d+\.\d+\.\d+\.\d+)(?::(\d+))?$/
    const match = origin.match(ipRegex)

    if (match) {
      // It's an IP address, convert to nip.io format
      const ip = match[1]
      const port = match[2] || ""
      const nipIoOrigin = `http://${ip}.nip.io${port ? `:${port}` : ""}`
      setRedirectUri(`${nipIoOrigin}/api/auth/callback/google`)
    } else {
      // It's already a domain name, use as is
      setRedirectUri(`${origin}/api/auth/callback/google`)
    }
  }, [])

  const handleGoogleLogin = async () => {
    setIsLoading(true)

    try {
      // Redirect to Google OAuth
      const googleAuthUrl = `${GOOGLE_AUTH_URL}?client_id=${encodeURIComponent(
        GOOGLE_CLIENT_ID,
      )}&redirect_uri=${encodeURIComponent(
        redirectUri,
      )}&response_type=code&scope=openid%20email%20profile&prompt=select_account`

      // Store the current URL to redirect back after authentication
      localStorage.setItem("greenly_auth_redirect", window.location.pathname)

      // Redirect to Google OAuth
      window.location.href = googleAuthUrl
    } catch (error) {
      console.error("Login failed:", error)
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-center text-xl">Sign in to Greenly</DialogTitle>
          <DialogDescription className="text-center">
            Continue with Google to access your chat history and personalized features
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col items-center py-6">
          <div className="mb-6">
            <div className="w-16 h-16 bg-green-500 rounded-full mx-auto flex items-center justify-center">
              <Image
                src="/placeholder.svg?height=40&width=40"
                alt="Greenly Logo"
                width={40}
                height={40}
                className="text-white"
              />
            </div>
          </div>

          <Button
            onClick={handleGoogleLogin}
            disabled={isLoading || !redirectUri}
            className="w-full max-w-xs flex items-center justify-center gap-2 bg-white hover:bg-gray-50 text-gray-800 border border-gray-300"
          >
            {isLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Image src="/placeholder.svg?height=16&width=16" alt="Google Logo" width={16} height={16} />
            )}
            {isLoading ? "Signing in..." : "Continue with Google"}
          </Button>

          <p className="mt-6 text-xs text-gray-500 text-center">
            By continuing, you agree to our Terms of Service and Privacy Policy
          </p>
        </div>
      </DialogContent>
    </Dialog>
  )
}
