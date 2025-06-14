"use client"

import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { X } from "lucide-react"

export default function SubscriptionCancelPage() {
  const router = useRouter()

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
          <div className="flex flex-col items-center">
            <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mb-4">
              <X className="h-8 w-8 text-gray-500" />
            </div>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">Subscription Canceled</h2>
            <p className="text-gray-600 mb-2">You've canceled the subscription process.</p>
            <p className="text-gray-500 text-sm mb-6">
              You can subscribe to Greenly Premium at any time to access premium features.
            </p>
            <Button onClick={() => router.push("/")} className="bg-green-600 hover:bg-green-700">
              Return to Home
            </Button>
          </div>
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
