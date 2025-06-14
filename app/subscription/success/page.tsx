"use client"

import { useEffect, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Check, Loader2 } from "lucide-react"
import { useSubscription } from "@/contexts/subscription-context"

export default function SubscriptionSuccessPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const sessionId = searchParams.get("session_id")
  const [isVerifying, setIsVerifying] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { refreshSubscription } = useSubscription()

  useEffect(() => {
    const verifySubscription = async () => {
      if (!sessionId) {
        setError("Invalid session ID")
        setIsVerifying(false)
        return
      }

      try {
        // In a real implementation, you would verify the session with your backend
        // For this demo, we'll simulate a successful verification
        await new Promise((resolve) => setTimeout(resolve, 1500))

        // Refresh the subscription context
        await refreshSubscription()

        setIsVerifying(false)
      } catch (error) {
        console.error("Error verifying subscription:", error)
        setError("Failed to verify subscription")
        setIsVerifying(false)
      }
    }

    verifySubscription()
  }, [sessionId, refreshSubscription])

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 py-4">
        <div className="container px-4 mx-auto flex items-center">
          <div className="flex items-center">
            <div className="w-8 h-8 mr-2 bg-green-500 rounded-full"></div>
            <h1 className="text-xl font-bold text-green-700">Greenly</h1>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="flex-1 container px-4 py-12 mx-auto max-w-md flex flex-col items-center justify-center">
        <div className="bg-white rounded-lg shadow-md p-8 w-full text-center">
          {isVerifying ? (
            <div className="flex flex-col items-center">
              <Loader2 className="h-12 w-12 text-green-500 animate-spin mb-4" />
              <h2 className="text-xl font-bold text-gray-800 mb-2">Verifying your subscription</h2>
              <p className="text-gray-600">Please wait while we confirm your payment...</p>
            </div>
          ) : error ? (
            <div className="flex flex-col items-center">
              <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center mb-4">
                <span className="text-red-500 text-2xl">×</span>
              </div>
              <h2 className="text-xl font-bold text-gray-800 mb-2">Subscription Error</h2>
              <p className="text-gray-600 mb-6">{error}</p>
              <Button onClick={() => router.push("/")} className="bg-green-600 hover:bg-green-700">
                Return to Home
              </Button>
            </div>
          ) : (
            <div className="flex flex-col items-center">
              <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mb-4">
                <Check className="h-8 w-8 text-green-500" />
              </div>
              <h2 className="text-2xl font-bold text-gray-800 mb-2">Subscription Successful!</h2>
              <p className="text-gray-600 mb-2">Thank you for subscribing to Greenly Premium.</p>
              <p className="text-gray-500 text-sm mb-6">Your premium features are now available in your account.</p>
              <Button onClick={() => router.push("/")} className="bg-green-600 hover:bg-green-700">
                Start Using Premium Features
              </Button>
            </div>
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 py-6">
        <div className="container px-4 mx-auto text-center text-sm text-gray-500">
          <p>© {new Date().getFullYear()} Greenly. All rights reserved.</p>
        </div>
      </footer>
    </div>
  )
}
