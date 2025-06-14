"use client"

import type React from "react"

import { createContext, useContext, useState, useEffect } from "react"
import { useAuth } from "@/contexts/auth-context"
import { useRouter } from "next/navigation"

type SubscriptionTier = "free" | "premium"

type SubscriptionStatus = "active" | "canceled" | "past_due" | "trialing" | "incomplete" | null

interface SubscriptionContextType {
  tier: SubscriptionTier
  status: SubscriptionStatus
  isLoading: boolean
  features: string[]
  refreshSubscription: () => Promise<void>
  openPremiumModal: () => void
  closePremiumModal: () => void
  isPremiumModalOpen: boolean
  navigateToSubscriptionPage: () => void
}

const SubscriptionContext = createContext<SubscriptionContextType | undefined>(undefined)

export function SubscriptionProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const { user, isAuthenticated } = useAuth()
  const [tier, setTier] = useState<SubscriptionTier>("free")
  const [status, setStatus] = useState<SubscriptionStatus>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [features, setFeatures] = useState<string[]>([])
  const [isPremiumModalOpen, setIsPremiumModalOpen] = useState(false)

  // Fetch subscription status when user changes
  useEffect(() => {
    if (isAuthenticated && user) {
      fetchSubscriptionStatus()
    } else {
      // Reset to free tier when not authenticated
      setTier("free")
      setStatus(null)
      setFeatures(["Basic image processing", "Standard eco-friendly filters", "Community support"])
      setIsLoading(false)
    }
  }, [isAuthenticated, user])

  const fetchSubscriptionStatus = async () => {
    try {
      setIsLoading(true)

      // In a real implementation, you would fetch the subscription status from your API
      // For this demo, we'll simulate a response
      await new Promise((resolve) => setTimeout(resolve, 500))

      // Simulate a 10% chance of having a premium subscription
      const hasPremium = Math.random() < 0.1

      if (hasPremium) {
        setTier("premium")
        setStatus("active")
        setFeatures([
          "Unlimited image processing",
          "Advanced eco-friendly filters",
          "Priority support",
          "Export to multiple formats",
          "Custom branding removal",
          "Advanced analytics",
        ])
      } else {
        setTier("free")
        setStatus(null)
        setFeatures(["Basic image processing", "Standard eco-friendly filters", "Community support"])
      }
    } catch (error) {
      console.error("Error fetching subscription status:", error)
      // Default to free tier on error
      setTier("free")
      setStatus(null)
      setFeatures(["Basic image processing", "Standard eco-friendly filters", "Community support"])
    } finally {
      setIsLoading(false)
    }
  }

  const refreshSubscription = async () => {
    return fetchSubscriptionStatus()
  }

  const openPremiumModal = () => {
    setIsPremiumModalOpen(true)
  }

  const closePremiumModal = () => {
    setIsPremiumModalOpen(false)
  }

  const navigateToSubscriptionPage = () => {
    router.push("/account/subscription")
  }

  return (
    <SubscriptionContext.Provider
      value={{
        tier,
        status,
        isLoading,
        features,
        refreshSubscription,
        openPremiumModal,
        closePremiumModal,
        isPremiumModalOpen,
        navigateToSubscriptionPage,
      }}
    >
      {children}
    </SubscriptionContext.Provider>
  )
}

export function useSubscription() {
  const context = useContext(SubscriptionContext)
  if (context === undefined) {
    throw new Error("useSubscription must be used within a SubscriptionProvider")
  }
  return context
}
