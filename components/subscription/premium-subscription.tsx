"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Check, Crown, Loader2, Star } from "lucide-react"
import { PREMIUM_SUBSCRIPTION } from "@/utils/stripe-config"
import { useToast } from "@/hooks/use-toast"
import { useAuth } from "@/contexts/auth-context"
import { useRouter } from "next/navigation"

interface PremiumSubscriptionProps {
  isOpen: boolean
  onClose: () => void
}

export function PremiumSubscription({ isOpen, onClose }: PremiumSubscriptionProps) {
  const router = useRouter()
  const { user, isAuthenticated } = useAuth()
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(false)

  const handleSubscribe = async () => {
    if (!isAuthenticated) {
      toast({
        title: "Authentication Required",
        description: "Please sign in to subscribe to Premium",
        variant: "destructive",
      })
      return
    }

    try {
      setIsLoading(true)

      // Create checkout session
      const response = await fetch("/api/stripe/create-checkout-session", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          user_id: user?.id,
          user_email: user?.email,
          subscription_type: "premium",
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to create checkout session")
      }

      const { checkout_url } = await response.json()

      // Redirect to Stripe Checkout
      window.location.href = checkout_url
    } catch (error) {
      console.error("Subscription error:", error)
      toast({
        title: "Subscription Failed",
        description: "Failed to start subscription process. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleManageSubscription = () => {
    onClose()
    router.push("/account/subscription")
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-center justify-center">
            <Crown className="h-6 w-6 text-yellow-500" />
            <span className="bg-gradient-to-r from-yellow-500 to-orange-500 bg-clip-text text-transparent">
              Greenly Premium
            </span>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Pricing */}
          <div className="text-center">
            <div className="flex items-center justify-center gap-2 mb-2">
              <span className="text-3xl font-bold">${PREMIUM_SUBSCRIPTION.price}</span>
              <span className="text-gray-500">/{PREMIUM_SUBSCRIPTION.interval}</span>
              <Badge variant="secondary" className="bg-green-100 text-green-800">
                Popular
              </Badge>
            </div>
            <p className="text-sm text-gray-500">Billed monthly, cancel anytime</p>
          </div>

          {/* Features */}
          <div className="space-y-3">
            <h4 className="font-medium text-gray-800">What's included:</h4>
            <div className="space-y-2">
              {PREMIUM_SUBSCRIPTION.features.map((feature, index) => (
                <div key={index} className="flex items-center gap-3">
                  <div className="flex-shrink-0 w-5 h-5 bg-green-100 rounded-full flex items-center justify-center">
                    <Check className="w-3 h-3 text-green-600" />
                  </div>
                  <span className="text-sm text-gray-700">{feature}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Benefits */}
          <div className="bg-gradient-to-r from-green-50 to-blue-50 p-4 rounded-lg border border-green-100">
            <div className="flex items-center gap-2 mb-2">
              <Star className="w-4 h-4 text-yellow-500" />
              <span className="font-medium text-gray-800">Premium Benefits</span>
            </div>
            <p className="text-sm text-gray-600">
              Unlock the full potential of Greenly with unlimited processing, advanced features, and priority support.
            </p>
          </div>

          {/* Subscribe Button */}
          <Button
            onClick={handleSubscribe}
            disabled={isLoading}
            className="w-full bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 text-white py-3 text-lg font-medium"
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                Processing...
              </>
            ) : (
              <>
                <Crown className="mr-2 h-5 w-5" />
                Subscribe to Premium
              </>
            )}
          </Button>

          {/* Manage Subscription Link */}
          {isAuthenticated && (
            <div className="text-center">
              <Button variant="link" onClick={handleManageSubscription} className="text-sm text-gray-500">
                Manage existing subscription
              </Button>
            </div>
          )}

          {/* Security note */}
          <div className="text-center">
            <p className="text-xs text-gray-500">🔒 Secure payment powered by Stripe</p>
            <p className="text-xs text-gray-500 mt-1">Cancel anytime from your account settings</p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
